/* Lesson 1 Unified Learning & Result Runner */
(function (global) {
  'use strict';

  const DIGIT_AR = /[\u0660-\u0669]/g;
  const DIGIT_FA = /[\u06F0-\u06F9]/g;

  const CYCLE_META = [
    { key: 'ones', name: 'دورة الآحاد', short: 'الآحاد', range: [2, 1, 0], cls: 'cycle-ones' },
    { key: 'thousands', name: 'دورة الألوف', short: 'الألوف', range: [5, 4, 3], cls: 'cycle-thousands' },
    { key: 'millions', name: 'دورة الملايين', short: 'الملايين', range: [8, 7, 6], cls: 'cycle-millions' }
  ];

  const ALL_PLACE_SHORT = ['آحاد', 'عشرات', 'مئات', 'آحاد', 'عشرات', 'مئات', 'آحاد', 'عشرات', 'مئات'];

  const GRADUAL_STEPS = [
    {
      step: 0,
      targetPlace: 6,
      n: 1000000,
      badge: 'اكتشاف الملايين · ١ من ٤',
      prompt: 'أين يقع الرقم 1 في العدد 1,000,000؟ اختر خانته في لوحة المنازل.',
      hint: 'الرقم 1 هو سابع خانة من اليمين في بداية دورة الملايين.',
      takeaway: 'العدد 1,000,000 له 6 أصفار، ويسكن في «آحاد الملايين».'
    },
    {
      step: 1,
      targetPlace: 6,
      n: 2051841,
      badge: 'اكتشاف الملايين · ٢ من ٤',
      prompt: 'في العدد 2,051,841: أين يسكن الرقم 2؟',
      hint: 'تقع الملايين يسار دورة الألوف مباشرة في خانة آحاد الملايين.',
      takeaway: 'كل 3 منازل متجاورة تشكّل دورة: الآحاد، ثم الألوف، ثم الملايين.'
    },
    {
      step: 2,
      targetPlace: 7,
      n: 10579747,
      badge: 'اكتشاف الملايين · ٣ من ٤',
      prompt: 'في عدد سكان المملكة 10,579,747: اختر منزلة «عشرات الملايين».',
      hint: 'عشرات الملايين هي الخانة الثامنة من اليمين (يسار آحاد الملايين).',
      takeaway: 'عشرات الملايين تساوي عشرة أمثال آحاد الملايين (× 10).'
    },
    {
      step: 3,
      targetPlace: 8,
      n: 645230697,
      badge: 'اكتشاف الملايين · ٤ من ٤',
      prompt: 'في العدد 645,230,697: اختر منزلة «مئات الملايين».',
      hint: 'مئات الملايين هي الخانة التاسعة والأخيرة إلى اليسار.',
      takeaway: 'دورة الملايين تكتمل بثلاثة بيوت: آحاد، وعشرات، ومئات الملايين.'
    }
  ];

  const BRIDGE_LEVELS = [
    {
      level: 0,
      cardUnit: 1000,
      targetVal: 10000,
      fromPlace: 'آحاد الألوف',
      toPlace: 'عشرات الألوف',
      prompt: 'اجمع 10 بطاقات من فئة 1,000 لتكوين بطاقة واحدة في عشرات الألوف.',
      summary: '10 بطاقات بقيمة 1,000 تتجمع لتكوّن 10,000 (عشرات الألوف).'
    },
    {
      level: 1,
      cardUnit: 10000,
      targetVal: 100000,
      fromPlace: 'عشرات الألوف',
      toPlace: 'مئات الألوف',
      prompt: 'اجمع 10 بطاقات من فئة 10,000 لتكوين بطاقة واحدة في مئات الألوف.',
      summary: '10 بطاقات بقيمة 10,000 تتجمع لتكوّن 100,000 (مئات الألوف).'
    },
    {
      level: 2,
      cardUnit: 100000,
      targetVal: 1000000,
      fromPlace: 'مئات الألوف',
      toPlace: 'آحاد الملايين',
      prompt: 'اجمع 10 بطاقات من فئة 100,000 لنفتح أول بيت في دورة الملايين.',
      summary: '10 بطاقات بقيمة 100,000 تتجمع لتكوّن 1,000,000 (مليونًا واحدًا).'
    }
  ];

  let session = null;
  let stepUi = null;
  let renderToken = 0;
  let rapidInterval = null;
  let isSubmitting = false;
  let inertElements = [];
  let vpBound = false;
  let wheelDrag = null;
  let audioTimer = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function normalizeDigits(raw) {
    if (raw === null || raw === undefined) return '';
    return String(raw)
      .replace(DIGIT_AR, d => String(d.charCodeAt(0) - 1632))
      .replace(DIGIT_FA, d => String(d.charCodeAt(0) - 1776));
  }

  function parseRunnerNum(raw) {
    const cleaned = normalizeDigits(raw).replace(/[\s,،._\u066C]/g, '').trim();
    if (!cleaned || !/^\d+$/.test(cleaned)) return null;
    const val = Number(cleaned);
    return Number.isSafeInteger(val) ? val : null;
  }

  function bdiNum(n) {
    return '<bdi class="l1-bdi-num" dir="ltr">' + fmt(n) + '</bdi>';
  }

  function sanitizePlainText(raw) {
    return String(raw ?? '')
      .replace(/<\/?bdi[^>]*>/gi, '')
      .replace(/&gt;/gi, '>')
      .replace(/&lt;/gi, '<')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&');
  }

  function wrapStandaloneAngles(html) {
    return html.replace(/(<bdi\b[^>]*>[\s\S]*?<\/bdi>)|(&gt;|&lt;)/g, (full, bdiBlock, angle) => {
      if (bdiBlock) return bdiBlock;
      return '<bdi class="l1-bdi-nowrap" dir="ltr">' + angle + '</bdi>';
    });
  }

  function l2BidiTextHTML(raw) {
    const normalized = sanitizePlainText(raw).replace(/\s*->\s*/g, ' → ');
    const safe = esc(normalized);
    const withNums = safe.replace(/(?:[+\-\u2212]?[\d□][\d,□]*(?:\s*(?:&gt;=|&lt;=|&gt;|&lt;|=|→|\+|-|\u2212|×|÷|\/|\[\s*[?؟]\s*\])\s*[+\-\u2212]?[\d□][\d,□]*)*(?:°[CF])?|°[CF])/g, m => {
      const plainLen = m.replace(/&(?:gt|lt);/g, '<').length;
      const isCmp = /(&gt;|&lt;|=|→|\[\s*[?؟]\s*\])/.test(m) && !/\+/.test(m) && plainLen <= 30;
      const cls = isCmp
        ? ' class="l1-bdi-nowrap l1-bdi-cmp"'
        : (plainLen <= 28 ? ' class="l1-bdi-nowrap"' : '');
      return '<bdi' + cls + ' dir="ltr">' + m + '</bdi>';
    });
    return wrapStandaloneAngles(withNums);
  }

  function formatPromptHTML(raw) {
    const normalized = sanitizePlainText(raw).replace(/\s*->\s*/g, ' → ');
    const safe = esc(normalized);
    const withNums = safe.replace(/(?:[+\-\u2212]?[\d□][\d,□]*(?:\s*(?:[×+\-\u2212÷=→]|&lt;=|&gt;=|&lt;|&gt;|\[\s*[?؟]\s*\])\s*[+\-\u2212]?[\d□][\d,□]*)*(?:°[CF])?|°[CF])/g, m => {
      const plainLen = m.replace(/&(?:gt|lt);/g, '<').length;
      const isCmp = /(&gt;|&lt;|=|→|\[\s*[?؟]\s*\])/.test(m) && !/\+/.test(m) && plainLen <= 30;
      const cls = 'l1-inline-num' + (isCmp ? ' l1-bdi-nowrap l1-bdi-cmp' : (plainLen <= 28 ? ' l1-bdi-nowrap' : ''));
      return '<bdi class="' + cls + '" dir="ltr">' + m + '</bdi>';
    });
    return wrapStandaloneAngles(withNums);
  }

  function highlightedNumberHTML(n, targetPlace) {
    if (targetPlace === undefined || targetPlace === null) {
      return '<div class="l1-big-num" dir="ltr">' + fmt(n) + '</div>';
    }
    return '<div class="l1-big-num" dir="ltr">' + marked(n, targetPlace) + '</div>';
  }

  function syncViewportHeight() {
    const root = document.documentElement;
    const body = document.body;
    const vv = global.visualViewport;
    const rootZoom = Number.parseFloat(root.style.zoom || getComputedStyle(root).zoom) || 1;
    const bodyZoom = Number.parseFloat(body?.style.zoom || (body ? getComputedStyle(body).zoom : '')) || 1;
    const rawZoom = rootZoom * bodyZoom;
    const h = vv ? vv.height / rawZoom : (global.innerHeight / rawZoom);
    if (h > 180) {
      root.style.setProperty('--l1-vvh', Math.floor(h) + 'px');
    }
  }
  global.syncL1ViewportHeight = syncViewportHeight;

  function ensureViewportSync() {
    syncViewportHeight();
    if (vpBound) return;
    vpBound = true;
    global.addEventListener('resize', syncViewportHeight);
    if (global.visualViewport) {
      global.visualViewport.addEventListener('resize', syncViewportHeight);
      global.visualViewport.addEventListener('scroll', syncViewportHeight);
    }
  }

  function clearRapidTimer() {
    if (rapidInterval) {
      clearInterval(rapidInterval);
      rapidInterval = null;
    }
  }

  function cancelWheelDrag() {
    if (!wheelDrag) return;
    global.removeEventListener('pointermove', wheelDrag.onMove);
    global.removeEventListener('pointerup', wheelDrag.onEnd);
    global.removeEventListener('pointercancel', wheelDrag.onEnd);
    wheelDrag = null;
  }

  let l3KeyListener = null;
  let stepCleanupFn = null;

  function registerStepCleanup(fn) {
    if (typeof fn !== 'function') return;
    const prev = stepCleanupFn;
    stepCleanupFn = () => {
      try { fn(); } catch (_) {}
      if (typeof prev === 'function') prev();
    };
  }

  function inferAnimForStep(cur, explicitLesson) {
    if (!cur) return null;
    if (cur.animScene) return cur.animScene;
    const lesson = explicitLesson || (session && session.lesson) || 1;
    const text = String(cur.skill || '') + ' ' + String(cur.title || '') + ' ' + String(cur.prompt || '') + ' ' + String(cur.skillTag || '');

    if (cur.kind === 'exit_question') {
      if (cur.qId === 1) {
        return { kind: 'place_periods', mode: 'periods', num: cur.num, targetPlace: cur.p, caption: 'راقب موقع الرقم الملوّن ضمن دورات الأعداد' };
      }
      if (cur.qId === 2 || cur.qId === 3) {
        return { kind: 'place_periods', mode: 'periods', num: cur.num || 14582903, scanRtl: false, caption: 'قسّم العدد كل 3 أرقام ثم اقرأ: الملايين ← الألوف ← الآحاد' };
      }
      if (cur.qId === 4) {
        return { kind: 'place_periods', mode: 'expanded_eq', caption: 'كل حد تحليلي يمثّل قيمة رقم واحد حسب منزلته' };
      }
      if (cur.qId === 5) {
        return { kind: 'place_periods', mode: 'periods', num: cur.num, targetPlace: cur.p, caption: 'عدّ المنازل عن يمين الرقم لتحديد قيمة أصفاره' };
      }
    }

    if (cur.kind === 'choice' && cur.rawStep) {
      if (Array.isArray(cur.rawStep.compare)) {
        return { kind: 'place_periods', mode: 'compare_digits', nums: cur.rawStep.compare, targetPlace: cur.rawStep.p, caption: 'قارن موقع الرقم الملوّن في العددين عموديًا' };
      }
      if (cur.rawStep.n !== undefined) {
        return { kind: 'place_periods', mode: 'periods', num: cur.rawStep.n, targetPlace: cur.rawStep.p, caption: 'حدّد دورة الرقم الملوّن والمنازل عن يمينه' };
      }
    }

    if (cur.kind === 'produce_read') {
      return { kind: 'place_periods', mode: 'periods', num: cur.num || 25000084, scanRtl: false, caption: 'قسّم العدد 3 أرقام ثم اقرأ: الملايين ← الألوف ← الآحاد' };
    }

    if (cur.kind === 'produce_explain') {
      return { kind: 'place_periods', mode: 'compare_digits', nums: [9605, 149605], targetPlace: 3, caption: 'طابق المنازل رأسيًا من الآحاد لترى موقع الرقم 9' };
    }

    if (lesson === 2) {
      if (cur.comparePair) {
        const lRaw = String(cur.comparePair.left || '').replace(/[^\d□]/g, '');
        const rRaw = String(cur.comparePair.right || '').replace(/[^\d□]/g, '');
        return {
          kind: 'compare_sweep',
          mode: 'sweep',
          left: cur.comparePair.left,
          right: cur.comparePair.right,
          lenHint: lRaw.length !== rRaw.length,
          caption: lRaw.length !== rRaw.length ? 'قارن عدد المنازل أولًا قبل قراءة الأرقام' : 'افحص المنازل من اليسار وتوقّف عند أول اختلاف'
        };
      }
      if (/order_desc|تنازل/.test(text)) {
        return { kind: 'compare_sweep', mode: 'order', dir: 'desc', caption: 'الترتيب التنازلي يبدأ من العدد الأكبر إلى الأصغر' };
      }
      if (/order_asc|تصاعد/.test(text)) {
        return { kind: 'compare_sweep', mode: 'order', dir: 'asc', caption: 'الترتيب التصاعدي يبدأ من العدد الأصغر إلى الأكبر' };
      }
      return { kind: 'compare_sweep', mode: 'sweep', caption: 'تبدأ المقارنة دائمًا من أقصى اليسار منزلةً منزلة' };
    }

    if (lesson === 3) {
      if (/estimate|تقريب|تقدير/.test(text)) {
        const mDigit = String(cur.prompt || '').match(/\d,(\d)/);
        const keyDigit = mDigit ? Number(mDigit[1]) : 6;
        return { kind: 'carry_borrow', mode: 'round_ruler', keyDigit, caption: 'قاعدة التقريب: 0–4 يبقى الرقم، و 5–9 نزيد +1' };
      }
      if (/inverse|عكسي|تحقق/.test(text)) {
        return { kind: 'carry_borrow', mode: 'inverse_loop', caption: 'للتحقق من الطرح نجمع الناتج + المطروح' };
      }
      if (/borrow|sub_zeros|طرح|استلاف|أصفار/.test(text)) {
        return { kind: 'carry_borrow', mode: 'borrow_arc', caption: 'في الطرح نستلف 1 من المنزلة التالية ← يعطي 10 للمنزلة الحالية' };
      }
      return { kind: 'carry_borrow', mode: 'carry_arc', caption: 'في الجمع نبدأ من الآحاد، وعند بلوغ 10 نرفع +1 للمنزلة التالية' };
    }

    if (lesson === 4) {
      if (/zero_ref|برج|طوابق|سطح الأرض|مصعد/.test(text)) {
        return { kind: 'neg_context', mode: 'tower', caption: 'سطح الأرض (0) يفصل الطوابق العليا (+) عن السفلية (-)' };
      }
      if (/neg_meaning|غو|بحر|أمتار تحت/.test(text)) {
        return { kind: 'neg_context', mode: 'sea', caption: 'سطح البحر = 0 م، والنزول تحته يُمثّل بعدد سالب (-)' };
      }
      if (/temp_shift|انخفض|درجات من/.test(text)) {
        return { kind: 'neg_context', mode: 'shift', start: 3, steps: 8, caption: 'الانخفاض يعبر الصفر نحو اليسار على خط الأعداد' };
      }
      if (/thermometer|حرارة|ميزان|°C/.test(text)) {
        return { kind: 'neg_context', mode: 'thermo', caption: 'درجة 0°C مرجع فاصل: تحتها سالب (-) وفوقها موجب (+)' };
      }
      return { kind: 'neg_context', mode: 'line_sym', caption: 'الأعداد السالبة يسار 0 والموجبة يمينه على خط الأعداد' };
    }

    if (lesson === 5) {
      if (cur && cur.animCfg && typeof cur.animCfg === 'object') {
        return Object.assign({}, cur.animCfg);
      }
      if (/combinations_grid|قميص|قمصان|ربطات|بسكويت|مثلجات|وجبة/.test(text)) {
        const isIce = /مثلجات|بسكويت/.test(text);
        const isTwoShirts = /قميصان/.test(text);
        return {
          kind: 'pattern_table',
          mode: 'grid_pairs',
          rows: isIce ? 2 : (isTwoShirts ? 2 : 3),
          cols: isIce ? 3 : (isTwoShirts ? 5 : 4),
          rightLabel: isIce ? 'البسكويت' : 'القمصان',
          leftLabel: isIce ? 'النكهات' : 'الربطات',
          caption: 'اربط كل عنصر من المجموعة الأولى بجميع عناصر المجموعة الثانية'
        };
      }
      if (/coin_table|قرش|قهوة|فئة/.test(text)) {
        if (/استغنينا|تعوّضها/.test(text)) {
          return { kind: 'pattern_table', mode: 'coin_swap', caption: 'قارن بين قيمة فئة 10 قروش وفئة 5 قروش' };
        }
        const tensCount = /قطعتين/.test(text) ? 2 : (/قطعة واحدة/.test(text) ? 1 : 3);
        return { kind: 'pattern_table', mode: 'coin_balance', tensCount, target: 50, caption: 'احسب قيمة فئة 10 قروش ثم اقسم الباقي على 5' };
      }
      if (/pairing_list|حبل|تقفز|تمسك|زوج|طرق لعب|أمل/.test(text)) {
        const isDup = /تختلف|مختلفًا|سابعة/.test(text);
        return { kind: 'pattern_table', mode: 'rope_pairs', hideSpoiler: isDup ? 'dup' : '', caption: 'نرتّب الأزواج بانتظام دون تكرار الزوج نفسه' };
      }
      const bMatch = text.match(/(\d+)\s*(?:حمراء|سوداء|دفاتر|علب|كرات\s*حمراء|أقلام\s*سوداء)/);
      const baseB = bMatch ? Number(bMatch[1]) : (text.includes('8') ? 8 : (text.includes('5') ? 5 : (text.includes('4') ? 4 : 3)));
      const labelA = /صفراء/.test(text) ? 'صفراء' : (/كتاب/.test(text) ? 'كتاب' : (/برتقال/.test(text) ? 'برتقال' : (/أزرق/.test(text) ? 'أزرق' : 'أخضر')));
      const labelB = /دفاتر/.test(text) ? 'دفاتر' : (/سوداء/.test(text) ? 'أسود' : (/تفاح/.test(text) ? 'تفاح' : 'أحمر'));
      const hideCol1Sum = /الصف الأول|العمود الأول/.test(text);
      return { kind: 'pattern_table', mode: 'ratio_grow', baseA: 1, baseB, labelA, labelB, hideCol1Sum, caption: 'تابع النسبة الثابتة في كل صف حتى تصل للمجموع المطلوب' };
    }

    if (lesson === 7) {
      if (cur && cur.animCfg && typeof cur.animCfg === 'object') {
        return Object.assign({}, cur.animCfg);
      }
      if (/نصف|تنصيف|÷/.test(text)) {
        return { kind: 'mental_mul', mode: 'split_half', num: 94, parts: [90, 4], caption: 'جزّئ العدد حسب القيمة المنزلية ثم اقسم كل جزء على 2 واجمع' };
      }
      if (/ضعف|مضاعفة/.test(text) && !/×\s*\d+/.test(text)) {
        return { kind: 'mental_mul', mode: 'split_double', num: 57, parts: [50, 7], caption: 'جزّئ العدد حسب القيمة المنزلية ثم اضرب كل جزء في 2 واجمع' };
      }
      return { kind: 'mental_mul', mode: 'dh_balance', a: 35, b: 16, steps: [['35', '16'], ['70', '8']], caption: 'نصّف العدد الزوجي (÷ 2) وضاعف العدد الآخر (× 2)' };
    }

    return null;
  }

  function mountStepConceptAnim(cur, mountEl, opts) {
    if (!mountEl || !global.BookConceptAnim || typeof global.BookConceptAnim.mount !== 'function') return null;
    const cfg = inferAnimForStep(cur, opts && opts.lesson);
    if (!cfg) return null;
    const handle = global.BookConceptAnim.mount(cfg, mountEl, opts);
    if (handle && typeof handle.destroy === 'function') {
      registerStepCleanup(() => handle.destroy());
    }
    return handle;
  }

  function cleanupStepSideEffects() {
    clearRapidTimer();
    cancelWheelDrag();
    if (typeof stepCleanupFn === 'function') {
      try { stepCleanupFn(); } catch (_) {}
      stepCleanupFn = null;
    }
    if (l3KeyListener) {
      global.removeEventListener('keydown', l3KeyListener);
      l3KeyListener = null;
    }
    if (audioTimer) {
      clearTimeout(audioTimer);
      audioTimer = null;
    }
    if (typeof stopSpeech === 'function') stopSpeech();
    if (typeof BookAudio !== 'undefined' && BookAudio.isRecording) {
      try { BookAudio.stopRecording(); } catch (_) {}
    }
  }

  function setBackgroundIsolated(active) {
    if (active) {
      const candidates = [
        document.querySelector('.skip'),
        byId('test-mode-banner'),
        document.querySelector('.hud-wrap'),
        document.querySelector('.scene-tabs'),
        document.querySelector('.learning-nav'),
        byId('duolingo-map'),
        byId('step-clarity-bar'),
        byId('book'),
        byId('exit-ticket-view'),
        byId('lesson2-view'),
        byId('infinite-bar'),
        byId('guide'),
        byId('bottom-tabs'),
        byId('ai-floating-fab'),
        document.querySelector('.desk-footer')
      ].filter(Boolean);

      if (inertElements.length === 0) {
        candidates.forEach(el => {
          inertElements.push({
            el,
            prevInert: el.inert,
            prevAria: el.getAttribute('aria-hidden')
          });
          el.inert = true;
          el.setAttribute('aria-hidden', 'true');
        });
      }
    } else {
      inertElements.forEach(item => {
        item.el.inert = Boolean(item.prevInert);
        if (item.prevAria === null) item.el.removeAttribute('aria-hidden');
        else item.el.setAttribute('aria-hidden', item.prevAria);
      });
      inertElements = [];
    }
  }

  let lastActiveLesson = 1;

  function setUiMode(mode) {
    const shell = byId('l1-shell');
    const resultView = byId('l1-result-view');
    if (mode === 'learning') {
      lastActiveLesson = session && session.lesson === 7
        ? 7
        : (session && session.lesson === 5
          ? 5
          : (session && session.lesson === 4
            ? 4
            : (session && session.lesson === 3 ? 3 : (session && session.lesson === 2 ? 2 : 1))));
      if (session && session.lesson === 7) {
        state.viewMode = 'u2_lesson1';
        state.mapSubView = 'u2_lesson1';
      } else if (session && session.lesson === 5) {
        state.viewMode = 'lesson5';
        state.mapSubView = 'lesson5';
      } else if (session && session.lesson === 4) {
        state.viewMode = 'lesson4';
        state.mapSubView = 'lesson4';
      } else if (session && session.lesson === 3) {
        state.viewMode = 'lesson3';
        state.mapSubView = 'lesson3';
      } else if (session && session.lesson === 2) {
        state.viewMode = 'lesson2';
        state.mapSubView = 'lesson2';
      } else if (state.viewMode === 'map' || state.viewMode === 'lesson2' || state.viewMode === 'lesson3' || state.viewMode === 'lesson4' || state.viewMode === 'lesson5' || state.viewMode === 'u2_lesson1') {
        state.viewMode = 'mission';
      }
      if (typeof updateViewDom === 'function') updateViewDom();
      ensureViewportSync();
      setBackgroundIsolated(true);
      document.body.dataset.l1Mode = 'learning';
      if (shell) shell.hidden = false;
      if (resultView) resultView.hidden = true;
      window.scrollTo?.(0, 0);
    } else if (mode === 'result') {
      state.viewMode = 'result';
      if (typeof updateViewDom === 'function') updateViewDom();
      ensureViewportSync();
      setBackgroundIsolated(true);
      document.body.dataset.l1Mode = 'result';
      if (shell) shell.hidden = true;
      if (resultView) resultView.hidden = false;
      window.scrollTo?.(0, 0);
    } else {
      delete document.body.dataset.l1Mode;
      if (shell) shell.hidden = true;
      if (resultView) resultView.hidden = true;
      setBackgroundIsolated(false);
    }
    if (typeof window.notifyAiTutorContextChanged === 'function') {
      window.notifyAiTutorContextChanged();
    }
  }

  /* =========================================================
     Step & Session Builders
     ========================================================= */

  function missionRecord(mId) {
    if (!state.records[mId]) {
      state.records[mId] = { index: 0, passed: new Set(), data: {}, lastMessage: '' };
    }
    return state.records[mId];
  }

  function missionStepData(mId, stepIdx) {
    const rec = missionRecord(mId);
    if (!rec.data[stepIdx]) rec.data[stepIdx] = {};
    return rec.data[stepIdx];
  }

  function buildMissionAtomics(mId, stepIdx, rawStep, isInfiniteStep) {
    const s = rawStep;
    const labelPrefix = isInfiniteStep ? 'تحدٍّ متجدد' : ('مهمة ' + ar(mId + 1));

    if (s.type === 'verbal') {
      const parts = getPeriodParts(s.n);
      return parts.map((part, pIdx) => ({
        kind: 'verbal_period',
        missionId: mId,
        stepIndex: stepIdx,
        subIndex: pIdx,
        totalSub: parts.length,
        rawStep: s,
        periodParts: parts,
        periodPart: part,
        skillTag: s.source || labelPrefix,
        prompt: 'اختر الصيغة اللفظية لدورة «' + part.periodName + '»:',
        hasAudio: true,
        audioFn: () => {
          if (typeof speakNumber === 'function') speakNumber(s.n);
        },
        isFinalSubOfStep: pIdx === parts.length - 1,
        isInfiniteStep
      }));
    }

    if (s.type === 'fields') {
      const terms = expansion(s.n);
      const editable = terms.filter(t => !(s.prefill && s.prefill[t.p] !== undefined));
      const targets = editable.length > 0 ? editable : [terms[0]];
      return targets.map((term, tIdx) => ({
        kind: 'fields_house',
        missionId: mId,
        stepIndex: stepIdx,
        subIndex: tIdx,
        totalSub: targets.length,
        rawStep: s,
        allTerms: terms,
        targetTerm: term,
        skillTag: s.source || labelPrefix,
        prompt: 'ما القيمة المنزلية للرقم ' + digit(s.n, term.p) + ' في «' + places[term.p] + '»؟',
        hasAudio: false,
        isFinalSubOfStep: tIdx === targets.length - 1,
        isInfiniteStep
      }));
    }

    if (s.type === 'error') {
      return [
        {
          kind: 'error_find',
          missionId: mId,
          stepIndex: stepIdx,
          subIndex: 0,
          totalSub: 2,
          rawStep: s,
          skillTag: s.source || labelPrefix,
          prompt: 'أي حدّ في الصيغة التحليلية لا يطابق العدد ' + fmt(s.n) + '؟',
          hasAudio: false,
          isFinalSubOfStep: false,
          isInfiniteStep
        },
        {
          kind: 'error_fix',
          missionId: mId,
          stepIndex: stepIdx,
          subIndex: 1,
          totalSub: 2,
          rawStep: s,
          skillTag: s.source || labelPrefix,
          prompt: 'اكتب القيمة الصحيحة بدلًا من ' + fmt(s.terms[s.wrong]) + ':',
          hasAudio: false,
          isFinalSubOfStep: true,
          isInfiniteStep
        }
      ];
    }

    if (s.type === 'rapid') {
      const list = [{
        kind: 'rapid_intro',
        missionId: mId,
        stepIndex: stepIdx,
        subIndex: 0,
        totalSub: 6,
        rawStep: s,
        skillTag: s.source || labelPrefix,
        prompt: 'استعد لجولات السرعة: ٥ أعداد سريعة للمنازل',
        hasAudio: false,
        isFinalSubOfStep: false,
        isInfiniteStep
      }];
      for (let r = 0; r < 5; r++) {
        list.push({
          kind: 'rapid_round',
          missionId: mId,
          stepIndex: stepIdx,
          subIndex: r + 1,
          roundIndex: r,
          totalSub: 6,
          rawStep: s,
          skillTag: 'جولة ' + ar(r + 1) + ' من ٥',
          prompt: 'ما القيمة المنزلية للرقم الملوّن؟',
          hasAudio: false,
          isFinalSubOfStep: r === 4,
          isInfiniteStep
        });
      }
      return list;
    }

    const kindMap = {
      target: 'target',
      zeros: 'zeros',
      wheels: 'wheels',
      choice: 'choice',
      match: 'match',
      missing: 'missing',
      produce_read: 'produce_read',
      produce_explain: 'produce_explain'
    };
    const kind = kindMap[s.type] || 'choice';
    const audioSupported = kind === 'wheels' || kind === 'produce_read';

    return [{
      kind,
      missionId: mId,
      stepIndex: stepIdx,
      subIndex: 0,
      totalSub: 1,
      rawStep: s,
      skillTag: s.source || labelPrefix,
      prompt: s.prompt || (kind === 'produce_read' ? 'اقرأ هذا العدد بالصيغة اللفظية الفصحى:' : 'هل تتساوى قيمة الرقم 9 في العددين؟ ولماذا؟'),
      hasAudio: audioSupported,
      audioFn: audioSupported ? () => {
        const d = isInfiniteStep ? (state.infiniteRecord?.data?.[0] || {}) : missionStepData(mId, stepIdx);
        const val = kind === 'wheels' ? (d.value ?? s.initial ?? 0) : (d.currentNumber || 3040125);
        if (typeof speakNumber === 'function') speakNumber(val);
      } : null,
      isFinalSubOfStep: true,
      isInfiniteStep
    }];
  }

  function buildStation1Steps() {
    const ob = state.onboarding || (state.onboarding = createDefaultOnboarding());
    const phase = ob.station1Phase || 'warmup_q1';
    const steps = [];

    steps.push({
      kind: 's1_warmup',
      key: 'warmup_q1',
      qKey: 'q1',
      n: 45372,
      targetPlace: 3,
      options: [5, 500, 5000],
      correct: 5000,
      skillTag: 'التهيئة · ١ من ٢',
      prompt: 'ما قيمة الرقم 5 في العدد 45,372؟',
      hintText: 'على يمين الرقم 5 ثلاثة أرقام (3 و7 و2)، لذلك نضع ثلاثة أصفار.',
      explainWrong: 'الرقم 5 في منزلة آحاد الألوف وعلى يمينه 3 منازل، إذن قيمته 5,000.',
      explainRight: 'أحسنت! الرقم 5 يقع في آحاد الألوف وعلى يمينه 3 أرقام، فقيمته 5,000.',
      hasAudio: false
    });

    steps.push({
      kind: 's1_warmup',
      key: 'warmup_q2',
      qKey: 'q2',
      cardsVisual: { count: 10, unit: 1000 },
      options: [1000, 10000, 100000],
      correct: 10000,
      skillTag: 'التهيئة · ٢ من ٢',
      prompt: 'لدينا 10 بطاقات، قيمة كل بطاقة 1,000. ما قيمتها معًا؟',
      hintText: 'عدّ بالألوف عشر مرات: 10 × 1,000 = 10,000.',
      explainWrong: 'كل 10 بطاقات من فئة 1,000 تتحد لتكوّن 10,000 (عشرات الألوف).',
      explainRight: 'رائع! 10 بطاقات من فئة 1,000 تكوّن 10,000.',
      hasAudio: false
    });

    const canBranch = Boolean(ob.q1?.firstAttemptCorrect && ob.q2?.firstAttemptCorrect);
    const showBranch = phase === 'adaptive_branch' || canBranch;
    const includeReview = phase === 'review' || ob.pathChosen === 'review' || (ob.warmupDone && !canBranch && !ob.reviewBypassed);

    if (showBranch) {
      steps.push({
        kind: 's1_branch',
        key: 'adaptive_branch',
        skillTag: 'تحديد المسار',
        prompt: 'تتقن منزلة الألوف! اختر خطوتك التالية نحو الملايين:',
        options: [
          { id: 'shortcut', label: 'أنتقل مباشرة إلى جسر الملايين (موصى به)' },
          { id: 'review', label: 'أراجع الألوف أولًا في 3 خطوات قصيرة' }
        ],
        hasAudio: false
      });
    }

    if (includeReview) {
      steps.push({
        kind: 's1_worked_model',
        key: 'review_0',
        n: 63415,
        targetPlace: 4,
        skillTag: 'مراجعة · مثال محلول',
        prompt: 'لاحظ كيف نحدد قيمة الرقم 6 في العدد 63,415:',
        modelPoints: [
          '1. نحدد البيت من اليمين: الرقم 6 يسكن في «عشرات الألوف».',
          '2. نعدّ الأرقام على يمينه: يوجد 4 أرقام، فنضع 4 أصفار فتصبح قيمته 60,000.',
          '3. قاعدة البطاقات: كل 10 بطاقات من منزلة تساوي بطاقة في المنزلة التالية.'
        ],
        hasAudio: false
      });

      steps.push({
        kind: 's1_review_mc',
        key: 'review_1',
        n: 27415,
        targetPlace: 3,
        options: [70, 700, 7000],
        correct: 7000,
        skillTag: 'مراجعة · تدريب ١',
        prompt: 'ما قيمة الرقم 7 في العدد 27,415؟',
        explainWrong: 'على يمين الرقم 7 توجد 3 منازل (4 و1 و5)، إذن قيمته 7,000.',
        explainRight: 'صحيح! الرقم 7 في آحاد الألوف وقيمته 7,000.',
        hasAudio: false
      });

      steps.push({
        kind: 's1_review_mc',
        key: 'review_2',
        options: [1000, 10000, 100000],
        correct: 10000,
        skillTag: 'مراجعة · تدريب ٢',
        prompt: 'إذا جمعنا 10 بطاقات قيمة كل منها 1,000، نحصل على:',
        explainWrong: 'عند تجميع 10 بطاقات بقيمة 1,000 ننتقل للمنزلة التالية: 10,000.',
        explainRight: 'أحسنت! 10 × 1,000 = 10,000. هيا نبنِ جسر الملايين.',
        hasAudio: false
      });
    }

    BRIDGE_LEVELS.forEach(lvl => {
      steps.push({
        kind: 's1_bridge',
        key: 'bridge_' + lvl.level,
        bridge: lvl,
        skillTag: 'جسر الملايين · ' + ar(lvl.level + 1) + ' من ٣',
        prompt: lvl.prompt,
        hasAudio: false
      });
    });

    GRADUAL_STEPS.forEach(g => {
      steps.push({
        kind: 's1_gradual',
        key: 'gradual_' + g.step,
        grad: g,
        skillTag: g.badge,
        prompt: g.prompt,
        hasAudio: false
      });
    });

    return steps;
  }

  function findStation1InitialIndex(steps) {
    const ob = state.onboarding || createDefaultOnboarding();
    if (state.runnerStep && state.runnerStep.nodeId === 0 && typeof state.runnerStep.subKey === 'string') {
      const idx = steps.findIndex(st => st.key === state.runnerStep.subKey);
      if (idx >= 0) return idx;
    }
    const phase = ob.station1Phase || 'warmup_q1';
    if (phase === 'warmup_q1') return Math.max(0, steps.findIndex(st => st.key === 'warmup_q1'));
    if (phase === 'warmup_q2') return Math.max(0, steps.findIndex(st => st.key === 'warmup_q2'));
    if (phase === 'adaptive_branch') return Math.max(0, steps.findIndex(st => st.key === 'adaptive_branch'));
    if (phase === 'review') return Math.max(0, steps.findIndex(st => st.key === 'review_' + Math.max(0, Math.min(2, ob.reviewStep || 0))));
    if (phase === 'bridge') return Math.max(0, steps.findIndex(st => st.key === 'bridge_' + Math.max(0, Math.min(2, ob.bridgeLevel || 0))));
    if (phase === 'gradual_millions') return Math.max(0, steps.findIndex(st => st.key === 'gradual_' + Math.max(0, Math.min(3, ob.gradualStep || 0))));
    return 0;
  }

  function buildSessionForNode(nodeId, options) {
    const opts = options || {};
    const node = PATH_NODES.find(n => n.id === nodeId);
    if (!node) return null;

    if (nodeId === 0) {
      const steps = buildStation1Steps();
      const idx = findStation1InitialIndex(steps);
      return {
        mode: 'station1',
        nodeId: 0,
        title: node.title,
        steps,
        index: idx,
        errors: 0,
        correctFirstTry: 0,
        totalGraded: 0,
        showHearts: false,
        countedKeys: new Set()
      };
    }

    if (node.type === 'story') {
      const list = node.unit ? trainingSlides : lessonSlides;
      const steps = (node.slides || []).map((slideIdx, i) => ({
        kind: 'story_slide',
        slideIndex: slideIdx,
        slide: list[slideIdx],
        unit: node.unit,
        skillTag: (list[slideIdx]?.tab || 'شرح') + ' · ' + ar(i + 1) + ' من ' + ar(node.slides.length),
        prompt: list[slideIdx]?.caption || '',
        hasAudio: list[slideIdx]?.n !== undefined || Boolean(list[slideIdx]?.caption),
        audioFn: () => {
          const sl = list[slideIdx];
          if (sl?.n !== undefined && sl?.type !== 'airport-info' && typeof speakNumber === 'function') {
            speakNumber(sl.n);
          } else if (sl?.caption && typeof global.speakText === 'function') {
            global.speakText(sl.caption);
          }
        }
      }));
      let startIdx = 0;
      const savedSlide = state.story?.[node.unit];
      const matchSlide = (node.slides || []).indexOf(savedSlide);
      if (state.runnerStep && state.runnerStep.nodeId === nodeId && Number.isInteger(state.runnerStep.stepIndex)) {
        startIdx = Math.max(0, Math.min(steps.length - 1, state.runnerStep.stepIndex));
      } else if (matchSlide >= 0) {
        startIdx = matchSlide;
      }
      return {
        mode: 'story',
        nodeId,
        unit: node.unit,
        title: node.title,
        steps,
        index: startIdx,
        errors: 0,
        showHearts: false
      };
    }

    if (node.type === 'playground') {
      const questIndices = opts.allQuests ? [0, 1, 2, 3, 4] : [0, 1, 2];
      const steps = questIndices.map((qIdx, pos) => ({
        kind: 'playground_quest',
        questIndex: qIdx,
        quest: playgroundQuests[qIdx],
        skillTag: 'تحدي ' + ar(pos + 1) + ' من ' + ar(questIndices.length),
        prompt: playgroundQuests[qIdx].prompt,
        hasAudio: true,
        audioFn: () => {
          if (typeof speakNumber === 'function') speakNumber(playgroundState.number);
        }
      }));
      let startIdx = 0;
      const firstUndone = questIndices.findIndex(qi => !playgroundState.questsDone.has(qi));
      if (firstUndone >= 0) startIdx = firstUndone;
      if (state.runnerStep && state.runnerStep.nodeId === nodeId && Number.isInteger(state.runnerStep.stepIndex)) {
        startIdx = Math.max(0, Math.min(steps.length - 1, state.runnerStep.stepIndex));
      }
      return {
        mode: 'playground',
        nodeId,
        title: node.title,
        steps,
        index: startIdx,
        errors: 0,
        correctFirstTry: 0,
        totalGraded: 0,
        showHearts: false,
        countedKeys: new Set()
      };
    }

    if (node.type === 'mission') {
      const mId = node.missionId;
      const m = missions[mId];
      const steps = [];
      (m.steps || []).forEach((st, sIdx) => {
        steps.push(...buildMissionAtomics(mId, sIdx, st, false));
      });
      const rec = missionRecord(mId);
      let startIdx = 0;
      if (state.runnerStep && state.runnerStep.nodeId === nodeId && Number.isInteger(state.runnerStep.stepIndex)) {
        startIdx = Math.max(0, Math.min(steps.length - 1, state.runnerStep.stepIndex));
      } else {
        const idxByStep = steps.findIndex(st => st.stepIndex === rec.index);
        if (idxByStep >= 0) startIdx = idxByStep;
      }
      return {
        mode: 'mission',
        nodeId,
        missionId: mId,
        title: node.title,
        steps,
        index: startIdx,
        errors: 0,
        correctFirstTry: 0,
        totalGraded: 0,
        showHearts: true,
        countedKeys: new Set()
      };
    }

    if (node.type === 'exit_ticket') {
      const et = prepareExitTicketSession(Boolean(opts.forceNew));
      const steps = buildExitTicketSteps(et);
      let startIdx = steps.findIndex(st => {
        const ans = et.currentAnswers?.[st.qId];
        return !ans || ans[st.subKey] === undefined;
      });
      if (startIdx < 0) startIdx = 0;
      if (!opts.forceNew && state.runnerStep && state.runnerStep.nodeId === 20 && Number.isInteger(state.runnerStep.stepIndex)) {
        startIdx = Math.max(0, Math.min(steps.length - 1, state.runnerStep.stepIndex));
      }
      return {
        mode: 'exit_ticket',
        nodeId: 20,
        title: node.title,
        steps,
        index: startIdx,
        errors: 0,
        showHearts: false
      };
    }

    return null;
  }

  function buildExitTicketSteps(et) {
    const qs = et?.currentQuestions || [];
    const q1 = qs[0];
    const q2 = qs[1];
    const q3 = qs[2];
    const q4 = qs[3];
    const q5 = qs[4];
    const steps = [];

    if (q1) {
      steps.push({
        kind: 'exit_question',
        qId: 1,
        subKey: 'place',
        skillTag: 'التقييم · ١ من ٧',
        prompt: 'ما منزلة الرقم ' + q1.digit + ' الملوّن في العدد الآتي؟',
        num: q1.num,
        p: q1.p,
        options: q1.placeOpts.map(v => ({ label: v, value: v })),
        correctValue: q1.place,
        explain: 'الرقم ' + q1.digit + ' يقع في منزلة «' + q1.place + '».',
        hasAudio: false
      });
      steps.push({
        kind: 'exit_question',
        qId: 1,
        subKey: 'val',
        skillTag: 'التقييم · ٢ من ٧',
        prompt: 'ما القيمة المنزلية للرقم ' + q1.digit + ' الملوّن في العدد الآتي؟',
        num: q1.num,
        p: q1.p,
        options: q1.valOpts.map(v => ({ label: fmt(v), rawValue: v, numeric: true, value: v })),
        correctValue: q1.val,
        explain: 'قيمة الرقم ' + q1.digit + ' في «' + q1.place + '» هي ' + fmt(q1.val) + '.',
        hasAudio: false
      });
    }
    if (q2) {
      steps.push({
        kind: 'exit_question',
        qId: 2,
        subKey: 'reading',
        skillTag: 'التقييم · ٣ من ٧',
        prompt: q2.prompt,
        num: q2.num,
        options: q2.opts.map(v => ({ label: v, value: v })),
        correctValue: q2.correct,
        explain: 'القراءة الصحيحة للعدد ' + fmt(q2.num) + ' هي: «' + q2.correct + '».',
        hasAudio: false
      });
    }
    if (q3) {
      steps.push({
        kind: 'exit_question',
        qId: 3,
        subKey: 'standard',
        skillTag: 'التقييم · ٤ من ٧',
        prompt: q3.prompt,
        quoteText: q3.words,
        options: q3.opts.map(v => ({ label: String(v), numeric: true, value: v })),
        correctValue: q3.correct,
        explain: 'الصيغة القياسية المطابقة هي ' + q3.correct + '.',
        hasAudio: false
      });
    }
    if (q4) {
      steps.push({
        kind: 'exit_question',
        qId: 4,
        subKey: 'expanded',
        skillTag: 'التقييم · ٥ من ٧',
        prompt: q4.prompt,
        eqTerms: q4.terms,
        missingValue: q4.missing?.value,
        options: q4.opts.map(v => ({ label: fmt(v), rawValue: v, numeric: true, value: v })),
        correctValue: q4.correct,
        explain: 'القيمة التحليلية المفقودة هي ' + fmt(q4.correct) + '.',
        hasAudio: false
      });
    }
    if (q5) {
      steps.push({
        kind: 'exit_question',
        qId: 5,
        subKey: 'reason',
        skillTag: 'التقييم · ٦ من ٧',
        prompt: 'قال طالب إن قيمة الرقم ' + q5.digit + ' هي ' + fmt(q5.wrongVal) + '. لماذا إجابته خاطئة؟',
        num: q5.num,
        p: q5.p,
        options: q5.reasonOpts.map(v => ({ label: v, value: v })),
        correctValue: q5.correctReason,
        explain: q5.correctReason,
        hasAudio: false
      });
      steps.push({
        kind: 'exit_question',
        qId: 5,
        subKey: 'val',
        skillTag: 'التقييم · ٧ من ٧',
        prompt: 'ما القيمة المنزلية الصحيحة للرقم ' + q5.digit + ' في العدد الآتي؟',
        num: q5.num,
        p: q5.p,
        options: q5.valOpts.map(v => ({ label: fmt(v), rawValue: v, numeric: true, value: v })),
        correctValue: q5.correctVal,
        explain: 'على يمين الرقم ' + q5.digit + ' توجد ' + ar(q5.p) + ' منازل، إذن قيمته ' + fmt(q5.correctVal) + '.',
        hasAudio: false
      });
    }

    return steps;
  }

  function buildInfiniteSession(skill) {
    if (skill) state.infiniteSkill = skill;
    state.infiniteMode = true;
    state.viewMode = 'mission';
    if (!state.infiniteStep) state.infiniteStep = generateInfiniteStep(state.infiniteSkill);
    state.infiniteRecord = { index: 0, passed: new Set(), data: {}, lastMessage: '' };
    const steps = buildMissionAtomics(-1, 0, state.infiniteStep, true);
    return {
      mode: 'infinite',
      nodeId: -1,
      title: 'التحدي المتجدد الذكي',
      steps,
      index: 0,
      errors: 0,
      correctFirstTry: 0,
      totalGraded: 0,
      showHearts: false,
      countedKeys: new Set()
    };
  }

  function normalizeRechargeReturnContext(returnArg) {
    if (returnArg && typeof returnArg === 'object' && !Array.isArray(returnArg)) {
      const lessonNum = [1, 2, 3, 4, 5].includes(Number(returnArg.lesson))
        ? Number(returnArg.lesson)
        : (session?.lesson || lastActiveLesson || 1);
      return {
        lesson: lessonNum,
        nodeId: Number.isInteger(returnArg.nodeId) ? returnArg.nodeId : null,
        openOptions: returnArg.openOptions || null,
        remedialLaunch: returnArg.remedialLaunch || null,
        remedialSnapshot: returnArg.remedialSnapshot || null,
        finishAfterRecharge: Boolean(returnArg.finishAfterRecharge)
      };
    }
    const inferredLesson = (session && [1, 2, 3, 4, 5].includes(session.lesson))
      ? session.lesson
      : (lastActiveLesson || 1);
    return {
      lesson: inferredLesson,
      nodeId: Number.isInteger(returnArg) ? returnArg : null,
      openOptions: null,
      remedialLaunch: null,
      remedialSnapshot: null,
      finishAfterRecharge: false
    };
  }

  function shuffleArrayCopy(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function randIntRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const RECHARGE_STRATEGIES = {
    2: () => {
      const modeRoll = Math.random();
      let a = 0;
      let b = 0;
      if (modeRoll < 0.2) {
        a = randIntRange(2, 8) * 1000000 + randIntRange(100, 899) * 1000 + randIntRange(100, 999);
        b = a;
      } else if (modeRoll < 0.5) {
        const big = randIntRange(1, 5) * 10000000 + randIntRange(100, 899) * 1000 + randIntRange(100, 999);
        const small = randIntRange(2, 9) * 1000000 + randIntRange(100, 899) * 1000 + randIntRange(100, 999);
        if (Math.random() < 0.5) { a = big; b = small; } else { a = small; b = big; }
      } else {
        const mil = randIntRange(2, 8) * 1000000;
        const th1 = randIntRange(110, 890);
        let th2 = randIntRange(110, 890);
        while (th2 === th1) th2 = randIntRange(110, 890);
        a = mil + th1 * 1000 + randIntRange(100, 999);
        b = mil + th2 * 1000 + randIntRange(100, 999);
      }
      const correct = a > b ? '>' : (a < b ? '<' : '=');
      return {
        kind: 'recharge_quiz',
        lesson: 2,
        skillTag: 'استعادة ٣ قلوب · مقارنة الأعداد',
        prompt: 'اختر رمز المقارنة الصحيح لشحن قلوبك الثلاثة:',
        rechargeVisual: { type: 'compare_pair', leftNum: a, rightNum: b },
        options: [
          { label: '>', value: '>', numeric: true },
          { label: '<', value: '<', numeric: true },
          { label: '=', value: '=', numeric: true }
        ],
        correctValue: correct,
        cols3: true,
        hint: 'عدّ المنازل أولاً، وإن تساوت فقارن من أقصى اليسار؛ وفتحة الرمز تتجه نحو الأكبر.',
        explainRight: 'أحسنت! ' + fmt(a) + ' ' + correct + ' ' + fmt(b) + ' — عادت قلوبك الثلاثة كاملة.',
        hasAudio: false
      };
    },
    3: () => {
      if (Math.random() < 0.5) {
        const mil = randIntRange(2, 8);
        const hTh = randIntRange(1, 9);
        const rest = randIntRange(10000, 99999);
        const num = mil * 1000000 + hTh * 100000 + (rest % 100000);
        const rounded = (hTh >= 5 ? mil + 1 : mil) * 1000000;
        const alt1 = (hTh >= 5 ? mil : mil + 1) * 1000000;
        const alt2 = mil * 1000000 + hTh * 100000;
        const opts = shuffleArrayCopy([rounded, alt1, alt2]).map(v => ({ label: fmt(v), value: v, numeric: true }));
        return {
          kind: 'recharge_quiz',
          lesson: 3,
          skillTag: 'استعادة ٣ قلوب · التقدير لأعلى منزلة',
          prompt: 'قرّب العدد التالي إلى أعلى منزلة (آحاد الملايين) لشحن قلوبك:',
          rechargeVisual: { type: 'single_num', num, caption: 'انظر إلى منزلة مئات الألوف لتحديد التقريب' },
          options: opts,
          correctValue: rounded,
          hint: 'رقم مئات الألوف هو ' + hTh + (hTh >= 5 ? ' (5 فأكثر: نزيد الملايين 1)' : ' (أقل من 5: تبقى الملايين كما هي)') + '.',
          explainRight: 'ممتاز! تقريب ' + fmt(num) + ' لأعلى منزلة هو ' + fmt(rounded) + '.',
          hasAudio: false
        };
      }
      const isAdd = Math.random() < 0.5;
      const aMil = randIntRange(3, 8);
      const bMil = randIntRange(1, isAdd ? 6 : aMil - 1);
      const a = aMil * 1000000 + randIntRange(1, 4) * 100000;
      const b = bMil * 1000000 + randIntRange(1, 4) * 100000;
      const correct = isAdd ? (a + b) : (a - b);
      const opts = shuffleArrayCopy([
        correct,
        correct + 1000000,
        Math.max(100000, correct - 1000000)
      ]).map(v => ({ label: fmt(v), value: v, numeric: true }));
      return {
        kind: 'recharge_quiz',
        lesson: 3,
        skillTag: 'استعادة ٣ قلوب · الجمع والطرح',
        prompt: 'احسب ناتج العملية التالية لشحن قلوبك الثلاثة:',
        rechargeVisual: { type: 'expr_box', expr: fmt(a) + (isAdd ? ' + ' : ' − ') + fmt(b) + ' = ؟' },
        options: opts,
        correctValue: correct,
        hint: 'ابدأ من مئات الألوف ثم آحاد الملايين مع مراعاة إشارة العملية.',
        explainRight: 'رائع! الناتج الدقيق هو ' + fmt(correct) + ' — عادت قلوبك الثلاثة كاملة.',
        hasAudio: false
      };
    },
    4: () => {
      if (Math.random() < 0.55) {
        const mag = randIntRange(2, 15);
        const isNeg = Math.random() < 0.7;
        const phrases = isNeg
          ? [
              mag + ' درجات مئوية تحت الصفر',
              'عمق ' + mag + ' مترًا تحت سطح البحر',
              'سحب ' + mag + ' دينارًا من الرصيد'
            ]
          : [
              mag + ' درجات فوق الصفر',
              'ارتفاع ' + mag + ' مترًا فوق سطح البحر',
              'إيداع ' + mag + ' دينارًا في الرصيد'
            ];
        const phrase = phrases[randIntRange(0, phrases.length - 1)];
        const correct = isNeg ? ('-' + mag) : ('+' + mag);
        const wrongOpp = isNeg ? ('+' + mag) : ('-' + mag);
        const wrongMag = isNeg ? ('-' + (mag + 2)) : ('+' + (mag + 2));
        const fmtSigned = v => (String(v).startsWith('-') ? '−' + String(v).slice(1) : String(v));
        const opts = shuffleArrayCopy([correct, wrongOpp, wrongMag]).map(v => ({
          label: fmtSigned(v),
          value: v,
          numeric: true
        }));
        return {
          kind: 'recharge_quiz',
          lesson: 4,
          skillTag: 'استعادة ٣ قلوب · الأعداد السالبة',
          prompt: 'أي عدد موقّع يمثّل الموقف التالي؟',
          rechargeVisual: { type: 'quote_box', text: phrase },
          options: opts,
          correctValue: correct,
          cols3: true,
          hint: isNeg
            ? 'النقصان أو تحت الصفر أو العمق يأخذ إشارة السالب (−).'
            : 'الزيادة أو فوق الصفر أو الارتفاع يأخذ إشارة الموجب (+).',
          explainRight: 'أحسنت! الموقف يمثله العدد ' + fmtSigned(correct) + ' — عادت قلوبك الثلاثة كاملة.',
          hasAudio: false
        };
      }
      const n1 = -randIntRange(1, 5);
      const n2 = -randIntRange(6, 12);
      const askGreater = Math.random() < 0.5;
      const correct = askGreater ? String(n1) : String(n2);
      const fmtSigned = v => '−' + Math.abs(Number(v));
      const opts = shuffleArrayCopy([String(n1), String(n2), '0']).map(v => ({
        label: v === '0' ? '0' : fmtSigned(v),
        value: v,
        numeric: true
      }));
      return {
        kind: 'recharge_quiz',
        lesson: 4,
        skillTag: 'استعادة ٣ قلوب · خط الأعداد',
        prompt: askGreater
          ? 'أي عدد من الأعداد السالبة التالية هو الأكبر (الأقرب للصفر)؟'
          : 'أي عدد من الأعداد التالية هو الأصغر (الأبعد يسار الصفر)؟',
        rechargeVisual: {
          type: 'expr_box',
          expr: fmtSigned(n1) + '   ،   ' + fmtSigned(n2)
        },
        options: opts,
        correctValue: correct,
        cols3: true,
        hint: 'على خط الأعداد، العدد الواقع إلى اليمين أكبر من العدد الواقع إلى اليسار.',
        explainRight: 'ممتاز! الإجابة هي ' + fmtSigned(correct) + ' — عادت قلوبك الثلاثة كاملة.',
        hasAudio: false
      };
    },
    5: () => {
      const step = [3, 4, 5, 6, 8, 10][randIntRange(0, 5)];
      const vals = [step, step * 2, step * 3, step * 4];
      const correct = vals[3];
      const opts = shuffleArrayCopy([
        correct,
        correct + step,
        Math.max(1, correct - 2)
      ]).map(v => ({ label: String(v), value: v, numeric: true }));
      return {
        kind: 'recharge_quiz',
        lesson: 5,
        skillTag: 'استعادة ٣ قلوب · خطة إنشاء جدول',
        prompt: 'أكمل القيمة المفقودة في الجدول لتشحن قلوبك الثلاثة:',
        rechargeVisual: {
          type: 'mini_table',
          ruleText: 'القاعدة: كل خطوة تزيد بمقدار ' + ar(step),
          headers: ['1', '2', '3', '4'],
          values: [String(vals[0]), String(vals[1]), String(vals[2]), '؟']
        },
        options: opts,
        correctValue: correct,
        cols3: true,
        hint: 'أضف ' + ar(step) + ' إلى قيمة العمود الثالث (' + ar(vals[2]) + ').',
        explainRight: 'رائع! القيمة المفقودة هي ' + ar(correct) + ' — عادت قلوبك الثلاثة كاملة.',
        hasAudio: false
      };
    }
  };

  function buildRechargeSession(returnArg) {
    const returnCtx = normalizeRechargeReturnContext(returnArg);
    const lessonNum = returnCtx.lesson || 1;
    if (lessonNum >= 2 && lessonNum <= 5 && typeof RECHARGE_STRATEGIES[lessonNum] === 'function') {
      const step = RECHARGE_STRATEGIES[lessonNum]();
      return {
        lesson: lessonNum,
        mode: 'recharge',
        nodeId: -2,
        returnNodeId: returnCtx.nodeId,
        returnContext: returnCtx,
        title: 'شحن القلوب',
        steps: [step],
        index: 0,
        errors: 0,
        showHearts: true
      };
    }

    const qIdx = playgroundQuests.findIndex((_, idx) => !playgroundState.questsDone.has(idx));
    const chosen = qIdx >= 0 ? qIdx : 0;
    if (playgroundQuests[chosen].check(playgroundState.number)) {
      playgroundState.number = 2051841;
      playgroundState.selected = 5;
    }
    return {
      lesson: 1,
      mode: 'recharge',
      nodeId: -2,
      returnNodeId: returnCtx.nodeId,
      returnContext: returnCtx,
      title: 'شحن القلوب',
      steps: [{
        kind: 'playground_quest',
        isRecharge: true,
        questIndex: chosen,
        quest: playgroundQuests[chosen],
        skillTag: 'استعادة ٣ قلوب',
        prompt: playgroundQuests[chosen].prompt,
        hasAudio: true,
        audioFn: () => {
          if (typeof speakNumber === 'function') speakNumber(playgroundState.number);
        }
      }],
      index: 0,
      errors: 0,
      showHearts: true
    };
  }

  function buildScratchpadSession() {
    return {
      mode: 'scratchpad',
      nodeId: -3,
      title: 'مسودة الأعداد الحرة',
      steps: [{
        kind: 'scratchpad',
        skillTag: 'تجربة حرة · حتى ٩ منازل',
        prompt: 'كوّن أي عدد وتأمّل تحليله الصيغي ونطقه:',
        hasAudio: true,
        audioFn: () => {
          if (typeof speakNumber === 'function') speakNumber(playgroundState.number);
        }
      }],
      index: 0,
      errors: 0,
      showHearts: false
    };
  }

  /* =========================================================
     Footer Primary CTA State Machine
     ========================================================= */

  function isTeachingStep(cur) {
    const kind = typeof cur === 'string' ? cur : cur?.kind;
    if (
      kind === 'story_slide' ||
      kind === 's1_worked_model' ||
      kind === 's1_bridge' ||
      kind === 'l3_teach' ||
      kind === 'l4_teach' ||
      kind === 'l5_teach' ||
      kind === 'u2l1_teach' ||
      kind === 'rapid_intro' ||
      kind === 'scratchpad'
    ) {
      return true;
    }
    if (cur && typeof cur === 'object' && cur.exploreFirst) {
      return Boolean(document.querySelector('#l1-body .is-explore-phase'));
    }
    return false;
  }

  function renderUnifiedTutorCard(cur) {
    const slot = byId('l1-tutor-slot');
    if (!slot) return;
    slot.replaceChildren();
    if (!cur || cur.kind === 'recharge_quiz' || cur.kind === 'rapid_round') {
      slot.hidden = true;
      return;
    }
    const isSlide = isTeachingStep(cur) && cur.kind !== 'scratchpad';
    const tutorBar = document.createElement('div');
    tutorBar.className = 'l1-slide-tutor-bar' + (isSlide ? ' is-slide' : ' is-question');
    tutorBar.innerHTML =
      '<div class="l1-slide-tutor-copy">' +
      '<span class="l1-slide-tutor-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg></span>' +
      '<span>' +
      (isSlide
        ? 'هل لديك أي سؤال في هذه الشريحة؟ المعلم الذكي جاهز لتوضيحها.'
        : 'هل لديك أي سؤال في هذا التمرين؟ المعلم الذكي جاهز لمساعدتك.') +
      '</span>' +
      '</div>' +
      '<div class="l1-slide-tutor-actions">' +
      '<button type="button" class="l1-slide-tutor-btn" data-tutor-act="' +
      (isSlide ? 'explain' : 'hint') +
      '">' +
      (isSlide ? 'اشرح الشريحة' : 'تلميح ذكي') +
      '</button>' +
      '<button type="button" class="l1-slide-tutor-btn is-voice" data-tutor-act="live">' +
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>' +
      '<span>اسأل صوتياً</span>' +
      '</button>' +
      '</div>';
    tutorBar.querySelectorAll('[data-tutor-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.getAttribute('data-tutor-act');
        if (typeof openAiTutor === 'function') openAiTutor(act);
      });
    });
    slot.append(tutorBar);
    slot.hidden = false;
  }

  function getCurrentStepHelpKey(cur) {
    return String(cur?.key || cur?.kind || 'step') + ':' + String(session?.index ?? 0);
  }

  function syncShellFocusAttrs(btnState) {
    const shellEl = byId('l1-shell');
    if (!shellEl || !session) return;
    const cur = session.steps?.[session.index];
    const isTeaching = isTeachingStep(cur);
    const stepKey = getCurrentStepHelpKey(cur);
    if (!session.helpRevealedSteps) session.helpRevealedSteps = new Set();
    if (btnState === 'wrong') {
      session.helpRevealedSteps.add(stepKey);
    }
    const openHintEl = shellEl.querySelector('.l1-hint-content:not([hidden])');
    const hasOpenHint = Boolean(openHintEl && String(openHintEl.textContent || '').trim());
    if (hasOpenHint) {
      session.helpRevealedSteps.add(stepKey);
    }
    shellEl.dataset.stepRole = isTeaching ? 'slide' : 'exercise';
    shellEl.dataset.stepKind = String(cur?.kind || '');
    shellEl.dataset.stepPhase = String(btnState || stepUi?.phase || 'incomplete');
    shellEl.dataset.helpRevealed = (isTeaching || session.helpRevealedSteps.has(stepKey)) ? 'true' : 'false';
    if (cur?.exploreFirst) {
      renderUnifiedTutorCard(cur);
    }
  }

  function setPrimaryButtonState(btnState, customLabel) {
    const btn = byId('l1-primary-btn');
    const feedback = byId('l1-feedback');
    const feedbackText = byId('l1-feedback-text');
    const feedbackIco = byId('l1-feedback-ico');
    if (!btn) return;

    stepUi.phase = btnState;
    syncShellFocusAttrs(btnState);
    btn.classList.remove('state-ready', 'state-correct', 'state-wrong');

    const cur = session?.steps?.[session.index];
    const isLast = session ? session.index >= session.steps.length - 1 : true;
    const isRapidLastWait = cur?.kind === 'rapid_round' && cur.roundIndex === 4;

    if (btnState === 'incomplete') {
      btn.disabled = true;
      btn.textContent = customLabel || 'تحقّق';
      if (feedback) feedback.hidden = true;
    } else if (btnState === 'loading') {
      btn.disabled = true;
      btn.classList.add('state-ready');
      btn.textContent = customLabel || 'جارٍ التقييم...';
    } else if (btnState === 'ready') {
      btn.disabled = false;
      btn.classList.add('state-ready');
      btn.textContent = customLabel || 'تحقّق';
    } else if (btnState === 'wrong') {
      btn.disabled = false;
      btn.classList.add('state-wrong');
      btn.textContent = stepUi.needsRecharge
        ? 'شحن القلوب للمتابعة'
        : (customLabel || 'حاول مجددًا');
    } else if (btnState === 'correct' || btnState === 'explanation') {
      btn.disabled = false;
      btn.classList.add('state-correct');
      if (stepUi.needsRecharge && session?.remedial && btnState === 'explanation') {
        btn.textContent = 'شحن القلوب للمتابعة';
      } else if (customLabel) {
        btn.textContent = customLabel;
      } else if (session?.mode === 'infinite' && stepUi.infiniteCompleted) {
        btn.textContent = 'مسألة جديدة';
      } else if ((isLast && btnState !== 'wrong') || isRapidLastWait && stepUi.rapidDone) {
        btn.textContent = 'عرض النتيجة';
      } else {
        btn.textContent = 'متابعة';
      }
    }

    if (feedback && feedbackText && stepUi.feedbackMsg) {
      feedback.hidden = false;
      feedback.className = 'l1-feedback ' + (stepUi.feedbackType === 'good' ? 'is-good' : stepUi.feedbackType === 'bad' ? 'is-bad' : '');
      feedbackText.innerHTML = l2BidiTextHTML(stepUi.feedbackMsg);
      if (feedbackIco) {
        feedbackIco.innerHTML = feedbackIconSVG(stepUi.feedbackType);
      }
    } else if (feedback) {
      feedback.hidden = true;
    }
  }

  function feedbackIconSVG(type) {
    if (type === 'good') return getIconSVG('check');
    if (type === 'bad') {
      return '<svg viewBox="0 0 24 24" class="svg-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" class="svg-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  function isStepAssisted(cur, dataObj) {
    if (!cur || !dataObj) return false;
    const rec = (!cur.isInfiniteStep && Number.isInteger(cur.missionId)) ? missionRecord(cur.missionId) : null;
    return Boolean(
      dataObj.revealedAnswer ||
      dataObj.usedHelp ||
      dataObj.assisted ||
      (Number(dataObj.hintTier) >= 3) ||
      (Number(dataObj.hintLevel) >= 3) ||
      dataObj.status === 'assisted' ||
      rec?.assistedSteps?.has?.(cur.stepIndex)
    );
  }

  function showFeedback(type, msg) {
    let finalMsg = msg;
    const cur = session?.steps?.[session.index];
    if (type === 'good' && session?.mode === 'mission' && cur && Number.isInteger(cur.missionId)) {
      const d = getActiveStepData(cur);
      if (isStepAssisted(cur, d) && !String(finalMsg || '').startsWith('أُنجز بمساعدة')) {
        finalMsg = 'أُنجز بمساعدة — ' + finalMsg;
      }
    }
    stepUi.feedbackType = type;
    stepUi.feedbackMsg = sanitizePlainText(finalMsg);
    const feedback = byId('l1-feedback');
    const feedbackText = byId('l1-feedback-text');
    const feedbackIco = byId('l1-feedback-ico');
    if (!feedback || !feedbackText) return;
    feedback.hidden = false;
    feedback.className = 'l1-feedback ' + (type === 'good' ? 'is-good' : type === 'bad' ? 'is-bad' : '');
    feedbackText.innerHTML = l2BidiTextHTML(stepUi.feedbackMsg);
    if (feedbackIco) {
      feedbackIco.innerHTML = feedbackIconSVG(type);
    }
  }

  function clearFeedback() {
    stepUi.feedbackType = '';
    stepUi.feedbackMsg = '';
    const feedback = byId('l1-feedback');
    if (feedback) feedback.hidden = true;
  }

  function renderTopbar() {
    if (!session) return;
    const cur = session.steps[session.index];
    const total = session.steps.length;
    const pct = session.mode === 'scratchpad' ? 100 : Math.round(((session.index + (stepUi.phase === 'correct' || stepUi.phase === 'explanation' ? 1 : 0)) / Math.max(1, total)) * 100);

    const pill = byId('l1-station-pill');
    const counter = byId('l1-step-counter');
    const fill = byId('l1-progress-fill');
    const track = byId('l1-progress-track');
    const audioBtn = byId('l1-audio-btn');
    const heartsPill = byId('l1-hearts-pill');

    if (pill) pill.textContent = session.title;
    if (counter) {
      if (session.mode === 'infinite') {
        counter.textContent = 'سلسلة: ' + ar(state.infiniteStats?.streak || 0);
      } else if (session.mode === 'scratchpad') {
        counter.textContent = 'استكشاف';
      } else {
        counter.innerHTML = '<bdi dir="ltr">' + ar(session.index + 1) + ' / ' + ar(total) + '</bdi>';
      }
    }
    if (fill) fill.style.width = Math.max(4, Math.min(100, pct)) + '%';
    if (track) track.setAttribute('aria-valuenow', String(pct));

    if (audioBtn) {
      const hasAudio = Boolean(cur && cur.hasAudio && typeof cur.audioFn === 'function');
      audioBtn.hidden = !hasAudio;
    }

    const isRecharge = session.mode === 'recharge';
    const labBtn = byId('l2-shell-lab-btn');
    if (labBtn) {
      const showLab = Boolean(!isRecharge && session.lesson === 2 && !session.remedial && session.nodeId !== 14);
      labBtn.hidden = !showLab;
    }
    const l3LabBtn = byId('l3-shell-lab-btn');
    if (l3LabBtn) {
      const showL3Lab = Boolean(!isRecharge && session.lesson === 3 && !session.remedial && session.nodeId !== 15);
      l3LabBtn.hidden = !showL3Lab;
    }
    const l4LabBtn = byId('l4-shell-lab-btn');
    if (l4LabBtn) {
      const showL4Lab = Boolean(!isRecharge && session.lesson === 4 && !session.remedial && session.nodeId !== 13);
      l4LabBtn.hidden = !showL4Lab;
    }
    const l5LabBtn = byId('l5-shell-lab-btn');
    if (l5LabBtn) {
      const showL5Lab = Boolean(!isRecharge && session.lesson === 5 && !session.remedial && session.nodeId !== 9);
      l5LabBtn.hidden = !showL5Lab;
    }
    const u2l1LabBtn = byId('u2l1-shell-lab-btn');
    if (u2l1LabBtn) {
      const showU2L1Lab = Boolean(!isRecharge && session.lesson === 7 && !session.remedial && session.nodeId !== 10);
      u2l1LabBtn.hidden = !showU2L1Lab;
    }

    if (heartsPill) {
      if (session.showHearts) {
        heartsPill.hidden = false;
        const hCount = state.hearts || 0;
        heartsPill.innerHTML = renderHeartsSVG(hCount, 3);
        heartsPill.setAttribute('aria-label', ar(hCount) + ' من ' + ar(3) + ' قلوب');
      } else {
        heartsPill.hidden = true;
      }
    }
  }

  function persistRunnerPosition() {
    if (!session || session.nodeId < 0) return;
    const cur = session.steps[session.index];
    state.runnerStep = {
      lesson: session.lesson || 1,
      nodeId: session.nodeId,
      mode: session.mode,
      stepIndex: session.index,
      subKey: cur?.key || null
    };
    if (session.lesson === 7 && typeof getU2L1NodeRecord === 'function') {
      if (!session.remedial) {
        const rec = getU2L1NodeRecord(session.nodeId);
        if (rec) rec.index = session.index;
      }
    } else if (session.lesson === 5 && typeof getLesson5NodeRecord === 'function') {
      if (!session.remedial) {
        const rec = getLesson5NodeRecord(session.nodeId);
        if (rec) rec.index = session.index;
      }
    } else if (session.lesson === 4 && typeof getLesson4NodeRecord === 'function') {
      if (!session.remedial) {
        const rec = getLesson4NodeRecord(session.nodeId);
        if (rec) rec.index = session.index;
      }
    } else if (session.lesson === 3 && typeof getLesson3NodeRecord === 'function') {
      if (!session.remedial) {
        const rec = getLesson3NodeRecord(session.nodeId);
        if (rec) rec.index = session.index;
      }
    } else if (session.lesson === 2 && typeof getLesson2NodeRecord === 'function') {
      if (!session.remedial) {
        const rec = getLesson2NodeRecord(session.nodeId);
        if (rec) rec.index = session.index;
      }
    } else if (session.mode === 'playground') {
      state.playgroundNumber = playgroundState.number;
    }
    saveState();
  }

  /* =========================================================
     Shared Mobile-First Components
     ========================================================= */

  function createPlaceBoard(n, options) {
    const opts = options || {};
    const wrap = document.createElement('div');
    wrap.className = 'l1-place-board';

    // Millions, Thousands, Ones
    for (let g = 2; g >= 0; g--) {
      const meta = CYCLE_META[g];
      const block = document.createElement('div');
      block.className = 'l1-period-block ' + meta.cls;
      block.innerHTML = '<div class="l1-period-title">' + meta.name + '</div>';

      const cells = document.createElement('div');
      cells.className = 'l1-period-cells';

      for (let p = g * 3 + 2; p >= g * 3; p--) {
        const dig = digit(n, p);
        const dim = 10 ** p > n && dig === 0;
        const el = document.createElement(opts.interactive ? 'button' : 'div');
        if (opts.interactive) el.type = 'button';
        el.className = (opts.interactive ? 'l1-house-btn' : 'l1-house-cell')
          + (dim ? ' is-dim' : '')
          + (opts.focusPlace === p ? ' is-focus' : '')
          + (opts.selectedPlace === p ? ' is-selected' : '')
          + (opts.correctPlace === p ? ' is-correct' : '')
          + (opts.wrongPlace === p ? ' is-wrong' : '');
        el.dataset.place = String(p);
        if (opts.interactive) {
          el.setAttribute('aria-pressed', String(opts.selectedPlace === p));
          el.disabled = Boolean(opts.disabled);
        }
        el.setAttribute('aria-label', places[p] + '؛ الرقم ' + dig);
        el.innerHTML = '<span class="l1-house-digit">' + dig + '</span><span class="l1-house-label">' + ALL_PLACE_SHORT[p] + '</span>';

        if (opts.interactive && opts.onSelectPlace) {
          el.addEventListener('click', () => opts.onSelectPlace(p));
        }
        cells.append(el);
      }

      block.append(cells);
      wrap.append(block);
    }

    return wrap;
  }

  function createRadioOptions(opts) {
    const items = opts.items || [];
    const numeric = items.every(it => typeof it.rawValue === 'number' || it.numeric);
    const list = document.createElement('div');
    list.className = 'l1-options-list' + (numeric && items.length % 2 === 0 && items.length <= 4 ? ' cols-2' : '');
    list.setAttribute('role', 'radiogroup');
    list.setAttribute('aria-label', opts.ariaLabel || 'خيارات الإجابة');

    items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l1-option-btn' + (numeric ? ' numeric' : '');
      btn.setAttribute('role', 'radio');
      const isSelected = opts.selectedIdx === idx;
      const isRight = opts.revealedRightIdx === idx;
      const isWrong = opts.wrongIndices?.includes(idx);

      btn.setAttribute('aria-checked', String(isSelected));
      if (isSelected) btn.classList.add('is-selected');
      if (isRight) btn.classList.add('is-correct');
      if (isWrong) btn.classList.add('is-wrong');
      if (opts.disabled) btn.disabled = true;

      const idxBadge = numeric ? '' : '<span class="l1-option-index">' + ar(idx + 1) + '</span>';
      const labelHTML = typeof item.rawValue === 'number'
        ? bdiNum(item.rawValue)
        : opts.formula
          ? '<bdi dir="ltr">' + esc(item.label) + '</bdi>'
          : esc(item.label);

      btn.innerHTML = idxBadge + '<span class="l1-option-text">' + labelHTML + '</span>';

      btn.addEventListener('click', () => {
        if (opts.disabled || btn.disabled) return;
        opts.onSelect(idx);
      });

      list.append(btn);
    });

    return list;
  }

  function createWheelsControl(cfg) {
    const val = cfg.getValue();
    const selPlace = cfg.getSelectedPlace();
    const activePeriod = Math.floor(selPlace / 3); // 0=ones,1=thousands,2=millions
    const shell = document.createElement('div');
    shell.className = 'l1-wheels-shell';

    // Top live strip + Zero Reset
    const topRow = document.createElement('div');
    topRow.className = 'l1-live-num-row';

    const strip = document.createElement('div');
    strip.className = 'l1-live-digits-strip';
    strip.dir = 'ltr';
    strip.setAttribute('aria-label', 'العدد الحالي ' + fmt(val));
    for (let g = 2; g >= 0; g--) {
      for (let p = g * 3 + 2; p >= g * 3; p--) {
        const sp = document.createElement('span');
        sp.className = 'l1-strip-digit' + (p === selPlace ? ' is-selected' : '');
        sp.dataset.stripPlace = String(p);
        sp.textContent = String(digit(val, p));
        strip.append(sp);
      }
      if (g > 0) {
        const sep = document.createElement('span');
        sep.className = 'l1-strip-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = ',';
        strip.append(sep);
      }
    }

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'l1-zero-reset-btn';
    resetBtn.disabled = Boolean(cfg.disabled);
    resetBtn.textContent = 'تصفير اللوحة';
    resetBtn.addEventListener('click', () => {
      if (cfg.disabled) return;
      cfg.setValue(0, selPlace);
    });

    topRow.append(strip, resetBtn);
    shell.append(topRow);

    // Mobile Period Tabs (Millions | Thousands | Ones)
    const pTabs = document.createElement('div');
    pTabs.className = 'l1-period-tabs';
    pTabs.setAttribute('role', 'tablist');
    pTabs.setAttribute('aria-label', 'اختيار دورة المنازل');

    for (let g = 2; g >= 0; g--) {
      const meta = CYCLE_META[g];
      const triStr = String(digit(val, g * 3 + 2)) + String(digit(val, g * 3 + 1)) + String(digit(val, g * 3));
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'l1-period-tab' + (activePeriod === g ? ' is-active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(activePeriod === g));
      tab.dataset.period = String(g);
      tab.innerHTML = '<span>' + meta.short + '</span><bdi dir="ltr">' + triStr + '</bdi>';
      tab.addEventListener('click', () => {
        cfg.setSelectedPlace(g * 3 + 2);
      });
      pTabs.append(tab);
    }
    shell.append(pTabs);

    // Wheel Groups
    const groupsWrap = document.createElement('div');
    groupsWrap.className = 'l1-wheel-groups';

    for (let g = 2; g >= 0; g--) {
      const meta = CYCLE_META[g];
      const group = document.createElement('div');
      group.className = 'l1-wheel-group ' + meta.cls + (activePeriod === g ? ' is-active' : '');
      group.dataset.groupPeriod = String(g);
      group.innerHTML = '<div class="l1-wheel-group-title">' + meta.name + '</div>';

      const cols = document.createElement('div');
      cols.className = 'l1-wheel-cols';

      for (let p = g * 3 + 2; p >= g * 3; p--) {
        const col = document.createElement('div');
        col.className = 'l1-wheel-col';

        const pLabel = document.createElement('span');
        pLabel.className = 'l1-wheel-place';
        pLabel.textContent = ALL_PLACE_SHORT[p];

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'l1-wheel-step-btn';
        upBtn.textContent = '+';
        upBtn.setAttribute('aria-label', 'زيادة رقم ' + places[p]);
        upBtn.disabled = Boolean(cfg.disabled);
        upBtn.addEventListener('click', () => stepDigit(p, 1));

        const spinEl = document.createElement('div');
        spinEl.className = 'l1-wheel-val' + (p === selPlace ? ' is-selected' : '');
        spinEl.id = 'l1-wheel-val-' + p;
        spinEl.setAttribute('role', 'spinbutton');
        spinEl.setAttribute('tabindex', cfg.disabled ? '-1' : '0');
        spinEl.setAttribute('aria-valuemin', '0');
        spinEl.setAttribute('aria-valuemax', '9');
        spinEl.setAttribute('aria-valuenow', String(digit(val, p)));
        spinEl.setAttribute('aria-label', places[p] + '، القيمة ' + digit(val, p));
        spinEl.textContent = String(digit(val, p));

        spinEl.addEventListener('keydown', e => {
          if (cfg.disabled) return;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            stepDigit(p, 1);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            stepDigit(p, -1);
          }
        });

        spinEl.addEventListener('pointerdown', e => {
          if (cfg.disabled) return;
          cancelWheelDrag();
          let lastY = e.clientY;
          let acc = 0;
          const threshold = 22;
          const onMove = ev => {
            const dy = lastY - ev.clientY;
            acc += dy;
            lastY = ev.clientY;
            if (Math.abs(acc) >= threshold) {
              const steps = acc > 0 ? 1 : -1;
              acc = 0;
              stepDigit(p, steps);
            }
          };
          const onEnd = () => cancelWheelDrag();
          wheelDrag = { onMove, onEnd };
          global.addEventListener('pointermove', onMove);
          global.addEventListener('pointerup', onEnd);
          global.addEventListener('pointercancel', onEnd);
        });

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'l1-wheel-step-btn';
        downBtn.textContent = '-';
        downBtn.setAttribute('aria-label', 'إنقاص رقم ' + places[p]);
        downBtn.disabled = Boolean(cfg.disabled);
        downBtn.addEventListener('click', () => stepDigit(p, -1));

        col.append(pLabel, upBtn, spinEl, downBtn);
        cols.append(col);
      }

      group.append(cols);
      groupsWrap.append(group);
    }
    shell.append(groupsWrap);

    function stepDigit(p, delta) {
      if (cfg.disabled) return;
      const curVal = cfg.getValue();
      const oldD = digit(curVal, p);
      const nextD = ((oldD + delta) % 10 + 10) % 10;
      const nextVal = curVal + (nextD - oldD) * 10 ** p;
      cfg.setValue(nextVal, p);
    }

    // Selected House & Value Meta Row
    const curD = digit(val, selPlace);
    const metaRow = document.createElement('div');
    metaRow.className = 'l1-playground-meta';
    metaRow.innerHTML =
      '<div class="l1-meta-chip"><small>المنزلة المحددة</small><strong>' + places[selPlace] + ' (' + curD + ')</strong></div>'
      + '<div class="l1-meta-chip"><small>قيمة الرقم</small><strong>' + bdiNum(curD * 10 ** selPlace) + '</strong></div>';
    shell.append(metaRow);

    return shell;
  }

  function mountHintBtnToContext(btn) {
    const ctxRow = document.querySelector('#l1-shell .l1-context-row');
    if (ctxRow) {
      ctxRow.querySelector('.l1-hint-btn')?.remove();
      ctxRow.append(btn);
      return true;
    }
    return false;
  }

  function appendHintWidget(mount, rawStep, dataObj, onHintUnlocked) {
    if (typeof getProgressiveHints !== 'function') return;
    const tier = Number(dataObj.hintTier) || 0;
    const hints = [...getProgressiveHints(rawStep)];
    if (rawStep?.type === 'wheels') {
      const curVal = dataObj.value ?? rawStep.initial ?? 0;
      let diffP = -1;
      for (let p = 8; p >= 0; p--) {
        if (digit(curVal, p) !== digit(rawStep.n, p)) { diffP = p; break; }
      }
      hints[2] = diffP >= 0
        ? ('مساعدة عملية: حرّك سهم منزلة «' + places[diffP] + '» ليصبح رقمها ' + digit(rawStep.n, diffP) + '.')
        : ('مساعدة عملية: تأكد من مطابقة جميع أرقام العدد ' + fmt(rawStep.n) + ' ثم اضغط تحقّق.');
    }

    const bar = document.createElement('div');
    bar.className = 'l1-hint-bar';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l1-hint-btn';
    btn.disabled = tier >= 3;
    btn.innerHTML = getIconSVG('lightbulb')
      + '<span>' + (tier === 0 ? 'تلميح (1/3)' : tier < 3 ? ('تلميح (' + ar(tier + 1) + '/3)') : 'كل التلميحات') + '</span>';

    btn.addEventListener('click', () => {
      if (tier >= 3) return;
      const nextTier = Math.min(3, tier + 1);
      dataObj.hintTier = nextTier;
      dataObj.hintLevel = nextTier;
      dataObj.usedHint = nextTier > 0;
      if (nextTier >= 3) {
        dataObj.usedHelp = true;
        dataObj.assisted = true;
        dataObj.revealedAnswer = true;
        dataObj.status = 'assisted';
        const curStep = session?.steps?.[session.index];
        if (session?.mode === 'mission' && curStep && Number.isInteger(curStep.missionId)) {
          const rec = missionRecord(curStep.missionId);
          rec.assistedSteps = rec.assistedSteps || new Set();
          rec.assistedSteps.add(curStep.stepIndex);
          rec.independentSteps?.delete?.(curStep.stepIndex);
        }
      }
      saveState();
      if (onHintUnlocked) onHintUnlocked();
      else renderStep();
    });

    if (!mountHintBtnToContext(btn)) bar.append(btn);

    if (tier > 0 && hints[tier - 1]) {
      const box = document.createElement('div');
      box.className = 'l1-hint-content';
      box.textContent = String(hints[tier - 1]);
      bar.append(box);
    }

    mount.append(bar);
  }

  /* =========================================================
     Core Step Rendering
     ========================================================= */

  function renderStep() {
    if (!session) return;
    renderToken++;
    cleanupStepSideEffects();

    const cur = session.steps[session.index];
    if (!cur) return;

    stepUi = {
      phase: 'incomplete',
      feedbackType: '',
      feedbackMsg: '',
      selectedIdx: null,
      selectedPlace: null,
      errorSelectedIdx: null,
      matchPendingSource: null,
      matchPendingTarget: null,
      needsRecharge: false,
      rapidDone: false,
      infiniteCompleted: false
    };

    const shellEl = byId('l1-shell');
    const l4DemoName = cur.demo
      || (cur.kind === 'l4_number_line' && cur.mode === 'tap_pick' ? 'number_line_pick' : '')
      || (cur.kind === 'l4_vertical_scale' ? (cur.exploreFirst ? 'vertical_sea_explore' : 'vertical_scene') : '');
    if (shellEl) {
      shellEl.dataset.l1Lesson = String(session.lesson || 1);
      if (l4DemoName) shellEl.dataset.l4Demo = l4DemoName;
      else delete shellEl.dataset.l4Demo;
    }
    const contextRow = document.querySelector('#l1-shell .l1-context-row');
    if (contextRow) contextRow.hidden = (
      l4DemoName === 'shubak_explore' ||
      l4DemoName === 'shubak_adjust' ||
      l4DemoName === 'number_line' ||
      l4DemoName === 'number_line_pick' ||
      l4DemoName === 'vertical_sea_explore' ||
      l4DemoName === 'vertical_scene' ||
      l4DemoName === 'situation_single' ||
      l4DemoName === 'multi_thermo' ||
      l4DemoName === 'number_line_fill' ||
      l4DemoName === 'zero_rule' ||
      l4DemoName === 'neveen_drop'
    );
    const tagEl = byId('l1-context-pill');
    const subTagEl = byId('l1-sub-tag');
    const promptEl = byId('l1-prompt');
    const bodyEl = byId('l1-body');

    if (tagEl) tagEl.textContent = cur.skillTag || session.title;
    if (subTagEl) {
      if (cur.totalSub && cur.totalSub > 1 && cur.kind !== 'rapid_intro' && cur.kind !== 'rapid_round') {
        subTagEl.textContent = 'جزء ' + ar((cur.subIndex || 0) + 1) + ' من ' + ar(cur.totalSub);
      } else {
        subTagEl.textContent = '';
      }
    }
    if (promptEl) {
      const pTxt = String(cur.prompt || '').trim();
      promptEl.hidden = !pTxt;
      promptEl.innerHTML = pTxt ? formatPromptHTML(cur.prompt) : '';
    }
    document.querySelector('#l1-shell .l1-context-row .l1-hint-btn')?.remove();
    if (bodyEl) bodyEl.replaceChildren();

    renderTopbar();
    persistRunnerPosition();

    // Infinite mode skill switcher pills
    if (session.mode === 'infinite' && bodyEl) {
      const skillBar = document.createElement('div');
      skillBar.className = 'l1-mode-tabs';
      skillBar.setAttribute('aria-label', 'اختيار نوع المهارة');
      [
        { key: 'all', label: 'الكل' },
        { key: 'place', label: 'المنزلة' },
        { key: 'verbal', label: 'اللفظية' }
      ].forEach(sk => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-mode-tab' + (state.infiniteSkill === sk.key ? ' is-active' : '');
        b.textContent = sk.label;
        b.addEventListener('click', () => {
          state.infiniteSkill = sk.key;
          state.infiniteStep = generateInfiniteStep(state.infiniteSkill);
          session = buildInfiniteSession(state.infiniteSkill);
          renderStep();
        });
        skillBar.append(b);
      });
      bodyEl.append(skillBar);
    }

    // Dispatch Step Renderer
    switch (cur.kind) {
      case 's1_warmup':
        renderS1Warmup(cur, bodyEl);
        break;
      case 's1_branch':
        renderS1Branch(cur, bodyEl);
        break;
      case 's1_worked_model':
        renderS1WorkedModel(cur, bodyEl);
        break;
      case 's1_review_mc':
        renderS1ReviewMc(cur, bodyEl);
        break;
      case 's1_bridge':
        renderS1Bridge(cur, bodyEl);
        break;
      case 's1_gradual':
        renderS1Gradual(cur, bodyEl);
        break;
      case 'story_slide':
        renderStorySlideStep(cur, bodyEl);
        break;
      case 'playground_quest':
      case 'scratchpad':
        renderPlaygroundStep(cur, bodyEl);
        break;
      case 'recharge_quiz':
        renderRechargeQuizStep(cur, bodyEl);
        break;
      case 'target':
        renderTargetStep(cur, bodyEl);
        break;
      case 'zeros':
        renderZerosStep(cur, bodyEl);
        break;
      case 'wheels':
        renderWheelsStep(cur, bodyEl);
        break;
      case 'choice':
        renderChoiceStep(cur, bodyEl);
        break;
      case 'verbal_period':
        renderVerbalPeriodStep(cur, bodyEl);
        break;
      case 'match':
        renderMatchStep(cur, bodyEl);
        break;
      case 'fields_house':
        renderFieldsHouseStep(cur, bodyEl);
        break;
      case 'missing':
        renderMissingStep(cur, bodyEl);
        break;
      case 'error_find':
        renderErrorFindStep(cur, bodyEl);
        break;
      case 'error_fix':
        renderErrorFixStep(cur, bodyEl);
        break;
      case 'rapid_intro':
        renderRapidIntroStep(cur, bodyEl);
        break;
      case 'rapid_round':
        renderRapidRoundStep(cur, bodyEl);
        break;
      case 'produce_read':
        renderProduceReadStep(cur, bodyEl);
        break;
      case 'produce_explain':
        renderProduceExplainStep(cur, bodyEl);
        break;
      case 'exit_question':
        renderExitQuestionStep(cur, bodyEl);
        break;
      case 'l2_mcq':
        renderL2McqStep(cur, bodyEl);
        break;
      case 'l2_board_scan':
        renderL2BoardScanStep(cur, bodyEl);
        break;
      case 'l2_symbol_compare':
        renderL2SymbolCompareStep(cur, bodyEl);
        break;
      case 'l2_order_cards':
        renderL2OrderCardsStep(cur, bodyEl);
        break;
      case 'l2_missing_digit':
        renderL2MissingDigitStep(cur, bodyEl);
        break;
      case 'l2_num_input':
        renderL2NumInputStep(cur, bodyEl);
        break;
      case 'l2_pattern_input':
        renderL2PatternInputStep(cur, bodyEl);
        break;
      case 'l2_open_range_input':
        renderL2OpenRangeInputStep(cur, bodyEl);
        break;
      case 'l2_exit_mcq':
        renderL2ExitMcqStep(cur, bodyEl);
        break;
      case 'l3_teach':
        renderL3TeachStep(cur, bodyEl);
        break;
      case 'l3_vertical_op':
        renderL3VerticalOpStep(cur, bodyEl);
        break;
      case 'l3_missing_digits':
        renderL3MissingDigitsStep(cur, bodyEl);
        break;
      case 'l4_teach':
        renderL4TeachStep(cur, bodyEl);
        break;
      case 'l4_number_line':
        renderL4NumberLineStep(cur, bodyEl);
        break;
      case 'l4_vertical_scale':
        renderL4VerticalScaleStep(cur, bodyEl);
        break;
      case 'l4_thermometer':
        renderL4ThermometerStep(cur, bodyEl);
        break;
      case 'l4_situation_table':
        renderL4SituationTableStep(cur, bodyEl);
        break;
      case 'l4_talk_builder':
        renderL4TalkBuilderStep(cur, bodyEl);
        break;
      case 'l5_teach':
        renderL5TeachStep(cur, bodyEl);
        break;
      case 'l5_table_builder':
        renderL5TableBuilderStep(cur, bodyEl);
        break;
      case 'l5_pair_table':
        renderL5PairTableStep(cur, bodyEl);
        break;
      case 'l5_strategy_builder':
        renderL5StrategyBuilderStep(cur, bodyEl);
        break;
      case 'u2l1_teach':
        renderU2L1TeachStep(cur, bodyEl);
        break;
      case 'u2l1_split_tree':
        renderU2L1SplitTreeStep(cur, bodyEl);
        break;
      case 'u2l1_dh_chain':
        renderU2L1DHChainStep(cur, bodyEl);
        break;
      case 'u2l1_mental_drill':
        renderU2L1MentalDrillStep(cur, bodyEl);
        break;
      case 'u2l1_balloons':
        renderU2L1BalloonsStep(cur, bodyEl);
        break;
      case 'u2l1_train_story':
        renderU2L1TrainStoryStep(cur, bodyEl);
        break;
      case 'u2l1_reason_builder':
        renderU2L1ReasonBuilderStep(cur, bodyEl);
        break;
      default:
        setPrimaryButtonState('explanation', 'متابعة');
    }

    renderUnifiedTutorCard(cur);
    syncShellFocusAttrs(stepUi.phase);

    const stage = byId('l1-stage');
    if (stage) stage.scrollTop = 0;
    if (typeof window.notifyAiTutorContextChanged === 'function') {
      window.notifyAiTutorContextChanged();
    }
  }

  function getActiveStepData(cur) {
    if (cur.isInfiniteStep) {
      if (!state.infiniteRecord) state.infiniteRecord = { index: 0, passed: new Set(), data: {}, lastMessage: '' };
      if (!state.infiniteRecord.data[0]) state.infiniteRecord.data[0] = {};
      return state.infiniteRecord.data[0];
    }
    return missionStepData(cur.missionId, cur.stepIndex);
  }

  function isCurrentStepPassed(cur) {
    if (cur.isInfiniteStep) return Boolean(state.infiniteRecord?.passed?.has(0));
    return missionRecord(cur.missionId).passed.has(cur.stepIndex);
  }

  function deductHeartOnError() {
    if (!session || !session.showHearts || session.mode === 'infinite' || session.mode === 'recharge') return;
    state.streak = 0;
    state.errors = (state.errors || 0) + 1;
    if (state.hearts > 0) state.hearts = Math.max(0, state.hearts - 1);
    if (state.hearts === 0) stepUi.needsRecharge = true;
    if (typeof renderStreakIndicator === 'function') renderStreakIndicator();
    if (typeof renderHUD === 'function') renderHUD();
  }

  function markSessionError(key) {
    session.errors = (session.errors || 0) + 1;
    const cur = session?.steps?.[session.index];
    const sk = cur?.rawStep && typeof stepSkill === 'function' ? stepSkill(cur.rawStep) : null;
    if (sk && state.skillStats?.[sk]) {
      state.skillStats[sk].err = (state.skillStats[sk].err || 0) + 1;
    }
    if (session.mode === 'infinite') {
      if (state.infiniteStats) state.infiniteStats.streak = 0;
    } else if (session.mode === 'mission') {
      deductHeartOnError();
    }
    renderTopbar();
    saveState();
  }

  function recordMissionPass(cur) {
    sound(true);
    haptic(true);

    if (cur.isInfiniteStep) {
      if (!state.infiniteRecord) state.infiniteRecord = { index: 0, passed: new Set(), data: {}, lastMessage: '' };
      state.infiniteRecord.passed.add(0);
      state.infiniteStats.solved = (state.infiniteStats.solved || 0) + 1;
      state.infiniteStats.streak = (state.infiniteStats.streak || 0) + 1;
      state.infiniteStats.maxStreak = Math.max(state.infiniteStats.maxStreak || 0, state.infiniteStats.streak);
      state.infiniteStats.bonusPoints = (state.infiniteStats.bonusPoints || 0) + 10;
      stepUi.infiniteCompleted = true;
      renderHUD();
      saveState();
      return;
    }

    const mId = cur.missionId;
    const rec = missionRecord(mId);
    if (cur.isFinalSubOfStep !== false) {
      const alreadyPassed = rec.passed.has(cur.stepIndex);
      const d = getActiveStepData(cur);
      const assisted = isStepAssisted(cur, d);
      d.status = assisted ? 'assisted' : 'independent';
      d.independent = !assisted;
      if (assisted) {
        d.usedHelp = true;
        d.assisted = true;
        d.revealedAnswer = true;
        rec.assistedSteps = rec.assistedSteps || new Set();
        rec.assistedSteps.add(cur.stepIndex);
        rec.independentSteps?.delete?.(cur.stepIndex);
      } else {
        rec.independentSteps = rec.independentSteps || new Set();
        rec.independentSteps.add(cur.stepIndex);
      }

      if (!alreadyPassed) {
        const sk = cur?.rawStep && typeof stepSkill === 'function' ? stepSkill(cur.rawStep) : null;
        if (sk && state.skillStats?.[sk]) {
          state.skillStats[sk].ok = (state.skillStats[sk].ok || 0) + 1;
          if (assisted) state.skillStats[sk].assistedOk = (state.skillStats[sk].assistedOk || 0) + 1;
          else state.skillStats[sk].independentOk = (state.skillStats[sk].independentOk || 0) + 1;
        }
        state.streak = (state.streak || 0) + 1;
        state.maxSessionStreak = Math.max(state.maxSessionStreak || 0, state.streak);
        if (typeof renderStreakIndicator === 'function') renderStreakIndicator();
      }

      rec.passed.add(cur.stepIndex);
      if (rec.index < missions[mId].steps.length - 1 && rec.index <= cur.stepIndex) {
        rec.index = cur.stepIndex + 1;
      }
    }

    const allDone = rec.passed.size === missions[mId].steps.length;
    if (allDone) {
      const mNode = PATH_NODES.find(n => n.type === 'mission' && n.missionId === mId);
      if (mNode) {
        state.nodesCompleted.add(mNode.id);
        let earnedStars = 3;
        if (session.errors === 1) earnedStars = 2;
        else if (session.errors >= 2) earnedStars = 1;
        if (!state.nodeStars) state.nodeStars = {};
        state.nodeStars[mNode.id] = Math.max(state.nodeStars[mNode.id] || 0, earnedStars);
      }
      state.completed.add(mId);
      if (state.completed.size === 12) state.finished = true;
      const unlockedBefore = new Set(state.badges || []);
      checkMilestoneBadges(true);
      const unlockedNow = [...(state.badges || [])].filter(id => !unlockedBefore.has(id));
      if (unlockedNow.length) session.unlockedBadges = [...(session.unlockedBadges || []), ...unlockedNow];
    }

    renderHUD();
    renderDuolingoMap();
    saveState();
  }

  /* =========================================================
     1. Station 1 Builders
     ========================================================= */

  function renderS1Warmup(cur, root) {
    const ob = state.onboarding || (state.onboarding = createDefaultOnboarding());
    const qState = ob[cur.qKey];
    const items = cur.options.map(v => ({ label: fmt(v), rawValue: v, numeric: true }));

    if (cur.n !== undefined) {
      const numCard = document.createElement('div');
      numCard.className = 'l1-num-card';
      numCard.innerHTML = highlightedNumberHTML(cur.n, cur.targetPlace);
      root.append(numCard);
    }

    if (cur.cardsVisual) {
      const cardsRow = document.createElement('div');
      cardsRow.className = 'l1-num-card';
      cardsRow.innerHTML = '<div class="l1-big-num" dir="ltr">10 × 1,000</div>'
        + '<p class="l1-subtext">10 بطاقات، قيمة كل بطاقة <bdi dir="ltr">1,000</bdi></p>';
      root.append(cardsRow);
    }

    let wrongList = [];
    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      const optsEl = createRadioOptions({
        items,
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: qState.answered ? cur.options.indexOf(cur.correct) : -1,
        wrongIndices: wrongList,
        disabled: qState.answered,
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          clearFeedback();
          setPrimaryButtonState('ready');
          draw();
        }
      });
      root.append(optsEl);
    };

    const hintBar = document.createElement('div');
    hintBar.className = 'l1-hint-bar';
    const hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'l1-hint-btn';
    hintBtn.innerHTML = getIconSVG('lightbulb') + '<span>تلميح سريع</span>';
    const hintBox = document.createElement('div');
    hintBox.className = 'l1-hint-content';
    hintBox.hidden = !qState.usedHelp;
    hintBox.textContent = cur.hintText;
    hintBtn.setAttribute('aria-expanded', String(!hintBox.hidden));
    hintBtn.addEventListener('click', () => {
      qState.usedHelp = true;
      hintBox.hidden = !hintBox.hidden;
      hintBtn.setAttribute('aria-expanded', String(!hintBox.hidden));
      saveState();
    });
    if (!mountHintBtnToContext(hintBtn)) hintBar.append(hintBtn);
    hintBar.append(hintBox);
    root.append(hintBar);

    if (qState.answered) {
      stepUi.selectedIdx = cur.options.indexOf(cur.correct);
      draw();
      showFeedback('good', cur.explainRight);
      setPrimaryButtonState('correct');
    } else {
      draw();
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      const chosen = cur.options[stepUi.selectedIdx];
      if (qState.attempts === 0) qState.firstAttemptCorrect = (chosen === cur.correct && !qState.usedHelp);
      qState.attempts++;
      qState.lastChoice = chosen;
      if (chosen === cur.correct) {
        qState.answered = true;
        if (cur.qKey === 'q2') {
          ob.warmupDone = true;
          const bothFast = Boolean(ob.q1?.firstAttemptCorrect && qState.firstAttemptCorrect);
          ob.station1Phase = bothFast ? 'adaptive_branch' : 'review';
          if (!bothFast) {
            ob.pathChosen = 'review';
            ob.reviewBypassed = false;
            ob.reviewStep = 0;
          }
          if (session?.mode === 'station1') {
            session.steps = buildStation1Steps();
            const q2Idx = session.steps.findIndex(st => st.key === 'warmup_q2');
            if (q2Idx >= 0) session.index = q2Idx;
            renderTopbar();
          }
        } else {
          ob.station1Phase = 'warmup_q2';
        }
        sound(true);
        haptic(true);
        draw();
        showFeedback('good', cur.explainRight);
        setPrimaryButtonState('correct');
        saveState();
      } else {
        sound(false);
        haptic(false);
        wrongList = [stepUi.selectedIdx];
        draw();
        showFeedback('bad', cur.explainWrong);
        setPrimaryButtonState('wrong');
        saveState();
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongList = [];
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderS1Branch(cur, root) {
    const ob = state.onboarding || (state.onboarding = createDefaultOnboarding());
    stepUi.selectedIdx = ob.pathChosen === 'review' ? 1 : 0;

    const infoCard = document.createElement('div');
    infoCard.className = 'l1-info-card';
    infoCard.innerHTML = '<div class="l1-info-item">أجبت عن سؤالَي التهيئة بإتقان! اختر المسار الأنسب لك:</div>';
    root.append(infoCard);

    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      root.append(createRadioOptions({
        items: cur.options.map(o => ({ label: o.label })),
        selectedIdx: stepUi.selectedIdx,
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          clearFeedback();
          setPrimaryButtonState('explanation', 'متابعة');
          draw();
        }
      }));
    };
    draw();
    setPrimaryButtonState('explanation', 'متابعة');

    stepUi.onNext = () => {
      const choiceId = cur.options[stepUi.selectedIdx || 0].id;
      ob.warmupDone = true;
      ob.pathChosen = choiceId;
      ob.reviewBypassed = choiceId === 'shortcut';
      if (choiceId === 'shortcut') {
        ob.station1Phase = 'bridge';
        ob.bridgeLevel = 0;
        session.steps = buildStation1Steps();
        const nextIdx = session.steps.findIndex(st => st.key === 'bridge_0');
        session.index = nextIdx >= 0 ? nextIdx : Math.min(session.steps.length - 1, session.index + 1);
      } else {
        ob.station1Phase = 'review';
        ob.reviewStep = 0;
        session.steps = buildStation1Steps();
        const revIdx = session.steps.findIndex(st => st.key === 'review_0');
        session.index = revIdx >= 0 ? revIdx : session.index + 1;
      }
      saveState();
      renderStep();
    };
  }

  function renderS1WorkedModel(cur, root) {
    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(cur.n, cur.targetPlace);
    root.append(numCard);

    const card = document.createElement('div');
    card.className = 'l1-info-card';
    card.innerHTML = '<div class="l1-info-list">'
      + cur.modelPoints.map(pt => '<div class="l1-info-item">' + esc(pt) + '</div>').join('')
      + '</div>';
    root.append(card);

    setPrimaryButtonState('explanation', 'متابعة');
    stepUi.onNext = () => {
      const ob = state.onboarding;
      if (ob) ob.reviewStep = 1;
      saveState();
      advanceStep();
    };
  }

  function renderS1ReviewMc(cur, root) {
    const ob = state.onboarding || createDefaultOnboarding();
    const isQ1 = cur.key === 'review_1';
    const doneFlag = isQ1 ? 'reviewQ1Done' : 'reviewQ2Done';

    if (cur.n !== undefined) {
      const numCard = document.createElement('div');
      numCard.className = 'l1-num-card';
      numCard.innerHTML = highlightedNumberHTML(cur.n, cur.targetPlace);
      root.append(numCard);
    }

    let wrongList = [];
    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      root.append(createRadioOptions({
        items: cur.options.map(v => ({ label: fmt(v), rawValue: v, numeric: true })),
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: ob[doneFlag] ? cur.options.indexOf(cur.correct) : -1,
        wrongIndices: wrongList,
        disabled: Boolean(ob[doneFlag]),
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          clearFeedback();
          setPrimaryButtonState('ready');
          draw();
        }
      }));
    };

    if (ob[doneFlag]) {
      stepUi.selectedIdx = cur.options.indexOf(cur.correct);
      draw();
      showFeedback('good', cur.explainRight);
      setPrimaryButtonState('correct');
    } else {
      draw();
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      const chosen = cur.options[stepUi.selectedIdx];
      if (chosen === cur.correct) {
        ob[doneFlag] = true;
        if (!isQ1) {
          ob.reviewDone = true;
          ob.station1Phase = 'bridge';
        }
        sound(true);
        haptic(true);
        draw();
        showFeedback('good', cur.explainRight);
        setPrimaryButtonState('correct');
        saveState();
      } else {
        sound(false);
        haptic(false);
        wrongList = [stepUi.selectedIdx];
        draw();
        showFeedback('bad', cur.explainWrong);
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongList = [];
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderS1Bridge(cur, root) {
    const ob = state.onboarding || (state.onboarding = createDefaultOnboarding());
    const b = cur.bridge;
    const lvl = b.level;
    ob.station1Phase = 'bridge';
    ob.bridgeLevel = lvl;

    const statusBar = document.createElement('div');
    statusBar.className = 'l1-bridge-actions';

    const counterLabel = document.createElement('div');
    counterLabel.className = 'l1-sub-tag';

    const fillBtn = document.createElement('button');
    fillBtn.type = 'button';
    fillBtn.className = 'l1-bridge-fill-btn';
    fillBtn.textContent = 'جمع الـ 10 بطاقات';

    statusBar.append(counterLabel, fillBtn);

    const grid = document.createElement('div');
    grid.className = 'l1-bridge-grid';

    const mergedBox = document.createElement('div');
    mergedBox.className = 'l1-num-card';

    root.append(statusBar, grid, mergedBox);

    const syncBridgeUi = () => {
      const collected = Math.max(0, Math.min(10, ob.bridgeCardsCollected[lvl] || 0));
      const merged = Boolean(ob.bridgeMerged[lvl]);
      const curSum = merged ? b.targetVal : collected * b.cardUnit;

      counterLabel.innerHTML = 'المجموع: <bdi dir="ltr">' + fmt(curSum) + '</bdi> (' + ar(merged ? 10 : collected) + '/10)';
      fillBtn.disabled = merged || collected >= 10;

      grid.replaceChildren();
      for (let i = 0; i < 10; i++) {
        const isOn = merged || i < collected;
        const cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className = 'l1-bridge-card-btn' + (isOn ? ' is-collected' : '');
        cardBtn.disabled = merged;
        cardBtn.setAttribute('aria-pressed', String(isOn));
        cardBtn.setAttribute('aria-label', 'بطاقة ' + ar(i + 1) + ' بقيمة ' + fmt(b.cardUnit));
        cardBtn.innerHTML = '<bdi dir="ltr">' + fmt(b.cardUnit) + '</bdi>';
        cardBtn.addEventListener('click', () => {
          if (merged) return;
          const curCount = ob.bridgeCardsCollected[lvl] || 0;
          ob.bridgeCardsCollected[lvl] = Math.min(10, curCount + 1);
          sound(true, 420 + ob.bridgeCardsCollected[lvl] * 25);
          saveState();
          syncBridgeUi();
        });
        grid.append(cardBtn);
      }

      if (merged) {
        mergedBox.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(b.targetVal) + '</div>'
          + '<p class="l1-subtext">' + esc(b.toPlace) + ' = 10 × ' + esc(b.fromPlace) + '</p>';
        showFeedback('good', b.summary);
        setPrimaryButtonState('correct');
      } else {
        mergedBox.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(curSum) + '</div>'
          + '<p class="l1-subtext">الهدف: تكوين ' + bdiNum(b.targetVal) + ' في ' + esc(b.toPlace) + '</p>';
        if (collected >= 10) {
          setPrimaryButtonState('ready', 'تحقّق');
        } else {
          setPrimaryButtonState('incomplete', 'تحقّق');
        }
      }
    };

    fillBtn.addEventListener('click', () => {
      ob.bridgeCardsCollected[lvl] = 10;
      sound(true, 620);
      saveState();
      syncBridgeUi();
    });

    syncBridgeUi();

    stepUi.onCheck = () => {
      if ((ob.bridgeCardsCollected[lvl] || 0) < 10) return;
      ob.bridgeMerged[lvl] = true;
      if (lvl === 2) {
        ob.bridgeDone = true;
        ob.station1Phase = 'gradual_millions';
      }
      sound(true);
      haptic(true);
      saveState();
      syncBridgeUi();
    };
  }

  function renderS1Gradual(cur, root) {
    const ob = state.onboarding || (state.onboarding = createDefaultOnboarding());
    const g = cur.grad;
    ob.station1Phase = 'gradual_millions';
    ob.gradualStep = g.step;

    const alreadyDone = Boolean(ob.gradualAnswered?.[g.step]);
    if (alreadyDone) stepUi.selectedPlace = g.targetPlace;

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(g.n, null);
    root.append(numCard);

    let wrongP = null;
    const drawBoard = () => {
      root.querySelector('.l1-place-board')?.remove();
      const board = createPlaceBoard(g.n, {
        interactive: true,
        selectedPlace: stepUi.selectedPlace,
        correctPlace: alreadyDone || stepUi.phase === 'correct' ? g.targetPlace : null,
        wrongPlace: wrongP,
        disabled: alreadyDone || stepUi.phase === 'correct',
        onSelectPlace: p => {
          stepUi.selectedPlace = p;
          wrongP = null;
          clearFeedback();
          drawBoard();
          setPrimaryButtonState('ready');
        }
      });
      root.append(board);
    };

    const hintBar = document.createElement('div');
    hintBar.className = 'l1-hint-bar';
    const hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'l1-hint-btn';
    hintBtn.innerHTML = getIconSVG('lightbulb') + '<span>تلميح</span>';
    const hintBox = document.createElement('div');
    hintBox.className = 'l1-hint-content';
    hintBox.hidden = true;
    hintBox.textContent = g.hint;
    hintBtn.setAttribute('aria-expanded', 'false');
    hintBtn.addEventListener('click', () => {
      hintBox.hidden = !hintBox.hidden;
      hintBtn.setAttribute('aria-expanded', String(!hintBox.hidden));
      if (!hintBox.parentElement) hintBar.append(hintBox);
    });
    if (!mountHintBtnToContext(hintBtn)) hintBar.append(hintBtn);
    root.append(hintBar);

    drawBoard();
    if (alreadyDone) {
      showFeedback('good', g.takeaway);
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      if (stepUi.selectedPlace === g.targetPlace) {
        if (!Array.isArray(ob.gradualAnswered)) ob.gradualAnswered = [false, false, false, false];
        ob.gradualAnswered[g.step] = true;
        ob.selectedHousePlace = g.targetPlace;
        if (g.step === 3) completeStation1Onboarding();
        sound(true);
        haptic(true);
        drawBoard();
        showFeedback('good', g.takeaway);
        setPrimaryButtonState('correct');
        saveState();
      } else {
        sound(false);
        haptic(false);
        wrongP = stepUi.selectedPlace;
        session.errors = (session.errors || 0) + 1;
        drawBoard();
        showFeedback('bad', 'هذه منزلة «' + places[stepUi.selectedPlace] + '». ' + g.hint);
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      wrongP = null;
      stepUi.selectedPlace = null;
      clearFeedback();
      drawBoard();
      setPrimaryButtonState('incomplete');
    };
  }

  /* =========================================================
     2. Story Slide Builder
     ========================================================= */

  function renderStorySlideStep(cur, root) {
    const sl = cur.slide;
    if (!sl) {
      setPrimaryButtonState('explanation', 'متابعة');
      return;
    }

    if (cur.unit !== undefined && state.viewedSlides[cur.unit]) {
      state.viewedSlides[cur.unit].add(cur.slideIndex);
      state.story[cur.unit] = cur.slideIndex;
      saveState();
    }

    const vis = document.createElement('div');
    vis.className = 'l1-story-visual';

    if (sl.type === 'street') {
      vis.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(sl.n) + '</div>'
        + '<p class="l1-subtext">كل رقم يسكن في بيت مخصص له، ومنزلته تحدد قيمته.</p>';
      root.append(vis);
      root.append(createPlaceBoard(sl.n, { interactive: false }));
    } else if (sl.type === 'board' || sl.type === 'count') {
      if (sl.n !== undefined) {
        vis.innerHTML = highlightedNumberHTML(sl.n, sl.p);
        root.append(vis);
        root.append(createPlaceBoard(sl.n, { interactive: false, focusPlace: sl.p }));
      }
    } else if (sl.type === 'zeros') {
      const zeroStr = String(digit(sl.n, sl.p)) + '0'.repeat(sl.p);
      vis.innerHTML = highlightedNumberHTML(sl.n, sl.p)
        + '<div class="l1-zeros-preview" dir="ltr">' + fmt(Number(zeroStr)) + '</div>'
        + '<p class="l1-subtext">' + places[sl.p] + ' (' + ar(sl.p) + ' أصفار)</p>';
      root.append(vis);
    } else if (sl.type === 'place-rule') {
      vis.innerHTML = '<div class="l1-info-card" style="width:100%"><div class="l1-info-list">'
        + '<div class="l1-info-item">كل بيت يسارًا يساوي <strong>10 أمثال</strong> البيت السابق (× 10).</div>'
        + '<div class="l1-info-item">الصفر يحفظ مكان المنزلة، وقيمته المنزلية تساوي 0.</div>'
        + '</div></div>';
      root.append(vis);
    } else if (sl.type === 'city' || sl.type === 'space' || sl.type === 'airport' || sl.type === 'airport-info' || sl.type === 'eye') {
      if (sl.type === 'city') vis.innerHTML = citySVG();
      else if (sl.type === 'space') vis.innerHTML = spaceSVG(sl.planet || 'الأرض');
      else if (sl.type.startsWith('airport')) vis.innerHTML = airportSVG();
      else vis.innerHTML = '<svg viewBox="0 0 400 130" role="img" aria-label="عين ترمش"><path d="M70 65Q200-36 330 65Q200 166 70 65" fill="#fff" stroke="#518576" stroke-width="4"/><circle cx="200" cy="65" r="42" fill="#8eb1a2"/><circle cx="200" cy="65" r="22" fill="#244f45"/><circle cx="188" cy="51" r="9" fill="#fff"/></svg>';
      const statTxt = sl.type === 'airport-info' ? String(sl.n) : fmt(sl.n);
      const unitTxt = sl.type === 'city' ? 'نسمة · نهاية 2019'
        : sl.type === 'eye' ? 'رمشة تقريبًا في السنة'
        : sl.type === 'space' ? 'كيلومتر تقريبًا'
        : sl.type === 'airport' ? 'مسافرًا · آب 2019'
        : 'عام إنشاء المطار';
      vis.insertAdjacentHTML('beforeend', '<div class="l1-big-num" dir="ltr">' + statTxt + '</div><p class="l1-subtext">' + unitTxt + '</p>');
      root.append(vis);
    } else if (sl.type === 'words') {
      vis.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(sl.n) + '</div>'
        + '<div class="l1-word-quote">' + esc(words(sl.n)) + '</div>';
      root.append(vis);
    } else if (sl.type === 'expanded') {
      const terms = expansion(sl.n);
      vis.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(sl.n) + '</div>'
        + '<div class="l1-eq-strip">'
        + terms.map(t => '<span class="l1-eq-term">' + fmt(t.value) + '</span>').join('<span>+</span>')
        + '</div>';
      root.append(vis);
    } else if (sl.type === 'compare') {
      vis.innerHTML = '<div class="l1-compare-row">'
        + '<div class="l1-big-num" dir="ltr">' + marked(9605, 3) + '</div>'
        + '<span class="l1-compare-sep">و</span>'
        + '<div class="l1-big-num" dir="ltr">' + marked(149605, 3) + '</div>'
        + '</div>'
        + '<p class="l1-subtext">عدّ الأرقام على يمين الرقم 9 في كل عدد لتكتشف التساوي.</p>';
      root.append(vis);
      const cmpAnimMount = document.createElement('div');
      root.append(cmpAnimMount);
      mountStepConceptAnim({
        animScene: {
          kind: 'place_periods',
          mode: 'compare_digits',
          nums: [9605, 149605],
          targetPlace: 3,
          caption: 'طابق المنازل رأسيًا لترى أن 9 في منزلة آحاد الألوف بكلا العددين'
        }
      }, cmpAnimMount, { lesson: 1 });
    }

    setPrimaryButtonState('explanation');
  }

  /* =========================================================
     3. Playground / Recharge / Scratchpad Builders
     ========================================================= */

  function renderPlaygroundStep(cur, root) {
    const syncWheels = () => {
      root.querySelector('.l1-wheels-shell')?.remove();
      const disabled = stepUi.phase === 'correct';
      const wheels = createWheelsControl({
        getValue: () => playgroundState.number,
        getSelectedPlace: () => playgroundState.selected,
        setValue: (nextVal, nextPlace) => {
          playgroundState.number = nextVal;
          playgroundState.selected = nextPlace;
          stepUi.wheelsModified = true;
          if (cur.kind === 'playground_quest') {
            clearFeedback();
            setPrimaryButtonState('ready', 'تحقّق');
          }
          saveState();
          syncWheels();
        },
        setSelectedPlace: p => {
          playgroundState.selected = p;
          syncWheels();
        },
        disabled
      });
      root.prepend(wheels);
    };

    if (cur.kind === 'scratchpad') {
      syncWheels();
      const expEl = document.createElement('div');
      expEl.className = 'l1-word-quote';
      expEl.textContent = words(playgroundState.number);
      root.append(expEl);
      setPrimaryButtonState('explanation', 'العودة إلى الخريطة');
      stepUi.onNext = () => closeToMap();
      return;
    }

    syncWheels();
    const hintBar = document.createElement('div');
    hintBar.className = 'l1-hint-bar';
    const hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'l1-hint-btn';
    hintBtn.innerHTML = getIconSVG('lightbulb') + '<span>تلميح للتحدي</span>';
    const hintBox = document.createElement('div');
    hintBox.className = 'l1-hint-content';
    hintBox.hidden = true;
    hintBox.textContent = cur.quest.hint;
    hintBtn.setAttribute('aria-expanded', 'false');
    hintBtn.addEventListener('click', () => {
      hintBox.hidden = !hintBox.hidden;
      hintBtn.setAttribute('aria-expanded', String(!hintBox.hidden));
      if (!hintBox.parentElement) hintBar.append(hintBox);
    });
    if (!mountHintBtnToContext(hintBtn)) hintBar.append(hintBtn);
    root.append(hintBar);

    const isDone = playgroundState.questsDone.has(cur.questIndex) && !cur.isRecharge;
    if (isDone) {
      showFeedback('good', 'تم إنجاز هذا التحدي بالفعل: ' + bdiNumToText(playgroundState.number));
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState(stepUi.wheelsModified ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (cur.quest.check(playgroundState.number)) {
        playgroundState.questsDone.add(cur.questIndex);
        if (cur.isRecharge) {
          state.hearts = 3;
          state.rechargeSolved = true;
          sound(true);
          haptic(true);
          saveState();
          renderHUD();
          renderTopbar();
          syncWheels();
          showFeedback('good', 'أحسنت! استعدت قلوبك الثلاثة كاملة.');
          setPrimaryButtonState('correct', 'عرض النتيجة');
          return;
        }
        if (playgroundState.questsDone.size >= 3 && isNodeUnlocked(1)) {
          state.nodesCompleted.add(1);
          if (!state.nodeStars) state.nodeStars = {};
          state.nodeStars[1] = Math.max(state.nodeStars[1] || 0, session.errors === 0 ? 3 : session.errors === 1 ? 2 : 1);
          checkMilestoneBadges(true);
        }
        sound(true);
        haptic(true);
        renderHUD();
        renderDuolingoMap();
        saveState();
        syncWheels();
        showFeedback('good', 'ممتاز! كوّنت العدد ' + fmt(playgroundState.number) + ' بنجاح.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        session.errors = (session.errors || 0) + 1;
        showFeedback('bad', 'لم يتحقق الشرط بعد. ' + cur.quest.hint);
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      clearFeedback();
      setPrimaryButtonState('ready', 'تحقّق');
    };
  }

  function renderRechargeQuizStep(cur, root) {
    const vis = cur.rechargeVisual;
    if (vis) {
      const card = document.createElement('div');
      card.className = 'l1-recharge-card';
      if (vis.type === 'compare_pair') {
        card.innerHTML = '<div class="l1-recharge-pair">'
          + '<span class="l1-recharge-num" dir="ltr">' + fmt(vis.leftNum) + '</span>'
          + '<span class="l1-recharge-slot" id="l1-recharge-sym-slot" aria-live="polite">؟</span>'
          + '<span class="l1-recharge-num" dir="ltr">' + fmt(vis.rightNum) + '</span>'
          + '</div>';
      } else if (vis.type === 'single_num') {
        card.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(vis.num) + '</div>'
          + (vis.caption ? '<p class="l1-subtext">' + esc(vis.caption) + '</p>' : '');
      } else if (vis.type === 'expr_box') {
        card.innerHTML = '<div class="l1-big-num" dir="ltr">' + esc(vis.expr) + '</div>';
      } else if (vis.type === 'quote_box') {
        card.innerHTML = '<div class="l1-word-quote">' + l2BidiTextHTML(vis.text) + '</div>';
      } else if (vis.type === 'mini_table') {
        const hdrs = (vis.headers || []).map(h => '<div class="l5-cell-head"><bdi dir="ltr">' + esc(h) + '</bdi></div>').join('');
        const vals = (vis.values || []).map((v, i) => i === vis.values.length - 1
          ? '<div class="l5-cell-slot is-active" id="l1-recharge-table-slot"><bdi dir="ltr">' + esc(v) + '</bdi></div>'
          : '<div class="l5-cell-static"><bdi dir="ltr">' + esc(v) + '</bdi></div>').join('');
        card.innerHTML = '<div class="l5-table-rule-chip">' + l2BidiTextHTML(vis.ruleText) + '</div>'
          + '<div class="l5-data-table l1-recharge-table" style="--l5-cols:4">'
          + '<div class="l5-cell-head">الخطوة</div>' + hdrs
          + '<div class="l5-row-lbl tone-neutral">القيمة</div>' + vals
          + '</div>';
      }
      root.append(card);
    }

    const items = cur.options || [];
    let wrongIndices = [];
    let solved = false;
    const optsMount = document.createElement('div');
    root.append(optsMount);

    const draw = () => {
      optsMount.innerHTML = '';
      const symSlot = byId('l1-recharge-sym-slot');
      if (symSlot) {
        const picked = stepUi.selectedIdx !== null ? items[stepUi.selectedIdx] : null;
        symSlot.textContent = picked ? picked.label : '؟';
        symSlot.classList.toggle('is-correct', solved);
      }
      const tblSlot = byId('l1-recharge-table-slot');
      if (tblSlot && solved) {
        tblSlot.className = 'l5-cell-slot is-correct';
        tblSlot.innerHTML = '<bdi dir="ltr">' + esc(String(cur.correctValue)) + '</bdi>';
      }
      const list = l2CreateRadioOptions({
        items,
        cols3: Boolean(cur.cols3),
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: solved ? items.findIndex(it => it.value === cur.correctValue) : -1,
        wrongIndices,
        disabled: solved,
        onSelect: idx => {
          if (solved) return;
          stepUi.selectedIdx = idx;
          wrongIndices = [];
          clearFeedback();
          draw();
          setPrimaryButtonState('ready', 'تحقّق');
        }
      });
      optsMount.append(list);
    };

    draw();
    setPrimaryButtonState('incomplete', 'تحقّق');

    stepUi.onCheck = () => {
      const chosen = items[stepUi.selectedIdx];
      if (!chosen) return;
      if (chosen.value === cur.correctValue) {
        solved = true;
        state.hearts = 3;
        state.rechargeSolved = true;
        sound(true, 'recharge');
        haptic(true);
        saveState();
        renderHUD();
        renderTopbar();
        draw();
        showFeedback('good', cur.explainRight || 'أحسنت! استعدت قلوبك الثلاثة كاملة.');
        setPrimaryButtonState('correct', 'عرض النتيجة');
      } else {
        sound(false);
        haptic(false);
        wrongIndices = [stepUi.selectedIdx];
        draw();
        showFeedback('bad', cur.hint || 'جرّب بهدوء مرة أخرى لتشحن قلوبك.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongIndices = [];
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function bdiNumToText(n) {
    return fmt(n);
  }

  /* =========================================================
     4. Mission Step Types (All 12 Modes)
     ========================================================= */

  function renderTargetStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    if (passed) stepUi.selectedPlace = s.p;

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, s.p);
    root.append(numCard);

    let wrongP = null;
    const drawBoard = () => {
      root.querySelector('.l1-place-board')?.remove();
      const board = createPlaceBoard(s.n, {
        interactive: true,
        selectedPlace: stepUi.selectedPlace,
        correctPlace: passed ? s.p : null,
        wrongPlace: wrongP,
        disabled: passed,
        onSelectPlace: p => {
          stepUi.selectedPlace = p;
          wrongP = null;
          clearFeedback();
          drawBoard();
          setPrimaryButtonState('ready');
        }
      });
      numCard.after(board);
    };

    drawBoard();
    appendHintWidget(root, s, d);

    if (passed) {
      showFeedback('good', s.reason || ('الرقم ' + digit(s.n, s.p) + ' في ' + places[s.p] + '.'));
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      const p = stepUi.selectedPlace;
      if (p === s.p) {
        recordMissionPass(cur);
        drawBoard();
        showFeedback('good', s.reason || ('صحيح! ' + fmt(digit(s.n, s.p) * 10 ** s.p)));
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        wrongP = p;
        markSessionError(cur.stepIndex);
        drawBoard();
        const dig = digit(s.n, s.p);
        showFeedback('bad', 'اخترت «' + places[p] + '». عدّ الأرقام على يمين الرقم ' + dig + ' (' + ar(s.p) + ' أرقام).');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      wrongP = null;
      stepUi.selectedPlace = null;
      clearFeedback();
      drawBoard();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderZerosStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    const dig = digit(s.n, s.p);

    if (d.zeros === undefined) d.zeros = 0;
    const selectedZeros = passed ? s.p : (stepUi.zerosPicked !== undefined ? d.zeros : null);

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, s.p);
    root.append(numCard);

    const previewCard = document.createElement('div');
    previewCard.className = 'l1-num-card';
    const previewVal = document.createElement('div');
    previewVal.className = 'l1-zeros-preview';
    previewVal.dir = 'ltr';
    const previewCap = document.createElement('p');
    previewCap.className = 'l1-subtext';
    previewCard.append(previewVal, previewCap);
    root.append(previewCard);

    const pills = document.createElement('div');
    pills.className = 'l1-zero-pills';
    pills.setAttribute('role', 'radiogroup');
    pills.setAttribute('aria-label', 'عدد الأصفار');
    root.append(pills);

    const syncZeros = () => {
      const z = passed ? s.p : d.zeros;
      const val = dig * 10 ** z;
      previewVal.textContent = fmt(val);
      previewCap.textContent = ar(z) + ' أصفار ← القيمة: ' + fmt(val);

      pills.replaceChildren();
      for (let i = 0; i <= 8; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-zero-pill';
        const isChecked = (passed && i === s.p) || (!passed && stepUi.zerosPicked && d.zeros === i);
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(Boolean(isChecked)));
        b.setAttribute('aria-label', ar(i) + ' أصفار');
        b.textContent = ar(i);
        b.disabled = passed;
        b.addEventListener('click', () => {
          if (passed) return;
          d.zeros = i;
          stepUi.zerosPicked = true;
          clearFeedback();
          syncZeros();
          setPrimaryButtonState('ready');
        });
        pills.append(b);
      }
    };

    if (selectedZeros !== null) stepUi.zerosPicked = true;
    syncZeros();
    appendHintWidget(root, s, d);

    if (passed) {
      showFeedback('good', s.reason || ('رائع! ' + ar(s.p) + ' أصفار تعطي ' + fmt(dig * 10 ** s.p)));
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState(stepUi.zerosPicked ? 'ready' : 'incomplete');
    }

    stepUi.onCheck = () => {
      if (d.zeros === s.p) {
        recordMissionPass(cur);
        syncZeros();
        showFeedback('good', s.reason || ('صحيح! ' + fmt(dig * 10 ** s.p)));
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
        showFeedback('bad', 'اخترت ' + ar(d.zeros) + ' أصفار. انظر للعدد ' + fmt(s.n) + ' وعدّ الأرقام على يمين ' + dig + '.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      stepUi.zerosPicked = false;
      clearFeedback();
      syncZeros();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderWheelsStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    if (d.value === undefined) d.value = s.initial || 0;
    if (d.selected === undefined) d.selected = 6;
    if (passed) d.value = s.n;

    if (s.wording) {
      const wBox = document.createElement('div');
      wBox.className = 'l1-word-quote';
      wBox.textContent = s.wording;
      root.append(wBox);
    }

    const sync = () => {
      root.querySelector('.l1-wheels-shell')?.remove();
      const wheels = createWheelsControl({
        getValue: () => d.value,
        getSelectedPlace: () => d.selected,
        setValue: (nextVal, nextP) => {
          d.value = nextVal;
          d.selected = nextP;
          stepUi.wheelsModified = true;
          clearFeedback();
          saveState();
          sync();
          if (!passed) setPrimaryButtonState('ready', s.initial ? 'تحقّق' : 'افتح الخزنة');
        },
        setSelectedPlace: p => {
          d.selected = p;
          sync();
        },
        disabled: passed
      });
      const targetAnchor = root.querySelector('.l1-hint-bar');
      if (targetAnchor) root.insertBefore(wheels, targetAnchor);
      else root.append(wheels);
    };

    appendHintWidget(root, s, d);
    sync();

    if (passed) {
      showFeedback('good', 'أحسنت! ' + fmt(s.n) + ' هو العدد الصحيح.');
      setPrimaryButtonState('correct');
    } else {
      const hasEdits = Boolean(stepUi.wheelsModified || d.value !== (s.initial || 0));
      setPrimaryButtonState(hasEdits ? 'ready' : 'incomplete', s.initial ? 'تحقّق' : 'افتح الخزنة');
    }

    stepUi.onCheck = () => {
      if (d.value === s.n) {
        recordMissionPass(cur);
        sync();
        showFeedback('good', 'أحسنت! ' + fmt(s.n) + ' هو العدد الصحيح.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
        const expStr = String(s.n).padStart(9, '0');
        const actStr = String(d.value).padStart(9, '0');
        let diffP = 8;
        for (let i = 0; i < 9; i++) {
          if (expStr[i] !== actStr[i]) {
            diffP = 8 - i;
            break;
          }
        }
        d.selected = diffP;
        sync();
        showFeedback('bad', 'راجع رقم منزلة «' + places[diffP] + '» وطابقه مع المطلوب.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      clearFeedback();
      setPrimaryButtonState('ready', s.initial ? 'تحقّق' : 'افتح الخزنة');
    };
  }

  function renderChoiceStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);

    if (s.n !== undefined) {
      const numCard = document.createElement('div');
      numCard.className = 'l1-num-card';
      numCard.innerHTML = highlightedNumberHTML(s.n, s.p);
      root.append(numCard);
    } else if (s.compare) {
      const cmpCard = document.createElement('div');
      cmpCard.className = 'l1-num-card';
      cmpCard.innerHTML = '<div class="l1-compare-row">'
        + '<div class="l1-big-num" dir="ltr">' + marked(s.compare[0], s.p) + '</div>'
        + '<span class="l1-compare-sep">و</span>'
        + '<div class="l1-big-num" dir="ltr">' + marked(s.compare[1], s.p) + '</div>'
        + '</div>';
      root.append(cmpCard);
    }

    const animMount = document.createElement('div');
    root.append(animMount);
    mountStepConceptAnim(Object.assign({}, cur, { num: d.currentNumber }), animMount, { lesson: 1 });

    if (!Array.isArray(d.order) || d.order.length !== s.options.length) {
      d.order = s.options.map((_, i) => i).sort(() => Math.random() - 0.5);
    }

    let wrongUiIndices = [];
    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      const optsEl = createRadioOptions({
        items: d.order.map(origIdx => {
          const val = s.options[origIdx];
          return { label: typeof val === 'number' ? fmt(val) : String(val), rawValue: val, numeric: typeof val === 'number' };
        }),
        formula: Boolean(s.formula),
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: passed ? d.order.indexOf(s.correct) : -1,
        wrongIndices: wrongUiIndices,
        disabled: passed,
        onSelect: uiIdx => {
          stepUi.selectedIdx = uiIdx;
          clearFeedback();
          draw();
          setPrimaryButtonState('ready');
        }
      });
      const hintBar = root.querySelector('.l1-hint-bar');
      if (hintBar) root.insertBefore(optsEl, hintBar);
      else root.append(optsEl);
    };

    appendHintWidget(root, s, d);
    draw();

    if (passed) {
      stepUi.selectedIdx = d.order.indexOf(s.correct);
      draw();
      showFeedback('good', s.reason || 'إجابة صحيحة!');
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      const origIdx = d.order[stepUi.selectedIdx];
      if (origIdx === s.correct) {
        recordMissionPass(cur);
        draw();
        showFeedback('good', s.reason || 'أحسنت! إجابة دقيقة.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        wrongUiIndices = [stepUi.selectedIdx];
        markSessionError(cur.stepIndex);
        draw();
        const dig = s.n !== undefined && s.p !== undefined ? digit(s.n, s.p) : null;
        const msg = dig !== null
          ? 'انظر إلى العدد ' + fmt(s.n) + ': يوجد ' + ar(s.p) + ' أرقام على يمين الرقم ' + dig + '.'
          : (s.hint || 'راجع منازل العدد واختر الإجابة المطابقة.');
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongUiIndices = [];
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderVerbalPeriodStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    const part = cur.periodPart;

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, null);
    root.append(numCard);

    // Compact Cycle Chips
    const chips = document.createElement('div');
    chips.className = 'l1-cycle-chips';
    [
      { key: 'millions', name: 'الملايين' },
      { key: 'thousands', name: 'الألوف' },
      { key: 'ones', name: 'الآحاد' }
    ].forEach(c => {
      const idx = cur.periodParts.findIndex(pp => pp.periodKey === c.key);
      const chip = document.createElement('div');
      const isSkipped = idx === -1;
      const isDone = !isSkipped && (passed || idx < cur.subIndex);
      const isActive = !isSkipped && !passed && idx === cur.subIndex;
      chip.className = 'l1-cycle-chip' + (isSkipped ? ' is-skipped' : isDone ? ' is-done' : isActive ? ' is-active' : '');
      chip.innerHTML = '<strong>' + c.name + '</strong><span>'
        + (isSkipped ? 'أصفار' : isDone ? 'تم' : isActive ? 'الآن' : 'قادم')
        + '</span>';
      chips.append(chip);
    });
    root.append(chips);

    const optKey = 'verbal_opts_' + cur.subIndex;
    if (!Array.isArray(d[optKey])) {
      d[optKey] = [
        { text: part.text, correct: true },
        { text: part.distractors[0], correct: false },
        { text: part.distractors[1], correct: false }
      ].sort(() => Math.random() - 0.5);
    }
    const opts = d[optKey];
    const doneSub = passed || (Number(d.verbalStep || 0) > cur.subIndex);

    let wrongIndices = [];
    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      const optsEl = createRadioOptions({
        items: opts.map(o => ({ label: o.text })),
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: doneSub ? opts.findIndex(o => o.correct) : -1,
        wrongIndices,
        disabled: doneSub,
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          clearFeedback();
          draw();
          setPrimaryButtonState('ready');
        }
      });
      const hintBar = root.querySelector('.l1-hint-bar');
      if (hintBar) root.insertBefore(optsEl, hintBar);
      else root.append(optsEl);
    };

    appendHintWidget(root, s, d);
    draw();

    if (doneSub) {
      stepUi.selectedIdx = opts.findIndex(o => o.correct);
      draw();
      showFeedback('good', 'قراءة «' + part.periodName + '»: ' + part.text);
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      const picked = opts[stepUi.selectedIdx];
      if (picked && picked.correct) {
        d.chosenParts = d.chosenParts || [];
        d.chosenParts[cur.subIndex] = picked.text;
        d.verbalStep = Math.max(Number(d.verbalStep || 0), cur.subIndex + 1);
        recordMissionPass(cur);
        draw();
        const doneMsg = cur.isFinalSubOfStep
          ? 'الصيغة الكاملة: «' + words(s.n) + '»'
          : 'أحسنت! نكمل الدورة التالية.';
        showFeedback('good', doneMsg);
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        wrongIndices = [stepUi.selectedIdx];
        markSessionError(cur.stepIndex);
        draw();
        showFeedback('bad', 'تأكد من عدد الأرقام في «' + part.periodName + '» (قيمتها ' + fmt(part.value) + ').');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongIndices = [];
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderMatchStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);

    if (!Array.isArray(d.targetsOrder) || d.targetsOrder.length !== s.pairs.length) {
      d.targetsOrder = s.pairs.map((_, i) => i).sort(() => Math.random() - 0.5);
    }
    if (!d.links || typeof d.links !== 'object') d.links = {}; // cardIdx -> targetOrigIdx

    if (passed) {
      s.pairs.forEach((_, i) => { d.links[i] = i; });
    }

    const helpNote = document.createElement('p');
    helpNote.className = 'l1-subtext';
    helpNote.textContent = 'اختر عددًا من اليمين ثم اضغط قيمته في اليسار للربط بينهما، وبعد إكمال الأزواج اضغط تحقّق.';
    root.append(helpNote);

    const grid = document.createElement('div');
    grid.className = 'l1-match-grid';
    root.append(grid);

    let wrongCards = new Set();

    const linkPair = (cardIdx, targetOrigIdx) => {
      // Remove any prior link using this target
      Object.keys(d.links).forEach(k => {
        if (d.links[k] === targetOrigIdx) delete d.links[k];
      });
      d.links[cardIdx] = targetOrigIdx;
      stepUi.matchPendingSource = null;
      stepUi.matchPendingTarget = null;
      wrongCards.clear();
      clearFeedback();
      drawGrid();
      const totalLinked = Object.keys(d.links).length;
      if (totalLinked === s.pairs.length) setPrimaryButtonState('ready');
      else setPrimaryButtonState('incomplete');
    };

    const drawGrid = () => {
      grid.replaceChildren();
      const colSrc = document.createElement('div');
      colSrc.className = 'l1-match-col';
      colSrc.innerHTML = '<div class="l1-match-col-title">العدد والرقم</div>';

      const colTgt = document.createElement('div');
      colTgt.className = 'l1-match-col';
      colTgt.innerHTML = '<div class="l1-match-col-title">القيمة المنزلية</div>';

      s.pairs.forEach((pair, cIdx) => {
        const b = document.createElement('button');
        b.type = 'button';
        const isLinked = d.links[cIdx] !== undefined;
        const isSel = stepUi.matchPendingSource === cIdx;
        b.className = 'l1-match-btn'
          + (passed ? ' is-matched' : wrongCards.has(cIdx) ? ' is-wrong' : isSel ? ' is-selected' : isLinked ? ' is-matched' : '');
        b.disabled = passed;
        b.innerHTML = '<span dir="ltr">' + marked(pair.n, pair.p) + '</span>'
          + (isLinked ? ' <span>[' + ar(cIdx + 1) + ']</span>' : '');
        b.setAttribute('aria-pressed', String(isSel));
        b.setAttribute('aria-label', 'بطاقة ' + ar(cIdx + 1) + ': العدد ' + fmt(pair.n));
        b.addEventListener('click', () => {
          if (passed) return;
          if (stepUi.matchPendingTarget !== null) {
            linkPair(cIdx, stepUi.matchPendingTarget);
          } else {
            stepUi.matchPendingSource = stepUi.matchPendingSource === cIdx ? null : cIdx;
            drawGrid();
          }
        });
        colSrc.append(b);
      });

      d.targetsOrder.forEach(tOrigIdx => {
        const val = s.pairs[tOrigIdx].value;
        const linkedCardKey = Object.keys(d.links).find(k => d.links[k] === tOrigIdx);
        const linkedCardIdx = linkedCardKey !== undefined ? Number(linkedCardKey) : null;
        const isSel = stepUi.matchPendingTarget === tOrigIdx;

        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-match-btn'
          + (passed ? ' is-matched' : (linkedCardIdx !== null && wrongCards.has(linkedCardIdx)) ? ' is-wrong' : isSel ? ' is-selected' : linkedCardIdx !== null ? ' is-matched' : '');
        b.disabled = passed;
        b.innerHTML = bdiNum(val) + (linkedCardIdx !== null ? ' <span>[' + ar(linkedCardIdx + 1) + ']</span>' : '');
        b.setAttribute('aria-pressed', String(isSel));
        b.setAttribute('aria-label', 'القيمة ' + fmt(val));
        b.addEventListener('click', () => {
          if (passed) return;
          if (stepUi.matchPendingSource !== null) {
            linkPair(stepUi.matchPendingSource, tOrigIdx);
          } else {
            stepUi.matchPendingTarget = stepUi.matchPendingTarget === tOrigIdx ? null : tOrigIdx;
            drawGrid();
          }
        });
        colTgt.append(b);
      });

      grid.append(colSrc, colTgt);
    };

    appendHintWidget(root, s, d);
    drawGrid();

    if (passed) {
      showFeedback('good', 'توصيل ممتاز! طابقت كل رقم بقيمته المنزلية.');
      setPrimaryButtonState('correct');
    } else {
      const ready = Object.keys(d.links).length === s.pairs.length;
      setPrimaryButtonState(ready ? 'ready' : 'incomplete');
    }

    stepUi.onCheck = () => {
      wrongCards.clear();
      s.pairs.forEach((_, idx) => {
        if (d.links[idx] !== idx) wrongCards.add(idx);
      });
      if (wrongCards.size === 0) {
        recordMissionPass(cur);
        drawGrid();
        showFeedback('good', 'ممتاز! جميع التوصيلات صحيحة.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
        drawGrid();
        showFeedback('bad', 'توجد بطاقات غير مطابقة للقيمة الصحيحة. عدّ الأرقام على يمين الرقم الملوّن ثم أعد ربطها.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      wrongCards.forEach(idx => { delete d.links[idx]; });
      wrongCards.clear();
      stepUi.matchPendingSource = null;
      stepUi.matchPendingTarget = null;
      clearFeedback();
      drawGrid();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderFieldsHouseStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    d.fields = d.fields || {};
    if (s.prefill) {
      for (const [p, val] of Object.entries(s.prefill)) {
        d.fields[p] = fmt(val);
      }
    }

    const term = cur.targetTerm;
    const dig = digit(s.n, term.p);
    const existingVal = parseRunnerNum(d.fields[term.p] || '');
    const termSolved = passed || existingVal === term.value;

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, term.p);
    root.append(numCard);

    // Compact equation strip showing solved/prefilled vs current ?
    const strip = document.createElement('div');
    strip.className = 'l1-eq-strip';
    strip.innerHTML = cur.allTerms.map(t => {
      const val = parseRunnerNum(d.fields[t.p] || '');
      const ok = val === t.value;
      const isCur = t.p === term.p;
      const cls = ok ? ' is-done' : isCur ? ' is-current' : '';
      return '<span class="l1-eq-term' + cls + '">' + (ok ? fmt(t.value) : isCur ? '?' : '...') + '</span>';
    }).join('<span>+</span>');
    root.append(strip);

    const inputWrap = document.createElement('div');
    inputWrap.className = 'l1-input-wrap';
    inputWrap.innerHTML = '<label class="l1-input-label" for="l1-field-input">القيمة التحليلية لمنزلة «' + places[term.p] + '»:</label>';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'l1-field-input';
    input.className = 'l1-num-input' + (termSolved ? ' is-good' : '');
    input.inputMode = 'numeric';
    input.maxLength = 18;
    input.placeholder = 'اكتب القيمة بالأرقام...';
    input.value = termSolved ? fmt(term.value) : String(d.fields[term.p] || '');
    input.disabled = termSolved;

    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      d.fields[term.p] = input.value;
      clearFeedback();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btn = byId('l1-primary-btn');
        if (btn && !btn.disabled) btn.click();
      }
    });

    inputWrap.append(input);
    root.append(inputWrap);
    appendHintWidget(root, s, d);

    if (termSolved) {
      showFeedback('good', 'قيمة الرقم ' + dig + ' في ' + places[term.p] + ' هي ' + fmt(term.value) + '.');
      setPrimaryButtonState('correct');
    } else {
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    }

    stepUi.onCheck = () => {
      const parsed = parseRunnerNum(input.value);
      if (parsed === term.value) {
        d.fields[term.p] = fmt(term.value);
        input.value = fmt(term.value);
        input.disabled = true;
        input.classList.add('is-good');
        recordMissionPass(cur);
        showFeedback('good', 'صحيح! ' + fmt(term.value) + ' في منزلة «' + places[term.p] + '».');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        input.setAttribute('aria-invalid', 'true');
        markSessionError(cur.stepIndex);
        showFeedback('bad', 'تأكد من عدد الأصفار! الرقم ' + dig + ' في منزلة «' + places[term.p] + '» يسبقه ' + ar(term.p) + ' أرقام إلى اليمين.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      input.removeAttribute('aria-invalid');
      clearFeedback();
      input.focus();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    };
  }

  function renderMissingStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    const p = s.p ?? 4;
    const dig = digit(s.n, p);
    const correctVal = s.answer !== undefined ? s.answer : dig * 10 ** p;

    const eq = document.createElement('div');
    eq.className = 'l1-eq-strip';
    eq.innerHTML = '<span class="l1-eq-term">' + marked(s.n, p) + ' =</span>'
      + '<span class="l1-eq-term">' + esc(s.before || '') + '</span>'
      + '<span class="l1-eq-term is-current" id="l1-missing-slot">' + (passed ? fmt(correctVal) : '?') + '</span>'
      + '<span class="l1-eq-term">' + esc(s.after || '') + '</span>';
    root.append(eq);

    const wrap = document.createElement('div');
    wrap.className = 'l1-input-wrap';
    wrap.innerHTML = '<label class="l1-input-label" for="l1-missing-input">الحد المفقود للرقم ' + dig + ' (' + places[p] + '):</label>';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'l1-missing-input';
    input.className = 'l1-num-input' + (passed ? ' is-good' : '');
    input.inputMode = 'numeric';
    input.maxLength = 18;
    input.placeholder = 'أدخل القيمة المفقودة...';
    input.value = passed ? fmt(correctVal) : String(d.value || '');
    input.disabled = passed;

    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      d.value = input.value;
      clearFeedback();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btn = byId('l1-primary-btn');
        if (btn && !btn.disabled) btn.click();
      }
    });

    wrap.append(input);
    root.append(wrap);
    appendHintWidget(root, s, d);

    if (passed) {
      showFeedback('good', 'أحسنت! الحد المفقود هو ' + fmt(correctVal) + '.');
      setPrimaryButtonState('correct');
    } else {
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    }

    stepUi.onCheck = () => {
      const parsed = parseRunnerNum(input.value);
      if (parsed === correctVal) {
        input.value = fmt(correctVal);
        input.disabled = true;
        input.classList.add('is-good');
        const slot = byId('l1-missing-slot');
        if (slot) {
          slot.textContent = fmt(correctVal);
          slot.classList.remove('is-current');
          slot.classList.add('is-done');
        }
        recordMissionPass(cur);
        showFeedback('good', 'ممتاز! الحد المفقود يساوي ' + fmt(correctVal) + '.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        input.setAttribute('aria-invalid', 'true');
        markSessionError(cur.stepIndex);
        showFeedback('bad', 'قارِن منازل العدد ' + fmt(s.n) + ': المنزلة الناقصة هي «' + places[p] + '» للرقم ' + dig + '.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      input.removeAttribute('aria-invalid');
      clearFeedback();
      input.focus();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    };
  }

  function renderErrorFindStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur) || Boolean(d.found);
    const p = s.p ?? 6;
    const dig = digit(s.n, p);

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, p);
    root.append(numCard);

    const termsWrap = document.createElement('div');
    termsWrap.className = 'l1-error-terms';
    termsWrap.setAttribute('role', 'radiogroup');
    termsWrap.setAttribute('aria-label', 'حدود الصيغة التحليلية');
    root.append(termsWrap);

    let wrongTermIdx = null;
    if (passed) stepUi.errorSelectedIdx = s.wrong;

    const drawTerms = () => {
      termsWrap.replaceChildren();
      s.terms.forEach((val, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        const isSel = stepUi.errorSelectedIdx === idx;
        b.className = 'l1-error-term-btn'
          + (passed && idx === s.wrong ? ' is-correct' : wrongTermIdx === idx ? ' is-wrong' : isSel ? ' is-selected' : '');
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(isSel));
        b.textContent = fmt(val);
        b.disabled = passed;
        b.addEventListener('click', () => {
          if (passed) return;
          stepUi.errorSelectedIdx = idx;
          wrongTermIdx = null;
          clearFeedback();
          drawTerms();
          setPrimaryButtonState('ready');
        });
        termsWrap.append(b);
      });
    };

    drawTerms();
    appendHintWidget(root, s, d);

    if (passed) {
      showFeedback('good', 'أحسنت! الحد الخاطئ هو ' + fmt(s.terms[s.wrong]) + '. الآن لنكتب قيمته الصحيحة.');
      setPrimaryButtonState('correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      if (stepUi.errorSelectedIdx === s.wrong) {
        d.found = true;
        stepUi.errorSelectedIdx = s.wrong;
        sound(true);
        haptic(true);
        saveState();
        drawTerms();
        showFeedback('good', 'صحيح! ' + fmt(s.terms[s.wrong]) + ' لا يطابق منزلة الرقم ' + dig + '.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        wrongTermIdx = stepUi.errorSelectedIdx;
        markSessionError(cur.stepIndex);
        drawTerms();
        showFeedback('bad', 'هذا الحد صحيح. راقب أصفار الرقم ' + dig + ' في منزلة «' + places[p] + '».');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      wrongTermIdx = null;
      stepUi.errorSelectedIdx = null;
      clearFeedback();
      drawTerms();
      setPrimaryButtonState('incomplete');
    };
  }

  function renderErrorFixStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    const p = s.p ?? 6;
    const dig = digit(s.n, p);
    const badVal = s.terms[s.wrong];

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(s.n, p)
      + '<p class="l1-subtext">الحد المراد تصحيحه: <bdi dir="ltr">' + fmt(badVal) + '</bdi></p>';
    root.append(numCard);

    const wrap = document.createElement('div');
    wrap.className = 'l1-input-wrap';
    wrap.innerHTML = '<label class="l1-input-label" for="l1-err-fix-input">القيمة الصحيحة للرقم ' + dig + ' (' + places[p] + '):</label>';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'l1-err-fix-input';
    input.className = 'l1-num-input' + (passed ? ' is-good' : '');
    input.inputMode = 'numeric';
    input.maxLength = 18;
    input.placeholder = 'اكتب القيمة الصحيحة...';
    input.value = passed ? fmt(s.correct) : String(d.correction || '');
    input.disabled = passed;

    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      d.correction = input.value;
      clearFeedback();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btn = byId('l1-primary-btn');
        if (btn && !btn.disabled) btn.click();
      }
    });

    wrap.append(input);
    root.append(wrap);
    appendHintWidget(root, s, d);

    if (passed) {
      showFeedback('good', 'أحسنت! القيمة الصحيحة هي ' + fmt(s.correct) + '.');
      setPrimaryButtonState('correct');
    } else {
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    }

    stepUi.onCheck = () => {
      const parsed = parseRunnerNum(input.value);
      if (parsed === s.correct) {
        input.value = fmt(s.correct);
        input.disabled = true;
        input.classList.add('is-good');
        recordMissionPass(cur);
        showFeedback('good', 'رائع! الصحيح ' + fmt(s.correct) + ' بدل ' + fmt(badVal) + '.');
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        input.setAttribute('aria-invalid', 'true');
        markSessionError(cur.stepIndex);
        showFeedback('bad', 'الرقم ' + dig + ' يقع في منزلة «' + places[p] + '»، إذن على يمينه ' + ar(p) + ' أصفار.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      input.removeAttribute('aria-invalid');
      clearFeedback();
      input.focus();
      const parsed = parseRunnerNum(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete');
    };
  }

  function renderRapidIntroStep(cur, root) {
    const d = getActiveStepData(cur);
    if (!d.run) {
      d.run = {
        questions: makeRapidQuestions(),
        round: 0,
        correct: 0,
        streak: 0,
        maxStreak: 0,
        remaining: 18,
        timed: true,
        running: false,
        answered: false,
        done: false
      };
    }

    const card = document.createElement('div');
    card.className = 'l1-info-card';
    card.innerHTML = '<div class="l1-info-list">'
      + '<div class="l1-info-item">5 جولات سريعة؛ أجب عن 4 على الأقل بشكل صحيح لاجتياز المحطة.</div>'
      + '</div>';
    root.append(card);

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'l1-mode-tabs';
    toggleWrap.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';

    const drawToggle = () => {
      toggleWrap.replaceChildren();
      [
        { timed: true, label: 'تحدٍّ بمؤقت (18 ث)' },
        { timed: false, label: 'لعب بلا مؤقت' }
      ].forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-mode-tab' + (d.run.timed === opt.timed ? ' is-active' : '');
        b.textContent = opt.label;
        b.addEventListener('click', () => {
          d.run.timed = opt.timed;
          saveState();
          drawToggle();
        });
        toggleWrap.append(b);
      });
    };
    drawToggle();
    root.append(toggleWrap);

    setPrimaryButtonState('explanation', 'ابدأ الانطلاق');
    stepUi.onNext = () => {
      d.run = {
        questions: makeRapidQuestions(),
        round: 0,
        correct: 0,
        streak: 0,
        maxStreak: 0,
        remaining: 18,
        timed: d.run.timed,
        running: d.run.timed,
        answered: false,
        done: false,
        roundsAnswered: {}
      };
      saveState();
      advanceStep();
    };
  }

  function renderRapidRoundStep(cur, root) {
    const d = getActiveStepData(cur);
    if (!d.run || !Array.isArray(d.run.questions)) {
      d.run = {
        questions: makeRapidQuestions(),
        round: 0,
        correct: 0,
        streak: 0,
        maxStreak: 0,
        remaining: 18,
        timed: true,
        running: false,
        answered: false,
        done: false,
        roundsAnswered: {}
      };
    }

    const rIdx = cur.roundIndex;
    const run = d.run;
    const q = run.questions[rIdx] || run.questions[0];
    if (!run.roundsAnswered) run.roundsAnswered = {};
    const existingRoundState = run.roundsAnswered[rIdx];

    let roundRemaining = existingRoundState ? 0 : 18;
    let roundPaused = !run.timed;

    const topBar = document.createElement('div');
    topBar.className = 'l1-rapid-bar';
    const roundLbl = document.createElement('span');
    roundLbl.textContent = 'جولة ' + ar(rIdx + 1) + ' / ٥ · سلسلة ' + ar(run.streak || 0);
    const timeEl = document.createElement('span');
    const pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'l1-zero-reset-btn';
    pauseBtn.hidden = !run.timed || Boolean(existingRoundState);

    topBar.append(roundLbl, timeEl);
    if (run.timed && !existingRoundState) topBar.append(pauseBtn);
    root.append(topBar);

    const track = document.createElement('div');
    track.className = 'l1-timer-track';
    track.hidden = !run.timed || Boolean(existingRoundState);
    const fill = document.createElement('div');
    fill.className = 'l1-timer-fill';
    track.append(fill);
    root.append(track);

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = highlightedNumberHTML(q.n, q.p);
    root.append(numCard);

    const syncTimerView = () => {
      if (!run.timed) {
        timeEl.textContent = 'بلا مؤقت';
      } else if (existingRoundState) {
        timeEl.textContent = existingRoundState.correct ? 'نجاح' : 'منتهية';
      } else {
        timeEl.textContent = ar(Math.ceil(roundRemaining)) + ' ث';
        fill.style.width = ((roundRemaining / 18) * 100) + '%';
        pauseBtn.textContent = roundPaused ? 'استئناف' : 'إيقاف مؤقت';
      }
    };

    const drawOptions = () => {
      root.querySelector('.l1-options-list')?.remove();
      const settled = Boolean(run.roundsAnswered[rIdx]);
      const st = run.roundsAnswered[rIdx];
      const optsEl = createRadioOptions({
        items: q.options.map(v => ({ label: fmt(v), rawValue: v, numeric: true })),
        selectedIdx: settled ? q.options.indexOf(st.chosen) : stepUi.selectedIdx,
        revealedRightIdx: settled ? q.options.indexOf(q.value) : -1,
        wrongIndices: settled && st && !st.correct && st.chosen !== null ? [q.options.indexOf(st.chosen)] : [],
        disabled: settled,
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          clearFeedback();
          drawOptions();
          setPrimaryButtonState('ready');
        }
      });
      root.append(optsEl);
    };

    const finalizeRound = chosenVal => {
      clearRapidTimer();
      const isOk = chosenVal === q.value;
      if (isOk) {
        run.correct = Object.values(run.roundsAnswered).filter(x => x.correct).length + 1;
        run.streak = (run.streak || 0) + 1;
        run.maxStreak = Math.max(run.maxStreak || 0, run.streak);
        sound(true);
        haptic(true);
      } else {
        run.streak = 0;
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
      }
      run.roundsAnswered[rIdx] = { chosen: chosenVal, correct: isOk };
      pauseBtn.hidden = true;
      track.hidden = true;

      if (rIdx === 4) {
        const totalRight = Object.values(run.roundsAnswered).filter(x => x.correct).length;
        run.correct = totalRight;
        run.done = true;
        stepUi.rapidDone = true;
        if (totalRight >= 4) {
          recordMissionPass(cur);
          showFeedback('good', 'رائع! حققت ' + ar(totalRight) + ' من 5 إجابات صحيحة واجتزت صاروخ الملايين.');
          setPrimaryButtonState('correct', 'عرض النتيجة');
        } else {
          showFeedback('bad', 'حصلت على ' + ar(totalRight) + ' من 5. تحتاج إلى 4 إجابات صحيحة على الأقل لاجتياز المهمة.');
          setPrimaryButtonState('wrong', 'أعد رحلة الصاروخ');
          stepUi.needsRapidRestart = true;
        }
      } else {
        showFeedback(isOk ? 'good' : 'bad', isOk
          ? ('صحيح! ' + fmt(q.value))
          : ((chosenVal === null ? 'انتهى الوقت. ' : '') + 'القيمة الصحيحة: ' + fmt(q.value) + '.'));
        setPrimaryButtonState('correct', 'الجولة التالية');
      }
      drawOptions();
      saveState();
    };

    pauseBtn.addEventListener('click', () => {
      roundPaused = !roundPaused;
      syncTimerView();
    });

    if (run.timed && !existingRoundState) {
      rapidInterval = setInterval(() => {
        if (roundPaused) return;
        roundRemaining = Math.max(0, roundRemaining - 0.25);
        syncTimerView();
        if (roundRemaining <= 0) finalizeRound(null);
      }, 250);
    }

    syncTimerView();
    drawOptions();

    if (existingRoundState) {
      stepUi.rapidDone = rIdx === 4 && (run.correct || 0) >= 4;
      setPrimaryButtonState(rIdx === 4 && (run.correct || 0) < 4 ? 'wrong' : 'correct');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      if (stepUi.selectedIdx === null) return;
      finalizeRound(q.options[stepUi.selectedIdx]);
    };

    stepUi.onRetry = () => {
      if (stepUi.needsRapidRestart || (rIdx === 4 && (run.correct || 0) < 4)) {
        d.run = null;
        const introIdx = session.steps.findIndex(st => st.stepIndex === cur.stepIndex && st.kind === 'rapid_intro');
        session.index = introIdx >= 0 ? introIdx : session.index;
        saveState();
        renderStep();
      }
    };
  }

  function renderProduceReadStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    d.currentNumber = d.currentNumber || 3040125;
    d.mode = d.mode || 'write';
    d.writtenText = d.writtenText || '';
    d.audioTranscript = d.audioTranscript || '';

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = '<div class="l1-big-num" dir="ltr">' + fmt(d.currentNumber) + '</div>'
      + '<p class="l1-subtext">دورة الملايين · دورة الألوف · دورة الآحاد</p>';
    root.append(numCard);

    const animMount = document.createElement('div');
    root.append(animMount);
    mountStepConceptAnim(Object.assign({}, cur, { num: d.currentNumber }), animMount, { lesson: 1 });

    const tabs = document.createElement('div');
    tabs.className = 'l1-mode-tabs';
    root.append(tabs);

    const panel = document.createElement('div');
    root.append(panel);

    const drawTabsAndBody = () => {
      tabs.replaceChildren();
      [
        { key: 'write', label: 'أكتب قراءتي', icon: 'pencil' },
        { key: 'voice', label: 'أقرأ بصوتي', icon: 'mic' },
        { key: 'teacher', label: 'عرض للمعلم', icon: 'speaker' }
      ].forEach(m => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-mode-tab' + (d.mode === m.key ? ' is-active' : '');
        b.disabled = passed;
        b.innerHTML = getIconSVG(m.icon) + '<span>' + m.label + '</span>';
        b.addEventListener('click', () => {
          d.mode = m.key;
          clearFeedback();
          saveState();
          drawTabsAndBody();
        });
        tabs.append(b);
      });

      panel.replaceChildren();
      if (d.mode === 'write') {
        const ta = document.createElement('textarea');
        ta.className = 'l1-textarea';
        ta.id = 'l1-produce-read-ta';
        ta.setAttribute('aria-label', 'كتابة قراءة العدد بالكلمات');
        ta.placeholder = 'مثال: ثلاثة ملايين وأربعون ألفًا ومئة وخمسة وعشرون...';
        ta.value = d.writtenText || '';
        ta.disabled = passed;
        ta.addEventListener('input', () => {
          d.writtenText = ta.value;
          clearFeedback();
          saveState();
          if (!passed) setPrimaryButtonState(ta.value.trim().length > 0 ? 'ready' : 'incomplete');
        });
        panel.append(ta);
        if (!passed) setPrimaryButtonState(d.writtenText.trim().length > 0 ? 'ready' : 'incomplete');
      } else if (d.mode === 'voice') {
        const box = document.createElement('div');
        box.className = 'l1-voice-box';
        const ctrlRow = document.createElement('div');
        ctrlRow.className = 'l1-voice-controls';

        const recBtn = document.createElement('button');
        recBtn.type = 'button';
        recBtn.className = 'l1-bridge-fill-btn';
        recBtn.textContent = BookAudio.isRecording ? 'إيقاف التسجيل' : (d.hasAudio ? 'إعادة التسجيل' : 'ابدأ التسجيل الصوتي');
        recBtn.disabled = passed;

        const statusNote = document.createElement('p');
        statusNote.className = 'l1-subtext';
        statusNote.textContent = BookAudio.isRecording
          ? 'جاري الاستماع... اقرأ العدد ثم أوقف التسجيل.'
          : d.hasAudio
            ? 'تم التسجيل! يمكنك مراجعة القراءة النموذجية: «' + words(d.currentNumber) + '» ثم الضغط على تحقّق.'
            : 'اضغط للتسجيل، أو اكتب ما قرأته أدناه إذا لم يتوفر ميكروفون.';

        const trInput = document.createElement('input');
        trInput.type = 'text';
        trInput.className = 'l1-num-input';
        trInput.style.direction = 'rtl';
        trInput.style.textAlign = 'start';
        trInput.style.fontFamily = 'inherit';
        trInput.style.fontSize = 'var(--text-base)';
        trInput.placeholder = 'تفريغ القراءة الصوتية أو كتابتها...';
        trInput.value = d.audioTranscript || '';
        trInput.disabled = passed;
        trInput.addEventListener('input', () => {
          d.audioTranscript = trInput.value;
          saveState();
          if (!passed) setPrimaryButtonState((d.hasAudio || trInput.value.trim()) ? 'ready' : 'incomplete');
        });

        recBtn.addEventListener('click', async () => {
          if (!BookAudio.isRecording) {
            const ok = await BookAudio.startRecording(
              () => {},
              txt => { d.audioTranscript = txt; trInput.value = txt; saveState(); },
              errTxt => { statusNote.textContent = errTxt; },
              () => {}
            );
            if (ok) drawTabsAndBody();
          } else {
            const blob = await BookAudio.stopRecording();
            d.hasAudio = true;
            if (blob && typeof blobToBase64 === 'function') {
              try { d.audioBase64 = await blobToBase64(blob); } catch (_) {}
            }
            saveState();
            drawTabsAndBody();
          }
        });

        ctrlRow.append(recBtn);
        box.append(ctrlRow, statusNote, trInput);
        panel.append(box);
        if (!passed) setPrimaryButtonState((d.hasAudio || d.audioTranscript.trim()) ? 'ready' : 'incomplete', 'تأكيد القراءة');
      } else {
        const card = document.createElement('div');
        card.className = 'l1-info-card';
        card.innerHTML = '<div class="l1-info-item">اقرأ العدد لمعلمك أو لولي أمرك بصوت مسموع، وقارن نطقك بهذه الصيغة النموذجية:</div>'
          + '<div class="l1-word-quote">«' + esc(words(d.currentNumber)) + '»</div>';
        panel.append(card);
        if (!passed) setPrimaryButtonState('ready', 'أكّدت القراءة مع المعلم');
      }
    };

    drawTabsAndBody();
    if (passed) {
      showFeedback('good', 'أحسنت! أتممت قراءة العدد: «' + words(d.currentNumber) + '».');
      setPrimaryButtonState('correct');
    }

    stepUi.onCheck = async () => {
      if (d.mode === 'teacher') {
        d.status = 'teacher';
        recordMissionPass(cur);
        drawTabsAndBody();
        showFeedback('good', 'تم حفظ عرضك للمعلم بنجاح.');
        setPrimaryButtonState('correct');
        return;
      }

      if (d.mode === 'voice' && d.hasAudio && !d.audioTranscript.trim()) {
        d.status = 'independent';
        recordMissionPass(cur);
        drawTabsAndBody();
        showFeedback('good', 'تم اعتماد قراءتك الصوتية! القراءة النموذجية: «' + words(d.currentNumber) + '».');
        setPrimaryButtonState('correct');
        return;
      }

      const txt = d.mode === 'write' ? d.writtenText : d.audioTranscript;
      let res = typeof evaluateLocalNumberReading === 'function'
        ? evaluateLocalNumberReading(txt, d.currentNumber)
        : { status: 'correct', feedback: 'ممتاز!' };

      if (res.status !== 'correct' && typeof evaluateSemanticWithGemini === 'function') {
        setPrimaryButtonState('loading', 'جارٍ التقييم...');
        const gem = await evaluateSemanticWithGemini(
          'قراءة الطالب للعدد ' + fmt(d.currentNumber) + ': "' + txt + '"',
          'قيّم صحة قراءة العدد. أعد JSON: {"status":"correct"|"partial","feedback":"جملة قصيرة بالعربية بلا إيموجي"}'
        );
        if (gem && gem.status === 'correct') res = gem;
      }

      if (res.status === 'correct') {
        d.status = 'independent';
        recordMissionPass(cur);
        drawTabsAndBody();
        showFeedback('good', res.feedback);
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
        showFeedback('bad', res.feedback || 'راجع قراءة الدورات بالترتيب: الملايين ثم الألوف ثم الآحاد.');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      clearFeedback();
      const ta = byId('l1-produce-read-ta');
      if (ta) ta.focus();
      setPrimaryButtonState('ready');
    };
  }

  function renderProduceExplainStep(cur, root) {
    const s = cur.rawStep;
    const d = getActiveStepData(cur);
    const passed = isCurrentStepPassed(cur);
    d.pair = d.pair || (s.compare ? [...s.compare] : [9605, 149605]);
    d.targetDigit = d.targetDigit !== undefined ? d.targetDigit : (s.targetDigit ?? 9);
    d.mode = d.mode || 'write';
    d.writtenReason = d.writtenReason || '';
    d.audioTranscript = d.audioTranscript || '';

    const numCard = document.createElement('div');
    numCard.className = 'l1-num-card';
    numCard.innerHTML = '<div class="l1-compare-row">'
      + '<div class="l1-big-num" dir="ltr">' + marked(d.pair[0], 3) + '</div>'
      + '<span class="l1-compare-sep">و</span>'
      + '<div class="l1-big-num" dir="ltr">' + marked(d.pair[1], 3) + '</div>'
      + '</div>';
    root.append(numCard);

    const animMount = document.createElement('div');
    root.append(animMount);
    mountStepConceptAnim(Object.assign({}, cur, { num: d.currentNumber }), animMount, { lesson: 1 });

    const tabs = document.createElement('div');
    tabs.className = 'l1-mode-tabs';
    root.append(tabs);

    const panel = document.createElement('div');
    root.append(panel);

    const modelText = 'نعم تتساوى؛ لأن الرقم 9 يقع في منزلة آحاد الألوف وعلى يمينه 3 أرقام في العددين فقيمته 9,000.';

    const drawTabsAndBody = () => {
      tabs.replaceChildren();
      [
        { key: 'write', label: 'أكتب تبريري', icon: 'pencil' },
        { key: 'voice', label: 'أفسّر بصوتي', icon: 'mic' },
        { key: 'teacher', label: 'عرض للمعلم', icon: 'speaker' }
      ].forEach(m => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l1-mode-tab' + (d.mode === m.key ? ' is-active' : '');
        b.disabled = passed;
        b.innerHTML = getIconSVG(m.icon) + '<span>' + m.label + '</span>';
        b.addEventListener('click', () => {
          d.mode = m.key;
          clearFeedback();
          saveState();
          drawTabsAndBody();
        });
        tabs.append(b);
      });

      panel.replaceChildren();
      if (d.mode === 'write') {
        const ta = document.createElement('textarea');
        ta.className = 'l1-textarea';
        ta.id = 'l1-produce-explain-ta';
        ta.setAttribute('aria-label', 'كتابة التبرير الرياضي');
        ta.placeholder = 'اكتب سبب التساوي بالرجوع إلى اسم المنزلة...';
        ta.value = d.writtenReason || '';
        ta.disabled = passed;
        ta.addEventListener('input', () => {
          d.writtenReason = ta.value;
          clearFeedback();
          saveState();
          if (!passed) setPrimaryButtonState(ta.value.trim().length > 0 ? 'ready' : 'incomplete');
        });
        panel.append(ta);
        if (!passed) setPrimaryButtonState(d.writtenReason.trim().length > 0 ? 'ready' : 'incomplete');
      } else if (d.mode === 'voice') {
        const box = document.createElement('div');
        box.className = 'l1-voice-box';
        const recBtn = document.createElement('button');
        recBtn.type = 'button';
        recBtn.className = 'l1-bridge-fill-btn';
        recBtn.textContent = BookAudio.isRecording ? 'إيقاف التسجيل' : (d.hasAudio ? 'إعادة التسجيل' : 'ابدأ التفسير الصوتي');
        recBtn.disabled = passed;

        const trInput = document.createElement('input');
        trInput.type = 'text';
        trInput.className = 'l1-num-input';
        trInput.style.direction = 'rtl';
        trInput.style.textAlign = 'start';
        trInput.style.fontFamily = 'inherit';
        trInput.style.fontSize = 'var(--text-base)';
        trInput.placeholder = 'ملخص تفسيرك أو التفريغ الصوتي...';
        trInput.value = d.audioTranscript || '';
        trInput.disabled = passed;
        trInput.addEventListener('input', () => {
          d.audioTranscript = trInput.value;
          saveState();
          if (!passed) setPrimaryButtonState((d.hasAudio || trInput.value.trim()) ? 'ready' : 'incomplete');
        });

        recBtn.addEventListener('click', async () => {
          if (!BookAudio.isRecording) {
            const ok = await BookAudio.startRecording(
              () => {},
              txt => { d.audioTranscript = txt; trInput.value = txt; saveState(); },
              () => {},
              () => {}
            );
            if (ok) drawTabsAndBody();
          } else {
            await BookAudio.stopRecording();
            d.hasAudio = true;
            saveState();
            drawTabsAndBody();
          }
        });

        box.append(recBtn, trInput);
        panel.append(box);
        if (!passed) setPrimaryButtonState((d.hasAudio || d.audioTranscript.trim()) ? 'ready' : 'incomplete', 'تأكيد التبرير');
      } else {
        const card = document.createElement('div');
        card.className = 'l1-info-card';
        card.innerHTML = '<div class="l1-info-item">فسّر إجابتك لمعلمك وقارنها بالتبرير النموذجي:</div>'
          + '<div class="l1-word-quote">' + esc(modelText) + '</div>';
        panel.append(card);
        if (!passed) setPrimaryButtonState('ready', 'أكّدت التفسير مع المعلم');
      }
    };

    drawTabsAndBody();
    if (passed) {
      showFeedback('good', 'تفسير صحيح: ' + modelText);
      setPrimaryButtonState('correct');
    }

    stepUi.onCheck = async () => {
      if (d.mode === 'teacher' || (d.mode === 'voice' && d.hasAudio && !d.audioTranscript.trim())) {
        d.status = d.mode === 'teacher' ? 'teacher' : 'independent';
        recordMissionPass(cur);
        drawTabsAndBody();
        showFeedback('good', 'أحسنت! ' + modelText);
        setPrimaryButtonState('correct');
        return;
      }

      const txt = d.mode === 'write' ? d.writtenReason : d.audioTranscript;
      let res = typeof evaluateLocalJustification === 'function'
        ? evaluateLocalJustification(txt, d.targetDigit)
        : { status: 'correct', feedback: modelText };

      if (res.status !== 'correct' && typeof evaluateSemanticWithGemini === 'function') {
        setPrimaryButtonState('loading', 'جارٍ التقييم...');
        const gem = await evaluateSemanticWithGemini(
          'تبرير الطالب لتساوي قيمة 9 في 9,605 و 149,605: "' + txt + '"',
          'قيّم صحة التبرير بالمنزلة. أعد JSON: {"status":"correct"|"incomplete","feedback":"جملة قصيرة بالعربية بلا إيموجي"}'
        );
        if (gem && gem.status === 'correct') res = gem;
      }

      if (res.status === 'correct') {
        d.status = 'independent';
        recordMissionPass(cur);
        drawTabsAndBody();
        showFeedback('good', res.feedback);
        setPrimaryButtonState('correct');
      } else {
        sound(false);
        haptic(false);
        markSessionError(cur.stepIndex);
        showFeedback('bad', res.feedback || 'اذكر اسم المنزلة المشتركة للرقم 9 في العددين (آحاد الألوف).');
        setPrimaryButtonState('wrong');
      }
    };

    stepUi.onRetry = () => {
      clearFeedback();
      const ta = byId('l1-produce-explain-ta');
      if (ta) ta.focus();
      setPrimaryButtonState('ready');
    };
  }

  /* =========================================================
     5. Exit Ticket Summative Question (Node 20)
     ========================================================= */

  function renderExitQuestionStep(cur, root) {
    const et = prepareExitTicketSession(false);
    const savedVal = et.currentAnswers?.[cur.qId]?.[cur.subKey];
    const isAnswered = savedVal !== undefined;
    const correctIdx = cur.options.findIndex(o => o.value === cur.correctValue);

    if (cur.num !== undefined) {
      const numCard = document.createElement('div');
      numCard.className = 'l1-num-card';
      numCard.innerHTML = highlightedNumberHTML(cur.num, cur.p);
      root.append(numCard);
    }

    if (cur.quoteText) {
      const quoteEl = document.createElement('div');
      quoteEl.className = 'l1-word-quote';
      quoteEl.textContent = cur.quoteText;
      root.append(quoteEl);
    }

    if (cur.eqTerms) {
      const eq = document.createElement('div');
      eq.className = 'l1-eq-strip';
      cur.eqTerms.forEach((t, idx) => {
        if (idx > 0) {
          const plus = document.createElement('span');
          plus.setAttribute('aria-hidden', 'true');
          plus.textContent = '+';
          eq.append(plus);
        }
        const chip = document.createElement('span');
        const isTarget = t.value === cur.missingValue;
        chip.className = 'l1-eq-term' + (isTarget ? ' is-current' : ' is-done');
        chip.textContent = isTarget ? (isAnswered ? fmt(cur.correctValue) : '؟') : fmt(t.value);
        eq.append(chip);
      });
      root.append(eq);
    }

    if (isAnswered) {
      stepUi.selectedIdx = cur.options.findIndex(o => o.value === savedVal);
    }

    const etAnimMount = document.createElement('div');
    root.append(etAnimMount);
    mountStepConceptAnim(cur, etAnimMount, { lesson: 1 });

    const draw = () => {
      root.querySelector('.l1-options-list')?.remove();
      const wrongList = (isAnswered && stepUi.selectedIdx !== correctIdx && stepUi.selectedIdx >= 0) ? [stepUi.selectedIdx] : [];
      const optsEl = createRadioOptions({
        items: cur.options,
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: isAnswered ? correctIdx : -1,
        wrongIndices: wrongList,
        disabled: isAnswered,
        onSelect: idx => {
          if (isAnswered) return;
          stepUi.selectedIdx = idx;
          clearFeedback();
          draw();
          setPrimaryButtonState('ready');
        }
      });
      root.append(optsEl);
    };

    draw();

    if (isAnswered) {
      const wasRight = savedVal === cur.correctValue;
      showFeedback(wasRight ? 'good' : 'bad', wasRight
        ? 'إجابة صحيحة! ' + (cur.explain || '')
        : 'الإجابة الصحيحة هي «' + cur.options[correctIdx]?.label + '». ' + (cur.explain || ''));
      setPrimaryButtonState('explanation', session.index === session.steps.length - 1 ? 'عرض النتيجة' : 'متابعة');
    } else {
      setPrimaryButtonState('incomplete');
    }

    stepUi.onCheck = () => {
      if (stepUi.selectedIdx === null || stepUi.selectedIdx < 0) return;
      const chosen = cur.options[stepUi.selectedIdx];
      if (!et.currentAnswers[cur.qId]) et.currentAnswers[cur.qId] = {};
      et.currentAnswers[cur.qId][cur.subKey] = chosen.value;
      const ok = chosen.value === cur.correctValue;
      sound(ok);
      haptic(ok);
      saveState();

      root.querySelector('.l1-options-list')?.remove();
      root.append(createRadioOptions({
        items: cur.options,
        selectedIdx: stepUi.selectedIdx,
        revealedRightIdx: correctIdx,
        wrongIndices: ok ? [] : [stepUi.selectedIdx],
        disabled: true,
        onSelect: () => {}
      }));

      showFeedback(ok ? 'good' : 'bad', ok
        ? 'إجابة صحيحة! ' + (cur.explain || '')
        : 'الإجابة الصحيحة هي «' + cur.options[correctIdx]?.label + '». ' + (cur.explain || ''));
      setPrimaryButtonState('explanation', session.index === session.steps.length - 1 ? 'عرض النتيجة' : 'متابعة');
    };
  }

  /* =========================================================
     6. Progression, Navigation & Result Screen
     ========================================================= */

  function advanceStep() {
    if (!session) return;

    if (session.mode === 'infinite' && stepUi.infiniteCompleted) {
      state.infiniteStep = generateInfiniteStep(state.infiniteSkill);
      session = buildInfiniteSession(state.infiniteSkill);
      renderStep();
      return;
    }

    if (session.index < session.steps.length - 1) {
      session.index++;
      // Keep onboarding phase synchronized on Station 1 step advance
      if (session.mode === 'station1') {
        const nextKey = session.steps[session.index]?.key || '';
        const ob = state.onboarding;
        if (ob) {
          if (nextKey === 'bridge_0') ob.station1Phase = 'bridge';
          else if (nextKey.startsWith('gradual_')) {
            ob.station1Phase = 'gradual_millions';
            ob.gradualStep = Number(nextKey.split('_')[1]) || 0;
          }
        }
      }
      saveState();
      renderStep();
    } else {
      finishSession();
    }
  }

  function getNextLesson1Action(nodeId) {
    const nextId = Number(nodeId) + 1;
    if (Number.isInteger(nextId) && nextId >= 0 && nextId < PATH_NODES.length) {
      const unlocked = typeof isNodeUnlocked === 'function' ? isNodeUnlocked(nextId) : true;
      if (unlocked) {
        return { label: 'المحطة التالية', action: () => openNode(nextId) };
      }
    }
    if (nodeId >= PATH_NODES.length - 1 && (typeof isLesson2Unlocked !== 'function' || isLesson2Unlocked())) {
      return { label: 'الدرس التالي: مقارنة الأعداد', action: () => openLesson2Node(0) };
    }
    return null;
  }

  function resumeAfterRecharge(returnCtx) {
    const ret = normalizeRechargeReturnContext(returnCtx);
    const targetLesson = ret.lesson || 1;
    lastActiveLesson = targetLesson;

    if (ret.remedialSnapshot) {
      bindShellChromeOnce();
      cleanupStepSideEffects();
      const snap = ret.remedialSnapshot;
      session = snap;
      state.mapSubView = targetLesson === 7 ? 'u2_lesson1' : 'lesson' + targetLesson;
      state.viewMode = targetLesson === 7 ? 'u2_lesson1' : 'lesson' + targetLesson;
      setUiMode('learning');
      if (ret.finishAfterRecharge) {
        finishSession();
      } else {
        renderStep();
      }
      return true;
    }

    if (ret.remedialLaunch) {
      const { unmasteredList, roundNum } = ret.remedialLaunch;
      if (targetLesson === 2) return openLesson2Remedial(unmasteredList, roundNum);
      if (targetLesson === 3) return openLesson3Remedial(unmasteredList, roundNum);
      if (targetLesson === 4) return openLesson4Remedial(unmasteredList, roundNum);
      if (targetLesson === 5) return openLesson5Remedial(unmasteredList, roundNum);
      if (targetLesson === 7) return openU2L1Remedial(unmasteredList, roundNum);
    }

    if (ret.nodeId !== null) {
      const opts = ret.openOptions || { preserveProgress: true };
      if (targetLesson === 2) return openLesson2Node(ret.nodeId, opts);
      if (targetLesson === 3) return openLesson3Node(ret.nodeId, opts);
      if (targetLesson === 4) return openLesson4Node(ret.nodeId, opts);
      if (targetLesson === 5) return openLesson5Node(ret.nodeId, opts);
      if (targetLesson === 7) return openU2L1Node(ret.nodeId, opts);
      return openNode(ret.nodeId, ret.openOptions || undefined);
    }

    closeToMap(targetLesson);
    return false;
  }

  function finishSession() {
    cleanupStepSideEffects();
    const s = session;
    if (!s) return;

    if (s.mode === 'recharge') {
      const retCtx = normalizeRechargeReturnContext(s.returnContext || s.returnNodeId);
      const targetLesson = retCtx.lesson || s.lesson || 1;
      lastActiveLesson = targetLesson;
      const hasReturnTarget = Boolean(retCtx.remedialSnapshot || retCtx.remedialLaunch || retCtx.nodeId !== null);
      const primaryText = (retCtx.remedialSnapshot || retCtx.remedialLaunch)
        ? 'العودة إلى التدريب'
        : (retCtx.nodeId !== null ? 'العودة إلى المهمة' : 'العودة إلى الخريطة');
      openResultScreen({
        badgeIcon: 'star',
        title: 'تم شحن القلوب بنجاح',
        subtitle: 'استعدت قلوبك الثلاثة كاملة ويمكنك مواصلة التعلّم.',
        metrics: [
          { value: '3 / 3', label: 'القلوب' }
        ],
        primaryLabel: primaryText,
        onPrimary: () => {
          if (hasReturnTarget) resumeAfterRecharge(retCtx);
          else closeToMap(targetLesson);
        },
        secondaryLabel: hasReturnTarget ? 'العودة إلى الخريطة' : null,
        onSecondary: () => closeToMap(targetLesson)
      });
      return;
    }

    if (s.lesson === 7) {
      finishU2L1Session();
      return;
    }
    if (s.lesson === 5) {
      finishLesson5Session();
      return;
    }
    if (s.lesson === 4) {
      finishLesson4Session();
      return;
    }
    if (s.lesson === 3) {
      finishLesson3Session();
      return;
    }
    if (s.lesson === 2) {
      finishLesson2Session();
      return;
    }

    if (s.mode === 'station1') {
      completeStation1Onboarding();
      const stars = Math.max(1, 3 - (s.errors > 2 ? 2 : s.errors));
      state.nodeStars[0] = Math.max(state.nodeStars[0] || 0, stars);
      saveState();
      const nextAct = getNextLesson1Action(0);
      openResultScreen({
        badgeIcon: 'spark',
        title: 'أتممت اكتشاف الملايين!',
        subtitle: 'أصبحت مستعدًا الآن لبناء الأعداد وممارسة التحديات.',
        metrics: [
          { value: ar(state.nodeStars[0]) + ' / 3', label: 'النجوم' },
          { value: fmt(totalPoints()), label: 'مجموع النقاط' }
        ],
        primaryLabel: nextAct ? nextAct.label : 'متابعة إلى ملعب الأعداد',
        onPrimary: nextAct ? nextAct.action : () => openNode(1),
        secondaryLabel: 'العودة إلى الخريطة',
        onSecondary: () => closeToMap(1)
      });
      return;
    }

    if (s.mode === 'story') {
      const node = PATH_NODES.find(n => n.id === s.nodeId);
      if (node) {
        state.nodesCompleted.add(node.id);
        state.nodeStars[node.id] = Math.max(state.nodeStars[node.id] || 0, 3);
        const before = new Set(state.badges || []);
        checkMilestoneBadges(true);
        s.unlockedBadges = [...(state.badges || [])].filter(id => !before.has(id));
      }
      renderHUD();
      renderDuolingoMap();
      saveState();
      const nextAct = getNextLesson1Action(s.nodeId);
      openResultScreen({
        badgeIcon: 'book',
        title: 'أنهيت «' + s.title + '»',
        subtitle: 'أصبحت جاهزًا للتطبيق في المحطة التالية.',
        metrics: [
          { value: ar(s.steps.length), label: 'الشرائح' },
          { value: '3 / 3', label: 'النجوم' }
        ],
        unlockedBadges: s.unlockedBadges,
        primaryLabel: nextAct ? nextAct.label : 'العودة إلى الخريطة',
        onPrimary: nextAct ? nextAct.action : () => closeToMap(1),
        secondaryLabel: nextAct ? 'العودة إلى الخريطة' : null,
        onSecondary: () => closeToMap(1)
      });
      return;
    }

    if (s.mode === 'playground') {
      if (playgroundState.questsDone.size >= 3) {
        state.nodesCompleted.add(1);
        state.nodeStars[1] = Math.max(state.nodeStars[1] || 0, 3);
      }
      renderHUD();
      renderDuolingoMap();
      saveState();
      const nextAct = getNextLesson1Action(1);
      openResultScreen({
        badgeIcon: 'compass',
        title: 'أحسنت في ملعب الأعداد!',
        subtitle: 'بنيت أعدادًا بمنازل متعددة حتى الملايين.',
        metrics: [
          { value: ar(Math.min(5, playgroundState.questsDone.size)) + ' / 5', label: 'التحديات' },
          { value: fmt(totalPoints()), label: 'النقاط' }
        ],
        primaryLabel: nextAct ? nextAct.label : 'العودة إلى الخريطة',
        onPrimary: nextAct ? nextAct.action : () => closeToMap(1),
        secondaryLabel: nextAct ? 'العودة إلى الخريطة' : (playgroundState.questsDone.size < 5 ? 'جرّب تحديات إضافية' : null),
        onSecondary: nextAct ? () => closeToMap(1) : () => openNode(1, { allQuests: true })
      });
      return;
    }

    if (s.mode === 'mission') {
      const mId = s.missionId;
      const mNode = PATH_NODES.find(n => n.type === 'mission' && n.missionId === mId);
      const stars = mNode ? (state.nodeStars?.[mNode.id] || 3) : 3;
      const nextAct = mNode ? getNextLesson1Action(mNode.id) : null;
      const fallbackSecondary = state.finished ? 'عرض شهادة الإتمام' : (stars < 3 ? 'أعد لتحسين النجوم' : null);

      openResultScreen({
        badgeIcon: 'trophy',
        title: 'أتممت «' + s.title + '»',
        subtitle: stars === 3 ? 'إتقان كامل دون أخطاء!' : 'أنهيت المحطة بنجاح، ويمكنك إعادتها لرفع النجوم.',
        metrics: [
          { value: ar(stars) + ' / 3', label: 'النجوم' },
          { value: fmt(totalPoints()), label: 'مجموع النقاط' }
        ],
        unlockedBadges: s.unlockedBadges,
        primaryLabel: nextAct ? nextAct.label : 'العودة إلى الخريطة',
        onPrimary: nextAct ? nextAct.action : () => closeToMap(1),
        secondaryLabel: nextAct ? 'العودة إلى الخريطة' : fallbackSecondary,
        onSecondary: () => {
          if (nextAct) {
            closeToMap(1);
          } else if (state.finished && typeof showFinish === 'function') {
            closeToMap(1);
            showFinish();
          } else if (mNode) {
            openNode(mNode.id);
          }
        }
      });
      return;
    }

    if (s.mode === 'exit_ticket') {
      const et = prepareExitTicketSession(false);
      const res = scoreExitTicket(et.currentQuestions, et.currentAnswers);
      et.attemptsCount = (et.attemptsCount || 0) + 1;
      et.lastScore = res.totalScore;
      et.lastResult = res;
      et.status = 'completed';
      try {
        et.lastCompletedDate = new Intl.DateTimeFormat('ar-JO-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      } catch (_) {
        et.lastCompletedDate = new Date().toLocaleDateString();
      }
      et.history = et.history || [];
      et.history.push({
        attemptNumber: et.attemptsCount,
        date: et.lastCompletedDate,
        score: res.totalScore,
        skills: res.skillResults
      });

      if (res.totalScore === 100) {
        state.nodesCompleted.add(20);
        if (!state.nodeStars) state.nodeStars = {};
        state.nodeStars[20] = 3;
        checkMilestoneBadges(true);
        celebrate(24);
      }
      renderHUD();
      renderDuolingoMap();
      saveState();

      showExitTicketResultScreen(res);
    }
  }

  function showExitTicketResultScreen(res) {
    const is100 = res.totalScore === 100;
    const canGoL2 = is100 && (typeof isLesson2Unlocked !== 'function' || isLesson2Unlocked());
    openResultScreen({
      badgeIcon: is100 ? 'trophy' : 'target',
      title: is100 ? 'أثبتّ إتقان الدرس الأول!' : 'اقتربت من الإتقان الكامل',
      subtitle: is100
        ? 'حققت 100% في بطاقة الخروج المستقلة وفتحت الدرس الثاني.'
        : 'حصلت على ' + ar(res.totalScore) + '% في التقييم المستقل. يلزم 100% لاعتماد شارة الإتقان.',
      metrics: [
        { value: ar(res.totalScore) + '%', label: 'النتيجة الإجمالية' },
        { value: is100 ? 'متقن' : 'تحتاج مراجعة', label: 'الحالة' }
      ],
      breakdown: res.skillResults,
      primaryLabel: canGoL2 ? 'الدرس التالي: مقارنة الأعداد' : 'إعادة المحاولة بنماذج جديدة',
      onPrimary: () => canGoL2 ? openLesson2Node(0) : openNode(20, { forceNew: true }),
      secondaryLabel: 'العودة إلى الخريطة',
      onSecondary: () => closeToMap(1)
    });
  }

  function openResultScreen(cfg) {
    state.runnerStep = null;
    state.viewMode = 'result';
    saveState();
    setUiMode('result');

    const card = byId('l1-result-card');
    if (!card) return;

    const metricsHtml = (cfg.metrics || []).map(m =>
      '<div class="l1-result-metric"><strong>' + esc(m.value) + '</strong><small>' + esc(m.label) + '</small></div>'
    ).join('');

    const badgesHtml = (cfg.unlockedBadges && cfg.unlockedBadges.length && typeof MILESTONE_BADGES !== 'undefined')
      ? '<div class="l1-info-card"><div class="l1-info-list">'
        + cfg.unlockedBadges.map(id => {
          const b = MILESTONE_BADGES.find(x => x.id === id);
          return b ? '<div class="l1-info-item">وسام جديد: <strong>' + esc(b.title) + '</strong></div>' : '';
        }).join('')
        + '</div></div>'
      : '';

    const breakdownHtml = cfg.breakdown
      ? '<div class="l1-et-breakdown">'
        + Object.values(cfg.breakdown).map(b =>
          '<div class="l1-et-skill-row"><span>' + esc(b.title || b.label) + '</span><span>' + ar(b.pts !== undefined ? b.pts : b.correct) + ' / ' + ar(b.max !== undefined ? b.max : b.total) + '</span></div>'
        ).join('')
        + '</div>'
      : '';

    card.innerHTML =
      '<div class="l1-result-badge" aria-hidden="true">' + getIconSVG(cfg.badgeIcon || 'check') + '</div>'
      + '<h2 class="l1-result-title">' + esc(cfg.title || 'أحسنت!') + '</h2>'
      + '<p class="l1-result-sub">' + esc(cfg.subtitle || '') + '</p>'
      + (metricsHtml ? '<div class="l1-result-metrics">' + metricsHtml + '</div>' : '')
      + badgesHtml
      + breakdownHtml
      + '<div class="l1-result-actions">'
      + '<button type="button" class="l1-primary-btn state-correct" id="l1-result-primary">' + esc(cfg.primaryLabel || 'العودة إلى الخريطة') + '</button>'
      + (cfg.secondaryLabel ? '<button type="button" class="l1-secondary-btn" id="l1-result-secondary">' + esc(cfg.secondaryLabel) + '</button>' : '')
      + '</div>';

    byId('l1-result-primary')?.addEventListener('click', () => {
      if (cfg.onPrimary) cfg.onPrimary();
      else closeToMap();
    });

    byId('l1-result-secondary')?.addEventListener('click', () => {
      if (cfg.onSecondary) cfg.onSecondary();
    });

    byId('l1-result-primary')?.focus({ preventScroll: true });
  }

  /* =========================================================
     Public API
     ========================================================= */

  let chromeBound = false;
  /* ---------------- Lesson 2 & 3 Shared Runner Steps ---------------- */
  function l2Record(nodeId) {
    if (session && session.lesson === 7) {
      return typeof getU2L1NodeRecord === 'function' ? getU2L1NodeRecord(nodeId) : null;
    }
    if (session && session.lesson === 5) {
      return typeof getLesson5NodeRecord === 'function' ? getLesson5NodeRecord(nodeId) : null;
    }
    if (session && session.lesson === 4) {
      return typeof getLesson4NodeRecord === 'function' ? getLesson4NodeRecord(nodeId) : null;
    }
    if (session && session.lesson === 3) {
      return typeof getLesson3NodeRecord === 'function' ? getLesson3NodeRecord(nodeId) : null;
    }
    return typeof getLesson2NodeRecord === 'function' ? getLesson2NodeRecord(nodeId) : null;
  }

  function l2StepData(cur) {
    if (!session || !cur) return {};
    if (session.remedial) {
      session.remedialStepData = session.remedialStepData || {};
      session.remedialStepData[cur.key] = session.remedialStepData[cur.key] || {};
      return session.remedialStepData[cur.key];
    }
    const rec = l2Record(session.nodeId);
    if (!rec) return {};
    rec.data = rec.data || {};
    rec.data[cur.key] = rec.data[cur.key] || {};
    return rec.data[cur.key];
  }

  function isL2StepPassed(cur) {
    if (!session || !cur) return false;
    if (session.remedial) {
      return Boolean(session.remedialPassed && session.remedialPassed.has(cur.key));
    }
    const rec = l2Record(session.nodeId);
    return Boolean(rec && rec.passed && rec.passed.has(session.index));
  }

  function recordL2StepPass(cur, dataObj) {
    if (!session || !cur) return;
    sound(true);
    haptic(true);
    if (session.remedial) {
      session.remedialPassed = session.remedialPassed || new Set();
      session.remedialPassed.add(cur.key);
    } else {
      const rec = l2Record(session.nodeId);
      if (rec) {
        rec.passed.add(session.index);
        const assisted = Boolean(dataObj && (dataObj.assisted || (dataObj.hintTier || 0) >= 3));
        if (assisted) rec.assistedSteps.add(cur.key);
        else rec.independentSteps.add(cur.key);
      }
      if (session.lesson === 3 || session.lesson === 5 || session.lesson === 7) {
        document.querySelectorAll('#l1-shell .l1-hint-bar, #l1-shell .l1-context-row .l1-hint-btn').forEach(el => {
          el.hidden = true;
        });
      }
    }
    if (session.showHearts) {
      state.streak = (state.streak || 0) + 1;
      state.maxSessionStreak = Math.max(state.maxSessionStreak || 0, state.streak);
      if (typeof renderStreakIndicator === 'function') renderStreakIndicator();
      if (typeof renderHUD === 'function') renderHUD();
    }
    saveState();
  }

  function markL2StepError() {
    if (!session) return;
    session.errors = (session.errors || 0) + 1;
    if (!session.remedial) {
      const rec = l2Record(session.nodeId);
      if (rec) rec.errors = (rec.errors || 0) + 1;
    }
    deductHeartOnError();
    renderTopbar();
    saveState();
  }

  function l2PassPrimaryLabel() {
    if (!session) return 'متابعة';
    return session.index >= session.steps.length - 1 ? 'عرض النتيجة' : 'متابعة';
  }

  function l2ParseIntInput(raw) {
    const cleaned = normalizeDigits(String(raw ?? '')).replace(/[,\s٬،_]/g, '');
    if (!cleaned || !/^\d+$/.test(cleaned)) return null;
    const val = Number(cleaned);
    return Number.isSafeInteger(val) ? val : null;
  }

  function l2FormatHighlightedNum(n, targetPlace) {
    const s = fmt(n);
    if (typeof targetPlace !== 'number') return esc(s);
    const totalDigits = String(Math.abs(Math.trunc(Number(n) || 0))).length;
    let dIdx = 0;
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch >= '0' && ch <= '9') {
        const placeFromRight = totalDigits - 1 - dIdx;
        out += placeFromRight === targetPlace
          ? '<span class="l1-l2-decisive-digit">' + ch + '</span>'
          : ch;
        dIdx += 1;
      } else {
        out += esc(ch);
      }
    }
    return out;
  }

  function l2SvgArrow(dir) {
    if (dir === 'up') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
  }

  function l2SvgCheck(ok) {
    if (ok) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  function l2AppendHintWidget(root, cur, d) {
    if (!cur || cur.noHints || !Array.isArray(cur.hints) || !cur.hints.length) return;
    const isL3 = Boolean(session && (session.lesson === 3 || session.lesson === 5 || session.lesson === 7));
    if (isL3 && isL2StepPassed(cur)) return;
    const total = cur.hints.length;
    const bar = document.createElement('div');
    bar.className = 'l1-hint-bar';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l1-hint-btn';
    const contentId = 'l2-hint-content-' + String(cur.key || 'step');
    btn.setAttribute('aria-controls', contentId);

    const content = document.createElement('div');
    content.id = contentId;
    content.className = 'l1-hint-content';

    const mountedToContext = isL3 ? mountHintBtnToContext(btn) : false;

    const syncHintUI = () => {
      const tier = Math.max(0, Math.min(total, Number(d.hintTier) || 0));
      const nextDisplayTier = Math.min(total, tier + 1);
      if (tier >= total) {
        btn.textContent = isL3 ? 'كل التلميحات' : ('تم عرض التلميحات (' + ar(tier) + ' من ' + ar(total) + ')');
        btn.setAttribute('aria-expanded', 'true');
        btn.disabled = true;
      } else {
        btn.textContent = 'تلميح ' + ar(nextDisplayTier) + '/' + ar(total);
        btn.setAttribute('aria-expanded', tier > 0 ? 'true' : 'false');
        btn.disabled = false;
      }

      if (tier === 0) {
        content.hidden = true;
        content.innerHTML = '';
        if (mountedToContext) bar.hidden = true;
      } else {
        if (mountedToContext) bar.hidden = false;
        content.hidden = false;
        content.innerHTML = cur.hints
          .slice(0, tier)
          .map((h, idx) => '<div><strong>' + ar(idx + 1) + '.</strong> ' + l2BidiTextHTML(h) + '</div>')
          .join('');
      }
    };

    btn.addEventListener('click', () => {
      const curTier = Math.max(0, Math.min(total, Number(d.hintTier) || 0));
      if (curTier >= total) return;
      d.hintTier = curTier + 1;
      if (d.hintTier >= 3) {
        d.assisted = true;
        const rec = l2Record(session.nodeId);
        if (rec) rec.assistedSteps.add(cur.key);
      }
      saveState();
      syncHintUI();
    });

    if (mountedToContext) {
      bar.append(content);
    } else {
      bar.append(btn, content);
    }
    root.append(bar);
    syncHintUI();
  }

  function l2CreateRadioOptions(opts) {
    const list = document.createElement('div');
    list.className = 'l1-options-list' + (opts.cols3 ? ' cols-3' : opts.cols2 ? ' cols-2' : '');
    list.setAttribute('role', 'radiogroup');
    list.setAttribute('aria-label', opts.ariaLabel || 'خيارات الإجابة');

    const buttons = [];
    opts.items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l1-option-btn'
        + (item.numeric ? ' numeric' : '')
        + (opts.selectedIdx === idx ? ' is-selected' : '')
        + (opts.revealedRightIdx === idx ? ' is-correct' : '')
        + (Array.isArray(opts.wrongIndices) && opts.wrongIndices.includes(idx) ? ' is-wrong' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', opts.selectedIdx === idx ? 'true' : 'false');
      btn.disabled = Boolean(opts.disabled);

      const numSpan = document.createElement('span');
      numSpan.className = 'l1-option-index';
      numSpan.textContent = ar(idx + 1);

      const textSpan = document.createElement('span');
      textSpan.className = 'l1-option-text';
      textSpan.innerHTML = item.numeric
        ? '<bdi dir="ltr">' + esc(item.label) + '</bdi>'
        : l2BidiTextHTML(item.label);

      btn.append(numSpan, textSpan);
      btn.addEventListener('click', () => {
        if (!btn.disabled && typeof opts.onSelect === 'function') opts.onSelect(idx);
      });
      btn.addEventListener('keydown', e => {
        if (btn.disabled) return;
        let next = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = (idx + 1) % buttons.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = (idx - 1 + buttons.length) % buttons.length;
        if (next >= 0 && buttons[next]) {
          e.preventDefault();
          buttons[next].focus();
          if (typeof opts.onSelect === 'function') opts.onSelect(next);
        }
      });

      buttons.push(btn);
      list.append(btn);
    });
    return list;
  }

  function l2RenderVisual(visual, mount, opts) {
    if (!visual || !mount) return;
    const passed = Boolean(opts && opts.passed);

    if (visual.type === 'l5_mini_table') {
      const card = document.createElement('div');
      card.className = 'l5-mini-table-card';
      if (visual.caption) {
        const cap = document.createElement('div');
        cap.className = 'l5-mini-table-cap';
        cap.innerHTML = l2BidiTextHTML(visual.caption);
        card.append(cap);
      }
      const hdrs = Array.isArray(visual.headers) ? visual.headers : [];
      const tbl = document.createElement('div');
      tbl.className = 'l5-vtable l5-mini-vtable';
      tbl.style.setProperty('--l5-vcols', String(Math.max(2, hdrs.length)));
      hdrs.forEach((h, hIdx) => {
        const hd = document.createElement('div');
        hd.className = 'l5-vcell-head' + (hIdx === hdrs.length - 1 ? ' is-sum-col' : '');
        hd.innerHTML = l2BidiTextHTML(h);
        tbl.append(hd);
      });
      (visual.rows || []).forEach(r => {
        const rowTone = r.tone || 'normal';
        (r.cells || []).forEach((val, cIdx) => {
          const cell = document.createElement('div');
          const isNumeric = /^[\d,.\s]+$/.test(String(val || '').trim());
          cell.className = 'l5-vcell-static'
            + (rowTone === 'goal' ? ' is-goal' : (rowTone === 'error' ? ' is-err' : ''))
            + (cIdx === hdrs.length - 1 ? ' is-sum-col' : '');
          cell.innerHTML = isNumeric ? ('<bdi dir="ltr">' + esc(val) + '</bdi>') : l2BidiTextHTML(val);
          tbl.append(cell);
        });
      });
      card.append(tbl);
      mount.append(card);
      return;
    }

    if (visual.type === 'hajj_table' || visual.type === 'tourists_table') {
      const rows = visual.rows || [];
      const wrap = document.createElement('div');
      wrap.className = 'l1-l2-hajj-wrap';
      const table = document.createElement('table');
      table.className = 'l1-l2-table';
      const isTourists = visual.type === 'tourists_table';
      table.innerHTML = '<thead><tr><th>العام</th><th>' + (isTourists ? 'عدد السياح' : 'عدد الحُجّاج') + '</th></tr></thead>';
      const tbody = document.createElement('tbody');

      const selectedRows = [];
      let cmpNote = null;

      rows.forEach((row, rIdx) => {
        const tr = document.createElement('tr');
        const isMaxYear = row.year === 2019;
        if (passed && visual.compactHighlight && isMaxYear) tr.classList.add('is-peak');
        const yrCell = '<td><bdi dir="ltr">' + esc(String(row.year)) + '</bdi> م</td>';
        if (visual.interactiveCompare) {
          tr.innerHTML = '<td><button type="button" class="l1-l2-table-btn" data-row-idx="' + rIdx + '"><bdi dir="ltr">' + esc(String(row.year)) + '</bdi> م</button></td>'
            + '<td><button type="button" class="l1-l2-table-btn" data-row-idx="' + rIdx + '"><bdi dir="ltr">' + fmt(row.count) + '</bdi></button></td>';
          tr.querySelectorAll('.l1-l2-table-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const pos = selectedRows.indexOf(rIdx);
              if (pos >= 0) selectedRows.splice(pos, 1);
              else {
                if (selectedRows.length >= 2) selectedRows.shift();
                selectedRows.push(rIdx);
              }
              tbody.querySelectorAll('tr').forEach((node, idx) => {
                node.classList.toggle('is-selected-row', selectedRows.includes(idx));
              });
              if (cmpNote) {
                if (selectedRows.length === 2) {
                  const a = rows[selectedRows[0]];
                  const b = rows[selectedRows[1]];
                  cmpNote.hidden = false;
                  cmpNote.innerHTML = l2BidiTextHTML(
                    'مقارنة ' + a.year + ' و' + b.year + ': ' + Lesson2RunnerDefs.explainComparisonPair(a.count, b.count)
                  );
                } else {
                  cmpNote.hidden = false;
                  cmpNote.textContent = 'اختر عامًا آخر من الجدول للمقارنة السريعة بينهما.';
                }
              }
            });
          });
        } else {
          tr.innerHTML = yrCell + '<td><bdi dir="ltr">' + fmt(row.count) + '</bdi></td>';
        }
        tbody.append(tr);
      });
      table.append(tbody);
      wrap.append(table);
      mount.append(wrap);
      if (visual.interactiveCompare) {
        cmpNote = document.createElement('div');
        cmpNote.className = 'l1-l2-inline-cmp';
        cmpNote.textContent = 'نصيحة استكشاف: المس أي عامين في الجدول للمقارنة السريعة.';
        mount.append(cmpNote);
      }
      return;
    }

    if (visual.type === 'compare_pair') {
      const grid = document.createElement('div');
      grid.className = 'l1-l2-pair-grid';
      grid.innerHTML = ''
        + '<div class="l1-l2-pair-box"><span class="l1-l2-pair-label">' + esc(visual.leftLabel || 'العدد الأول') + '</span>'
        + '<div class="l1-l2-pair-num" dir="ltr">' + l2FormatHighlightedNum(visual.leftNum, visual.highlightPlace) + '</div></div>'
        + '<div class="l1-l2-pair-box"><span class="l1-l2-pair-label">' + esc(visual.rightLabel || 'العدد الثاني') + '</span>'
        + '<div class="l1-l2-pair-num" dir="ltr">' + l2FormatHighlightedNum(visual.rightNum, visual.highlightPlace) + '</div></div>';
      mount.append(grid);
      return;
    }

    if (visual.type === 'symbols_legend') {
      const leg = document.createElement('div');
      leg.className = 'l1-l2-sym-legend';
      leg.innerHTML = ''
        + '<div class="l1-l2-sym-legend-item"><strong class="l1-l2-sym-glyph"><bdi dir="ltr">&gt;</bdi></strong><span>أكبر من (فتحة لليسار)</span></div>'
        + '<div class="l1-l2-sym-legend-item"><strong class="l1-l2-sym-glyph"><bdi dir="ltr">&lt;</bdi></strong><span>أصغر من (فتحة لليمين)</span></div>'
        + '<div class="l1-l2-sym-legend-item"><strong class="l1-l2-sym-glyph"><bdi dir="ltr">=</bdi></strong><span>يساوي تمامًا</span></div>';
      mount.append(leg);
      return;
    }

    if (visual.type === 'expression') {
      const card = document.createElement('div');
      card.className = 'l1-l2-expr-card' + (visual.isErrorQuote ? ' is-error-quote' : '');
      card.innerHTML = '<div class="l1-l2-expr-text" dir="ltr">' + esc(visual.expr || '') + '</div>';
      mount.append(card);
      return;
    }

    if (visual.type === 'numbers_trio') {
      const row = document.createElement('div');
      row.className = 'l1-l2-trio-row';
      (visual.numbers || []).forEach(num => {
        const chip = document.createElement('div');
        chip.className = 'l1-l2-trio-chip';
        chip.dir = 'ltr';
        chip.textContent = fmt(num);
        row.append(chip);
      });
      mount.append(row);
      return;
    }

    if (visual.type === 'oceans_chart') {
      const oceans = visual.oceans || [];
      const maxArea = Math.max(1, ...oceans.map(o => Number(o.area) || 0));
      const chart = document.createElement('div');
      chart.className = 'l1-l2-ocean-chart';
      oceans.forEach(o => {
        const pct = Math.max(15, Math.round((o.area / maxArea) * 100));
        const row = document.createElement('div');
        row.className = 'l1-l2-ocean-row';
        row.innerHTML = '<div class="l1-l2-ocean-head"><span>' + esc(o.name) + '</span><span><bdi dir="ltr">' + fmt(o.area) + '</bdi> كم²</span></div>'
          + '<div class="l1-l2-ocean-track"><div class="l1-l2-ocean-fill" style="width:' + pct + '%"></div></div>';
        chart.append(row);
      });
      mount.append(chart);
      return;
    }

    if (visual.type === 'rounding_arrows') {
      const card = document.createElement('div');
      card.className = 'l3-visual-card';
      if (visual.title) {
        const ttl = document.createElement('div');
        ttl.className = 'l3-reason-title';
        ttl.textContent = visual.title;
        card.append(ttl);
      }
      (visual.rows || []).forEach(r => {
        const row = document.createElement('div');
        row.className = 'l3-rounding-row';
        const fromText = r.from !== undefined ? String(r.from) : '';
        const toText = r.to !== undefined ? String(r.to) : '';
        row.innerHTML = ''
          + '<span>' + (r.label ? esc(r.label) + ': ' : '') + '<bdi dir="ltr">' + esc(fromText) + '</bdi></span>'
          + '<span class="l3-rounding-arrow" aria-hidden="true">←</span>'
          + '<bdi dir="ltr" class="l3-rounding-res">' + esc(toText) + '</bdi>';
        card.append(row);
      });
      if (visual.summary) {
        const note = document.createElement('p');
        note.className = 'l3-reason-note';
        note.innerHTML = l2BidiTextHTML(visual.summary);
        card.append(note);
      }
      mount.append(card);
      return;
    }

    if (visual.type === 'maghreb_area_cards') {
      const card = document.createElement('div');
      card.className = 'l3-visual-card l3-maghreb-card';
      const grid = document.createElement('div');
      grid.className = 'l3-maghreb-grid';
      (visual.countries || []).forEach(c => {
        const item = document.createElement('div');
        item.className = 'l3-maghreb-item';
        item.innerHTML = ''
          + '<div class="l3-maghreb-name">' + esc(c.name || '') + '</div>'
          + '<div class="l3-maghreb-area"><bdi dir="ltr">' + fmt(c.area) + ' km²</bdi></div>';
        grid.append(item);
      });
      card.append(grid);
      if (visual.fact) {
        const det = document.createElement('details');
        det.className = 'l3-fact-toggle';
        const sum = document.createElement('summary');
        sum.textContent = 'معلومة جغرافية (ص 18)';
        const fact = document.createElement('p');
        fact.className = 'l3-fact-box';
        fact.innerHTML = l2BidiTextHTML(visual.fact);
        det.append(sum, fact);
        card.append(det);
      }
      mount.append(card);
      return;
    }

    if (visual.type === 'fertilizer_table') {
      const card = document.createElement('div');
      card.className = 'l3-visual-card';
      const wrap = document.createElement('div');
      wrap.className = 'l1-l2-table-wrap';
      const tbl = document.createElement('table');
      tbl.className = 'l1-l2-table';
      const rowsHtml = (visual.rows || []).map(r => ''
        + '<tr>'
        + '<td>' + esc(r.year || '') + '</td>'
        + '<td><bdi dir="ltr">' + fmt(r.amount) + '</bdi></td>'
        + '</tr>').join('');
      tbl.innerHTML = '<thead><tr><th>العام</th><th>القيمة بالدينار</th></tr></thead><tbody>' + rowsHtml + '</tbody>';
      wrap.append(tbl);
      card.append(wrap);
      mount.append(card);
      return;
    }

    if (visual.type === 'cargo_planes_chart') {
      const planes = visual.planes || [];
      const maxMass = Math.max(1, ...planes.map(p => Number(p.mass) || 0));
      const chart = document.createElement('div');
      chart.className = 'l3-planes-chart';

      const titleEl = document.createElement('div');
      titleEl.className = 'l3-planes-title';
      titleEl.innerHTML = 'كتل بعض طائرات الشحن (<bdi dir="ltr">kg</bdi>)';
      chart.append(titleEl);

      const barsWrap = document.createElement('div');
      barsWrap.className = 'l3-planes-bars';
      const labelsWrap = document.createElement('div');
      labelsWrap.className = 'l3-planes-labels';

      planes.forEach((p, idx) => {
        const barPx = Math.max(28, Math.round(((Number(p.mass) || 0) / maxMass) * 76));
        const col = document.createElement('div');
        col.className = 'l3-plane-col';

        const valEl = document.createElement('div');
        valEl.className = 'l3-plane-val';
        valEl.innerHTML = '<bdi dir="ltr">' + fmt(p.mass) + '</bdi>';

        const barEl = document.createElement('div');
        barEl.className = 'l3-plane-bar p' + (p.id || (idx + 1));
        barEl.style.height = barPx + 'px';
        barEl.setAttribute('aria-label', (p.name || '') + ': ' + fmt(p.mass) + ' كيلوغرام');

        col.append(valEl, barEl);
        barsWrap.append(col);

        const lblSpan = document.createElement('span');
        lblSpan.textContent = p.name || '';
        labelsWrap.append(lblSpan);
      });

      chart.append(barsWrap, labelsWrap);
      mount.append(chart);
      return;
    }

    if (visual.type === 'lana_reem_notebooks') {
      const grid = document.createElement('div');
      grid.className = 'l3-notebooks-grid';
      const op1 = fmt(Number(visual.op1 || 0));
      const op2 = fmt(Number(visual.op2 || 0));
      const entries = [
        { name: 'دفتر ريم', ans: fmt(Number(visual.reemAns || 0)) },
        { name: 'دفتر لانا', ans: fmt(Number(visual.lanaAns || 0)) }
      ];
      entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'l3-notebook-card';
        card.innerHTML = ''
          + '<div class="l3-notebook-name">' + esc(entry.name) + '</div>'
          + '<div class="l3-notebook-math" dir="ltr">'
            + '<div>' + esc(op1) + '</div>'
            + '<div>+ ' + esc(op2) + '</div>'
            + '<div class="l3-notebook-sum">' + esc(entry.ans) + '</div>'
          + '</div>';
        grid.append(card);
      });
      mount.append(grid);
    }
  }

  function renderL3TeachStep(cur, root) {
    const d = l2StepData(cur);
    const card = document.createElement('div');
    card.className = 'l3-visual-card l3-teach-card';

    if (cur.title) {
      const h = document.createElement('h3');
      h.className = 'l3-teach-title';
      h.innerHTML = l2BidiTextHTML(cur.title);
      card.append(h);
    }
    if (cur.body) {
      const p = document.createElement('p');
      p.className = 'l3-teach-body';
      p.innerHTML = l2BidiTextHTML(cur.body);
      card.append(p);
    }
    if (cur.visual) {
      const visMount = document.createElement('div');
      l2RenderVisual(cur.visual, visMount, { passed: true });
      card.append(visMount);
      if (cur.visual.type === 'rounding_arrows' || cur.animScene) {
        const extraAnimMount = document.createElement('div');
        mountStepConceptAnim(cur, extraAnimMount);
        if (extraAnimMount.firstChild) card.append(extraAnimMount);
      }
    } else {
      const animMount = document.createElement('div');
      mountStepConceptAnim(cur, animMount);
      if (animMount.firstChild) card.append(animMount);
    }
    if (Array.isArray(cur.bullets) && cur.bullets.length) {
      const ul = document.createElement('ul');
      ul.className = 'l3-teach-bullets';
      cur.bullets.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = l2BidiTextHTML(b);
        ul.append(li);
      });
      card.append(ul);
    }

    root.append(card);
    setPrimaryButtonState('explanation', l2PassPrimaryLabel());
    stepUi.onNext = () => {
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
        if (d) d.viewed = true;
      }
      advanceStep();
    };
  }

  function l3AppendPlacePeriodsAndLabels(grid, nCols, activeCol, doneThresholdCol) {
    const shortLabels = ['آحاد', 'عشرات', 'مئات', 'آ.ألوف', 'ع.ألوف', 'م.ألوف', 'ملايين', 'ع.ملايين', 'م.ملايين'];
    const fullNames = (global.Lesson3RunnerDefs && global.Lesson3RunnerDefs.L3_PLACE_NAMES) || shortLabels;
    const onesSpan = Math.min(3, nCols);
    const thousSpan = nCols > 3 ? Math.min(3, nCols - 3) : 0;
    const milSpan = nCols > 6 ? (nCols - 6) : 0;

    let periodHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    if (milSpan > 0) {
      const milLabel = milSpan <= 2 ? 'الملايين' : 'دورة الملايين';
      periodHtml += '<div class="l3-vop-period cycle-millions" title="دورة الملايين" style="grid-column: span ' + milSpan + '">' + milLabel + '</div>';
    }
    if (thousSpan > 0) {
      const thousLabel = thousSpan === 1 ? 'الألوف' : 'دورة الألوف';
      periodHtml += '<div class="l3-vop-period cycle-thousands" title="دورة الألوف" style="grid-column: span ' + thousSpan + '">' + thousLabel + '</div>';
    }
    periodHtml += '<div class="l3-vop-period cycle-ones" title="دورة الآحاد" style="grid-column: span ' + onesSpan + '">دورة الآحاد</div>';

    let labelsHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    for (let pos = nCols - 1; pos >= 0; pos--) {
      const isActive = pos === activeCol;
      const isDone = pos < doneThresholdCol;
      labelsHtml += '<div class="l3-vop-place-lbl'
        + (isActive ? ' is-active-col' : (isDone ? ' is-done-col' : ''))
        + '" title="' + esc(fullNames[pos] || '') + '">' + (shortLabels[pos] || '') + '</div>';
    }

    grid.insertAdjacentHTML('beforeend', periodHtml + labelsHtml);
  }

  function renderL3VerticalOpStep(cur, root) {
    const defs = global.Lesson3RunnerDefs;
    if (!defs) return;
    const meta = cur.op === 'sub'
      ? defs.computeVerticalSubtractionMeta(cur.operands[0], cur.operands[1])
      : defs.computeVerticalAdditionMeta(cur.operands);
    const nCols = meta.numCols;
    const d = l2StepData(cur);
    if (!Number.isInteger(d.colIndex) || d.colIndex < 0) d.colIndex = 0;
    if (!d.enteredDigits || typeof d.enteredDigits !== 'object') d.enteredDigits = {};
    if (!d.borrowedCols || typeof d.borrowedCols !== 'object') d.borrowedCols = {};
    if (isL2StepPassed(cur)) d.colIndex = nCols;

    let wrongColPos = -1;
    const boardHost = document.createElement('div');
    const controlsHost = document.createElement('div');
    root.append(boardHost, controlsHost);
    l2AppendHintWidget(root, cur, d);

    const draw = () => {
      const passed = isL2StepPassed(cur) || d.colIndex >= nCols;
      const activeCol = passed ? -1 : d.colIndex;
      const activeMeta = (!passed && activeCol >= 0 && activeCol < nCols) ? meta.columns[activeCol] : null;
      const needsBorrowClick = Boolean(
        !passed
        && meta.op === 'sub'
        && activeMeta
        && activeMeta.neededBorrow
        && !d.borrowedCols[activeCol]
      );

      // Compute visible subtraction borrow cross-outs and regroup numbers up to current progress
      const crossedAtPos = new Set();
      const borrowBadgeAtPos = {};
      if (meta.op === 'sub') {
        const limit = passed ? (nCols - 1) : activeCol;
        for (let i = 0; i <= limit; i++) {
          const c = meta.columns[i];
          const borrowDoneHere = passed || i < activeCol || Boolean(d.borrowedCols[i]);
          if (borrowDoneHere && c && Array.isArray(c.borrowEffects)) {
            c.borrowEffects.forEach(eff => {
              crossedAtPos.add(eff.pos);
              borrowBadgeAtPos[eff.pos] = {
                val: eff.newVal,
                isSecondary: Boolean(eff.isIntermediateZero)
              };
            });
          }
        }
      }

      boardHost.innerHTML = '';
      controlsHost.innerHTML = '';

      const card = document.createElement('div');
      card.className = 'l3-vop-card';

      const head = document.createElement('div');
      head.className = 'l3-vop-head';
      const opLabel = meta.op === 'sub'
        ? ('طرح عمودي ضمن ' + ar(nCols) + ' منازل')
        : ('جمع ' + (meta.operands.length > 2 ? ar(meta.operands.length) + ' أعداد' : 'عمودي') + ' ضمن ' + ar(nCols) + ' منازل');
      const statusText = passed
        ? 'اكتملت جميع المنازل بنجاح!'
        : ('المنزلة الحالية: ' + (activeMeta ? activeMeta.placeName : ''));
      head.innerHTML = ''
        + '<span class="l3-vop-op-pill">' + esc(opLabel) + '</span>'
        + '<span class="l3-vop-col-status' + (passed ? ' is-done' : '') + '">' + esc(statusText) + '</span>';
      card.append(head);

      const scrollWrap = document.createElement('div');
      scrollWrap.className = 'l3-vop-board-scroll';
      const grid = document.createElement('div');
      grid.className = 'l3-vop-grid';
      grid.style.gridTemplateColumns = 'minmax(12px, 20px) repeat(' + nCols + ', minmax(0, 1fr))';

      l3AppendPlacePeriodsAndLabels(grid, nCols, activeCol, passed ? nCols : d.colIndex);

      // Regroup row (carries or borrows)
      let regroupHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
      for (let pos = nCols - 1; pos >= 0; pos--) {
        const c = meta.columns[pos];
        let badge = '';
        if (meta.op === 'add') {
          if (pos > 0 && c.carryIn > 0 && (passed || d.colIndex >= pos)) {
            badge = '<span class="l3-vop-regroup-badge">' + c.carryIn + '</span>';
          }
        } else {
          const bInfo = borrowBadgeAtPos[pos];
          if (bInfo) {
            badge = '<span class="l3-vop-regroup-badge' + (bInfo.isSecondary ? ' is-secondary-borrow' : '') + '">' + bInfo.val + '</span>';
          }
        }
        regroupHtml += '<div class="l3-vop-regroup-cell">' + badge + '</div>';
      }
      grid.insertAdjacentHTML('beforeend', regroupHtml);

      // Operand rows (supports 2 or 3 addends cleanly)
      const opCount = meta.operands.length;
      for (let rIdx = 0; rIdx < opCount; rIdx++) {
        const isLastOp = rIdx === opCount - 1;
        let rowHtml = isLastOp
          ? '<div class="l3-vop-op-spacer l3-vop-op-sign" aria-label="' + (meta.op === 'sub' ? 'ناقص' : 'زائد') + '">' + (meta.op === 'sub' ? '−' : '+') + '</div>'
          : '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';

        for (let pos = nCols - 1; pos >= 0; pos--) {
          const c = meta.columns[pos];
          const rawDig = meta.op === 'add'
            ? c.operandDigits[rIdx]
            : (rIdx === 0 ? c.origTopDigit : c.bottomDigit);
          const isEmpty = rawDig === null || rawDig === undefined;
          const isCrossed = meta.op === 'sub' && rIdx === 0 && crossedAtPos.has(pos);
          const isColActive = pos === activeCol;
          rowHtml += '<div class="l3-vop-digit'
            + (isEmpty ? ' is-empty' : '')
            + (isColActive ? ' is-active-col' : '')
            + (isCrossed ? ' is-crossed' : '')
            + '">' + (isEmpty ? '0' : rawDig) + '</div>';
        }
        grid.insertAdjacentHTML('beforeend', rowHtml);
      }

      grid.insertAdjacentHTML('beforeend', '<div class="l3-vop-divider" aria-hidden="true"></div>');

      // Result row
      let resHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
      for (let pos = nCols - 1; pos >= 0; pos--) {
        const c = meta.columns[pos];
        const isColDone = passed || pos < d.colIndex;
        const isColActive = !passed && pos === activeCol;
        const isWrong = isColActive && wrongColPos === pos;
        let cls = 'l3-vop-res-cell';
        if (isColDone) cls += ' is-filled';
        else if (isColActive) {
          cls += needsBorrowClick ? ' is-needs-borrow' : ' is-active';
        }
        if (isWrong) cls += ' is-wrong';
        const valStr = isColDone ? String(c.resultDigit) : (isColActive ? (needsBorrowClick ? '!' : '؟') : '');
        resHtml += '<div class="' + cls + '" aria-live="polite">' + valStr + '</div>';
      }
      grid.insertAdjacentHTML('beforeend', resHtml);

      scrollWrap.append(grid);
      card.append(scrollWrap);

      // Reasonableness banner upon full completion
      if (passed) {
        const estFormula = cur.customEstFormula
          || (meta.roundedOperands.map(fmt).join(meta.op === 'sub' ? ' - ' : ' + ') + ' = ' + fmt(meta.estimate));
        const estLabel = cur.customEstLabel || 'التقدير';
        const banner = document.createElement('div');
        banner.className = 'l3-reason-banner is-compact';
        banner.innerHTML = ''
          + '<div class="l3-reason-row">'
            + '<div class="l3-reason-chip"><small>' + esc(estLabel) + '</small><strong><bdi dir="ltr">' + esc(estFormula) + '</bdi></strong></div>'
            + '<div class="l3-reason-chip"><small>الدقيق (معقول)</small><strong><bdi dir="ltr">' + fmt(meta.exact) + '</bdi></strong></div>'
          + '</div>';
        card.append(banner);
      }

      boardHost.append(card);

      // Focus on ONE action at a time: Borrow trigger OR 0-9 digit keypad
      if (!passed && activeMeta) {
        if (needsBorrowClick) {
          const botDig = activeMeta.bottomDigit === null ? 0 : activeMeta.bottomDigit;
          const donorEffect = Array.isArray(activeMeta.borrowEffects) && activeMeta.borrowEffects.length
            ? activeMeta.borrowEffects[0]
            : null;
          const donorMeta = (donorEffect && meta.columns[donorEffect.pos]) ? meta.columns[donorEffect.pos] : null;
          const donorText = donorMeta
            ? ('منزلة <strong>' + esc(donorMeta.placeName) + '</strong>')
            : 'المنزلة المجاورة';
          const bar = document.createElement('div');
          bar.className = 'l3-borrow-bar';
          bar.innerHTML = ''
            + '<p class="l3-borrow-explain">في <strong>' + esc(activeMeta.placeName)
            + '</strong>: <bdi class="l1-bdi-nowrap" dir="ltr">' + activeMeta.preBorrowTopDigit + '</bdi> أصغر من <bdi class="l1-bdi-nowrap" dir="ltr">' + botDig
            + '</bdi>، استلف <bdi class="l1-bdi-nowrap" dir="ltr">1</bdi> (بقيمة <bdi class="l1-bdi-nowrap" dir="ltr">10</bdi>) من ' + donorText + '.</p>';
          const bBtn = document.createElement('button');
          bBtn.type = 'button';
          bBtn.className = 'l3-borrow-btn';
          bBtn.textContent = 'إعادة التجميع (استلاف 1)';
          bBtn.addEventListener('click', () => {
            d.borrowedCols[activeCol] = true;
            wrongColPos = -1;
            clearFeedback();
            sound(true, 620);
            saveState();
            draw();
          });
          bar.append(bBtn);
          controlsHost.append(bar);
        } else {
          const kpWrap = document.createElement('div');
          kpWrap.className = 'l3-keypad-wrap';
          const promptLbl = document.createElement('div');
          promptLbl.className = 'l3-keypad-prompt';
          promptLbl.textContent = 'اختر الرقم لنتيجة منزلة ' + activeMeta.placeName + ':';
          kpWrap.append(promptLbl);

          const pad = document.createElement('div');
          pad.className = 'l1-l2-digit-pad';
          for (let k = 0; k <= 9; k++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'l1-l2-digit-key';
            btn.textContent = String(k);
            btn.setAttribute('aria-label', 'الرقم ' + k);
            btn.addEventListener('click', () => handleDigitSubmit(k));
            pad.append(btn);
          }
          kpWrap.append(pad);
          controlsHost.append(kpWrap);
        }
      }
    };

    const handleDigitSubmit = digitVal => {
      const passed = isL2StepPassed(cur) || d.colIndex >= nCols;
      if (passed || stepUi.needsRecharge) return;
      const activeCol = d.colIndex;
      const activeMeta = meta.columns[activeCol];
      if (!activeMeta) return;

      if (meta.op === 'sub' && activeMeta.neededBorrow && !d.borrowedCols[activeCol]) {
        sound(false);
        haptic(false);
        const botDig = activeMeta.bottomDigit === null ? 0 : activeMeta.bottomDigit;
        showFeedback('bad', 'في منزلة ' + activeMeta.placeName + ': ' + activeMeta.preBorrowTopDigit + ' أصغر من ' + botDig + '، اضغط «إعادة التجميع (استلاف)» أولًا.');
        return;
      }

      if (Number(digitVal) === activeMeta.resultDigit) {
        wrongColPos = -1;
        d.enteredDigits[activeCol] = Number(digitVal);
        d.colIndex = activeCol + 1;
        clearFeedback();

        if (d.colIndex >= nCols) {
          recordL2StepPass(cur, d);
          draw();
          showFeedback('good', cur.explainRight || ('أحسنت! الناتج الدقيق هو ' + fmt(meta.exact) + '.'));
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          sound(true, 540);
          saveState();
          draw();
          setPrimaryButtonState('incomplete', 'أكمل المنازل من اليمين لليسار');
        }
      } else {
        wrongColPos = activeCol;
        sound(false);
        haptic(false);
        markL2StepError();
        draw();
        if (meta.op === 'add') {
          const carryHint = activeMeta.carryIn > 0
            ? (' ولا تنسَ إضافة الحمل (' + activeMeta.carryIn + ')')
            : '';
          showFeedback('bad', 'تحقّق من منزلة ' + activeMeta.placeName + ': اجمع أرقام العمود بدقة' + carryHint + '، ثم اكتب رقم الآحاد من المجموع.');
        } else {
          const botDig = activeMeta.bottomDigit === null ? 0 : activeMeta.bottomDigit;
          showFeedback('bad', 'تحقّق من منزلة ' + activeMeta.placeName + ': احسب ' + activeMeta.postBorrowTopDigit + ' - ' + botDig + ' واختر الرقم الصحيح.');
        }
        if (stepUi.needsRecharge) {
          setPrimaryButtonState('wrong');
        }
      }
    };

    if (l3KeyListener) {
      global.removeEventListener('keydown', l3KeyListener);
      l3KeyListener = null;
    }
    l3KeyListener = e => {
      if (document.querySelector('dialog[open]')) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const borrowBtn = controlsHost.querySelector('.l3-borrow-btn');
      if (borrowBtn && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        borrowBtn.click();
        return;
      }
      const norm = normalizeDigits(String(e.key || ''));
      if (/^[0-9]$/.test(norm)) {
        e.preventDefault();
        handleDigitSubmit(Number(norm));
      }
    };
    global.addEventListener('keydown', l3KeyListener);

    draw();
    if (isL2StepPassed(cur) || d.colIndex >= nCols) {
      showFeedback('good', cur.explainRight || ('أحسنت! الناتج الدقيق هو ' + fmt(meta.exact) + '.'));
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState('incomplete', 'أكمل المنازل من اليمين لليسار');
    }
  }

  function renderL3MissingDigitsStep(cur, root) {
    const d = l2StepData(cur);
    if (!d.slotValues || typeof d.slotValues !== 'object') d.slotValues = {};
    const slots = cur.slots || [];
    const passed = isL2StepPassed(cur);
    if (passed) {
      slots.forEach(s => {
        d.slotValues[s.id] = String(s.answer);
      });
    }

    const op0Str = String(cur.topOperands[0]);
    const op1Str = String(cur.topOperands[1]);
    const resStr = String(cur.resultNum);
    const nCols = Math.max(op0Str.length, op1Str.length, resStr.length);
    const carries = cur.carries || {};

    const slotByKey = {};
    slots.forEach(s => {
      slotByKey[s.row + '_' + s.pos] = s;
    });

    const firstEmpty = slots.find(s => !/^[0-9]$/.test(String(d.slotValues[s.id] ?? '')));
    let activeSlotId = firstEmpty ? firstEmpty.id : (slots[0]?.id || null);
    let lastEditedSlotId = null;
    let wrongSlotIds = new Set();

    const boardHost = document.createElement('div');
    const padHost = document.createElement('div');
    root.append(boardHost, padHost);
    l2AppendHintWidget(root, cur, d);

    const allSlotsFilled = () => slots.every(s => /^[0-9]$/.test(String(d.slotValues[s.id] ?? '')));

    const draw = () => {
      const doneNow = passed || isL2StepPassed(cur);
      boardHost.innerHTML = '';
      padHost.innerHTML = '';

      const card = document.createElement('div');
      card.className = 'l3-vop-card';

      const activeSlotObj = slots.find(s => s.id === activeSlotId);
      const head = document.createElement('div');
      head.className = 'l3-vop-head';
      head.innerHTML = ''
        + '<span class="l3-vop-op-pill">استنتاج الأرقام المفقودة</span>'
        + '<span class="l3-vop-col-status' + (doneNow ? ' is-done' : '') + '">'
        + esc(doneNow ? 'تم كشف جميع الأرقام!' : ('المربع المحدد: ' + (activeSlotObj ? activeSlotObj.label : '')))
        + '</span>';
      card.append(head);

      const scrollWrap = document.createElement('div');
      scrollWrap.className = 'l3-vop-board-scroll';
      const grid = document.createElement('div');
      grid.className = 'l3-vop-grid';
      grid.style.gridTemplateColumns = 'minmax(12px, 20px) repeat(' + nCols + ', minmax(0, 1fr))';

      l3AppendPlacePeriodsAndLabels(grid, nCols, activeSlotObj ? activeSlotObj.pos : -1, -1);

      // Carries row
      let regroupHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
      for (let pos = nCols - 1; pos >= 0; pos--) {
        const cVal = carries[pos];
        regroupHtml += '<div class="l3-vop-regroup-cell">'
          + (cVal ? '<span class="l3-vop-regroup-badge">' + cVal + '</span>' : '')
          + '</div>';
      }
      grid.insertAdjacentHTML('beforeend', regroupHtml);

      // Helper to append a grid row cleanly with live interactive slot buttons
      const appendDigitRow = (numStr, rowKey, opSignHtml) => {
        const signDiv = document.createElement('div');
        if (opSignHtml) {
          signDiv.className = 'l3-vop-op-spacer l3-vop-op-sign';
          signDiv.setAttribute('aria-label', 'زائد');
          signDiv.textContent = opSignHtml;
        } else {
          signDiv.className = 'l3-vop-op-spacer';
          signDiv.setAttribute('aria-hidden', 'true');
        }
        grid.append(signDiv);

        for (let pos = nCols - 1; pos >= 0; pos--) {
          const slot = slotByKey[rowKey + '_' + pos];
          if (slot) {
            const cellWrap = document.createElement('div');
            cellWrap.className = rowKey === 'res' ? 'l3-vop-res-cell is-filled' : 'l3-vop-digit';
            const valStr = String(d.slotValues[slot.id] ?? '');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'l3-missing-slot'
              + (!doneNow && activeSlotId === slot.id ? ' is-selected' : '')
              + (doneNow ? ' is-correct' : '')
              + (wrongSlotIds.has(slot.id) ? ' is-wrong' : '');
            btn.disabled = doneNow;
            btn.textContent = valStr !== '' ? valStr : '؟';
            btn.setAttribute('aria-label', slot.label);
            btn.addEventListener('click', () => {
              if (doneNow) return;
              activeSlotId = slot.id;
              wrongSlotIds.delete(slot.id);
              clearFeedback();
              draw();
            });
            cellWrap.append(btn);
            grid.append(cellWrap);
          } else {
            const idxFromRight = numStr.length - 1 - pos;
            const ch = idxFromRight >= 0 ? numStr[numStr.length - 1 - pos] : null;
            const cell = document.createElement('div');
            if (rowKey === 'res') {
              cell.className = 'l3-vop-res-cell is-filled';
              cell.textContent = ch !== null ? ch : '';
            } else {
              cell.className = 'l3-vop-digit' + (ch === null ? ' is-empty' : '');
              cell.textContent = ch !== null ? ch : '0';
            }
            grid.append(cell);
          }
        }
      };

      appendDigitRow(op0Str, 'op0', null);
      appendDigitRow(op1Str, 'op1', '+');

      const divEl = document.createElement('div');
      divEl.className = 'l3-vop-divider';
      divEl.setAttribute('aria-hidden', 'true');
      grid.append(divEl);

      appendDigitRow(resStr, 'res', null);

      scrollWrap.append(grid);
      card.append(scrollWrap);
      boardHost.append(card);

      if (!doneNow) {
        const kpWrap = document.createElement('div');
        kpWrap.className = 'l3-keypad-wrap';
        const promptLbl = document.createElement('div');
        promptLbl.className = 'l3-keypad-prompt';
        promptLbl.textContent = 'املأ: ' + (activeSlotObj ? activeSlotObj.label : '');
        kpWrap.append(promptLbl);

        const pad = document.createElement('div');
        pad.className = 'l1-l2-digit-pad';
        for (let k = 0; k <= 9; k++) {
          const kBtn = document.createElement('button');
          kBtn.type = 'button';
          kBtn.className = 'l1-l2-digit-key';
          kBtn.textContent = String(k);
          kBtn.setAttribute('aria-label', 'الرقم ' + k);
          kBtn.addEventListener('click', () => fillActiveSlot(k));
          pad.append(kBtn);
        }
        kpWrap.append(pad);
        padHost.append(kpWrap);
      }
    };

    const fillActiveSlot = digitVal => {
      if (passed || isL2StepPassed(cur)) return;
      if (!activeSlotId && slots[0]) activeSlotId = slots[0].id;
      if (!activeSlotId) return;
      d.slotValues[activeSlotId] = String(digitVal);
      lastEditedSlotId = activeSlotId;
      wrongSlotIds.delete(activeSlotId);
      clearFeedback();

      const nextEmpty = slots.find(s => s.id !== activeSlotId && !/^[0-9]$/.test(String(d.slotValues[s.id] ?? '')));
      if (nextEmpty) activeSlotId = nextEmpty.id;

      saveState();
      draw();
      setPrimaryButtonState(allSlotsFilled() ? 'ready' : 'incomplete', 'تحقّق');
    };

    if (l3KeyListener) {
      global.removeEventListener('keydown', l3KeyListener);
      l3KeyListener = null;
    }
    l3KeyListener = e => {
      if (document.querySelector('dialog[open]')) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (!passed && !isL2StepPassed(cur) && slots.length) {
          e.preventDefault();
          const curVal = activeSlotId ? String(d.slotValues[activeSlotId] ?? '') : '';
          let targetId = activeSlotId;
          if (!/^[0-9]$/.test(curVal) && e.key === 'Backspace') {
            if (lastEditedSlotId && /^[0-9]$/.test(String(d.slotValues[lastEditedSlotId] ?? ''))) {
              targetId = lastEditedSlotId;
              activeSlotId = targetId;
            } else {
              const curIdx = slots.findIndex(s => s.id === activeSlotId);
              const baseIdx = curIdx >= 0 ? curIdx : 0;
              for (let step = 1; step <= slots.length; step++) {
                const cand = slots[(baseIdx - step + slots.length) % slots.length];
                if (cand && /^[0-9]$/.test(String(d.slotValues[cand.id] ?? ''))) {
                  targetId = cand.id;
                  activeSlotId = targetId;
                  break;
                }
              }
            }
          }
          if (targetId) {
            delete d.slotValues[targetId];
            if (lastEditedSlotId === targetId) lastEditedSlotId = null;
            wrongSlotIds.delete(targetId);
          }
          clearFeedback();
          saveState();
          draw();
          setPrimaryButtonState(allSlotsFilled() ? 'ready' : 'incomplete', 'تحقّق');
        }
        return;
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && slots.length > 1) {
        e.preventDefault();
        const curIdx = Math.max(0, slots.findIndex(s => s.id === activeSlotId));
        const delta = e.key === 'ArrowLeft' ? 1 : -1;
        const nextIdx = (curIdx + delta + slots.length) % slots.length;
        activeSlotId = slots[nextIdx].id;
        draw();
        return;
      }
      const norm = normalizeDigits(String(e.key || ''));
      if (/^[0-9]$/.test(norm)) {
        e.preventDefault();
        fillActiveSlot(Number(norm));
      } else if (e.key === 'Enter' && allSlotsFilled()) {
        e.preventDefault();
        byId('l1-primary-btn')?.click();
      }
    };
    global.addEventListener('keydown', l3KeyListener);

    draw();
    if (passed) {
      showFeedback('good', cur.explainRight || 'إجابة صحيحة!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState(allSlotsFilled() ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (!allSlotsFilled()) return;
      wrongSlotIds = new Set();
      const badLabels = [];
      slots.forEach(s => {
        if (Number(d.slotValues[s.id]) !== s.answer) {
          wrongSlotIds.add(s.id);
          badLabels.push(s.label);
        }
      });

      if (wrongSlotIds.size === 0) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'أحسنت! جميع الأرقام المفقودة صحيحة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        const firstBad = slots.find(s => wrongSlotIds.has(s.id));
        if (firstBad) activeSlotId = firstBad.id;
        sound(false);
        haptic(false);
        markL2StepError();
        draw();
        showFeedback('bad', 'تحقق من: ' + badLabels.join('، ') + '، وتذكّر احتساب الحمل عند الجمع.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      wrongSlotIds = new Set();
      clearFeedback();
      draw();
      setPrimaryButtonState(allSlotsFilled() ? 'ready' : 'incomplete', 'تحقّق');
    };
  }

  function l2EnsureShuffledOptions(cur, d) {
    if (!cur || !Array.isArray(cur.options) || cur.options.length <= 1) return;
    if (cur._optionsShuffled) return;
    const isSymOnly = cur.options.every(it => /^[<>=]+$/.test(String(it.label || '').trim()));
    if (isSymOnly) {
      cur._optionsShuffled = true;
      return;
    }
    const savedOrder = d && Array.isArray(d.optionValuesOrder) ? d.optionValuesOrder : null;
    if (savedOrder && savedOrder.length === cur.options.length) {
      const byVal = new Map();
      cur.options.forEach(it => {
        if (!byVal.has(it.value)) byVal.set(it.value, it);
      });
      if (byVal.size === cur.options.length && savedOrder.every(v => byVal.has(v))) {
        cur.options = savedOrder.map(v => byVal.get(v));
        cur._optionsShuffled = true;
        return;
      }
    }
    const opts = cur.options.slice();
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = opts[i];
      opts[i] = opts[j];
      opts[j] = tmp;
    }
    let rightIdx = opts.findIndex(it => it.value === cur.correctValue);
    if (rightIdx >= 0 && session && typeof session._lastMcqCorrectIdx === 'number' && opts.length > 1) {
      if (rightIdx === session._lastMcqCorrectIdx) {
        const candidates = [];
        for (let i = 0; i < opts.length; i++) {
          if (i !== rightIdx) candidates.push(i);
        }
        const swapWith = candidates[Math.floor(Math.random() * candidates.length)];
        const tmp = opts[rightIdx];
        opts[rightIdx] = opts[swapWith];
        opts[swapWith] = tmp;
        rightIdx = swapWith;
      }
    }
    if (session && rightIdx >= 0) {
      session._lastMcqCorrectIdx = rightIdx;
    }
    cur.options = opts;
    cur._optionsShuffled = true;
    if (d) {
      d.optionValuesOrder = opts.map(it => it.value);
    }
  }

  function renderL2McqStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    l2EnsureShuffledOptions(cur, d);
    const items = cur.options || [];
    let wrongIndices = [];

    const visualMount = document.createElement('div');
    root.append(visualMount);
    let animMountEl = null;
    const drawVisual = isDone => {
      visualMount.innerHTML = '';
      if (cur.visual) {
        l2RenderVisual(cur.visual, visualMount, { passed: isDone });
      }
      if (!cur.visual || cur.animScene) {
        if (!animMountEl) {
          animMountEl = document.createElement('div');
          mountStepConceptAnim(cur, animMountEl);
        }
        if (animMountEl && animMountEl.firstChild) visualMount.append(animMountEl);
      }
    };
    drawVisual(passed);

    const optsMount = document.createElement('div');
    root.append(optsMount);
    l2AppendHintWidget(root, cur, d);

    const useCols2 = items.length >= 4 && items.every(it => String(it.label || '').length <= 22);
    const rightOrigIdx = items.findIndex(it => it.value === cur.correctValue);

    const drawOptions = () => {
      optsMount.innerHTML = '';
      const list = l2CreateRadioOptions({
        items: items.map(it => ({
          label: it.label,
          numeric: typeof it.rawValue === 'number' || (typeof it.value === 'number' && !String(it.label).includes('م'))
        })),
        cols2: useCols2,
        selectedIdx: passed ? rightOrigIdx : stepUi.selectedIdx,
        revealedRightIdx: passed || isL2StepPassed(cur) ? rightOrigIdx : -1,
        wrongIndices,
        disabled: passed || isL2StepPassed(cur),
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          wrongIndices = [];
          clearFeedback();
          drawOptions();
          setPrimaryButtonState('ready', 'تحقّق');
        }
      });
      optsMount.append(list);
    };

    drawOptions();

    if (passed) {
      showFeedback('good', cur.explainRight || 'أحسنت! إجابة صحيحة.');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      const idx = stepUi.selectedIdx;
      const chosen = items[idx];
      if (!chosen) return;
      if (chosen.value === cur.correctValue) {
        recordL2StepPass(cur, d);
        drawVisual(true);
        drawOptions();
        showFeedback('good', cur.explainRight || 'أحسنت! إجابة دقيقة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        wrongIndices = [idx];
        markL2StepError();
        drawOptions();
        showFeedback('bad', cur.explainWrong || 'تحقق من المنازل وحاول مجددًا.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongIndices = [];
      clearFeedback();
      drawOptions();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function renderL2BoardScanStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const cols = cur.placesCols || [];
    const decisiveIdx = Math.max(0, cols.findIndex(c => c.decisive));
    if (passed) {
      d.scannedCount = decisiveIdx + 1;
      d.discoveredDecisive = true;
    }

    const board = document.createElement('div');
    board.className = 'l1-l2-dual-board';
    const scanBar = document.createElement('div');
    scanBar.className = 'l1-l2-scan-bar';
    const scanBtn = document.createElement('button');
    scanBtn.type = 'button';
    scanBtn.className = 'l1-l2-scan-btn';
    scanBtn.textContent = 'فحص من اليسار';
    const status = document.createElement('div');
    status.className = 'l1-l2-scan-status';
    scanBar.append(scanBtn, status);

    let customStatus = '';

    const drawBoard = () => {
      const doneNow = passed || isL2StepPassed(cur);
      const count = Math.max(0, Number(d.scannedCount) || 0);
      board.innerHTML = '';
      cols.forEach((col, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l1-l2-col-btn cycle-' + (col.cycle || 'ones');
        const scanned = idx < count || (d.discoveredDecisive && idx <= decisiveIdx);
        if (scanned) btn.classList.add('is-scanned');
        if (d.discoveredDecisive && col.decisive) btn.classList.add('is-decisive');
        btn.disabled = doneNow;
        btn.title = col.label;
        btn.innerHTML = '<span class="l1-l2-col-title">' + esc(col.shortLabel || col.label) + '</span>'
          + '<span class="l1-l2-col-digits"><span>' + col.d1 + '</span><span>' + col.d2 + '</span></span>';

        btn.addEventListener('click', () => {
          if (doneNow) return;
          customStatus = '';
          if (idx > decisiveIdx && !d.discoveredDecisive) {
            customStatus = 'في المقارنة نبدأ دائمًا من أقصى اليسار (عمود الملايين أولًا)!';
            drawBoard();
            return;
          }
          d.scannedCount = Math.max(count, idx + 1);
          if (idx >= decisiveIdx || col.decisive) {
            d.discoveredDecisive = true;
            setPrimaryButtonState('ready', 'تحقّق');
          }
          saveState();
          drawBoard();
        });
        board.append(btn);
      });

      if (d.discoveredDecisive) {
        const dc = cols[decisiveIdx];
        const maxD = Math.max(dc.d1, dc.d2);
        const minD = Math.min(dc.d1, dc.d2);
        status.innerHTML = 'توقّف الفحص عند «' + esc(dc.label) + '»: <bdi class="l1-bdi-nowrap" dir="ltr">' + maxD + ' &gt; ' + minD + '</bdi>، فلا داعي لفحص المنازل الأصغر!';
        scanBtn.disabled = true;
      } else if (customStatus) {
        status.textContent = customStatus;
      } else if (count === 1) {
        status.innerHTML = l2BidiTextHTML('الملايين متساوية (' + cols[0].d1 + ' = ' + cols[0].d2 + '). اضغط التالي لفحص مئات الألوف!');
      } else {
        status.textContent = 'اضغط «فحص من اليسار» أو المس عمود الملايين للبدء.';
      }
    };

    scanBtn.addEventListener('click', () => {
      if (passed || isL2StepPassed(cur) || d.discoveredDecisive) return;
      customStatus = '';
      const nextCount = Math.min(cols.length, (Number(d.scannedCount) || 0) + 1);
      d.scannedCount = nextCount;
      if (nextCount > decisiveIdx) {
        d.discoveredDecisive = true;
        setPrimaryButtonState('ready', 'تحقّق');
      }
      saveState();
      drawBoard();
    });

    root.append(board, scanBar);
    l2AppendHintWidget(root, cur, d);
    drawBoard();

    if (passed) {
      showFeedback('good', 'ممتاز! تبدأ المقارنة من أقصى اليسار وتتوقف فورًا عند أول اختلاف في «مئات الألوف».');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else if (d.discoveredDecisive) {
      setPrimaryButtonState('ready', 'تحقّق');
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (!d.discoveredDecisive) return;
      recordL2StepPass(cur, d);
      drawBoard();
      showFeedback('good', 'أحسنت! تساوت الملايين (3 = 3) فحسمت منزلة مئات الألوف المقارنة (7 > 4).');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    };

    stepUi.onRetry = () => {
      clearFeedback();
      setPrimaryButtonState(d.discoveredDecisive ? 'ready' : 'incomplete', 'تحقّق');
    };
  }

  function renderL2SymbolCompareStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const syms = [
      { sym: '>', label: 'الأيسر أكبر' },
      { sym: '<', label: 'الأيسر أصغر' },
      { sym: '=', label: 'متساويان' }
    ];
    let wrongSym = null;

    const stage = document.createElement('div');
    stage.className = 'l1-l2-sym-stage';
    const expr = document.createElement('div');
    expr.className = 'l1-l2-sym-expr';
    const row = document.createElement('div');
    row.className = 'l1-l2-sym-row';
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', 'اختر رمز المقارنة');

    let helperBtn = null;
    if (cur.allowDigitCountHelper) {
      helperBtn = document.createElement('button');
      helperBtn.type = 'button';
      helperBtn.className = 'l1-l2-scan-btn';
      helperBtn.textContent = d.showDigitCounts ? 'إخفاء عدد المنازل' : 'عدّ المنازل';
      helperBtn.setAttribute('aria-pressed', d.showDigitCounts ? 'true' : 'false');
      helperBtn.addEventListener('click', () => {
        d.showDigitCounts = !d.showDigitCounts;
        helperBtn.textContent = d.showDigitCounts ? 'إخفاء عدد المنازل' : 'عدّ المنازل';
        helperBtn.setAttribute('aria-pressed', d.showDigitCounts ? 'true' : 'false');
        draw();
      });
    }

    const draw = () => {
      const doneNow = passed || isL2StepPassed(cur);
      const chosen = doneNow ? cur.correct : stepUi.selectedSymbol;
      const lenA = String(cur.numA).length;
      const lenB = String(cur.numB).length;
      const badgeA = d.showDigitCounts ? '<span class="l1-l2-digit-badge">' + ar(lenA) + ' منازل</span>' : '';
      const badgeB = d.showDigitCounts ? '<span class="l1-l2-digit-badge">' + ar(lenB) + ' منازل</span>' : '';
      const slotClass = 'l1-l2-sym-slot'
        + (doneNow ? ' is-correct' : wrongSym ? ' is-wrong' : chosen ? ' is-filled' : '');

      expr.innerHTML = ''
        + '<div class="l1-l2-sym-num-wrap"><span class="l1-l2-sym-num">' + fmt(cur.numA) + '</span>' + badgeA + '</div>'
        + '<span class="' + slotClass + '" aria-live="polite">' + esc(chosen || '؟') + '</span>'
        + '<div class="l1-l2-sym-num-wrap"><span class="l1-l2-sym-num">' + fmt(cur.numB) + '</span>' + badgeB + '</div>';

      row.innerHTML = '';
      const symBtns = [];
      syms.forEach((item, idx) => {
        const isSel = chosen === item.sym;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l1-l2-sym-btn'
          + (isSel ? ' is-selected' : '')
          + (doneNow && item.sym === cur.correct ? ' is-correct' : '')
          + (wrongSym === item.sym ? ' is-wrong' : '');
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', isSel ? 'true' : 'false');
        btn.disabled = doneNow;
        btn.innerHTML = '<bdi dir="ltr">' + esc(item.sym) + '</bdi><small>' + item.label + '</small>';
        btn.addEventListener('click', () => {
          if (doneNow) return;
          stepUi.selectedSymbol = item.sym;
          wrongSym = null;
          clearFeedback();
          draw();
          setPrimaryButtonState('ready', 'تحقّق');
        });
        btn.addEventListener('keydown', e => {
          if (doneNow) return;
          let next = -1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % syms.length;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + syms.length) % syms.length;
          if (next >= 0 && symBtns[next]) {
            e.preventDefault();
            symBtns[next].focus();
            stepUi.selectedSymbol = syms[next].sym;
            wrongSym = null;
            clearFeedback();
            draw();
            setPrimaryButtonState('ready', 'تحقّق');
          }
        });
        symBtns.push(btn);
        row.append(btn);
      });
    };

    stage.append(expr);
    if (helperBtn) {
      const hRow = document.createElement('div');
      hRow.className = 'l1-l2-scan-bar';
      hRow.append(helperBtn);
      stage.append(hRow);
    }
    stage.append(row);
    root.append(stage);
    l2AppendHintWidget(root, cur, d);
    draw();

    if (passed) {
      showFeedback('good', cur.explainRight || Lesson2RunnerDefs.explainComparisonPair(cur.numA, cur.numB));
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (!stepUi.selectedSymbol) return;
      if (stepUi.selectedSymbol === cur.correct) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || Lesson2RunnerDefs.explainComparisonPair(cur.numA, cur.numB));
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        wrongSym = stepUi.selectedSymbol;
        markL2StepError();
        draw();
        showFeedback('bad', Lesson2RunnerDefs.explainComparisonPair(cur.numA, cur.numB) + ' راجع اتجاه فتحة الرمز نحو العدد الأكبر.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedSymbol = null;
      wrongSym = null;
      clearFeedback();
      draw();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function renderL2OrderCardsStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const items = cur.initialItems || [];
    const byIdMap = {};
    items.forEach(it => { byIdMap[it.id] = it; });

    if (!Array.isArray(d.orderIds) || d.orderIds.length !== items.length) {
      d.orderIds = items.map(it => it.id);
    }
    if (passed && Array.isArray(cur.expectedIds)) {
      d.orderIds = cur.expectedIds.slice();
    } else if (passed && cur.direction) {
      d.orderIds = items.slice().sort((a, b) => cur.direction === 'asc' ? a.num - b.num : b.num - a.num).map(it => it.id);
    }

    let selectedId = null;
    let dragSrcIdx = -1;
    let showFeedbackErrorIdx = -1;

    if (cur.showStairVisual) {
      const stairs = document.createElement('div');
      stairs.className = 'l1-l2-stairs';
      stairs.innerHTML = ''
        + '<div class="l1-l2-stair-col"><div class="l1-l2-stair-bar s1"></div><span>الأصغر</span></div>'
        + '<div class="l1-l2-stair-col"><div class="l1-l2-stair-bar s2"></div><span>الأوسط</span></div>'
        + '<div class="l1-l2-stair-col"><div class="l1-l2-stair-bar s3"></div><span>الأكبر</span></div>';
      root.append(stairs);
    }

    let inspectorNote = null;
    if (cur.showPairInspector || cur.allowShuffle) {
      const bar = document.createElement('div');
      bar.className = 'l1-l2-neighbor-bar';
      if (cur.showPairInspector) {
        const countPairs = Math.max(0, d.orderIds.length - 1);
        for (let p = 0; p < countPairs; p++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'l1-l2-neighbor-pill';
          btn.textContent = 'قارن ' + ar(p + 1) + ' مع ' + ar(p + 2);
          btn.addEventListener('click', () => {
            const a = byIdMap[d.orderIds[p]];
            const b = byIdMap[d.orderIds[p + 1]];
            if (a && b && inspectorNote) {
              inspectorNote.hidden = false;
              inspectorNote.innerHTML = l2BidiTextHTML(
                'المرتبة ' + ar(p + 1) + ' و' + ar(p + 2) + ': ' + Lesson2RunnerDefs.explainComparisonPair(a.num, b.num)
              );
            }
          });
          bar.append(btn);
        }
      }
      if (cur.allowShuffle) {
        const shufBtn = document.createElement('button');
        shufBtn.type = 'button';
        shufBtn.className = 'l1-l2-neighbor-pill';
        shufBtn.textContent = 'أعد الخلط';
        shufBtn.disabled = passed;
        shufBtn.addEventListener('click', () => {
          if (passed || isL2StepPassed(cur)) return;
          d.orderIds = d.orderIds.slice().sort(() => Math.random() - 0.5);
          d.interacted = true;
          selectedId = null;
          showFeedbackErrorIdx = -1;
          if (inspectorNote) inspectorNote.hidden = true;
          clearFeedback();
          saveState();
          drawList();
          setPrimaryButtonState('ready', 'تحقّق');
        });
        bar.append(shufBtn);
      }
      root.append(bar);
      if (cur.showPairInspector) {
        inspectorNote = document.createElement('div');
        inspectorNote.className = 'l1-l2-inline-cmp';
        inspectorNote.hidden = true;
        root.append(inspectorNote);
      }
    }

    const listEl = document.createElement('div');
    listEl.className = 'l1-l2-order-list';
    root.append(listEl);
    l2AppendHintWidget(root, cur, d);

    const swapAt = (i, j) => {
      if (i < 0 || j < 0 || i >= d.orderIds.length || j >= d.orderIds.length || i === j) return;
      const tmp = d.orderIds[i];
      d.orderIds[i] = d.orderIds[j];
      d.orderIds[j] = tmp;
      d.interacted = true;
      selectedId = null;
      showFeedbackErrorIdx = -1;
      clearFeedback();
      saveState();
      drawList();
      setPrimaryButtonState('ready', 'تحقّق');
    };

    const drawList = () => {
      const doneNow = passed || isL2StepPassed(cur);
      listEl.innerHTML = '';
      d.orderIds.forEach((id, idx) => {
        const item = byIdMap[id];
        if (!item) return;
        const row = document.createElement('div');
        row.className = 'l1-l2-order-item'
          + (selectedId === id ? ' is-selected' : '')
          + (doneNow ? ' is-correct' : '')
          + (showFeedbackErrorIdx === idx ? ' is-wrong' : '');
        row.draggable = !doneNow;

        row.addEventListener('dragstart', e => {
          if (doneNow) return;
          dragSrcIdx = idx;
          row.classList.add('is-dragging');
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', () => {
          dragSrcIdx = -1;
          row.classList.remove('is-dragging');
        });
        row.addEventListener('dragover', e => {
          if (!doneNow && dragSrcIdx >= 0) e.preventDefault();
        });
        row.addEventListener('drop', e => {
          e.preventDefault();
          if (!doneNow && dragSrcIdx >= 0 && dragSrcIdx !== idx) {
            swapAt(dragSrcIdx, idx);
          }
          dragSrcIdx = -1;
        });

        const selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.className = 'l1-l2-order-select';
        selectBtn.disabled = doneNow;
        selectBtn.setAttribute('aria-pressed', selectedId === id ? 'true' : 'false');
        selectBtn.innerHTML = '<span class="l1-l2-order-rank">' + ar(idx + 1) + '</span>'
          + '<span class="l1-l2-order-main">'
          + '<span class="l1-l2-order-num">' + l2BidiTextHTML(item.label) + '</span>'
          + (item.sub ? '<span class="l1-l2-order-sub">' + l2BidiTextHTML(item.sub) + '</span>' : '')
          + '</span>';
        selectBtn.addEventListener('click', () => {
          if (doneNow) return;
          if (!selectedId) {
            selectedId = id;
            drawList();
          } else if (selectedId === id) {
            selectedId = null;
            drawList();
          } else {
            const firstIdx = d.orderIds.indexOf(selectedId);
            swapAt(firstIdx, idx);
          }
        });

        const actions = document.createElement('div');
        actions.className = 'l1-l2-order-actions';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'l1-l2-order-move-btn';
        upBtn.innerHTML = l2SvgArrow('up');
        upBtn.disabled = doneNow || idx === 0;
        upBtn.setAttribute('aria-label', 'نقل ' + item.label + ' للأعلى');
        upBtn.addEventListener('click', () => swapAt(idx, idx - 1));

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'l1-l2-order-move-btn';
        downBtn.innerHTML = l2SvgArrow('down');
        downBtn.disabled = doneNow || idx === d.orderIds.length - 1;
        downBtn.setAttribute('aria-label', 'نقل ' + item.label + ' للأسفل');
        downBtn.addEventListener('click', () => swapAt(idx, idx + 1));

        actions.append(upBtn, downBtn);
        row.append(selectBtn, actions);
        listEl.append(row);
      });
    };

    drawList();

    if (passed) {
      showFeedback('good', cur.explainRight || 'ترتيب متقن!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else if (d.interacted) {
      setPrimaryButtonState('ready', 'تحقّق');
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (!d.interacted) return;
      const orderedItems = d.orderIds.map(id => byIdMap[id]);
      let ok = true;
      let badPairIdx = -1;
      if (Array.isArray(cur.expectedIds)) {
        ok = d.orderIds.every((id, i) => id === cur.expectedIds[i]);
      }
      if (!ok || !Array.isArray(cur.expectedIds)) {
        for (let i = 0; i < orderedItems.length - 1; i++) {
          const curVal = orderedItems[i].num;
          const nextVal = orderedItems[i + 1].num;
          const pairOk = cur.direction === 'desc' ? curVal >= nextVal : curVal <= nextVal;
          if (!pairOk) {
            ok = false;
            badPairIdx = i;
            break;
          }
        }
      }
      if (ok) {
        recordL2StepPass(cur, d);
        drawList();
        showFeedback('good', cur.explainRight || 'ممتاز! ترتيبك صحيح بالكامل.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        showFeedbackErrorIdx = badPairIdx;
        markL2StepError();
        drawList();
        const diag = badPairIdx >= 0
          ? 'لاحظ البطاقتين ' + ar(badPairIdx + 1) + ' و' + ar(badPairIdx + 2) + ': ' + Lesson2RunnerDefs.explainComparisonPair(orderedItems[badPairIdx].num, orderedItems[badPairIdx + 1].num)
          : (cur.explainWrong || 'راجع القيمة المنزلية وأعد ترتيب البطاقات.');
        showFeedback('bad', diag);
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      showFeedbackErrorIdx = -1;
      selectedId = null;
      clearFeedback();
      drawList();
      setPrimaryButtonState('ready', 'تحقّق');
    };
  }

  function renderL2MissingDigitStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    if (passed && !/^[0-9]$/.test(String(d.digit ?? ''))) {
      for (let test = 0; test <= 9; test++) {
        if (cur.validateDigit(test)) {
          d.digit = String(test);
          break;
        }
      }
    }

    const card = document.createElement('div');
    card.className = 'l1-l2-missing-card';
    const expr = document.createElement('div');
    expr.className = 'l1-l2-missing-expr';

    const leftSpan = document.createElement('span');
    leftSpan.textContent = fmt(cur.leftVal);
    const cmpSpan = document.createElement('span');
    cmpSpan.textContent = cur.cmp;

    const patternWrap = document.createElement('span');
    patternWrap.className = 'l1-l2-missing-pattern';
    const preSpan = document.createElement('span');
    preSpan.textContent = cur.prefix || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'l1-l2-digit-input';
    input.inputMode = 'numeric';
    input.maxLength = 2;
    input.setAttribute('aria-label', 'الرقم المفقود في منزلة ' + (cur.placeName || 'المطلوبة'));
    input.value = /^[0-9]$/.test(String(d.digit ?? '')) ? String(d.digit) : '';
    input.disabled = passed;
    const sufSpan = document.createElement('span');
    sufSpan.textContent = cur.suffix || '';

    patternWrap.append(preSpan, input, sufSpan);
    expr.append(leftSpan, cmpSpan, patternWrap);

    const placeHint = document.createElement('span');
    placeHint.className = 'l1-subtext';
    placeHint.textContent = 'المنزلة المفقودة: ' + (cur.placeName || '');

    card.append(expr, placeHint);

    const pad = document.createElement('div');
    pad.className = 'l1-l2-digit-pad';
    const padBtns = [];

    const syncPad = () => {
      const doneNow = passed || isL2StepPassed(cur);
      const curDig = String(d.digit ?? '');
      padBtns.forEach((btn, num) => {
        const isSel = curDig === String(num);
        btn.classList.toggle('is-selected', isSel);
        btn.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        btn.disabled = doneNow;
      });
    };

    const setDigitVal = raw => {
      if (passed || isL2StepPassed(cur)) return;
      const digits = normalizeDigits(String(raw ?? '')).replace(/\D/g, '');
      const ch = digits ? digits[digits.length - 1] : '';
      d.digit = ch;
      input.value = ch;
      input.removeAttribute('aria-invalid');
      clearFeedback();
      saveState();
      syncPad();
      setPrimaryButtonState(/^[0-9]$/.test(ch) ? 'ready' : 'incomplete', 'تحقّق');
    };

    for (let k = 0; k <= 9; k++) {
      const keyBtn = document.createElement('button');
      keyBtn.type = 'button';
      keyBtn.className = 'l1-l2-digit-key';
      keyBtn.textContent = String(k);
      keyBtn.setAttribute('aria-label', 'الرقم ' + k);
      keyBtn.addEventListener('click', () => setDigitVal(String(k)));
      padBtns.push(keyBtn);
      pad.append(keyBtn);
    }

    input.addEventListener('input', () => setDigitVal(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btn = byId('l1-primary-btn');
        if (btn && !btn.disabled) btn.click();
      }
    });

    root.append(card, pad);
    l2AppendHintWidget(root, cur, d);
    syncPad();

    if (passed) {
      showFeedback('good', cur.explainRight || 'إجابة صحيحة!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState(/^[0-9]$/.test(String(d.digit ?? '')) ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (!/^[0-9]$/.test(String(d.digit ?? ''))) return;
      const numDig = Number(d.digit);
      if (cur.validateDigit(numDig)) {
        recordL2StepPass(cur, d);
        input.disabled = true;
        syncPad();
        showFeedback('good', cur.explainRight || 'إجابة صحيحة!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        input.setAttribute('aria-invalid', 'true');
        markL2StepError();
        const built = typeof cur.buildNumber === 'function' ? cur.buildNumber(numDig) : null;
        const msg = built !== null
          ? 'إذا وضعنا ' + numDig + ' يصبح العدد ' + fmt(built) + '. ' + Lesson2RunnerDefs.explainComparisonPair(cur.leftVal, built)
          : 'هذا الرقم لا يحقق الإشارة المطلوبة؛ جرّب رقمًا آخر.';
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      input.removeAttribute('aria-invalid');
      clearFeedback();
      input.focus();
      setPrimaryButtonState(/^[0-9]$/.test(String(d.digit ?? '')) ? 'ready' : 'incomplete', 'تحقّق');
    };
  }

  function renderL2NumericBaseStep(cur, root, opts) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    if (typeof opts.renderVisual === 'function') opts.renderVisual(passed, d);

    const wrap = document.createElement('div');
    wrap.className = 'l1-input-wrap';
    const inputId = 'l2-num-input-' + String(cur.key || 'step');
    const lbl = document.createElement('label');
    lbl.className = 'l1-input-label';
    lbl.setAttribute('for', inputId);
    lbl.textContent = opts.inputLabel || 'أدخل العدد بالأرقام القياسية:';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.className = 'l1-num-input' + (passed ? ' is-good' : '');
    input.inputMode = 'numeric';
    input.dir = 'ltr';
    input.maxLength = 18;
    input.placeholder = cur.placeholder || 'أدخل العدد بالأرقام';
    input.value = passed
      ? fmt(opts.passedDisplayVal !== undefined ? opts.passedDisplayVal(d) : cur.targetVal)
      : String(d.rawInput || '');
    input.disabled = passed;

    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      d.rawInput = input.value;
      clearFeedback();
      const parsed = l2ParseIntInput(input.value);
      if (typeof opts.onPreview === 'function') opts.onPreview(input.value, parsed);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete', 'تحقّق');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btn = byId('l1-primary-btn');
        if (btn && !btn.disabled) btn.click();
      }
    });

    wrap.append(lbl, input);
    root.append(wrap);
    l2AppendHintWidget(root, cur, d);

    if (passed) {
      showFeedback('good', cur.explainRight || 'إجابة صحيحة!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      const parsed = l2ParseIntInput(input.value);
      setPrimaryButtonState(parsed !== null ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      const cleaned = normalizeDigits(String(input.value || '')).replace(/[,\s٬،_]/g, '');
      const parsed = l2ParseIntInput(input.value);
      if (parsed === null) return;
      const result = opts.validate(parsed, cleaned, d);
      if (result.ok) {
        d.acceptedVal = parsed;
        input.value = fmt(parsed);
        input.disabled = true;
        input.classList.add('is-good');
        if (typeof opts.onPass === 'function') opts.onPass(parsed);
        recordL2StepPass(cur, d);
        showFeedback('good', cur.explainRight || 'إجابة صحيحة!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        input.setAttribute('aria-invalid', 'true');
        markL2StepError();
        showFeedback('bad', result.msg || cur.explainWrong || 'تحقق من القيمة وأعد المحاولة.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      input.removeAttribute('aria-invalid');
      clearFeedback();
      input.focus();
      setPrimaryButtonState(l2ParseIntInput(input.value) !== null ? 'ready' : 'incomplete', 'تحقّق');
    };
  }

  function renderL2NumInputStep(cur, root) {
    renderL2NumericBaseStep(cur, root, {
      renderVisual: () => {
        if (cur.displayText) {
          const card = document.createElement('div');
          card.className = 'l1-num-card';
          card.innerHTML = '<div class="l1-big-num" dir="ltr">' + esc(cur.displayText) + '</div>';
          root.append(card);
        } else if (cur.quoteText) {
          const quote = document.createElement('div');
          quote.className = 'l1-word-quote';
          quote.textContent = cur.quoteText;
          root.append(quote);
        }
      },
      validate: parsed => ({
        ok: parsed === cur.targetVal,
        msg: cur.explainWrong
      })
    });
  }

  function renderL2PatternInputStep(cur, root) {
    const strip = document.createElement('div');
    strip.className = 'l1-l2-pattern-strip';
    root.append(strip);

    let missingChip = null;
    const buildStrip = (isDone, previewVal) => {
      strip.innerHTML = '';
      missingChip = null;
      (cur.items || []).forEach(it => {
        const chip = document.createElement('span');
        if (it.missing) {
          chip.className = 'l1-l2-pat-chip is-missing';
          chip.textContent = isDone ? fmt(cur.targetVal) : (previewVal !== null ? fmt(previewVal) : '؟');
          missingChip = chip;
        } else if (it.maskedLabel) {
          chip.className = 'l1-l2-pat-chip is-masked';
          chip.textContent = it.maskedLabel;
        } else {
          chip.className = 'l1-l2-pat-chip';
          chip.textContent = fmt(it.val);
        }
        strip.append(chip);
      });
    };

    renderL2NumericBaseStep(cur, root, {
      inputLabel: 'أدخل العدد المفقود في النمط:',
      renderVisual: isDone => buildStrip(isDone, null),
      onPreview: (_raw, parsed) => {
        if (missingChip) missingChip.textContent = parsed !== null ? fmt(parsed) : '؟';
      },
      onPass: parsed => {
        if (missingChip) missingChip.textContent = fmt(parsed);
      },
      validate: parsed => ({
        ok: parsed === cur.targetVal,
        msg: cur.explainWrong
      })
    });
  }

  function renderL2OpenRangeInputStep(cur, root) {
    const strip = document.createElement('div');
    strip.className = 'l1-l2-range-strip';
    root.append(strip);
    let midChip = null;

    const buildRange = val => {
      strip.innerHTML = '';
      const a = document.createElement('span');
      a.textContent = fmt(cur.minExclusive);
      const lt1 = document.createElement('span');
      lt1.textContent = '<';
      midChip = document.createElement('span');
      midChip.className = 'l1-l2-pat-chip is-missing';
      midChip.textContent = val !== null && val !== undefined ? fmt(val) : '؟';
      const lt2 = document.createElement('span');
      lt2.textContent = '<';
      const b = document.createElement('span');
      b.textContent = fmt(cur.maxExclusive);
      strip.append(a, lt1, midChip, lt2, b);
    };

    renderL2NumericBaseStep(cur, root, {
      inputLabel: 'اكتب أي عدد صحيح بين العددين:',
      passedDisplayVal: d => d.acceptedVal || (cur.minExclusive + 1),
      renderVisual: (isDone, d) => buildRange(isDone ? (d.acceptedVal || (cur.minExclusive + 1)) : null),
      onPreview: (_raw, parsed) => {
        if (midChip) midChip.textContent = parsed !== null ? fmt(parsed) : '؟';
      },
      onPass: parsed => {
        if (midChip) midChip.textContent = fmt(parsed);
      },
      validate: (parsed, cleaned) => {
        if (cur.requiredDigits && (String(parsed).length !== cur.requiredDigits || cleaned.startsWith('0'))) {
          return { ok: false, msg: 'يجب أن يتكوّن العدد من ' + ar(cur.requiredDigits) + ' أرقام دون أصفار زائدة في البداية.' };
        }
        if (parsed <= cur.minExclusive || parsed >= cur.maxExclusive) {
          return { ok: false, msg: cur.explainWrong };
        }
        return { ok: true };
      }
    });
  }

  function renderL2ExitMcqStep(cur, root) {
    const d = l2StepData(cur);
    const isU2L1 = Boolean(session && session.lesson === 7);
    const isL5 = Boolean(session && session.lesson === 5);
    const isL4 = Boolean(session && session.lesson === 4);
    const isL3 = Boolean(session && session.lesson === 3);
    const rec = l2Record(isU2L1 ? 10 : (isL5 ? 9 : (isL4 ? 13 : (isL3 ? 15 : 14))));
    l2EnsureShuffledOptions(cur, d);
    const items = cur.options || [];
    const passed = isL2StepPassed(cur);
    const symOnly = items.length === 3 && items.every(it => /^[<>=]+$/.test(String(it.label || '').trim()));
    const rightIdx = items.findIndex(it => it.value === cur.correctValue);

    let pairMount = null;
    if (cur.comparePair) {
      pairMount = document.createElement('div');
      pairMount.className = 'l1-l2-sym-expr' + (cur.comparePair.isErrorQuote ? ' is-error-quote' : '');
      pairMount.dir = 'ltr';
      root.append(pairMount);
    }

    const exitAnimMount = document.createElement('div');
    root.append(exitAnimMount);
    mountStepConceptAnim(cur, exitAnimMount);

    const optsMount = document.createElement('div');
    root.append(optsMount);

    const allNumericOpts = !symOnly
      && items.length > 0
      && items.every(it => /^[0-9<>=,.\s]+$/.test(String(it.label || '').trim()));
    const allDigitOpts = !symOnly
      && items.length > 0
      && items.every(it => /^\d+$/.test(String(it.label || '').trim()));

    const draw = () => {
      optsMount.innerHTML = '';
      const locked = Boolean(d.locked || passed);
      const chosenIdx = locked && d.chosenValue !== undefined
        ? items.findIndex(it => it.value === d.chosenValue)
        : stepUi.selectedIdx;
      const wrongArr = locked && chosenIdx >= 0 && chosenIdx !== rightIdx ? [chosenIdx] : [];
      if (pairMount && cur.comparePair) {
        let slotText = '؟';
        let slotCls = 'l1-l2-sym-slot';
        if (cur.comparePair.slot) {
          const symChosen = chosenIdx >= 0 && items[chosenIdx]
            ? items[chosenIdx].value
            : (locked && d.wasCorrect !== false ? cur.correctValue : '');
          slotText = symChosen || '؟';
          if (locked) {
            slotCls += d.wasCorrect === false ? ' is-wrong' : ' is-correct';
          } else if (symChosen) {
            slotCls += ' is-filled';
          }
        } else if (cur.comparePair.sym) {
          slotText = cur.comparePair.sym;
          slotCls += ' is-static';
        }
        const digitChosen = !cur.comparePair.slot && allDigitOpts
          ? (chosenIdx >= 0 && items[chosenIdx]
            ? String(items[chosenIdx].label || '').trim()
            : (locked && d.wasCorrect !== false ? String(cur.correctValue || '') : ''))
          : '';
        const formatPairSide = raw => {
          const str = String(raw || '');
          if (!str.includes('□')) return esc(str);
          let boxCls = 'l1-l2-inline-box';
          if (locked) {
            boxCls += d.wasCorrect === false ? ' is-wrong' : ' is-correct';
          } else if (digitChosen) {
            boxCls += ' is-filled';
          }
          const boxHtml = '<span class="' + boxCls + '" aria-label="الرقم المفقود">'
            + esc(digitChosen || '؟')
            + '</span>';
          return str.split('□').map(part => esc(part)).join(boxHtml);
        };
        pairMount.innerHTML = ''
          + '<div class="l1-l2-sym-num-wrap"><span class="l1-l2-sym-num" dir="ltr">' + formatPairSide(cur.comparePair.left) + '</span></div>'
          + '<span class="' + slotCls + '" aria-live="polite">' + esc(slotText) + '</span>'
          + '<div class="l1-l2-sym-num-wrap"><span class="l1-l2-sym-num" dir="ltr">' + formatPairSide(cur.comparePair.right) + '</span></div>';
      }
      const list = l2CreateRadioOptions({
        items: items.map(it => ({ label: it.label, numeric: symOnly || allNumericOpts })),
        cols3: symOnly,
        cols2: allDigitOpts && items.length === 4,
        selectedIdx: chosenIdx,
        revealedRightIdx: locked ? rightIdx : -1,
        wrongIndices: wrongArr,
        disabled: locked,
        onSelect: idx => {
          if (locked) return;
          stepUi.selectedIdx = idx;
          clearFeedback();
          draw();
          setPrimaryButtonState('ready', 'تحقّق');
        }
      });
      optsMount.append(list);
    };

    draw();

    const isLast = session && session.index >= session.steps.length - 1;
    if (passed || d.locked) {
      if (d.wasCorrect === false) {
        showFeedback('bad', (cur.reason || cur.explainRight || 'إجابة غير دقيقة.') + ' يمكنك التدرب على هذه المهارة بعد إنهاء البطاقة.');
      } else {
        showFeedback('good', cur.reason || cur.explainRight || 'أحسنت!');
      }
      setPrimaryButtonState('explanation', isLast ? 'عرض النتيجة' : 'متابعة');
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      const chosen = items[stepUi.selectedIdx];
      if (!chosen) return;
      const ok = chosen.value === cur.correctValue;
      d.locked = true;
      d.chosenValue = chosen.value;
      d.wasCorrect = ok;

      if (session.remedial) {
        session.remedialPassed = session.remedialPassed || new Set();
        session.remedialPassed.add(cur.key);
        session.remedialResponses = session.remedialResponses || [];
        session.remedialResponses.push({ skill: cur.skill, ok });
      } else if (rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        rec.data.skills[cur.skill] = ok;
        rec.passed.add(session.index);
      }

      if (ok) {
        sound(true);
        haptic(true);
        showFeedback('good', cur.reason || cur.explainRight || 'إجابة متقنة!');
      } else {
        sound(false);
        haptic(false);
        markL2StepError();
        showFeedback('bad', (cur.reason || cur.explainWrong || 'تحتاج لمراجعة هذه المهارة.') + ' ستتاح لك أسئلة علاجية لإتقانها.');
      }

      saveState();
      draw();
      setPrimaryButtonState('explanation', isLast ? 'عرض النتيجة' : 'متابعة');
    };
  }

  function showLesson2ResultScreen(cfg) {
    lastActiveLesson = 2;
    state.runnerStep = null;
    state.mapSubView = 'lesson2';
    state.viewMode = 'result';
    saveState();

    const labBtn = byId('l2-shell-lab-btn');
    if (labBtn) labBtn.hidden = true;
    const card = byId('l1-result-card');
    if (card) {
      const metricsHTML = (cfg.metrics || [])
        .map(m => '<div class="l1-result-metric"><strong>' + l2BidiTextHTML(m.value) + '</strong><small>' + esc(m.label) + '</small></div>')
        .join('');

      const skillsHTML = Array.isArray(cfg.skills) && cfg.skills.length
        ? '<div class="l1-et-breakdown">'
          + cfg.skills.map(sk => '<div class="l1-et-skill-row ' + (sk.ok ? 'is-passed' : 'is-failed') + '"><span>' + esc(sk.label) + '</span><span class="l1-l2-et-badge">' + (sk.ok ? 'أتقنتها' : 'تحتاج تدريبًا') + '</span></div>').join('')
          + '</div>'
        : '';

      card.innerHTML = ''
        + '<div class="l1-result-badge">' + l2SvgCheck(cfg.ok !== false) + '</div>'
        + '<h2 class="l1-result-title">' + esc(cfg.title || '') + '</h2>'
        + '<p class="l1-result-sub">' + esc(cfg.subtitle || '') + '</p>'
        + '<div class="l1-result-metrics">' + metricsHTML + '</div>'
        + skillsHTML
        + '<div class="l1-result-actions">'
        + '<button type="button" class="l1-primary-btn state-ready" id="l2-res-primary">' + esc(cfg.primaryLabel || 'متابعة') + '</button>'
        + (cfg.secondaryLabel ? '<button type="button" class="l1-secondary-btn" id="l2-res-secondary">' + esc(cfg.secondaryLabel) + '</button>' : '')
        + '</div>';

      byId('l2-res-primary')?.addEventListener('click', () => {
        if (typeof cfg.onPrimary === 'function') cfg.onPrimary();
      });
      byId('l2-res-secondary')?.addEventListener('click', () => {
        if (typeof cfg.onSecondary === 'function') cfg.onSecondary();
      });
    }

    setUiMode('result');
    if (typeof updateLesson2Badges === 'function') updateLesson2Badges();
    const heading = card?.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  function evaluateLesson2Station15Screen() {
    const rec = l2Record(14);
    const defs = Lesson2RunnerDefs.L2_MASTERY_QUESTIONS || [];
    const skillsMap = (rec && rec.data && rec.data.skills) || {};
    const rows = defs.map(q => ({
      skill: q.skill,
      label: q.skillLabel,
      ok: Boolean(skillsMap[q.skill])
    }));
    const unmastered = rows.filter(r => !r.ok);
    const masteredCount = rows.length - unmastered.length;
    const nodeDef = typeof L2_NODES !== 'undefined' ? L2_NODES[14] : null;
    const pts = nodeDef ? nodeDef.points : 40;

    if (unmastered.length === 0) {
      const hadRem = Boolean(rec && rec.data && rec.data.remedialRound);
      const stars = !hadRem && (!rec || !rec.errors) ? 3 : 2;
      const res = typeof completeLesson2Station === 'function'
        ? completeLesson2Station(14, pts, stars)
        : { wasDone: false, earnedStars: stars };
      session = null;
      showLesson2ResultScreen({
        ok: true,
        title: 'أحسنت! أتقنت التحدي النهائي للدرس الثاني',
        subtitle: res.wasDone
          ? 'حافظت على إتقان جميع المهارات الثماني بنجاح.'
          : 'أنهيت جميع مهارات مقارنة الأعداد وترتيبها بإتقان كامل!',
        metrics: [
          { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
          { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(pts), label: 'النقاط المكتسبة' },
          { value: ar(rows.length) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' }
        ],
        skills: rows,
        primaryLabel: 'العودة لخريطة الدرس الثاني',
        onPrimary: () => closeToMap(2),
        secondaryLabel: 'إعادة التحدي',
        onSecondary: () => openLesson2Node(14, { forceReset: true })
      });
    } else {
      const nextRound = (rec && rec.data && Number(rec.data.remedialRound) || 0) + 1;
      session = null;
      showLesson2ResultScreen({
        ok: false,
        title: 'بقيت ' + ar(unmastered.length) + ' مهارات لإتقان التحدي',
        subtitle: 'سنتدرب الآن على سؤالين جديدين لكل مهارة متبقية قبل إغلاق المحطة.',
        metrics: [
          { value: ar(masteredCount) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' },
          { value: ar(unmastered.length), label: 'تحتاج تدريبًا' },
          { value: '0', label: 'نقاط بانتظار الإتقان' }
        ],
        skills: rows,
        primaryLabel: 'تدريب المهارات المتبقية (' + ar(unmastered.length) + ')',
        onPrimary: () => openLesson2Remedial(unmastered, nextRound),
        secondaryLabel: 'العودة لخريطة الدرس الثاني',
        onSecondary: () => closeToMap(2)
      });
    }
  }

  function finishLesson2Session() {
    const s = session;
    if (!s) return;

    if (s.nodeId === 14) {
      const rec = l2Record(14);
      if (s.remedial && rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        const bySkill = {};
        (s.remedialResponses || []).forEach(r => {
          bySkill[r.skill] = bySkill[r.skill] || [];
          bySkill[r.skill].push(Boolean(r.ok));
        });
        Object.keys(bySkill).forEach(sk => {
          const arr = bySkill[sk];
          if (arr.length > 0 && arr.every(Boolean)) {
            rec.data.skills[sk] = true;
          }
        });
        rec.data.remedialRound = (Number(rec.data.remedialRound) || 0) + 1;
        saveState();
      }
      evaluateLesson2Station15Screen();
      return;
    }

    const rec = l2Record(s.nodeId);
    const errCount = rec ? (Number(rec.errors) || 0) : (Number(s.errors) || 0);
    let stars = errCount === 0 ? 3 : (errCount <= 2 ? 2 : 1);
    if (rec && rec.assistedSteps && rec.assistedSteps.size > 0) {
      stars = Math.min(2, stars);
    }

    const res = typeof completeLesson2Station === 'function'
      ? completeLesson2Station(s.nodeId, s.points, stars)
      : { wasDone: false, earnedStars: stars };

    const totalNodes = typeof L2_NODES !== 'undefined' ? L2_NODES.length : 15;
    const nextId = s.nodeId + 1;
    const canGoNext = nextId < totalNodes && (typeof isLesson2NodeUnlocked !== 'function' || isLesson2NodeUnlocked(nextId));
    const finishedNodeId = s.nodeId;
    const finishedTitle = s.title;
    const finishedPts = s.points;
    session = null;

    showLesson2ResultScreen({
      ok: true,
      title: 'أحسنت! أتممت «' + finishedTitle + '»',
      subtitle: res.wasDone
        ? 'مراجعة موفقة؛ تم حفظ أدائك دون تكرار النقاط.'
        : 'أكملت جميع خطوات المحطة بنجاح وفتحت المسار التالي.',
      metrics: [
        { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
        { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(finishedPts), label: 'النقاط' },
        { value: ar(errCount), label: 'محاولات تصحيح' }
      ],
      primaryLabel: canGoNext ? 'المحطة التالية' : 'العودة لخريطة الدرس الثاني',
      onPrimary: () => canGoNext ? openLesson2Node(nextId) : closeToMap(2),
      secondaryLabel: canGoNext ? 'العودة لخريطة الدرس الثاني' : 'إعادة المحطة',
      onSecondary: () => canGoNext ? closeToMap(2) : openLesson2Node(finishedNodeId, { forceReset: true })
    });
  }

  function openLesson2Node(nodeId, options) {
    if (typeof Lesson2RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();

    if (nodeId !== 14 && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 2, nodeId, openOptions: options });
    }

    const st2 = typeof getLesson2State === 'function' ? getLesson2State() : null;
    const rec = l2Record(nodeId);
    const totalSteps = Lesson2RunnerDefs.getStepCount(nodeId);
    const doneCol = st2 && (st2.completedNodes !== undefined ? st2.completedNodes : st2.completed);
    const alreadyDone = Boolean(doneCol && (typeof doneCol.has === 'function' ? doneCol.has(nodeId) : Array.isArray(doneCol) && doneCol.includes(nodeId)));

    if (nodeId === 14 && !options?.forceReset && !options?.review && !options?.preserveProgress && !alreadyDone) {
      if (rec && rec.passed && rec.passed.size >= totalSteps && rec.data && rec.data.skills) {
        evaluateLesson2Station15Screen();
        return true;
      }
    }

    if ((options?.forceReset || options?.review || alreadyDone) && !options?.preserveProgress) {
      if (typeof resetLesson2NodeRecordForReplay === 'function') {
        resetLesson2NodeRecordForReplay(nodeId);
      }
    }

    const built = Lesson2RunnerDefs.buildLesson2Session(nodeId, { ...options, forceReset: Boolean(options?.forceReset || alreadyDone) });
    if (!built) return false;
    session = built;
    lastActiveLesson = 2;
    state.mapSubView = 'lesson2';
    state.viewMode = 'lesson2';
    setUiMode('learning');
    persistRunnerPosition();
    renderStep();
    return true;
  }

  function openLesson2Remedial(unmasteredList, roundNum) {
    if (typeof Lesson2RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();
    if ((state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 2, nodeId: 14, remedialLaunch: { unmasteredList, roundNum } });
    }
    const built = Lesson2RunnerDefs.buildLesson2RemedialSession(unmasteredList, roundNum);
    if (!built) {
      evaluateLesson2Station15Screen();
      return false;
    }
    session = built;
    lastActiveLesson = 2;
    state.mapSubView = 'lesson2';
    state.viewMode = 'lesson2';
    setUiMode('learning');
    renderStep();
    return true;
  }

  /* ---------------- Lesson 3 & 4 Shared Result Card, Exit Ticket & Session Openers ---------------- */
  function renderMultiLessonResultCard(cfg, badgeUpdater) {
    ['l2-shell-lab-btn', 'l3-shell-lab-btn', 'l4-shell-lab-btn', 'l5-shell-lab-btn', 'u2l1-shell-lab-btn'].forEach(id => {
      const btn = byId(id);
      if (btn) btn.hidden = true;
    });

    const card = byId('l1-result-card');
    if (card) {
      const metricsHTML = (cfg.metrics || [])
        .map(m => '<div class="l1-result-metric"><strong>' + l2BidiTextHTML(m.value) + '</strong><small>' + esc(m.label) + '</small></div>')
        .join('');

      const skillsHTML = Array.isArray(cfg.skills) && cfg.skills.length
        ? '<div class="l1-et-breakdown">'
          + cfg.skills.map(sk => '<div class="l1-et-skill-row ' + (sk.ok ? 'is-passed' : 'is-failed') + '"><span>' + esc(sk.label) + '</span><span class="l1-l2-et-badge">' + (sk.ok ? 'أتقنتها' : 'تحتاج تدريبًا') + '</span></div>').join('')
          + '</div>'
        : '';

      card.innerHTML = ''
        + '<div class="l1-result-badge">' + l2SvgCheck(cfg.ok !== false) + '</div>'
        + '<h2 class="l1-result-title">' + esc(cfg.title || '') + '</h2>'
        + '<p class="l1-result-sub">' + esc(cfg.subtitle || '') + '</p>'
        + '<div class="l1-result-metrics">' + metricsHTML + '</div>'
        + skillsHTML
        + '<div class="l1-result-actions">'
        + '<button type="button" class="l1-primary-btn state-ready" id="l3-res-primary">' + esc(cfg.primaryLabel || 'متابعة') + '</button>'
        + (cfg.secondaryLabel ? '<button type="button" class="l1-secondary-btn" id="l3-res-secondary">' + esc(cfg.secondaryLabel) + '</button>' : '')
        + '</div>';

      byId('l3-res-primary')?.addEventListener('click', () => {
        if (typeof cfg.onPrimary === 'function') cfg.onPrimary();
      });
      byId('l3-res-secondary')?.addEventListener('click', () => {
        if (typeof cfg.onSecondary === 'function') cfg.onSecondary();
      });
    }

    setUiMode('result');
    if (typeof badgeUpdater === 'function') badgeUpdater();
    const heading = card?.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  function showLesson3ResultScreen(cfg) {
    lastActiveLesson = 3;
    state.runnerStep = null;
    state.mapSubView = 'lesson3';
    state.viewMode = 'result';
    saveState();
    renderMultiLessonResultCard(cfg, () => {
      if (typeof updateLesson3Badges === 'function') updateLesson3Badges();
    });
  }

  function showLesson4ResultScreen(cfg) {
    lastActiveLesson = 4;
    state.runnerStep = null;
    state.mapSubView = 'lesson4';
    state.viewMode = 'result';
    saveState();
    renderMultiLessonResultCard(cfg, () => {
      if (typeof updateLesson4Badges === 'function') updateLesson4Badges();
    });
  }

  function evaluateLesson3Station16Screen() {
    const rec = typeof getLesson3NodeRecord === 'function' ? getLesson3NodeRecord(15) : null;
    const defs = Lesson3RunnerDefs.L3_MASTERY_QUESTIONS || [];
    const skillsMap = (rec && rec.data && rec.data.skills) || {};
    const rows = defs.map(q => ({
      skill: q.skill,
      label: q.skillLabel,
      ok: Boolean(skillsMap[q.skill])
    }));
    const unmastered = rows.filter(r => !r.ok);
    const masteredCount = rows.length - unmastered.length;
    const nodeDef = typeof L3_NODES !== 'undefined' ? L3_NODES[15] : null;
    const pts = nodeDef ? nodeDef.points : 35;

    if (unmastered.length === 0) {
      const hadRem = Boolean(rec && rec.data && rec.data.remedialRound);
      const stars = !hadRem && (!rec || !rec.errors) ? 3 : 2;
      const res = typeof completeLesson3Station === 'function'
        ? completeLesson3Station(15, pts, stars)
        : { wasDone: false, earnedStars: stars };
      session = null;
      showLesson3ResultScreen({
        ok: true,
        title: 'أحسنت! أتقنت التحدي النهائي للدرس الثالث',
        subtitle: res.wasDone
          ? 'حافظت على إتقان جميع مهارات الجمع والطرح الثماني بنجاح.'
          : 'أنهيت جميع مهارات جمع الأعداد الكلية وطرحها بإتقان كامل!',
        metrics: [
          { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
          { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(pts), label: 'النقاط المكتسبة' },
          { value: ar(rows.length) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' }
        ],
        skills: rows,
        primaryLabel: 'العودة لخريطة الدرس الثالث',
        onPrimary: () => closeToMap(3),
        secondaryLabel: 'إعادة التحدي',
        onSecondary: () => openLesson3Node(15, { forceReset: true })
      });
    } else {
      const nextRound = (rec && rec.data && Number(rec.data.remedialRound) || 0) + 1;
      session = null;
      showLesson3ResultScreen({
        ok: false,
        title: 'بقيت ' + ar(unmastered.length) + ' مهارات لإتقان التحدي',
        subtitle: 'سنتدرب الآن على سؤالين جديدين لكل مهارة متبقية قبل إغلاق البطاقة.',
        metrics: [
          { value: ar(masteredCount) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' },
          { value: ar(unmastered.length), label: 'تحتاج تدريبًا' },
          { value: '0', label: 'نقاط بانتظار الإتقان' }
        ],
        skills: rows,
        primaryLabel: 'تدريب المهارات المتبقية (' + ar(unmastered.length) + ')',
        onPrimary: () => openLesson3Remedial(unmastered, nextRound),
        secondaryLabel: 'العودة لخريطة الدرس الثالث',
        onSecondary: () => closeToMap(3)
      });
    }
  }

  function finishLesson3Session() {
    const s = session;
    if (!s) return;

    if (s.nodeId === 15) {
      const rec = typeof getLesson3NodeRecord === 'function' ? getLesson3NodeRecord(15) : null;
      if (s.remedial && rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        const bySkill = {};
        (s.remedialResponses || []).forEach(r => {
          bySkill[r.skill] = bySkill[r.skill] || [];
          bySkill[r.skill].push(Boolean(r.ok));
        });
        Object.keys(bySkill).forEach(sk => {
          const arr = bySkill[sk];
          if (arr.length > 0 && arr.every(Boolean)) {
            rec.data.skills[sk] = true;
          }
        });
        rec.data.remedialRound = (Number(rec.data.remedialRound) || 0) + 1;
        saveState();
      }
      evaluateLesson3Station16Screen();
      return;
    }

    const rec = typeof getLesson3NodeRecord === 'function' ? getLesson3NodeRecord(s.nodeId) : null;
    const errCount = rec ? (Number(rec.errors) || 0) : (Number(s.errors) || 0);
    let stars = errCount === 0 ? 3 : (errCount <= 2 ? 2 : 1);
    if (rec && rec.assistedSteps && rec.assistedSteps.size > 0) {
      stars = Math.min(2, stars);
    }

    const res = typeof completeLesson3Station === 'function'
      ? completeLesson3Station(s.nodeId, s.points, stars)
      : { wasDone: false, earnedStars: stars };

    const totalNodes = typeof L3_NODES !== 'undefined' ? L3_NODES.length : 16;
    const nextId = s.nodeId + 1;
    const canGoNext = nextId < totalNodes && (typeof isLesson3NodeUnlocked !== 'function' || isLesson3NodeUnlocked(nextId));
    const finishedNodeId = s.nodeId;
    const finishedTitle = s.title;
    const finishedPts = s.points;
    session = null;

    showLesson3ResultScreen({
      ok: true,
      title: 'أحسنت! أتممت «' + finishedTitle + '»',
      subtitle: res.wasDone
        ? 'مراجعة موفقة؛ تم حفظ أدائك دون تكرار النقاط.'
        : 'أكملت جميع خطوات المحطة بنجاح وفتحت المحطة التالية.',
      metrics: [
        { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
        { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(finishedPts), label: 'النقاط' },
        { value: ar(errCount), label: 'محاولات تصحيح' }
      ],
      primaryLabel: canGoNext ? 'المحطة التالية' : 'العودة لخريطة الدرس الثالث',
      onPrimary: () => canGoNext ? openLesson3Node(nextId) : closeToMap(3),
      secondaryLabel: canGoNext ? 'العودة لخريطة الدرس الثالث' : 'إعادة المحطة',
      onSecondary: () => canGoNext ? closeToMap(3) : openLesson3Node(finishedNodeId, { forceReset: true })
    });
  }

  function openLesson3Node(nodeId, options) {
    if (typeof Lesson3RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();

    if (nodeId !== 15 && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 3, nodeId, openOptions: options });
    }

    const st3 = typeof getLesson3State === 'function' ? getLesson3State() : null;
    const rec = typeof getLesson3NodeRecord === 'function' ? getLesson3NodeRecord(nodeId) : null;
    const totalSteps = Lesson3RunnerDefs.getStepCount(nodeId);
    const doneCol = st3 && (st3.completedNodes !== undefined ? st3.completedNodes : st3.completed);
    const alreadyDone = Boolean(doneCol && (typeof doneCol.has === 'function' ? doneCol.has(nodeId) : Array.isArray(doneCol) && doneCol.includes(nodeId)));

    if (nodeId === 15 && !options?.forceReset && !options?.review && !options?.preserveProgress && !alreadyDone) {
      if (rec && rec.passed && rec.passed.size >= totalSteps && rec.data && rec.data.skills) {
        evaluateLesson3Station16Screen();
        return true;
      }
    }

    const shouldReset = Boolean((options?.forceReset || options?.review || alreadyDone) && !options?.preserveProgress);
    if (shouldReset && typeof resetLesson3NodeRecordForReplay === 'function') {
      resetLesson3NodeRecordForReplay(nodeId);
    }

    const built = Lesson3RunnerDefs.buildLesson3Session(nodeId, {
      ...options,
      replay: Boolean(shouldReset || options?.replay)
    });
    if (!built) return false;
    session = built;
    lastActiveLesson = 3;
    state.mapSubView = 'lesson3';
    state.viewMode = 'lesson3';
    setUiMode('learning');
    persistRunnerPosition();
    renderStep();
    return true;
  }

  function openLesson3Remedial(unmasteredList, roundNum) {
    if (typeof Lesson3RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();
    if ((state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 3, nodeId: 15, remedialLaunch: { unmasteredList, roundNum } });
    }
    const built = Lesson3RunnerDefs.buildLesson3RemedialSession(unmasteredList, roundNum);
    if (!built) {
      evaluateLesson3Station16Screen();
      return false;
    }
    session = built;
    lastActiveLesson = 3;
    state.mapSubView = 'lesson3';
    state.viewMode = 'lesson3';
    setUiMode('learning');
    renderStep();
    return true;
  }

  /* ---------------- Lesson 4: Negative Numbers Renderers, Exit Ticket & Openers ---------------- */
  function l4NormalizeSigned(raw) {
    const s = normalizeDigits(String(raw ?? ''))
      .replace(/[\u2212\u2013\u2014]/g, '-')
      .replace(/[,\s٬،_]/g, '')
      .trim();
    if (!s || !/^[+-]?\d+$/.test(s)) return '';
    const sign = (s[0] === '-' || s[0] === '+') ? s[0] : '';
    const mag = String(parseInt(s.slice(sign ? 1 : 0), 10));
    if (mag === '0') return sign === '-' ? '-0' : '0';
    return sign + mag;
  }

  function l4MatchesAccept(raw, acceptList) {
    const norm = l4NormalizeSigned(raw);
    if (!norm) return false;
    return (acceptList || []).some(acc => l4NormalizeSigned(acc) === norm);
  }

  function l4HasSignedZeroError(raw) {
    return l4NormalizeSigned(raw) === '-0';
  }

  function l4SignedBadgeHTML(val, forcePlus, unit) {
    if (global.L4Visuals && typeof global.L4Visuals.bdiNum === 'function') {
      return global.L4Visuals.bdiNum(val, forcePlus, unit);
    }
    const n = Number(val);
    const cls = n < 0 ? 'is-neg' : (n > 0 ? 'is-pos' : 'is-zero');
    const txt = (n > 0 && forcePlus) ? ('+' + n) : String(n);
    const suffix = unit ? String(unit) : '';
    return '<bdi class="l4-signed ' + cls + '" dir="ltr">' + esc(txt + suffix) + '</bdi>';
  }

  function l4SceneIconSVG(iconType) {
    const common = 'viewBox="0 0 24 24" class="svg-ico" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    switch (iconType) {
      case 'plane':
        return '<svg ' + common + '><path d="M2 16l20-5-20-5 5 5-5 5z"/><line x1="7" y1="11" x2="22" y2="11"/></svg>';
      case 'bird':
        return '<svg ' + common + '><path d="M3 14c4-6 8-6 11-1 3-3 6-3 7 0-3 2-6 4-10 4-3 0-6-1-8-3z"/></svg>';
      case 'boat':
        return '<svg ' + common + '><path d="M3 16h18l-2 4H5l-2-4z"/><path d="M7 16V8h7l4 8"/><line x1="11" y1="8" x2="11" y2="5"/></svg>';
      case 'fish':
        return '<svg ' + common + '><path d="M6.5 12c2.5-3.5 7.5-4.5 12.5 0-5 4.5-10 3.5-12.5 0z"/><path d="M6.5 12L3 9v6l3.5-3z"/><circle cx="15" cy="11.5" r="1" fill="currentColor"/></svg>';
      case 'dolphin':
        return '<svg ' + common + '><path d="M3 14c4-6 12-7 17-1-1 2-3 3-6 2 1 2 1 3-1 4-1-2-3-3-5-3-2 0-4 1-5-2z"/></svg>';
      case 'shark':
        return '<svg ' + common + '><path d="M2 14c5-4 13-4 19 0-4 3-10 3-15 1l-4 2 2-3z"/><path d="M11 11l2-5 3 5"/></svg>';
      case 'octopus':
        return '<svg ' + common + '><circle cx="12" cy="9" r="5"/><path d="M8 14v5M11 14v6M13 14v6M16 14v5"/></svg>';
      case 'tower':
        return '<svg ' + common + '><rect x="7" y="3" width="10" height="18" rx="1"/><line x1="10" y1="7" x2="14" y2="7"/><line x1="10" y1="11" x2="14" y2="11"/><line x1="10" y1="15" x2="14" y2="15"/></svg>';
      case 'ground':
        return '<svg ' + common + '><line x1="3" y1="12" x2="21" y2="12"/><rect x="8" y="8" width="8" height="4"/></svg>';
      case 'basement':
        return '<svg ' + common + '><line x1="3" y1="6" x2="21" y2="6"/><rect x="7" y="9" width="10" height="11" rx="1"/><path d="M12 11v6M9 14l3 3 3-3"/></svg>';
      default:
        return '<svg ' + common + '><circle cx="12" cy="12" r="7"/></svg>';
    }
  }

  function l4CreateSignedKeypad(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'l4-keypad-wrap';
    wrap.tabIndex = -1;

    const dispRow = document.createElement('div');
    dispRow.className = 'l4-keypad-display-row';

    const lblEl = document.createElement('span');
    lblEl.innerHTML = l2BidiTextHTML(opts.getLabel ? opts.getLabel() : (opts.label || 'أدخل العدد'));

    const valEl = document.createElement('span');
    valEl.className = 'l4-keypad-display-val';
    valEl.dir = 'ltr';

    dispRow.append(lblEl, valEl);
    wrap.append(dispRow);

    const signRow = document.createElement('div');
    signRow.className = 'l4-keypad-signs';
    const negBtn = document.createElement('button');
    negBtn.type = 'button';
    negBtn.className = 'l4-sign-btn is-neg';
    negBtn.textContent = '- (سالب)';
    negBtn.setAttribute('aria-label', 'إشارة سالب');
    const posBtn = document.createElement('button');
    posBtn.type = 'button';
    posBtn.className = 'l4-sign-btn is-pos';
    posBtn.textContent = '+ (موجب)';
    posBtn.setAttribute('aria-label', 'إشارة موجب');
    signRow.append(negBtn, posBtn);
    wrap.append(signRow);

    const digitsGrid = document.createElement('div');
    digitsGrid.className = 'l4-keypad-digits';
    const keys = [
      { label: '1', ch: '1' }, { label: '2', ch: '2' }, { label: '3', ch: '3' },
      { label: '4', ch: '4' }, { label: '5', ch: '5' }, { label: '6', ch: '6' },
      { label: '7', ch: '7' }, { label: '8', ch: '8' }, { label: '9', ch: '9' },
      { label: 'حذف', act: 'back' }, { label: '0', ch: '0' }, { label: 'مسح', act: 'clear' }
    ];

    const keyButtons = [];
    const syncDisplay = () => {
      const curVal = String(opts.getValue() || '');
      const locked = Boolean(typeof opts.isDisabled === 'function' ? opts.isDisabled() : opts.disabled);
      lblEl.textContent = opts.getLabel ? opts.getLabel() : (opts.label || 'أدخل العدد');
      valEl.innerHTML = curVal ? '<bdi dir="ltr">' + esc(curVal) + '</bdi>' : '<span style="opacity:.6">...</span>';
      negBtn.classList.toggle('is-active', curVal.startsWith('-'));
      posBtn.classList.toggle('is-active', curVal.startsWith('+'));
      negBtn.disabled = locked;
      posBtn.disabled = locked;
      keyButtons.forEach(b => { b.disabled = locked; });
    };

    const applyUpdate = nextVal => {
      opts.setValue(nextVal);
      syncDisplay();
      if (typeof opts.onChange === 'function') opts.onChange(nextVal);
    };

    const applySign = sgn => {
      if (negBtn.disabled) return;
      const cur = String(opts.getValue() || '');
      if (!cur) {
        applyUpdate(sgn);
        return;
      }
      if (cur[0] === sgn) {
        applyUpdate(cur.slice(1));
      } else if (cur[0] === '-' || cur[0] === '+') {
        applyUpdate(sgn + cur.slice(1));
      } else {
        applyUpdate(sgn + cur);
      }
    };

    const appendDigit = dCh => {
      const cur = String(opts.getValue() || '');
      const sign = (cur[0] === '-' || cur[0] === '+') ? cur[0] : '';
      let mag = cur.slice(sign ? 1 : 0);
      if (mag.length >= 4) return;
      mag = mag === '0' ? dCh : (mag + dCh);
      applyUpdate(sign + mag);
    };

    const backspace = () => {
      const cur = String(opts.getValue() || '');
      if (!cur) return;
      applyUpdate(cur.slice(0, -1));
    };

    negBtn.addEventListener('click', () => applySign('-'));
    posBtn.addEventListener('click', () => applySign('+'));

    keys.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'l4-key-btn' + (k.act ? ' is-action' : '');
      b.textContent = k.label;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (k.act === 'back') backspace();
        else if (k.act === 'clear') applyUpdate('');
        else appendDigit(k.ch);
      });
      keyButtons.push(b);
      digitsGrid.append(b);
    });
    wrap.append(digitsGrid);

    wrap.addEventListener('keydown', e => {
      if (negBtn.disabled) return;
      const ch = normalizeDigits(e.key);
      if (/^\d$/.test(ch)) {
        e.preventDefault();
        appendDigit(ch);
      } else if (e.key === '-' || e.key === '+') {
        e.preventDefault();
        applySign(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        applyUpdate('');
      }
    });

    wrap.refresh = syncDisplay;
    syncDisplay();
    return wrap;
  }

  function renderShubakExploreStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    if (passed) {
      d.exploredDay = true;
      d.exploredNight = true;
    }

    let selectedKey = d.selectedKey === 'day' || d.selectedKey === 'night' ? d.selectedKey : null;
    if (!selectedKey && passed) {
      selectedKey = d.shubakVal === -3 ? 'night' : 'day';
    }
    const currentVal = selectedKey === 'day' ? 5 : (selectedKey === 'night' ? -3 : 0);

    const promptEl = byId('l1-prompt');
    if (promptEl) {
      promptEl.hidden = false;
      promptEl.innerHTML =
        '<span class="l4-shubak-heading">'
        + '<span>' + esc(cur.title || 'برد الشوبك وتحت الصفر') + '</span>'
        + '<span class="l4-shubak-heading-ico" aria-hidden="true">'
        + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'
        + '<circle cx="11.5" cy="17.5" r="1.75" fill="currentColor" stroke="none"/>'
        + '<line x1="11.5" y1="9" x2="11.5" y2="16"/>'
        + '</svg>'
        + '</span>'
        + '</span>';
    }

    const wrap = document.createElement('div');
    wrap.className = 'l4-shubak-view';

    const intro = document.createElement('p');
    intro.className = 'l4-shubak-intro';
    intro.innerHTML = 'بلغت الحرارة نهارًا <bdi class="l4-temp-bdi is-pos" dir="ltr">+5°C</bdi>، وليلًا <bdi class="l4-temp-bdi is-neg" dir="ltr">−3°C</bdi>';

    const instruction = document.createElement('p');
    instruction.className = 'l4-shubak-instruction';
    instruction.textContent = cur.instruction || 'اضغط على كل درجة لتكتشف مكانها على الميزان';

    const surface = document.createElement('div');
    surface.className = 'l4-shubak-surface';

    const stageGrid = document.createElement('div');
    stageGrid.className = 'l4-shubak-grid';

    const btnCol = document.createElement('div');
    btnCol.className = 'l4-shubak-buttons';
    btnCol.setAttribute('role', 'group');
    btnCol.setAttribute('aria-label', 'اختيار درجة الحرارة');

    const checkIconSVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    const infoIconSVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    function makeTempBtn(key, labelText, tempText, cls) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l4-shubak-btn ' + cls;
      btn.dataset.shubakChoice = key;

      const copy = document.createElement('span');
      copy.className = 'l4-shubak-btn-copy';

      const lbl = document.createElement('span');
      lbl.className = 'l4-shubak-btn-label';
      lbl.textContent = labelText;

      const temp = document.createElement('bdi');
      temp.className = 'l4-shubak-btn-temp ' + cls;
      temp.setAttribute('dir', 'ltr');
      temp.textContent = tempText;

      copy.append(lbl, temp);

      const badge = document.createElement('span');
      badge.className = 'l4-shubak-btn-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = checkIconSVG;

      btn.append(copy, badge);
      return btn;
    }

    const dayBtn = makeTempBtn('day', 'نهارًا', '+5°C', 'is-pos');
    const nightBtn = makeTempBtn('night', 'ليلًا', '−3°C', 'is-neg');
    btnCol.append(dayBtn, nightBtn);

    const thermoWrap = document.createElement('div');
    thermoWrap.className = 'l4-shubak-thermo-wrap';
    thermoWrap.innerHTML = global.L4Visuals && typeof global.L4Visuals.buildHeroThermometerSVG === 'function'
      ? global.L4Visuals.buildHeroThermometerSVG(currentVal, { showMarker: Boolean(selectedKey) })
      : '';

    stageGrid.append(btnCol, thermoWrap);

    const explainEl = document.createElement('div');
    explainEl.className = 'l4-shubak-explain';
    explainEl.setAttribute('aria-live', 'polite');

    surface.append(stageGrid, explainEl);

    const takeawayEl = document.createElement('div');
    takeawayEl.className = 'l4-shubak-takeaway';
    takeawayEl.setAttribute('role', 'status');
    takeawayEl.setAttribute('aria-live', 'polite');

    wrap.append(intro, instruction, surface, takeawayEl);
    root.append(wrap);

    const syncShubakUI = () => {
      const sel = d.selectedKey === 'day' || d.selectedKey === 'night'
        ? d.selectedKey
        : (passed ? (d.shubakVal === -3 ? 'night' : 'day') : null);
      const val = sel === 'day' ? 5 : (sel === 'night' ? -3 : 0);
      const bothDone = Boolean(d.exploredDay && d.exploredNight);

      dayBtn.classList.toggle('is-selected', sel === 'day');
      dayBtn.classList.toggle('is-explored', Boolean(d.exploredDay));
      dayBtn.setAttribute('aria-pressed', sel === 'day' ? 'true' : 'false');

      nightBtn.classList.toggle('is-selected', sel === 'night');
      nightBtn.classList.toggle('is-explored', Boolean(d.exploredNight));
      nightBtn.setAttribute('aria-pressed', sel === 'night' ? 'true' : 'false');

      if (global.L4Visuals && typeof global.L4Visuals.updateHeroThermometerSVG === 'function') {
        global.L4Visuals.updateHeroThermometerSVG(thermoWrap, val, { showMarker: Boolean(sel) });
      }

      explainEl.classList.toggle('is-pos', sel === 'day');
      explainEl.classList.toggle('is-neg', sel === 'night');
      if (sel === 'day') {
        explainEl.innerHTML = '<span class="l4-shubak-explain-line"><bdi class="l4-temp-bdi is-pos" dir="ltr">5</bdi> درجات فوق الصفر ← <strong class="l4-shubak-kind is-pos">عدد موجب</strong></span>';
      } else if (sel === 'night') {
        explainEl.innerHTML = '<span class="l4-shubak-explain-line"><bdi class="l4-temp-bdi is-neg" dir="ltr">3</bdi> درجات تحت الصفر ← <strong class="l4-shubak-kind is-neg">عدد سالب</strong></span>';
      } else {
        explainEl.innerHTML = '<span class="l4-shubak-explain-placeholder">اختر درجة الحرارة لتشاهد موقعها بالنسبة إلى الصفر</span>';
      }

      takeawayEl.classList.toggle('is-complete', bothDone);
      if (bothDone) {
        takeawayEl.innerHTML =
          '<span class="l4-shubak-takeaway-ico" aria-hidden="true">' + checkIconSVG + '</span>'
          + '<span>فوق الصفر: <strong>موجب</strong>. تحت الصفر: <strong>سالب</strong></span>';
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else {
        takeawayEl.innerHTML =
          '<span class="l4-shubak-takeaway-ico" aria-hidden="true">' + infoIconSVG + '</span>'
          + '<span>' + esc(cur.pendingNote || 'جرّب الدرجتين للمتابعة') + '</span>';
        setPrimaryButtonState('incomplete', l2PassPrimaryLabel());
      }
      renderTopbar();
    };

    dayBtn.addEventListener('click', () => {
      d.selectedKey = 'day';
      d.shubakVal = 5;
      d.exploredDay = true;
      saveState();
      syncShubakUI();
    });

    nightBtn.addEventListener('click', () => {
      d.selectedKey = 'night';
      d.shubakVal = -3;
      d.exploredNight = true;
      saveState();
      syncShubakUI();
    });

    stepUi.onNext = () => {
      if (!(d.exploredDay && d.exploredNight)) return;
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
        d.viewed = true;
      }
      advanceStep();
    };

    syncShubakUI();
  }

  function createInteractiveNumberLineWidget(opts) {
    const minVal = Number.isFinite(Number(opts.minVal)) ? Number(opts.minVal) : -5;
    const maxVal = Number.isFinite(Number(opts.maxVal)) ? Number(opts.maxVal) : 5;
    const span = Math.max(1, maxVal - minVal);
    const formatSigned = (n) => (n < 0 ? ('−' + Math.abs(n)) : (n > 0 ? ('+' + n) : '0'));
    const polarityColor = (n) => (n < 0 ? '#a82834' : (n > 0 ? '#0f5d84' : '#102a24'));
    const spokenValueText = (n) => (n < 0 ? ('سالب ' + Math.abs(n)) : (n > 0 ? ('موجب ' + n) : 'صفر'));

    const surface = document.createElement('div');
    surface.className = 'l4-nline-exp-surface';

    const dirRow = document.createElement('div');
    dirRow.className = 'l4-nline-exp-dirs';
    dirRow.setAttribute('dir', 'ltr');
    dirRow.innerHTML =
      '<span class="l4-nline-exp-dir is-neg" dir="rtl">أعداد سالبة</span>'
      + '<span class="l4-nline-exp-dir is-pos" dir="rtl">أعداد موجبة</span>';

    const W = 360;
    const H = 92;
    const padX = 28;
    const usableW = W - padX * 2;
    const axisY = 36;
    const valToX = (v) => padX + ((v - minVal) / span) * usableW;

    const ticksMarkup = [];
    for (let v = minVal; v <= maxVal; v++) {
      const x = Number(valToX(v).toFixed(2));
      const color = polarityColor(v);
      const lbl = formatSigned(v);
      if (v === 0) {
        ticksMarkup.push(
          `<line x1="${x}" y1="${axisY - 14}" x2="${x}" y2="${axisY + 14}" stroke="#102a24" stroke-width="2.6" stroke-linecap="round"/>` +
          `<circle cx="${x}" cy="${axisY}" r="4.2" fill="#102a24"/>` +
          `<rect x="${x - 13}" y="${axisY + 20}" width="26" height="22" rx="11" fill="#ebe4d2" stroke="#7c7463" stroke-width="1.2"/>` +
          `<text x="${x}" y="${axisY + 35.5}" text-anchor="middle" font-size="14" font-weight="800" fill="#102a24" font-family="Segoe UI, Tahoma, sans-serif">0</text>`
        );
      } else {
        ticksMarkup.push(
          `<line x1="${x}" y1="${axisY - 8}" x2="${x}" y2="${axisY + 8}" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>` +
          `<circle cx="${x}" cy="${axisY}" r="3.2" fill="${color}"/>` +
          `<text x="${x}" y="${axisY + 36}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${color}" font-family="Segoe UI, Tahoma, sans-serif">${lbl}</text>`
        );
      }
    }

    const trackWrap = document.createElement('div');
    trackWrap.className = 'l4-nline-exp-track';
    trackWrap.setAttribute('dir', 'ltr');
    trackWrap.setAttribute('role', 'slider');
    trackWrap.setAttribute('tabindex', '0');
    trackWrap.setAttribute('aria-valuemin', String(minVal));
    trackWrap.setAttribute('aria-valuemax', String(maxVal));
    trackWrap.setAttribute('aria-label', opts.ariaLabel || ('خط الأعداد من ' + formatSigned(minVal) + ' إلى ' + formatSigned(maxVal)));

    const initVal = opts.getValue();
    const initShow = Boolean(opts.isThumbVisible ? opts.isThumbVisible() : (initVal !== undefined && initVal !== null));
    const initPos = Number.isFinite(Number(initVal)) ? Number(initVal) : 0;
    const initX = Number(valToX(initPos).toFixed(2));
    const initColor = opts.getThumbColor ? opts.getThumbColor(initPos) : polarityColor(initPos);

    trackWrap.innerHTML = `
      <svg class="l4-nline-exp-svg" dir="ltr" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
        <line x1="12" y1="${axisY}" x2="${W - 12}" y2="${axisY}" stroke="#7c7463" stroke-width="2" stroke-linecap="round"/>
        <polygon points="4,${axisY} 15,${axisY - 5.5} 15,${axisY + 5.5}" fill="#a82834"/>
        <polygon points="${W - 4},${axisY} ${W - 15},${axisY - 5.5} ${W - 15},${axisY + 5.5}" fill="#0f5d84"/>
        ${ticksMarkup.join('')}
        <g class="l4-nline-thumb${initShow ? '' : ' is-hidden'}" style="transform: translateX(${initX}px);">
          <circle class="l4-nline-thumb-ring" cx="0" cy="${axisY}" r="11.5" fill="rgba(255,255,255,0.88)" stroke="${initColor}" stroke-width="2.5"/>
          <circle class="l4-nline-thumb-dot" cx="0" cy="${axisY}" r="5" fill="${initColor}"/>
        </g>
      </svg>`;

    const navRow = document.createElement('div');
    navRow.className = 'l4-nline-exp-nav';
    navRow.setAttribute('dir', 'ltr');

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'l4-nline-nav-btn is-prev';
    prevBtn.setAttribute('aria-label', 'السابق: تحريك خطوة لليسار');
    prevBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
      + '<span dir="rtl">السابق</span>';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'l4-nline-nav-btn is-next';
    nextBtn.setAttribute('aria-label', 'التالي: تحريك خطوة لليمين');
    nextBtn.innerHTML =
      '<span dir="rtl">التالي</span>'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    navRow.append(prevBtn, nextBtn);

    const explainBox = document.createElement('div');
    explainBox.className = 'l4-nline-exp-explain';
    explainBox.setAttribute('aria-live', 'polite');

    const bigValEl = document.createElement('bdi');
    bigValEl.className = 'l4-nline-big-val';
    bigValEl.setAttribute('dir', 'ltr');

    const explainTxtEl = document.createElement('p');
    explainTxtEl.className = 'l4-nline-exp-text';

    explainBox.append(bigValEl, explainTxtEl);
    surface.append(dirRow, trackWrap, navRow, explainBox);

    const svgEl = trackWrap.querySelector('.l4-nline-exp-svg');
    const thumbGroup = trackWrap.querySelector('.l4-nline-thumb');
    const thumbRing = trackWrap.querySelector('.l4-nline-thumb-ring');
    const thumbDot = trackWrap.querySelector('.l4-nline-thumb-dot');

    const updateVisual = () => {
      const disabled = Boolean(opts.isDisabled && opts.isDisabled());
      const curVal = opts.getValue();
      const hasVal = curVal !== undefined && curVal !== null && Number.isFinite(Number(curVal));
      const v = hasVal ? Math.max(minVal, Math.min(maxVal, Math.round(Number(curVal)))) : 0;
      const show = Boolean(opts.isThumbVisible ? opts.isThumbVisible() : hasVal);
      const x = Number(valToX(v).toFixed(2));
      const color = opts.getThumbColor ? opts.getThumbColor(v) : polarityColor(v);

      trackWrap.classList.toggle('is-disabled', disabled);
      if (thumbGroup) {
        thumbGroup.classList.toggle('is-hidden', !show);
        thumbGroup.style.transform = `translateX(${x}px)`;
      }
      if (thumbRing) thumbRing.setAttribute('stroke', color);
      if (thumbDot) thumbDot.setAttribute('fill', color);

      if (hasVal) {
        trackWrap.setAttribute('aria-valuenow', String(v));
        trackWrap.setAttribute('aria-valuetext', spokenValueText(v));
      } else {
        trackWrap.removeAttribute('aria-valuenow');
        trackWrap.setAttribute('aria-valuetext', 'لم يتم اختيار نقطة بعد');
      }

      prevBtn.disabled = disabled || (hasVal && v <= minVal);
      nextBtn.disabled = disabled || (hasVal && v >= maxVal);
    };

    const pointerToValue = (clientX) => {
      if (!svgEl) return 0;
      const rect = svgEl.getBoundingClientRect();
      const viewX = ((clientX - rect.left) / Math.max(1, rect.width)) * W;
      const raw = minVal + ((viewX - padX) / usableW) * span;
      return Math.max(minVal, Math.min(maxVal, Math.round(raw)));
    };

    const stepDelta = (delta) => {
      if (opts.isDisabled && opts.isDisabled()) return;
      const curVal = opts.getValue();
      const hasVal = curVal !== undefined && curVal !== null && Number.isFinite(Number(curVal));
      const base = hasVal ? Number(curVal) : 0;
      const next = Math.max(minVal, Math.min(maxVal, Math.round(base + delta)));
      opts.onSelectValue(next);
    };

    let activePointerId = null;
    trackWrap.addEventListener('pointerdown', (e) => {
      if (opts.isDisabled && opts.isDisabled()) return;
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      activePointerId = e.pointerId;
      trackWrap.classList.add('is-dragging');
      if (typeof trackWrap.setPointerCapture === 'function') {
        try { trackWrap.setPointerCapture(e.pointerId); } catch {}
      }
      opts.onSelectValue(pointerToValue(e.clientX));
    });

    trackWrap.addEventListener('pointermove', (e) => {
      if (activePointerId !== e.pointerId) return;
      if (opts.isDisabled && opts.isDisabled()) return;
      opts.onSelectValue(pointerToValue(e.clientX));
    });

    const endDrag = (e) => {
      if (activePointerId !== e.pointerId) return;
      activePointerId = null;
      trackWrap.classList.remove('is-dragging');
    };
    trackWrap.addEventListener('pointerup', endDrag);
    trackWrap.addEventListener('pointercancel', endDrag);

    prevBtn.addEventListener('click', () => stepDelta(-1));
    nextBtn.addEventListener('click', () => stepDelta(1));

    const handleSliderKey = (e) => {
      if (!surface.isConnected || document.querySelector('dialog[open]')) return false;
      if (opts.isDisabled && opts.isDisabled()) return false;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        stepDelta(-1);
        return true;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        stepDelta(1);
        return true;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        opts.onSelectValue(minVal);
        return true;
      }
      if (e.key === 'End') {
        e.preventDefault();
        opts.onSelectValue(maxVal);
        return true;
      }
      return false;
    };

    trackWrap.addEventListener('keydown', (e) => handleSliderKey(e));

    l3KeyListener = (e) => {
      if (e.target === trackWrap) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      handleSliderKey(e);
    };
    global.addEventListener('keydown', l3KeyListener);

    return {
      surfaceEl: surface,
      trackWrap,
      prevBtn,
      nextBtn,
      explainBox,
      bigValEl,
      explainTxtEl,
      formatSigned,
      updateVisual
    };
  }

  function renderNumberLineExploreStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const minVal = Number.isFinite(Number(cur.min)) ? Number(cur.min) : -5;
    const maxVal = Number.isFinite(Number(cur.max)) ? Number(cur.max) : 5;

    if (d.demoVal === undefined || !Number.isFinite(Number(d.demoVal))) {
      d.demoVal = 0;
    } else {
      d.demoVal = Math.max(minVal, Math.min(maxVal, Math.round(Number(d.demoVal))));
    }
    if (passed) {
      d.exploredNeg = true;
      d.exploredZero = true;
      d.exploredPos = true;
    }

    const polarityCls = (n) => (n < 0 ? 'is-neg' : (n > 0 ? 'is-pos' : 'is-zero'));

    const wrap = document.createElement('div');
    wrap.className = 'l4-nline-exp-view';

    const instr = document.createElement('p');
    instr.className = 'l4-nline-exp-instr';
    instr.textContent = cur.instruction || 'اضغط عددًا لتعرف موقعه بالنسبة للصفر';

    let widget = null;
    const syncNumberLineUI = () => {
      if (!widget) return;
      widget.updateVisual();
      const v = d.demoVal;
      const cls = polarityCls(v);
      const lbl = widget.formatSigned(v);

      widget.bigValEl.className = 'l4-nline-big-val ' + cls;
      widget.bigValEl.textContent = lbl;

      if (cur.demo === 'zero_rule') {
        if (v < 0) {
          widget.explainTxtEl.innerHTML = '<bdi class="l4-temp-bdi is-neg" dir="ltr">' + esc(lbl) + '</bdi> أصغر من الصفر ويقع يساره ← عدد سالب';
        } else if (v > 0) {
          widget.explainTxtEl.innerHTML = '<bdi class="l4-temp-bdi is-pos" dir="ltr">' + esc(lbl) + '</bdi> أكبر من الصفر ويقع يمينه ← عدد موجب';
        } else {
          widget.explainTxtEl.textContent = 'الصفر نقطة البداية: ليس أكبر من نفسه ولا أصغر منه';
        }
      } else {
        if (v < 0) {
          widget.explainTxtEl.innerHTML = '<bdi class="l4-temp-bdi is-neg" dir="ltr">' + esc(lbl) + '</bdi> عدد سالب، يقع يسار الصفر';
        } else if (v > 0) {
          widget.explainTxtEl.innerHTML = '<bdi class="l4-temp-bdi is-pos" dir="ltr">' + esc(lbl) + '</bdi> عدد موجب، يقع يمين الصفر';
        } else {
          widget.explainTxtEl.textContent = 'الصفر ليس موجبًا ولا سالبًا';
        }
      }

      catNeg.classList.toggle('is-done', Boolean(d.exploredNeg));
      catZero.classList.toggle('is-done', Boolean(d.exploredZero));
      catPos.classList.toggle('is-done', Boolean(d.exploredPos));

      const allThree = Boolean(d.exploredNeg && d.exploredZero && d.exploredPos);
      takeawayEl.classList.toggle('is-complete', allThree);
      if (allThree) {
        takeawayEl.textContent = cur.summaryNote || 'السالب يسار الصفر، والموجب يمينه';
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else {
        takeawayEl.textContent = cur.pendingNote || 'جرّب عددًا سالبًا، والصفر، وعددًا موجبًا';
        setPrimaryButtonState('incomplete', l2PassPrimaryLabel());
      }
      renderTopbar();
    };

    widget = createInteractiveNumberLineWidget({
      minVal,
      maxVal,
      getValue: () => d.demoVal,
      isThumbVisible: () => true,
      onSelectValue: (snapped) => {
        d.demoVal = snapped;
        if (snapped < 0) d.exploredNeg = true;
        else if (snapped > 0) d.exploredPos = true;
        else d.exploredZero = true;
        saveState();
        syncNumberLineUI();
      }
    });

    const catsRow = document.createElement('div');
    catsRow.className = 'l4-nline-cats';
    catsRow.setAttribute('aria-label', 'فئات الاستكشاف');

    const catCheckSVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    const makeCatPill = (lbl, cls) => {
      const el = document.createElement('div');
      el.className = 'l4-nline-cat ' + cls;
      el.innerHTML = '<span class="l4-nline-cat-dot" aria-hidden="true">' + catCheckSVG + '</span><span>' + esc(lbl) + '</span>';
      return el;
    };
    const catNeg = makeCatPill('سالب', 'is-neg');
    const catZero = makeCatPill('صفر', 'is-zero');
    const catPos = makeCatPill('موجب', 'is-pos');
    catsRow.append(catNeg, catZero, catPos);

    const takeawayEl = document.createElement('div');
    takeawayEl.className = 'l4-nline-exp-takeaway';
    takeawayEl.setAttribute('role', 'status');
    takeawayEl.setAttribute('aria-live', 'polite');

    wrap.append(instr, widget.surfaceEl);
    if (cur.zeroExamplesText) {
      const exRow = document.createElement('p');
      exRow.className = 'l4-nline-zero-examples';
      exRow.textContent = cur.zeroExamplesText;
      wrap.append(exRow);
    }
    wrap.append(catsRow, takeawayEl);
    root.append(wrap);

    stepUi.onNext = () => {
      if (!(d.exploredNeg && d.exploredZero && d.exploredPos)) return;
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
        d.viewed = true;
      }
      advanceStep();
    };

    syncNumberLineUI();
  }

  function renderL4TeachStep(cur, root) {
    if (cur.demo === 'shubak_explore') {
      renderShubakExploreStep(cur, root);
      return;
    }
    if (cur.demo === 'number_line' || cur.demo === 'zero_rule') {
      renderNumberLineExploreStep(cur, root);
      return;
    }

    const d = l2StepData(cur);
    const card = document.createElement('div');
    card.className = 'l3-visual-card';

    if (cur.conceptTitle || cur.title) {
      const h = document.createElement('h3');
      h.className = 'l3-reason-title';
      h.textContent = cur.conceptTitle || cur.title;
      card.append(h);
    }

    if (Array.isArray(cur.bullets) && cur.bullets.length) {
      const ul = document.createElement('ul');
      ul.className = 'l3-teach-bullets';
      cur.bullets.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = l2BidiTextHTML(b);
        ul.append(li);
      });
      card.append(ul);
    }

    const demoMount = document.createElement('div');
    card.append(demoMount);

    if (cur.demo === 'number_line' || cur.demo === 'zero_rule') {
      const spanMin = cur.demo === 'zero_rule' ? -3 : -5;
      const spanMax = cur.demo === 'zero_rule' ? 3 : 5;
      if (d.demoVal === undefined) d.demoVal = 0;

      if (cur.demo === 'zero_rule') {
        const ctxBar = document.createElement('div');
        ctxBar.className = 'l4-polarity-legend';
        [
          'مستوى سطح البحر = 0',
          'الطابق الأرضي = 0',
          'تجمد الماء = 0°C'
        ].forEach(txt => {
          const p = document.createElement('div');
          p.className = 'l4-polarity-pill is-zero';
          p.innerHTML = '<span>' + l2BidiTextHTML(txt) + '</span>';
          ctxBar.append(p);
        });
        demoMount.append(ctxBar);
      }

      const nlCard = document.createElement('div');
      nlCard.className = 'l4-nline-card';
      demoMount.append(nlCard);

      const drawTeachLine = () => {
        nlCard.innerHTML = '';
        const dirRow = document.createElement('div');
        dirRow.className = 'l4-nline-dir-row';
        dirRow.innerHTML = ''
          + '<span class="l4-dir-chip is-neg">أعداد سالبة (يسار <bdi dir="ltr">0</bdi>)</span>'
          + '<span class="l4-dir-chip is-pos">أعداد موجبة (يمين <bdi dir="ltr">0</bdi>)</span>';
        nlCard.append(dirRow);

        const scroll = document.createElement('div');
        scroll.className = 'l4-nline-scroll';
        const track = document.createElement('div');
        track.className = 'l4-nline-track-wrap';
        const grid = document.createElement('div');
        grid.className = 'l4-nline-grid';
        grid.dir = 'ltr';
        const cnt = spanMax - spanMin + 1;
        grid.style.gridTemplateColumns = 'repeat(' + cnt + ', minmax(0, 1fr))';
        grid.style.minWidth = Math.max(260, cnt * 44) + 'px';

        for (let v = spanMin; v <= spanMax; v++) {
          const col = document.createElement('div');
          col.className = 'l4-nline-col';
          const cls = v < 0 ? 'is-neg' : (v > 0 ? 'is-pos' : 'is-zero');
          const lbl = v > 0 ? ('+' + v) : String(v);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'l4-tick-btn ' + cls + (d.demoVal === v ? ' is-selected' : '');
          btn.setAttribute('aria-pressed', d.demoVal === v ? 'true' : 'false');
          btn.setAttribute('aria-label', 'العدد ' + lbl);
          btn.innerHTML = '<span class="l4-tick-dot"></span>';
          btn.addEventListener('click', () => { d.demoVal = v; saveState(); drawTeachLine(); });
          const numLbl = document.createElement('span');
          numLbl.className = 'l4-tick-label ' + cls;
          numLbl.innerHTML = '<bdi dir="ltr">' + esc(lbl) + '</bdi>';
          col.append(btn, numLbl);
          grid.append(col);
        }
        track.append(grid);
        scroll.append(track);
        nlCard.append(scroll);

        const rOut = document.createElement('div');
        rOut.className = 'l4-nline-readout';
        if (d.demoVal < 0) {
          rOut.innerHTML = 'العدد ' + l4SignedBadgeHTML(d.demoVal) + ' سالب: يقع على بُعد <bdi dir="ltr">' + Math.abs(d.demoVal) + '</bdi> خطوات يسار الصفر.';
        } else if (d.demoVal > 0) {
          rOut.innerHTML = 'العدد ' + l4SignedBadgeHTML(d.demoVal, true) + ' موجب: يقع على بُعد <bdi dir="ltr">' + d.demoVal + '</bdi> خطوات يمين الصفر.';
        } else {
          rOut.innerHTML = 'العدد ' + l4SignedBadgeHTML(0) + ' محايد: ليس سالبًا ولا موجبًا، ويفصل بينهما.';
        }
        nlCard.append(rOut);
      };
      drawTeachLine();
    }

    if (cur.note) {
      const note = document.createElement('p');
      note.className = 'l3-reason-note';
      note.innerHTML = l2BidiTextHTML(cur.note);
      card.append(note);
    }

    root.append(card);
    setPrimaryButtonState('explanation', l2PassPrimaryLabel());
    stepUi.onNext = () => {
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
        if (d) d.viewed = true;
      }
      advanceStep();
    };
  }

  function renderL4NumberLineStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);

    if (cur.mode === 'analysis_letters') {
      if (d.symShown === undefined) d.symShown = Boolean(cur.autoShowSymmetry || passed);
      l2EnsureShuffledOptions(cur, d);
      const items = cur.options || [];
      let wrongIndices = [];
      const rightOrigIdx = items.findIndex(it => it.value === cur.correctValue);

      const nlCard = document.createElement('div');
      nlCard.className = 'l4-nline-card';
      root.append(nlCard);

      const drawAnalysisVisual = () => {
        nlCard.innerHTML = '';
        const scroll = document.createElement('div');
        scroll.className = 'l4-nline-scroll';
        const track = document.createElement('div');
        track.className = 'l4-nline-track-wrap';
        track.dir = 'ltr';

        const W = 360;
        const mapX = pos => 36 + ((pos + 5) / 10) * 288;
        const xZero = mapX(0);
        const xJ = mapX(-1.5);
        const xB = mapX(1.5);

        let arcHtml = '';
        if (d.symShown) {
          arcHtml = ''
            + '<path d="M ' + xZero + ' 44 Q ' + ((xZero + xJ) / 2) + ' 10 ' + xJ + ' 44" fill="none" stroke="#c88d21" stroke-width="2.4" stroke-dasharray="4 3"/>'
            + '<path d="M ' + xZero + ' 44 Q ' + ((xZero + xB) / 2) + ' 10 ' + xB + ' 44" fill="none" stroke="#0f5d84" stroke-width="2.4" stroke-dasharray="4 3"/>'
            + '<text x="' + xZero + '" y="13" text-anchor="middle" font-size="11" font-weight="800" fill="#102a24" font-family="Cairo, sans-serif">البعد نفسه عن الصفر</text>';
        }

        const ptsSvg = (cur.points || []).map(p => {
          const x = mapX(p.pos).toFixed(1);
          const color = p.polarity === 'neg' ? '#a82834' : (p.polarity === 'pos' ? '#0f5d84' : '#102a24');
          return ''
            + '<line x1="' + x + '" y1="38" x2="' + x + '" y2="50" stroke="' + color + '" stroke-width="2"/>'
            + '<circle cx="' + x + '" cy="44" r="' + (p.polarity === 'zero' ? 6 : 5.5) + '" fill="' + color + '"/>'
            + '<text x="' + x + '" y="72" text-anchor="middle" font-size="15" font-weight="800" fill="' + color + '" font-family="Cairo, sans-serif">' + esc(p.letter) + '</text>';
        }).join('');

        track.innerHTML = ''
          + '<svg viewBox="0 0 ' + W + ' 84" style="width:100%;max-width:520px;height:auto;display:block;margin:0 auto" aria-label="خط الأعداد وعليه الحروف أ وجـ وب ود">'
          + '<line x1="16" y1="44" x2="344" y2="44" stroke="#3c4c47" stroke-width="2.2"/>'
          + '<polygon points="16,44 24,39 24,49" fill="#3c4c47"/>'
          + '<polygon points="344,44 336,39 336,49" fill="#3c4c47"/>'
          + arcHtml
          + ptsSvg
          + '</svg>';

        scroll.append(track);
        nlCard.append(scroll);

        if (cur.showSymmetryButton) {
          const tools = document.createElement('div');
          tools.className = 'l4-analysis-tools';
          const symBtn = document.createElement('button');
          symBtn.type = 'button';
          symBtn.className = 'l4-sym-btn' + (d.symShown ? ' is-active' : '');
          symBtn.textContent = d.symShown ? 'إخفاء قوسي البُعد عن الصفر' : 'إظهار قوسي البُعد عن الصفر';
          symBtn.addEventListener('click', () => {
            d.symShown = !d.symShown;
            saveState();
            drawAnalysisVisual();
          });
          tools.append(symBtn);
          if (d.symShown) {
            const symNote = document.createElement('div');
            symNote.className = 'l4-sym-note';
            symNote.innerHTML = 'المسافة من <bdi dir="ltr">0</bdi> إلى «ب» تساوي تمامًا المسافة من <bdi dir="ltr">0</bdi> إلى «جـ» في الاتجاه المعاكس.';
            tools.append(symNote);
          }
          nlCard.append(tools);
        }
      };
      drawAnalysisVisual();

      const optsMount = document.createElement('div');
      root.append(optsMount);
      l2AppendHintWidget(root, cur, d);

      const drawOptions = () => {
        optsMount.innerHTML = '';
        const list = l2CreateRadioOptions({
          items: items.map(it => ({ label: it.label, numeric: false })),
          selectedIdx: passed ? rightOrigIdx : stepUi.selectedIdx,
          revealedRightIdx: passed ? rightOrigIdx : -1,
          wrongIndices,
          disabled: passed,
          onSelect: idx => {
            stepUi.selectedIdx = idx;
            wrongIndices = [];
            clearFeedback();
            drawOptions();
            setPrimaryButtonState('ready', 'تحقّق');
          }
        });
        optsMount.append(list);
      };
      drawOptions();

      if (passed) {
        showFeedback('good', cur.explanation || 'أحسنت! تحليل دقيق.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        setPrimaryButtonState('incomplete', 'تحقّق');
      }

      stepUi.onCheck = () => {
        const chosen = items[stepUi.selectedIdx];
        if (!chosen) return;
        if (chosen.value === cur.correctValue) {
          recordL2StepPass(cur, d);
          d.symShown = true;
          drawAnalysisVisual();
          drawOptions();
          showFeedback('good', cur.explanation || 'إجابة صحيحة!');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          sound(false);
          haptic(false);
          wrongIndices = [stepUi.selectedIdx];
          markL2StepError();
          drawOptions();
          showFeedback('bad', 'تأمّل موقع كل حرف بالنسبة للصفر (يسار أم يمين) ثم حاول مجددًا.');
          setPrimaryButtonState('wrong', 'حاول مجددًا');
        }
      };

      stepUi.onRetry = () => {
        stepUi.selectedIdx = null;
        wrongIndices = [];
        clearFeedback();
        drawOptions();
        setPrimaryButtonState('incomplete', 'تحقّق');
      };
      return;
    }

    if (cur.mode === 'fill_slots') {
      const slots = cur.slots || [];
      const minV = Number.isFinite(Number(cur.min)) ? Number(cur.min) : -7;
      const maxV = Number.isFinite(Number(cur.max)) ? Number(cur.max) : 2;
      const spanV = Math.max(1, maxV - minV);
      d.inputs = d.inputs || {};
      if (passed) {
        slots.forEach(s => {
          if (!d.inputs[s.val]) d.inputs[s.val] = String(s.accept && s.accept[0] !== undefined ? s.accept[0] : s.val);
        });
      }
      if (d.activeSlot === undefined && slots.length) d.activeSlot = slots[0].val;

      const wrap = document.createElement('div');
      wrap.className = 'l4-fslots-wrap';

      const nlCard = document.createElement('div');
      nlCard.className = 'l4-fslots-card';

      const dirRow = document.createElement('div');
      dirRow.className = 'l4-fslots-dir-row';
      dirRow.setAttribute('dir', 'ltr');
      dirRow.innerHTML =
        '<span class="l4-dir-chip is-neg">أعداد سالبة (يسار <bdi dir="ltr">0</bdi>)</span>' +
        '<span class="l4-dir-chip is-pos">أعداد موجبة (يمين <bdi dir="ltr">0</bdi>)</span>';

      const svgHost = document.createElement('div');
      svgHost.className = 'l4-fslots-svg-host';
      nlCard.append(dirRow, svgHost);

      // Compact inline keypad (all keys >= 44px, fits on 360x640 cleanly)
      const padCard = document.createElement('div');
      padCard.className = 'l4-fslots-pad';

      const dispBar = document.createElement('div');
      dispBar.className = 'l4-mread-disp';
      const dispLbl = document.createElement('span');
      dispLbl.className = 'l4-mread-disp-lbl';
      const dispVal = document.createElement('bdi');
      dispVal.className = 'l4-mread-disp-val';
      dispVal.setAttribute('dir', 'ltr');
      dispBar.append(dispLbl, dispVal);

      const signRow = document.createElement('div');
      signRow.className = 'l4-mread-signs';
      const negBtn = document.createElement('button');
      negBtn.type = 'button';
      negBtn.className = 'l4-sign-btn is-neg';
      negBtn.textContent = '− سالب';
      negBtn.setAttribute('aria-label', 'إشارة سالب');
      const posBtn = document.createElement('button');
      posBtn.type = 'button';
      posBtn.className = 'l4-sign-btn is-pos';
      posBtn.textContent = '+ موجب';
      posBtn.setAttribute('aria-label', 'إشارة موجب');
      signRow.append(negBtn, posBtn);

      const digitsGrid = document.createElement('div');
      digitsGrid.className = 'l4-mread-digits';
      digitsGrid.setAttribute('dir', 'ltr');

      padCard.append(dispBar, signRow, digitsGrid);
      wrap.append(nlCard, padCard);
      root.append(wrap);
      l2AppendHintWidget(wrap, cur, d);

      let slotWrongSet = new Set();

      const fmtDisplay = raw => {
        const s = String(raw || '').trim();
        return s ? s.replace(/^-/, '−') : '';
      };

      const checkReady = () => {
        if (passed || isL2StepPassed(cur)) return;
        const activeIdx = slots.findIndex(s => s.val === d.activeSlot);
        const activeSlot = slots[activeIdx] || slots[0];
        const activeFilled = activeSlot && l4NormalizeSigned(d.inputs[activeSlot.val]) !== '';
        const nextEmptyIdx = slots.findIndex((s, idx) => idx > activeIdx && l4NormalizeSigned(d.inputs[s.val]) === '');
        const firstEmptyIdx = nextEmptyIdx >= 0 ? nextEmptyIdx : slots.findIndex(s => l4NormalizeSigned(d.inputs[s.val]) === '');

        if (firstEmptyIdx < 0) {
          setPrimaryButtonState('ready', 'تحقّق');
        } else if (activeFilled) {
          setPrimaryButtonState('ready', 'التالي: المربع ' + ar(firstEmptyIdx + 1));
        } else {
          const needNum = activeIdx >= 0 ? (activeIdx + 1) : (firstEmptyIdx + 1);
          setPrimaryButtonState('incomplete', 'أدخل عدد المربع ' + ar(needNum));
        }
      };

      const drawSlotsLine = () => {
        const lockedNow = passed || isL2StepPassed(cur);
        const W = 360;
        const H = 104;
        const xStart = 30;
        const xEnd = 330;
        const dx = (xEnd - xStart) / spanV;
        const valToX = v => xStart + (v - minV) * dx;
        const yAxis = 34;

        let ticksSvg = '';
        for (let v = minV; v <= maxV; v++) {
          const tx = valToX(v);
          const cls = v < 0 ? 'is-neg' : (v > 0 ? 'is-pos' : 'is-zero');
          const slotIdx = slots.findIndex(s => s.val === v);
          if (slotIdx >= 0) {
            const entered = fmtDisplay(d.inputs[v]);
            const txtShow = entered || '؟';
            const isActive = d.activeSlot === v && !lockedNow;
            const isWrong = slotWrongSet.has(v);
            const pillState = lockedNow
              ? 'is-correct'
              : (isWrong ? 'is-wrong' : (isActive ? 'is-active' : (entered ? 'is-filled' : '')));
            const ariaLbl = 'المربع ' + ar(slotIdx + 1) + ' ' + txtShow;
            ticksSvg +=
              '<g class="l4-fslots-slot ' + cls + ' ' + pillState + '" data-slot-val="' + v + '" transform="translate(' + tx.toFixed(1) + ',' + yAxis + ')" role="button" tabindex="0" aria-pressed="' + (isActive ? 'true' : 'false') + '" aria-label="' + esc(ariaLbl) + '">' +
                '<circle class="l4-fslots-dot" cx="0" cy="0" r="6"/>' +
                '<line x1="0" y1="6" x2="0" y2="15" stroke="currentColor" stroke-width="1.6"/>' +
                '<g class="l4-fslots-pill" aria-hidden="true" transform="translate(0,28)">' +
                  '<rect x="-15" y="-12" width="30" height="24" rx="7"/>' +
                  '<text aria-hidden="true" x="0" y="4.5" text-anchor="middle">' + esc(txtShow) + '</text>' +
                '</g>' +
                '<rect class="l4-fslots-hit" x="-30" y="-18" width="60" height="62" rx="8" fill="transparent"/>' +
              '</g>';
          } else {
            const lbl = v === 0 ? '0' : (v > 0 ? ('+' + v) : ('−' + Math.abs(v)));
            ticksSvg +=
              '<g class="l4-fslots-tick ' + cls + '" transform="translate(' + tx.toFixed(1) + ',' + yAxis + ')">' +
                (v === 0 ? '<circle class="l4-fslots-zero-ring" cx="0" cy="0" r="9.5"/>' : '') +
                '<circle class="l4-fslots-tdot" cx="0" cy="0" r="' + (v === 0 ? '5.5' : '4') + '"/>' +
                '<text x="0" y="29" text-anchor="middle">' + esc(lbl) + '</text>' +
              '</g>';
          }
        }

        svgHost.innerHTML =
          '<svg class="l4-fslots-svg" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="خط الأعداد من ' + minV + ' إلى ' + maxV + '">' +
            '<line class="l4-fslots-spine" x1="12" y1="' + yAxis + '" x2="' + (W - 12) + '" y2="' + yAxis + '"/>' +
            '<polygon class="l4-fslots-arrow is-neg" points="8,' + yAxis + ' 17,' + (yAxis - 4.5) + ' 17,' + (yAxis + 4.5) + '"/>' +
            '<polygon class="l4-fslots-arrow is-pos" points="' + (W - 8) + ',' + yAxis + ' ' + (W - 17) + ',' + (yAxis - 4.5) + ' ' + (W - 17) + ',' + (yAxis + 4.5) + '"/>' +
            ticksSvg +
          '</svg>';

        if (!lockedNow) {
          svgHost.querySelectorAll('.l4-fslots-slot').forEach(g => {
            const valAttr = Number(g.dataset.slotVal);
            const activate = () => {
              d.activeSlot = valAttr;
              clearFeedback();
              slotWrongSet.delete(valAttr);
              drawSlotsLine();
            };
            g.addEventListener('click', activate);
            g.addEventListener('keydown', ev => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                activate();
              }
            });
          });
        }

        const idx = slots.findIndex(s => s.val === d.activeSlot);
        const curRaw = String(d.inputs[d.activeSlot] || '');
        dispLbl.textContent = 'المربع ' + ar(Math.max(1, idx + 1)) + ' من ' + ar(slots.length);
        dispVal.textContent = curRaw ? fmtDisplay(curRaw) : '...';
        dispVal.className = 'l4-mread-disp-val'
          + (curRaw.startsWith('-') ? ' is-neg' : (curRaw.startsWith('+') ? ' is-pos' : ''));
        negBtn.classList.toggle('is-active', curRaw.startsWith('-'));
        posBtn.classList.toggle('is-active', curRaw.startsWith('+'));
        negBtn.disabled = lockedNow;
        posBtn.disabled = lockedNow;
        digitsGrid.querySelectorAll('button').forEach(b => { b.disabled = lockedNow; });

        if (!lockedNow) checkReady();
      };

      const updateActiveSlotVal = nextVal => {
        if (passed || isL2StepPassed(cur)) return;
        d.inputs[d.activeSlot] = nextVal;
        slotWrongSet.delete(d.activeSlot);
        saveState();
        clearFeedback();
        drawSlotsLine();
      };

      const applySign = sgn => {
        const curVal = String(d.inputs[d.activeSlot] || '');
        const body = curVal.replace(/^[+-]/, '');
        if (curVal.startsWith(sgn)) updateActiveSlotVal(body);
        else updateActiveSlotVal(sgn + body);
      };

      negBtn.addEventListener('click', () => applySign('-'));
      posBtn.addEventListener('click', () => applySign('+'));

      [
        { label: '1', ch: '1' }, { label: '2', ch: '2' }, { label: '3', ch: '3' },
        { label: '4', ch: '4' }, { label: '5', ch: '5' }, { label: '6', ch: '6' },
        { label: '7', ch: '7' }, { label: '8', ch: '8' }, { label: '9', ch: '9' },
        { label: 'مسح', act: 'clear' }, { label: '0', ch: '0' }, { label: 'حذف', act: 'back' }
      ].forEach(k => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l4-mread-key' + (k.act ? ' is-action' : '');
        b.textContent = k.label;
        b.addEventListener('click', () => {
          if (passed || isL2StepPassed(cur)) return;
          const curVal = String(d.inputs[d.activeSlot] || '');
          if (k.act === 'clear') { updateActiveSlotVal(''); return; }
          if (k.act === 'back') { updateActiveSlotVal(curVal.slice(0, -1)); return; }
          const sign = curVal.startsWith('-') || curVal.startsWith('+') ? curVal[0] : '';
          const digits = curVal.replace(/^[+-]/, '');
          if (digits.length >= 2) return;
          updateActiveSlotVal(sign + (digits === '0' ? k.ch : digits + k.ch));
        });
        digitsGrid.append(b);
      });

      drawSlotsLine();
      if (passed) {
        showFeedback('good', cur.explanation || 'أحسنت! أكملت خط الأعداد بنجاح.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        checkReady();
      }

      stepUi.onCheck = () => {
        const activeIdx = slots.findIndex(s => s.val === d.activeSlot);
        const nextEmptyIdx = slots.findIndex((s, idx) => idx > activeIdx && l4NormalizeSigned(d.inputs[s.val]) === '');
        const firstEmptyIdx = nextEmptyIdx >= 0 ? nextEmptyIdx : slots.findIndex(s => l4NormalizeSigned(d.inputs[s.val]) === '');
        if (firstEmptyIdx >= 0) {
          d.activeSlot = slots[firstEmptyIdx].val;
          saveState();
          clearFeedback();
          drawSlotsLine();
          return;
        }
        const wrongSlots = slots.filter(s => !l4MatchesAccept(d.inputs[s.val], s.accept));
        if (wrongSlots.length === 0) {
          recordL2StepPass(cur, d);
          slotWrongSet = new Set();
          drawSlotsLine();
          showFeedback('good', cur.explanation || 'إتقان كامل!');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          sound(false);
          haptic(false);
          slotWrongSet = new Set(wrongSlots.map(s => s.val));
          d.activeSlot = wrongSlots[0].val;
          markL2StepError();
          drawSlotsLine();
          const hasZeroErr = wrongSlots.some(s => l4HasSignedZeroError(d.inputs[s.val]));
          showFeedback('bad', hasZeroErr ? 'الصفر ليس سالبًا ولا موجبًا؛ أدخل العدد الصحيح.' : 'بعض المربعات تحتاج مراجعة. عدّ الخطوات من الصفر وحاول مجددًا.');
          setPrimaryButtonState('wrong', 'حاول مجددًا');
        }
      };

      stepUi.onRetry = () => {
        slotWrongSet = new Set();
        clearFeedback();
        drawSlotsLine();
        checkReady();
      };
      return;
    }

    // tap_pick mode (Mobile-First Full-Span SVG Number Line)
    const minVal = Number.isFinite(Number(cur.min)) ? Number(cur.min) : -5;
    const maxVal = Number.isFinite(Number(cur.max)) ? Number(cur.max) : 5;
    if (passed) d.picked = cur.target;
    let isWrong = false;

    const promptEl = byId('l1-prompt');
    if (promptEl && cur.prompt) {
      promptEl.hidden = false;
      promptEl.innerHTML = l2BidiTextHTML(cur.prompt);
    }

    const wrap = document.createElement('div');
    wrap.className = 'l4-nline-exp-view';

    const instr = document.createElement('p');
    instr.className = 'l4-nline-exp-instr';
    instr.innerHTML = l2BidiTextHTML(cur.instruction || 'اضغط على خط الأعداد أو حرّك المؤشر إلى الموقع الصحيح');

    const getThumbColor = (val) => {
      const done = passed || isL2StepPassed(cur);
      if (done) return '#0f6b4b';
      if (isWrong) return '#a82834';
      return val < 0 ? '#a82834' : (val > 0 ? '#0f5d84' : '#102a24');
    };

    let widget = null;
    const syncTapPickUI = () => {
      if (!widget) return;
      const done = passed || isL2StepPassed(cur);
      widget.updateVisual();
      const hasPick = d.picked !== undefined && d.picked !== null && Number.isFinite(Number(d.picked));
      if (!hasPick) {
        widget.bigValEl.className = 'l4-nline-big-val is-zero';
        widget.bigValEl.textContent = '؟';
        widget.explainTxtEl.className = 'l4-nline-exp-text is-muted';
        widget.explainTxtEl.textContent = 'اضغط على خط الأعداد أو استخدم الأسهم للاختيار';
      } else {
        const v = Number(d.picked);
        const cls = v < 0 ? 'is-neg' : (v > 0 ? 'is-pos' : 'is-zero');
        const lbl = widget.formatSigned(v);
        widget.bigValEl.className = 'l4-nline-big-val ' + cls;
        widget.bigValEl.textContent = lbl;
        widget.explainTxtEl.className = 'l4-nline-exp-text';
        widget.explainTxtEl.innerHTML = 'الموقع المختار: <bdi class="l4-temp-bdi ' + cls + '" dir="ltr">' + esc(lbl) + '</bdi>';
      }
      if (!done && !isWrong) {
        setPrimaryButtonState(hasPick ? 'ready' : 'incomplete', 'تحقّق');
      }
    };

    widget = createInteractiveNumberLineWidget({
      minVal,
      maxVal,
      getValue: () => d.picked,
      isThumbVisible: () => d.picked !== undefined && d.picked !== null && Number.isFinite(Number(d.picked)),
      getThumbColor,
      isDisabled: () => passed || isL2StepPassed(cur),
      onSelectValue: (snapped) => {
        if (passed || isL2StepPassed(cur)) return;
        d.picked = snapped;
        isWrong = false;
        clearFeedback();
        saveState();
        syncTapPickUI();
      }
    });

    wrap.append(instr, widget.surfaceEl);
    root.append(wrap);
    l2AppendHintWidget(root, cur, d);

    syncTapPickUI();
    if (passed) {
      showFeedback('good', cur.explanation || 'إجابة صحيحة!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState(d.picked !== undefined ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (d.picked === undefined) return;
      if (Number(d.picked) === Number(cur.target)) {
        recordL2StepPass(cur, d);
        isWrong = false;
        syncTapPickUI();
        showFeedback('good', cur.explanation || 'أحسنت! موقع دقيق.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        isWrong = true;
        markL2StepError();
        syncTapPickUI();
        const nudge = cur.target < 0
          ? 'العدد المطلوب سالب؛ عدّ الخطوات إلى يسار الصفر.'
          : 'العدد المطلوب موجب؛ عدّ الخطوات إلى يمين الصفر.';
        showFeedback('bad', nudge);
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      d.picked = undefined;
      isWrong = false;
      clearFeedback();
      syncTapPickUI();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function renderL4VerticalScaleStep(cur, root) {
    const d = l2StepData(cur);
    const itemsList = cur.items || [];
    const promptEl = byId('l1-prompt');
    let sceneWidget = null;

    const registerCleanup = () => {
      if (sceneWidget && typeof sceneWidget.destroy === 'function') {
        stepCleanupFn = () => sceneWidget.destroy();
      }
    };

    if (cur.exploreFirst) {
      if (!Array.isArray(d.exploredIndices)) d.exploredIndices = [];
      const exploredSet = new Set(d.exploredIndices);

      const renderExploreOrQuestion = () => {
        const passed = isL2StepPassed(cur);
        if (sceneWidget && typeof sceneWidget.destroy === 'function') sceneWidget.destroy();
        if (!d.subPhase) d.subPhase = passed ? 'question' : 'explore';
        if (passed && d.subPhase === 'explore') d.subPhase = 'question';

        root.replaceChildren();
        clearFeedback();

        const inExplore = d.subPhase === 'explore' && !passed;
        if (promptEl) {
          if (inExplore) {
            promptEl.hidden = false;
            promptEl.textContent = cur.title || 'فوق سطح البحر وتحته';
          } else {
            promptEl.hidden = true;
          }
        }

        const wrap = document.createElement('div');
        wrap.className = 'l4-vscene-wrap ' + (inExplore ? 'is-explore-phase' : 'is-question-phase');

        if (inExplore) {
          const instr = document.createElement('p');
          instr.className = 'l4-vscene-instr';
          instr.innerHTML = l2BidiTextHTML(cur.exploreInstruction || 'اضغط على العناصر واستكشف موقعها بالنسبة لسطح البحر');
          wrap.append(instr);
        } else {
          const qHeader = document.createElement('div');
          qHeader.className = 'l4-vscene-qhead';
          const qText = document.createElement('h2');
          qText.className = 'l4-vscene-qtitle';
          qText.innerHTML = formatPromptHTML(cur.prompt || 'ماذا يمثّل الصفر في الشكل؟');
          qHeader.append(qText);
          if (!passed) {
            const backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'l4-vscene-back-btn';
            backBtn.textContent = 'العودة للاستكشاف';
            backBtn.addEventListener('click', () => {
              d.subPhase = 'explore';
              saveState();
              renderExploreOrQuestion();
            });
            qHeader.append(backBtn);
          }
          wrap.append(qHeader);
        }

        const chipsBar = document.createElement('div');
        chipsBar.className = 'l4-vscene-progress';
        chipsBar.setAttribute('role', 'group');
        chipsBar.setAttribute('aria-label', 'عناصر المشهد التفاعلي');
        const chipNodes = itemsList.map((it, idx) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'l4-vscene-chip';
          chip.textContent = it.label;
          chip.setAttribute('aria-pressed', 'false');
          chip.addEventListener('click', () => {
            if (sceneWidget && typeof sceneWidget.select === 'function') {
              sceneWidget.select(idx, true);
            }
          });
          chipsBar.append(chip);
          return chip;
        });

        const syncChipsAndCta = () => {
          itemsList.forEach((_, idx) => {
            if (!chipNodes[idx]) return;
            const isAct = d.inspectedIdx === idx;
            chipNodes[idx].classList.toggle('is-done', exploredSet.has(idx));
            chipNodes[idx].classList.toggle('is-active', isAct);
            chipNodes[idx].setAttribute('aria-pressed', String(isAct));
          });
          if (inExplore) {
            const allExplored = exploredSet.size >= itemsList.length;
            setPrimaryButtonState(allExplored ? 'ready' : 'incomplete', 'انتقل للسؤال');
          }
        };

        sceneWidget = global.L4Visuals.createVerticalSceneWidget({
          theme: cur.scaleMode || 'sea',
          items: itemsList,
          unitText: cur.unitText || 'م',
          zeroLabel: cur.zeroLabel || 'سطح البحر: 0 م',
          maskItemIndices: [],
          revealedMask: true,
          compact: !inExplore,
          selectedIdx: Number.isInteger(d.inspectedIdx) ? d.inspectedIdx : null,
          exploredIndices: Array.from(exploredSet),
          highlightZero: passed,
          lockZeroHighlight: passed,
          showReplay: inExplore,
          showDistanceNote: inExplore,
          initialPrompt: inExplore
            ? 'اضغط على الطائرة أو القارب أو السمكة لقياس موقعها.'
            : 'اضغط أي عنصر في المشهد لمراجعة موقعه من الصفر.',
          formatText: l2BidiTextHTML,
          onSelect: (idx) => {
            d.inspectedIdx = idx;
            exploredSet.add(idx);
            d.exploredIndices = Array.from(exploredSet);
            saveState();
            syncChipsAndCta();
          }
        });
        registerCleanup();
        wrap.append(sceneWidget.el);

        if (inExplore) {
          wrap.append(chipsBar);
          root.append(wrap);
          syncChipsAndCta();
          stepUi.onCheck = () => {
            if (exploredSet.size < itemsList.length) return;
            d.subPhase = 'question';
            saveState();
            renderExploreOrQuestion();
          };
          stepUi.onRetry = null;
          return;
        }

        // Phase 2: MCQ Question
        l2EnsureShuffledOptions(cur, d);
        const opts = cur.options || [];
        let wrongIndices = [];
        const rightIdx = opts.findIndex(o => o.value === cur.correctValue);
        const optsMount = document.createElement('div');
        optsMount.className = 'l4-vscene-opts';
        wrap.append(optsMount);
        root.append(wrap);

        const drawOpts = () => {
          const locked = passed || isL2StepPassed(cur);
          optsMount.replaceChildren(l2CreateRadioOptions({
            items: opts.map(o => ({ label: o.label, numeric: false })),
            selectedIdx: locked ? rightIdx : stepUi.selectedIdx,
            revealedRightIdx: locked ? rightIdx : -1,
            wrongIndices,
            disabled: locked,
            onSelect: idx => {
              stepUi.selectedIdx = idx;
              wrongIndices = [];
              clearFeedback();
              drawOpts();
              setPrimaryButtonState('ready', 'تحقّق');
            }
          }));
        };
        drawOpts();

        if (passed) {
          sceneWidget.setHighlightZero(true);
          showFeedback('good', cur.explanation || 'صحيح! سطح البحر هو المستوى المرجعي الذي نمثّله بالصفر');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          setPrimaryButtonState(Number.isInteger(stepUi.selectedIdx) ? 'ready' : 'incomplete', 'تحقّق');
        }

        stepUi.onCheck = () => {
          const chosen = opts[stepUi.selectedIdx];
          if (!chosen) return;
          if (chosen.value === cur.correctValue) {
            recordL2StepPass(cur, d);
            sceneWidget.setHighlightZero(true);
            drawOpts();
            showFeedback('good', cur.explanation || 'صحيح! سطح البحر هو المستوى المرجعي الذي نمثّله بالصفر');
            setPrimaryButtonState('correct', l2PassPrimaryLabel());
          } else {
            sound(false);
            haptic(false);
            wrongIndices = [stepUi.selectedIdx];
            markL2StepError();
            drawOpts();
            showFeedback('bad', cur.wrongHint || 'انظر أين يطفو القارب عند الخط الفاصل (0 م) بين السماء والماء.');
            setPrimaryButtonState('wrong', 'حاول مجددًا');
          }
        };

        stepUi.onRetry = () => {
          stepUi.selectedIdx = null;
          wrongIndices = [];
          clearFeedback();
          drawOpts();
          setPrimaryButtonState('incomplete', 'تحقّق');
        };
      };

      renderExploreOrQuestion();
      return;
    }

    // Standard practice / assessment slide with shared animated vertical scene
    const passed = isL2StepPassed(cur);
    const wrap = document.createElement('div');
    wrap.className = 'l4-vscene-wrap is-question-phase';

    sceneWidget = global.L4Visuals.createVerticalSceneWidget({
      theme: cur.scaleMode || 'sea',
      items: itemsList,
      unitText: cur.unitText || (cur.scaleMode === 'tower' ? 'طابق' : 'م'),
      zeroLabel: cur.zeroLabel || (cur.scaleMode === 'tower' ? 'سطح الأرض: 0' : 'سطح البحر: 0 م'),
      maskItemIndices: cur.maskItemIndices || [],
      revealedMask: passed,
      compact: true,
      selectedIdx: Number.isInteger(d.inspectedIdx) ? d.inspectedIdx : null,
      exploredIndices: Array.isArray(d.exploredIndices) ? d.exploredIndices : [],
      highlightZero: passed && cur.correctValue === 'الدلفين',
      lockZeroHighlight: passed && cur.correctValue === 'الدلفين',
      showReplay: true,
      showDistanceNote: false,
      initialPrompt: 'اضغط على أي عنصر في المشهد لقياس ارتفاعه أو عمقه من الصفر.',
      formatText: l2BidiTextHTML,
      onSelect: (idx) => {
        d.inspectedIdx = idx;
        if (!Array.isArray(d.exploredIndices)) d.exploredIndices = [];
        if (!d.exploredIndices.includes(idx)) d.exploredIndices.push(idx);
        saveState();
      }
    });
    registerCleanup();
    wrap.append(sceneWidget.el);
    root.append(wrap);

    if (cur.inputMode === 'choice') {
      l2EnsureShuffledOptions(cur, d);
      const opts = cur.options || [];
      let wrongIndices = [];
      const rightIdx = opts.findIndex(o => o.value === cur.correctValue);
      const optsMount = document.createElement('div');
      optsMount.className = 'l4-vscene-opts';
      wrap.append(optsMount);
      l2AppendHintWidget(wrap, cur, d);

      const drawOpts = () => {
        const locked = passed || isL2StepPassed(cur);
        optsMount.replaceChildren(l2CreateRadioOptions({
          items: opts.map(o => ({ label: o.label, numeric: false })),
          selectedIdx: locked ? rightIdx : stepUi.selectedIdx,
          revealedRightIdx: locked ? rightIdx : -1,
          wrongIndices,
          disabled: locked,
          onSelect: idx => {
            stepUi.selectedIdx = idx;
            wrongIndices = [];
            clearFeedback();
            drawOpts();
            setPrimaryButtonState('ready', 'تحقّق');
          }
        }));
      };
      drawOpts();

      if (passed) {
        sceneWidget.revealMasked();
        showFeedback('good', cur.explanation || 'أحسنت!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        setPrimaryButtonState('incomplete', 'تحقّق');
      }

      stepUi.onCheck = () => {
        const chosen = opts[stepUi.selectedIdx];
        if (!chosen) return;
        if (chosen.value === cur.correctValue) {
          recordL2StepPass(cur, d);
          sceneWidget.revealMasked();
          if (cur.correctValue === 'الدلفين') sceneWidget.setHighlightZero(true);
          drawOpts();
          showFeedback('good', cur.explanation || 'إجابة صحيحة!');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          sound(false);
          haptic(false);
          wrongIndices = [stepUi.selectedIdx];
          markL2StepError();
          drawOpts();
          showFeedback('bad', cur.wrongHint || 'راجِع موقعه على المقياس العمودي بالنسبة إلى الصفر.');
          setPrimaryButtonState('wrong', 'حاول مجددًا');
        }
      };

      stepUi.onRetry = () => {
        stepUi.selectedIdx = null;
        wrongIndices = [];
        clearFeedback();
        drawOpts();
        setPrimaryButtonState('incomplete', 'تحقّق');
      };
      return;
    }

    // signed numeric input mode
    if (passed && !d.typed && cur.acceptValues && cur.acceptValues.length) {
      d.typed = String(cur.acceptValues[0]);
    }
    const keypadMount = document.createElement('div');
    keypadMount.className = 'l4-vscene-keypad';
    wrap.append(keypadMount);
    l2AppendHintWidget(wrap, cur, d);

    const keypad = l4CreateSignedKeypad({
      label: cur.unitLabel || 'اكتب العدد المناسب',
      getValue: () => d.typed || '',
      setValue: val => {
        d.typed = val;
        saveState();
        clearFeedback();
      },
      isDisabled: () => passed || isL2StepPassed(cur),
      onChange: val => {
        if (!passed && !isL2StepPassed(cur)) {
          setPrimaryButtonState(l4NormalizeSigned(val) !== '' ? 'ready' : 'incomplete', 'تحقّق');
        }
      }
    });
    keypadMount.append(keypad);

    if (passed) {
      sceneWidget.revealMasked();
      showFeedback('good', cur.explanation || 'أحسنت!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState(l4NormalizeSigned(d.typed) !== '' ? 'ready' : 'incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      if (l4MatchesAccept(d.typed, cur.acceptValues)) {
        recordL2StepPass(cur, d);
        sceneWidget.revealMasked();
        keypad.refresh();
        showFeedback('good', cur.explanation || 'إجابة دقيقة!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        markL2StepError();
        showFeedback('bad', 'تأكد من إشارة السالب (-) إذا كان الموقع تحت مستوى المرجع (0) ومن قيمة العدد.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      d.typed = '';
      clearFeedback();
      keypad.refresh();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function renderL4TwoStepAdjust(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const minVal = Number.isFinite(Number(cur.min)) ? Number(cur.min) : -10;
    const maxVal = Number.isFinite(Number(cur.max)) ? Number(cur.max) : 10;
    const stepSize = Number.isFinite(Number(cur.stepSize)) && Number(cur.stepSize) > 0 ? Number(cur.stepSize) : 1;
    const initVal = Number.isFinite(Number(cur.initialTemp)) ? Number(cur.initialTemp) : 0;
    const targetVal = Number.isFinite(Number(cur.targetTemp)) ? Number(cur.targetTemp) : -3;
    const unit = cur.unitLabel || '°C';

    if (d.temp === undefined || !Number.isFinite(Number(d.temp))) {
      d.temp = passed ? targetVal : initVal;
    }
    if (passed) {
      d.temp = targetVal;
      d.sign = targetVal < 0 ? '-' : (targetVal > 0 ? '+' : '');
      d.digits = String(Math.abs(targetVal));
      d.typed = (d.sign || '') + d.digits;
      d.subPhase = 'input';
    } else {
      if (d.sign === undefined || d.digits === undefined) {
        const raw = String(d.typed || '').replace(/\u2212/g, '-');
        if (raw && (raw[0] === '-' || raw[0] === '+')) {
          d.sign = raw[0];
          d.digits = raw.slice(1).replace(/\D/g, '');
        } else {
          d.sign = '';
          d.digits = raw.replace(/\D/g, '');
        }
      }
      if (d.subPhase !== 'adjust' && d.subPhase !== 'input') {
        d.subPhase = 'adjust';
      }
    }

    let feedbackState = passed
      ? { kind: 'good', msg: cur.explanation || 'أحسنت! −3 تعني ثلاث درجات تحت الصفر', showBackToThermo: false }
      : null;

    const formatSignedVal = (n, showUnit) => {
      const num = Number(n) || 0;
      const txt = num < 0 ? ('−' + Math.abs(num)) : (num > 0 ? ('+' + num) : '0');
      return showUnit ? (txt + unit) : txt;
    };

    const tempClass = (n) => (n < 0 ? 'is-neg' : (n > 0 ? 'is-pos' : 'is-zero'));

    const wrap = document.createElement('div');
    wrap.className = 'l4-adjust-view';

    const taskEl = document.createElement('p');
    taskEl.className = 'l4-adjust-task';
    taskEl.innerHTML = cur.taskText
      ? l2BidiTextHTML(cur.taskText)
      : 'الحرارة في الشوبك <bdi class="l4-temp-bdi is-plain" dir="ltr">3</bdi> درجات تحت الصفر';

    const stepperEl = document.createElement('div');
    stepperEl.className = 'l4-adjust-stepper';
    stepperEl.setAttribute('aria-label', 'خطوات النشاط');

    const step1Pill = document.createElement('button');
    step1Pill.type = 'button';
    step1Pill.className = 'l4-adjust-step-pill';
    const step2Pill = document.createElement('div');
    step2Pill.className = 'l4-adjust-step-pill';
    stepperEl.append(step1Pill, step2Pill);

    const contentMount = document.createElement('div');
    contentMount.className = 'l4-adjust-content';

    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'l4-adjust-feedback';
    feedbackEl.setAttribute('role', 'status');
    feedbackEl.setAttribute('aria-live', 'polite');

    wrap.append(taskEl, stepperEl, contentMount, feedbackEl);
    root.append(wrap);

    const checkIconSVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    const upArrowSVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    const downArrowSVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';
    const errIconSVG = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    // Persistent references for adjust phase so thermometer SVG animates smoothly in place
    let thermoWrapRef = null;
    let readoutValRef = null;
    let upBtnRef = null;
    let downBtnRef = null;
    let resetBtnRef = null;

    // Persistent references for input phase
    let fieldBoxRef = null;
    let negBtnRef = null;
    let posBtnRef = null;

    const renderStepper = () => {
      const inAdjust = d.subPhase === 'adjust';
      const locked = passed || isL2StepPassed(cur);
      step1Pill.className = 'l4-adjust-step-pill ' + (inAdjust ? 'is-active' : 'is-done');
      step1Pill.disabled = inAdjust || locked;
      step1Pill.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (inAdjust ? '1' : checkIconSVG) + '</span><span>حرّك الميزان</span>';

      step2Pill.className = 'l4-adjust-step-pill ' + (locked ? 'is-done' : (inAdjust ? 'is-upcoming' : 'is-active'));
      step2Pill.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (locked ? checkIconSVG : '2') + '</span><span>اكتب درجة الحرارة</span>';
    };

    const renderFeedbackBanner = () => {
      if (!feedbackState) {
        feedbackEl.hidden = true;
        feedbackEl.className = 'l4-adjust-feedback';
        feedbackEl.replaceChildren();
        return;
      }
      feedbackEl.hidden = false;
      feedbackEl.className = 'l4-adjust-feedback ' + (feedbackState.kind === 'good' ? 'is-good' : 'is-bad');
      feedbackEl.replaceChildren();

      const row = document.createElement('div');
      row.className = 'l4-adjust-feedback-row';

      const ico = document.createElement('span');
      ico.className = 'l4-adjust-feedback-ico';
      ico.innerHTML = feedbackState.kind === 'good' ? checkIconSVG : errIconSVG;

      const txt = document.createElement('span');
      txt.className = 'l4-adjust-feedback-txt';
      txt.innerHTML = l2BidiTextHTML(feedbackState.msg);

      row.append(ico, txt);
      feedbackEl.append(row);

      if (feedbackState.showBackToThermo && !passed && !isL2StepPassed(cur)) {
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'l4-adjust-back-btn';
        backBtn.textContent = 'العودة إلى الميزان';
        backBtn.addEventListener('click', () => {
          d.subPhase = 'adjust';
          feedbackState = null;
          saveState();
          renderPhase();
        });
        feedbackEl.append(backBtn);
      }
    };

    const syncAdjustControls = () => {
      const locked = passed || isL2StepPassed(cur);
      if (readoutValRef) {
        readoutValRef.className = 'l4-adjust-readout-val ' + tempClass(d.temp);
        readoutValRef.textContent = formatSignedVal(d.temp, true);
      }
      if (upBtnRef) upBtnRef.disabled = locked || d.temp >= maxVal;
      if (downBtnRef) downBtnRef.disabled = locked || d.temp <= minVal;
      if (resetBtnRef) resetBtnRef.disabled = locked || d.temp === 0;
      if (thermoWrapRef && global.L4Visuals && typeof global.L4Visuals.updateHeroThermometerSVG === 'function') {
        global.L4Visuals.updateHeroThermometerSVG(thermoWrapRef, d.temp, { showMarker: true, min: minVal, max: maxVal });
      }
    };

    const syncInputControls = () => {
      const locked = passed || isL2StepPassed(cur);
      const signSym = d.sign === '-' ? '−' : (d.sign === '+' ? '+' : '');
      const disp = signSym + (d.digits || '');
      d.typed = (d.sign || '') + (d.digits || '');

      if (fieldBoxRef) {
        fieldBoxRef.className = 'l4-adjust-field-box' + (disp ? ' has-value' : '') + (d.sign === '-' ? ' is-neg' : (d.sign === '+' ? ' is-pos' : ''));
        fieldBoxRef.textContent = disp;
      }
      if (negBtnRef) {
        negBtnRef.classList.toggle('is-selected', d.sign === '-');
        negBtnRef.setAttribute('aria-pressed', d.sign === '-' ? 'true' : 'false');
        negBtnRef.disabled = locked;
      }
      if (posBtnRef) {
        posBtnRef.classList.toggle('is-selected', d.sign === '+');
        posBtnRef.setAttribute('aria-pressed', d.sign === '+' ? 'true' : 'false');
        posBtnRef.disabled = locked;
      }

      contentMount.querySelectorAll('.l4-adjust-key').forEach(btn => {
        btn.disabled = locked;
      });

      if (locked) {
        setPrimaryButtonState('correct', 'متابعة');
      } else {
        const ready = (d.sign === '-' || d.sign === '+') && String(d.digits || '').length > 0;
        setPrimaryButtonState(ready ? 'ready' : 'incomplete', 'تحقّق');
      }
    };

    const buildAdjustPhase = () => {
      contentMount.replaceChildren();
      const surface = document.createElement('div');
      surface.className = 'l4-adjust-surface';

      const grid = document.createElement('div');
      grid.className = 'l4-adjust-grid';

      const ctrl = document.createElement('div');
      ctrl.className = 'l4-adjust-controls';

      const readout = document.createElement('div');
      readout.className = 'l4-adjust-readout';
      const rLbl = document.createElement('span');
      rLbl.className = 'l4-adjust-readout-lbl';
      rLbl.textContent = 'القراءة الحالية';
      readoutValRef = document.createElement('bdi');
      readoutValRef.className = 'l4-adjust-readout-val';
      readoutValRef.setAttribute('dir', 'ltr');
      readout.append(rLbl, readoutValRef);

      upBtnRef = document.createElement('button');
      upBtnRef.type = 'button';
      upBtnRef.className = 'l4-adjust-arrow-btn is-up';
      upBtnRef.setAttribute('aria-label', stepSize === 1 ? 'ارفع درجة واحدة' : ('ارفع ' + stepSize + ' درجات'));
      upBtnRef.innerHTML = upArrowSVG + (stepSize > 1 ? ' <bdi dir="ltr">+' + stepSize + '</bdi>' : '');
      upBtnRef.addEventListener('click', () => {
        if (d.temp >= maxVal || passed) return;
        d.temp = Math.min(maxVal, d.temp + stepSize);
        d.interacted = true;
        saveState();
        syncAdjustControls();
      });

      downBtnRef = document.createElement('button');
      downBtnRef.type = 'button';
      downBtnRef.className = 'l4-adjust-arrow-btn is-down';
      downBtnRef.setAttribute('aria-label', stepSize === 1 ? 'اخفض درجة واحدة' : ('اخفض ' + stepSize + ' درجات'));
      downBtnRef.innerHTML = downArrowSVG + (stepSize > 1 ? ' <bdi dir="ltr">−' + stepSize + '</bdi>' : '');
      downBtnRef.addEventListener('click', () => {
        if (d.temp <= minVal || passed) return;
        d.temp = Math.max(minVal, d.temp - stepSize);
        d.interacted = true;
        saveState();
        syncAdjustControls();
      });

      resetBtnRef = document.createElement('button');
      resetBtnRef.type = 'button';
      resetBtnRef.className = 'l4-adjust-reset-btn';
      resetBtnRef.textContent = 'إعادة للصفر';
      resetBtnRef.addEventListener('click', () => {
        if (d.temp === 0 || passed) return;
        d.temp = 0;
        d.interacted = true;
        saveState();
        syncAdjustControls();
      });

      ctrl.append(readout, upBtnRef, downBtnRef, resetBtnRef);

      thermoWrapRef = document.createElement('div');
      thermoWrapRef.className = 'l4-adjust-thermo-wrap';
      thermoWrapRef.innerHTML = global.L4Visuals && typeof global.L4Visuals.buildHeroThermometerSVG === 'function'
        ? global.L4Visuals.buildHeroThermometerSVG(d.temp, { showMarker: true, min: minVal, max: maxVal })
        : '';

      grid.append(ctrl, thermoWrapRef);
      surface.append(grid);
      contentMount.append(surface);

      syncAdjustControls();
      setPrimaryButtonState('ready', 'تثبيت القراءة');
    };

    const applySignChoice = (sgn) => {
      if (passed || isL2StepPassed(cur)) return;
      d.sign = (d.sign === sgn) ? '' : sgn;
      feedbackState = null;
      saveState();
      renderFeedbackBanner();
      syncInputControls();
    };

    const appendDigitChoice = (ch) => {
      if (passed || isL2StepPassed(cur)) return;
      const curDigits = String(d.digits || '');
      if (curDigits.length >= 3) return;
      d.digits = curDigits === '0' ? ch : (curDigits + ch);
      feedbackState = null;
      saveState();
      renderFeedbackBanner();
      syncInputControls();
    };

    const backspaceChoice = () => {
      if (passed || isL2StepPassed(cur)) return;
      const curDigits = String(d.digits || '');
      if (curDigits.length > 0) {
        d.digits = curDigits.slice(0, -1);
      } else if (d.sign) {
        d.sign = '';
      } else {
        return;
      }
      feedbackState = null;
      saveState();
      renderFeedbackBanner();
      syncInputControls();
    };

    const buildInputPhase = () => {
      contentMount.replaceChildren();
      const locked = passed || isL2StepPassed(cur);

      const summaryBar = document.createElement('div');
      summaryBar.className = 'l4-adjust-summary';
      const sumInfo = document.createElement('span');
      sumInfo.className = 'l4-adjust-summary-txt';
      sumInfo.innerHTML = 'قراءتك على الميزان: <bdi class="l4-temp-bdi ' + tempClass(d.temp) + '" dir="ltr">' + esc(formatSignedVal(d.temp, true)) + '</bdi>';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'l4-adjust-edit-btn';
      editBtn.textContent = 'تعديل الميزان';
      editBtn.disabled = locked;
      editBtn.addEventListener('click', () => {
        if (locked) return;
        d.subPhase = 'adjust';
        feedbackState = null;
        saveState();
        renderPhase();
      });
      summaryBar.append(sumInfo, editBtn);

      const inputCard = document.createElement('div');
      inputCard.className = 'l4-adjust-input-surface';

      const fieldRow = document.createElement('div');
      fieldRow.className = 'l4-adjust-field-row';

      const fieldLbl = document.createElement('span');
      fieldLbl.className = 'l4-adjust-field-lbl';
      fieldLbl.textContent = 'درجة الحرارة بالأرقام';

      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'l4-adjust-field-group';
      fieldBoxRef = document.createElement('div');
      fieldBoxRef.className = 'l4-adjust-field-box';
      fieldBoxRef.setAttribute('dir', 'ltr');
      fieldBoxRef.setAttribute('role', 'textbox');
      fieldBoxRef.setAttribute('aria-readonly', 'true');
      fieldBoxRef.setAttribute('aria-label', 'درجة الحرارة بالأرقام');

      const unitOut = document.createElement('span');
      unitOut.className = 'l4-adjust-unit';
      unitOut.setAttribute('dir', 'ltr');
      unitOut.textContent = unit;
      fieldGroup.append(fieldBoxRef, unitOut);

      fieldRow.append(fieldLbl, fieldGroup);

      const signsRow = document.createElement('div');
      signsRow.className = 'l4-adjust-signs';
      signsRow.setAttribute('role', 'group');
      signsRow.setAttribute('aria-label', 'إشارة العدد');

      const makeSignBtn = (sgn, labelText, cls) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l4-adjust-sign-btn ' + cls;
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML =
          '<span class="l4-adjust-sign-txt">' + esc(labelText) + '</span>'
          + '<span class="l4-adjust-sign-check" aria-hidden="true">' + checkIconSVG + '</span>';
        b.addEventListener('click', () => applySignChoice(sgn));
        return b;
      };

      negBtnRef = makeSignBtn('-', '− سالب', 'is-neg');
      posBtnRef = makeSignBtn('+', '+ موجب', 'is-pos');
      signsRow.append(negBtnRef, posBtnRef);

      const digitsGrid = document.createElement('div');
      digitsGrid.className = 'l4-adjust-digits';
      digitsGrid.setAttribute('dir', 'ltr');

      const keyDefs = [
        { label: '1', ch: '1' }, { label: '2', ch: '2' }, { label: '3', ch: '3' },
        { label: '4', ch: '4' }, { label: '5', ch: '5' }, { label: '6', ch: '6' },
        { label: '7', ch: '7' }, { label: '8', ch: '8' }, { label: '9', ch: '9' },
        { label: '0', ch: '0', spanTwo: true },
        { label: 'حذف', act: 'back', aria: 'حذف آخر رقم' }
      ];

      keyDefs.forEach(k => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l4-adjust-key' + (k.spanTwo ? ' is-zero-wide' : '') + (k.act ? ' is-back' : '');
        b.textContent = k.label;
        if (k.aria) b.setAttribute('aria-label', k.aria);
        b.addEventListener('click', () => {
          if (k.act === 'back') backspaceChoice();
          else appendDigitChoice(k.ch);
        });
        digitsGrid.append(b);
      });

      inputCard.append(fieldRow, signsRow, digitsGrid);
      contentMount.append(summaryBar, inputCard);

      syncInputControls();
    };

    const renderPhase = () => {
      clearFeedback();
      renderStepper();
      if (d.subPhase === 'adjust') {
        buildAdjustPhase();
      } else {
        buildInputPhase();
      }
      renderFeedbackBanner();
      renderTopbar();
    };

    step1Pill.addEventListener('click', () => {
      if (d.subPhase === 'adjust' || passed || isL2StepPassed(cur)) return;
      d.subPhase = 'adjust';
      feedbackState = null;
      saveState();
      renderPhase();
    });

    l3KeyListener = (e) => {
      if (!wrap.isConnected || passed || isL2StepPassed(cur)) return;
      if (document.querySelector('dialog[open]')) return;
      if (d.subPhase === 'adjust') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          upBtnRef?.click();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          downBtnRef?.click();
        } else if (e.key === '0') {
          e.preventDefault();
          resetBtnRef?.click();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          byId('l1-primary-btn')?.click();
        }
      } else {
        const ch = normalizeDigits(e.key);
        if (/^\d$/.test(ch)) {
          e.preventDefault();
          appendDigitChoice(ch);
        } else if (e.key === '-' || e.key === '+') {
          e.preventDefault();
          applySignChoice(e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          backspaceChoice();
        } else if (e.key === 'Enter') {
          const pBtn = byId('l1-primary-btn');
          if (pBtn && !pBtn.disabled) {
            e.preventDefault();
            pBtn.click();
          }
        }
      }
    };
    global.addEventListener('keydown', l3KeyListener);

    stepUi.onCheck = () => {
      if (d.subPhase === 'adjust') {
        d.subPhase = 'input';
        feedbackState = null;
        saveState();
        renderPhase();
        return;
      }

      if (cur.requireInteractive && Number(d.temp) !== targetVal) {
        sound(false);
        haptic(false);
        markL2StepError();
        feedbackState = {
          kind: 'bad',
          msg: cur.adjustWrongMsg || ('راجع موضع المؤشر: نحتاج ' + Math.abs(targetVal) + ' درجات ' + (targetVal < 0 ? 'أسفل الصفر' : 'فوق الصفر')),
          showBackToThermo: true
        };
        renderFeedbackBanner();
        if (stepUi.needsRecharge) setPrimaryButtonState('wrong');
        return;
      }

      if (l4MatchesAccept(d.typed, cur.acceptValues)) {
        recordL2StepPass(cur, d);
        feedbackState = {
          kind: 'good',
          msg: cur.explanation || 'أحسنت! −3 تعني ثلاث درجات تحت الصفر',
          showBackToThermo: false
        };
        renderPhase();
      } else {
        sound(false);
        haptic(false);
        markL2StepError();
        const targetAbs = String(Math.abs(targetVal));
        let errMsg = 'تذكّر: الحرارة «تحت الصفر» تعني إشارة السالب (−) مع عدد الدرجات.';
        if (d.sign !== '-' && targetVal < 0 && String(d.digits) === targetAbs) {
          errMsg = 'الرقم ' + targetAbs + ' صحيح، لكن الحرارة «تحت الصفر»؛ اختر إشارة السالب (−).';
        } else if (d.sign !== '+' && targetVal > 0 && String(d.digits) === targetAbs) {
          errMsg = 'الرقم ' + targetAbs + ' صحيح، لكن الحرارة «فوق الصفر»؛ اختر إشارة الموجب (+).';
        } else if (d.sign === '-' && String(d.digits) !== targetAbs) {
          errMsg = 'إشارة السالب (−) صحيحة؛ عدّ كم درجة تحت الصفر في المسألة.';
        }
        feedbackState = {
          kind: 'bad',
          msg: errMsg,
          showBackToThermo: false
        };
        renderFeedbackBanner();
        if (stepUi.needsRecharge) setPrimaryButtonState('wrong');
      }
    };

    stepUi.onNext = () => {
      advanceStep();
    };

    renderPhase();
  }

  function renderL4ThermometerStep(cur, root) {
    if (cur.mode === 'two_step_adjust') {
      renderL4TwoStepAdjust(cur, root);
      return;
    }

    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);

    if (cur.infoBox) {
      const box = document.createElement('div');
      box.className = 'l3-fact-box';
      box.innerHTML = l2BidiTextHTML(cur.infoBox);
      root.append(box);
    }

    if (cur.mode === 'multi_read') {
      const cards = cur.cards || [];
      d.inputs = d.inputs || {};
      if (passed) {
        cards.forEach(c => {
          if (!d.inputs[c.id] && c.acceptValues && c.acceptValues.length) d.inputs[c.id] = String(c.acceptValues[0]);
        });
      }
      if (!d.activeCardId && cards.length) d.activeCardId = cards[0].id;

      const wrap = document.createElement('div');
      wrap.className = 'l4-mread-wrap';

      const tabsRow = document.createElement('div');
      tabsRow.className = 'l4-mread-tabs';
      tabsRow.setAttribute('role', 'tablist');
      tabsRow.setAttribute('aria-label', 'الموازين الأربعة');

      const focusCard = document.createElement('div');
      focusCard.className = 'l4-mread-card';

      const thermoCol = document.createElement('div');
      thermoCol.className = 'l4-mread-thermo';

      const padCol = document.createElement('div');
      padCol.className = 'l4-mread-pad';

      const dispBar = document.createElement('div');
      dispBar.className = 'l4-mread-disp';
      const dispLbl = document.createElement('span');
      dispLbl.className = 'l4-mread-disp-lbl';
      const dispVal = document.createElement('bdi');
      dispVal.className = 'l4-mread-disp-val';
      dispVal.setAttribute('dir', 'ltr');
      dispBar.append(dispLbl, dispVal);

      const signRow = document.createElement('div');
      signRow.className = 'l4-mread-signs';
      const negBtn = document.createElement('button');
      negBtn.type = 'button';
      negBtn.className = 'l4-sign-btn is-neg';
      negBtn.textContent = '− سالب';
      negBtn.setAttribute('aria-label', 'إشارة سالب');
      const posBtn = document.createElement('button');
      posBtn.type = 'button';
      posBtn.className = 'l4-sign-btn is-pos';
      posBtn.textContent = '+ موجب';
      posBtn.setAttribute('aria-label', 'إشارة موجب');
      signRow.append(negBtn, posBtn);

      const digitsGrid = document.createElement('div');
      digitsGrid.className = 'l4-mread-digits';
      digitsGrid.setAttribute('dir', 'ltr');

      padCol.append(dispBar, signRow, digitsGrid);
      focusCard.append(thermoCol, padCol);
      wrap.append(tabsRow, focusCard);
      root.append(wrap);
      l2AppendHintWidget(wrap, cur, d);

      let wrongCardIds = new Set();

      const formatValDisp = raw => {
        const s = String(raw || '').trim();
        if (!s) return '؟';
        return s.replace(/^-/, '−');
      };

      const checkMultiReady = () => {
        if (passed || isL2StepPassed(cur)) return;
        const activeIdx = cards.findIndex(c => c.id === d.activeCardId);
        const activeCard = cards[activeIdx] || cards[0];
        const activeFilled = activeCard && l4NormalizeSigned(d.inputs[activeCard.id]) !== '';
        const nextEmptyIdx = cards.findIndex((c, idx) => idx > activeIdx && l4NormalizeSigned(d.inputs[c.id]) === '');
        const firstEmptyIdx = nextEmptyIdx >= 0 ? nextEmptyIdx : cards.findIndex(c => l4NormalizeSigned(d.inputs[c.id]) === '');

        if (firstEmptyIdx < 0) {
          setPrimaryButtonState('ready', 'تحقّق');
        } else if (activeFilled) {
          setPrimaryButtonState('ready', 'التالي: ميزان ' + ar(firstEmptyIdx + 1));
        } else {
          const needNum = activeIdx >= 0 ? (activeIdx + 1) : (firstEmptyIdx + 1);
          setPrimaryButtonState('incomplete', 'أدخل قراءة ميزان ' + ar(needNum));
        }
      };

      const renderTabsAndStage = () => {
        const lockedNow = passed || isL2StepPassed(cur);
        const activeCard = cards.find(c => c.id === d.activeCardId) || cards[0];
        if (!activeCard) return;

        // Build 4 clean selector tabs
        tabsRow.replaceChildren();
        cards.forEach((c, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          const isSel = c.id === activeCard.id;
          const rawVal = String(d.inputs[c.id] || '');
          const isFilled = l4NormalizeSigned(rawVal) !== '';
          const isWrong = wrongCardIds.has(c.id);
          btn.className = 'l4-mread-tab'
            + (isSel ? ' is-selected' : '')
            + (lockedNow ? ' is-correct' : (isWrong ? ' is-wrong' : (isFilled ? ' is-filled' : '')));
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
          const shortTitle = 'ميزان ' + ar(idx + 1);
          const badgeVal = formatValDisp(rawVal);
          btn.innerHTML =
            '<span class="l4-mread-tab-lbl">' + esc(shortTitle) + '</span>' +
            '<bdi class="l4-mread-tab-val" dir="ltr">' + esc(badgeVal) + '</bdi>';
          btn.addEventListener('click', () => {
            d.activeCardId = c.id;
            saveState();
            clearFeedback();
            renderTabsAndStage();
          });
          tabsRow.append(btn);
        });

        // Build big crisp hero thermometer for active card
        thermoCol.innerHTML = global.L4Visuals && typeof global.L4Visuals.buildHeroThermometerSVG === 'function'
          ? global.L4Visuals.buildHeroThermometerSVG(activeCard.temp, {
              showMarker: true,
              min: Number.isFinite(Number(activeCard.min)) ? Number(activeCard.min) : -5,
              max: Number.isFinite(Number(activeCard.max)) ? Number(activeCard.max) : 5
            })
          : '';

        // Sync active display & sign state
        const curRaw = String(d.inputs[activeCard.id] || '');
        dispLbl.textContent = activeCard.label;
        dispVal.textContent = curRaw ? formatValDisp(curRaw) : '...';
        dispVal.className = 'l4-mread-disp-val'
          + (curRaw.startsWith('-') ? ' is-neg' : (curRaw.startsWith('+') ? ' is-pos' : ''));

        negBtn.classList.toggle('is-active', curRaw.startsWith('-'));
        posBtn.classList.toggle('is-active', curRaw.startsWith('+'));
        negBtn.disabled = lockedNow;
        posBtn.disabled = lockedNow;
        digitsGrid.querySelectorAll('button').forEach(b => { b.disabled = lockedNow; });

        if (!lockedNow) checkMultiReady();
      };

      const updateActiveValue = nextVal => {
        if (passed || isL2StepPassed(cur)) return;
        d.inputs[d.activeCardId] = nextVal;
        wrongCardIds.delete(d.activeCardId);
        saveState();
        clearFeedback();
        renderTabsAndStage();
      };

      const applySign = sgn => {
        const curVal = String(d.inputs[d.activeCardId] || '');
        const body = curVal.replace(/^[+-]/, '');
        if (curVal.startsWith(sgn)) updateActiveValue(body);
        else updateActiveValue(sgn + body);
      };

      negBtn.addEventListener('click', () => applySign('-'));
      posBtn.addEventListener('click', () => applySign('+'));

      [
        { label: '1', ch: '1' }, { label: '2', ch: '2' }, { label: '3', ch: '3' },
        { label: '4', ch: '4' }, { label: '5', ch: '5' }, { label: '6', ch: '6' },
        { label: '7', ch: '7' }, { label: '8', ch: '8' }, { label: '9', ch: '9' },
        { label: 'مسح', act: 'clear' }, { label: '0', ch: '0' }, { label: 'حذف', act: 'back' }
      ].forEach(k => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l4-mread-key' + (k.act ? ' is-action' : '');
        b.textContent = k.label;
        b.addEventListener('click', () => {
          if (passed || isL2StepPassed(cur)) return;
          const curVal = String(d.inputs[d.activeCardId] || '');
          if (k.act === 'clear') {
            updateActiveValue('');
            return;
          }
          if (k.act === 'back') {
            updateActiveValue(curVal.slice(0, -1));
            return;
          }
          const sign = curVal.startsWith('-') || curVal.startsWith('+') ? curVal[0] : '';
          const digits = curVal.replace(/^[+-]/, '');
          if (digits.length >= 2) return;
          updateActiveValue(sign + (digits === '0' ? k.ch : digits + k.ch));
        });
        digitsGrid.append(b);
      });

      renderTabsAndStage();
      if (passed) {
        showFeedback('good', cur.explanation || 'أحسنت! قرأت الموازين الأربعة بدقة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        checkMultiReady();
      }

      stepUi.onCheck = () => {
        const activeIdx = cards.findIndex(c => c.id === d.activeCardId);
        const nextEmptyIdx = cards.findIndex((c, idx) => idx > activeIdx && l4NormalizeSigned(d.inputs[c.id]) === '');
        const firstEmptyIdx = nextEmptyIdx >= 0 ? nextEmptyIdx : cards.findIndex(c => l4NormalizeSigned(d.inputs[c.id]) === '');
        if (firstEmptyIdx >= 0) {
          d.activeCardId = cards[firstEmptyIdx].id;
          saveState();
          clearFeedback();
          renderTabsAndStage();
          return;
        }
        const badCards = cards.filter(c => !l4MatchesAccept(d.inputs[c.id], c.acceptValues));
        if (badCards.length === 0) {
          recordL2StepPass(cur, d);
          wrongCardIds = new Set();
          renderTabsAndStage();
          showFeedback('good', cur.explanation || 'ممتاز! القراءات الصحيحة هي: +1، −3، −1، +3.');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          sound(false);
          haptic(false);
          wrongCardIds = new Set(badCards.map(c => c.id));
          d.activeCardId = badCards[0].id;
          markL2StepError();
          renderTabsAndStage();
          showFeedback('bad', 'تأكد من القيم التي أسفل الصفر بأن تحمل إشارة السالب (−) ثم حاول مجددًا.');
          setPrimaryButtonState('wrong', 'حاول مجددًا');
        }
      };

      stepUi.onRetry = () => {
        wrongCardIds = new Set();
        clearFeedback();
        renderTabsAndStage();
        checkMultiReady();
      };
      return;
    }

    if (cur.mode === 'drop_challenge') {
      const minV = Number.isFinite(Number(cur.min)) ? Number(cur.min) : -15;
      const maxV = Number.isFinite(Number(cur.max)) ? Number(cur.max) : 15;
      const initV = Number.isFinite(Number(cur.initialTemp)) ? Number(cur.initialTemp) : 5;
      const dropAmt = Number.isFinite(Number(cur.dropAmount)) ? Number(cur.dropAmount) : 10;
      const finalV = Number.isFinite(Number(cur.expectedFinal)) ? Number(cur.expectedFinal) : -5;
      const unit = cur.unitLabel || '°C';
      const checkSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

      if (passed) {
        d.dropped = true;
        d.subPhase = 'input';
        if (!d.typed) d.typed = String(finalV);
      } else if (d.subPhase !== 'probe' && d.subPhase !== 'input') {
        d.subPhase = 'probe';
      }

      const wrap = document.createElement('div');
      wrap.className = 'l4-adjust-view';

      const taskEl = document.createElement('p');
      taskEl.className = 'l4-adjust-task';
      taskEl.innerHTML = l2BidiTextHTML(cur.taskText || 'تقول نيفين: الأقل بـ 10 درجات عن الميزان هي −10');

      const stepper = document.createElement('div');
      stepper.className = 'l4-adjust-stepper';
      stepper.setAttribute('aria-label', 'خطوات الحل');

      const pill1 = document.createElement('button');
      pill1.type = 'button';
      pill1.className = 'l4-adjust-step-pill';
      const pill2 = document.createElement('div');
      pill2.className = 'l4-adjust-step-pill';
      stepper.append(pill1, pill2);

      const contentMount = document.createElement('div');
      contentMount.className = 'l4-adjust-content';

      wrap.append(taskEl, stepper, contentMount);
      root.append(wrap);

      const renderDropPhase = () => {
        const isDone = passed || isL2StepPassed(cur);
        const inProbe = !isDone && d.subPhase === 'probe';
        const stg = byId('l1-stage');
        if (stg) stg.scrollTop = 0;

        pill1.className = 'l4-adjust-step-pill ' + (inProbe ? 'is-active' : 'is-done');
        pill1.disabled = inProbe || isDone;
        pill1.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (inProbe ? '1' : checkSvg) + '</span><span>جرّب الانخفاض</span>';

        pill2.className = 'l4-adjust-step-pill ' + (isDone ? 'is-done' : (inProbe ? 'is-upcoming' : 'is-active'));
        pill2.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (isDone ? checkSvg : '2') + '</span><span>اكتب الناتج</span>';

        contentMount.replaceChildren();
        clearFeedback();

        if (inProbe) {
          const surface = document.createElement('div');
          surface.className = 'l4-adjust-surface';
          const grid = document.createElement('div');
          grid.className = 'l4-adjust-grid';

          const ctrl = document.createElement('div');
          ctrl.className = 'l4-adjust-controls';

          const readout = document.createElement('div');
          readout.className = 'l4-adjust-readout';
          const rLbl = document.createElement('span');
          rLbl.className = 'l4-adjust-readout-lbl';
          const rVal = document.createElement('bdi');
          rVal.className = 'l4-adjust-readout-val';
          rVal.setAttribute('dir', 'ltr');
          readout.append(rLbl, rVal);

          const dropBtn = document.createElement('button');
          dropBtn.type = 'button';
          dropBtn.className = 'l4-drop-action-btn';

          const pathBox = document.createElement('p');
          pathBox.className = 'l4-drop-note';

          const thermoWrap = document.createElement('div');
          thermoWrap.className = 'l4-adjust-thermo-wrap';
          thermoWrap.innerHTML = global.L4Visuals && typeof global.L4Visuals.buildHeroThermometerSVG === 'function'
            ? global.L4Visuals.buildHeroThermometerSVG(d.dropped ? finalV : initV, { showMarker: true, min: minV, max: maxV })
            : '';

          const syncProbe = () => {
            const curT = d.dropped ? finalV : initV;
            if (global.L4Visuals && typeof global.L4Visuals.updateHeroThermometerSVG === 'function') {
              global.L4Visuals.updateHeroThermometerSVG(thermoWrap, curT, { showMarker: true, min: minV, max: maxV });
            }
            if (d.dropped) {
              rLbl.textContent = 'بعد نزول ' + ar(dropAmt) + ' درجات';
              rVal.textContent = '؟' + unit;
              rVal.className = 'l4-adjust-readout-val is-neg';
              dropBtn.className = 'l4-drop-action-btn is-reset';
              dropBtn.innerHTML = 'أعد الميزان إلى <bdi dir="ltr">+' + initV + esc(unit) + '</bdi>';
              pathBox.textContent = 'انظر أين وقف السائل على التدريج الآن.';
              setPrimaryButtonState('ready', 'انتقل لكتابة الناتج');
            } else {
              rLbl.textContent = 'القراءة الابتدائية';
              rVal.textContent = '+' + initV + unit;
              rVal.className = 'l4-adjust-readout-val is-pos';
              dropBtn.className = 'l4-drop-action-btn is-drop';
              dropBtn.textContent = 'انخفض ' + ar(dropAmt) + ' درجات ↓';
              pathBox.textContent = 'لاحظ نقطة البداية ثم اضغط الزر لتهبط 10 درجات.';
              setPrimaryButtonState('incomplete', 'جرّب الانخفاض أولًا');
            }
          };

          dropBtn.addEventListener('click', () => {
            d.dropped = !d.dropped;
            saveState();
            syncProbe();
          });

          ctrl.append(readout, dropBtn, pathBox);
          grid.append(ctrl, thermoWrap);
          surface.append(grid);
          contentMount.append(surface);
          syncProbe();

          stepUi.onCheck = () => {
            if (!d.dropped) return;
            d.subPhase = 'input';
            saveState();
            renderDropPhase();
          };
          stepUi.onRetry = null;
          return;
        }

        // Phase 2: Input final temperature
        const summaryBar = document.createElement('div');
        summaryBar.className = 'l4-adjust-summary';
        const sumInfo = document.createElement('span');
        sumInfo.className = 'l4-adjust-summary-txt';
        sumInfo.innerHTML = 'نزل الميزان <bdi dir="ltr">10</bdi> درجات من <bdi class="l4-temp-bdi is-pos" dir="ltr">+' + initV + '</bdi>';

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'l4-adjust-edit-btn';
        backBtn.textContent = 'مراجعة الميزان';
        backBtn.disabled = isDone;
        backBtn.addEventListener('click', () => {
          if (isDone) return;
          d.subPhase = 'probe';
          saveState();
          renderDropPhase();
        });
        summaryBar.append(sumInfo, backBtn);

        const padMount = document.createElement('div');
        padMount.className = 'l4-drop-pad-mount';
        const keypad = l4CreateSignedKeypad({
          label: 'درجة الحرارة الحقيقية (' + unit + ')',
          getValue: () => d.typed || '',
          setValue: val => {
            d.typed = val;
            saveState();
            clearFeedback();
          },
          isDisabled: () => isDone,
          onChange: val => {
            if (!isDone) setPrimaryButtonState(l4NormalizeSigned(val) !== '' ? 'ready' : 'incomplete', 'تحقّق');
          }
        });
        padMount.append(keypad);
        contentMount.append(summaryBar, padMount);
        l2AppendHintWidget(contentMount, cur, d);

        if (isDone) {
          showFeedback('good', cur.explanation || 'أحسنت!');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          setPrimaryButtonState(l4NormalizeSigned(d.typed) !== '' ? 'ready' : 'incomplete', 'تحقّق');
        }

        stepUi.onCheck = () => {
          if (l4MatchesAccept(d.typed, cur.acceptValues)) {
            recordL2StepPass(cur, d);
            renderDropPhase();
          } else {
            sound(false);
            haptic(false);
            markL2StepError();
            const norm = l4NormalizeSigned(d.typed);
            let msg = 'تذكّر: نزلنا من +' + initV + ' إلى 0 (5 درجات)، وتبقى 5 درجات تحت الصفر.';
            if (norm === '-10') {
              msg = '−10 هي إجابة نيفين الخاطئة! لم يبدأ الميزان من 0 بل من +5؛ فكّر أين يصل بعد نزول 10 درجات.';
            } else if (norm === '5' || norm === '+5') {
              msg = 'الرقم 5 صحيح، لكنه يقع تحت الصفر؛ اختر إشارة السالب (−).';
            }
            showFeedback('bad', msg);
            setPrimaryButtonState('wrong', 'حاول مجددًا');
          }
        };

        stepUi.onRetry = () => {
          d.typed = '';
          clearFeedback();
          keypad.refresh();
          setPrimaryButtonState('incomplete', 'تحقّق');
        };
      };

      pill1.addEventListener('click', () => {
        if (passed || isL2StepPassed(cur) || d.subPhase === 'probe') return;
        d.subPhase = 'probe';
        saveState();
        renderDropPhase();
      });

      renderDropPhase();
      return;
    }

    // single_adjust mode
    const stepAmt = Number(cur.stepSize) || 1;
    if (d.temp === undefined) d.temp = passed ? Number(cur.targetTemp ?? 0) : Number(cur.initialTemp ?? 0);
    if (passed && !d.typed && cur.acceptValues && cur.acceptValues.length) d.typed = String(cur.acceptValues[0]);

    const probeMount = document.createElement('div');
    const keypadMount = document.createElement('div');
    root.append(probeMount, keypadMount);
    l2AppendHintWidget(root, cur, d);

    const drawSingleProbe = () => {
      probeMount.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'l4-thermo-probe';
      const svgWrap = document.createElement('div');
      svgWrap.innerHTML = global.L4Visuals
        ? global.L4Visuals.buildThermometerSVG(d.temp, cur.min, cur.max)
        : '';
      const ctrl = document.createElement('div');
      ctrl.className = 'l4-thermo-probe-controls';

      const rOut = document.createElement('div');
      rOut.className = 'l4-thermo-readout';
      rOut.innerHTML = 'قراءة الميزان: ' + l4SignedBadgeHTML(d.temp, d.temp > 0, cur.unitLabel || '°C');

      const btnRow = document.createElement('div');
      btnRow.className = 'l4-thermo-btn-row';
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'l4-step-btn is-neg';
      downBtn.disabled = passed || d.temp <= cur.min;
      downBtn.innerHTML = '<bdi dir="ltr">-' + stepAmt + '</bdi> (للأسفل)';
      downBtn.addEventListener('click', () => {
        d.temp = Math.max(cur.min, d.temp - stepAmt);
        d.interacted = true;
        saveState();
        clearFeedback();
        drawSingleProbe();
      });

      const zeroBtn = document.createElement('button');
      zeroBtn.type = 'button';
      zeroBtn.className = 'l4-step-btn';
      zeroBtn.disabled = passed;
      zeroBtn.innerHTML = 'الصفر (<bdi dir="ltr">0</bdi>)';
      zeroBtn.addEventListener('click', () => {
        d.temp = 0;
        d.interacted = true;
        saveState();
        clearFeedback();
        drawSingleProbe();
      });

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'l4-step-btn is-primary';
      upBtn.disabled = passed || d.temp >= cur.max;
      upBtn.innerHTML = '<bdi dir="ltr">+' + stepAmt + '</bdi> (للأعلى)';
      upBtn.addEventListener('click', () => {
        d.temp = Math.min(cur.max, d.temp + stepAmt);
        d.interacted = true;
        saveState();
        clearFeedback();
        drawSingleProbe();
      });

      btnRow.append(downBtn, zeroBtn, upBtn);
      ctrl.append(rOut, btnRow);
      box.append(svgWrap, ctrl);
      probeMount.append(box);
    };

    const syncSingleReady = () => {
      if (passed || isL2StepPassed(cur)) return;
      setPrimaryButtonState(l4NormalizeSigned(d.typed) !== '' ? 'ready' : 'incomplete', 'تحقّق');
    };

    const keypad = l4CreateSignedKeypad({
      label: 'العدد المناسب (' + (cur.unitLabel || '°C') + ')',
      getValue: () => d.typed || '',
      setValue: val => {
        d.typed = val;
        saveState();
        clearFeedback();
      },
      isDisabled: () => passed || isL2StepPassed(cur),
      onChange: () => syncSingleReady()
    });
    keypadMount.append(keypad);

    drawSingleProbe();
    if (passed) {
      showFeedback('good', cur.explanation || 'أحسنت!');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      syncSingleReady();
    }

    stepUi.onCheck = () => {
      if (cur.requireInteractive && Number(d.temp) !== Number(cur.targetTemp)) {
        sound(false);
        haptic(false);
        markL2StepError();
        showFeedback('bad', 'حرّك مؤشر الميزان باستخدام أزرار + و - حتى يصل السائل إلى الدرجة المطلوبة في السؤال.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
        return;
      }
      if (l4MatchesAccept(d.typed, cur.acceptValues)) {
        recordL2StepPass(cur, d);
        drawSingleProbe();
        keypad.refresh();
        showFeedback('good', cur.explanation || 'أحسنت! إجابة دقيقة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        markL2StepError();
        showFeedback('bad', 'تذكّر أن «تحت الصفر» تعني وضع إشارة السالب (-) بجانب العدد.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      d.typed = '';
      clearFeedback();
      keypad.refresh();
      syncSingleReady();
    };
  }

  function renderL4SituationTableStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const rows = cur.rows || [];
    d.nums = d.nums || {};
    d.zeros = d.zeros || {};
    if (passed) {
      rows.forEach(r => {
        if (!d.nums[r.id] && r.acceptNumbers && r.acceptNumbers.length) d.nums[r.id] = String(r.acceptNumbers[0]);
        if (d.zeros[r.id] === undefined) d.zeros[r.id] = r.correctZeroIndex;
      });
    }

    if (rows.length === 1) {
      const r = rows[0];
      const checkSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

      if (passed) {
        d.numSolved = true;
        d.subPhase = 'zero';
      } else if (d.subPhase !== 'number' && d.subPhase !== 'zero') {
        d.subPhase = d.numSolved ? 'zero' : 'number';
      }

      const rawChoices = Array.isArray(r.zeroChoices) ? r.zeroChoices : [];
      if (!Array.isArray(d.zeroOrder) || d.zeroOrder.length !== rawChoices.length) {
        const ord = rawChoices.map((_, i) => i);
        for (let i = ord.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ord[i], ord[j]] = [ord[j], ord[i]];
        }
        d.zeroOrder = ord;
      }

      const wrap = document.createElement('div');
      wrap.className = 'l4-sit-single-wrap';

      const stepper = document.createElement('div');
      stepper.className = 'l4-adjust-stepper';
      stepper.setAttribute('aria-label', 'خطوات الحل');

      const pill1 = document.createElement('button');
      pill1.type = 'button';
      pill1.className = 'l4-adjust-step-pill';
      const pill2 = document.createElement('div');
      pill2.className = 'l4-adjust-step-pill';
      stepper.append(pill1, pill2);

      const solvedNumLabel = (d.numSolved || passed) ? (r.displaySolved || d.nums[r.id] || '') : '';
      const animWidget = global.L4Visuals.createSituationAnimWidget({
        sceneType: cur.sceneType || 'bank_withdraw',
        revealedLabel: solvedNumLabel,
        zeroHighlighted: passed
      });
      stepCleanupFn = () => animWidget.destroy();

      const bodyMount = document.createElement('div');
      bodyMount.className = 'l4-sit-single-body';

      wrap.append(stepper, animWidget.el, bodyMount);
      root.append(wrap);

      let wrongIndices = [];

      const renderSubPhase = () => {
        const isDone = passed || isL2StepPassed(cur);
        const inNumber = !isDone && d.subPhase === 'number';

        pill1.className = 'l4-adjust-step-pill ' + (inNumber ? 'is-active' : 'is-done');
        pill1.disabled = inNumber || isDone;
        pill1.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (inNumber ? '1' : checkSvg) + '</span><span>العدد الموقّع</span>';

        pill2.className = 'l4-adjust-step-pill ' + (isDone ? 'is-done' : (inNumber ? 'is-upcoming' : 'is-active'));
        pill2.innerHTML = '<span class="l4-adjust-step-num" aria-hidden="true">' + (isDone ? checkSvg : '2') + '</span><span>معنى الصفر</span>';

        bodyMount.replaceChildren();
        clearFeedback();
        const stageScrollEl = byId('l1-stage');
        if (stageScrollEl) stageScrollEl.scrollTop = 0;

        if (inNumber) {
          const keypad = l4CreateSignedKeypad({
            label: 'العدد الذي يمثّل الموقف',
            getValue: () => d.nums[r.id] || '',
            setValue: val => {
              d.nums[r.id] = val;
              d.numSolved = false;
              animWidget.revealNumber('');
              saveState();
              clearFeedback();
            },
            isDisabled: () => isDone,
            onChange: val => {
              setPrimaryButtonState(l4NormalizeSigned(val) !== '' ? 'ready' : 'incomplete', 'تحقّق من العدد');
            }
          });
          bodyMount.append(keypad);
          l2AppendHintWidget(bodyMount, cur, d);
          setPrimaryButtonState(l4NormalizeSigned(d.nums[r.id]) !== '' ? 'ready' : 'incomplete', 'تحقّق من العدد');

          stepUi.onCheck = () => {
            if (l4MatchesAccept(d.nums[r.id], r.acceptNumbers)) {
              d.numSolved = true;
              d.subPhase = 'zero';
              saveState();
              sound(true);
              animWidget.revealNumber(r.displaySolved || d.nums[r.id]);
              renderSubPhase();
            } else {
              sound(false);
              haptic(false);
              markL2StepError();
              const isWithdraw = (cur.sceneType || 'bank_withdraw') === 'bank_withdraw';
              showFeedback('bad', isWithdraw
                ? 'السحب نقصان من الرصيد؛ تأكد من إشارة السالب (−) والعدد.'
                : 'الارتفاع فوق سطح البحر زيادة؛ اختر إشارة الموجب (+) أو العدد الصحيح.');
              setPrimaryButtonState('wrong', 'حاول مجددًا');
            }
          };

          stepUi.onRetry = () => {
            d.nums[r.id] = '';
            clearFeedback();
            keypad.refresh();
            setPrimaryButtonState('incomplete', 'تحقّق من العدد');
          };
          return;
        }

        // Sub-phase 2: meaning of Zero
        const summaryBar = document.createElement('div');
        summaryBar.className = 'l4-adjust-summary';
        const numDisplay = r.displaySolved || d.nums[r.id] || '';
        const sumInfo = document.createElement('span');
        sumInfo.className = 'l4-adjust-summary-txt';
        sumInfo.innerHTML = 'العدد الموقّع: <bdi class="l4-temp-bdi ' + (String(numDisplay).startsWith('−') || String(numDisplay).startsWith('-') ? 'is-neg' : 'is-pos') + '" dir="ltr">' + esc(numDisplay) + '</bdi>';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'l4-adjust-edit-btn';
        editBtn.textContent = 'تعديل العدد';
        editBtn.disabled = isDone;
        editBtn.addEventListener('click', () => {
          if (isDone) return;
          d.subPhase = 'number';
          saveState();
          renderSubPhase();
        });
        summaryBar.append(sumInfo, editBtn);

        const qTitle = document.createElement('div');
        qTitle.className = 'l4-sit-zero-q';
        qTitle.textContent = 'ماذا يمثّل الصفر في الموقف؟';

        const optsMount = document.createElement('div');
        optsMount.className = 'l4-vscene-opts';
        bodyMount.append(summaryBar, qTitle, optsMount);
        l2AppendHintWidget(bodyMount, cur, d);

        const mappedRightIdx = d.zeroOrder.indexOf(r.correctZeroIndex);
        const mappedSelectedIdx = Number.isInteger(d.zeros[r.id]) ? d.zeroOrder.indexOf(d.zeros[r.id]) : null;

        const drawZeroOpts = () => {
          const lockedNow = passed || isL2StepPassed(cur);
          const curSel = Number.isInteger(d.zeros[r.id]) ? d.zeroOrder.indexOf(d.zeros[r.id]) : null;
          optsMount.replaceChildren(l2CreateRadioOptions({
            items: d.zeroOrder.map(origIdx => ({ label: rawChoices[origIdx], numeric: false })),
            selectedIdx: lockedNow ? mappedRightIdx : curSel,
            revealedRightIdx: lockedNow ? mappedRightIdx : -1,
            wrongIndices,
            disabled: lockedNow,
            ariaLabel: 'ماذا يمثل الصفر في الموقف',
            onSelect: dispIdx => {
              d.zeros[r.id] = d.zeroOrder[dispIdx];
              wrongIndices = [];
              saveState();
              clearFeedback();
              drawZeroOpts();
              setPrimaryButtonState('ready', 'تحقّق');
            }
          }));
        };
        drawZeroOpts();

        if (isDone) {
          animWidget.setHighlightZero(true);
          showFeedback('good', cur.explanation || 'أحسنت!');
          setPrimaryButtonState('correct', l2PassPrimaryLabel());
        } else {
          setPrimaryButtonState(Number.isInteger(mappedSelectedIdx) && mappedSelectedIdx >= 0 ? 'ready' : 'incomplete', 'تحقّق');
        }

        stepUi.onCheck = () => {
          if (Number(d.zeros[r.id]) === Number(r.correctZeroIndex)) {
            recordL2StepPass(cur, d);
            renderSubPhase();
          } else {
            sound(false);
            haptic(false);
            const curSel = d.zeroOrder.indexOf(d.zeros[r.id]);
            wrongIndices = curSel >= 0 ? [curSel] : [];
            markL2StepError();
            drawZeroOpts();
            showFeedback('bad', 'انظر إلى خط البداية المرجعي (0) في الرسم المتحرك: ماذا يمثّل قبل حدوث التغيير؟');
            setPrimaryButtonState('wrong', 'حاول مجددًا');
          }
        };

        stepUi.onRetry = () => {
          delete d.zeros[r.id];
          wrongIndices = [];
          clearFeedback();
          drawZeroOpts();
          setPrimaryButtonState('incomplete', 'تحقّق');
        };
      };

      pill1.addEventListener('click', () => {
        if (passed || isL2StepPassed(cur) || d.subPhase === 'number') return;
        d.subPhase = 'number';
        saveState();
        renderSubPhase();
      });

      renderSubPhase();
      return;
    }

    if (!d.activeRowId && rows.length) d.activeRowId = rows[0].id;

    const tableMount = document.createElement('div');
    tableMount.className = 'l4-sit-table-wrap';
    const keypadMount = document.createElement('div');
    root.append(tableMount, keypadMount);
    l2AppendHintWidget(root, cur, d);

    let wrongNums = new Set();
    let wrongZeros = new Set();
    let keypadRef = null;

    const checkTableReady = () => {
      if (passed || isL2StepPassed(cur)) return;
      const ready = rows.every(r => l4NormalizeSigned(d.nums[r.id]) !== '' && Number.isInteger(d.zeros[r.id]));
      setPrimaryButtonState(ready ? 'ready' : 'incomplete', 'تحقّق');
    };

    const drawTable = () => {
      tableMount.innerHTML = '';
      rows.forEach(r => {
        const card = document.createElement('div');
        card.className = 'l4-sit-card';

        const title = document.createElement('div');
        title.className = 'l4-sit-title';
        title.innerHTML = l2BidiTextHTML(r.situation);

        const fields = document.createElement('div');
        fields.className = 'l4-sit-fields';

        const fNum = document.createElement('div');
        fNum.className = 'l4-sit-field';
        const fNumLbl = document.createElement('span');
        fNumLbl.className = 'l4-sit-field-label';
        fNumLbl.textContent = 'العدد الذي يمثّل الموقف';
        const numBtn = document.createElement('button');
        numBtn.type = 'button';
        const numVal = String(d.nums[r.id] || '');
        numBtn.className = 'l4-slot-btn'
          + (d.activeRowId === r.id && !passed ? ' is-active' : '')
          + (numVal ? ' is-filled' : '')
          + (passed ? ' is-correct' : (wrongNums.has(r.id) ? ' is-wrong' : ''));
        numBtn.disabled = passed;
        numBtn.innerHTML = numVal ? '<bdi dir="ltr">' + esc(numVal) + '</bdi>' : 'أدخل العدد';
        numBtn.addEventListener('click', () => {
          d.activeRowId = r.id;
          wrongNums.delete(r.id);
          clearFeedback();
          drawTable();
          keypadRef?.refresh?.();
        });
        fNum.append(fNumLbl, numBtn);

        const fZero = document.createElement('div');
        fZero.className = 'l4-sit-field';
        const fZeroLbl = document.createElement('span');
        fZeroLbl.className = 'l4-sit-field-label';
        fZeroLbl.textContent = 'ماذا يمثّل الصفر في الموقف؟';
        const chRow = document.createElement('div');
        chRow.className = 'l4-sit-choice-row';
        (r.zeroChoices || []).forEach((zTxt, zIdx) => {
          const zBtn = document.createElement('button');
          zBtn.type = 'button';
          const isSel = d.zeros[r.id] === zIdx;
          zBtn.className = 'l4-sit-choice-btn'
            + (isSel ? ' is-selected' : '')
            + (passed && zIdx === r.correctZeroIndex ? ' is-correct' : '')
            + (wrongZeros.has(r.id) && isSel ? ' is-wrong' : '');
          zBtn.disabled = passed;
          zBtn.textContent = zTxt;
          zBtn.addEventListener('click', () => {
            if (passed) return;
            d.zeros[r.id] = zIdx;
            wrongZeros.delete(r.id);
            saveState();
            clearFeedback();
            drawTable();
            checkTableReady();
          });
          chRow.append(zBtn);
        });
        fZero.append(fZeroLbl, chRow);

        fields.append(fNum, fZero);
        card.append(title, fields);
        tableMount.append(card);
      });
    };

    keypadRef = l4CreateSignedKeypad({
      getLabel: () => {
        const idx = rows.findIndex(r => r.id === d.activeRowId);
        return 'إدخال العدد للموقف ' + ar(Math.max(1, idx + 1));
      },
      getValue: () => d.nums[d.activeRowId] || '',
      setValue: val => {
        d.nums[d.activeRowId] = val;
        wrongNums.delete(d.activeRowId);
        saveState();
        clearFeedback();
        drawTable();
      },
      isDisabled: () => passed || isL2StepPassed(cur),
      onChange: () => checkTableReady()
    });
    keypadMount.append(keypadRef);

    drawTable();
    if (passed) {
      showFeedback('good', cur.explanation || 'أحسنت! جدول متقن.');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      checkTableReady();
    }

    stepUi.onCheck = () => {
      const badN = rows.filter(r => !l4MatchesAccept(d.nums[r.id], r.acceptNumbers));
      const badZ = rows.filter(r => Number(d.zeros[r.id]) !== Number(r.correctZeroIndex));
      if (badN.length === 0 && badZ.length === 0) {
        recordL2StepPass(cur, d);
        wrongNums = new Set();
        wrongZeros = new Set();
        drawTable();
        keypadRef.refresh();
        showFeedback('good', cur.explanation || 'إتقان كامل!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        wrongNums = new Set(badN.map(r => r.id));
        wrongZeros = new Set(badZ.map(r => r.id));
        if (badN.length) d.activeRowId = badN[0].id;
        markL2StepError();
        drawTable();
        keypadRef.refresh();
        showFeedback('bad', 'تأكد من إشارة السالب عند السحب وإشارة الموجب عند الارتفاع، وحدّد معنى الصفر قبل التغيير.');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      wrongNums = new Set();
      wrongZeros = new Set();
      clearFeedback();
      drawTable();
      keypadRef.refresh();
      checkTableReady();
    };
  }

  function renderL4TalkBuilderStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const scenarios = cur.scenarios || [];
    if (!d.scenId && scenarios.length) d.scenId = scenarios[0].id;
    const activeScen = scenarios.find(s => s.id === d.scenId) || scenarios[0];
    if (d.mag === undefined && activeScen) d.mag = activeScen.defaultMag || 5;

    l2EnsureShuffledOptions(cur, d);
    const opts = cur.options || [];
    let wrongIndices = [];
    const rightIdx = opts.findIndex(o => o.value === cur.correctValue);

    const talkCard = document.createElement('div');
    talkCard.className = 'l4-talk-card';
    const optsMount = document.createElement('div');
    root.append(talkCard, optsMount);
    l2AppendHintWidget(root, cur, d);

    let talkAnimHandle = null;
    registerStepCleanup(() => {
      if (talkAnimHandle && typeof talkAnimHandle.destroy === 'function') {
        talkAnimHandle.destroy();
        talkAnimHandle = null;
      }
    });

    const drawBuilder = () => {
      if (talkAnimHandle && typeof talkAnimHandle.destroy === 'function') {
        talkAnimHandle.destroy();
        talkAnimHandle = null;
      }
      talkCard.innerHTML = '';
      const pills = document.createElement('div');
      pills.className = 'l4-talk-pills';
      scenarios.forEach(sc => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l4-talk-pill' + (sc.id === d.scenId ? ' is-active' : '');
        b.textContent = sc.label;
        b.addEventListener('click', () => {
          d.scenId = sc.id;
          d.mag = sc.defaultMag || 5;
          saveState();
          drawBuilder();
        });
        pills.append(b);
      });
      talkCard.append(pills);

      const curSc = scenarios.find(s => s.id === d.scenId) || activeScen;
      const preview = document.createElement('div');
      preview.className = 'l4-talk-preview';

      const syncPreview = () => {
        const curMag = Math.max(1, Math.min(50, Number(d.mag) || 1));
        preview.innerHTML = ''
          + '<div class="l4-talk-preview-line"><strong>المثال:</strong> ' + esc(curSc.label) + ' بمقدار <bdi dir="ltr">' + curMag + '</bdi> ' + esc(curSc.unit) + '</div>'
          + '<div class="l4-talk-preview-line"><strong>العدد الممثل:</strong> ' + l4SignedBadgeHTML(-curMag) + ' · <strong>الصفر (<bdi dir="ltr">0</bdi>):</strong> ' + l2BidiTextHTML(curSc.zeroMeaning) + '</div>';
      };

      const stepRow = document.createElement('div');
      stepRow.className = 'l4-thermo-btn-row';
      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'l4-step-btn';
      minusBtn.innerHTML = 'إنقاص المقدار (<bdi dir="ltr">-1</bdi>)';
      minusBtn.addEventListener('click', () => {
        d.mag = Math.max(1, (Number(d.mag) || 1) - 1);
        saveState();
        syncPreview();
        if (talkAnimHandle && typeof talkAnimHandle.update === 'function') {
          talkAnimHandle.update({
            kind: 'neg_context',
            mode: curSc ? curSc.id : 'sea',
            mag: d.mag,
            live: true,
            caption: (curSc ? curSc.label : '') + ' (' + (-d.mag) + ')'
          });
        }
      });
      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'l4-step-btn is-primary';
      plusBtn.innerHTML = 'زيادة المقدار (<bdi dir="ltr">+1</bdi>)';
      plusBtn.addEventListener('click', () => {
        d.mag = Math.min(50, (Number(d.mag) || 1) + 1);
        saveState();
        syncPreview();
        if (talkAnimHandle && typeof talkAnimHandle.update === 'function') {
          talkAnimHandle.update({
            kind: 'neg_context',
            mode: curSc ? curSc.id : 'sea',
            mag: d.mag,
            live: true,
            caption: (curSc ? curSc.label : '') + ' (' + (-d.mag) + ')'
          });
        }
      });
      stepRow.append(minusBtn, plusBtn);
      talkCard.append(stepRow);

      const mag = Math.max(1, Math.min(50, Number(d.mag) || 1));
      const animSlot = document.createElement('div');
      talkCard.append(animSlot);
      if (global.BookConceptAnim && typeof global.BookConceptAnim.mount === 'function') {
        talkAnimHandle = global.BookConceptAnim.mount({
          kind: 'neg_context',
          mode: curSc ? curSc.id : 'sea',
          mag,
          live: true,
          caption: (curSc ? curSc.label : '') + ' (' + (-mag) + ')'
        }, animSlot, {
          compact: true,
          hideHeader: true,
          onValueChange: newMag => {
            const nextM = Math.max(1, Math.min(50, Number(newMag) || 1));
            if (nextM !== d.mag) {
              d.mag = nextM;
              saveState();
              syncPreview();
            }
          }
        });
      }

      syncPreview();
      talkCard.append(preview);

      if (cur.question) {
        const qP = document.createElement('div');
        qP.className = 'l3-reason-title';
        qP.innerHTML = l2BidiTextHTML(cur.question);
        talkCard.append(qP);
      }
    };

    const drawOpts = () => {
      optsMount.innerHTML = '';
      optsMount.append(l2CreateRadioOptions({
        items: opts.map(o => ({ label: o.label, numeric: false })),
        selectedIdx: passed ? rightIdx : stepUi.selectedIdx,
        revealedRightIdx: passed ? rightIdx : -1,
        wrongIndices,
        disabled: passed,
        onSelect: idx => {
          stepUi.selectedIdx = idx;
          wrongIndices = [];
          clearFeedback();
          drawOpts();
          setPrimaryButtonState('ready', 'تحقّق');
        }
      }));
    };

    drawBuilder();
    drawOpts();
    if (passed) {
      showFeedback('good', cur.explanation || 'أحسنت! ربطت المفهوم بالحياة اليومية.');
      setPrimaryButtonState('correct', l2PassPrimaryLabel());
    } else {
      setPrimaryButtonState('incomplete', 'تحقّق');
    }

    stepUi.onCheck = () => {
      const chosen = opts[stepUi.selectedIdx];
      if (!chosen) return;
      if (chosen.value === cur.correctValue) {
        recordL2StepPass(cur, d);
        drawOpts();
        showFeedback('good', cur.explanation || 'ممتاز!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        sound(false);
        haptic(false);
        wrongIndices = [stepUi.selectedIdx];
        markL2StepError();
        drawOpts();
        showFeedback('bad', 'تأمّل الجملة الناتجة: أي مقدار تحت نقطة المرجع يقع يسار 0 ويأخذ إشارة (-).');
        setPrimaryButtonState('wrong', 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      stepUi.selectedIdx = null;
      wrongIndices = [];
      clearFeedback();
      drawOpts();
      setPrimaryButtonState('incomplete', 'تحقّق');
    };
  }

  function evaluateLesson4Station14Screen() {
    const rec = typeof getLesson4NodeRecord === 'function' ? getLesson4NodeRecord(13) : null;
    const defs = Lesson4RunnerDefs.L4_MASTERY_QUESTIONS || [];
    const skillsMap = (rec && rec.data && rec.data.skills) || {};
    const rows = defs.map(q => ({
      skill: q.skill,
      label: q.skillLabel,
      ok: Boolean(skillsMap[q.skill])
    }));
    const unmastered = rows.filter(r => !r.ok);
    const masteredCount = rows.length - unmastered.length;
    const nodeDef = typeof L4_NODES !== 'undefined' ? L4_NODES[13] : null;
    const pts = nodeDef ? nodeDef.points : 25;

    if (unmastered.length === 0) {
      const hadRem = Boolean(rec && rec.data && rec.data.remedialRound);
      const stars = !hadRem && (!rec || !rec.errors) ? 3 : 2;
      const res = typeof completeLesson4Station === 'function'
        ? completeLesson4Station(13, pts, stars)
        : { wasDone: false, earnedStars: stars };
      session = null;
      showLesson4ResultScreen({
        ok: true,
        title: 'أحسنت! أتقنت التحدي النهائي للدرس الرابع',
        subtitle: res.wasDone
          ? 'حافظت على إتقان جميع مهارات الأعداد السالبة الست بنجاح.'
          : 'أنهيت جميع مهارات الأعداد السالبة وتمثيلها على خط الأعداد بإتقان كامل!',
        metrics: [
          { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
          { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(pts), label: 'النقاط المكتسبة' },
          { value: ar(rows.length) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' }
        ],
        skills: rows,
        primaryLabel: 'العودة لخريطة الدرس الرابع',
        onPrimary: () => closeToMap(4),
        secondaryLabel: 'إعادة التحدي',
        onSecondary: () => openLesson4Node(13, { forceReset: true })
      });
    } else {
      const nextRound = (rec && rec.data && Number(rec.data.remedialRound) || 0) + 1;
      session = null;
      showLesson4ResultScreen({
        ok: false,
        title: 'بقيت ' + ar(unmastered.length) + ' مهارات لإتقان التحدي',
        subtitle: 'سنتدرب الآن على سؤالين جديدين لكل مهارة متبقية قبل إغلاق البطاقة.',
        metrics: [
          { value: ar(masteredCount) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' },
          { value: ar(unmastered.length), label: 'تحتاج تدريبًا' },
          { value: '0', label: 'نقاط بانتظار الإتقان' }
        ],
        skills: rows,
        primaryLabel: 'تدريب المهارات المتبقية (' + ar(unmastered.length) + ')',
        onPrimary: () => openLesson4Remedial(unmastered, nextRound),
        secondaryLabel: 'العودة لخريطة الدرس الرابع',
        onSecondary: () => closeToMap(4)
      });
    }
  }

  function finishLesson4Session() {
    const s = session;
    if (!s) return;

    if (s.nodeId === 13) {
      const rec = typeof getLesson4NodeRecord === 'function' ? getLesson4NodeRecord(13) : null;
      if (s.remedial && rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        const bySkill = {};
        (s.remedialResponses || []).forEach(r => {
          bySkill[r.skill] = bySkill[r.skill] || [];
          bySkill[r.skill].push(Boolean(r.ok));
        });
        Object.keys(bySkill).forEach(sk => {
          const arr = bySkill[sk];
          if (arr.length > 0 && arr.every(Boolean)) {
            rec.data.skills[sk] = true;
          }
        });
        rec.data.remedialRound = (Number(rec.data.remedialRound) || 0) + 1;
        saveState();
      }
      evaluateLesson4Station14Screen();
      return;
    }

    const rec = typeof getLesson4NodeRecord === 'function' ? getLesson4NodeRecord(s.nodeId) : null;
    const errCount = rec ? (Number(rec.errors) || 0) : (Number(s.errors) || 0);
    let stars = errCount === 0 ? 3 : (errCount <= 2 ? 2 : 1);
    if (rec && rec.assistedSteps && rec.assistedSteps.size > 0) {
      stars = Math.min(2, stars);
    }

    const res = typeof completeLesson4Station === 'function'
      ? completeLesson4Station(s.nodeId, s.points, stars)
      : { wasDone: false, earnedStars: stars };

    const totalNodes = typeof L4_NODES !== 'undefined' ? L4_NODES.length : 14;
    const nextId = s.nodeId + 1;
    const canGoNext = nextId < totalNodes && (typeof isLesson4NodeUnlocked !== 'function' || isLesson4NodeUnlocked(nextId));
    const finishedNodeId = s.nodeId;
    const finishedTitle = s.title;
    const finishedPts = s.points;
    session = null;

    showLesson4ResultScreen({
      ok: true,
      title: 'أحسنت! أتممت «' + finishedTitle + '»',
      subtitle: res.wasDone
        ? 'مراجعة موفقة؛ تم حفظ أدائك دون تكرار النقاط.'
        : 'أكملت جميع خطوات المحطة بنجاح وفتحت المحطة التالية.',
      metrics: [
        { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
        { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(finishedPts), label: 'النقاط' },
        { value: ar(errCount), label: 'محاولات تصحيح' }
      ],
      primaryLabel: canGoNext ? 'المحطة التالية' : 'العودة لخريطة الدرس الرابع',
      onPrimary: () => canGoNext ? openLesson4Node(nextId) : closeToMap(4),
      secondaryLabel: canGoNext ? 'العودة لخريطة الدرس الرابع' : 'إعادة المحطة',
      onSecondary: () => canGoNext ? closeToMap(4) : openLesson4Node(finishedNodeId, { forceReset: true })
    });
  }

  function openLesson4Node(nodeId, options) {
    if (typeof Lesson4RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();

    if (nodeId !== 13 && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 4, nodeId, openOptions: options });
    }

    const st4 = typeof getLesson4State === 'function' ? getLesson4State() : null;
    const rec = typeof getLesson4NodeRecord === 'function' ? getLesson4NodeRecord(nodeId) : null;
    const totalSteps = Lesson4RunnerDefs.getStepCount(nodeId);
    const doneCol = st4 && (st4.completedNodes !== undefined ? st4.completedNodes : st4.completed);
    const alreadyDone = Boolean(doneCol && (typeof doneCol.has === 'function' ? doneCol.has(nodeId) : Array.isArray(doneCol) && doneCol.includes(nodeId)));

    if (nodeId === 13 && !options?.forceReset && !options?.review && !options?.preserveProgress && !alreadyDone) {
      if (rec && rec.passed && rec.passed.size >= totalSteps && rec.data && rec.data.skills) {
        evaluateLesson4Station14Screen();
        return true;
      }
    }

    const shouldReset = Boolean((options?.forceReset || options?.review || alreadyDone) && !options?.preserveProgress);
    if (shouldReset && typeof resetLesson4NodeRecordForReplay === 'function') {
      resetLesson4NodeRecordForReplay(nodeId);
    }

    const built = Lesson4RunnerDefs.buildLesson4Session(nodeId, {
      ...options,
      replay: Boolean(shouldReset || options?.replay)
    });
    if (!built) return false;
    session = built;
    lastActiveLesson = 4;
    state.mapSubView = 'lesson4';
    state.viewMode = 'lesson4';
    setUiMode('learning');
    persistRunnerPosition();
    renderStep();
    return true;
  }

  function openLesson4Remedial(unmasteredList, roundNum) {
    if (typeof Lesson4RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();
    if ((state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 4, nodeId: 13, remedialLaunch: { unmasteredList, roundNum } });
    }
    const built = Lesson4RunnerDefs.buildLesson4RemedialSession(unmasteredList, roundNum);
    if (!built) {
      evaluateLesson4Station14Screen();
      return false;
    }
    session = built;
    lastActiveLesson = 4;
    state.mapSubView = 'lesson4';
    state.viewMode = 'lesson4';
    setUiMode('learning');
    renderStep();
    return true;
  }

  /* ---------------- Lesson 5 Step Renderers & Runner ---------------- */
  function appendL5PhaseStrip(root, activePhase) {
    if (!Number.isInteger(activePhase)) return;
    const strip = document.createElement('div');
    strip.className = 'l5-steps-strip';
    ['1 أفهم', '2 أخطط', '3 أحل', '4 أتحقق'].forEach((lbl, idx) => {
      const pill = document.createElement('div');
      pill.className = 'l5-step-pill' + (idx < activePhase ? ' is-done' : (idx === activePhase ? ' is-active' : ''));
      pill.textContent = lbl;
      strip.append(pill);
    });
    root.append(strip);
  }

  function buildL5RatioStrip(rp) {
    const rStrip = document.createElement('div');
    rStrip.className = 'l5-ratio-visual';
    const buildDots = (cnt, tone, txt) => {
      const capped = Math.min(8, Math.max(1, Number(cnt) || 1));
      const dots = Array.from({ length: capped }, () => '<span class="l5-marble-dot tone-' + esc(tone) + '" aria-hidden="true"></span>').join('');
      return '<span class="l5-marble-group">' + dots + '<span>' + l2BidiTextHTML(txt) + '</span></span>';
    };
    rStrip.innerHTML = buildDots(rp.leftCount || 1, rp.leftTone || 'green', rp.leftText || '')
      + '<span class="l5-ratio-op" aria-hidden="true">+</span>'
      + buildDots(rp.rightCount || 3, rp.rightTone || 'red', rp.rightText || '')
      + '<span class="l5-ratio-op" aria-hidden="true">⟵</span>'
      + '<strong class="l5-ratio-sum">' + l2BidiTextHTML(rp.sumText || '') + '</strong>';
    return rStrip;
  }

  function buildL5VerifyList(checks) {
    const wrap = document.createElement('div');
    wrap.className = 'l5-verify-list';
    const checkSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    checks.forEach(item => {
      const row = document.createElement('div');
      row.className = 'l5-verify-row';
      row.innerHTML =
        '<span class="l5-verify-ico">' + checkSvg + '</span>' +
        '<span class="l5-verify-lbl">' + l2BidiTextHTML(item.label || '') + '</span>' +
        '<bdi class="l5-verify-eq" dir="ltr">' + esc(item.eq || '') + '</bdi>' +
        (item.detail ? '<span class="l5-verify-det">' + esc(item.detail) + '</span>' : '');
      wrap.append(row);
    });
    return wrap;
  }

  function renderL5TeachStep(cur, root) {
    const d = l2StepData(cur);
    appendL5PhaseStrip(root, cur.activePhase);

    const card = document.createElement('div');
    card.className = 'l5-teach-card';

    const head = document.createElement('div');
    head.className = 'l5-teach-head';
    const title = document.createElement('h3');
    title.className = 'l5-teach-title';
    title.textContent = cur.conceptTitle || cur.title || 'فكرة الدرس';
    head.append(title);
    if (cur.sourceRef) {
      const src = document.createElement('span');
      src.className = 'l5-source-tag';
      src.innerHTML = l2BidiTextHTML(cur.sourceRef);
      head.append(src);
    }
    card.append(head);

    if (Array.isArray(cur.understandItems) && cur.understandItems.length) {
      const uGrid = document.createElement('div');
      uGrid.className = 'l5-understand-grid';
      cur.understandItems.forEach(it => {
        const box = document.createElement('div');
        box.className = 'l5-understand-item tone-' + (it.tone || 'green');
        box.innerHTML = '<span class="l5-understand-tag">' + esc(it.tag || '') + '</span>'
          + '<span class="l5-understand-txt">' + l2BidiTextHTML(it.text || '') + '</span>';
        uGrid.append(box);
      });
      card.append(uGrid);
    }

    if (cur.ratioPreview) {
      card.append(buildL5RatioStrip(cur.ratioPreview));
    }

    if (Array.isArray(cur.verifyChecks) && cur.verifyChecks.length) {
      card.append(buildL5VerifyList(cur.verifyChecks));
    }

    if (cur.planBox) {
      const pBox = document.createElement('div');
      pBox.className = 'l5-plan-box';
      pBox.innerHTML = '<strong class="l5-plan-tag">' + esc(cur.planBox.tag || 'أخطط') + '</strong>'
        + '<span>' + l2BidiTextHTML(cur.planBox.text || '') + '</span>';
      card.append(pBox);
    }

    if (cur.miniTablePreview && Array.isArray(cur.miniTablePreview.headers)) {
      const mt = cur.miniTablePreview;
      const tbl = document.createElement('div');
      tbl.className = 'l5-vtable l5-mini-vtable';
      tbl.style.setProperty('--l5-vcols', String(mt.headers.length));
      mt.headers.forEach((h, hIdx) => {
        const hd = document.createElement('div');
        hd.className = 'l5-vcell-head' + (hIdx === mt.headers.length - 1 ? ' is-sum-col' : '');
        hd.innerHTML = l2BidiTextHTML(h);
        tbl.append(hd);
      });
      (mt.rows || []).forEach(r => {
        (r.cells || []).forEach((v, cIdx) => {
          const c = document.createElement('div');
          const isNum = /^[\d,.\s]+$/.test(String(v || '').trim());
          c.className = 'l5-vcell-static'
            + (r.tone === 'goal' ? ' is-goal' : '')
            + (cIdx === mt.headers.length - 1 ? ' is-sum-col' : '');
          c.innerHTML = isNum ? ('<bdi dir="ltr">' + esc(v) + '</bdi>') : l2BidiTextHTML(v);
          tbl.append(c);
        });
      });
      card.append(tbl);
    }

    if (Array.isArray(cur.bullets) && cur.bullets.length) {
      const ul = document.createElement('ul');
      ul.className = 'l5-teach-bullets';
      cur.bullets.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = l2BidiTextHTML(b);
        ul.append(li);
      });
      card.append(ul);
    }

    if (cur.verifyBanner) {
      const vp = document.createElement('div');
      vp.className = 'l5-verify-pill';
      vp.innerHTML = '<span>تحقق سريع:</span><span>' + l2BidiTextHTML(cur.verifyBanner) + '</span>';
      card.append(vp);
    }

    root.append(card);
    setPrimaryButtonState('explanation', l2PassPrimaryLabel());
    stepUi.onNext = () => {
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
        if (d) d.viewed = true;
      }
      advanceStep();
    };
  }

  function wireL5SlotChoiceBoard(cfg) {
    const { root, cur, d, slots, bankPairCls, drawBoard, renderExtraGuide } = cfg;
    const passed = isL2StepPassed(cur);
    if (!d.values || typeof d.values !== 'object') d.values = {};
    if (!d.wrongSet || typeof d.wrongSet !== 'object') d.wrongSet = {};

    const findNextSlotId = (afterId) => {
      const idx = slots.findIndex(s => s.slotId === afterId);
      for (let off = 1; off <= slots.length; off++) {
        const cand = slots[(Math.max(0, idx) + off) % slots.length];
        if (!d.values[cand.slotId]) return cand.slotId;
      }
      return afterId || (slots[0] && slots[0].slotId) || '';
    };

    if (!d.activeSlotId || !slots.some(s => s.slotId === d.activeSlotId)) {
      const firstEmpty = slots.find(s => !d.values[s.slotId]) || slots[0];
      d.activeSlotId = firstEmpty ? firstEmpty.slotId : '';
    }

    const boardMount = document.createElement('div');
    const bankMount = document.createElement('div');
    bankMount.className = 'l5-bank-wrap';
    root.append(boardMount, bankMount);

    const syncButtons = () => {
      const done = passed || Boolean(d.locked);
      if (done) {
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
        return;
      }
      if (stepUi.needsRecharge) {
        setPrimaryButtonState('wrong');
        return;
      }
      const allFilled = slots.length > 0 && slots.every(s => String(d.values[s.slotId] || '').trim() !== '');
      setPrimaryButtonState(allFilled ? 'ready' : 'incomplete', 'تحقّق');
    };

    const drawAll = () => {
      const locked = passed || Boolean(d.locked);
      drawBoard(boardMount, locked, (slotId) => {
        if (locked) return;
        d.activeSlotId = slotId;
        clearFeedback();
        drawAll();
      });

      bankMount.innerHTML = '';
      if (!locked) {
        const activeIdx = slots.findIndex(s => s.slotId === d.activeSlotId);
        const activeSlot = activeIdx >= 0 ? slots[activeIdx] : slots[0];
        if (activeSlot) {
          const guideBox = document.createElement('div');
          guideBox.className = 'l5-active-guide';
          guideBox.setAttribute('aria-live', 'polite');

          const gTop = document.createElement('div');
          gTop.className = 'l5-active-guide-top';
          gTop.innerHTML = '<span>الخانة المطلوبة الآن: ' + esc(activeSlot.label) + '</span>'
            + '<span class="l5-guide-step-count">خطوة <bdi dir="ltr">' + ((activeIdx >= 0 ? activeIdx : 0) + 1) + '</bdi> من <bdi dir="ltr">' + slots.length + '</bdi></span>';
          guideBox.append(gTop);

          if (activeSlot.formula) {
            let formulaTxt = activeSlot.formula;
            if (Array.isArray(activeSlot.deps) && activeSlot.deps.length >= 2) {
              const depVal = String(d.values[activeSlot.deps[0]] || '').trim();
              if (depVal) {
                if (activeSlot.deps[2] === 'left') {
                  formulaTxt = 'أضف ' + activeSlot.deps[1] + ' إلى المجموع السابق: ' + depVal + ' + ' + activeSlot.deps[1] + ' = □';
                } else {
                  formulaTxt = 'اجمع العددين في هذا الصف: ' + activeSlot.deps[1] + ' + ' + depVal + ' = □';
                }
              }
            }
            const gFormula = document.createElement('div');
            gFormula.className = 'l5-active-guide-formula';
            gFormula.innerHTML = l2BidiTextHTML(formulaTxt);
            guideBox.append(gFormula);
          }

          if (typeof renderExtraGuide === 'function') {
            renderExtraGuide(activeSlot, guideBox);
          }

          bankMount.append(guideBox);
        }

        const bank = document.createElement('div');
        const isCompact = !bankPairCls && (cur.choices || []).length <= 4;
        bank.className = 'l5-choice-bank' + (bankPairCls ? ' is-pair-bank' : (isCompact ? ' is-compact-bank' : ''));
        const activeVal = d.activeSlotId ? String(d.values[d.activeSlotId] || '') : '';
        (cur.choices || []).forEach(ch => {
          const valStr = String(ch);
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'l5-choice-btn' + (activeVal === valStr ? ' is-selected' : '');
          b.innerHTML = bankPairCls ? esc(valStr) : ('<bdi dir="ltr">' + esc(valStr) + '</bdi>');
          b.addEventListener('click', () => {
            if (!d.activeSlotId) return;
            d.values[d.activeSlotId] = valStr;
            delete d.wrongSet[d.activeSlotId];
            clearFeedback();
            d.activeSlotId = findNextSlotId(d.activeSlotId);
            saveState();
            drawAll();
            syncButtons();
          });
          bank.append(b);
        });
        bankMount.append(bank);
      }
    };

    drawAll();
    syncButtons();
    if (passed) showFeedback('good', cur.explainRight || 'أحسنت!');

    l2AppendHintWidget(root, cur, d);

    stepUi.onCheck = () => {
      const wrongIds = {};
      slots.forEach(s => {
        const got = String(d.values[s.slotId] || '').trim();
        if (got !== String(s.expected).trim()) wrongIds[s.slotId] = true;
      });
      const wrongKeys = Object.keys(wrongIds);
      if (wrongKeys.length === 0) {
        d.locked = true;
        d.wrongSet = {};
        recordL2StepPass(cur, d);
        showFeedback('good', cur.explainRight || 'إجابة متقنة!');
        drawAll();
        syncButtons();
      } else {
        d.wrongSet = wrongIds;
        d.activeSlotId = wrongKeys[0];
        markL2StepError();
        showFeedback('bad', cur.explainWrong || 'تحقق من القيم المظللة بالأحمر وأعد المحاولة.');
        drawAll();
        syncButtons();
      }
    };
  }

  function renderL5TableBuilderStep(cur, root) {
    const d = l2StepData(cur);
    const isVertical = cur.layout === 'vertical' && Array.isArray(cur.vRows);

    const slots = [];
    if (isVertical) {
      cur.vRows.forEach((row, rIdx) => {
        (row.cells || []).forEach((cell, cIdx) => {
          if (cell && cell.slotId) {
            slots.push({
              slotId: cell.slotId,
              expected: cell.expected,
              label: cell.label || ((cur.columns && cur.columns[cIdx] && cur.columns[cIdx].label) || ''),
              formula: cell.formula || '',
              deps: cell.deps || null,
              rowIdx: rIdx,
              colIdx: cIdx
            });
          }
        });
      });
    } else {
      const cols = (cur.colHeaders || []).length || 4;
      const rows = cur.rows || [];
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        rows.forEach(row => {
          const cell = (row.cells || [])[cIdx];
          if (cell && cell.slotId) {
            slots.push({
              slotId: cell.slotId,
              expected: cell.expected,
              label: cell.label || row.label,
              formula: cell.formula || '',
              deps: cell.deps || null,
              colIdx: cIdx
            });
          }
        });
      }
    }

    wireL5SlotChoiceBoard({
      root,
      cur,
      d,
      slots,
      bankPairCls: false,
      drawBoard: (mount, locked, onSelectSlot) => {
        mount.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'l5-table-card';

        if (cur.ruleChip) {
          const chip = document.createElement('div');
          chip.className = 'l5-table-rule-chip';
          chip.innerHTML = l2BidiTextHTML(cur.ruleChip);
          card.append(chip);
        }

        if (cur.ratioPreview) {
          card.append(buildL5RatioStrip(cur.ratioPreview));
        }

        if (cur.outfitPreview && Array.isArray(cur.outfitPreview.ties)) {
          const op = document.createElement('div');
          op.className = 'l5-outfit-strip';
          const tiesHtml = cur.outfitPreview.ties.map(t =>
            '<span class="l5-tie-chip"><span class="l5-tie-dot tone-' + esc(t.tone || 'dark') + '" aria-hidden="true"></span><span>' + esc(t.label) + '</span></span>'
          ).join('');
          op.innerHTML = '<span class="l5-outfit-lbl">' + esc(cur.outfitPreview.title || 'الربطات:') + '</span><div class="l5-tie-list">' + tiesHtml + '</div>';
          card.append(op);
        }

        if (cur.coinSwapPreview) {
          const cs = document.createElement('div');
          cs.className = 'l5-coin-strip';
          cs.innerHTML =
            '<span class="l5-coin-badge is-ten"><bdi dir="ltr">10</bdi> قروش</span>' +
            '<span class="l5-ratio-op" aria-hidden="true">=</span>' +
            '<span class="l5-coin-badge is-five"><bdi dir="ltr">5</bdi> قروش</span>' +
            '<span class="l5-ratio-op" aria-hidden="true">+</span>' +
            '<span class="l5-coin-badge is-five"><bdi dir="ltr">5</bdi> قروش</span>';
          card.append(cs);
        }

        const activeSlotObj = !locked ? slots.find(s => s.slotId === d.activeSlotId) : null;

        if (isVertical) {
          const activeRowIdx = activeSlotObj ? activeSlotObj.rowIdx : -1;
          const cols = cur.columns || [];
          const grid = document.createElement('div');
          grid.className = 'l5-vtable';
          grid.style.setProperty('--l5-vcols', String(Math.max(2, cols.length)));

          cols.forEach(col => {
            const hd = document.createElement('div');
            hd.className = 'l5-vcell-head tone-' + (col.tone || 'neutral');
            hd.innerHTML = l2BidiTextHTML(col.label);
            grid.append(hd);
          });

          cur.vRows.forEach((row, rIdx) => {
            const isActRow = rIdx === activeRowIdx;
            const isGoal = Boolean(row.isGoal);
            (row.cells || []).forEach((cell, cIdx) => {
              const colTone = (cols[cIdx] && cols[cIdx].tone) || 'neutral';
              if (!cell.slotId) {
                const stCell = document.createElement('div');
                stCell.className = 'l5-vcell-static tone-' + colTone
                  + (cell.sub ? ' has-sub' : '')
                  + (isActRow ? ' is-active-row' : '')
                  + (isGoal ? ' is-goal' : '');
                if (cell.sub) {
                  stCell.innerHTML = '<span class="l5-vcell-main">' + l2BidiTextHTML(cell.val) + '</span>'
                    + '<span class="l5-vcell-sub">' + l2BidiTextHTML(cell.sub) + '</span>';
                } else {
                  stCell.innerHTML = cell.isText
                    ? l2BidiTextHTML(cell.val)
                    : ('<bdi dir="ltr">' + esc(cell.val) + '</bdi>');
                }
                grid.append(stCell);
              } else {
                const val = String((d.values && d.values[cell.slotId]) || '');
                const isWrong = Boolean(d.wrongSet && d.wrongSet[cell.slotId]);
                const isAct = !locked && d.activeSlotId === cell.slotId;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'l5-cell-slot'
                  + (locked ? ' is-correct' : (isWrong ? ' is-wrong' : (val ? ' is-filled' : '')))
                  + (isAct ? ' is-active' : '');
                btn.setAttribute('aria-label', cell.label || colTone);
                btn.setAttribute('aria-pressed', String(isAct));
                btn.disabled = locked;
                btn.innerHTML = '<bdi dir="ltr">' + esc(locked ? cell.expected : (val || '؟')) + '</bdi>';
                btn.addEventListener('click', () => onSelectSlot(cell.slotId));
                grid.append(btn);
              }
            });
          });

          card.append(grid);
        } else {
          const cols = (cur.colHeaders || []).length || 4;
          const rows = cur.rows || [];
          const activeColIdx = activeSlotObj ? activeSlotObj.colIdx : -1;

          const grid = document.createElement('div');
          grid.className = 'l5-data-table';
          grid.style.setProperty('--l5-cols', String(cols));

          const corner = document.createElement('div');
          corner.className = 'l5-cell-head';
          corner.textContent = 'البيان';
          grid.append(corner);

          (cur.colHeaders || []).forEach((h, cIdx) => {
            const ch = document.createElement('div');
            ch.className = 'l5-cell-head' + (cIdx === activeColIdx ? ' is-active-col' : '');
            ch.innerHTML = l2BidiTextHTML(h);
            grid.append(ch);
          });

          rows.forEach(row => {
            const rLbl = document.createElement('div');
            rLbl.className = 'l5-row-lbl tone-' + (row.tone || 'neutral');
            rLbl.innerHTML = l2BidiTextHTML(row.label);
            grid.append(rLbl);

            (row.cells || []).forEach((cell, cIdx) => {
              if (!cell.slotId) {
                const stCell = document.createElement('div');
                stCell.className = 'l5-cell-static tone-' + (row.tone || 'neutral') + (cIdx === activeColIdx ? ' is-active-col' : '');
                stCell.innerHTML = '<bdi dir="ltr">' + esc(cell.val) + '</bdi>';
                grid.append(stCell);
              } else {
                const val = String((d.values && d.values[cell.slotId]) || '');
                const isWrong = Boolean(d.wrongSet && d.wrongSet[cell.slotId]);
                const isAct = !locked && d.activeSlotId === cell.slotId;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'l5-cell-slot'
                  + (locked ? ' is-correct' : (isWrong ? ' is-wrong' : (val ? ' is-filled' : '')))
                  + (isAct ? ' is-active' : '');
                btn.setAttribute('aria-label', cell.label || row.label);
                btn.setAttribute('aria-pressed', String(isAct));
                btn.disabled = locked;
                btn.innerHTML = '<bdi dir="ltr">' + esc(locked ? cell.expected : (val || '؟')) + '</bdi>';
                btn.addEventListener('click', () => onSelectSlot(cell.slotId));
                grid.append(btn);
              }
            });
          });

          card.append(grid);
        }

        mount.append(card);
      }
    });
  }

  function renderL5PairTableStep(cur, root) {
    const d = l2StepData(cur);
    const allNames = Array.isArray(cur.allNames) ? cur.allNames : ['ريما', 'لانا', 'سحر', 'ديمة'];

    const slots = (cur.pairs || [])
      .filter(p => Boolean(p.slotId))
      .map(p => ({
        slotId: p.slotId,
        expected: p.expected,
        label: 'الطريقة ' + ar(p.num) + ' (' + (p.slotRole || 'الزوج') + ')',
        formula: p.formula || '',
        usedNames: Array.isArray(p.usedNames) ? p.usedNames : []
      }));

    wireL5SlotChoiceBoard({
      root,
      cur,
      d,
      slots,
      bankPairCls: true,
      renderExtraGuide: (activeSlot, guideBox) => {
        if (!activeSlot || !Array.isArray(activeSlot.usedNames) || !activeSlot.usedNames.length) return;
        const roster = document.createElement('div');
        roster.className = 'l5-roster-bar';
        roster.innerHTML = '<span class="l5-roster-lbl">الصديقات الأربع:</span>' +
          allNames.map(nm => {
            const isUsed = activeSlot.usedNames.includes(nm);
            return '<span class="l5-roster-chip' + (isUsed ? ' is-used' : ' is-open') + '">' + esc(nm) + '</span>';
          }).join('');
        guideBox.append(roster);
      },
      drawBoard: (mount, locked, onSelectSlot) => {
        mount.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'l5-table-card';

        if (cur.ruleChip) {
          const chip = document.createElement('div');
          chip.className = 'l5-table-rule-chip';
          chip.innerHTML = l2BidiTextHTML(cur.ruleChip);
          card.append(chip);
        }

        const grid = document.createElement('div');
        grid.className = 'l5-pair-grid';

        (cur.pairs || []).forEach(p => {
          const isCardActive = !locked && p.slotId && d.activeSlotId === p.slotId;
          const box = document.createElement('div');
          box.className = 'l5-pair-card' + (isCardActive ? ' is-card-active' : '');

          const numHead = document.createElement('div');
          numHead.className = 'l5-pair-num';
          numHead.innerHTML = 'الطريقة <bdi dir="ltr">' + esc(String(p.num)) + '</bdi>';
          box.append(numHead);

          const makeSlotBtn = (roleLabel) => {
            const val = String((d.values && d.values[p.slotId]) || '');
            const isWrong = Boolean(d.wrongSet && d.wrongSet[p.slotId]);
            const isAct = !locked && d.activeSlotId === p.slotId;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'l5-pair-slot'
              + (locked ? ' is-correct' : (isWrong ? ' is-wrong' : (val ? ' is-filled' : '')))
              + (isAct ? ' is-active' : '');
            btn.setAttribute('aria-label', roleLabel + ' في الطريقة ' + ar(p.num));
            btn.setAttribute('aria-pressed', String(isAct));
            btn.disabled = locked;
            btn.textContent = roleLabel + ': ' + (locked ? p.expected : (val || '؟'));
            btn.addEventListener('click', () => onSelectSlot(p.slotId));
            return btn;
          };

          const makeStatic = (txt, isTop) => {
            const el = document.createElement('div');
            el.className = isTop ? 'l5-pair-static is-top' : 'l5-pair-static';
            el.textContent = txt;
            return el;
          };

          // Always consistent order: تمسك الحبل on top, تقفز on bottom!
          if (p.slotId && p.slotRole === 'تمسك') {
            box.append(makeSlotBtn('تمسك'));
            box.append(makeStatic('تقفز: ' + p.jump, false));
          } else {
            box.append(makeStatic('تمسك: ' + p.hold, true));
            if (p.slotId && p.slotRole === 'تقفز') {
              box.append(makeSlotBtn('تقفز'));
            } else {
              box.append(makeStatic('تقفز: ' + p.jump, false));
            }
          }

          grid.append(box);
        });

        card.append(grid);
        mount.append(card);
      }
    });
  }

  function renderL5StrategyBuilderStep(cur, root) {
    const d = l2StepData(cur);
    const list = cur.scenarios || [];
    if (!d.scenId || !list.some(sc => sc.id === d.scenId)) {
      d.scenId = list[0]?.id || 'juice';
    }
    if (!d.revealedMap || typeof d.revealedMap !== 'object') d.revealedMap = {};

    const card = document.createElement('div');
    card.className = 'l5-strategy-card';
    root.append(card);

    const draw = () => {
      card.innerHTML = '';
      const active = list.find(sc => sc.id === d.scenId) || list[0];
      if (!active) return;

      const pills = document.createElement('div');
      pills.className = 'l5-scen-pills';
      list.forEach(sc => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l5-scen-btn' + (sc.id === active.id ? ' is-active' : '');
        b.setAttribute('aria-pressed', String(sc.id === active.id));
        b.textContent = sc.tabLabel;
        b.addEventListener('click', () => {
          d.scenId = sc.id;
          saveState();
          draw();
        });
        pills.append(b);
      });
      card.append(pills);

      const chip = document.createElement('div');
      chip.className = 'l5-table-rule-chip';
      chip.innerHTML = l2BidiTextHTML(active.story);
      card.append(chip);

      if (Array.isArray(active.tableRows) && Array.isArray(active.columns)) {
        const totalRows = active.tableRows.length;
        const rev = Math.max(1, Math.min(totalRows, Number(d.revealedMap[active.id]) || Math.min(2, totalRows)));
        d.revealedMap[active.id] = rev;

        const grid = document.createElement('div');
        grid.className = 'l5-vtable';
        grid.style.setProperty('--l5-vcols', String(active.columns.length));

        active.columns.forEach(col => {
          const hd = document.createElement('div');
          hd.className = 'l5-vcell-head tone-' + (col.tone || 'neutral');
          hd.innerHTML = l2BidiTextHTML(col.label);
          grid.append(hd);
        });

        active.tableRows.forEach((row, rIdx) => {
          const isShown = rIdx < rev;
          const isLatest = rIdx === rev - 1;
          row.vals.forEach((v, cIdx) => {
            const colTone = active.columns[cIdx]?.tone || 'neutral';
            const c = document.createElement('div');
            const isNum = /^[\d,.\s]+$/.test(String(v || '').trim());
            c.className = 'l5-vcell-static tone-' + colTone
              + (isLatest ? ' is-active-row' : '')
              + (isShown && row.isGoal ? ' is-goal' : '')
              + (!isShown ? ' is-dim' : '');
            c.innerHTML = isShown
              ? (isNum ? ('<bdi dir="ltr">' + esc(v) + '</bdi>') : l2BidiTextHTML(v))
              : '<bdi dir="ltr">؟</bdi>';
            grid.append(c);
          });
        });
        card.append(grid);

        const activeNote = active.tableRows[rev - 1]?.note || active.ruleNote || '';
        const noteEl = document.createElement('div');
        noteEl.className = 'l5-scen-step-note';
        noteEl.setAttribute('aria-live', 'polite');
        noteEl.innerHTML = l2BidiTextHTML(activeNote);
        card.append(noteEl);

        const ctrls = document.createElement('div');
        ctrls.className = 'l5-scen-controls';
        const nextRowBtn = document.createElement('button');
        nextRowBtn.type = 'button';
        nextRowBtn.className = 'l5-scen-ctrl-btn is-primary';
        nextRowBtn.textContent = rev < totalRows ? 'أظهر الصف التالي' : 'إعادة من الصف 1';
        nextRowBtn.addEventListener('click', () => {
          d.revealedMap[active.id] = rev < totalRows ? rev + 1 : 1;
          saveState();
          draw();
        });
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'l5-scen-ctrl-btn';
        allBtn.textContent = 'إظهار الجدول كاملاً';
        allBtn.disabled = rev >= totalRows;
        allBtn.addEventListener('click', () => {
          d.revealedMap[active.id] = totalRows;
          saveState();
          draw();
        });
        ctrls.append(nextRowBtn, allBtn);
        card.append(ctrls);

        if (rev >= totalRows && Array.isArray(active.verifyChecks) && active.verifyChecks.length) {
          card.append(buildL5VerifyList(active.verifyChecks));
        }
      } else {
        const cols = active.colHeads.length || 4;
        const grid = document.createElement('div');
        grid.className = 'l5-data-table';
        grid.style.setProperty('--l5-cols', String(cols));

        const corner = document.createElement('div');
        corner.className = 'l5-cell-head';
        corner.textContent = 'البيان';
        grid.append(corner);

        active.colHeads.forEach(h => {
          const ch = document.createElement('div');
          ch.className = 'l5-cell-head';
          ch.innerHTML = l2BidiTextHTML(h);
          grid.append(ch);
        });

        active.rowLabels.forEach(r => {
          const rl = document.createElement('div');
          rl.className = 'l5-row-lbl tone-' + (r.tone || 'neutral');
          rl.innerHTML = l2BidiTextHTML(r.label);
          grid.append(rl);
          r.vals.forEach(v => {
            const c = document.createElement('div');
            c.className = 'l5-cell-static tone-' + (r.tone || 'neutral');
            c.innerHTML = '<bdi dir="ltr">' + esc(v) + '</bdi>';
            grid.append(c);
          });
        });
        card.append(grid);

        const sumEl = document.createElement('div');
        sumEl.className = 'l5-scen-summary';
        sumEl.innerHTML = l2BidiTextHTML(active.verifyText);
        card.append(sumEl);
      }
    };

    draw();
    setPrimaryButtonState('explanation', l2PassPrimaryLabel());
    stepUi.onNext = () => {
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
      }
      advanceStep();
    };
  }

  function showLesson5ResultScreen(cfg) {
    lastActiveLesson = 5;
    state.runnerStep = null;
    state.mapSubView = 'lesson5';
    state.viewMode = 'result';
    saveState();
    renderMultiLessonResultCard(cfg);
  }

  function evaluateLesson5Station10Screen() {
    const rec = typeof getLesson5NodeRecord === 'function' ? getLesson5NodeRecord(9) : null;
    const defs = Lesson5RunnerDefs.L5_MASTERY_QUESTIONS || [];
    const skillsMap = (rec && rec.data && rec.data.skills) || {};
    const rows = defs.map(q => ({
      skill: q.skill,
      label: q.skillLabel,
      ok: Boolean(skillsMap[q.skill])
    }));
    const unmastered = rows.filter(r => !r.ok);
    const masteredCount = rows.length - unmastered.length;
    const nodeDef = typeof L5_NODES !== 'undefined' ? L5_NODES[9] : null;
    const pts = nodeDef ? nodeDef.points : 20;

    if (unmastered.length === 0) {
      const hadRem = Boolean(rec && rec.data && rec.data.remedialRound);
      const stars = !hadRem && (!rec || !rec.errors) ? 3 : 2;
      const res = typeof completeLesson5Station === 'function'
        ? completeLesson5Station(9, pts, stars)
        : { wasDone: false, earnedStars: stars };
      session = null;
      showLesson5ResultScreen({
        ok: true,
        title: 'أحسنت! أتقنت التحدي النهائي للدرس الخامس',
        subtitle: res.wasDone
          ? 'حافظت على إتقان جميع مهارات خطة حل المسألة بإنشاء جدول بنجاح.'
          : 'أنهيت جميع مهارات إنشاء الجداول واستخلاص الحلول والتحقق منها بإتقان كامل!',
        metrics: [
          { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
          { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(pts), label: 'النقاط المكتسبة' },
          { value: ar(rows.length) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' }
        ],
        skills: rows,
        primaryLabel: 'العودة لخريطة الدرس الخامس',
        onPrimary: () => closeToMap(5),
        secondaryLabel: 'إعادة التحدي',
        onSecondary: () => openLesson5Node(9, { forceReset: true })
      });
    } else {
      const nextRound = (rec && rec.data && Number(rec.data.remedialRound) || 0) + 1;
      session = null;
      showLesson5ResultScreen({
        ok: false,
        title: 'بقيت ' + ar(unmastered.length) + ' مهارات لإتقان التحدي',
        subtitle: 'سنتدرب الآن على سؤالين جديدين لكل مهارة متبقية قبل إغلاق البطاقة.',
        metrics: [
          { value: ar(masteredCount) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' },
          { value: ar(unmastered.length), label: 'تحتاج تدريبًا' },
          { value: '0', label: 'نقاط بانتظار الإتقان' }
        ],
        skills: rows,
        primaryLabel: 'تدريب المهارات المتبقية (' + ar(unmastered.length) + ')',
        onPrimary: () => openLesson5Remedial(unmastered, nextRound),
        secondaryLabel: 'العودة لخريطة الدرس الخامس',
        onSecondary: () => closeToMap(5)
      });
    }
  }

  function finishLesson5Session() {
    const s = session;
    if (!s) return;

    if (s.nodeId === 9) {
      const rec = typeof getLesson5NodeRecord === 'function' ? getLesson5NodeRecord(9) : null;
      if (s.remedial && rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        const bySkill = {};
        (s.remedialResponses || []).forEach(r => {
          bySkill[r.skill] = bySkill[r.skill] || [];
          bySkill[r.skill].push(Boolean(r.ok));
        });
        Object.keys(bySkill).forEach(sk => {
          const arr = bySkill[sk];
          if (arr.length > 0 && arr.every(Boolean)) {
            rec.data.skills[sk] = true;
          }
        });
        rec.data.remedialRound = (Number(rec.data.remedialRound) || 0) + 1;
        saveState();
      }
      evaluateLesson5Station10Screen();
      return;
    }

    const rec = typeof getLesson5NodeRecord === 'function' ? getLesson5NodeRecord(s.nodeId) : null;
    const errCount = rec ? (Number(rec.errors) || 0) : (Number(s.errors) || 0);
    let stars = errCount === 0 ? 3 : (errCount <= 2 ? 2 : 1);
    if (rec && rec.assistedSteps && rec.assistedSteps.size > 0) {
      stars = Math.min(2, stars);
    }

    const res = typeof completeLesson5Station === 'function'
      ? completeLesson5Station(s.nodeId, s.points, stars)
      : { wasDone: false, earnedStars: stars };

    const totalNodes = typeof L5_NODES !== 'undefined' ? L5_NODES.length : 10;
    const nextId = s.nodeId + 1;
    const canGoNext = nextId < totalNodes && (typeof isLesson5NodeUnlocked !== 'function' || isLesson5NodeUnlocked(nextId));
    const finishedNodeId = s.nodeId;
    const finishedTitle = s.title;
    const finishedPts = s.points;
    session = null;

    showLesson5ResultScreen({
      ok: true,
      title: 'أحسنت! أتممت «' + finishedTitle + '»',
      subtitle: res.wasDone
        ? 'مراجعة موفقة؛ تم حفظ أدائك دون تكرار النقاط.'
        : 'أكملت جميع خطوات المحطة بنجاح وفتحت المحطة التالية.',
      metrics: [
        { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
        { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(finishedPts), label: 'النقاط' },
        { value: ar(errCount), label: 'محاولات تصحيح' }
      ],
      primaryLabel: canGoNext ? 'المحطة التالية' : 'العودة لخريطة الدرس الخامس',
      onPrimary: () => canGoNext ? openLesson5Node(nextId) : closeToMap(5),
      secondaryLabel: canGoNext ? 'العودة لخريطة الدرس الخامس' : 'إعادة المحطة',
      onSecondary: () => canGoNext ? closeToMap(5) : openLesson5Node(finishedNodeId, { forceReset: true })
    });
  }

  function openLesson5Node(nodeId, options) {
    if (typeof Lesson5RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();

    if (nodeId !== 9 && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 5, nodeId, openOptions: options });
    }

    const st5 = typeof getLesson5State === 'function' ? getLesson5State() : null;
    const rec = typeof getLesson5NodeRecord === 'function' ? getLesson5NodeRecord(nodeId) : null;
    const totalSteps = Lesson5RunnerDefs.getStepCount(nodeId);
    const doneCol = st5 && (st5.completedNodes !== undefined ? st5.completedNodes : st5.completed);
    const alreadyDone = Boolean(doneCol && (typeof doneCol.has === 'function' ? doneCol.has(nodeId) : Array.isArray(doneCol) && doneCol.includes(nodeId)));

    if (nodeId === 9 && !options?.forceReset && !options?.review && !options?.preserveProgress && !alreadyDone) {
      if (rec && rec.passed && rec.passed.size >= totalSteps && rec.data && rec.data.skills) {
        evaluateLesson5Station10Screen();
        return true;
      }
    }

    const shouldReset = Boolean((options?.forceReset || options?.review || alreadyDone) && !options?.preserveProgress);
    if (shouldReset && typeof resetLesson5NodeRecordForReplay === 'function') {
      resetLesson5NodeRecordForReplay(nodeId);
    }

    const built = Lesson5RunnerDefs.buildLesson5Session(nodeId, {
      ...options,
      replay: Boolean(shouldReset || options?.replay)
    });
    if (!built) return false;
    session = built;
    lastActiveLesson = 5;
    state.mapSubView = 'lesson5';
    state.viewMode = 'lesson5';
    setUiMode('learning');
    persistRunnerPosition();
    renderStep();
    return true;
  }

  function openLesson5Remedial(unmasteredList, roundNum) {
    if (typeof Lesson5RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();
    if ((state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 5, nodeId: 9, remedialLaunch: { unmasteredList, roundNum } });
    }
    const built = Lesson5RunnerDefs.buildLesson5RemedialSession(unmasteredList, roundNum);
    if (!built) {
      evaluateLesson5Station10Screen();
      return false;
    }
    session = built;
    lastActiveLesson = 5;
    state.mapSubView = 'lesson5';
    state.viewMode = 'lesson5';
    setUiMode('learning');
    renderStep();
    return true;
  }

  /* =========================================================
     Unit 2 Lesson 1 (lesson = 7): الضرب الذهني — Interactive Renderers & Session Flow
     ========================================================= */

  function renderU2L1TeachStep(cur, root) {
    const wrap = document.createElement('div');
    wrap.className = 'u2-teach-wrap';

    if (cur.animCfg) {
      const animMount = document.createElement('div');
      wrap.append(animMount);
      mountStepConceptAnim(cur, animMount, { lesson: 7 });
    }

    if (cur.ruleNote) {
      const ruleBar = document.createElement('div');
      ruleBar.className = 'u2-rule-bar';
      ruleBar.innerHTML = l2BidiTextHTML(cur.ruleNote);
      wrap.append(ruleBar);
    }

    if (Array.isArray(cur.panels) && cur.panels.length) {
      const grid = document.createElement('div');
      grid.className = 'u2-teach-grid';
      cur.panels.forEach(panel => {
        const card = document.createElement('section');
        card.className = 'u2-teach-panel' + (panel.tone === 'half' ? ' is-half' : ' is-double');
        const head = document.createElement('div');
        head.className = 'u2-teach-panel-head';
        head.innerHTML = ''
          + '<h3 class="u2-teach-panel-title">' + l2BidiTextHTML(panel.title || '') + '</h3>'
          + (panel.badge ? '<span class="u2-op-badge' + (panel.tone === 'half' ? ' is-half' : '') + '">' + l2BidiTextHTML(panel.badge) + '</span>' : '');
        card.append(head);

        const list = document.createElement('ul');
        list.className = 'u2-teach-steps';
        (panel.steps || []).forEach(st => {
          const li = document.createElement('li');
          li.className = 'u2-teach-step-row';
          li.innerHTML = ''
            + '<span>' + l2BidiTextHTML(st.label || '') + '</span>'
            + '<span class="u2-teach-step-eq"><bdi dir="ltr">' + esc(st.eq || '') + '</bdi></span>';
          list.append(li);
        });
        card.append(list);
        grid.append(card);
      });
      wrap.append(grid);
    }

    if (cur.takeaway) {
      const sum = document.createElement('div');
      sum.className = 'u2-teach-summary';
      sum.innerHTML = l2BidiTextHTML(cur.takeaway);
      wrap.append(sum);
    }

    root.append(wrap);
    setPrimaryButtonState('explanation', l2PassPrimaryLabel());
    stepUi.onNext = () => {
      if (!isL2StepPassed(cur)) {
        const rec = l2Record(session?.nodeId);
        if (rec) {
          rec.passed.add(session.index);
          rec.independentSteps.add(cur.key);
          saveState();
        }
      }
      advanceStep();
    };
  }

  function renderU2L1SplitTreeStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const isHalf = cur.mode === 'half';
    const opTag = isHalf ? '÷ 2' : '× 2';
    const parts = Array.isArray(cur.parts) ? cur.parts : [];
    const slotIds = parts.map((_, i) => 'p' + i).concat(['total']);

    if (!d.slots || typeof d.slots !== 'object') d.slots = {};
    if (passed) {
      parts.forEach((pt, i) => { d.slots['p' + i] = pt.expected; });
      d.slots.total = cur.expectedTotal;
    }

    let selectedSlot = slotIds.find(id => d.slots[id] === undefined || d.slots[id] === null) || slotIds[0];
    let errorSlots = new Set();

    const wrap = document.createElement('div');
    wrap.className = 'u2-tree-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    const allFilled = () => slotIds.every(id => d.slots[id] !== undefined && d.slots[id] !== null);

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;
      const splitStr = parts.map(pt => pt.base).join(' + ');

      const board = document.createElement('div');
      board.className = 'u2-tree-board';

      const rootEl = document.createElement('div');
      rootEl.className = 'u2-tree-root' + (isHalf ? ' is-half' : '');
      rootEl.innerHTML = '<bdi dir="ltr">' + cur.number + ' = ' + splitStr + '</bdi>';
      board.append(rootEl);

      const branches = document.createElement('div');
      branches.className = 'u2-tree-branches' + (parts.length >= 3 ? ' is-three' : '');

      parts.forEach((pt, i) => {
        const sid = 'p' + i;
        const val = d.slots[sid];
        const isSel = !locked && selectedSlot === sid;
        const isErr = errorSlots.has(sid);

        const br = document.createElement('div');
        br.className = 'u2-tree-branch';
        br.innerHTML = ''
          + '<span class="u2-tree-part-lbl">' + esc(pt.label) + '</span>'
          + '<span class="u2-tree-part-val"><bdi dir="ltr">' + pt.base + '</bdi></span>'
          + '<span class="u2-tree-op-tag' + (isHalf ? ' is-half' : '') + '"><bdi dir="ltr">' + opTag + '</bdi></span>';

        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.dataset.treeSlot = sid;
        slotBtn.disabled = locked;
        slotBtn.className = 'u2-slot-btn'
          + (locked ? ' is-correct' : (isErr ? ' is-error' : (val !== undefined ? ' is-filled' : '')))
          + (isSel ? ' is-selected' : '');
        slotBtn.setAttribute('aria-label', (isHalf ? 'نصف ' : 'ضعف ') + pt.base + (val !== undefined ? '، القيمة المختارة ' + val : '، خانة فارغة'));
        slotBtn.innerHTML = '<bdi dir="ltr">' + (val !== undefined ? val : '؟') + '</bdi>';
        slotBtn.addEventListener('click', () => {
          if (locked) return;
          if (d.slots[sid] !== undefined && selectedSlot === sid) {
            delete d.slots[sid];
          }
          selectedSlot = sid;
          errorSlots.delete(sid);
          clearFeedback();
          draw();
        });
        br.append(slotBtn);
        branches.append(br);
      });
      board.append(branches);

      // Final sum row
      const sumRow = document.createElement('div');
      sumRow.className = 'u2-tree-sum-row';
      const sumExpr = parts.map((_, i) => (d.slots['p' + i] !== undefined ? d.slots['p' + i] : '□')).join(' + ');
      const totalVal = d.slots.total;
      const isTotalSel = !locked && selectedSlot === 'total';
      const isTotalErr = errorSlots.has('total');

      const sumLbl = document.createElement('span');
      sumLbl.textContent = 'المجموع:';
      sumRow.append(sumLbl);

      const sumEq = document.createElement('div');
      sumEq.className = 'u2-tree-sum-eq';
      const sumPartsEl = document.createElement('span');
      sumPartsEl.textContent = sumExpr + ' =';
      sumEq.append(sumPartsEl);

      const totBtn = document.createElement('button');
      totBtn.type = 'button';
      totBtn.dataset.treeSlot = 'total';
      totBtn.disabled = locked;
      totBtn.className = 'u2-slot-btn'
        + (locked ? ' is-correct' : (isTotalErr ? ' is-error' : (totalVal !== undefined ? ' is-filled' : '')))
        + (isTotalSel ? ' is-selected' : '');
      totBtn.setAttribute('aria-label', 'الناتج النهائي' + (totalVal !== undefined ? '، ' + totalVal : '، خانة فارغة'));
      totBtn.innerHTML = '<bdi dir="ltr">' + (totalVal !== undefined ? totalVal : '؟') + '</bdi>';
      totBtn.addEventListener('click', () => {
        if (locked) return;
        if (d.slots.total !== undefined && selectedSlot === 'total') {
          delete d.slots.total;
        }
        selectedSlot = 'total';
        errorSlots.delete('total');
        clearFeedback();
        draw();
      });
      sumEq.append(totBtn);
      sumRow.append(sumEq);
      board.append(sumRow);
      wrap.append(board);

      if (!locked) {
        const bankLbl = document.createElement('p');
        bankLbl.className = 'u2-bank-label';
        bankLbl.textContent = 'اختر العدد المناسب للخانة المحددة (أو اضغط على أي خانة لتعديلها):';
        wrap.append(bankLbl);

        const bank = document.createElement('div');
        bank.className = 'u2-choice-bank';
        const usedVals = new Set(Object.values(d.slots));
        (cur.choices || []).forEach(ch => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.treeChoice = String(ch);
          btn.className = 'u2-chip-btn' + (usedVals.has(ch) ? ' is-used' : '');
          btn.innerHTML = '<bdi dir="ltr">' + ch + '</bdi>';
          btn.addEventListener('click', () => {
            if (locked) return;
            d.slots[selectedSlot] = ch;
            errorSlots.delete(selectedSlot);
            const nextEmpty = slotIds.find(id => d.slots[id] === undefined);
            if (nextEmpty) selectedSlot = nextEmpty;
            clearFeedback();
            draw();
          });
          bank.append(btn);
        });
        wrap.append(bank);
      }

      if (locked) {
        showFeedback('good', cur.explainRight || 'أحسنت!');
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else {
        setPrimaryButtonState(allFilled() ? 'ready' : 'incomplete', 'تحقّق');
      }
    };

    draw();

    stepUi.onCheck = () => {
      errorSlots = new Set();
      parts.forEach((pt, i) => {
        if (Number(d.slots['p' + i]) !== Number(pt.expected)) errorSlots.add('p' + i);
      });
      if (Number(d.slots.total) !== Number(cur.expectedTotal)) errorSlots.add('total');

      if (errorSlots.size === 0) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'ممتاز! اكتملت شجرة التجزئة بدقة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        selectedSlot = [...errorSlots][0];
        draw();
        const onlyTotalWrong = errorSlots.size === 1 && errorSlots.has('total');
        const msg = onlyTotalWrong
          ? 'فروع التجزئة صحيحة! راجع عملية جمع النواتج الجزئية فقط.'
          : (cur.explainWrong || 'تحقق من الخانات المحددة باللون الأحمر ثم أعد المحاولة.');
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      errorSlots.forEach(sid => { delete d.slots[sid]; });
      selectedSlot = [...errorSlots][0] || slotIds[0];
      errorSlots.clear();
      clearFeedback();
      draw();
    };
  }

  function renderU2L1DHChainStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    if (!Array.isArray(d.rows) || !d.rows.length) {
      d.rows = [{ a: cur.startA, b: cur.startB, opA: '', opB: '' }];
    }
    if (passed) {
      d.answerVal = String(cur.targetProduct);
    }

    const wrap = document.createElement('div');
    wrap.className = 'u2-chain-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    let inputEl = null;
    let inputErr = false;

    const applyStep = (side) => {
      if (passed) return;
      const last = d.rows[d.rows.length - 1];
      if (!last || d.rows.length >= 5) return;
      if (side === 'A' && last.a % 2 === 0 && last.a >= 2) {
        d.rows.push({ a: last.a / 2, b: last.b * 2, opA: '÷ 2', opB: '× 2' });
      } else if (side === 'B' && last.b % 2 === 0 && last.b >= 2) {
        d.rows.push({ a: last.a * 2, b: last.b / 2, opA: '× 2', opB: '÷ 2' });
      }
      if (typeof sound === 'function') sound(true);
      clearFeedback();
      inputErr = false;
      draw();
    };

    const syncPrimary = () => {
      if (passed) {
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
        return;
      }
      const stepsDone = d.rows.length - 1;
      const parsed = l2ParseIntInput(d.answerVal || '');
      if (stepsDone >= 1 && parsed !== null) {
        setPrimaryButtonState('ready', 'تحقّق');
      } else {
        setPrimaryButtonState('incomplete', stepsDone < 1 ? 'نفّذ خطوة تنصيف ومضاعفة أولاً' : 'اكتب الناتج ثم تحقّق');
      }
    };

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;
      const last = d.rows[d.rows.length - 1];
      const stepsDone = d.rows.length - 1;

      const list = document.createElement('div');
      list.className = 'u2-chain-list';
      d.rows.forEach((row, idx) => {
        if (idx > 0) {
          const conn = document.createElement('div');
          conn.className = 'u2-chain-connector';
          conn.innerHTML = ''
            + '<span class="u2-op-badge' + (row.opA === '÷ 2' ? ' is-half' : '') + '"><bdi dir="ltr">↓ ' + row.opA + '</bdi></span>'
            + '<span class="u2-op-badge' + (row.opB === '÷ 2' ? ' is-half' : '') + '"><bdi dir="ltr">↓ ' + row.opB + '</bdi></span>';
          list.append(conn);
        }
        const isLast = idx === d.rows.length - 1;
        const rEl = document.createElement('div');
        rEl.className = 'u2-chain-row' + (locked ? ' is-done' : (isLast ? ' is-active' : ''));
        rEl.innerHTML = ''
          + '<div class="u2-chain-factor' + (isLast && row.a % 2 === 0 ? ' is-even-choice' : '') + '">'
          + '<span class="u2-chain-val"><bdi dir="ltr">' + row.a + '</bdi></span>'
          + '<span class="u2-tree-part-lbl">' + (row.a % 2 === 0 ? 'زوجي' : 'فردي') + '</span>'
          + '</div>'
          + '<span class="u2-chain-mul-sign" aria-hidden="true">×</span>'
          + '<div class="u2-chain-factor' + (isLast && row.b % 2 === 0 ? ' is-even-choice' : '') + '">'
          + '<span class="u2-chain-val"><bdi dir="ltr">' + row.b + '</bdi></span>'
          + '<span class="u2-tree-part-lbl">' + (row.b % 2 === 0 ? 'زوجي' : 'فردي') + '</span>'
          + '</div>';
        list.append(rEl);
      });
      wrap.append(list);

      if (!locked) {
        const canA = last.a % 2 === 0 && last.a >= 2 && d.rows.length < 5;
        const canB = last.b % 2 === 0 && last.b >= 2 && d.rows.length < 5;
        const ctrls = document.createElement('div');
        ctrls.className = 'u2-chain-step-controls';

        const btnA = document.createElement('button');
        btnA.type = 'button';
        btnA.dataset.dhAction = 'halveA';
        btnA.className = 'u2-action-btn' + (cur.recommendedHalveSide === 'A' && canA ? ' is-primary' : ' is-info');
        btnA.disabled = !canA;
        btnA.innerHTML = 'نصّف <bdi dir="ltr">' + last.a + '</bdi> · ضاعف <bdi dir="ltr">' + last.b + '</bdi>';
        btnA.addEventListener('click', () => applyStep('A'));

        const btnB = document.createElement('button');
        btnB.type = 'button';
        btnB.dataset.dhAction = 'halveB';
        btnB.className = 'u2-action-btn' + (cur.recommendedHalveSide === 'B' && canB ? ' is-primary' : ' is-info');
        btnB.disabled = !canB;
        btnB.innerHTML = 'ضاعف <bdi dir="ltr">' + last.a + '</bdi> · نصّف <bdi dir="ltr">' + last.b + '</bdi>';
        btnB.addEventListener('click', () => applyStep('B'));

        ctrls.append(btnA, btnB);
        wrap.append(ctrls);

        if (stepsDone > 0) {
          const undoBtn = document.createElement('button');
          undoBtn.type = 'button';
          undoBtn.className = 'u2-action-btn';
          undoBtn.textContent = 'تراجع عن آخر خطوة';
          undoBtn.addEventListener('click', () => {
            if (d.rows.length > 1) {
              d.rows.pop();
              clearFeedback();
              draw();
            }
          });
          wrap.append(undoBtn);
        }
      }

      const finalBox = document.createElement('div');
      finalBox.className = 'u2-chain-final-box';
      const hintLine = stepsDone < (cur.minSteps || 1) && !locked
        ? 'طبّق خطوة «تنصيف ومضاعفة» أعلاه أولاً لتبسيط الضرب، ثم اكتب الناتج النهائي:'
        : 'الآن احسب ناتج السطر الأخير ذهنيًا (<bdi dir="ltr">' + last.a + ' × ' + last.b + '</bdi>):';
      finalBox.innerHTML = '<p class="u2-bank-label">' + hintLine + '</p>';

      const row = document.createElement('div');
      row.className = 'u2-chain-final-row';
      const lbl = document.createElement('label');
      lbl.htmlFor = 'u2-chain-ans-input';
      lbl.innerHTML = '<strong><bdi dir="ltr">' + last.a + ' × ' + last.b + ' =</bdi></strong>';

      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.id = 'u2-chain-ans-input';
      inputEl.className = 'u2-num-input' + (locked ? ' is-correct' : (inputErr ? ' is-error' : ''));
      inputEl.setAttribute('inputmode', 'numeric');
      inputEl.setAttribute('autocomplete', 'off');
      inputEl.placeholder = 'الناتج';
      inputEl.maxLength = 6;
      inputEl.disabled = locked;
      inputEl.value = d.answerVal || '';
      inputEl.addEventListener('input', () => {
        d.answerVal = inputEl.value;
        inputErr = false;
        inputEl.classList.remove('is-error');
        clearFeedback();
        syncPrimary();
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && stepUi.phase === 'ready' && typeof stepUi.onCheck === 'function') {
          e.preventDefault();
          stepUi.onCheck();
        }
      });

      row.append(lbl, inputEl);
      finalBox.append(row);
      wrap.append(finalBox);

      if (locked) {
        showFeedback('good', cur.explainRight || 'ممتاز!');
      }
      syncPrimary();
    };

    draw();

    stepUi.onCheck = () => {
      const parsed = l2ParseIntInput(d.answerVal || '');
      if (parsed === cur.targetProduct) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'رائع! وصلت للناتج الصحيح ذهنيًا.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        inputErr = true;
        draw();
        let msg = cur.explainWrong || 'راجع ناتج ضرب السطر الأخير.';
        if (parsed !== null && parsed * 10 === cur.targetProduct) {
          msg = 'قريب جدًا! تذكّر إضافة الصفر عند الضرب في مضاعفات العدد 10.';
        } else if (parsed !== null && parsed === cur.targetProduct / 2) {
          msg = 'انتبه! يبدو أنك نصّفت الناتج دون مضاعفة العامل الآخر.';
        }
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      inputErr = false;
      d.answerVal = '';
      clearFeedback();
      draw();
      inputEl?.focus();
    };
  }

  function renderU2L1MentalDrillStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const isHalf = cur.mode === 'half';
    const items = Array.isArray(cur.items) ? cur.items : [];
    if (!d.answers || typeof d.answers !== 'object') d.answers = {};
    if (passed) {
      items.forEach(it => { d.answers[it.qNum] = String(it.expected); });
    }
    let showSplitHelper = Boolean(d.showSplitHelper);
    let wrongNums = new Set();

    const wrap = document.createElement('div');
    wrap.className = 'u2-drill-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    const allEntered = () => items.every(it => l2ParseIntInput(d.answers[it.qNum]) !== null);

    const syncPrimary = () => {
      if (passed) {
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else {
        setPrimaryButtonState(allEntered() ? 'ready' : 'incomplete', 'تحقّق من الإجابات الثلاث');
      }
    };

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;

      const helperBar = document.createElement('div');
      helperBar.className = 'u2-rule-bar has-action' + (isHalf ? ' is-info' : '');
      helperBar.innerHTML = '<span>إرشاد الكتاب: استعمل القيمة المنزلية ' + (isHalf ? 'لتنصيف' : 'لمضاعفة') + ' كل عدد.</span>';
      if (!locked) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'u2-lab-preset-btn' + (showSplitHelper ? ' is-active' : '');
        toggleBtn.textContent = showSplitHelper ? 'إخفاء التجزئة' : 'مساعدة التجزئة';
        toggleBtn.addEventListener('click', () => {
          showSplitHelper = !showSplitHelper;
          d.showSplitHelper = showSplitHelper;
          draw();
        });
        helperBar.append(toggleBtn);
      }
      wrap.append(helperBar);

      const grid = document.createElement('div');
      grid.className = 'u2-drill-list';

      items.forEach(it => {
        const isErr = wrongNums.has(it.qNum);
        const card = document.createElement('div');
        card.className = 'u2-drill-card' + (locked ? ' is-correct' : (isErr ? ' is-error' : ''));

        const head = document.createElement('div');
        head.className = 'u2-drill-head';
        head.innerHTML = ''
          + '<span class="u2-drill-qnum' + (isHalf ? ' is-half' : '') + '"><bdi dir="ltr">' + it.qNum + '</bdi></span>'
          + '<span class="u2-drill-expr"><bdi dir="ltr">' + it.num + '</bdi></span>'
          + '<span class="u2-op-badge' + (isHalf ? ' is-half' : '') + '"><bdi dir="ltr">' + (isHalf ? '÷ 2' : '× 2') + '</bdi></span>';
        card.append(head);

        if (showSplitHelper || locked) {
          const sp = document.createElement('div');
          sp.className = 'u2-drill-split-hint';
          sp.innerHTML = l2BidiTextHTML(it.splitText);
          card.append(sp);
        }

        const inpRow = document.createElement('div');
        inpRow.className = 'u2-drill-input-row';
        const inpId = 'u2-drill-inp-' + it.qNum;
        const lbl = document.createElement('label');
        lbl.htmlFor = inpId;
        lbl.className = 'u2-bank-label';
        lbl.textContent = isHalf ? 'النصف:' : 'الضعف:';

        const inp = document.createElement('input');
        inp.type = 'text';
        inp.id = inpId;
        inp.dataset.drillQ = String(it.qNum);
        inp.className = 'u2-num-input' + (locked ? ' is-correct' : (isErr ? ' is-error' : ''));
        inp.setAttribute('inputmode', 'numeric');
        inp.setAttribute('autocomplete', 'off');
        inp.maxLength = 5;
        inp.disabled = locked;
        inp.placeholder = '؟';
        inp.value = d.answers[it.qNum] || '';
        inp.addEventListener('input', () => {
          d.answers[it.qNum] = inp.value;
          wrongNums.delete(it.qNum);
          inp.classList.remove('is-error');
          card.classList.remove('is-error');
          clearFeedback();
          syncPrimary();
        });
        inpRow.append(lbl, inp);
        card.append(inpRow);
        grid.append(card);
      });

      wrap.append(grid);
      if (locked) {
        showFeedback('good', cur.explainRight || 'أحسنت!');
      }
      syncPrimary();
    };

    draw();

    stepUi.onCheck = () => {
      wrongNums = new Set();
      let swappedOp = false;
      items.forEach(it => {
        const val = l2ParseIntInput(d.answers[it.qNum]);
        if (val !== it.expected) {
          wrongNums.add(it.qNum);
          if (isHalf && val === it.num * 2) swappedOp = true;
          if (!isHalf && val === it.num / 2) swappedOp = true;
        }
      });

      if (wrongNums.size === 0) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'أحسنت! جميع الإجابات صحيحة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        draw();
        const msg = swappedOp
          ? (isHalf ? 'انتبه! المطلوب «نصف» العدد (÷ 2) وليس ضعفه (× 2).' : 'انتبه! المطلوب «ضعف» العدد (× 2) وليس نصفه (÷ 2).')
          : 'تحقق من البطاقات المحددة باللون الأحمر (' + [...wrongNums].map(n => 'س' + n).join('، ') + ') ثم أعد المحاولة.';
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'تصحيح الإجابات');
      }
    };

    stepUi.onRetry = () => {
      wrongNums.forEach(q => { d.answers[q] = ''; });
      wrongNums.clear();
      clearFeedback();
      draw();
    };
  }

  function renderU2L1BalloonsStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    if (passed) {
      d.balloonId = cur.correctBalloonId;
      d.reasonId = cur.correctReasonId;
    }
    let showErr = false;

    const wrap = document.createElement('div');
    wrap.className = 'u2-reason-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    const syncPrimary = () => {
      if (passed) {
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else if (d.balloonId && d.reasonId) {
        setPrimaryButtonState('ready', 'تحقّق من الاختيار والتبرير');
      } else {
        setPrimaryButtonState('incomplete', d.balloonId ? 'اختر التبرير الصحيح أدناه' : 'اختر البالون المختلف أولاً');
      }
    };

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;

      const grid = document.createElement('div');
      grid.className = 'u2-balloons-grid';
      (cur.balloons || []).forEach(bl => {
        const isSel = d.balloonId === bl.id;
        const isRight = bl.id === cur.correctBalloonId;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.balloonId = bl.id;
        btn.disabled = locked;
        btn.className = 'u2-balloon-btn'
          + (locked && isRight ? ' is-correct' : (showErr && isSel && !isRight ? ' is-error' : (isSel ? ' is-selected' : '')));
        btn.setAttribute('aria-pressed', String(isSel));
        btn.innerHTML = ''
          + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c-4 0-7 3-7 7 0 4.5 3.5 8 7 10 3.5-2 7-5.5 7-10 0-4-3-7-7-7z"/><path d="M12 19v3"/></svg>'
          + '<span><bdi dir="ltr">' + esc(bl.expr) + '</bdi></span>'
          + (locked ? '<span class="u2-balloon-parity">' + esc(bl.parity) + '</span>' : '');
        btn.addEventListener('click', () => {
          if (locked) return;
          d.balloonId = bl.id;
          showErr = false;
          clearFeedback();
          draw();
        });
        grid.append(btn);
      });
      wrap.append(grid);

      if (d.balloonId || locked) {
        const reasonBox = document.createElement('div');
        reasonBox.className = 'u2-card';
        const heading = document.createElement('p');
        heading.className = 'u2-bank-label';
        heading.textContent = 'أبرّر إجابتي: لماذا اخترت هذا البالون؟';
        reasonBox.append(heading);

        const rList = l2CreateRadioOptions({
          items: (cur.reasons || []).map(r => ({ label: r.label })),
          selectedIdx: (cur.reasons || []).findIndex(r => r.id === d.reasonId),
          revealedRightIdx: locked ? (cur.reasons || []).findIndex(r => r.id === cur.correctReasonId) : -1,
          wrongIndices: showErr && d.reasonId && d.reasonId !== cur.correctReasonId
            ? [(cur.reasons || []).findIndex(r => r.id === d.reasonId)]
            : [],
          disabled: locked,
          onSelect: (idx) => {
            if (locked) return;
            d.reasonId = cur.reasons[idx].id;
            showErr = false;
            clearFeedback();
            draw();
          }
        });
        reasonBox.append(rList);
        wrap.append(reasonBox);
      }

      if (locked) {
        showFeedback('good', cur.explainRight || 'أحسنت!');
      }
      syncPrimary();
    };

    draw();

    stepUi.onCheck = () => {
      const okBalloon = d.balloonId === cur.correctBalloonId;
      const okReason = d.reasonId === cur.correctReasonId;
      if (okBalloon && okReason) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'أحسنت! اكتشفت المختلف وبرّرت بدقة.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        showErr = true;
        draw();
        const msg = !okBalloon
          ? 'هذا البالون يحتوي على عدد زوجي فيمكن تنصيفه! ابحث عن البالون الذي كلا عدديه فردي.'
          : 'اخترت البالون الصحيح (29 × 29)، لكن راجع سبب عدم صلاحية التنصيف والمضاعفة له.';
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      showErr = false;
      clearFeedback();
      draw();
    };
  }

  function renderU2L1TrainStoryStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const stops = Array.isArray(cur.stops) ? cur.stops : [];
    if (!d.stopVals || typeof d.stopVals !== 'object') d.stopVals = {};
    if (passed) {
      stops.forEach(st => { d.stopVals[st.id] = String(st.expected); });
    }
    let wrongStops = new Set();

    const wrap = document.createElement('div');
    wrap.className = 'u2-train-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    const allEntered = () => stops.every(st => l2ParseIntInput(d.stopVals[st.id]) !== null);

    const syncPrimary = () => {
      if (passed) setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      else setPrimaryButtonState(allEntered() ? 'ready' : 'incomplete', 'تحقّق من خطوات القطار');
    };

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;

      const startBar = document.createElement('div');
      startBar.className = 'u2-rule-bar is-gold';
      startBar.innerHTML = '<span>نقطة البداية: على متن القطار <strong><bdi dir="ltr">' + cur.startPassengers + '</bdi></strong> راكبًا.</span>';
      wrap.append(startBar);

      const track = document.createElement('div');
      track.className = 'u2-train-track';

      stops.forEach((st, idx) => {
        const isErr = wrongStops.has(st.id);
        const card = document.createElement('section');
        card.className = 'u2-train-stop' + (locked ? ' is-done' : (isErr ? ' is-error' : (idx === 0 ? ' is-current' : '')));

        const head = document.createElement('div');
        head.className = 'u2-train-stop-head';
        head.innerHTML = '<span class="u2-train-stop-title">' + esc(st.title) + '</span>'
          + '<span class="u2-op-badge' + (idx === 0 ? ' is-half' : '') + '"><bdi dir="ltr">' + (idx === 0 ? '÷ 2' : (idx === 1 ? '+ 218' : '× 2')) + '</bdi></span>';
        card.append(head);

        const desc = document.createElement('p');
        desc.className = 'u2-train-stop-desc';
        desc.innerHTML = l2BidiTextHTML(st.desc);
        card.append(desc);

        const calcRow = document.createElement('div');
        calcRow.className = 'u2-train-calc-row';
        const inpId = 'u2-train-inp-' + st.id;
        const lbl = document.createElement('label');
        lbl.htmlFor = inpId;
        lbl.className = 'u2-bank-label';
        lbl.textContent = 'الركاب:';

        const inp = document.createElement('input');
        inp.type = 'text';
        inp.id = inpId;
        inp.dataset.trainStop = st.id;
        inp.className = 'u2-num-input' + (locked ? ' is-correct' : (isErr ? ' is-error' : ''));
        inp.setAttribute('inputmode', 'numeric');
        inp.setAttribute('autocomplete', 'off');
        inp.maxLength = 4;
        inp.disabled = locked;
        inp.placeholder = '؟';
        inp.value = d.stopVals[st.id] || '';
        inp.addEventListener('input', () => {
          d.stopVals[st.id] = inp.value;
          wrongStops.delete(st.id);
          inp.classList.remove('is-error');
          clearFeedback();
          syncPrimary();
        });
        calcRow.append(lbl, inp);
        card.append(calcRow);
        track.append(card);
      });

      wrap.append(track);
      if (locked) showFeedback('good', cur.explainRight || 'أحسنت!');
      syncPrimary();
    };

    draw();

    stepUi.onCheck = () => {
      wrongStops = new Set();
      stops.forEach(st => {
        if (l2ParseIntInput(d.stopVals[st.id]) !== st.expected) wrongStops.add(st.id);
      });
      if (wrongStops.size === 0) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'ممتاز! أصبح في القطار 514 راكبًا.');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        draw();
        const firstWrong = stops.find(st => wrongStops.has(st.id));
        const msg = firstWrong
          ? 'راجع «' + firstWrong.title + '»: ' + firstWrong.formula
          : (cur.explainWrong || 'راجع الحسابات خطوة بخطوة.');
        showFeedback('bad', msg);
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'تصحيح الخطوات');
      }
    };

    stepUi.onRetry = () => {
      wrongStops.forEach(id => { d.stopVals[id] = ''; });
      wrongStops.clear();
      clearFeedback();
      draw();
    };
  }

  function renderU2L1ReasonBuilderStep(cur, root) {
    const d = l2StepData(cur);
    const passed = isL2StepPassed(cur);
    const slots = (cur.segments || []).filter(s => s.type === 'slot');
    if (!d.filled || typeof d.filled !== 'object') d.filled = {};
    if (passed) {
      slots.forEach(sl => { d.filled[sl.id] = sl.expected; });
    }
    let activeSlotId = (slots.find(sl => !d.filled[sl.id]) || slots[0])?.id;
    let errorSlots = new Set();

    const wrap = document.createElement('div');
    wrap.className = 'u2-reason-wrap';
    root.append(wrap);

    const hintMount = document.createElement('div');
    root.append(hintMount);
    l2AppendHintWidget(hintMount, cur, d);

    const allFilled = () => slots.every(sl => Boolean(d.filled[sl.id]));

    const draw = () => {
      wrap.replaceChildren();
      const locked = passed;

      const sent = document.createElement('div');
      sent.className = 'u2-reason-sentence';
      (cur.segments || []).forEach(seg => {
        if (seg.type === 'text') {
          const sp = document.createElement('span');
          sp.innerHTML = l2BidiTextHTML(seg.text);
          sent.append(sp);
        } else {
          const val = d.filled[seg.id];
          const isSel = !locked && activeSlotId === seg.id;
          const isErr = errorSlots.has(seg.id);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.reasonSlot = seg.id;
          btn.disabled = locked;
          btn.className = 'u2-reason-slot'
            + (locked ? ' is-correct' : (isErr ? ' is-error' : (val ? ' is-filled' : '')))
            + (isSel ? ' is-selected' : '');
          btn.innerHTML = l2BidiTextHTML(val || seg.placeholder || '...');
          btn.addEventListener('click', () => {
            if (locked) return;
            if (d.filled[seg.id] && activeSlotId === seg.id) delete d.filled[seg.id];
            activeSlotId = seg.id;
            errorSlots.delete(seg.id);
            clearFeedback();
            draw();
          });
          sent.append(btn);
        }
      });
      wrap.append(sent);

      if (!locked) {
        const lbl = document.createElement('p');
        lbl.className = 'u2-bank-label';
        lbl.textContent = 'اختر العبارة المناسبة لإكمال الفراغ المحدد:';
        wrap.append(lbl);

        const bank = document.createElement('div');
        bank.className = 'u2-choice-bank';
        const usedSet = new Set(Object.values(d.filled));
        (cur.bank || []).forEach(choice => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.reasonChoice = choice;
          btn.className = 'u2-chip-btn' + (usedSet.has(choice) ? ' is-used' : '');
          btn.innerHTML = l2BidiTextHTML(choice);
          btn.addEventListener('click', () => {
            if (locked || !activeSlotId) return;
            d.filled[activeSlotId] = choice;
            errorSlots.delete(activeSlotId);
            const nextEmpty = slots.find(sl => !d.filled[sl.id]);
            if (nextEmpty) activeSlotId = nextEmpty.id;
            clearFeedback();
            draw();
          });
          bank.append(btn);
        });
        wrap.append(bank);
      }

      // Optional student example note box
      const noteCard = document.createElement('div');
      noteCard.className = 'u2-card';
      const noteLbl = document.createElement('label');
      noteLbl.htmlFor = 'u2-talk-note';
      noteLbl.className = 'u2-bank-label';
      noteLbl.textContent = 'مساحة اختيارية: اكتب مثالاً من عندك أو اشرح بطريقتك (يمكنك أيضًا مشاركته مع المعلم الذكي):';
      const ta = document.createElement('textarea');
      ta.id = 'u2-talk-note';
      ta.className = 'u2-reason-note-area';
      ta.placeholder = cur.notePlaceholder || '';
      ta.maxLength = 250;
      ta.value = d.studentNote || '';
      ta.addEventListener('input', () => {
        d.studentNote = ta.value;
        saveState();
      });
      noteCard.append(noteLbl, ta);
      wrap.append(noteCard);

      if (locked) {
        showFeedback('good', cur.explainRight || 'أحسنت!');
        setPrimaryButtonState('explanation', l2PassPrimaryLabel());
      } else {
        setPrimaryButtonState(allFilled() ? 'ready' : 'incomplete', 'تحقّق من القاعدة');
      }
    };

    draw();

    stepUi.onCheck = () => {
      errorSlots = new Set();
      slots.forEach(sl => {
        if (d.filled[sl.id] !== sl.expected) errorSlots.add(sl.id);
      });
      if (errorSlots.size === 0) {
        recordL2StepPass(cur, d);
        draw();
        showFeedback('good', cur.explainRight || 'ملخص رائع ومكتمل!');
        setPrimaryButtonState('correct', l2PassPrimaryLabel());
      } else {
        markL2StepError();
        activeSlotId = [...errorSlots][0];
        draw();
        showFeedback('bad', cur.explainWrong || 'راجع الفراغات المحددة باللون الأحمر لتكتمل القاعدة بدقة.');
        setPrimaryButtonState('wrong', stepUi.needsRecharge ? 'اشحن قلوبك للمتابعة' : 'حاول مجددًا');
      }
    };

    stepUi.onRetry = () => {
      errorSlots.forEach(id => { delete d.filled[id]; });
      activeSlotId = [...errorSlots][0] || slots[0]?.id;
      errorSlots.clear();
      clearFeedback();
      draw();
    };
  }

  function showU2L1ResultScreen(cfg) {
    lastActiveLesson = 7;
    state.runnerStep = null;
    state.mapSubView = 'u2_lesson1';
    state.viewMode = 'result';
    saveState();
    renderMultiLessonResultCard(cfg);
  }

  function evaluateU2L1MasteryScreen() {
    const rec = typeof getU2L1NodeRecord === 'function' ? getU2L1NodeRecord(10) : null;
    const defs = U2Lesson1RunnerDefs.U2L1_MASTERY_QUESTIONS || [];
    const skillsMap = (rec && rec.data && rec.data.skills) || {};
    const rows = defs.map(q => ({
      skill: q.skill,
      label: q.skillLabel,
      ok: Boolean(skillsMap[q.skill])
    }));
    const unmastered = rows.filter(r => !r.ok);
    const masteredCount = rows.length - unmastered.length;
    const nodeDef = typeof U2L1_NODES !== 'undefined' ? U2L1_NODES[10] : null;
    const pts = nodeDef ? nodeDef.points : 20;

    if (unmastered.length === 0) {
      const hadRem = Boolean(rec && rec.data && rec.data.remedialRound);
      const stars = !hadRem && (!rec || !rec.errors) ? 3 : 2;
      const res = typeof completeU2L1Station === 'function'
        ? completeU2L1Station(10, pts, stars)
        : { wasDone: false, earnedStars: stars };
      session = null;
      showU2L1ResultScreen({
        ok: true,
        title: 'أحسنت! أتقنت الضرب الذهني بالكامل',
        subtitle: res.wasDone
          ? 'حافظت على إتقان جميع مهارات المضاعفة والتنصيف بنجاح.'
          : 'أنهيت جميع مهارات الوحدة 2 · الدرس 1 (الضرب الذهني) بإتقان تام!',
        metrics: [
          { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
          { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(pts), label: 'النقاط المكتسبة' },
          { value: ar(rows.length) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' }
        ],
        skills: rows,
        primaryLabel: 'العودة لخريطة الدرس',
        onPrimary: () => closeToMap(7),
        secondaryLabel: 'إعادة تذكرة الإتقان',
        onSecondary: () => openU2L1Node(10, { forceReset: true })
      });
    } else {
      const nextRound = (rec && rec.data && Number(rec.data.remedialRound) || 0) + 1;
      session = null;
      showU2L1ResultScreen({
        ok: false,
        title: 'بقيت ' + ar(unmastered.length) + ' مهارات لإتقان التحدي',
        subtitle: 'سنتدرب الآن على سؤالين جديدين لكل مهارة متبقية قبل اعتماد تذكرة الإتقان.',
        metrics: [
          { value: ar(masteredCount) + ' من ' + ar(rows.length), label: 'المهارات المتقنة' },
          { value: ar(unmastered.length), label: 'تحتاج تدريبًا' },
          { value: '0', label: 'نقاط بانتظار الإتقان' }
        ],
        skills: rows,
        primaryLabel: 'تدريب المهارات المتبقية (' + ar(unmastered.length) + ')',
        onPrimary: () => openU2L1Remedial(unmastered, nextRound),
        secondaryLabel: 'العودة لخريطة الدرس',
        onSecondary: () => closeToMap(7)
      });
    }
  }

  function finishU2L1Session() {
    const s = session;
    if (!s) return;

    if (s.nodeId === 10) {
      const rec = typeof getU2L1NodeRecord === 'function' ? getU2L1NodeRecord(10) : null;
      if (s.remedial && rec) {
        rec.data = rec.data || {};
        rec.data.skills = rec.data.skills || {};
        const bySkill = {};
        (s.remedialResponses || []).forEach(r => {
          bySkill[r.skill] = bySkill[r.skill] || [];
          bySkill[r.skill].push(Boolean(r.ok));
        });
        Object.keys(bySkill).forEach(sk => {
          const arr = bySkill[sk];
          if (arr.length > 0 && arr.every(Boolean)) {
            rec.data.skills[sk] = true;
          }
        });
        rec.data.remedialRound = (Number(rec.data.remedialRound) || 0) + 1;
        saveState();
      }
      evaluateU2L1MasteryScreen();
      return;
    }

    const rec = typeof getU2L1NodeRecord === 'function' ? getU2L1NodeRecord(s.nodeId) : null;
    const errCount = rec ? (Number(rec.errors) || 0) : (Number(s.errors) || 0);
    let stars = errCount === 0 ? 3 : (errCount <= 2 ? 2 : 1);
    if (rec && rec.assistedSteps && rec.assistedSteps.size > 0) {
      stars = Math.min(2, stars);
    }

    const res = typeof completeU2L1Station === 'function'
      ? completeU2L1Station(s.nodeId, s.points, stars)
      : { wasDone: false, earnedStars: stars };

    const totalNodes = typeof U2L1_NODES !== 'undefined' ? U2L1_NODES.length : 11;
    const nextId = s.nodeId + 1;
    const canGoNext = nextId < totalNodes && (typeof isU2L1NodeUnlocked !== 'function' || isU2L1NodeUnlocked(nextId));
    const finishedNodeId = s.nodeId;
    const finishedTitle = s.title;
    const finishedPts = s.points;
    session = null;

    showU2L1ResultScreen({
      ok: true,
      title: 'أحسنت! أتممت «' + finishedTitle + '»',
      subtitle: res.wasDone
        ? 'مراجعة موفقة؛ تم حفظ أدائك دون تكرار النقاط.'
        : 'أكملت جميع خطوات المحطة بنجاح وفتحت المحطة التالية.',
      metrics: [
        { value: ar(res.earnedStars) + ' من ' + ar(3), label: 'النجوم' },
        { value: res.wasDone ? '0 (مراجعة)' : '+' + ar(finishedPts), label: 'النقاط' },
        { value: ar(errCount), label: 'محاولات تصحيح' }
      ],
      primaryLabel: canGoNext ? 'المحطة التالية' : 'العودة لخريطة الدرس',
      onPrimary: () => canGoNext ? openU2L1Node(nextId) : closeToMap(7),
      secondaryLabel: canGoNext ? 'العودة لخريطة الدرس' : 'إعادة المحطة',
      onSecondary: () => canGoNext ? closeToMap(7) : openU2L1Node(finishedNodeId, { forceReset: true })
    });
  }

  function openU2L1Node(nodeId, options) {
    if (typeof U2Lesson1RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();

    if (nodeId !== 10 && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 7, nodeId, openOptions: options });
    }

    const st = typeof getU2L1State === 'function' ? getU2L1State() : null;
    const rec = typeof getU2L1NodeRecord === 'function' ? getU2L1NodeRecord(nodeId) : null;
    const totalSteps = U2Lesson1RunnerDefs.getStepCount(nodeId);
    const alreadyDone = Boolean(st && st.completedNodes && st.completedNodes.has(nodeId));

    if (nodeId === 10 && !options?.forceReset && !options?.review && !options?.preserveProgress && !alreadyDone) {
      if (rec && rec.passed && rec.passed.size >= totalSteps && rec.data && rec.data.skills) {
        evaluateU2L1MasteryScreen();
        return true;
      }
    }

    const shouldReset = Boolean((options?.forceReset || options?.review || alreadyDone) && !options?.preserveProgress);
    if (shouldReset && typeof resetU2L1NodeRecordForReplay === 'function') {
      resetU2L1NodeRecordForReplay(nodeId);
    }

    const built = U2Lesson1RunnerDefs.buildU2L1Session(nodeId, {
      ...options,
      replay: Boolean(shouldReset || options?.replay)
    });
    if (!built) return false;
    session = built;
    lastActiveLesson = 7;
    state.mapSubView = 'u2_lesson1';
    state.viewMode = 'u2_lesson1';
    setUiMode('learning');
    persistRunnerPosition();
    renderStep();
    return true;
  }

  function openU2L1Remedial(unmasteredList, roundNum) {
    if (typeof U2Lesson1RunnerDefs === 'undefined') return false;
    bindShellChromeOnce();
    cleanupStepSideEffects();
    if ((state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 7, nodeId: 10, remedialLaunch: { unmasteredList, roundNum } });
    }
    const built = U2Lesson1RunnerDefs.buildU2L1RemedialSession(unmasteredList, roundNum);
    if (!built) {
      evaluateU2L1MasteryScreen();
      return false;
    }
    session = built;
    lastActiveLesson = 7;
    state.mapSubView = 'u2_lesson1';
    state.viewMode = 'u2_lesson1';
    setUiMode('learning');
    renderStep();
    return true;
  }

  function bindShellChromeOnce() {
    if (chromeBound) return;
    chromeBound = true;

    byId('l1-exit-btn')?.addEventListener('click', () => {
      closeToMap();
    });

    byId('l1-audio-btn')?.addEventListener('click', () => {
      const cur = session?.steps?.[session.index];
      if (cur && typeof cur.audioFn === 'function') cur.audioFn();
    });

    byId('l1-ai-tutor-btn')?.addEventListener('click', () => {
      if (typeof openAiTutor === 'function') {
        const dlg = byId('ai-tutor-sheet');
        if (dlg) {
          dlg.removeAttribute('inert');
          dlg.removeAttribute('aria-hidden');
        }
        openAiTutor();
      }
    });

    byId('l2-shell-lab-btn')?.addEventListener('click', () => {
      const dlg = byId('cmp-lab-dialog');
      if (dlg) {
        dlg.removeAttribute('inert');
        dlg.removeAttribute('aria-hidden');
        if (!dlg.dataset.l2BoundClose) {
          dlg.dataset.l2BoundClose = '1';
          dlg.addEventListener('close', () => {
            if (isActive()) {
              dlg.setAttribute('inert', '');
              dlg.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }
      if (typeof openComparisonLab === 'function') {
        const cur = session?.steps?.[session.index];
        const a = cur?.numA ?? cur?.visual?.leftNum ?? 3456210;
        const b = cur?.numB ?? cur?.visual?.rightNum ?? 3759120;
        openComparisonLab(a, b);
      }
    });

    byId('l3-shell-lab-btn')?.addEventListener('click', () => {
      const dlg = byId('ops-lab-dialog');
      if (dlg) {
        dlg.removeAttribute('inert');
        dlg.removeAttribute('aria-hidden');
        if (!dlg.dataset.l3BoundClose) {
          dlg.dataset.l3BoundClose = '1';
          dlg.addEventListener('close', () => {
            if (isActive()) {
              dlg.setAttribute('inert', '');
              dlg.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }
      if (typeof openOperationsLab === 'function') {
        const cur = session?.steps?.[session.index];
        const op = cur?.op === 'sub' ? 'sub' : 'add';
        const ops = Array.isArray(cur?.operands) ? cur.operands : (Array.isArray(cur?.topOperands) ? cur.topOperands : [3421664, 1897632]);
        const a = ops[0] ?? 3421664;
        const b = ops[1] ?? 1897632;
        openOperationsLab(a, b, op);
      }
    });

    byId('l4-shell-lab-btn')?.addEventListener('click', () => {
      const dlg = byId('neg-lab-dialog');
      if (dlg) {
        dlg.removeAttribute('inert');
        dlg.removeAttribute('aria-hidden');
        if (!dlg.dataset.l4BoundClose) {
          dlg.dataset.l4BoundClose = '1';
          dlg.addEventListener('close', () => {
            if (isActive()) {
              dlg.setAttribute('inert', '');
              dlg.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }
      if (typeof openNegativeNumbersLab === 'function') {
        const cur = session?.steps?.[session.index];
        const mode = cur?.kind === 'l4_thermometer' ? 'thermo' : (cur?.kind === 'l4_vertical_scale' ? 'altitude' : 'line');
        const initVal = cur?.kind === 'l4_thermometer'
          ? (cur.initialTemp ?? -3)
          : (cur?.kind === 'l4_number_line' ? (cur.target ?? -4) : 0);
        openNegativeNumbersLab(mode, initVal);
      }
    });

    byId('l5-shell-lab-btn')?.addEventListener('click', () => {
      const dlg = byId('table-lab-dialog');
      if (dlg) {
        dlg.removeAttribute('inert');
        dlg.removeAttribute('aria-hidden');
        if (!dlg.dataset.l5BoundClose) {
          dlg.dataset.l5BoundClose = '1';
          dlg.addEventListener('close', () => {
            if (isActive()) {
              dlg.setAttribute('inert', '');
              dlg.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }
      if (typeof openTableStrategyLab === 'function') {
        const nid = session?.nodeId ?? 0;
        const preset = nid === 3 ? 'flowers' : (nid === 4 ? 'outfits' : (nid === 5 ? 'coffee' : (nid === 6 ? 'rope' : 'marbles')));
        openTableStrategyLab(preset);
      }
    });

    byId('u2l1-shell-lab-btn')?.addEventListener('click', () => {
      const dlg = byId('mental-mul-lab-dialog');
      if (dlg) {
        dlg.removeAttribute('inert');
        dlg.removeAttribute('aria-hidden');
        if (!dlg.dataset.u2l1BoundClose) {
          dlg.dataset.u2l1BoundClose = '1';
          dlg.addEventListener('close', () => {
            if (isActive()) {
              dlg.setAttribute('inert', '');
              dlg.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }
      if (typeof openMentalMulLab === 'function') {
        const cur = session?.steps?.[session.index];
        if (cur && cur.kind === 'u2l1_split_tree') {
          openMentalMulLab({ mode: 'tree', op: cur.mode === 'half' ? 'half' : 'double', num: cur.number });
        } else if (cur && cur.kind === 'u2l1_mental_drill' && Array.isArray(cur.items) && cur.items[0]) {
          openMentalMulLab({ mode: 'tree', op: cur.mode === 'half' ? 'half' : 'double', num: cur.items[0].num });
        } else if (cur && cur.kind === 'u2l1_dh_chain') {
          openMentalMulLab({ mode: 'chain', a: cur.startA, b: cur.startB });
        } else {
          openMentalMulLab({ mode: 'chain', a: 35, b: 16 });
        }
      }
    });

    byId('l1-primary-btn')?.addEventListener('click', async () => {
      if (isSubmitting || !stepUi) return;
      isSubmitting = true;
      try {
        const launchActiveRecharge = () => {
          const activeLesson = session?.lesson || 1;
          if (session?.remedial) {
            const isLastRem = session.index >= session.steps.length - 1;
            const nextIndex = isLastRem ? session.index : session.index + 1;
            const snap = { ...session, index: nextIndex };
            openRecharge({
              lesson: activeLesson,
              nodeId: session.nodeId >= 0 ? session.nodeId : null,
              remedialSnapshot: snap,
              finishAfterRecharge: isLastRem
            });
            return;
          }
          const retId = session?.nodeId >= 0 ? session.nodeId : null;
          openRecharge({
            lesson: activeLesson,
            nodeId: retId,
            openOptions: activeLesson >= 2 ? { preserveProgress: true } : null
          });
        };

        if (stepUi.phase === 'ready') {
          if (typeof stepUi.onCheck === 'function') await stepUi.onCheck();
        } else if (stepUi.phase === 'wrong') {
          if (stepUi.needsRecharge) {
            launchActiveRecharge();
          } else if (typeof stepUi.onRetry === 'function') {
            stepUi.onRetry();
          }
        } else if (stepUi.phase === 'correct' || stepUi.phase === 'explanation') {
          if (stepUi.needsRecharge && session?.remedial) {
            launchActiveRecharge();
          } else if (typeof stepUi.onNext === 'function') {
            stepUi.onNext();
          } else {
            advanceStep();
          }
        }
      } finally {
        isSubmitting = false;
      }
    });
  }

  function openNode(nodeId, options) {
    bindShellChromeOnce();
    const node = PATH_NODES.find(n => n.id === nodeId);
    if (node?.type === 'mission' && (state.hearts || 0) <= 0) {
      return openRecharge({ lesson: 1, nodeId, openOptions: options });
    }
    if (node?.type === 'exit_ticket' && !options?.forceNew) {
      const et = prepareExitTicketSession(false);
      if (et.status === 'completed' && et.lastResult) {
        state.activeNode = nodeId;
        state.infiniteMode = false;
        showExitTicketResultScreen(et.lastResult);
        return true;
      }
    }
    const s = buildSessionForNode(nodeId, options);
    if (!s) return false;
    state.activeNode = nodeId;
    state.infiniteMode = false;
    if (node) {
      state.scene = node.unit;
      state.viewMode = node.type === 'exit_ticket' ? 'exit_ticket' : node.type;
    }
    session = s;
    setUiMode('learning');
    renderStep();
    return true;
  }

  function openInfinite(skill) {
    bindShellChromeOnce();
    session = buildInfiniteSession(skill);
    setUiMode('learning');
    renderStep();
    return true;
  }

  function openRecharge(returnArg) {
    bindShellChromeOnce();
    cleanupStepSideEffects();
    const retCtx = normalizeRechargeReturnContext(returnArg);
    lastActiveLesson = retCtx.lesson || 1;
    state.viewMode = 'recharge';
    session = buildRechargeSession(retCtx);
    setUiMode('learning');
    renderStep();
    return true;
  }

  function openScratchpad() {
    bindShellChromeOnce();
    state.viewMode = 'scratchpad';
    session = buildScratchpadSession();
    setUiMode('learning');
    renderStep();
    return true;
  }

  function closeToMap(targetLesson) {
    cleanupStepSideEffects();
    const resolvedLesson = (targetLesson === 1 || targetLesson === 2 || targetLesson === 3 || targetLesson === 4 || targetLesson === 5 || targetLesson === 7)
      ? targetLesson
      : (session ? (session.lesson || 1) : lastActiveLesson);
    const wasInfinite = session?.mode === 'infinite';
    session = null;
    stepUi = null;
    if (wasInfinite) state.infiniteMode = false;
    state.runnerStep = null;
    state.viewMode = 'map';
    state.mapSubView = resolvedLesson === 7
      ? 'u2_lesson1'
      : (resolvedLesson === 5
        ? 'lesson5'
        : (resolvedLesson === 4
          ? 'lesson4'
          : (resolvedLesson === 3 ? 'lesson3' : (resolvedLesson === 2 ? 'lesson2' : 'lesson1'))));
    setUiMode('map');
    if (typeof updateViewDom === 'function') updateViewDom();
    if (typeof renderHUD === 'function') renderHUD();
    if (typeof renderDuolingoMap === 'function') renderDuolingoMap(true);
    saveState();
  }

  function resumeFromSavedState() {
    bindShellChromeOnce();
    if (typeof state.playgroundNumber === 'number') {
      playgroundState.number = state.playgroundNumber;
    }
    const vm = state.viewMode || 'map';
    if (state.runnerStep?.lesson === 7 && Number.isInteger(state.runnerStep.nodeId)) {
      return openU2L1Node(state.runnerStep.nodeId, { preserveProgress: true });
    }
    if (state.runnerStep?.lesson === 5 && Number.isInteger(state.runnerStep.nodeId)) {
      return openLesson5Node(state.runnerStep.nodeId, { preserveProgress: true });
    }
    if (state.runnerStep?.lesson === 4 && Number.isInteger(state.runnerStep.nodeId)) {
      return openLesson4Node(state.runnerStep.nodeId, { preserveProgress: true });
    }
    if (state.runnerStep?.lesson === 3 && Number.isInteger(state.runnerStep.nodeId)) {
      return openLesson3Node(state.runnerStep.nodeId, { preserveProgress: true });
    }
    if (state.runnerStep?.lesson === 2 && Number.isInteger(state.runnerStep.nodeId)) {
      return openLesson2Node(state.runnerStep.nodeId, { preserveProgress: true });
    }
    if (vm === 'map' || vm === 'lesson2' || vm === 'lesson3' || vm === 'lesson4' || vm === 'lesson5' || vm === 'u2_lesson1' || vm === 'result') {
      if (vm === 'lesson2' || vm === 'lesson3' || vm === 'lesson4' || vm === 'lesson5' || vm === 'u2_lesson1') state.mapSubView = vm;
      if (vm === 'result' || vm === 'lesson2' || vm === 'lesson3' || vm === 'lesson4' || vm === 'lesson5' || vm === 'u2_lesson1') state.viewMode = 'map';
      setUiMode('map');
      return false;
    }
    if (vm === 'recharge') return openRecharge(null);
    if (vm === 'scratchpad') return openScratchpad();
    if (state.infiniteMode) return openInfinite(state.infiniteSkill);
    const nid = state.runnerStep?.nodeId !== undefined ? state.runnerStep.nodeId : state.activeNode;
    if (Number.isInteger(nid) && PATH_NODES.some(n => n.id === nid)) {
      return openNode(nid);
    }
    closeToMap();
    return false;
  }

  function isActive() {
    return Boolean(session) || document.body.dataset.l1Mode === 'learning' || document.body.dataset.l1Mode === 'result';
  }

  global.L1Runner = {
    openNode,
    openLesson2Node,
    openLesson2Remedial,
    openLesson3Node,
    openLesson3Remedial,
    openLesson4Node,
    openLesson4Remedial,
    openLesson5Node,
    openLesson5Remedial,
    openU2L1Node,
    openU2L1Remedial,
    openInfinite,
    openRecharge,
    openScratchpad,
    closeToMap,
    resumeFromSavedState,
    isActive,
    syncViewportHeight,
    getSession: () => session
  };
})(window);
