/* Unit 2 (الضرب والقسمة) & Lesson 1 (الضرب الذهني: المضاعفة والتنصيف)
   State Management, Unlock Gate, Unit 2 Curriculum & 11-Station Map (220 pts) */

const UNIT2_CURRICULUM = [
  {
    id: 'u2_project',
    kicker: 'مشروع الوحدة 2',
    kickerCls: 'project',
    title: 'مشروع الوحدة: أبحث وأكتشف (الخطوط والشبكية)',
    sub: 'غلاف الوحدة 2 وطريقتان جديدتان للضرب: الضرب بالخطوط (23 × 13) والطريقة الشبكية (349 × 63)',
    desc: 'تعرّف أهمية الضرب والقسمة في الحياة اليومية (ص 28)، واستكشف تفاعليًا طريقتي «الضرب بالخطوط» و«الطريقة الشبكية» خطوة بخطوة (ص 29).',
    duration: 'تجربتان تفاعليتان',
    points: '25 نقطة',
    kind: 'مشروع الوحدة الثانية التفاعلي (ص 28 - 29)'
  },
  {
    id: 'u2_lesson1',
    isU2Lesson1: true,
    kicker: 'الدرس 1',
    kickerCls: '',
    title: 'الدرس 1: الضرب الذهني',
    sub: 'إيجاد ناتج ضرب أعداد كلية ذهنيًا باستعمال المضاعفة والتنصيف والتجزئة (ص 30 - 33)',
    desc: 'أتعلّم مضاعفة الأعداد وتنصيفها بالتجزئة، ثم استعمال استراتيجية المضاعفة والتنصيف المتتالي لإيجاد ناتج الضرب ذهنيًا عبر 11 محطة تفاعلية ومختبر مستقل.',
    duration: '11 محطة',
    points: '220 نقطة',
    kind: 'درس تفاعلي كامل في الوحدة الثانية',
    unlockReq: 'لفتح «الوحدة 2 · الدرس 1: الضرب الذهني»، اجتز أولاً «اختبار نهاية الوحدة الأولى» (أو فعّل وضع الاختبار للمعلّم).'
  },
  {
    id: 'u2_lesson2_soon',
    isUpcoming: true,
    kicker: 'الدرس 2 · قريبًا',
    kickerCls: '',
    title: 'الدرس 2: تقدير نواتج الضرب',
    sub: 'تقريب الأعداد إلى أعلى منزلة لتقدير نواتج الضرب والتحقق من معقولية الإجابة',
    desc: 'درس قادم ضمن الوحدة الثانية (الضرب والقسمة).',
    duration: 'قريبًا',
    points: 'قريبًا',
    kind: 'درس قادم في الوحدة الثانية',
    unlockReq: 'هذا الدرس قيد الإعداد وسيُضاف قريبًا ضمن مسار الوحدة الثانية.'
  },
  {
    id: 'u2_lesson3_soon',
    isUpcoming: true,
    kicker: 'الدرس 3 · قريبًا',
    kickerCls: '',
    title: 'الدرس 3: الضرب في عدد من منزلة واحدة',
    sub: 'ضرب عدد من 4 منازل على الأكثر في عدد من منزلة واحدة باستخدام نماذج المساحة والخوارزمية',
    desc: 'درس قادم ضمن الوحدة الثانية (الضرب والقسمة).',
    duration: 'قريبًا',
    points: 'قريبًا',
    kind: 'درس قادم في الوحدة الثانية',
    unlockReq: 'هذا الدرس قيد الإعداد وسيُضاف قريبًا ضمن مسار الوحدة الثانية.'
  },
  {
    id: 'u2_lesson4_soon',
    isUpcoming: true,
    kicker: 'الدرس 4 · قريبًا',
    kickerCls: '',
    title: 'الدرس 4: الضرب في عدد من منزلتين',
    sub: 'ضرب عدد من 3 منازل على الأكثر في عدد من منزلتين مع التحقق بالتقدير',
    desc: 'درس قادم ضمن الوحدة الثانية (الضرب والقسمة).',
    duration: 'قريبًا',
    points: 'قريبًا',
    kind: 'درس قادم في الوحدة الثانية',
    unlockReq: 'هذا الدرس قيد الإعداد وسيُضاف قريبًا ضمن مسار الوحدة الثانية.'
  }
];

const U2L1_STAGES = [
  {
    id: 0,
    num: 1,
    cls: 'u1',
    rangeLabel: 'المحطات 1 - 3',
    tag: 'المرحلة 1 · ص 30 - 31',
    title: 'المضاعفة والتنصيف بالتجزئة',
    subtitle: 'أستكشف (8 × 36)، وتعريف المضاعفة والتنصيف، ومثال 1 وأتحقق من فهمي (75، 79، 480، 168)',
    nodeIds: [0, 1, 2]
  },
  {
    id: 1,
    num: 2,
    cls: 'u1',
    rangeLabel: 'المحطات 4 - 5',
    tag: 'المرحلة 2 · ص 31 - 32',
    title: 'الضرب بالمضاعفة والتنصيف',
    subtitle: 'مثال 2 (35 × 16 و15 × 32) وأتحقق من فهمي (28 × 5 و12 × 15) عبر سلسلة ÷ 2 و× 2',
    nodeIds: [3, 4]
  },
  {
    id: 2,
    num: 3,
    cls: 'u2',
    rangeLabel: 'المحطات 6 - 9',
    tag: 'المرحلة 3 · ص 32 - 33',
    title: 'أتدرّب وأحلّ المسائل (1 - 16)',
    subtitle: 'مضاعفة الأعداد (1 - 6)، وتنصيفها (7 - 12)، والضرب بالمضاعفة والتنصيف (13 - 16)',
    nodeIds: [5, 6, 7, 8]
  },
  {
    id: 3,
    num: 4,
    cls: 'u2',
    rangeLabel: 'المحطات 10 - 11',
    tag: 'المرحلة 4 · ص 33 والإتقان',
    title: 'التفكير العليا، أتحدث، وتذكرة الإتقان',
    subtitle: 'بالونات أكتشف المختلف (17)، تبرير القطار (18)، أتحدث، واختبار الإتقان المستقل',
    nodeIds: [9, 10]
  }
];

const U2L1_NODES = [
  {
    id: 0,
    stage: 0,
    kind: 'lesson',
    icon: 'book',
    title: 'أستكشف وأتعلّم: المضاعفة والتنصيف',
    sub: 'سلسلة أستكشف (8 × 36) وتعريف العمليتين العكسيتين وتجزئة العددين 57 و94 (ص 30)',
    cta: 'ابدأ الاكتشاف',
    points: 15,
    skillKey: 'u2l1_concept_split',
    goal: 'أميز بين المضاعفة (× 2) والتنصيف (÷ 2) وأفهم تسهيلهما بتجزئة العدد'
  },
  {
    id: 1,
    stage: 0,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مثال 1 وأتحقق: ضعف العدد بالتجزئة',
    sub: 'مثال ضعف 75 (150)، وتدريب 57، وأتحقق من فهمي 1: ضعف العدد 79 (ص 31)',
    cta: 'ضاعِف بالتجزئة',
    points: 20,
    skillKey: 'u2l1_doubling',
    goal: 'أجد ضعف عدد كلي ذهنيًا بتجزئته وفق القيمة المنزلية ثم ضرب كل جزء في 2'
  },
  {
    id: 2,
    stage: 0,
    kind: 'practice',
    icon: 'sparkles',
    title: 'مثال 1 وأتحقق: نصف العدد بالتجزئة',
    sub: 'مثال نصف 480 (240)، وتدريب 94، وأتحقق من فهمي 2: نصف العدد 168 (ص 31)',
    cta: 'نَصِّف بالتجزئة',
    points: 20,
    skillKey: 'u2l1_halving',
    goal: 'أجد نصف عدد زوجي ذهنيًا بتجزئته ثم قسمة كل جزء على 2 وجمع النواتج'
  },
  {
    id: 3,
    stage: 1,
    kind: 'lesson',
    icon: 'book',
    title: 'مثال 2: سلسلة الضرب الذهني',
    sub: 'مثال 2 (35 × 16 = 560 و15 × 32 = 480) واستمرار التنصيف والمضاعفة (ص 31 - 32)',
    cta: 'جرّب السلسلة',
    points: 20,
    skillKey: 'u2l1_dh_multiply',
    goal: 'أضرب عددين ذهنيًا بتنصيف العدد الزوجي ومضاعفة الآخر خطوة أو أكثر'
  },
  {
    id: 4,
    stage: 1,
    kind: 'practice',
    icon: 'target',
    title: 'أتحقق من فهمي (3 - 4)',
    sub: 'إيجاد ناتج 28 × 5 و12 × 15 ذهنيًا باستعمال المضاعفة والتنصيف (ص 32)',
    cta: 'تحقق من فهمك',
    points: 20,
    skillKey: 'u2l1_dh_multiply',
    goal: 'أطبق المضاعفة والتنصيف للوصول إلى مضاعفات العشرة مثل 14 × 10 و6 × 30'
  },
  {
    id: 5,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أتدرّب (1 - 6): مضاعفة الأعداد ذهنيًا',
    sub: 'إيجاد ضعف الأعداد 34 و45 و58 ثم 330 و250 و490 باستخدام القيمة المنزلية (ص 32)',
    cta: 'ابدأ تمارين الضعف',
    points: 20,
    skillKey: 'u2l1_doubling',
    goal: 'أجد ضعف أعداد من منزلتين وثلاث منازل ذهنيًا بسرعة ودقة'
  },
  {
    id: 6,
    stage: 2,
    kind: 'practice',
    icon: 'target',
    title: 'أتدرّب (7 - 12): تنصيف الأعداد ذهنيًا',
    sub: 'إيجاد نصف الأعداد 90 و36 و44 ثم 270 و550 و390 ذهنيًا (ص 32)',
    cta: 'ابدأ تمارين النصف',
    points: 20,
    skillKey: 'u2l1_halving',
    goal: 'أجد نصف أعداد زوجية من منزلتين وثلاث منازل ذهنيًا بالتجزئة'
  },
  {
    id: 7,
    stage: 2,
    kind: 'practice',
    icon: 'sparkles',
    title: 'أتدرّب (13 - 14): أزواج تصنع المئة',
    sub: 'ضرب 25 × 24 و25 × 16 عبر تحويل 25 إلى 50 ثم 100 بالمضاعفة والتنصيف (ص 33)',
    cta: 'اصنع المئة',
    points: 20,
    skillKey: 'u2l1_dh_multiply',
    goal: 'أستمر في مضاعفة 25 وتنصيف العامل الزوجي حتى أصل إلى الضرب في 100'
  },
  {
    id: 8,
    stage: 2,
    kind: 'practice',
    icon: 'sparkles',
    title: 'أتدرّب (15 - 16): مضاعفات العشرة',
    sub: 'ضرب 28 × 45 و28 × 15 بتنصيف 28 ومضاعفة 45 أو 15 للوصول لمضاعفات 10 (ص 33)',
    cta: 'أكمل التمارين',
    points: 20,
    skillKey: 'u2l1_dh_multiply',
    goal: 'أختار العامل الزوجي للتنصيف والعامل المنتهي بـ 5 للمضاعفة لتسهيل الضرب'
  },
  {
    id: 9,
    stage: 3,
    kind: 'practice',
    icon: 'brain',
    title: 'مهارات التفكير العليا وأتحدث (17 - 18)',
    sub: 'بالونات أكتشف المختلف (29 × 29)، وتبرير قطار الركاب (514 راكبًا)، وقاعدة أتحدث (ص 33)',
    cta: 'ابدأ التفكير العليا',
    points: 25,
    skillKey: 'u2l1_reasoning',
    goal: 'أبرر متى تنجح استراتيجية المضاعفة والتنصيف وأحل مسائل حياتية متعددة الخطوات'
  },
  {
    id: 10,
    stage: 3,
    kind: 'exit_ticket',
    icon: 'trophy',
    title: 'تذكرة الإتقان: الضرب الذهني',
    sub: 'اختبار مستقل لـ 5 مهارات أساسية في المضاعفة والتنصيف دون تلميحات مع تدريب علاجي',
    cta: 'ابدأ التقييم',
    points: 20,
    skillKey: 'u2l1_mastery',
    goal: 'أثبت إتقاني الكامل للضرب الذهني بالمضاعفة والتنصيف دون مساعدة'
  }
];

function createDefaultU2L1State() {
  return {
    activeNode: 0,
    completedNodes: new Set(),
    nodeStars: {},
    expandedStages: new Set([0]),
    records: {},
    stats: {
      u2l1_concept_split: 0,
      u2l1_doubling: 0,
      u2l1_halving: 0,
      u2l1_dh_multiply: 0,
      u2l1_reasoning: 0
    },
    exitTicket: {
      status: 'not_attempted',
      lastScore: 0,
      mastered: false,
      remedialRound: 0,
      unmasteredSkills: []
    },
    exitResults: {}
  };
}

function getU2L1State() {
  if (typeof state !== 'object' || !state) return createDefaultU2L1State();
  if (!state.u2Lesson1 || typeof state.u2Lesson1 !== 'object') {
    state.u2Lesson1 = createDefaultU2L1State();
  }
  const u2 = state.u2Lesson1;
  if (!(u2.completedNodes instanceof Set)) {
    u2.completedNodes = new Set(Array.isArray(u2.completedNodes) ? u2.completedNodes.map(Number).filter(Number.isInteger) : []);
  }
  if (!u2.nodeStars || typeof u2.nodeStars !== 'object') u2.nodeStars = {};
  if (!(u2.expandedStages instanceof Set)) {
    u2.expandedStages = new Set(Array.isArray(u2.expandedStages) && u2.expandedStages.length ? u2.expandedStages.map(Number).filter(Number.isInteger) : [0]);
  }
  if (!u2.records || typeof u2.records !== 'object') u2.records = {};
  if (!u2.stats || typeof u2.stats !== 'object') {
    u2.stats = createDefaultU2L1State().stats;
  }
  if (!u2.exitTicket || typeof u2.exitTicket !== 'object') {
    u2.exitTicket = createDefaultU2L1State().exitTicket;
  }
  if (!u2.exitResults || typeof u2.exitResults !== 'object') u2.exitResults = {};
  return u2;
}

function isUnit2Unlocked() {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  const ex = typeof getUnit1ExamState === 'function' ? getUnit1ExamState() : null;
  if (ex && ex.formal && ex.formal.passed) return true;
  return false;
}

function isU2L1Unlocked() {
  return isUnit2Unlocked();
}

function getU2L1NodeRecord(nodeId) {
  const u2 = getU2L1State();
  const key = String(nodeId);
  if (!u2.records[key] || typeof u2.records[key] !== 'object') {
    u2.records[key] = {
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      data: {}
    };
  }
  const rec = u2.records[key];
  if (!(rec.passed instanceof Set)) rec.passed = new Set(Array.isArray(rec.passed) ? rec.passed.map(Number) : []);
  if (!(rec.assistedSteps instanceof Set)) rec.assistedSteps = new Set(Array.isArray(rec.assistedSteps) ? rec.assistedSteps : []);
  if (!(rec.independentSteps instanceof Set)) rec.independentSteps = new Set(Array.isArray(rec.independentSteps) ? rec.independentSteps : []);
  if (typeof rec.errors !== 'number') rec.errors = Number(rec.errors) || 0;
  if (typeof rec.index !== 'number') rec.index = Number(rec.index) || 0;
  if (!rec.data || typeof rec.data !== 'object') rec.data = {};
  return rec;
}

function resetU2L1NodeRecordForReplay(nodeId) {
  const u2 = getU2L1State();
  const rec = {
    index: 0,
    passed: new Set(),
    assistedSteps: new Set(),
    independentSteps: new Set(),
    errors: 0,
    data: {}
  };
  u2.records[String(nodeId)] = rec;
  if (Number(nodeId) === 10) {
    u2.exitResults = {};
  }
  return rec;
}

function isU2L1NodeCompleted(nodeId) {
  return getU2L1State().completedNodes.has(Number(nodeId));
}

function isU2L1NodeUnlocked(nodeId) {
  const id = Number(nodeId);
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (typeof state === 'object' && state && state.stageBypass) return true;
  if (!isU2L1Unlocked()) return false;
  if (id <= 0) return true;
  return isU2L1NodeCompleted(id - 1) || isU2L1NodeCompleted(id);
}

function currentU2L1Frontier() {
  const u2 = getU2L1State();
  for (let i = 0; i < U2L1_NODES.length; i++) {
    if (!u2.completedNodes.has(i) && isU2L1NodeUnlocked(i)) return i;
  }
  return U2L1_NODES[U2L1_NODES.length - 1].id;
}

function getU2L1DoneCount() {
  return getU2L1State().completedNodes.size;
}

function getU2L1StarsCount() {
  const u2 = getU2L1State();
  let sum = 0;
  U2L1_NODES.forEach((n) => {
    sum += Number(u2.nodeStars[String(n.id)] || (u2.completedNodes.has(n.id) ? 3 : 0));
  });
  return sum;
}

function getU2L1Points() {
  const u2 = getU2L1State();
  let total = 0;
  for (const id of u2.completedNodes) {
    const node = U2L1_NODES.find((n) => n.id === Number(id));
    if (node) total += Number(node.points || 0);
  }
  return total;
}

function getU2L1NodeProgress(nodeId) {
  const id = Number(nodeId);
  const done = isU2L1NodeCompleted(id);
  const rec = getU2L1NodeRecord(id);
  const tot = (typeof U2Lesson1RunnerDefs !== 'undefined' && typeof U2Lesson1RunnerDefs.getStepCount === 'function')
    ? U2Lesson1RunnerDefs.getStepCount(id)
    : 2;
  const passedCount = rec.passed ? rec.passed.size : 0;
  const pct = done ? 100 : (passedCount > 0 ? Math.min(95, Math.round((passedCount / Math.max(1, tot)) * 100)) : 0);
  return {
    cur: done ? tot : passedCount,
    tot,
    pct
  };
}

function getU2L1NodeStars(nodeId) {
  const u2 = getU2L1State();
  const key = String(nodeId);
  if (typeof u2.nodeStars[key] === 'number') return u2.nodeStars[key];
  return u2.completedNodes.has(Number(nodeId)) ? 3 : 0;
}

function completeU2L1Station(nodeId, _earnedPoints, overrideStars) {
  const id = Number(nodeId);
  const u2 = getU2L1State();
  const node = U2L1_NODES.find((n) => n.id === id);
  const rec = getU2L1NodeRecord(id);
  const firstCompletion = !u2.completedNodes.has(id);
  u2.completedNodes.add(id);

  let earnedStars = Number.isInteger(overrideStars) ? Math.min(3, Math.max(1, overrideStars)) : 0;
  if (!earnedStars) {
    if (rec.errors === 0 && rec.assistedSteps.size === 0) earnedStars = 3;
    else if (rec.errors <= 2) earnedStars = 2;
    else earnedStars = 1;
  }
  const prevStars = Number(u2.nodeStars[String(id)] || 0);
  const finalStars = Math.max(prevStars, earnedStars);
  u2.nodeStars[String(id)] = finalStars;

  if (node && node.skillKey && u2.stats && Object.prototype.hasOwnProperty.call(u2.stats, node.skillKey)) {
    u2.stats[node.skillKey] = (u2.stats[node.skillKey] || 0) + 1;
  }

  const nextId = id + 1;
  if (nextId < U2L1_NODES.length) {
    u2.activeNode = nextId;
    const nextStageIdx = U2L1_NODES[nextId].stage;
    u2.expandedStages.add(nextStageIdx);
  } else {
    u2.activeNode = id;
  }

  if (typeof saveState === 'function') saveState();
  if (typeof renderHUD === 'function') renderHUD();
  return {
    wasDone: !firstCompletion,
    firstCompletion,
    earnedStars: finalStars,
    pointsEarned: node ? node.points : 0
  };
}

function openU2L1Node(nodeId, btnEl, opts) {
  const id = Number(nodeId);
  if (typeof stopSpeech === 'function') stopSpeech();
  const node = U2L1_NODES.find((n) => n.id === id);
  if (!node) return false;
  if (!isU2L1NodeUnlocked(id)) {
    if (typeof sound === 'function') sound(false, 240);
    if (typeof haptic === 'function') haptic(false);
    if (typeof shakeElement === 'function') {
      shakeElement(btnEl || document.querySelector('[data-u2l1-node-id="' + id + '"]'));
    }
    const prevNode = U2L1_NODES[id - 1];
    if (typeof guide === 'function') {
      guide(
        !isUnit2Unlocked()
          ? 'الوحدة الثانية مقفلة! اجتز اختبار نهاية الوحدة الأولى أولاً لفتح الدرس.'
          : 'هذه المحطة مقفلة! أكمل «' + (prevNode ? prevNode.title : 'المحطة السابقة') + '» أولًا بالترتيب.',
        4500
      );
    }
    return false;
  }
  const u2 = getU2L1State();
  u2.activeNode = id;
  if (typeof state === 'object' && state) {
    state.mapSubView = 'u2_lesson1';
    state.lastActiveLesson = 'u2_lesson1';
  }
  if (u2.expandedStages instanceof Set) u2.expandedStages.add(node.stage);
  if (opts && opts.review && isU2L1NodeCompleted(id) && !opts.preserveProgress) {
    resetU2L1NodeRecordForReplay(id);
  }
  if (typeof saveState === 'function') saveState();
  if (window.L1Runner && typeof window.L1Runner.openU2L1Node === 'function') {
    return window.L1Runner.openU2L1Node(id, opts || {});
  }
  return false;
}

function renderU2L1StageMapUnits(unitsRoot) {
  if (!unitsRoot) return;
  if (typeof renderUnifiedStageMapUnits === 'function' && typeof getActiveMapLessonContext === 'function') {
    renderUnifiedStageMapUnits(unitsRoot, getActiveMapLessonContext('u2_lesson1'));
  }
}
