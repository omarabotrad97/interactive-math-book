/* Lesson 1: Milestone Badges, Streak Indicator & In-Place Heart Recharge */
/* =====================================================================
   Advanced Gamification Engine: Milestone Badges, In-Place Recharge, Streak
   ===================================================================== */
const MILESTONE_BADGES=[
 {
  id:'million-reader',
  nodeId:4,
  stationNumber:5,
  title:'وسام قارئ الملايين',
  tag:'المحطة 5',
  desc:'أتقنت قراءة المنازل الكبرى ودورة الملايين وأثبت جدارتك الحسابية!',
  detail:'يُمنح عند إنهاء المحطة 5 (إتقان قراءة المنازل ودورة الملايين)',
  icon:'million-reader'
 },
 {
  id:'zero-hunter',
  nodeId:9,
  stationNumber:10,
  title:'وسام صياد الأصفار',
  tag:'المحطة 10 · بوابة الفصل',
  desc:'أتقنت القيمة المنزلية وتحويل المنازل إلى أصفار واجتزت بوابة الفصل الأول!',
  detail:'يُمنح عند إنهاء المحطة 10 (إتقان القيمة المنزلية وتحويل المنازل إلى أصفار واجتياز بوابة الفصل)',
  icon:'zero-hunter'
 },
 {
  id:'formula-architect',
  nodeId:14,
  stationNumber:15,
  title:'وسام مهندس الصيغ',
  tag:'المحطة 15',
  desc:'أتقنت التحويل السلس بين الصيغ القياسية واللفظية والتحليلية كمهندس بارع!',
  detail:'يُمنح عند إنهاء المحطة 15 (إتقان التحويل بين الصيغ القياسية واللفظية والتحليلية)',
  icon:'formula-architect'
 },
 {
  id:'million-legend',
  nodeId:19,
  stationNumber:20,
  title:'وسام أسطورة الملايين',
  tag:'الختام والشهادة',
  desc:'أكملت جميع مهام الكتاب الـ 12 وحققت مرتبة الشرف والأسطورة!',
  detail:'يُمنح عند إتمام جميع مهام الكتاب بنجاح',
  icon:'crown'
 }
];

function checkMilestoneBadges(silent=false){
 if(!state.badges)state.badges=new Set();
 let newlyUnlocked=null;
 for(const b of MILESTONE_BADGES){
  const isDone=isNodeCompleted(b.nodeId)||(b.id==='million-legend'&&state.completed&&state.completed.size===12);
  if(isDone&&!state.badges.has(b.id)){
   state.badges.add(b.id);
   if(!newlyUnlocked)newlyUnlocked=b;
  }
 }
 if(newlyUnlocked){
  saveState();
  renderMilestoneBadgesHUD();
  if(!silent){
   showBadgeUnlockModal(newlyUnlocked,false);
  }
 }
}

function renderMilestoneBadgesHUD(){
 const row=$('hud-micro-badges');if(!row)return;
 row.replaceChildren();
 const unlockedCount=MILESTONE_BADGES.filter(b=>state.badges&&state.badges.has(b.id)).length;
 MILESTONE_BADGES.forEach(b=>{
  const unlocked=state.badges&&state.badges.has(b.id);
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='micro-badge-btn desktop-badge '+(unlocked?'unlocked':'locked');
  btn.setAttribute('aria-label',b.title+(unlocked?' (مكتمل)':' (يُفتح عند إنهاء '+b.tag+')'));
  btn.title=b.title+(unlocked?' · مكتمل بإتقان':' · يُفتح عند إنهاء '+b.tag);
  btn.innerHTML=getIconSVG(b.icon);
  btn.onclick=()=>showBadgeUnlockModal(b,!unlocked);
  row.append(btn);
 });
 const summaryBtn=document.createElement('button');
 summaryBtn.type='button';
 summaryBtn.className='micro-badge-summary-btn mobile-badge';
 summaryBtn.setAttribute('aria-label', ar(unlockedCount) + '/4 أوسمة الإتقان');
 summaryBtn.innerHTML='<span class="btn-svg">'+getIconSVG('medal',unlockedCount>0?'gold':'')+'</span><span class="badge-count-num" style="direction:ltr;font-variant-numeric:tabular-nums">'+ar(unlockedCount)+'/4</span>';
 const nextBadge=MILESTONE_BADGES.find(b=>!state.badges||!state.badges.has(b.id))||MILESTONE_BADGES[0];
 summaryBtn.onclick=()=>showBadgeUnlockModal(nextBadge,!state.badges?.has(nextBadge.id));
 row.append(summaryBtn);
}

function showBadgeUnlockModal(badge,isPreview=false){
 const modal=$('badge-unlock-modal');if(!modal)return;
 $('badge-modal-title').textContent=badge.title;
 $('badge-modal-tag').textContent=isPreview?'وسام قادم · '+badge.tag:'وسام إتقان جديد!';
 $('badge-modal-desc').textContent=badge.desc;
 $('badge-modal-meta').textContent=badge.detail+(isPreview?' (واصل تقدمك لفتحه)':' · تم الإنجاز بنجاح');
 $('badge-modal-icon').innerHTML=getIconSVG(badge.icon);
 if(!isPreview){
  sound(true,'badge');
  celebrate(35);
 }
 modal.showModal();
}

function renderStreakIndicator(){
 const count=state.streak||0;
 const active=count>=2;
 const hudPill=$('hud-streak-pill');
 if(hudPill){
  hudPill.classList.toggle('active',active);
  if(active){
   hudPill.innerHTML='<span class="btn-svg">'+getIconSVG('flame','gold')+'</span><span>سلسلة رائعة: <bdi class="num">'+ar(count)+'</bdi> إجابات متتالية!</span>';
  }
 }
 const stPill=$('station-streak-pill');
 if(stPill){
  stPill.classList.toggle('active',active);
  if(active){
   stPill.innerHTML='<span class="btn-svg">'+getIconSVG('flame','gold')+'</span><span class="streak-text-desktop">سلسلة: </span><bdi class="num">'+ar(count)+'</bdi><span class="streak-text-desktop"> متتالية!</span>';
  }
 }
}

let inPlaceRechargeState=null;
let lastRechargeType=-1;

function openInPlaceRecharge(){
 const overlay=$('in-place-recharge-overlay');if(!overlay)return;
 overlay.classList.remove('closing');
 overlay.hidden=false;

 // Choose randomly from 5 distinct challenge types, never repeating the same type consecutively
 let type=Math.floor(Math.random()*5);
 if(type===lastRechargeType){
  type=(type+1)%5;
 }
 lastRechargeType=type;

 const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
 const shuf=arr=>{
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));
   [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
 };

 const headHTML='<div class="recharge-head">'
  +'<span class="recharge-head-icon" aria-hidden="true">'+getIconSVG('spark')+'</span>'
  +'<span class="recharge-head-title" id="recharge-overlay-title">تحدي الشحن الخاطف (10 ثوانٍ)</span>'
  +'</div>';

 if(type===0){
  // TYPE 0: صائد الأصفار التفاعلي (Dynamic Zero Hunter: 2 to 5 zeros with random lead digit)
  const digit=rand(2,9);
  const zeros=rand(2,5);
  const target=digit*Math.pow(10,zeros);
  const zeroLabels=['صفرين','3 أصفار','4 أصفار','5 أصفار'][zeros-2];
  inPlaceRechargeState={type:'zeros',popped:0,target:zeros,finalVal:target};

  let bubblesHTML='';
  for(let i=0;i<zeros;i++){
   bubblesHTML+='<button type="button" class="recharge-zero-bubble" data-zero-idx="'+i+'" aria-label="الصفر رقم '+ar(i+1)+'">0</button>';
  }

  overlay.innerHTML=headHTML
   +'<p class="recharge-instructions">المطلوب: بناء العدد <strong>'+fmt(target)+'</strong>. اضغط الـ <strong>'+zeroLabels+'</strong> لشحن طاقتك!</p>'
   +'<div class="recharge-tactile-area">'
   +' <div class="recharge-zero-stage">'
   +'  <span class="recharge-lead-num">'+digit+'</span>'
   +'  <div class="recharge-zero-bubbles">'+bubblesHTML+'</div>'
   +' </div>'
   +' <div class="recharge-status" id="recharge-status">اضغط الأصفار لاستعادة قلوبك (0 من '+ar(zeros)+')</div>'
   +'</div>';

  const btns=overlay.querySelectorAll('.recharge-zero-bubble');
  const chimeFreqs=[523.25,659.25,783.99,880.00,1046.50];
  btns.forEach(btn=>{
   btn.onclick=()=>{
    if(btn.classList.contains('popped'))return;
    btn.classList.add('popped');
    inPlaceRechargeState.popped++;
    const p=inPlaceRechargeState.popped;
    sound(true,chimeFreqs[Math.min(chimeFreqs.length-1,p-1)]);
    haptic(true);
    const curVal=digit*Math.pow(10,p);
    const statEl=$('recharge-status');
    if(statEl)statEl.textContent='أحسنت! '+ar(p)+' من '+ar(zeros)+' أصفار ('+fmt(curVal)+')';
    if(p>=zeros){
     completeInPlaceRecharge(fmt(target));
    }
   };
  });
 }else if(type===1){
  // TYPE 1: قرص تحديد المنزلة الكبرى (Place Value Dial)
  const places=[
   {name:'المئات',zeros:2},
   {name:'أحاد الألوف',zeros:3},
   {name:'عشرات الألوف',zeros:4},
   {name:'مئات الألوف',zeros:5},
   {name:'الملايين',zeros:6}
  ];
  const place=places[rand(0,places.length-1)];
  const targetDigit=rand(2,9);
  const digits=[];
  for(let i=0;i<7;i++){
   if(i===place.zeros){
    digits.push(targetDigit);
   }else if(i===6){
    digits.push(rand(1,9));
   }else{
    digits.push(rand(0,9));
   }
  }
  const fullNumber=digits.reduce((acc,d,idx)=>acc+d*Math.pow(10,idx),0);

  const optsSet=new Set([targetDigit]);
  while(optsSet.size<4){
   const d=rand(0,9);
   if(d!==targetDigit)optsSet.add(d);
  }
  const options=shuf(Array.from(optsSet));

  overlay.innerHTML=headHTML
   +'<p class="recharge-instructions">ما الرقم الموجود في منزلة <strong>'+place.name+'</strong> في العدد <strong>'+fmt(fullNumber)+'</strong>؟</p>'
   +'<div class="recharge-tactile-area">'
   +' <div class="recharge-dial-stage">'
   +' '+options.map(d=>'<button type="button" class="recharge-dial-option" data-dial-val="'+d+'">'+d+'</button>').join('')
   +' </div>'
   +' <div class="recharge-status" id="recharge-status">المس الرقم الذي يمثل منزلة '+place.name+'</div>'
   +'</div>';

  const opts=overlay.querySelectorAll('.recharge-dial-option');
  opts.forEach(opt=>{
   opt.onclick=()=>{
    const v=Number(opt.dataset.dialVal);
    if(v===targetDigit){
     opt.classList.add('correct');
     sound(true,1046.50);
     haptic(true);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='رائع! الرقم '+ar(targetDigit)+' في منزلة '+place.name;
     completeInPlaceRecharge(place.name+' = '+ar(targetDigit));
    }else{
     sound(false);
     shakeElement(opt);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='جرّب منزلة '+place.name+' مرة أخرى بهدوء';
    }
   };
  });
 }else if(type===2){
  // TYPE 2: القيمة المنزلية للرقم الملوّن (Highlighted Digit Place Value)
  const places=[
   {name:'المئات',zeros:2},
   {name:'أحاد الألوف',zeros:3},
   {name:'عشرات الألوف',zeros:4},
   {name:'مئات الألوف',zeros:5},
   {name:'الملايين',zeros:6}
  ];
  const place=places[rand(0,places.length-1)];
  const digit=rand(2,9);
  const correctVal=digit*Math.pow(10,place.zeros);

  const numDigits=[];
  for(let i=0;i<7;i++){
   if(i===place.zeros){
    numDigits.push(digit);
   }else if(i===6){
    numDigits.push(rand(2,9));
   }else{
    numDigits.push(rand(1,8));
   }
  }
  const fullNumber=numDigits.reduce((acc,d,idx)=>acc+d*Math.pow(10,idx),0);

  const numStr=String(fullNumber);
  const targetIdx=numStr.length-1-place.zeros;
  let formattedHighlight='';
  for(let i=0;i<numStr.length;i++){
   const fromRight=numStr.length-1-i;
   if(i===targetIdx){
    formattedHighlight+='<mark class="recharge-highlight-digit">'+numStr[i]+'</mark>';
   }else{
    formattedHighlight+=numStr[i];
   }
   if(fromRight>0&&fromRight%3===0){
    formattedHighlight+=',';
   }
  }

  const optsSet=new Set([correctVal]);
  const candidateZeros=shuf([0,1,2,3,4,5,6].filter(z=>z!==place.zeros));
  for(const z of candidateZeros){
   if(optsSet.size<4)optsSet.add(digit*Math.pow(10,z));
  }
  const options=shuf(Array.from(optsSet));

  overlay.innerHTML=headHTML
   +'<p class="recharge-instructions">ما القيمة المنزلية للرقم <strong>'+digit+'</strong> الملوّن في العدد؟</p>'
   +'<div class="recharge-tactile-area">'
   +' <div class="recharge-highlight-box">'+formattedHighlight+'</div>'
   +' <div class="recharge-dial-stage">'
   +' '+options.map(v=>'<button type="button" class="recharge-dial-option" data-val="'+v+'">'+fmt(v)+'</button>').join('')
   +' </div>'
   +' <div class="recharge-status" id="recharge-status">المس القيمة المنزلية للرقم '+digit+'</div>'
   +'</div>';

  const opts=overlay.querySelectorAll('.recharge-dial-option');
  opts.forEach(opt=>{
   opt.onclick=()=>{
    const v=Number(opt.dataset.val);
    if(v===correctVal){
     opt.classList.add('correct');
     sound(true,1046.50);
     haptic(true);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='إجابة ممتازة! قيمته المنزلية هي '+fmt(correctVal);
     completeInPlaceRecharge(fmt(correctVal));
    }else{
     sound(false);
     shakeElement(opt);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='تذكّر: عدد الأصفار يساوي المنازل الواقعة على يمينه';
    }
   };
  });
 }else if(type===3){
  // TYPE 3: سباق مقارنة الأعداد السريعة (Speed Greater / Smaller Comparison)
  const isGreater=Math.random()<0.5;
  const millionDigit=rand(2,8);
  const thousands1=rand(100,899);
  let thousands2=rand(100,899);
  while(thousands2===thousands1)thousands2=rand(100,899);

  const numA=millionDigit*1000000+thousands1*1000+rand(100,999);
  const numB=millionDigit*1000000+thousands2*1000+rand(100,999);
  const correct=isGreater?Math.max(numA,numB):Math.min(numA,numB);
  const promptText=isGreater?'العدد الأكبر':'العدد الأصغر';

  overlay.innerHTML=headHTML
   +'<p class="recharge-instructions">المطلوب: اضغط <strong>'+promptText+'</strong> لفتح بوابة الطاقة واستعادة قلوبك!</p>'
   +'<div class="recharge-tactile-area">'
   +' <div class="recharge-compare-stage">'
   +'  <button type="button" class="recharge-compare-card" data-card-val="'+numA+'">'+fmt(numA)+'</button>'
   +'  <button type="button" class="recharge-compare-card" data-card-val="'+numB+'">'+fmt(numB)+'</button>'
   +' </div>'
   +' <div class="recharge-status" id="recharge-status">المس '+promptText+' للمتابعة</div>'
   +'</div>';

  const cards=overlay.querySelectorAll('.recharge-compare-card');
  cards.forEach(card=>{
   card.onclick=()=>{
    const v=Number(card.dataset.cardVal);
    if(v===correct){
     card.classList.add('correct');
     sound(true,1046.50);
     haptic(true);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='أحسنت! '+fmt(correct)+' هو '+promptText;
     completeInPlaceRecharge(fmt(correct));
    }else{
     sound(false);
     shakeElement(card);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='قارن المنازل من اليسار إلى اليمين لتحديد '+promptText;
    }
   };
  });
 }else{
  // TYPE 4: متممات القوة السريعة (Power Complements)
  const bases=[
   {base:1000,step:100},
   {base:10000,step:1000},
   {base:100000,step:10000},
   {base:1000000,step:100000}
  ];
  const b=bases[rand(0,bases.length-1)];
  const mult=rand(1,9);
  const part=mult*b.step;
  const correct=b.base-part;

  const optsSet=new Set([correct]);
  const candidates=[
   correct+b.step,
   correct-b.step,
   correct+b.step*2,
   correct-b.step*2,
   b.step*rand(1,9)
  ].filter(v=>v>0&&v<b.base&&v!==correct);

  for(const c of candidates){
   if(optsSet.size<4)optsSet.add(c);
  }
  while(optsSet.size<4){
   const d=b.step*rand(1,9);
   if(d!==correct)optsSet.add(d);
  }
  const options=shuf(Array.from(optsSet));

  overlay.innerHTML=headHTML
   +'<p class="recharge-instructions">المطلوب: أكمل المعادلة لتشحن طاقتك: <strong>'+fmt(part)+' + ؟ = '+fmt(b.base)+'</strong></p>'
   +'<div class="recharge-tactile-area">'
   +' <div class="recharge-dial-stage">'
   +' '+options.map(v=>'<button type="button" class="recharge-dial-option" data-val="'+v+'">'+fmt(v)+'</button>').join('')
   +' </div>'
   +' <div class="recharge-status" id="recharge-status">المس المتمم الصحيح للوصول إلى '+fmt(b.base)+'</div>'
   +'</div>';

  const opts=overlay.querySelectorAll('.recharge-dial-option');
  opts.forEach(opt=>{
   opt.onclick=()=>{
    const v=Number(opt.dataset.val);
    if(v===correct){
     opt.classList.add('correct');
     sound(true,1046.50);
     haptic(true);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='رائع! '+fmt(part)+' + '+fmt(correct)+' = '+fmt(b.base);
     completeInPlaceRecharge(fmt(part)+' + '+fmt(correct)+' = '+fmt(b.base));
    }else{
     sound(false);
     shakeElement(opt);
     const statEl=$('recharge-status');
     if(statEl)statEl.textContent='احسب الفرق بين '+fmt(b.base)+' و '+fmt(part);
    }
   };
  });
 }
}

function completeInPlaceRecharge(resultLabel){
 state.hearts=3;
 sound(true,'recharge');
 renderHUD();
 saveState();
 const overlay=$('in-place-recharge-overlay');
 if(overlay){
  const area=overlay.querySelector('.recharge-tactile-area');
  if(area){
   area.innerHTML='<div class="recharge-success-burst"><span class="btn-svg">'+getIconSVG('check','green')+'</span><span>اكتمل التحدي! عادت طاقتك كاملة (3 من 3 قلوب)</span></div>';
  }
  setTimeout(()=>{
   overlay.classList.add('closing');
   setTimeout(()=>{
    overlay.hidden=true;
    overlay.classList.remove('closing');
   },250);
  },600);
 }
 guide('عادت طاقتك كاملة! جرّب الآن وحلّ المسألة بهدوء.',5500);
 updateCoach('عادت طاقتك كاملة! جرّب الآن وحلّ المسألة بهدوء.');
}

