/* Lesson 2: Stages, Nodes, State, Map Rendering, Hints & Mobile Focus Layout */

/* ==========================================================================
   LESSON 2 FULL SCRIPT BUNDLE
   ========================================================================== */
/* ==========================================================================
   LESSON 2 JAVASCRIPT ENGINE & CURRICULUM DEFINITIONS
   Covers 5 Stages, 15 Stations, Number Comparison Lab, Hints, Audio & Mastery
   ========================================================================== */

const L2_STAGES = [
  {
    id: 0,
    num: 1,
    title: 'أكتشف المقارنة',
    rangeLabel: 'المحطات 1-3',
    sub: 'رحلة أعداد الحجاج، ومقارنة أول منزلة، ولوحة المنازل المزدوجة',
    nodeIds: [0, 1, 2],
    cls: 'stage-1'
  },
  {
    id: 1,
    num: 2,
    title: 'أفهم رموز المقارنة',
    rangeLabel: 'المحطات 4-6',
    sub: 'مختبر الرموز (> ، < ، =)، وتحدي المقارنة، وتشخيص أسباب المقارنة',
    nodeIds: [3, 4, 5],
    cls: 'stage-2'
  },
  {
    id: 2,
    num: 3,
    title: 'أرتب الأعداد',
    rangeLabel: 'المحطات 7-9',
    sub: 'سياح الأردن (تنازليًا)، والترتيب التصاعدي، وملعب ترتيب الأعداد التفاعلي',
    nodeIds: [6, 7, 8],
    cls: 'stage-3'
  },
  {
    id: 3,
    num: 4,
    title: 'أتدرب وأطبق',
    rangeLabel: 'المحطات 10-12',
    sub: 'الأرقام المفقودة متعددة الحلول، والصيغ المختلفة، ومساحات محيطات العالم',
    nodeIds: [9, 10, 11],
    cls: 'stage-4'
  },
  {
    id: 4,
    num: 5,
    title: 'أفكر وأتقن',
    rangeLabel: 'المحطات 13-15',
    sub: 'اكتشاف الأنماط، ومهارات التفكير العليا، وتحدي الإتقان النهائي وبطاقة الخروج',
    nodeIds: [12, 13, 14],
    cls: 'stage-5'
  }
];

const L2_NODES = [
  {
    id: 0,
    stageId: 0,
    type: 'l2_station',
    icon: 'table',
    tag: 'استكشاف وحياة',
    title: '1. رحلة أعداد الحجاج',
    sub: 'جدول حجاج بيت الله الحرام 2015-2019 واكتشاف العام الأكبر',
    skill: 'explore_hajj',
    points: 15
  },
  {
    id: 1,
    stageId: 0,
    type: 'l2_station',
    icon: 'target',
    tag: 'توقع واكتشاف',
    title: '2. أي العددين أكبر؟',
    sub: 'مقارنة 3456210 و3759120 وتلوين أول رقم مختلف',
    skill: 'first_difference',
    points: 15
  },
  {
    id: 2,
    stageId: 0,
    type: 'l2_station',
    icon: 'numbers',
    tag: 'لوحة تفاعلية',
    title: '3. لوحة المقارنة المنزلية',
    sub: 'فحص المنازل بالتتابع من اليسار والتوقف عند الاختلاف الحاسم',
    skill: 'place_board_compare',
    points: 15
  },
  {
    id: 3,
    stageId: 1,
    type: 'l2_station',
    icon: 'sparkle',
    tag: 'مختبر الرموز',
    title: '4. مختبر الرموز (> ، < ، =)',
    sub: 'اتجاه فتحة الرمز وتفسير علاقة أكبر وأصغر ويساوي بدقة',
    skill: 'symbols_lab',
    points: 15
  },
  {
    id: 4,
    stageId: 1,
    type: 'l2_station',
    icon: 'rocket',
    tag: 'تحدٍّ سريع',
    title: '5. أتحدى نفسي في المقارنة',
    sub: 'ستة أزواج أعداد من الكتاب بمنازل مختلفة ومتساوية',
    skill: 'compare_challenge',
    points: 15
  },
  {
    id: 5,
    stageId: 1,
    type: 'l2_station',
    icon: 'search',
    tag: 'تشخيص وتفسير',
    title: '6. اكتشف سبب المقارنة',
    sub: 'تحديد قاعدة المقارنة وتصحيح الأخطاء المفاهيمية',
    skill: 'compare_reason',
    points: 15
  },
  {
    id: 6,
    stageId: 2,
    type: 'l2_station',
    icon: 'city',
    tag: 'ترتيب تنازلي',
    title: '7. أعداد السياح في الأردن',
    sub: 'ترتيب أعداد السياح للأعوام 2017-2019 تنازليًا من الأكبر للأصغر',
    skill: 'order_descending',
    points: 15
  },
  {
    id: 7,
    stageId: 2,
    type: 'l2_station',
    icon: 'bridge',
    tag: 'ترتيب تصاعدي',
    title: '8. الترتيب التصاعدي',
    sub: 'ترتيب أعداد من 8 منازل من الأصغر إلى الأكبر بحركة بصرية',
    skill: 'order_ascending',
    points: 15
  },
  {
    id: 8,
    stageId: 2,
    type: 'l2_station',
    icon: 'hand',
    tag: 'ملعب تفاعلي',
    title: '9. ملعب ترتيب الأعداد',
    sub: 'سحب البطاقات، التبديل بين التصاعدي والتنازلي، ومقارنة المتجاورين',
    skill: 'ordering_playground',
    points: 15
  },
  {
    id: 9,
    stageId: 3,
    type: 'l2_station',
    icon: 'puzzle',
    tag: 'تفكير رياضي',
    title: '10. الرقم المفقود',
    sub: 'إكمال الخانة المفقودة وقبول جميع الإجابات الصحيحة رياضيًا',
    skill: 'missing_digit',
    points: 15
  },
  {
    id: 10,
    stageId: 3,
    type: 'l2_station',
    icon: 'book',
    tag: 'ربط المفاهيم',
    title: '11. أرتب أعدادًا بصيغ مختلفة',
    sub: 'تحويل الصيغ التحليلية واللفظية والقياسية وترتيبها تصاعديًا',
    skill: 'forms_ordering',
    points: 15
  },
  {
    id: 11,
    stageId: 3,
    type: 'l2_station',
    icon: 'eye',
    tag: 'علوم وجغرافيا',
    title: '12. محيطات العالم',
    sub: 'مقارنة مساحات المحيط الهادئ والأطلسي والهندي بمخطط بياني دقيق',
    skill: 'oceans_comparison',
    points: 15
  },
  {
    id: 12,
    stageId: 4,
    type: 'l2_station',
    icon: 'sparkle',
    tag: 'اكتشاف الأنماط',
    title: '13. اكتشاف الأنماط',
    sub: 'إكمال المتتاليات العددية والربط بين اتجاه النمط وترتيب الأعداد',
    skill: 'patterns_discovery',
    points: 15
  },
  {
    id: 13,
    stageId: 4,
    type: 'l2_station',
    icon: 'brain',
    tag: 'تفكير عليا',
    title: '14. مهارات التفكير العليا',
    sub: 'مسألة مفتوحة بمجال مفتوح، اكتشاف خطأ عبد الله، وتبرير المقارنة من اليسار',
    skill: 'higher_order',
    points: 15
  },
  {
    id: 14,
    stageId: 4,
    type: 'l2_station',
    icon: 'trophy',
    tag: 'تقييم الإتقان',
    title: '15. تحدي الإتقان وبطاقة الخروج',
    sub: 'تقييم مستقل شامل لجميع مهارات الدرس الثاني مع مسارات علاجية',
    skill: 'mastery_exit_ticket',
    points: 40
  }
];

function createDefaultLesson2State() {
  return {
    activeNode: 0,
    completedNodes: new Set(),
    nodeStars: {},
    expandedStages: new Set([0]),
    records: {},
    unlocked: false,
    stats: {
      compare_count: 0,
      symbols_count: 0,
      order_count: 0,
      patterns_count: 0,
      higher_count: 0
    },
    exitTicket: {
      status: 'not_attempted',
      lastScore: 0,
      history: [],
      skillsMatrix: {}
    }
  };
}

// In-memory speech token for Lesson 2 to prevent audio overlaps
let cmpSpeechToken = 0;

function playComparisonStepAudio(text, onEnded) {
  if (typeof stopSpeech === 'function') stopSpeech();
  const token = ++cmpSpeechToken;
  if (!text || state.muted) {
    if (onEnded) setTimeout(() => { if (token === cmpSpeechToken) onEnded(); }, 400);
    return;
  }
  if ('speechSynthesis' in window) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = 0.95;
      const v = (speechSynthesis.getVoices() || []).find(x => x.lang && x.lang.toLowerCase().startsWith('ar'));
      if (v) u.voice = v;
      u.onend = () => { if (token === cmpSpeechToken && onEnded) onEnded(); };
      u.onerror = () => { if (token === cmpSpeechToken && onEnded) onEnded(); };
      speechSynthesis.speak(u);
      return;
    } catch {}
  }
  if (onEnded) setTimeout(() => { if (token === cmpSpeechToken) onEnded(); }, 1200);
}

function getLesson2State() {
  if (!state.lesson2) state.lesson2 = createDefaultLesson2State();
  if (Array.isArray(state.lesson2.completedNodes)) {
    state.lesson2.completedNodes = new Set(state.lesson2.completedNodes);
  } else if (!(state.lesson2.completedNodes instanceof Set)) {
    state.lesson2.completedNodes = new Set();
  }
  if (!state.lesson2.nodeStars || typeof state.lesson2.nodeStars !== 'object') {
    state.lesson2.nodeStars = {};
  }
  if (Array.isArray(state.lesson2.expandedStages)) {
    state.lesson2.expandedStages = new Set(state.lesson2.expandedStages);
  } else if (!(state.lesson2.expandedStages instanceof Set)) {
    const frontier = L2_NODES.findIndex((_, idx) => !state.lesson2.completedNodes.has(idx));
    const curId = frontier >= 0 ? frontier : L2_NODES.length - 1;
    const st = L2_STAGES.find(s => s.nodeIds.includes(curId)) || L2_STAGES[0];
    state.lesson2.expandedStages = new Set([st.id]);
  }
  if (!state.lesson2.records || typeof state.lesson2.records !== 'object') {
    state.lesson2.records = {};
  }
  if (!state.lesson2.stats || typeof state.lesson2.stats !== 'object') {
    state.lesson2.stats = { compare_count: 0, symbols_count: 0, order_count: 0, patterns_count: 0, higher_count: 0 };
  }
  return state.lesson2;
}

function getLesson2NodeRecord(nodeId) {
  const l2 = getLesson2State();
  const key = String(nodeId);
  if (!l2.records[key] || typeof l2.records[key] !== 'object') {
    l2.records[key] = {
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      data: {}
    };
  }
  const r = l2.records[key];
  if (!(r.passed instanceof Set)) r.passed = new Set(Array.isArray(r.passed) ? r.passed : []);
  if (!(r.assistedSteps instanceof Set)) r.assistedSteps = new Set(Array.isArray(r.assistedSteps) ? r.assistedSteps : []);
  if (!(r.independentSteps instanceof Set)) r.independentSteps = new Set(Array.isArray(r.independentSteps) ? r.independentSteps : []);
  if (!r.data || typeof r.data !== 'object') r.data = {};
  return r;
}

function resetLesson2NodeRecordForReplay(nodeId) {
  const l2 = getLesson2State();
  const key = String(nodeId);
  l2.records[key] = {
    index: 0,
    passed: new Set(),
    assistedSteps: new Set(),
    independentSteps: new Set(),
    errors: 0,
    data: {}
  };
  if (nodeId === 14) {
    l2.exitTicket = {
      ...(l2.exitTicket || {}),
      currentAnswers: {},
      remedialRound: 0
    };
  }
}

function getLesson2NodeProgress(nodeId) {
  const tot = (typeof Lesson2RunnerDefs !== 'undefined' && typeof Lesson2RunnerDefs.getStepCount === 'function')
    ? Math.max(1, Lesson2RunnerDefs.getStepCount(nodeId))
    : 1;
  if (isLesson2NodeCompleted(nodeId)) return { cur: tot, tot, pct: 100 };
  const rec = getLesson2NodeRecord(nodeId);
  const done = Math.min(tot, rec.passed ? rec.passed.size : 0);
  if (done > 0) return { cur: done, tot, pct: Math.round((done / tot) * 100) };
  const isFront = nodeId === currentLesson2Frontier();
  return { cur: 0, tot, pct: isFront ? 12 : 0 };
}

function getLesson2NodeStars(nodeId) {
  if (!isLesson2NodeCompleted(nodeId)) return 0;
  const l2 = getLesson2State();
  if (l2.nodeStars && typeof l2.nodeStars[nodeId] === 'number') {
    return Math.min(3, Math.max(1, l2.nodeStars[nodeId]));
  }
  return 3;
}

function getLesson2DoneCount() {
  const l2 = getLesson2State();
  return l2.completedNodes ? l2.completedNodes.size : 0;
}

function getLesson2Points() {
  const l2 = getLesson2State();
  let pts = 0;
  if (l2.completedNodes) {
    l2.completedNodes.forEach(id => {
      const node = L2_NODES[id];
      if (node) pts += node.points || 15;
    });
  }
  return pts;
}

function isLesson2Unlocked() {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  const l2 = getLesson2State();
  if (l2 && l2.unlocked) return true;
  // Mastery of Lesson 1 detected by any valid indicator
  if (state.finished) return true;
  if (state.completed && state.completed.size >= 12) return true;
  if (state.nodesCompleted && (state.nodesCompleted.has(19) || state.nodesCompleted.has(20) || state.nodesCompleted.size >= 10)) return true;
  if (state.exitTicket && (state.exitTicket.status === 'completed' || state.exitTicket.lastScore > 0)) return true;
  if (typeof isNodeCompleted === 'function' && typeof PATH_NODES !== 'undefined') {
    const l1Done = PATH_NODES.filter(n => isNodeCompleted(n.id)).length;
    if (l1Done >= 10) return true;
  }
  return false;
}

function isLesson2NodeCompleted(nodeId) {
  const l2 = getLesson2State();
  return l2.completedNodes ? l2.completedNodes.has(nodeId) : false;
}

function isLesson2NodeUnlocked(nodeId) {
  if (typeof testModeEnabled !== 'undefined' && testModeEnabled) return true;
  if (nodeId <= 0) return true;
  return isLesson2NodeCompleted(nodeId - 1) || isLesson2NodeCompleted(nodeId);
}

function currentLesson2Frontier() {
  for (let i = 0; i < L2_NODES.length; i++) {
    if (!isLesson2NodeCompleted(i)) return i;
  }
  return L2_NODES.length - 1;
}

/* ==========================================================================
   LESSON 2 MAP RENDERING (Stages & Nodes)
   ========================================================================== */
function renderLesson2StageMapUnits(unitsRoot) {
  if (typeof renderUnifiedStageMapUnits === 'function' && typeof getActiveMapLessonContext === 'function') {
    renderUnifiedStageMapUnits(unitsRoot, getActiveMapLessonContext('lesson2'));
  }
}


/* ==========================================================================
   LESSON 2 ACTIVITIES & INTERACTIVE LOGIC (STATIONS 1 TO 15)
   ========================================================================== */

const L2_HAJJ_DATA = [
  { year: 2015, count: 1390666, words: 'مليون وثلاثمئة وتسعون ألفاً وستمئة وستة وستون' },
  { year: 2016, count: 1325471, words: 'مليون وثلاثمئة وخمسة وعشرون ألفاً وأربعمئة وواحد وسبعون' },
  { year: 2017, count: 1755250, words: 'مليون وسبعمئة وخمسة وخمسون ألفاً ومئتان وخمسون' },
  { year: 2018, count: 1760513, words: 'مليون وسبعمئة وستون ألفاً وخمسمئة وثلاثة عشر' },
  { year: 2019, count: 1855836, words: 'مليون وثمانمئة وخمسة وخمسون ألفاً وثمانمئة وستة وثلاثون' }
];

const L2_TOURISTS_DATA = [
  { year: 2017, count: 4565158, words: 'أربعة ملايين وخمسمئة وخمسة وستون ألفاً ومئة وثمانية وخمسون' },
  { year: 2018, count: 4922169, words: 'أربعة ملايين وتسعمئة واثنان وعشرون ألفاً ومئة وتسعة وستون' },
  { year: 2019, count: 4962144, words: 'أربعة ملايين وتسعمئة واثنان وستون ألفاً ومئة وأربعة وأربعون' }
];

const L2_OCEANS_DATA = [
  { name: 'المحيط الأطلسي', area: 85133000, pct: 50.5 },
  { name: 'المحيط الهندي', area: 70560000, pct: 41.8 },
  { name: 'المحيط الهادئ', area: 168723000, pct: 100 }
];

// Current station in-memory runtime state
let l2CurrentStation = 0;
let l2StationState = {};

function enableLesson2CardDragging(list, items, rerender) {
  if (!list || !Array.isArray(items)) return;
  list.querySelectorAll('.l2-order-card').forEach(card => {
    card.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target.closest('.l2-move-btn')) return;
      const from = Number(card.dataset.idx), pointerId = event.pointerId;
      const startX = event.clientX, startY = event.clientY, rect = card.getBoundingClientRect();
      let to = from, dragging = false, ghost = null;
      event.preventDefault();
      card.classList.add('l2-card-grabbed');
      const move = e => {
        if (e.pointerId !== pointerId) return;
        if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) < 6) return;
        dragging = true;
        e.preventDefault();
        if (!ghost) {
          ghost = card.cloneNode(true);
          ghost.className = 'l2-order-card l2-order-ghost l2-tourists-ghost';
          ghost.querySelectorAll('button').forEach(button => button.remove());
          Object.assign(ghost.style, {width:rect.width+'px',height:rect.height+'px',boxSizing:'border-box',left:rect.left+'px',top:rect.top+'px',transformOrigin:'0 0'});
          document.body.appendChild(ghost);
          card.classList.add('l2-origin-dragging');
        }
        ghost.style.transform = 'translate3d('+(e.clientX-startX)+'px,'+(e.clientY-startY)+'px,0)';
        const cards = [...list.querySelectorAll('.l2-order-card')];
        to = cards.length - 1;
        for (let i=0;i<cards.length;i++) if(e.clientY < cards[i].getBoundingClientRect().top + cards[i].offsetHeight/2){to=i;break;}
        cards.forEach((node,i)=>node.classList.toggle('l2-drop-target',i===to));
      };
      const cleanup = () => {
        card.removeEventListener('pointermove',move);card.removeEventListener('pointerup',up);card.removeEventListener('pointercancel',cleanup);
        ghost?.remove();list.querySelectorAll('.l2-drop-target').forEach(node=>node.classList.remove('l2-drop-target'));
        card.classList.remove('l2-origin-dragging','l2-card-grabbed');
      };
      const up = e => {
        if(e.pointerId!==pointerId)return;
        cleanup();
        if(!dragging||to===from)return;
        const [item]=items.splice(from,1);items.splice(to,0,item);rerender();
      };
      card.addEventListener('pointermove',move);card.addEventListener('pointerup',up);card.addEventListener('pointercancel',cleanup);
      card.setPointerCapture(pointerId);
    });
  });
}

function openLesson2Node(nodeId, btnEl, opts) {
  if (typeof stopSpeech === 'function') stopSpeech();
  const node = L2_NODES[nodeId];
  if (!node) return false;

  if (!isLesson2NodeUnlocked(nodeId)) {
    if (typeof sound === 'function') sound(false);
    if (typeof haptic === 'function') haptic(false);
    if (typeof shakeElement === 'function') {
      shakeElement(btnEl || document.querySelector('[data-l2-node-id="' + nodeId + '"]'));
    }
    const prevNode = L2_NODES[nodeId - 1];
    if (typeof guide === 'function') {
      guide('هذه المحطة مقفلة! أكمل «' + (prevNode ? prevNode.title : 'المحطة السابقة') + '» أولًا بالترتيب.', 4500);
    }
    return false;
  }

  const l2 = getLesson2State();
  l2.activeNode = nodeId;
  l2.unlocked = true;
  state.mapSubView = 'lesson2';
  const stForNode = L2_STAGES.find(st => st.nodeIds.includes(nodeId));
  if (stForNode && l2.expandedStages instanceof Set) l2.expandedStages.add(stForNode.id);
  l2CurrentStation = nodeId;

  if (opts?.review || (isLesson2NodeCompleted(nodeId) && !opts?.preserveProgress)) {
    resetLesson2NodeRecordForReplay(nodeId);
  }

  if (typeof L1Runner !== 'undefined' && typeof L1Runner.openLesson2Node === 'function') {
    saveState();
    return L1Runner.openLesson2Node(nodeId, opts);
  }

  return false;
}

function renderLesson2Station(nodeId, opts) {
  return openLesson2Node(nodeId, null, opts);
}

function showLesson2Feedback(good, msg) {
  const box = $('l2-feedback-box');
  const txt = $('l2-feedback-text');
  if (!box || !txt) return;
  box.className = 'l2-feedback ' + (good ? 'good' : 'bad');
  txt.textContent = msg;
}

function resetLesson2Feedback() {
  const box = $('l2-feedback-box');
  const txt = $('l2-feedback-text');
  if (!box || !txt) return;
  box.className = 'l2-feedback';
  txt.textContent = 'فكّر وجرّب بنفسك أولاً. المساعدة التدريجية ستظهر إذا احتجت إليها.';
}

/* ==========================================================================
   PROGRESSIVE HINT SYSTEM (4 TIERS)
   ========================================================================== */
const L2_HINTS = {
  0: {
    rule: 'عند المقارنة بين أعداد ضمن الملايين، نتحقق أولاً من عدد المنازل، ثم نقارن من اليسار.',
    focus: 'جميع أعداد الحجاج مكونة من 7 منازل (ملايين)، انظر إلى منزلة مئات الألوف (الرقم الثاني من اليسار).',
    step: 'في مئات الألوف: أرقام الأعوام هي (3، 3، 7، 7، 8). أي هذه الأرقام هو الأكبر؟',
    solution: 'العام الذي شهد أكبر عدد هو 2019 لأن عدد حجاجه 1,855,836 ورقم مئات الألوف فيه (8) أكبر من بقية الأعوام.'
  },
  1: {
    rule: 'نبدأ دائمًا بمقارنة الأرقام بدءًا من أعلى منزلة في أقصى اليسار.',
    focus: 'في منزلة الملايين: كلاهما يبدأ بالرقم 3 (متساويان). انتقل للمنزلة التالية.',
    step: 'في منزلة مئات الألوف: العدد الأول لديه 4، والعدد الثاني لديه 7. بما أن \u20667 > 4\u2069 فإن المقارنة تُحسم هنا!',
    solution: 'العدد 3759120 أكبر من 3456210 لأن 7 في مئات الألوف أكبر من 4.'
  },
  2: {
    rule: 'لوحة المنازل تحاذي المنازل المتناظرة فوق بعضها؛ الفحص يبدأ من اليسار ويتوقف عند أول اختلاف.',
    focus: 'انظر إلى خانة مئات الألوف في اللوحة.',
    step: 'منزلة الملايين متساوية (\u20663 = 3\u2069)، ومنزلة مئات الألوف تحسم الاختلاف (\u20667 > 4\u2069).',
    solution: 'المنزلة التي حسمت المقارنة هي «مئات الألوف» وتتوقف المقارنة عندها دون الحاجة لفحص المنازل الأصغر.'
  },
  3: {
    rule: 'فتحة الرمز تتجه دائمًا نحو العدد الأكبر (مثل فم التمساح الذي يلتهم الكمية الأكبر).',
    focus: 'في المقارنة بين 3456210 و3759120، العدد 3759120 هو الأكبر.',
    step: 'لأن العدد الأكبر مكتوب إلى اليمين: \u20663456210 < 3759120\u2069 تكون الفتحة متجهة نحو 3759120.',
    solution: 'الرمز المناسب هو (\u2066<\u2069) ليصبح التعبير: \u20663456210 < 3759120\u2069.'
  },
  4: {
    rule: 'إذا اختلف عدد المنازل فالعدد ذو المنازل الأكثر هو الأكبر دائمًا!',
    focus: 'عدّ منازل كل عدد أولاً، فإذا تساوت ابدأ المقارنة من أقصى اليسار.',
    step: 'مثال منفصل من الكتاب: العدد 56109789 يتكون من 8 منازل، بينما 5678089 يتكون من 7 منازل.',
    solution: 'أي عدد ذو 8 منازل أكبر من أي عدد ذو 7 منازل دون الحاجة لمقارنة الأرقام الفردية.'
  },
  5: {
    rule: 'تشخيص سبب المقارنة يعتمد على: هل السبب هو اختلاف عدد المنازل أم منزلة معينة؟',
    focus: 'ابحث عن أول منزلة اختلفت من اليسار أو عدّ المنازل.',
    step: 'في 100012001 (9 منازل) و7965412 (7 منازل) السبب هو اختلاف عدد المنازل.',
    solution: 'السبب الحقيقي لكل مقارنة يحدده إما عدد المنازل الكلي أو أول منزلة تختلف من أقصى اليسار.'
  },
  6: {
    rule: 'الترتيب التنازلي يعني من الأكبر إلى الأصغر.',
    focus: 'أعداد السياح جميعها 7 منازل وتبدأ بالرقم 4. قارن مئات الألوف: 9 أكبر من 5.',
    step: 'بين 4962144 و4922169: عشرات الألوف هي 6 مقابل 2، إذن 4962144 هو الأكبر مطلقاً.',
    solution: 'الترتيب التنازلي الصحيح: 4962144 ثم 4922169 ثم 4565158.'
  },
  7: {
    rule: 'الترتيب التصاعدي يعني البدء بالعدد الأصغر ثم الأكبر فالأكبر.',
    focus: 'جميع الأعداد من 8 منازل وتبدأ بـ 53 مليوناً. قارن مئات الألوف: 2، 6، 2.',
    step: 'العدد ذو الرقم 6 في مئات الألوف (53641025) هو الأكبر، وسيوضع في النهاية.',
    solution: 'الترتيب التصاعدي: 53241290 ثم 53279243 ثم 53641025.'
  },
  8: {
    rule: 'يمكنك التبديل بين التصاعدي والتنازلي، أو مقارنة كل عددين متجاورين في الملعب.',
    focus: 'استعمل أزرار التحريك لأعلى ولأسفل لضبط الترتيب بدقة.',
    step: 'تأكد من أن كل عدد أصغر من الذي يليه في الترتيب التصاعدي.',
    solution: 'رتب البطاقات بحيث تكون الأعداد مرتبة تسلسليًا حسب الوضع المختار.'
  },
  9: {
    rule: 'في مسائل الرقم المفقود، عوّض الرقم وافحص هل تحققت إشارة المقارنة رياضياً.',
    focus: 'في \u20667114899 < 7114□99\u2069، الرقم المفقود في منزلة المئات. مئات الطرف الأيسر 8.',
    step: 'لتحقيق إشارة الأصغر (<)، يجب أن يكون رقم مئات الطرف الأيمن أكبر من 8.',
    solution: 'الرقم الوحيد الأكبر من 8 من خانة واحدة هو 9، ليصبح العدد 7114999.'
  },
  10: {
    rule: 'حوّل جميع الأعداد إلى الصيغة القياسية (أرقام) أولاً قبل ترتيبها.',
    focus: 'في الصيغة التحليلية اجمع الأجزاء، وفي الصيغة اللفظية حدّد الآلاف ثم الآحاد.',
    step: 'راجع عدد الأصفار وموقع الرقم 2 في كل صيغة، ثم قارن القيم الناتجة بعد أن تكتبها أنت.',
    solution: 'الترتيب التصاعدي من الأصغر للأكبر: 50270 ثم 50720 ثم 52007.'
  },
  11: {
    rule: 'المحيط ذو المساحة الأقل يأتي أولاً في الترتيب التصاعدي.',
    focus: 'مساحة الهندي: 70 مليون، الأطلسي: 85 مليون، الهادئ: 168 مليون.',
    step: '70,560,000 < 85,133,000 < 168,723,000.',
    solution: 'الترتيب التصاعدي: المحيط الهندي ثم المحيط الأطلسي ثم المحيط الهادئ.'
  },
  12: {
    rule: 'اكتشف النمط بطرح أي حدين متتاليين لمعرفة مقدار الزيادة أو النقصان.',
    focus: 'في النمط 1: 3400000 - 2390000 = 1010000 (زيادة مليون وعشرة آلاف).',
    step: 'أضف 1010000 إلى 4410000 لتحصل على الحد المفقود.',
    solution: 'الحد المفقود في النمط الأول هو 5420000، وفي الثاني 315410 و285410.'
  },
  13: {
    rule: 'العدد المطلوب في المسألة المفتوحة يجب أن يقع حصرًا بين 24985477 و24985487.',
    focus: 'لاحظ أن الأرقام الستة الأولى متطابقة، والتغير فقط في الآحاد والعشرات (من 77 إلى 87).',
    step: 'أي عدد ينتهي بـ 78، 79، 80، 81، 82، 83، 84، 85، 86 هو إجابة صحيحة.',
    solution: 'أي عدد من 8 أرقام بين 24985478 و24985486 يُعد حلاً صحيحاً 100%.'
  },
  14: {
    rule: 'في تحدي الإتقان النهائي، أظهر براعتك في تطبيق كافة المهارات التي تعلمتها.',
    focus: 'اقرأ كل سؤال بعناية، وركّز على عدد المنازل والمقارنة من اليسار.',
    step: 'تحقق من كل إجابة قبل الاعتماد النهائي.',
    solution: 'الإتقان يتطلب الدقة في تطبيق القواعد ومراجعة النتائج.'
  }
};

function initLesson2Hints(nodeId) {
  const hints = L2_HINTS[nodeId] || L2_HINTS[0];
  const b1 = $('l2-hint-btn-1');
  const b2 = $('l2-hint-btn-2');
  const b3 = $('l2-hint-btn-3');
  const bs = $('l2-hint-btn-solution');
  const box = $('l2-hint-box');

  b1.hidden = true; b1.classList.remove('active');
  b2.hidden = true; b2.classList.remove('active');
  b3.hidden = true; b3.classList.remove('active');
  bs.hidden = true; bs.classList.remove('active');
  box.hidden = true; box.textContent = '';

  const showHintText = (txt, btn) => {
    [b1, b2, b3, bs].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    box.hidden = false;
    box.textContent = txt;
  };

  b1.onclick = () => showHintText('القاعدة: ' + hints.rule, b1);
  b2.onclick = () => showHintText('توجيه: ' + hints.focus, b2);
  b3.onclick = () => showHintText('خطوة مساعدة: ' + hints.step, b3);
  bs.onclick = () => {
    showHintText('الشرح الكامل: ' + hints.solution, bs);
    l2StationState.assisted = true;
    showLesson2Feedback(false, 'شاهدت الشرح الكامل. لتحقيق الإتقان المستقل، ستحصل على تمرين إضافي مماثل للتأكيد.');
  };
}

function unlockNextHint(attemptNum) {
  const b1 = $('l2-hint-btn-1');
  const b2 = $('l2-hint-btn-2');
  const b3 = $('l2-hint-btn-3');
  const bs = $('l2-hint-btn-solution');

  if (attemptNum >= 1) b1.hidden = false;
  if (attemptNum >= 2) b2.hidden = false;
  if (attemptNum >= 3) b3.hidden = false;
  if (attemptNum >= 4) bs.hidden = false;
}

/* Mobile actions stay visible, with short labels and accessible full names. */
function setLesson2ActionLabel(btn, fullLabel, mobileLabel) {
  if (!btn) return;
  btn.dataset.l2FullLabel = fullLabel;
  btn.dataset.l2MobileLabel = mobileLabel;
  btn.setAttribute('aria-label', fullLabel);
  btn.textContent = window.matchMedia('(max-width: 640px)').matches ? mobileLabel : fullLabel;
}
function updateLesson2MobileActionInsets() {
  const view = document.getElementById('lesson2-view');
  if (!view) return;
  const bar = document.getElementById('l2-actions-footer');
  const feedback = document.getElementById('l2-feedback-box');
  const barHeight = bar ? Math.ceil(bar.getBoundingClientRect().height) : 70;
  const activeFeedback = feedback && (feedback.classList.contains('good') || feedback.classList.contains('bad'));
  const feedbackHeight = activeFeedback ? Math.ceil(feedback.getBoundingClientRect().height) : 0;
  const barVar = Math.max(0,barHeight) + 'px';
  const feedbackVar = Math.max(0,feedbackHeight) + 'px';
  view.style.setProperty('--l2-mobile-bar-height', barVar);
  view.style.setProperty('--l2-mobile-feedback-height', feedbackVar);
  // The tutor FAB is a sibling of #lesson2-view, so it needs these values
  // on the shared ancestor to sit above the feedback rather than over it.
  document.body.style.setProperty('--l2-mobile-bar-height', barVar);
  document.body.style.setProperty('--l2-mobile-feedback-height', feedbackVar);
}
function initLesson2MobileFocusLayout() {
  const bar = document.getElementById('l2-actions-footer');
  const feedback = document.getElementById('l2-feedback-box');
  if (!bar || !feedback) return;
  const refresh = () => {
    ['l2-action-check', 'l2-action-next'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn && btn.dataset.l2FullLabel) {
        btn.textContent = window.matchMedia('(max-width: 640px)').matches ? btn.dataset.l2MobileLabel : btn.dataset.l2FullLabel;
      }
    });
    updateLesson2MobileActionInsets();
  };
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => updateLesson2MobileActionInsets());
    ro.observe(bar);
    ro.observe(feedback);
  }
  if (typeof MutationObserver === 'function') {
    const mo = new MutationObserver(() => updateLesson2MobileActionInsets());
    mo.observe(bar, {attributes:true,attributeFilter:['hidden']});
    mo.observe(feedback, {attributes:true,attributeFilter:['class','hidden']});
  }
  window.addEventListener('resize', refresh);
  refresh();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLesson2MobileFocusLayout, {once:true});
} else {
  initLesson2MobileFocusLayout();
}

function completeLesson2Station(nodeId, pointsEarned, overrideStars) {
  const l2 = getLesson2State();
  if (!l2.completedNodes) l2.completedNodes = new Set();
  if (!l2.nodeStars) l2.nodeStars = {};
  const wasDone = l2.completedNodes.has(nodeId);
  l2.completedNodes.add(nodeId);

  const rec = getLesson2NodeRecord(nodeId);
  const hasAssisted = (rec.assistedSteps && rec.assistedSteps.size > 0) || Boolean(l2StationState?.assisted);
  const wrongTries = Math.max(0, Number(rec.errors || 0), (l2StationState?.attempts || 1) - 1);
  let earnedStars = Number.isInteger(overrideStars)
    ? Math.min(3, Math.max(1, overrideStars))
    : ((wrongTries >= 3) ? 1 : (hasAssisted || wrongTries >= 1) ? 2 : 3);
  if (hasAssisted && earnedStars > 2) earnedStars = 2;

  l2.nodeStars[nodeId] = Math.max(l2.nodeStars[nodeId] || 0, earnedStars);

  if (!wasDone) {
    if (typeof sound === 'function') sound(true, 750);
    if (typeof haptic === 'function') haptic(true);
    if (typeof checkMilestoneBadges === 'function') checkMilestoneBadges(true);
  }

  saveState();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderHUD === 'function') renderHUD();
  if (typeof renderDuolingoMap === 'function') renderDuolingoMap();
  return { wasDone, earnedStars };
}


