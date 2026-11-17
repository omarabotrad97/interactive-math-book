/* Core DOM, Formatting, Arabic Words, Color-Coding & SVG Utilities */
// One controller per stable root. Dynamic tools replace on* handlers; permanent
// tools use addEventListener and expose the same cancel/dispose lifecycle.
const touchControllers = new Map();
function touchDigits(root, onChange, keep = false) {
  touchControllers.get(root)?.dispose();
  let gesture = null, pointerClickUntil = 0;
  const handlers = {};
  const find = key => [...root.querySelectorAll('.spin')].find(el => el.dataset.spinKey === key);
  const enabled = el => el && el.getAttribute('aria-disabled') !== 'true';
  const target = event => {
    const el = event.target instanceof Element ? event.target.closest('.spin') : null;
    return el && root.contains(el) && enabled(el) ? el : null;
  };
  let lastTickVibrate = 0;
  function pulseTickHaptic() {
    const now = performance.now();
    if (now - lastTickVibrate < 26) return;
    lastTickVibrate = now;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(12);
    } catch {}
  }
  function change(key, steps) {
    const el = find(key);
    if (!enabled(el)) return;
    const prevVal = el.getAttribute('aria-valuenow');
    onChange(el, steps);
    // The callback may replace the digit, but never this root.
    const updated = find(key);
    if (steps !== 0 && updated && updated.getAttribute('aria-valuenow') !== prevVal) {
      pulseTickHaptic();
      updated.dataset.tick = updated.dataset.tick === '1' ? '2' : '1';
    }
    if (gesture?.key === key && updated) {
      updated.classList.add('dragging');
      root.querySelectorAll('.play-cycle.is-dragging-cycle').forEach(c => c.classList.remove('is-dragging-cycle'));
      const cyc = updated.closest('.play-cycle');
      if (cyc) cyc.classList.add('is-dragging-cycle');
    }
  }
  function cancel() {
    const previous = gesture;
    gesture = null;
    root.querySelectorAll('.spin.dragging').forEach(el => el.classList.remove('dragging'));
    root.querySelectorAll('.play-cycle.is-dragging-cycle').forEach(c => c.classList.remove('is-dragging-cycle'));
    if (previous && root.hasPointerCapture(previous.pointerId)) root.releasePointerCapture(previous.pointerId);
  }
  handlers.pointerdown = event => {
    const el = target(event);
    if (!el || gesture || event.isPrimary === false || event.button !== 0) return;
    event.preventDefault();
    gesture = {key:el.dataset.spinKey, pointerId:event.pointerId, x:event.clientX, y:event.clientY,
      lastY:event.clientY, carry:0, travelled:0, changed:false, started:performance.now()};
    root.setPointerCapture(event.pointerId);
    el.focus({preventScroll:true});
    change(gesture.key, 0);
  };
  handlers.pointermove = event => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    gesture.travelled = Math.max(gesture.travelled, Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y));
    gesture.carry += gesture.lastY-event.clientY;
    gesture.lastY = event.clientY;
    // Mobile input coordinates can differ by a fraction of a pixel after scale conversion.
    const steps = Math.trunc((gesture.carry+Math.sign(gesture.carry)*0.01)/16);
    if (steps) {
      gesture.carry -= steps*16;
      gesture.changed = true;
      change(gesture.key, steps);
    }
  };
  handlers.pointerup = event => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    handlers.pointermove(event);
    const tap = !gesture.changed && gesture.travelled < 8 && performance.now()-gesture.started < 450;
    if (tap) change(gesture.key, 1);
    pointerClickUntil = performance.now()+700;
    cancel();
  };
  handlers.pointercancel = event => { if (gesture?.pointerId === event.pointerId) cancel(); };
  handlers.lostpointercapture = event => { if (gesture?.pointerId === event.pointerId) cancel(); };
  handlers.wheel = event => {
    const el = target(event);
    if (!el || event.ctrlKey || event.deltaY === 0 || gesture) return;
    event.preventDefault();
    el.focus({preventScroll:true});
    change(el.dataset.spinKey, -Math.sign(event.deltaY));
  };
  handlers.keydown = event => {
    const el = target(event);
    if (!el) return;
    let steps;
    if (['ArrowUp','ArrowRight','Enter',' '].includes(event.key)) steps=1;
    else if (['ArrowDown','ArrowLeft'].includes(event.key)) steps=-1;
    else if (event.key==='Home') steps=Number(el.getAttribute('aria-valuemin'))-Number(el.getAttribute('aria-valuenow'));
    else if (event.key==='End') steps=Number(el.getAttribute('aria-valuemax'))-Number(el.getAttribute('aria-valuenow'));
    else return;
    event.preventDefault();
    change(el.dataset.spinKey,steps);
  };
  handlers.click = event => {
    const el=target(event);
    if (!el) return;
    // Pointer taps are handled on pointerup. Only assistive/synthetic clicks
    // without a preceding pointer gesture need this fallback.
    event.preventDefault();
    if (event.detail===0 || performance.now()>pointerClickUntil) change(el.dataset.spinKey,1);
  };
  const options={passive:false};
  for (const [type,handler] of Object.entries(handlers)) {
    if (keep) root.addEventListener(type,handler,options);
    else root['on'+type]=handler;
  }
  const controller={cancel,dispose(){
    cancel();
    for(const [type,handler] of Object.entries(handlers)) {
      if(keep) root.removeEventListener(type,handler,options);
      else if(root['on'+type]===handler) root['on'+type]=null;
    }
    if(touchControllers.get(root)===controller) touchControllers.delete(root);
  }};
  touchControllers.set(root,controller);
  return controller;
}
function cancelDigitGestures(){for(const controller of touchControllers.values())controller.cancel();}
function spinAttributes(key,p,value,label,max=9){
  return 'class="spin" data-spin-key="'+key+'" data-p="'+p+'" role="spinbutton" tabindex="0" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+value+'" aria-label="'+label+'" aria-describedby="touch-instructions"';
}
function updateSpin(el,value,disabled=false){
  el.textContent=value;
  el.setAttribute('aria-valuenow',value);
  el.setAttribute('aria-disabled',String(disabled));
  el.tabIndex=disabled?-1:0;
}
function haptic(good){try{if(typeof navigator.vibrate==='function')navigator.vibrate(good?20:60);}catch{}}
const shakeTimers=new WeakMap();
function shakeElement(element){
  if(!element)return;
  clearTimeout(shakeTimers.get(element));element.classList.remove('shake');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  void element.offsetWidth;element.classList.add('shake');
  shakeTimers.set(element,setTimeout(()=>{element.classList.remove('shake');shakeTimers.delete(element);},360));
}

'use strict';
const $=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat('en-US').format(n),fmtYear=n=>new Intl.NumberFormat('en-US',{useGrouping:false}).format(Number(n)),ar=n=>new Intl.NumberFormat('en-US').format(n);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const places=['الآحاد','العشرات','المئات','آحاد الألوف','عشرات الألوف','مئات الألوف','آحاد الملايين','عشرات الملايين','مئات الملايين'];
const units=['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'],teens=['عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'],tens=['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'],hundreds=['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'];
function below100(n){if(n<10)return units[n];if(n<20)return teens[n-10];return[units[n%10],tens[Math.floor(n/10)]].filter(Boolean).join(' و');}
function below1000(n){return[hundreds[Math.floor(n/100)],below100(n%100)].filter(Boolean).join(' و');}
function groupWords(n,single,dual,plural){if(!n)return'';const h=Math.floor(n/100),r=n%100;if(!r)return(h===2?'مئتا':hundreds[h])+' '+single;const last=(!h&&r===1)?single:(!h&&r===2)?dual:below100(r)+' '+(r>=3&&r<=10?plural:single+'ًا');return[hundreds[h],last].filter(Boolean).join(' و');}
function words(n){if(n===0)return'صفر';const b=Math.floor(n/1e9),m=Math.floor(n/1e6)%1e3,k=Math.floor(n/1e3)%1e3,o=n%1000;return[groupWords(b,'مليار','ملياران','مليارات'),groupWords(m,'مليون','مليونان','ملايين'),groupWords(k,'ألف','ألفان','آلاف'),below1000(o)].filter(Boolean).join(' و');}

const teensOnes = ['','أحد','اثنا','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];

function buildCycleTokens(groupVal, cycleKey, cycleLabel, cycleStartPlace, isHighestCycle, cycleNames){
 if(groupVal === 0) return [];
 const h = Math.floor(groupVal / 100);
 const r = groupVal % 100;
 const t = Math.floor(r / 10);
 const u = r % 10;

 const pH = cycleStartPlace + 2;
 const pT = cycleStartPlace + 1;
 const pU = cycleStartPlace + 0;

 const tokens = [];
 const add = (text, type, place, digitVal) => {
  tokens.push({ text, type, place, digit: digitVal, cycleKey, cycleLabel });
 };
 const addSep = (sep = ' و') => {
  tokens.push({ text: sep, type: 'sep', place: null, digit: null, cycleKey, cycleLabel });
 };

 if(r === 0){
  const hText = (h === 2 && cycleNames) ? 'مئتا' : hundreds[h];
  add(hText, 'hundreds', pH, h);
  if(cycleNames){
   add(' ' + cycleNames.single, 'cycle_suffix', null, null);
  }
  return tokens;
 }

 if(h > 0){
  add(hundreds[h], 'hundreds', pH, h);
  addSep(' و');
 }

 if(!cycleNames){
  if(r < 10){
   add(units[r], 'ones', pU, r);
  } else if(r === 10){
   add('عشرة', 'tens', pT, 1);
  } else if(r < 20){
   const teenU = teensOnes[r - 10];
   add(teenU, 'compound_ones', pU, r - 10);
   add(' ', 'sep', null, null);
   add('عشر', 'compound_tens', pT, 1);
  } else {
   if(u === 0){
    add(tens[t], 'tens', pT, t);
   } else {
    add(units[u], 'ones', pU, u);
    addSep(' و');
    add(tens[t], 'tens', pT, t);
   }
  }
  return tokens;
 }

 if(r === 1){
  if(h > 0){
   add(units[1], 'ones', pU, 1);
   add(' ' + cycleNames.single + 'ًا', 'cycle_suffix', null, null);
  } else {
   add(cycleNames.single, 'ones', pU, 1);
  }
 } else if(r === 2){
  if(h > 0){
   add(units[2], 'ones', pU, 2);
   add(' ' + cycleNames.single + 'ًا', 'cycle_suffix', null, null);
  } else {
   add(cycleNames.dual, 'ones', pU, 2);
  }
 } else if(r <= 10){
  if(r === 10){
   add('عشرة', 'tens', pT, 1);
  } else {
   add(units[r], 'ones', pU, r);
  }
  add(' ' + (r >= 3 ? cycleNames.plural : (cycleNames.single + 'ًا')), 'cycle_suffix', null, null);
 } else if(r < 20){
  const teenU = teensOnes[r - 10];
  add(teenU, 'compound_ones', pU, r - 10);
  add(' ', 'sep', null, null);
  add('عشر', 'compound_tens', pT, 1);
  add(' ' + cycleNames.single + 'ًا', 'cycle_suffix', null, null);
 } else {
  if(u === 0){
   add(tens[t], 'tens', pT, t);
  } else {
   add(units[u], 'ones', pU, u);
   addSep(' و');
   add(tens[t], 'tens', pT, t);
  }
  add(' ' + cycleNames.single + 'ًا', 'cycle_suffix', null, null);
 }

 return tokens;
}

function parseNumberToAST(n){
 if(n === 0){
  return {
   n,
   cycles: [{
    key: 'ones',
    label: 'دورة الآحاد',
    val: 0,
    startPlace: 0,
    tokens: [{ text: 'صفر', type: 'ones', place: 0, digit: 0, cycleKey: 'ones', cycleLabel: 'دورة الآحاد' }]
   }],
   allTokens: [{ text: 'صفر', type: 'ones', place: 0, digit: 0, cycleKey: 'ones', cycleLabel: 'دورة الآحاد' }]
  };
 }

 const b = Math.floor(n / 1e9);
 const m = Math.floor(n / 1e6) % 1e3;
 const k = Math.floor(n / 1e3) % 1e3;
 const o = n % 1000;

 const cycleDefs = [
  { val: b, key: 'billions', label: 'دورة المليارات', start: 9, names: { single: 'مليار', dual: 'ملياران', plural: 'مليارات' } },
  { val: m, key: 'millions', label: 'دورة الملايين', start: 6, names: { single: 'مليون', dual: 'مليونان', plural: 'ملايين' } },
  { val: k, key: 'thousands', label: 'دورة الألوف', start: 3, names: { single: 'ألف', dual: 'ألفان', plural: 'آلاف' } },
  { val: o, key: 'ones', label: 'دورة الآحاد', start: 0, names: null }
 ];

 const activeCycles = cycleDefs.filter(c => c.val > 0);
 const allTokens = [];
 const cyclesResult = [];

 activeCycles.forEach((c, idx) => {
  const isFirst = idx === 0;
  const tokens = buildCycleTokens(c.val, c.key, c.label, c.start, isFirst, c.names);
  if(idx > 0){
   allTokens.push({ text: ' و', type: 'cycle_sep', place: null, digit: null, cycleKey: null });
  }
  allTokens.push(...tokens);
  cyclesResult.push({
   key: c.key,
   label: c.label,
   val: c.val,
   startPlace: c.start,
   tokens
  });
 });

 return { n, cycles: cyclesResult, allTokens };
}

function getCycleKeyForPlace(place){
 if(place >= 9) return 'billions';
 if(place >= 6) return 'millions';
 if(place >= 3) return 'thousands';
 return 'ones';
}

function renderColorCodedNumberBlock(n, container, defaultMode = 'cycle', options = {}){
 if(!container) return null;
 const { selectedPlace, onSelectPlace } = options;
 const ast = parseNumberToAST(n);
 const numStr = String(n);
 const len = numStr.length;

 const box = document.createElement('div');
 box.className = 'color-coded-box mode-' + defaultMode;
 box.dataset.colorMode = defaultMode;
 box.dataset.number = String(n);

 const toolbar = document.createElement('div');
 toolbar.className = 'color-coded-toolbar';

 const pills = document.createElement('div');
 pills.className = 'color-mode-pills';
 pills.setAttribute('role', 'radiogroup');
 pills.setAttribute('aria-label', 'مستوى تلوين القيمة المنزلية');

 const pillCycle = document.createElement('button');
 pillCycle.type = 'button';
 pillCycle.className = 'color-mode-pill' + (defaultMode === 'cycle' ? ' active' : '');
 pillCycle.dataset.mode = 'cycle';
 pillCycle.setAttribute('role', 'radio');
 pillCycle.setAttribute('aria-checked', String(defaultMode === 'cycle'));
 pillCycle.innerHTML = '<span>تلوين الدورات</span>';

 const pillPlace = document.createElement('button');
 pillPlace.type = 'button';
 pillPlace.className = 'color-mode-pill' + (defaultMode === 'place' ? ' active' : '');
 pillPlace.dataset.mode = 'place';
 pillPlace.setAttribute('role', 'radio');
 pillPlace.setAttribute('aria-checked', String(defaultMode === 'place'));
 pillPlace.innerHTML = '<span>تلوين المنازل</span>';

 pills.append(pillCycle, pillPlace);

 const speakBtn = document.createElement('button');
 speakBtn.type = 'button';
 speakBtn.className = 'color-speak-trigger';
 speakBtn.setAttribute('aria-label', 'استمع لنطق العدد بالتلوين');
 speakBtn.innerHTML = '<span class="btn-svg">' + getIconSVG('volume') + '</span><span>اقرأ بالتلوين</span>';

 toolbar.append(pills, speakBtn);
 box.append(toolbar);

 const legend = document.createElement('div');
 legend.className = 'color-place-legend';
 legend.setAttribute('role', 'toolbar');
 legend.setAttribute('aria-label', 'دليل ألوان المنازل');

 const legendItems = [
  { cat: '2', label: 'المئات', cls: 'place-hundreds' },
  { cat: '1', label: 'العشرات', cls: 'place-tens' },
  { cat: '0', label: 'الآحاد', cls: 'place-ones' }
 ];
 legendItems.forEach(item => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'place-legend-item ' + item.cls;
  btn.dataset.category = item.cat;
  btn.title = 'تحديد كل أرقام وكلمات ' + item.label;
  btn.innerHTML = '<span class="legend-swatch"></span><span>' + item.label + '</span>';
  legend.append(btn);
 });
 box.append(legend);

 const zeroNotice = document.createElement('div');
 zeroNotice.className = 'color-zero-notice';
 zeroNotice.style.display = 'none';
 box.append(zeroNotice);

 const digitsStrip = document.createElement('div');
 digitsStrip.className = 'color-digits-strip';
 digitsStrip.dir = 'ltr';
 digitsStrip.setAttribute('aria-label', 'العدد بالأرقام');

 let currentDigitGroup = null;
 let currentDigitCycle = null;

 for(let i = 0; i < len; i++){
  const dChar = numStr[i];
  const place = len - 1 - i;
  const cycleKey = getCycleKeyForPlace(place);
  const placeInCycle = place % 3;
  const placeCls = placeInCycle === 2 ? 'place-hundreds' : placeInCycle === 1 ? 'place-tens' : 'place-ones';
  const pName = places[place] || ('منزلة ' + place);

  if(!currentDigitGroup || currentDigitCycle !== cycleKey){
   currentDigitGroup = document.createElement('span');
   currentDigitGroup.className = 'c-cycle-group c-cycle-digits cycle-' + cycleKey;
   currentDigitGroup.dataset.cycleGroup = cycleKey;
   digitsStrip.append(currentDigitGroup);
   currentDigitCycle = cycleKey;
  }

  const dSpan = document.createElement('span');
  dSpan.className = 'c-digit cycle-' + cycleKey + ' ' + placeCls;
  dSpan.dataset.cycle = cycleKey;
  dSpan.dataset.place = String(place);
  dSpan.dataset.placeCategory = String(placeInCycle);
  dSpan.dataset.digit = dChar;
  dSpan.textContent = dChar;
  dSpan.tabIndex = 0;
  dSpan.setAttribute('role', 'button');
  dSpan.setAttribute('aria-label', 'الرقم ' + dChar + ' في ' + pName);
  dSpan.title = 'الرقم ' + dChar + ' في ' + pName;
  currentDigitGroup.append(dSpan);

  if(place > 0 && place % 3 === 0){
   const sep = document.createElement('span');
   sep.className = 'c-digit-sep';
   sep.textContent = ',';
   digitsStrip.append(sep);
   currentDigitGroup = null;
   currentDigitCycle = null;
  }
 }
 box.append(digitsStrip);

 const wordsStrip = document.createElement('div');
 wordsStrip.className = 'color-words-strip';
 wordsStrip.dir = 'rtl';
 wordsStrip.setAttribute('aria-label', 'العدد بالكلمات');

 ast.cycles.forEach((cycle, cIdx) => {
  if(cIdx > 0){
   const conjSpan = document.createElement('span');
   conjSpan.className = 'c-word-sep c-cycle-conj';
   conjSpan.textContent = 'و';
   wordsStrip.append(conjSpan);
  }

  const cycleGroup = document.createElement('span');
  cycleGroup.className = 'c-cycle-group c-cycle-words cycle-' + cycle.key;
  cycleGroup.dataset.cycleGroup = cycle.key;

  let pendingSep = null;
  cycle.tokens.forEach(t => {
   if(t.type === 'sep' || t.type === 'cycle_sep'){
    pendingSep = t.text;
    return;
   }
   const placeInCycle = t.place !== null ? (t.place % 3) : null;
   const placeCls = placeInCycle === 2 ? 'place-hundreds' : placeInCycle === 1 ? 'place-tens' : placeInCycle === 0 ? 'place-ones' : '';
   const wSpan = document.createElement('span');
   wSpan.className = 'c-word cycle-' + t.cycleKey + (placeCls ? (' ' + placeCls) : '');
   if(t.cycleKey) wSpan.dataset.cycle = t.cycleKey;
   if(t.place !== null){
    wSpan.dataset.place = String(t.place);
    wSpan.dataset.placeCategory = String(placeInCycle);
   }
   if(t.digit !== null) wSpan.dataset.digit = String(t.digit);
   wSpan.textContent = t.text.trim();
   wSpan.tabIndex = 0;
   wSpan.setAttribute('role', 'button');
   const targetLabel = t.place !== null ? (places[t.place] || ('منزلة ' + t.place)) : (t.cycleLabel || '');
   wSpan.setAttribute('aria-label', t.text.trim() + (targetLabel ? (' · ' + targetLabel) : ''));

   if(pendingSep && pendingSep.trim() === 'و'){
    const group = document.createElement('span');
    group.className = 'c-word-group';
    const sepSpan = document.createElement('span');
    sepSpan.className = 'c-word-sep';
    sepSpan.textContent = 'و';
    group.append(sepSpan, wSpan);
    cycleGroup.append(group);
    pendingSep = null;
   } else {
    if(pendingSep && pendingSep.trim()){
     const sepSpan = document.createElement('span');
     sepSpan.className = 'c-word-sep';
     sepSpan.textContent = pendingSep.trim();
     cycleGroup.append(sepSpan);
     pendingSep = null;
    }
    cycleGroup.append(wSpan);
   }
  });
  wordsStrip.append(cycleGroup);
 });
 box.append(wordsStrip);

 const setMode = (mode) => {
  box.className = 'color-coded-box mode-' + mode;
  box.dataset.colorMode = mode;
  pillCycle.classList.toggle('active', mode === 'cycle');
  pillCycle.setAttribute('aria-checked', String(mode === 'cycle'));
  pillPlace.classList.toggle('active', mode === 'place');
  pillPlace.setAttribute('aria-checked', String(mode === 'place'));
  const playDigits = document.getElementById('play-digits');
  if(playDigits) playDigits.classList.toggle('mode-place', mode === 'place');
  clearHover();
  if(selectedPlace !== undefined && selectedPlace !== null){
   const selP = Number(selectedPlace);
   box.classList.add('is-hovering');
   if(mode === 'place'){
    box.dataset.hoverPlace = String(selP);
    checkZeroNotice(selP, digit(n, selP));
   } else {
    box.dataset.hoverCycle = getCycleKeyForPlace(selP);
   }
  }
 };

 pillCycle.addEventListener('click', () => setMode('cycle'));
 pillPlace.addEventListener('click', () => setMode('place'));

 speakBtn.addEventListener('click', () => {
  speakNumber(n, box);
 });

 const clearHover = () => {
  box.classList.remove('is-hovering');
  delete box.dataset.hoverCycle;
  delete box.dataset.hoverPlace;
  delete box.dataset.hoverCategory;
  legend.querySelectorAll('.place-legend-item').forEach(b => b.classList.remove('active'));
  zeroNotice.style.display = 'none';
 };

 const checkZeroNotice = (p, dVal) => {
  if(dVal === 0 || dVal === '0'){
   const pName = places[p] || ('منزلة ' + p);
   zeroNotice.textContent = 'الرقم 0 في ' + pName + ' يحفظ المنزلة (قيمته 0 ولا يُلفظ بمفرده)';
   zeroNotice.style.display = 'block';
  } else {
   zeroNotice.style.display = 'none';
  }
 };

 const applyHover = (el) => {
  const mode = box.dataset.colorMode || 'cycle';
  box.classList.add('is-hovering');
  delete box.dataset.hoverCategory;
  legend.querySelectorAll('.place-legend-item').forEach(b => b.classList.remove('active'));

  if(mode === 'cycle'){
   if(el.dataset.cycle){
    box.dataset.hoverCycle = el.dataset.cycle;
   }
  } else {
   if(el.dataset.place !== undefined){
    box.dataset.hoverPlace = el.dataset.place;
    const p = Number(el.dataset.place);
    const dVal = el.dataset.digit !== undefined ? Number(el.dataset.digit) : digit(n, p);
    checkZeroNotice(p, dVal);
   } else if(el.dataset.cycle){
    box.dataset.hoverCycle = el.dataset.cycle;
   }
  }
 };

 legend.querySelectorAll('.place-legend-item').forEach(btn => {
  btn.addEventListener('click', () => {
   const cat = btn.dataset.category;
   if(box.dataset.hoverCategory === cat){
    clearHover();
   } else {
    clearHover();
    box.classList.add('is-hovering');
    box.dataset.hoverCategory = cat;
    btn.classList.add('active');
    const catName = cat === '2' ? 'المئات' : cat === '1' ? 'العشرات' : 'الآحاد';
    zeroNotice.textContent = 'تم تمييز منازل ' + catName + ' عبر جميع دورات العدد';
    zeroNotice.style.display = 'block';
   }
  });
 });

 const toggleSelect = (el) => {
  const mode = box.dataset.colorMode || 'cycle';
  const currentCycle = box.dataset.hoverCycle;
  const currentPlace = box.dataset.hoverPlace;
  if((mode === 'cycle' && currentCycle === el.dataset.cycle) ||
     (mode === 'place' && el.dataset.place !== undefined && currentPlace === el.dataset.place) ||
     (mode === 'place' && el.dataset.place === undefined && currentCycle === el.dataset.cycle)){
   clearHover();
  } else {
   applyHover(el);
   if(el.dataset.place !== undefined && typeof onSelectPlace === 'function'){
    onSelectPlace(Number(el.dataset.place));
   }
  }
 };

 if(selectedPlace !== undefined && selectedPlace !== null){
  const selP = Number(selectedPlace);
  box.classList.add('is-hovering');
  if(defaultMode === 'place'){
   box.dataset.hoverPlace = String(selP);
   checkZeroNotice(selP, digit(n, selP));
  } else {
   box.dataset.hoverCycle = getCycleKeyForPlace(selP);
  }
 }

 const interactiveElements = box.querySelectorAll('.c-digit, .c-word');
 interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => applyHover(el));
  el.addEventListener('mouseleave', clearHover);
  el.addEventListener('focus', () => applyHover(el));
  el.addEventListener('blur', clearHover);
  el.addEventListener('keydown', (e) => {
   if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault();
    toggleSelect(el);
   }
  });
  el.addEventListener('pointerdown', (e) => {
   toggleSelect(el);
   e.stopPropagation();
  });
 });

 if(!window.__colorBoxDocBound){
  window.__colorBoxDocBound = true;
  window.__activeColorBoxes = window.__activeColorBoxes || [];
  document.addEventListener('pointerdown', (e) => {
   if(e.target.closest('#play-digits, .wheel-group, .touch-results, #wheel-monitor')) return;
   window.__activeColorBoxes = window.__activeColorBoxes.filter(entry => {
    if(!entry.box.isConnected) return false;
    if(!entry.box.contains(e.target)) entry.clearHover();
    return true;
   });
  });
 }
 window.__activeColorBoxes = window.__activeColorBoxes.filter(entry => entry.box.isConnected && entry.box !== box);
 window.__activeColorBoxes.push({ box, clearHover });

 container.replaceChildren(box);
 return box;
}

function digit(n,p){return Math.floor(n/10**p)%10;}
function expansion(n){const result=[];for(let p=8;p>=0;p--)if(digit(n,p))result.push({p,value:digit(n,p)*10**p});return result;}
function parseNum(raw){const s=raw.trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));if(!/^(?:[0-9]+|[0-9]{1,3}(?:[,٬ ][0-9]{3})+)$/.test(s))return null;const n=Number(s.replace(/[,٬ ]/g,''));return Number.isSafeInteger(n)&&n>=0&&n<=999999999999?n:null;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function marked(n,p){let idx=-1;const s=String(n),len=s.length;return fmt(n).split('').map(c=>{if(/\d/.test(c)){idx++;const pos=len-1-idx;const isTarget=p!==undefined&&p!==null&&pos===p;return '<span class="digit-span'+(isTarget?' highlight target-digit':'')+'" data-place="'+pos+'">'+c+'</span>';}return '<span class="sep-span">'+c+'</span>';}).join('');}
function distort3Digits(num){if(num<10)return num===9?8:num+1;if(num<100){const t=Math.floor(num/10),u=num%10;if(t!==u)return u*10+t;return num>50?num-10:num+10;}const h=Math.floor(num/100),rem=num%100,t=Math.floor(rem/10),u=rem%10;if(t!==u)return h*100+u*10+t;return h*100+(t>5?(t-1)*10:(t+1)*10)+u;}
function getPeriodParts(n){const m=Math.floor(n/1e6),k=Math.floor(n/1e3)%1000,o=n%1000,parts=[];if(m>0){const mWord=groupWords(m,'مليون','مليونان','ملايين'),d1=groupWords(distort3Digits(m),'مليون','مليونان','ملايين'),d2=groupWords(m,'ألف','ألفان','آلاف');parts.push({periodKey:'millions',periodName:'دورة الملايين',value:m,text:mWord,distractors:[d1!==mWord?d1:mWord+' وثلاثة',d2]});}if(k>0){const prefix=parts.length>0?'و':'',kWord=prefix+groupWords(k,'ألف','ألفان','آلاف'),d1=prefix+groupWords(distort3Digits(k),'ألف','ألفان','آلاف'),d2=prefix+below1000(k);parts.push({periodKey:'thousands',periodName:'دورة الألوف',value:k,text:kWord,distractors:[d1!==kWord?d1:kWord+' ومئة',d2]});}if(o>0){const prefix=parts.length>0?'و':'',oWord=prefix+below1000(o),d1=prefix+below1000(distort3Digits(o)),d2=prefix+groupWords(o,'ألف','ألفان','آلاف');parts.push({periodKey:'ones',periodName:'دورة الآحاد',value:o,text:oWord,distractors:[d1!==oWord?d1:oWord+' وخمسة',d2]});}return parts;}
function termHTML(n){return expansion(n).map((t,i)=>'<span class="'+(t.p>=6?'million-term':t.p>=3?'thousand-term':'')+'" style="--delay:'+i*.15+'s">'+fmt(t.value)+'</span>').join('<b aria-hidden="true">+</b>');}
const mc=(prompt,options,correct,reason,extra={})=>({type:'choice',prompt,options,correct,reason,...extra});
const verbal=(n,source)=>({type:'verbal',n,source,prompt:'كوّن الصيغة اللفظية للعدد باختيار بطاقات الدورات بالترتيب.',hint:'اقرأ دورة الملايين أولًا من اليسار، ثم دورة الألوف، ثم دورة الآحاد.',reason:'أحسنت! كوّنت الصيغة اللفظية للعدد بدقة: «'+words(n)+'».'});
const produceReadStep=(source='ص 9 · الآن اقرأ أنت')=>({type:'produce_read',source,prompt:'«تدرّبت جيدًا! الآن اقرأ هذا العدد بنفسك»',skill:'verbal',hint:'قسّم العدد إلى دورات ثلاثية بدءاً من اليمين، واقرأ من أقصى اليسار.',reason:'أحسنت! أتقنت قراءة الأعداد الكبيرة ضمن الملايين بنفسك بدقة وإتقان.'});
const produceExplainStep=(source='ص 11 · السؤال 17 · فسّر بطريقتك')=>({type:'produce_explain',source,compare:[9605,149605],targetDigit:9,p:3,prompt:'قيمة الرقم 9 متساوية في العددين لأن…',skill:'place',hint:'تتبع منازل الرقم 9 في كلا العددين بدءاً من منزلة الآحاد.',reason:'أحسنت! قدّمت تبريراً رياضياً سليماً يثبت أن موقع الرقم في منزلة آحاد الألوف يحدد قيمته 9,000 في العددين.'});
const fields=(n,source,extra={})=>({type:'fields',n,source,prompt:'أكمل القيمة المنزلية في كل خانة، لتحصل على الصيغة التحليلية.',hint:'اضرب كل رقم في قيمة منزلته. لا نكتب حدًّا للمنزلة التي رقمها صفر.',...extra});
const vault=(n,text,source)=>({type:'wheels',n,initial:0,source,prompt:'افتح الخزنة: كوّن العدد المكتوب بالكلمات.',wording:text,hint:'ابدأ بدورة الملايين، ثم الألوف، ثم الآحاد. اترك صفرًا في كل منزلة لم تُذكر.'});
function getIconSVG(name, cls=''){
 const c='svg-ico '+(cls||'');
 switch(name){
  case 'sprout':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M10 20c0-7 3-7 3-12"/><path d="M13 8c2.5-3 6.5-2.5 7 0-1 4-5 4-7 4"/><path d="M13 11c-2.5-2-5.5-1.5-6 .5 1 3.5 4.5 3.5 6 3.5"/></svg>';
  case 'compass':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>';
  case 'crown':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><circle cx="12" cy="19" r="1"/></svg>';
  case 'star':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12,2 15.2,8.5 22.8,9.4 17.1,14.6 18.7,22 12,18.2 5.3,22 6.9,14.6 1.2,9.4 8.8,8.5"/></svg>';
  case 'trophy':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 3h16v6a8 8 0 0 1-16 0V3z"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>';
  case 'medal':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L18 22l-6-3-6 3 2.5-8.5"/></svg>';
  case 'chart':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>';
  case 'volume':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  case 'volumeMute':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  case 'refresh':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
  case 'map':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>';
  case 'lock':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  case 'unlock':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
  case 'gear':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  case 'book':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
  case 'hand':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15"/></svg>';
  case 'lightbulb':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5z"/></svg>';
  case 'target':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
  case 'infinity':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18.178 8c5.096 0 5.096 8 0 8-2.673 0-4.577-2.617-6.178-5.322-1.6 2.705-3.505 5.322-6.178 5.322-5.096 0-5.096-8 0-8 2.673 0 4.577 2.617 6.178 5.322 1.6-2.705 3.505-5.322 6.178-5.322z"/></svg>';
  case 'sparkle':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5"/></svg>';
  case 'dice':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>';
  case 'flask':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="8.5" y1="14" x2="15.5" y2="14"/></svg>';
  case 'printer':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
  case 'pencil':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
  case 'speaker':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  case 'close':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  case 'mic':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  case 'micOff':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  case 'trash':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  case 'check':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  case 'flame':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="currentColor" stroke="none" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
  case 'owl':return '<svg viewBox="0 0 32 32" class="'+c+'" fill="none" aria-hidden="true"><ellipse cx="16" cy="18" rx="12" ry="11" fill="#18795b"/><ellipse cx="12" cy="15" rx="4.5" ry="5" fill="#ffffff"/><ellipse cx="20" cy="15" rx="4.5" ry="5" fill="#ffffff"/><circle cx="12" cy="15" r="2" fill="#102a24"/><circle cx="20" cy="15" r="2" fill="#102a24"/><polygon points="16,18 18,22 14,22" fill="#d99b26"/></svg>';
  case 'city':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>';
  case 'numbers':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h2v8"/><path d="M14 8h2v4h-2v4h2"/></svg>';
  case 'rocket':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';
  case 'sun':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  case 'link':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  case 'bridge':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5"/><path d="M20 19V5"/><path d="M4 10h16"/><path d="M4 15c4-3 12-3 16 0"/></svg>';
  case 'eye':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  case 'speech':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  case 'plane':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.5.2-1.8.9l-.3.7c-.3.7 0 1.5.6 2l5.7 4.2-2.5 2.5-3-.5c-.5-.1-1 .1-1.3.5l-.2.2c-.3.4-.2 1 .2 1.4l2.4 2.4c.4.4 1 .5 1.4.2l.2-.2c.4-.3.6-.8.5-1.3l-.5-3 2.5-2.5 4.2 5.7c.5.6 1.3.9 2 .6l.7-.3c.7-.3 1.1-1 .9-1.8z"/></svg>';
  case 'puzzle':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.439 7.85c0-1.57-1.28-2.85-2.85-2.85h-1.71a2.85 2.85 0 0 1-5.7 0H7.469C5.9 5 4.62 6.28 4.62 7.85v1.71a2.85 2.85 0 0 0 0 5.7v1.71c0 1.57 1.28 2.85 2.85 2.85h1.71a2.85 2.85 0 0 1 5.7 0h1.71c1.57 0 2.85-1.28 2.85-2.85v-1.71a2.85 2.85 0 0 0 0-5.7V7.85z"/></svg>';
  case 'brain':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"/></svg>';
  case 'search':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  case 'million-reader':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v14H6.5A2.5 2.5 0 0 1 4 14.5v-10A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fill-opacity="0.22"/><polygon points="12,5 13.5,8.5 17,9 14.5,11.5 15,15 12,13 9,15 9.5,11.5 7,9 10.5,8.5" fill="currentColor"/></svg>';
  case 'zero-hunter':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke="currentColor"/><ellipse cx="8.5" cy="12" rx="1.8" ry="3.2" stroke="currentColor" fill="currentColor" fill-opacity="0.3"/><ellipse cx="15.5" cy="12" rx="1.8" ry="3.2" stroke="currentColor" fill="currentColor" fill-opacity="0.3"/><line x1="12" y1="2.5" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="21.5"/></svg>';
  case 'formula-architect':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke="currentColor"/><path d="M7 18.5l5-13 5 13"/><line x1="9" y1="13.5" x2="15" y2="13.5"/><circle cx="12" cy="5.5" r="1.5" fill="currentColor"/></svg>';
  case 'flame':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2.5-5 0 0-.5 1.5-1.5 1.5s-1.5-1.5-1.5-1.5c-1 1.5-1.5 3.5-1.5 5z" fill="#e69622"/><path d="M12 2c1 3 4 5.5 4 10a4 4 0 0 1-8 0c0-4.5 3-7 4-10z" stroke="#c97e16"/></svg>';
  case 'spark':return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#c88d21" stroke="#946616"/></svg>';
  default:return '<svg viewBox="0 0 24 24" class="'+c+'" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
 }
}
function renderHeartsSVG(count){
 let h='';
 for(let i=0;i<3;i++){
  const on=i<count;
  h+='<svg class="hud-heart '+(on?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true">'
   +(on?'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>'
       :'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2"/>')
   +'</svg>';
 }
 return h;
}
function updateSoundButton(){
 const btn=$('sound-toggle');if(!btn)return;
 btn.setAttribute('aria-pressed',String(state.muted));
 btn.setAttribute('aria-label',state.muted?'تشغيل الصوت':'كتم الصوت');
 btn.innerHTML='<span id="sound-toggle-ico">'+getIconSVG(state.muted?'volumeMute':'volume')+'</span>';
}
