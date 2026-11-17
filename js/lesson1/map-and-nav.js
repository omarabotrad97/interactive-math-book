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
 const fillW=p===0?0:Math.max(14,p);
 return '<div class="duo-sec-prog-row">'
  +'<div class="duo-sec-prog-track" role="progressbar" aria-label="نسبة الإنجاز: '+ar(p)+' في المئة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'">'
  +'<div class="duo-sec-prog-fill" style="width:'+fillW+'%"></div>'
  +'<span class="duo-sec-prog-pct'+(p===0?' zero':'')+'"><bdi>'+ar(p)+'%</bdi></span>'
  +'</div>'
  +renderDuoTrophySVG(p>=100)
  +'</div>';
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
  sub:'الصفحات 8 - 11 · 20 محطة تفاعلية (الشرح، ملعب الأعداد، وأتدرّب وأحل المسائل)',
  desc:'أحدّد القيمة المنزلية لكل رقم في عدد ضمن الملايين، وأقرأ الأعداد وأكتبها بالصيغ القياسية واللفظية والتحليلية من خلال 20 محطة تفاعلية متدرجة.',
  duration:'20 محطة تفاعلية',
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
  kicker:'تقويم ختامي',
  kickerCls:'exam',
  title:'اختبار نهاية الوحدة',
  sub:'اختبار شامل لقياس إتقان مهارات الوحدة الأولى: الأعداد جمعها وطرحها',
  desc:'يقيّم هذا الاختبار الشامل إتقانك لجميع مهارات الوحدة الأولى: القيمة المنزلية ضمن الملايين، مقارنة الأعداد وترتيبها، جمع الأعداد الكلية وطرحها، الأعداد السالبة، وخطة حل المسألة.',
  duration:'20 سؤالاً',
  points:'400 نقطة + شهادة الوحدة',
  kind:'اختبار نهاية الوحدة الأولى',
  unlockReq:'يفتح «اختبار نهاية الوحدة» بعد إتمام الدروس الخمسة في الوحدة الأولى (الأعداد: جمعها وطرحها).'
 }
];
const UPCOMING_SECTIONS=[
 {
  id:'sec2',
  secNum:2,
  title:'القسم 2 · الوحدة 2: الضرب والقسمة',
  sub:'تقدير نواتج الضرب والقسمة، الضرب في عدد من منزلة ومنزلتين، والقسمة الطويلة',
  desc:'يتناول القسم الثاني (الوحدة الثانية من الكتاب) مهارات ضرب الأعداد الكلية وقسمتها، مع خطة حل المسألة واختبار نهاية الوحدة الثانية.',
  unlockReq:'يفتح «القسم 2 (الوحدة 2: الضرب والقسمة)» بعد اجتياز «اختبار نهاية الوحدة الأولى».'
 },
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
 state.mapSubView=(sub==='lesson1'||sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5'||sub==='units')?sub:'sections';
 closeAllNodePopovers();
 renderDuolingoMap();
 saveState();
 if(state.mapSubView==='lesson1'||state.mapSubView==='lesson2'||state.mapSubView==='lesson3'||state.mapSubView==='lesson4'||state.mapSubView==='lesson5'){
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
function renderSectionsOverview(){
 const root=$('duo-sections-root');if(!root)return;
 root.replaceChildren();
 const doneNodes=PATH_NODES.filter(n=>isNodeCompleted(n.id)).length;
 const lesson1Pct=Math.round((doneNodes/PATH_NODES.length)*100);
 const l2DoneTotal=typeof getLesson2DoneCount==='function'?getLesson2DoneCount():0;
 const l3DoneTotal=typeof getLesson3DoneCount==='function'?getLesson3DoneCount():0;
 const l4DoneTotal=typeof getLesson4DoneCount==='function'?getLesson4DoneCount():0;
 const l5DoneTotal=typeof getLesson5DoneCount==='function'?getLesson5DoneCount():0;
 const projectPct=state.unitProjectDone?100:0;
 const unit1TotalPct=Math.round(((state.unitProjectDone?1:0)+(doneNodes/PATH_NODES.length)+(l2DoneTotal/15)+(l3DoneTotal/16)+(l4DoneTotal/14)+(l5DoneTotal/10))/7*100);

 if(state.mapSubView==='units'){
  /* المستوى الأول: أقسام الكتاب (الوحدات) بنفس بساطة الصورة 1 تماماً */
  const sec1Card=document.createElement('article');
  sec1Card.className='duo-sec-card clickable';
  sec1Card.setAttribute('role','button');
  sec1Card.setAttribute('tabindex','0');
  sec1Card.innerHTML='<div class="duo-sec-hero-banner">'
   +'<div class="duo-sec-bubble">أقرأ الأعداد ضمن الملايين وأجمعها وأطرحها!</div>'
   +'<div class="duo-sec-owl-wrap">'+renderDuoOwlSVG()+'</div>'
   +'</div>'
   +'<div class="duo-sec-body">'
   +'<h2 class="duo-sec-title">القسم 1: الأعداد: جمعها وطرحها</h2>'
   +renderDuoProgBarHTML(unit1TotalPct)
   +'</div>';
  sec1Card.addEventListener('click',()=>setMapSubView('sections',true));
  sec1Card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setMapSubView('sections',true);}});
  root.append(sec1Card);

  UPCOMING_SECTIONS.forEach(secItem=>{
   const card=document.createElement('article');
   card.className='duo-sec-card clickable';
   card.setAttribute('role','button');
   card.setAttribute('tabindex','0');
   const cleanSecTitle=secItem.title.replace('· الوحدة '+secItem.secNum,'');
   card.innerHTML='<div class="duo-sec-body">'
    +'<h2 class="duo-sec-title">'+cleanSecTitle+'</h2>'
    +renderDuoProgBarHTML(0)
    +'</div>';
   const activate=()=>showCurriculumSheet(secItem.id);
   card.addEventListener('click',activate);
   card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
   root.append(card);
  });
  return;
 }

 /* المستوى الثاني: دروس القسم 1 (الوحدة الأولى) بنفس بساطة الصورة 1 تماماً */
 const backBar=document.createElement('div');
 backBar.className='duo-sec-backbar';
 backBar.innerHTML='<button type="button" class="duo-sec-backbtn" id="duo-to-units-btn">→ الأقسام</button><strong>القسم 1: الأعداد: جمعها وطرحها</strong>';
 backBar.querySelector('#duo-to-units-btn').addEventListener('click',()=>setMapSubView('units',true));
 root.append(backBar);

 UNIT1_CURRICULUM.forEach(item=>{
  const isL1=!!item.isLesson1;
   const isL2=!!item.isLesson2;
   const isL3=!!item.isLesson3;
   const isL4=!!item.isLesson4;
   const isL5=!!item.isLesson5;
   const l2Done=typeof getLesson2DoneCount==='function'?getLesson2DoneCount():0;
   const lesson2Pct=Math.round((l2Done/15)*100);
   const l3Done=typeof getLesson3DoneCount==='function'?getLesson3DoneCount():0;
   const lesson3Pct=Math.round((l3Done/16)*100);
   const l4Done=typeof getLesson4DoneCount==='function'?getLesson4DoneCount():0;
   const lesson4Pct=Math.round((l4Done/14)*100);
   const l5Done=typeof getLesson5DoneCount==='function'?getLesson5DoneCount():0;
   const lesson5Pct=Math.round((l5Done/10)*100);
  const isProj=item.id==='project';
  const pct=isL1?lesson1Pct:(isL2?lesson2Pct:(isL3?lesson3Pct:(isL4?lesson4Pct:(isL5?lesson5Pct:(isProj?projectPct:0)))));
  const card=document.createElement('article');
  card.className='duo-sec-card clickable';
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  const heroPart=isL1
   ?('<div class="duo-sec-hero-banner">'
     +'<div class="duo-sec-bubble">أقرأ الأعداد ضمن الملايين وأكتبها بصيغ مختلفة!</div>'
     +'<div class="duo-sec-owl-wrap">'+renderDuoOwlSVG()+'</div>'
     +'</div>')
   :'';
  card.innerHTML=heroPart
   +'<div class="duo-sec-body">'
   +'<h3 class="duo-sec-title">'+item.title+'</h3>'
   +renderDuoProgBarHTML(pct)
   +'</div>';
  const activate=()=>{
   if(isL1){
    setMapSubView('lesson1',true);
   }else if(isL2){
    if(isLesson2Unlocked()){
     setMapSubView('lesson2',true);
    }else{
     showCurriculumSheet('lesson2');
    }
   }else if(isL3){
    if(typeof isLesson3Unlocked==='function'&&isLesson3Unlocked()){
     setMapSubView('lesson3',true);
    }else{
     showCurriculumSheet('lesson3');
    }
   }else if(isL4){
    if(typeof isLesson4Unlocked==='function'&&isLesson4Unlocked()){
     setMapSubView('lesson4',true);
    }else{
     showCurriculumSheet('lesson4');
    }
   }else if(isL5){
    if(typeof isLesson5Unlocked==='function'&&isLesson5Unlocked()){
     setMapSubView('lesson5',true);
    }else{
     showCurriculumSheet('lesson5');
    }
   }else{
    showCurriculumSheet(item.id);
   }
  };
  card.addEventListener('click',activate);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
  root.append(card);
 });
}
let currentSheetCurriculumId=null;
function showCurriculumSheet(itemId){
 const item=UNIT1_CURRICULUM.find(x=>x.id===itemId)||UPCOMING_SECTIONS.find(x=>x.id===itemId);
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
function renderNodeIconSVG(node,completed,isGate,isFront){
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
   +'<path d="M7 16.5L13 22.5L25 10.5" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>'
   +'</svg>';
 }
 if(node.type==='story'&&!isFront){
  return '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true">'
   +'<path d="M6 20v-2a12 12 0 0 1 24 0v2" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/>'
   +'<rect x="4" y="17" width="6" height="12" rx="3" fill="currentColor"/>'
   +'<rect x="26" y="17" width="6" height="12" rx="3" fill="currentColor"/>'
   +'<rect x="10" y="18" width="5.5" height="12" rx="2.75" fill="currentColor" opacity="0.7"/>'
   +'<rect x="20.5" y="18" width="5.5" height="12" rx="2.75" fill="currentColor" opacity="0.7"/>'
   +'</svg>';
 }
 return '<svg viewBox="0 0 32 32" aria-hidden="true">'
  +'<path d="M16 4.5l3.3 6.7 7.4 1.1-5.3 5.2 1.2 7.4L16 21.4l-6.6 3.5 1.2-7.4-5.3-5.2 7.4-1.1L16 4.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
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
function closeAllNodePopovers(){
 openPopoverNodeId=null;
 document.querySelectorAll('.dp-popover').forEach(el=>el.remove());
 document.querySelectorAll('.dp-wrap.popover-open').forEach(el=>el.classList.remove('popover-open'));
 document.querySelectorAll('.dp-unit.has-open-popover').forEach(el=>el.classList.remove('has-open-popover'));
}
function toggleNodePopover(nodeId,wrapEl,subView){
 const ctxKey=subView||(wrapEl&&wrapEl.closest('[id^="l5-stage-"]')?'lesson5':(wrapEl&&wrapEl.closest('[id^="l4-stage-"]')?'lesson4':(wrapEl&&wrapEl.closest('[id^="l3-stage-"]')?'lesson3':(wrapEl&&wrapEl.closest('[id^="l2-stage-"]')?'lesson2':'lesson1'))));
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
 requestAnimationFrame(()=>{
  try{
   const bt=document.getElementById('bottom-tabs');
   const safeBottom=(bt&&getComputedStyle(bt).display!=='none')?bt.getBoundingClientRect().top:window.innerHeight;
   const pr=pop.getBoundingClientRect();
   if(pr.bottom>safeBottom-12){
    const wr=wrapEl.getBoundingClientRect();
    if(wr.top-pr.height-28>72){
     pop.classList.add('open-above');
    }
   }
   pop.scrollIntoView({block:'nearest',inline:'nearest',behavior:(typeof reduced!=='undefined'&&reduced.matches)?'auto':'smooth'});
  }catch{}
 });
}
document.addEventListener('click',e=>{
 if(openPopoverNodeId!==null&&!e.target.closest('.dp-wrap')){
  closeAllNodePopovers();
 }
});
function renderUnifiedStageMapUnits(unitsRoot,ctx){
 if(!unitsRoot||!ctx)return;
 unitsRoot.replaceChildren();
 const XS=[0,-44,-68,-44,0,44,68,44];
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
  const pathId=ctx.pathIdPrefix+st.id;
  const stepBadgeHTML=isStageDone
   ?'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
   :ar(st.num);
  const statusSuffix=isCurrentStage?' · مرحلتك الحالية':(isStageDone?' · مكتملة':'');
  sec.innerHTML='<header class="dp-head">'
   +'<span class="dp-head-line" aria-hidden="true"></span>'
   +'<div class="dp-head-pill">'
   +'<span class="stage-step-badge" aria-hidden="true">'+stepBadgeHTML+'</span>'
   +'<div class="dp-head-main">'
   +'<small>المرحلة '+ar(st.num)+' من '+ar(totalStages)+' · المحطات <bdi>'+st.rangeLabel.replace('المحطات ','')+'</bdi>'+statusSuffix+'</small>'
   +'<h2>'+st.title+'</h2>'
   +'</div>'
   +'<span class="stage-sub-meta" aria-label="أنجزت '+ar(doneInStage)+' من '+ar(stNodes.length)+' محطات"><bdi>'+ar(doneInStage)+'/'+ar(stNodes.length)+'</bdi></span>'
   +'</div>'
   +'<span class="dp-head-line" aria-hidden="true"></span>'
   +'</header><div class="dp-path" id="'+pathId+'"></div>';

  const pathEl=sec.querySelector('.dp-path');
  stNodes.forEach((node,idx)=>{
   const x=XS[idx%XS.length];
   const completed=ctx.isCompleted(node.id),unlocked=ctx.isUnlocked(node.id),isFront=node.id===ctx.frontier&&!ctx.allDone;
   const prog=ctx.getProgress(node.id);
   const wrap=document.createElement('div');
   wrap.className='dp-wrap'+(completed?' done':'')+(isFront?' current-wrap':'');
   wrap.style.setProperty('--x',x+'px');
   if(isFront){
    wrap.insertAdjacentHTML('beforeend','<span class="dp-callout">ابدأ</span>');
   }
   const btn=document.createElement('button');btn.type='button';
   btn.dataset.trackNodeId=String(node.id);
   if(ctx.key==='lesson2')btn.setAttribute('data-l2-node-id',String(node.id));
   else if(ctx.key==='lesson3')btn.setAttribute('data-l3-node-id',String(node.id));
   else if(ctx.key==='lesson4')btn.setAttribute('data-l4-node-id',String(node.id));
   else if(ctx.key==='lesson5')btn.setAttribute('data-l5-node-id',String(node.id));
   else btn.dataset.nodeId=String(node.id);
   const isGate=ctx.isGate(node);
   btn.className='dp-node '+(completed?'completed':unlocked?'current':'locked')+(isFront?' front':'')+(isGate?' chest-node':'');
   btn.setAttribute('aria-label',node.title.replace(/^\d+\.\s*/,''));
   let ringHTML='';
   if(isFront&&!isGate){
    const offset=Math.max(0,100-prog.pct);
    ringHTML='<svg class="dp-ring-svg" viewBox="0 0 104 104" aria-hidden="true"><circle class="dp-ring-track" cx="52" cy="52" r="46" pathLength="100"/><circle class="dp-ring-fill" cx="52" cy="52" r="46" pathLength="100" stroke-dasharray="100" stroke-dashoffset="'+offset+'"/></svg>';
   }
   const starsHTML=(completed&&!isGate)?renderStarsBadgeHTML(ctx.getStars(node.id)):'';
   btn.innerHTML=ringHTML+'<span class="dp-ico" style="color:#ffffff" aria-hidden="true">'+renderNodeIconSVG(node,completed,isGate,isFront)+'</span>'+starsHTML;
   btn.addEventListener('click',e=>{
    e.stopPropagation();
    toggleNodePopover(node.id,wrap,ctx.key);
   });
   wrap.append(btn);
   if(idx===1&&isCurrentStage)wrap.insertAdjacentHTML('beforeend','<span class="dp-mascot '+(st.id%2===0?'r':'l')+'" aria-hidden="true">'+renderMascotOwlSVG()+'</span>');
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
 const sub=(state.mapSubView==='lesson1'||state.mapSubView==='lesson2'||state.mapSubView==='lesson3'||state.mapSubView==='lesson4'||state.mapSubView==='lesson5'||state.mapSubView==='units')?state.mapSubView:'sections';
 const secRoot=$('duo-sections-root'),lesWrap=$('duo-lesson-wrap');
 const isLessonMap = (sub==='lesson1'||sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5');
 if(secRoot)secRoot.hidden=isLessonMap;
 if(lesWrap)lesWrap.hidden=!isLessonMap;

 // Update map tabs aria & active class
 if($('duo-tab-sections')){$('duo-tab-sections').classList.toggle('active', sub==='sections'||sub==='units');$('duo-tab-sections').setAttribute('aria-selected', String(sub==='sections'||sub==='units'));}
 if($('duo-tab-lesson1')){$('duo-tab-lesson1').classList.toggle('active', sub==='lesson1');$('duo-tab-lesson1').setAttribute('aria-selected', String(sub==='lesson1'));}
 if($('duo-tab-lesson2')){$('duo-tab-lesson2').classList.toggle('active', sub==='lesson2');$('duo-tab-lesson2').setAttribute('aria-selected', String(sub==='lesson2'));}
 if($('duo-tab-lesson3')){$('duo-tab-lesson3').classList.toggle('active', sub==='lesson3');$('duo-tab-lesson3').setAttribute('aria-selected', String(sub==='lesson3'));}
 if($('duo-tab-lesson4')){$('duo-tab-lesson4').classList.toggle('active', sub==='lesson4');$('duo-tab-lesson4').setAttribute('aria-selected', String(sub==='lesson4'));}
 if($('duo-tab-lesson5')){$('duo-tab-lesson5').classList.toggle('active', sub==='lesson5');$('duo-tab-lesson5').setAttribute('aria-selected', String(sub==='lesson5'));}

 // Update topbar title & lab trigger for active lesson
 const metaUnit = document.querySelector('.duo-lesson-topbar-info .lesson-meta-unit');
 const metaTitle = document.querySelector('.duo-lesson-topbar-info .lesson-meta-title');
 const duoLabBtn = $('duo-open-lab-btn');
 const duoLabLbl = $('duo-open-lab-label');
 if(sub==='lesson5'){
  if(metaUnit) metaUnit.textContent = 'الوحدة 1 · الصفحات 24 - 25';
  if(metaTitle) metaTitle.textContent = 'الدرس 5: خطة حل المسألة: أنشئ جدولاً';
  if(duoLabBtn) duoLabBtn.hidden = false;
  if(duoLabLbl) duoLabLbl.textContent = 'مختبر الجداول';
 }else if(sub==='lesson4'){
  if(metaUnit) metaUnit.textContent = 'الوحدة 1 · الصفحات 20 - 23';
  if(metaTitle) metaTitle.textContent = 'الدرس 4: الأعداد السالبة';
  if(duoLabBtn) duoLabBtn.hidden = false;
  if(duoLabLbl) duoLabLbl.textContent = 'مختبر الأعداد السالبة';
 }else if(sub==='lesson3'){
  if(metaUnit) metaUnit.textContent = 'الوحدة 1 · الصفحات 16 - 19';
  if(metaTitle) metaTitle.textContent = 'الدرس 3: جمع الأعداد الكلية وطرحها';
  if(duoLabBtn) duoLabBtn.hidden = false;
  if(duoLabLbl) duoLabLbl.textContent = 'مختبر الجمع والطرح';
 }else if(sub==='lesson2'){
  if(metaUnit) metaUnit.textContent = 'الوحدة 1 · الصفحات 12 - 15';
  if(metaTitle) metaTitle.textContent = 'الدرس 2: مقارنة الأعداد وترتيبها';
  if(duoLabBtn) duoLabBtn.hidden = false;
  if(duoLabLbl) duoLabLbl.textContent = 'مختبر المقارنة';
 }else if(sub==='lesson1'){
  if(metaUnit) metaUnit.textContent = 'الوحدة 1 · الصفحات 8 - 11';
  if(metaTitle) metaTitle.textContent = 'الدرس 1: القيمة المنزلية ضمن الملايين';
  if(duoLabBtn) duoLabBtn.hidden = true;
 }else{
  if(duoLabBtn) duoLabBtn.hidden = true;
 }
 if($('l3-open-lab-btn')) $('l3-open-lab-btn').hidden = !(state.viewMode==='lesson3'||(state.viewMode==='map'&&sub==='lesson3'));
 if($('l4-open-lab-btn')) $('l4-open-lab-btn').hidden = !(state.viewMode==='lesson4'||(state.viewMode==='map'&&sub==='lesson4'));
 if($('l5-open-lab-btn')) $('l5-open-lab-btn').hidden = !(state.viewMode==='lesson5'||(state.viewMode==='map'&&sub==='lesson5'));
 renderSectionsOverview();
 const heroStartBtn=$('duo-hero-start');
 if(heroStartBtn&&isLessonMap){
  const activeCtx=getActiveMapLessonContext(sub);
  heroStartBtn.textContent=activeCtx.allDone
   ?((sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5')?'▶ مراجعة: تحدي الإتقان':'▶ التحدي المتجدد اللانهائي')
   :('▶ تابع: المحطة '+ar(activeCtx.frontier+1));
 }
 const bypassBanner=$('stage-overview-banner');
 if(bypassBanner)bypassBanner.hidden=(sub==='lesson2'||sub==='lesson3'||sub==='lesson4'||sub==='lesson5');
 unitsRoot.replaceChildren();
 if(sub==='lesson5'){
  if(typeof renderLesson5StageMapUnits==='function') renderLesson5StageMapUnits(unitsRoot);
 }else if(sub==='lesson4'){
  if(typeof renderLesson4StageMapUnits==='function') renderLesson4StageMapUnits(unitsRoot);
 }else if(sub==='lesson3'){
  if(typeof renderLesson3StageMapUnits==='function') renderLesson3StageMapUnits(unitsRoot);
 }else if(sub==='lesson2'){
  renderLesson2StageMapUnits(unitsRoot);
 }else{
  renderStageMapUnits(unitsRoot);
 }
 return;
 const unitMeta=[
  {unit:0,cls:'u1',badge:'القسم 1، الدرس 1',title:'القيمة المنزلية ضمن الملايين'},
  {unit:1,cls:'u2',badge:'القسم 1، الدرس 1 · التدريب',title:'أتدرّب وأحل المسائل'}
 ];
 const XS=[0,-44,-68,-44,0,44,68,44];
 unitMeta.forEach(u=>{
  const sec=document.createElement('section');sec.className='dp-unit '+u.cls;sec.id='duo-unit-'+u.unit;
  const uNodes=PATH_NODES.filter(n=>n.unit===u.unit);
  sec.innerHTML='<header class="dp-head">'
   +'<div class="dp-head-main"><small>'+u.badge+'</small><h2>'+u.title+'</h2></div>'
   +'<button type="button" class="dp-head-guide-btn" aria-label="العودة إلى قائمة الدروس والأقسام" title="قائمة الدروس والأقسام">'+renderNotebookIconSVG()+'</button>'
   +'</header><div class="dp-path"></div>';
  sec.querySelector('.dp-head-main').addEventListener('click',()=>setMapSubView('sections',true));
  sec.querySelector('.dp-head-guide-btn').addEventListener('click',()=>setMapSubView('sections',true));
  const pathEl=sec.querySelector('.dp-path');
  uNodes.forEach((node,idx)=>{
   const x=XS[idx%XS.length];
   const completed=isNodeCompleted(node.id),unlocked=isNodeUnlocked(node.id),isFront=node.id===frontier&&!allDone;
   const prog=getNodeProgress(node.id);
   const wrap=document.createElement('div');
   wrap.className='dp-wrap'+(completed?' done':'')+(isFront?' current-wrap':'');
   wrap.style.setProperty('--x',x+'px');
   if(isFront){
    wrap.insertAdjacentHTML('beforeend','<span class="dp-callout">ابدأ</span>');
   }
   const btn=document.createElement('button');btn.type='button';
   btn.dataset.nodeId=node.id;
   const isGate=(node.id===2||node.tag==='بوابة الفصل'||node.id===14||node.tag==='الختام والشهادة');
   btn.className='dp-node '+(completed?'completed':unlocked?'current':'locked')+(isFront?' front':'')+(isGate?' chest-node':'');
   btn.setAttribute('aria-label',node.title.replace(/^\d+\.\s*/,''));
   let ringHTML='';
   if(isFront&&!isGate){
    const offset=Math.max(0,100-prog.pct);
    ringHTML='<svg class="dp-ring-svg" viewBox="0 0 104 104" aria-hidden="true"><circle class="dp-ring-track" cx="52" cy="52" r="46" pathLength="100"/><circle class="dp-ring-fill" cx="52" cy="52" r="46" pathLength="100" stroke-dasharray="100" stroke-dashoffset="'+offset+'"/></svg>';
   }
   const starsHTML=(completed&&!isGate)?renderStarsBadgeHTML(getNodeStars(node.id)):'';
   btn.innerHTML=ringHTML+'<span class="dp-ico" style="color:#ffffff" aria-hidden="true">'+renderNodeIconSVG(node,completed,isGate,isFront)+'</span>'+starsHTML;
   btn.addEventListener('click',e=>{
    e.stopPropagation();
    toggleNodePopover(node.id,wrap);
   });
   wrap.append(btn);
   if(idx===2)wrap.insertAdjacentHTML('beforeend','<span class="dp-mascot '+(u.unit===0?'r':'l')+'" aria-hidden="true">'+renderMascotOwlSVG()+'</span>');
   pathEl.append(wrap);
  });
  unitsRoot.append(sec);
 });
 requestAnimationFrame(()=>{
  updatePathTrackSVGs();
 });
}
function updatePathTrackSVGs(){
 if(state.viewMode!=='map'||(state.mapSubView!=='lesson1'&&state.mapSubView!=='lesson2'&&state.mapSubView!=='lesson3'&&state.mapSubView!=='lesson4'&&state.mapSubView!=='lesson5'))return;
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
 if(state.viewMode!=='map'||(state.mapSubView!=='lesson1'&&state.mapSubView!=='lesson2'&&state.mapSubView!=='lesson3'&&state.mapSubView!=='lesson4'&&state.mapSubView!=='lesson5')){
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
 pauseRapid();stopStory();stopSpeech();cancelDigitGestures();dragController?.cancel();
 if(typeof L1Runner!=='undefined'&&L1Runner.closeToMap){L1Runner.closeToMap();}
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
function resetAll(){pauseRapid();stopStory();stopSpeech();if(typeof L1Runner!=='undefined'&&L1Runner.closeToMap)L1Runner.closeToMap();[guideTimer,heartTimer,flipTimer,flipEndTimer,finishTimer,confettiTimer].forEach(clearTimeout);heartTimer=null;counterToken++;resetTaskInteractions();cancelDigitGestures();playgroundState.questIndex=0;playgroundState.questsDone.clear();resetPlayground();state.scene=0;state.cursors=[0,0];state.completed.clear();state.nodesCompleted.clear();state.nodeStars={};state.unitProjectDone=false;state.mapSubView='lesson1';state.viewedSlides=[new Set(),new Set()];state.activeNode=0;state.viewMode='map';state.runnerStep=null;state.onboarding=createDefaultOnboarding();state.expandedStages=new Set([0]);state.returnNode=null;state.rechargeSolved=false;state.hearts=3;state.errors=0;state.streak=0;state.maxSessionStreak=0;if(state.badges)state.badges.clear();renderStreakIndicator();state.story=[0,0];state.flipping=false;state.finished=false;state.infiniteMode=false;state.skillStats={place:{ok:0,err:0},verbal:{ok:0,err:0},standard:{ok:0,err:0},expanded:{ok:0,err:0}};state.infiniteStats={solved:0,streak:0,maxStreak:0,bonusPoints:0};state.aiQuiz={day:getLocalDateString(),rewarded:0,seen:[]};state.exitTicket=typeof createDefaultExitTicketState==='function'?createDefaultExitTicketState():null;state.lesson2=typeof createDefaultLesson2State==='function'?createDefaultLesson2State():null;state.lesson3=typeof createDefaultLesson3State==='function'?createDefaultLesson3State():null;state.lesson4=typeof createDefaultLesson4State==='function'?createDefaultLesson4State():null;state.lesson5=typeof createDefaultLesson5State==='function'?createDefaultLesson5State():null;makeRecords();try{localStorage.removeItem(STORAGE_KEY);}catch{}$('book').classList.remove('flipping','backwards');$('guide').classList.remove('show');$('confetti').replaceChildren();['finish-dialog','reset-dialog'].forEach(id=>{if($(id)?.open)$(id).close();});$('experiments').open=false;$('experiment-answer').textContent='أي رقم تريد أن تستكشف؟';applyScene();showDuolingoMap(false);guide('تمت إعادة ضبط التقدم. اختر المحطة الأولى من الخريطة لتبدأ!',4800);}
