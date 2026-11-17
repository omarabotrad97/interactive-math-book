/* Lesson 1: Independent Exit Ticket Assessment & Report */
function createDefaultExitTicketState(){
 return {
  status:'not_attempted',
  lastScore:null,
  attemptsCount:0,
  history:[],
  currentQuestions:null,
  currentAnswers:{},
  activeQuestionIdx:0,
  lastResult:null,
  lastCompletedDate:null
 };
}
state.exitTicket = state.exitTicket || createDefaultExitTicketState();

function etUniqueList(seed, candidates, count=4){
 const out=[seed];
 for(const c of candidates){
  if(out.length>=count) break;
  if(c!==undefined&&c!==null&&!out.includes(c)) out.push(c);
 }
 return out.sort(()=>0.5-Math.random());
}

function generateExitTicketQuestions(){
 // Q1: Place & Value (20% total: 10% place, 10% value)
 const q1Num = randomLargeNumber(7, 9, false);
 const q1P = randInt(1, String(q1Num).length - 1);
 const q1Digit = digit(q1Num, q1P);
 const q1Val = q1Digit * 10**q1P;
 const q1PlaceName = places[q1P];
 const placePool = places.filter((_, i) => i !== q1P && i < String(q1Num).length).sort(() => 0.5 - Math.random());
 const placeOpts = etUniqueList(q1PlaceName, placePool, 4);
 const valPool = [
  q1Digit * 10**(q1P > 0 ? q1P - 1 : 2),
  q1Digit * 10**(q1P < 8 ? q1P + 1 : 6),
  q1Digit * 10**(q1P > 1 ? q1P - 2 : 3),
  q1Digit * 10,
  q1Digit
 ];
 const valOpts = etUniqueList(q1Val, valPool, 4);

 // Q2: Reading Numbers (20%)
 const q2Num = randomLargeNumber(7, 9, true);
 const q2Correct = words(q2Num);
 const q2Pool = [
  words(q2Num + 10000),
  words(q2Num >= 2000000 ? q2Num - 1000000 : q2Num + 1000000),
  words(q2Num + 100),
  words(q2Num + 1000)
 ];
 const q2Opts = etUniqueList(q2Correct, q2Pool, 4);

 // Q3: Standard Form (20%)
 const q3Num = randomLargeNumber(7, 9, true);
 const q3Words = words(q3Num);
 const q3Pool = [
  fmt(q3Num + 10000),
  fmt(q3Num >= 1100000 ? q3Num - 100000 : q3Num + 100000),
  fmt(q3Num + 1000),
  fmt(q3Num + 1000000)
 ];
 const q3Opts = etUniqueList(fmt(q3Num), q3Pool, 4);

 // Q4: Expanded Form (20%)
 const q4Num = randomLargeNumber(7, 8, false);
 const terms = expansion(q4Num);
 const pickIdx = randInt(1, Math.max(1, terms.length - 2));
 const missingTerm = terms[pickIdx] || terms[0];
 const q4Digit = digit(q4Num, missingTerm.p);
 const q4OptsSet = new Set([missingTerm.value]);
 if (missingTerm.p > 0) q4OptsSet.add(q4Digit * 10**(missingTerm.p - 1));
 if (missingTerm.p < 8) q4OptsSet.add(q4Digit * 10**(missingTerm.p + 1));
 if (missingTerm.p > 1) q4OptsSet.add(q4Digit * 10**(missingTerm.p - 2));
 if (missingTerm.p < 7) q4OptsSet.add(q4Digit * 10**(missingTerm.p + 2));
 q4OptsSet.add(q4Digit * 10);
 q4OptsSet.add(q4Digit);
 const q4OptsList = [missingTerm.value];
 for (const v of q4OptsSet) {
  if (v !== missingTerm.value && q4OptsList.length < 4) q4OptsList.push(v);
 }
 const q4Opts = q4OptsList.sort(() => 0.5 - Math.random());

 // Q5: Error Detection & Reasoning (20%: 10% reason, 10% value)
 const q5Num = randomLargeNumber(7, 9, false);
 const q5P = randInt(3, String(q5Num).length - 1);
 const q5Digit = digit(q5Num, q5P);
 const q5CorrectVal = q5Digit * 10**q5P;
 const q5WrongZeros = q5P >= 2 ? q5P - 2 : q5P + 1;
 const q5WrongVal = q5Digit * 10**q5WrongZeros;
 const q5ReasonOpts = [
  'الرقم ' + q5Digit + ' يقع في منزلة «' + places[q5P] + '» (على يمينه ' + ar(q5P) + ' منازل)، وليس في ' + places[q5WrongZeros],
  'الرقم ' + q5Digit + ' غير موجود في دورة الملايين',
  'قيمة الرقم تحسب بجمعه مع عدد الأصفار بدلاً من ضربه في قيمة المنزلة'
 ].sort(() => 0.5 - Math.random());
 const q5ValOpts = etUniqueList(q5CorrectVal, [q5WrongVal, q5Digit * 10**(q5P - 1), q5Digit * 10, q5Digit], 4);

 return [
  { id: 1, skill: 'place', weight: 20, num: q1Num, p: q1P, digit: q1Digit, place: q1PlaceName, val: q1Val, placeOpts, valOpts, prompt: 'حدّد منزلة الرقم الملوّن وقيمته المنزلية في العدد الآتي:' },
  { id: 2, skill: 'reading', weight: 20, num: q2Num, correct: q2Correct, opts: q2Opts, prompt: 'اختر الصيغة اللفظية (القراءة الصحيحة) للعدد الآتي:' },
  { id: 3, skill: 'standard', weight: 20, num: q3Num, words: q3Words, correct: fmt(q3Num), opts: q3Opts, prompt: 'اختر الصيغة القياسية (بالأرقام) المطابقة للصيغة اللفظية المعطاة:' },
  { id: 4, skill: 'expanded', weight: 20, num: q4Num, terms, missing: missingTerm, correct: missingTerm.value, opts: q4Opts, prompt: 'ما القيمة التحليلية المفقودة مكان علامة الاستفهام [ ؟ ] في المعادلة؟' },
  { id: 5, skill: 'reasoning', weight: 20, num: q5Num, p: q5P, digit: q5Digit, wrongVal: q5WrongVal, correctVal: q5CorrectVal, correctReason: 'الرقم ' + q5Digit + ' يقع في منزلة «' + places[q5P] + '» (على يمينه ' + ar(q5P) + ' منازل)، وليس في ' + places[q5WrongZeros], reasonOpts: q5ReasonOpts, valOpts: q5ValOpts, prompt: 'اكتشف الخطأ الرياضي في الحل الآتي، وحدّد سببه وقيمته الصحيحة:' }
 ];
}

let exitTicketEventsInited = false;
function initExitTicketEvents(){
 if(exitTicketEventsInited) return;
 exitTicketEventsInited = true;
 $('et-back-btn')?.addEventListener('click',()=>showDuolingoMap());
 $('et-prev-btn')?.addEventListener('click',()=>{
  if(state.exitTicket&&state.exitTicket.activeQuestionIdx>0){
   state.exitTicket.activeQuestionIdx--;
   renderExitTicket();
  }
 });
 $('et-next-btn')?.addEventListener('click',()=>{
  if(state.exitTicket&&state.exitTicket.activeQuestionIdx<4){
   state.exitTicket.activeQuestionIdx++;
   renderExitTicket();
  }
 });
 $('et-submit-btn')?.addEventListener('click',submitExitTicket);
}

function prepareExitTicketSession(forceNew = false){
 state.exitTicket = state.exitTicket || createDefaultExitTicketState();
 const hasCorruptedOpts = state.exitTicket.currentQuestions?.some(q => q.opts?.some(opt => opt === undefined || opt === null || (typeof opt === 'number' && isNaN(opt)) || (q.id === 4 && opt === 0)));
 if(forceNew || hasCorruptedOpts || !state.exitTicket.currentQuestions || state.exitTicket.currentQuestions.length !== 5){
  state.exitTicket.currentQuestions = generateExitTicketQuestions();
  state.exitTicket.currentAnswers = {};
  state.exitTicket.activeQuestionIdx = 0;
  state.exitTicket.status = 'in_progress';
  delete state.exitTicket.lastResult;
 }
 return state.exitTicket;
}

function startExitTicket(forceNew = false){
 prepareExitTicketSession(forceNew);
 initExitTicketEvents();
 if(typeof L1Runner!=='undefined'&&L1Runner.openNode){
  L1Runner.openNode(20);
  return;
 }
 state.viewMode = 'exit_ticket';
 updateViewDom();
 renderExitTicket();
 saveState();
 window.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function scoreExitTicket(questions, answers){
 const skillResults = {};
 let totalScore = 0;

 // Q1
 const q1 = questions[0];
 const q1P_ok = answers[1]?.place === q1.place;
 const q1V_ok = Number(answers[1]?.val) === q1.val;
 const q1Pts = (q1P_ok ? 10 : 0) + (q1V_ok ? 10 : 0);
 skillResults.place = { pts: q1Pts, max: 20, ok: q1Pts === 20, partial: q1Pts > 0 && q1Pts < 20, title: 'تحديد المنزلة والقيمة' };
 totalScore += q1Pts;

 // Q2
 const q2 = questions[1];
 const q2_ok = answers[2]?.reading === q2.correct;
 const q2Pts = q2_ok ? 20 : 0;
 skillResults.reading = { pts: q2Pts, max: 20, ok: q2_ok, title: 'قراءة الأعداد' };
 totalScore += q2Pts;

 // Q3
 const q3 = questions[2];
 const q3_ok = String(answers[3]?.standard || '').replace(/[, ]/g, '') === String(q3.num);
 const q3Pts = q3_ok ? 20 : 0;
 skillResults.standard = { pts: q3Pts, max: 20, ok: q3_ok, title: 'بناء العدد من الكلمات' };
 totalScore += q3Pts;

 // Q4
 const q4 = questions[3];
 const q4_ok = Number(answers[4]?.expanded) === q4.correct;
 const q4Pts = q4_ok ? 20 : 0;
 skillResults.expanded = { pts: q4Pts, max: 20, ok: q4_ok, title: 'تحليل العدد' };
 totalScore += q4Pts;

 // Q5
 const q5 = questions[4];
 const q5R_ok = answers[5]?.reason === q5.correctReason;
 const q5V_ok = Number(answers[5]?.val) === q5.correctVal;
 const q5Pts = (q5R_ok ? 10 : 0) + (q5V_ok ? 10 : 0);
 skillResults.reasoning = { pts: q5Pts, max: 20, ok: q5Pts === 20, partial: q5Pts > 0 && q5Pts < 20, title: 'اكتشاف الخطأ وتفسيره' };
 totalScore += q5Pts;

 const allMastered = totalScore === 100;
 return { totalScore, skillResults, allMastered };
}

function renderExitTicket(){
 const et = state.exitTicket;
 if(!et || !et.currentQuestions) return;

 const cardEl = $('et-card');
 const reportEl = $('et-report-sheet');

 if(et.status === 'completed' && et.lastResult){
  cardEl.hidden = true;
  reportEl.hidden = false;
  renderExitTicketReport();
  return;
 }

 cardEl.hidden = false;
 reportEl.hidden = true;

 const idx = et.activeQuestionIdx || 0;
 const q = et.currentQuestions[idx];
 const answers = et.currentAnswers[q.id] || {};

 $('et-step-counter').textContent = 'السؤال ' + ar(idx + 1) + ' من 5';
 $('et-progress-bar-fill').style.width = ((idx + 1) * 20) + '%';
 $('et-progress-bar-fill')?.parentElement?.setAttribute('aria-valuenow', String((idx + 1) * 20));

 const headEl = $('et-card-head');
 headEl.innerHTML = '<span class="et-skill-badge">المهارة ' + ar(idx + 1) + ' من 5 (الوزن: 20%)</span>'
  + '<h3 class="et-prompt-title">' + q.prompt + '</h3>';

 const bodyEl = $('et-card-body');
 bodyEl.replaceChildren();

 if(q.id === 1){
  const numDiv = document.createElement('div');
  numDiv.className = 'et-number-display';
  const str = String(q.num);
  const targetIdx = str.length - 1 - q.p;
  numDiv.innerHTML = str.split('').map((char, i) => i === targetIdx ? '<span class="et-highlighted-digit">' + char + '</span>' : char).join('');
  bodyEl.append(numDiv);

  // Part A: Place name
  const partA = document.createElement('div');
  partA.className = 'et-part-box';
  partA.innerHTML = '<span class="et-part-label">أ. يقع الرقم الملوّن في منزلة:</span>';
  const gridA = document.createElement('div');
  gridA.className = 'et-options-grid';
  q.placeOpts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.place === opt ? ' selected' : '');
   btn.innerHTML = '<span>' + opt + '</span>' + (answers.place === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.place = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   gridA.append(btn);
  });
  partA.append(gridA);
  bodyEl.append(partA);

  // Part B: Value
  const partB = document.createElement('div');
  partB.className = 'et-part-box';
  partB.innerHTML = '<span class="et-part-label">ب. القيمة المنزلية للرقم الملوّن هي:</span>';
  const gridB = document.createElement('div');
  gridB.className = 'et-options-grid';
  q.valOpts.forEach(optVal => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.val === optVal ? ' selected' : '');
   btn.innerHTML = '<span class="num">' + fmt(optVal) + '</span>' + (answers.val === optVal ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.val = optVal;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   gridB.append(btn);
  });
  partB.append(gridB);
  bodyEl.append(partB);
 } else if(q.id === 2){
  const numDiv = document.createElement('div');
  numDiv.className = 'et-number-display';
  numDiv.textContent = fmt(q.num);
  bodyEl.append(numDiv);

  const grid = document.createElement('div');
  grid.className = 'et-options-grid';
  grid.style.gridTemplateColumns = '1fr';
  q.opts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.reading === opt ? ' selected' : '');
   btn.innerHTML = '<span>«' + opt + '»</span>' + (answers.reading === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.reading = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   grid.append(btn);
  });
  bodyEl.append(grid);
 } else if(q.id === 3){
  const wordBox = document.createElement('div');
  wordBox.className = 'et-part-box';
  wordBox.style.fontSize = '16px';
  wordBox.style.textAlign = 'center';
  wordBox.style.fontWeight = '700';
  wordBox.style.color = '#0f5346';
  wordBox.textContent = '«' + q.words + '»';
  bodyEl.append(wordBox);

  const grid = document.createElement('div');
  grid.className = 'et-options-grid';
  q.opts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.standard === opt ? ' selected' : '');
   btn.innerHTML = '<span class="num" style="direction:ltr;font-weight:700">' + opt + '</span>' + (answers.standard === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.standard = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   grid.append(btn);
  });
  bodyEl.append(grid);
 } else if(q.id === 4){
  const eqDiv = document.createElement('div');
  eqDiv.className = 'et-number-display';
  eqDiv.style.fontSize = '20px';
  eqDiv.style.lineHeight = '1.8';
  eqDiv.style.direction = 'rtl';
  const parts = q.terms.map(t => t.p === q.missing.p ? '<span class="et-highlighted-digit">[ ؟ ]</span>' : fmt(t.value));
  eqDiv.innerHTML = fmt(q.num) + ' = ' + parts.join(' + ');
  bodyEl.append(eqDiv);

  const grid = document.createElement('div');
  grid.className = 'et-options-grid';
  q.opts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.expanded === opt ? ' selected' : '');
   btn.innerHTML = '<span class="num" style="direction:ltr;font-weight:700">' + fmt(opt) + '</span>' + (answers.expanded === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.expanded = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   grid.append(btn);
  });
  bodyEl.append(grid);
 } else if(q.id === 5){
  const storyBox = document.createElement('div');
  storyBox.className = 'et-part-box';
  storyBox.style.border = '1.5px solid #d99b26';
  storyBox.style.background = '#fffdf7';
  storyBox.innerHTML = '<p style="margin:0;font-size:14px;color:#875604;line-height:1.6">'
   + 'في العدد <strong>' + fmt(q.num) + '</strong>، كتب طالبٌ أن القيمة المنزلية للرقم <strong>(' + q.digit + ')</strong> هي: <strong class="num" style="direction:ltr;color:#c02626">' + fmt(q.wrongVal) + '</strong>.'
   + '</p>';
  bodyEl.append(storyBox);

  // Part A: reason
  const partA = document.createElement('div');
  partA.className = 'et-part-box';
  partA.innerHTML = '<span class="et-part-label">أ. ما سبب خطأ الطالب؟</span>';
  const gridA = document.createElement('div');
  gridA.className = 'et-options-grid';
  gridA.style.gridTemplateColumns = '1fr';
  q.reasonOpts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.reason === opt ? ' selected' : '');
   btn.innerHTML = '<span>' + opt + '</span>' + (answers.reason === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.reason = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   gridA.append(btn);
  });
  partA.append(gridA);
  bodyEl.append(partA);

  // Part B: correct value
  const partB = document.createElement('div');
  partB.className = 'et-part-box';
  partB.innerHTML = '<span class="et-part-label">ب. ما القيمة المنزلية الصحيحة للرقم (' + q.digit + ')؟</span>';
  const gridB = document.createElement('div');
  gridB.className = 'et-options-grid';
  q.valOpts.forEach(opt => {
   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'et-option-btn' + (answers.val === opt ? ' selected' : '');
   btn.innerHTML = '<span class="num" style="direction:ltr;font-weight:700">' + fmt(opt) + '</span>' + (answers.val === opt ? '<span class="btn-svg">' + getIconSVG('check') + '</span>' : '');
   btn.addEventListener('click', () => {
    answers.val = opt;
    et.currentAnswers[q.id] = answers;
    renderExitTicket();
   });
   gridB.append(btn);
  });
  partB.append(gridB);
  bodyEl.append(partB);
 }

 $('et-prev-btn').disabled = (idx === 0);
 if(idx < 4){
  $('et-next-btn').hidden = false;
  $('et-submit-btn').hidden = true;
 } else {
  $('et-next-btn').hidden = true;
  $('et-submit-btn').hidden = false;
 }
}

function submitExitTicket(){
 const et = state.exitTicket;
 if(!et || !et.currentQuestions) return;

 const res = scoreExitTicket(et.currentQuestions, et.currentAnswers);
 et.attemptsCount = (et.attemptsCount || 0) + 1;
 et.lastScore = res.totalScore;
 et.lastResult = res;
 et.status = 'completed';
 try {
  et.lastCompletedDate = new Intl.DateTimeFormat('ar-JO-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
 } catch {
  et.lastCompletedDate = new Date().toLocaleDateString();
 }

 et.history = et.history || [];
 et.history.push({
  attemptNumber: et.attemptsCount,
  date: et.lastCompletedDate,
  score: res.totalScore,
  skills: res.skillResults
 });

 if(res.totalScore === 100){
  state.nodesCompleted.add(20);
  if(!state.nodeStars) state.nodeStars = {};
  state.nodeStars[20] = 3;
  celebrate(40);
  sound(true);
 }

 saveState();
 renderExitTicketReport();
 window.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function renderExitTicketReport(){
 const et = state.exitTicket;
 const res = et.lastResult;
 if(!res) return;

 $('et-card').hidden = true;
 const reportEl = $('et-report-sheet');
 reportEl.hidden = false;
 reportEl.replaceChildren();

 const is100 = res.totalScore === 100;
 const isPartial = res.totalScore >= 60 && res.totalScore < 100;

 const statusText = is100
  ? 'أتقن جميع أهداف الدرس (إتقان تام معتمد)'
  : isPartial
  ? 'إتقان جزئي متقدم (تحتاج مراجعة المهارات غير المتقنة)'
  : 'قيد التدريب والمراجعة (يحتاج إعادة تحقق)';
 const statusCls = is100 ? 'mastered' : isPartial ? 'partial' : 'review';

 let rowsHtml = '';
 const skillMeta = [
  { key: 'place', name: 'تحديد المنزلة والقيمة المنزلية (20%)' },
  { key: 'reading', name: 'قراءة الأعداد والصيغة اللفظية (20%)' },
  { key: 'standard', name: 'بناء العدد من الكلمات (20%)' },
  { key: 'expanded', name: 'تحليل العدد والصيغة التحليلية (20%)' },
  { key: 'reasoning', name: 'اكتشاف الخطأ وتفسيره (20%)' }
 ];

 skillMeta.forEach(sm => {
  const s = res.skillResults[sm.key];
  const badgeCls = s.ok ? 'status-mastered' : s.partial ? 'status-partial' : 'status-reassess';
  const badgeText = s.ok ? 'صحيح ومتقن (+20%)' : s.partial ? 'إتقان جزئي (+10%)' : 'يحتاج مراجعة (0%)';
  rowsHtml += '<tr>'
   + '<td><strong>' + sm.name + '</strong></td>'
   + '<td><span class="skill-pill-status ' + badgeCls + '">' + badgeText + '</span></td>'
   + '</tr>';
 });

 reportEl.innerHTML = '<div class="et-report-header">'
  + '<div class="et-report-score-box">'
  + '<span style="font-size:12px;font-weight:700;color:#5a6855">النتيجة الإجمالية لبطاقة الخروج المستقلة</span>'
  + '<span class="et-score-num">' + ar(res.totalScore) + '%</span>'
  + '<span class="et-score-status ' + statusCls + '">' + statusText + '</span>'
  + '<small style="color:#676e62;margin-top:4px">المحاولة رقم: ' + ar(et.attemptsCount) + ' · ' + (et.lastCompletedDate || '') + '</small>'
  + '</div>'
  + '</div>'
  + '<table class="et-skills-table">'
  + '<thead><tr><th>المهارة المستهدفة</th><th>نتيجة التقييم المستقل</th></tr></thead>'
  + '<tbody>' + rowsHtml + '</tbody>'
  + '</table>'
  + (!is100 ? '<div class="et-feedback-box"><strong class="et-feedback-title">التوجيه البيداغوجي:</strong><p style="margin:0;font-size:12px;line-height:1.5">حرصًا على رسوخ المفاهيم، لا تُمنح شارة «أتقن جميع أهداف الدرس» إلا عند تحقيق 100% في بطاقة الخروج المستقلة. اضغط زر «تدريب موجه» لمراجعة المهارة ثم أعد بطاقة الخروج بنماذج جديدة.</p></div>' : '')
  + '<div class="et-action-buttons">'
  + '<button type="button" class="verify-trigger-btn" id="et-retry-btn"><span class="btn-svg">' + getIconSVG('refresh') + '</span><span>إعادة المحاولة بنماذج جديدة</span></button>'
  + (!is100 ? '<button type="button" class="skill-train-btn" id="et-train-btn" style="min-height:44px;padding:8px 16px"><span class="btn-svg">' + getIconSVG('target') + '</span><span>تدريب موجه على المهارات الضعيفة</span></button>' : '')
  + '<button type="button" class="et-back-btn" id="et-return-map-btn"><span class="btn-svg">' + getIconSVG('map') + '</span><span>العودة لخريطة المسار</span></button>'
  + '</div>';

 reportEl.querySelector('#et-retry-btn')?.addEventListener('click', () => {
  startExitTicket(true);
 });
 reportEl.querySelector('#et-train-btn')?.addEventListener('click', () => {
  showDuolingoMap();
  startInfiniteMode('all');
 });
 reportEl.querySelector('#et-return-map-btn')?.addEventListener('click', () => {
  showDuolingoMap();
 });
}

