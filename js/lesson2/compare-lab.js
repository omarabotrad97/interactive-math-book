/* Lesson 2: Standalone Comparison Lab Modal Engine */
/* ==========================================================================
   LESSON 2: COMPARISON LAB ENGINE (مختبر مقارنة الأعداد التفاعلي)
   ========================================================================== */

let cmpLabState = {
  numA: 3456210,
  numB: 3759120,
  places: [],
  currentCol: -1,
  decisiveCol: null,
  isScanning: false,
  isComplete: false,
  scanGeneration: 0,
  timer: null
};

function cancelComparisonLabActivity() {
  cmpLabState.scanGeneration++;
  cmpLabState.isScanning = false;
  if (cmpLabState.timer !== null) clearInterval(cmpLabState.timer);
  cmpLabState.timer = null;
  // Invalidate speech callbacks as well as cancel ongoing narration.
  cmpSpeechToken++;
  if (typeof stopSpeech === 'function') stopSpeech();
}

function refreshComparisonLabControls() {
  const stepBtn = $('cmp-lab-step-btn');
  const playBtn = $('cmp-lab-play-btn');
  if (stepBtn) stepBtn.disabled = cmpLabState.isComplete || cmpLabState.isScanning;
  if (playBtn) playBtn.disabled = cmpLabState.isComplete || cmpLabState.isScanning;
}

function finishComparisonLab() {
  cmpLabState.isComplete = true;
  cmpLabState.isScanning = false;
  if (cmpLabState.timer !== null) clearInterval(cmpLabState.timer);
  cmpLabState.timer = null;
  refreshComparisonLabControls();
}

const CMP_PLACE_DEFS = [
  { key: 'hm', label: 'مئات الملايين', cycle: 'millions' },
  { key: 'tm', label: 'عشرات الملايين', cycle: 'millions' },
  { key: 'm',  label: 'آحاد الملايين', cycle: 'millions' },
  { key: 'hk', label: 'مئات الألوف', cycle: 'thousands' },
  { key: 'tk', label: 'عشرات الألوف', cycle: 'thousands' },
  { key: 'k',  label: 'آحاد الألوف', cycle: 'thousands' },
  { key: 'h',  label: 'المئات', cycle: 'ones' },
  { key: 't',  label: 'العشرات', cycle: 'ones' },
  { key: 'o',  label: 'الآحاد', cycle: 'ones' }
];

function openComparisonLab(numA = 3456210, numB = 3759120) {
  const dlg = $('cmp-lab-dialog');
  if (!dlg) return;
  initComparisonLab(numA, numB);
  if (typeof dlg.showModal === 'function') dlg.showModal();
}

function initComparisonLab(numA, numB) {
  cancelComparisonLabActivity();
  const normalizedA = Number(numA);
  const normalizedB = Number(numB);
  // The laboratory table has nine named place-value columns.
  const valid = [normalizedA, normalizedB].every(n =>
    Number.isSafeInteger(n) && n >= 0 && n <= 999999999
  );
  if (!valid) {
    updateComparisonLabBanner('أدخل عددين صحيحين من 0 إلى 999999999 (ضمن تسع منازل).');
    return false;
  }
  cmpLabState.numA = normalizedA;
  cmpLabState.numB = normalizedB;
  cmpLabState.currentCol = -1;
  cmpLabState.decisiveCol = null;
  cmpLabState.isComplete = false;
  $('cmp-input-a').value = String(cmpLabState.numA);
  $('cmp-input-b').value = String(cmpLabState.numB);
  $('cmp-lab-symbol-display').textContent = '؟';
  prepareComparisonColumns();
  renderComparisonLabBoard();
  updateComparisonLabBanner('اضغط «ابدأ الفحص التفاعلي» لتتبع فحص المنازل خطوة بخطوة من اليسار مع الصوت والتظليل.');
  refreshComparisonLabControls();
  return true;
}

function prepareComparisonColumns() {
  const strA = String(cmpLabState.numA);
  const strB = String(cmpLabState.numB);
  const maxLen = Math.max(strA.length, strB.length);
  const padA = strA.padStart(maxLen, ' ');
  const padB = strB.padStart(maxLen, ' ');

  // Take the last maxLen place definitions
  const defs = CMP_PLACE_DEFS.slice(CMP_PLACE_DEFS.length - maxLen);

  cmpLabState.places = [];
  cmpLabState.decisiveCol = null;

  for (let i = 0; i < maxLen; i++) {
    const da = padA[i] === ' ' ? null : Number(padA[i]);
    const db = padB[i] === ' ' ? null : Number(padB[i]);
    const isDiff = (da !== db);
    if (isDiff && cmpLabState.decisiveCol === null) {
      cmpLabState.decisiveCol = i;
    }
    cmpLabState.places.push({
      idx: i,
      label: defs[i].label,
      cycle: defs[i].cycle,
      da,
      db,
      isDiff
    });
  }
}

function renderComparisonLabBoard() {
  const wrap = $('cmp-lab-board-wrap');
  if (!wrap) return;

  const strA = String(cmpLabState.numA);
  const strB = String(cmpLabState.numB);
  const isLenDiff = (strA.length !== strB.length);

  wrap.innerHTML = `
    <table class="cmp-board" id="cmp-lab-table" aria-label="لوحة منازل المقارنة التفاعلية">
      <thead>
        <tr>
          <th style="background:#f1f5f9; color:#475569;">العدد</th>
          ${cmpLabState.places.map((p, idx) => `
            <th class="cycle-${p.cycle}" data-col-idx="${idx}">${p.label}</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:700; background:#f8fafc;" class="l2-num-display">${fmt(cmpLabState.numA)}</td>
          ${cmpLabState.places.map((p, idx) => `
            <td data-col-idx="${idx}" class="cell-a">${p.da !== null ? p.da : '-'}</td>
          `).join('')}
        </tr>
        <tr>
          <td style="font-weight:700; background:#f8fafc;" class="l2-num-display">${fmt(cmpLabState.numB)}</td>
          ${cmpLabState.places.map((p, idx) => `
            <td data-col-idx="${idx}" class="cell-b">${p.db !== null ? p.db : '-'}</td>
          `).join('')}
        </tr>
      </tbody>
    </table>
  `;

  if (isLenDiff) {
    $('cmp-lab-banner').innerHTML = `
      <strong>حالة اختلاف عدد المنازل:</strong>
      العدد الأول يتكون من ${ar(strA.length)} منازل، والعدد الثاني يتكون من ${ar(strB.length)} منازل.
      <br>«العدد الذي يحتوي على منازل أكثر هو الأكبر دائمًا دون الحاجة لفحص الأرقام».
    `;
  }
}

function updateComparisonLabBanner(text) {
  const banner = $('cmp-lab-banner');
  if (banner) banner.innerHTML = text;
}

function stepComparisonLab(onEnded) {
  // Guard the state transition itself, not just the UI/timer.
  if (cmpLabState.isComplete) return false;
  const strA = String(cmpLabState.numA);
  const strB = String(cmpLabState.numB);
  const speak = text => playComparisonStepAudio(text, onEnded);

  // A difference in the number of digits is decisive immediately.
  if (strA.length !== strB.length) {
    const isAGreater = strA.length > strB.length;
    $('cmp-lab-symbol-display').textContent = isAGreater ? '>' : '<';
    const text = isAGreater
      ? `العدد الأول ${fmt(cmpLabState.numA)} يتكون من ${strA.length} منازل وهو أكبر من العدد الثاني ذي الـ ${strB.length} منازل.`
      : `العدد الثاني ${fmt(cmpLabState.numB)} يتكون من ${strB.length} منازل وهو أكبر من العدد الأول ذي الـ ${strA.length} منازل.`;
    updateComparisonLabBanner(text);
    const table = $('cmp-lab-table');
    if (table) table.querySelectorAll('td, th').forEach(el => {
      if (el.hasAttribute('data-col-idx')) el.classList.add('col-dimmed');
    });
    finishComparisonLab();
    speak(text);
    return true;
  }

  const colIdx = cmpLabState.currentCol + 1;
  if (colIdx >= cmpLabState.places.length) return false;
  cmpLabState.currentCol = colIdx;
  const col = cmpLabState.places[colIdx];
  const table = $('cmp-lab-table');
  if (!table) return false;
  const colCells = table.querySelectorAll(`[data-col-idx="${colIdx}"]`);
  table.querySelectorAll('td, th').forEach(el => el.classList.remove('col-active'));

  if (col.da === col.db) {
    colCells.forEach(el => el.classList.add('col-equal'));
    if (colIdx === cmpLabState.places.length - 1) {
      const pairHTML = `<bdi class="l1-bdi-nowrap" dir="ltr">${fmt(cmpLabState.numA)} = ${fmt(cmpLabState.numB)}</bdi>`;
      const speechText = `تطابقت جميع المنازل حتى الآحاد. العددان متساويان تمامًا: ${fmt(cmpLabState.numA)} = ${fmt(cmpLabState.numB)}.`;
      const bannerText = `تطابقت جميع المنازل حتى الآحاد. العددان متساويان تمامًا: ${pairHTML}.`;
      $('cmp-lab-symbol-display').textContent = '=';
      updateComparisonLabBanner(bannerText);
      finishComparisonLab();
      speak(speechText);
    } else {
      const text = `في منزلة ${col.label}: الرقم ${col.da} يساوي ${col.db}. متساويان، ننتقل إلى المنزلة التالية من اليسار.`;
      updateComparisonLabBanner(text);
      speak(text);
    }
    return true;
  }

  const isAGreater = col.da > col.db;
  table.querySelectorAll('td, th').forEach(el => {
    const idx = Number(el.dataset.colIdx);
    if (el.hasAttribute('data-col-idx') && idx > colIdx) el.classList.add('col-dimmed');
  });
  const cellA = table.querySelector(`tbody tr:nth-child(1) td[data-col-idx="${colIdx}"]`);
  const cellB = table.querySelector(`tbody tr:nth-child(2) td[data-col-idx="${colIdx}"]`);
  if (cellA && cellB) {
    cellA.classList.add(isAGreater ? 'col-diff-winner' : 'col-diff-loser');
    cellB.classList.add(isAGreater ? 'col-diff-loser' : 'col-diff-winner');
  }
  $('cmp-lab-symbol-display').textContent = isAGreater ? '>' : '<';
  const winnerNum = isAGreater ? fmt(cmpLabState.numA) : fmt(cmpLabState.numB);
  const loserNum = isAGreater ? fmt(cmpLabState.numB) : fmt(cmpLabState.numA);
  const winnerD = isAGreater ? col.da : col.db;
  const loserD = isAGreater ? col.db : col.da;
  const speechText = `أول اختلاف حاسم في منزلة ${col.label}! الرقم ${winnerD} أكبر من ${loserD}. إذن العدد ${winnerNum} هو الأكبر (${winnerNum} > ${loserNum}). يتوقف الفحص هنا دون الحاجة للنظر إلى بقية المنازل.`;
  const bannerText = `أول اختلاف حاسم في منزلة ${esc(col.label)}! الرقم ${winnerD} أكبر من ${loserD}. إذن العدد <bdi class="l1-bdi-nowrap" dir="ltr">${esc(winnerNum)}</bdi> هو الأكبر (<bdi class="l1-bdi-nowrap" dir="ltr">${esc(winnerNum)} &gt; ${esc(loserNum)}</bdi>). يتوقف الفحص هنا دون الحاجة للنظر إلى بقية المنازل.`;
  updateComparisonLabBanner(bannerText);
  finishComparisonLab();
  speak(speechText);
  return true;
}

function startAutoScanComparisonLab() {
  if (cmpLabState.isComplete || cmpLabState.isScanning) return;
  // Cancel any narration from a manual step before starting the new scan.
  cancelComparisonLabActivity();
  cmpLabState.currentCol = -1;
  cmpLabState.isComplete = false;
  cmpLabState.isScanning = true;
  prepareComparisonColumns();
  renderComparisonLabBoard();
  $('cmp-lab-symbol-display').textContent = '؟';
  refreshComparisonLabControls();
  const generation = cmpLabState.scanGeneration;
  const scanNext = () => {
    if (!cmpLabState.isScanning || cmpLabState.isComplete || cmpLabState.scanGeneration !== generation) return;
    // The next step follows speech completion, not a guessed 3.2-second interval.
    stepComparisonLab(scanNext);
  };
  scanNext();
}

// Wire events for dialog
function setupComparisonLabEvents() {
  const closeBtn = $('cmp-lab-close-btn');
  if (closeBtn) closeBtn.onclick = () => {
    cancelComparisonLabActivity();
    $('cmp-lab-dialog').close();
  };

  const loadBtn = $('cmp-lab-load-btn');
  if (loadBtn) loadBtn.onclick = () => {
    const a = Number($('cmp-input-a').value.replace(/[^0-9]/g, '')) || 0;
    const b = Number($('cmp-input-b').value.replace(/[^0-9]/g, '')) || 0;
    initComparisonLab(a, b);
  };

  const playBtn = $('cmp-lab-play-btn');
  if (playBtn) playBtn.onclick = () => startAutoScanComparisonLab();

  const stepBtn = $('cmp-lab-step-btn');
  if (stepBtn) stepBtn.onclick = () => {
    if (!cmpLabState.isScanning && !cmpLabState.isComplete) stepComparisonLab();
  };

  const resetBtn = $('cmp-lab-reset-btn');
  if (resetBtn) resetBtn.onclick = () => {
    initComparisonLab(cmpLabState.numA, cmpLabState.numB);
  };

  const voiceBtn = $('cmp-lab-voice-btn');
  if (voiceBtn) voiceBtn.onclick = () => {
    const bannerTxt = $('cmp-lab-banner').textContent;
    playComparisonStepAudio(bannerTxt);
  };

  const dialog = $('cmp-lab-dialog');
  if (dialog) dialog.addEventListener('close', cancelComparisonLabActivity);

  // Presets
  document.querySelectorAll('.cmp-lab-preset-btn').forEach(btn => {
    btn.onclick = () => {
      const a = Number(btn.dataset.a);
      const b = Number(btn.dataset.b);
      if (initComparisonLab(a, b)) startAutoScanComparisonLab();
    };
  });
}

