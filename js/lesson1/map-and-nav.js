/* Lesson 1: Duolingo Learning Path Map, Station Sheet & Navigation */
function getNodeProgress(nodeId){
 const node=PATH_NODES[nodeId];if(!node)return{cur:0,tot:1,pct:0};
 if(isNodeCompleted(nodeId))return{cur:1,tot:1,pct:100};
 if(nodeId===0&&!state.onboarding?.reviewSlidesMode){
  const ob=state.onboarding||createDefaultOnboarding();
  const ph=ob.station1Phase||'warmup_q1';
  const mapPh={warmup_q1:1,warmup_q2:2,adaptive_branch:3,review:3,bridge:4+(ob.bridgeLevel||0),gradual_millions:7+(ob.gradualStep||0)};
  const cur=mapPh[ph]||1,tot=10;
  return{cur,tot,pct:Math.min(100,Math.round(cur/tot*100))};
 }
 let cur=0,tot=1;
 if(node.type==='story'){
  tot=node.slides?node.slides.length:1;
  cur=node.slides?node.slides.filter(i=>state.viewedSlides[node.unit].has(i)).length:0;
 }else if(node.type==='exit_ticket'){
  const et=state.exitTicket;
  tot=5;
  cur=(et&&et.status==='completed'&&et.lastScore===100)?5:0;
 }
 if(node.type==='playground'){
  tot=3;
  cur=Math.min(3,playgroundState.questsDone.size);
 }else if(node.type==='mission'){
  const m=missions[node.missionId],r=state.records[node.missionId];
  tot=m?m.steps.length:1;
  cur=r?r.passed.size:0;
 }
 const pct=Math.min(100,Math.round(cur/Math.max(1,tot)*100));
 return{cur,tot,pct};
}
function renderStationTopbar(l2NodeOverride){
 const bar=$('station-topbar');if(!bar)return;
 updateStepClarityBar();
 const titleEl=$('station-title-label'),stepEl=$('station-step-label'),fillEl=$('station-progress-fill'),roleEl=$('station-progress-role'),scratchBtn=$('scratchpad-open');
 const scratchUnlocked=isNodeCompleted(1);
 if(scratchBtn){
  scratchBtn.hidden=state.viewMode!=='mission';
  scratchBtn.setAttribute('aria-disabled',String(!scratchUnlocked));
  scratchBtn.innerHTML='<span class="btn-svg">'+getIconSVG(scratchUnlocked?'hand':'lock')+'</span><span>'+(scratchUnlocked?'مسودة الملعب':'الملعب')+'</span>';
 }
 if(state.viewMode==='lesson2'&&typeof L2_NODES!=='undefined'){
  const l2=typeof getLesson2State==='function'?getLesson2State():null;
  const idx=typeof l2NodeOverride==='number'?l2NodeOverride:(l2&&typeof l2.activeNode==='number'?l2.activeNode:0);
  const l2Node=L2_NODES[idx]||L2_NODES[0];
  titleEl.textContent=l2Node.title;
  stepEl.innerHTML='<bdi class="num">'+ar(l2Node.id+1)+' / '+ar(L2_NODES.length)+'</bdi>';
  const pct=Math.round(((l2Node.id+1)/L2_NODES.length)*100);
  fillEl.style.width=pct+'%';
  roleEl.setAttribute('aria-valuenow',String(pct));
  roleEl.setAttribute('aria-valuetext','المحطة '+ar(l2Node.id+1)+' من '+ar(L2_NODES.length));
  return;
 }
 if(state.viewMode==='lesson3'&&typeof L3_NODES!=='undefined'){
  const l3=typeof getLesson3State==='function'?getLesson3State():null;
  const idx=l3&&typeof l3.activeNode==='number'?l3.activeNode:0;
  const l3Node=L3_NODES[idx]||L3_NODES[0];
  titleEl.textContent=l3Node.title;
  stepEl.innerHTML='<bdi class="num">'+ar(l3Node.id+1)+' / '+ar(L3_NODES.length)+'</bdi>';
  const pct=Math.round(((l3Node.id+1)/L3_NODES.length)*100);
  fillEl.style.width=pct+'%';
  roleEl.setAttribute('aria-valuenow',String(pct));
  roleEl.setAttribute('aria-valuetext','المحطة '+ar(l3Node.id+1)+' من '+ar(L3_NODES.length));
  return;
 }
 if(state.viewMode==='lesson4'&&typeof L4_NODES!=='undefined'){
  const l4=typeof getLesson4State==='function'?getLesson4State():null;
  const idx=l4&&typeof l4.activeNode==='number'?l4.activeNode:0;
  const l4Node=L4_NODES[idx]||L4_NODES[0];
  titleEl.textContent=l4Node.title;
  stepEl.innerHTML='<bdi class="num">'+ar(l4Node.id+1)+' / '+ar(L4_NODES.length)+'</bdi>';
  const pct=Math.round(((l4Node.id+1)/L4_NODES.length)*100);
  fillEl.style.width=pct+'%';
  roleEl.setAttribute('aria-valuenow',String(pct));
  roleEl.setAttribute('aria-valuetext','المحطة '+ar(l4Node.id+1)+' من '+ar(L4_NODES.length));
  return;
 }
 if(state.viewMode==='lesson5'&&typeof L5_NODES!=='undefined'){
  const l5=typeof getLesson5State==='function'?getLesson5State():null;
  const idx=l5&&typeof l5.activeNode==='number'?l5.activeNode:0;
  const l5Node=L5_NODES[idx]||L5_NODES[0];
  titleEl.textContent=l5Node.title;
  stepEl.innerHTML='<bdi class="num">'+ar(l5Node.id+1)+' / '+ar(L5_NODES.length)+'</bdi>';
  const pct=Math.round(((l5Node.id+1)/L5_NODES.length)*100);
  fillEl.style.width=pct+'%';
  roleEl.setAttribute('aria-valuenow',String(pct));
  roleEl.setAttribute('aria-valuetext','المحطة '+ar(l5Node.id+1)+' من '+ar(L5_NODES.length));
  return;
 }
 if(state.viewMode==='u2_lesson1'&&typeof U2L1_NODES!=='undefined'){
  const u2=typeof getU2L1State==='function'?getU2L1State():null;
  const idx=u2&&typeof u2.activeNode==='number'?u2.activeNode:0;
  const u2Node=U2L1_NODES[idx]||U2L1_NODES[0];
  titleEl.textContent=u2Node.title;
  stepEl.innerHTML='<bdi class="num">'+ar(u2Node.id+1)+' / '+ar(U2L1_NODES.length)+'</bdi>';
  const pct=Math.round(((u2Node.id+1)/U2L1_NODES.length)*100);
  fillEl.style.width=pct+'%';
  roleEl.setAttribute('aria-valuenow',String(pct));
  roleEl.setAttribute('aria-valuetext','المحطة '+ar(u2Node.id+1)+' من '+ar(U2L1_NODES.length));
  return;
 }
 if(state.infiniteMode){
  titleEl.textContent='التحدي المتجدد اللانهائي';
  stepEl.innerHTML='<bdi class="num">حُلّت: '+ar(state.infiniteStats.solved)+'</bdi>';
  fillEl.style.width='100%';roleEl.setAttribute('aria-valuenow','100');return;
 }
 if(state.viewMode==='recharge'){
  titleEl.textContent='محطة شحن القلوب السريعة';
  const pct=state.rechargeSolved?100:35;
  stepEl.innerHTML='<bdi class="num">'+(state.rechargeSolved?'3 / 3 قلوب':'تحدٍّ واحد')+'</bdi>';
  fillEl.style.width=pct+'%';roleEl.setAttribute('aria-valuenow',String(pct));return;
 }
 if(state.viewMode==='scratchpad'){
  titleEl.textContent='مسودة ملعب الأعداد المساعدة';
  stepEl.textContent='تجربة حرة';
  fillEl.style.width='100%';roleEl.setAttribute('aria-valuenow','100');return;
 }
 const node=PATH_NODES[state.activeNode]||PATH_NODES[0];
 titleEl.textContent=node.title;
 const prog=getNodeProgress(node.id);
 stepEl.innerHTML='<bdi class="num">'+ar(prog.cur)+' / '+ar(prog.tot)+'</bdi>';
 fillEl.style.width=prog.pct+'%';
 roleEl.setAttribute('aria-valuenow',String(prog.pct));
}
function renderDuoTrophySVG(done){
 const outer=done?'#c88d21':'#dfd6c1';
 const innerStroke=done?'#c88d21':'#bcae92';
 return '<svg class="duo-sec-trophy" viewBox="0 0 48 48" aria-hidden="true">'
  +'<path d="M12 8h24a4 4 0 0 1 4 4v5c0 6.5-4.2 11.8-10 13.8V34h4a3 3 0 0 1 3 3v3H11v-3a3 3 0 0 1 3-3h4v-3.2C12.2 28.8 8 23.5 8 17v-5a4 4 0 0 1 4-4z" fill="'+outer+'" stroke="'+outer+'" stroke-width="5" stroke-linejoin="round"/>'
  +'<path d="M10 13h4v5c0 2.2.8 4.2 2.2 5.8C12.6 22.8 10 19.6 10 15.8V13zm28 0h-4v5c0 2.2-.8 4.2-2.2 5.8 3.6-1 6.2-4.2 6.2-8V13z" fill="#ffffff" stroke="'+innerStroke+'" stroke-width="1.6" stroke-linejoin="round"/>'
  +'<path d="M15 11h18v7c0 5.2-4 9.5-9 9.5s-9-4.3-9-9.5v-7z" fill="#ffffff"/>'
  +'<rect x="21" y="27" width="6" height="6" rx="1.5" fill="#ffffff"/>'
  +'<rect x="15" y="33" width="18" height="4.5" rx="2.2" fill="#ffffff"/>'
  +'</svg>';
}
function renderDuoOwlSVG(){
 return '<svg class="duo-sec-owl" viewBox="0 0 140 110" aria-hidden="true">'
  +'<path d="M26 68 C8 54, 6 34, 18 28 C28 24, 38 42, 42 56 Z" fill="#0f5c4b"/>'
  +'<path d="M34 32 C34 16, 52 12, 74 14 C96 12, 114 16, 114 32 L116 98 C116 106, 32 106, 32 98 Z" fill="#18795b"/>'
  +'<path d="M44 18 L54 8 L64 16 Z" fill="#0f5c4b"/>'
  +'<path d="M104 18 L94 8 L84 16 Z" fill="#0f5c4b"/>'
  +'<ellipse cx="57" cy="46" rx="16" ry="18" fill="#ffffff"/>'
  +'<ellipse cx="91" cy="46" rx="16" ry="18" fill="#ffffff"/>'
  +'<ellipse cx="59" cy="46" rx="8" ry="10" fill="#102a24"/>'
  +'<ellipse cx="89" cy="46" rx="8" ry="10" fill="#102a24"/>'
  +'<circle cx="62" cy="42" r="3" fill="#ffffff"/>'
  +'<circle cx="92" cy="42" r="3" fill="#ffffff"/>'
  +'<path d="M68 53 C72 49, 76 49, 80 53 L83 62 C78 68, 70 68, 65 62 Z" fill="#d99b26"/>'
  +'<path d="M70 59 Q74 69 78 59 Z" fill="#b87e16"/>'
  +'<path d="M52 78 Q60 84 68 78" fill="none" stroke="#7bc49d" stroke-width="4" stroke-linecap="round"/>'
  +'<path d="M80 78 Q88 84 96 78" fill="none" stroke="#7bc49d" stroke-width="4" stroke-linecap="round"/>'
  +'<path d="M66 90 Q74 96 82 90" fill="none" stroke="#7bc49d" stroke-width="4" stroke-linecap="round"/>'
  +'</svg>';
}
function renderDuoProgBarHTML(pct){
 const p=Math.max(0,Math.min(100,Math.round(pct)));
 const rewardHTML=p>=100
  ?'<span class="duo-sec-reward-star" aria-label="مكتمل" title="مكتمل"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"/></svg></span>'
  :'';
 return '<div class="duo-sec-prog-row">'
  +'<div class="duo-sec-prog-track" role="progressbar" aria-label="نسبة الإنجاز: '+ar(p)+' في المئة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'">'
  +'<div class="duo-sec-prog-fill" style="width:'+p+'%"></div>'
  +'</div>'
  +'<span class="duo-sec-prog-pct'+(p===0?' zero':'')+'"><bdi>'+ar(p)+'%</bdi></span>'
  +rewardHTML
  +'</div>';
}
function computeItemProgressMetrics(doneCount,totalCount,unlocked,hasPartialInteraction=false){
 const total=Math.max(1,Math.floor(totalCount||1));
 const done=Math.max(0,Math.min(total,Math.floor(doneCount||0)));
 const pct=done===0?0:(done>=total?100:Math.max(1,Math.min(99,Math.round((done/total)*100))));
 if(!unlocked&&done<total){
  return{done,total,pct,statusKey:'locked',statusLabel:'مقفل',actionLabel:'التفاصيل'};
 }
 if(done>=total){
  return{done,total,pct:100,statusKey:'completed',statusLabel:'مكتمل',actionLabel:'راجع'};
 }
 if(done>0||hasPartialInteraction){
  return{done,total,pct,statusKey:'in_progress',statusLabel:'قيد التعلم',actionLabel:'تابع'};
 }
 return{done:0,total,pct:0,statusKey:'not_started',statusLabel:'لم يبدأ',actionLabel:'ابدأ'};
}
function getCurriculumOverviewData(){
 const l1Done=PATH_NODES.filter(n=>isNodeCompleted(n.id)).length;
 const l1Total=PATH_NODES.length;
 const l1Partial=Boolean((state.onboarding&&(state.onboarding.q1?.answered||state.onboarding.station1Phase!=='warmup_q1'))||state.completed.size>0||(typeof playgroundState==='object'&&(playgroundState.questsDone?.size||0)>0));
 const lesson1=computeItemProgressMetrics(l1Done,l1Total,true,l1Partial);

 const l2Done=typeof getLesson2DoneCount==='function'?getLesson2DoneCount():0;
 const l2Total=typeof L2_NODES!=='undefined'?L2_NODES.length:15;
 const l2Unlocked=typeof isLesson2Unlocked==='function'?isLesson2Unlocked():true;
 const l2Partial=Boolean(state.lesson2&&Object.keys(state.lesson2.records||{}).length>0);
 const lesson2=computeItemProgressMetrics(l2Done,l2Total,l2Unlocked,l2Partial);

 const l3Done=typeof getLesson3DoneCount==='function'?getLesson3DoneCount():0;
 const l3Total=typeof L3_NODES!=='undefined'?L3_NODES.length:16;
 const l3Unlocked=typeof isLesson3Unlocked==='function'?isLesson3Unlocked():true;
 const l3Partial=Boolean(state.lesson3&&Object.keys(state.lesson3.records||{}).length>0);
 const lesson3=computeItemProgressMetrics(l3Done,l3Total,l3Unlocked,l3Partial);

 const l4Done=typeof getLesson4DoneCount==='function'?getLesson4DoneCount():0;
 const l4Total=typeof L4_NODES!=='undefined'?L4_NODES.length:14;
 const l4Unlocked=typeof isLesson4Unlocked==='function'?isLesson4Unlocked():true;
 const l4Partial=Boolean(state.lesson4&&Object.keys(state.lesson4.records||{}).length>0);
 const lesson4=computeItemProgressMetrics(l4Done,l4Total,l4Unlocked,l4Partial);

 const l5Done=typeof getLesson5DoneCount==='function'?getLesson5DoneCount():0;
 const l5Total=typeof L5_NODES!=='undefined'?L5_NODES.length:10;
 const l5Unlocked=typeof isLesson5Unlocked==='function'?isLesson5Unlocked():true;
 const l5Partial=Boolean(state.lesson5&&Object.keys(state.lesson5.records||{}).length>0);
 const lesson5=computeItemProgressMetrics(l5Done,l5Total,l5Unlocked,l5Partial);

 const project=computeItemProgressMetrics(state.unitProjectDone?1:0,1,true,false);
 const allLessonsDone=lesson1.pct===100&&lesson2.pct===100&&lesson3.pct===100&&lesson4.pct===100&&lesson5.pct===100;
 const examDone=typeof getUnit1ExamMasteredCount==='function'?getUnit1ExamMasteredCount():0;
 const examUnlocked=typeof isUnit1ExamUnlocked==='function'?isUnit1ExamUnlocked():allLessonsDone;
 const examPartial=typeof hasUnit1ExamPartialProgress==='function'?hasUnit1ExamPartialProgress():false;
 const unit1_exam=computeItemProgressMetrics(examDone,21,examUnlocked,examPartial);

 const totalDone=project.done+lesson1.done+lesson2.done+lesson3.done+lesson4.done+lesson5.done;
 const totalCount=project.total+lesson1.total+lesson2.total+lesson3.total+lesson4.total+lesson5.total;
 const anyPartial=[lesson1,lesson2,lesson3,lesson4,lesson5].some(m=>m.statusKey==='in_progress');
 const unit1=computeItemProgressMetrics(totalDone,totalCount,true,anyPartial);

 const u2Unlocked=typeof isUnit2Unlocked==='function'?isUnit2Unlocked():false;
 const u2_project=computeItemProgressMetrics(state.unit2ProjectDone?1:0,1,u2Unlocked,false);
 const u2l1Done=typeof getU2L1DoneCount==='function'?getU2L1DoneCount():0;
 const u2l1Total=typeof U2L1_NODES!=='undefined'?U2L1_NODES.length:11;
 const u2l1Partial=Boolean(state.u2Lesson1&&Object.keys(state.u2Lesson1.records||{}).length>0);
 const u2_lesson1=computeItemProgressMetrics(u2l1Done,u2l1Total,u2Unlocked,u2l1Partial);
 const u2DoneTotal=u2_project.done+u2_lesson1.done;
 const u2CountTotal=u2_project.total+u2_lesson1.total;
 const unit2=computeItemProgressMetrics(u2DoneTotal,u2CountTotal,u2Unlocked,u2_lesson1.statusKey==='in_progress');

 return{project,lesson1,lesson2,lesson3,lesson4,lesson5,unit1_exam,unit1,u2_project,u2_lesson1,unit2};
}
function getResumeLessonInfo(ovData){
 const ov=ovData||getCurriculumOverviewData();
 const lessonKeys=['lesson1','lesson2','lesson3','lesson4','lesson5'];
 let key=(typeof state.lastActiveLesson==='string'&&lessonKeys.includes(state.lastActiveLesson))?state.lastActiveLesson:'lesson1';
 if(ov[key]&&ov[key].statusKey==='locked')key='lesson1';
 if(ov[key]&&ov[key].statusKey==='not_started'){
  const inProg=lessonKeys.find(k=>ov[k]&&ov[k].statusKey==='in_progress');
  if(inProg)key=inProg;
 }
 const item=UNIT1_CURRICULUM.find(x=>x.id===key)||UNIT1_CURRICULUM[1];
 const ctx=getActiveMapLessonContext(key);
 const frontNode=ctx.nodes[ctx.frontier]||ctx.nodes[0];
 const cleanStation=frontNode?frontNode.title.replace(/^\d+\.\s*/,''):'المحطة الأولى';
 return{
  key,
  item,
  metrics:ov[key],
  stationNum:ctx.frontier+1,
  totalStations:ctx.nodes.length,
  stationTitle:cleanStation,
  allDone:ctx.allDone
 };
}
function renderCardBadgeContent(type,num){
 if(type==='project'){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>';
 }
 if(type==='exam'){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>';
 }
 if(type==='locked'){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
 }
 return '<bdi>'+ar(num)+'</bdi>';
}
const UNIT1_CURRICULUM=[
 {
  id:'project',
  kicker:'مشروع الوحدة',
  kickerCls:'project',
  title:'مشروع الوحدة: الرياضيات والاجتماعيات',
  sub:'استقصاء أعداد السكان والمسافات الجغرافية في الأردن وتمثيلها بالصيغ الثلاث',
  desc:'يربط هذا المشروع بين الرياضيات والدراسات الاجتماعية؛ حيث تجمع بيانات حقيقية عن عدد سكان محافظات المملكة الأردنية الهاشمية والمسافات بينها، ثم ترتّبها وتكتبها بالصيغ القياسية واللفظية والتحليلية.',
  duration:'10 دقائق',
  points:'25 نقطة',
  kind:'مشروع تطبيقي (الرياضيات والاجتماعيات)'
 },
 {
  id:'lesson1',
  kicker:'الدرس 1',
  kickerCls:'',
  title:'الدرس 1: القيمة المنزلية ضمن الملايين',
  sub:'تحديد القيمة المنزلية لكل رقم وقراءة الأعداد ضمن الملايين وكتابتها بالصيغ الثلاث',
  desc:'أحدّد القيمة المنزلية لكل رقم في عدد ضمن الملايين، وأقرأ الأعداد وأكتبها بالصيغ القياسية واللفظية والتحليلية من خلال 21 محطة تفاعلية متدرجة.',
  duration:'21 محطة',
  points:'350 نقطة',
  kind:'درس تفاعلي كامل (متاح الآن)',
  isLesson1:true
 },
 {
  id:'lesson2',
   isLesson2:true,
  kicker:'الدرس 2',
  kickerCls:'',
  title:'الدرس 2: مقارنة الأعداد وترتيبها',
  sub:'المقارنة باستعمال لوحة المنازل وخط الأعداد والترتيب تصاعديًا وتنازليًا',
  desc:'في هذا الدرس ستقارن بين الأعداد ضمن الملايين باستعمال الرموز (> ، < ، =)، وترتّبها تصاعديًا وتنازليًا بالاعتماد على القيمة المنزلية التي أتقنتها في الدرس الأول.',
  duration:'15 محطة',
  points:'250 نقطة',
  kind:'درس تفاعلي في الوحدة الأولى',
  unlockReq:'لفتح «الدرس 2: مقارنة الأعداد وترتيبها»، أكمل أولاً جميع محطات «الدرس 1: القيمة المنزلية ضمن الملايين» العشرين.'
 },
 {
  id:'lesson3',
  isLesson3:true,
  kicker:'الدرس 3',
  kickerCls:'',
  title:'الدرس 3: جمع الأعداد الكلية وطرحها',
  sub:'تقدير نواتج الجمع والطرح وإيجاد الناتج الدقيق ضمن الملايين مع إعادة التجميع',
  desc:'في هذا الدرس ستتعلّم جمع الأعداد الكبيرة وطرحها عموديًا وأفقيًا ضمن الملايين، والتحقق من معقولية الإجابة بالتقدير.',
  duration:'16 محطة',
  points:'260 نقطة',
  kind:'درس تفاعلي في الوحدة الأولى',
  unlockReq:'لفتح «الدرس 3: جمع الأعداد الكلية وطرحها»، أكمل أولاً «الدرس 1» و«الدرس 2: مقارنة الأعداد وترتيبها».'
 },
 {
  id:'lesson4',
  isLesson4:true,
  kicker:'الدرس 4',
  kickerCls:'',
  title:'الدرس 4: الأعداد السالبة',
  sub:'تعرّف الأعداد السالبة وتمثيلها على خط الأعداد في درجات الحرارة والارتفاعات',
  desc:'في هذا الدرس ستستكشف الأعداد الأقل من الصفر (الأعداد السالبة)، وتمثّلها على خط الأعداد، وتفسّر معنى الصفر في المواقف الحياتية كدرجات الحرارة ومستوى سطح البحر.',
  duration:'14 محطة',
  points:'220 نقطة',
  kind:'درس تفاعلي في الوحدة الأولى',
  unlockReq:'لفتح «الدرس 4: الأعداد السالبة»، أكمل الدروس الثلاثة الأولى من الوحدة الأولى بالترتيب.'
 },
 {
  id:'lesson5',
  isLesson5:true,
  kicker:'الدرس 5',
  kickerCls:'strategy',
  title:'الدرس 5: خطة حل المسألة: أنشئ جدولاً',
  sub:'تنظيم المعطيات في جدول منظم لحل المسائل الحياتية متعددة الخطوات',
  desc:'في هذا الدرس ستتعلّم استراتيجية «إنشاء جدول» لتنظيم البيانات ومقارنتها والوصول إلى الحل الصحيح بخطوات واضحة.',
  duration:'10 محطات',
  points:'180 نقطة',
  kind:'خطة حل المسألة',
  unlockReq:'لفتح «الدرس 5: خطة حل المسألة: أنشئ جدولاً»، أكمل دروس الوحدة الأولى الأربعة السابقة.'
 },
 {
  id:'unit1_exam',
  isUnit1Exam:true,
  kicker:'تقويم ختامي',
  kickerCls:'exam',
  title:'اختبار نهاية الوحدة',
  sub:'اختبار شامل تفاعلي (21 سؤالاً) لقياس إتقان مهارات الوحدة الأولى: الأعداد جمعها وطرحها',
  desc:'يقيّم هذا الاختبار الشامل إتقانك لجميع مهارات الوحدة الأولى (ص 26–27) عبر 3 أقسام تدريبية تفاعلية واختبار شامل متواصل مع تقرير تشخيصي وشهادة الوحدة.',
  duration:'21 سؤالاً',
  points:'400 نقطة + شهادة الوحدة',
  kind:'اختبار نهاية الوحدة الأولى',
  unlockReq:'يفتح «اختبار نهاية الوحدة» بعد إتمام الدروس الخمسة في الوحدة الأولى (أو بتفعيل وضع الاختبار للمعلّم).'
 }
];
const DUO_LESSON_THEMES={
 lesson1:{key:'lesson1',num:1,shortLabel:'القيمة المنزلية',title:'القيمة المنزلية ضمن الملايين',pages:'8 – 11',bannerBg:'#116b55',bannerShadow:'#0a4637',bannerBorder:'#0d5644',tintBg:'#e8f5f0',accentText:'#0b4f3f',labLabel:'دليل الدرس'},
 lesson2:{key:'lesson2',num:2,shortLabel:'مقارنة الأعداد',title:'مقارنة الأعداد وترتيبها',pages:'12 – 15',bannerBg:'#0e6b74',bannerShadow:'#08484f',bannerBorder:'#0b575f',tintBg:'#e5f4f6',accentText:'#094b52',labLabel:'مختبر المقارنة'},
 lesson3:{key:'lesson3',num:3,shortLabel:'الجمع والطرح',title:'جمع الأعداد الكلية وطرحها',pages:'16 – 19',bannerBg:'#276e43',bannerShadow:'#184a2c',bannerBorder:'#1f5a36',tintBg:'#e8f5ec',accentText:'#1a4f2f',labLabel:'مختبر العمليات'},
 lesson4:{key:'lesson4',num:4,shortLabel:'الأعداد السالبة',title:'الأعداد السالبة وخط الأعداد',pages:'20 – 23',bannerBg:'#255c82',bannerShadow:'#173d57',bannerBorder:'#1d4a69',tintBg:'#e7f1f8',accentText:'#19425e',labLabel:'مختبر السالبة'},
 lesson5:{key:'lesson5',num:5,shortLabel:'أنشئ جدولاً',title:'خطة حل المسألة: أنشئ جدولاً',pages:'24 – 25',bannerBg:'#7a4b8c',bannerShadow:'#512e5e',bannerBorder:'#643c73',tintBg:'#f3ebf7',accentText:'#553063',labLabel:'مختبر الجداول'},
 unit1_exam:{key:'unit1_exam',num:6,isExam:true,shortLabel:'اختبار الوحدة',title:'اختبار نهاية الوحدة الأولى',pages:'26 – 27',bannerBg:'#9a6814',bannerShadow:'#6b460a',bannerBorder:'#7d530e',tintBg:'#fbf3e1',accentText:'#6b460a',labLabel:'بوابة الاختبار'},
 u2_lesson1:{key:'u2_lesson1',num:1,unitNum:2,shortLabel:'الضرب الذهني',title:'الضرب الذهني (المضاعفة والتنصيف)',pages:'30 – 33',bannerBg:'#3b6b18',bannerShadow:'#1f3c0a',bannerBorder:'#2d5311',tintBg:'#eef6e6',accentText:'#25450d',labLabel:'مختبر الضرب الذهني'}
};
const DUO_LESSON_ORDER=['lesson1','lesson2','lesson3','lesson4','lesson5'];
function getDuoLessonTheme(key){
 return DUO_LESSON_THEMES[key]||DUO_LESSON_THEMES.lesson1;
}
function applyDuoLessonTheme(sub){
 const mapEl=$('duolingo-map');
 if(!mapEl)return;
 const theme=getDuoLessonTheme(DUO_LESSON_THEMES[sub]?sub:'lesson1');
 mapEl.dataset.activeLesson=theme.key;
 mapEl.style.setProperty('--duo-accent',theme.bannerBg);
 mapEl.style.setProperty('--duo-accent-shadow',theme.bannerShadow);
 mapEl.style.setProperty('--duo-accent-border',theme.bannerBorder);
 mapEl.style.setProperty('--duo-accent-tint',theme.tintBg);
 mapEl.style.setProperty('--duo-accent-text',theme.accentText);
}
function renderDuolingoStats(){
 const streakVal=typeof state==='object'&&state?(state.streak||0):0;
 const ptsVal=typeof totalPoints==='function'?totalPoints():0;
 const heartsVal=typeof state==='object'&&state?(typeof state.hearts==='number'?state.hearts:3):3;
 const statsHTML=''
  +'<span class="duo-stat-item is-streak" title="سلسلة الإجابات الصحيحة" aria-label="سلسلة الإجابات: '+ar(streakVal)+'">'
  +'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.5 2.2c.3 2.5-1.1 4.4-2.4 5.9C8.6 9.8 7 11.7 7 14.3A5.2 5.2 0 0 0 12.2 19.5c3 0 5.3-2.3 5.3-5.3 0-2.8-1.6-5.2-3.4-7-.4 1.3-1.2 2.2-2.2 2.6.8-1.9 1.3-4.6.6-7.6z"/></svg>'
  +'<bdi>'+ar(streakVal)+'</bdi>'
  +'</span>'
  +'<span class="duo-stat-item is-xp" title="مجموع نقاط الخبرة" aria-label="النقاط: '+ar(ptsVal)+' نقطة">'
  +'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><polygon points="12,2 14.8,8.7 22,9.4 16.5,14.1 18.2,21.2 12,17.4 5.8,21.2 7.5,14.1 2,9.4 9.2,8.7"/></svg>'
  +'<bdi>'+ar(ptsVal)+'</bdi>'
  +'</span>'
  +'<span class="duo-stat-item is-hearts" title="القلوب المتبقية" aria-label="القلوب: '+ar(heartsVal)+' من 3">'
  +'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-9.5-9A5.4 5.4 0 0 1 12 6.3a5.4 5.4 0 0 1 9.5 5.2c-2 4.3-9.5 9-9.5 9z"/></svg>'
  +'<bdi>'+ar(heartsVal)+'</bdi>'
  +'</span>';
 const mob=$('duo-mobile-stats');
 if(mob)mob.innerHTML=statsHTML;
 const rail=$('duo-rail-stats');
 if(rail)rail.innerHTML=statsHTML;
}
function renderQuickLessonStrip(sub,ovData){
 const strip=$('duo-quick-strip');if(!strip)return;
 const ov=ovData||getCurriculumOverviewData();
 strip.replaceChildren();
 const isUnit2Ctx=(sub==='u2_sections'||sub==='u2_lesson1');
 const isOverview=(sub==='sections'||sub==='units'||sub==='u2_sections');
 const unitsBtn=document.createElement('button');
 unitsBtn.type='button';
 unitsBtn.className='duo-qchip is-overview'+(isOverview?' is-active':'');
 if(isOverview)unitsBtn.setAttribute('aria-current','page');
 unitsBtn.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>'
  +'<span>الأقسام</span>';
 unitsBtn.addEventListener('click',()=>{
  setMapSubView((sub==='sections'||sub==='u2_sections')?'units':(isUnit2Ctx?'u2_sections':'sections'),true);
 });
 strip.append(unitsBtn);

 if(isUnit2Ctx){
  const u2ProjBtn=document.createElement('button');
  u2ProjBtn.type='button';
  const projDone=Boolean(state.unit2ProjectDone);
  u2ProjBtn.className='duo-qchip'+(projDone?' is-done':'');
  u2ProjBtn.style.setProperty('--chip-accent','#3b6b18');
  u2ProjBtn.style.setProperty('--chip-shadow','#1f3c0a');
  u2ProjBtn.style.setProperty('--chip-tint','#eef6e6');
  u2ProjBtn.innerHTML='<span class="duo-qchip-num" aria-hidden="true">'+(projDone?'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>')+'</span>'
   +'<span class="duo-qchip-lbl">مشروع الوحدة 2</span>';
  u2ProjBtn.addEventListener('click',()=>activateCurriculumItem('u2_project'));
  strip.append(u2ProjBtn);

  const theme=DUO_LESSON_THEMES.u2_lesson1;
  const m=ov.u2_lesson1||computeItemProgressMetrics(0,11,false,false);
  const isActive=sub==='u2_lesson1';
  const isDone=m.statusKey==='completed';
  const isLocked=m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-qchip'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
  btn.dataset.lessonTarget='u2_lesson1';
  btn.style.setProperty('--chip-accent',theme.bannerBg);
  btn.style.setProperty('--chip-shadow',theme.bannerShadow);
  btn.style.setProperty('--chip-tint',theme.tintBg);
  if(isActive)btn.setAttribute('aria-current','page');
  btn.innerHTML='<span class="duo-qchip-num" aria-hidden="true"><bdi>1</bdi></span><span class="duo-qchip-lbl">'+theme.shortLabel+'</span>';
  btn.addEventListener('click',()=>activateCurriculumItem('u2_lesson1'));
  strip.append(btn);

  const backU1=document.createElement('button');
  backU1.type='button';
  backU1.className='duo-qchip';
  backU1.innerHTML='<span class="duo-qchip-num" aria-hidden="true"><bdi>1</bdi></span><span class="duo-qchip-lbl">الوحدة 1</span>';
  backU1.addEventListener('click',()=>setMapSubView('sections',true));
  strip.append(backU1);

  requestAnimationFrame(()=>{
   const activeChip=strip.querySelector('.duo-qchip.is-active');
   if(activeChip&&typeof activeChip.scrollIntoView==='function'){
    try{activeChip.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});}catch{}
   }
  });
  return;
 }

 DUO_LESSON_ORDER.forEach(key=>{
  const theme=DUO_LESSON_THEMES[key];
  const m=ov[key]||computeItemProgressMetrics(0,10,true,false);
  const isActive=sub===key;
  const isDone=m.statusKey==='completed';
  const isLocked=m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-qchip'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
  btn.dataset.lessonTarget=key;
  btn.style.setProperty('--chip-accent',theme.bannerBg);
  btn.style.setProperty('--chip-shadow',theme.bannerShadow);
  btn.style.setProperty('--chip-tint',theme.tintBg);
  if(isActive)btn.setAttribute('aria-current','page');
  const numHTML=isDone
   ?'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :(isLocked
    ?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
    :'<bdi>'+ar(theme.num)+'</bdi>');
  btn.innerHTML='<span class="duo-qchip-num" aria-hidden="true">'+numHTML+'</span>'
   +'<span class="duo-qchip-lbl">'+theme.shortLabel+'</span>';
  btn.addEventListener('click',()=>activateCurriculumItem(key));
  strip.append(btn);
 });

 /* Append Unit 1 End-of-Unit Exam chip */
 {
  const theme=DUO_LESSON_THEMES.unit1_exam;
  const m=ov.unit1_exam||computeItemProgressMetrics(0,21,false,false);
  const isActive=sub==='unit1_exam';
  const isDone=m.statusKey==='completed';
  const isLocked=m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-qchip'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
  btn.dataset.lessonTarget='unit1_exam';
  btn.style.setProperty('--chip-accent',theme.bannerBg);
  btn.style.setProperty('--chip-shadow',theme.bannerShadow);
  btn.style.setProperty('--chip-tint',theme.tintBg);
  if(isActive)btn.setAttribute('aria-current','page');
  const icoHTML=isDone
   ?'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :(isLocked
    ?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
    :'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>');
  btn.innerHTML='<span class="duo-qchip-num" aria-hidden="true">'+icoHTML+'</span>'
   +'<span class="duo-qchip-lbl">'+theme.shortLabel+'</span>';
  btn.addEventListener('click',()=>activateCurriculumItem('unit1_exam'));
  strip.append(btn);
 }

 /* Append Unit 2 quick shortcut chip */
 {
  const u2m=ov.unit2||computeItemProgressMetrics(0,12,false,false);
  const u2Locked=u2m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-qchip'+(u2Locked?' is-locked':'');
  btn.dataset.lessonTarget='u2_sections';
  btn.style.setProperty('--chip-accent','#3b6b18');
  btn.style.setProperty('--chip-shadow','#1f3c0a');
  btn.style.setProperty('--chip-tint','#eef6e6');
  const numIco=u2Locked
   ?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
   :'<bdi>2</bdi>';
  btn.innerHTML='<span class="duo-qchip-num" aria-hidden="true">'+numIco+'</span>'
   +'<span class="duo-qchip-lbl">الوحدة 2</span>';
  btn.addEventListener('click',()=>activateCurriculumItem('u2_sections'));
  strip.append(btn);
 }

 requestAnimationFrame(()=>{
  const activeChip=strip.querySelector('.duo-qchip.is-active');
  if(activeChip&&typeof activeChip.scrollIntoView==='function'){
   try{activeChip.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});}catch{}
  }
 });
}
function renderCompanionRail(sub,ovData){
 const list=$('duo-rail-lessons');if(!list)return;
 const ov=ovData||getCurriculumOverviewData();
 const isUnit2Ctx=(sub==='u2_sections'||sub==='u2_lesson1');
 list.replaceChildren();
 const railTitle=$('duo-rail-roadmap-title');
 if(railTitle)railTitle.innerHTML=isUnit2Ctx?'دروس الوحدة <bdi>2</bdi>':'دروس الوحدة <bdi>1</bdi>';

 if(isUnit2Ctx){
  const u2Items=[
   {key:'u2_project',label:'مشروع الوحدة 2',m:ov.u2_project,accent:'#3b6b18',tint:'#eef6e6',isProj:true},
   {key:'u2_lesson1',label:'الدرس 1: الضرب الذهني',m:ov.u2_lesson1,accent:'#3b6b18',tint:'#eef6e6',num:1}
  ];
  u2Items.forEach(row=>{
   const m=row.m||computeItemProgressMetrics(0,1,false,false);
   const isActive=sub===row.key;
   const isDone=m.statusKey==='completed';
   const isLocked=m.statusKey==='locked';
   const btn=document.createElement('button');
   btn.type='button';
   btn.className='duo-rail-lesson-btn'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
   btn.style.setProperty('--row-accent',row.accent);
   btn.style.setProperty('--row-tint',row.tint);
   if(isActive)btn.setAttribute('aria-current','page');
   const badgeInner=isDone
    ?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
    :(row.isProj?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>':'<bdi>'+ar(row.num)+'</bdi>');
   btn.innerHTML='<span class="duo-rl-badge" aria-hidden="true">'+badgeInner+'</span>'
    +'<span class="duo-rl-body">'
    +'<strong class="duo-rl-title">'+row.label+'</strong>'
    +'<span class="duo-rl-bar-row"><span class="duo-rl-track"><i style="width:'+m.pct+'%"></i></span><small><bdi>'+ar(m.pct)+'%</bdi></small></span>'
    +'</span>';
   btn.addEventListener('click',()=>activateCurriculumItem(row.key));
   list.append(btn);
  });
  const allUnitsBtn=$('duo-rail-all-units');
  if(allUnitsBtn)allUnitsBtn.textContent='كل الوحدات';
  const pctEl=$('duo-rail-unit-pct');
  if(pctEl)pctEl.innerHTML='<bdi>'+ar(ov.unit2.pct)+'%</bdi>';
  const barEl=$('duo-rail-unit-bar');
  if(barEl)barEl.innerHTML='<div class="duo-rail-unit-track" role="progressbar" aria-label="تقدم الوحدة الثانية: '+ar(ov.unit2.pct)+' في المئة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+ov.unit2.pct+'"><i style="width:'+ov.unit2.pct+'%"></i></div>';
  const capEl=$('duo-rail-unit-caption');
  if(capEl)capEl.textContent='أنجزت '+ar(ov.unit2.done)+' من '+ar(ov.unit2.total)+' محطة في الوحدة الثانية.';
  return;
 }
 DUO_LESSON_ORDER.forEach(key=>{
  const theme=DUO_LESSON_THEMES[key];
  const m=ov[key]||computeItemProgressMetrics(0,10,true,false);
  const isActive=sub===key;
  const isDone=m.statusKey==='completed';
  const isLocked=m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-rail-lesson-btn'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
  btn.style.setProperty('--row-accent',theme.bannerBg);
  btn.style.setProperty('--row-tint',theme.tintBg);
  if(isActive)btn.setAttribute('aria-current','page');
  const badgeInner=isDone
   ?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :(isLocked
    ?'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
    :'<bdi>'+ar(theme.num)+'</bdi>');
  btn.innerHTML='<span class="duo-rl-badge" aria-hidden="true">'+badgeInner+'</span>'
   +'<span class="duo-rl-body">'
   +'<strong class="duo-rl-title">'+theme.shortLabel+'</strong>'
   +'<span class="duo-rl-bar-row"><span class="duo-rl-track"><i style="width:'+m.pct+'%"></i></span><small><bdi>'+ar(m.pct)+'%</bdi></small></span>'
   +'</span>';
  btn.addEventListener('click',()=>activateCurriculumItem(key));
  list.append(btn);
 });

 /* Append Unit 1 End-of-Unit Exam row in companion rail */
 {
  const theme=DUO_LESSON_THEMES.unit1_exam;
  const m=ov.unit1_exam||computeItemProgressMetrics(0,21,false,false);
  const isActive=sub==='unit1_exam';
  const isDone=m.statusKey==='completed';
  const isLocked=m.statusKey==='locked';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='duo-rail-lesson-btn'+(isActive?' is-active':'')+(isDone?' is-done':'')+(isLocked?' is-locked':'');
  btn.style.setProperty('--row-accent',theme.bannerBg);
  btn.style.setProperty('--row-tint',theme.tintBg);
  if(isActive)btn.setAttribute('aria-current','page');
  const badgeInner=isDone
   ?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :(isLocked
    ?'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
    :'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>');
  btn.innerHTML='<span class="duo-rl-badge" aria-hidden="true">'+badgeInner+'</span>'
   +'<span class="duo-rl-body">'
   +'<strong class="duo-rl-title">'+theme.shortLabel+'</strong>'
   +'<span class="duo-rl-bar-row"><span class="duo-rl-track"><i style="width:'+m.pct+'%"></i></span><small><bdi>'+ar(m.pct)+'%</bdi></small></span>'
   +'</span>';
  btn.addEventListener('click',()=>activateCurriculumItem('unit1_exam'));
  list.append(btn);
 }

 const allUnitsBtn=$('duo-rail-all-units');
 if(allUnitsBtn){
  allUnitsBtn.textContent=sub==='units'?'دروس القسم 1':'كل الوحدات';
 }
 const pctEl=$('duo-rail-unit-pct');
 if(pctEl)pctEl.innerHTML='<bdi>'+ar(ov.unit1.pct)+'%</bdi>';
 const barEl=$('duo-rail-unit-bar');
 if(barEl){
  barEl.innerHTML='<div class="duo-rail-unit-track" role="progressbar" aria-label="تقدم الوحدة الأولى: '+ar(ov.unit1.pct)+' في المئة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+ov.unit1.pct+'"><i style="width:'+ov.unit1.pct+'%"></i></div>';
 }
 const capEl=$('duo-rail-unit-caption');
 if(capEl){
  capEl.textContent='أنجزت '+ar(ov.unit1.done)+' من '+ar(ov.unit1.total)+' محطة في الوحدة الأولى.';
 }
}
function renderNextLessonCard(sub){
 const box=$('duo-next-lesson-card');if(!box)return;
 if(sub==='u2_lesson1'){
  box.hidden=false;
  box.style.setProperty('--next-accent','#3b6b18');
  box.style.setProperty('--next-shadow','#1f3c0a');
  box.style.setProperty('--next-tint','#eef6e6');
  box.innerHTML='<div class="duo-next-copy">'
   +'<span class="duo-next-kicker">الوحدة 2 · الضرب والقسمة</span>'
   +'<h3 class="duo-next-title">مشروع الوحدة 2: الضرب بالخطوط والطريقة الشبكية</h3>'
   +'</div>'
   +'<button type="button" class="duo-next-cta" data-next-target="u2_project">استكشف مشروع الوحدة 2 ←</button>';
  box.querySelector('[data-next-target]').addEventListener('click',()=>activateCurriculumItem('u2_project'));
  return;
 }
 const idx=DUO_LESSON_ORDER.indexOf(sub);
 if(idx<0){
  box.hidden=true;
  box.replaceChildren();
  return;
 }
 box.hidden=false;
 if(idx<DUO_LESSON_ORDER.length-1){
  const nextKey=DUO_LESSON_ORDER[idx+1];
  const nextTheme=DUO_LESSON_THEMES[nextKey];
  box.style.setProperty('--next-accent',nextTheme.bannerBg);
  box.style.setProperty('--next-shadow',nextTheme.bannerShadow);
  box.style.setProperty('--next-tint',nextTheme.tintBg);
  box.innerHTML='<div class="duo-next-copy">'
   +'<span class="duo-next-kicker">الدرس التالي · الدرس <bdi>'+ar(nextTheme.num)+'</bdi> من <bdi>5</bdi></span>'
   +'<h3 class="duo-next-title">'+nextTheme.title+'</h3>'
   +'</div>'
   +'<button type="button" class="duo-next-cta" data-next-target="'+nextKey+'">انتقل إلى الدرس <bdi>'+ar(nextTheme.num)+'</bdi> ←</button>';
  box.querySelector('[data-next-target]').addEventListener('click',()=>activateCurriculumItem(nextKey));
 }else{
  const examOpen=typeof isUnit1ExamUnlocked==='function'&&isUnit1ExamUnlocked();
  box.style.setProperty('--next-accent','#9a6814');
  box.style.setProperty('--next-shadow','#6b460a');
  box.style.setProperty('--next-tint','#fbf3e1');
  box.innerHTML='<div class="duo-next-copy">'
   +'<span class="duo-next-kicker">ختام الوحدة الأولى · ص <bdi>26 – 27</bdi></span>'
   +'<h3 class="duo-next-title">اختبار نهاية الوحدة الأولى (21 سؤالاً)</h3>'
   +'</div>'
   +'<button type="button" class="duo-next-cta" data-next-target="unit1_exam">'+(examOpen?'افتح اختبار نهاية الوحدة ←':'عرض شروط فتح الاختبار ←')+'</button>';
  box.querySelector('[data-next-target]').addEventListener('click',()=>activateCurriculumItem('unit1_exam'));
 }
}
function updateStickyStageBanner(){
 if(state.viewMode!=='map')return;
 const sub=state.mapSubView;
 if(!DUO_LESSON_THEMES[sub])return;
 const kickerEl=$('duo-sticky-kicker');
 const bannerEl=$('duo-lesson-topbar');
 if(!kickerEl||!bannerEl)return;
 if(sub==='unit1_exam'){
  kickerEl.textContent='القسم 1 · التقويم الختامي للوحدة الأولى';
  return;
 }
 const theme=getDuoLessonTheme(sub);
 const stages=Array.from(document.querySelectorAll('#duo-units .dp-unit[data-stage-num]'));
 if(!stages.length){
  kickerEl.textContent='القسم 1 · الدرس '+ar(theme.num)+' من 5';
  return;
 }
 const bannerRect=bannerEl.getBoundingClientRect();
 const threshold=Math.max(120,bannerRect.bottom+24);
 let activeStage=stages[0];
 for(let i=0;i<stages.length;i++){
  const r=stages[i].getBoundingClientRect();
  if(r.top<=threshold){
   activeStage=stages[i];
  }else{
   break;
  }
 }
 const stNum=activeStage.dataset.stageNum||'1';
 const stTotal=activeStage.dataset.stageTotal||String(stages.length);
 const stTitle=activeStage.dataset.stageTitle||'';
 const unitPrefix=theme.unitNum===2?'القسم 2 · الوحدة 2 · الدرس 1':'القسم 1 · الدرس '+ar(theme.num);
 kickerEl.textContent=stTitle
  ?(unitPrefix+' · المرحلة '+ar(stNum)+' من '+ar(stTotal)+' — '+stTitle)
  :(theme.unitNum===2?'القسم 2 · الوحدة 2 · الدرس 1':'القسم 1 · الدرس '+ar(theme.num)+' من 5');
}
const UPCOMING_SECTIONS=[
 {
  id:'sec3',
  secNum:3,
  title:'القسم 3 · الوحدة 3: خصائص الأعداد',
  sub:'قابلية القسمة، العوامل والمضاعفات، الأعداد الأولية وغير الأولية، والتحليل إلى العوامل',
  desc:'يتناول القسم الثالث (الوحدة الثالثة من الكتاب) خصائص الأعداد وقابلية القسمة على 2 و3 و5 و10، والعوامل والمضاعفات، واختبار نهاية الوحدة الثالثة.',
  unlockReq:'يفتح «القسم 3 (الوحدة 3: خصائص الأعداد)» بعد إتمام القسم الثاني.'
 }
];
function setMapSubView(sub,autoScroll=true){
 const allowed=['lesson1','lesson2','lesson3','lesson4','lesson5','unit1_exam','units','u2_sections','u2_lesson1'];
 state.mapSubView=allowed.includes(sub)?sub:'sections';
 if(state.mapSubView==='unit1_exam'&&typeof isUnit1ExamUnlocked==='function'&&!isUnit1ExamUnlocked()){
  state.mapSubView='sections';
 }
 if((state.mapSubView==='u2_sections'||state.mapSubView==='u2_lesson1')&&typeof isUnit2Unlocked==='function'&&!isUnit2Unlocked()){
  state.mapSubView='units';
 }
 if(state.mapSubView.startsWith('lesson')||state.mapSubView==='u2_lesson1'){
  state.lastActiveLesson=state.mapSubView;
 }
 closeAllNodePopovers();
 renderDuolingoMap();
 saveState();
 if(typeof window.notifyAiTutorContextChanged==='function')window.notifyAiTutorContextChanged();
 if(state.mapSubView==='lesson1'||state.mapSubView==='lesson2'||state.mapSubView==='lesson3'||state.mapSubView==='lesson4'||state.mapSubView==='lesson5'||state.mapSubView==='u2_lesson1'){
  requestAnimationFrame(()=>{
   updatePathTrackSVGs();
   if(autoScroll){
    setTimeout(()=>{
     scrollToCurrentStation(true);
     updateJumpButton();
     updatePathTrackSVGs();
    },60);
   }else{
    updateJumpButton();
   }
  });
 }else{
  updateJumpButton();
  if(autoScroll)window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
 }
}
function activateCurriculumItem(itemId){
 if(itemId==='lesson1'){
  setMapSubView('lesson1',true);
 }else if(itemId==='lesson2'){
  if(typeof isLesson2Unlocked==='function'&&isLesson2Unlocked())setMapSubView('lesson2',true);
  else showCurriculumSheet('lesson2');
 }else if(itemId==='lesson3'){
  if(typeof isLesson3Unlocked==='function'&&isLesson3Unlocked())setMapSubView('lesson3',true);
  else showCurriculumSheet('lesson3');
 }else if(itemId==='lesson4'){
  if(typeof isLesson4Unlocked==='function'&&isLesson4Unlocked())setMapSubView('lesson4',true);
  else showCurriculumSheet('lesson4');
 }else if(itemId==='lesson5'){
  if(typeof isLesson5Unlocked==='function'&&isLesson5Unlocked())setMapSubView('lesson5',true);
  else showCurriculumSheet('lesson5');
 }else if(itemId==='unit1_exam'){
  if(typeof isUnit1ExamUnlocked==='function'&&isUnit1ExamUnlocked())setMapSubView('unit1_exam',true);
  else showCurriculumSheet('unit1_exam');
 }else if(itemId==='u2_sections'||itemId==='sec2'){
  if(typeof isUnit2Unlocked==='function'&&isUnit2Unlocked())setMapSubView('u2_sections',true);
  else showCurriculumSheet('sec2');
 }else if(itemId==='u2_project'){
  if(typeof isUnit2Unlocked==='function'&&!isUnit2Unlocked()){
   showCurriculumSheet('sec2');
  }else if(typeof openUnit2Project==='function'){
   openUnit2Project('overview');
  }else{
   showCurriculumSheet('u2_project');
  }
 }else if(itemId==='u2_lesson1'){
  if(typeof isU2L1Unlocked==='function'&&isU2L1Unlocked())setMapSubView('u2_lesson1',true);
  else showCurriculumSheet('u2_lesson1');
 }else{
  showCurriculumSheet(itemId);
 }
}
function renderSectionsOverview(){
 const root=$('duo-sections-root');if(!root)return;
 root.replaceChildren();
 const ov=getCurriculumOverviewData();
 const resume=getResumeLessonInfo(ov);

 if(state.mapSubView==='units'){
  const welcome=document.createElement('section');
  welcome.className='overview-welcome-banner';
  welcome.setAttribute('aria-label','ترحيب الكتاب التفاعلي');
  welcome.innerHTML='<span class="overview-welcome-owl" aria-hidden="true">'+renderDuoOwlSVG()+'</span>'
   +'<div class="overview-welcome-copy">'
   +'<strong>أهلاً بك في كتاب الرياضيات التفاعلي</strong>'
   +'<p>اختر القسم الدراسي لمتابعة الدروس والمحطات التفاعلية خطوة بخطوة.</p>'
   +'</div>';
  root.append(welcome);

  const grid=document.createElement('div');
  grid.className='duo-cards-grid';

  const sec1Card=document.createElement('article');
  sec1Card.className='duo-sec-card is-current span-full';
  sec1Card.innerHTML='<div class="duo-sec-top">'
   +'<span class="duo-sec-badge" aria-hidden="true">'+renderCardBadgeContent('section',1)+'</span>'
   +'<div class="duo-sec-headings">'
   +'<div class="duo-sec-meta-line">'
   +'<span class="duo-sec-kicker">الوحدة <bdi>1</bdi> · <bdi>5</bdi> دروس تفاعلية</span>'
   +'<span class="duo-sec-status status-'+ov.unit1.statusKey+'">'+ov.unit1.statusLabel+'</span>'
   +'</div>'
   +'<h2 class="duo-sec-title">القسم 1: الأعداد: جمعها وطرحها</h2>'
   +'<p class="duo-sec-desc">القيمة المنزلية ضمن الملايين، مقارنة الأعداد وترتيبها، الجمع والطرح، والأعداد السالبة.</p>'
   +'</div>'
   +'</div>'
   +'<div class="duo-sec-footer">'
   +renderDuoProgBarHTML(ov.unit1.pct)
   +'<button type="button" class="duo-sec-cta-btn" data-open-sec="sections">'+ov.unit1.actionLabel+'</button>'
   +'</div>';
  sec1Card.querySelector('[data-open-sec="sections"]').addEventListener('click',()=>setMapSubView('sections',true));
  grid.append(sec1Card);

  /* القسم 2 · الوحدة 2: الضرب والقسمة (مفتوحة بعد اجتياز اختبار الوحدة 1 أو في وضع الاختبار) */
  const u2Unlocked=typeof isUnit2Unlocked==='function'?isUnit2Unlocked():false;
  const sec2Card=document.createElement('article');
  sec2Card.className='duo-sec-card span-full'+(u2Unlocked?'':' is-locked');
  sec2Card.dataset.unitCard='unit2';
  sec2Card.innerHTML='<div class="duo-sec-top">'
   +'<span class="duo-sec-badge" aria-hidden="true">'+renderCardBadgeContent(u2Unlocked?'section':'locked',2)+'</span>'
   +'<div class="duo-sec-headings">'
   +'<div class="duo-sec-meta-line">'
   +'<span class="duo-sec-kicker">الوحدة <bdi>2</bdi> · مشروع الوحدة + الدرس <bdi>1</bdi> التفاعلي</span>'
   +'<span class="duo-sec-status status-'+ov.unit2.statusKey+'">'+ov.unit2.statusLabel+'</span>'
   +'</div>'
   +'<h2 class="duo-sec-title">القسم 2: الضرب والقسمة</h2>'
   +'<p class="duo-sec-desc">الضرب الذهني بالمضاعفة والتنصيف (ص 30–33)، ومشروع الضرب بالخطوط والطريقة الشبكية (ص 28–29).</p>'
   +'</div>'
   +'</div>'
   +'<div class="duo-sec-footer">'
   +renderDuoProgBarHTML(ov.unit2.pct)
   +'<button type="button" class="duo-sec-cta-btn" data-open-sec="u2_sections">'+(u2Unlocked?ov.unit2.actionLabel:'شروط الفتح')+'</button>'
   +'</div>';
  sec2Card.querySelector('[data-open-sec="u2_sections"]').addEventListener('click',()=>activateCurriculumItem('u2_sections'));
  grid.append(sec2Card);

  UPCOMING_SECTIONS.forEach(secItem=>{
   const m=computeItemProgressMetrics(0,15,false,false);
   const cleanSecTitle=secItem.title.replace('· الوحدة '+secItem.secNum,'').trim();
   const card=document.createElement('article');
   card.className='duo-sec-card is-locked';
   card.innerHTML='<div class="duo-sec-top">'
    +'<span class="duo-sec-badge" aria-hidden="true">'+renderCardBadgeContent('locked',secItem.secNum)+'</span>'
    +'<div class="duo-sec-headings">'
    +'<div class="duo-sec-meta-line">'
    +'<span class="duo-sec-kicker">الوحدة <bdi>'+ar(secItem.secNum)+'</bdi></span>'
    +'<span class="duo-sec-status status-locked">'+m.statusLabel+'</span>'
    +'</div>'
    +'<h2 class="duo-sec-title">'+cleanSecTitle+'</h2>'
    +'<p class="duo-sec-desc">'+secItem.sub+'</p>'
    +'</div>'
    +'</div>'
    +'<div class="duo-sec-footer">'
    +renderDuoProgBarHTML(0)
    +'<button type="button" class="duo-sec-cta-btn">'+m.actionLabel+'</button>'
    +'</div>';
   card.querySelector('.duo-sec-cta-btn').addEventListener('click',()=>showCurriculumSheet(secItem.id));
   grid.append(card);
  });
  root.append(grid);
  return;
 }

 /* المستوى الثاني (ب): فهرس دروس القسم 2 (الوحدة الثانية: الضرب والقسمة) */
 if(state.mapSubView==='u2_sections'){
  const backBar=document.createElement('div');
  backBar.className='duo-sec-backbar';
  backBar.innerHTML='<button type="button" class="duo-sec-backbtn" id="duo-u2-to-units-btn"><span aria-hidden="true">→</span><span>جميع الأقسام</span></button>'
   +'<span class="duo-sec-backbar-ctx">الوحدة <bdi>2</bdi> · القسم <bdi>2</bdi>: الضرب والقسمة</span>';
  backBar.querySelector('#duo-u2-to-units-btn').addEventListener('click',()=>setMapSubView('units',true));
  root.append(backBar);

  const welcome=document.createElement('section');
  welcome.className='overview-welcome-banner';
  welcome.setAttribute('aria-label','إرشاد الوحدة الثانية');
  welcome.innerHTML='<span class="overview-welcome-owl" aria-hidden="true">'+renderDuoOwlSVG()+'</span>'
   +'<div class="overview-welcome-copy">'
   +'<strong>الوحدة 2: الضرب والقسمة</strong>'
   +'<p>ابدأ بمشروع الوحدة (الضرب بالخطوط والشبكية ص 28–29) ثم أتقن الدرس 1: الضرب الذهني بالمضاعفة والتنصيف.</p>'
   +'</div>';
  root.append(welcome);

  const u2Front=typeof currentU2L1Frontier==='function'?currentU2L1Frontier():0;
  const u2Node=(typeof U2L1_NODES!=='undefined'&&U2L1_NODES[u2Front])?U2L1_NODES[u2Front]:{title:'أستكشف وأتعلّم'};
  const resumeCard=document.createElement('section');
  resumeCard.className='continue-learning-card';
  resumeCard.setAttribute('aria-label','تابع الدرس الأول في الوحدة الثانية');
  resumeCard.innerHTML='<div class="clc-top">'
   +'<div class="clc-copy">'
   +'<span class="clc-kicker">الوحدة 2 · الدرس 1</span>'
   +'<h2 class="clc-title">الضرب الذهني (المضاعفة والتنصيف)</h2>'
   +'<p class="clc-station">المحطة <bdi>'+ar(u2Front+1)+'</bdi> من <bdi>11</bdi>: '+u2Node.title+'</p>'
   +'</div>'
   +'<button type="button" class="clc-cta-btn" id="u2-resume-btn">'+(ov.u2_lesson1.done>0?'متابعة التعلم':'ابدأ الدرس 1')+'</button>'
   +'</div>'
   +renderDuoProgBarHTML(ov.u2_lesson1.pct);
  resumeCard.querySelector('#u2-resume-btn').addEventListener('click',()=>setMapSubView('u2_lesson1',true));
  root.append(resumeCard);

  const grid=document.createElement('div');
  grid.className='duo-cards-grid';
  const u2List=typeof UNIT2_CURRICULUM!=='undefined'?UNIT2_CURRICULUM:[];
  u2List.forEach((item,idx)=>{
   const isProj=item.id==='u2_project';
   const isL1=item.id==='u2_lesson1';
   const m=isProj?ov.u2_project:(isL1?ov.u2_lesson1:computeItemProgressMetrics(0,10,false,false));
   const badgeType=isProj?'project':(item.isUpcoming?'locked':'lesson');
   const badgeNum=isL1?1:idx;
   const card=document.createElement('article');
   card.className='duo-sec-card'
    +(isL1?' is-current':'')
    +(isProj?' is-project':'')
    +(item.isUpcoming?' is-locked':'');
   card.dataset.curriculumId=item.id;
   card.innerHTML='<div class="duo-sec-top">'
    +'<span class="duo-sec-badge" aria-hidden="true">'+renderCardBadgeContent(badgeType,badgeNum)+'</span>'
    +'<div class="duo-sec-headings">'
    +'<div class="duo-sec-meta-line">'
    +'<span class="duo-sec-kicker">'+item.kicker+(item.duration?' · <bdi>'+item.duration+'</bdi>':'')+'</span>'
    +'<span class="duo-sec-status status-'+(item.isUpcoming?'locked':m.statusKey)+'">'+(item.isUpcoming?'قريبًا':m.statusLabel)+'</span>'
    +'</div>'
    +'<h3 class="duo-sec-title">'+item.title+'</h3>'
    +'<p class="duo-sec-desc">'+item.sub+'</p>'
    +'</div>'
    +'</div>'
    +'<div class="duo-sec-footer">'
    +renderDuoProgBarHTML(m.pct)
    +'<button type="button" class="duo-sec-cta-btn" aria-label="'+(item.isUpcoming?'التفاصيل':m.actionLabel)+': '+item.title+'">'+(item.isUpcoming?'التفاصيل':(isProj?(state.unit2ProjectDone?'استعرض مجددًا':'افتح المشروع'):m.actionLabel))+'</button>'
    +'</div>';
   card.querySelector('.duo-sec-cta-btn').addEventListener('click',()=>activateCurriculumItem(item.id));
   grid.append(card);
  });
  root.append(grid);
  return;
 }

 /* المستوى الثاني: دروس القسم 1 (الوحدة الأولى) */
 const backBar=document.createElement('div');
 backBar.className='duo-sec-backbar';
 backBar.innerHTML='<button type="button" class="duo-sec-backbtn" id="duo-to-units-btn"><span aria-hidden="true">→</span><span>جميع الأقسام</span></button>'
  +'<span class="duo-sec-backbar-ctx">الوحدة <bdi>1</bdi> · القسم <bdi>1</bdi>: الأعداد: جمعها وطرحها</span>';
 backBar.querySelector('#duo-to-units-btn').addEventListener('click',()=>setMapSubView('units',true));
 root.append(backBar);

 const welcome=document.createElement('section');
 welcome.className='overview-welcome-banner';
 welcome.setAttribute('aria-label','إرشاد القسم الأول');
 welcome.innerHTML='<span class="overview-welcome-owl" aria-hidden="true">'+renderDuoOwlSVG()+'</span>'
  +'<div class="overview-welcome-copy">'
  +'<strong>رحلة الملايين خطوة بخطوة</strong>'
  +'<p>اختر درسك الحالي أو تابع مباشرة من آخر محطة وصلت إليها.</p>'
  +'</div>';
 root.append(welcome);

 const resumeCard=document.createElement('section');
 resumeCard.className='continue-learning-card';
 resumeCard.setAttribute('aria-label','أكمل من حيث توقفت');
 resumeCard.innerHTML='<div class="clc-top">'
  +'<div class="clc-copy">'
  +'<span class="clc-kicker">أكمل من حيث توقفت</span>'
  +'<h2 class="clc-title">'+resume.item.title+'</h2>'
  +'<p class="clc-station">المحطة <bdi>'+ar(resume.stationNum)+'</bdi> من <bdi>'+ar(resume.totalStations)+'</bdi>: '+resume.stationTitle+'</p>'
  +'</div>'
  +'<button type="button" class="clc-cta-btn" id="resume-learning-btn">متابعة التعلم</button>'
  +'</div>'
  +renderDuoProgBarHTML(resume.metrics.pct);
 resumeCard.querySelector('#resume-learning-btn').addEventListener('click',()=>setMapSubView(resume.key,true));
 root.append(resumeCard);

 const grid=document.createElement('div');
 grid.className='duo-cards-grid';

 const lessonNumMap={lesson1:1,lesson2:2,lesson3:3,lesson4:4,lesson5:5};
 UNIT1_CURRICULUM.forEach(item=>{
  const m=ov[item.id]||computeItemProgressMetrics(0,1,false,false);
  const isProj=item.id==='project';
  const isExam=item.id==='unit1_exam';
  const isCurrent=item.id===resume.key;
  const badgeType=isProj?'project':(isExam?'exam':(m.statusKey==='locked'?'locked':'lesson'));
  const badgeNum=lessonNumMap[item.id]||1;
  const card=document.createElement('article');
  card.className='duo-sec-card'
   +(isCurrent?' is-current':'')
   +(isProj?' is-project':'')
   +(m.statusKey==='locked'?' is-locked':'')
   +(isExam?' span-full':'');
  card.dataset.curriculumId=item.id;
  card.innerHTML='<div class="duo-sec-top">'
   +'<span class="duo-sec-badge" aria-hidden="true">'+renderCardBadgeContent(badgeType,badgeNum)+'</span>'
   +'<div class="duo-sec-headings">'
   +'<div class="duo-sec-meta-line">'
   +'<span class="duo-sec-kicker">'+item.kicker+(item.duration?' · <bdi>'+item.duration+'</bdi>':'')+'</span>'
   +'<span class="duo-sec-status status-'+m.statusKey+'">'+m.statusLabel+'</span>'
   +'</div>'
   +'<h3 class="duo-sec-title">'+item.title+'</h3>'
   +'<p class="duo-sec-desc">'+item.sub+'</p>'
   +'</div>'
   +'</div>'
   +'<div class="duo-sec-footer">'
   +renderDuoProgBarHTML(m.pct)
   +'<button type="button" class="duo-sec-cta-btn" aria-label="'+m.actionLabel+': '+item.title+'">'+m.actionLabel+'</button>'
   +'</div>';
  card.querySelector('.duo-sec-cta-btn').addEventListener('click',()=>activateCurriculumItem(item.id));
  grid.append(card);
 });
 root.append(grid);
}
let lessonPickerReturnFocus=true;
function renderLessonPickerSheet(){
 const body=$('lesson-picker-body');if(!body)return;
 body.replaceChildren();
 const ov=getCurriculumOverviewData();
 const sub=state.mapSubView||'sections';

 const quickSwitch=document.createElement('div');
 quickSwitch.className='lp-quick-switch';
 quickSwitch.innerHTML='<button type="button" class="lp-switch-btn'+(sub==='units'?' is-active':'')+'" data-lp-view="units"'+(sub==='units'?' aria-current="true"':'')+'>جميع الأقسام</button>'
  +'<button type="button" class="lp-switch-btn'+(sub==='sections'?' is-active':'')+'" data-lp-view="sections"'+(sub==='sections'?' aria-current="true"':'')+'>القسم 1 (الوحدة 1)</button>'
  +'<button type="button" class="lp-switch-btn'+(sub==='u2_sections'?' is-active':'')+'" data-lp-view="u2_sections"'+(sub==='u2_sections'?' aria-current="true"':'')+'>القسم 2 (الوحدة 2)</button>';
 quickSwitch.querySelectorAll('[data-lp-view]').forEach(btn=>{
  btn.addEventListener('click',()=>{
   const targetView=btn.dataset.lpView;
   closeLessonPickerSheet(true);
   if(targetView==='u2_sections')activateCurriculumItem('u2_sections');
   else setMapSubView(targetView,true);
  });
 });
 body.append(quickSwitch);

 const groupLbl=document.createElement('p');
 groupLbl.className='lp-group-label';
 groupLbl.textContent='الوحدة 1 · القسم 1: الأعداد: جمعها وطرحها';
 body.append(groupLbl);

 const list=document.createElement('div');
 list.className='lp-list';
 const lessonNumMap={lesson1:1,lesson2:2,lesson3:3,lesson4:4,lesson5:5};
 UNIT1_CURRICULUM.forEach(item=>{
  const m=ov[item.id]||computeItemProgressMetrics(0,1,false,false);
  const isActive=sub===item.id;
  const isProj=item.id==='project';
  const isExam=item.id==='unit1_exam';
  const badgeType=isProj?'project':(isExam?'exam':(m.statusKey==='locked'?'locked':'lesson'));
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='lp-item-btn'+(isActive?' is-active':'')+(m.statusKey==='locked'?' is-locked':'');
  if(isActive)btn.setAttribute('aria-current','true');
  btn.innerHTML='<div class="lp-item-top">'
   +'<div class="lp-item-head">'
   +'<span class="lp-item-num" aria-hidden="true">'+renderCardBadgeContent(badgeType,lessonNumMap[item.id]||1)+'</span>'
   +'<span class="lp-item-title">'+item.title+'</span>'
   +'</div>'
   +'<span class="lp-item-status">'+(isActive?'الدرس الحالي · ':'')+m.statusLabel+'</span>'
   +'</div>'
   +renderDuoProgBarHTML(m.pct);
  btn.addEventListener('click',()=>{
   const opensDirect=(item.id==='lesson1')
    ||(item.id==='lesson2'&&typeof isLesson2Unlocked==='function'&&isLesson2Unlocked())
    ||(item.id==='lesson3'&&typeof isLesson3Unlocked==='function'&&isLesson3Unlocked())
    ||(item.id==='lesson4'&&typeof isLesson4Unlocked==='function'&&isLesson4Unlocked())
    ||(item.id==='lesson5'&&typeof isLesson5Unlocked==='function'&&isLesson5Unlocked())
    ||(item.id==='unit1_exam'&&typeof isUnit1ExamUnlocked==='function'&&isUnit1ExamUnlocked());
   closeLessonPickerSheet(opensDirect);
   activateCurriculumItem(item.id);
  });
  list.append(btn);
 });
 body.append(list);

 /* الوحدة 2 · القسم 2 داخل مختار الدروس */
 const u2Lbl=document.createElement('p');
 u2Lbl.className='lp-group-label';
 u2Lbl.textContent='الوحدة 2 · القسم 2: الضرب والقسمة';
 body.append(u2Lbl);

 const u2ListEl=document.createElement('div');
 u2ListEl.className='lp-list';
 const u2Unlocked=typeof isUnit2Unlocked==='function'?isUnit2Unlocked():false;
 const u2ActiveItems=(typeof UNIT2_CURRICULUM!=='undefined'?UNIT2_CURRICULUM:[]).filter(it=>!it.isUpcoming);
 u2ActiveItems.forEach(item=>{
  const isProj=item.id==='u2_project';
  const m=isProj?ov.u2_project:ov.u2_lesson1;
  const isActive=sub===item.id;
  const badgeType=isProj?'project':(!u2Unlocked?'locked':'lesson');
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='lp-item-btn'+(isActive?' is-active':'')+(!u2Unlocked?' is-locked':'');
  if(isActive)btn.setAttribute('aria-current','true');
  btn.innerHTML='<div class="lp-item-top">'
   +'<div class="lp-item-head">'
   +'<span class="lp-item-num" aria-hidden="true">'+renderCardBadgeContent(badgeType,1)+'</span>'
   +'<span class="lp-item-title">'+item.title+'</span>'
   +'</div>'
   +'<span class="lp-item-status">'+(isActive?'الدرس الحالي · ':'')+m.statusLabel+'</span>'
   +'</div>'
   +renderDuoProgBarHTML(m.pct);
  btn.addEventListener('click',()=>{
   closeLessonPickerSheet(u2Unlocked);
   activateCurriculumItem(item.id);
  });
  u2ListEl.append(btn);
 });
 body.append(u2ListEl);
}
function openLessonPickerSheet(){
 const sheet=$('lesson-picker-sheet');if(!sheet)return;
 lessonPickerReturnFocus=true;
 renderLessonPickerSheet();
 const trigger=$('lesson-picker-btn');
 if(trigger)trigger.setAttribute('aria-expanded','true');
 if(!sheet.open)sheet.showModal();
 requestAnimationFrame(()=>{
  const activeBtn=sheet.querySelector('.lp-item-btn.is-active')||sheet.querySelector('.lp-switch-btn.is-active')||sheet.querySelector('.lp-item-btn');
  activeBtn?.focus();
 });
}
function closeLessonPickerSheet(restoreFocus=true){
 lessonPickerReturnFocus=restoreFocus;
 const sheet=$('lesson-picker-sheet');
 if(sheet&&sheet.open)sheet.close();
 const trigger=$('lesson-picker-btn');
 if(trigger)trigger.setAttribute('aria-expanded','false');
 if(restoreFocus){
  requestAnimationFrame(()=>trigger?.focus());
 }
}
let currentSheetCurriculumId=null;
function showCurriculumSheet(itemId){
 const sec2Meta={
  id:'sec2',
  secNum:2,
  kicker:'القسم 2 · الوحدة 2',
  title:'الوحدة 2: الضرب والقسمة',
  sub:'الضرب الذهني بالمضاعفة والتنصيف (ص 30–33)، ومشروع الضرب بالخطوط والشبكية (ص 28–29).',
  desc:'تتناول الوحدة الثانية مهارات الضرب الذهني بالمضاعفة والتنصيف، وتقدير النواتج، وضرب الأعداد الكلية وقسمتها، بدءًا من مشروع الوحدة (ص 28–29) والدرس 1: الضرب الذهني.',
  duration:'مشروع + الدرس 1 (11 محطة)',
  points:'245 نقطة',
  kind:'الوحدة الثانية (الضرب والقسمة)',
  unlockReq:'لفتح «القسم 2 (الوحدة 2: الضرب والقسمة)»، اجتز أولاً «اختبار نهاية الوحدة الأولى» (أو فعّل وضع الاختبار للمعلّم من قائمة المزيد).'
 };
 const u2List=typeof UNIT2_CURRICULUM!=='undefined'?UNIT2_CURRICULUM:[];
 const item=itemId==='sec2'
  ?sec2Meta
  :(UNIT1_CURRICULUM.find(x=>x.id===itemId)||u2List.find(x=>x.id===itemId)||UPCOMING_SECTIONS.find(x=>x.id===itemId));
 if(!item)return;
 currentSheetNodeId=null;
 currentSheetCurriculumId=itemId;
 const sheet=$('station-sheet');if(!sheet)return;
 const isProj=itemId==='project';
 const isDone=isProj&&state.unitProjectDone;
 $('st-sheet-badge').textContent=item.kicker||('القسم '+ar(item.secNum||2));
 const statusEl=$('st-sheet-status');
 const starsCard=$('st-sheet-stars-card');
 if(starsCard)starsCard.hidden=true;
 if(isProj){
  statusEl.textContent=isDone?'مكتمل 100%':'متاح الآن';
  statusEl.className='st-sheet-status '+(isDone?'done':'ready');
 }else{
  statusEl.textContent='مقفل حالياً';
  statusEl.className='st-sheet-status locked';
 }
 $('st-sheet-ico').innerHTML=getIconSVG('book');
 $('st-sheet-title').textContent=item.title;
 $('st-sheet-type').textContent=item.kind||'وحدة دراسية من الكتاب';
 $('st-sheet-desc').textContent=item.desc||item.sub;
 $('st-sheet-duration').textContent=item.duration||'5 دروس';
 $('st-sheet-points').innerHTML='<span class="btn-svg">'+getIconSVG('sparkle','gold')+'</span><span>'+(item.points||'500 نقطة')+'</span>';
 $('st-sheet-kind').textContent=item.kind||'وحدة دراسية';
 const lockSection=$('st-sheet-lock-info');
 const startBtn=$('st-sheet-start-btn');
 if(itemId==='lesson1'){
  const l1Done=PATH_NODES.filter(n=>isNodeCompleted(n.id)).length;
  statusEl.textContent=l1Done>=PATH_NODES.length?'مكتمل 100%':'متاح الآن';
  statusEl.className='st-sheet-status '+(l1Done>=PATH_NODES.length?'done':'ready');
  lockSection.hidden=true;
  startBtn.textContent=l1Done>0?'متابعة المحطة الحالية في الدرس 1':'ابدأ المحطة 1 في الدرس 1';
  startBtn.className='primary st-sheet-action-btn';
  startBtn.onclick=()=>{
   sheet.close();
   if(state.mapSubView!=='lesson1')setMapSubView('lesson1',true);
   else openNode(currentFrontierNodeId());
  };
  sheet.showModal();
  return;
 }
 if(itemId==='lesson2'){
  const isL2Open = typeof isLesson2Unlocked === 'function' && isLesson2Unlocked();
  const l2Done = typeof getLesson2DoneCount === 'function' ? getLesson2DoneCount() : 0;
  if(isL2Open){
   statusEl.textContent = l2Done >= 15 ? 'مكتمل 100%' : 'متاح الآن';
   statusEl.className = 'st-sheet-status ' + (l2Done >= 15 ? 'done' : 'ready');
   lockSection.hidden = true;
   startBtn.textContent = 'ابدأ مسار الدرس 2 (مقارنة الأعداد)';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => { sheet.close(); setMapSubView('lesson2', true); };
   sheet.showModal();
   return;
  } else {
   statusEl.textContent = 'متاح للتجربة والتعلم';
   statusEl.className = 'st-sheet-status ready';
   lockSection.hidden = false;
   $('st-sheet-lock-text').textContent = 'يُوصى بإتقان الدرس الأول أولاً، ويمكنك فتحه مباشرة الآن.';
   startBtn.textContent = 'فتح مسار الدرس 2 الآن';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => {
    sheet.close();
    const l2 = getLesson2State();
    l2.unlocked = true;
    saveState();
    setMapSubView('lesson2', true);
   };
   sheet.showModal();
   return;
  }
 }
 if(itemId==='lesson3'){
  const isL3Open = typeof isLesson3Unlocked === 'function' && isLesson3Unlocked();
  const l3Done = typeof getLesson3DoneCount === 'function' ? getLesson3DoneCount() : 0;
  if(isL3Open){
   statusEl.textContent = l3Done >= 16 ? 'مكتمل 100%' : 'متاح الآن';
   statusEl.className = 'st-sheet-status ' + (l3Done >= 16 ? 'done' : 'ready');
   lockSection.hidden = true;
   startBtn.textContent = 'ابدأ مسار الدرس 3 (الجمع والطرح)';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => { sheet.close(); setMapSubView('lesson3', true); };
   sheet.showModal();
   return;
  } else {
   statusEl.textContent = 'متاح للتجربة والتعلم';
   statusEl.className = 'st-sheet-status ready';
   lockSection.hidden = false;
   $('st-sheet-lock-text').textContent = 'يُوصى بإتقان الدرسين السابقين أولاً، ويمكنك فتحه مباشرة الآن.';
   startBtn.textContent = 'فتح مسار الدرس 3 الآن';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => {
    sheet.close();
    const l3 = getLesson3State();
    l3.unlocked = true;
    saveState();
    setMapSubView('lesson3', true);
   };
   sheet.showModal();
   return;
  }
 }
 if(itemId==='lesson4'){
  const isL4Open = typeof isLesson4Unlocked === 'function' && isLesson4Unlocked();
  const l4Done = typeof getLesson4DoneCount === 'function' ? getLesson4DoneCount() : 0;
  if(isL4Open){
   statusEl.textContent = l4Done >= 14 ? 'مكتمل 100%' : 'متاح الآن';
   statusEl.className = 'st-sheet-status ' + (l4Done >= 14 ? 'done' : 'ready');
   lockSection.hidden = true;
   startBtn.textContent = 'ابدأ مسار الدرس 4 (الأعداد السالبة)';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => { sheet.close(); setMapSubView('lesson4', true); };
   sheet.showModal();
   return;
  } else {
   statusEl.textContent = 'متاح للتجربة والتعلم';
   statusEl.className = 'st-sheet-status ready';
   lockSection.hidden = false;
   $('st-sheet-lock-text').textContent = 'يُوصى بإتقان الدروس السابقة أولاً، ويمكنك فتحه مباشرة الآن.';
   startBtn.textContent = 'فتح مسار الدرس 4 الآن';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => {
    sheet.close();
    const l4 = getLesson4State();
    l4.unlocked = true;
    saveState();
    setMapSubView('lesson4', true);
   };
   sheet.showModal();
   return;
  }
 }
 if(itemId==='lesson5'){
  const isL5Open = typeof isLesson5Unlocked === 'function' && isLesson5Unlocked();
  const l5Done = typeof getLesson5DoneCount === 'function' ? getLesson5DoneCount() : 0;
  if(isL5Open){
   statusEl.textContent = l5Done >= 10 ? 'مكتمل 100%' : 'متاح الآن';
   statusEl.className = 'st-sheet-status ' + (l5Done >= 10 ? 'done' : 'ready');
   lockSection.hidden = true;
   startBtn.textContent = 'ابدأ مسار الدرس 5 (أنشئ جدولاً)';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => { sheet.close(); setMapSubView('lesson5', true); };
   sheet.showModal();
   return;
  } else {
   statusEl.textContent = 'متاح للتجربة والتعلم';
   statusEl.className = 'st-sheet-status ready';
   lockSection.hidden = false;
   $('st-sheet-lock-text').textContent = 'يُوصى بإتقان الدروس السابقة أولاً، ويمكنك فتحه مباشرة الآن.';
   startBtn.textContent = 'فتح مسار الدرس 5 الآن';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => {
    sheet.close();
    const l5 = getLesson5State();
    l5.unlocked = true;
    saveState();
    setMapSubView('lesson5', true);
   };
   sheet.showModal();
   return;
  }
 }
 if(itemId==='unit1_exam'){
  const isExamOpen = typeof isUnit1ExamUnlocked === 'function' && isUnit1ExamUnlocked();
  const remLessons = typeof getUnit1ExamRemainingLessons === 'function' ? getUnit1ExamRemainingLessons() : [];
  const mastered = typeof getUnit1ExamMasteredCount === 'function' ? getUnit1ExamMasteredCount() : 0;
  if(isExamOpen){
   statusEl.textContent = mastered >= 21 ? 'مكتمل 100%' : 'متاح الآن';
   statusEl.className = 'st-sheet-status ' + (mastered >= 21 ? 'done' : 'ready');
   lockSection.hidden = true;
   startBtn.textContent = 'افتح بوابة اختبار نهاية الوحدة';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => { sheet.close(); setMapSubView('unit1_exam', true); };
   sheet.showModal();
   return;
  } else {
   statusEl.textContent = 'مقفل حتى إتمام الدروس الخمسة';
   statusEl.className = 'st-sheet-status locked';
   lockSection.hidden = false;
   const names = remLessons.map(r => r.title).join('، ');
   $('st-sheet-lock-text').textContent = remLessons.length
    ? ('لفتح اختبار نهاية الوحدة، أكمل الدروس المتبقية أولاً: ' + names + ' (أو فعّل «وضع الاختبار للمعلّم» من قائمة المزيد).')
    : item.unlockReq;
   const firstRem = remLessons[0];
   startBtn.textContent = firstRem ? ('انتقل إلى ' + firstRem.title) : 'العودة إلى دروس الوحدة';
   startBtn.className = 'primary st-sheet-action-btn';
   startBtn.onclick = () => {
    sheet.close();
    if(firstRem) setMapSubView(firstRem.key, true);
    else setMapSubView('sections', true);
   };
   sheet.showModal();
   return;
  }
 }
 if(itemId==='sec2'||itemId==='u2_lesson1'||itemId==='u2_project'){
  const u2Open=typeof isUnit2Unlocked==='function'&&isUnit2Unlocked();
  if(u2Open){
   statusEl.textContent='متاح الآن';
   statusEl.className='st-sheet-status ready';
   lockSection.hidden=true;
   startBtn.textContent=itemId==='u2_project'?'افتح مشروع الوحدة 2':(itemId==='u2_lesson1'?'افتح مسار الدرس 1 (الضرب الذهني)':'افتح الوحدة 2: الضرب والقسمة');
   startBtn.className='primary st-sheet-action-btn';
   startBtn.onclick=()=>{
    sheet.close();
    if(itemId==='u2_project'&&typeof openUnit2Project==='function')openUnit2Project('overview');
    else setMapSubView(itemId==='u2_lesson1'?'u2_lesson1':'u2_sections',true);
   };
   sheet.showModal();
   return;
  }else{
   statusEl.textContent='مقفل حتى اجتياز اختبار الوحدة 1';
   statusEl.className='st-sheet-status locked';
   lockSection.hidden=false;
   $('st-sheet-lock-text').textContent=item.unlockReq||'لفتح الوحدة الثانية، اجتز أولاً «اختبار نهاية الوحدة الأولى» (أو فعّل «وضع الاختبار للمعلّم» من قائمة المزيد).';
   const u1ExamOpen=typeof isUnit1ExamUnlocked==='function'&&isUnit1ExamUnlocked();
   startBtn.textContent=u1ExamOpen?'انتقل إلى اختبار نهاية الوحدة الأولى':'عرض دروس الوحدة الأولى';
   startBtn.className='primary st-sheet-action-btn';
   startBtn.onclick=()=>{
    sheet.close();
    if(u1ExamOpen)setMapSubView('unit1_exam',true);
    else setMapSubView('sections',true);
   };
   sheet.showModal();
   return;
  }
 }
 if(item.isUpcoming){
  statusEl.textContent='قريبًا';
  statusEl.className='st-sheet-status locked';
  lockSection.hidden=false;
  $('st-sheet-lock-text').textContent=item.unlockReq||'هذا الدرس قيد الإعداد وسيُضاف قريبًا ضمن مسار الوحدة الثانية.';
  startBtn.textContent='متابعة الدرس 1: الضرب الذهني';
  startBtn.className='secondary st-sheet-action-btn';
  startBtn.onclick=()=>{
   sheet.close();
   if(typeof isU2L1Unlocked==='function'&&isU2L1Unlocked())setMapSubView('u2_lesson1',true);
  };
  sheet.showModal();
  return;
 }
 if(!isProj){
  lockSection.hidden=false;
  $('st-sheet-lock-text').textContent=item.unlockReq||'أكمل الدرس الأول (القيمة المنزلية ضمن الملايين) أولاً لفتح هذا القسم.';
 }else{
  lockSection.hidden=true;
 }
 if(isProj){
  startBtn.textContent=isDone?'الانتقال للدرس 1':'إنجاز مشروع الوحدة (+25 XP)';
  startBtn.className='primary st-sheet-action-btn';
 }else{
  startBtn.textContent='انتقل إلى الدرس 1 الحالي';
  startBtn.className='secondary st-sheet-action-btn';
 }
 sheet.showModal();
}
function renderNotebookIconSVG(){
 return '<svg viewBox="0 0 28 28" fill="none" aria-hidden="true">'
  +'<rect x="6" y="4" width="17" height="20" rx="3" fill="#fffef4"/>'
  +'<line x1="11" y1="10" x2="19" y2="10" stroke="#0f5c4b" stroke-width="2.4" stroke-linecap="round"/>'
  +'<line x1="11" y1="14" x2="19" y2="14" stroke="#0f5c4b" stroke-width="2.4" stroke-linecap="round"/>'
  +'<line x1="11" y1="18" x2="16" y2="18" stroke="#c88d21" stroke-width="2.4" stroke-linecap="round"/>'
  +'<line x1="4" y1="9" x2="7.5" y2="9" stroke="#fffef4" stroke-width="2.4" stroke-linecap="round"/>'
  +'<line x1="4" y1="14" x2="7.5" y2="14" stroke="#fffef4" stroke-width="2.4" stroke-linecap="round"/>'
  +'<line x1="4" y1="19" x2="7.5" y2="19" stroke="#fffef4" stroke-width="2.4" stroke-linecap="round"/>'
  +'</svg>';
}
function renderNodeIconSVG(node,completed,isGate,isFront,unlocked=true){
 if(isGate){
  return '<svg viewBox="0 0 92 86" aria-hidden="true">'
   +'<ellipse cx="46" cy="76" rx="38" ry="8" fill="#e5e5e5"/>'
   +'<rect x="14" y="34" width="64" height="40" rx="6" fill="#d98200"/>'
   +'<rect x="18" y="38" width="56" height="32" rx="4" fill="#9c5700"/>'
   +'<rect x="14" y="16" width="64" height="24" rx="6" fill="#ffc800"/>'
   +'<rect x="14" y="16" width="12" height="58" rx="3" fill="#ffb100"/>'
   +'<rect x="66" y="16" width="12" height="58" rx="3" fill="#ffb100"/>'
   +'<rect x="12" y="28" width="68" height="10" rx="3" fill="#ffd900"/>'
   +'<rect x="37" y="25" width="18" height="16" rx="4" fill="#ffdf33"/>'
   +'<circle cx="46" cy="31" r="2.6" fill="#9c5700"/>'
   +'<path d="M44.5 32.5h3l1 5h-5z" fill="#9c5700"/>'
   +'</svg>';
 }
 if(!unlocked&&!completed){
  return '<svg viewBox="0 0 28 28" fill="none" aria-hidden="true">'
   +'<rect x="6" y="12" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2.4"/>'
   +'<path d="M9.5 12V9a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
   +'</svg>';
 }
 if(completed&&node.id===1){
  return '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true">'
   +'<path d="M6 20v-2a12 12 0 0 1 24 0v2" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/>'
   +'<rect x="4" y="17" width="6" height="12" rx="3" fill="#ffffff"/>'
   +'<rect x="26" y="17" width="6" height="12" rx="3" fill="#ffffff"/>'
   +'<rect x="10" y="18" width="5.5" height="12" rx="2.75" fill="#0a4236"/>'
   +'<rect x="20.5" y="18" width="5.5" height="12" rx="2.75" fill="#0a4236"/>'
   +'</svg>';
 }
 if(completed){
  return '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">'
   +'<path d="M7 16.5L13 22.5L25 10.5" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>'
   +'</svg>';
 }
 if(node.type==='story'&&!isFront){
  return '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true">'
   +'<path d="M6 20v-2a12 12 0 0 1 24 0v2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>'
   +'<rect x="4" y="17" width="6" height="12" rx="3" fill="currentColor"/>'
   +'<rect x="26" y="17" width="6" height="12" rx="3" fill="currentColor"/>'
   +'<rect x="10" y="18" width="5.5" height="12" rx="2.75" fill="currentColor" opacity="0.7"/>'
   +'<rect x="20.5" y="18" width="5.5" height="12" rx="2.75" fill="currentColor" opacity="0.7"/>'
   +'</svg>';
 }
 return '<svg viewBox="0 0 32 32" aria-hidden="true">'
  +'<path d="M16 4.5l3.3 6.7 7.4 1.1-5.3 5.2 1.2 7.4L16 21.4l-6.6 3.5 1.2-7.4-5.3-5.2 7.4-1.1L16 4.5z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'
  +'</svg>';
}
function renderMascotOwlSVG(){
 return '<svg viewBox="0 0 110 110" aria-hidden="true">'
  +'<ellipse cx="55" cy="94" rx="32" ry="12" fill="#dfd6c1"/>'
  +'<ellipse cx="44" cy="95" rx="6" ry="4" fill="#c88d21"/>'
  +'<ellipse cx="64" cy="96" rx="6" ry="4" fill="#c88d21"/>'
  +'<path d="M26 68 C14 66, 12 58, 24 52 Z" fill="#0f5c4b"/>'
  +'<path d="M84 62 C98 54, 98 46, 82 48 Z" fill="#18795b"/>'
  +'<path d="M26 42 C26 24, 84 24, 84 42 L82 84 C82 94, 28 94, 28 84 Z" fill="#18795b"/>'
  +'<ellipse cx="43" cy="54" rx="11" ry="12" fill="#ffffff"/>'
  +'<ellipse cx="67" cy="54" rx="11" ry="12" fill="#ffffff"/>'
  +'<ellipse cx="45" cy="53" rx="5.5" ry="7" fill="#102a24"/>'
  +'<ellipse cx="65" cy="53" rx="5.5" ry="7" fill="#102a24"/>'
  +'<circle cx="47" cy="50" r="2" fill="#ffffff"/>'
  +'<circle cx="67" cy="50" r="2" fill="#ffffff"/>'
  +'<path d="M51 58 Q55 55 59 58 L57 65 Q55 67 53 65 Z" fill="#d99b26"/>'
  +'<path d="M44 76 Q49 80 54 76" fill="none" stroke="#7bc49d" stroke-width="3" stroke-linecap="round"/>'
  +'<path d="M58 76 Q63 80 68 76" fill="none" stroke="#7bc49d" stroke-width="3" stroke-linecap="round"/>'
  +'<path d="M82 22 L82 10 L94 13 L94 25" fill="none" stroke="#c88d21" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<circle cx="80" cy="23" r="3" fill="#c88d21"/>'
  +'<circle cx="92" cy="26" r="3" fill="#c88d21"/>'
  +'</svg>';
}
function getActiveMapLessonContext(subView=state.mapSubView){
 if(subView==='lesson2'&&typeof L2_NODES!=='undefined'&&typeof L2_STAGES!=='undefined'){
  const l2=typeof getLesson2State==='function'?getLesson2State():null;
  const frontier=typeof currentLesson2Frontier==='function'?currentLesson2Frontier():0;
  const curStage=L2_STAGES.find(st=>st.nodeIds.includes(frontier))||L2_STAGES[0];
  if(l2&&(!l2.expandedStages||!(l2.expandedStages instanceof Set))){
   l2.expandedStages=new Set([curStage.id]);
  }
  return {
   key:'lesson2',
   lessonLabel:'الدرس 2',
   stages:L2_STAGES,
   nodes:L2_NODES,
   frontier,
   allDone:L2_NODES.every(n=>isLesson2NodeCompleted(n.id)),
   curStage,
   expandedStages:l2?l2.expandedStages:new Set([curStage.id]),
   stageIdPrefix:'l2-stage-',
   pathIdPrefix:'l2-stage-path-',
   isCompleted:id=>isLesson2NodeCompleted(id),
   isUnlocked:id=>isLesson2NodeUnlocked(id),
   getProgress:id=>(typeof getLesson2NodeProgress==='function'?getLesson2NodeProgress(id):{
    cur:isLesson2NodeCompleted(id)?1:0,
    tot:1,
    pct:isLesson2NodeCompleted(id)?100:(id===frontier?12:0)
   }),
   getStars:id=>(typeof getLesson2NodeStars==='function'?getLesson2NodeStars(id):(isLesson2NodeCompleted(id)?3:0)),
   isGate:node=>node.id===2||node.id===14,
   getXP:node=>node.points||15,
   getLockText:nodeId=>{
    const prevNode=L2_NODES[nodeId-1];
    return prevNode
     ?('أكمل «'+prevNode.title.replace(/^\d+\.\s*/,'')+'» أعلاه لفتح هذه المحطة!')
     :'أكمل المحطات السابقة أعلاه لفتح هذه المحطة!';
   },
   openNode:(id,btnEl,opts)=>{
    if(typeof openLesson2Node==='function')openLesson2Node(id,btnEl,opts);
   }
  };
 }
 if(subView==='lesson3'&&typeof L3_NODES!=='undefined'&&typeof L3_STAGES!=='undefined'){
  const l3=typeof getLesson3State==='function'?getLesson3State():null;
  const frontier=typeof currentLesson3Frontier==='function'?currentLesson3Frontier():0;
  const curStage=L3_STAGES.find(st=>st.nodeIds.includes(frontier))||L3_STAGES[0];
  if(l3&&(!l3.expandedStages||!(l3.expandedStages instanceof Set))){
   l3.expandedStages=new Set([curStage.id]);
  }
  return {
   key:'lesson3',
   lessonLabel:'الدرس 3',
   stages:L3_STAGES,
   nodes:L3_NODES,
   frontier,
   allDone:L3_NODES.every(n=>isLesson3NodeCompleted(n.id)),
   curStage,
   expandedStages:l3?l3.expandedStages:new Set([curStage.id]),
   stageIdPrefix:'l3-stage-',
   pathIdPrefix:'l3-stage-path-',
   isCompleted:id=>isLesson3NodeCompleted(id),
   isUnlocked:id=>isLesson3NodeUnlocked(id),
   getProgress:id=>(typeof getLesson3NodeProgress==='function'?getLesson3NodeProgress(id):{
    cur:isLesson3NodeCompleted(id)?1:0,
    tot:1,
    pct:isLesson3NodeCompleted(id)?100:(id===frontier?12:0)
   }),
   getStars:id=>(typeof getLesson3NodeStars==='function'?getLesson3NodeStars(id):(isLesson3NodeCompleted(id)?3:0)),
   isGate:node=>node.id===9||node.id===15,
   getXP:node=>node.points||15,
   getLockText:nodeId=>{
    const prevNode=L3_NODES[nodeId-1];
    return prevNode
     ?('أكمل «'+prevNode.title+'» أعلاه لفتح هذه المحطة!')
     :'أكمل المحطات السابقة أعلاه لفتح هذه المحطة!';
   },
   openNode:(id,btnEl,opts)=>{
    if(typeof openLesson3Node==='function')openLesson3Node(id,btnEl,opts);
   }
  };
 }
 if(subView==='lesson4'&&typeof L4_NODES!=='undefined'&&typeof L4_STAGES!=='undefined'){
  const l4=typeof getLesson4State==='function'?getLesson4State():null;
  const frontier=typeof currentLesson4Frontier==='function'?currentLesson4Frontier():0;
  const curStage=L4_STAGES.find(st=>st.nodeIds.includes(frontier))||L4_STAGES[0];
  if(l4&&(!l4.expandedStages||!(l4.expandedStages instanceof Set))){
   l4.expandedStages=new Set([curStage.id]);
  }
  return {
   key:'lesson4',
   lessonLabel:'الدرس 4',
   stages:L4_STAGES,
   nodes:L4_NODES,
   frontier,
   allDone:L4_NODES.every(n=>isLesson4NodeCompleted(n.id)),
   curStage,
   expandedStages:l4?l4.expandedStages:new Set([curStage.id]),
   stageIdPrefix:'l4-stage-',
   pathIdPrefix:'l4-stage-path-',
   isCompleted:id=>isLesson4NodeCompleted(id),
   isUnlocked:id=>isLesson4NodeUnlocked(id),
   getProgress:id=>(typeof getLesson4NodeProgress==='function'?getLesson4NodeProgress(id):{
    cur:isLesson4NodeCompleted(id)?1:0,
    tot:1,
    pct:isLesson4NodeCompleted(id)?100:(id===frontier?12:0)
   }),
   getStars:id=>(typeof getLesson4NodeStars==='function'?getLesson4NodeStars(id):(isLesson4NodeCompleted(id)?3:0)),
   isGate:node=>node.id===9||node.id===13,
   getXP:node=>node.points||15,
   getLockText:nodeId=>{
    const prevNode=L4_NODES[nodeId-1];
    return prevNode
     ?('أكمل «'+prevNode.title+'» أعلاه لفتح هذه المحطة!')
     :'أكمل المحطات السابقة أعلاه لفتح هذه المحطة!';
   },
   openNode:(id,btnEl,opts)=>{
    if(typeof openLesson4Node==='function')openLesson4Node(id,btnEl,opts);
   }
  };
 }
 if(subView==='lesson5'&&typeof L5_NODES!=='undefined'&&typeof L5_STAGES!=='undefined'){
  const l5=typeof getLesson5State==='function'?getLesson5State():null;
  const frontier=typeof currentLesson5Frontier==='function'?currentLesson5Frontier():0;
  const curStage=L5_STAGES.find(st=>st.nodeIds.includes(frontier))||L5_STAGES[0];
  if(l5&&(!l5.expandedStages||!(l5.expandedStages instanceof Set))){
   l5.expandedStages=new Set([curStage.id]);
  }
  return {
   key:'lesson5',
   lessonLabel:'الدرس 5',
   stages:L5_STAGES,
   nodes:L5_NODES,
   frontier,
   allDone:L5_NODES.every(n=>isLesson5NodeCompleted(n.id)),
   curStage,
   expandedStages:l5?l5.expandedStages:new Set([curStage.id]),
   stageIdPrefix:'l5-stage-',
   pathIdPrefix:'l5-stage-path-',
   isCompleted:id=>isLesson5NodeCompleted(id),
   isUnlocked:id=>isLesson5NodeUnlocked(id),
   getProgress:id=>(typeof getLesson5NodeProgress==='function'?getLesson5NodeProgress(id):{
    cur:isLesson5NodeCompleted(id)?1:0,
    tot:1,
    pct:isLesson5NodeCompleted(id)?100:(id===frontier?12:0)
   }),
   getStars:id=>(typeof getLesson5NodeStars==='function'?getLesson5NodeStars(id):(isLesson5NodeCompleted(id)?3:0)),
   isGate:node=>node.id===9,
   getXP:node=>node.points||15,
   getLockText:nodeId=>{
    const prevNode=L5_NODES[nodeId-1];
    return prevNode
     ?('أكمل «'+prevNode.title+'» أعلاه لفتح هذه المحطة!')
     :'أكمل المحطات السابقة أعلاه لفتح هذه المحطة!';
   },
   openNode:(id,btnEl,opts)=>{
    if(typeof openLesson5Node==='function')openLesson5Node(id,btnEl,opts);
   }
  };
 }
 if(subView==='u2_lesson1'&&typeof U2L1_NODES!=='undefined'&&typeof U2L1_STAGES!=='undefined'){
  const u2=typeof getU2L1State==='function'?getU2L1State():null;
  const frontier=typeof currentU2L1Frontier==='function'?currentU2L1Frontier():0;
  const curStage=U2L1_STAGES.find(st=>st.nodeIds.includes(frontier))||U2L1_STAGES[0];
  if(u2&&(!u2.expandedStages||!(u2.expandedStages instanceof Set))){
   u2.expandedStages=new Set([curStage.id]);
  }
  return {
   key:'u2_lesson1',
   lessonLabel:'الوحدة 2 · الدرس 1',
   stages:U2L1_STAGES,
   nodes:U2L1_NODES,
   frontier,
   allDone:U2L1_NODES.every(n=>isU2L1NodeCompleted(n.id)),
   curStage,
   expandedStages:u2?u2.expandedStages:new Set([curStage.id]),
   stageIdPrefix:'u2l1-stage-',
   pathIdPrefix:'u2l1-stage-path-',
   isCompleted:id=>isU2L1NodeCompleted(id),
   isUnlocked:id=>isU2L1NodeUnlocked(id),
   getProgress:id=>(typeof getU2L1NodeProgress==='function'?getU2L1NodeProgress(id):{
    cur:isU2L1NodeCompleted(id)?1:0,
    tot:1,
    pct:isU2L1NodeCompleted(id)?100:(id===frontier?12:0)
   }),
   getStars:id=>(typeof getU2L1NodeStars==='function'?getU2L1NodeStars(id):(isU2L1NodeCompleted(id)?3:0)),
   isGate:node=>node.id===10,
   getXP:node=>node.points||20,
   getLockText:nodeId=>{
    const prevNode=U2L1_NODES[nodeId-1];
    return prevNode
     ?('أكمل «'+prevNode.title+'» أعلاه لفتح هذه المحطة!')
     :'أكمل المحطات السابقة أعلاه لفتح هذه المحطة!';
   },
   openNode:(id,btnEl,opts)=>{
    if(typeof openU2L1Node==='function')openU2L1Node(id,btnEl,opts);
   }
  };
 }
 const frontier=currentFrontierNodeId();
 const curStage=getStageForNode(frontier);
 if(!state.expandedStages||!(state.expandedStages instanceof Set)){
  state.expandedStages=new Set([curStage.id]);
 }
 return {
  key:'lesson1',
  lessonLabel:'الدرس 1',
  stages:PATH_STAGES,
  nodes:PATH_NODES,
  frontier,
  allDone:PATH_NODES.every(n=>isNodeCompleted(n.id)),
  curStage,
  expandedStages:state.expandedStages,
  stageIdPrefix:'duo-stage-',
  pathIdPrefix:'stage-path-',
  isCompleted:id=>isNodeCompleted(id),
  isUnlocked:id=>isNodeUnlocked(id),
  getProgress:id=>getNodeProgress(id),
  getStars:id=>getNodeStars(id),
  isGate:node=>node.id===2||node.tag==='بوابة الفصل'||node.id===14||node.tag==='الختام والشهادة',
  getXP:node=>node.type==='story'?10:(node.type==='playground'?20:25),
  getLockText:()=>'أكمل جميع المستويات أعلاه لفتح هذا المستوى!',
  openNode:(id,btnEl,opts)=>{
   const node=PATH_NODES[id];
   if(opts&&opts.review&&node&&node.type==='mission'){
    state.records[node.missionId]={index:0,passed:new Set(),data:{},lastMessage:''};
    currentStationErrors=0;
   }
   openNode(id,btnEl);
  }
 };
}

let openPopoverNodeId=null;
let _popoverScrollAnchorY=null;
let _popoverScrollGuardTs=0;
function closeAllNodePopovers(){
 openPopoverNodeId=null;
 _popoverScrollAnchorY=null;
 _popoverScrollGuardTs=0;
 document.querySelectorAll('.dp-popover').forEach(el=>el.remove());
 document.querySelectorAll('.dp-wrap.popover-open').forEach(el=>el.classList.remove('popover-open'));
 document.querySelectorAll('.dp-unit.has-open-popover').forEach(el=>el.classList.remove('has-open-popover'));
}
function toggleNodePopover(nodeId,wrapEl,subView){
 const ctxKey=subView||(wrapEl&&wrapEl.closest('[id^="u2l1-stage-"]')?'u2_lesson1':(wrapEl&&wrapEl.closest('[id^="l5-stage-"]')?'lesson5':(wrapEl&&wrapEl.closest('[id^="l4-stage-"]')?'lesson4':(wrapEl&&wrapEl.closest('[id^="l3-stage-"]')?'lesson3':(wrapEl&&wrapEl.closest('[id^="l2-stage-"]')?'lesson2':'lesson1')))));
 const popKey=ctxKey+':'+nodeId;
 if(openPopoverNodeId===popKey){
  closeAllNodePopovers();
  return;
 }
 closeAllNodePopovers();
 const ctx=getActiveMapLessonContext(ctxKey);
 const node=ctx.nodes[nodeId];if(!node||!wrapEl)return;
 openPopoverNodeId=popKey;
 wrapEl.classList.add('popover-open');
 const parentUnit=wrapEl.closest('.dp-unit');
 if(parentUnit)parentUnit.classList.add('has-open-popover');
 const completed=ctx.isCompleted(nodeId),unlocked=ctx.isUnlocked(nodeId);
 const cleanTitle=node.title.replace(/^\d+\.\s*/,'');
 const xp=ctx.getXP(node);
 const pop=document.createElement('div');
 pop.className='dp-popover'+(unlocked?'':' locked-pop');
 const subText=unlocked
  ?(ctx.lessonLabel+' · المحطة '+ar(nodeId+1)+' من '+ar(ctx.nodes.length))
  :ctx.getLockText(nodeId);
 const btnText=!unlocked
  ?'مقفل'
  :(completed?('مراجعة +'+ar(xp)+' XP'):('ابدأ +'+ar(xp)+' XP'));
 pop.innerHTML='<span class="dp-popover-arrow" aria-hidden="true"></span>'
  +'<h3>'+cleanTitle+'</h3>'
  +'<p>'+subText+'</p>'
  +'<button type="button" class="dp-popover-btn'+(unlocked?'':' is-locked')+'"'+(unlocked?'':' aria-disabled="true"')+'>'+btnText+'</button>';
 pop.querySelector('.dp-popover-btn').addEventListener('click',e=>{
  e.stopPropagation();
  if(!unlocked){
   sound(false);haptic(false);
   shakeElement(pop);
   guide('هذه المحطة مقفلة! '+subText,4200);
   return;
  }
  closeAllNodePopovers();
  ctx.openNode(nodeId,wrapEl,{review:completed});
 });
 pop.addEventListener('click',e=>e.stopPropagation());
 wrapEl.append(pop);
 _popoverScrollAnchorY=window.scrollY;
 _popoverScrollGuardTs=Date.now()+420;
 requestAnimationFrame(()=>{
  try{
   const bt=document.getElementById('bottom-tabs');
   const btRect=bt&&getComputedStyle(bt).display!=='none'?bt.getBoundingClientRect():null;
   const isBottomBar=Boolean(btRect&&btRect.top>window.innerHeight*0.5);
   const jumpEl=document.getElementById('duo-jump-current');
   const jumpVisible=Boolean(jumpEl&&!jumpEl.hidden&&jumpEl.offsetHeight>0);
   const jumpTop=jumpVisible?jumpEl.getBoundingClientRect().top:window.innerHeight;
   const safeBottom=Math.min(isBottomBar?btRect.top:window.innerHeight,jumpTop);
   const pr=pop.getBoundingClientRect();
   const bannerEl=document.getElementById('duo-lesson-topbar');
   const safeTop=bannerEl?bannerEl.getBoundingClientRect().bottom+12:72;
   if(pr.bottom>safeBottom-12){
    const wr=wrapEl.getBoundingClientRect();
    if(wr.top-pr.height-24>safeTop){
     pop.classList.add('open-above');
    }
   }
   pop.scrollIntoView({block:'nearest',inline:'nearest',behavior:(typeof reduced!=='undefined'&&reduced.matches)?'auto':'smooth'});
   setTimeout(()=>{if(openPopoverNodeId===popKey)_popoverScrollAnchorY=window.scrollY;},360);
  }catch{}
 });
}
window.addEventListener('scroll',()=>{
 if(openPopoverNodeId===null)return;
 if(Date.now()<_popoverScrollGuardTs)return;
 if(_popoverScrollAnchorY===null){_popoverScrollAnchorY=window.scrollY;return;}
 if(Math.abs(window.scrollY-_popoverScrollAnchorY)>160){
  closeAllNodePopovers();
 }
},{passive:true});
document.addEventListener('click',e=>{
 if(openPopoverNodeId!==null&&!e.target.closest('.dp-wrap')){
  closeAllNodePopovers();
 }
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&openPopoverNodeId!==null){
  const openWrap=document.querySelector('.dp-wrap.popover-open');
  const nodeBtn=openWrap?.querySelector('.dp-node');
  closeAllNodePopovers();
  nodeBtn?.focus();
 }
});
function renderUnifiedStageMapUnits(unitsRoot,ctx){
 if(!unitsRoot||!ctx)return;
 unitsRoot.replaceChildren();
 const compactMobile=window.innerWidth<=420;
 const XS=compactMobile?[0,-30,-44,-30,0,30,44,30]:[0,-44,-64,-44,0,44,64,44];
 const totalStages=ctx.stages.length;
 ctx.stages.forEach(st=>{
  const stNodes=st.nodeIds.map(id=>ctx.nodes[id]).filter(Boolean);
  const doneInStage=stNodes.filter(n=>ctx.isCompleted(n.id)).length;
  const isStageDone=stNodes.length>0&&doneInStage===stNodes.length;
  const isCurrentStage=st.id===ctx.curStage.id&&!ctx.allDone;
  const stageStateCls=isStageDone?'is-stage-done':(isCurrentStage?'is-stage-current':'is-stage-upcoming');
  const sec=document.createElement('section');
  sec.className='dp-unit stage-unit '+st.cls+' '+stageStateCls;
  sec.id=ctx.stageIdPrefix+st.id;
  sec.dataset.stageId=String(st.id);
  sec.dataset.stageNum=String(st.num);
  sec.dataset.stageTotal=String(totalStages);
  sec.dataset.stageTitle=st.title;
  const pathId=ctx.pathIdPrefix+st.id;
  const stepBadgeHTML=isStageDone
   ?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :ar(st.num);
  sec.innerHTML='<header class="dp-head duo-stage-divider">'
   +'<span class="duo-divider-line" aria-hidden="true"></span>'
   +'<div class="dp-head-pill">'
   +'<span class="stage-step-badge" aria-hidden="true">'+stepBadgeHTML+'</span>'
   +'<div class="dp-head-main">'
   +'<h2>'+st.title+'</h2>'
   +'<small>المرحلة <bdi>'+ar(st.num)+'</bdi> من <bdi>'+ar(totalStages)+'</bdi> · <bdi>'+ar(doneInStage)+'/'+ar(stNodes.length)+'</bdi></small>'
   +'</div>'
   +'</div>'
   +'<span class="duo-divider-line" aria-hidden="true"></span>'
   +'</header><div class="dp-path" id="'+pathId+'"></div>';

  const pathEl=sec.querySelector('.dp-path');
  stNodes.forEach((node,idx)=>{
   const x=XS[idx%XS.length];
   const completed=ctx.isCompleted(node.id),unlocked=ctx.isUnlocked(node.id),isFront=node.id===ctx.frontier&&!ctx.allDone;
   const prog=ctx.getProgress(node.id);
   const hasStartedFront=isFront&&prog.pct>0&&prog.pct<100&&prog.cur>1;
   const wrap=document.createElement('div');
   wrap.className='dp-wrap'+(completed?' done':'')+(isFront?' current-wrap':'');
   wrap.style.setProperty('--x',x+'px');
   const cleanTitle=node.title.replace(/^\d+\.\s*/,'');
   if(isFront){
    const hasLessonProgress=hasStartedFront||ctx.nodes.some(n=>ctx.isCompleted(n.id));
    const calloutLabel=hasLessonProgress?'تابع':'ابدأ';
    const calloutBtn=document.createElement('button');
    calloutBtn.type='button';
    calloutBtn.className='dp-callout';
    calloutBtn.dataset.frontierCta='true';
    calloutBtn.textContent=calloutLabel;
    calloutBtn.setAttribute('aria-label',calloutLabel+' — '+cleanTitle);
    calloutBtn.addEventListener('click',e=>{
     e.stopPropagation();
     closeAllNodePopovers();
     ctx.openNode(node.id,calloutBtn);
    });
    wrap.append(calloutBtn);
   }
   const btn=document.createElement('button');btn.type='button';
   btn.dataset.trackNodeId=String(node.id);
   if(ctx.key==='u2_lesson1')btn.setAttribute('data-u2l1-node-id',String(node.id));
   else if(ctx.key==='lesson2')btn.setAttribute('data-l2-node-id',String(node.id));
   else if(ctx.key==='lesson3')btn.setAttribute('data-l3-node-id',String(node.id));
   else if(ctx.key==='lesson4')btn.setAttribute('data-l4-node-id',String(node.id));
   else if(ctx.key==='lesson5')btn.setAttribute('data-l5-node-id',String(node.id));
   else btn.dataset.nodeId=String(node.id);
   const isGate=ctx.isGate(node);
   const stateCls=completed?'completed':(isFront?'current front':(unlocked?'available':'locked'));
   btn.className='dp-node '+stateCls+(isGate?' chest-node':'');
   const stateLabel=completed?'مكتملة':(isFront?'المحطة الحالية':(unlocked?'متاحة':'مقفلة'));
   btn.setAttribute('aria-label',cleanTitle+' — '+stateLabel);
   if(isFront)btn.setAttribute('aria-current','step');
   let ringHTML='';
   if(isFront&&!isGate){
    const offset=Math.max(0,100-prog.pct);
    ringHTML='<svg class="dp-ring-svg" viewBox="0 0 104 104" aria-hidden="true"><circle class="dp-ring-track" cx="52" cy="52" r="46" pathLength="100"/><circle class="dp-ring-fill" cx="52" cy="52" r="46" pathLength="100" stroke-dasharray="100" stroke-dashoffset="'+offset+'"/></svg>';
   }
   const starsHTML=(completed&&!isGate)?renderStarsBadgeHTML(ctx.getStars(node.id)):'';
   btn.innerHTML=ringHTML+'<span class="dp-ico" aria-hidden="true">'+renderNodeIconSVG(node,completed,isGate,isFront,unlocked)+'</span>'+starsHTML;
   btn.addEventListener('click',e=>{
    e.stopPropagation();
    toggleNodePopover(node.id,wrap,ctx.key);
   });
   wrap.append(btn);
   const caption=document.createElement('div');
   caption.className='dp-node-caption';
   caption.setAttribute('aria-hidden','true');
   caption.innerHTML='<span class="dp-node-title">'+cleanTitle+'</span>'
    +'<span class="dp-node-state">'+(completed?'✓ مكتملة':stateLabel)+'</span>';
   wrap.append(caption);
   if(idx===1&&isCurrentStage){
    const mascotSide=x<0?'r':'l';
    wrap.insertAdjacentHTML('beforeend','<span class="dp-mascot '+mascotSide+'" aria-hidden="true">'+renderMascotOwlSVG()+'</span>');
   }
   pathEl.append(wrap);
  });
  unitsRoot.append(sec);
 });
 requestAnimationFrame(()=>{
  updatePathTrackSVGs();
 });
}
function renderStageMapUnits(unitsRoot){
 const ctx=getActiveMapLessonContext('lesson1');
 const banner=$('stage-overview-banner');
 if(banner){
  banner.hidden=false;
  const ob=state.onboarding||createDefaultOnboarding();
  let bypassBadge='';
  if(ob.reviewBypassed){
   bypassBadge='<span class="review-bypass-pill" id="review-bypassed-badge">'+getIconSVG('check')+'<span>المراجعة القصيرة: تم تجاوزها بناءً على التهيئة</span></span>';
  }else if(ob.reviewDone){
   bypassBadge='<span class="review-bypass-pill" id="review-done-badge">'+getIconSVG('check')+'<span>المراجعة القصيرة: تمت بنجاح</span></span>';
  }
  banner.innerHTML=bypassBadge?'<div class="stage-bypass-bar">'+bypassBadge+'</div>':'';
 }
 renderUnifiedStageMapUnits(unitsRoot,ctx);
}
function renderDuolingoMap(){
 const unitsRoot=$('duo-units');if(!unitsRoot)return;
 closeAllNodePopovers();
 const allowedSubs=['lesson1','lesson2','lesson3','lesson4','lesson5','unit1_exam','units','u2_sections','u2_lesson1'];
 const sub=allowedSubs.includes(state.mapSubView)?state.mapSubView:'sections';
 const secRoot=$('duo-sections-root'),lesWrap=$('duo-lesson-wrap');
 const isExamHub=(sub==='unit1_exam');
 const isLessonMap=(sub==='lesson1'||sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5'||sub==='u2_lesson1'||isExamHub);
 if(secRoot)secRoot.hidden=isLessonMap;
 if(lesWrap)lesWrap.hidden=!isLessonMap;

 if($('duo-tab-sections')){$('duo-tab-sections').classList.toggle('active',sub==='sections'||sub==='units'||sub==='u2_sections');$('duo-tab-sections').setAttribute('aria-selected',String(sub==='sections'||sub==='units'||sub==='u2_sections'));}
 if($('duo-tab-lesson1')){$('duo-tab-lesson1').classList.toggle('active',sub==='lesson1');$('duo-tab-lesson1').setAttribute('aria-selected',String(sub==='lesson1'));}
 if($('duo-tab-lesson2')){$('duo-tab-lesson2').classList.toggle('active',sub==='lesson2');$('duo-tab-lesson2').setAttribute('aria-selected',String(sub==='lesson2'));}
 if($('duo-tab-lesson3')){$('duo-tab-lesson3').classList.toggle('active',sub==='lesson3');$('duo-tab-lesson3').setAttribute('aria-selected',String(sub==='lesson3'));}
 if($('duo-tab-lesson4')){$('duo-tab-lesson4').classList.toggle('active',sub==='lesson4');$('duo-tab-lesson4').setAttribute('aria-selected',String(sub==='lesson4'));}
 if($('duo-tab-lesson5')){$('duo-tab-lesson5').classList.toggle('active',sub==='lesson5');$('duo-tab-lesson5').setAttribute('aria-selected',String(sub==='lesson5'));}

 const ov=getCurriculumOverviewData();
 applyDuoLessonTheme(sub);
 renderDuolingoStats();
 renderQuickLessonStrip(sub,ov);
 renderCompanionRail(sub,ov);

 const pickerLbl=$('lesson-picker-label');
 const unitCtxEl=$('compact-unit-context');

 if(isLessonMap){
  const theme=getDuoLessonTheme(sub);
  const isU2=theme.unitNum===2;
  const m=ov[sub]||ov.lesson1;
  if(pickerLbl)pickerLbl.innerHTML=isExamHub?'اختبار الوحدة':(isU2?'و2 · الدرس <bdi>1</bdi>':('الدرس <bdi>'+ar(theme.num)+'</bdi>'));
  if(unitCtxEl)unitCtxEl.innerHTML=isU2?'الوحدة <bdi>2</bdi> · القسم <bdi>2</bdi>':'الوحدة <bdi>1</bdi> · القسم <bdi>1</bdi>';
  if($('bc-to-units'))$('bc-to-units').innerHTML=isU2?'الوحدة <bdi>2</bdi>':'الوحدة <bdi>1</bdi>';
  if($('duo-back-sections'))$('duo-back-sections').innerHTML=isU2?'القسم <bdi>2</bdi>':'القسم <bdi>1</bdi>';
  const bcCur=$('bc-cur-lesson');
  if(bcCur)bcCur.innerHTML=isExamHub?'اختبار الوحدة':('الدرس <bdi>'+ar(theme.num)+'</bdi>');
  const kickerEl=$('duo-sticky-kicker');
  if(kickerEl)kickerEl.textContent=isExamHub?'القسم 1 · التقويم الختامي للوحدة الأولى':(isU2?'القسم 2 · الوحدة 2 · الدرس 1':'القسم 1 · الدرس '+ar(theme.num)+' من 5');
  const metaTitle=$('lesson-meta-title');
  if(metaTitle)metaTitle.textContent=theme.title;
  const metaPages=$('lesson-meta-pages');
  if(metaPages)metaPages.innerHTML=(isExamHub?'الصفحتان ':'الصفحات ')+'<bdi>'+theme.pages+'</bdi>';
  const metaStatus=$('lesson-meta-status');
  if(metaStatus)metaStatus.textContent=m.statusLabel+' ('+ar(m.done)+' من '+ar(m.total)+(isExamHub?' سؤالاً)':' محطة)');
  const topProg=$('lesson-topbar-prog');
  if(topProg)topProg.innerHTML=renderDuoProgBarHTML(m.pct);
  const duoLabBtn=$('duo-open-lab-btn');
  const duoLabLbl=$('duo-open-lab-label');
  if(duoLabBtn)duoLabBtn.hidden=isExamHub;
  if(duoLabLbl)duoLabLbl.textContent=theme.labLabel;
 }else{
  if(pickerLbl)pickerLbl.textContent=sub==='units'?'الوحدات':(sub==='u2_sections'?'الوحدة 2':'الدروس');
  if(unitCtxEl)unitCtxEl.innerHTML=sub==='units'?'الأقسام الدراسية':(sub==='u2_sections'?'الوحدة <bdi>2</bdi> · القسم <bdi>2</bdi>':'الوحدة <bdi>1</bdi> · القسم <bdi>1</bdi>');
  if($('duo-open-lab-btn'))$('duo-open-lab-btn').hidden=true;
 }

 if($('l3-open-lab-btn'))$('l3-open-lab-btn').hidden=!(state.viewMode==='lesson3'||(state.viewMode==='map'&&sub==='lesson3'));
 if($('l4-open-lab-btn'))$('l4-open-lab-btn').hidden=!(state.viewMode==='lesson4'||(state.viewMode==='map'&&sub==='lesson4'));
 if($('l5-open-lab-btn'))$('l5-open-lab-btn').hidden=!(state.viewMode==='lesson5'||(state.viewMode==='map'&&sub==='lesson5'));
 if($('u2l1-open-lab-btn'))$('u2l1-open-lab-btn').hidden=!(state.viewMode==='u2_lesson1'||(state.viewMode==='map'&&sub==='u2_lesson1'));

 renderSectionsOverview();

 const heroStartBtn=$('duo-hero-start');
 if(heroStartBtn&&isLessonMap){
  if(isExamHub){
   heroStartBtn.hidden=true;
  }else{
   const activeCtx=getActiveMapLessonContext(sub);
   if(activeCtx.allDone){
    heroStartBtn.hidden=false;
    heroStartBtn.textContent='راجع الدرس';
   }else{
    heroStartBtn.hidden=true;
   }
  }
 }
 const bypassBanner=$('stage-overview-banner');
 if(bypassBanner)bypassBanner.hidden=(sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5'||sub==='u2_lesson1'||isExamHub);
 unitsRoot.replaceChildren();
 if(isLessonMap){
  if(isExamHub){
   if(typeof renderUnit1ExamHub==='function')renderUnit1ExamHub(unitsRoot);
  }else if(sub==='u2_lesson1'){
   if(typeof renderU2L1StageMapUnits==='function')renderU2L1StageMapUnits(unitsRoot);
  }else if(sub==='lesson5'){
   if(typeof renderLesson5StageMapUnits==='function')renderLesson5StageMapUnits(unitsRoot);
  }else if(sub==='lesson4'){
   if(typeof renderLesson4StageMapUnits==='function')renderLesson4StageMapUnits(unitsRoot);
  }else if(sub==='lesson3'){
   if(typeof renderLesson3StageMapUnits==='function')renderLesson3StageMapUnits(unitsRoot);
  }else if(sub==='lesson2'){
   renderLesson2StageMapUnits(unitsRoot);
  }else{
   renderStageMapUnits(unitsRoot);
  }
  if(isExamHub){
   const nextBox=$('duo-next-lesson-card');
   if(nextBox){nextBox.hidden=true;nextBox.replaceChildren();}
  }else{
   renderNextLessonCard(sub);
   requestAnimationFrame(()=>updateStickyStageBanner());
  }
 }else{
  const nextBox=$('duo-next-lesson-card');
  if(nextBox){nextBox.hidden=true;nextBox.replaceChildren();}
 }
}
function updatePathTrackSVGs(){
 if(state.viewMode!=='map'||(state.mapSubView!=='lesson1'&&state.mapSubView!=='lesson2'&&state.mapSubView!=='lesson3'&&state.mapSubView!=='lesson4'&&state.mapSubView!=='lesson5'&&state.mapSubView!=='u2_lesson1'))return;
 const lesWrap=$('duo-lesson-wrap');
 if(!lesWrap||lesWrap.hidden)return;
 const ctx=getActiveMapLessonContext();
 document.querySelectorAll('.dp-unit').forEach(unit=>{
  const pathEl=unit.querySelector('.dp-path');
  if(!pathEl)return;
  let svg=pathEl.querySelector('.dp-track-svg');
  if(!svg){
   svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('class','dp-track-svg');
   svg.setAttribute('aria-hidden','true');
   pathEl.prepend(svg);
  }
  const nodes=Array.from(pathEl.querySelectorAll('.dp-node'));
  if(nodes.length<2)return;
  const pathRect=pathEl.getBoundingClientRect();
  if(pathRect.width===0||pathRect.height===0)return;
  const w=Math.round(pathRect.width);
  const h=Math.round(pathRect.height);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio','none');
  const pts=nodes.map(btn=>{
   const r=btn.getBoundingClientRect();
   return{
    x:((r.left+r.right)/2)-pathRect.left,
    y:((r.top+r.bottom)/2)-pathRect.top,
    id:Number(btn.dataset.trackNodeId??btn.dataset.nodeId??btn.dataset.l2NodeId??btn.dataset.l3NodeId)
   };
  });
  svg.replaceChildren();
  for(let i=0;i<pts.length-1;i++){
   const p1=pts[i],p2=pts[i+1];
   const dy=p2.y-p1.y;
   const cy1=p1.y+(dy*0.5);
   const cy2=p2.y-(dy*0.5);
   const d=`M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${p1.x.toFixed(1)} ${cy1.toFixed(1)}, ${p2.x.toFixed(1)} ${cy2.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
   const isGolden=ctx.isCompleted(p1.id);
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');
   path.setAttribute('d',d);
   path.setAttribute('class',`dp-track-segment ${isGolden?'golden':'inactive'}`);
   svg.appendChild(path);
  }
 });
}
let currentSheetNodeId=null;
function showStationSheet(nodeId){
 const node=PATH_NODES[nodeId];if(!node)return;
 currentSheetNodeId=nodeId;
 currentSheetCurriculumId=null;
 const sheet=$('station-sheet');if(!sheet)return;
 const completed=isNodeCompleted(nodeId),unlocked=isNodeUnlocked(nodeId);
 const frontier=currentFrontierNodeId(),isFront=nodeId===frontier;
 const stars=getNodeStars(nodeId);
 $('st-sheet-badge').textContent='الدرس 1 · المحطة '+ar(nodeId+1)+' من '+ar(PATH_NODES.length);
 const statusEl=$('st-sheet-status');
 const starsCard=$('st-sheet-stars-card');
 if(completed){
  statusEl.textContent='مكتملة · '+ar(stars)+' من 3 نجوم';statusEl.className='st-sheet-status done';
  if(starsCard){
   starsCard.hidden=false;
   $('st-sheet-stars-icons').innerHTML=renderStarsSheetHTML(stars);
   const hintEl=$('st-sheet-stars-hint');
   if(stars===3){
    hintEl.textContent='إتقان كامل (3 من 3 نجوم) دون أي خطأ!';
   }else if(stars===2){
    hintEl.textContent='حصلت على نجمتين (حدث خطأ واحد). أعد المحطة الآن دون أخطاء لنيل النجوم الثلاث كاملة!';
   }else{
    hintEl.textContent='حصلت على نجمة واحدة (حدث خطآن أو أكثر). أعد المحطة لتحسين إتقانك ونيل 3 نجوم!';
   }
  }
 }else{
  if(starsCard)starsCard.hidden=true;
  if(unlocked){
   statusEl.textContent=isFront?'محطتك الحالية':'متاحة للبدء';statusEl.className='st-sheet-status ready';
  }else{
   statusEl.textContent='مقفلة';statusEl.className='st-sheet-status locked';
  }
 }
 $('st-sheet-ico').innerHTML=getIconSVG(node.icon);
 $('st-sheet-title').textContent=node.title.replace(/^\d+\.\s*/,'');
 $('st-sheet-type').textContent=node.tag||(node.type==='story'?'شرح تفاعلي':node.type==='playground'?'ملعب الأعداد':'مهمة تدريبية');
 $('st-sheet-desc').textContent=node.sub;
 let dur='3 دقائق';
 if(node.type==='story')dur=(node.slides&&node.slides.length>4)?'3 دقائق':'دقيقتان';
 else if(node.tag==='بوابة الفصل'||node.tag==='الختام والشهادة')dur='5 دقائق';
 $('st-sheet-duration').textContent=dur;
 let pts='25 نقطة';
 if(node.type==='story')pts='10 نقاط';
 else if(node.type==='playground')pts='20 نقطة';
 else if(node.tag==='بوابة الفصل'||node.tag==='الختام والشهادة')pts='30 نقطة';
 $('st-sheet-points').innerHTML='<span class="btn-svg">'+getIconSVG('sparkle','gold')+'</span><span>'+pts+'</span>';
 $('st-sheet-kind').textContent=node.type==='story'?'شرح وبناء مفهوم':node.type==='playground'?'استكشاف وتجريب':'تطبيق وحل مسائل';
 const lockSection=$('st-sheet-lock-info');
 if(!unlocked){
  lockSection.hidden=false;
  const prevNode=PATH_NODES[nodeId-1];
  if(nodeId===10){
   $('st-sheet-lock-text').textContent='لفتح هذه المحطة وبدء الفصل الثاني، يجب إنهاء محطات الفصل الأول العشر السابقة أولاً.';
  }else{
   $('st-sheet-lock-text').textContent='لفتح هذه المحطة، أنجز المحطة السابقة أولاً: «'+(prevNode?prevNode.title.replace(/^\d+\.\s*/,''):'المحطة السابقة')+'».';
  }
 }else{
  lockSection.hidden=true;
 }
 const startBtn=$('st-sheet-start-btn');
 if(unlocked){
  if(completed){
   startBtn.textContent=(stars<3)?'تحسين النجوم (إعادة المحطة)':'مراجعة المحطة';
  }else{
   startBtn.textContent='ابدأ المحطة الآن';
  }
  startBtn.className='primary st-sheet-action-btn';
 }else{
  startBtn.textContent='اذهب لمحطتك الحالية';
  startBtn.className='secondary st-sheet-action-btn';
 }
 sheet.showModal();
}
function openNode(nodeId,btnEl){
 const node=PATH_NODES[nodeId];if(!node)return;
 currentStationErrors=0;
 if(!isNodeUnlocked(nodeId)){
  sound(false);haptic(false);
  shakeElement(btnEl||document.querySelector('[data-node-id="'+nodeId+'"]')||$('duolingo-map'));
  const prevNode=PATH_NODES[nodeId-1];
  guide('هذه المحطة مقفلة! أكمل «'+(prevNode?prevNode.title:'المحطة السابقة')+'» أولًا لفتحها بالترتيب.',4800);
  return;
 }
 if(typeof L1Runner!=='undefined'&&L1Runner.openNode){
  L1Runner.openNode(nodeId,btnEl);
  return;
 }
 pauseRapid();stopStory();stopSpeech();resetTaskInteractions();cancelDigitGestures();
 state.infiniteMode=false;
 state.activeNode=nodeId;
 state.scene=node.unit;
 state.viewMode=node.type;
 if(state.expandedStages)state.expandedStages.add(getStageForNode(nodeId).id);
 if(nodeId===0&&state.onboarding)state.onboarding.reviewSlidesMode=false;
 if(node.type==='exit_ticket'){
  state.viewMode='exit_ticket';
  startExitTicket(false);
  updateViewDom();
  saveState();
  window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
  return;
 }
 if(node.type==='playground'){
  if(playgroundState.questsDone.has(playgroundState.questIndex)){
   const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
   if(nextUnsolved>=0)playgroundState.questIndex=nextUnsolved;
  }
  updatePlayground();
 }else if(node.type==='story'){
  const unviewed=node.slides.find(idx=>!state.viewedSlides[node.unit].has(idx));
  state.story[node.unit]=unviewed!==undefined?unviewed:node.slides[0];
 }else if(node.type==='mission'){
  state.cursors[node.unit]=node.missionId%6;
 }
 applyScene();
 updateViewDom();
 saveState();
 window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
}
function getCurrentStationElement(){
 return document.querySelector('.dp-node.front')
  ||document.querySelector('.dp-node.current')
  ||(state.mapSubView==='u2_lesson1'&&typeof currentU2L1Frontier==='function'?document.querySelector('.dp-node[data-u2l1-node-id="'+currentU2L1Frontier()+'"]'):null)
  ||(state.mapSubView==='lesson5'&&typeof currentLesson5Frontier==='function'?document.querySelector('.dp-node[data-l5-node-id="'+currentLesson5Frontier()+'"]'):null)
  ||(state.mapSubView==='lesson4'&&typeof currentLesson4Frontier==='function'?document.querySelector('.dp-node[data-l4-node-id="'+currentLesson4Frontier()+'"]'):null)
  ||(state.mapSubView==='lesson3'&&typeof currentLesson3Frontier==='function'?document.querySelector('.dp-node[data-l3-node-id="'+currentLesson3Frontier()+'"]'):null)
  ||document.querySelector('.dp-node[data-node-id="'+currentFrontierNodeId()+'"]')
  ||document.querySelector('.dp-node');
}
function scrollToCurrentStation(smooth=true){
 if(state.viewMode!=='map')return;
 const target=getCurrentStationElement();
 if(!target)return;
 target.scrollIntoView({
  block:'center',
  inline:'center',
  behavior:(smooth&&!reduced.matches)?'smooth':'auto'
 });
}
let jumpBtn=null,scrollTicking=false;
function updateJumpButton(){
 if(!jumpBtn)jumpBtn=$('duo-jump-current');
 if(!jumpBtn)return;
 if(state.viewMode!=='map'||(state.mapSubView!=='lesson1'&&state.mapSubView!=='lesson2'&&state.mapSubView!=='lesson3'&&state.mapSubView!=='lesson4'&&state.mapSubView!=='lesson5'&&state.mapSubView!=='u2_lesson1')){
  jumpBtn.hidden=true;
  return;
 }
 const target=getCurrentStationElement();
 if(!target){
  jumpBtn.hidden=true;
  return;
 }
 const rect=target.getBoundingClientRect();
 const vh=window.innerHeight;
 const isMobile=window.innerWidth<=640;
 const topCut=isMobile?56:64;
 const botCut=vh-(isMobile?136:86);
 const isVisible=(rect.bottom>topCut&&rect.top<botCut);
 if(isVisible){
  jumpBtn.hidden=true;
 }else{
  jumpBtn.hidden=false;
  const arrow=jumpBtn.querySelector('.jump-arrow');
  if(arrow){
   if(rect.top>=botCut){
    arrow.textContent='↓';
    jumpBtn.setAttribute('aria-label','الانتقال لأسفل إلى محطتي الحالية');
   }else{
    arrow.textContent='↑';
    jumpBtn.setAttribute('aria-label','الانتقال لأعلى إلى محطتي الحالية');
   }
  }
 }
}
function showDuolingoMap(autoScroll=true){
 const prevSub=state.mapSubView;
 pauseRapid();stopStory();stopSpeech();cancelDigitGestures();dragController?.cancel();
 if(typeof L1Runner!=='undefined'&&L1Runner.closeToMap){L1Runner.closeToMap();}
 if(prevSub==='unit1_exam'||prevSub==='sections'||prevSub==='units'||prevSub==='u2_sections'||prevSub==='u2_lesson1')state.mapSubView=prevSub;
 state.infiniteMode=false;
 state.viewMode='map';
 renderDuolingoMap();
 updateViewDom();
 renderHUD();
 saveState();
 if(autoScroll){
  requestAnimationFrame(()=>{
   setTimeout(()=>{
    scrollToCurrentStation(true);
    updateJumpButton();
   },60);
  });
 }
}
function completeCurrentNodeAndAdvance(){
 const curId=state.activeNode,node=PATH_NODES[curId];
 if(!node)return;
 if(node.type==='story'){
  const allowed=node.slides,viewedCount=allowed.filter(i=>state.viewedSlides[node.unit].has(i)).length;
  if(viewedCount<allowed.length&&!isNodeCompleted(curId)){
   nextStory(1);
   return;
  }
 }
 if(node.type==='playground'&&playgroundState.questsDone.size<3&&!isNodeCompleted(curId)){
  guide('أنجز 3 تحديات في الملعب أولًا لفتح المحطة التالية!',4500);
  return;
 }
 state.nodesCompleted.add(curId);
 checkMilestoneBadges();if(!state.nodeStars)state.nodeStars={};
 if(node.type==='story'||node.type==='playground')state.nodeStars[curId]=3;
 renderHUD();renderDuolingoMap();saveState();
 if(curId<PATH_NODES.length-1){
  openNode(curId+1);
 }else{
  showFinish();
 }
}
function startHeartRecharge(){
 if(typeof L1Runner!=='undefined'&&L1Runner.openRecharge){L1Runner.openRecharge();return;}
 pauseRapid();stopStory();stopSpeech();
 state.returnNode=state.activeNode;
 state.rechargeSolved=false;
 let qIdx=playgroundQuests.findIndex((_,i)=>!playgroundState.questsDone.has(i));
 if(qIdx<0){
  qIdx=(playgroundState.questIndex+1)%playgroundQuests.length;
  playgroundState.questsDone.delete(qIdx);
 }
 playgroundState.questIndex=qIdx;
 state.viewMode='recharge';
 updateViewDom();
 updatePlayground();
 guide('حلّ هذا التحدي السريع في ملعب الأعداد لتشحن قلوبك الثلاثة كاملة!',5000);
 window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
}
function openScratchpad(){
 if(!isNodeCompleted(1)){
  guide('مسودة الملعب تفتح بعد إتمام المحطة 2 (ملعب الأعداد التفاعلي)!',4500);
  return;
 }
 if(typeof L1Runner!=='undefined'&&L1Runner.openScratchpad){L1Runner.openScratchpad();return;}
 pauseRapid();stopStory();stopSpeech();
 state.returnNode=state.activeNode;
 const s=currentStep();
 if(s&&typeof s.n==='number')playgroundState.number=s.n;
 state.viewMode='scratchpad';
 updateViewDom();
 updatePlayground();
 guide('فتحت مسودة الملعب! جرّب العدد واكتشف منازله ثم اضغط «العودة إلى السؤال والمهمة».',4800);
 window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
}

function renderExperiments(){const root=$('experiment-cards');root.replaceChildren();[{n:10579747,label:'سكان المملكة · 2019'},{n:2051841,label:'مثال القيمة المنزلية'},{n:149598428,label:'الأرض والشمس'}].forEach(item=>{const card=document.createElement('div');card.className='experiment-card';card.innerHTML='<span>'+item.label+'</span><div class="experiment-digits"></div>';String(item.n).split('').forEach((d,i)=>{const p=String(item.n).length-1-i,b=document.createElement('button');b.type='button';b.textContent=d;b.setAttribute('aria-label','استكشف الرقم '+d+' في '+places[p]);b.addEventListener('click',()=>{$('experiment-answer').textContent='الرقم '+d+' في '+places[p]+'؛ قيمته '+fmt(Number(d)*10**p)+'.';});card.querySelector('.experiment-digits').append(b);});root.append(card);});}
function applyScene(){cancelDigitGestures();dragController?.cancel();stopSpeech();const training=state.scene===1;document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.scene)===state.scene);b.setAttribute('aria-pressed',String(Number(b.dataset.scene)===state.scene));});$('right-eyebrow').textContent=training?'الوحدة الأولى · مراجعة':'الدرس الأول';$('lesson-title').innerHTML=training?'أتدرّب<br>وأحلّ المسائل':'القيمة المنزلية<br>ضمن الملايين';$('lesson-circle').innerHTML=training?getIconSVG('check'):'1';$('player-title').textContent=training?'مراجعة بالحركة':'الدرس بالحركة';$('task-section-name').textContent=training?'أتدرّب وأحل المسائل':'أجرّب وأتعلّم';$('left-title').textContent=training?'ست محطات للإتقان':'ست محطات للاكتشاف';$('right-page-number').textContent=training?'10':'8';$('left-page-number').textContent=training?'11':'9';$('experiments').hidden=training;$('source-tag').textContent=training?'مسائل الصفحتين 10 و11 · أعداد ومعلومات الكتاب محفوظة كما وردت.':'أمثلة الدرس من الصفحتين 8 و9 · السكان في نهاية 2019 والمسافات تقريبية.';$('left-footer').textContent=training?'أطبّق وأبرّر وأكتشف الخطأ':'أتعلّم بالمحاولة';renderStory();renderMission();renderDuolingoMap();renderHUD();updateViewDom();}
function switchScene(scene){
 const unit1Unlocked=isNodeUnlocked(10)||[0,1,2,3,4,5].every(i=>state.completed.has(i));
 if(scene===1&&!unit1Unlocked){
  guide('الفصل الثاني (صفحات التدريب 10-11) مقفل الآن. أكمل محطات الفصل الأول العشر بالترتيب ليفتح!',5000);
  return;
 }
 if(state.viewMode==='map'){
  state.scene=scene;
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.scene)===state.scene);b.setAttribute('aria-pressed',String(Number(b.dataset.scene)===state.scene));});
  const targetStageId=scene===1?3:0;
  if(state.expandedStages)state.expandedStages.add(targetStageId);
  renderDuolingoMap();
  jumpToPart('duo-stage-'+targetStageId);
  return;
 }
 if(state.flipping||scene===state.scene)return;
 pauseRapid();stopStory();stopSpeech();resetTaskInteractions();cancelDigitGestures();counterToken++;
 const targetNode=PATH_NODES.find(n=>n.unit===scene&&!isNodeCompleted(n.id))||PATH_NODES.find(n=>n.unit===scene);
 if(targetNode){openNode(targetNode.id);return;}
 state.scene=scene;applyScene();saveState();
}
function nextTask(){
 if(state.infiniteMode){startInfiniteMode(state.infiniteSkill);return;}
 if(!isPassed())return;pauseRapid();const id=activeId(),r=record();
 if(r.index<missions[id].steps.length-1){r.index++;renderMission();saveState();jumpToPart('action-coach');return;}
 const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
 if(mNode){
  state.nodesCompleted.add(mNode.id);
  if(mNode.id<PATH_NODES.length-1){openNode(mNode.id+1);return;}
 }
 if(id===11){showFinish();return;}
 showDuolingoMap();
}
function previousTask(){
 if(state.infiniteMode){exitInfiniteMode();return;}
 pauseRapid();const r=record();
 if(r.index>0){r.index--;renderMission();saveState();jumpToPart('action-coach');}
 else showDuolingoMap();
}
function resetAll(){pauseRapid();stopStory();stopSpeech();if(typeof L1Runner!=='undefined'&&L1Runner.closeToMap)L1Runner.closeToMap();[guideTimer,heartTimer,flipTimer,flipEndTimer,finishTimer,confettiTimer].forEach(clearTimeout);heartTimer=null;counterToken++;resetTaskInteractions();cancelDigitGestures();playgroundState.questIndex=0;playgroundState.questsDone.clear();resetPlayground();state.scene=0;state.cursors=[0,0];state.completed.clear();state.nodesCompleted.clear();state.nodeStars={};state.unitProjectDone=false;state.unit2ProjectDone=false;state.u2Lesson1=typeof createDefaultU2L1State==='function'?createDefaultU2L1State():null;state.mapSubView='lesson1';state.lastActiveLesson='lesson1';state.viewedSlides=[new Set(),new Set()];state.activeNode=0;state.viewMode='map';state.runnerStep=null;state.onboarding=createDefaultOnboarding();state.expandedStages=new Set([0]);state.returnNode=null;state.rechargeSolved=false;state.hearts=3;state.errors=0;state.streak=0;state.maxSessionStreak=0;if(state.badges)state.badges.clear();renderStreakIndicator();state.story=[0,0];state.flipping=false;state.finished=false;state.infiniteMode=false;state.skillStats={place:{ok:0,err:0},verbal:{ok:0,err:0},standard:{ok:0,err:0},expanded:{ok:0,err:0}};state.infiniteStats={solved:0,streak:0,maxStreak:0,bonusPoints:0};state.aiQuiz={day:getLocalDateString(),rewarded:0,seen:[]};state.exitTicket=typeof createDefaultExitTicketState==='function'?createDefaultExitTicketState():null;state.lesson2=typeof createDefaultLesson2State==='function'?createDefaultLesson2State():null;state.lesson3=typeof createDefaultLesson3State==='function'?createDefaultLesson3State():null;state.lesson4=typeof createDefaultLesson4State==='function'?createDefaultLesson4State():null;state.lesson5=typeof createDefaultLesson5State==='function'?createDefaultLesson5State():null;state.unit1Exam=typeof createDefaultUnit1ExamState==='function'?createDefaultUnit1ExamState():null;if($('unit1-exam-view')){$('unit1-exam-view').hidden=true;$('unit1-exam-view').replaceChildren();}makeRecords();try{localStorage.removeItem(STORAGE_KEY);}catch{}$('book').classList.remove('flipping','backwards');$('guide').classList.remove('show');$('confetti').replaceChildren();['finish-dialog','reset-dialog'].forEach(id=>{if($(id)?.open)$(id).close();});$('experiments').open=false;$('experiment-answer').textContent='أي رقم تريد أن تستكشف؟';applyScene();showDuolingoMap(false);guide('تمت إعادة ضبط التقدم. اختر المحطة الأولى من الخريطة لتبدأ!',4800);}
