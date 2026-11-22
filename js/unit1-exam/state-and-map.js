/* Unit 1 End-of-Unit Interactive Exam — State, Unlock Rules, Points & Hub Renderer */
(function (global) {
  'use strict';

  function createDefaultSectionRecord() {
    return {
      index: 0,
      passed: new Set(),
      assisted: new Set(),
      errors: 0,
      stars: 0,
      completed: false,
      answers: {}
    };
  }

  function createDefaultUnit1ExamState() {
    return {
      sections: {
        0: createDefaultSectionRecord(),
        1: createDefaultSectionRecord(),
        2: createDefaultSectionRecord()
      },
      formal: {
        status: 'not_started', // 'not_started' | 'in_progress' | 'submitted'
        activeIndex: 0,
        answers: {},
        flagged: [],
        attempts: 0,
        bestScore: 0,
        bestPct: 0,
        passed: false,
        lastResult: null
      },
      activeSession: null // { mode: 'section' | 'formal' | 'report', sectionId?: number }
    };
  }

  function hydrateSectionRecord(raw) {
    const def = createDefaultSectionRecord();
    if (!raw || typeof raw !== 'object') return def;
    return {
      index: Math.max(0, Number(raw.index) || 0),
      passed: new Set(Array.isArray(raw.passed) ? raw.passed.map(Number).filter(Number.isInteger) : []),
      assisted: new Set(Array.isArray(raw.assisted) ? raw.assisted.map(Number).filter(Number.isInteger) : []),
      errors: Math.max(0, Number(raw.errors) || 0),
      stars: Math.max(0, Math.min(3, Number(raw.stars) || 0)),
      completed: Boolean(raw.completed),
      answers: raw.answers && typeof raw.answers === 'object' ? { ...raw.answers } : {}
    };
  }

  function hydrateUnit1ExamState(raw) {
    const def = createDefaultUnit1ExamState();
    if (!raw || typeof raw !== 'object') return def;
    const sections = {
      0: hydrateSectionRecord(raw.sections?.[0] || raw.sections?.['0']),
      1: hydrateSectionRecord(raw.sections?.[1] || raw.sections?.['1']),
      2: hydrateSectionRecord(raw.sections?.[2] || raw.sections?.['2'])
    };
    const rf = raw.formal && typeof raw.formal === 'object' ? raw.formal : {};
    const validStatus = ['not_started', 'in_progress', 'submitted'].includes(rf.status) ? rf.status : 'not_started';
    const formal = {
      status: validStatus,
      activeIndex: Math.max(0, Math.min(20, Number(rf.activeIndex) || 0)),
      answers: rf.answers && typeof rf.answers === 'object' ? { ...rf.answers } : {},
      flagged: Array.isArray(rf.flagged) ? rf.flagged.map(Number).filter((x) => Number.isInteger(x) && x >= 1 && x <= 21) : [],
      attempts: Math.max(0, Number(rf.attempts) || 0),
      bestScore: Math.max(0, Math.min(21, Number(rf.bestScore) || 0)),
      bestPct: Math.max(0, Math.min(100, Number(rf.bestPct) || 0)),
      passed: Boolean(rf.passed),
      lastResult: rf.lastResult && typeof rf.lastResult === 'object' ? rf.lastResult : null
    };
    const activeSession = raw.activeSession && typeof raw.activeSession === 'object'
      ? {
          mode: ['section', 'formal', 'report'].includes(raw.activeSession.mode) ? raw.activeSession.mode : 'formal',
          sectionId: raw.activeSession.sectionId !== undefined ? Number(raw.activeSession.sectionId) : undefined
        }
      : null;
    return { sections, formal, activeSession };
  }

  function serializeUnit1ExamState(examState) {
    if (!examState || typeof examState !== 'object') return null;
    const serializeSec = (s) => ({
      index: Number(s?.index) || 0,
      passed: [...(s?.passed instanceof Set ? s.passed : [])],
      assisted: [...(s?.assisted instanceof Set ? s.assisted : [])],
      errors: Number(s?.errors) || 0,
      stars: Number(s?.stars) || 0,
      completed: Boolean(s?.completed),
      answers: s?.answers && typeof s.answers === 'object' ? s.answers : {}
    });
    const f = examState.formal || createDefaultUnit1ExamState().formal;
    return {
      sections: {
        0: serializeSec(examState.sections?.[0]),
        1: serializeSec(examState.sections?.[1]),
        2: serializeSec(examState.sections?.[2])
      },
      formal: {
        status: f.status || 'not_started',
        activeIndex: Number(f.activeIndex) || 0,
        answers: f.answers && typeof f.answers === 'object' ? f.answers : {},
        flagged: Array.isArray(f.flagged) ? f.flagged : [],
        attempts: Number(f.attempts) || 0,
        bestScore: Number(f.bestScore) || 0,
        bestPct: Number(f.bestPct) || 0,
        passed: Boolean(f.passed),
        lastResult: f.lastResult || null
      },
      activeSession: examState.activeSession || null
    };
  }

  function getUnit1ExamState() {
    if (typeof state !== 'object' || !state) return createDefaultUnit1ExamState();
    if (!state.unit1Exam || typeof state.unit1Exam !== 'object') {
      state.unit1Exam = createDefaultUnit1ExamState();
    }
    const ex = state.unit1Exam;
    if (!ex.sections || typeof ex.sections !== 'object') {
      ex.sections = createDefaultUnit1ExamState().sections;
    }
    [0, 1, 2].forEach((sid) => {
      if (!ex.sections[sid] || typeof ex.sections[sid] !== 'object') {
        ex.sections[sid] = createDefaultSectionRecord();
      }
      if (!(ex.sections[sid].passed instanceof Set)) {
        ex.sections[sid].passed = new Set(Array.isArray(ex.sections[sid].passed) ? ex.sections[sid].passed.map(Number) : []);
      }
      if (!(ex.sections[sid].assisted instanceof Set)) {
        ex.sections[sid].assisted = new Set(Array.isArray(ex.sections[sid].assisted) ? ex.sections[sid].assisted.map(Number) : []);
      }
      if (!ex.sections[sid].answers || typeof ex.sections[sid].answers !== 'object') {
        ex.sections[sid].answers = {};
      }
    });
    if (!ex.formal || typeof ex.formal !== 'object') {
      ex.formal = createDefaultUnit1ExamState().formal;
    }
    if (!ex.formal.answers || typeof ex.formal.answers !== 'object') ex.formal.answers = {};
    if (!Array.isArray(ex.formal.flagged)) ex.formal.flagged = [];
    return ex;
  }

  function getUnit1LessonCompletionStatus() {
    const l1Total = typeof PATH_NODES !== 'undefined' ? PATH_NODES.length : 21;
    const l1Done = typeof PATH_NODES !== 'undefined' && typeof isNodeCompleted === 'function'
      ? PATH_NODES.filter((n) => isNodeCompleted(n.id)).length
      : 0;
    const l2Total = typeof L2_NODES !== 'undefined' ? L2_NODES.length : 15;
    const l2Done = typeof getLesson2DoneCount === 'function' ? getLesson2DoneCount() : 0;
    const l3Total = typeof L3_NODES !== 'undefined' ? L3_NODES.length : 16;
    const l3Done = typeof getLesson3DoneCount === 'function' ? getLesson3DoneCount() : 0;
    const l4Total = typeof L4_NODES !== 'undefined' ? L4_NODES.length : 14;
    const l4Done = typeof getLesson4DoneCount === 'function' ? getLesson4DoneCount() : 0;
    const l5Total = typeof L5_NODES !== 'undefined' ? L5_NODES.length : 10;
    const l5Done = typeof getLesson5DoneCount === 'function' ? getLesson5DoneCount() : 0;

    return [
      { key: 'lesson1', num: 1, title: 'الدرس 1: القيمة المنزلية ضمن الملايين', done: l1Done >= l1Total, pct: Math.round((l1Done / Math.max(1, l1Total)) * 100) },
      { key: 'lesson2', num: 2, title: 'الدرس 2: مقارنة الأعداد وترتيبها', done: l2Done >= l2Total, pct: Math.round((l2Done / Math.max(1, l2Total)) * 100) },
      { key: 'lesson3', num: 3, title: 'الدرس 3: جمع الأعداد الكلية وطرحها', done: l3Done >= l3Total, pct: Math.round((l3Done / Math.max(1, l3Total)) * 100) },
      { key: 'lesson4', num: 4, title: 'الدرس 4: الأعداد السالبة', done: l4Done >= l4Total, pct: Math.round((l4Done / Math.max(1, l4Total)) * 100) },
      { key: 'lesson5', num: 5, title: 'الدرس 5: خطة حل المسألة: أنشئ جدولاً', done: l5Done >= l5Total, pct: Math.round((l5Done / Math.max(1, l5Total)) * 100) }
    ];
  }

  function getUnit1ExamRemainingLessons() {
    return getUnit1LessonCompletionStatus().filter((item) => !item.done);
  }

  function isUnit1ExamUnlocked() {
    if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
    if (typeof state === 'object' && state && state.stageBypass) return true;
    return getUnit1ExamRemainingLessons().length === 0;
  }

  function getUnit1ExamMasteredCount() {
    const ex = getUnit1ExamState();
    const masteredIds = new Set();
    [0, 1, 2].forEach((sid) => {
      const secRec = ex.sections[sid];
      if (secRec && secRec.passed instanceof Set) {
        secRec.passed.forEach((qid) => masteredIds.add(Number(qid)));
      }
    });
    if (ex.formal?.lastResult && Array.isArray(ex.formal.lastResult.itemResults)) {
      ex.formal.lastResult.itemResults.forEach((item) => {
        if (item && item.isCorrect) masteredIds.add(Number(item.id));
      });
    }
    return Math.min(21, masteredIds.size);
  }

  function hasUnit1ExamPartialProgress() {
    const ex = getUnit1ExamState();
    const secPartial = [0, 1, 2].some((sid) => {
      const s = ex.sections[sid];
      return s && (s.passed.size > 0 || Object.keys(s.answers || {}).length > 0 || s.completed);
    });
    const formalPartial = ex.formal && (
      ex.formal.status !== 'not_started' ||
      Object.keys(ex.formal.answers || {}).length > 0 ||
      ex.formal.attempts > 0
    );
    return Boolean(secPartial || formalPartial);
  }

  function getUnit1ExamPoints() {
    const ex = getUnit1ExamState();
    let pts = 0;
    [0, 1, 2].forEach((sid) => {
      const s = ex.sections[sid];
      if (s && s.completed) pts += 60;
    });
    if (ex.formal?.passed) {
      pts += 220;
    } else if (ex.formal?.bestScore > 0) {
      pts += Math.min(180, Math.round((ex.formal.bestScore / 21) * 180));
    }
    return Math.min(400, pts);
  }

  function renderSmallStarsSVG(starsCount) {
    const pts = '12,1.5 15.2,8.5 22.8,9.4 17.1,14.6 18.7,22 12,18.2 5.3,22 6.9,14.6 1.2,9.4 8.8,8.5';
    let out = '<span class="u1e-hub-stars" aria-label="' + ar(starsCount) + ' من 3 نجوم">';
    for (let i = 1; i <= 3; i++) {
      out += '<svg viewBox="0 0 24 24" width="16" height="16" class="u1e-star' + (i <= starsCount ? ' is-on' : '') + '" aria-hidden="true"><polygon points="' + pts + '" stroke-linejoin="round"/></svg>';
    }
    out += '</span>';
    return out;
  }

  function renderUnit1ExamHub(container) {
    if (!container || typeof Unit1ExamData === 'undefined') return;
    const ex = getUnit1ExamState();
    const f = ex.formal;
    const sections = Unit1ExamData.SECTIONS;
    const remainingLessons = getUnit1ExamRemainingLessons();
    const answeredFormalCount = Object.keys(f.answers || {}).filter((k) => {
      const q = Unit1ExamData.getQuestionById(Number(k));
      return q && Unit1ExamData.evaluateUnit1ExamQuestion(q, f.answers[k]).isAnswered;
    }).length;

    const formalStatusLabel = f.passed
      ? 'مجتاز بنجاح'
      : (f.status === 'in_progress' && answeredFormalCount > 0
          ? 'قيد التقدم'
          : (f.attempts > 0 ? 'محاولة سابقة مسجّلة' : 'تقييم شامل مستقل'));

    const formalPrimaryCta = f.status === 'in_progress' && answeredFormalCount > 0
      ? 'استكمل الاختبار الشامل'
      : (f.attempts > 0 ? 'إعادة الاختبار الشامل' : 'ابدأ الاختبار الشامل (21 سؤالاً)');

    container.replaceChildren();

    const hub = document.createElement('div');
    hub.className = 'u1e-hub';

    /* Soft advisory note when opened in teacher test mode before completing all 5 lessons */
    if (remainingLessons.length > 0 && isUnit1ExamUnlocked()) {
      const note = document.createElement('div');
      note.className = 'u1e-hub-advisory';
      note.setAttribute('role', 'note');
      note.innerHTML =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
        '<span>اختبار الوحدة مفتوح عبر وضع الاختبار للمعلّم. لإتقان أفضل يُوصى بمراجعة الدروس المتبقية (' + ar(remainingLessons.length) + ' من 5).</span>';
      hub.append(note);
    }

    /* Lead Hero Card: Comprehensive Official Exam (21 questions) */
    const hero = document.createElement('section');
    hero.className = 'u1e-hub-hero' + (f.passed ? ' is-passed' : '');
    hero.setAttribute('aria-labelledby', 'u1e-hero-title');

    const metricsHtml =
      '<div class="u1e-hub-metrics">' +
      '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">21</bdi></strong><span class="u1e-metric-lbl">سؤالاً من الكتاب</span></div>' +
      '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + (f.attempts > 0 ? (f.bestPct + '%') : '80%') + '</bdi></strong><span class="u1e-metric-lbl">' + (f.attempts > 0 ? 'أفضل نتيجة لك' : 'نسبة الاجتياز') + '</span></div>' +
      '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + getUnit1ExamPoints() + ' / 400</bdi></strong><span class="u1e-metric-lbl">نقطة مكتسبة</span></div>' +
      '</div>';

    const progressLineHtml = f.status === 'in_progress' && answeredFormalCount > 0
      ? '<p class="u1e-hub-resume-note">أجبت حتى الآن عن <strong><bdi dir="ltr">' + answeredFormalCount + ' / 21</bdi></strong> سؤالاً، وتقدمك محفوظ تلقائياً.</p>'
      : '';

    const secondaryBtnHtml = f.lastResult
      ? '<button type="button" class="u1e-btn u1e-btn-secondary" id="u1e-hub-open-report">' +
        (f.passed ? 'عرض التقرير وشهادة الوحدة' : 'عرض تقرير آخر محاولة') +
        '</button>'
      : '';

    hero.innerHTML =
      '<div class="u1e-hub-hero-head">' +
        '<div class="u1e-hub-hero-copy">' +
          '<div class="u1e-hub-pills">' +
            '<span class="u1e-pill is-gold">التقييم الختامي · ص <bdi dir="ltr">26 – 27</bdi></span>' +
            '<span class="u1e-pill' + (f.passed ? ' is-success' : '') + '">' + formalStatusLabel + '</span>' +
          '</div>' +
          '<h3 id="u1e-hero-title" class="u1e-hub-hero-title">الاختبار الشامل المتواصل للوحدة الأولى</h3>' +
          '<p class="u1e-hub-hero-desc">خُض الأسئلة الـ <bdi dir="ltr">21</bdi> متواصلة مع تنقل حر ومراجعة قبل التسليم، ثم احصل على تقرير تشخيصي لمهارات الدروس الخمسة وشهادة الوحدة عند تحقيق <bdi dir="ltr">80%</bdi> فأكثر. المعلم الذكي متاح دائماً لتقديم تلميحات توجيهية دون كشف الإجابة.</p>' +
        '</div>' +
        '<span class="u1e-hub-shield" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>' +
        '</span>' +
      '</div>' +
      metricsHtml +
      progressLineHtml +
      '<div class="u1e-hub-hero-actions">' +
        '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-hub-start-formal">' +
          '<span>' + formalPrimaryCta + '</span>' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>' +
        '</button>' +
        secondaryBtnHtml +
      '</div>';

    hero.querySelector('#u1e-hub-start-formal')?.addEventListener('click', () => {
      if (typeof Unit1ExamEngine !== 'undefined') {
        const shouldResume = f.status === 'in_progress' && answeredFormalCount > 0;
        Unit1ExamEngine.openFormalExam({ resume: shouldResume });
      }
    });
    hero.querySelector('#u1e-hub-open-report')?.addEventListener('click', () => {
      if (typeof Unit1ExamEngine !== 'undefined') {
        Unit1ExamEngine.openLastReport();
      }
    });
    hub.append(hero);

    /* Three Textbook-Matched Practice Sections */
    const secBlock = document.createElement('section');
    secBlock.className = 'u1e-hub-sections';
    secBlock.setAttribute('aria-labelledby', 'u1e-sec-block-title');
    secBlock.innerHTML =
      '<div class="u1e-hub-sec-header">' +
        '<h3 id="u1e-sec-block-title">أو تدرّب أولاً على أقسام الاختبار الثلاثة</h3>' +
        '<p>تغذية راجعة فورية، وتلميحات متدرجة، وأدوات تفاعلية ومختبرات لكل قسم قبل الاختبار الشامل.</p>' +
      '</div>';

    const secGrid = document.createElement('div');
    secGrid.className = 'u1e-sec-grid';

    sections.forEach((sec) => {
      const rec = ex.sections[sec.id] || createDefaultSectionRecord();
      const totalQ = sec.questionIds.length;
      const passedCount = sec.completed ? totalQ : Math.min(totalQ, rec.passed.size);
      const pct = Math.round((passedCount / Math.max(1, totalQ)) * 100);
      const isDone = Boolean(rec.completed || passedCount >= totalQ);
      const ctaText = isDone
        ? 'راجع القسم'
        : (passedCount > 0 ? 'تابع التدرّب' : 'ابدأ التدرّب');

      const card = document.createElement('article');
      card.className = 'u1e-sec-card' + (isDone ? ' is-done' : (passedCount > 0 ? ' is-in-progress' : ''));
      card.dataset.examSection = String(sec.id);
      card.innerHTML =
        '<div class="u1e-sec-card-top">' +
          '<span class="u1e-sec-num" aria-hidden="true"><bdi dir="ltr">' + (sec.id + 1) + '</bdi></span>' +
          '<div class="u1e-sec-copy">' +
            '<div class="u1e-sec-meta">' +
              '<span class="u1e-sec-kicker">' + sec.kicker + ' · ' + sec.rangeLabel + '</span>' +
              (isDone ? renderSmallStarsSVG(rec.stars || 3) : '<span class="u1e-sec-count"><bdi dir="ltr">' + passedCount + ' / ' + totalQ + '</bdi></span>') +
            '</div>' +
            '<h4 class="u1e-sec-title">' + sec.title + '</h4>' +
            '<p class="u1e-sec-sub">' + sec.sub + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="u1e-sec-card-foot">' +
          '<div class="u1e-sec-bar-wrap" role="progressbar" aria-label="تقدّم ' + sec.title + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
            '<div class="u1e-sec-bar-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
          '<button type="button" class="u1e-btn ' + (isDone ? 'u1e-btn-secondary' : 'u1e-btn-outline') + ' u1e-sec-go-btn">' + ctaText + '</button>' +
        '</div>';

      card.querySelector('.u1e-sec-go-btn')?.addEventListener('click', () => {
        if (typeof Unit1ExamEngine !== 'undefined') {
          Unit1ExamEngine.openSection(sec.id, { replay: isDone });
        }
      });
      secGrid.append(card);
    });

    secBlock.append(secGrid);
    hub.append(secBlock);
    container.append(hub);
  }

  global.createDefaultUnit1ExamState = createDefaultUnit1ExamState;
  global.hydrateUnit1ExamState = hydrateUnit1ExamState;
  global.serializeUnit1ExamState = serializeUnit1ExamState;
  global.getUnit1ExamState = getUnit1ExamState;
  global.getUnit1LessonCompletionStatus = getUnit1LessonCompletionStatus;
  global.getUnit1ExamRemainingLessons = getUnit1ExamRemainingLessons;
  global.isUnit1ExamUnlocked = isUnit1ExamUnlocked;
  global.getUnit1ExamMasteredCount = getUnit1ExamMasteredCount;
  global.hasUnit1ExamPartialProgress = hasUnit1ExamPartialProgress;
  global.getUnit1ExamPoints = getUnit1ExamPoints;
  global.renderUnit1ExamHub = renderUnit1ExamHub;
})(window);
