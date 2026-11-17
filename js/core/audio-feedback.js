/* Guide Toast, Sound Effects, Speech Sync & Visual Feedback Helpers */
function guide(message,duration=5500){clearTimeout(guideTimer);$('guide-message').textContent=message;$('guide').classList.add('show');guideTimer=setTimeout(()=>$('guide').classList.remove('show'),duration);}
function sound(good,customFreq){
 if(state.muted)return;
 try{
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime;

  function playPureTone(freq,startT,duration=0.22,peakGain=0.08,waveType='sine'){
   const osc=audioCtx.createOscillator();
   const gain=audioCtx.createGain();
   osc.type=waveType;
   osc.frequency.setValueAtTime(freq,startT);
   gain.gain.setValueAtTime(0.0001,startT);
   gain.gain.exponentialRampToValueAtTime(peakGain,startT+0.025);
   gain.gain.exponentialRampToValueAtTime(peakGain*0.72,startT+0.075);
   const relStart=Math.max(startT+0.08,startT+duration-0.08);
   gain.gain.setValueAtTime(peakGain*0.72,relStart);
   gain.gain.exponentialRampToValueAtTime(0.0001,startT+duration);
   osc.connect(gain);
   gain.connect(audioCtx.destination);
   osc.start(startT);
   osc.stop(startT+duration+0.02);
  }

  if(good){
   if(customFreq==='recharge'){
    const chord=[523.25,659.25,783.99,1046.50,1318.51];
    chord.forEach((f,idx)=>playPureTone(f,now+idx*0.065,0.26,0.075));
   }else if(customFreq==='badge'){
    const fanfare=[
     {f:392.00,t:0,d:0.16,g:0.07},
     {f:523.25,t:0.08,d:0.18,g:0.08},
     {f:659.25,t:0.16,d:0.20,g:0.08},
     {f:783.99,t:0.24,d:0.22,g:0.09},
     {f:1046.50,t:0.32,d:0.48,g:0.10}
    ];
    fanfare.forEach(n=>playPureTone(n.f,now+n.t,n.d,n.g));
   }else if(typeof customFreq==='number'){
    playPureTone(customFreq,now,0.22,0.08);
   }else{
    const curStreak=state.streak||1;
    if(curStreak<=1){
     playPureTone(523.25,now,0.22,0.08);
    }else if(curStreak===2){
     playPureTone(659.25,now,0.24,0.085);
    }else if(curStreak===3){
     playPureTone(783.99,now,0.26,0.09);
    }else{
     playPureTone(523.25,now,0.14,0.05);
     playPureTone(659.25,now+0.05,0.15,0.06);
     playPureTone(783.99,now+0.10,0.17,0.07);
     playPureTone(1046.50,now+0.15,0.36,0.095);
    }
   }
  }else{
   const osc=audioCtx.createOscillator();
   const gain=audioCtx.createGain();
   osc.type='sine';
   osc.frequency.setValueAtTime(260,now);
   osc.frequency.exponentialRampToValueAtTime(185,now+0.18);
   gain.gain.setValueAtTime(0.0001,now);
   gain.gain.exponentialRampToValueAtTime(0.045,now+0.03);
   gain.gain.exponentialRampToValueAtTime(0.0001,now+0.20);
   osc.connect(gain);
   gain.connect(audioCtx.destination);
   osc.start(now);
   osc.stop(now+0.22);
  }
 }catch{}
}
let speechSessionToken = 0;
let activeCycleUtterances = [];
let currentSpeakingContext = null;

function stopSpeech(){
 speechSessionToken++;
 speechTimers.forEach(clearTimeout);
 speechTimers = [];
 try {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
 } catch {}
 try {
  if (window.stopGeminiAudio) window.stopGeminiAudio();
 } catch {}
 activeCycleUtterances = [];
 currentSpeakingContext = null;
 clearCycleHighlights(document);
}

function getNumberCycles(n){
 if(n===0){
  return [{
   cls:'ones',
   label:'دورة الآحاد',
   text:'صفر',
   spokenText:'صفر',
   freq:440,
   places:[0,1,2]
  }];
 }

 const b = Math.floor(n / 1e9);
 const m = Math.floor(n / 1e6) % 1e3;
 const k = Math.floor(n / 1e3) % 1e3;
 const o = n % 1000;

 const rawCycles = [];
 if(b > 0){
  rawCycles.push({
   cls:'billions',
   label:'دورة المليارات',
   text:groupWords(b, 'مليار', 'ملياران', 'مليارات'),
   freq:780,
   places:[9,10,11]
  });
 }
 if(m > 0){
  rawCycles.push({
   cls:'millions',
   label:'دورة الملايين',
   text:groupWords(m, 'مليون', 'مليونان', 'ملايين'),
   freq:660,
   places:[6,7,8]
  });
 }
 if(k > 0){
  rawCycles.push({
   cls:'thousands',
   label:'دورة الألوف',
   text:groupWords(k, 'ألف', 'ألفان', 'آلاف'),
   freq:540,
   places:[3,4,5]
  });
 }
 if(o > 0){
  rawCycles.push({
   cls:'ones',
   label:'دورة الآحاد',
   text:below1000(o),
   freq:440,
   places:[0,1,2]
  });
 }

 return rawCycles.map((c, idx) => ({
  ...c,
  spokenText: idx > 0 ? ('و' + c.text) : c.text
 }));
}

function clearCycleHighlights(scope){
 const root = scope || document;
 root.querySelectorAll('.cycle-speaking, .digit-speaking').forEach(el => {
  el.classList.remove('cycle-speaking', 'digit-speaking');
 });
 root.querySelectorAll('.color-coded-box').forEach(box => {
  box.removeAttribute('data-speaking-cycle');
 });
 if (root !== document) {
  document.querySelectorAll('.cycle-speaking, .digit-speaking').forEach(el => {
   el.classList.remove('cycle-speaking', 'digit-speaking');
  });
  document.querySelectorAll('.color-coded-box').forEach(box => {
   box.removeAttribute('data-speaking-cycle');
  });
 }
}

function highlightCycle(scope, part){
 const root = scope || document;
 const targets = root.querySelectorAll(
  '.cycle.' + part.cls + ', ' +
  '.play-cycle.' + part.cls + ', ' +
  '.strip-cycle.' + part.cls + ', ' +
  '.wheel-group.' + part.cls
 );
 targets.forEach(el => el.classList.add('cycle-speaking'));
 root.querySelectorAll('.color-coded-box').forEach(box => {
  box.setAttribute('data-speaking-cycle', part.cls);
 });

 if (root.querySelector('.wheels')) {
  const wIdx = part.cls === 'millions' ? 1 : part.cls === 'thousands' ? 2 : part.cls === 'ones' ? 3 : 0;
  if (wIdx > 0) {
   root.querySelectorAll('.wheel-group:nth-child(' + wIdx + ')').forEach(el => el.classList.add('cycle-speaking'));
  }
 }

 if (part.places && part.places.length) {
  part.places.forEach(p => {
   root.querySelectorAll('.digit-span[data-place="' + p + '"], .play-cell[data-p="' + p + '"]').forEach(el => {
    el.classList.add('cycle-speaking', 'digit-speaking');
   });
  });
 }
}

function speakNumber(n, contextRoot){
 if (currentSpeakingContext && currentSpeakingContext.n === n && currentSpeakingContext.active) {
  stopSpeech();
  return;
 }

 stopSpeech();
 const sessionToken = ++speechSessionToken;
 const scope = contextRoot || document;
 const fullWords = words(n);
 const parts = getNumberCycles(n);
 if (!parts || !parts.length) return;

 currentSpeakingContext = { n, active: true, sessionToken };

 if (state.muted || !('speechSynthesis' in window)) {
  if (state.muted) {
   guide('الصوت مكتوم الآن. اضغط زر الصوت أعلى الصفحة لتشغيله.', 3200);
  }
  let mIdx = 0;
  function stepMuted() {
   if (sessionToken !== speechSessionToken) return;
   if (mIdx >= parts.length) {
    clearCycleHighlights(scope);
    currentSpeakingContext = null;
    return;
   }
   const part = parts[mIdx];
   clearCycleHighlights(scope);
   highlightCycle(scope, part);
   guide(part.label + ': «' + part.text + '»  ·  القراءة الكاملة: ' + fullWords, 5000);
   mIdx++;
   const delay = Math.max(1200, Math.min(2600, part.text.length * 85));
   speechTimers.push(setTimeout(stepMuted, delay));
  }
  stepMuted();
  return;
 }

 // True Speech-Event-Driven Sequence (Web Speech API)
 let currentCycleIdx = 0;

 function speakNextCycle() {
  if (sessionToken !== speechSessionToken) return;

  if (currentCycleIdx >= parts.length) {
   clearCycleHighlights(scope);
   currentSpeakingContext = null;
   return;
  }

  const part = parts[currentCycleIdx];
  const phrase = part.spokenText;

  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = 'ar-SA';
  u.rate = state.speechRate || 0.95;

  const voices = window.speechSynthesis.getVoices?.() || [];
  const arVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
  if (arVoice) u.voice = arVoice;

  let started = false;
  let ended = false;
  let watchdog = null;

  const onCycleStart = () => {
   if (sessionToken !== speechSessionToken || started) return;
   started = true;
   if (watchdog) { clearTimeout(watchdog); watchdog = null; }
   clearCycleHighlights(scope);
   highlightCycle(scope, part);
   sound(true, part.freq);
   guide(part.label + ': «' + part.text + '»  ·  القراءة الكاملة: ' + fullWords, 6500);
  };

  const onCycleEnd = () => {
   if (sessionToken !== speechSessionToken || ended) return;
   ended = true;
   if (watchdog) { clearTimeout(watchdog); watchdog = null; }
   clearCycleHighlights(scope);
   currentCycleIdx++;
   speakNextCycle();
  };

  u.onstart = onCycleStart;
  u.onend = onCycleEnd;
  u.onerror = (e) => {
   if (sessionToken !== speechSessionToken || ended) return;
   if (watchdog) { clearTimeout(watchdog); watchdog = null; }
   ended = true;
   clearCycleHighlights(scope);
   if (e && (e.error === 'canceled' || e.error === 'interrupted')) {
    currentSpeakingContext = null;
    return;
   }
   currentCycleIdx++;
   speakNextCycle();
  };

  watchdog = setTimeout(() => {
   if (!started && sessionToken === speechSessionToken) {
    onCycleStart();
   }
  }, 1500);
  speechTimers.push(watchdog);

  activeCycleUtterances.push(u);
  window.speechSynthesis.speak(u);
 }

 speakNextCycle();
}

function triggerVisualSweep(container,n,targetPlace){
 if(!container||targetPlace===undefined||targetPlace===null||targetPlace<0)return;
 const digits=container.querySelectorAll('.digit-span[data-place]');
 if(!digits.length)return;
 container.querySelectorAll('.sweep-active').forEach(el=>el.classList.remove('sweep-active'));
 container.querySelectorAll('.sweep-badge-chip').forEach(el=>el.remove());
 const oldBar=container.querySelector('.sweep-counter-bar');
 if(oldBar)oldBar.remove();
 const rightDigits=[];
 digits.forEach(span=>{const pl=Number(span.dataset.place);if(pl<targetPlace)rightDigits.push(span);});
 if(!rightDigits.length)return;
 rightDigits.sort((a,b)=>Number(b.dataset.place)-Number(a.dataset.place));
 const totalZeros=rightDigits.length;
 const digitVal=digit(n,targetPlace);
 const correctVal=digitVal*10**targetPlace;
 const counterBar=document.createElement('div');
 counterBar.className='sweep-counter-bar';
 counterBar.setAttribute('role','status');
 counterBar.setAttribute('aria-live','polite');
 counterBar.innerHTML='<span class="sweep-pill-target">الرقم '+digitVal+'</span>'
  +'<span class="sweep-arrow-svg">←</span>'
  +'<span class="sweep-pill-count">'+ar(totalZeros)+' منازل على يمينه</span>'
  +'<span class="sweep-arrow-svg">=</span>'
  +'<span class="sweep-pill-zeros">'+ar(totalZeros)+' أصفار ← <bdi class="num">'+fmt(correctVal)+'</bdi></span>';
 rightDigits.forEach((span,idx)=>{
  const order=idx+1;
  span.style.setProperty('--sweep-delay',(idx*0.14)+'s');
  span.classList.add('sweep-active');
  const chip=document.createElement('span');
  chip.className='sweep-badge-chip';
  chip.textContent=ar(order);
  chip.setAttribute('aria-hidden','true');
  chip.style.animationDelay=(idx*0.14)+'s';
  span.append(chip);
 });
 const bigNumBar=container.querySelector('.big-number-bar')||container.querySelector('.big-number');
 if(bigNumBar)bigNumBar.after(counterBar);
 else container.prepend(counterBar);
}
function triggerDualHighlight(container,chosenEl,targetEl,chosenPlace,targetPlace,n){
 if(container){
  container.querySelectorAll('.mismatch-chosen, .mismatch-target').forEach(el=>{
   el.classList.remove('mismatch-chosen','mismatch-target');
   el.querySelectorAll('.mismatch-tag-badge').forEach(b=>b.remove());
  });
 }
 if(chosenEl){
  chosenEl.classList.add('mismatch-chosen');
  const b=document.createElement('span');
  b.className='mismatch-tag-badge badge-chosen';
  b.setAttribute('aria-hidden','true');
  b.textContent='ما اخترته';
  chosenEl.append(b);
 }
 const d=stepData();
 if(targetEl && d.hintTier>=3){
  targetEl.classList.add('mismatch-target');
  const b=document.createElement('span');
  b.className='mismatch-tag-badge badge-target';
  b.setAttribute('aria-hidden','true');
  b.textContent='المطلوب';
  targetEl.append(b);
  markStepAssisted('dual_highlight_target_badge');
 }
 if(container&&n!==undefined&&targetPlace!==undefined&&d.hintTier>=3)triggerVisualSweep(container,n,targetPlace);
}
function renderMismatchFeedbackHTML(reason,analysis){
 if(!analysis)return 'حاول من جديد. '+esc(reason);
 const obs=analysis.directObservation||(analysis.chosenVal!==undefined?'اخترت '+(analysis.chosenLabel||fmt(analysis.chosenVal))+' ('+(analysis.chosenPlaceName||'')+' بـ '+ar(analysis.chosenZeros||0)+' أصفار).':'');
 const comp=analysis.visualComparison||(analysis.targetZeros!==undefined?('انظر إلى العدد: يوجد '+ar(analysis.targetZeros)+' منازل على يمين الرقم.'):'');
 const guid=analysis.guidance||(analysis.targetVal!==undefined?('إذن المنزلة الصحيحة هي '+(analysis.targetPlaceName||'')+' بقيمة '+(analysis.targetLabel||fmt(analysis.targetVal))+'.'):'');
 const chosenPills=Array.from({length:Math.min(9,analysis.chosenZeros||0)},()=>'<span class="zero-dot">0</span>').join('');
 const targetPills=Array.from({length:Math.min(9,analysis.targetZeros||0)},()=>'<span class="zero-dot">0</span>').join('');
 return '<div class="mismatch-feedback" role="alert">'
  +'<div class="mismatch-header">'
  +'<span class="mismatch-ico" aria-hidden="true">'+getIconSVG('lightbulb')+'</span>'
  +'<strong>توجيه ذكي: قارِن بين المنزلتين</strong>'
  +'</div>'
  +'<p class="mismatch-formula">'
  +'<span class="mf-part mf-observation">'+esc(obs)+'</span> '
  +'<span class="mf-part mf-contrast">'+esc(comp)+'</span> '
  +'<span class="mf-part mf-guidance">'+esc(guid)+'</span>'
  +'</p>'
  +'<div class="contrast-grid" aria-hidden="true">'
  +'<div class="contrast-box chosen-box">'
  +'<span class="c-tag">ما اخترته</span>'
  +'<div class="c-val num"><bdi>'+esc(analysis.chosenLabel||(analysis.chosenVal!==undefined?fmt(analysis.chosenVal):''))+'</bdi></div>'
  +'<div class="c-meta">'+esc(analysis.chosenPlaceName||'')+(analysis.chosenZeros!==undefined?' · '+ar(analysis.chosenZeros)+' أصفار':'')+'</div>'
  +'<div class="c-zeros-row">'+(chosenPills||'<span class="zero-none">بلا أصفار</span>')+'</div>'
  +'</div>'
  +'<div class="contrast-vs">مقابل</div>'
  +'<div class="contrast-box target-box">'
  +'<span class="c-tag">المنزلة الصحيحة</span>'
  +'<div class="c-val num"><bdi>'+esc(analysis.targetLabel||(analysis.targetVal!==undefined?fmt(analysis.targetVal):''))+'</bdi></div>'
  +'<div class="c-meta">'+esc(analysis.targetPlaceName||'')+(analysis.targetZeros!==undefined?' · '+ar(analysis.targetZeros)+' أصفار':'')+'</div>'
  +'<div class="c-zeros-row">'+(targetPills||'<span class="zero-none">بلا أصفار</span>')+'</div>'
  +'</div>'
  +'</div>'
  +'</div>';
}
function bigNumberHTML(n,p){return '<div class="big-number-bar"><div class="big-number">'+(p!==undefined?marked(n,p):marked(n,-1))+'</div><button type="button" class="speak-inline" data-speak-n="'+n+'" aria-label="استمع لقراءة العدد '+fmt(n)+'"><span class="btn-svg">'+getIconSVG('volume')+'</span><span>اقرأ العدد</span></button></div>';}
function bindSpeakButtons(root){root.querySelectorAll('[data-speak-n]').forEach(b=>{b.onclick=()=>speakNumber(Number(b.dataset.speakN),root);});}

