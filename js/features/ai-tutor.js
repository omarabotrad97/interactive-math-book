/* Gemini AI Tutor & Custom Quiz Generator */
/* ===== نظام المعلم الذكي المخصص (Gemini Interactions API) ===== */
(function(){
 const AI_KEY_STORAGE = 'millions_gemini_api_key_v1';
 const AI_MODEL_STORAGE = 'millions_gemini_model_v1';
 const AI_TTS_MODE_STORAGE = 'millions_gemini_tts_mode_v1';
 const AI_TTS_VOICE_STORAGE = 'millions_gemini_tts_voice_v1';
 const VALID_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-4-argon'];
 const VALID_TTS_MODES = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'browser'];
 const VALID_TTS_VOICES = ['Kore', 'Aoede', 'Puck'];
 const SKILL_LABELS = {
  place: 'المنزلة والقيمة المنزلية',
  verbal: 'الصيغة اللفظية (قراءة الأعداد)',
  standard: 'الصيغة القياسية (كتابة الأرقام)',
  expanded: 'الصيغة التحليلية واكتشاف الخطأ'
 };

 let apiKey = '';
 let selectedModel = 'gemini-3.5-flash-lite';
 let selectedTtsMode = 'gemini-3.8-flash-lite-tts';
 let selectedTtsVoice = 'Kore';
 let previousInteractionId = null;
 let isBusy = false;
 let currentGeminiAudio = null;
 let ttsRequestToken = 0;
 let fallbackTurnIndex = 0;
 const geminiAudioCache = new Map();

 try {
  apiKey = getGeminiApiKey();
  const savedModel = localStorage.getItem(AI_MODEL_STORAGE);
  if (savedModel && VALID_MODELS.includes(savedModel)) selectedModel = savedModel;
  const savedTtsMode = localStorage.getItem(AI_TTS_MODE_STORAGE);
  if (savedTtsMode && VALID_TTS_MODES.includes(savedTtsMode)) selectedTtsMode = savedTtsMode;
  const savedTtsVoice = localStorage.getItem(AI_TTS_VOICE_STORAGE);
  if (savedTtsVoice && VALID_TTS_VOICES.includes(savedTtsVoice)) selectedTtsVoice = savedTtsVoice;
 } catch {}

 function stopGeminiAudio() {
  ttsRequestToken++;
  if (currentGeminiAudio) {
   try {
    currentGeminiAudio.pause();
    currentGeminiAudio.currentTime = 0;
   } catch {}
   currentGeminiAudio = null;
  }
 }
 window.stopGeminiAudio = stopGeminiAudio;

 function fallbackBrowserSpeak(text) {
  try {
   if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 0.95;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const arV = (voices || []).find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
    if (arV) u.voice = arV;
    window.speechSynthesis.speak(u);
   }
  } catch {}
 }

 async function synthesizeWithGeminiTTS(text) {
  const ttsModel = selectedTtsMode === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
  const cacheKey = ttsModel + ':' + selectedTtsVoice + ':' + text;
  if (geminiAudioCache.has(cacheKey)) return geminiAudioCache.get(cacheKey);

  const payload = {
   model: ttsModel,
   input: [{
    type: 'user_input',
    content: [{
     type: 'text',
     text: text,
     annotations: [{
      type: 'speech_metadata',
      style: 'warm, clear, and encouraging Arabic teacher'
     }]
    }]
   }],
   response_format: { type: 'audio' },
   generation_config: {
    speech_config: [
     { voice: selectedTtsVoice }
    ]
   }
  };

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions?key=' + encodeURIComponent(apiKey);
  const res = await fetch(endpoint, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json'
   },
   body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('TTS HTTP ' + res.status);
  const data = await res.json();
  if (data && data.output_audio && data.output_audio.data) {
   const mime = data.output_audio.mime_type || 'audio/wav';
   const dataUri = 'data:' + mime + ';base64,' + data.output_audio.data;
   geminiAudioCache.set(cacheKey, dataUri);
   return dataUri;
  }
  if (data && Array.isArray(data.steps)) {
   for (let i = data.steps.length - 1; i >= 0; i--) {
    const st = data.steps[i];
    if (st && st.type === 'model_output' && Array.isArray(st.content)) {
     for (let j = st.content.length - 1; j >= 0; j--) {
      const part = st.content[j];
      if (part && part.type === 'audio' && part.data) {
       const mime = part.mime_type || 'audio/wav';
       const dataUri = 'data:' + mime + ';base64,' + part.data;
       geminiAudioCache.set(cacheKey, dataUri);
       return dataUri;
      }
     }
    }
   }
  }
  throw new Error('No audio returned from Gemini TTS');
 }

 async function speakWithGeminiFirst(rawText) {
  const clean = String(rawText || '').replace(/\s+/g, ' ').trim();
  if (!clean || state.muted) return;
  stopGeminiAudio();
  const myToken = ++ttsRequestToken;

  if (selectedTtsMode !== 'browser' && apiKey) {
   try {
    const audioDataUri = await synthesizeWithGeminiTTS(clean);
    if (myToken !== ttsRequestToken) return;
    const audio = new Audio(audioDataUri);
    currentGeminiAudio = audio;
    await audio.play();
    return;
   } catch {
    if (myToken !== ttsRequestToken) return;
   }
  }
  fallbackBrowserSpeak(clean);
 }
 window.speakWithGeminiFirst = speakWithGeminiFirst;

 const sheet = $('ai-tutor-sheet');
 const logEl = $('ai-chat-log');
 const formEl = $('ai-chat-form');
 const inputEl = $('ai-chat-input');
 const sendBtn = $('ai-send-btn');
 const settingsPanel = $('ai-settings-panel');
 const settingsBtn = $('ai-settings-toggle');
 const keyInput = $('ai-api-key-input');
 const saveKeyBtn = $('ai-save-key-btn');
 const keyStatus = $('ai-key-status');
 const ctxStation = $('ai-ctx-station');
 const ctxSkill = $('ai-ctx-skill');
 const ctxReward = $('ai-ctx-reward');

 function getWeakestSkillKey() {
  const entries = Object.entries(state.skillStats || {});
  let weakest = 'place', worstScore = Infinity;
  entries.forEach(([k, v]) => {
   const total = (v.ok || 0) + (v.err || 0);
   const ratio = total === 0 ? 0.5 : (v.ok - v.err * 1.5) / total;
   if (ratio < worstScore) { worstScore = ratio; weakest = k; }
  });
  return weakest;
 }

 function buildStudentContextSummary() {
  const weakKey = getWeakestSkillKey();
  const statsText = Object.entries(state.skillStats || {}).map(([k, v]) =>
   SKILL_LABELS[k] + ': صح ' + (v.ok || 0) + ' / خطأ ' + (v.err || 0)
  ).join(' | ');

  const runnerSess = (typeof L1Runner !== 'undefined' && typeof L1Runner.getSession === 'function') ? L1Runner.getSession() : null;
  const inLesson5 = (runnerSess && runnerSess.lesson === 5)
   || state.viewMode === 'lesson5'
   || (state.viewMode === 'map' && state.mapSubView === 'lesson5');
  if (inLesson5 && typeof L5_NODES !== 'undefined') {
   const l5 = typeof getLesson5State === 'function' ? getLesson5State() : null;
   const nid = runnerSess && runnerSess.lesson === 5 ? runnerSess.nodeId : (l5 ? l5.activeNode : 0);
   const l5Node = L5_NODES[nid] || L5_NODES[0];
   const curStep = runnerSess && runnerSess.steps ? runnerSess.steps[runnerSess.index] : null;
   const l5Desc = curStep
    ? ('يحل في الدرس الخامس (خطة حل المسألة: أنشئ جدولاً) - محطة «' + (l5Node ? l5Node.title : '') + '»: ' + (curStep.prompt || ''))
    : ('يتصفح خريطة الدرس الخامس (خطة حل المسألة: أنشئ جدولاً) - المحطة الحالية: ' + (l5Node ? l5Node.title : ''));
   return {
    lesson: 5,
    nodeTitle: l5Node ? l5Node.title : 'خطة حل المسألة: أنشئ جدولاً',
    weakKey,
    weakLabel: 'إنشاء جدول منظم واستخلاص الحل والتحقق بالضرب والجمع',
    statsText,
    currentTaskDesc: l5Desc,
    points: typeof totalPoints === 'function' ? totalPoints() : 0,
    completedCount: typeof getLesson5DoneCount === 'function' ? getLesson5DoneCount() : 0,
    totalCount: L5_NODES.length,
    hearts: state.hearts,
    errors: state.errors,
    studentName: state.studentName || 'بطل الأعداد'
   };
  }
  const inLesson4 = (runnerSess && runnerSess.lesson === 4)
   || state.viewMode === 'lesson4'
   || (state.viewMode === 'map' && state.mapSubView === 'lesson4');
  if (inLesson4 && typeof L4_NODES !== 'undefined') {
   const l4 = typeof getLesson4State === 'function' ? getLesson4State() : null;
   const nid = runnerSess && runnerSess.lesson === 4 ? runnerSess.nodeId : (l4 ? l4.activeNode : 0);
   const l4Node = L4_NODES[nid] || L4_NODES[0];
   const curStep = runnerSess && runnerSess.steps ? runnerSess.steps[runnerSess.index] : null;
   const l4Desc = curStep
    ? ('يحل في الدرس الرابع (الأعداد السالبة) - محطة «' + (l4Node ? l4Node.title : '') + '»: ' + (curStep.prompt || ''))
    : ('يتصفح خريطة الدرس الرابع (الأعداد السالبة) - المحطة الحالية: ' + (l4Node ? l4Node.title : ''));
   return {
    lesson: 4,
    nodeTitle: l4Node ? l4Node.title : 'الأعداد السالبة',
    weakKey,
    weakLabel: 'الأعداد السالبة وتمثيلها على خط الأعداد وقراءة الميزان',
    statsText,
    currentTaskDesc: l4Desc,
    points: typeof totalPoints === 'function' ? totalPoints() : 0,
    completedCount: typeof getLesson4DoneCount === 'function' ? getLesson4DoneCount() : 0,
    totalCount: L4_NODES.length,
    hearts: state.hearts,
    errors: state.errors,
    studentName: state.studentName || 'بطل الأعداد'
   };
  }
  const inLesson3 = (runnerSess && runnerSess.lesson === 3)
   || state.viewMode === 'lesson3'
   || (state.viewMode === 'map' && state.mapSubView === 'lesson3');
  if (inLesson3 && typeof L3_NODES !== 'undefined') {
   const l3 = typeof getLesson3State === 'function' ? getLesson3State() : null;
   const nid = runnerSess && runnerSess.lesson === 3 ? runnerSess.nodeId : (l3 ? l3.activeNode : 0);
   const l3Node = L3_NODES[nid] || L3_NODES[0];
   const curStep = runnerSess && runnerSess.steps ? runnerSess.steps[runnerSess.index] : null;
   const l3Desc = curStep
    ? ('يحل في الدرس الثالث (جمع الأعداد الكلية وطرحها) - محطة «' + (l3Node ? l3Node.title : '') + '»: ' + (curStep.prompt || ''))
    : ('يتصفح خريطة الدرس الثالث (جمع الأعداد الكلية وطرحها) - المحطة الحالية: ' + (l3Node ? l3Node.title : ''));
   return {
    lesson: 3,
    nodeTitle: l3Node ? l3Node.title : 'جمع الأعداد الكلية وطرحها',
    weakKey,
    weakLabel: 'الجمع والطرح العمودي مع إعادة التجميع والتقدير',
    statsText,
    currentTaskDesc: l3Desc,
    points: typeof totalPoints === 'function' ? totalPoints() : 0,
    completedCount: typeof getLesson3DoneCount === 'function' ? getLesson3DoneCount() : 0,
    totalCount: L3_NODES.length,
    hearts: state.hearts,
    errors: state.errors,
    studentName: state.studentName || 'بطل الأعداد'
   };
  }

  const node = PATH_NODES[state.activeNode] || PATH_NODES[0];

  let currentTaskDesc = 'يتصفح خريطة المسار التعليمي';
  if (state.viewMode === 'story') {
   currentTaskDesc = 'يقرأ شرائح الشرح في محطة: ' + node.title;
  } else if (state.viewMode === 'playground') {
   currentTaskDesc = 'يتدرب في ملعب الأعداد التفاعلي';
  } else if (state.viewMode === 'mission') {
   try {
    const step = currentStep();
    const m = missions[activeId()];
    currentTaskDesc = 'يحل مهمة «' + (m ? m.title : node.title) + '» - السؤال الحالي: ' + (step && step.q ? step.q : '') + (step && step.n ? ' (العدد: ' + step.n + ')' : '');
   } catch {}
  }

  return {
   lesson: 1,
   nodeTitle: node ? node.title : 'فكرة الدرس',
   weakKey,
   weakLabel: SKILL_LABELS[weakKey] || 'القيمة المنزلية',
   statsText,
   currentTaskDesc,
   points: typeof totalPoints === 'function' ? totalPoints() : 0,
   completedCount: state.completed ? state.completed.size : 0,
   totalCount: 12,
   hearts: state.hearts,
   errors: state.errors,
   studentName: state.studentName || 'بطل الأعداد'
  };
 }

 function updateContextUI() {
  const ctx = buildStudentContextSummary();
  if (ctxStation) ctxStation.textContent = 'المحطة: ' + ctx.nodeTitle;
  if (ctxSkill) ctxSkill.textContent = 'مهارة التركيز المقترحة: ' + ctx.weakLabel;
  if (ctxReward) {
   ensureAiQuizDay();
   const count = Math.min(3, Math.max(0, state.aiQuiz?.rewarded || 0));
   ctxReward.textContent = 'مكافآت اليوم: ' + count + ' من 3';
  }
  if (keyInput && document.activeElement !== keyInput) keyInput.value = apiKey;
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
   keyStatus.textContent = apiKey
    ? 'مفتاح Gemini API محفوظ ونشط (' + selectedModel + ') · المحادثة التوليدية الحية مفعلة.'
    : 'تنبيه: لم يتم حفظ مفتاح Gemini بعد. أدخل المفتاح واضغط «حفظ المفتاح» لتفعيل الذكاء الاصطناعي الحي.';
  }
 }

 function buildSystemInstruction() {
  const ctx = buildStudentContextSummary();
  const lessonName = ctx.lesson === 4
   ? 'الأعداد السالبة'
   : (ctx.lesson === 3 ? 'جمع الأعداد الكلية وطرحها' : 'القيمة المنزلية ضمن الملايين');
  return [
   'أنت «البومة الحكيمة»، المعلم الذكي والمرشد التربوي في كتاب الرياضيات التفاعلي للصف الخامس (درس: ' + lessonName + ').',
   'بيانات الطالب اللحظية: اسمه «' + ctx.studentName + '»، نقاطه ' + ctx.points + '، إنجازه ' + ctx.completedCount + '/' + (ctx.totalCount || 12) + '، ومهارته التي تحتاج دعماً: «' + ctx.weakLabel + '».',
   'نشاطه الحالي: ' + ctx.currentTaskDesc + '.',
   'قواعدك التربوية وأسلوب الإجابة السريع:',
   '1. أجب عن سؤال الطالب بدقة وترحيب، وإذا سألك «اشرح أكثر» فاشرح له بالتفصيل مع مثال عملي عددي.',
   '2. استخدم الأسلوب السقراطي الذكي عند الاستفسار عن حل مسألة: وجهه خطوة بخطوة ولا تعطِه الحل النهائي الجاهز.',
   '3. أجب بلغة عربية فصحى مشجعة وواضحة في 2 إلى 4 جمل مركزة بدون أي رموز إيموجي نهائياً.'
  ].join('\n');
 }

 function buildLocalPedagogicalFallback(kind, userText) {
  const ctx = buildStudentContextSummary();
  const q = String(userText || '').trim().toLowerCase();
  fallbackTurnIndex++;

  if (ctx.lesson === 4) {
   if (kind === 'explain' || q.includes('اشرح') || q.includes('وضح') || q.includes('فهم')) {
    const l4Explanations = [
     'بكل سرور يا ' + ctx.studentName + '! العدد السالب يمثل قيمة أقل من الصفر ونكتب أمامه إشارة (-) مثل -5، أما الأعداد الموجبة فتكون أكبر من الصفر وتقع عن يمين 0 على خط الأعداد.',
     'نقطة المرجع الأساسية يا ' + ctx.studentName + ' هي الصفر (0): في موازين الحرارة يعني درجة التجمد، وفي البحر يعني مستوى سطح البحر، وفي المباني يعني الطابق الأرضي. الصفر نفسه ليس سالبًا ولا موجبًا.',
     'قاعدة خط الأعداد يا ' + ctx.studentName + ': كلما تحركنا يسار 0 تزداد القيمة السالبة بعدًا عن الصفر (-1 ثم -2 ثم -3)، وإذا وقع عددان على المسافة نفسها عن 0 في اتجاهين متعاكسين فهما متعاكسان مثل (+2 و -2).'
    ];
    return l4Explanations[(fallbackTurnIndex - 1) % l4Explanations.length];
   }

   if (kind === 'hint' || q.includes('تلميح') || q.includes('ساعد') || q.includes('كيف احل')) {
    if (q.includes('ميزان') || q.includes('حرارة') || q.includes('نيفين') || q.includes('انخفض')) {
     return 'تلميح سقراطي يا ' + ctx.studentName + ': اقرأ اولًا الدرجة التي يقف عندها الزئبق قبل التغيير (+5 أم 0 أم غيرها؟)، ثم عدّ التدرجات نزولًا إلى الأسفل مروراً بالصفر.';
    }
    if (q.includes('صفر') || q.includes('سطح') || q.includes('يمثل')) {
     return 'تلميح سقراطي يا ' + ctx.studentName + ': اسأل نفسك: ما هي نقطة البداية التي يكون عندها الارتفاع 0 أو الرصيد قبل أي سحب؟ تلك هي دلالة الصفر في الموقف!';
    }
    return 'تلميح سقراطي يا ' + ctx.studentName + ': حدّد أولاً هل الموقع فوق/يمين الصفر (موجب) أم تحت/يسار الصفر (سالب)، ثم ضع إشارة (-) دائمًا عندما تكون القيمة تحت الصفر.';
   }

   if (kind === 'diagnose' || q.includes('شخص') || q.includes('مستوى') || q.includes('اداء')) {
    return 'تحليل مستواك الشخصي يا ' + ctx.studentName + ': جمعت حتى الآن ' + ctx.points + ' نقطة، وتعمل الآن في «' + ctx.nodeTitle + '» ضمن درس الأعداد السالبة. افتح مختبر الأعداد السالبة في أعلى الشاشة لتجربة خط الأعداد وميزان الحرارة عمليًا.';
   }

   const l4General = [
    'أهلاً بك يا ' + ctx.studentName + '! أنا معك في محطة «' + ctx.nodeTitle + '» بدرس الأعداد السالبة. تذكّر أن الأعداد السالبة تقع إلى يسار الصفر وتسبقها إشارة (-).',
    'تلميح مفيد يا ' + ctx.studentName + ': للتمييز السريع بين +5 و -5، انظر إلى موقعهما بالنسبة إلى 0؛ فكلاهما يبعد 5 وحدات عن 0 لكن في اتجاهين متعاكسين.',
    'يمكنك فتح «مختبر الأعداد السالبة» في أي وقت لتحريك النقطة على خط الأعداد أو ضبط ارتفاع الغواصة والطائرة وميزان الحرارة.'
   ];
   return l4General[fallbackTurnIndex % l4General.length];
  }

  if (ctx.lesson === 3) {
   if (kind === 'explain' || q.includes('اشرح') || q.includes('وضح') || q.includes('فهم')) {
    const l3Explanations = [
     'بكل سرور يا ' + ctx.studentName + '! في درس جمع الأعداد الكلية وطرحها نرتّب الأعداد عموديًا من اليمين بحيث يقع الآحاد تحت الآحاد والعشرات تحت العشرات، ثم نبدأ الجمع أو الطرح من منزلة الآحاد باتجاه اليسار.',
     'قاعدة مهمة يا ' + ctx.studentName + ': قبل إجراء الجمع أو الطرح بدقة، نقرّب كل عدد إلى أعلى منزلة فيه لنحصل على ناتج تقديري؛ فإذا كانت الإجابة الدقيقة قريبة من التقدير فهي معقولة.',
     'تذكّر يا ' + ctx.studentName + ': في الجمع إذا بلغ مجموع عمود 10 فأكثر نرفع رقم العشرات (إعادة التجميع)، وفي الطرح إذا كان الرقم العلوي أصغر من السفلي نستلف 1 (= 10) من المنزلة التي عن يساره، وعند المرور بصفر نأخذ من المنزلة غير الصفرية وتتحول الأصفار الوسطى إلى 9.'
    ];
    return l3Explanations[(fallbackTurnIndex - 1) % l3Explanations.length];
   }

   if (kind === 'hint' || q.includes('تلميح') || q.includes('ساعد') || q.includes('كيف احل')) {
    if (q.includes('طرح') || q.includes('استلاف') || q.includes('صفر')) {
     return 'تلميح سقراطي يا ' + ctx.studentName + ': ابدأ من اليمين عمودًا بعمود. إذا كان الرقم العلوي أصغر من السفلي فاضغط زر إعادة التجميع (الاستلاف)، ولا تنسَ أن تتحول الأصفار التي في الوسط إلى 9.';
    }
    if (q.includes('تقدير') || q.includes('معقول') || q.includes('تقريب')) {
     return 'تلميح سقراطي يا ' + ctx.studentName + ': حدّد أعلى منزلة في كل عدد ثم انظر إلى الرقم عن يمينها مباشرة؛ إن كان 5 فأكثر نزد واحدًا إلى أعلى منزلة ونضع أصفارًا، وإن كان أقل من 5 نبقها كما هي.';
    }
    return 'تلميح سقراطي يا ' + ctx.studentName + ': في المسائل العمودية ابدأ دائمًا من منزلة الآحاد (أقصى اليمين) وانتبه للأرقام المعاد تجميعها (الحمل في الجمع أو الاستلاف في الطرح) فوق كل عمود.';
   }

   if (kind === 'diagnose' || q.includes('شخص') || q.includes('مستوى') || q.includes('اداء')) {
    return 'تحليل مستواك الشخصي يا ' + ctx.studentName + ': جمعت حتى الآن ' + ctx.points + ' نقطة، وتعمل الآن في «' + ctx.nodeTitle + '». التركيز الأساسي هنا على «' + ctx.weakLabel + '». واصل حل المحطات خطوة بخطوة واختبر معقولية كل ناتج بالتقدير.';
   }

   const l3General = [
    'أهلاً بك يا ' + ctx.studentName + '! أنا معك في محطة «' + ctx.nodeTitle + '» بدرس جمع الأعداد الكلية وطرحها. يمكنك استخدام «مختبر الجمع والطرح» من أعلى الشاشة لتجربة أي مثال خطوة بخطوة.',
    'فكرة ذهبية للتحقق يا ' + ctx.studentName + ': للتحقق من صحة عملية الطرح، اجمع المطروح مع الناتج؛ إذا حصلت على المطروح منه فإن حلك صحيح 100%.',
    'تنبيه عند جمع أعداد مختلفة في عدد المنازل يا ' + ctx.studentName + ': حاذِ الأرقام من اليمين (الآحاد تحت الآحاد) دائمًا كما في جمع مساحات الدول أو أرباح الشركة.'
   ];
   return l3General[fallbackTurnIndex % l3General.length];
  }

  if (kind === 'explain' || q.includes('اشرح') || q.includes('وضح') || q.includes('فهم')) {
   const explanations = [
    'بكل سرور يا ' + ctx.studentName + '! في درس الملايين نقسم أي عدد من اليمين إلى دورات ثلاثية: 1. دورة الآحاد (آحاد، عشرات، مئات). 2. دورة الألوف (آحاد الألوف، عشرات الألوف، مئات الألوف). 3. دورة الملايين (آحاد الملايين، عشرات الملايين، مئات الملايين). لقراءة أي عدد، نبدأ من الدورة الأكبر يساراً ثم التي تليها.',
    'توضيح إضافي يا ' + ctx.studentName + ': كل منزلة على اليسار تكبر المنزلة التي على يمينها بعشرة أضعاف (×10). فالرقم 5 في الآحاد قيمته 5، وفي العشرات 50، وفي المئات 500، وفي آحاد الألوف 5,000، وفي آحاد الملايين 5,000,000! هل تود أن نختبر رقماً محدداً؟',
    'مثال عملي يا ' + ctx.studentName + ': العدد 3,450,210 يُقرأ: ثلاثة ملايين وأربعمائة وخمسون ألفاً ومئتان وعشرة. الرقم 3 في منزلة آحاد الملايين وقيمته 3,000,000.'
   ];
   return explanations[(fallbackTurnIndex - 1) % explanations.length];
  }

  if (kind === 'hint' || q.includes('تلميح') || q.includes('ساعد') || q.includes('كيف احل')) {
   try {
    const s = currentStep();
    if (s && s.n) {
     const p = s.p ?? 5;
     const d = digit(s.n, p);
     return 'تلميح سقراطي لمسألتك الحالية يا ' + ctx.studentName + ': انظر إلى الرقم (' + d + ') في العدد (' + fmt(s.n) + '). عدّ كم رقماً يقع على يمينه؛ عدد الأرقام على اليمين يخبرك بعدد الأصفار في قيمته المنزلية (' + places[p] + '). كم صفراً وجدت؟';
    }
   } catch {}
   return 'تلميح ذكي يا ' + ctx.studentName + ': حدّد أولاً الدورة التي يقع فيها الرقم (الآحاد أم الألوف أم الملايين)، ثم استبدل كل رقم على يمينه بصفر لتحصل على قيمته المنزلية بدقة.';
  }

  if (kind === 'diagnose' || q.includes('شخص') || q.includes('مستوى') || q.includes('اداء')) {
   return 'تحليل مستواك الشخصي يا ' + ctx.studentName + ': جمعت حتى الآن ' + ctx.points + ' نقطة وأنجزت ' + ctx.completedCount + ' من 12 مهمة. مهارتك الأجدر بالتركيز الآن هي «' + ctx.weakLabel + '». اضغط زر «ولّد لي مسألة مخصصة لمهارتي» لنتدرب عليها فوراً!';
  }

  if (q.includes('صيغة') || q.includes('تحليل') || q.includes('قياس') || q.includes('لفظ')) {
   return 'للأعداد ثلاث صيغ رئيسية يا ' + ctx.studentName + ': 1. الصيغة القياسية: كتابة العدد بالأرقام مثل 2,450,000. 2. الصيغة اللفظية: كتابة العدد بالكلمات. 3. الصيغة التحليلية: كتابة العدد كمجموع قيم أرقامه (مثل 2,000,000 + 400,000 + 50,000).';
  }

  const generalResponses = [
   'أهلاً بك يا ' + ctx.studentName + '! أنا معك خطوة بخطوة في محطة «' + ctx.nodeTitle + '». يمكنك أن تسألني عن أي عدد أو منزلة وسأشرحها لك.',
   'معلومة رياضية ذكية يا ' + ctx.studentName + ': المليون هو عدد مكوّن من 7 منازل، وهو أصغر عدد في دورة الملايين (1 متبوع بستة أصفار: 1,000,000).',
   'مرحباً يا بطل الأعداد! تذكّر دائماً: عند كتابة أي عدد بالصيغة التحليلية، نهمل المنازل التي تحتوي على الرقم صفر لأن قيمتها صفر.'
  ];
  return generalResponses[fallbackTurnIndex % generalResponses.length];
 }

 function stripEmojisClean(str) {
  return String(str || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu, '');
 }

 function appendMessage(role, text, quizData) {
  if (!logEl) return null;
  const cleanText = stripEmojisClean(text);
  const wrap = document.createElement('div');
  wrap.className = 'ai-msg ' + (role === 'user' ? 'user' : 'assistant');

  const head = document.createElement('div');
  head.className = 'ai-msg-head';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = role === 'user' ? 'أنت' : (apiKey ? ('المعلم الذكي (' + selectedModel + ')') : 'المعلم الذكي (المرشد المدمج)');
  head.append(titleSpan);

  let speakBtn = null;
  if (role === 'assistant') {
   speakBtn = document.createElement('button');
   speakBtn.type = 'button';
   speakBtn.className = 'ai-msg-speak';
   speakBtn.innerHTML = getIconSVG('sound') + '<span>استمع</span>';
   speakBtn.addEventListener('click', () => {
    speakWithGeminiFirst(body.textContent);
   });
   head.append(speakBtn);
  }

  const body = document.createElement('div');
  body.className = 'ai-msg-body';
  body.textContent = cleanText;
  wrap.append(head, body);

  if (quizData && Array.isArray(quizData.options)) {
   ensureAiQuizDay();
   const card = document.createElement('div');
   card.className = 'ai-quiz-card';
   if (quizData.id) card.dataset.quizId = String(quizData.id);

   if ((state.aiQuiz?.rewarded || 0) >= 3) {
    const capBadge = document.createElement('div');
    capBadge.className = 'ai-quiz-cap-badge';
    capBadge.textContent = 'أنهيت مكافآت اليوم (3 من 3)، والتدريب ما زال متاحاً بلا نقاط';
    card.append(capBadge);
   }

   const qTitle = document.createElement('h4');
   qTitle.textContent = stripEmojisClean(quizData.question);
   const optsBox = document.createElement('div');
   optsBox.className = 'ai-quiz-opts';
   const explainEl = document.createElement('p');
   explainEl.style.cssText = 'font-size:11.5px;margin:7px 0 0;color:#235718;font-weight:700';
   explainEl.hidden = true;

   quizData.options.forEach((optText, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ai-quiz-opt';
    b.textContent = stripEmojisClean(optText);
    b.addEventListener('click', () => {
     if (optsBox.dataset.answered === 'true') return;
     if (idx === Number(quizData.correctIndex)) {
      optsBox.dataset.answered = 'true';
      b.classList.add('correct');
      sound(true);

      ensureAiQuizDay();
      const qId = String(quizData.id || '');
      const alreadyRewarded = qId && state.aiQuiz.seen.includes(qId);
      const capReached = (state.aiQuiz.rewarded >= 3);

      let rewardText = '';
      if (!capReached && !alreadyRewarded) {
       state.infiniteStats.bonusPoints += 10;
       state.aiQuiz.rewarded += 1;
       if (qId) {
        state.aiQuiz.seen.push(qId);
        if (state.aiQuiz.seen.length > 100) state.aiQuiz.seen.shift();
       }
       renderHUD();
       updateContextUI();
       saveState();
       rewardText = 'إجابة صحيحة! +10 نقاط مكافأة. ';
      } else if (capReached) {
       saveState();
       rewardText = 'إجابة صحيحة! أنهيت مكافآت اليوم (3 من 3)، والتدريب ما زال متاحاً بلا نقاط. ';
      } else {
       saveState();
       rewardText = 'إجابة صحيحة! (تم احتساب مكافأة هذه المسألة سابقاً). ';
      }

      explainEl.hidden = false;
      explainEl.textContent = rewardText + stripEmojisClean(quizData.explanation || '');
     } else {
      b.classList.add('wrong');
      sound(false);
      explainEl.hidden = false;
      explainEl.textContent = 'حاول مرة أخرى! تذكّر عدّ المنازل على يمين الرقم.';
     }
    });
    optsBox.append(b);
   });

   card.append(qTitle, optsBox, explainEl);
   wrap.append(card);
  }

  logEl.append(wrap);
  logEl.scrollTop = logEl.scrollHeight;
  return { wrapEl: wrap, bodyEl: body, speakBtn, headEl: head };
 }

 // 1) Interactions API streaming engine
 async function streamWithInteractionsAPI(promptText, onChunk, onThought) {
  const sysInstruction = buildSystemInstruction();
  const isLite = selectedModel === 'gemini-3.5-flash-lite';
  const payload = {
   model: selectedModel,
   input: promptText,
   system_instruction: sysInstruction,
   stream: true,
   generation_config: {
    thinking_level: isLite ? 'minimal' : 'low',
    max_output_tokens: 1500
   }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions?key=' + encodeURIComponent(apiKey);
  const res = await fetch(endpoint, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
   },
   body: JSON.stringify(payload),
   signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
   let errMsg = 'HTTP ' + res.status;
   try {
    const errObj = await res.json();
    if (errObj && errObj.error && errObj.error.message) errMsg = errObj.error.message;
   } catch {}
   throw new Error(errMsg);
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
   buffer = lines.pop();

   for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
     const jsonStr = trimmed.slice(5).trim();
     if (!jsonStr) continue;
     try {
      const ev = JSON.parse(jsonStr);
      if (ev.event_type === 'step.delta' && ev.delta) {
       if (ev.delta.type === 'text') {
        const textChunk = stripEmojisClean(ev.delta.text || '');
        if (textChunk) {
         accumulated += textChunk;
         onChunk(accumulated);
        }
       } else if (ev.delta.type === 'thought_summary' && ev.delta.content && ev.delta.content.text) {
        if (!accumulated && onThought) onThought(stripEmojisClean(ev.delta.content.text));
       }
      }
     } catch {}
    }
   }
  }
  return accumulated;
 }

 // 2) Classic GenerateContent streaming engine (universal fallback)
 async function streamWithGenerateContentAPI(promptText, onChunk) {
  const sysInstruction = buildSystemInstruction();
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(selectedModel) + ':streamGenerateContent?key=' + encodeURIComponent(apiKey) + '&alt=sse';
  const payload = {
   system_instruction: { parts: [{ text: sysInstruction }] },
   contents: [{ role: 'user', parts: [{ text: promptText }] }],
   generationConfig: {
    maxOutputTokens: 1200
   }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  const res = await fetch(endpoint, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
   },
   body: JSON.stringify(payload),
   signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
   let errMsg = 'HTTP ' + res.status;
   try {
    const errObj = await res.json();
    if (errObj && errObj.error && errObj.error.message) errMsg = errObj.error.message;
   } catch {}
   throw new Error(errMsg);
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
   buffer = lines.pop();

   for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
     const jsonStr = trimmed.slice(5).trim();
     if (!jsonStr) continue;
     try {
      const ev = JSON.parse(jsonStr);
      if (ev.candidates && ev.candidates[0] && ev.candidates[0].content && Array.isArray(ev.candidates[0].content.parts)) {
       ev.candidates[0].content.parts.forEach(p => {
        if (p.text) {
         accumulated += stripEmojisClean(p.text);
         onChunk(accumulated);
        }
       });
      }
     } catch {}
    }
   }
  }
  return accumulated;
 }

 async function handleUserQuestion(promptText, fallbackKind) {
  if (isBusy || !promptText.trim()) return;
  appendMessage('user', promptText);

  // If no API key is entered, use the dynamic intelligent local tutor
  if (!apiKey) {
   const reply = buildLocalPedagogicalFallback(fallbackKind || 'chat', promptText);
   appendMessage('assistant', reply);
   return;
  }

  isBusy = true;
  if (sendBtn) sendBtn.disabled = true;

  const msgHandle = appendMessage('assistant', 'المعلم الذكي يحلل سؤالك الآن...');
  let firstChunkReceived = false;

  const onChunk = currentFullText => {
   if (!firstChunkReceived) {
    firstChunkReceived = true;
    msgHandle.bodyEl.textContent = '';
   }
   msgHandle.bodyEl.textContent = currentFullText;
   if (logEl) logEl.scrollTop = logEl.scrollHeight;
  };

  const onThought = thoughtText => {
   if (!firstChunkReceived && thoughtText) {
    msgHandle.bodyEl.textContent = 'يفكّر تربوياً: ' + thoughtText.slice(0, 110) + '...';
   }
  };

  try {
   // Primary: Interactions API
   let text = await streamWithInteractionsAPI(promptText, onChunk, onThought);
   if (!text && !firstChunkReceived) {
    // Secondary: StreamGenerateContent fallback
    text = await streamWithGenerateContentAPI(promptText, onChunk);
   }
   if (!text && !firstChunkReceived) {
    msgHandle.bodyEl.textContent = buildLocalPedagogicalFallback(fallbackKind || 'chat', promptText);
   }
  } catch (err) {
   try {
    // Fallback to streamGenerateContent
    const text = await streamWithGenerateContentAPI(promptText, onChunk);
    if (!text && !firstChunkReceived) {
     msgHandle.bodyEl.textContent = buildLocalPedagogicalFallback(fallbackKind || 'chat', promptText);
    }
   } catch (err2) {
    const fallback = buildLocalPedagogicalFallback(fallbackKind || 'chat', promptText);
    const errDetail = (err2 && err2.message) ? (' (' + err2.message + ')') : '';
    msgHandle.bodyEl.textContent = fallback + (errDetail.includes('API key') ? ' [تنبيه: تحقق من صحة مفتاح Gemini في الإعدادات]' : '');
   }
  } finally {
   isBusy = false;
   if (sendBtn) sendBtn.disabled = false;
  }
 }

 const recentCustomQuizIds = [];

 function randCustomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
 }

 function shuffleCustomArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
 }

 function generateLocalCustomQuiz(weakKey) {
  let skill = weakKey;
  if (!SKILL_LABELS[skill]) {
   const keys = Object.keys(SKILL_LABELS);
   skill = keys[randCustomInt(0, keys.length - 1)];
  }

  for (let attempt = 0; attempt < 10; attempt++) {
   let qObj = null;

   if (skill === 'place') {
    const len = randCustomInt(7, 9);
    const min = 10 ** (len - 1);
    const max = (10 ** len) - 1;
    const n = randCustomInt(min, max);
    const nonZeroP = [];
    for (let p = 0; p < len; p++) {
     if (digit(n, p) !== 0) nonZeroP.push(p);
    }
    const p = nonZeroP[randCustomInt(0, nonZeroP.length - 1)];
    const d = digit(n, p);
    const correctVal = d * (10 ** p);
    const correctStr = fmt(correctVal);

    const wrongCandidates = new Set();
    const powers = [
     p + 1 <= 8 ? p + 1 : p - 1,
     p - 1 >= 0 ? p - 1 : p + 2,
     (p + 3) % 9,
     (p + 6) % 9,
     0
    ];
    for (let k = 0; k < 9; k++) powers.push(k);
    for (const pw of powers) {
     if (pw !== p) {
      const val = d * (10 ** pw);
      const s = fmt(val);
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    const wrongArr = Array.from(wrongCandidates);
    if (wrongArr.length < 3) continue;
    const chosenWrong = shuffleCustomArray(wrongArr).slice(0, 3);
    const allOpts = shuffleCustomArray([correctStr, ...chosenWrong]);

    qObj = {
     id: 'place_' + n + '_' + p,
     skill: 'place',
     intro: 'مسألة سريعة لتقوية مهارة «' + SKILL_LABELS.place + '»:',
     question: 'ما القيمة المنزلية للرقم ' + d + ' في العدد ' + fmt(n) + '؟',
     options: allOpts,
     correctIndex: allOpts.indexOf(correctStr),
     explanation: 'الرقم ' + d + ' يقع في منزلة ' + places[p] + '، لذلك قيمته المنزلية هي ' + correctStr + '.'
    };
   } else if (skill === 'verbal') {
    const M = randCustomInt(1, 999);
    const K = randCustomInt(1, 999);
    const O = randCustomInt(1, 999);
    const n = M * 1000000 + K * 1000 + O;
    const correctStr = words(n);

    const wrongCandidates = new Set();
    const candNums = [
     K * 1000000 + M * 1000 + O,
     M * 1000000 + O * 1000 + K,
     M * 1000000 + (K > 50 ? K - 20 : K + 50) * 1000 + O,
     (M > 50 ? M - 20 : M + 50) * 1000000 + K * 1000 + O,
     M * 1000000 + K * 1000 + (O > 50 ? O - 20 : O + 50),
     n + (n + 100000 <= 999999999 ? 100000 : -100000),
     n + (n + 10000 <= 999999999 ? 10000 : -10000),
     n + (n + 100 <= 999999999 ? 100 : -100)
    ];
    for (const cn of candNums) {
     if (cn >= 1000000 && cn <= 999999999 && cn !== n) {
      const w = words(cn);
      if (w && w !== correctStr) wrongCandidates.add(w);
     }
    }
    const wrongArr = Array.from(wrongCandidates);
    if (wrongArr.length < 3) continue;
    const chosenWrong = shuffleCustomArray(wrongArr).slice(0, 3);
    const allOpts = shuffleCustomArray([correctStr, ...chosenWrong]);

    qObj = {
     id: 'verbal_' + n,
     skill: 'verbal',
     intro: 'مسألة سريعة لتقوية مهارة «' + SKILL_LABELS.verbal + '»:',
     question: 'اختر الصيغة اللفظية الصحيحة للعدد ' + fmt(n) + ':',
     options: allOpts,
     correctIndex: allOpts.indexOf(correctStr),
     explanation: 'نقرأ العدد دورة دورة من اليسار إلى اليمين: ' + correctStr + '.'
    };
   } else if (skill === 'standard') {
    const M = randCustomInt(1, 999);
    const K = randCustomInt(1, 999);
    const O = randCustomInt(1, 999);
    const n = M * 1000000 + K * 1000 + O;
    const verbalText = words(n);
    const correctStr = fmt(n);

    const wrongCandidates = new Set();
    const candNums = [
     K * 1000000 + M * 1000 + O,
     M * 1000000 + O * 1000 + K,
     M * 1000000 + Math.min(999, K * 10) * 1000 + O,
     M * 1000000 + Math.max(1, Math.floor(K / 10)) * 1000 + O,
     (M > 10 ? Math.floor(M / 10) : M * 10) * 1000000 + K * 1000 + O,
     n + (n + 100000 <= 999999999 ? 100000 : -100000),
     n + (n + 10000 <= 999999999 ? 10000 : -10000),
     n + (n + 100 <= 999999999 ? 100 : -100)
    ];
    for (const cn of candNums) {
     if (cn >= 1000000 && cn <= 999999999 && cn !== n) {
      const s = fmt(cn);
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    const wrongArr = Array.from(wrongCandidates);
    if (wrongArr.length < 3) continue;
    const chosenWrong = shuffleCustomArray(wrongArr).slice(0, 3);
    const allOpts = shuffleCustomArray([correctStr, ...chosenWrong]);

    qObj = {
     id: 'standard_' + n,
     skill: 'standard',
     intro: 'مسألة سريعة لتقوية مهارة «' + SKILL_LABELS.standard + '»:',
     question: 'اختر العدد المكتوب بالكلمات: «' + verbalText + '»:',
     options: allOpts,
     correctIndex: allOpts.indexOf(correctStr),
     explanation: 'العدد بالصيغة القياسية هو ' + correctStr + ' (دورة الملايين: ' + fmt(M) + '، ودورة الألوف: ' + fmt(K) + '، ودورة الوحدات: ' + fmt(O) + ').'
    };
   } else if (skill === 'expanded') {
    const len = randCustomInt(7, 9);
    const leadDigit = randCustomInt(1, 9);
    let n = leadDigit * (10 ** (len - 1));
    const termCount = randCustomInt(3, Math.min(5, len - 1));
    const positions = shuffleCustomArray(Array.from({length: len - 1}, (_, i) => i)).slice(0, termCount);
    for (const p of positions) {
     n += randCustomInt(1, 9) * (10 ** p);
    }
    const terms = expansion(n);
    const correctStr = terms.map(t => fmt(t.value)).join(' + ');

    const wrongCandidates = new Set();
    for (let i = 0; i < terms.length; i++) {
     if (terms[i].p >= 2) {
      const modTerms = terms.map((t, idx) => idx === i ? Math.floor(t.value / 10) : t.value);
      const s = modTerms.map(v => fmt(v)).join(' + ');
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    for (let i = 0; i < terms.length; i++) {
     if (terms[i].p <= 7) {
      const modTerms = terms.map((t, idx) => idx === i ? t.value * 10 : t.value);
      const s = modTerms.map(v => fmt(v)).join(' + ');
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    if (terms.length > 3) {
     for (let i = 0; i < terms.length; i++) {
      const modTerms = terms.filter((_, idx) => idx !== i).map(t => t.value);
      const s = modTerms.map(v => fmt(v)).join(' + ');
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    for (let i = 0; i < terms.length; i++) {
     if (terms[i].p >= 3) {
      const modTerms = terms.map((t, idx) => idx === i ? Math.floor(t.value / 100) : t.value);
      const s = modTerms.map(v => fmt(v)).join(' + ');
      if (s !== correctStr) wrongCandidates.add(s);
     }
    }
    const wrongArr = Array.from(wrongCandidates);
    if (wrongArr.length < 3) continue;
    const chosenWrong = shuffleCustomArray(wrongArr).slice(0, 3);
    const allOpts = shuffleCustomArray([correctStr, ...chosenWrong]);

    qObj = {
     id: 'expanded_' + n,
     skill: 'expanded',
     intro: 'مسألة سريعة لتقوية مهارة «' + SKILL_LABELS.expanded + '»:',
     question: 'اختر الصيغة التحليلية الصحيحة للعدد ' + fmt(n) + ':',
     options: allOpts,
     correctIndex: allOpts.indexOf(correctStr),
     explanation: 'الصيغة التحليلية هي كتابة العدد بالصورة الموسعة كمجموع للقيم المنزلية لجميع أرقامه: ' + correctStr + '.'
    };
   }

   if (qObj) {
    if (!recentCustomQuizIds.includes(qObj.id) || attempt === 9) {
     recentCustomQuizIds.push(qObj.id);
     if (recentCustomQuizIds.length > 20) recentCustomQuizIds.shift();
     return qObj;
    }
   }
  }
 }

 function handleCustomQuizRequest() {
  ensureAiQuizDay();
  const ctx = buildStudentContextSummary();
  appendMessage('user', 'ولّد لي مسألة تدريبية مخصصة لمهارتي (' + ctx.weakLabel + ').');
  const q = generateLocalCustomQuiz(ctx.weakKey);
  appendMessage('assistant', q.intro, q);
 }

 function openAiTutor(initialAction) {
  if (!sheet) return;
  updateContextUI();
  if (logEl && logEl.children.length === 0) {
   const ctx = buildStudentContextSummary();
   appendMessage('assistant', 'أهلاً بك يا ' + ctx.studentName + '! أنا معلمك الذكي المدعوم بـ Gemini. أراك الآن في محطة «' + ctx.nodeTitle + '». كيف تحب أن أساعدك اليوم؟');
  }
  if (!sheet.open) sheet.showModal();
  if (initialAction === 'hint') {
   handleUserQuestion('أعطني تلميحاً سقراطياً ذكياً لمسألتي الحالية دون كشف الإجابة النهائية.', 'hint');
  }
 }

 window.openAiTutor = openAiTutor;

 if ($('ai-tutor-hud-btn')) $('ai-tutor-hud-btn').addEventListener('click', () => openAiTutor());
 if ($('station-ai-btn')) $('station-ai-btn').addEventListener('click', () => openAiTutor());
 if ($('ai-floating-fab')) $('ai-floating-fab').addEventListener('click', () => openAiTutor());
 document.addEventListener('click', e => {
  const aiTrigger = e.target instanceof Element ? e.target.closest('[data-open-ai]') : null;
  if (aiTrigger) {
   e.stopPropagation();
   openAiTutor();
  }
 });
 if ($('ask-ai-coach-btn')) $('ask-ai-coach-btn').addEventListener('click', () => openAiTutor('hint'));
 if ($('ai-tutor-close')) $('ai-tutor-close').addEventListener('click', () => sheet.close());
 if (sheet) sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });

 if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener('click', () => {
   const willOpen = settingsPanel.hidden;
   settingsPanel.hidden = !willOpen;
   settingsBtn.setAttribute('aria-expanded', String(willOpen));
   updateContextUI();
  });
 }

 // Auto-save on input, change, and button click
 function saveApiKeyFromInput() {
  if (!keyInput) return;
  apiKey = keyInput.value.trim();
  previousInteractionId = null;
  setGeminiApiKey(apiKey);
  updateContextUI();
 }

 if (keyInput) {
  keyInput.addEventListener('input', saveApiKeyFromInput);
  keyInput.addEventListener('change', saveApiKeyFromInput);
 }

 if (saveKeyBtn) {
  saveKeyBtn.addEventListener('click', () => {
   saveApiKeyFromInput();
   appendMessage('assistant', apiKey ? 'تم حفظ مفتاح Gemini API بنجاح! تم تفعيل التدفق المباشر فائق السرعة عبر ' + selectedModel + '.' : 'تم مسح المفتاح والعودة لوضع المرشد المدمج.');
  });
 }

 document.querySelectorAll('.ai-model-btn[data-ai-model]').forEach(btn => {
  btn.addEventListener('click', () => {
   const m = btn.dataset.aiModel;
   if (m && VALID_MODELS.includes(m)) {
    selectedModel = m;
    previousInteractionId = null;
    try { localStorage.setItem(AI_MODEL_STORAGE, selectedModel); } catch {}
    updateContextUI();
   }
  });
 });

 document.querySelectorAll('.ai-tts-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
   const mode = btn.dataset.ttsMode;
   if (mode && VALID_TTS_MODES.includes(mode)) {
    selectedTtsMode = mode;
    try { localStorage.setItem(AI_TTS_MODE_STORAGE, selectedTtsMode); } catch {}
    updateContextUI();
   }
  });
 });

 document.querySelectorAll('.ai-tts-voice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
   const v = btn.dataset.ttsVoice;
   if (v && VALID_TTS_VOICES.includes(v)) {
    selectedTtsVoice = v;
    try { localStorage.setItem(AI_TTS_VOICE_STORAGE, selectedTtsVoice); } catch {}
    updateContextUI();
   }
  });
 });

 if ($('ai-clear-chat')) {
  $('ai-clear-chat').addEventListener('click', () => {
   previousInteractionId = null;
   if (logEl) logEl.replaceChildren();
   const ctx = buildStudentContextSummary();
   appendMessage('assistant', 'بدأنا جلسة إرشاد جديدة في محطة «' + ctx.nodeTitle + '». اسألني ما تشاء!');
  });
 }

 document.querySelectorAll('#ai-quick-chips .ai-chip').forEach(chip => {
  chip.addEventListener('click', () => {
   const kind = chip.dataset.aiPrompt;
   if (kind === 'custom-quiz') {
    handleCustomQuizRequest();
   } else if (kind === 'explain') {
    handleUserQuestion('اشرح لي فكرة المحطة الحالية (' + buildStudentContextSummary().nodeTitle + ') بأسلوب مبسط مع مثال.', 'explain');
   } else if (kind === 'hint') {
    handleUserQuestion('أعطني تلميحاً ذكياً يساعدني على حل المسألة الحالية بنفسي دون ذكر الحل النهائي.', 'hint');
   } else if (kind === 'diagnose') {
    handleUserQuestion('حلّل أدائي في المهارات الأربع واقترح عليّ خطة تعلم مخصصة لتحسين نقاط ضعفي.', 'diagnose');
   }
  });
 });

 if (formEl && inputEl) {
  formEl.addEventListener('submit', e => {
   e.preventDefault();
   const q = inputEl.value.trim();
   if (!q) return;
   inputEl.value = '';
   handleUserQuestion(q, 'chat');
  });
 }
})();
