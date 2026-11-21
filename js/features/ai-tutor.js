/* المعلم الذكي · شرح الشرائح والدروس والمحادثة الصوتية المباشرة (Server-Side Gemini SDK + Live API) */
(function () {
  const AI_MODEL_STORAGE = 'millions_gemini_model_v2';
  const AI_TTS_MODE_STORAGE = 'millions_gemini_tts_mode_v2';
  const AI_TTS_VOICE_STORAGE = 'millions_gemini_tts_voice_v2';

  const VALID_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
  const VALID_TTS_MODES = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'browser'];
  const VALID_TTS_VOICES = ['Kore', 'Zephyr', 'Puck'];

  const LESSON_TITLES = {
    1: 'القيمة المنزلية ضمن الملايين',
    2: 'مقارنة الأعداد وترتيبها',
    3: 'جمع الأعداد الكلية وطرحها',
    4: 'الأعداد السالبة',
    5: 'خطة حل المسألة: أنشئ جدولاً'
  };

  const SKILL_LABELS = {
    place: 'المنزلة والقيمة المنزلية',
    verbal: 'الصيغة اللفظية (قراءة الأعداد)',
    standard: 'الصيغة القياسية (كتابة الأرقام)',
    expanded: 'الصيغة التحليلية واكتشاف الخطأ'
  };

  function isLocalhostHost(hostname) {
    const h = String(hostname || '').trim().toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }

  function isStaticHostingEnv() {
    const proto = String(window.location.protocol || '').toLowerCase();
    if (proto === 'file:') return true;
    const host = String(window.location.hostname || '').trim().toLowerCase();
    return host.endsWith('.github.io') || host.endsWith('.pages.dev') || host.endsWith('.netlify.app');
  }

  function normalizeAiApiBase(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return '';
    try {
      const parsed = new URL(trimmed);
      const proto = parsed.protocol.toLowerCase();
      if (proto !== 'https:' && !(proto === 'http:' && isLocalhostHost(parsed.hostname))) {
        return '';
      }
      return parsed.origin + parsed.pathname.replace(/\/+$/, '');
    } catch {
      return '';
    }
  }

  function detectConfiguredApiBase() {
    const fromGlobal = normalizeAiApiBase(window.__AI_API_BASE__);
    if (fromGlobal) return fromGlobal;
    const metaEl = document.querySelector('meta[name="ai-api-base"]');
    const fromMeta = normalizeAiApiBase(metaEl ? metaEl.getAttribute('content') : '');
    if (fromMeta) return fromMeta;
    return '';
  }

  const configuredApiBase = detectConfiguredApiBase();
  const initialStaticHostMode = isStaticHostingEnv() && !configuredApiBase;

  function resolveAiApiUrl(apiPath) {
    const p = String(apiPath || '').startsWith('/') ? String(apiPath) : '/' + String(apiPath || '');
    return configuredApiBase ? configuredApiBase + p : p;
  }

  function resolveLiveWsUrl() {
    if (configuredApiBase) {
      const parsed = new URL(configuredApiBase);
      const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return wsProto + '//' + parsed.host + parsed.pathname.replace(/\/+$/, '') + '/ws/live';
    }
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return wsProto + '//' + window.location.host + '/ws/live';
  }

  let selectedModel = 'gemini-3.1-flash-lite';
  let selectedTtsMode = 'gemini-3.8-flash-lite-tts';
  let selectedTtsVoice = 'Kore';
  let backendAvailable = !initialStaticHostMode;
  let staticTutorMode = initialStaticHostMode;
  let serverConfigured = !initialStaticHostMode;
  let healthChecked = initialStaticHostMode;
  let isBusy = false;
  let currentGeminiAudio = null;
  let ttsRequestToken = 0;
  let fallbackTurnIndex = 0;
  let quizVariantCounter = 0;
  const chatHistory = [];
  const geminiAudioCache = new Map();

  window.resolveAiApiUrl = resolveAiApiUrl;
  window.isAiBackendAvailable = () => backendAvailable && serverConfigured && !staticTutorMode;

  try {
    const savedModel = localStorage.getItem(AI_MODEL_STORAGE);
    if (savedModel && VALID_MODELS.includes(savedModel)) selectedModel = savedModel;
    const savedTtsMode = localStorage.getItem(AI_TTS_MODE_STORAGE);
    if (savedTtsMode && VALID_TTS_MODES.includes(savedTtsMode)) selectedTtsMode = savedTtsMode;
    const savedTtsVoice = localStorage.getItem(AI_TTS_VOICE_STORAGE);
    if (savedTtsVoice && VALID_TTS_VOICES.includes(savedTtsVoice)) selectedTtsVoice = savedTtsVoice;
  } catch {}

  async function checkServerHealth() {
    if (initialStaticHostMode) {
      backendAvailable = false;
      staticTutorMode = true;
      serverConfigured = false;
      healthChecked = true;
      updateContextUI();
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(resolveAiApiUrl('/api/ai/health'), {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        backendAvailable = true;
        staticTutorMode = false;
        serverConfigured = Boolean(data && data.configured);
        healthChecked = true;
        updateContextUI();
        return;
      }
      // 404 or non-JSON HTML response indicates static hosting without backend API
      backendAvailable = false;
      staticTutorMode = true;
      serverConfigured = false;
      healthChecked = true;
      updateContextUI();
    } catch {
      clearTimeout(timer);
      backendAvailable = false;
      staticTutorMode = true;
      serverConfigured = false;
      healthChecked = true;
      updateContextUI();
    }
  }

  let activeSpeakBtn = null;
  let activeChatAbortController = null;

  const SPEAKER_SVG =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const STOP_SPEAKER_SVG =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>';

  function setSpeakBtnState(btn, mode) {
    if (!btn) return;
    if (mode === 'loading') {
      btn.classList.add('is-speaking');
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = SPEAKER_SVG + '<span>جارٍ التحميل…</span>';
    } else if (mode === 'playing') {
      btn.classList.add('is-speaking');
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = STOP_SPEAKER_SVG + '<span>إيقاف</span>';
    } else {
      btn.classList.remove('is-speaking');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = SPEAKER_SVG + '<span>استمع</span>';
    }
  }

  function stripEmojisClean(str) {
    return String(str || '')
      .replace(
        /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu,
        ''
      )
      .replace(/\*\*+/g, '')
      .replace(/^#{1,6}\s+/gm, '');
  }

  function stopGeminiAudio() {
    ttsRequestToken++;
    if (currentGeminiAudio) {
      try {
        currentGeminiAudio.onended = null;
        currentGeminiAudio.onerror = null;
        currentGeminiAudio.pause();
        currentGeminiAudio.currentTime = 0;
      } catch {}
      currentGeminiAudio = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (activeSpeakBtn) {
      setSpeakBtnState(activeSpeakBtn, 'idle');
      activeSpeakBtn = null;
    }
  }
  window.stopGeminiAudio = stopGeminiAudio;

  function fallbackBrowserSpeak(text, btn, myToken) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        u.rate = 0.95;
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const arV = (voices || []).find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
        if (arV) u.voice = arV;
        if (btn) {
          activeSpeakBtn = btn;
          setSpeakBtnState(btn, 'playing');
        }
        u.onend = () => {
          if (myToken === ttsRequestToken && activeSpeakBtn === btn) {
            setSpeakBtnState(btn, 'idle');
            activeSpeakBtn = null;
          }
        };
        u.onerror = () => {
          if (myToken === ttsRequestToken && activeSpeakBtn === btn) {
            setSpeakBtnState(btn, 'idle');
            activeSpeakBtn = null;
          }
        };
        window.speechSynthesis.speak(u);
        return;
      }
    } catch {}
    if (btn && activeSpeakBtn === btn) {
      setSpeakBtnState(btn, 'idle');
      activeSpeakBtn = null;
    }
  }

  async function synthesizeWithServerTTS(text) {
    const ttsModel = selectedTtsMode === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
    const cacheKey = ttsModel + ':' + selectedTtsVoice + ':' + text;
    if (geminiAudioCache.has(cacheKey)) return geminiAudioCache.get(cacheKey);

    const res = await fetch(resolveAiApiUrl('/api/ai/tts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model: ttsModel,
        voice: selectedTtsVoice
      })
    });
    if (!res.ok) throw new Error('TTS HTTP ' + res.status);
    const data = await res.json();
    if (data && data.audioBase64) {
      const mime = data.mimeType || 'audio/wav';
      const dataUri = 'data:' + mime + ';base64,' + data.audioBase64;
      geminiAudioCache.set(cacheKey, dataUri);
      return dataUri;
    }
    throw new Error('No audio returned from server TTS');
  }

  async function speakWithGeminiFirst(rawText, triggerBtn) {
    if (triggerBtn && activeSpeakBtn === triggerBtn) {
      stopGeminiAudio();
      return;
    }
    const clean = stripEmojisClean(String(rawText || '').replace(/\s+/g, ' ').trim());
    if (!clean || (typeof state !== 'undefined' && state.muted)) return;
    stopGeminiAudio();
    const myToken = ++ttsRequestToken;

    if (triggerBtn) {
      activeSpeakBtn = triggerBtn;
      setSpeakBtnState(triggerBtn, 'loading');
    }

    if (selectedTtsMode !== 'browser' && backendAvailable && serverConfigured && !staticTutorMode) {
      try {
        const audioDataUri = await synthesizeWithServerTTS(clean);
        if (myToken !== ttsRequestToken) return;
        const audio = new Audio(audioDataUri);
        currentGeminiAudio = audio;
        if (triggerBtn) {
          setSpeakBtnState(triggerBtn, 'playing');
        }
        audio.onended = () => {
          if (myToken === ttsRequestToken) {
            currentGeminiAudio = null;
            if (activeSpeakBtn === triggerBtn) {
              setSpeakBtnState(triggerBtn, 'idle');
              activeSpeakBtn = null;
            }
          }
        };
        audio.onerror = () => {
          if (myToken === ttsRequestToken) {
            currentGeminiAudio = null;
            fallbackBrowserSpeak(clean, triggerBtn, myToken);
          }
        };
        await audio.play();
        return;
      } catch {
        if (myToken !== ttsRequestToken) return;
      }
    }
    fallbackBrowserSpeak(clean, triggerBtn, myToken);
  }
  window.speakWithGeminiFirst = speakWithGeminiFirst;

  const sheet = $('ai-tutor-sheet');
  const logEl = $('ai-chat-log');
  const formEl = $('ai-chat-form');
  const inputEl = $('ai-chat-input');
  const sendBtn = $('ai-send-btn');
  const optionsBtn = $('ai-options-btn');
  const optionsMenu = $('ai-options-menu');
  const settingsPanel = $('ai-settings-panel');
  const settingsBtn = $('ai-settings-toggle');
  const settingsCloseBtn = $('ai-settings-close');
  const clearConfirmEl = $('ai-clear-confirm');
  const clearConfirmYes = $('ai-clear-confirm-yes');
  const clearConfirmNo = $('ai-clear-confirm-no');
  const undoBarEl = $('ai-undo-bar');
  const undoClearBtn = $('ai-undo-clear-btn');
  const realStateBadge = $('ai-real-state-badge');
  const keyStatus = $('ai-key-status');
  const ctxStation = $('ai-ctx-station');
  const ctxSkill = $('ai-ctx-skill');
  const ctxReward = $('ai-ctx-reward');
  const ctxDetailsToggle = $('ai-ctx-details-toggle');
  const ctxDetailsPanel = $('ai-ctx-details-panel');
  const ctxDetailFocus = $('ai-ctx-detail-focus');
  const ctxDetailSkill = $('ai-ctx-detail-skill');
  const ctxDetailNumbers = $('ai-ctx-detail-numbers');
  const newMsgBtn = $('ai-new-msg-btn');
  const liveBar = $('ai-live-bar');
  const liveTitleEl = $('ai-live-title');
  const liveStatusEl = $('ai-live-status');
  const liveStopBtn = $('ai-live-stop-btn');
  const liveToggleBtn = $('ai-live-toggle-btn');
  const liveBtnLabel = $('ai-live-btn-label');
  const quickChipsWrap = $('ai-quick-chips');
  const moreChipsBtn = $('ai-more-chips-btn');
  const dictateBtn = $('ai-dictate-btn');

  const TUTOR_MINI_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M6 10.5v5.2c0 1.6 2.7 3.3 6 3.3s6-1.7 6-3.3v-5.2"/></svg>';

  let userNearBottom = true;
  let lastClearedSnapshot = null;

  function checkIsNearBottom() {
    if (!logEl) return true;
    if (logEl.scrollHeight <= logEl.clientHeight) return true;
    return logEl.scrollHeight - (logEl.scrollTop + logEl.clientHeight) <= 72;
  }

  function scrollChatToBottom(forceSmooth) {
    if (!logEl) return;
    userNearBottom = true;
    if (newMsgBtn) newMsgBtn.hidden = true;
    if (forceSmooth && typeof logEl.scrollTo === 'function') {
      logEl.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
    } else {
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  function notifyNewChatContent(forceScroll) {
    if (!logEl) return;
    if (forceScroll || userNearBottom) {
      logEl.scrollTop = logEl.scrollHeight;
      if (newMsgBtn) newMsgBtn.hidden = true;
    } else if (newMsgBtn) {
      newMsgBtn.hidden = false;
    }
  }

  function setHeaderRealState(text, tone) {
    if (!realStateBadge) return;
    if (!text) {
      realStateBadge.hidden = true;
      realStateBadge.textContent = '';
      delete realStateBadge.dataset.tone;
      return;
    }
    realStateBadge.textContent = text;
    if (tone) realStateBadge.dataset.tone = tone;
    else delete realStateBadge.dataset.tone;
    realStateBadge.hidden = false;
  }

  function syncComposerState() {
    if (!inputEl) return;
    inputEl.style.height = 'auto';
    const nextH = Math.min(112, Math.max(40, inputEl.scrollHeight || 40));
    inputEl.style.height = nextH + 'px';
    if (sendBtn) {
      sendBtn.disabled = Boolean(isBusy || !inputEl.value.trim());
    }
  }

  function getWeakestSkillKey() {
    const entries = Object.entries((typeof state !== 'undefined' && state.skillStats) || {});
    let weakest = 'place';
    let worstScore = Infinity;
    entries.forEach(([k, v]) => {
      const total = (v.ok || 0) + (v.err || 0);
      const ratio = total === 0 ? 0.5 : (v.ok - v.err * 1.5) / total;
      if (ratio < worstScore) {
        worstScore = ratio;
        weakest = k;
      }
    });
    return weakest;
  }

  function cleanVisibleDomText(el, maxLen) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.l1-slide-tutor-bar, script, style, svg').forEach(n => n.remove());
    return String(clone.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLen || 700);
  }

  function detectOpenLab() {
    const cmpDlg = $('cmp-lab-dialog');
    if (cmpDlg && cmpDlg.open) {
      const a = $('cmp-input-a')?.value || '';
      const b = $('cmp-input-b')?.value || '';
      const banner = $('cmp-lab-banner')?.textContent?.trim() || '';
      return {
        lesson: 2,
        label: 'مختبر مقارنة الأعداد التفاعلي (' + a + ' مقابل ' + b + ')' + (banner ? ' — ' + banner : '')
      };
    }
    const opsDlg = $('ops-lab-dialog');
    if (opsDlg && opsDlg.open) {
      const a = $('ops-input-a')?.value || '';
      const b = $('ops-input-b')?.value || '';
      const isSub = $('ops-op-sub')?.getAttribute('aria-pressed') === 'true';
      return {
        lesson: 3,
        label: 'مختبر الجمع والطرح العمودي (' + a + (isSub ? ' − ' : ' + ') + b + ')'
      };
    }
    const negDlg = $('neg-lab-dialog');
    if (negDlg && negDlg.open) {
      const val = $('neg-lab-val-badge')?.textContent?.trim() || '';
      const summary = $('neg-lab-summary')?.textContent?.trim() || '';
      return {
        lesson: 4,
        label: 'مختبر الأعداد السالبة (القيمة المختارة: ' + val + ')' + (summary ? ' — ' + summary : '')
      };
    }
    const tblDlg = $('table-lab-dialog');
    if (tblDlg && tblDlg.open) {
      const summary = $('table-lab-summary')?.textContent?.trim() || '';
      return {
        lesson: 5,
        label: 'مختبر إنشاء الجداول لحل المسائل' + (summary ? ' — ' + summary : '')
      };
    }
    return null;
  }

  function extractActiveSlideAndLessonContext() {
    const weakKey = getWeakestSkillKey();
    const openLab = detectOpenLab();
    const runnerSess =
      typeof L1Runner !== 'undefined' && typeof L1Runner.getSession === 'function'
        ? L1Runner.getSession()
        : null;
    const inLearningShell =
      document.body.dataset.l1Mode === 'learning' && runnerSess && Array.isArray(runnerSess.steps);

    let lesson = 1;
    if (openLab) {
      lesson = openLab.lesson;
    } else if (inLearningShell && runnerSess.lesson) {
      lesson = runnerSess.lesson;
    } else if (state.viewMode === 'lesson5' || (state.viewMode === 'map' && state.mapSubView === 'lesson5')) {
      lesson = 5;
    } else if (state.viewMode === 'lesson4' || (state.viewMode === 'map' && state.mapSubView === 'lesson4')) {
      lesson = 4;
    } else if (state.viewMode === 'lesson3' || (state.viewMode === 'map' && state.mapSubView === 'lesson3')) {
      lesson = 3;
    } else if (state.viewMode === 'lesson2' || (state.viewMode === 'map' && state.mapSubView === 'lesson2')) {
      lesson = 2;
    }

    const defaultWeakByLesson = {
      1: SKILL_LABELS[weakKey] || 'القيمة المنزلية ضمن الملايين',
      2: 'مقارنة الأعداد بعدّ المنازل ثم الفحص من أقصى اليسار والترتيب',
      3: 'الجمع والطرح العمودي مع إعادة التجميع والتحقق بالتقدير',
      4: 'الأعداد السالبة وتمثيلها على خط الأعداد وميزان الحرارة وتفسير الصفر',
      5: 'تنظيم المعطيات في جدول واستخلاص النمط والتحقق بالضرب'
    };

    let stationTitle = LESSON_TITLES[lesson] || LESSON_TITLES[1];
    let stepKind = 'map';
    let stepIndex = undefined;
    let totalSteps = undefined;
    let isTeachingSlide = false;
    let slideTitle = '';
    let slideBody = '';
    let questionPrompt = '';
    let numbersInvolved = '';
    let options = [];
    let hintText = '';
    let completedCount = 0;
    let totalCount = 12;

    if (lesson === 5 && typeof L5_NODES !== 'undefined') {
      const l5 = typeof getLesson5State === 'function' ? getLesson5State() : null;
      const nid = inLearningShell ? runnerSess.nodeId : l5 ? l5.activeNode : 0;
      stationTitle = (L5_NODES[nid] && L5_NODES[nid].title) || LESSON_TITLES[5];
      completedCount = typeof getLesson5DoneCount === 'function' ? getLesson5DoneCount() : 0;
      totalCount = L5_NODES.length;
    } else if (lesson === 4 && typeof L4_NODES !== 'undefined') {
      const l4 = typeof getLesson4State === 'function' ? getLesson4State() : null;
      const nid = inLearningShell ? runnerSess.nodeId : l4 ? l4.activeNode : 0;
      stationTitle = (L4_NODES[nid] && L4_NODES[nid].title) || LESSON_TITLES[4];
      completedCount = typeof getLesson4DoneCount === 'function' ? getLesson4DoneCount() : 0;
      totalCount = L4_NODES.length;
    } else if (lesson === 3 && typeof L3_NODES !== 'undefined') {
      const l3 = typeof getLesson3State === 'function' ? getLesson3State() : null;
      const nid = inLearningShell ? runnerSess.nodeId : l3 ? l3.activeNode : 0;
      stationTitle = (L3_NODES[nid] && L3_NODES[nid].title) || LESSON_TITLES[3];
      completedCount = typeof getLesson3DoneCount === 'function' ? getLesson3DoneCount() : 0;
      totalCount = L3_NODES.length;
    } else if (lesson === 2 && typeof L2_NODES !== 'undefined') {
      const l2 = typeof getLesson2State === 'function' ? getLesson2State() : null;
      const nid = inLearningShell ? runnerSess.nodeId : l2 ? l2.activeNode : 0;
      stationTitle = (L2_NODES[nid] && L2_NODES[nid].title) || LESSON_TITLES[2];
      completedCount = typeof getLesson2DoneCount === 'function' ? getLesson2DoneCount() : 0;
      totalCount = L2_NODES.length;
    } else if (typeof PATH_NODES !== 'undefined') {
      const node = PATH_NODES[state.activeNode] || PATH_NODES[0];
      stationTitle = (inLearningShell && runnerSess.title) || (node ? node.title : LESSON_TITLES[1]);
      completedCount = state.completed ? state.completed.size : 0;
      totalCount = 12;
    }

    if (inLearningShell) {
      const cur = runnerSess.steps[runnerSess.index];
      stepIndex = runnerSess.index;
      totalSteps = runnerSess.steps.length;
      if (runnerSess.title) stationTitle = runnerSess.title;

      if (cur) {
        stepKind = cur.kind || 'step';
        isTeachingSlide = Boolean(
          cur.kind === 'story_slide' ||
            cur.kind === 's1_worked_model' ||
            cur.kind === 's1_bridge' ||
            cur.kind === 'l3_teach' ||
            cur.kind === 'l4_teach' ||
            cur.kind === 'l5_teach' ||
            cur.kind === 'rapid_intro'
        );

        const domPrompt = cleanVisibleDomText($('l1-prompt'), 260);
        const domBody = cleanVisibleDomText($('l1-body'), 750);

        if (isTeachingSlide) {
          slideTitle = domPrompt || cur.skillTag || stationTitle;
          slideBody = domBody;
        } else {
          questionPrompt = domPrompt || String(cur.prompt || '');
          slideTitle = cur.skillTag || stationTitle;
          slideBody = domBody;
        }

        const nums = [];
        if (cur.slide && cur.slide.n !== undefined) nums.push(String(cur.slide.n));
        if (cur.num !== undefined) nums.push(String(cur.num));
        if (cur.numA !== undefined && cur.numB !== undefined) nums.push(cur.numA + ' ، ' + cur.numB);
        if (Array.isArray(cur.operands)) nums.push(cur.operands.join(' ، '));
        if (cur.rawStep && cur.rawStep.n !== undefined) nums.push(String(cur.rawStep.n));
        if (nums.length > 0) numbersInvolved = nums.join(' | ');

        if (Array.isArray(cur.options)) {
          options = cur.options.map(o => (typeof o === 'object' ? String(o.label ?? o.text ?? o.val ?? '') : String(o))).filter(Boolean).slice(0, 5);
        } else if (Array.isArray(cur.choices)) {
          options = cur.choices.map(o => (typeof o === 'object' ? String(o.label ?? o.text ?? '') : String(o))).filter(Boolean).slice(0, 5);
        }

        if (cur.hint) hintText = String(cur.hint);
        else if (Array.isArray(cur.hints) && cur.hints.length > 0) hintText = String(cur.hints[0]);
        else if (cur.takeaway) hintText = String(cur.takeaway);
      }
    } else if (state.viewMode === 'story') {
      isTeachingSlide = true;
      stepKind = 'legacy_story_slide';
      slideTitle = stationTitle;
      slideBody = cleanVisibleDomText($('story-caption'), 400) || cleanVisibleDomText($('animation-stage'), 400);
    } else if (state.viewMode === 'lesson2' && $('lesson2-view') && !$('lesson2-view').hidden) {
      stepKind = 'l2_station_view';
      slideTitle = cleanVisibleDomText($('l2-station-title'), 150) || stationTitle;
      questionPrompt = cleanVisibleDomText($('l2-station-desc'), 300);
      slideBody = cleanVisibleDomText($('l2-interactive-container'), 500);
    } else if (state.viewMode === 'playground') {
      stepKind = 'playground';
      slideTitle = 'ملعب الأعداد التفاعلي';
      questionPrompt = cleanVisibleDomText($('quest-prompt'), 250);
      numbersInvolved = cleanVisibleDomText($('play-number'), 60);
    } else if (state.viewMode === 'mission') {
      try {
        const s = typeof currentStep === 'function' ? currentStep() : null;
        const m = typeof missions !== 'undefined' && typeof activeId === 'function' ? missions[activeId()] : null;
        if (m && m.title) stationTitle = m.title;
        if (s) {
          questionPrompt = String(s.q || '');
          if (s.n !== undefined) numbersInvolved = String(s.n);
        }
      } catch {}
    }

    return {
      lesson,
      lessonTitle: LESSON_TITLES[lesson] || LESSON_TITLES[1],
      stationTitle,
      stepKind,
      stepIndex,
      totalSteps,
      isTeachingSlide,
      slideTitle,
      slideBody,
      questionPrompt,
      numbersInvolved,
      options,
      hintText,
      activeLab: openLab ? openLab.label : '',
      weakKey,
      weakSkillLabel: defaultWeakByLesson[lesson] || defaultWeakByLesson[1],
      studentName: (typeof state !== 'undefined' && state.studentName) || 'بطل الأعداد',
      points: typeof totalPoints === 'function' ? totalPoints() : 0,
      completedCount,
      totalCount
    };
  }

  function cleanStationTitle(title) {
    return String(title || '')
      .replace(/^\s*\d+[\.\-\s]+/, '')
      .trim();
  }

  function formatContextHeadline(ctx) {
    return 'نتعلم الآن: ' + (ctx.lessonTitle || LESSON_TITLES[ctx.lesson] || LESSON_TITLES[1]);
  }

  function formatContextSubline(ctx) {
    if (ctx.activeLab) {
      return String(ctx.activeLab).split('—')[0].trim();
    }
    const cleanStation = cleanStationTitle(ctx.stationTitle);
    const stepPart =
      ctx.stepIndex !== undefined && ctx.totalSteps
        ? 'الشريحة ' + (ctx.stepIndex + 1) + ' من ' + ctx.totalSteps
        : '';
    if (ctx.slideTitle) {
      return stepPart ? ctx.slideTitle + ' · ' + stepPart : ctx.slideTitle;
    }
    if (cleanStation) {
      return stepPart ? cleanStation + ' · ' + stepPart : cleanStation;
    }
    return stepPart;
  }

  function updateContextUI() {
    const ctx = extractActiveSlideAndLessonContext();
    if (ctxStation) ctxStation.textContent = formatContextHeadline(ctx);
    if (ctxSkill) {
      const sub = formatContextSubline(ctx);
      ctxSkill.textContent = sub;
      ctxSkill.hidden = !sub;
    }

    const rawFocus = ctx.activeLab
      ? ctx.activeLab
      : ctx.isTeachingSlide
        ? ctx.slideBody || ctx.slideTitle || ''
        : ctx.questionPrompt || ctx.slideBody || ctx.slideTitle || '';
    const focusClean = String(rawFocus || '')
      .replace(/^(الشرح الحالي|التركيز الحالي)\s*:\s*/g, '')
      .trim();

    if (ctxDetailFocus) {
      ctxDetailFocus.textContent = focusClean
        ? (ctx.isTeachingSlide ? 'محتوى الشريحة: ' : 'سؤال الشريحة: ') + focusClean
        : 'الدرس ' + ctx.lesson + ': ' + ctx.lessonTitle;
    }
    if (ctxDetailSkill) {
      ctxDetailSkill.textContent = ctx.weakSkillLabel ? 'المهارة المستهدفة: ' + ctx.weakSkillLabel : '';
      ctxDetailSkill.hidden = !ctx.weakSkillLabel;
    }
    if (ctxDetailNumbers) {
      if (ctx.numbersInvolved) {
        ctxDetailNumbers.hidden = false;
        ctxDetailNumbers.replaceChildren();
        ctxDetailNumbers.append(document.createTextNode('الأعداد في الشريحة: '));
        const bdi = document.createElement('bdi');
        bdi.dir = 'ltr';
        bdi.className = 'ai-math-ltr';
        bdi.textContent = ctx.numbersInvolved;
        ctxDetailNumbers.append(bdi);
      } else {
        ctxDetailNumbers.hidden = true;
      }
    }

    if (ctxReward) {
      let count = 0;
      if (typeof ensureAiQuizDay === 'function') {
        ensureAiQuizDay();
        count = Math.min(3, Math.max(0, state.aiQuiz?.rewarded || 0));
      }
      ctxReward.innerHTML =
        'مكافآت اليوم: <bdi dir="ltr">' + count + '</bdi> من <bdi dir="ltr">3</bdi>';
    }

    document.querySelectorAll('.ai-model-btn[data-ai-model]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.aiModel === selectedModel));
    });
    document.querySelectorAll('.ai-tts-mode-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.ttsMode === selectedTtsMode));
    });
    document.querySelectorAll('.ai-tts-voice-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.ttsVoice === selectedTtsVoice));
    });
    if (keyStatus) {
      if (staticTutorMode && healthChecked) {
        keyStatus.hidden = false;
        keyStatus.textContent =
          'المعلم الذكي التفاعلي مفعّل مباشرة على هذه الصفحة (الشرح الخطوة بخطوة، الرسوم البصرية، الاختبارات، والقراءة الصوتية).';
      } else if (!serverConfigured && healthChecked) {
        keyStatus.hidden = false;
        keyStatus.textContent = 'يعمل الشرح المنهجي المدمج حالياً عند عدم توفر اتصال مباشر بالخادم.';
      } else {
        keyStatus.hidden = true;
        keyStatus.textContent = '';
      }
    }
  }

  function buildComputedMathReply(userText, ctx) {
    const qNorm = normArDigits(String(userText || '').trim());
    const qNums = extractNumbersFromStr(qNorm);
    const wantsRead = /اقرأ|قراءة|لفظية|بالكلمات/.test(qNorm);
    const wantsExpanded = /تحليلية|تحليلي/.test(qNorm);
    const wantsPlace = /منزلة|قيمة منزلية|دورة|أصفار|كم صفر/.test(qNorm);
    const wantsCompare = /قارن|مقارنة|أكبر|أصغر|أيهما|ترتيب|[><=]/.test(qNorm);
    const wantsOps = /جمع|طرح|استلاف|نستلف|ناتج|احسب|كم يساوي|\d[\d,]*\s*[+−-]\s*\d[\d,]*/.test(qNorm);
    const wantsNeg = /سالب|تحت الصفر|فوق الصفر|معاكس|خط الأعداد|درجة حرارة|عمق|سطح البحر/.test(qNorm) || qNums.some(n => n < 0 && n >= -50);
    const wantsTable = /جدول|نمط|يدخر|يدّخر|أسابيع|أسبوع|باقة|وردات/.test(qNorm);

    if (wantsCompare && (qNums.filter(n => n >= 10).length >= 2 || ctx.lesson === 2)) {
      const spec = buildClientVisualSpec(qNorm, ctx, 'comparison');
      const d = spec.comparison;
      if (d) {
        const decCol = d.columns[d.decisiveIndexFromLeft];
        if (!d.sameLength) {
          return (
            'لنقارن بين ' + d.formattedA + ' و ' + d.formattedB + ' خطوة بخطوة:\n' +
            '1. نعدّ منازل كل عدد أولاً: العدد ' + d.formattedA + ' مكوّن من ' + d.lenA + ' منازل، والعدد ' + d.formattedB + ' مكوّن من ' + d.lenB + ' منازل.\n' +
            '2. العدد ذو المنازل الأكثر هو الأكبر مباشرة.\n' +
            '3. إذن النتيجة هي: ' + d.formattedA + ' ' + d.symbol + ' ' + d.formattedB + '.'
          );
        }
        if (d.symbol === '=') {
          return (
            'لنقارن بين ' + d.formattedA + ' و ' + d.formattedB + ':\n' +
            '1. كلا العددين مكوّن من ' + d.lenA + ' منازل.\n' +
            '2. جميع الأرقام من أقصى اليسار إلى اليمين متطابقة تماماً.\n' +
            '3. إذن العددان متساويان: ' + d.formattedA + ' = ' + d.formattedB + '.'
          );
        }
        return (
          'لنقارن بين ' + d.formattedA + ' و ' + d.formattedB + ' خطوة بخطوة:\n' +
          '1. نعدّ المنازل أولاً: كلاهما مكوّن من ' + d.lenA + ' منازل.\n' +
          '2. نقارن من أقصى اليسار حتى نجد أول اختلاف في منزلة «' + decCol.placeName + '»: الرقم ' + decCol.digitA + ' مقابل ' + decCol.digitB + '.\n' +
          '3. إذن النتيجة الدقيقة هي: ' + d.formattedA + ' ' + d.symbol + ' ' + d.formattedB + '.'
        );
      }
    }

    if (wantsOps && (qNums.filter(n => n >= 10).length >= 2 || /\d[\d,]*\s*[+−-]\s*\d[\d,]*/.test(qNorm))) {
      const spec = buildClientVisualSpec(qNorm, ctx, 'vertical_ops');
      const d = spec.verticalOps;
      if (d) {
        const opSym = d.op === 'sub' ? '−' : '+';
        const opName = d.op === 'sub' ? 'الطرح العمودي' : 'الجمع العمودي';
        const keyCols = d.columns
          .filter(c => (d.op === 'sub' ? c.borrowed : c.carryOut > 0))
          .slice(0, 2)
          .map(c => c.noteAr);
        const step2 = keyCols.length > 0
          ? keyCols.join(' ')
          : 'نحسب كل عمود من الآحاد نحو اليسار بدقة دون الحاجة لإعادة تجميع.';
        return (
          'خطوات ' + opName + ' لحساب ' + d.numA.toLocaleString('en-US') + ' ' + opSym + ' ' + d.numB.toLocaleString('en-US') + ':\n' +
          '1. نرتّب العددين عمودياً بمحاذاة منزلة الآحاد من اليمين.\n' +
          '2. ' + step2 + '\n' +
          '3. الناتج النهائي يساوي ' + d.result.toLocaleString('en-US') + ' (ويمكنك تتبّع كل عمود في الرسم التفاعلي أدناه).'
        );
      }
    }

    if (wantsNeg) {
      const spec = buildClientVisualSpec(qNorm, ctx, 'number_line');
      const d = spec.numberLine;
      if (d) {
        const signVal = d.value > 0 ? '+' + d.value : String(d.value);
        const oppVal = d.oppositeValue > 0 ? '+' + d.oppositeValue : String(d.oppositeValue);
        return (
          'لفهم العدد ' + signVal + ' على خط الأعداد:\n' +
          '1. الصفر (0) هو نقطة المرجع الفاصلة بين الموجب والسالب.\n' +
          '2. ' + d.summaryAr + '\n' +
          '3. العدد المعاكس له هو ' + oppVal + ' لأنه يبعد المسافة نفسها (' + d.distanceFromZero + ' وحدات) على الجهة المقابلة من الصفر.'
        );
      }
    }

    if (wantsTable) {
      const spec = buildClientVisualSpec(qNorm, ctx, 'pattern_table');
      const d = spec.patternTable;
      if (d) {
        const preview = d.columns.slice(0, 4).map(c => '(' + c.rowA + ' ← ' + c.rowB + ')').join('، ');
        return (
          'لنحلها باستعمال خطة إنشاء جدول:\n' +
          '1. نحدّد النمط الثابت في الجدول: نضيف ' + d.stepDeltaB + ' في كل خطوة.\n' +
          '2. نملأ الأعمدة بالترتيب: ' + preview + '…\n' +
          '3. ' + d.summaryAr
        );
      }
    }

    if (wantsPlace || wantsRead || wantsExpanded || qNums.some(n => n >= 100)) {
      const spec = buildClientVisualSpec(qNorm, ctx, 'place_value');
      const d = spec.placeValue;
      if (d) {
        const focused = d.cells[d.focusIndexFromLeft] || d.cells[0];
        const verbalPart =
          typeof words === 'function'
            ? '\n3. يُقرأ بالصيغة اللفظية: ' + words(d.targetNumber) + '.'
            : '\n3. الصيغة التحليلية: ' + d.expandedTerms.join(' + ') + '.';
        if (wantsExpanded) {
          return (
            'تحليل العدد ' + d.formattedNumber + ' إلى الصيغة التحليلية:\n' +
            '1. نكتب القيمة المنزلية لكل رقم غير صفري في العدد.\n' +
            '2. الصيغة التحليلية: ' + d.expandedTerms.join(' + ') + '.\n' +
            '3. تذكّر أن الصفر يحفظ المنزلة في الصيغة القياسية ولا يُكتب في الصيغة التحليلية.'
          );
        }
        return (
          'تحليل العدد ' + d.formattedNumber + ' في لوحة المنازل:\n' +
          '1. نقسّمه من اليمين إلى دورات ثلاثية (الآحاد، الألوف، الملايين).\n' +
          '2. الرقم ' + focused.digit + ' يقع في منزلة «' + focused.placeName + '» (' + focused.periodName + ') وعلى يمينه ' + focused.zerosCount + ' منازل، فقيمته المنزلية تساوي ' + focused.placeValue.toLocaleString('en-US') + '.' +
          verbalPart
        );
      }
    }

    return '';
  }

  function buildSlideAwareFallback(kind, userText, ctx) {
    fallbackTurnIndex++;
    const q = String(userText || '').trim().toLowerCase();
    const slideSnippet = ctx.slideTitle || ctx.questionPrompt || ctx.stationTitle;
    const numNote = ctx.numbersInvolved ? ' (الأعداد في الشريحة: ' + ctx.numbersInvolved + ')' : '';

    if (kind === 'example' || q.includes('مثال')) {
      const examplesByLesson = {
        1: 'مثال مبسط على «' + slideSnippet + '»:\n1. نأخذ العدد 4,350,200 ونحدّد الرقم 3 في منزلة مئات الألوف.\n2. نعدّ المنازل عن يمينه فنجد 5 منازل، فتكون قيمته المنزلية 300,000.\n3. يُقرأ العدد: أربعة ملايين وثلاثمائة وخمسون ألفاً ومئتان.',
        2: 'مثال مبسط على مقارنة الأعداد:\n1. نقارن بين 6,420,100 و 6,710,000 بعدّ المنازل أولاً (7 منازل لكل عدد).\n2. نفحص من أقصى اليسار: 6 = 6 في آحاد الملايين.\n3. في مئات الألوف نجد 4 < 7، إذن 6,710,000 > 6,420,100.',
        3: 'مثال مبسط على الجمع والطرح العمودي:\n1. عند طرح 5,000 − 1,350 نرتّب المنازل عمودياً من اليمين.\n2. نستلف 1 من آحاد الألوف فتصبح الأصفار الوسطى 9 وعشرة المئات 10.\n3. نحسب الناتج الدقيق: 5,000 − 1,350 = 3,650.',
        4: 'مثال مبسط على الأعداد السالبة:\n1. نعدّ مستوى سطح البحر نقطة المرجع 0.\n2. ارتفاع طائر 12 متراً فوق البحر يُكتب +12.\n3. عمق غواص 12 متراً تحت البحر يُكتب -12 وهما عددان متعاكسان.',
        5: 'مثال مبسط على خطة إنشاء جدول:\n1. إذا كان ثمن التذكرة 3 دنانير، ننشئ جدولاً بصفّين: عدد التذاكر والثمن.\n2. نتابع النمط: (1 ← 3)، (2 ← 6)، (3 ← 9)، (4 ← 12).\n3. نتحقق بالضرب: 4 × 3 = 12 ديناراً.'
      };
      return examplesByLesson[ctx.lesson] || examplesByLesson[1];
    }

    if (kind === 'hint' || q.includes('تلميح') || q.includes('ساعدني على حل')) {
      if (ctx.hintText) {
        return 'تلميح خطوة بخطوة:\n' + stripEmojisClean(ctx.hintText);
      }
      const hintsByLesson = {
        1: 'تلميح للحل' + numNote + ':\n1. حدّد في أي دورة يقع الرقم المطلوب (الآحاد أم الألوف أم الملايين).\n2. عدّ كم خانة تقع عن يمينه لتعرف عدد الأصفار في قيمته المنزلية.',
        2: 'تلميح للحل' + numNote + ':\n1. عدّ منازل كل عدد أولاً.\n2. إن تساوت المنازل، ابدأ من أقصى رقم في اليسار وقارن حتى يظهر أول اختلاف.',
        3: 'تلميح للحل' + numNote + ':\n1. ابدأ من عمود الآحاد في أقصى اليمين.\n2. انتبه: هل مجموع العمود 10 فأكثر فنرفع 1، أم الرقم العلوي أصغر فنستلف؟',
        4: 'تلميح للحل' + numNote + ':\n1. عيّن موقع الصفر 0 أولاً على خط الأعداد.\n2. اسأل نفسك: هل القيمة فوق/يمين الصفر (+) أم تحت/يسار الصفر (-)؟',
        5: 'تلميح للحل' + numNote + ':\n1. اكتشف مقدار الزيادة الثابتة في الصف الأول من الجدول.\n2. طبّق الزيادة نفسها على العمود التالي خطوة بخطوة.'
      };
      return hintsByLesson[ctx.lesson] || hintsByLesson[1];
    }

    if (kind === 'chat') {
      const computed = buildComputedMathReply(userText, ctx);
      if (computed) return computed;
    }

    if (kind === 'explain' || ctx.isTeachingSlide || q.includes('اشرح') || q.includes('وضح') || q.includes('فهم') || q.includes('شريحة')) {
      const explainByLesson = {
        1: 'توضح شريحة «' + slideSnippet + '»' + numNote + ' طريقة قراءة الأعداد وتحديد القيمة المنزلية:\n1. نقسّم العدد من اليمين إلى دورات ثلاثية: الآحاد، ثم الألوف، ثم الملايين.\n2. نقرأ العدد بدءاً من الدورة الكبرى في اليسار.\n3. لمعرفة القيمة المنزلية لأي رقم، نستبدل كل خانة عن يمينه بصفر.',
        2: 'توضح شريحة «' + slideSnippet + '»' + numNote + ' خطوات مقارنة الأعداد وترتيبها:\n1. نعدّ منازل كل عدد أولاً؛ فالعدد ذو المنازل الأكثر هو الأكبر.\n2. إذا تساوى عدد المنازل، نقارن الأرقام من أقصى اليسار منزلة بمنزلة حتى نجد أول رقمين مختلفين.',
        3: 'توضح شريحة «' + slideSnippet + '»' + numNote + ' خطوات الجمع والطرح العمودي:\n1. نحاذي المنازل من اليمين (الآحاد تحت الآحاد).\n2. نجمع أو نطرح من اليمين إلى اليسار مع إعادة التجميع عند الحاجة.\n3. نتحقق من معقولية الجواب بالتقريب لأعلى منزلة.',
        4: 'توضح شريحة «' + slideSnippet + '»' + numNote + ' مفهوم الأعداد السالبة:\n- الصفر 0 هو نقطة المرجع الفاصلة (ليس موجباً ولا سالباً).\n- الأعداد الموجبة أكبر من 0 وتقع يمينه أو فوقه.\n- الأعداد السالبة أصغر من 0 وتقع يساره أو تحته وتُكتب بإشارة سالب مثل -3.',
        5: 'توضح شريحة «' + slideSnippet + '»' + numNote + ' خطة حل المسألة بإنشاء جدول:\n1. أفهم المعطيات والمطلوب في المسألة.\n2. أخطط بإنشاء جدول منظم للصفوف والأعمدة.\n3. أحل بمتابعة النمط عموداً بعد عمود ثم أتحقق من صحة الجواب.'
      };
      return explainByLesson[ctx.lesson] || explainByLesson[1];
    }

    const computedFallback = buildComputedMathReply(userText, ctx);
    if (computedFallback) return computedFallback;

    const lessonTips = {
      1: 'في درس «القيمة المنزلية ضمن الملايين» نقسّم العدد إلى دورات ثلاثية من اليمين، وقيمة أي رقم تساوي الرقم متبوعاً بأصفار بعدد الخانات عن يمينه.',
      2: 'في درس «مقارنة الأعداد وترتيبها» نعدّ المنازل أولاً، وإن تساوت نقارن من أقصى اليسار حتى يظهر أول رقمين مختلفين.',
      3: 'في درس «جمع الأعداد الكلية وطرحها» نبدأ من منزلة الآحاد يميناً مع إعادة التجميع أو الاستلاف عند الحاجة.',
      4: 'في درس «الأعداد السالبة» يقف الصفر في المنتصف؛ الموجب يمينه أو فوقه والسالب يساره أو تحته.',
      5: 'في درس «خطة إنشاء جدول» ننظّم المعطيات في أعمدة متتابعة ونتابع الزيادة الثابتة حتى نصل للمطلوب.'
    };
    return (
      'نحن الآن في شريحة «' + slideSnippet + '»' + numNote + '.\n' +
      (lessonTips[ctx.lesson] || lessonTips[1]) +
      '\nجرّب كتابة أي عدد أو مسألة (مثل: ما القيمة المنزلية للرقم 5 في 2,540,310؟ أو قارن 3,759,120 و 3,456,210) وسأحلّها معك فوراً بالرسم التفاعلي!'
    );
  }

  const MATH_TOKEN_RE =
    /(?:[+-]?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s*(?:[<>≤≥=×÷+\-−/]|°C|m)\s*[+-]?\d(?:[\d,]*\d)?(?:\.\d+)?)*(?:°C|%|m)?|[<>≤≥=])/g;
  const ORDERED_LINE_RE = /^\s*(?:\d+|[١-٩][٠-٩]*)[\.\)\-–:]\s+(.+)$/;
  const UNORDERED_LINE_RE = /^\s*[•\-\*▪◦]\s+(.+)$/;

  function appendRichLineRuns(parentEl, lineText) {
    const src = String(lineText || '');
    let last = 0;
    const matches = src.matchAll(MATH_TOKEN_RE);
    for (const m of matches) {
      const idx = m.index ?? 0;
      const tok = m[0];
      if (!tok) continue;
      if (idx > last) {
        parentEl.append(document.createTextNode(src.slice(last, idx)));
      }
      const bdi = document.createElement('bdi');
      bdi.dir = 'ltr';
      bdi.className = 'ai-math-ltr';
      bdi.textContent = tok;
      parentEl.append(bdi);
      last = idx + tok.length;
    }
    if (last < src.length) {
      parentEl.append(document.createTextNode(src.slice(last)));
    }
  }

  function setFormattedBodyText(bodyEl, rawText) {
    if (!bodyEl) return;
    const clean = stripEmojisClean(rawText).trim();
    bodyEl.dataset.rawText = clean;
    bodyEl.replaceChildren();
    if (!clean) return;

    const expanded = clean
      .replace(/([:：.،])\s*(\d+[\)\.])\s+/g, '$1\n$2 ')
      .replace(/\s+(\d+\))\s+/g, '\n$1 ');

    const lines = expanded
      .split(/\n+/)
      .map(l => l.trim())
      .filter(Boolean);

    let currentList = null;
    let currentListKind = '';

    lines.forEach(line => {
      const ord = line.match(ORDERED_LINE_RE);
      if (ord) {
        if (!currentList || currentListKind !== 'ol') {
          currentList = document.createElement('ol');
          currentList.className = 'ai-msg-list';
          currentListKind = 'ol';
          bodyEl.append(currentList);
        }
        const li = document.createElement('li');
        appendRichLineRuns(li, ord[1].trim());
        currentList.append(li);
        return;
      }

      const unord = line.match(UNORDERED_LINE_RE);
      if (unord) {
        if (!currentList || currentListKind !== 'ul') {
          currentList = document.createElement('ul');
          currentList.className = 'ai-msg-list';
          currentListKind = 'ul';
          bodyEl.append(currentList);
        }
        const li = document.createElement('li');
        appendRichLineRuns(li, unord[1].trim());
        currentList.append(li);
        return;
      }

      currentList = null;
      currentListKind = '';
      const p = document.createElement('p');
      p.className = 'ai-msg-p';
      appendRichLineRuns(p, line);
      bodyEl.append(p);
    });
  }

  function setTypingPlaceholder(bodyEl) {
    if (!bodyEl) return;
    bodyEl.dataset.rawText = '';
    bodyEl.innerHTML =
      '<span class="ai-typing-indicator"><span>المعلم يكتب…</span><span class="ai-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span></span>';
  }

  function appendMessage(role, text, quizData, customLabel, opts) {
    if (!logEl) return null;
    const options = opts || {};
    const isUser = role === 'user';
    const cleanText = stripEmojisClean(text);

    const row = document.createElement('div');
    row.className = 'ai-msg-row ' + (isUser ? 'user' : 'assistant');

    if (!isUser) {
      const avatar = document.createElement('span');
      avatar.className = 'ai-msg-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.innerHTML = TUTOR_MINI_SVG;
      row.append(avatar);
    }

    const wrap = document.createElement('div');
    wrap.className = 'ai-msg ' + (isUser ? 'user' : 'assistant');

    if (customLabel) {
      const tag = document.createElement('span');
      tag.className = 'ai-msg-tag';
      tag.textContent = customLabel;
      wrap.append(tag);
    }

    const body = document.createElement('div');
    body.className = 'ai-msg-body';
    if (options.isTyping) {
      setTypingPlaceholder(body);
    } else {
      setFormattedBodyText(body, cleanText);
    }
    wrap.append(body);

    if (quizData && Array.isArray(quizData.options)) {
      if (typeof ensureAiQuizDay === 'function') ensureAiQuizDay();
      const card = document.createElement('div');
      card.className = 'ai-quiz-card';
      if (quizData.id) card.dataset.quizId = String(quizData.id);

      if ((state.aiQuiz?.rewarded || 0) >= 3) {
        const capBadge = document.createElement('div');
        capBadge.className = 'ai-quiz-cap-badge';
        capBadge.textContent = 'أنهيت مكافآت اليوم (3 من 3) — التدريب متاح لتعزيز إتقانك';
        card.append(capBadge);
      }

      const qTitle = document.createElement('h4');
      appendRichLineRuns(qTitle, stripEmojisClean(quizData.question));
      const optsBox = document.createElement('div');
      optsBox.className = 'ai-quiz-opts';
      const explainEl = document.createElement('p');
      explainEl.className = 'ai-quiz-explain';
      explainEl.hidden = true;

      quizData.options.forEach((optText, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ai-quiz-opt';
        appendRichLineRuns(b, stripEmojisClean(optText));
        b.addEventListener('click', () => {
          if (optsBox.dataset.answered === 'true') return;
          if (idx === Number(quizData.correctIndex)) {
            optsBox.dataset.answered = 'true';
            b.classList.add('correct');
            if (typeof sound === 'function') sound(true);

            if (typeof ensureAiQuizDay === 'function') ensureAiQuizDay();
            const qId = String(quizData.id || '');
            const alreadyRewarded = qId && state.aiQuiz.seen.includes(qId);
            const capReached = state.aiQuiz.rewarded >= 3;

            let rewardText = '';
            if (!capReached && !alreadyRewarded) {
              state.infiniteStats.bonusPoints += 10;
              state.aiQuiz.rewarded += 1;
              if (qId) {
                state.aiQuiz.seen.push(qId);
                if (state.aiQuiz.seen.length > 100) state.aiQuiz.seen.shift();
              }
              if (typeof renderHUD === 'function') renderHUD();
              updateContextUI();
              if (typeof saveState === 'function') saveState();
              rewardText = 'إجابة صحيحة! +10 نقاط مكافأة. ';
            } else {
              if (typeof saveState === 'function') saveState();
              rewardText = 'إجابة صحيحة! ';
            }

            explainEl.hidden = false;
            explainEl.replaceChildren();
            appendRichLineRuns(explainEl, rewardText + stripEmojisClean(quizData.explanation || ''));
          } else {
            b.classList.add('wrong');
            if (typeof sound === 'function') sound(false);
            explainEl.hidden = false;
            explainEl.textContent = 'ليست الإجابة الدقيقة؛ راجع فكرة الدرس وجرّب خياراً آخر.';
          }
        });
        optsBox.append(b);
      });

      card.append(qTitle, optsBox, explainEl);
      wrap.append(card);
    }

    let speakBtn = null;
    let footerEl = null;
    if (!isUser && !options.hideSpeak) {
      footerEl = document.createElement('div');
      footerEl.className = 'ai-msg-footer';
      if (options.isTyping) footerEl.hidden = true;

      speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'ai-msg-speak';
      speakBtn.setAttribute('aria-label', 'استمع إلى شرح المعلم');
      speakBtn.setAttribute('aria-pressed', 'false');
      speakBtn.innerHTML = SPEAKER_SVG + '<span>استمع</span>';
      speakBtn.addEventListener('click', () => {
        speakWithGeminiFirst(body.dataset.rawText || body.textContent, speakBtn);
      });
      footerEl.append(speakBtn);
      wrap.append(footerEl);
    }

    row.append(wrap);
    logEl.append(row);
    notifyNewChatContent(isUser || Boolean(options.forceScroll));

    return {
      rowEl: row,
      wrapEl: wrap,
      bodyEl: body,
      speakBtn,
      footerEl,
      rawText: cleanText,
      visualSlotEl: null
    };
  }

  /* =====================================================================
     المُصوِّر البصري التفاعلي للمفاهيم الرياضية (Interactive Concept Visualizer)
     ===================================================================== */
  const PLACE_NAMES_AR = [
    'آحاد',
    'عشرات',
    'مئات',
    'آحاد الألوف',
    'عشرات الألوف',
    'مئات الألوف',
    'آحاد الملايين',
    'عشرات الملايين',
    'مئات الملايين'
  ];

  function normArDigits(str) {
    return String(str || '').replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
  }

  function extractNumbersFromStr(str) {
    const norm = normArDigits(str);
    const matches = norm.match(/[+-]?\d[\d,]*/g) || [];
    const out = [];
    matches.forEach(m => {
      const n = Number(m.replace(/,/g, ''));
      if (Number.isFinite(n)) out.push(n);
    });
    return out;
  }

  function computePlaceValueData(rawNum, focusIdxOverride) {
    const safeNum = Math.max(10, Math.min(999999999, Math.abs(Math.trunc(Number(rawNum) || 2540310))));
    const str = String(safeNum);
    const len = str.length;
    let focusIndexFromLeft =
      typeof focusIdxOverride === 'number' && focusIdxOverride >= 0 && focusIdxOverride < len
        ? focusIdxOverride
        : Math.min(1, len - 1);

    const cells = [];
    const expandedTerms = [];
    for (let i = 0; i < len; i++) {
      const digit = Number(str[i]);
      const indexFromRight = len - 1 - i;
      const placeName = PLACE_NAMES_AR[indexFromRight] || 'منزلة ' + (indexFromRight + 1);
      const periodKey = indexFromRight >= 6 ? 'millions' : indexFromRight >= 3 ? 'thousands' : 'ones';
      const periodName =
        periodKey === 'millions' ? 'دورة الملايين' : periodKey === 'thousands' ? 'دورة الألوف' : 'دورة الآحاد';
      const placeValue = digit * Math.pow(10, indexFromRight);
      const barHeightPct =
        digit === 0 ? 10 : Math.min(100, Math.round(20 + ((indexFromRight + 1) / len) * 62 + (digit / 9) * 18));
      cells.push({
        indexFromRight,
        indexFromLeft: i,
        digit,
        placeName,
        periodName,
        periodKey,
        placeValue,
        zerosCount: indexFromRight,
        barHeightPct
      });
      if (digit > 0) expandedTerms.push(placeValue.toLocaleString('en-US'));
    }
    const focused = cells[focusIndexFromLeft] || cells[0];
    return {
      targetNumber: safeNum,
      formattedNumber: safeNum.toLocaleString('en-US'),
      focusIndexFromLeft,
      cells,
      expandedTerms,
      summaryAr:
        'الرقم ' +
        focused.digit +
        ' يقع في منزلة «' +
        focused.placeName +
        '» (' +
        focused.periodName +
        ') وعلى يمينه ' +
        focused.zerosCount +
        ' أصفار حافظة للمنزلة، فقيمته المنزلية = ' +
        focused.placeValue.toLocaleString('en-US') +
        '.'
    };
  }

  function computeComparisonData(rawA, rawB) {
    const numA = Math.max(0, Math.min(999999999, Math.abs(Math.trunc(Number(rawA) || 3759120))));
    const numB = Math.max(0, Math.min(999999999, Math.abs(Math.trunc(Number(rawB) || 3456210))));
    const strA = String(numA);
    const strB = String(numB);
    const lenA = strA.length;
    const lenB = strB.length;
    const maxLen = Math.max(lenA, lenB);
    const padA = strA.padStart(maxLen, '0');
    const padB = strB.padStart(maxLen, '0');
    const sameLength = lenA === lenB;
    let decisiveIndexFromLeft = -1;
    const columns = [];

    for (let i = 0; i < maxLen; i++) {
      const dA = Number(padA[i]);
      const dB = Number(padB[i]);
      const idxRight = maxLen - 1 - i;
      const placeName = PLACE_NAMES_AR[idxRight] || 'منزلة ' + (idxRight + 1);
      let status = 'equal';
      if (decisiveIndexFromLeft === -1) {
        if (dA > dB) {
          decisiveIndexFromLeft = i;
          status = 'decisive_a';
        } else if (dB > dA) {
          decisiveIndexFromLeft = i;
          status = 'decisive_b';
        }
      } else {
        status = 'after_decisive';
      }
      columns.push({ indexFromLeft: i, placeName, digitA: dA, digitB: dB, status });
    }

    const symbol = numA > numB ? '>' : numA < numB ? '<' : '=';
    const formattedA = numA.toLocaleString('en-US');
    const formattedB = numB.toLocaleString('en-US');
    let summaryAr = '';
    if (!sameLength) {
      summaryAr =
        'عدّ المنازل أولاً: ' +
        formattedA +
        ' (' +
        lenA +
        ' منازل) مقابل ' +
        formattedB +
        ' (' +
        lenB +
        ' منازل) ← العدد ذو المنازل الأكثر هو الأكبر (' +
        formattedA +
        ' ' +
        symbol +
        ' ' +
        formattedB +
        ').';
    } else if (decisiveIndexFromLeft >= 0) {
      const dec = columns[decisiveIndexFromLeft];
      summaryAr =
        'تساوى عدد المنازل (' +
        lenA +
        ' منازل). بالفحص من اليسار نجد منزلة الحسم في «' +
        dec.placeName +
        '»: (' +
        dec.digitA +
        ' ' +
        (dec.digitA > dec.digitB ? '>' : '<') +
        ' ' +
        dec.digitB +
        ') ← إذن ' +
        formattedA +
        ' ' +
        symbol +
        ' ' +
        formattedB +
        '.';
    } else {
      summaryAr = 'جميع المنازل متساوية من اليسار إلى اليمين (' + formattedA + ' = ' + formattedB + ').';
    }

    return {
      numA,
      numB,
      formattedA,
      formattedB,
      lenA,
      lenB,
      symbol,
      sameLength,
      decisiveIndexFromLeft: decisiveIndexFromLeft === -1 ? maxLen - 1 : decisiveIndexFromLeft,
      columns,
      summaryAr
    };
  }

  function computeVerticalOpsData(rawA, rawB, op) {
    let numA = Math.max(0, Math.min(99999999, Math.abs(Math.trunc(Number(rawA) || 6000))));
    let numB = Math.max(0, Math.min(99999999, Math.abs(Math.trunc(Number(rawB) || 2400))));
    const cleanOp = op === 'sub' ? 'sub' : 'add';
    if (cleanOp === 'sub' && numB > numA) {
      const t = numA;
      numA = numB;
      numB = t;
    }
    const result = cleanOp === 'add' ? numA + numB : numA - numB;
    const maxLen = Math.max(String(numA).length, String(numB).length, String(result).length);
    const strA = String(numA).padStart(maxLen, '0');
    const strB = String(numB).padStart(maxLen, '0');
    const columns = [];

    if (cleanOp === 'add') {
      let carry = 0;
      for (let r = 0; r < maxLen; r++) {
        const i = maxLen - 1 - r;
        const dA = Number(strA[i]);
        const dB = Number(strB[i]);
        const carryIn = carry;
        const sum = dA + dB + carryIn;
        const resultDigit = sum % 10;
        const carryOut = Math.floor(sum / 10);
        const placeName = PLACE_NAMES_AR[r] || 'منزلة ' + (r + 1);
        const noteAr =
          'في ' +
          placeName +
          ': ' +
          dA +
          ' + ' +
          dB +
          (carryIn > 0 ? ' + ' + carryIn + ' (مرفوع)' : '') +
          ' = ' +
          sum +
          ' ← نكتب ' +
          resultDigit +
          (carryOut > 0 ? ' ونرفع ' + carryOut + ' للمنزلة التالية.' : '.');
        columns.push({
          indexFromRight: r,
          placeName,
          rawTop: dA,
          rawBottom: dB,
          effectiveTop: dA,
          carryIn,
          carryOut,
          borrowed: false,
          resultDigit,
          noteAr
        });
        carry = carryOut;
      }
    } else {
      const workTop = strA.split('').map(Number);
      const workBot = strB.split('').map(Number);
      for (let r = 0; r < maxLen; r++) {
        const i = maxLen - 1 - r;
        const rawTop = Number(strA[i]);
        const rawBottom = workBot[i];
        let borrowed = false;
        if (workTop[i] < rawBottom) {
          borrowed = true;
          let k = i - 1;
          while (k >= 0 && workTop[k] === 0) {
            workTop[k] = 9;
            k--;
          }
          if (k >= 0) workTop[k] -= 1;
          workTop[i] += 10;
        }
        const effectiveTop = workTop[i];
        const resultDigit = effectiveTop - rawBottom;
        const placeName = PLACE_NAMES_AR[r] || 'منزلة ' + (r + 1);
        const noteAr = borrowed
          ? 'في ' +
            placeName +
            ': استلفنا 1 من اليسار فأصبحت الخانة ' +
            effectiveTop +
            ' ثم ' +
            effectiveTop +
            ' − ' +
            rawBottom +
            ' = ' +
            resultDigit +
            '.'
          : 'في ' + placeName + ': ' + effectiveTop + ' − ' + rawBottom + ' = ' + resultDigit + '.';
        columns.push({
          indexFromRight: r,
          placeName,
          rawTop,
          rawBottom,
          effectiveTop,
          carryIn: 0,
          carryOut: 0,
          borrowed,
          resultDigit,
          noteAr
        });
      }
    }
    return {
      numA,
      numB,
      op: cleanOp,
      result,
      columns,
      summaryAr:
        numA.toLocaleString('en-US') +
        (cleanOp === 'add' ? ' + ' : ' − ') +
        numB.toLocaleString('en-US') +
        ' = ' +
        result.toLocaleString('en-US')
    };
  }

  function computeNumberLineData(rawVal) {
    let value = Number.isFinite(Number(rawVal)) ? Math.trunc(Number(rawVal)) : -4;
    value = Math.max(-10, Math.min(10, value));
    const oppositeValue = -value;
    const distanceFromZero = Math.abs(value);
    const contextLabelAr =
      value < 0
        ? distanceFromZero + ' درجات تحت الصفر (يسار الصفر)'
        : value > 0
          ? distanceFromZero + ' درجات فوق الصفر (يمين الصفر)'
          : 'نقطة المرجع الفاصلة (0 ليس موجباً ولا سالباً)';
    return {
      value,
      compareValue: oppositeValue,
      oppositeValue,
      min: -10,
      max: 10,
      distanceFromZero,
      contextLabelAr,
      summaryAr:
        value === 0
          ? 'الصفر (0) هو نقطة المرجع الفاصلة بين الأعداد الموجبة والسالبة.'
          : 'العدد ' +
            (value > 0 ? '+' + value : value) +
            ' يبعد ' +
            distanceFromZero +
            ' وحدات عن الصفر، ومعاكسه هو ' +
            (oppositeValue > 0 ? '+' + oppositeValue : oppositeValue) +
            '.'
    };
  }

  function computePatternTableData(stepDeltaB, stepsCount) {
    const dB = Math.max(2, Math.min(25, Math.abs(Math.trunc(Number(stepDeltaB) || 4))));
    const count = Math.max(4, Math.min(8, Math.trunc(Number(stepsCount) || 6)));
    const columns = [];
    for (let s = 1; s <= count; s++) {
      columns.push({ step: s, rowA: s, rowB: s * dB });
    }
    return {
      rowALabel: 'الخطوة (الأسبوع)',
      rowBLabel: 'المقدار المتراكم',
      stepDeltaA: 1,
      stepDeltaB: dB,
      targetStep: count,
      columns,
      summaryAr:
        'القاعدة: في كل خطوة نضيف +' +
        dB +
        ' (أو نضرب رقم الخطوة × ' +
        dB +
        ')؛ عند الخطوة ' +
        count +
        ' نصل إلى القيمة ' +
        count * dB +
        '.'
    };
  }

  function buildClientVisualSpec(queryText, ctx, overrideKind) {
    const combined = normArDigits(
      (queryText || '') + ' ' + (ctx?.numbersInvolved || '') + ' ' + (ctx?.questionPrompt || '') + ' ' + (ctx?.slideBody || '')
    );
    const qNorm = normArDigits(queryText || '');
    const qNums = extractNumbersFromStr(qNorm);
    const allNums = extractNumbersFromStr(combined);

    let kind = overrideKind;
    if (!kind) {
      if (
        /سالب|تحت الصفر|فوق الصفر|ميزان الحرار|خط الأعداد|معاكس|درجة حرارة|عمق/.test(qNorm) ||
        qNums.some(n => n < 0 && n >= -50)
      ) {
        kind = 'number_line';
      } else if (/جدول|نمط|يدخر|يدّخر|أسابيع|أسبوع|باقة|أنشئ جدول/.test(qNorm)) {
        kind = 'pattern_table';
      } else if (
        /جمع|طرح|استلاف|نستلف|إعادة التجميع|اعادة التجميع|عمودي/.test(qNorm) ||
        /\d[\d,]*\s*[+−-]\s*\d[\d,]*/.test(qNorm)
      ) {
        kind = 'vertical_ops';
      } else if (/قارن|مقارنة|أكبر|أصغر|أيهما|ترتيب|[><=]/.test(qNorm)) {
        kind = 'comparison';
      } else if (/منزلة|قيمة منزلية|دورة|دورات|تحليلية|لفظية|قياسية|أصفار|ملايين/.test(qNorm)) {
        kind = 'place_value';
      } else {
        const l = Number(ctx?.lesson) || 1;
        kind =
          l === 2
            ? 'comparison'
            : l === 3
              ? 'vertical_ops'
              : l === 4
                ? 'number_line'
                : l === 5
                  ? 'pattern_table'
                  : 'place_value';
      }
    }

    if (kind === 'comparison') {
      const big = (qNums.filter(n => n >= 10).length >= 2 ? qNums : allNums).filter(n => n >= 10);
      const a = big[0] ?? 3759120;
      const b = big[1] ?? (a === 3456210 ? 3759120 : 3456210);
      return {
        kind: 'comparison',
        title: 'المُصوِّر البصري: ميزان مقارنة المنازل',
        lesson: 2,
        comparison: computeComparisonData(a, b)
      };
    }
    if (kind === 'vertical_ops') {
      const big = (qNums.filter(n => n >= 10).length >= 2 ? qNums : allNums).filter(n => n >= 10);
      const isSub = /طرح|استلاف|نستلف|الفرق|\d\s*[−-]\s*\d/.test(combined);
      const op = isSub ? 'sub' : 'add';
      const a = big[0] ?? (op === 'sub' ? 6000 : 3421664);
      const b = big[1] ?? (op === 'sub' ? 2400 : 1897632);
      return {
        kind: 'vertical_ops',
        title: op === 'sub' ? 'المُصوِّر البصري: الطرح العمودي والاستلاف' : 'المُصوِّر البصري: الجمع العمودي وإعادة التجميع',
        lesson: 3,
        verticalOps: computeVerticalOpsData(a, b, op)
      };
    }
    if (kind === 'number_line') {
      const signed =
        qNums.find(n => n < 0 && n >= -20) ??
        allNums.find(n => n < 0 && n >= -20) ??
        qNums.find(n => Math.abs(n) <= 20 && n !== 0) ??
        -4;
      return {
        kind: 'number_line',
        title: 'المُصوِّر البصري: خط الأعداد والميزان الحراري',
        lesson: 4,
        numberLine: computeNumberLineData(signed)
      };
    }
    if (kind === 'pattern_table') {
      const small = (qNums.length ? qNums : allNums).filter(n => n >= 2 && n <= 20);
      return {
        kind: 'pattern_table',
        title: 'المُصوِّر البصري: جدول النمط والتمثيل البياني',
        lesson: 5,
        patternTable: computePatternTableData(small[0] || 4, 6)
      };
    }
    const target = qNums.find(n => n >= 100) ?? allNums.find(n => n >= 100) ?? 2540310;
    return {
      kind: 'place_value',
      title: 'المُصوِّر البصري: لوحة المنازل والتمثيل البياني',
      lesson: 1,
      placeValue: computePlaceValueData(target)
    };
  }

  function createInteractiveVisualCard(initialSpec, ctx) {
    const card = document.createElement('section');
    card.className = 'ai-visual-card';
    card.setAttribute('aria-label', 'مكوّن بصري تفاعلي لتوضيح المفهوم الرياضي');

    let currentKind = (initialSpec && initialSpec.kind) || 'place_value';
    let pvData =
      (initialSpec && initialSpec.placeValue) ||
      computePlaceValueData(2540310);
    let cmpData =
      (initialSpec && initialSpec.comparison) ||
      computeComparisonData(3759120, 3456210);
    let cmpScanIdx = cmpData.decisiveIndexFromLeft;
    let opsData =
      (initialSpec && initialSpec.verticalOps) ||
      computeVerticalOpsData(6000, 2400, 'sub');
    let opsActiveCol = 0;
    let nlData =
      (initialSpec && initialSpec.numberLine) ||
      computeNumberLineData(-4);
    let tblData =
      (initialSpec && initialSpec.patternTable) ||
      computePatternTableData(4, 6);
    let tblActiveIdx = tblData.columns.length - 1;

    const MODES = [
      { id: 'place_value', label: 'المنازل' },
      { id: 'comparison', label: 'المقارنة' },
      { id: 'vertical_ops', label: 'الجمع والطرح' },
      { id: 'number_line', label: 'خط الأعداد' },
      { id: 'pattern_table', label: 'جدول النمط' }
    ];

    function renderCardContents() {
      card.replaceChildren();
      card.dataset.diagramKind = currentKind;

      // 1. Header + Interactive Mode Switcher
      const head = document.createElement('div');
      head.className = 'ai-vis-head';

      const titleRow = document.createElement('div');
      titleRow.className = 'ai-vis-title-row';
      const titleEl = document.createElement('strong');
      titleEl.className = 'ai-vis-title';
      titleEl.textContent =
        currentKind === 'comparison'
          ? 'ميزان مقارنة المنازل التفاعلي'
          : currentKind === 'vertical_ops'
            ? opsData.op === 'sub'
              ? 'مخطط الطرح العمودي والاستلاف'
              : 'مخطط الجمع العمودي وإعادة التجميع'
            : currentKind === 'number_line'
              ? 'خط الأعداد السالبة والموجبة والميزان'
              : currentKind === 'pattern_table'
                ? 'مخطط جدول النمط ونمو الأعمدة'
                : 'لوحة المنازل والتمثيل البياني للأعمدة';

      const subtitleEl = document.createElement('span');
      subtitleEl.className = 'ai-vis-subtitle';
      subtitleEl.textContent = 'تفاعل مع الأرقام والأعمدة بالضغط المباشر';
      titleRow.append(titleEl, subtitleEl);

      const tabsBar = document.createElement('div');
      tabsBar.className = 'ai-vis-tabs';
      tabsBar.setAttribute('role', 'tablist');
      tabsBar.setAttribute('aria-label', 'أنماط الرسم البياني التوضيحي');

      MODES.forEach(m => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ai-vis-tab' + (currentKind === m.id ? ' is-active active' : '');
        b.dataset.switchKind = m.id;
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(currentKind === m.id));
        b.textContent = m.label;
        b.addEventListener('click', () => {
          currentKind = m.id;
          renderCardContents();
        });
        tabsBar.append(b);
      });

      head.append(titleRow, tabsBar);
      card.append(head);

      // 2. Stage Body per Diagram Mode
      const stage = document.createElement('div');
      stage.className = 'ai-vis-stage';

      if (currentKind === 'place_value') {
        // Controls bar: input + update + increment focused digit
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'ai-vis-controls';
        const numInput = document.createElement('input');
        numInput.type = 'text';
        numInput.inputMode = 'numeric';
        numInput.maxLength = 9;
        numInput.dir = 'ltr';
        numInput.className = 'ai-vis-input';
        numInput.value = String(pvData.targetNumber);
        numInput.setAttribute('aria-label', 'العدد المراد تمثيله في لوحة المنازل');

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'ai-vis-btn primary';
        applyBtn.textContent = 'تمثيل العدد';
        applyBtn.addEventListener('click', () => {
          const cleaned = Number(normArDigits(numInput.value).replace(/\D/g, ''));
          if (cleaned >= 10) {
            pvData = computePlaceValueData(cleaned, 0);
            renderCardContents();
          }
        });

        const incDigitBtn = document.createElement('button');
        incDigitBtn.type = 'button';
        incDigitBtn.className = 'ai-vis-btn';
        incDigitBtn.textContent = '+1 للرقم المحدد';
        incDigitBtn.addEventListener('click', () => {
          const chars = String(pvData.targetNumber).split('');
          const idx = pvData.focusIndexFromLeft;
          if (chars[idx] !== undefined) {
            chars[idx] = String((Number(chars[idx]) + 1) % 10);
            if (idx === 0 && chars[0] === '0') chars[0] = '1';
            pvData = computePlaceValueData(Number(chars.join('')), idx);
            renderCardContents();
          }
        });

        ctrlRow.append(numInput, applyBtn, incDigitBtn);
        stage.append(ctrlRow);

        // SVG Proportional Bar Chart of Place Values
        const cells = pvData.cells;
        const svgW = 340;
        const svgH = 104;
        const padX = 18;
        const slotW = Math.floor((svgW - padX * 2) / Math.max(1, cells.length));
        let barsSvg = '';
        cells.forEach((c, idx) => {
          const x = padX + idx * slotW + 3;
          const bw = Math.max(14, slotW - 6);
          const bh = Math.round((c.barHeightPct / 100) * 62);
          const y = 76 - bh;
          const isFocus = idx === pvData.focusIndexFromLeft;
          const fill = isFocus
            ? '#d97706'
            : c.periodKey === 'millions'
              ? '#0f5143'
              : c.periodKey === 'thousands'
                ? '#0284c7'
                : '#4d7c0f';
          barsSvg +=
            '<g class="ai-vis-svg-bar" data-idx="' +
            idx +
            '" style="cursor:pointer">' +
            '<rect x="' +
            x +
            '" y="' +
            y +
            '" width="' +
            bw +
            '" height="' +
            bh +
            '" rx="4" fill="' +
            fill +
            '" opacity="' +
            (isFocus ? '1' : '0.78') +
            '" stroke="' +
            (isFocus ? '#78350f' : 'none') +
            '" stroke-width="2"/>' +
            '<text x="' +
            (x + bw / 2) +
            '" y="' +
            (y - 4) +
            '" text-anchor="middle" font-size="11" font-weight="800" fill="#13382e">' +
            c.digit +
            '</text>' +
            '<text x="' +
            (x + bw / 2) +
            '" y="93" text-anchor="middle" font-size="8.5" font-weight="700" fill="#435a52">' +
            c.placeName.split(' ')[0] +
            '</text>' +
            '</g>';
        });

        const svgWrap = document.createElement('div');
        svgWrap.className = 'ai-vis-svg-wrap';
        svgWrap.innerHTML =
          '<svg viewBox="0 0 ' +
          svgW +
          ' ' +
          svgH +
          '" class="ai-vis-svg" role="img" aria-label="رسم بياني لأعمدة القيم المنزلية">' +
          '<line x1="12" y1="76" x2="' +
          (svgW - 12) +
          '" y2="76" stroke="#cbd5e1" stroke-width="1.5"/>' +
          barsSvg +
          '</svg>';

        svgWrap.querySelectorAll('.ai-vis-svg-bar').forEach(g => {
          g.addEventListener('click', () => {
            const idx = Number(g.getAttribute('data-idx'));
            pvData = computePlaceValueData(pvData.targetNumber, idx);
            renderCardContents();
          });
        });
        stage.append(svgWrap);

        // Interactive Digit Cells Row (LTR for mathematical place alignment)
        const digitsGrid = document.createElement('div');
        digitsGrid.className = 'ai-vis-pv-grid';
        digitsGrid.dir = 'ltr';

        cells.forEach((c, idx) => {
          const isFocus = idx === pvData.focusIndexFromLeft;
          const isZeroTrail = idx > pvData.focusIndexFromLeft;
          const cellBtn = document.createElement('button');
          cellBtn.type = 'button';
          cellBtn.className =
            'ai-vis-pv-cell period-' +
            c.periodKey +
            (isFocus ? ' is-focus' : '') +
            (isZeroTrail ? ' is-zero-trail' : '');
          cellBtn.setAttribute(
            'aria-label',
            'الرقم ' + c.digit + ' في منزلة ' + c.placeName + ' وقيمته المنزلية ' + c.placeValue
          );
          cellBtn.innerHTML =
            '<span class="pv-digit">' +
            c.digit +
            '</span>' +
            '<span class="pv-place">' +
            c.placeName +
            '</span>' +
            (isZeroTrail ? '<span class="pv-zero-ghost" aria-hidden="true">← 0</span>' : '');
          cellBtn.addEventListener('click', () => {
            pvData = computePlaceValueData(pvData.targetNumber, idx);
            renderCardContents();
          });
          digitsGrid.append(cellBtn);
        });
        stage.append(digitsGrid);

        const focused = cells[pvData.focusIndexFromLeft] || cells[0];
        const callout = document.createElement('div');
        callout.className = 'ai-vis-callout';
        callout.innerHTML =
          '<div><strong>تحليل المنزلة المحددة:</strong> الرقم <bdi dir="ltr">' +
          focused.digit +
          '</bdi> يقع في <strong>' +
          focused.placeName +
          '</strong> (' +
          focused.periodName +
          ') · القيمة المنزلية: <strong dir="ltr">' +
          focused.placeValue.toLocaleString('en-US') +
          '</strong></div>' +
          '<div class="ai-vis-formula" dir="ltr">' +
          pvData.formattedNumber +
          ' = ' +
          (pvData.expandedTerms.join(' + ') || '0') +
          '</div>';
        stage.append(callout);
      } else if (currentKind === 'comparison') {
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'ai-vis-controls';

        const inA = document.createElement('input');
        inA.type = 'text';
        inA.dir = 'ltr';
        inA.maxLength = 9;
        inA.className = 'ai-vis-input';
        inA.value = String(cmpData.numA);
        inA.setAttribute('aria-label', 'العدد الأول للمقارنة');

        const symBadge = document.createElement('span');
        symBadge.className = 'ai-vis-cmp-sym';
        symBadge.dir = 'ltr';
        symBadge.textContent = cmpData.symbol;

        const inB = document.createElement('input');
        inB.type = 'text';
        inB.dir = 'ltr';
        inB.maxLength = 9;
        inB.className = 'ai-vis-input';
        inB.value = String(cmpData.numB);
        inB.setAttribute('aria-label', 'العدد الثاني للمقارنة');

        const cmpBtn = document.createElement('button');
        cmpBtn.type = 'button';
        cmpBtn.className = 'ai-vis-btn primary';
        cmpBtn.textContent = 'قارن';
        cmpBtn.addEventListener('click', () => {
          const a = Number(normArDigits(inA.value).replace(/\D/g, '')) || 0;
          const b = Number(normArDigits(inB.value).replace(/\D/g, '')) || 0;
          cmpData = computeComparisonData(a, b);
          cmpScanIdx = 0;
          renderCardContents();
        });

        const stepBtn = document.createElement('button');
        stepBtn.type = 'button';
        stepBtn.className = 'ai-vis-btn';
        stepBtn.textContent = 'المنزلة التالية ⬅';
        stepBtn.addEventListener('click', () => {
          cmpScanIdx = (cmpScanIdx + 1) % cmpData.columns.length;
          renderCardContents();
        });

        ctrlRow.append(inA, symBadge, inB, cmpBtn, stepBtn);
        stage.append(ctrlRow);

        // SVG Magnitude Comparison Bars
        const maxVal = Math.max(cmpData.numA, cmpData.numB, 1);
        const wA = Math.max(24, Math.round((cmpData.numA / maxVal) * 210));
        const wB = Math.max(24, Math.round((cmpData.numB / maxVal) * 210));
        const svgWrap = document.createElement('div');
        svgWrap.className = 'ai-vis-svg-wrap';
        svgWrap.innerHTML =
          '<svg viewBox="0 0 340 66" class="ai-vis-svg" role="img" aria-label="مخطط مقارنة حجم العددين">' +
          '<text x="330" y="23" text-anchor="end" font-size="10" font-weight="700" fill="#13382e">العدد (أ): ' +
          cmpData.lenA +
          ' منازل</text>' +
          '<rect x="12" y="12" width="' +
          wA +
          '" height="15" rx="4" fill="#0f5143"/>' +
          '<text x="330" y="51" text-anchor="end" font-size="10" font-weight="700" fill="#0284c7">العدد (ب): ' +
          cmpData.lenB +
          ' منازل</text>' +
          '<rect x="12" y="40" width="' +
          wB +
          '" height="15" rx="4" fill="#0284c7"/>' +
          '</svg>';
        stage.append(svgWrap);

        // Aligned Place-by-Place Comparison Grid
        const cmpGrid = document.createElement('div');
        cmpGrid.className = 'ai-vis-cmp-grid';
        cmpGrid.dir = 'ltr';
        cmpData.columns.forEach((col, idx) => {
          const isDecisive = idx === cmpData.decisiveIndexFromLeft && cmpData.symbol !== '=';
          const isScanned = idx === cmpScanIdx;
          const colEl = document.createElement('button');
          colEl.type = 'button';
          colEl.className =
            'ai-vis-cmp-col' +
            (isDecisive ? ' is-decisive' : '') +
            (isScanned ? ' is-scanned' : '');
          colEl.innerHTML =
            '<span class="cmp-col-place">' +
            col.placeName.split(' ')[0] +
            '</span>' +
            '<span class="cmp-col-a">' +
            col.digitA +
            '</span>' +
            '<span class="cmp-col-rel">' +
            (col.digitA > col.digitB ? '>' : col.digitA < col.digitB ? '<' : '=') +
            '</span>' +
            '<span class="cmp-col-b">' +
            col.digitB +
            '</span>';
          colEl.addEventListener('click', () => {
            cmpScanIdx = idx;
            renderCardContents();
          });
          cmpGrid.append(colEl);
        });
        stage.append(cmpGrid);

        const activeCol = cmpData.columns[cmpScanIdx] || cmpData.columns[0];
        const callout = document.createElement('div');
        callout.className = 'ai-vis-callout';
        callout.textContent =
          cmpData.summaryAr +
          (activeCol
            ? ' [المنزلة المفحوصة: ' +
              activeCol.placeName +
              ' ← ' +
              activeCol.digitA +
              ' مقابل ' +
              activeCol.digitB +
              ']'
            : '');
        stage.append(callout);
      } else if (currentKind === 'vertical_ops') {
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'ai-vis-controls';

        const inA = document.createElement('input');
        inA.type = 'text';
        inA.dir = 'ltr';
        inA.maxLength = 8;
        inA.className = 'ai-vis-input';
        inA.value = String(opsData.numA);
        inA.setAttribute('aria-label', 'العدد الأول في العملية العمودية');

        const opToggle = document.createElement('button');
        opToggle.type = 'button';
        opToggle.className = 'ai-vis-btn';
        opToggle.textContent = opsData.op === 'add' ? '+ جمع' : '− طرح';
        opToggle.addEventListener('click', () => {
          const nextOp = opsData.op === 'add' ? 'sub' : 'add';
          opsData = computeVerticalOpsData(opsData.numA, opsData.numB, nextOp);
          opsActiveCol = 0;
          renderCardContents();
        });

        const inB = document.createElement('input');
        inB.type = 'text';
        inB.dir = 'ltr';
        inB.maxLength = 8;
        inB.className = 'ai-vis-input';
        inB.value = String(opsData.numB);
        inB.setAttribute('aria-label', 'العدد الثاني في العملية العمودية');

        const calcBtn = document.createElement('button');
        calcBtn.type = 'button';
        calcBtn.className = 'ai-vis-btn primary';
        calcBtn.textContent = 'احسب';
        calcBtn.addEventListener('click', () => {
          const a = Number(normArDigits(inA.value).replace(/\D/g, '')) || 0;
          const b = Number(normArDigits(inB.value).replace(/\D/g, '')) || 0;
          opsData = computeVerticalOpsData(a, b, opsData.op);
          opsActiveCol = 0;
          renderCardContents();
        });

        const nextStepBtn = document.createElement('button');
        nextStepBtn.type = 'button';
        nextStepBtn.className = 'ai-vis-btn';
        nextStepBtn.textContent = 'العمود التالي من الآحاد';
        nextStepBtn.addEventListener('click', () => {
          opsActiveCol = (opsActiveCol + 1) % opsData.columns.length;
          renderCardContents();
        });

        ctrlRow.append(inA, opToggle, inB, calcBtn, nextStepBtn);
        stage.append(ctrlRow);

        // Render Vertical Columns (LTR left-to-right display, indexed from right)
        const opsGrid = document.createElement('div');
        opsGrid.className = 'ai-vis-ops-grid';
        opsGrid.dir = 'ltr';

        const colsReversed = opsData.columns.slice().reverse();
        colsReversed.forEach(col => {
          const isCurrent = col.indexFromRight === opsActiveCol;
          const hasCarryOrBorrow = col.carryIn > 0 || col.borrowed || col.effectiveTop !== col.rawTop;
          const colBtn = document.createElement('button');
          colBtn.type = 'button';
          colBtn.className =
            'ai-vis-ops-col' +
            (isCurrent ? ' is-current' : '') +
            (hasCarryOrBorrow ? ' has-regroup' : '');
          const badgeText =
            opsData.op === 'add'
              ? col.carryIn > 0
                ? '+' + col.carryIn
                : ''
              : col.effectiveTop !== col.rawTop
                ? String(col.effectiveTop)
                : '';
          colBtn.innerHTML =
            '<span class="ops-col-place">' +
            col.placeName.split(' ')[0] +
            '</span>' +
            '<span class="ops-col-carry">' +
            (badgeText || '·') +
            '</span>' +
            '<span class="ops-col-top' +
            (opsData.op === 'sub' && col.effectiveTop !== col.rawTop ? ' is-crossed' : '') +
            '">' +
            col.rawTop +
            '</span>' +
            '<span class="ops-col-bot">' +
            (col.indexFromRight === opsData.columns.length - 1 ? (opsData.op === 'add' ? '+ ' : '− ') : '') +
            col.rawBottom +
            '</span>' +
            '<span class="ops-col-res">' +
            col.resultDigit +
            '</span>';
          colBtn.addEventListener('click', () => {
            opsActiveCol = col.indexFromRight;
            renderCardContents();
          });
          opsGrid.append(colBtn);
        });
        stage.append(opsGrid);

        const activeColSpec =
          opsData.columns.find(c => c.indexFromRight === opsActiveCol) || opsData.columns[0];
        const callout = document.createElement('div');
        callout.className = 'ai-vis-callout';
        callout.textContent =
          (activeColSpec ? activeColSpec.noteAr + ' — ' : '') + 'الناتج النهائي: ' + opsData.summaryAr;
        stage.append(callout);
      } else if (currentKind === 'number_line') {
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'ai-vis-controls';

        const sliderLabel = document.createElement('label');
        sliderLabel.className = 'ai-vis-slider-lbl';
        sliderLabel.innerHTML =
          'القيمة المختارة: <strong dir="ltr">' +
          (nlData.value > 0 ? '+' + nlData.value : nlData.value) +
          '</strong> (' +
          nlData.contextLabelAr +
          ')';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '-10';
        slider.max = '10';
        slider.step = '1';
        slider.value = String(nlData.value);
        slider.className = 'ai-vis-slider';
        slider.setAttribute('aria-label', 'تغيير العدد على خط الأعداد السالبة والموجبة');
        slider.addEventListener('input', () => {
          nlData = computeNumberLineData(Number(slider.value));
          renderCardContents();
        });

        const oppBtn = document.createElement('button');
        oppBtn.type = 'button';
        oppBtn.className = 'ai-vis-btn primary';
        oppBtn.textContent = 'اعكس الإشارة (المعاكس)';
        oppBtn.addEventListener('click', () => {
          nlData = computeNumberLineData(-nlData.value);
          renderCardContents();
        });

        const zeroBtn = document.createElement('button');
        zeroBtn.type = 'button';
        zeroBtn.className = 'ai-vis-btn';
        zeroBtn.textContent = 'الصفر المرجعي (0)';
        zeroBtn.addEventListener('click', () => {
          nlData = computeNumberLineData(0);
          renderCardContents();
        });

        ctrlRow.append(sliderLabel, slider, oppBtn, zeroBtn);
        stage.append(ctrlRow);

        // SVG Interactive Number Line (-10 to +10)
        const svgW = 350;
        const svgH = 92;
        const xZero = 175;
        const unitPx = 14.5;
        const xVal = xZero + nlData.value * unitPx;
        const xOpp = xZero + nlData.oppositeValue * unitPx;

        let ticksHtml = '';
        for (let t = -10; t <= 10; t += 2) {
          const tx = xZero + t * unitPx;
          const isZ = t === 0;
          ticksHtml +=
            '<line x1="' +
            tx +
            '" y1="44" x2="' +
            tx +
            '" y2="' +
            (isZ ? '60' : '54') +
            '" stroke="' +
            (isZ ? '#0f5143' : '#94a3b8') +
            '" stroke-width="' +
            (isZ ? '2.5' : '1.4') +
            '"/>' +
            '<text x="' +
            tx +
            '" y="74" text-anchor="middle" font-size="9.5" font-weight="700" fill="' +
            (t < 0 ? '#dc2626' : t > 0 ? '#0f5143' : '#1e293b') +
            '">' +
            (t > 0 ? '+' + t : t) +
            '</text>';
        }

        const arcHtml =
          nlData.value !== 0
            ? '<path d="M ' +
              Math.min(xVal, xZero) +
              ' 46 Q ' +
              (xVal + xZero) / 2 +
              ' 16 ' +
              Math.max(xVal, xZero) +
              ' 46" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="3 2"/>' +
              '<circle cx="' +
              xOpp +
              '" cy="48" r="5.5" fill="#fff" stroke="#64748b" stroke-width="2"/>'
            : '';

        const svgWrap = document.createElement('div');
        svgWrap.className = 'ai-vis-svg-wrap';
        svgWrap.innerHTML =
          '<svg viewBox="0 0 ' +
          svgW +
          ' ' +
          svgH +
          '" class="ai-vis-svg" role="img" aria-label="خط الأعداد التفاعلي من سالب 10 إلى موجب 10">' +
          '<line x1="16" y1="48" x2="334" y2="48" stroke="#475569" stroke-width="2.2"/>' +
          ticksHtml +
          arcHtml +
          '<circle cx="' +
          xVal +
          '" cy="48" r="7.5" fill="' +
          (nlData.value < 0 ? '#dc2626' : nlData.value > 0 ? '#0f5143' : '#d97706') +
          '" stroke="#fff" stroke-width="2"/>' +
          '<text x="' +
          xVal +
          '" y="22" text-anchor="middle" font-size="11" font-weight="800" fill="#13382e">' +
          (nlData.value > 0 ? '+' + nlData.value : nlData.value) +
          '</text>' +
          '</svg>';
        stage.append(svgWrap);

        const callout = document.createElement('div');
        callout.className = 'ai-vis-callout';
        callout.textContent = nlData.summaryAr;
        stage.append(callout);
      } else if (currentKind === 'pattern_table') {
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'ai-vis-controls';

        [3, 4, 5, 7].forEach(ruleVal => {
          const rBtn = document.createElement('button');
          rBtn.type = 'button';
          rBtn.className = 'ai-vis-btn' + (tblData.stepDeltaB === ruleVal ? ' primary' : '');
          rBtn.textContent = 'النمط: ×' + ruleVal;
          rBtn.addEventListener('click', () => {
            tblData = computePatternTableData(ruleVal, tblData.columns.length);
            tblActiveIdx = tblData.columns.length - 1;
            renderCardContents();
          });
          ctrlRow.append(rBtn);
        });

        const addColBtn = document.createElement('button');
        addColBtn.type = 'button';
        addColBtn.className = 'ai-vis-btn';
        addColBtn.textContent = '+ خطوة جديدة';
        addColBtn.addEventListener('click', () => {
          const nextCount = tblData.columns.length >= 8 ? 4 : tblData.columns.length + 1;
          tblData = computePatternTableData(tblData.stepDeltaB, nextCount);
          tblActiveIdx = tblData.columns.length - 1;
          renderCardContents();
        });
        ctrlRow.append(addColBtn);
        stage.append(ctrlRow);

        // SVG Growth Bar Chart
        const cols = tblData.columns;
        const maxB = Math.max(...cols.map(c => c.rowB), 1);
        const svgW = 340;
        const svgH = 92;
        const slotW = Math.floor((svgW - 36) / cols.length);
        let barsSvg = '';
        cols.forEach((c, idx) => {
          const x = 18 + idx * slotW + 4;
          const bw = Math.max(16, slotW - 8);
          const bh = Math.max(10, Math.round((c.rowB / maxB) * 56));
          const y = 72 - bh;
          const isSelected = idx === tblActiveIdx;
          barsSvg +=
            '<g class="ai-vis-tbl-bar" data-idx="' +
            idx +
            '" style="cursor:pointer">' +
            '<rect x="' +
            x +
            '" y="' +
            y +
            '" width="' +
            bw +
            '" height="' +
            bh +
            '" rx="4" fill="' +
            (isSelected ? '#d97706' : '#0f5143') +
            '"/>' +
            '<text x="' +
            (x + bw / 2) +
            '" y="' +
            (y - 4) +
            '" text-anchor="middle" font-size="10" font-weight="800" fill="#13382e">' +
            c.rowB +
            '</text>' +
            '<text x="' +
            (x + bw / 2) +
            '" y="86" text-anchor="middle" font-size="9" font-weight="700" fill="#475569">خطوة ' +
            c.rowA +
            '</text>' +
            '</g>';
        });

        const svgWrap = document.createElement('div');
        svgWrap.className = 'ai-vis-svg-wrap';
        svgWrap.innerHTML =
          '<svg viewBox="0 0 ' +
          svgW +
          ' ' +
          svgH +
          '" class="ai-vis-svg" role="img" aria-label="رسم بياني لنمو جدول النمط">' +
          '<line x1="12" y1="72" x2="328" y2="72" stroke="#cbd5e1" stroke-width="1.5"/>' +
          barsSvg +
          '</svg>';
        svgWrap.querySelectorAll('.ai-vis-tbl-bar').forEach(g => {
          g.addEventListener('click', () => {
            tblActiveIdx = Number(g.getAttribute('data-idx'));
            renderCardContents();
          });
        });
        stage.append(svgWrap);

        // Interactive Pattern Table
        const tableGrid = document.createElement('div');
        tableGrid.className = 'ai-vis-tbl-grid';
        cols.forEach((c, idx) => {
          const cellBtn = document.createElement('button');
          cellBtn.type = 'button';
          cellBtn.className = 'ai-vis-tbl-col' + (idx === tblActiveIdx ? ' is-active' : '');
          cellBtn.innerHTML =
            '<span class="tbl-step">#' +
            c.rowA +
            '</span>' +
            '<span class="tbl-rule">×' +
            tblData.stepDeltaB +
            '</span>' +
            '<span class="tbl-val">' +
            c.rowB +
            '</span>';
          cellBtn.addEventListener('click', () => {
            tblActiveIdx = idx;
            renderCardContents();
          });
          tableGrid.append(cellBtn);
        });
        stage.append(tableGrid);

        const activeStep = cols[tblActiveIdx] || cols[cols.length - 1];
        const callout = document.createElement('div');
        callout.className = 'ai-vis-callout';
        callout.textContent =
          tblData.summaryAr +
          ' (العمود المحدد: الخطوة ' +
          activeStep.rowA +
          ' × ' +
          tblData.stepDeltaB +
          ' = ' +
          activeStep.rowB +
          ')';
        stage.append(callout);
      }

      card.append(stage);
    }

    renderCardContents();
    return card;
  }

  function attachVisualDiagramToMessage(msgHandle, spec, ctx, autoExpand) {
    if (!msgHandle || !msgHandle.wrapEl) return;
    const existingWrap = msgHandle.wrapEl.querySelector('.ai-visual-slot');
    if (existingWrap) existingWrap.remove();
    const existingCard = msgHandle.wrapEl.querySelector('.ai-visual-card');
    if (existingCard) existingCard.remove();

    const shouldExpand = autoExpand !== false;
    const slot = document.createElement('div');
    slot.className = 'ai-visual-slot';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'ai-vis-toggle-btn';
    toggleBtn.setAttribute('aria-expanded', String(shouldExpand));

    const updateToggleLabel = isOpen => {
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      toggleBtn.innerHTML =
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 16v-4"/><path d="M12 16V8"/><path d="M16 16v-6"/></svg>' +
        '<span>' +
        (isOpen ? 'إخفاء الرسم التوضيحي التفاعلي' : 'عرض الرسم التوضيحي التفاعلي لهذا المفهوم') +
        '</span>';
    };

    const visualCard = createInteractiveVisualCard(spec, ctx);
    visualCard.hidden = !shouldExpand;
    updateToggleLabel(shouldExpand);

    toggleBtn.addEventListener('click', () => {
      const nextOpen = visualCard.hidden;
      visualCard.hidden = !nextOpen;
      updateToggleLabel(nextOpen);
      if (nextOpen && logEl) {
        setTimeout(() => {
          visualCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 40);
      }
    });

    slot.append(toggleBtn, visualCard);
    if (msgHandle.footerEl && msgHandle.footerEl.parentNode === msgHandle.wrapEl) {
      msgHandle.wrapEl.insertBefore(slot, msgHandle.footerEl);
    } else {
      msgHandle.wrapEl.append(slot);
    }
  }

  function buildClientFallbackQuiz(lessonNum, variant) {
    const l = Number(lessonNum) || 1;
    const idx = Math.abs(Math.trunc(Number(variant) || 0)) % 2;
    if (l === 2) {
      return idx === 0
        ? {
            id: 'local_l2_0_' + Date.now(),
            intro: 'سؤال سريع في مقارنة الأعداد ضمن الملايين:',
            question: 'أي الرموز التالية يجعل العبارة صحيحة: 3,759,120 ؟ 3,456,210',
            options: ['>', '<', '=', '+'],
            correctIndex: 0,
            explanation: 'كلا العددين مكوّن من 7 منازل، وفي منزلة مئات الألوف 7 أكبر من 4؛ لذا 3,759,120 > 3,456,210.'
          }
        : {
            id: 'local_l2_1_' + Date.now(),
            intro: 'تحدٍّ سريع في عدّ المنازل والمقارنة:',
            question: 'أيهما أكبر: العدد 56,109,789 أم العدد 5,678,089؟',
            options: [
              '56,109,789 لأنه مكوّن من 8 منازل',
              '5,678,089 لأن فيه الرقم 8 مرتين',
              'العددان متساويان',
              '5,678,089 لأنه يبدأ بـ 5'
            ],
            correctIndex: 0,
            explanation: '56,109,789 يتكوّن من 8 منازل بينما 5,678,089 يتكوّن من 7 منازل، فالعدد ذو المنازل الأكثر هو الأكبر.'
          };
    }
    if (l === 3) {
      return idx === 0
        ? {
            id: 'local_l3_0_' + Date.now(),
            intro: 'سؤال سريع في جمع الأعداد الكلية وطرحها:',
            question: 'ما ناتج طرح: 6,000 − 2,400؟',
            options: ['3,600', '4,400', '3,400', '8,400'],
            correctIndex: 0,
            explanation: 'نستلف 1 من آحاد الألوف (6 تصبح 5) ومئات العدد الأول تصبح 10: 10 − 4 = 6 في المئات و5 − 2 = 3 في الألوف، فالناتج 3,600.'
          }
        : {
            id: 'local_l3_1_' + Date.now(),
            intro: 'سؤال سريع في الجمع مع إعادة التجميع:',
            question: 'ما ناتج جمع: 3,420,000 + 1,580,000؟',
            options: ['5,000,000', '4,900,000', '4,000,000', '5,100,000'],
            correctIndex: 0,
            explanation: 'نجمع من اليمين مع إعادة التجميع: 420 ألفاً + 580 ألفاً = مليون كامل يُضاف إلى 3 + 1 ملايين فيصبح الناتج 5,000,000.'
          };
    }
    if (l === 4) {
      return idx === 0
        ? {
            id: 'local_l4_0_' + Date.now(),
            intro: 'سؤال سريع في الأعداد السالبة:',
            question: 'إذا كانت درجة الحرارة في الشوبك 3 درجات تحت الصفر، فكيف نكتبها بالرموز؟',
            options: ['-3', '+3', '0', '30'],
            correctIndex: 0,
            explanation: 'عبارة «تحت الصفر» تعني قيمة أقل من الصفر، لذلك نمثّلها بعدد سالب مسبوق بإشارة (-) فيكون -3.'
          }
        : {
            id: 'local_l4_1_' + Date.now(),
            intro: 'سؤال سريع على خط الأعداد:',
            question: 'ما العدد المعاكس للعدد +7 على خط الأعداد؟',
            options: ['-7', '0', '+7', '-1'],
            correctIndex: 0,
            explanation: 'العددان المتعاكسان يبعدان المسافة نفسها (7 وحدات) عن الصفر في اتجاهين متعاكسين، فمعاكس +7 هو -7.'
          };
    }
    if (l === 5) {
      return idx === 0
        ? {
            id: 'local_l5_0_' + Date.now(),
            intro: 'سؤال سريع في خطة حل المسألة (أنشئ جدولاً):',
            question: 'يدّخر مهند 4 دنانير كل أسبوع. باستعمال جدول النمط، كم ديناراً يدّخر في 6 أسابيع؟',
            options: ['24 ديناراً', '10 دنانير', '20 ديناراً', '28 ديناراً'],
            correctIndex: 0,
            explanation: 'بتكرار النمط في الجدول (4، 8، 12، 16، 20، 24) نجد أنه يدّخر 24 ديناراً.'
          }
        : {
            id: 'local_l5_1_' + Date.now(),
            intro: 'سؤال سريع في تنظيم الجداول:',
            question: 'في كل باقة تضع لمياء 3 وردات حمراء مقابل 5 وردات بيضاء. إذا استعملت 9 وردات حمراء، فكم وردة بيضاء استعملت؟',
            options: ['15 وردة بيضاء', '12 وردة بيضاء', '10 وردات بيضاء', '18 وردة بيضاء'],
            correctIndex: 0,
            explanation: 'في الجدول: (3 حمراء ← 5 بيضاء)، (6 حمراء ← 10 بيضاء)، (9 حمراء ← 15 بيضاء) لأن 9 تساوي 3 باقات × 5 = 15.'
          };
    }
    return idx === 0
      ? {
          id: 'local_l1_0_' + Date.now(),
          intro: 'سؤال سريع في القيمة المنزلية ضمن الملايين:',
          question: 'ما القيمة المنزلية للرقم 5 في العدد 2,540,310؟',
          options: ['500,000', '50,000', '5,000,000', '5,000'],
          correctIndex: 0,
          explanation: 'الرقم 5 يقع في منزلة مئات الألوف وعلى يمينه 5 منازل، فقيمته المنزلية هي 500,000.'
        }
      : {
          id: 'local_l1_1_' + Date.now(),
          intro: 'سؤال سريع في الصيغة القياسية:',
          question: 'كيف نكتب العدد «أربعة ملايين وسبعون ألفاً ومئتان» بالصيغة القياسية؟',
          options: ['4,070,200', '4,700,200', '4,070,020', '40,700,200'],
          correctIndex: 0,
          explanation: 'في دورة الملايين 4، وفي دورة الألوف 070 (نحفظ مئات الألوف بصفر)، وفي دورة الآحاد 200، فيكون العدد 4,070,200.'
        };
  }

  async function streamChatFromServer(promptText, ctx, onChunk, onVisual) {
    if (activeChatAbortController) {
      try {
        activeChatAbortController.abort();
      } catch {}
    }
    const controller = new AbortController();
    activeChatAbortController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(resolveAiApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          message: promptText,
          history: chatHistory.slice(-10),
          context: ctx,
          model: selectedModel
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (res.status === 404 || res.status === 405 || contentType.includes('text/html')) {
        const staticErr = new Error('Static host without AI API');
        staticErr.code = 'BACKEND_UNAVAILABLE';
        throw staticErr;
      }

      if (!res.ok) {
        let errData = null;
        try {
          errData = await res.json();
        } catch {}
        const err = new Error((errData && errData.error) || 'HTTP ' + res.status);
        err.code = errData && errData.code;
        throw err;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;
          const ev = JSON.parse(jsonStr);
          if (ev.visual && typeof onVisual === 'function') {
            onVisual(ev.visual);
          }
          if (ev.fallback) {
            return '';
          }
          if (ev.error) {
            const streamErr = new Error(ev.error);
            streamErr.code = ev.code;
            throw streamErr;
          }
          if (ev.delta) {
            accumulated += stripEmojisClean(ev.delta);
            onChunk(accumulated);
          }
        }
      }
      return accumulated;
    } finally {
      clearTimeout(timeoutId);
      if (activeChatAbortController === controller) {
        activeChatAbortController = null;
      }
    }
  }

  function cancelActiveChatStream() {
    if (activeChatAbortController) {
      try {
        activeChatAbortController.abort();
      } catch {}
      activeChatAbortController = null;
    }
    isBusy = false;
    setHeaderRealState('');
    syncComposerState();
  }

  function renderConnectionErrorState(msgHandle, errMessage, retryFn, localFallbackFn) {
    if (!msgHandle || !msgHandle.bodyEl) return;
    msgHandle.wrapEl?.classList.add('is-error');
    msgHandle.bodyEl.replaceChildren();
    msgHandle.bodyEl.dataset.rawText = '';
    if (msgHandle.footerEl) msgHandle.footerEl.hidden = true;

    const errBox = document.createElement('div');
    errBox.className = 'ai-error-box';

    const txt = document.createElement('div');
    txt.textContent = errMessage || 'تعذّر الاتصال بالمعلم الذكي حالياً. تحقّق من الاتصال ثم حاول مجدداً.';

    const acts = document.createElement('div');
    acts.className = 'ai-error-actions';

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'ai-retry-btn';
    retryBtn.textContent = 'إعادة المحاولة';
    retryBtn.addEventListener('click', () => {
      retryFn();
    });
    acts.append(retryBtn);

    if (typeof localFallbackFn === 'function') {
      const fbBtn = document.createElement('button');
      fbBtn.type = 'button';
      fbBtn.className = 'ai-fallback-btn';
      fbBtn.textContent = 'عرض شرح منهجي سريع';
      fbBtn.addEventListener('click', () => {
        localFallbackFn();
      });
      acts.append(fbBtn);
    }

    errBox.append(txt, acts);
    msgHandle.bodyEl.append(errBox);
    notifyNewChatContent(false);
  }

  async function handleUserQuestion(promptText, fallbackKind, displayUserText, fromTypedDraft) {
    const cleanPrompt = String(promptText || '').trim();
    if (!cleanPrompt) return;
    if (isBusy) {
      cancelActiveChatStream();
    }
    if (undoBarEl) undoBarEl.hidden = true;
    if (clearConfirmEl) clearConfirmEl.hidden = true;

    const ctx = extractActiveSlideAndLessonContext();
    updateContextUI();
    const userHandle = appendMessage('user', displayUserText || cleanPrompt);

    isBusy = true;
    setHeaderRealState('يكتب الآن…');
    syncComposerState();

    const msgHandle = appendMessage('assistant', '', null, null, { isTyping: true });
    if (msgHandle && msgHandle.wrapEl) {
      msgHandle.wrapEl.classList.add('is-streaming');
    }
    let firstChunkReceived = false;
    let pendingVisualSpec = null;

    const wantsImmediateVisual =
      fallbackKind === 'visualize' ||
      /رسم|مخطط|بياني|صوّر|صور لي|تمثيل بصري|جدول النمط|ميزان المقارنة|خط الأعداد/.test(cleanPrompt);

    const onVisual = visualSpec => {
      pendingVisualSpec = visualSpec;
    };

    const onChunk = fullText => {
      firstChunkReceived = true;
      if (msgHandle && msgHandle.bodyEl) {
        setFormattedBodyText(msgHandle.bodyEl, fullText);
      }
      if (msgHandle && msgHandle.footerEl) {
        msgHandle.footerEl.hidden = false;
      }
      notifyNewChatContent(false);
    };

    const applyLocalExplanation = () => {
      msgHandle?.wrapEl?.classList.remove('is-error');
      const localReply = buildSlideAwareFallback(fallbackKind || 'chat', cleanPrompt, ctx);
      if (msgHandle && msgHandle.bodyEl) setFormattedBodyText(msgHandle.bodyEl, localReply);
      if (msgHandle && msgHandle.footerEl) msgHandle.footerEl.hidden = false;
      const resolvedVisual = pendingVisualSpec || buildClientVisualSpec(cleanPrompt, ctx);
      if (fallbackKind !== 'hint') {
        attachVisualDiagramToMessage(msgHandle, resolvedVisual, ctx, wantsImmediateVisual);
      }
      chatHistory.push({ role: 'user', text: cleanPrompt }, { role: 'model', text: localReply });
      if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);
      notifyNewChatContent(false);
      return localReply;
    };

    if (staticTutorMode || !backendAvailable) {
      try {
        applyLocalExplanation();
      } finally {
        if (msgHandle && msgHandle.wrapEl) {
          msgHandle.wrapEl.classList.remove('is-streaming');
        }
        isBusy = false;
        if (!liveActive) setHeaderRealState('');
        syncComposerState();
      }
      return;
    }

    try {
      const finalReply = await streamChatFromServer(cleanPrompt, ctx, onChunk, onVisual);
      const replyText = finalReply.trim() || buildSlideAwareFallback(fallbackKind || 'chat', cleanPrompt, ctx);
      if (msgHandle && msgHandle.bodyEl) setFormattedBodyText(msgHandle.bodyEl, replyText);
      if (msgHandle && msgHandle.footerEl) msgHandle.footerEl.hidden = false;
      const resolvedVisual = pendingVisualSpec || buildClientVisualSpec(cleanPrompt, ctx);
      if (fallbackKind !== 'hint') {
        attachVisualDiagramToMessage(msgHandle, resolvedVisual, ctx, wantsImmediateVisual);
      }
      notifyNewChatContent(false);
      chatHistory.push({ role: 'user', text: cleanPrompt }, { role: 'model', text: replyText });
      if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);
      backendAvailable = true;
      staticTutorMode = false;
      serverConfigured = true;
      updateContextUI();
    } catch (err) {
      if (err && err.name === 'AbortError') {
        if (msgHandle && msgHandle.rowEl && !firstChunkReceived) {
          msgHandle.rowEl.remove();
        }
        return;
      }
      const isNetworkFailureOnUnverifiedBackend =
        (!backendAvailable || !healthChecked || isStaticHostingEnv()) &&
        (err instanceof TypeError || (err && err.code === 'BACKEND_UNAVAILABLE'));
      if (isNetworkFailureOnUnverifiedBackend || (err && err.code === 'BACKEND_UNAVAILABLE')) {
        backendAvailable = false;
        staticTutorMode = true;
        serverConfigured = false;
        healthChecked = true;
        updateContextUI();
        applyLocalExplanation();
        return;
      }
      if (err && err.code === 'MISSING_API_KEY') {
        serverConfigured = false;
        updateContextUI();
      }
      if (!firstChunkReceived) {
        // الحفاظ على المسودة عند فشل إرسال سؤال كتبه الطالب
        if (fromTypedDraft && inputEl && !inputEl.value.trim()) {
          inputEl.value = fromTypedDraft;
          syncComposerState();
        }
        const friendlyErr =
          err && err.code === 'RATE_LIMIT'
            ? 'الخدمة مشغولة حالياً بكثرة الطلبات. يمكنك إعادة المحاولة بعد لحظات.'
            : 'تعذّر الاتصال بخدمة المعلم الذكي حالياً. مسودتك محفوظة ويمكنك إعادة المحاولة.';
        renderConnectionErrorState(
          msgHandle,
          friendlyErr,
          () => {
            if (userHandle && userHandle.rowEl) userHandle.rowEl.remove();
            if (msgHandle && msgHandle.rowEl) msgHandle.rowEl.remove();
            if (fromTypedDraft && inputEl && inputEl.value.trim() === fromTypedDraft) {
              inputEl.value = '';
              syncComposerState();
            }
            handleUserQuestion(cleanPrompt, fallbackKind, displayUserText, fromTypedDraft);
          },
          applyLocalExplanation
        );
      }
    } finally {
      if (msgHandle && msgHandle.wrapEl) {
        msgHandle.wrapEl.classList.remove('is-streaming');
      }
      isBusy = false;
      if (!liveActive) setHeaderRealState('');
      syncComposerState();
    }
  }

  async function handleVisualDiagramRequest(customQuery) {
    if (isBusy) {
      cancelActiveChatStream();
    }
    if (undoBarEl) undoBarEl.hidden = true;
    const ctx = extractActiveSlideAndLessonContext();
    updateContextUI();
    const qText = String(customQuery || inputEl?.value || '').trim();
    if (inputEl && customQuery === undefined && qText) {
      inputEl.value = '';
      syncComposerState();
    }
    const labelText = qText ? 'رسم توضيحي لـ: ' + qText : 'اعرض رسماً توضيحياً لهذا الدرس';
    appendMessage('user', labelText);

    let spec = buildClientVisualSpec(qText, ctx);
    if (backendAvailable && !staticTutorMode) {
      try {
        const res = await fetch(resolveAiApiUrl('/api/ai/visualize'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: qText, context: ctx })
        });
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.visual) spec = data.visual;
        }
      } catch {}
    }

    const introText =
      (spec.placeValue && spec.placeValue.summaryAr) ||
      (spec.comparison && spec.comparison.summaryAr) ||
      (spec.verticalOps && spec.verticalOps.summaryAr) ||
      (spec.numberLine && spec.numberLine.summaryAr) ||
      (spec.patternTable && spec.patternTable.summaryAr) ||
      'إليك الرسم التوضيحي التفاعلي؛ اضغط على الخانات أو غيّر الأرقام لاستكشاف المفهوم:';

    const msgHandle = appendMessage('assistant', introText);
    attachVisualDiagramToMessage(msgHandle, spec, ctx, true);
    notifyNewChatContent(false);
  }

  async function handleCustomQuizRequest() {
    if (isBusy) {
      cancelActiveChatStream();
    }
    if (undoBarEl) undoBarEl.hidden = true;
    if (typeof ensureAiQuizDay === 'function') ensureAiQuizDay();
    const ctx = extractActiveSlideAndLessonContext();
    updateContextUI();

    appendMessage('user', 'اختبر فهمي بسؤال سريع');
    const currentVariant = quizVariantCounter++;

    if (staticTutorMode || !backendAvailable) {
      const fallbackQuiz = buildClientFallbackQuiz(ctx.lesson, currentVariant);
      appendMessage('assistant', fallbackQuiz.intro, fallbackQuiz);
      notifyNewChatContent(false);
      return;
    }

    isBusy = true;
    setHeaderRealState('يكتب الآن…');
    syncComposerState();

    const loadingHandle = appendMessage('assistant', '', null, null, { isTyping: true });

    try {
      const res = await fetch(resolveAiApiUrl('/api/ai/quiz'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: ctx,
          model: selectedModel,
          variant: currentVariant
        })
      });
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!res.ok || !contentType.includes('application/json')) {
        if (res.status === 404 || contentType.includes('text/html')) {
          backendAvailable = false;
          staticTutorMode = true;
          serverConfigured = false;
          updateContextUI();
        }
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      if (!data || !data.quiz) {
        throw new Error((data && data.error) || 'Empty quiz payload');
      }
      if (loadingHandle && loadingHandle.rowEl) loadingHandle.rowEl.remove();
      appendMessage('assistant', data.quiz.intro || 'سؤال تدريبي مخصص:', data.quiz);
    } catch {
      if (loadingHandle && loadingHandle.rowEl) loadingHandle.rowEl.remove();
      const fallbackQuiz = buildClientFallbackQuiz(ctx.lesson, currentVariant);
      appendMessage('assistant', fallbackQuiz.intro, fallbackQuiz);
    } finally {
      isBusy = false;
      if (!liveActive) setHeaderRealState('');
      syncComposerState();
    }
  }

  /* =====================================================================
     المحادثة الصوتية المباشرة عبر Gemini Live API (gemini-3.8-live /ws/live)
     ===================================================================== */
  let liveWs = null;
  let liveInputCtx = null;
  let liveOutputCtx = null;
  let liveMicStream = null;
  let liveProcessor = null;
  let liveSilentGain = null;
  let liveNextStartTime = 0;
  let liveReady = false;
  let liveActive = false;
  let liveBrowserMode = false;
  let liveRecognition = null;
  let liveBrowserToken = 0;
  const liveActiveSources = new Set();
  let liveUserTranscriptHandle = null;
  let liveModelTranscriptHandle = null;

  function float32ToPcm16Base64(float32Array, sourceSampleRate) {
    let samples = float32Array;
    const rate = Number(sourceSampleRate) || 16000;
    if (rate !== 16000 && float32Array.length > 0) {
      const ratio = rate / 16000;
      const newLength = Math.max(1, Math.round(float32Array.length / ratio));
      const resampled = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const srcIdx = Math.min(float32Array.length - 1, Math.floor(i * ratio));
        resampled[i] = float32Array[srcIdx];
      }
      samples = resampled;
    }

    const pcm16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function schedulePcm24kChunk(base64Data) {
    if (!liveOutputCtx) return;
    if (liveOutputCtx.state === 'suspended') {
      liveOutputCtx.resume().catch(() => {});
    }
    const binary = atob(base64Data);
    const byteLen = binary.length - (binary.length % 2);
    if (byteLen <= 0) return;

    const bytes = new Uint8Array(byteLen);
    for (let i = 0; i < byteLen; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    const audioBuffer = liveOutputCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const src = liveOutputCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(liveOutputCtx.destination);

    liveNextStartTime = Math.max(liveOutputCtx.currentTime, liveNextStartTime);
    src.start(liveNextStartTime);
    liveNextStartTime += audioBuffer.duration;

    liveActiveSources.add(src);
    setLiveUiState('speaking', 'يشرح لك الآن — يمكنك مقاطعته بالسؤال');
    src.onended = () => {
      liveActiveSources.delete(src);
      if (liveActive && liveActiveSources.size === 0) {
        setLiveUiState(
          'listening',
          liveMicStream
            ? 'تحدّث الآن واسأل عن أي خطوة في الدرس'
            : 'متصل بالصوت — يمكنك كتابة سؤالك ليجيبك المعلم صوتياً'
        );
      }
    };
  }

  function clearLivePlaybackQueue() {
    liveActiveSources.forEach(src => {
      try {
        src.stop();
      } catch {}
    });
    liveActiveSources.clear();
    if (liveOutputCtx) {
      liveNextStartTime = liveOutputCtx.currentTime;
    } else {
      liveNextStartTime = 0;
    }
  }

  function setLiveUiState(stateName, statusMsg) {
    const isRunning = stateName === 'connecting' || stateName === 'listening' || stateName === 'speaking';
    const isError = stateName === 'error';

    if (liveBar) {
      liveBar.dataset.liveState = stateName;
      liveBar.hidden = !(isRunning || isError);
    }

    const titlesByState = {
      connecting: 'جارٍ الاتصال',
      listening: 'أستمع إليك',
      speaking: 'المعلم يتحدث',
      error: 'تعذّر تشغيل المحادثة الصوتية'
    };

    if (liveTitleEl && titlesByState[stateName]) {
      liveTitleEl.textContent = titlesByState[stateName];
    }
    if (liveStatusEl && statusMsg) {
      liveStatusEl.textContent = statusMsg;
    }
    if (liveStopBtn) {
      liveStopBtn.textContent = isError ? 'إغلاق' : 'إنهاء';
    }

    if (isRunning) {
      setHeaderRealState(titlesByState[stateName]);
    } else if (!isBusy) {
      setHeaderRealState('');
    }

    if (liveToggleBtn) {
      liveToggleBtn.setAttribute('aria-pressed', String(isRunning));
      liveToggleBtn.setAttribute(
        'aria-label',
        isRunning ? 'إنهاء المحادثة الصوتية المباشرة' : 'بدء محادثة صوتية مباشرة'
      );
    }
    if (liveBtnLabel) {
      liveBtnLabel.textContent = isRunning ? 'إنهاء' : 'صوت مباشر';
    }
  }

  function stopLiveVoiceSession(errorStatusMsg) {
    liveActive = false;
    liveReady = false;
    liveBrowserMode = false;
    liveBrowserToken++;
    liveUserTranscriptHandle = null;
    liveModelTranscriptHandle = null;

    clearLivePlaybackQueue();

    if (liveRecognition) {
      try {
        liveRecognition.onresult = null;
        liveRecognition.onerror = null;
        liveRecognition.onend = null;
        liveRecognition.stop();
      } catch {}
      liveRecognition = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (liveProcessor) {
      try {
        liveProcessor.onaudioprocess = null;
        liveProcessor.disconnect();
      } catch {}
      liveProcessor = null;
    }
    if (liveSilentGain) {
      try {
        liveSilentGain.disconnect();
      } catch {}
      liveSilentGain = null;
    }
    if (liveMicStream) {
      try {
        liveMicStream.getTracks().forEach(t => t.stop());
      } catch {}
      liveMicStream = null;
    }
    if (liveInputCtx) {
      try {
        liveInputCtx.close();
      } catch {}
      liveInputCtx = null;
    }
    if (liveOutputCtx) {
      try {
        liveOutputCtx.close();
      } catch {}
      liveOutputCtx = null;
    }
    if (liveWs) {
      const oldWs = liveWs;
      liveWs = null;
      try {
        oldWs.onopen = null;
        oldWs.onmessage = null;
        oldWs.onerror = null;
        oldWs.onclose = null;
        oldWs.close();
      } catch {}
    }

    if (errorStatusMsg) {
      setLiveUiState('error', errorStatusMsg + ' — يمكنك متابعة الكتابة في الحقل أدناه.');
    } else {
      setLiveUiState('idle', '');
    }
  }

  function speakInBrowserVoiceSession(text, sessionToken, onDone) {
    const clean = stripEmojisClean(String(text || '').replace(/\s+/g, ' ').trim());
    if (!clean || !liveActive || !liveBrowserMode || sessionToken !== liveBrowserToken) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    if (!('speechSynthesis' in window) || (typeof state !== 'undefined' && state.muted)) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ar-SA';
      u.rate = 0.95;
      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      const arV = (voices || []).find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
      if (arV) u.voice = arV;
      setLiveUiState('speaking', 'المعلم يشرح لك صوتياً الآن…');
      let finished = false;
      const maxWaitMs = Math.min(20000, Math.max(3500, clean.length * 95));
      const guardTimer = setTimeout(() => {
        doneOnce();
      }, maxWaitMs);
      const doneOnce = () => {
        if (finished) return;
        finished = true;
        clearTimeout(guardTimer);
        if (typeof onDone === 'function') onDone();
      };
      u.onend = doneOnce;
      u.onerror = doneOnce;
      window.speechSynthesis.speak(u);
    } catch {
      if (typeof onDone === 'function') onDone();
    }
  }

  function startBrowserVoiceListening(sessionToken, restartCount) {
    if (!liveActive || !liveBrowserMode || sessionToken !== liveBrowserToken) return;
    const attempts = Number(restartCount) || 0;
    const RecCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecCtor) {
      setLiveUiState(
        'listening',
        'الصوت المدمج نشط — اكتب سؤالك في الحقل بالأسفل ليجيبك المعلم صوتياً وبصرياً'
      );
      return;
    }
    if (liveRecognition) {
      try {
        liveRecognition.onresult = null;
        liveRecognition.onerror = null;
        liveRecognition.onend = null;
        liveRecognition.stop();
      } catch {}
      liveRecognition = null;
    }
    try {
      const rec = new RecCtor();
      rec.lang = 'ar-SA';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      liveRecognition = rec;
      let gotResult = false;
      let micBlocked = false;
      setLiveUiState('listening', 'تحدّث الآن بالعربية واسأل عن أي خطوة في الدرس');

      rec.onresult = ev => {
        if (!liveActive || !liveBrowserMode || sessionToken !== liveBrowserToken) return;
        const spoken = String(ev.results?.[0]?.[0]?.transcript || '').trim();
        if (!spoken) return;
        gotResult = true;
        handleBrowserVoiceTurn(spoken, sessionToken);
      };
      rec.onerror = ev => {
        if (!liveActive || !liveBrowserMode || sessionToken !== liveBrowserToken) return;
        const errCode = ev && ev.error ? String(ev.error) : '';
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed' || errCode === 'audio-capture') {
          micBlocked = true;
          setLiveUiState(
            'listening',
            'المايكروفون غير متاح — يمكنك كتابة سؤالك في الحقل أدناه ليجيبك المعلم صوتياً'
          );
        }
      };
      rec.onend = () => {
        if (liveRecognition === rec) liveRecognition = null;
        if (
          liveActive &&
          liveBrowserMode &&
          sessionToken === liveBrowserToken &&
          !gotResult &&
          !micBlocked &&
          attempts < 12
        ) {
          setTimeout(() => {
            if (liveActive && liveBrowserMode && sessionToken === liveBrowserToken && !liveRecognition) {
              startBrowserVoiceListening(sessionToken, attempts + 1);
            }
          }, 350);
        }
      };
      rec.start();
    } catch {
      setLiveUiState(
        'listening',
        'الصوت المدمج نشط — يمكنك كتابة سؤالك في الحقل أدناه ليجيبك المعلم صوتياً'
      );
    }
  }

  function handleBrowserVoiceTurn(spokenText, sessionToken) {
    if (!liveActive || !liveBrowserMode || sessionToken !== liveBrowserToken) return;
    if (liveRecognition) {
      try {
        liveRecognition.onresult = null;
        liveRecognition.onerror = null;
        liveRecognition.onend = null;
        liveRecognition.stop();
      } catch {}
      liveRecognition = null;
    }
    const ctx = extractActiveSlideAndLessonContext();
    appendMessage('user', spokenText, null, 'صوت مباشر');
    const reply = buildSlideAwareFallback('chat', spokenText, ctx);
    const handle = appendMessage('assistant', reply, null, 'صوت مباشر');
    const spec = buildClientVisualSpec(spokenText, ctx);
    attachVisualDiagramToMessage(handle, spec, ctx, true);
    chatHistory.push({ role: 'user', text: spokenText }, { role: 'model', text: reply });
    if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);
    notifyNewChatContent(false);

    speakInBrowserVoiceSession(reply, sessionToken, () => {
      if (liveActive && liveBrowserMode && sessionToken === liveBrowserToken) {
        startBrowserVoiceListening(sessionToken, 0);
      }
    });
  }

  function startBrowserVoiceSession(ctx, autoExplainSlide) {
    liveActive = true;
    liveBrowserMode = true;
    liveReady = true;
    const sessionToken = ++liveBrowserToken;
    const slideLabel = cleanStationTitle(ctx.slideTitle || ctx.questionPrompt || ctx.stationTitle) || ctx.lessonTitle;
    const openingText = autoExplainSlide
      ? buildSlideAwareFallback('explain', slideLabel, ctx)
      : 'أهلاً بك يا ' +
        ctx.studentName +
        ' في درس «' +
        ctx.lessonTitle +
        '»! أنا مستعد لشرح «' +
        slideLabel +
        '» — تحدّث بسؤالك أو اكتبه بالأسفل.';

    const msgHandle = appendMessage('assistant', openingText, null, 'صوت مباشر');
    if (autoExplainSlide) {
      attachVisualDiagramToMessage(msgHandle, buildClientVisualSpec(slideLabel, ctx), ctx, true);
    }
    notifyNewChatContent(false);

    speakInBrowserVoiceSession(openingText, sessionToken, () => {
      if (liveActive && liveBrowserMode && sessionToken === liveBrowserToken) {
        startBrowserVoiceListening(sessionToken, 0);
      }
    });
  }

  async function startLiveVoiceSession(autoExplainSlide) {
    if (liveActive) {
      stopLiveVoiceSession();
      return;
    }

    stopGeminiAudio();
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    const ctx = extractActiveSlideAndLessonContext();
    updateContextUI();

    if (staticTutorMode || !backendAvailable) {
      startBrowserVoiceSession(ctx, autoExplainSlide);
      return;
    }

    liveActive = true;
    liveReady = false;
    setLiveUiState('connecting', 'يتم تجهيز المحادثة الصوتية مع المعلم…');

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          liveOutputCtx = new AudioCtx({ sampleRate: 24000 });
        } catch {
          liveOutputCtx = new AudioCtx();
        }
        if (liveOutputCtx.state === 'suspended') {
          liveOutputCtx.resume().catch(() => {});
        }
      }
      liveNextStartTime = 0;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        Promise.race([
          navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Mic timeout')), 3500))
        ])
          .then(stream => {
            if (!liveActive) {
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            liveMicStream = stream;
            if (AudioCtx && !liveInputCtx) {
              try {
                liveInputCtx = new AudioCtx({ sampleRate: 16000 });
              } catch {
                liveInputCtx = new AudioCtx();
              }
            }
            if (liveReady) {
              setupMicStreaming();
            }
          })
          .catch(() => {
            liveMicStream = null;
          });
      }

      if (!liveActive) return;

      const ws = new WebSocket(resolveLiveWsUrl());
      liveWs = ws;

      ws.onopen = () => {
        const slideLabel = ctx.slideTitle || ctx.questionPrompt || ctx.stationTitle;
        const kickOff = autoExplainSlide
          ? 'رحّب بالطالب «' +
            ctx.studentName +
            '» بجملة قصيرة، ثم اشرح له بصوت واضح ومبسط الشريحة المعروضة أمامه الآن («' +
            slideLabel +
            '») في درس «' +
            ctx.lessonTitle +
            '» واسأله إن كان لديه استفسار.'
          : 'رحّب بالطالب «' +
            ctx.studentName +
            '» بجملة عربية قصيرة ومشجعة وأخبره أنك تستمع إليه ومستعد لشرح شريحة «' +
            slideLabel +
            '» في درس «' +
            ctx.lessonTitle +
            '».';
        ws.send(
          JSON.stringify({
            type: 'setup',
            voice: selectedTtsVoice,
            context: ctx,
            initialPrompt: kickOff
          })
        );
      };

      ws.onmessage = event => {
        let msg = null;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!msg) return;

        if (msg.type === 'ready') {
          liveReady = true;
          setLiveUiState(
            'listening',
            liveMicStream
              ? 'تحدّث الآن واسأل عن أي خطوة في الدرس'
              : 'متصل بالصوت — يمكنك كتابة سؤالك ليجيبك المعلم صوتياً'
          );
          if (liveMicStream) {
            setupMicStreaming();
          }
          return;
        }

        if (msg.type === 'audio' && msg.audio) {
          schedulePcm24kChunk(msg.audio);
          return;
        }

        if (msg.type === 'interrupted' || msg.interrupted) {
          clearLivePlaybackQueue();
          liveModelTranscriptHandle = null;
          setLiveUiState('listening', 'تفضّل، أنا أستمع لسؤالك…');
          return;
        }

        if (msg.type === 'inputTranscript' && msg.text) {
          if (!liveUserTranscriptHandle) {
            liveUserTranscriptHandle = appendMessage('user', msg.text, null, 'صوت مباشر');
          } else {
            liveUserTranscriptHandle.rawText = (liveUserTranscriptHandle.rawText || '') + msg.text;
            setFormattedBodyText(liveUserTranscriptHandle.bodyEl, liveUserTranscriptHandle.rawText);
            notifyNewChatContent(false);
          }
          return;
        }

        if (msg.type === 'outputTranscript' && msg.text) {
          liveUserTranscriptHandle = null;
          if (!liveModelTranscriptHandle) {
            liveModelTranscriptHandle = appendMessage('assistant', msg.text, null, 'صوت مباشر');
          } else {
            liveModelTranscriptHandle.rawText = (liveModelTranscriptHandle.rawText || '') + msg.text;
            setFormattedBodyText(liveModelTranscriptHandle.bodyEl, liveModelTranscriptHandle.rawText);
            notifyNewChatContent(false);
          }
          return;
        }

        if (msg.type === 'turnComplete') {
          liveUserTranscriptHandle = null;
          liveModelTranscriptHandle = null;
          return;
        }

        if (msg.type === 'error') {
          const errText = msg.error || 'تعذّر بدء الجلسة الصوتية حالياً';
          if (msg.code === 'MISSING_API_KEY') {
            serverConfigured = false;
            updateContextUI();
          }
          stopLiveVoiceSession(errText);
        }
      };

      ws.onerror = () => {
        if (liveWs !== ws) return;
        if (liveActive && !liveReady) {
          backendAvailable = false;
          staticTutorMode = true;
          serverConfigured = false;
          updateContextUI();
          stopLiveVoiceSession();
          startBrowserVoiceSession(ctx, autoExplainSlide);
          return;
        }
        if (liveActive) {
          stopLiveVoiceSession('انقطع الاتصال الصوتي بالخادم');
        }
      };

      ws.onclose = () => {
        if (liveWs !== ws) return;
        if (liveActive && !liveReady) {
          backendAvailable = false;
          staticTutorMode = true;
          serverConfigured = false;
          updateContextUI();
          stopLiveVoiceSession();
          startBrowserVoiceSession(ctx, autoExplainSlide);
          return;
        }
        if (liveActive) {
          stopLiveVoiceSession();
        }
      };
    } catch {
      stopLiveVoiceSession();
      startBrowserVoiceSession(ctx, autoExplainSlide);
    }
  }

  function setupMicStreaming() {
    if (!liveInputCtx || !liveMicStream || !liveWs) return;
    if (liveInputCtx.state === 'suspended') {
      liveInputCtx.resume().catch(() => {});
    }
    const source = liveInputCtx.createMediaStreamSource(liveMicStream);
    const processor = liveInputCtx.createScriptProcessor(4096, 1, 1);
    const silentGain = liveInputCtx.createGain();
    silentGain.gain.value = 0;

    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(liveInputCtx.destination);

    const actualSampleRate = liveInputCtx.sampleRate || 16000;
    processor.onaudioprocess = e => {
      if (!liveActive || !liveReady || !liveWs || liveWs.readyState !== WebSocket.OPEN) return;
      const channelData = e.inputBuffer.getChannelData(0);
      const base64Audio = float32ToPcm16Base64(channelData, actualSampleRate);
      liveWs.send(JSON.stringify({ audio: base64Audio }));
    };

    liveProcessor = processor;
    liveSilentGain = silentGain;
  }

  /* =====================================================================
     الإملاء الصوتي الاختياري للسؤال (Speech-to-Text Dictation) إن توفّر
     ===================================================================== */
  const SpeechRecCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  let activeDictation = null;

  if (dictateBtn && SpeechRecCtor) {
    dictateBtn.hidden = false;
    dictateBtn.addEventListener('click', () => {
      if (activeDictation) {
        try {
          activeDictation.stop();
        } catch {}
        activeDictation = null;
        dictateBtn.setAttribute('aria-pressed', 'false');
        return;
      }
      if (liveActive) stopLiveVoiceSession();
      try {
        const rec = new SpeechRecCtor();
        rec.lang = 'ar-SA';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        activeDictation = rec;
        dictateBtn.setAttribute('aria-pressed', 'true');
        rec.onresult = ev => {
          const spoken = ev.results?.[0]?.[0]?.transcript || '';
          if (spoken && inputEl) {
            const sep = inputEl.value.trim() ? ' ' : '';
            inputEl.value = (inputEl.value + sep + spoken).slice(0, 600);
            syncComposerState();
            inputEl.focus();
          }
        };
        rec.onerror = () => {
          activeDictation = null;
          dictateBtn.setAttribute('aria-pressed', 'false');
        };
        rec.onend = () => {
          activeDictation = null;
          dictateBtn.setAttribute('aria-pressed', 'false');
        };
        rec.start();
      } catch {
        activeDictation = null;
        dictateBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* =====================================================================
     إدارة حالة الترحيب، مزامنة الشريحة، فتح/إغلاق اللوحة، والتمرير الذكي
     ===================================================================== */
  let lastContextSignature = '';

  function buildLessonStarterSuggestions(ctx) {
    const slideRef = ctx.slideTitle || cleanStationTitle(ctx.stationTitle) || ctx.lessonTitle;
    const byLesson = {
      1: [
        { label: 'اشرح فكرة هذه الشريحة ببساطة', kind: 'explain' },
        { label: 'كيف أحدد القيمة المنزلية لرقم؟', query: 'كيف أحدد القيمة المنزلية لأي رقم في عدد ضمن الملايين؟' },
        { label: 'اعرض لوحة المنازل التفاعلية', kind: 'visualize' }
      ],
      2: [
        { label: 'اشرح خطوات مقارنة عددين', kind: 'explain' },
        { label: 'متى نعدّ المنازل ومتى نقارن من اليسار؟', query: 'متى نعدّ المنازل أولاً ومتى نقارن الأرقام من أقصى اليسار؟' },
        { label: 'أعطني مثالاً على المقارنة', kind: 'example' }
      ],
      3: [
        { label: 'اشرح خطوات الجمع أو الطرح هنا', kind: 'explain' },
        { label: 'كيف أستلف عبر الأصفار في الطرح؟', query: 'اشرح لي خطوة بخطوة كيف أستلف عبر الأصفار في الطرح العمودي.' },
        { label: 'أعطني مثالاً عددياً مشابهاً', kind: 'example' }
      ],
      4: [
        { label: 'ما الفرق بين الموجب والسالب والصفر؟', kind: 'explain' },
        { label: 'مثّل لي الأعداد السالبة على خط الأعداد', kind: 'visualize' },
        { label: 'أعطني مثالاً من درجات الحرارة', kind: 'example' }
      ],
      5: [
        { label: 'كيف أنشئ جدولاً لحل هذه المسألة؟', kind: 'explain' },
        { label: 'اعرض جدول النمط التفاعلي', kind: 'visualize' },
        { label: 'أعطني تلميحاً للخطوة الأولى', kind: 'hint' }
      ]
    };
    const items = byLesson[ctx.lesson] || byLesson[1];
    return { slideRef, items };
  }

  function appendWelcomeState(ctx) {
    const { items } = buildLessonStarterSuggestions(ctx);
    const welcomeText =
      'أهلاً بك! أنا معك في درس «' +
      ctx.lessonTitle +
      '».\nاختر سؤالاً للبدء أو اكتب ما تريد فهمه حول الشريحة الحالية:';
    const handle = appendMessage('assistant', welcomeText, null, null, {
      hideSpeak: true,
      forceScroll: true
    });
    if (handle && handle.wrapEl) {
      handle.wrapEl.dataset.welcomeCard = 'true';
      const starters = document.createElement('div');
      starters.className = 'ai-welcome-starters';
      items.forEach(item => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ai-starter-btn';
        b.textContent = item.label;
        b.addEventListener('click', () => {
          const latestCtx = extractActiveSlideAndLessonContext();
          if (item.kind === 'visualize') {
            handleVisualDiagramRequest();
          } else if (item.kind === 'explain') {
            handleUserQuestion(
              'اشرح لي محتوى هذه الشريحة («' +
                (latestCtx.slideTitle || latestCtx.stationTitle) +
                '») في درس «' +
                latestCtx.lessonTitle +
                '» بخطوات واضحة ومبسطة.',
              'explain',
              item.label
            );
          } else if (item.kind === 'example') {
            handleUserQuestion(
              'أعطني مثالاً عددياً مبسطاً يوضح فكرة هذه الشريحة في درس «' + latestCtx.lessonTitle + '».',
              'example',
              item.label
            );
          } else if (item.kind === 'hint') {
            handleUserQuestion(
              'أعطني تلميحاً يساعدني على حل هذه الخطوة بنفسي دون كشف الجواب النهائي.',
              'hint',
              item.label
            );
          } else if (item.query) {
            handleUserQuestion(item.query, 'chat', item.label);
          }
        });
        starters.append(b);
      });
      handle.wrapEl.append(starters);
    }
    return handle;
  }

  function isDesktopSidePanelViewport() {
    return window.innerWidth >= 1024;
  }

  function syncVisualViewportHeight() {
    if (!sheet || !sheet.open) return;
    if (isDesktopSidePanelViewport()) {
      sheet.style.removeProperty('--ai-vvh');
      sheet.style.removeProperty('--ai-vv-top');
      return;
    }
    const vv = window.visualViewport;
    if (vv) {
      sheet.style.setProperty('--ai-vvh', Math.round(vv.height) + 'px');
      sheet.style.setProperty('--ai-vv-top', Math.round(vv.offsetTop || 0) + 'px');
      if (userNearBottom && logEl) {
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncVisualViewportHeight);
    window.visualViewport.addEventListener('scroll', syncVisualViewportHeight);
  }
  window.addEventListener('resize', syncVisualViewportHeight);

  function closeOptionsMenu() {
    if (optionsMenu) optionsMenu.hidden = true;
    if (optionsBtn) optionsBtn.setAttribute('aria-expanded', 'false');
  }

  function closeAiTutorSheet() {
    if (!sheet || !sheet.open) return;
    closeOptionsMenu();
    if (clearConfirmEl) clearConfirmEl.hidden = true;
    stopLiveVoiceSession();
    stopGeminiAudio();
    delete document.body.dataset.aiOpen;
    sheet.close();
  }

  function notifyAiTutorContextChanged() {
    updateContextUI();
    if (!sheet || !sheet.open || !logEl) return;
    const ctx = extractActiveSlideAndLessonContext();
    const sig = ctx.lesson + ':' + ctx.stationTitle + ':' + (ctx.stepIndex ?? 'map');
    if (sig !== lastContextSignature) {
      lastContextSignature = sig;
      const rows = logEl.querySelectorAll('.ai-msg-row');
      if (rows.length === 1 && rows[0].querySelector('[data-welcome-card="true"]') && chatHistory.length === 0) {
        logEl.replaceChildren();
        appendWelcomeState(ctx);
      }
    }
  }
  window.notifyAiTutorContextChanged = notifyAiTutorContextChanged;

  function openAiTutor(initialAction) {
    if (!sheet) return;
    sheet.removeAttribute('inert');
    sheet.removeAttribute('aria-hidden');

    const ctx = extractActiveSlideAndLessonContext();
    updateContextUI();
    if (!healthChecked) checkServerHealth();

    const sig = ctx.lesson + ':' + ctx.stationTitle + ':' + (ctx.stepIndex ?? 'map');
    if (logEl && logEl.children.length === 0) {
      lastContextSignature = sig;
      appendWelcomeState(ctx);
    } else if (sig !== lastContextSignature) {
      lastContextSignature = sig;
      const rows = logEl ? logEl.querySelectorAll('.ai-msg-row') : [];
      if (rows.length === 1 && rows[0].querySelector('[data-welcome-card="true"]') && chatHistory.length === 0) {
        logEl.replaceChildren();
        appendWelcomeState(ctx);
      }
    }

    if (!sheet.open) {
      const stationModal = $('station-sheet');
      if (stationModal && stationModal.open) {
        try {
          stationModal.close();
        } catch {}
      }
      document.body.dataset.aiOpen = 'true';
      if (isDesktopSidePanelViewport()) {
        // على الكمبيوتر: فتح لوحة جانبية غير حاجبة ليبقى الدرس تفاعلياً بجانبها
        sheet.show();
      } else {
        sheet.showModal();
      }
      syncVisualViewportHeight();
    }

    if (initialAction === 'explain') {
      handleUserQuestion(
        'اشرح لي هذه الشريحة («' + (ctx.slideTitle || ctx.stationTitle) + '») بوضوح مع مثال مبسط.',
        'explain',
        'اشرح لي هذه الشريحة بوضوح'
      );
    } else if (initialAction === 'hint') {
      handleUserQuestion(
        'أعطني تلميحاً ذكياً يساعدني على فهم وحل هذه الخطوة دون كشف الحل النهائي.',
        'hint',
        'أعطني تلميحاً للحل'
      );
    } else if (initialAction === 'example') {
      handleUserQuestion(
        'أعطني مثالاً عددياً إضافياً مبسطاً يوضح فكرة هذه الشريحة في درس «' + ctx.lessonTitle + '».',
        'example',
        'أعطني مثالاً إضافياً'
      );
    } else if (initialAction === 'live') {
      if (!liveActive) {
        startLiveVoiceSession(true);
      }
    }
  }

  window.openAiTutor = openAiTutor;

  if (logEl) {
    logEl.addEventListener(
      'scroll',
      () => {
        userNearBottom = checkIsNearBottom();
        if (userNearBottom && newMsgBtn) {
          newMsgBtn.hidden = true;
        }
      },
      { passive: true }
    );
  }

  if (newMsgBtn) {
    newMsgBtn.addEventListener('click', () => {
      scrollChatToBottom(true);
    });
  }

  if ($('ai-tutor-hud-btn')) $('ai-tutor-hud-btn').addEventListener('click', () => openAiTutor());
  if ($('station-ai-btn')) $('station-ai-btn').addEventListener('click', () => openAiTutor());
  if ($('ai-floating-fab')) $('ai-floating-fab').addEventListener('click', () => openAiTutor());

  document.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : null;
    if (optionsMenu && !optionsMenu.hidden && target && !target.closest('.ai-options-wrap')) {
      closeOptionsMenu();
    }
    const aiTrigger = target ? target.closest('[data-open-ai]') : null;
    if (aiTrigger) {
      e.stopPropagation();
      const actionAttr = aiTrigger.getAttribute('data-open-ai');
      openAiTutor(actionAttr && actionAttr !== '1' && actionAttr !== 'true' ? actionAttr : undefined);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet && sheet.open) {
      if (optionsMenu && !optionsMenu.hidden) {
        e.stopPropagation();
        closeOptionsMenu();
        optionsBtn?.focus();
        return;
      }
      if (settingsPanel && !settingsPanel.hidden) {
        e.stopPropagation();
        settingsPanel.hidden = true;
        settingsBtn?.setAttribute('aria-expanded', 'false');
        return;
      }
      closeAiTutorSheet();
    }
  });

  if ($('ask-ai-coach-btn')) $('ask-ai-coach-btn').addEventListener('click', () => openAiTutor('hint'));

  if ($('ai-tutor-close')) {
    $('ai-tutor-close').addEventListener('click', () => {
      closeAiTutorSheet();
    });
  }

  if (sheet) {
    sheet.addEventListener('close', () => {
      closeOptionsMenu();
      stopLiveVoiceSession();
      stopGeminiAudio();
      delete document.body.dataset.aiOpen;
    });
    sheet.addEventListener('click', e => {
      if (e.target === sheet && !isDesktopSidePanelViewport()) {
        closeAiTutorSheet();
      }
    });
  }

  if (optionsBtn && optionsMenu) {
    optionsBtn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = optionsMenu.hidden;
      optionsMenu.hidden = !willOpen;
      optionsBtn.setAttribute('aria-expanded', String(willOpen));
    });
  }

  if (ctxDetailsToggle && ctxDetailsPanel) {
    ctxDetailsToggle.addEventListener('click', () => {
      const willOpen = ctxDetailsPanel.hidden;
      ctxDetailsPanel.hidden = !willOpen;
      ctxDetailsToggle.setAttribute('aria-expanded', String(willOpen));
      updateContextUI();
    });
  }

  if (moreChipsBtn && quickChipsWrap) {
    moreChipsBtn.addEventListener('click', () => {
      const expanded = quickChipsWrap.classList.toggle('is-expanded');
      moreChipsBtn.setAttribute('aria-expanded', String(expanded));
      moreChipsBtn.textContent = expanded ? 'أقل' : 'المزيد';
    });
  }

  if (liveToggleBtn) {
    liveToggleBtn.addEventListener('click', () => {
      startLiveVoiceSession(false);
    });
  }

  if (liveStopBtn) {
    liveStopBtn.addEventListener('click', () => {
      stopLiveVoiceSession();
    });
  }

  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', () => {
      closeOptionsMenu();
      const willOpen = settingsPanel.hidden;
      settingsPanel.hidden = !willOpen;
      settingsBtn.setAttribute('aria-expanded', String(willOpen));
      updateContextUI();
    });
  }

  if (settingsCloseBtn && settingsPanel) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsPanel.hidden = true;
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('.ai-model-btn[data-ai-model]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.aiModel;
      if (m && VALID_MODELS.includes(m)) {
        selectedModel = m;
        try {
          localStorage.setItem(AI_MODEL_STORAGE, selectedModel);
        } catch {}
        updateContextUI();
      }
    });
  });

  document.querySelectorAll('.ai-tts-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.ttsMode;
      if (mode && VALID_TTS_MODES.includes(mode)) {
        selectedTtsMode = mode;
        try {
          localStorage.setItem(AI_TTS_MODE_STORAGE, selectedTtsMode);
        } catch {}
        updateContextUI();
      }
    });
  });

  document.querySelectorAll('.ai-tts-voice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.ttsVoice;
      if (v && VALID_TTS_VOICES.includes(v)) {
        selectedTtsVoice = v;
        try {
          localStorage.setItem(AI_TTS_VOICE_STORAGE, selectedTtsVoice);
        } catch {}
        updateContextUI();
      }
    });
  });

  function executeClearConversation(saveForUndo) {
    if (activeChatAbortController) {
      try {
        activeChatAbortController.abort();
      } catch {}
      activeChatAbortController = null;
    }
    isBusy = false;
    setHeaderRealState('');
    stopGeminiAudio();

    if (saveForUndo && logEl) {
      lastClearedSnapshot = {
        nodes: Array.from(logEl.childNodes),
        history: chatHistory.slice()
      };
    }

    chatHistory.length = 0;
    if (logEl) logEl.replaceChildren();
    if (clearConfirmEl) clearConfirmEl.hidden = true;
    const ctx = extractActiveSlideAndLessonContext();
    lastContextSignature = ctx.lesson + ':' + ctx.stationTitle + ':' + (ctx.stepIndex ?? 'map');
    appendWelcomeState(ctx);
    syncComposerState();

    if (saveForUndo && undoBarEl && lastClearedSnapshot && lastClearedSnapshot.nodes.length > 0) {
      undoBarEl.hidden = false;
    }
  }

  if ($('ai-clear-chat')) {
    $('ai-clear-chat').addEventListener('click', () => {
      closeOptionsMenu();
      const rowCount = logEl ? logEl.querySelectorAll('.ai-msg-row').length : 0;
      const hasActiveConversation = chatHistory.length > 0 || rowCount > 1;
      if (hasActiveConversation && clearConfirmEl) {
        if (undoBarEl) undoBarEl.hidden = true;
        clearConfirmEl.hidden = false;
        clearConfirmYes?.focus();
      } else {
        executeClearConversation(false);
      }
    });
  }

  if (clearConfirmYes) {
    clearConfirmYes.addEventListener('click', () => {
      executeClearConversation(true);
    });
  }

  if (clearConfirmNo) {
    clearConfirmNo.addEventListener('click', () => {
      if (clearConfirmEl) clearConfirmEl.hidden = true;
    });
  }

  if (undoClearBtn) {
    undoClearBtn.addEventListener('click', () => {
      if (!lastClearedSnapshot || !logEl) return;
      logEl.replaceChildren(...lastClearedSnapshot.nodes);
      chatHistory.length = 0;
      lastClearedSnapshot.history.forEach(item => chatHistory.push(item));
      lastClearedSnapshot = null;
      if (undoBarEl) undoBarEl.hidden = true;
      scrollChatToBottom(false);
    });
  }

  document.querySelectorAll('#ai-quick-chips .ai-chip[data-ai-prompt]').forEach(chip => {
    chip.addEventListener('click', () => {
      if (
        chip.classList.contains('ai-chip-secondary') &&
        quickChipsWrap &&
        quickChipsWrap.classList.contains('is-expanded')
      ) {
        quickChipsWrap.classList.remove('is-expanded');
        if (moreChipsBtn) {
          moreChipsBtn.setAttribute('aria-expanded', 'false');
          moreChipsBtn.textContent = 'المزيد';
        }
      }
      const kind = chip.dataset.aiPrompt;
      const ctx = extractActiveSlideAndLessonContext();
      if (kind === 'custom-quiz') {
        handleCustomQuizRequest();
      } else if (kind === 'visualize') {
        handleVisualDiagramRequest();
      } else if (kind === 'explain') {
        handleUserQuestion(
          'اشرح لي محتوى هذه الشريحة («' + (ctx.slideTitle || ctx.stationTitle) + '») في درس «' + ctx.lessonTitle + '» بالتفصيل مع خطوات واضحة.',
          'explain',
          'اشرح لي'
        );
      } else if (kind === 'example') {
        handleUserQuestion(
          'أعطني مثالاً عددياً إضافياً مبسطاً يوضح فكرة هذه الشريحة في درس «' + ctx.lessonTitle + '».',
          'example',
          'أعطني مثالًا'
        );
      } else if (kind === 'hint') {
        handleUserQuestion(
          'أعطني تلميحاً ذكياً يساعدني على حل السؤال في هذه الشريحة بنفسي دون كشف الإجابة النهائية.',
          'hint',
          'تلميح'
        );
      }
    });
  });

  if (inputEl) {
    inputEl.addEventListener('input', () => {
      syncComposerState();
    });
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (formEl && inputEl.value.trim() && !isBusy) {
          formEl.requestSubmit();
        }
      }
    });
    inputEl.addEventListener('focus', () => {
      setTimeout(syncVisualViewportHeight, 80);
    });
  }

  if (formEl && inputEl) {
    formEl.addEventListener('submit', e => {
      e.preventDefault();
      const q = inputEl.value.trim();
      if (!q || isBusy) return;
      inputEl.value = '';
      syncComposerState();
      if (liveActive && liveBrowserMode) {
        handleBrowserVoiceTurn(q, liveBrowserToken);
        return;
      }
      if (liveActive && liveReady && liveWs && liveWs.readyState === WebSocket.OPEN) {
        clearLivePlaybackQueue();
        appendMessage('user', q, null, 'إلى المعلم الصوتي');
        liveWs.send(JSON.stringify({ type: 'text', text: q }));
        return;
      }
      handleUserQuestion(q, 'chat', q, q);
    });
  }

  syncComposerState();
  checkServerHealth();
})();
