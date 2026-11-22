/* Lesson 1: Story Player, Station 1 Experience, Playground & View State */
function slides(){return state.scene?trainingSlides:lessonSlides;}
function activeStoryNode(){
 const cur=PATH_NODES[state.activeNode];
 if(cur&&cur.type==='story'&&cur.unit===state.scene)return cur;
 return PATH_NODES.find(n=>n.unit===state.scene&&n.type==='story'&&!isNodeCompleted(n.id))||PATH_NODES.find(n=>n.unit===state.scene&&n.type==='story');
}
let counterToken=0;
function citySVG(){return '<svg class="city-svg" viewBox="0 0 480 130" role="img" aria-label="مبانٍ ترمز إلى السكان"><circle cx="74" cy="35" r="24" fill="#f2d477"/><path d="M0 119H480" stroke="#749a63" stroke-width="3"/><g fill="#cfdfbb" stroke="#789968" stroke-width="1.5"><path d="M35 118V60h52v58M100 118V35h53v83M168 118V72h45v46M229 118V20h58v98M301 118V49h51v69M369 118V64h58v54"/></g><g fill="#fff9dc">'+[45,62,111,130,180,240,262,313,334,381,402].map((x,i)=>'<rect x="'+x+'" y="'+(i%3*17+58)+'" width="8" height="12" rx="2"/>').join('')+'</g><path d="M228 19l29-14 30 14" fill="#94b774"/><g fill="#507c50"><circle cx="20" cy="95" r="13"/><circle cx="448" cy="98" r="17"/></g></svg>';}
function spaceSVG(planet){return '<svg class="space-svg" viewBox="0 0 480 150" role="img" aria-label="الشمس و'+planet+' وبينهما صاروخ متحرك"><path d="M92 75H391" stroke="#c1cdb6" stroke-width="2" stroke-dasharray="5 7"/><circle cx="63" cy="75" r="42" fill="#f3cf64"/><circle cx="63" cy="75" r="31" fill="#e8a64c"/><circle cx="421" cy="75" r="29" fill="'+(planet==='عطارد'?'#b9b09b':'#77a9b1')+'"/><path d="M408 52l18 8-11 14 21 11-13 13-12-8-6-20z" fill="'+(planet==='عطارد'?'#918976':'#9abb6d')+'"/><g class="flying-rocket"><path d="M126 70l18-7 18 12-18 12-18-7z" fill="#fdfbf2" stroke="#547f71" stroke-width="2"/><circle cx="145" cy="75" r="4" fill="#a9d3da"/><path d="M125 70l-13 5 13 5" fill="#dc9d44"/></g><text x="63" y="139" text-anchor="middle" font-size="12" fill="#6c795c">الشمس</text><text x="421" y="126" text-anchor="middle" font-size="12" fill="#6c795c">'+planet+'</text></svg>';}
function airportSVG(){return '<svg class="city-svg" viewBox="0 0 480 130" role="img" aria-label="مبنى مطار وطائرة تتحرك فوقه"><path d="M45 121V72q50-40 100 0 50-40 100 0 50-40 100 0 40-35 85 0v49z" fill="#b9cfbb" stroke="#658778" stroke-width="2"/><path d="M45 82H430M45 102H430" stroke="#edf0dd" stroke-width="3"/>'+[67,98,128,158,188,218,248,278,308,338,368,398].map(x=>'<path d="M'+x+' 79v40" stroke="#edf0dd" stroke-width="3"/>').join('')+'<g class="plane-fly"><path d="M286 32l-49-11-3 5 30 18-27 4-12-8-6 3 12 14 44-5 18 15 7-2-10-18 37-10q7-7-6-8z" fill="#fefcf1" stroke="#4c7e74" stroke-width="2"/></g></svg>';}
function completeStation1Onboarding(){
 const ob=state.onboarding||(state.onboarding=createDefaultOnboarding());
 ob.warmupDone=true;
 ob.bridgeDone=true;
 [0,1,2,3,4,5].forEach(i=>state.viewedSlides[0].add(i));
 if(!state.nodesCompleted.has(0)){
  state.nodesCompleted.add(0);
  if(!state.nodeStars)state.nodeStars={};
  state.nodeStars[0]=3;
  checkMilestoneBadges();
  sound(true);
  celebrate(14);
 }
 renderHUD();
 renderDuolingoMap();
 renderStationTopbar();
 saveState();
}
function startOptionalReview(){
 const ob=state.onboarding||(state.onboarding=createDefaultOnboarding());
 ob.reviewSlidesMode=false;
 ob.station1Phase='review';
 ob.reviewStep=0;
 ob.reviewQ1Done=false;
 ob.reviewQ2Done=false;
 state.activeNode=0;
 state.scene=0;
 state.viewMode='story';
 applyScene();
 updateViewDom();
 saveState();
 window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
}
function openReviewSlidesMode(){
 const ob=state.onboarding||(state.onboarding=createDefaultOnboarding());
 ob.reviewSlidesMode=true;
 state.activeNode=0;
 state.scene=0;
 state.viewMode='story';
 state.story[0]=0;
 applyScene();
 updateViewDom();
 saveState();
 window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
}
function toggleStation1LegacyPlayer(showLegacy){
 const sec=$('story-player-section');
 if(!sec)return;
 ['.section-label','#chapter-tabs','#animation-stage','#story-caption','.player-controls','.story-position','#story-gate-bar'].forEach(sel=>{
  const el=sec.querySelector(sel);
  if(el)el.hidden=!showLegacy;
 });
}
function renderStation1Experience(){
 const root=$('station1-experience');
 if(!root)return;
 const ob=state.onboarding||(state.onboarding=createDefaultOnboarding());
 const slidesBar=$('s1-slides-mode-bar');
 const tabsEl=$('chapter-tabs');
 const gridEl=document.querySelector('#story-player-section .player-grid');
 const gateEl=$('story-gate-bar');

 if(ob.reviewSlidesMode){
  root.hidden=true;
  if(slidesBar)slidesBar.hidden=false;
  toggleStation1LegacyPlayer(true);
  return;
 }
 root.hidden=false;
 if(slidesBar)slidesBar.hidden=true;
 toggleStation1LegacyPlayer(false);

 const phase=ob.station1Phase||'warmup_q1';
 root.replaceChildren();

 const owlHeader=(msg,subMsg)=>'<div class="s1-owl-welcome">'
  +'<div class="s1-owl-avatar" aria-hidden="true">'+renderDuoOwlSVG()+'</div>'
  +'<div class="s1-owl-bubble">'
  +'<strong>'+msg+'</strong>'
  +'<p>'+subMsg+'</p>'
  +'</div>'
  +'</div>';

 if(phase==='warmup_q1'){
  const q1=ob.q1;
  root.innerHTML=owlHeader('«قبل أن نكتشف الملايين، لنجرب سؤالين صغيرين!»','سؤال واحد في الشاشة، دون مؤقت أو خصم قلوب. الهدف أن نتذكر منزلة الألوف معًا.')
   +'<div class="s1-card">'
   +'<div class="s1-card-head">'
   +'<span class="s1-badge">التهيئة القصيرة · السؤال ١ من ٢</span>'
   +'<span class="s1-no-penalty-tag">دون مؤقت · دون خصم قلوب</span>'
   +'</div>'
   +'<h2 class="s1-question-title">ما قيمة الرقم 5 في العدد 45,372؟</h3>'
   +'<div class="s1-number-spotlight" dir="ltr">'+marked(45372,3)+'</div>'
   +'<div class="s1-help-row">'
   +'<button type="button" class="s1-help-btn" id="s1-q1-help" '+(q1.answered?'disabled':'')+'>'
   +getIconSVG('lightbulb')+'<span>'+(q1.usedHelp?'تم عرض المساعدة التوضيحية':'اطلب مساعدة قبل الحل')+'</span>'
   +'</button>'
   +'</div>'
   +'<div class="s1-help-box" id="s1-q1-help-box" '+(q1.usedHelp?'':'hidden')+'>'
   +'تلميح: انظر إلى العدد 45,372 من اليمين: الآحاد (2)، العشرات (7)، المئات (3)، ثم آحاد الألوف (5). على يمين الرقم 5 ثلاثة أرقام، أي ثلاثة أصفار.'
   +'</div>'
   +'<div class="s1-options" id="s1-q1-options"></div>'
   +'<div class="s1-explanation" id="s1-q1-exp" '+(q1.answered||q1.attempts>0?'':'hidden')+'></div>'
   +'<div class="s1-primary-continue-row" id="s1-q1-next-row" '+(q1.answered?'':'hidden')+'>'
   +'<button type="button" class="primary" id="s1-q1-next">السؤال التالي (٢ من ٢) ←</button>'
   +'</div>'
   +'</div>';

  const optsWrap=root.querySelector('#s1-q1-options');
  const expEl=root.querySelector('#s1-q1-exp');
  [5,500,5000].forEach(val=>{
   const btn=document.createElement('button');
   btn.type='button';
   btn.className='s1-option-btn'+(q1.answered&&val===5000?' correct':'')+(q1.lastChoice===val&&val!==5000&&!q1.answered?' wrong':'');
   btn.textContent=fmt(val);
   btn.disabled=q1.answered;
   btn.addEventListener('click',()=>{
    if(q1.answered)return;
    if(q1.attempts===0){
     q1.firstAttemptCorrect=(val===5000&&!q1.usedHelp);
    }
    q1.attempts++;
    q1.lastChoice=val;
    if(val===5000){
     q1.answered=true;
     sound(true);haptic(true);
     saveState();
     renderStation1Experience();
     updateStepClarityBar();
     renderStationTopbar();
    }else{
     sound(false);haptic(false);
     expEl.hidden=false;
     expEl.className='s1-explanation encourage';
     expEl.textContent='محاولة جيدة! تذكّر: الرقم 5 يقع في منزلة آحاد الألوف وعلى يمينه 3 أرقام (3 و7 و2)، لذلك نضع 3 أصفار بجانبه. جرّب اختيار الإجابة الصحيحة الآن!';
     optsWrap.querySelectorAll('.s1-option-btn').forEach(b=>b.classList.toggle('wrong',b===btn));
     saveState();
    }
   });
   optsWrap.append(btn);
  });

  if(q1.answered){
   expEl.hidden=false;
   expEl.className='s1-explanation';
   expEl.textContent=(q1.firstAttemptCorrect?'إجابة صحيحة من المحاولة الأولى دون مساعدة! ':'إجابة صحيحة! ')
    +'تفسير قصير: الرقم 5 في العدد 45,372 يقع في منزلة آحاد الألوف، وعلى يمينه 3 منازل، فقيمته المنزلية هي 5,000.';
  }else if(q1.attempts>0){
   expEl.hidden=false;
   expEl.className='s1-explanation encourage';
   expEl.textContent='الرقم 5 يقع في منزلة آحاد الألوف وعلى يمينه 3 أرقام (3 و7 و2)، لذلك نضع 3 أصفار بجانبه. اختر 5,000 للمتابعة.';
  }

  root.querySelector('#s1-q1-help')?.addEventListener('click',()=>{
   if(q1.answered)return;
   q1.usedHelp=true;
   q1.firstAttemptCorrect=false;
   const box=root.querySelector('#s1-q1-help-box');
   if(box)box.hidden=false;
   const hBtn=root.querySelector('#s1-q1-help');
   if(hBtn)hBtn.innerHTML=getIconSVG('lightbulb')+'<span>تم عرض المساعدة التوضيحية</span>';
   saveState();
  });

  root.querySelector('#s1-q1-next')?.addEventListener('click',()=>{
   ob.station1Phase='warmup_q2';
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
  return;
 }

 if(phase==='warmup_q2'){
  const q2=ob.q2;
  const cardsHTML=Array.from({length:10},(_,i)=>'<div class="s1-thousand-card"><small class="stc-idx">بطاقة '+ar(i+1)+'</small><strong class="stc-val num" dir="ltr">1,000</strong></div>').join('');
  root.innerHTML=owlHeader('«قبل أن نكتشف الملايين، لنجرب سؤالين صغيرين!»','السؤال الثاني: انظر إلى البطاقات العشر أمامك واكتشف قيمتها معًا بلا مؤقت وبلا خصم قلوب.')
   +'<div class="s1-card">'
   +'<div class="s1-card-head">'
   +'<span class="s1-badge">التهيئة القصيرة · السؤال ٢ من ٢</span>'
   +'<span class="s1-no-penalty-tag">دون مؤقت · دون خصم قلوب</span>'
   +'</div>'
   +'<h2 class="s1-question-title">لدينا 10 بطاقات، قيمة كل بطاقة 1,000. ما قيمتها معًا؟</h3>'
   +'<div class="s1-cards-visual" role="img" aria-label="عشر بطاقات قيمة كل بطاقة 1,000">'+cardsHTML+'</div>'
   +'<div class="s1-help-row">'
   +'<button type="button" class="s1-help-btn" id="s1-q2-help" '+(q2.answered?'disabled':'')+'>'
   +getIconSVG('lightbulb')+'<span>'+(q2.usedHelp?'تم عرض المساعدة التوضيحية':'اطلب مساعدة قبل الحل')+'</span>'
   +'</button>'
   +'</div>'
   +'<div class="s1-help-box" id="s1-q2-help-box" '+(q2.usedHelp?'':'hidden')+'>'
   +'تلميح: عدّ بالألوف عشر مرات: 1,000، 2,000، 3,000 ... حتى 10 بطاقات. عشر بطاقات من فئة 1,000 تكوّن عشرة آلاف (10,000).'
   +'</div>'
   +'<div class="s1-options" id="s1-q2-options"></div>'
   +'<div class="s1-explanation" id="s1-q2-exp" '+(q2.answered||q2.attempts>0?'':'hidden')+'></div>'
   +'<div class="s1-primary-continue-row" id="s1-q2-next-row" '+(q2.answered?'':'hidden')+'>'
   +'<button type="button" class="primary" id="s1-q2-next">'+(ob.q1.firstAttemptCorrect&&q2.firstAttemptCorrect?'عرض نتيجة التهيئة والخطوة التالية ←':'ابدأ المراجعة القصيرة الداعمة ←')+'</button>'
   +'</div>'
   +'</div>';

  const optsWrap=root.querySelector('#s1-q2-options');
  const expEl=root.querySelector('#s1-q2-exp');
  [1000,10000,100000].forEach(val=>{
   const btn=document.createElement('button');
   btn.type='button';
   btn.className='s1-option-btn'+(q2.answered&&val===10000?' correct':'')+(q2.lastChoice===val&&val!==10000&&!q2.answered?' wrong':'');
   btn.textContent=fmt(val);
   btn.disabled=q2.answered;
   btn.addEventListener('click',()=>{
    if(q2.answered)return;
    if(q2.attempts===0){
     q2.firstAttemptCorrect=(val===10000&&!q2.usedHelp);
    }
    q2.attempts++;
    q2.lastChoice=val;
    if(val===10000){
     q2.answered=true;
     sound(true);haptic(true);
     saveState();
     renderStation1Experience();
     updateStepClarityBar();
     renderStationTopbar();
    }else{
     sound(false);haptic(false);
     expEl.hidden=false;
     expEl.className='s1-explanation encourage';
     expEl.textContent='لننظر إلى البطاقات العشر معًا: كل بطاقة قيمتها 1,000. عند جمع 10 بطاقات منها نحصل على 10 × 1,000 = 10,000. اختر 10,000 الآن!';
     optsWrap.querySelectorAll('.s1-option-btn').forEach(b=>b.classList.toggle('wrong',b===btn));
     saveState();
    }
   });
   optsWrap.append(btn);
  });

  if(q2.answered){
   expEl.hidden=false;
   expEl.className='s1-explanation';
   expEl.textContent=(q2.firstAttemptCorrect?'أحسنت من المحاولة الأولى دون مساعدة! ':'إجابة صحيحة! ')
    +'تفسير قصير: 10 بطاقات بقيمة 1,000 تتجمع لتكوّن 10,000 (منزلة عشرات الألوف)، لأن كل منزلة أكبر تساوي 10 أمثال السابقة.';
  }else if(q2.attempts>0){
   expEl.hidden=false;
   expEl.className='s1-explanation encourage';
   expEl.textContent='عند جمع 10 بطاقات من فئة 1,000 نحصل على 10,000. اختر 10,000 للمتابعة.';
  }

  root.querySelector('#s1-q2-help')?.addEventListener('click',()=>{
   if(q2.answered)return;
   q2.usedHelp=true;
   q2.firstAttemptCorrect=false;
   const box=root.querySelector('#s1-q2-help-box');
   if(box)box.hidden=false;
   const hBtn=root.querySelector('#s1-q2-help');
   if(hBtn)hBtn.innerHTML=getIconSVG('lightbulb')+'<span>تم عرض المساعدة التوضيحية</span>';
   saveState();
  });

  root.querySelector('#s1-q2-next')?.addEventListener('click',()=>{
   ob.warmupDone=true;
   if(ob.q1.firstAttemptCorrect&&ob.q2.firstAttemptCorrect){
    ob.station1Phase='adaptive_branch';
   }else{
    ob.pathChosen='review';
    ob.reviewBypassed=false;
    ob.reviewStep=0;
    ob.station1Phase='review';
   }
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
  return;
 }

 if(phase==='adaptive_branch'){
  root.innerHTML=owlHeader('«تتذكر الألوف جيدًا!»','أجبت عن السؤالين من المحاولة الأولى دون مساعدة! اختر كيف تحب أن نكمل إلى جسر الملايين.')
   +'<div class="s1-card s1-adaptive-banner">'
   +'<div class="s1-card-head">'
   +'<span class="s1-badge">تكيّف البداية · مسارك المناسب</span>'
   +'<span class="s1-no-penalty-tag">اختيار حر</span>'
   +'</div>'
   +'<h3>تتذكر الألوف جيدًا!</h3>'
   +'<p>هذان السؤالان لتحديد مقدار المراجعة التمهيدية فقط، وسنتعلّم الملايين وتدريبات الدرس الكاملة في الحالتين. ماذا تفضّل الآن؟</p>'
   +'<div class="s1-branch-actions">'
   +'<button type="button" class="primary" id="s1-choose-shortcut">انتقل إلى اكتشاف الملايين ←</button>'
   +'<button type="button" class="secondary" id="s1-choose-review">أراجع قليلًا</button>'
   +'</div>'
   +'</div>';

  root.querySelector('#s1-choose-shortcut')?.addEventListener('click',()=>{
   ob.warmupDone=true;
   ob.pathChosen='shortcut';
   ob.reviewBypassed=true;
   ob.station1Phase='bridge';
   ob.bridgeLevel=0;
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
   renderDuolingoMap();
  });
  root.querySelector('#s1-choose-review')?.addEventListener('click',()=>{
   ob.warmupDone=true;
   ob.pathChosen='review';
   ob.reviewBypassed=false;
   ob.reviewStep=0;
   ob.station1Phase='review';
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
   renderDuolingoMap();
  });
  return;
 }

 if(phase==='review'){
  const rStep=ob.reviewStep||0;
  if(rStep===0){
   root.innerHTML=owlHeader('«نموذج محلول سريع: كيف نعرف قيمة الرقم في الألوف؟»','لنتأمل هذا المثال المحلول معًا في خطوة واحدة واضحة، ثم تجرب بنفسك!')
    +'<div class="s1-card">'
    +'<div class="s1-card-head">'
    +'<span class="s1-badge">مراجعة قصيرة · الخطوة ١ من ٣ (نموذج محلول)</span>'
    +'<span class="s1-no-penalty-tag">نموذج توضيحي داعم</span>'
    +'</div>'
    +'<h2 class="s1-question-title">نموذج محلول: ما قيمة الرقم 6 في العدد 63,415؟</h3>'
    +'<div class="s1-worked-model">'
    +'<h4>خطوات الحل السهلة:</h4>'
    +'<div class="s1-number-spotlight" dir="ltr">'+marked(63415,4)+'</div>'
    +'<div class="s1-worked-steps">'
    +'<div class="s1-worked-step"><span>١. نحدد البيت (المنزلة):</span> نبدأ من اليمين (آحاد، عشرات، مئات، آحاد الألوف، <strong>عشرات الألوف</strong>). الرقم 6 يسكن في بيت عشرات الألوف.</div>'
    +'<div class="s1-worked-step"><span>٢. نعدّ المنازل على يمين الرقم 6:</span> على يمينه 4 أرقام (3 و4 و1 و5)، إذن نضع 4 أصفار على يمين الرقم 6 فتصبح قيمته: <strong dir="ltr">60,000</strong>.</div>'
    +'<div class="s1-worked-step"><span>٣. قاعدة البطاقات العشر:</span> كل 10 بطاقات من فئة 1,000 تتجمع في بطاقة واحدة بقيمة <strong>10,000</strong>.</div>'
    +'</div>'
    +'</div>'
    +'<div class="s1-primary-continue-row">'
    +'<button type="button" class="primary" id="s1-rev-step1-next">فهمت النموذج · الآن أجرب بنفسي (٢ من ٣) ←</button>'
    +'</div>'
    +'</div>';
   root.querySelector('#s1-rev-step1-next')?.addEventListener('click',()=>{
    ob.reviewStep=1;
    saveState();
    renderStation1Experience();
    updateStepClarityBar();
    renderStationTopbar();
   });
   return;
  }

  if(rStep===1){
   const done=!!ob.reviewQ1Done;
   root.innerHTML=owlHeader('«الآن دورك يا بطل! محاولة مشابهة للنموذج»','عدّ المنازل على يمين الرقم الملوّن واختر قيمته المنزلية.')
    +'<div class="s1-card">'
    +'<div class="s1-card-head">'
    +'<span class="s1-badge">مراجعة قصيرة · الخطوة ٢ من ٣ (محاولة مشابهة ١)</span>'
    +'<span class="s1-no-penalty-tag">تدريب داعم</span>'
    +'</div>'
    +'<h2 class="s1-question-title">ما قيمة الرقم 7 في العدد 27,415؟</h3>'
    +'<div class="s1-number-spotlight" dir="ltr">'+marked(27415,3)+'</div>'
    +'<div class="s1-options" id="s1-rev-q1-opts"></div>'
    +'<div class="s1-explanation" id="s1-rev-q1-exp" '+(done?'':'hidden')+'>'
    +'رائع! الرقم 7 في آحاد الألوف وعلى يمينه 3 أرقام (4 و1 و5)، فقيمته المنزلية هي 7,000.'
    +'</div>'
    +'<div class="s1-primary-continue-row" '+(done?'':'hidden')+'>'
    +'<button type="button" class="primary" id="s1-rev-step2-next">الخطوة الأخيرة في المراجعة (٣ من ٣) ←</button>'
    +'</div>'
    +'</div>';
   const optsEl=root.querySelector('#s1-rev-q1-opts');
   const expEl=root.querySelector('#s1-rev-q1-exp');
   [70,700,7000].forEach(val=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='s1-option-btn'+(done&&val===7000?' correct':'');
    b.textContent=fmt(val);
    b.disabled=done;
    b.addEventListener('click',()=>{
     if(done)return;
     if(val===7000){
      ob.reviewQ1Done=true;
      sound(true);haptic(true);
      saveState();
      renderStation1Experience();
      updateStepClarityBar();
     }else{
      sound(false);haptic(false);
      b.classList.add('wrong');
      expEl.hidden=false;
      expEl.className='s1-explanation encourage';
      expEl.textContent='انظر إلى يمين الرقم 7 في العدد 27,415: يوجد 3 أرقام (4 و1 و5)، إذن نضع 3 أصفار بجانب 7. اختر 7,000 الآن!';
     }
    });
    optsEl.append(b);
   });
   root.querySelector('#s1-rev-step2-next')?.addEventListener('click',()=>{
    ob.reviewStep=2;
    saveState();
    renderStation1Experience();
    updateStepClarityBar();
    renderStationTopbar();
   });
   return;
  }

  const done2=!!ob.reviewQ2Done;
  root.innerHTML=owlHeader('«خطوة أخيرة في المراجعة قبل بناء جسر الملايين!»','تذكّر كيف تتجمع كل 10 بطاقات متساوية لتكوّن بطاقة واحدة في المنزلة الأكبر.')
   +'<div class="s1-card">'
   +'<div class="s1-card-head">'
   +'<span class="s1-badge">مراجعة قصيرة · الخطوة ٣ من ٣ (محاولة مشابهة ٢)</span>'
   +'<span class="s1-no-penalty-tag">تدريب داعم</span>'
   +'</div>'
   +'<h2 class="s1-question-title">إذا جمعنا 10 بطاقات قيمة كل منها 1,000، نحصل على بطاقة واحدة في منزلة عشرات الألوف قيمتها:</h3>'
   +'<div class="s1-options" id="s1-rev-q2-opts"></div>'
   +'<div class="s1-explanation" id="s1-rev-q2-exp" '+(done2?'':'hidden')+'>'
   +'أحسنت! 10 بطاقات من فئة 1,000 تساوي 10,000. الآن نحن مستعدون لبناء الجسر المحسوس حتى المليون!'
   +'</div>'
   +'<div class="s1-primary-continue-row" '+(done2?'':'hidden')+'>'
   +'<button type="button" class="primary" id="s1-rev-finish">انتقل إلى جسر البطاقات واكتشاف الملايين ←</button>'
   +'</div>'
   +'</div>';
  const opts2El=root.querySelector('#s1-rev-q2-opts');
  const exp2El=root.querySelector('#s1-rev-q2-exp');
  [1000,10000,100000].forEach(val=>{
   const b=document.createElement('button');
   b.type='button';
   b.className='s1-option-btn'+(done2&&val===10000?' correct':'');
   b.textContent=fmt(val);
   b.disabled=done2;
   b.addEventListener('click',()=>{
    if(done2)return;
    if(val===10000){
     ob.reviewQ2Done=true;
     ob.reviewDone=true;
     sound(true);haptic(true);
     saveState();
     renderStation1Experience();
     updateStepClarityBar();
     renderDuolingoMap();
    }else{
     sound(false);haptic(false);
     b.classList.add('wrong');
     exp2El.hidden=false;
     exp2El.className='s1-explanation encourage';
     exp2El.textContent='تذكّر: 10 × 1,000 = 10,000 (نزيد صفرًا واحدًا عندما نجمع 10 بطاقات). اختر 10,000!';
    }
   });
   opts2El.append(b);
  });
  root.querySelector('#s1-rev-finish')?.addEventListener('click',()=>{
   ob.reviewDone=true;
   if(ob.bridgeDone){
    ob.station1Phase='gradual_millions';
   }else{
    ob.station1Phase='bridge';
    ob.bridgeLevel=0;
   }
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
  return;
 }

 if(phase==='bridge'){
  const lvl=Math.max(0,Math.min(2,Number(ob.bridgeLevel)||0));
  const bridgeLevels=[
   {
    level:0,
    stepLabel:'الجسر المحسوس · المستوى ١ من ٣',
    cardUnit:1000,
    targetVal:10000,
    fromPlace:'آحاد الألوف (1,000)',
    toPlace:'عشرات الألوف (10,000)',
    title:'١. عشر بطاقات بقيمة 1,000 تتجمع في بطاقة بقيمة 10,000',
    owl:'اضغط البطاقات أو اسحب إصبعك/الماوس عليها، أو اضغط الزر الكبير «اجمع البطاقات» لتكوين 10,000!',
    takeaway:'10 بطاقات بقيمة 1,000 تتحد لتكوّن 10,000 في عشرات الألوف (عشرة أمثال).',
    summary:'جمعت 10 بطاقات من فئة 1,000 فكونت بطاقة واحدة بقيمة 10,000 في منزلة عشرات الألوف (1,000 × 10 = 10,000).',
    nextActionLabel:'المتابعة إلى المستوى الثاني ←'
   },
   {
    level:1,
    stepLabel:'الجسر المحسوس · المستوى ٢ من ٣',
    cardUnit:10000,
    targetVal:100000,
    fromPlace:'عشرات الألوف (10,000)',
    toPlace:'مئات الألوف (100,000)',
    title:'٢. عشر بطاقات بقيمة 10,000 تتجمع في بطاقة بقيمة 100,000',
    owl:'الآن نكبر خطوة! اجمع عشر بطاقات من فئة 10,000 بالضغط أو السحب أو بزر «اجمع البطاقات» لنصل إلى 100,000.',
    takeaway:'10 بطاقات بقيمة 10,000 تتحد لتكوّن 100,000 في مئات الألوف (عشرة أمثال).',
    summary:'جمعت 10 بطاقات من فئة 10,000 فكونت بطاقة واحدة بقيمة 100,000 في منزلة مئات الألوف (10,000 × 10 = 100,000).',
    nextActionLabel:'المتابعة إلى المستوى الثالث ←'
   },
   {
    level:2,
    stepLabel:'الجسر المحسوس · المستوى ٣ من ٣ (الوصول إلى المليون!)',
    cardUnit:100000,
    targetVal:1000000,
    fromPlace:'مئات الألوف (100,000)',
    toPlace:'آحاد الملايين (1,000,000)',
    title:'٣. عشر بطاقات بقيمة 100,000 تتجمع في بطاقة بقيمة 1,000,000',
    owl:'الخطوة الحاسمة نحو المليون! اجمع عشر بطاقات من فئة 100,000 لنفتح بيتًا جديدًا هو «آحاد الملايين»!',
    takeaway:'10 بطاقات بقيمة 100,000 تفتح منزلة آحاد الملايين 1,000,000 (مليون واحد)!',
    summary:'مبارك! 10 بطاقات من فئة 100,000 كوّنت 1,000,000 (مليونًا واحدًا · 1 وأمامه 6 أصفار) لأن كل منزلة أكبر تساوي عشرة أمثال السابقة!',
    nextActionLabel:'استكشف المليون في لوحة المنازل ←'
   }
  ];
  const meta=bridgeLevels[lvl];
  const collected=Math.max(0,Math.min(10,ob.bridgeCardsCollected[lvl]||0));
  const merged=!!ob.bridgeMerged[lvl];
  const curSum=merged?meta.targetVal:collected*meta.cardUnit;

  const pillsHTML=bridgeLevels.map((b,i)=>{
   const cls=i===lvl?'active':(ob.bridgeMerged[i]?'done':'');
   return '<span class="bridge-level-pill '+cls+'">المستوى '+ar(i+1)+': '+fmt(b.cardUnit)+' ← '+fmt(b.targetVal)+'</span>';
  }).join('');

  const cardsGridHTML=Array.from({length:10},(_,i)=>{
   const isOn=merged||i<collected;
   return '<button type="button" class="bridge-tap-card'+(isOn?' collected':'')+'" data-card-idx="'+i+'" aria-pressed="'+String(isOn)+'" aria-label="بطاقة رقم '+ar(i+1)+' بقيمة '+fmt(meta.cardUnit)+'">'
    +'<small class="btc-badge">بطاقة '+ar(i+1)+'</small>'
    +'<strong class="btc-val num" dir="ltr">'+fmt(meta.cardUnit)+'</strong>'
    +'<span class="btc-sub">'+(isOn?'تم الجمع':'المس للجمع')+'</span>'
    +'</button>';
  }).join('');

  root.innerHTML=owlHeader('«'+meta.owl+'»','العلاقة الأساسية: كل منزلة أكبر تساوي عشرة أمثال السابقة (× 10).')
   +'<div class="s1-card">'
   +'<div class="bridge-level-pills">'+pillsHTML+'</div>'
   +'<div class="s1-card-head">'
   +'<span class="s1-badge">'+meta.stepLabel+'</span>'
   +'<span class="s1-no-penalty-tag">تفاعل باللمس أو الماوس أو الزر</span>'
   +'</div>'
   +'<h2 class="s1-question-title">'+meta.title+'</h3>'
   +'<div class="bridge-stage">'
   +'<div class="bridge-place-relation" aria-label="العلاقة بين المنزلتين">'
   +'<div class="bridge-house-box"><small class="bhb-role">المنزلة الحالية (١٠ بطاقات)</small><strong class="bhb-name">'+meta.fromPlace+'</strong></div>'
   +'<div class="bridge-mult-badge"><span class="bmb-mult" dir="ltr">× 10</span><small class="bmb-sub">عشرة أمثال</small></div>'
   +'<div class="bridge-house-box target-house"><small class="bhb-role">المنزلة الأكبر مباشرة (بطاقة واحدة)</small><strong class="bhb-name">'+meta.toPlace+'</strong></div>'
   +'</div>'
   +'<p style="margin:0;text-align:center;font-weight:800;color:var(--ink-soft);">اضغط البطاقات واحدة تلو الأخرى أو اسحب عليها، أو اضغط زر «اجمع البطاقات» أدناه:</p>'
   +'<div class="bridge-cards-grid" id="s1-bridge-grid">'+cardsGridHTML+'</div>'
   +'<div class="bridge-collector-zone'+(merged?' ready':'')+'" id="s1-bridge-zone">'
   +'<div class="bridge-counter-label">المجموع الحالي: <bdi>'+ar(merged?10:collected)+'</bdi> من ١٠ بطاقات = <bdi dir="ltr">'+fmt(curSum)+'</bdi></div>'
   +'<p class="bridge-sub-hint">'+(merged?meta.summary:'عند اكتمال 10 بطاقات من فئة '+fmt(meta.cardUnit)+' تتحد في بطاقة واحدة بقيمة '+fmt(meta.targetVal)+'.')+'</p>'
   +(merged
    ?'<div class="bridge-merged-card"><small>بطاقة المنزلة الجديدة المتكونة</small><strong>'+fmt(meta.targetVal)+'</strong><span>'+meta.toPlace+' · عشرة أمثال '+meta.fromPlace+'</span></div>'
    :'<button type="button" class="bridge-big-merge-btn" id="s1-bridge-merge-btn">'+getIconSVG('sparkle')+'<span>اجمع البطاقات</span></button>')
   +'</div>'
   +'</div>'
   +(merged
    ?'<div class="transition-achievement-tag">'
     +'<svg class="t-achieve-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
     +'<span>أحسنت! كوّنت بطاقة '+meta.toPlace+' بنجاح</span>'
     +'</div>'
     +'<div class="s1-core-takeaway">'
     +'<div class="s1-takeaway-header">'
     +'<span class="s1-takeaway-badge">'
     +'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
     +'<span>تذكّر هذه الفكرة:</span>'
     +'</span>'
     +'</div>'
     +'<p class="s1-takeaway-text">'+meta.takeaway+'</p>'
     +'</div>'
     +'<div class="transition-progress-card" role="region" aria-label="مؤشر التقدم في الجسر المحسوس">'
     +'<div class="transition-progress-meta">'
     +'<div class="transition-step-badge">'
     +'<span class="t-step-dot"></span>'
     +'<span>المستوى '+ar(lvl+1)+' من '+ar(3)+' مكتمل</span>'
     +'</div>'
     +'<span class="transition-next-preview">'+(lvl<2?'المستوى التالي: '+bridgeLevels[lvl+1].toPlace:'الخطوة التالية: لوحة المنازل')+'</span>'
     +'</div>'
     +'<div class="transition-progress-track" aria-hidden="true">'
     +'<div class="transition-progress-fill" style="width:'+(((lvl+1)/3)*100)+'%;"></div>'
     +'</div>'
     +'</div>'
     +'<div class="s1-primary-continue-row">'
     +'<button type="button" class="primary prominent-next-btn" id="s1-bridge-next-btn">'+meta.nextActionLabel+'</button>'
     +'</div>'
     +'<details class="s1-optional-review-accordion">'
     +'<summary class="s1-review-summary">'
     +'<div class="s1-review-summary-left">'
     +'<span class="s1-review-summary-icon">'
     +'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
     +'</span>'
     +'<span class="s1-review-summary-title">تحتاج إلى مراجعة؟</span>'
     +'</div>'
     +'<span class="s1-review-summary-hint">تفاصيل دمج البطاقات</span>'
     +'<svg class="s1-review-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
     +'</summary>'
     +'<div class="s1-review-content">'
     +'<div class="s1-review-deep-box">'
     +'<div class="s1-review-deep-title">تفاصيل دمج المنازل</div>'
     +'<p class="s1-review-deep-text">'+meta.summary+'</p>'
     +'</div>'
     +'<div class="s1-secondary-actions">'
     +'<button type="button" class="secondary" id="s1-replay-this-level-btn">إعادة تجربة هذا المستوى</button>'
     +'</div>'
     +'</div>'
     +'</details>'
    :'')
   +'</div>';

  const triggerMerge=()=>{
   if(ob.bridgeMerged[lvl])return;
   ob.bridgeCardsCollected[lvl]=10;
   ob.bridgeMerged[lvl]=true;
   sound(true);haptic(true);
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  };

  const collectOneCard=()=>{
   if(ob.bridgeMerged[lvl])return;
   const nextCount=Math.min(10,(ob.bridgeCardsCollected[lvl]||0)+1);
   ob.bridgeCardsCollected[lvl]=nextCount;
   if(nextCount>=10){
    triggerMerge();
   }else{
    sound(true,420+nextCount*28);
    saveState();
    renderStation1Experience();
    updateStepClarityBar();
   }
  };

  const grid=root.querySelector('#s1-bridge-grid');
  let draggingCards=false;
  const stopDrag=()=>{draggingCards=false;};
  if(grid){
   grid.querySelectorAll('.bridge-tap-card').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
     e.preventDefault();
     collectOneCard();
    });
    btn.addEventListener('pointerdown',e=>{
     if(e.pointerType==='mouse'&&e.button!==0)return;
     draggingCards=true;
     window.addEventListener('pointerup',stopDrag,{once:true});
     window.addEventListener('pointercancel',stopDrag,{once:true});
    });
    btn.addEventListener('pointerenter',()=>{
     if(draggingCards&&!btn.classList.contains('collected')){
      collectOneCard();
     }
    });
   });
   grid.addEventListener('pointermove',e=>{
    if(!draggingCards)return;
    const el=document.elementFromPoint(e.clientX,e.clientY);
    const cardBtn=el&&el.closest?el.closest('.bridge-tap-card'):null;
    if(cardBtn&&!cardBtn.classList.contains('collected')){
     collectOneCard();
    }
   });
   grid.addEventListener('touchmove',e=>{
    if(!draggingCards)return;
    const touch=e.touches[0];
    if(!touch)return;
    const el=document.elementFromPoint(touch.clientX,touch.clientY);
    const cardBtn=el&&el.closest?el.closest('.bridge-tap-card'):null;
    if(cardBtn&&!cardBtn.classList.contains('collected')){
     collectOneCard();
    }
   },{passive:true});
  }

  root.querySelector('#s1-bridge-merge-btn')?.addEventListener('click',triggerMerge);
  root.querySelector('#s1-replay-this-level-btn')?.addEventListener('click',()=>{
   ob.bridgeCardsCollected[lvl]=0;
   ob.bridgeMerged[lvl]=false;
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
  root.querySelector('#s1-bridge-next-btn')?.addEventListener('click',()=>{
   if(lvl<2){
    ob.bridgeLevel=lvl+1;
   }else{
    ob.bridgeDone=true;
    ob.station1Phase='gradual_millions';
    ob.gradualStep=0;
    ob.selectedHousePlace=6;
   }
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
  return;
 }

 /* phase === 'gradual_millions' */
 const gStep=Math.max(0,Math.min(3,Number(ob.gradualStep)||0));
 const gradSteps=[
  {
   step:0,
   targetPlace:6,
   badge:'اكتشاف الملايين · استكشاف اللوحة',
   tab:'١. المليون في لوحة المنازل',
   shortTab:'المليون',
   stepTitle:'المليون (1,000,000)',
   n:1000000,
   defaultPlace:6,
   title:'مكان المليون (1,000,000) في لوحة المنازل',
   owl:'أين يقع الرقم 1 في العدد 1,000,000؟ اضغط على الخانة الصحيحة في اللوحة.',
   instruction:'اضغط على خانة الرقم 1 في لوحة المنازل.',
   prompt:'أين يقع الرقم 1 في العدد 1,000,000؟ اضغط على الخانة الصحيحة في لوحة المنازل:',
   feedbackTag:'أحسنت! إجابتك صحيحة',
   takeaway:'العدد 1,000,000 يتكون من 6 أصفار، وهو أول بيت في دورة الملايين (آحاد الملايين).',
   caption:'العدد 1,000,000 يتكون من 6 أصفار، وهو أول بيت في دورة الملايين (آحاد الملايين).',
   fullReview:'من شرح الدرس (الشريحتان ١ و٦): تخيّل العدد شارعًا وكل رقم يسكن بيتًا اسمه «المنزلة». كل بيت إلى اليسار قيمته 10 أمثال البيت السابق، وبطاقة 1,000,000 تسكن في «آحاد الملايين» وأمامها 6 أصفار.',
   generalHint:'تذكّر: في العدد 1,000,000 الرقم 1 يسكن في أول خانة من دورة الملايين (آحاد الملايين - سابع خانة من اليمين). جرب الضغط عليها!',
   nextActionLabel:'المتابعة إلى عدد من ٧ خانات ←'
  },
  {
   step:1,
   targetPlace:6,
   badge:'اكتشاف الملايين · استكشاف اللوحة',
   tab:'٢. عدد من ٧ خانات',
   shortTab:'٧ خانات',
   stepTitle:'عدد من ٧ خانات (2,051,841)',
   n:2051841,
   defaultPlace:6,
   title:'التدرّج إلى عدد من ٧ خانات: 2,051,841',
   owl:'في العدد 2,051,841: أين تسكن الملايين؟ اضغط على خانة الرقم 2 في اللوحة.',
   instruction:'اضغط على خانة الرقم 2 في آحاد الملايين.',
   prompt:'في العدد 2,051,841: أين يقع الرقم 2 في دورة الملايين؟ اضغط على خانته في اللوحة:',
   feedbackTag:'ممتاز! إجابتك صحيحة',
   takeaway:'كل 3 منازل متجاورة تشكّل دورة كاملة: دورة الآحاد، ثم دورة الألوف، ثم دورة الملايين.',
   caption:'كل 3 منازل متجاورة تشكّل دورة كاملة: دورة الآحاد، ثم دورة الألوف، ثم دورة الملايين.',
   fullReview:'من شرح الدرس (الشريحة ٢): كل ثلاثة بيوت تكوّن «دورة»: دورة الآحاد (841)، ثم دورة الألوف (051)، ثم دورة الملايين وفيها الرقم 2 في آحاد الملايين (2,000,000).',
   generalHint:'ابحث عن الرقم 2 في دورة الملايين (آحاد الملايين - سابع خانة من اليمين) واضغط عليه!',
   nextActionLabel:'المتابعة إلى عدد من ٨ خانات ←'
  },
  {
   step:2,
   targetPlace:7,
   badge:'اكتشاف الملايين · استكشاف اللوحة',
   tab:'٣. عدد من ٨ خانات (أستكشف)',
   shortTab:'٨ خانات',
   stepTitle:'عدد من ٨ خانات (10,579,747)',
   n:10579747,
   defaultPlace:7,
   showCity:true,
   title:'التدرّج إلى عدد من ٨ خانات: سكان المملكة (10,579,747)',
   owl:'في عدد سكان المملكة (10,579,747): أين تقع منزلة عشرات الملايين؟ اضغط على خانة الرقم 1.',
   instruction:'اضغط على خانة الرقم 1 في عشرات الملايين.',
   prompt:'في عدد سكان المملكة (10,579,747): أين تقع منزلة «عشرات الملايين»؟ اضغط عليها في اللوحة:',
   feedbackTag:'رائع! إجابتك صحيحة',
   takeaway:'منزلة عشرات الملايين تكبر آحاد الملايين بـ 10 أمثال، وتسكن في عدد من 8 خانات.',
   caption:'منزلة عشرات الملايين تكبر آحاد الملايين بـ 10 أمثال، وتسكن في عدد من 8 خانات.',
   fullReview:'من شرح الدرس (الشريحتان ٣ و٤ · أستكشف): العدد 10,579,747 يتكون من 8 خانات، وفيه الرقم 1 في منزلة «عشرات الملايين» وقيمته 10,000,000.',
   generalHint:'ابحث عن الرقم 1 في منزلة عشرات الملايين (ثامن خانة من اليمين) واضغط عليه!',
   nextActionLabel:'المتابعة إلى دورة الملايين الكاملة ←'
  },
  {
   step:3,
   targetPlace:8,
   badge:'اكتشاف الملايين · استكشاف اللوحة',
   tab:'٤. عدد من ٩ خانات ودورة الملايين',
   shortTab:'٩ خانات',
   stepTitle:'عدد من ٩ خانات (645,230,697)',
   n:645230697,
   defaultPlace:8,
   showCycleCallout:true,
   title:'عدد من ٩ خانات (645,230,697) واكتمال دورة الملايين',
   owl:'في العدد 645,230,697: اضغط على منزلة مئات الملايين (الرقم 6) لتشاهد اكتمال الدورة!',
   instruction:'اضغط على خانة الرقم 6 في مئات الملايين.',
   prompt:'في العدد 645,230,697: اضغط على منزلة «مئات الملايين» (الرقم 6) لتشاهد اكتمال الدورة:',
   feedbackTag:'مبارك! إجابتك صحيحة',
   takeaway:'دورة الملايين تكتمل بثلاثة بيوت: آحاد الملايين، وعشرات الملايين، ومئات الملايين.',
   caption:'دورة الملايين تكتمل بثلاثة بيوت: آحاد الملايين، وعشرات الملايين، ومئات الملايين.',
   fullReview:'من شرح الدرس (الشريحة ٥ · أتعلّم): نفصل العدد إلى ثلاث دورات: 645 | 230 | 697. دورة الملايين تضم آحاد الملايين وعشراتها ومئاتها، وكل منزلة أكبر تساوي عشرة أمثال السابقة.',
   generalHint:'ابحث عن الرقم 6 في منزلة مئات الملايين (تاسع خانة من اليمين) واضغط عليه!',
   nextActionLabel:'الانتقال إلى ملعب الأعداد التفاعلي ←'
  }
 ];

 if(!Array.isArray(ob.gradualAnswered)){
  ob.gradualAnswered=[false,false,false,false];
 }
 if(ob.reviewBypassed||isNodeCompleted(0)||ob.pathChosen==='shortcut'){
  for(let i=0;i<4;i++)ob.gradualAnswered[i]=true;
 }

 const isAnswered=!!ob.gradualAnswered[gStep];
 const curG=gradSteps[gStep];
 const selP=isAnswered
  ?((typeof ob.selectedHousePlace==='number'&&ob.selectedHousePlace>=0&&ob.selectedHousePlace<=8)?ob.selectedHousePlace:curG.defaultPlace)
  :-1;
 const selDigit=selP>=0?digit(curG.n,selP):0;
 const selVal=selP>=0?selDigit*10**selP:0;

 if(gStep===3&&isAnswered){
  completeStation1Onboarding();
 }

 const maxStepAllowed=Math.max(
  Number(ob.gradualMaxStep)||0,
  Number(ob.gradualStep)||0,
  (ob.reviewBypassed||isNodeCompleted(0)||ob.pathChosen==='shortcut')?3:0
 );

 const navTabsHTML=gradSteps.map((st,idx)=>{
  const isCurrent=idx===gStep;
  const isDone=(ob.gradualAnswered&&ob.gradualAnswered[idx])||idx<gStep||isNodeCompleted(0);
  const isAccessible=idx<=maxStepAllowed;
  const cls=(isCurrent?'active ':'')+(isDone?'done ':'')+(!isAccessible?'locked ':'');
  return '<button type="button" class="gradual-step-tab '+cls+'" data-gstep="'+idx+'" '+(isAccessible?'':'disabled')+' aria-current="'+(isCurrent?'step':'false')+'" title="'+st.tab+'">'
   +'<span class="cs-circle">'+ar(idx+1)+'</span>'
   +'<span class="cs-text">'+st.shortTab+'</span>'
   +'</button>';
 }).join('');

 const millionsCycleCalloutHTML=curG.showCycleCallout
  ?'<div class="millions-cycle-callout">'
   +'<h4>دورة الملايين تضم ثلاثة بيوت متتالية:</h4>'
   +'<div class="millions-cycle-houses">'
   +'<div class="millions-house-chip"><small>البيت السابع (٧ خانات)</small><strong>آحاد الملايين</strong><span>الرقم 5 = 5,000,000</span></div>'
   +'<div class="millions-house-chip"><small>البيت الثامن (٨ خانات)</small><strong>عشرات الملايين</strong><span>الرقم 4 = 40,000,000</span></div>'
   +'<div class="millions-house-chip"><small>البيت التاسع (٩ خانات)</small><strong>مئات الملايين</strong><span>الرقم 6 = 600,000,000</span></div>'
   +'</div>'
   +'</div>'
  :'';

 root.innerHTML=owlHeader('«'+curG.owl+'»',curG.instruction)
  +'<div class="s1-card gradual-discovery-card">'
  +'<div class="discovery-header">'
  +'<div class="discovery-title-row">'
  +'<span class="discovery-activity-title">اكتشاف الملايين في لوحة المنازل</span>'
  +'<span class="discovery-step-tag">الخطوة '+ar(gStep+1)+' من '+ar(4)+'</span>'
  +'</div>'
  +'<div class="gradual-stepper-nav compact-stepper" role="navigation" aria-label="خطوات اكتشاف الملايين">'+navTabsHTML+'</div>'
  +'</div>'
  +'<div class="discovery-task-box">'
  +'<p class="task-directive-title">'+curG.prompt+'</p>'
  +'</div>'
  +'<div id="s1-gradual-board-mount" class="discovery-board-hero"></div>'
  +'<div class="s1-interaction-prompt" id="s1-grad-prompt" '+(isAnswered?'hidden':'')+'>'
  +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  +'<span>اضغط على الخانة في لوحة المنازل للإجابة</span>'
  +'</div>'
  +'<div class="s1-explanation encourage" id="s1-gradual-hint" hidden></div>'
  +'<div class="discovery-feedback-section" id="s1-gradual-feedback-section" '+(isAnswered?'':'hidden')+'>'
  +'<div class="unified-feedback-card" id="s1-gradual-live" role="region" aria-label="نتيجة الاستكشاف والتغذية الراجعة">'
  +'<div class="ufc-header">'
  +'<span class="ufc-icon-badge" aria-hidden="true">'
  +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  +'</span>'
  +'<div class="ufc-title-wrap">'
  +'<strong class="ufc-title">أحسنت! إجابتك صحيحة</strong>'
  +'<span class="ufc-subtitle">'+curG.stepTitle+'</span>'
  +'</div>'
  +'</div>'
  +'<div class="ufc-body">'
  +'<div class="ufc-data-row">'
  +'<span class="ufc-label">المنزلة:</span>'
  +'<strong class="ufc-value">'+(selP>=0?places[selP]:'')+'</strong>'
  +'</div>'
  +'<div class="ufc-data-row ufc-calc-row">'
  +'<span class="ufc-label">القيمة المنزلية:</span>'
  +'<div class="ufc-math-box" dir="ltr">'
  +'<span class="num">'+(selP>=0?selDigit+' × '+fmt(10**selP)+' = '+fmt(selVal):'')+'</span>'
  +'</div>'
  +'</div>'
  +'</div>'
  +'<details class="s1-core-takeaway ufc-takeaway-toggle">'
  +'<summary class="ufc-toggle-summary">'
  +'<span class="ufc-toggle-icon" aria-hidden="true">'
  +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  +'</span>'
  +'<span class="ufc-toggle-text">تذكّر هذه الفكرة</span>'
  +'<svg class="ufc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
  +'</summary>'
  +'<div class="ufc-takeaway-content">'
  +'<p class="s1-takeaway-text">'+curG.takeaway+'</p>'
  +'</div>'
  +'</details>'
  +'</div>'
  +'<div class="transition-progress-card" role="region" aria-label="مؤشر التقدم في النشاط">'
  +'<div class="transition-progress-meta">'
  +'<div class="transition-step-badge">'
  +'<span class="t-step-dot"></span>'
  +'<span>الخطوة '+ar(gStep+1)+' من '+ar(4)+'</span>'
  +'</div>'
  +'<span class="transition-next-preview">'+(gStep<3?'الخطوة التالية: '+gradSteps[gStep+1].shortTab:'المحطة التالية: ملعب الأعداد')+'</span>'
  +'</div>'
  +'<div class="transition-progress-track" aria-hidden="true">'
  +'<div class="transition-progress-fill" style="width:'+(((gStep+1)/4)*100)+'%;"></div>'
  +'</div>'
  +'</div>'
  +'<div class="s1-primary-continue-row">'
  +'<button type="button" class="primary prominent-next-btn" id="s1-grad-next">'+curG.nextActionLabel+'</button>'
  +'</div>'
  +'</div>'
  +'<details class="s1-optional-review-accordion">'
  +'<summary class="s1-review-summary">'
  +'<div class="s1-review-summary-left">'
  +'<span class="s1-review-summary-icon">'
  +'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  +'</span>'
  +'<span class="s1-review-summary-title">تحتاج إلى مراجعة؟</span>'
  +'</div>'
  +'<span class="s1-review-summary-hint">الشرح المفصل والشرائح</span>'
  +'<svg class="s1-review-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
  +'</summary>'
  +'<div class="s1-review-content">'
  +'<div class="s1-review-deep-box">'
  +'<div class="s1-review-deep-title">تفاصيل الشرح من الدرس</div>'
  +'<p class="s1-review-deep-text">'+curG.fullReview+'</p>'
  +'</div>'
  +millionsCycleCalloutHTML
  +(curG.showCity?citySVG():'')
  +'<div class="s1-secondary-actions">'
  +'<button type="button" class="secondary" id="s1-open-slides-btn">'+getIconSVG('book')+'<span>شاهد شرائح الشرح</span></button>'
  +'<button type="button" class="secondary" id="s1-optional-review-btn">أراجع قليلًا</button>'
  +'<button type="button" class="secondary" id="s1-replay-bridge-btn">إعادة جسر البطاقات</button>'
  +'</div>'
  +'</div>'
  +'</details>'
  +'</div>';

 const boardMount=root.querySelector('#s1-gradual-board-mount');
 if(boardMount){
  const boardEl=numberBoard(curG.n,{interactive:true,selected:selP});
  boardEl.querySelectorAll('button.house').forEach(btn=>{
   btn.addEventListener('click',()=>{
    const p=Number(btn.dataset.place);
    const isTarget=(p===curG.targetPlace)||(curG.step===3&&p>=6&&p<=8);
    if(!ob.gradualAnswered[gStep]){
     if(isTarget){
      ob.gradualAnswered[gStep]=true;
      ob.selectedHousePlace=p;
      ob.gradualMaxStep=Math.max(Number(ob.gradualMaxStep)||0,gStep+1);
      sound(true,520);haptic(true);
      if(gStep===3)completeStation1Onboarding();
      saveState();
      renderStation1Experience();
      updateStepClarityBar();
      renderStationTopbar();
     }else{
      sound(false,280);haptic(false);
      btn.classList.add('wrong');
      setTimeout(()=>btn.classList.remove('wrong'),600);
      const hintEl=root.querySelector('#s1-gradual-hint');
      const promptEl=root.querySelector('#s1-grad-prompt');
      if(hintEl){
       hintEl.hidden=false;
       hintEl.textContent='هذه منزلة «'+places[p]+'» وقيمتها '+fmt(digit(curG.n,p)*10**p)+'. '+curG.generalHint;
      }
      if(promptEl)promptEl.hidden=true;
     }
    }else{
     ob.selectedHousePlace=p;
     sound(true,380+p*35);
     saveState();
     renderStation1Experience();
    }
   });
  });
  boardMount.append(boardEl);
 }

 root.querySelectorAll('[data-gstep]').forEach(btn=>{
  btn.addEventListener('click',()=>{
   const targetStep=Number(btn.dataset.gstep);
   if(targetStep>maxStepAllowed)return;
   ob.gradualStep=targetStep;
   ob.selectedHousePlace=gradSteps[targetStep].defaultPlace;
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  });
 });

 root.querySelector('#s1-grad-next')?.addEventListener('click',()=>{
  if(gStep<3){
   ob.gradualStep=gStep+1;
   ob.selectedHousePlace=gradSteps[gStep+1].defaultPlace;
   if(ob.gradualStep===3&&ob.gradualAnswered[3])completeStation1Onboarding();
   saveState();
   renderStation1Experience();
   updateStepClarityBar();
   renderStationTopbar();
  }else{
   completeStation1Onboarding();
   openNode(1);
  }
 });

 root.querySelector('#s1-open-slides-btn')?.addEventListener('click',openReviewSlidesMode);
 root.querySelector('#s1-optional-review-btn')?.addEventListener('click',startOptionalReview);
 root.querySelector('#s1-replay-bridge-btn')?.addEventListener('click',()=>{
  ob.station1Phase='bridge';
  ob.bridgeLevel=0;
  ob.bridgeCardsCollected=[0,0,0];
  ob.bridgeMerged=[false,false,false];
  saveState();
  renderStation1Experience();
  updateStepClarityBar();
  renderStationTopbar();
 });
}
function renderStory(){
 counterToken++;
 const list=slides(),storyNode=activeStoryNode(),allowed=storyNode?storyNode.slides:list.map((_,i)=>i);
 const isStation1=(storyNode&&storyNode.id===0&&state.scene===0);
 if(isStation1){
  renderStation1Experience();
  if(!state.onboarding?.reviewSlidesMode){
   document.body.classList.remove('show-magic','show-experiments');
   renderStationTopbar();
   if(typeof updateStepClarityBar==='function')updateStepClarityBar();
   return;
  }
 }else{
  const s1Root=$('station1-experience'),s1Bar=$('s1-slides-mode-bar'),tabsEl=$('chapter-tabs'),gridEl=document.querySelector('#story-player-section .player-grid'),gateEl=$('story-gate-bar');
  if(s1Root)s1Root.hidden=true;
  if(s1Bar)s1Bar.hidden=true;
  toggleStation1LegacyPlayer(true);
  if(s1Root)s1Root.hidden=true;
  if(s1Bar)s1Bar.hidden=true;
  if(tabsEl)tabsEl.hidden=false;
  if(gridEl)gridEl.hidden=false;
  if(gateEl)gateEl.hidden=false;
 }
 if(!allowed.includes(state.story[state.scene]))state.story[state.scene]=allowed[0];
 const index=state.story[state.scene],slide=list[index],tabs=$('chapter-tabs');
 if(state.viewMode==='story')state.viewedSlides[state.scene].add(index);
 if(storyNode&&isNodeUnlocked(storyNode.id)&&allowed.every(idx=>state.viewedSlides[storyNode.unit].has(idx))){
  if(!state.nodesCompleted.has(storyNode.id)){
   state.nodesCompleted.add(storyNode.id);
   checkMilestoneBadges();sound(true);celebrate(14);renderHUD();renderDuolingoMap();
  }
 }
 document.body.classList.toggle('show-magic',Boolean(storyNode?.showMagic));
 document.body.classList.toggle('show-experiments',Boolean(storyNode?.showExperiments));
 tabs.replaceChildren();
 [...new Set(allowed.map(i=>list[i].tab))].forEach(name=>{
  const b=document.createElement('button');b.type='button';b.textContent=name;b.className=name===slide.tab?'active':'';
  b.setAttribute('aria-pressed',String(name===slide.tab));
  b.addEventListener('click',()=>{stopStory();state.story[state.scene]=allowed.find(i=>list[i].tab===name);renderStory();saveState();});
  tabs.append(b);
 });
 const stage=$('animation-stage');stage.replaceChildren();
 const title=document.createElement('div');title.className='stage-overline';title.textContent=slide.tab;stage.append(title);
 if(slide.type==='street')stage.insertAdjacentHTML('beforeend','<h3 class="stage-title">عدد كبير… وبيوت صغيرة</h3><div class="street">'+String(slide.n).split('').map((n,i)=>'<span class="street-house" style="--delay:'+i*.1+'s">'+n+'</span>').join('')+'</div><p class="cycle-label">الرقم في بيته الصحيح، وقيمته بحسب هذا البيت.</p>');
 else if(['board','count'].includes(slide.type)){stage.append(numberBoard(slide.n,{selected:slide.p,drop:slide.drop,count:slide.type==='count'}));if(slide.type==='count')stage.insertAdjacentHTML('beforeend','<div class="count-labels">'+Array.from({length:slide.p},(_,i)=>'<span style="--delay:'+i*.25+'s">'+(i+1)+'</span>').join('')+'</div>');else stage.insertAdjacentHTML('beforeend','<div class="stage-stat" style="font-size:27px">'+fmt(slide.n)+'</div>');}
 else if(slide.type==='zeros'){stage.append(numberBoard(slide.n,{selected:slide.p,count:true}));stage.insertAdjacentHTML('beforeend','<div class="zero-demo">'+digit(slide.n,slide.p)+Array.from({length:slide.p},(_,i)=>'<span style="--delay:'+(i+1)*.25+'s">0</span>').join('')+'</div><p class="stage-unit">'+places[slide.p]+'</p>');}
 else if(slide.type==='place-rule')stage.insertAdjacentHTML('beforeend','<h3 class="stage-title">القيمة المنزلية = الرقم × قيمة المنزلة</h3><div class="place-flow" role="region" aria-label="شرح تضاعف المنازل من الآحاد يمينًا إلى الألوف يسارًا"><div class="flow-card" style="--delay:0s"><span class="flow-place">الآحاد</span><strong class="flow-val num">1</strong></div><div class="flow-step" style="--delay:.15s" aria-label="ضرب في 10"><span class="step-mult" dir="ltr">×10</span><svg class="step-arrow" viewBox="0 0 28 14" width="28" height="14" aria-hidden="true"><path d="M26 7H3M8 2L2 7l6 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="flow-card" style="--delay:.3s"><span class="flow-place">العشرات</span><strong class="flow-val num">10</strong></div><div class="flow-step" style="--delay:.45s" aria-label="ضرب في 10"><span class="step-mult" dir="ltr">×10</span><svg class="step-arrow" viewBox="0 0 28 14" width="28" height="14" aria-hidden="true"><path d="M26 7H3M8 2L2 7l6 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="flow-card" style="--delay:.6s"><span class="flow-place">المئات</span><strong class="flow-val num">100</strong></div><div class="flow-step" style="--delay:.75s" aria-label="ضرب في 10"><span class="step-mult" dir="ltr">×10</span><svg class="step-arrow" viewBox="0 0 28 14" width="28" height="14" aria-hidden="true"><path d="M26 7H3M8 2L2 7l6 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="flow-card flow-card-k" style="--delay:.9s"><span class="flow-place">الألوف</span><strong class="flow-val num">1,000</strong></div></div><p class="cycle-label">كل انتقال إلى منزلة أكبر (يسارًا) يضرب قيمة المنزلة في 10.</p><div class="note-book">الصفر يحفظ مكان المنزلة، وقيمته المنزلية صفر.</div>');
 else if(['city','space','eye','airport','airport-info'].includes(slide.type)){const isYearSlide=slide.type==='airport-info',formatStat=isYearSlide?fmtYear:fmt;if(slide.type==='city')stage.insertAdjacentHTML('beforeend',citySVG());else if(slide.type==='space')stage.insertAdjacentHTML('beforeend',spaceSVG(slide.planet));else if(slide.type.startsWith('airport'))stage.insertAdjacentHTML('beforeend',airportSVG());else stage.insertAdjacentHTML('beforeend','<svg class="city-svg" viewBox="0 0 400 130" role="img" aria-label="عين ترمش"><g class="blink-eye"><path d="M70 65Q200-36 330 65Q200 166 70 65" fill="#fff" stroke="#518576" stroke-width="4"/><circle cx="200" cy="65" r="42" fill="#8eb1a2"/><circle cx="200" cy="65" r="22" fill="#244f45"/><circle cx="188" cy="51" r="9" fill="#fff"/></g></svg>');stage.insertAdjacentHTML('beforeend','<div class="stage-stat" id="animated-number" dir="ltr">'+formatStat(slide.n)+'</div><div class="stage-unit">'+(slide.type==='city'?'نسمة · نهاية <bdi>2019</bdi>':slide.type==='eye'?'رمشة تقريبًا في السنة':slide.type==='space'?'كيلومتر تقريبًا':slide.type==='airport'?'مسافرًا · آب <bdi>2019</bdi>':'عام إنشاء المطار')+'</div>');if(slide.type==='eye')stage.insertAdjacentHTML('beforeend','<details class="note-book"><summary>معلومة كما وردت في الكتاب</summary><p>«رمشة العين هي أسرع حركة يمكن أن يقوم بها جسم الإنسان، وكلما تقدمنا بالعمر تتسارع وتيرتها».</p></details>');animateNumber(slide.n,isYearSlide);}
 else if(slide.type==='words'){
  const boxWrap = document.createElement('div');
  boxWrap.className = 'stage-color-words-wrap';
  renderColorCodedNumberBlock(slide.n, boxWrap, 'cycle');
  stage.append(boxWrap);
 }
 else if(slide.type==='expanded')stage.insertAdjacentHTML('beforeend','<div class="stage-stat" style="margin-bottom:20px">'+fmt(slide.n)+'</div><div class="stage-terms">'+termHTML(slide.n)+'</div>');
 else if(slide.type==='compare')stage.insertAdjacentHTML('beforeend','<div class="compare"><div class="num">'+marked(9605,3)+'</div><span>و</span><div class="num">'+marked(149605,3)+'</div></div><div class="note-book">عدّ الأرقام على يمين 9 في كل عدد، ثم فكّر في سؤال التبرير.</div>');
 const posInStation=allowed.indexOf(index);
 $('story-caption').textContent=slide.caption;
 $('story-prev').disabled=posInStation<=0;
 $('story-next').disabled=posInStation>=allowed.length-1;
 $('story-speak').disabled=slide.n===undefined;
 $('story-dots').replaceChildren();
 allowed.forEach((i,j)=>{
  const b=document.createElement('button');b.type='button';
  const seen=state.viewedSlides[state.scene].has(i);
  b.className=(i===index?'active':'')+(seen?' seen':'');
  b.setAttribute('aria-label','الشريحة '+(j+1)+' من '+allowed.length);
  b.setAttribute('aria-pressed',String(i===index));
  b.addEventListener('click',()=>{stopStory();state.story[state.scene]=i;renderStory();saveState();});
  $('story-dots').append(b);
 });
 const viewedCount=allowed.filter(i=>state.viewedSlides[state.scene].has(i)).length;
 $('story-count').textContent='الشريحة '+ar(posInStation+1)+' من '+ar(allowed.length)+' ('+ar(viewedCount)+'/'+ar(allowed.length)+' تمت مشاهدتها)';
 renderStoryGate(storyNode,allowed,posInStation,viewedCount);
 renderStationTopbar();
}
function renderStoryGate(storyNode,allowed,posInStation,viewedCount){
 const bar=$('story-gate-bar'),title=$('story-gate-title'),sub=$('story-gate-sub'),btn=$('story-gate-btn');
 if(!bar||!storyNode)return;
 const done=viewedCount>=allowed.length||isNodeCompleted(storyNode.id);
 const nextNode=PATH_NODES[storyNode.id+1];
 bar.className='gate-bar '+(done?'unlocked':'locked');
 if(done){
  title.textContent='أحسنت! شاهدت شرائح «'+storyNode.title+'» كاملة';
  sub.textContent=nextNode?'المحطة التالية مفتوحة الآن: '+nextNode.title:'أكملت هذا القسم بنجاح.';
  btn.textContent=nextNode?'انتقل إلى: '+nextNode.title+' ←':'العودة لخريطة المسار';
 }else{
  title.textContent='تقدّم الشرح: شاهدت '+ar(viewedCount)+' من '+ar(allowed.length)+' شرائح';
  sub.textContent='تصفّح جميع شرائح الشرح بالترتيب لفتح المحطة التالية.';
  btn.textContent='الشريحة التالية ('+ar(Math.min(allowed.length,posInStation+2))+' من '+ar(allowed.length)+') ←';
 }
}
function animateNumber(target,isYear=false){if(reduced.matches)return;const formatStat=isYear?fmtYear:fmt,token=counterToken,start=performance.now();function tick(now){if(token!==counterToken)return;const e=$('animated-number');if(!e)return;const t=Math.min(1,(now-start)/1300);e.textContent=formatStat(Math.round(target*(1-(1-t)**3)));if(t<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);}
function stopStory(){clearInterval(storyTimer);storyTimer=null;$('story-play').textContent='▶ تشغيل تلقائي';$('story-play').setAttribute('aria-pressed','false');}
function nextStory(delta){
 const storyNode=activeStoryNode(),allowed=storyNode?storyNode.slides:slides().map((_,i)=>i);
 const curPos=Math.max(0,allowed.indexOf(state.story[state.scene]));
 const nextPos=Math.max(0,Math.min(allowed.length-1,curPos+delta));
 state.story[state.scene]=allowed[nextPos];
 renderStory();saveState();
}
function toggleStory(){
 if(storyTimer){stopStory();return;}
 const storyNode=activeStoryNode(),allowed=storyNode?storyNode.slides:slides().map((_,i)=>i);
 if(allowed.indexOf(state.story[state.scene])===allowed.length-1)state.story[state.scene]=allowed[0];
 renderStory();$('story-play').textContent='Ⅱ إيقاف التشغيل';$('story-play').setAttribute('aria-pressed','true');
 storyTimer=setInterval(()=>{
  const curAllowed=activeStoryNode()?.slides||slides().map((_,i)=>i);
  if(curAllowed.indexOf(state.story[state.scene])>=curAllowed.length-1){stopStory();return;}
  nextStory(1);
 },4500);
}

const playgroundState={number:2051841,selected:4,questIndex:0,questsDone:new Set()};
const playgroundQuests=[
 {title:'تحدي الملعب 1 من 5 · مئات الألوف',prompt:'اجعل الرقم في منزلة «مئات الألوف» يساوي 7.',targetPlace:5,hint:'اضغط السهم ▲ فوق خانة «مئات» في دورة الألوف حتى يصبح الرقم 7.',check:n=>digit(n,5)===7},
 {title:'تحدي الملعب 2 من 5 · أربعة ملايين',prompt:'اجعل القيمة المنزلية لرقم «آحاد الملايين» تساوي 4,000,000.',targetPlace:6,hint:'اضغط السهم ▲ فوق خانة «آحاد» في دورة الملايين حتى يصبح الرقم 4.',check:n=>digit(n,6)===4},
 {title:'تحدي الملعب 3 من 5 · دورة الألوف الصفرية',prompt:'اجعل جميع منازل «دورة الألوف» أصفارًا مع بقاء العدد مليونًا فأكثر.',targetPlace:4,hint:'اجعل آحاد الألوف وعشرات الألوف ومئات الألوف تساوي 0، مع بقاء رقم في دورة الملايين (مليون فأكثر).',check:n=>Math.floor(n/1e3)%1e3===0&&n>=1e6},
 {title:'تحدي الملعب 4 من 5 · بناء العدد',prompt:'كوّن العدد: خمسة ملايين وثلاثمئة ألف واثنان (5,300,002).',targetPlace:6,hint:'ضع 5 في آحاد الملايين، و3 في مئات الألوف، و2 في الآحاد، والباقي أصفار.',check:n=>n===5300002},
 {title:'تحدي الملعب 5 من 5 · قمة الملايين',prompt:'كوّن العدد: خمسمئة مليون وأربعون ألفًا وسبعة (500,040,007).',targetPlace:8,hint:'ضع 5 في مئات الملايين، و4 في عشرات الألوف، و7 في الآحاد، والباقي أصفار.',check:n=>n===500040007}
];
let dragController=null;
function liveExpansion(root,n){const terms=expansion(n);root.innerHTML=(terms.length?terms:[{value:0}]).map(t=>'<span class="term">'+fmt(t.value)+'</span>').join('<span aria-hidden="true">+</span>');root.setAttribute('aria-label','الصيغة التحليلية: '+(terms.length?terms:[{value:0}]).map(t=>fmt(t.value)).join(' زائد '));}
function renderPlaygroundQuest(){
 const qIdx=playgroundState.questIndex,q=playgroundQuests[qIdx],done=playgroundState.questsDone.has(qIdx);
 $('playground-quest').classList.toggle('done',done);
 const modeLabel=state.viewMode==='recharge'?'تحدي شحن القلوب · ':state.viewMode==='scratchpad'?'مسودة حرة · ':'تحدي الملعب · ';
 $('quest-badge').textContent=(done?'أنجزت: ':modeLabel)+q.title+' ('+ar(playgroundState.questsDone.size)+'/5 مكتمل)';
 const nextBtn=$('quest-next');
 if(done){
  const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
  const more=playgroundState.questsDone.size<3;
  $('quest-prompt').innerHTML='<span class="quest-done-msg">رائع! أنجزت هذا التحدي بنجاح! '+(more?'اضغط «التحدي التالي» لتحدٍّ جديد ('+ar(playgroundState.questsDone.size)+' من 3 مطلوبة).':'أكملت 3 تحديات وفتحت المحطة التالية ومسودة الملعب!')+'</span>';
  if(nextBtn){
   nextBtn.classList.add('quest-next-btn-ready');
   nextBtn.innerHTML=nextUnsolved>=0?'<span>التحدي التالي ('+ar(nextUnsolved+1)+')</span> ←':'<span>مراجعة التحديات</span> ↻';
  }
 }else{
  $('quest-prompt').textContent=q.prompt;
  if(nextBtn){
   nextBtn.classList.remove('quest-next-btn-ready');
   nextBtn.innerHTML='<span class="btn-svg"><svg viewBox="0 0 24 24" class="svg-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"/></svg></span><span>تحدٍّ آخر</span>';
  }
 }
}
function renderPlaygroundGate(){
 const bar=$('playground-gate-bar'),title=$('playground-gate-title'),sub=$('playground-gate-sub'),btn=$('playground-gate-btn');
 if(!bar)return;
 if(state.viewMode==='scratchpad'){
  bar.className='gate-bar unlocked';
  title.textContent='مسودة ملعب الأعداد المساعدة';
  sub.textContent='جرّب الأرقام واكتشف قيمها المنزلية بحرية، ثم عُد لإكمال مهمتك.';
  btn.disabled=false;
  btn.textContent='↩ العودة إلى السؤال والمهمة';
  return;
 }
 if(state.viewMode==='recharge'){
  const solved=state.rechargeSolved||state.hearts===3;
  bar.className='gate-bar '+(solved?'unlocked':'locked');
  title.textContent=solved?'أحسنت! استعدت قلوبك الثلاثة كاملة':'أنجز التحدي الأصفر أعلاه لشحن قلوبك الكاملة';
  sub.textContent=solved?'قلوبك مشحونة بالكامل! عُد الآن لإكمال مهمتك من حيث توقفت.':'غيّر الأرقام في الملعب لتطابق التحدي المطلوب أو اضغط «ساعدني».';
  btn.disabled=!solved;
  btn.textContent=solved?'العودة لإكمال المهمة بقلوب كاملة ←':'أنجز التحدي أولًا لشحن القلوب';
  return;
 }
 const doneCount=Math.min(3,playgroundState.questsDone.size),unlocked=doneCount>=3||isNodeCompleted(1);
 bar.className='gate-bar '+(unlocked?'unlocked':'locked');
 if(unlocked){
  title.textContent='بطل الملعب! أنجزت '+ar(playgroundState.questsDone.size)+' تحديات وفتحت مسودة الملعب';
  sub.textContent='أصبحت مسودة الملعب متاحة لك في جميع التمارين القادمة.';
  btn.disabled=false;
  btn.textContent='انتقل إلى: 3. ورشة سكان المملكة ←';
 }else{
  title.textContent='أنجز 3 تحديات في الملعب لفتح التمارين ('+ar(doneCount)+' / 3 مكتمل)';
  sub.textContent='غيّر الأرقام أعلاه لتطابق التحدي الأصفر، أو اضغط «ساعدني».';
  btn.disabled=true;
  btn.textContent='بقي '+ar(3-doneCount)+' تحديات لفتح المحطة التالية';
 }
}
function getCycleKeyByPlace(p){return p>=6?'millions':p>=3?'thousands':'ones';}
function initPlayground(){
 const root=$('number-playground'),grid=$('play-digits'),shortPlaces=['آحاد','عشرات','مئات'],cycleKeys=['ones','thousands','millions'],cycleTitles=['دورة الآحاد','دورة الألوف','دورة الملايين'];
 if(playgroundState.questsDone.has(playgroundState.questIndex)){
  const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
  if(nextUnsolved>=0)playgroundState.questIndex=nextUnsolved;
 }
 if(grid)grid.innerHTML='';
 for(let g=2;g>=0;g--){
  const cKey=cycleKeys[g];
  const cycle=document.createElement('div');cycle.className='play-cycle '+cKey;cycle.dataset.cycle=cKey;cycle.innerHTML='<h3>'+cycleTitles[g]+'</h3><div class="play-cycle-digits"></div>';
  for(let p=g*3+2;p>=g*3;p--){
   const cell=document.createElement('div');cell.className='play-cell '+cKey;cell.dataset.cycle=cKey;cell.dataset.p=String(p);
   const placeCls=p%3===2?'place-hundreds':p%3===1?'place-tens':'place-ones';
   cell.innerHTML='<span class="play-place '+placeCls+'" title="'+places[p]+'">'+shortPlaces[p%3]+'</span><button type="button" class="play-spin-btn play-spin-up" data-play-p="'+p+'" data-delta="1" aria-label="زيادة رقم '+places[p]+'">▲</button><strong id="play-spin-'+p+'" data-cycle="' + cKey + '" ' + spinAttributes('play-'+p,p,digit(playgroundState.number,p),'رقم '+places[p])+'>'+digit(playgroundState.number,p)+'</strong><button type="button" class="play-spin-btn play-spin-down" data-play-p="'+p+'" data-delta="-1" aria-label="إنقاص رقم '+places[p]+'">▼</button>';
   cell.addEventListener('click',e=>{if(!e.target.closest('button')){playgroundState.selected=p;updatePlayground();}});
   cycle.querySelector('.play-cycle-digits').append(cell);
  }
  grid.append(cycle);
 }
 touchDigits(root,(el,steps)=>changePlayDigit(Number(el.dataset.p),steps),true);
 root.querySelectorAll('[data-play-p]').forEach(b=>b.addEventListener('click',()=>{
  const p=Number(b.dataset.playP),delta=Number(b.dataset.delta);
  try{if(typeof navigator!=='undefined'&&'vibrate' in navigator)navigator.vibrate(12);}catch{}
  changePlayDigit(p,delta);
  const sEl=$('play-spin-'+p);if(sEl)sEl.dataset.tick=sEl.dataset.tick==='1'?'2':'1';
 }));
 root.addEventListener('focusin',event=>{if(event.target.matches('.spin')){playgroundState.selected=Number(event.target.dataset.p);updatePlayground();}});
 if($('play-live-strip'))$('play-live-strip').addEventListener('click',event=>{
  const b=event.target instanceof Element?event.target.closest('b[data-p]'):null;
  if(b){playgroundState.selected=Number(b.dataset.p);updatePlayground();}
 });
 $('play-speak').addEventListener('click',()=>speakNumber(playgroundState.number,root));
 $('play-random').addEventListener('click',()=>{cancelDigitGestures();playgroundState.number=Math.floor(Math.random()*1e9);updatePlayground();});
 $('play-zero').addEventListener('click',()=>{cancelDigitGestures();playgroundState.number=0;updatePlayground();});
 $('play-example').addEventListener('click',()=>{cancelDigitGestures();resetPlayground();});
 $('quest-next').addEventListener('click',()=>{
  const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
  if(playgroundState.questsDone.has(playgroundState.questIndex)&&nextUnsolved>=0){
   playgroundState.questIndex=nextUnsolved;
  }else{
   playgroundState.questIndex=(playgroundState.questIndex+1)%playgroundQuests.length;
  }
  renderPlaygroundQuest();saveState();
 });
 if($('quest-hint-btn'))$('quest-hint-btn').addEventListener('click',()=>{
  const q=playgroundQuests[playgroundState.questIndex];if(!q)return;
  if(q.targetPlace!==undefined){
   playgroundState.selected=q.targetPlace;updatePlayground();
   const spin=$('play-spin-'+q.targetPlace);if(spin){spin.classList.remove('target-glow');void spin.offsetWidth;spin.classList.add('target-glow');}
  }
  guide('تلميح الملعب: '+q.hint,5500);
 });
 updatePlayground();
}
function changePlayDigit(p,steps){const old=digit(playgroundState.number,p),next=((old+steps)%10+10)%10;playgroundState.number+=(next-old)*10**p;playgroundState.selected=p;updatePlayground();}
function updatePlayground(){
 const {number:n,selected:p}=playgroundState;
 const activeCycle=getCycleKeyByPlace(p);
 for(let i=0;i<9;i++){const el=$('play-spin-'+i);if(!el)continue;updateSpin(el,digit(n,i));el.classList.toggle('selected',i===p);}
 const grid=$('play-digits');
 if(grid){
  grid.querySelectorAll('.play-cycle').forEach(cyc=>{
   cyc.classList.toggle('cycle-active-glow',cyc.dataset.cycle===activeCycle);
  });
 }
 const strip=$('play-live-strip');
 if(strip){
  const cycleGroups=[
   {key:'millions',cls:'c-m',start:8,end:6},
   {key:'thousands',cls:'c-t',start:5,end:3},
   {key:'ones',cls:'c-o',start:2,end:0}
  ];
  const groupHtml=cycleGroups.map((cg,idx)=>{
   const isCycActive=cg.key===activeCycle;
   const digs=[];
   for(let i=cg.start;i>=cg.end;i--){
    const isSel=i===p;
    digs.push('<b class="'+cg.cls+(isCycActive?' active-cycle-digit':'')+(isSel?' active-digit':'')+'" data-p="'+i+'" data-cycle="'+cg.key+'">'+digit(n,i)+'</b>');
   }
   const sep=idx<2?'<i class="strip-sep" aria-hidden="true">,</i>':'';
   return '<span class="strip-cycle '+cg.key+(isCycActive?' is-active':'')+'" data-cycle="'+cg.key+'">'+digs.join('')+'</span>'+sep;
  });
  strip.innerHTML=groupHtml.join('');
 }
 $('play-number').value=fmt(n);$('play-selected').textContent=digit(n,p)+' · '+places[p];$('play-value').value=fmt(digit(n,p)*10**p);
 $('play-status').innerHTML='حساب القيمة: <bdi>'+digit(n,p)+' × '+fmt(10**p)+' = '+fmt(digit(n,p)*10**p)+'</bdi>';liveExpansion($('play-expanded'),n);
 const playColorWrap = $('play-color-coded-wrap');
 if(playColorWrap){
  const prevMode = playColorWrap.querySelector('.color-coded-box')?.dataset.colorMode || 'cycle';
  if(grid) grid.classList.toggle('mode-place', prevMode === 'place');
  renderColorCodedNumberBlock(n, playColorWrap, prevMode, {
   selectedPlace: p,
   onSelectPlace: (newP) => {
    playgroundState.selected = newP;
    updatePlayground();
   }
  });
 }
 const qIdx=playgroundState.questIndex,q=playgroundQuests[qIdx];
 if(q&&!playgroundState.questsDone.has(qIdx)&&q.check(n)){
  playgroundState.questsDone.add(qIdx);
  if(state.viewMode==='recharge'){
   state.rechargeSolved=true;state.hearts=3;
  }
  if(playgroundState.questsDone.size>=3&&isNodeUnlocked(1)){
   state.nodesCompleted.add(1);
  }
  const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
  if(nextUnsolved>=0&&playgroundState.questsDone.size<3)playgroundState.questIndex=nextUnsolved;
  checkMilestoneBadges();sound(true);celebrate(15);renderHUD();renderDuolingoMap();saveState();
  if(state.viewMode==='recharge'){
   guide('رائع! أنجزت التحدي واستعدت قلوبك الثلاثة كاملة! اضغط زر العودة للمهمة.',5200);
  }else if(playgroundState.questsDone.size>=3){
   guide('بطل الملعب! أنجزت 3 تحديات وفتحت المحطة التالية ومسودة الملعب!',5500);
  }else{
   const nextQ=playgroundQuests[playgroundState.questIndex];
   guide('أحسنت! أنجزت التحدي '+ar(playgroundState.questsDone.size)+' من 3. التحدي التالي: «'+nextQ.title+'»!',5000);
  }
 }
 renderPlaygroundQuest();
 renderPlaygroundGate();
 renderStationTopbar();
}
function resetPlayground(){playgroundState.number=2051841;playgroundState.selected=4;updatePlayground();}
const taskInstructions={
 target:'انظر إلى الرقم الملوّن، ثم المس بيته في اللوحة.',zeros:'المس عدد الأصفار واسحبه لأعلى أو لأسفل، ثم اضغط «تحقّق».',
 wheels:'المس الرقم واسحبه لأعلى أو لأسفل، ثم طابق العدد المطلوب واضغط «تحقّق» أو «افتح الخزنة».',
 match:'اختر بطاقة، ثم صِلها ببطاقتها المطابقة. يمكنك السحب أو الضغط على البطاقتين.',choice:'اقرأ السؤال، ثم المس الإجابة التي تختارها.',
 fields:'اكتب قيمة كل رقم في خانته، ثم اضغط «تحقّق من التحليل».',missing:'اكتب العدد في المربع الفارغ، ثم اضغط «أكمل المجموع».',
 error:'المس الحد الذي تعتقد أنه خاطئ، ثم اكتب قيمته الصحيحة.',rapid:'اضغط «أطلق الصاروخ»، ثم اختر قيمة الرقم الأحمر. بعد كل إجابة، انتقل إلى الجولة التالية.'
};
function updateCoach(message){
 if(!$('coach-text'))return;const passed=isPassed(),s=currentStep();
 if(state.infiniteMode){
  $('action-coach').classList.toggle('ready',passed);$('coach-title').textContent=passed?'أحسنت! مسألة متجددة مكتملة':'تحدٍّ متجدد ذكي';
  $('coach-text').textContent=message||(passed?'اضغط «التالي · مسألة متجددة جديدة» أو غيّر نوع المهارة من الشريط العلوي.':taskInstructions[s.type]);
  $('task-next').classList.toggle('next-ready',passed);return;
 }
 const r=record(),last=r.index===missions[activeId()].steps.length-1;
 $('action-coach').classList.toggle('ready',passed);$('coach-title').textContent=passed?'أحسنت! خطوتك التالية':'ابدأ من هنا';
 $('coach-text').textContent=message||(passed?(activeId()===11&&last?'اضغط «شاهد إنجازك» لتستلم شارتك وشهادتك.':activeId()===5&&last?'اضغط الزر الأخضر لفتح فصل التدريب معًا.':'اضغط الزر الأخضر لمتابعة مسارك.') :taskInstructions[s.type]);
 $('task-next').classList.toggle('next-ready',passed);
}
function jumpToPart(id){const target=$(id);if(!target)return;target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}

function updateStepClarityBar(){
 const bar=$('step-clarity-bar');
 if(bar)bar.hidden=true;
}
function updateViewDom(){
 document.body.dataset.view=state.viewMode;
 if($('lesson2-view')) $('lesson2-view').hidden = (state.viewMode !== 'lesson2');
 if($('l2-open-lab-btn')) $('l2-open-lab-btn').hidden = (state.viewMode !== 'lesson2');
 if($('l3-open-lab-btn')) $('l3-open-lab-btn').hidden = !(state.viewMode === 'lesson3' || (state.viewMode === 'map' && state.mapSubView === 'lesson3'));
 if($('l4-open-lab-btn')) $('l4-open-lab-btn').hidden = !(state.viewMode === 'lesson4' || (state.viewMode === 'map' && state.mapSubView === 'lesson4'));
 if($('l5-open-lab-btn')) $('l5-open-lab-btn').hidden = !(state.viewMode === 'lesson5' || (state.viewMode === 'map' && state.mapSubView === 'lesson5'));
 if($('station-topbar'))$('station-topbar').hidden=(state.viewMode==='map'||state.viewMode==='exit_ticket'||state.viewMode==='lesson2'||state.viewMode==='lesson3'||state.viewMode==='lesson4'||state.viewMode==='lesson5'||state.viewMode==='unit1_exam');
 if($('exit-ticket-view'))$('exit-ticket-view').hidden=state.viewMode!=='exit_ticket';
 if($('unit1-exam-view'))$('unit1-exam-view').hidden=state.viewMode!=='unit1_exam';


 if($('duolingo-map'))$('duolingo-map').hidden=state.viewMode!=='map';
 if($('duo-jump-current')&&state.viewMode!=='map')$('duo-jump-current').hidden=true;
 updateLearningNav();
 renderStationTopbar();
 updateStepClarityBar();
}

