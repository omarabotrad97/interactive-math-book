/* Lesson 5: خطة حل المسألة: أنشئ جدولاً — Map Stages, 10 Stations (180 pts) & State Management */

const L5_STAGES = [
  {
    id: 0,
    num: 1,
    cls: 'u1',
    rangeLabel: 'المحطات 1 - 3',
    tag: 'المرحلة 1 · ص 24',
    title: 'مسألة مهند: الخطوات الأربع',
    subtitle: 'أفهم وأخطط وأحل وأتحقق في مسألة 24 كرة زجاجية (كل 1 خضراء يقابلها 3 حمراء)',
    nodeIds: [0, 1, 2]
  },
  {
    id: 1,
    num: 2,
    cls: 'u1',
    rangeLabel: 'المحطات 4 - 5',
    tag: 'المرحلة 2 · ص 25',
    title: 'أتدرّب (1–2): النِّسَب والتنسيقات',
    subtitle: 'جدول باقة زهور لمياء (36 زهرة) وجدول تنسيق قمصان مازن وربطات العنق',
    nodeIds: [3, 4]
  },
  {
    id: 2,
    num: 3,
    cls: 'u2',
    rangeLabel: 'المحطات 6 - 8',
    tag: 'المرحلة 3 · ص 25',
    title: 'أتدرّب (3–4): النقود والأزواج والتدقيق',
    subtitle: 'آلة القهوة (50 قرشًا)، لعبة القفز بالحبل (6 طرق)، واكتشاف أخطاء الجداول',
    nodeIds: [5, 6, 7]
  },
  {
    id: 3,
    num: 4,
    cls: 'u2',
    rangeLabel: 'المحطات 9 - 10',
    tag: 'المرحلة 4 · التطبيق والإتقان',
    title: 'تطبيقات حياتية وتذكرة الإتقان',
    subtitle: 'استكشاف جداول جديدة خطوة بخطوة + اختبار مستقل لـ 5 مهارات في خطة أنشئ جدولاً',
    nodeIds: [8, 9]
  }
];

const L5_NODES = [
  {
    id: 0,
    stage: 0,
    kind: 'lesson',
    icon: 'book',
    title: 'مسألة مهند: أفهم وأخطط',
    sub: 'تحديد المعطيات والمطلوب وقاعدة الجدول لمسألة 24 كرة زجاجية (ص 24)',
    cta: 'ابدأ الفهم والتخطيط',
    points: 15,
    skillKey: 'l5_understand_plan',
    goal: 'أحدد معطيات المسألة والمطلوب فيها وأختار خطة إنشاء جدول منظم'
  },
  {
    id: 1,
    stage: 0,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مسألة مهند: أنشئ الجدول',
    sub: 'إكمال جدول الكرات الخضراء والحمراء والمجموع خطوة بخطوة حتى 24 (ص 24)',
    cta: 'أنشئ الجدول',
    points: 20,
    skillKey: 'l5_ratio_table',
    goal: 'أنظم البيانات في جدول متدرج حتى أصل إلى المجموع المطلوب 24 كرة'
  },
  {
    id: 2,
    stage: 0,
    kind: 'lesson',
    icon: 'book',
    title: 'مسألة مهند: أتحقق من الحل',
    sub: 'فحص صحة النتيجة بالضرب 6 × 3 = 18 والجمع 6 + 18 = 24 (ص 24)',
    cta: 'تحقق من الحل',
    points: 15,
    skillKey: 'l5_understand_plan',
    goal: 'أتحقق من معقولية الحل وصحته باستخدام عمليتي الضرب والجمع'
  },
  {
    id: 3,
    stage: 1,
    kind: 'practice',
    icon: 'target',
    title: 'باقة زهور لمياء (36 زهرة)',
    sub: 'مقابل كل 1 زهرة صفراء توجد 8 حمراء — إيجاد عدد الزهور الحمراء بالجدول (ص 25)',
    cta: 'أنشئ جدول الزهور',
    points: 20,
    skillKey: 'l5_ratio_table',
    goal: 'أجد عدد الزهرات الحمراء في الباقة بإكمال جدول النسبة والمجموع'
  },
  {
    id: 4,
    stage: 1,
    kind: 'practice',
    icon: 'target',
    title: 'ملابس مازن (القمصان والربطات)',
    sub: '3 قمصان و4 ربطات عنق — حساب جميع طرق التنسيق بجدول منظم (ص 25)',
    cta: 'نسّق الملابس',
    points: 20,
    skillKey: 'l5_combinations_grid',
    goal: 'أحسب عدد الطرق المختلفة لارتداء قميص وربطة عنق معًا عبر جدول منظم'
  },
  {
    id: 5,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'آلة بيع القهوة (50 قرشًا)',
    sub: 'تنظيم قطع فئة 10 قروش وفئة 5 قروش لتكوين مبلغ 50 قرشًا (ص 25)',
    cta: 'نظّم القطع النقدية',
    points: 20,
    skillKey: 'l5_coin_table',
    goal: 'أجد جميع المجموعات الممكنة من فئتي 10 و5 قروش التي تساوي 50 قرشًا'
  },
  {
    id: 6,
    stage: 2,
    kind: 'practice',
    icon: 'sparkles',
    title: 'لعبة القفز بالحبل (6 طرق)',
    sub: 'ريما ولانا وسحر وديمة — حصر أزواج الإمساك والقفز بانتظام ودون تكرار (ص 25)',
    cta: 'احصر البدائل',
    points: 20,
    skillKey: 'l5_pairing_list',
    goal: 'أكتب جميع البدائل الممكنة للفتاتين اللتين تمسكان الحبل واللتين تقفزان'
  },
  {
    id: 7,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أكتشف الخطأ وأبرّر الخطة',
    sub: 'فحص أخطاء ملء الجداول وتفسير سبب منع تكرار الأزواج المتماثلة',
    cta: 'دقّق الجداول',
    points: 15,
    skillKey: 'l5_pairing_list',
    goal: 'أميز بين القيم الصحيحة في الجداول والأخطاء الشائعة عند إنشاء البدائل'
  },
  {
    id: 8,
    stage: 3,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مصمّم جداول المسائل الحياتية',
    sub: 'بناء جداول لمواقف حياتية جديدة خطوة بخطوة والتحقق من كل حل',
    cta: 'صمّم جدولك',
    points: 15,
    skillKey: 'l5_understand_plan',
    goal: 'أطبّق خطة أنشئ جدولاً على مسائل حياتية جديدة وأتحقق من النتيجة'
  },
  {
    id: 9,
    stage: 3,
    kind: 'exit_ticket',
    icon: 'trophy',
    title: 'تذكرة الإتقان: أنشئ جدولاً',
    sub: 'اختبار مستقل لـ 5 مهارات أساسية في استراتيجية إنشاء جدول دون تلميحات',
    cta: 'ابدأ التقييم',
    points: 20,
    skillKey: 'l5_mastery',
    goal: 'أثبت إتقاني الكامل لإنشاء الجداول واستخلاص الحلول والتحقق منها'
  }
];

function createDefaultLesson5State() {
  return {
    activeNode: 0,
    completedNodes: new Set(),
    nodeStars: {},
    expandedStages: new Set([0]),
    records: {},
    stats: {
      l5_understand_plan: 0,
      l5_ratio_table: 0,
      l5_combinations_grid: 0,
      l5_coin_table: 0,
      l5_pairing_list: 0
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

function getLesson5State() {
  if (typeof state !== 'object' || !state) return createDefaultLesson5State();
  if (!state.lesson5 || typeof state.lesson5 !== 'object') {
    state.lesson5 = createDefaultLesson5State();
  }
  const l5 = state.lesson5;
  if (!(l5.completedNodes instanceof Set)) {
    l5.completedNodes = new Set(Array.isArray(l5.completedNodes) ? l5.completedNodes.map(Number).filter(Number.isInteger) : []);
  }
  if (!l5.nodeStars || typeof l5.nodeStars !== 'object') l5.nodeStars = {};
  if (!(l5.expandedStages instanceof Set)) {
    l5.expandedStages = new Set(Array.isArray(l5.expandedStages) && l5.expandedStages.length ? l5.expandedStages.map(Number).filter(Number.isInteger) : [0]);
  }
  if (!l5.records || typeof l5.records !== 'object') l5.records = {};
  if (!l5.exitTicket || typeof l5.exitTicket !== 'object') {
    l5.exitTicket = createDefaultLesson5State().exitTicket;
  }
  if (!l5.exitResults || typeof l5.exitResults !== 'object') l5.exitResults = {};
  if (l5.unlocked === undefined) l5.unlocked = true;
  return l5;
}

function isLesson5Unlocked() {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  const l5 = getLesson5State();
  if (l5.unlocked) return true;
  if (typeof isLesson4NodeCompleted === 'function' && isLesson4NodeCompleted(13)) return true;
  return false;
}

function getLesson5NodeRecord(nodeId) {
  const l5 = getLesson5State();
  const key = String(nodeId);
  if (!l5.records[key] || typeof l5.records[key] !== 'object') {
    l5.records[key] = {
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      data: {}
    };
  }
  const rec = l5.records[key];
  if (!(rec.passed instanceof Set)) rec.passed = new Set(Array.isArray(rec.passed) ? rec.passed.map(Number) : []);
  if (!(rec.assistedSteps instanceof Set)) rec.assistedSteps = new Set(Array.isArray(rec.assistedSteps) ? rec.assistedSteps : []);
  if (!(rec.independentSteps instanceof Set)) rec.independentSteps = new Set(Array.isArray(rec.independentSteps) ? rec.independentSteps : []);
  if (typeof rec.errors !== 'number') rec.errors = Number(rec.errors) || 0;
  if (typeof rec.index !== 'number') rec.index = Number(rec.index) || 0;
  if (!rec.data || typeof rec.data !== 'object') rec.data = {};
  return rec;
}

function resetLesson5NodeRecordForReplay(nodeId) {
  const l5 = getLesson5State();
  const rec = {
    index: 0,
    passed: new Set(),
    assistedSteps: new Set(),
    independentSteps: new Set(),
    errors: 0,
    data: {}
  };
  l5.records[String(nodeId)] = rec;
  if (Number(nodeId) === 9) {
    l5.exitResults = {};
  }
  return rec;
}

function isLesson5NodeCompleted(nodeId) {
  return getLesson5State().completedNodes.has(Number(nodeId));
}

function isLesson5NodeUnlocked(nodeId) {
  const id = Number(nodeId);
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  if (!isLesson5Unlocked()) return false;
  if (id <= 0) return true;
  return isLesson5NodeCompleted(id - 1) || isLesson5NodeCompleted(id);
}

function currentLesson5Frontier() {
  const l5 = getLesson5State();
  for (let i = 0; i < L5_NODES.length; i++) {
    if (!l5.completedNodes.has(i) && isLesson5NodeUnlocked(i)) return i;
  }
  return L5_NODES[L5_NODES.length - 1].id;
}

function getLesson5DoneCount() {
  return getLesson5State().completedNodes.size;
}

function getLesson5StarsCount() {
  const l5 = getLesson5State();
  let sum = 0;
  L5_NODES.forEach((n) => {
    sum += Number(l5.nodeStars[String(n.id)] || (l5.completedNodes.has(n.id) ? 3 : 0));
  });
  return sum;
}

function getLesson5Points() {
  const l5 = getLesson5State();
  let total = 0;
  for (const id of l5.completedNodes) {
    const node = L5_NODES.find((n) => n.id === Number(id));
    if (node) total += Number(node.points || 0);
  }
  return total;
}

function getLesson5NodeProgress(nodeId) {
  const id = Number(nodeId);
  const done = isLesson5NodeCompleted(id);
  const rec = getLesson5NodeRecord(id);
  const tot = (typeof Lesson5RunnerDefs !== 'undefined' && typeof Lesson5RunnerDefs.getStepCount === 'function')
    ? Lesson5RunnerDefs.getStepCount(id)
    : 2;
  const passedCount = rec.passed ? rec.passed.size : 0;
  const pct = done ? 100 : (passedCount > 0 ? Math.min(95, Math.round((passedCount / Math.max(1, tot)) * 100)) : 0);
  return {
    cur: done ? tot : passedCount,
    tot,
    pct
  };
}

function getLesson5NodeStars(nodeId) {
  const l5 = getLesson5State();
  const key = String(nodeId);
  if (typeof l5.nodeStars[key] === 'number') return l5.nodeStars[key];
  return l5.completedNodes.has(Number(nodeId)) ? 3 : 0;
}

function completeLesson5Station(nodeId, _earnedPoints, overrideStars) {
  const id = Number(nodeId);
  const l5 = getLesson5State();
  const node = L5_NODES.find((n) => n.id === id);
  const rec = getLesson5NodeRecord(id);
  const firstCompletion = !l5.completedNodes.has(id);
  l5.completedNodes.add(id);

  let earnedStars = Number.isInteger(overrideStars) ? Math.min(3, Math.max(1, overrideStars)) : 0;
  if (!earnedStars) {
    if (rec.errors === 0 && rec.assistedSteps.size === 0) earnedStars = 3;
    else if (rec.errors <= 2) earnedStars = 2;
    else earnedStars = 1;
  }
  const prevStars = Number(l5.nodeStars[String(id)] || 0);
  const finalStars = Math.max(prevStars, earnedStars);
  l5.nodeStars[String(id)] = finalStars;

  if (node && node.skillKey && l5.stats && Object.prototype.hasOwnProperty.call(l5.stats, node.skillKey)) {
    l5.stats[node.skillKey] = (l5.stats[node.skillKey] || 0) + 1;
  }

  const nextId = id + 1;
  if (nextId < L5_NODES.length) {
    l5.activeNode = nextId;
    const nextStageIdx = L5_NODES[nextId].stage;
    l5.expandedStages.add(nextStageIdx);
  } else {
    l5.activeNode = id;
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

function openLesson5Node(nodeId, btnEl, opts) {
  const id = Number(nodeId);
  if (typeof stopSpeech === 'function') stopSpeech();
  const node = L5_NODES.find((n) => n.id === id);
  if (!node) return false;
  if (!isLesson5NodeUnlocked(id)) {
    if (typeof sound === 'function') sound(false, 240);
    if (typeof haptic === 'function') haptic(false);
    if (typeof shakeElement === 'function') {
      shakeElement(btnEl || document.querySelector('[data-l5-node-id="' + id + '"]'));
    }
    const prevNode = L5_NODES[id - 1];
    if (typeof guide === 'function') {
      guide('هذه المحطة مقفلة! أكمل «' + (prevNode ? prevNode.title : 'المحطة السابقة') + '» أولًا بالترتيب.', 4500);
    }
    return false;
  }
  const l5 = getLesson5State();
  l5.activeNode = id;
  l5.unlocked = true;
  if (typeof state === 'object' && state) state.mapSubView = 'lesson5';
  if (l5.expandedStages instanceof Set) l5.expandedStages.add(node.stage);
  if (opts && opts.review && isLesson5NodeCompleted(id) && !opts.preserveProgress) {
    resetLesson5NodeRecordForReplay(id);
  }
  if (typeof saveState === 'function') saveState();
  if (window.L1Runner && typeof window.L1Runner.openLesson5Node === 'function') {
    return window.L1Runner.openLesson5Node(id, opts || {});
  }
  return false;
}

function renderLesson5StageMapUnits(unitsRoot) {
  if (!unitsRoot) return;
  if (typeof renderUnifiedStageMapUnits === 'function' && typeof getActiveMapLessonContext === 'function') {
    renderUnifiedStageMapUnits(unitsRoot, getActiveMapLessonContext('lesson5'));
  }
}
