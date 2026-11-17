/* Display Preferences, Mobile Back History, Speech Probe & Gesture Tour */
/* ===== تحسينات الأولوية القصوى: الرجوع، العرض، القراءة الصوتية، الجولة ===== */
(function(){
 const KEY='rihla-prefs-v1',ZL=[.9,1,1.15,1.3,1.5];
 let P={zi:1,hc:false,calm:false,tour:false,voiceWarned:false};
 try{Object.assign(P,JSON.parse(localStorage.getItem(KEY))||{});}catch{}
 const savePrefs=()=>{try{localStorage.setItem(KEY,JSON.stringify(P));}catch{}};
 const root=document.documentElement;
 /* 1) إعدادات العرض */
 function applyPrefs(){
  P.zi=Math.max(0,Math.min(ZL.length-1,Number(P.zi)||1));
  document.body.style.zoom=ZL[P.zi]===1?'':ZL[P.zi];
  root.classList.toggle('hc',!!P.hc);root.classList.toggle('calm',!!P.calm);
  $('zoom-val').textContent=Math.round(ZL[P.zi]*100)+'%';
  $('zoom-out').disabled=P.zi===0;$('zoom-in').disabled=P.zi===ZL.length-1;
  [['hc-toggle',P.hc],['calm-toggle',P.calm]].forEach(([id,on])=>{$(id).setAttribute('aria-pressed',String(!!on));$(id).textContent=on?'مفعّل':'متوقف';});
  if(typeof window.syncL1ViewportHeight==='function')window.syncL1ViewportHeight();
  if(typeof updatePathTrackSVGs==='function')requestAnimationFrame(()=>updatePathTrackSVGs());
 }
 $('prefs-open').addEventListener('click',()=>{pauseRapid();stopStory();$('prefs-dialog').showModal();});
 const closePrefs=()=>{$('prefs-dialog').close();};
 $('prefs-close').addEventListener('click',closePrefs);
 $('prefs-dialog').addEventListener('close',()=>{try{if(currentStep().type==='rapid')drawRapid();}catch{}});
 $('zoom-in').addEventListener('click',()=>{P.zi++;applyPrefs();savePrefs();});
 $('zoom-out').addEventListener('click',()=>{P.zi--;applyPrefs();savePrefs();});
 $('hc-toggle').addEventListener('click',()=>{P.hc=!P.hc;applyPrefs();savePrefs();});
 $('calm-toggle').addEventListener('click',()=>{P.calm=!P.calm;applyPrefs();savePrefs();});
 $('prefs-reset').addEventListener('click',()=>{P.zi=1;P.hc=false;P.calm=false;applyPrefs();savePrefs();});
 if(typeof celebrate==='function'){const _c=celebrate;celebrate=function(n){if(P.calm)return;return _c(n);};}
 applyPrefs();
 /* 2) زر الرجوع في الهاتف */
 let inStation=false,popping=false;
 const hasSt=()=>history.state&&history.state.st!==undefined;
 const _uvd=updateViewDom;
 updateViewDom=function(){
  _uvd();
  if(popping)return;
  try{
   const sess=(typeof L1Runner!=='undefined'&&typeof L1Runner.getSession==='function')?L1Runner.getSession():null;
   const curLesson=sess?.lesson||state.runnerStep?.lesson||(state.viewMode==='lesson5'?5:(state.viewMode==='lesson4'?4:(state.viewMode==='lesson3'?3:(state.viewMode==='lesson2'?2:1))));
   const curNode=Number.isInteger(sess?.nodeId)?sess.nodeId:(Number.isInteger(state.runnerStep?.nodeId)?state.runnerStep.nodeId:state.activeNode);
   if(state.viewMode!=='map'){
    const h=(curLesson>1?'#l'+curLesson+'-station-':'#station-')+curNode;
    if(!inStation){history.pushState({st:curNode,lesson:curLesson},'',h);inStation=true;}
    else history.replaceState({st:curNode,lesson:curLesson},'',h);
   }else{
    inStation=false;
    const mapHash=(state.mapSubView==='lesson2'||state.mapSubView==='lesson3'||state.mapSubView==='lesson4'||state.mapSubView==='lesson5')?('#'+state.mapSubView):'#map';
    if(hasSt()||/^#(station-|l[2345]-station-)/.test(location.hash)){
     history.replaceState(null,'',mapHash);
    }
   }
  }catch{}
 };
 function applyHashRoute(isInit){
  try{
   const lm=location.hash.match(/^#(lesson([1-5])|map)$/);
   const m=location.hash.match(/^#station-(\d+)/);
   if(lm){
    const n=lm[2]?+lm[2]:null;
    if(n===2&&typeof getLesson2State==='function'){const s2=getLesson2State();if(s2)s2.unlocked=true;}
    if(n===3&&typeof getLesson3State==='function'){const s3=getLesson3State();if(s3)s3.unlocked=true;}
    if(n===4&&typeof getLesson4State==='function'){const s4=getLesson4State();if(s4)s4.unlocked=true;}
    if(n===5&&typeof getLesson5State==='function'){const s5=getLesson5State();if(s5)s5.unlocked=true;}
    if(typeof L1Runner!=='undefined'&&L1Runner.closeToMap)L1Runner.closeToMap(n||undefined);
    if(n&&typeof setMapSubView==='function')setMapSubView('lesson'+n,true);
    return true;
   }else if(isInit&&m&&state.viewMode==='map'&&isNodeUnlocked(+m[1])){
    openNode(+m[1]);
    return true;
   }
  }catch{}
  return false;
 }
 window.addEventListener('popstate',e=>{
  popping=true;
  try{
   if(e.state&&e.state.st!==undefined){
    const l=e.state.lesson||1;
    if(l===5&&typeof L1Runner!=='undefined'&&L1Runner.openLesson5Node){L1Runner.openLesson5Node(e.state.st,{preserveProgress:true});inStation=true;}
    else if(l===4&&typeof L1Runner!=='undefined'&&L1Runner.openLesson4Node){L1Runner.openLesson4Node(e.state.st,{preserveProgress:true});inStation=true;}
    else if(l===3&&typeof L1Runner!=='undefined'&&L1Runner.openLesson3Node){L1Runner.openLesson3Node(e.state.st,{preserveProgress:true});inStation=true;}
    else if(l===2&&typeof L1Runner!=='undefined'&&L1Runner.openLesson2Node){L1Runner.openLesson2Node(e.state.st,{preserveProgress:true});inStation=true;}
    else if(isNodeUnlocked(e.state.st)){openNode(e.state.st);inStation=true;}
   }else if(!applyHashRoute(false)){
    showDuolingoMap();inStation=false;
   }
  }catch{}
  popping=false;
 });
 window.addEventListener('hashchange',()=>{popping=true;applyHashRoute(false);popping=false;});
 if(!applyHashRoute(true)){
  try{
   if(_uvd!==undefined)updateViewDom();
   if(state.viewMode==='map'){
    setTimeout(()=>{scrollToCurrentStation(true);updateJumpButton();},220);
   }
  }catch{}
 }
 /* 3) القراءة الصوتية للتعليمات + 4) تنبيه غياب الصوت العربي */
 let arVoice=null;
 const probe=()=>{try{const v=speechSynthesis.getVoices()||[];if(v.length)arVoice=v.some(x=>x.lang&&x.lang.toLowerCase().startsWith('ar'));}catch{}return arVoice;};
 const NOVOICE='تنبيه: لا يوجد صوت عربي على هذا الجهاز، فقد لا تسمع النطق. فعّل صوتًا عربيًا من إعدادات النطق في جهازك، أو تابع بالقراءة وتلوين الدورات.';
 if('speechSynthesis' in window){
  probe();
  try{speechSynthesis.addEventListener('voiceschanged',probe);}catch{}
 }
 function speakText(t){
  t=(t||'').replace(/\s+/g,' ').trim();if(!t)return;
  if(state.muted){guide('الصوت مكتوم الآن. اضغط زر الصوت في أعلى الصفحة لتشغيله.',3500);return;}
  stopSpeech();
  if(window.speakWithGeminiFirst){
   window.speakWithGeminiFirst(t);
   return;
  }
  if(!('speechSynthesis' in window)){guide('متصفحك لا يدعم القراءة الصوتية. اقرأ النص أمامك.',3500);return;}
  try{
   const u=new SpeechSynthesisUtterance(t);u.lang='ar-SA';u.rate=.9;
   const v=(speechSynthesis.getVoices()||[]).find(x=>x.lang&&x.lang.toLowerCase().startsWith('ar'));if(v)u.voice=v;
   speechSynthesis.speak(u);
  }catch{}
 }
 window.speakText=speakText;
 const txt=id=>($(id)?$(id).textContent:'');
 $('read-task').addEventListener('click',()=>speakText([txt('mission-title'),txt('mission-goal'),...[...document.querySelectorAll('#mission-content .question-prompt')].map(x=>x.textContent)].join('. ')));
 $('story-read').addEventListener('click',()=>speakText(txt('story-caption')));
 $('guide-read').addEventListener('click',()=>speakText(txt('guide-message')));
  $('quest-read').addEventListener('click',()=>speakText(txt('quest-prompt')));
 if($('scb-read-btn'))$('scb-read-btn').addEventListener('click',()=>speakText([txt('scb-stage-step'),txt('scb-goal'),txt('scb-owl-msg')].join('. ')));
 /* 5) جولة تعريف: إصبع متحرك يسحب عمودياً على خانة آحاد الملايين في الملعب */
 function renderDragHandSVG(){
  return '<svg viewBox="0 0 36 48" fill="none" aria-hidden="true">'
   +'<path d="M18 2L13 7M18 2L23 7" stroke="#0f5346" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
   +'<path d="M18 46L13 41M18 46L23 41" stroke="#0f5346" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
   +'<line x1="18" y1="3" x2="18" y2="11" stroke="#0f5346" stroke-width="2" stroke-dasharray="2 2" stroke-linecap="round"/>'
   +'<line x1="18" y1="37" x2="18" y2="45" stroke="#0f5346" stroke-width="2" stroke-dasharray="2 2" stroke-linecap="round"/>'
   +'<g transform="translate(6, 12)">'
   +'<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" fill="#fffef4" stroke="#12584b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
   +'<path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" fill="#fffef4" stroke="#12584b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
   +'<path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" fill="#fffef4" stroke="#12584b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
   +'<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15" fill="#fffef4" stroke="#12584b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
   +'</g></svg>';
 }
 function showFinger(){
  if(P.tour||(typeof L1Runner!=='undefined'&&L1Runner.isActive()))return;
  const box=$('play-digits'),t=$('play-spin-6')||(box&&box.querySelector('.spin[data-p="6"]'))||(box&&box.querySelector('.spin'));
  if(!t||t.querySelector('.finger-demo'))return;
  if(getComputedStyle(t).position==='static')t.style.position='relative';
  const f=document.createElement('span');f.className='finger-demo';f.innerHTML=renderDragHandSVG();f.setAttribute('aria-hidden','true');t.append(f);
  guide('اسحب بكرة الرقم للأعلى أو للأسفل بإصبعك لتدويرها ومشاهدة دورتها تتوهج!',5500);
  let stopped=false;
  const fadeAndRemove=()=>{
   box.querySelectorAll('.finger-demo').forEach(x=>{
    x.classList.add('fade-out');
    setTimeout(()=>{try{x.remove();}catch{}},320);
   });
  };
  const stop=()=>{
   if(stopped)return;stopped=true;
   P.tour=true;savePrefs();
   fadeAndRemove();
   box.removeEventListener('pointerdown',stop,true);
   box.removeEventListener('touchstart',stop,true);
  };
  box.addEventListener('pointerdown',stop,true);
  box.addEventListener('touchstart',stop,{capture:true,passive:true});
  setTimeout(()=>{if(!stopped)fadeAndRemove();},14000);
 }
 try{
  const sec=$('number-playground');
  if(sec&&'IntersectionObserver' in window){
   new IntersectionObserver((es,ob)=>{if(es.some(e=>e.isIntersecting)&&!P.tour){setTimeout(showFinger,600);}},{threshold:.35}).observe(sec);
  }
 }catch{}
})();
