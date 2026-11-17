/* Lesson 4: الأعداد السالبة — Map Stages, 14 Stations (220 pts) & State Management */

const L4_STAGES = [
  {
    id: 0,
    num: 1,
    cls: 'u1',
    rangeLabel: 'المحطات 1 - 3',
    tag: 'المرحلة 1 · صفحة 20',
    title: 'أستكشف وأتعلّم: ما العدد السالب؟',
    subtitle: 'برد الشوبك، تعريف العدد السالب، وخط الأعداد من -5 إلى +5',
    nodeIds: [0, 1, 2]
  },
  {
    id: 1,
    num: 2,
    cls: 'u1',
    rangeLabel: 'المحطات 4 - 6',
    tag: 'المرحلة 2 · الصفحات 20 - 21',
    title: 'من الحياة وأتحقق من فهمي',
    subtitle: 'مستوى سطح البحر، الغوص والطيران، برج فندق روتانا، وبرد الطفيلة',
    nodeIds: [3, 4, 5]
  },
  {
    id: 2,
    num: 3,
    cls: 'u2',
    rangeLabel: 'المحطات 7 - 9',
    tag: 'المرحلة 3 · الصفحات 22 - 23',
    title: 'أتدرّب وأحل المسائل (1–4)',
    subtitle: 'جدول المواقف ومعنى الصفر، موازين الحرارة، وإكمال خط الأعداد',
    nodeIds: [6, 7, 8]
  },
  {
    id: 3,
    num: 4,
    cls: 'u2',
    rangeLabel: 'المحطات 10 - 13',
    tag: 'المرحلة 4 · صفحة 23',
    title: 'التحليل والتفكير العليا وأتحدث (5–9)',
    subtitle: 'تحليل الحروف والتناظر، تبرير الصفر، خطأ نيفين، وموقفي الحياتي',
    nodeIds: [9, 10, 11, 12]
  },
  {
    id: 4,
    num: 5,
    cls: 'u2',
    rangeLabel: 'المحطة 14',
    tag: 'المرحلة 5 · التقييم الختامي',
    title: 'تذكرة الإتقان النهائية',
    subtitle: 'اختبار مستقل لـ 6 مهارات أساسية في الأعداد السالبة + مسار علاجي',
    nodeIds: [13]
  }
];

const L4_NODES = [
  {
    id: 0,
    stage: 0,
    kind: 'lesson',
    icon: 'book',
    title: 'أستكشف: برد الشوبك وتحت الصفر',
    sub: 'مقارنة 5°C فوق الصفر مع 3°C تحت الصفر في شهر شباط (ص 20)',
    cta: 'ابدأ الاستكشاف',
    points: 15,
    skillKey: 'l4_neg_meaning',
    goal: 'أميز بين القيم فوق الصفر والقيم التي تقع تحت الصفر'
  },
  {
    id: 1,
    stage: 0,
    kind: 'lesson',
    icon: 'book',
    title: 'أتعلّم: العدد السالب وخط الأعداد',
    sub: 'وضع الإشارة (-) وتمثيل الأعداد السالبة إلى يسار الصفر (ص 20)',
    cta: 'تعلّم القاعدة',
    points: 15,
    skillKey: 'l4_number_line',
    goal: 'أتعرف العدد السالب وموقعه يسار الصفر مقارنة بالموجب يمين الصفر'
  },
  {
    id: 2,
    stage: 0,
    kind: 'practice',
    icon: 'target',
    title: 'تثبيت المفهوم: قراءة وتحديد العدد السالب',
    sub: 'تدريب سريع على التمييز بين السالب والموجب والاتجاه حول 0',
    cta: 'ابدأ التدريب',
    points: 15,
    skillKey: 'l4_neg_meaning',
    goal: 'أقرأ الأعداد السالبة وأحدد مواقعها على خط الأعداد'
  },
  {
    id: 3,
    stage: 1,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مثال 1: مستوى سطح البحر (الطائرة والسمكة)',
    sub: 'القارب عند 0، والسمكة عند -20، والطائرة عند 40 (ص 20)',
    cta: 'حل مثال 1',
    points: 15,
    skillKey: 'l4_neg_meaning',
    goal: 'أقرأ البعد عن مستوى سطح البحر بالأعداد السالبة والموجبة وأفسر الصفر'
  },
  {
    id: 4,
    stage: 1,
    kind: 'practice',
    icon: 'target',
    title: 'أتحقق من فهمي: الكائنات البحرية والطائر',
    sub: 'مواقع الطائر 10 والدلفين 0 والقرش -5 والأخطبوط -10 (ص 21)',
    cta: 'تحقق من فهمك',
    points: 15,
    skillKey: 'l4_zero_ref',
    goal: 'أحدد الكائن عند مستوى سطح البحر وما ينخفض عنه بالأعداد السالبة'
  },
  {
    id: 5,
    stage: 1,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مثال 2 وأتحقق: فندق روتانا وبرد الطفيلة',
    sub: 'الطابق السابع تحت الأرض (-7) وحرارة الطفيلة 5 تحت الصفر (-5)',
    cta: 'تابع الأمثلة',
    points: 15,
    skillKey: 'l4_neg_meaning',
    goal: 'أمثّل الطوابق تحت الأرض ودرجات الحرارة تحت الصفر بالعدد السالب'
  },
  {
    id: 6,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أتدرّب (1–2): جدول المواقف ومعنى الصفر',
    sub: 'سحب مها 50 دينارًا، منزل يوسف +100 m، وأومياكون سيبيريا (-60)',
    cta: 'أكمل الجدول',
    points: 15,
    skillKey: 'l4_zero_ref',
    goal: 'أمثّل الموقف بعدد موقّع وأوضح ماذا يمثل الصفر في كل موقف'
  },
  {
    id: 7,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أتدرّب (3): قراءة وضبط موازين الحرارة',
    sub: 'قراءة الموازين الأربعة (+1، -3، -1، +3) وضبط مؤشر الميزان (ص 22)',
    cta: 'اقرأ الموازين',
    points: 15,
    skillKey: 'l4_thermometer',
    goal: 'أقرأ درجة الحرارة الموجبة والسالبة بدقة على الميزان'
  },
  {
    id: 8,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أتدرّب (4): إكمال وتعيين خط الأعداد',
    sub: 'ملء الخانات المفقودة على خط الأعداد (-6، -1، +2) (ص 23)',
    cta: 'أكمل الخط',
    points: 15,
    skillKey: 'l4_number_line',
    goal: 'أكمل خط الأعداد بالأعداد السالبة والموجبة المفقودة بدقة'
  },
  {
    id: 9,
    stage: 3,
    kind: 'practice',
    icon: 'sparkles',
    title: 'تحليل (5–7): الحروف (أ، ب، جـ، د) والتناظر',
    sub: 'إشارة الحروف على خط الأعداد وتساوي بُعد (ب، جـ) عن الصفر (ص 23)',
    cta: 'حلل الخط',
    points: 15,
    skillKey: 'l4_analysis_sym',
    goal: 'أفسّر إشارة الحروف على خط الأعداد وأستنتج التساوي في البُعد عن الصفر'
  },
  {
    id: 10,
    stage: 3,
    kind: 'practice',
    icon: 'target',
    title: 'مهارات عليا (8): تبرير مكانة الصفر',
    sub: 'هل الصفر عدد سالب أم موجب؟ وتبرير صفته المحايدة (ص 23)',
    cta: 'برّر إجابتك',
    points: 15,
    skillKey: 'l4_zero_ref',
    goal: 'أبرر لماذا الصفر عدد محايد ليس سالبًا ولا موجبًا بل فاصل بينهما'
  },
  {
    id: 11,
    stage: 3,
    kind: 'practice',
    icon: 'target',
    title: 'مهارات عليا (9): أكتشف خطأ نيفين في الميزان',
    sub: 'الأقل بـ 10 درجات من +5°C هو -5°C وليس -10 (ص 23)',
    cta: 'اكتشف الخطأ',
    points: 15,
    skillKey: 'l4_temp_shift',
    goal: 'أكتشف الخطأ عند العدّ تنازليًا عبر الصفر بمقدار 10 درجات'
  },
  {
    id: 12,
    stage: 3,
    kind: 'practice',
    icon: 'sparkles',
    title: 'أتحدث: موقفي الحياتي بعدد سالب',
    sub: 'تركيب موقف يومي وتوليد العدد السالب ومعنى الصفر (ص 23)',
    cta: 'أنشئ موقفًا',
    points: 15,
    skillKey: 'l4_neg_meaning',
    goal: 'أصوغ موقفًا حقيقيًا من حياتي يعبّر عنه بعدد سالب مع تفسير الصفر'
  },
  {
    id: 13,
    stage: 4,
    kind: 'exit_ticket',
    icon: 'trophy',
    title: 'تذكرة الإتقان النهائية: الأعداد السالبة',
    sub: 'اختبار مستقل لـ 6 مهارات أساسية في الدرس دون تلميحات',
    cta: 'ابدأ التقييم',
    points: 25,
    skillKey: 'l4_mastery',
    goal: 'أثبت إتقاني الكامل للأعداد السالبة وخط الأعداد والمواقف الحياتية'
  }
];

function createDefaultLesson4State() {
  return {
    activeNode: 0,
    completedNodes: new Set(),
    nodeStars: {},
    expandedStages: new Set([0]),
    records: {},
    stats: {
      l4_neg_meaning: 0,
      l4_zero_ref: 0,
      l4_number_line: 0,
      l4_thermometer: 0,
      l4_analysis_sym: 0,
      l4_temp_shift: 0
    },
    exitTicket: {
      status: 'not_attempted',
      lastScore: 0,
      mastered: false,
      remedialRound: 0,
      unmasteredSkills: []
    },
    exitResults: {},
    unlocked: true
  };
}

function getLesson4State() {
  if (typeof state !== 'object' || !state) return createDefaultLesson4State();
  if (!state.lesson4 || typeof state.lesson4 !== 'object') {
    state.lesson4 = createDefaultLesson4State();
  }
  const l4 = state.lesson4;
  if (!(l4.completedNodes instanceof Set)) {
    l4.completedNodes = new Set(Array.isArray(l4.completedNodes) ? l4.completedNodes.map(Number).filter(Number.isInteger) : []);
  }
  if (!l4.nodeStars || typeof l4.nodeStars !== 'object') l4.nodeStars = {};
  if (!(l4.expandedStages instanceof Set)) {
    l4.expandedStages = new Set(Array.isArray(l4.expandedStages) && l4.expandedStages.length ? l4.expandedStages.map(Number).filter(Number.isInteger) : [0]);
  }
  if (!l4.records || typeof l4.records !== 'object') l4.records = {};
  if (!l4.exitTicket || typeof l4.exitTicket !== 'object') {
    l4.exitTicket = createDefaultLesson4State().exitTicket;
  }
  if (!l4.exitResults || typeof l4.exitResults !== 'object') l4.exitResults = {};
  if (l4.unlocked === undefined) l4.unlocked = true;
  return l4;
}

function isLesson4Unlocked() {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  const l4 = getLesson4State();
  if (l4.unlocked) return true;
  if (typeof isLesson3NodeCompleted === 'function' && isLesson3NodeCompleted(15)) return true;
  return false;
}

function getLesson4NodeRecord(nodeId) {
  const l4 = getLesson4State();
  const key = String(nodeId);
  if (!l4.records[key] || typeof l4.records[key] !== 'object') {
    l4.records[key] = {
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      data: {}
    };
  }
  const rec = l4.records[key];
  if (!(rec.passed instanceof Set)) rec.passed = new Set(Array.isArray(rec.passed) ? rec.passed.map(Number) : []);
  if (!(rec.assistedSteps instanceof Set)) rec.assistedSteps = new Set(Array.isArray(rec.assistedSteps) ? rec.assistedSteps : []);
  if (!(rec.independentSteps instanceof Set)) rec.independentSteps = new Set(Array.isArray(rec.independentSteps) ? rec.independentSteps : []);
  if (typeof rec.errors !== 'number') rec.errors = Number(rec.errors) || 0;
  if (typeof rec.index !== 'number') rec.index = Number(rec.index) || 0;
  if (!rec.data || typeof rec.data !== 'object') rec.data = {};
  return rec;
}

function resetLesson4NodeRecordForReplay(nodeId) {
  const l4 = getLesson4State();
  const rec = {
    index: 0,
    passed: new Set(),
    assistedSteps: new Set(),
    independentSteps: new Set(),
    errors: 0,
    data: {}
  };
  l4.records[String(nodeId)] = rec;
  if (Number(nodeId) === 13) {
    l4.exitResults = {};
  }
  return rec;
}

function isLesson4NodeCompleted(nodeId) {
  return getLesson4State().completedNodes.has(Number(nodeId));
}

function isLesson4NodeUnlocked(nodeId) {
  const id = Number(nodeId);
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  if (!isLesson4Unlocked()) return false;
  if (id <= 0) return true;
  return isLesson4NodeCompleted(id - 1) || isLesson4NodeCompleted(id);
}

function currentLesson4Frontier() {
  const l4 = getLesson4State();
  for (let i = 0; i < L4_NODES.length; i++) {
    if (!l4.completedNodes.has(i) && isLesson4NodeUnlocked(i)) return i;
  }
  return L4_NODES[L4_NODES.length - 1].id;
}

function getLesson4DoneCount() {
  return getLesson4State().completedNodes.size;
}

function getLesson4StarsCount() {
  const l4 = getLesson4State();
  let sum = 0;
  L4_NODES.forEach((n) => {
    sum += Number(l4.nodeStars[String(n.id)] || (l4.completedNodes.has(n.id) ? 3 : 0));
  });
  return sum;
}

function getLesson4Points() {
  const l4 = getLesson4State();
  let total = 0;
  for (const id of l4.completedNodes) {
    const node = L4_NODES.find((n) => n.id === Number(id));
    if (node) total += Number(node.points || 0);
  }
  return total;
}

function getLesson4NodeProgress(nodeId) {
  const id = Number(nodeId);
  const done = isLesson4NodeCompleted(id);
  const rec = getLesson4NodeRecord(id);
  const tot = (typeof Lesson4RunnerDefs !== 'undefined' && typeof Lesson4RunnerDefs.getStepCount === 'function')
    ? Lesson4RunnerDefs.getStepCount(id)
    : 3;
  const passedCount = rec.passed ? rec.passed.size : 0;
  const pct = done ? 100 : (passedCount > 0 ? Math.min(95, Math.round((passedCount / Math.max(1, tot)) * 100)) : 0);
  return {
    cur: done ? tot : passedCount,
    tot,
    pct
  };
}

function getLesson4NodeStars(nodeId) {
  const l4 = getLesson4State();
  const key = String(nodeId);
  if (typeof l4.nodeStars[key] === 'number') return l4.nodeStars[key];
  return l4.completedNodes.has(Number(nodeId)) ? 3 : 0;
}

function completeLesson4Station(nodeId, _earnedPoints, overrideStars) {
  const id = Number(nodeId);
  const l4 = getLesson4State();
  const node = L4_NODES.find((n) => n.id === id);
  const rec = getLesson4NodeRecord(id);
  const firstCompletion = !l4.completedNodes.has(id);
  l4.completedNodes.add(id);

  let earnedStars = Number.isInteger(overrideStars) ? Math.min(3, Math.max(1, overrideStars)) : 0;
  if (!earnedStars) {
    if (rec.errors === 0 && rec.assistedSteps.size === 0) earnedStars = 3;
    else if (rec.errors <= 2) earnedStars = 2;
    else earnedStars = 1;
  }
  const prevStars = Number(l4.nodeStars[String(id)] || 0);
  const finalStars = Math.max(prevStars, earnedStars);
  l4.nodeStars[String(id)] = finalStars;

  if (node && node.skillKey && l4.stats && Object.prototype.hasOwnProperty.call(l4.stats, node.skillKey)) {
    l4.stats[node.skillKey] = (l4.stats[node.skillKey] || 0) + 1;
  }

  const nextId = id + 1;
  if (nextId < L4_NODES.length) {
    l4.activeNode = nextId;
    const nextStageIdx = L4_NODES[nextId].stage;
    l4.expandedStages.add(nextStageIdx);
  } else {
    l4.activeNode = id;
  }

  if (typeof saveState === 'function') saveState();
  if (typeof updateHud === 'function') updateHud();
  return {
    wasDone: !firstCompletion,
    firstCompletion,
    earnedStars: finalStars,
    pointsEarned: node ? node.points : 0
  };
}

function openLesson4Node(nodeId, btnEl, opts) {
  const id = Number(nodeId);
  if (typeof stopSpeech === 'function') stopSpeech();
  const node = L4_NODES.find((n) => n.id === id);
  if (!node) return false;
  if (!isLesson4NodeUnlocked(id)) {
    if (typeof sound === 'function') sound(false, 240);
    if (typeof haptic === 'function') haptic(false);
    if (typeof shakeElement === 'function') {
      shakeElement(btnEl || document.querySelector('[data-l4-node-id="' + id + '"]'));
    }
    const prevNode = L4_NODES[id - 1];
    if (typeof guide === 'function') {
      guide('هذه المحطة مقفلة! أكمل «' + (prevNode ? prevNode.title : 'المحطة السابقة') + '» أولًا بالترتيب.', 4500);
    }
    return false;
  }
  const l4 = getLesson4State();
  l4.activeNode = id;
  l4.unlocked = true;
  if (typeof state === 'object' && state) state.mapSubView = 'lesson4';
  if (l4.expandedStages instanceof Set) l4.expandedStages.add(node.stage);
  if (opts && opts.review && isLesson4NodeCompleted(id) && !opts.preserveProgress) {
    resetLesson4NodeRecordForReplay(id);
  }
  if (typeof saveState === 'function') saveState();
  if (window.L1Runner && typeof window.L1Runner.openLesson4Node === 'function') {
    return window.L1Runner.openLesson4Node(id, opts || {});
  }
  return false;
}

function renderLesson4StageMapUnits(unitsRoot) {
  if (!unitsRoot) return;
  if (typeof renderUnifiedStageMapUnits === 'function' && typeof getActiveMapLessonContext === 'function') {
    renderUnifiedStageMapUnits(unitsRoot, getActiveMapLessonContext('lesson4'));
  }
}
