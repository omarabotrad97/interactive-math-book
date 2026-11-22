/* Unit 1 End-of-Unit Interactive Exam — Runner, Interactive Widgets, Report & Certificate */
(function (global) {
  'use strict';

  const ICONS = {
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    audio: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    ai: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    lab: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    up: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 3h16v6a8 8 0 0 1-16 0V3z"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16M15 4v16"/></svg>'
  };

  let activeRun = null; // { mode: 'section' | 'formal' | 'report' | 'section_summary', sectionId?, questions, index, hintTier, showPlaceHelper, checkedState, reviewFilter, reviewFocusQid }
  let dialogBound = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function safeEsc(str) {
    if (typeof esc === 'function') return esc(str);
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bidiFormatText(raw) {
    const safe = safeEsc(raw);
    return safe.replace(
      /(?:[+\-\u2212]?\d[\d,]*(?:\s*(?:&lt;|&gt;|=|\+|\-|\u2212|×|÷)\s*[+\-\u2212]?\d[\d,]*)*|&lt;|&gt;)/g,
      (m) => '<bdi class="u1e-bdi" dir="ltr">' + m + '</bdi>'
    );
  }

  function speakQuestion(q) {
    if (!q) return;
    const text = [q.groupLabel, q.prompt, q.verbalQuote].filter(Boolean).join('. ');
    if (typeof speakText === 'function') {
      speakText(text);
    } else if (typeof speechSynthesis !== 'undefined') {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        speechSynthesis.speak(u);
      } catch (_e) { /* ignore */ }
    }
  }

  function notifyContext() {
    if (typeof window.notifyAiTutorContextChanged === 'function') {
      window.notifyAiTutorContextChanged();
    }
  }

  function openLabForQuestion(q) {
    if (!q || !q.labHint) return;
    if (q.labHint === 'compare' && typeof openComparisonLab === 'function') {
      openComparisonLab();
    } else if (q.labHint === 'operations' && typeof openOperationsLab === 'function') {
      openOperationsLab();
    } else if (q.labHint === 'negative' && typeof openNegativeNumbersLab === 'function') {
      openNegativeNumbersLab();
    }
  }

  function getLabButtonLabel(q) {
    if (!q || !q.labHint) return '';
    if (q.labHint === 'compare') return 'مختبر المقارنة';
    if (q.labHint === 'operations') return 'مختبر العمليات';
    if (q.labHint === 'negative') return 'مختبر الأعداد';
    return '';
  }

  function getAnswerStore() {
    const ex = getUnit1ExamState();
    if (!activeRun) return {};
    if (activeRun.mode === 'formal') return ex.formal.answers;
    if (activeRun.mode === 'section') {
      const secRec = ex.sections[activeRun.sectionId];
      return secRec ? secRec.answers : {};
    }
    return {};
  }

  function getQuestionAnswer(qId) {
    const store = getAnswerStore();
    return store[String(qId)] ?? store[qId];
  }

  function setQuestionAnswer(qId, value) {
    const store = getAnswerStore();
    store[String(qId)] = value;
    if (activeRun && activeRun.mode === 'formal') {
      const ex = getUnit1ExamState();
      if (ex.formal.status === 'not_started') ex.formal.status = 'in_progress';
    }
    if (activeRun && activeRun.mode === 'section' && activeRun.checkedState && !activeRun.checkedState.isCorrect) {
      activeRun.checkedState = null;
      updatePracticeFeedbackUI();
    }
    if (typeof saveState === 'function') saveState();
    syncActionButtonsState();
  }

  function ensureViewMounted() {
    if (typeof L1Runner !== 'undefined' && typeof L1Runner.closeToMap === 'function' && document.body.dataset.l1Mode === 'learning') {
      document.body.dataset.l1Mode = 'map';
      const l1Shell = byId('l1-shell');
      if (l1Shell) l1Shell.hidden = true;
      const l1Res = byId('l1-result-view');
      if (l1Res) l1Res.hidden = true;
    }
    state.viewMode = 'unit1_exam';
    state.mapSubView = 'unit1_exam';
    if (typeof updateViewDom === 'function') updateViewDom();
    const view = byId('unit1-exam-view');
    if (view) view.hidden = false;
    bindSubmitDialogOnce();
  }

  function closeToHub() {
    if (typeof stopSpeech === 'function') stopSpeech();
    const ex = getUnit1ExamState();
    ex.activeSession = null;
    activeRun = null;
    const view = byId('unit1-exam-view');
    if (view) {
      view.hidden = true;
      view.replaceChildren();
    }
    state.viewMode = 'map';
    state.mapSubView = 'unit1_exam';
    if (typeof updateViewDom === 'function') updateViewDom();
    if (typeof renderDuolingoMap === 'function') renderDuolingoMap();
    if (typeof renderHUD === 'function') renderHUD();
    if (typeof saveState === 'function') saveState();
    notifyContext();
    window.scrollTo?.({ top: 0, behavior: 'auto' });
  }

  function openSection(sectionId, opts) {
    const sid = Number(sectionId);
    const sec = Unit1ExamData.SECTIONS.find((s) => s.id === sid);
    if (!sec) return false;
    if (typeof isUnit1ExamUnlocked === 'function' && !isUnit1ExamUnlocked()) {
      if (typeof showCurriculumSheet === 'function') showCurriculumSheet('unit1_exam');
      return false;
    }

    const ex = getUnit1ExamState();
    const rec = ex.sections[sid];
    const questions = Unit1ExamData.getSectionQuestions(sid);
    const shouldReplay = Boolean(opts && opts.replay);

    if (shouldReplay) {
      rec.index = 0;
      rec.answers = {};
      rec.errors = 0;
    }

    const startIdx = shouldReplay
      ? 0
      : Math.max(0, Math.min(questions.length - 1, Number(rec.index) || 0));

    ex.activeSession = { mode: 'section', sectionId: sid };
    activeRun = {
      mode: 'section',
      sectionId: sid,
      sectionMeta: sec,
      questions,
      index: startIdx,
      hintTier: 0,
      showPlaceHelper: false,
      checkedState: null,
      reviewFilter: 'all',
      reviewFocusQid: null
    };

    ensureViewMounted();
    if (typeof saveState === 'function') saveState();
    renderExamView();
    return true;
  }

  function openFormalExam(opts) {
    if (typeof isUnit1ExamUnlocked === 'function' && !isUnit1ExamUnlocked()) {
      if (typeof showCurriculumSheet === 'function') showCurriculumSheet('unit1_exam');
      return false;
    }
    const ex = getUnit1ExamState();
    const f = ex.formal;
    const resume = Boolean(opts && opts.resume && f.status === 'in_progress');

    if (!resume) {
      f.status = 'in_progress';
      f.activeIndex = 0;
      f.answers = {};
      f.flagged = [];
    } else {
      f.status = 'in_progress';
    }

    ex.activeSession = { mode: 'formal' };
    activeRun = {
      mode: 'formal',
      questions: Unit1ExamData.QUESTIONS.slice(),
      index: Math.max(0, Math.min(20, Number(f.activeIndex) || 0)),
      hintTier: 0,
      showPlaceHelper: false,
      checkedState: null,
      reviewFilter: 'all',
      reviewFocusQid: null
    };

    ensureViewMounted();
    if (typeof saveState === 'function') saveState();
    renderExamView();
    return true;
  }

  function openLastReport() {
    const ex = getUnit1ExamState();
    if (!ex.formal || !ex.formal.lastResult) {
      return openFormalExam({ resume: false });
    }
    ex.activeSession = { mode: 'report' };
    activeRun = {
      mode: 'report',
      questions: Unit1ExamData.QUESTIONS.slice(),
      index: 0,
      hintTier: 0,
      showPlaceHelper: false,
      checkedState: null,
      reviewFilter: 'all',
      reviewFocusQid: null
    };
    ensureViewMounted();
    if (typeof saveState === 'function') saveState();
    renderExamView();
    return true;
  }

  function resumeFromSavedState() {
    const ex = getUnit1ExamState();
    if (typeof isUnit1ExamUnlocked === 'function' && !isUnit1ExamUnlocked()) {
      state.viewMode = 'map';
      state.mapSubView = 'sections';
      return false;
    }
    if (ex.activeSession) {
      if (ex.activeSession.mode === 'section' && Number.isInteger(ex.activeSession.sectionId)) {
        return openSection(ex.activeSession.sectionId, { replay: false });
      }
      if (ex.activeSession.mode === 'formal' && ex.formal.status === 'in_progress') {
        return openFormalExam({ resume: true });
      }
      if (ex.activeSession.mode === 'report' && ex.formal.lastResult) {
        return openLastReport();
      }
    }
    closeToHub();
    return false;
  }

  function bindSubmitDialogOnce() {
    if (dialogBound) return;
    dialogBound = true;
    const dlg = byId('u1e-submit-dialog');
    if (!dlg) return;
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
    byId('u1e-submit-cancel')?.addEventListener('click', () => dlg.close());
    byId('u1e-submit-confirm')?.addEventListener('click', () => {
      dlg.close();
      submitFormalExamNow();
    });
  }

  function openSubmitConfirmation() {
    const dlg = byId('u1e-submit-dialog');
    const summaryEl = byId('u1e-submit-summary');
    const jumpsEl = byId('u1e-submit-jumps');
    if (!dlg || !summaryEl || !jumpsEl) {
      submitFormalExamNow();
      return;
    }
    const ex = getUnit1ExamState();
    const f = ex.formal;
    const unanswered = [];
    const flagged = Array.isArray(f.flagged) ? f.flagged.slice().sort((a, b) => a - b) : [];

    Unit1ExamData.QUESTIONS.forEach((q) => {
      const ev = Unit1ExamData.evaluateUnit1ExamQuestion(q, f.answers[String(q.id)]);
      if (!ev.isAnswered) unanswered.push(q.id);
    });

    const answered = 21 - unanswered.length;
    summaryEl.innerHTML =
      'أجبت عن <strong><bdi dir="ltr">' + answered + ' / 21</bdi></strong> سؤالاً' +
      (unanswered.length > 0
        ? '، وبقيت <strong><bdi dir="ltr">' + unanswered.length + '</bdi></strong> أسئلة دون إجابة.'
        : '؛ جميع الأسئلة مُجابة وجاهزة للتصحيح!') +
      (flagged.length > 0 ? ' لديك <strong><bdi dir="ltr">' + flagged.length + '</bdi></strong> أسئلة مميّزة للمراجعة.' : '');

    jumpsEl.replaceChildren();
    const needsAttention = [...new Set([...unanswered, ...flagged])].sort((a, b) => a - b);
    if (needsAttention.length > 0) {
      const lbl = document.createElement('p');
      lbl.className = 'u1e-submit-jumps-lbl';
      lbl.textContent = 'انتقل بسرعة لمراجعة الأسئلة غير المجابة أو المميّزة:';
      jumpsEl.append(lbl);
      const row = document.createElement('div');
      row.className = 'u1e-submit-jumps-row';
      needsAttention.forEach((qid) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u1e-jump-chip' + (flagged.includes(qid) ? ' is-flagged' : ' is-missing');
        b.innerHTML = '<span>س <bdi dir="ltr">' + qid + '</bdi></span>';
        b.addEventListener('click', () => {
          dlg.close();
          jumpFormalQuestion(qid - 1);
        });
        row.append(b);
      });
      jumpsEl.append(row);
      jumpsEl.hidden = false;
    } else {
      jumpsEl.hidden = true;
    }

    if (!dlg.open) dlg.showModal();
  }

  function submitFormalExamNow() {
    const ex = getUnit1ExamState();
    const f = ex.formal;
    const report = Unit1ExamData.computeUnit1ExamReport(f.answers);

    f.status = 'submitted';
    f.attempts = (Number(f.attempts) || 0) + 1;
    f.lastResult = report;
    if (report.correctCount > (f.bestScore || 0)) {
      f.bestScore = report.correctCount;
      f.bestPct = report.pct;
    }
    if (report.passed) {
      f.passed = true;
      if (state.badges instanceof Set) state.badges.add('unit1_exam_master');
    }

    ex.activeSession = { mode: 'report' };
    activeRun = {
      mode: 'report',
      questions: Unit1ExamData.QUESTIONS.slice(),
      index: 0,
      hintTier: 0,
      showPlaceHelper: false,
      checkedState: null,
      reviewFilter: 'all',
      reviewFocusQid: null
    };

    if (typeof sound === 'function') sound(report.passed);
    if (typeof haptic === 'function') haptic(report.passed);
    if (report.passed && typeof launchConfetti === 'function') launchConfetti();
    if (typeof renderHUD === 'function') renderHUD();
    if (typeof saveState === 'function') saveState();

    renderExamView();
  }

  function jumpFormalQuestion(targetIdx) {
    if (!activeRun || activeRun.mode !== 'formal') return;
    const bounded = Math.max(0, Math.min(activeRun.questions.length - 1, Number(targetIdx) || 0));
    activeRun.index = bounded;
    const ex = getUnit1ExamState();
    ex.formal.activeIndex = bounded;
    if (typeof saveState === 'function') saveState();
    renderExamView();
  }

  function toggleFormalFlag(qId) {
    if (!activeRun || activeRun.mode !== 'formal') return;
    const ex = getUnit1ExamState();
    const arr = ex.formal.flagged;
    const idx = arr.indexOf(qId);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(qId);
    if (typeof saveState === 'function') saveState();
    renderExamView();
  }

  function handlePracticeCheck() {
    if (!activeRun || activeRun.mode !== 'section') return;
    const q = activeRun.questions[activeRun.index];
    if (!q) return;

    // If already passed, advance to next question or section summary
    if (activeRun.checkedState && activeRun.checkedState.isCorrect) {
      advancePracticeStep();
      return;
    }

    const ans = getQuestionAnswer(q.id);
    const ev = Unit1ExamData.evaluateUnit1ExamQuestion(q, ans);
    if (!ev.isAnswered) {
      activeRun.checkedState = { isCorrect: false, isWarning: true, message: ev.feedback };
      updatePracticeFeedbackUI();
      if (typeof sound === 'function') sound(false);
      return;
    }

    const ex = getUnit1ExamState();
    const secRec = ex.sections[activeRun.sectionId];

    if (ev.isCorrect) {
      secRec.passed.add(q.id);
      if (activeRun.hintTier >= 3) secRec.assisted.add(q.id);
      activeRun.checkedState = { isCorrect: true, isWarning: false, message: ev.feedback };
      if (typeof sound === 'function') sound(true);
      if (typeof haptic === 'function') haptic(true);
    } else {
      secRec.errors = (Number(secRec.errors) || 0) + 1;
      activeRun.checkedState = { isCorrect: false, isWarning: false, message: ev.feedback };
      if (typeof sound === 'function') sound(false);
      if (typeof haptic === 'function') haptic(false);
    }

    if (typeof saveState === 'function') saveState();
    if (typeof renderHUD === 'function') renderHUD();
    updatePracticeFeedbackUI();
    syncActionButtonsState();
  }

  function advancePracticeStep() {
    if (!activeRun || activeRun.mode !== 'section') return;
    const ex = getUnit1ExamState();
    const secRec = ex.sections[activeRun.sectionId];

    if (activeRun.index < activeRun.questions.length - 1) {
      activeRun.index += 1;
      activeRun.hintTier = 0;
      activeRun.showPlaceHelper = false;
      activeRun.checkedState = null;
      secRec.index = activeRun.index;
      if (typeof saveState === 'function') saveState();
      renderExamView();
      return;
    }

    // Complete section
    const errs = Number(secRec.errors) || 0;
    let stars = errs === 0 ? 3 : (errs <= 2 ? 2 : 1);
    if (secRec.assisted.size > 0) stars = Math.min(2, stars);
    const wasDone = Boolean(secRec.completed);
    secRec.completed = true;
    secRec.stars = Math.max(secRec.stars || 0, stars);
    secRec.index = 0;

    activeRun = {
      mode: 'section_summary',
      sectionId: activeRun.sectionId,
      sectionMeta: activeRun.sectionMeta,
      stars,
      errors: errs,
      wasDone,
      questions: activeRun.questions,
      index: 0
    };
    ex.activeSession = null;

    if (typeof sound === 'function') sound(true);
    if (typeof launchConfetti === 'function') launchConfetti();
    if (typeof renderHUD === 'function') renderHUD();
    if (typeof saveState === 'function') saveState();
    renderExamView();
  }

  function updatePracticeFeedbackUI() {
    const fb = byId('u1e-practice-feedback');
    if (!fb || !activeRun || activeRun.mode !== 'section') return;
    const st = activeRun.checkedState;
    if (!st) {
      fb.hidden = true;
      fb.className = 'u1e-feedback';
      fb.replaceChildren();
      return;
    }
    fb.hidden = false;
    fb.className = 'u1e-feedback ' + (st.isCorrect ? 'is-good' : (st.isWarning ? 'is-warn' : 'is-bad'));
    fb.innerHTML =
      '<span class="u1e-fb-ico">' + (st.isCorrect ? ICONS.check : ICONS.alert) + '</span>' +
      '<span class="u1e-fb-text">' + bidiFormatText(st.message) + '</span>';
  }

  function syncActionButtonsState() {
    if (!activeRun) return;
    if (activeRun.mode === 'section') {
      const q = activeRun.questions[activeRun.index];
      const btn = byId('u1e-primary-action');
      if (!btn || !q) return;
      const ev = Unit1ExamData.evaluateUnit1ExamQuestion(q, getQuestionAnswer(q.id));
      const passedNow = Boolean(activeRun.checkedState && activeRun.checkedState.isCorrect);
      const isLast = activeRun.index === activeRun.questions.length - 1;
      if (passedNow) {
        btn.disabled = false;
        btn.className = 'u1e-btn u1e-btn-primary is-next';
        btn.innerHTML = '<span>' + (isLast ? 'إنهاء القسم وعرض النتيجة' : 'السؤال التالي') + '</span>' + ICONS.next;
      } else {
        btn.disabled = !ev.isAnswered;
        btn.className = 'u1e-btn u1e-btn-primary';
        btn.innerHTML = ICONS.check + '<span>تحقّق من الإجابة</span>';
      }
      return;
    }

    if (activeRun.mode === 'formal') {
      const ex = getUnit1ExamState();
      const answeredCount = Unit1ExamData.QUESTIONS.filter((item) =>
        Unit1ExamData.evaluateUnit1ExamQuestion(item, ex.formal.answers[String(item.id)]).isAnswered
      ).length;
      const counterEl = byId('u1e-formal-counter');
      if (counterEl) {
        counterEl.innerHTML = 'أُجيب <bdi dir="ltr">' + answeredCount + '</bdi> من <bdi dir="ltr">21</bdi>';
      }
      const curQ = activeRun.questions[activeRun.index];
      if (curQ) {
        const pillBtn = document.querySelector('.u1e-nav-pill[data-qid="' + curQ.id + '"]');
        if (pillBtn) {
          const isAns = Unit1ExamData.evaluateUnit1ExamQuestion(curQ, ex.formal.answers[String(curQ.id)]).isAnswered;
          pillBtn.classList.toggle('is-answered', isAns);
        }
      }
    }
  }

  /* =========================================================================
     7 Interactive Question Widgets
     ========================================================================= */

  function renderHighlightNumberHTML(numStr, indicesMap) {
    const clean = String(numStr || '');
    const len = clean.length;
    let html = '<div class="u1e-big-num" dir="ltr" aria-label="العدد ' + safeEsc(clean) + '">';
    for (let i = 0; i < len; i++) {
      const posFromRight = len - 1 - i;
      const cls = indicesMap[i] || '';
      html += '<span class="u1e-digit' + (cls ? ' ' + cls : '') + '">' + clean[i] + '</span>';
      if (posFromRight > 0 && posFromRight % 3 === 0) {
        html += '<span class="u1e-comma" aria-hidden="true">,</span>';
      }
    }
    html += '</div>';
    return html;
  }

  function renderPlaceValueHelper(rawVal) {
    const cleanDigits = Unit1ExamData.normalizeDigits(rawVal || '').replace(/\D/g, '').slice(0, 9);
    const padded = cleanDigits.padStart(7, ' ');
    const places = [
      { label: 'ملايين', cyc: 'millions' },
      { label: 'م.ألوف', cyc: 'thousands' },
      { label: 'ع.ألوف', cyc: 'thousands' },
      { label: 'ألوف', cyc: 'thousands' },
      { label: 'مئات', cyc: 'ones' },
      { label: 'عشرات', cyc: 'ones' },
      { label: 'آحاد', cyc: 'ones' }
    ];
    const startOffset = Math.max(0, padded.length - 7);
    const slice = padded.slice(startOffset);
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const ch = slice[i] === ' ' ? '·' : slice[i];
      cells +=
        '<div class="u1e-pv-cell is-' + places[i].cyc + '">' +
          '<span class="u1e-pv-lbl">' + places[i].label + '</span>' +
          '<strong class="u1e-pv-digit"><bdi dir="ltr">' + ch + '</bdi></strong>' +
        '</div>';
    }
    return (
      '<div class="u1e-pv-helper" aria-label="لوحة المنازل المساعدة">' +
        '<div class="u1e-pv-cycles" dir="ltr">' +
          '<span class="u1e-pv-cyc is-millions">الملايين</span>' +
          '<span class="u1e-pv-cyc is-thousands">الألوف</span>' +
          '<span class="u1e-pv-cyc is-ones">الآحاد</span>' +
        '</div>' +
        '<div class="u1e-pv-grid" dir="ltr">' + cells + '</div>' +
      '</div>'
    );
  }

  function renderQuestionWidget(q, container) {
    const saved = getQuestionAnswer(q.id);
    const isPractice = activeRun && activeRun.mode === 'section';

    if (q.type === 'mcq') {
      if (q.highlightNumber) {
        const box = document.createElement('div');
        box.className = 'u1e-visual-banner';
        box.innerHTML = renderHighlightNumberHTML(q.highlightNumber.num, {
          [q.highlightNumber.targetIndex]: 'is-highlight-thousands'
        });
        container.append(box);
      } else if (Array.isArray(q.compareBadges) && q.compareBadges.length > 0) {
        const row = document.createElement('div');
        row.className = 'u1e-cmp-badges';
        row.innerHTML = q.compareBadges.map((b) =>
          '<div class="u1e-cmp-badge"><small>' + safeEsc(b.label) + '</small><strong dir="ltr">' + safeEsc(b.val) + '</strong></div>'
        ).join('');
        container.append(row);
      } else if (q.displayExpr) {
        const box = document.createElement('div');
        box.className = 'u1e-expr-banner';
        box.innerHTML = '<bdi dir="ltr">' + safeEsc(q.displayExpr) + '</bdi>';
        container.append(box);
      }

      const selectedKey = saved && typeof saved === 'object' ? saved.key : '';
      const grid = document.createElement('div');
      grid.className = 'u1e-mcq-grid' + (q.optionLayout === 'grid2' ? ' is-grid2' : ' is-stack');
      grid.setAttribute('role', 'radiogroup');
      grid.setAttribute('aria-label', q.prompt);

      q.options.forEach((opt) => {
        const isSel = selectedKey === opt.key;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'u1e-mcq-opt' + (isSel ? ' is-selected' : '');
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(isSel));
        btn.dataset.optKey = opt.key;
        const isPureMath = /^[0-9,+\-\s<>=]+$/.test(opt.label);
        const labelHtml = isPureMath || opt.isEquation
          ? '<bdi class="u1e-mcq-val is-ltr" dir="ltr">' + safeEsc(opt.label) + '</bdi>'
          : '<span class="u1e-mcq-val">' + bidiFormatText(opt.label) + '</span>';
        btn.innerHTML =
          '<span class="u1e-mcq-letter"><bdi dir="ltr">' + opt.key + '</bdi></span>' +
          labelHtml +
          '<span class="u1e-mcq-check" aria-hidden="true">' + (isSel ? ICONS.check : '') + '</span>';

        btn.addEventListener('click', () => {
          setQuestionAnswer(q.id, { key: opt.key });
          grid.querySelectorAll('.u1e-mcq-opt').forEach((b) => {
            const on = b.dataset.optKey === opt.key;
            b.classList.toggle('is-selected', on);
            b.setAttribute('aria-checked', String(on));
            const chk = b.querySelector('.u1e-mcq-check');
            if (chk) chk.innerHTML = on ? ICONS.check : '';
          });
        });
        grid.append(btn);
      });
      container.append(grid);
      return;
    }

    if (q.type === 'symbol_compare') {
      const chosen = saved && typeof saved === 'object' ? saved.symbol : '';
      const stage = document.createElement('div');
      stage.className = 'u1e-compare-stage';
      stage.innerHTML =
        '<div class="u1e-compare-equation" dir="ltr">' +
          '<span class="u1e-compare-num">' + Unit1ExamData.formatExamNumber(q.leftNum) + '</span>' +
          '<span class="u1e-compare-slot' + (chosen ? ' is-filled' : '') + '" id="u1e-cmp-slot" aria-live="polite">' + (chosen ? safeEsc(chosen) : '؟') + '</span>' +
          '<span class="u1e-compare-num">' + Unit1ExamData.formatExamNumber(q.rightNum) + '</span>' +
        '</div>' +
        '<p class="u1e-compare-hint">تذكّر: تُقرأ المقارنة الرياضية من اليسار إلى اليمين، <bdi dir="ltr">' + Unit1ExamData.formatExamNumber(q.leftNum) + '</bdi> مقابل <bdi dir="ltr">' + Unit1ExamData.formatExamNumber(q.rightNum) + '</bdi>.</p>';

      const choices = document.createElement('div');
      choices.className = 'u1e-sym-row';
      choices.setAttribute('role', 'radiogroup');
      choices.setAttribute('aria-label', 'اختر رمز المقارنة');

      const defs = [
        { sym: '<', name: 'أصغر من' },
        { sym: '=', name: 'يساوي' },
        { sym: '>', name: 'أكبر من' }
      ];
      defs.forEach((d) => {
        const on = chosen === d.sym;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u1e-sym-btn' + (on ? ' is-selected' : '');
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(on));
        b.setAttribute('aria-label', d.name + ' ' + d.sym);
        b.dataset.sym = d.sym;
        b.innerHTML = '<strong dir="ltr">' + safeEsc(d.sym) + '</strong><small>' + d.name + '</small>';
        b.addEventListener('click', () => {
          setQuestionAnswer(q.id, { symbol: d.sym });
          const slot = stage.querySelector('#u1e-cmp-slot');
          if (slot) {
            slot.textContent = d.sym;
            slot.classList.add('is-filled');
          }
          choices.querySelectorAll('.u1e-sym-btn').forEach((btn) => {
            const act = btn.dataset.sym === d.sym;
            btn.classList.toggle('is-selected', act);
            btn.setAttribute('aria-checked', String(act));
          });
        });
        choices.append(b);
      });

      stage.append(choices);
      container.append(stage);
      return;
    }

    if (q.type === 'number_line_fill') {
      const curRaw = saved && typeof saved === 'object' ? (saved.raw ?? '') : '';
      const wrap = document.createElement('div');
      wrap.className = 'u1e-nl-wrap';

      const lineBox = document.createElement('div');
      lineBox.className = 'u1e-nl-track';
      lineBox.setAttribute('dir', 'ltr');
      lineBox.setAttribute('aria-label', 'خط الأعداد من مربع فارغ حتى +5');

      const ticksHtml = [];
      for (let v = q.min; v <= q.max; v++) {
        const isMissing = v === q.missingVal;
        const isZero = v === 0;
        const tone = isMissing ? 'is-missing' : (isZero ? 'is-zero' : (v < 0 ? 'is-neg' : 'is-pos'));
        const lbl = isMissing ? (curRaw || '؟') : Unit1ExamData.formatSignedNumber(v);
        ticksHtml.push(
          '<div class="u1e-nl-tick ' + tone + '">' +
            '<span class="u1e-nl-mark" aria-hidden="true"></span>' +
            '<span class="u1e-nl-lbl"' + (isMissing ? ' id="u1e-nl-box-val"' : '') + '>' + safeEsc(lbl) + '</span>' +
          '</div>'
        );
      }

      lineBox.innerHTML =
        '<div class="u1e-nl-rail" aria-hidden="true">' +
          '<span class="u1e-nl-arrow is-left"></span>' +
          '<span class="u1e-nl-axis"></span>' +
          '<span class="u1e-nl-arrow is-right"></span>' +
        '</div>' +
        '<div class="u1e-nl-ticks">' + ticksHtml.join('') + '</div>';
      wrap.append(lineBox);

      const inputRow = document.createElement('div');
      inputRow.className = 'u1e-nl-input-area';
      inputRow.innerHTML =
        '<label for="u1e-nl-input" class="u1e-input-label">أدخل العدد المفقود أو اختره:</label>' +
        '<div class="u1e-input-group">' +
          '<input type="text" id="u1e-nl-input" class="u1e-num-input" dir="ltr" inputmode="text" autocomplete="off" placeholder="-0" value="' + safeEsc(curRaw) + '">' +
        '</div>';

      const chips = document.createElement('div');
      chips.className = 'u1e-quick-picks';
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', 'اختيارات سريعة للعدد المفقود');

      const inputEl = inputRow.querySelector('#u1e-nl-input');
      const syncNumberLineDisplay = (valStr) => {
        const boxVal = lineBox.querySelector('#u1e-nl-box-val');
        const cleaned = Unit1ExamData.normalizeDigits(valStr).trim();
        if (boxVal) boxVal.textContent = cleaned || '؟';
        chips.querySelectorAll('.u1e-pick-chip').forEach((c) => {
          const parsed = Unit1ExamData.parseExamInt(cleaned, true);
          const on = parsed !== null && parsed === Number(c.dataset.val);
          c.classList.toggle('is-selected', on);
          c.setAttribute('aria-pressed', String(on));
        });
      };

      inputEl.addEventListener('input', () => {
        const val = inputEl.value;
        setQuestionAnswer(q.id, { raw: val });
        syncNumberLineDisplay(val);
      });

      (q.quickPicks || [-6, -5, -4, 5]).forEach((val) => {
        const str = Unit1ExamData.formatSignedNumber(val);
        const parsedCur = Unit1ExamData.parseExamInt(curRaw, true);
        const isSel = parsedCur !== null && parsedCur === val;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'u1e-pick-chip' + (isSel ? ' is-selected' : '');
        chip.dataset.val = String(val);
        chip.setAttribute('aria-pressed', String(isSel));
        chip.innerHTML = '<bdi dir="ltr">' + safeEsc(str) + '</bdi>';
        chip.addEventListener('click', () => {
          inputEl.value = str;
          setQuestionAnswer(q.id, { raw: str });
          syncNumberLineDisplay(str);
        });
        chips.append(chip);
      });

      inputRow.append(chips);
      wrap.append(inputRow);
      container.append(wrap);
      return;
    }

    if (q.type === 'num_input') {
      if (q.verbalQuote) {
        const quote = document.createElement('blockquote');
        quote.className = 'u1e-verbal-quote';
        quote.textContent = q.verbalQuote;
        container.append(quote);
      } else if (q.displayExpr) {
        const box = document.createElement('div');
        box.className = 'u1e-expr-banner';
        box.innerHTML = '<bdi dir="ltr">' + safeEsc(q.displayExpr) + '</bdi>';
        container.append(box);
      }

      const curRaw = saved && typeof saved === 'object' ? (saved.raw ?? '') : '';
      const parsedCur = Unit1ExamData.parseExamInt(curRaw, false);

      const field = document.createElement('div');
      field.className = 'u1e-num-field';
      field.innerHTML =
        '<label for="u1e-main-num-input" class="u1e-input-label">إجابتك بالأرقام:</label>' +
        '<input type="text" id="u1e-main-num-input" class="u1e-num-input" dir="ltr" inputmode="numeric" autocomplete="off" placeholder="' + safeEsc(q.placeholder || 'اكتب العدد...') + '" value="' + safeEsc(curRaw) + '">' +
        '<div class="u1e-num-preview" id="u1e-num-preview" aria-live="polite">' +
          (parsedCur !== null ? ('المعاينة المنسّقة: <bdi dir="ltr">' + Unit1ExamData.formatExamNumber(parsedCur) + '</bdi>') : 'يمكنك الكتابة بالأرقام العربية أو الإنجليزية مع فواصل أو بدونها.') +
        '</div>';

      const inputEl = field.querySelector('#u1e-main-num-input');
      const previewEl = field.querySelector('#u1e-num-preview');
      let helperContainer = null;

      if (q.placeHelper && isPractice) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'u1e-helper-toggle';
        toggleBtn.setAttribute('aria-expanded', String(Boolean(activeRun.showPlaceHelper)));
        toggleBtn.innerHTML = ICONS.grid + '<span>' + (activeRun.showPlaceHelper ? 'إخفاء لوحة المنازل المساعدة' : 'أظهر لوحة المنازل المساعدة') + '</span>';

        helperContainer = document.createElement('div');
        helperContainer.className = 'u1e-pv-slot';
        helperContainer.hidden = !activeRun.showPlaceHelper;
        if (activeRun.showPlaceHelper) helperContainer.innerHTML = renderPlaceValueHelper(curRaw);

        toggleBtn.addEventListener('click', () => {
          activeRun.showPlaceHelper = !activeRun.showPlaceHelper;
          toggleBtn.setAttribute('aria-expanded', String(activeRun.showPlaceHelper));
          toggleBtn.innerHTML = ICONS.grid + '<span>' + (activeRun.showPlaceHelper ? 'إخفاء لوحة المنازل المساعدة' : 'أظهر لوحة المنازل المساعدة') + '</span>';
          helperContainer.hidden = !activeRun.showPlaceHelper;
          if (activeRun.showPlaceHelper) helperContainer.innerHTML = renderPlaceValueHelper(inputEl.value);
        });
        field.append(toggleBtn, helperContainer);
      }

      inputEl.addEventListener('input', () => {
        const val = inputEl.value;
        setQuestionAnswer(q.id, { raw: val });
        const parsed = Unit1ExamData.parseExamInt(val, false);
        if (previewEl) {
          previewEl.innerHTML = parsed !== null
            ? ('المعاينة المنسّقة: <bdi dir="ltr">' + Unit1ExamData.formatExamNumber(parsed) + '</bdi>')
            : 'يمكنك الكتابة بالأرقام العربية أو الإنجليزية مع فواصل أو بدونها.';
        }
        if (helperContainer && !helperContainer.hidden) {
          helperContainer.innerHTML = renderPlaceValueHelper(val);
        }
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && isPractice) {
          e.preventDefault();
          handlePracticeCheck();
        }
      });

      container.append(field);
      return;
    }

    if (q.type === 'digit_relation_8') {
      const a = saved && typeof saved === 'object'
        ? { highVal: saved.highVal ?? null, lowVal: saved.lowVal ?? null, op: saved.op || 'mul', factor: saved.factor ?? null }
        : { highVal: null, lowVal: null, op: 'mul', factor: null };

      const wrap = document.createElement('div');
      wrap.className = 'u1e-rel8-wrap';

      const numBanner = document.createElement('div');
      numBanner.className = 'u1e-visual-banner';
      numBanner.innerHTML =
        renderHighlightNumberHTML(q.numberStr, {
          [q.highIndex]: 'is-highlight-thousands',
          [q.lowIndex]: 'is-highlight-ones'
        }) +
        '<div class="u1e-rel8-legend">' +
          '<span class="u1e-legend-dot is-thousands">الرقم 8 الأول (دورة الألوف)</span>' +
          '<span class="u1e-legend-dot is-ones">الرقم 8 الثاني (دورة الآحاد)</span>' +
        '</div>';
      wrap.append(numBanner);

      /* Step 1: Pick the two place values */
      const step1 = document.createElement('div');
      step1.className = 'u1e-subcard';
      step1.innerHTML = '<h4 class="u1e-subcard-title">الخطوة 1: حدّد القيمة المنزلية لكل رقم 8</h4>';

      const pairGrid = document.createElement('div');
      pairGrid.className = 'u1e-rel8-pair';

      const buildChoiceGroup = (label, choices, currentVal, toneClass, onPick) => {
        const g = document.createElement('div');
        g.className = 'u1e-rel8-group';
        g.innerHTML = '<span class="u1e-rel8-lbl ' + toneClass + '">' + label + '</span>';
        const row = document.createElement('div');
        row.className = 'u1e-chip-row';
        choices.forEach((v) => {
          const on = Number(currentVal) === v;
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'u1e-pick-chip' + (on ? ' is-selected' : '');
          b.setAttribute('aria-pressed', String(on));
          b.innerHTML = '<bdi dir="ltr">' + Unit1ExamData.formatExamNumber(v) + '</bdi>';
          b.addEventListener('click', () => onPick(v));
          row.append(b);
        });
        g.append(row);
        return g;
      };

      const renderSubWidgets = () => {
        pairGrid.replaceChildren();
        pairGrid.append(
          buildChoiceGroup('قيمة 8 الأول (يسار):', q.highChoices, a.highVal, 'is-thousands', (v) => {
            a.highVal = v;
            setQuestionAnswer(q.id, { ...a });
            renderSubWidgets();
          }),
          buildChoiceGroup('قيمة 8 الثاني (يمين):', q.lowChoices, a.lowVal, 'is-ones', (v) => {
            a.lowVal = v;
            setQuestionAnswer(q.id, { ...a });
            renderSubWidgets();
          })
        );

        eqPreview.innerHTML = a.op === 'mul'
          ? '<bdi dir="ltr">' + (a.highVal ? Unit1ExamData.formatExamNumber(a.highVal) : '؟') + ' = ' + (a.lowVal ? Unit1ExamData.formatExamNumber(a.lowVal) : '؟') + ' × ' + (a.factor ? Unit1ExamData.formatExamNumber(a.factor) : '[ ؟ ]') + '</bdi>'
          : '<bdi dir="ltr">' + (a.lowVal ? Unit1ExamData.formatExamNumber(a.lowVal) : '؟') + ' = ' + (a.highVal ? Unit1ExamData.formatExamNumber(a.highVal) : '؟') + ' ÷ ' + (a.factor ? Unit1ExamData.formatExamNumber(a.factor) : '[ ؟ ]') + '</bdi>';

        opRow.querySelectorAll('.u1e-seg-btn').forEach((b) => {
          const on = b.dataset.op === a.op;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        factorRow.querySelectorAll('.u1e-pick-chip').forEach((b) => {
          const on = Number(b.dataset.factor) === Number(a.factor);
          b.classList.toggle('is-selected', on);
          b.setAttribute('aria-pressed', String(on));
        });
      };

      step1.append(pairGrid);
      wrap.append(step1);

      /* Step 2: Build multiplication OR division equation */
      const step2 = document.createElement('div');
      step2.className = 'u1e-subcard';
      step2.innerHTML = '<h4 class="u1e-subcard-title">الخطوة 2: اكتب العلاقة على صورة ضرب أو قسمة (تُقبل كلتا الصورتين)</h4>';

      const opRow = document.createElement('div');
      opRow.className = 'u1e-seg-row';
      opRow.setAttribute('role', 'group');
      opRow.setAttribute('aria-label', 'اختيار صورة الضرب أو القسمة');
      [
        { op: 'mul', label: 'صورة ضرب (×)' },
        { op: 'div', label: 'صورة قسمة (÷)' }
      ].forEach((item) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u1e-seg-btn' + (a.op === item.op ? ' is-active' : '');
        b.dataset.op = item.op;
        b.setAttribute('aria-pressed', String(a.op === item.op));
        b.textContent = item.label;
        b.addEventListener('click', () => {
          a.op = item.op;
          setQuestionAnswer(q.id, { ...a });
          renderSubWidgets();
        });
        opRow.append(b);
      });

      const eqPreview = document.createElement('div');
      eqPreview.className = 'u1e-eq-preview';
      eqPreview.setAttribute('aria-live', 'polite');

      const factorLbl = document.createElement('p');
      factorLbl.className = 'u1e-input-label';
      factorLbl.textContent = 'اختر العدد المناسب لإكمال العلاقة:';

      const factorRow = document.createElement('div');
      factorRow.className = 'u1e-chip-row';
      q.factorChoices.forEach((fv) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u1e-pick-chip';
        b.dataset.factor = String(fv);
        b.innerHTML = '<bdi dir="ltr">' + Unit1ExamData.formatExamNumber(fv) + '</bdi>';
        b.addEventListener('click', () => {
          a.factor = fv;
          setQuestionAnswer(q.id, { ...a });
          renderSubWidgets();
        });
        factorRow.append(b);
      });

      step2.append(opRow, eqPreview, factorLbl, factorRow);
      wrap.append(step2);
      container.append(wrap);
      renderSubWidgets();
      return;
    }

    if (q.type === 'order_cities') {
      const savedObj = saved && typeof saved === 'object' && Array.isArray(saved.order)
        ? { order: saved.order.slice(), touched: Boolean(saved.touched) }
        : { order: q.initialOrder.slice(), touched: false };

      let pendingSwapIdx = null;
      const rowById = Object.fromEntries(q.tableRows.map((r) => [r.id, r]));

      const wrap = document.createElement('div');
      wrap.className = 'u1e-order-wrap';

      /* Textbook reference table */
      const tbl = document.createElement('table');
      tbl.className = 'u1e-data-table';
      tbl.innerHTML =
        '<thead><tr><th scope="col">المحافظة</th><th scope="col">عدد السكان</th></tr></thead>' +
        '<tbody>' +
          q.tableRows.map((r) =>
            '<tr><td>' + safeEsc(r.city) + '</td><td class="u1e-td-num"><bdi dir="ltr">' + Unit1ExamData.formatExamNumber(r.pop) + '</bdi></td></tr>'
          ).join('') +
        '</tbody>';
      wrap.append(tbl);

      const instr = document.createElement('p');
      instr.className = 'u1e-order-instr';
      instr.textContent = 'رتّب المحافظات من الأكبر سكاناً (الأعلى) إلى الأصغر (الأسفل) باستخدام أزرار التحريك أو بالنقر على بطاقتين لتبديلهما:';
      wrap.append(instr);

      const list = document.createElement('ol');
      list.className = 'u1e-order-list';
      list.setAttribute('aria-label', 'ترتيب المحافظات تنازلياً');

      const rankLabels = ['الأولى (الأكبر)', 'الثانية', 'الثالثة (الأصغر)'];

      const renderList = () => {
        list.replaceChildren();
        savedObj.order.forEach((cid, idx) => {
          const item = rowById[cid];
          if (!item) return;
          const li = document.createElement('li');
          li.className = 'u1e-order-item' + (pendingSwapIdx === idx ? ' is-swap-selected' : '');

          const cardBtn = document.createElement('button');
          cardBtn.type = 'button';
          cardBtn.className = 'u1e-order-card-btn';
          cardBtn.setAttribute('aria-pressed', String(pendingSwapIdx === idx));
          cardBtn.innerHTML =
            '<span class="u1e-order-rank">' + rankLabels[idx] + '</span>' +
            '<span class="u1e-order-city"><strong>' + safeEsc(item.city) + '</strong><small><bdi dir="ltr">' + Unit1ExamData.formatExamNumber(item.pop) + '</bdi></small></span>';

          cardBtn.addEventListener('click', () => {
            if (pendingSwapIdx === null) {
              pendingSwapIdx = idx;
              renderList();
            } else if (pendingSwapIdx === idx) {
              pendingSwapIdx = null;
              renderList();
            } else {
              const tmp = savedObj.order[pendingSwapIdx];
              savedObj.order[pendingSwapIdx] = savedObj.order[idx];
              savedObj.order[idx] = tmp;
              savedObj.touched = true;
              pendingSwapIdx = null;
              setQuestionAnswer(q.id, { order: savedObj.order.slice(), touched: true });
              renderList();
            }
          });

          const controls = document.createElement('div');
          controls.className = 'u1e-order-controls';

          const upBtn = document.createElement('button');
          upBtn.type = 'button';
          upBtn.className = 'u1e-move-btn';
          upBtn.disabled = idx === 0;
          upBtn.setAttribute('aria-label', 'نقل ' + item.city + ' لأعلى');
          upBtn.innerHTML = ICONS.up;
          upBtn.addEventListener('click', () => {
            if (idx <= 0) return;
            const tmp = savedObj.order[idx - 1];
            savedObj.order[idx - 1] = savedObj.order[idx];
            savedObj.order[idx] = tmp;
            savedObj.touched = true;
            pendingSwapIdx = null;
            setQuestionAnswer(q.id, { order: savedObj.order.slice(), touched: true });
            renderList();
          });

          const downBtn = document.createElement('button');
          downBtn.type = 'button';
          downBtn.className = 'u1e-move-btn';
          downBtn.disabled = idx === savedObj.order.length - 1;
          downBtn.setAttribute('aria-label', 'نقل ' + item.city + ' لأسفل');
          downBtn.innerHTML = ICONS.down;
          downBtn.addEventListener('click', () => {
            if (idx >= savedObj.order.length - 1) return;
            const tmp = savedObj.order[idx + 1];
            savedObj.order[idx + 1] = savedObj.order[idx];
            savedObj.order[idx] = tmp;
            savedObj.touched = true;
            pendingSwapIdx = null;
            setQuestionAnswer(q.id, { order: savedObj.order.slice(), touched: true });
            renderList();
          });

          controls.append(upBtn, downBtn);
          li.append(cardBtn, controls);
          list.append(li);
        });
      };

      wrap.append(list);
      container.append(wrap);
      renderList();
      return;
    }

    if (q.type === 'livestock_table') {
      const a = saved && typeof saved === 'object'
        ? { aprilSum: saved.aprilSum ?? '', novemberSum: saved.novemberSum ?? '', symbol: saved.symbol || '' }
        : { aprilSum: '', novemberSum: '', symbol: '' };

      const wrap = document.createElement('div');
      wrap.className = 'u1e-live-wrap';

      /* Data table (responsive card-safe grid without horizontal overflow at 320px) */
      const tblWrap = document.createElement('div');
      tblWrap.className = 'u1e-live-table-box';
      tblWrap.innerHTML =
        '<table class="u1e-data-table u1e-live-table">' +
          '<thead><tr><th scope="col">الشهر (2017)</th>' +
            q.columns.map((c) => '<th scope="col">' + safeEsc(c) + '</th>').join('') +
          '</tr></thead>' +
          '<tbody>' +
            q.rows.map((r) =>
              '<tr><th scope="row">' + safeEsc(r.label) + '</th>' +
                r.values.map((v) => '<td class="u1e-td-num"><bdi dir="ltr">' + Unit1ExamData.formatExamNumber(v) + '</bdi></td>').join('') +
              '</tr>'
            ).join('') +
          '</tbody>' +
        '</table>';
      wrap.append(tblWrap);

      /* Step 1: Monthly totals */
      const sumsGrid = document.createElement('div');
      sumsGrid.className = 'u1e-live-sums';

      const buildSumInput = (key, label, val) => {
        const box = document.createElement('div');
        box.className = 'u1e-live-sum-field';
        const parsed = Unit1ExamData.parseExamInt(val, false);
        box.innerHTML =
          '<label for="u1e-sum-' + key + '" class="u1e-input-label">' + label + ':</label>' +
          '<input type="text" id="u1e-sum-' + key + '" class="u1e-num-input" dir="ltr" inputmode="numeric" autocomplete="off" placeholder="0,000,000" value="' + safeEsc(val) + '">' +
          '<small class="u1e-num-preview" id="u1e-sum-prev-' + key + '">' +
            (parsed !== null ? '<bdi dir="ltr">' + Unit1ExamData.formatExamNumber(parsed) + '</bdi>' : 'اجمع الأعمدة الثلاثة') +
          '</small>';
        const inp = box.querySelector('input');
        const prev = box.querySelector('#u1e-sum-prev-' + key);
        inp.addEventListener('input', () => {
          a[key + 'Sum'] = inp.value;
          setQuestionAnswer(q.id, { ...a });
          const p = Unit1ExamData.parseExamInt(inp.value, false);
          if (prev) prev.innerHTML = p !== null ? '<bdi dir="ltr">' + Unit1ExamData.formatExamNumber(p) + '</bdi>' : 'اجمع الأعمدة الثلاثة';
          updateLiveComparisonPreview();
        });
        return box;
      };

      sumsGrid.append(
        buildSumInput('april', 'مجموع نيسان', a.aprilSum),
        buildSumInput('november', 'مجموع تشرين الثاني', a.novemberSum)
      );
      wrap.append(sumsGrid);

      /* Step 2: Compare April vs November */
      const cmpBox = document.createElement('div');
      cmpBox.className = 'u1e-subcard';
      cmpBox.innerHTML =
        '<h4 class="u1e-subcard-title">الخطوة 2: قارن بين مجموع الشهرين</h4>' +
        '<div class="u1e-live-cmp-preview" dir="ltr" id="u1e-live-cmp-preview"></div>';

      const symRow = document.createElement('div');
      symRow.className = 'u1e-sym-row';
      symRow.setAttribute('role', 'radiogroup');
      symRow.setAttribute('aria-label', 'المقارنة بين مجموع نيسان ومجموع تشرين الثاني');

      const symDefs = [
        { sym: '<', label: 'نيسان أصغر' },
        { sym: '=', label: 'متساويان' },
        { sym: '>', label: 'نيسان أكبر' }
      ];

      const updateLiveComparisonPreview = () => {
        const pEl = cmpBox.querySelector('#u1e-live-cmp-preview');
        if (!pEl) return;
        const ap = Unit1ExamData.parseExamInt(a.aprilSum, false);
        const nv = Unit1ExamData.parseExamInt(a.novemberSum, false);
        const apText = ap !== null ? Unit1ExamData.formatExamNumber(ap) : '؟';
        const nvText = nv !== null ? Unit1ExamData.formatExamNumber(nv) : '؟';
        pEl.innerHTML =
          '<span class="u1e-live-pill"><small>نيسان</small><strong><bdi dir="ltr">' + safeEsc(apText) + '</bdi></strong></span>' +
          '<span class="u1e-compare-slot' + (a.symbol ? ' is-filled' : '') + '">' + safeEsc(a.symbol || '؟') + '</span>' +
          '<span class="u1e-live-pill"><small>تشرين الثاني</small><strong><bdi dir="ltr">' + safeEsc(nvText) + '</bdi></strong></span>';
      };

      symDefs.forEach((d) => {
        const on = a.symbol === d.sym;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u1e-sym-btn' + (on ? ' is-selected' : '');
        b.dataset.sym = d.sym;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(on));
        b.innerHTML = '<strong dir="ltr">' + safeEsc(d.sym) + '</strong><small>' + d.label + '</small>';
        b.addEventListener('click', () => {
          a.symbol = d.sym;
          setQuestionAnswer(q.id, { ...a });
          symRow.querySelectorAll('.u1e-sym-btn').forEach((btn) => {
            const act = btn.dataset.sym === d.sym;
            btn.classList.toggle('is-selected', act);
            btn.setAttribute('aria-checked', String(act));
          });
          updateLiveComparisonPreview();
        });
        symRow.append(b);
      });

      cmpBox.append(symRow);
      wrap.append(cmpBox);
      container.append(wrap);
      updateLiveComparisonPreview();
    }
  }

  /* =========================================================================
     Main View Renderer (Section / Formal / Section Summary / Full Report)
     ========================================================================= */

  function renderExamView() {
    const root = byId('unit1-exam-view');
    if (!root || !activeRun) return;
    root.replaceChildren();

    if (activeRun.mode === 'section_summary') {
      renderSectionSummaryView(root);
      notifyContext();
      return;
    }

    if (activeRun.mode === 'report') {
      renderFormalReportView(root);
      notifyContext();
      return;
    }

    const isFormal = activeRun.mode === 'formal';
    const q = activeRun.questions[activeRun.index];
    if (!q) return;

    const ex = getUnit1ExamState();
    const total = activeRun.questions.length;
    const pct = Math.round(((activeRun.index + 1) / Math.max(1, total)) * 100);
    const labLabel = !isFormal ? getLabButtonLabel(q) : '';

    /* Top Header */
    const header = document.createElement('header');
    header.className = 'u1e-topbar';

    const answeredFormalCount = isFormal
      ? Unit1ExamData.QUESTIONS.filter((item) =>
          Unit1ExamData.evaluateUnit1ExamQuestion(item, ex.formal.answers[String(item.id)]).isAnswered
        ).length
      : 0;

    header.innerHTML =
      '<div class="u1e-topbar-inner">' +
        '<button type="button" class="u1e-top-btn" id="u1e-exit-btn" aria-label="' + (isFormal ? 'حفظ التقدم والعودة إلى بوابة الاختبار' : 'العودة إلى بوابة الاختبار') + '">' +
          ICONS.close +
          '<span class="u1e-top-lbl">' + (isFormal ? 'حفظ وخروج' : 'بوابة الاختبار') + '</span>' +
        '</button>' +
        '<div class="u1e-top-center">' +
          '<div class="u1e-top-meta">' +
            '<span class="u1e-top-title">' + (isFormal ? 'الاختبار الشامل للوحدة 1' : activeRun.sectionMeta.title) + '</span>' +
            '<span class="u1e-top-counter" id="u1e-formal-counter">' +
              (isFormal
                ? ('أُجيب <bdi dir="ltr">' + answeredFormalCount + '</bdi> من <bdi dir="ltr">21</bdi>')
                : ('السؤال <bdi dir="ltr">' + (activeRun.index + 1) + '</bdi> من <bdi dir="ltr">' + total + '</bdi>')) +
            '</span>' +
          '</div>' +
          '<div class="u1e-top-track" role="progressbar" aria-label="تقدّم الأسئلة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
            '<div class="u1e-top-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="u1e-top-tools">' +
          (labLabel
            ? '<button type="button" class="u1e-top-btn" id="u1e-lab-btn" aria-label="فتح ' + labLabel + '" title="' + labLabel + '">' + ICONS.lab + '<span class="u1e-top-lbl">' + labLabel + '</span></button>'
            : '') +
          '<button type="button" class="u1e-top-btn" id="u1e-audio-btn" aria-label="استمع لقراءة السؤال">' + ICONS.audio + '<span class="u1e-top-lbl">استمع</span></button>' +
          '<button type="button" class="u1e-top-btn is-ai" id="u1e-ai-btn" aria-label="افتح المعلم الذكي">' + ICONS.ai + '<span class="u1e-top-lbl">' + (isFormal ? 'تلميح ذكي' : 'المعلم الذكي') + '</span></button>' +
          (isFormal
            ? '<button type="button" class="u1e-top-submit" id="u1e-top-submit-btn">تسليم</button>'
            : '') +
        '</div>' +
      '</div>';

    header.querySelector('#u1e-exit-btn')?.addEventListener('click', closeToHub);
    header.querySelector('#u1e-audio-btn')?.addEventListener('click', () => speakQuestion(q));
    header.querySelector('#u1e-lab-btn')?.addEventListener('click', () => openLabForQuestion(q));
    header.querySelector('#u1e-ai-btn')?.addEventListener('click', () => {
      if (typeof openAiTutor === 'function') openAiTutor();
    });
    header.querySelector('#u1e-top-submit-btn')?.addEventListener('click', openSubmitConfirmation);
    root.append(header);

    /* Formal Exam 1-21 Question Navigator Strip */
    if (isFormal) {
      const nav = document.createElement('nav');
      nav.className = 'u1e-formal-nav';
      nav.setAttribute('aria-label', 'التنقل بين أسئلة الاختبار الـ 21');
      const strip = document.createElement('div');
      strip.className = 'u1e-nav-strip';

      Unit1ExamData.QUESTIONS.forEach((item, idx) => {
        const isCur = idx === activeRun.index;
        const isAns = Unit1ExamData.evaluateUnit1ExamQuestion(item, ex.formal.answers[String(item.id)]).isAnswered;
        const isFlag = ex.formal.flagged.includes(item.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'u1e-nav-pill' + (isCur ? ' is-current' : '') + (isAns ? ' is-answered' : '') + (isFlag ? ' is-flagged' : '');
        btn.dataset.qid = String(item.id);
        btn.setAttribute('aria-label', 'السؤال ' + item.id + (isAns ? '، مُجاب' : '، غير مُجاب') + (isFlag ? '، مميّز للمراجعة' : ''));
        if (isCur) btn.setAttribute('aria-current', 'step');
        btn.innerHTML = '<bdi dir="ltr">' + item.id + '</bdi>';
        btn.addEventListener('click', () => jumpFormalQuestion(idx));
        strip.append(btn);
      });

      nav.append(strip);
      root.append(nav);

      requestAnimationFrame(() => {
        const curPill = strip.querySelector('.u1e-nav-pill.is-current');
        if (curPill && typeof curPill.scrollIntoView === 'function') {
          try { curPill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' }); } catch (_e) { /* ignore */ }
        }
      });
    }

    /* Main Question Stage */
    const stage = document.createElement('div');
    stage.className = 'u1e-stage';

    const card = document.createElement('article');
    card.className = 'u1e-q-card';

    const isFlagged = isFormal && ex.formal.flagged.includes(q.id);
    const lessonMeta = Unit1ExamData.LESSON_META[q.lessonRef];

    const cardHead = document.createElement('div');
    cardHead.className = 'u1e-q-head';
    cardHead.innerHTML =
      '<div class="u1e-q-badges">' +
        '<span class="u1e-q-num-badge">س <bdi dir="ltr">' + q.id + '</bdi> · ص <bdi dir="ltr">' + q.page + '</bdi></span>' +
        '<span class="u1e-q-lesson-badge">' + (lessonMeta ? ('الدرس <bdi dir="ltr">' + lessonMeta.num + '</bdi><span class="u1e-lesson-full">: ' + lessonMeta.title + '</span>') : '') + '</span>' +
      '</div>' +
      (isFormal
        ? '<button type="button" class="u1e-flag-btn' + (isFlagged ? ' is-flagged' : '') + '" id="u1e-flag-btn" aria-pressed="' + String(isFlagged) + '" aria-label="' + (isFlagged ? 'إزالة تمييز السؤال للمراجعة' : 'تمييز السؤال للمراجعة') + '">' +
            ICONS.flag + '<span>' + (isFlagged ? 'مميّز' : 'ميّز') + '</span>' +
          '</button>'
        : '');

    cardHead.querySelector('#u1e-flag-btn')?.addEventListener('click', () => toggleFormalFlag(q.id));
    card.append(cardHead);

    if (q.groupLabel) {
      const grp = document.createElement('p');
      grp.className = 'u1e-q-group';
      grp.innerHTML = bidiFormatText(q.groupLabel);
      card.append(grp);
    }

    const promptHeading = document.createElement('h2');
    promptHeading.className = 'u1e-q-prompt';
    promptHeading.innerHTML = bidiFormatText(q.prompt);
    card.append(promptHeading);

    const widgetSlot = document.createElement('div');
    widgetSlot.className = 'u1e-widget-slot';
    renderQuestionWidget(q, widgetSlot);
    card.append(widgetSlot);

    /* Progressive 3-Tier Hints (Practice Mode ONLY) */
    if (!isFormal && Array.isArray(q.hints) && q.hints.length > 0) {
      const hintWrap = document.createElement('div');
      hintWrap.className = 'u1e-hints-wrap';

      const hintBtn = document.createElement('button');
      hintBtn.type = 'button';
      hintBtn.className = 'u1e-hint-trigger';
      hintBtn.setAttribute('aria-expanded', String(activeRun.hintTier > 0));

      const hintBody = document.createElement('div');
      hintBody.className = 'u1e-hint-list';
      hintBody.hidden = activeRun.hintTier === 0;

      const renderHintsContent = () => {
        const tier = activeRun.hintTier;
        const maxT = q.hints.length;
        hintBtn.setAttribute('aria-expanded', String(tier > 0));
        hintBtn.innerHTML = ICONS.bulb + '<span>' +
          (tier === 0
            ? ('تلميح متدرّج (1 من ' + maxT + ')')
            : (tier < maxT ? ('اطلب التلميح التالي (' + (tier + 1) + ' من ' + maxT + ')') : 'ظهرت جميع التلميحات (' + maxT + ' من ' + maxT + ')')) +
          '</span>';
        hintBtn.disabled = tier >= maxT;

        hintBody.hidden = tier === 0;
        hintBody.replaceChildren();
        for (let i = 0; i < tier; i++) {
          const item = document.createElement('p');
          item.className = 'u1e-hint-item';
          item.innerHTML = '<strong>تلميح <bdi dir="ltr">' + (i + 1) + '</bdi>:</strong> ' + bidiFormatText(q.hints[i]);
          hintBody.append(item);
        }
      };

      hintBtn.addEventListener('click', () => {
        if (activeRun.hintTier < q.hints.length) {
          activeRun.hintTier += 1;
          renderHintsContent();
        }
      });

      renderHintsContent();
      hintWrap.append(hintBtn, hintBody);
      card.append(hintWrap);
    }

    stage.append(card);
    root.append(stage);

    /* Sticky Bottom Action Dock (Thumb Zone) */
    const footer = document.createElement('footer');
    footer.className = 'u1e-footer';

    if (!isFormal) {
      footer.innerHTML =
        '<div class="u1e-footer-inner">' +
          '<div class="u1e-feedback" id="u1e-practice-feedback" role="status" aria-live="polite" hidden></div>' +
          '<div class="u1e-footer-actions">' +
            (activeRun.index > 0
              ? '<button type="button" class="u1e-btn u1e-btn-secondary" id="u1e-practice-prev">' + ICONS.back + '<span>السابق</span></button>'
              : '') +
            '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-primary-action">تحقّق من الإجابة</button>' +
          '</div>' +
        '</div>';

      footer.querySelector('#u1e-practice-prev')?.addEventListener('click', () => {
        if (activeRun.index > 0) {
          activeRun.index -= 1;
          activeRun.hintTier = 0;
          activeRun.showPlaceHelper = false;
          activeRun.checkedState = null;
          renderExamView();
        }
      });
      footer.querySelector('#u1e-primary-action')?.addEventListener('click', handlePracticeCheck);
    } else {
      const isFirst = activeRun.index === 0;
      const isLast = activeRun.index === total - 1;
      footer.innerHTML =
        '<div class="u1e-footer-inner">' +
          '<div class="u1e-footer-actions is-formal">' +
            '<button type="button" class="u1e-btn u1e-btn-secondary" id="u1e-formal-prev"' + (isFirst ? ' disabled' : '') + '>' + ICONS.back + '<span>السابق</span></button>' +
            (isLast
              ? '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-formal-finish">' + ICONS.check + '<span>مراجعة وتسليم الاختبار</span></button>'
              : '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-formal-next"><span>السؤال التالي</span>' + ICONS.next + '</button>') +
          '</div>' +
        '</div>';

      footer.querySelector('#u1e-formal-prev')?.addEventListener('click', () => jumpFormalQuestion(activeRun.index - 1));
      footer.querySelector('#u1e-formal-next')?.addEventListener('click', () => jumpFormalQuestion(activeRun.index + 1));
      footer.querySelector('#u1e-formal-finish')?.addEventListener('click', openSubmitConfirmation);
    }

    root.append(footer);
    if (!isFormal) updatePracticeFeedbackUI();
    syncActionButtonsState();
    notifyContext();
    stage.scrollTop = 0;
  }

  /* =========================================================================
     Section Practice Summary Screen
     ========================================================================= */

  function renderSectionSummaryView(root) {
    const meta = activeRun.sectionMeta;
    const nextSecId = activeRun.sectionId + 1;
    const hasNextSec = nextSecId < Unit1ExamData.SECTIONS.length;
    const pts = activeRun.wasDone ? 0 : (meta.points || 60);

    const wrap = document.createElement('div');
    wrap.className = 'u1e-summary-wrap';
    wrap.innerHTML =
      '<article class="u1e-summary-card">' +
        '<span class="u1e-summary-ico" aria-hidden="true">' + ICONS.trophy + '</span>' +
        '<span class="u1e-pill is-success">اكتمل التدرّب بنجاح</span>' +
        '<h2>أحسنت! أتممت «' + safeEsc(meta.title) + '»</h2>' +
        '<p class="u1e-summary-sub">' + safeEsc(meta.rangeLabel) + ' · ' + (activeRun.wasDone ? 'مراجعة رائعة تثبّت إتقانك.' : 'أصبحت جاهزاً للخطوة التالية نحو اختبار الوحدة الشامل.') + '</p>' +
        '<div class="u1e-hub-metrics">' +
          '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + activeRun.stars + ' / 3</bdi></strong><span class="u1e-metric-lbl">نجوم الإتقان</span></div>' +
          '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">+' + pts + '</bdi></strong><span class="u1e-metric-lbl">نقطة مكتسبة</span></div>' +
          '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + activeRun.errors + '</bdi></strong><span class="u1e-metric-lbl">محاولات تصحيح</span></div>' +
        '</div>' +
        '<div class="u1e-summary-actions">' +
          '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-sum-primary">' +
            '<span>' + (hasNextSec ? ('الانتقال إلى ' + Unit1ExamData.SECTIONS[nextSecId].title) : 'خوض الاختبار الشامل الرسمي (21 سؤالاً)') + '</span>' +
            ICONS.next +
          '</button>' +
          '<button type="button" class="u1e-btn u1e-btn-secondary" id="u1e-sum-hub">العودة إلى بوابة الاختبار</button>' +
        '</div>' +
      '</article>';

    wrap.querySelector('#u1e-sum-primary')?.addEventListener('click', () => {
      if (hasNextSec) openSection(nextSecId, { replay: false });
      else openFormalExam({ resume: false });
    });
    wrap.querySelector('#u1e-sum-hub')?.addEventListener('click', closeToHub);
    root.append(wrap);
  }

  /* =========================================================================
     Diagnostic Report, Remedial Lesson Jumps, Item Review & Printable Certificate
     ========================================================================= */

  function renderFormalReportView(root) {
    const ex = getUnit1ExamState();
    const report = ex.formal.lastResult;
    if (!report) {
      closeToHub();
      return;
    }

    const header = document.createElement('header');
    header.className = 'u1e-topbar';
    header.innerHTML =
      '<div class="u1e-topbar-inner">' +
        '<button type="button" class="u1e-top-btn" id="u1e-rep-back">' + ICONS.close + '<span class="u1e-top-lbl">بوابة الاختبار</span></button>' +
        '<div class="u1e-top-center"><div class="u1e-top-meta"><span class="u1e-top-title">تقرير اختبار نهاية الوحدة الأولى</span><span class="u1e-top-counter"><bdi dir="ltr">' + report.correctCount + ' / ' + report.total + ' (' + report.pct + '%)</bdi></span></div></div>' +
        '<div class="u1e-top-tools">' +
          '<button type="button" class="u1e-top-btn is-ai" id="u1e-rep-ai">' + ICONS.ai + '<span class="u1e-top-lbl">المعلم الذكي</span></button>' +
        '</div>' +
      '</div>';
    header.querySelector('#u1e-rep-back')?.addEventListener('click', closeToHub);
    header.querySelector('#u1e-rep-ai')?.addEventListener('click', () => {
      activeRun.reviewFocusQid = null;
      notifyContext();
      if (typeof openAiTutor === 'function') openAiTutor();
    });
    root.append(header);

    const stage = document.createElement('div');
    stage.className = 'u1e-stage u1e-report-stage';

    /* 1. Score Hero */
    const hero = document.createElement('section');
    hero.className = 'u1e-report-hero' + (report.passed ? ' is-passed' : ' is-needs-work');
    hero.innerHTML =
      '<div class="u1e-rep-hero-top">' +
        '<span class="u1e-summary-ico" aria-hidden="true">' + ICONS.trophy + '</span>' +
        '<div>' +
          '<span class="u1e-pill ' + (report.passed ? 'is-success' : 'is-warn') + '">' +
            (report.passed ? 'مجتاز بنجاح (80% فأعلى)' : 'قريب من الاجتياز (المطلوب 80%)') +
          '</span>' +
          '<h2>' + (report.passed ? 'مبارك! أتقنت مهارات الوحدة الأولى' : 'محاولة رائعة! راجع المهارات المحددة وحاول مجدداً') + '</h2>' +
          '<p>' + (report.passed
            ? 'استحققت شهادة إتمام الوحدة الأولى ومكافأة النقاط الكاملة. يمكنك مراجعة تفاصيل إجاباتك أدناه.'
            : 'تعرّف على الدروس التي تحتاج مراجعة سريعة أدناه ثم أعد الاختبار لفتح شهادة الوحدة الأولى.') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="u1e-hub-metrics">' +
        '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + report.correctCount + ' / ' + report.total + '</bdi></strong><span class="u1e-metric-lbl">إجابة صحيحة</span></div>' +
        '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + report.pct + '%</bdi></strong><span class="u1e-metric-lbl">النسبة المئوية</span></div>' +
        '<div class="u1e-metric"><strong class="u1e-metric-val"><bdi dir="ltr">' + getUnit1ExamPoints() + ' / 400</bdi></strong><span class="u1e-metric-lbl">نقاط الوحدة</span></div>' +
      '</div>' +
      '<div class="u1e-report-hero-actions">' +
        '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-rep-retry">إعادة الاختبار الشامل</button>' +
        '<button type="button" class="u1e-btn u1e-btn-secondary" id="u1e-rep-hub">العودة إلى بوابة الاختبار</button>' +
      '</div>';

    hero.querySelector('#u1e-rep-retry')?.addEventListener('click', () => openFormalExam({ resume: false }));
    hero.querySelector('#u1e-rep-hub')?.addEventListener('click', closeToHub);
    stage.append(hero);

    /* 2. Printable Unit 1 Certificate (Unlocked at >= 80%) */
    if (report.passed) {
      const certSec = document.createElement('section');
      certSec.className = 'u1e-cert-section';
      certSec.setAttribute('aria-labelledby', 'u1e-cert-heading');
      const curName = (state.studentName && state.studentName.trim()) ? state.studentName.trim() : '';
      const dateStr = new Date(report.submittedAt || Date.now()).toLocaleDateString('ar-JO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      certSec.innerHTML =
        '<div class="u1e-cert-controls">' +
          '<div class="u1e-cert-input-wrap">' +
            '<label for="u1e-cert-name-input" class="u1e-input-label">اسم الطالب/الطالبة في شهادة الوحدة:</label>' +
            '<input type="text" id="u1e-cert-name-input" class="u1e-text-input" maxlength="40" placeholder="اكتب اسمك ليظهر في الشهادة..." value="' + safeEsc(curName) + '">' +
          '</div>' +
          '<button type="button" class="u1e-btn u1e-btn-primary" id="u1e-print-cert-btn">' + ICONS.print + '<span>طباعة شهادة الوحدة</span></button>' +
        '</div>' +
        '<div class="u1e-cert-card" id="u1e-cert-card">' +
          '<span class="u1e-cert-kicker">المملكة الأردنية الهاشمية · الرياضيات · الصف الخامس الابتدائي</span>' +
          '<h3 id="u1e-cert-heading" class="u1e-cert-title">شهادة إتمام الوحدة الأولى</h3>' +
          '<p class="u1e-cert-unit">الأعداد: جمعها وطرحها (الصفحات <bdi dir="ltr">8 – 27</bdi>)</p>' +
          '<p class="u1e-cert-grant">تُمنح هذه الشهادة تقديراً لتميّز</p>' +
          '<div class="u1e-cert-student" id="u1e-cert-student">' + safeEsc(curName || 'بطل/بطلة الرياضيات') + '</div>' +
          '<p class="u1e-cert-body">لاجتيازه «اختبار نهاية الوحدة الأولى» وإتقانه مهارات القيمة المنزلية، مقارنة الأعداد، الجمع والطرح والتقدير، الأعداد السالبة، وتحليل الجداول.</p>' +
          '<div class="u1e-cert-meta">' +
            '<span>الدرجة: <bdi dir="ltr">' + report.correctCount + ' / ' + report.total + ' (' + report.pct + '%)</bdi></span>' +
            '<span>التاريخ: ' + safeEsc(dateStr) + '</span>' +
          '</div>' +
        '</div>';

      const nameInp = certSec.querySelector('#u1e-cert-name-input');
      const nameOut = certSec.querySelector('#u1e-cert-student');
      nameInp?.addEventListener('input', () => {
        state.studentName = nameInp.value;
        if (nameOut) nameOut.textContent = nameInp.value.trim() || 'بطل/بطلة الرياضيات';
        if (typeof saveState === 'function') saveState();
      });
      certSec.querySelector('#u1e-print-cert-btn')?.addEventListener('click', () => {
        document.body.dataset.printTarget = 'unit1-cert';
        const cleanup = () => {
          delete document.body.dataset.printTarget;
          window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
        window.print();
        setTimeout(cleanup, 1200);
      });
      stage.append(certSec);
    }

    /* 3. Diagnostic Breakdown by Unit 1 Lessons (1-5) with Remedial Links */
    const diagSec = document.createElement('section');
    diagSec.className = 'u1e-diag-section';
    diagSec.setAttribute('aria-labelledby', 'u1e-diag-title');
    diagSec.innerHTML =
      '<div class="u1e-sec-block-head">' +
        '<h3 id="u1e-diag-title">التشخيص التربوي حسب دروس الوحدة الأولى</h3>' +
        '<p>تعرّف على أدائك في مهارات كل درس وانتقل مباشرة للمراجعة عند الحاجة.</p>' +
      '</div>';

    const diagList = document.createElement('div');
    diagList.className = 'u1e-diag-list';

    report.lessonBreakdown.forEach((lb) => {
      const row = document.createElement('div');
      row.className = 'u1e-diag-row' + (lb.needsReview ? ' is-needs-review' : ' is-mastered');
      row.innerHTML =
        '<div class="u1e-diag-info">' +
          '<div class="u1e-diag-head">' +
            '<strong>الدرس <bdi dir="ltr">' + lb.lesson + '</bdi>: ' + safeEsc(lb.title) + '</strong>' +
            '<span class="u1e-diag-score"><bdi dir="ltr">' + lb.correct + ' / ' + lb.total + ' (' + lb.pct + '%)</bdi></span>' +
          '</div>' +
          '<div class="u1e-sec-bar-wrap" role="progressbar" aria-label="إتقان الدرس ' + lb.lesson + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + lb.pct + '">' +
            '<div class="u1e-sec-bar-fill" style="width:' + lb.pct + '%"></div>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="u1e-btn ' + (lb.needsReview ? 'u1e-btn-outline' : 'u1e-btn-secondary') + ' u1e-diag-jump">' +
          (lb.needsReview ? ('راجع الدرس ' + lb.lesson) : ('تصفّح الدرس ' + lb.lesson)) +
        '</button>';

      row.querySelector('.u1e-diag-jump')?.addEventListener('click', () => {
        const targetKey = lb.lessonKey;
        const view = byId('unit1-exam-view');
        if (view) { view.hidden = true; view.replaceChildren(); }
        ex.activeSession = null;
        activeRun = null;
        state.viewMode = 'map';
        if (typeof updateViewDom === 'function') updateViewDom();
        if (typeof setMapSubView === 'function') setMapSubView(targetKey, true);
      });
      diagList.append(row);
    });

    diagSec.append(diagList);
    stage.append(diagSec);

    /* 4. Filterable Item-by-Item Review */
    const revSec = document.createElement('section');
    revSec.className = 'u1e-review-section';
    revSec.setAttribute('aria-labelledby', 'u1e-review-title');

    const curFilter = activeRun.reviewFilter || 'all';
    const wrongCount = report.itemResults.filter((r) => !r.isCorrect).length;
    const rightCount = report.itemResults.filter((r) => r.isCorrect).length;

    revSec.innerHTML =
      '<div class="u1e-review-head">' +
        '<h3 id="u1e-review-title">مراجعة الأسئلة والإجابات التفصيلية</h3>' +
        '<div class="u1e-filter-row" role="group" aria-label="تصفية مراجعة الأسئلة">' +
          '<button type="button" class="u1e-filter-btn' + (curFilter === 'all' ? ' is-active' : '') + '" data-filter="all" aria-pressed="' + String(curFilter === 'all') + '">الكل (<bdi dir="ltr">' + report.total + '</bdi>)</button>' +
          '<button type="button" class="u1e-filter-btn' + (curFilter === 'wrong' ? ' is-active' : '') + '" data-filter="wrong" aria-pressed="' + String(curFilter === 'wrong') + '">تحتاج مراجعة (<bdi dir="ltr">' + wrongCount + '</bdi>)</button>' +
          '<button type="button" class="u1e-filter-btn' + (curFilter === 'right' ? ' is-active' : '') + '" data-filter="right" aria-pressed="' + String(curFilter === 'right') + '">صحيحة (<bdi dir="ltr">' + rightCount + '</bdi>)</button>' +
        '</div>' +
      '</div>';

    revSec.querySelectorAll('.u1e-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeRun.reviewFilter = btn.dataset.filter;
        renderExamView();
      });
    });

    const revList = document.createElement('div');
    revList.className = 'u1e-review-list';

    const visibleItems = report.itemResults.filter((item) => {
      if (curFilter === 'wrong') return !item.isCorrect;
      if (curFilter === 'right') return item.isCorrect;
      return true;
    });

    if (visibleItems.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'u1e-review-empty';
      empty.textContent = curFilter === 'wrong'
        ? 'ممتاز! لا توجد أي أخطاء في هذه المحاولة.'
        : 'لا توجد عناصر ضمن هذا التصنيف.';
      revList.append(empty);
    } else {
      visibleItems.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'u1e-rev-card ' + (item.isCorrect ? 'is-right' : 'is-wrong');
        card.innerHTML =
          '<div class="u1e-rev-top">' +
            '<span class="u1e-rev-badge">' + (item.isCorrect ? ICONS.check : ICONS.alert) + '<span>سؤال <bdi dir="ltr">' + item.id + '</bdi> · ' + (item.isCorrect ? 'إجابة صحيحة' : 'تحتاج مراجعة') + '</span></span>' +
            '<span class="u1e-rev-lesson">الدرس <bdi dir="ltr">' + item.lessonRef + '</bdi></span>' +
          '</div>' +
          '<p class="u1e-rev-prompt">' + bidiFormatText(item.prompt) + '</p>' +
          '<div class="u1e-rev-answers">' +
            '<div><small>إجابتك:</small><strong>' + bidiFormatText(item.userSummary) + '</strong></div>' +
            '<div><small>الإجابة المعتمدة:</small><strong>' + bidiFormatText(item.correctSummary) + '</strong></div>' +
          '</div>' +
          '<p class="u1e-rev-explain">' + bidiFormatText(item.feedback) + '</p>' +
          '<button type="button" class="u1e-rev-ai-btn" data-rev-qid="' + item.id + '">' + ICONS.ai + '<span>اسأل المعلم الذكي عن هذا السؤال</span></button>';

        card.querySelector('.u1e-rev-ai-btn')?.addEventListener('click', () => {
          activeRun.reviewFocusQid = item.id;
          notifyContext();
          if (typeof openAiTutor === 'function') openAiTutor('explain');
        });
        revList.append(card);
      });
    }

    revSec.append(revList);
    stage.append(revSec);
    root.append(stage);
  }

  /* =========================================================================
     AI Tutor Context Bridge (Supports Socratic Hint-Only Mode during Formal Exam)
     ========================================================================= */

  function getActiveAiContext() {
    if (!activeRun || state.viewMode !== 'unit1_exam') return null;
    const isFormalLive = activeRun.mode === 'formal';

    let q = null;
    if (activeRun.mode === 'section' || activeRun.mode === 'formal') {
      q = activeRun.questions[activeRun.index] || null;
    } else if (activeRun.mode === 'report' && activeRun.reviewFocusQid) {
      q = Unit1ExamData.getQuestionById(activeRun.reviewFocusQid);
    }

    const total = activeRun.questions ? activeRun.questions.length : 21;
    const stepIndex = q ? (activeRun.mode === 'report' ? q.id - 1 : activeRun.index) : 0;

    return {
      lesson: 6,
      linkedLesson: q ? q.lessonRef : 1,
      stationTitle: isFormalLive
        ? 'الاختبار الشامل للوحدة الأولى (وضع التلميحات فقط)'
        : (activeRun.mode === 'section' && activeRun.sectionMeta
            ? ('اختبار الوحدة · ' + activeRun.sectionMeta.title)
            : 'مراجعة تقرير اختبار نهاية الوحدة الأولى'),
      stepKind: q ? ('unit1_exam_' + q.type) : 'unit1_exam_report',
      stepIndex,
      totalSteps: total,
      isTeachingSlide: false,
      slideTitle: q ? ('السؤال ' + q.id + ': ' + q.skillLabel) : 'تقرير اختبار نهاية الوحدة الأولى',
      slideBody: q ? (q.verbalQuote || q.displayExpr || q.groupLabel || '') : '',
      questionPrompt: q ? q.prompt : 'مراجعة نتائج اختبار نهاية الوحدة الأولى (21 سؤالاً)',
      numbersInvolved: q ? (q.numbersText || '') : '',
      options: q && Array.isArray(q.options) ? q.options.map((o) => o.key + ') ' + o.label) : [],
      hintText: q && Array.isArray(q.hints) ? q.hints[0] : '',
      examSocraticMode: isFormalLive
    };
  }

  global.Unit1ExamEngine = {
    openSection,
    openFormalExam,
    openLastReport,
    closeToHub,
    resumeFromSavedState,
    getActiveAiContext,
    isActive: () => Boolean(activeRun && state.viewMode === 'unit1_exam')
  };
})(window);
