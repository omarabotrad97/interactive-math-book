/* ==========================================================================
   LESSON 3: جمع الأعداد الكلية وطرحها - STATE & DUOLINGO PATH MAP
   Stages, 16 interactive stations (260 pts), progressive unlocking & SVG path.
   Zero emoji: crisp inline SVGs + text only.
   ========================================================================== */

const L3_STAGES = [
  {
    id: 0,
    num: 1,
    cls: 'u1',
    rangeLabel: 'المحطات 1 - 2',
    tag: 'المرحلة 1 · صفحة 16',
    title: 'الاستكشاف والتقدير لأعلى منزلة',
    subtitle: 'الأعداد الكلية، التقريب، وتقدير المجموع والفرق',
    nodeIds: [0, 1]
  },
  {
    id: 1,
    num: 2,
    cls: 'u1',
    rangeLabel: 'المحطات 3 - 4',
    tag: 'المرحلة 2 · الصفحات 16 - 17',
    title: 'الجمع مع إعادة التجميع',
    subtitle: 'الجمع العمودي ضمن 7 و8 منازل مع الحمل',
    nodeIds: [2, 3]
  },
  {
    id: 2,
    num: 3,
    cls: 'u2',
    rangeLabel: 'المحطات 5 - 7',
    tag: 'المرحلة 3 · الصفحات 17 - 18',
    title: 'الطرح مع إعادة التجميع',
    subtitle: 'الاستلاف والتحقق من معقولية الإجابة',
    nodeIds: [4, 5, 6]
  },
  {
    id: 3,
    num: 4,
    cls: 'u2',
    rangeLabel: 'المحطات 8 - 11',
    tag: 'المرحلة 4 · صفحة 18',
    title: 'أتدرب ومسائل الحياة اليومية',
    subtitle: 'الجمع المتعدد، المساحات الجغرافية، وصادرات الأسمدة',
    nodeIds: [7, 8, 9, 10]
  },
  {
    id: 4,
    num: 5,
    cls: 'u1',
    rangeLabel: 'المحطات 12 - 16',
    tag: 'المرحلة 5 · صفحة 19',
    title: 'مهارات التفكير العليا والإتقان',
    subtitle: 'الأرقام المفقودة، المسائل متعددة الخطوات، وتذكرة الإتقان',
    nodeIds: [11, 12, 13, 14, 15]
  }
];

const L3_NODES = [
  {
    id: 0, stage: 0, kind: 'lesson', icon: 'book', points: 15, offset: 0,
    title: 'أستكشف: أرباح الشركة',
    sub: 'مفهوم الأعداد الكلية وتقدير جمع 1,125,040 + 1,095,400',
    cta: 'ابدأ المحطة 1'
  },
  {
    id: 1, stage: 0, kind: 'practice', icon: 'target', points: 15, offset: -54,
    title: 'أتعلّم: التقدير لأعلى منزلة',
    sub: 'تقريب الأعداد الكبيرة والحكم على معقولية الناتج',
    cta: 'تدرّب الآن'
  },
  {
    id: 2, stage: 1, kind: 'lesson', icon: 'book', points: 15, offset: 54,
    title: 'مثال 1: الجمع مع الحمل',
    sub: 'جمع 3,421,664 + 1,897,632 عموديًا مع إعادة التجميع',
    cta: 'افتح المثال'
  },
  {
    id: 3, stage: 1, kind: 'practice', icon: 'layers', points: 15, offset: 0,
    title: 'أتحقق (1): عشرات الملايين',
    sub: 'جمع 35,421,664 + 17,897,632 ضمن 8 منازل',
    cta: 'تحقق من فهمك'
  },
  {
    id: 4, stage: 2, kind: 'lesson', icon: 'book', points: 15, offset: -54,
    title: 'مثال 2: الطرح بالاستلاف',
    sub: 'طرح 6,938,179 - 3,165,478 مع إعادة التجميع',
    cta: 'افتح المثال'
  },
  {
    id: 5, stage: 2, kind: 'practice', icon: 'target', points: 15, offset: 54,
    title: 'أتحقق (2): الطرح المتقن',
    sub: 'طرح 8,465,987 - 5,276,514 ومراجعة المعقولية',
    cta: 'تحقق من فهمك'
  },
  {
    id: 6, stage: 2, kind: 'practice', icon: 'layers', points: 15, offset: 0,
    title: 'أتدرب (1 و 2): جمع وتقدير',
    sub: 'تمارين كتاب الطالب 1 و 2 صفحة 18',
    cta: 'حل التمارين'
  },
  {
    id: 7, stage: 3, kind: 'practice', icon: 'compass', points: 15, offset: -54,
    title: 'أتدرب (3 و 4): طرح دقيق',
    sub: 'طرح أعداد متقاربة ومنازل فيها أصفار',
    cta: 'حل التمارين'
  },
  {
    id: 8, stage: 3, kind: 'practice', icon: 'layers', points: 15, offset: 54,
    title: 'أتدرب (5): جمع 3 أعداد',
    sub: 'جمع ثلاثة أعداد ضمن الملايين مع حمل متتابع',
    cta: 'ابدأ الجمع'
  },
  {
    id: 9, stage: 3, kind: 'chest', icon: 'sparkle', points: 15, offset: 0, isChest: true,
    title: 'مسألة 6: مساحات الدول العربية',
    sub: 'الجزائر وليبيا والمغرب: مجموع المساحات بتركيز المنازل',
    cta: 'افتح التحدي'
  },
  {
    id: 10, stage: 3, kind: 'practice', icon: 'target', points: 15, offset: -54,
    title: 'مسألة 7: صادرات الأسمدة',
    sub: 'قراءة الجدول وحساب مقدار الزيادة بين 2016 و 2017م',
    cta: 'حل المسألة'
  },
  {
    id: 11, stage: 4, kind: 'practice', icon: 'compass', points: 15, offset: 54,
    title: 'مسألة 8: الأرقام المفقودة',
    sub: 'اكتشاف الأرقام الناقصة في الجمع العمودي',
    cta: 'اكشف الأرقام'
  },
  {
    id: 12, stage: 4, kind: 'practice', icon: 'layers', points: 15, offset: 0,
    title: 'مسألة 9: طائرات الشحن',
    sub: 'مسألة متعددة الخطوات باستعمال التمثيل بالأعمدة',
    cta: 'ابدأ الحل'
  },
  {
    id: 13, stage: 4, kind: 'practice', icon: 'compass', points: 15, offset: -54,
    title: 'مسألة 10: تبرير فارس',
    sub: 'التحقق من ناتج الطرح بالعملية العكسية (الجمع)',
    cta: 'ناقش التبرير'
  },
  {
    id: 14, stage: 4, kind: 'practice', icon: 'target', points: 15, offset: 54,
    title: 'مسألة 11 وأتحدث: لانا وريم',
    sub: 'اكتشاف خطأ إغفال الحمل وتوضيح سبب إعادة التجميع',
    cta: 'اكتشف الخطأ'
  },
  {
    id: 15, stage: 4, kind: 'exit_ticket', icon: 'trophy', points: 35, offset: 0,
    title: 'تذكرة الإتقان النهائية',
    sub: 'اختبار شامل لـ 8 مهارات أساسية في جمع وطرح الأعداد',
    cta: 'ابدأ التقييم'
  }
];

function createDefaultLesson3State() {
  return {
    activeNode: 0,
    completedNodes: new Set(),
    nodeStars: {},
    expandedStages: new Set([0]),
    records: {},
    stats: { answered: 0, correct: 0, firstTry: 0, streak: 0, bestStreak: 0 },
    exitTicket: null,
    unlocked: true
  };
}

function getLesson3State() {
  if (typeof state !== 'object' || !state) return createDefaultLesson3State();
  if (!state.lesson3 || typeof state.lesson3 !== 'object') {
    state.lesson3 = createDefaultLesson3State();
  }
  const l3 = state.lesson3;
  if (!(l3.completedNodes instanceof Set)) {
    l3.completedNodes = new Set(Array.isArray(l3.completedNodes) ? l3.completedNodes.map(Number).filter(Number.isInteger) : []);
  }
  if (!l3.nodeStars || typeof l3.nodeStars !== 'object') l3.nodeStars = {};
  if (!(l3.expandedStages instanceof Set)) {
    l3.expandedStages = new Set(Array.isArray(l3.expandedStages) ? l3.expandedStages.map(Number).filter(Number.isInteger) : [0]);
  }
  if (!l3.records || typeof l3.records !== 'object') l3.records = {};
  if (!l3.stats || typeof l3.stats !== 'object') {
    l3.stats = { answered: 0, correct: 0, firstTry: 0, streak: 0, bestStreak: 0 };
  }
  if (l3.unlocked === undefined) l3.unlocked = true;
  return l3;
}

function getLesson3NodeRecord(nodeId) {
  const l3 = getLesson3State();
  const key = String(nodeId);
  if (!l3.records[key] || typeof l3.records[key] !== 'object') {
    l3.records[key] = {
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      data: {}
    };
  }
  const r = l3.records[key];
  if (!(r.passed instanceof Set)) r.passed = new Set(Array.isArray(r.passed) ? r.passed : []);
  if (!(r.assistedSteps instanceof Set)) r.assistedSteps = new Set(Array.isArray(r.assistedSteps) ? r.assistedSteps : []);
  if (!(r.independentSteps instanceof Set)) r.independentSteps = new Set(Array.isArray(r.independentSteps) ? r.independentSteps : []);
  if (!r.data || typeof r.data !== 'object') r.data = {};
  r.index = Number(r.index) || 0;
  r.errors = Number(r.errors) || 0;
  return r;
}

function resetLesson3NodeRecordForReplay(nodeId) {
  const l3 = getLesson3State();
  l3.records[String(nodeId)] = {
    index: 0,
    passed: new Set(),
    assistedSteps: new Set(),
    independentSteps: new Set(),
    errors: 0,
    data: {}
  };
  return l3.records[String(nodeId)];
}

function getLesson3NodeProgress(nodeId) {
  const id = Number(nodeId);
  const total = typeof window.Lesson3RunnerDefs?.getStepCount === 'function'
    ? Math.max(1, window.Lesson3RunnerDefs.getStepCount(id))
    : 3;
  if (isLesson3NodeCompleted(id)) {
    return { cur: total, tot: total, done: total, total, pct: 100 };
  }
  const r = getLesson3NodeRecord(id);
  const done = Math.min(r.passed.size, total);
  if (done > 0) {
    const pct = Math.round((done / total) * 100);
    return { cur: done, tot: total, done, total, pct };
  }
  const isFront = id === currentLesson3Frontier();
  return { cur: 0, tot: total, done: 0, total, pct: isFront ? 12 : 0 };
}

function getLesson3NodeStars(nodeId) {
  const l3 = getLesson3State();
  const stored = Number(l3.nodeStars[String(nodeId)] || 0);
  if (stored > 0) return Math.min(3, stored);
  if (!l3.completedNodes.has(Number(nodeId))) return 0;
  const r = getLesson3NodeRecord(nodeId);
  if (r.errors === 0 && r.assistedSteps.size === 0) return 3;
  if (r.errors <= 2) return 2;
  return 1;
}

function getLesson3DoneCount() {
  return getLesson3State().completedNodes.size;
}

function getLesson3Points() {
  const l3 = getLesson3State();
  let sum = 0;
  for (const id of l3.completedNodes) {
    const node = L3_NODES.find((n) => n.id === Number(id));
    if (node) sum += Number(node.points) || 0;
  }
  return sum;
}

function isLesson3Unlocked() {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  const l3 = getLesson3State();
  if (l3.unlocked) return true;
  if (typeof getLesson2DoneCount === 'function' && getLesson2DoneCount() >= 15) return true;
  return false;
}

function isLesson3NodeCompleted(nodeId) {
  return getLesson3State().completedNodes.has(Number(nodeId));
}

function isLesson3NodeUnlocked(nodeId) {
  const id = Number(nodeId);
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  if (id <= 0) return isLesson3Unlocked();
  if (isLesson3NodeCompleted(id)) return true;
  return isLesson3NodeCompleted(id - 1);
}

function currentLesson3Frontier() {
  const l3 = getLesson3State();
  for (const node of L3_NODES) {
    if (!l3.completedNodes.has(node.id) && isLesson3NodeUnlocked(node.id)) {
      return node.id;
    }
  }
  return L3_NODES[L3_NODES.length - 1].id;
}

function completeLesson3Station(nodeId, points, overrideStars) {
  const id = Number(nodeId);
  const l3 = getLesson3State();
  const node = L3_NODES.find((n) => n.id === id);
  const rec = getLesson3NodeRecord(id);
  const firstCompletion = !l3.completedNodes.has(id);
  l3.completedNodes.add(id);

  let earnedStars = Number.isInteger(overrideStars) ? Math.min(3, Math.max(1, overrideStars)) : 0;
  if (!earnedStars) {
    if (rec.errors === 0 && rec.assistedSteps.size === 0) earnedStars = 3;
    else if (rec.errors <= 2) earnedStars = 2;
    else earnedStars = 1;
  }
  const prevStars = Number(l3.nodeStars[String(id)] || 0);
  const finalStars = Math.max(prevStars, earnedStars);
  l3.nodeStars[String(id)] = finalStars;

  if (node) {
    const nextNode = L3_NODES.find((n) => n.id === id + 1);
    if (nextNode) {
      l3.activeNode = nextNode.id;
      if (l3.expandedStages instanceof Set) l3.expandedStages.add(nextNode.stage);
    }
  }
  if (firstCompletion) {
    if (typeof sound === 'function') sound(true, 750);
    if (typeof haptic === 'function') haptic(true);
    if (typeof checkMilestoneBadges === 'function') checkMilestoneBadges(true);
  }
  if (typeof saveState === 'function') saveState();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderHUD === 'function') renderHUD();
  if (typeof renderDuolingoMap === 'function') renderDuolingoMap();
  return {
    wasDone: !firstCompletion,
    earnedStars,
    firstCompletion,
    stars: finalStars,
    points: Number(points) || (node ? node.points : 15)
  };
}

function openLesson3Node(nodeId, btnEl, opts) {
  const id = Number(nodeId);
  if (typeof stopSpeech === 'function') stopSpeech();
  const node = L3_NODES.find((n) => n.id === id);
  if (!node) return false;
  if (!isLesson3NodeUnlocked(id)) {
    if (typeof sound === 'function') sound(false, 240);
    if (typeof haptic === 'function') haptic(false);
    if (typeof shakeElement === 'function') {
      shakeElement(btnEl || document.querySelector('[data-l3-node-id="' + id + '"]'));
    }
    const prevNode = L3_NODES[id - 1];
    if (typeof guide === 'function') {
      guide('هذه المحطة مقفلة! أكمل «' + (prevNode ? prevNode.title : 'المحطة السابقة') + '» أولًا بالترتيب.', 4500);
    }
    return false;
  }
  const l3 = getLesson3State();
  l3.activeNode = id;
  l3.unlocked = true;
  if (typeof state === 'object' && state) state.mapSubView = 'lesson3';
  if (l3.expandedStages instanceof Set) l3.expandedStages.add(node.stage);
  if (opts && opts.review && isLesson3NodeCompleted(id) && !opts.preserveProgress) {
    resetLesson3NodeRecordForReplay(id);
  }
  if (typeof saveState === 'function') saveState();
  if (window.L1Runner && typeof window.L1Runner.openLesson3Node === 'function') {
    return window.L1Runner.openLesson3Node(id, opts || {});
  }
  return false;
}

function l3NodeIconSVG(kind, unlocked) {
  if (!unlocked) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  }
  if (kind === 'chest') {
    return '<svg viewBox="0 0 64 56" fill="none"><rect x="6" y="20" width="52" height="30" rx="8" fill="#d97706" stroke="#92400e" stroke-width="3"/><path d="M6 26h52" stroke="#fef3c7" stroke-width="4"/><rect x="26" y="22" width="12" height="12" rx="3" fill="#fde68a" stroke="#92400e" stroke-width="2.5"/><path d="M12 20c0-7 8-12 20-12s20 5 20 12" fill="#f59e0b" stroke="#92400e" stroke-width="3"/></svg>';
  }
  if (kind === 'exit_ticket') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
  }
  if (kind === 'lesson') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
}

function l3StarsClusterHTML(stars) {
  const starSvg = (posCls, filled) =>
    `<svg class="dp-star ${posCls} ${filled ? 'on' : 'off'}" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  return `<span class="dp-stars-badge" aria-label="${stars} من 3 نجوم">${starSvg('star-side star-right', stars >= 1)}${starSvg('star-center', stars >= 3)}${starSvg('star-side star-left', stars >= 2)}</span>`;
}

function l3MascotSideSVG() {
  return '<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="52" r="32" fill="#ecfccb" stroke="#65a30d" stroke-width="3"/><circle cx="37" cy="46" r="6" fill="#fff" stroke="#1e293b" stroke-width="2"/><circle cx="59" cy="46" r="6" fill="#fff" stroke="#1e293b" stroke-width="2"/><circle cx="37" cy="46" r="2.5" fill="#0f172a"/><circle cx="59" cy="46" r="2.5" fill="#0f172a"/><polygon points="44,54 52,54 48,61" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/><path d="M22 48c-6 4-6 14 2 18" stroke="#65a30d" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M74 48c6 4 6 14-2 18" stroke="#65a30d" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="34" y="16" width="28" height="10" rx="4" fill="#1e7d5f"/><text x="48" y="24" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">+</text></svg>';
}

function renderLesson3StageMapUnits(unitsRoot, openPopoverNodeId = null) {
  if (!unitsRoot) return;
  if (typeof renderUnifiedStageMapUnits === 'function' && typeof getActiveMapLessonContext === 'function') {
    renderUnifiedStageMapUnits(unitsRoot, getActiveMapLessonContext('lesson3'));
    return;
  }
  const l3 = getLesson3State();
  const frontier = currentLesson3Frontier();
  unitsRoot.innerHTML = '';

  const stageHtml = L3_STAGES.map((stage) => {
    const nodes = stage.nodeIds.map((id) => L3_NODES.find((n) => n.id === id)).filter(Boolean);
    const doneInStage = nodes.filter((n) => l3.completedNodes.has(n.id)).length;
    const isStageDone = doneInStage === nodes.length;
    const hasFrontier = nodes.some((n) => n.id === frontier);
    const stageStateCls = isStageDone
      ? 'is-stage-done'
      : (hasFrontier ? 'is-stage-current' : 'is-stage-upcoming');
    const stageHasOpenPopover = openPopoverNodeId !== null && nodes.some((n) => n.id === openPopoverNodeId);

    const nodesHtml = nodes.map((node, idx) => {
      const done = l3.completedNodes.has(node.id);
      const unlocked = isLesson3NodeUnlocked(node.id);
      const isFrontier = node.id === frontier && !done;
      const statusCls = done ? 'completed' : (isFrontier ? 'current' : (unlocked ? 'active' : 'locked'));
      const stars = done ? getLesson3NodeStars(node.id) : 0;
      const prog = getLesson3NodeProgress(node.id);
      const pct = done ? 100 : (unlocked ? prog.pct : 0);
      const dashOffset = Math.max(0, 100 - pct);
      const isOpen = openPopoverNodeId === node.id;
      const mascotSide = idx % 2 === 0 ? 'l' : 'r';
      const mascotMarkup = isFrontier
        ? `<div class="dp-mascot ${mascotSide}" aria-hidden="true">${l3MascotSideSVG()}</div>`
        : '';

      const popTitle = esc ? esc(node.title) : node.title;
      const popSub = unlocked
        ? `${esc ? esc(node.sub) : node.sub} (${node.points} نقطة)`
        : 'أكمل المحطة السابقة أولاً لفتح هذه المحطة.';
      const popBtnLabel = !unlocked
        ? 'مغلقة حاليًا'
        : (done ? 'مراجعة أو إعادة المحطة' : (prog.done > 0 ? 'متابعة من حيث توقفت' : node.cta));

      const popoverHtml = isOpen
        ? `<div class="dp-popover${!unlocked ? ' locked-pop' : ''}" role="dialog" aria-label="${popTitle}">
            <span class="dp-popover-arrow" aria-hidden="true"></span>
            <h4>${popTitle}</h4>
            <p>${popSub}</p>
            <button type="button" class="dp-popover-btn" data-l3-start-node="${node.id}" ${!unlocked ? 'disabled' : ''}>${popBtnLabel}</button>
           </div>`
        : '';

      return `
        <div class="dp-wrap${isOpen ? ' popover-open' : ''}" style="--x:${node.offset}px">
          ${isFrontier ? '<div class="dp-callout">ابدأ هنا</div>' : ''}
          ${mascotMarkup}
          <button type="button"
                  class="dp-node ${statusCls}${node.isChest ? ' chest-node' : ''}"
                  data-l3-node-id="${node.id}"
                  aria-label="${popTitle} - ${done ? 'مكتملة' : (unlocked ? 'متاحة' : 'مغلقة')}"
                  aria-expanded="${isOpen ? 'true' : 'false'}">
            <svg class="dp-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
              <circle class="dp-ring-track" cx="50" cy="50" r="44"/>
              <circle class="dp-ring-fill" cx="50" cy="50" r="44" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${dashOffset}"/>
            </svg>
            <span class="dp-ico" aria-hidden="true">${l3NodeIconSVG(node.kind, unlocked)}</span>
            ${done ? l3StarsClusterHTML(stars) : ''}
          </button>
          ${popoverHtml}
        </div>
      `;
    }).join('');

    return `
      <section class="dp-unit stage-unit ${stageStateCls}${stageHasOpenPopover ? ' has-open-popover' : ''}" data-l3-stage-id="${stage.id}">
        <header class="dp-head">
          <span class="dp-head-line" aria-hidden="true"></span>
          <div class="dp-head-pill">
            <span class="stage-step-badge">${stage.num}</span>
            <div class="dp-head-main">
              <small>${stage.tag}</small>
              <h3>${stage.title}</h3>
            </div>
            <span class="stage-sub-meta" dir="ltr"><bdi dir="ltr">${doneInStage}/${nodes.length}</bdi></span>
          </div>
          <span class="dp-head-line" aria-hidden="true"></span>
        </header>
        <div class="dp-path" data-l3-path-stage="${stage.id}">
          <svg class="dp-track-svg" aria-hidden="true"></svg>
          ${nodesHtml}
        </div>
      </section>
    `;
  }).join('');

  unitsRoot.innerHTML = stageHtml;
}
