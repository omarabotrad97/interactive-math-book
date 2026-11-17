/* ==========================================================================
   LESSON 3: STANDALONE ADDITION & SUBTRACTION LAB MODAL (#ops-lab-dialog)
   Supports column-by-column animation from right to left, carry & cascading borrow
   visualization, 8-digit mobile-first grid, estimation check & Arabic narration.
   ========================================================================== */

(function (global) {
  'use strict';

  const SHORT_PLACE_LABELS = [
    'آحاد',
    'عشرات',
    'مئات',
    'آ.ألوف',
    'ع.ألوف',
    'م.ألوف',
    'ملايين',
    'ع.ملايين',
    'م.ملايين'
  ];

  function wrapBidiNumbers(text) {
    const safe = String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return safe.replace(/[+-]?\d[\d,]*(?:\s*(?:[+\-−×÷=]|→)\s*[+-]?\d[\d,]*)*/g, m => {
      return '<bdi class="l1-bdi-nowrap" dir="ltr">' + m + '</bdi>';
    });
  }

  let labOp = 'add';
  let labA = 3421664;
  let labB = 1897632;
  let labStepCol = -1; // -1: before starting, 0..numCols-1: current column processed, numCols: done
  let labTimer = null;

  function stopLabTimer() {
    if (labTimer) {
      clearInterval(labTimer);
      labTimer = null;
    }
    const playBtn = typeof $ === 'function' ? $('ops-lab-play-btn') : document.getElementById('ops-lab-play-btn');
    if (playBtn) {
      const span = playBtn.querySelector('span');
      if (span) span.textContent = 'تشغيل الخطوات';
    }
  }

  function sanitizeLabNumber(val, fallback) {
    const raw = typeof normalizeDigits === 'function'
      ? normalizeDigits(String(val ?? ''))
      : String(val ?? '');
    const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 8);
    if (!cleaned) return fallback;
    const n = Number(cleaned);
    return Number.isSafeInteger(n) ? n : fallback;
  }

  function computeCurrentMeta() {
    const defs = global.Lesson3RunnerDefs;
    if (!defs) return null;
    if (labOp === 'sub') {
      return defs.computeVerticalSubtractionMeta(labA, labB);
    }
    return defs.computeVerticalAdditionMeta([labA, labB]);
  }

  function buildLabExplanation(meta) {
    if (!meta) return '';
    const f = typeof fmt === 'function' ? fmt : (n => Number(n).toLocaleString('en-US'));
    if (labStepCol < 0) {
      const estOp = labOp === 'sub'
        ? (f(meta.roundedOperands[0]) + ' - ' + f(meta.roundedOperands[1]) + ' = ' + f(meta.estimate))
        : (f(meta.roundedOperands[0]) + ' + ' + f(meta.roundedOperands[1]) + ' = ' + f(meta.estimate));
      const swapNote = meta.swapped ? ' (وُضع الأكبر بالأعلى) ' : '';
      return 'التقدير: ' + estOp + '.' + swapNote + ' اضغط «المنزلة التالية» أو «تشغيل الخطوات».';
    }
    if (labStepCol >= meta.numCols - 1) {
      return 'الناتج الدقيق: ' + f(meta.exact) + ' — قريب من التقدير (' + f(meta.estimate) + ') فالإجابة معقولة.';
    }

    const c = meta.columns[labStepCol];
    if (meta.op === 'add') {
      const d0 = c.operandDigits[0] === null ? 0 : c.operandDigits[0];
      const d1 = c.operandDigits[1] === null ? 0 : c.operandDigits[1];
      const carryTxt = c.carryIn > 0 ? (c.carryIn + ' + ') : '';
      const resTxt = c.carryOut > 0
        ? ('نكتب ' + c.resultDigit + ' ونحمل ' + c.carryOut + '.')
        : ('نكتب ' + c.resultDigit + '.');
      return 'منزلة ' + c.placeName + ': ' + carryTxt + d0 + ' + ' + d1 + ' = ' + c.colSum + '. ' + resTxt;
    }

    const bot = c.bottomDigit === null ? 0 : c.bottomDigit;
    if (c.neededBorrow) {
      return 'منزلة ' + c.placeName + ': نستلف 1 من اليسار (' + c.preBorrowTopDigit + ' → ' + c.postBorrowTopDigit + ')، ثم ' + c.postBorrowTopDigit + ' - ' + bot + ' = ' + c.resultDigit + '.';
    }
    return 'منزلة ' + c.placeName + ': ' + c.postBorrowTopDigit + ' - ' + bot + ' = ' + c.resultDigit + '.';
  }

  function renderOperationsLabBoard() {
    const wrap = typeof $ === 'function' ? $('ops-lab-board-wrap') : document.getElementById('ops-lab-board-wrap');
    const banner = typeof $ === 'function' ? $('ops-lab-banner') : document.getElementById('ops-lab-banner');
    const meta = computeCurrentMeta();
    if (!wrap || !meta) return;

    const nCols = meta.numCols;
    const f = typeof fmt === 'function' ? fmt : (n => Number(n).toLocaleString('en-US'));
    const fullNames = (global.Lesson3RunnerDefs && global.Lesson3RunnerDefs.L3_PLACE_NAMES) || SHORT_PLACE_LABELS;

    // Precompute subtraction borrow visibility up to labStepCol
    const crossedAtPos = new Set();
    const borrowBadgeAtPos = {};
    if (meta.op === 'sub') {
      const maxShown = Math.min(labStepCol, nCols - 1);
      for (let i = 0; i <= maxShown; i++) {
        const col = meta.columns[i];
        if (col && Array.isArray(col.borrowEffects)) {
          col.borrowEffects.forEach(eff => {
            crossedAtPos.add(eff.pos);
            borrowBadgeAtPos[eff.pos] = {
              val: eff.newVal,
              isSecondary: Boolean(eff.isIntermediateZero)
            };
          });
        }
      }
    }

    let periodHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    const onesSpan = Math.min(3, nCols);
    const thousSpan = nCols > 3 ? Math.min(3, nCols - 3) : 0;
    const milSpan = nCols > 6 ? (nCols - 6) : 0;
    if (milSpan > 0) {
      const milLabel = milSpan <= 2 ? 'الملايين' : 'دورة الملايين';
      periodHtml += '<div class="l3-vop-period cycle-millions" title="دورة الملايين" style="grid-column: span ' + milSpan + '">' + milLabel + '</div>';
    }
    if (thousSpan > 0) {
      const thousLabel = thousSpan === 1 ? 'الألوف' : 'دورة الألوف';
      periodHtml += '<div class="l3-vop-period cycle-thousands" title="دورة الألوف" style="grid-column: span ' + thousSpan + '">' + thousLabel + '</div>';
    }
    periodHtml += '<div class="l3-vop-period cycle-ones" title="دورة الآحاد" style="grid-column: span ' + onesSpan + '">دورة الآحاد</div>';

    let labelsHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    let regroupHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    let topRowHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';
    let botRowHtml = '<div class="l3-vop-op-spacer l3-vop-op-sign" aria-label="' + (meta.op === 'sub' ? 'ناقص' : 'زائد') + '">' + (meta.op === 'sub' ? '−' : '+') + '</div>';
    let resRowHtml = '<div class="l3-vop-op-spacer" aria-hidden="true"></div>';

    for (let pos = nCols - 1; pos >= 0; pos--) {
      const c = meta.columns[pos];
      const isCurrent = pos === labStepCol;
      const isDone = labStepCol >= nCols || pos < labStepCol || (pos === labStepCol && labStepCol < nCols);

      labelsHtml += '<div class="l3-vop-place-lbl' + (isCurrent ? ' is-active-col' : (isDone ? ' is-done-col' : '')) + '" title="' + (fullNames[pos] || '') + '">' + (SHORT_PLACE_LABELS[pos] || '') + '</div>';

      // Regrouping badge
      let badgeHtml = '';
      if (meta.op === 'add') {
        if (pos > 0 && c.carryIn > 0 && labStepCol >= pos - 1) {
          badgeHtml = '<span class="l3-vop-regroup-badge">' + c.carryIn + '</span>';
        }
      } else {
        const bInfo = borrowBadgeAtPos[pos];
        if (bInfo) {
          badgeHtml = '<span class="l3-vop-regroup-badge' + (bInfo.isSecondary ? ' is-secondary-borrow' : '') + '">' + bInfo.val + '</span>';
        }
      }
      regroupHtml += '<div class="l3-vop-regroup-cell">' + badgeHtml + '</div>';

      // Operand rows
      const topDigit = meta.op === 'add'
        ? (c.operandDigits[0] === null ? '' : c.operandDigits[0])
        : c.origTopDigit;
      const topEmpty = topDigit === '';
      const isCrossed = meta.op === 'sub' && crossedAtPos.has(pos);
      topRowHtml += '<div class="l3-vop-digit' + (topEmpty ? ' is-empty' : '') + (isCurrent ? ' is-active-col' : '') + (isCrossed ? ' is-crossed' : '') + '">' + (topEmpty ? '0' : topDigit) + '</div>';

      const botDigit = meta.op === 'add'
        ? (c.operandDigits[1] === null ? '' : c.operandDigits[1])
        : (c.bottomDigit === null ? '' : c.bottomDigit);
      const botEmpty = botDigit === '';
      botRowHtml += '<div class="l3-vop-digit' + (botEmpty ? ' is-empty' : '') + (isCurrent ? ' is-active-col' : '') + '">' + (botEmpty ? '0' : botDigit) + '</div>';

      // Result row
      const showRes = isDone;
      const resCls = isCurrent ? ' is-active' : (showRes ? ' is-filled' : '');
      resRowHtml += '<div class="l3-vop-res-cell' + resCls + '">' + (showRes ? c.resultDigit : '') + '</div>';
    }

    const doneAll = labStepCol >= nCols - 1;
    wrap.innerHTML = ''
      + '<div class="l3-vop-card l3-lab-board-card">'
      + '<div class="l3-vop-board-scroll">'
      + '<div class="l3-vop-grid" style="grid-template-columns: minmax(12px, 20px) repeat(' + nCols + ', minmax(0, 1fr))">'
      + periodHtml
      + labelsHtml
      + regroupHtml
      + topRowHtml
      + botRowHtml
      + '<div class="l3-vop-divider" aria-hidden="true"></div>'
      + resRowHtml
      + '</div></div>'
      + '</div>';

    if (banner) {
      if (doneAll) {
        banner.classList.add('is-done');
        banner.innerHTML = ''
          + '<div class="ops-lab-done-chips">'
            + '<span class="ops-lab-done-chip"><small>المقدّر:</small> <bdi dir="ltr">' + f(meta.estimate) + '</bdi></span>'
            + '<span class="ops-lab-done-chip is-exact"><small>الدقيق:</small> <bdi dir="ltr">' + f(meta.exact) + '</bdi></span>'
            + '<span class="ops-lab-done-ok">الإجابة معقولة</span>'
          + '</div>';
      } else {
        banner.classList.remove('is-done');
        banner.innerHTML = wrapBidiNumbers(buildLabExplanation(meta));
      }
    }
  }

  function syncLabInputsToUI() {
    const inA = document.getElementById('ops-input-a');
    const inB = document.getElementById('ops-input-b');
    const addBtn = document.getElementById('ops-op-add');
    const subBtn = document.getElementById('ops-op-sub');
    if (inA) inA.value = String(labA);
    if (inB) inB.value = String(labB);
    if (addBtn) {
      addBtn.classList.toggle('is-active', labOp === 'add');
      addBtn.setAttribute('aria-pressed', String(labOp === 'add'));
    }
    if (subBtn) {
      subBtn.classList.toggle('is-active', labOp === 'sub');
      subBtn.setAttribute('aria-pressed', String(labOp === 'sub'));
    }
  }

  function initOperationsLab(a, b, op) {
    stopLabTimer();
    labOp = (op === 'sub') ? 'sub' : 'add';
    labA = sanitizeLabNumber(a, 3421664);
    labB = sanitizeLabNumber(b, 1897632);
    if (labOp === 'sub' && labB > labA) {
      const tmp = labA;
      labA = labB;
      labB = tmp;
    }
    labStepCol = -1;
    syncLabInputsToUI();
    renderOperationsLabBoard();
  }

  function stepOperationsLab() {
    const meta = computeCurrentMeta();
    if (!meta) return false;
    if (labStepCol < meta.numCols) {
      labStepCol++;
      renderOperationsLabBoard();
      if (typeof sound === 'function') sound(true, labStepCol >= meta.numCols ? 760 : 520);
      return labStepCol < meta.numCols;
    }
    return false;
  }

  function openOperationsLab(initA, initB, initOp) {
    const dlg = document.getElementById('ops-lab-dialog');
    if (!dlg) return;
    dlg.removeAttribute('inert');
    dlg.removeAttribute('aria-hidden');
    if (initA !== undefined && initB !== undefined) {
      initOperationsLab(initA, initB, initOp || 'add');
    } else {
      syncLabInputsToUI();
      renderOperationsLabBoard();
    }
    if (typeof dlg.showModal === 'function' && !dlg.open) {
      dlg.showModal();
    }
  }

  function setupOperationsLabEvents() {
    const dlg = document.getElementById('ops-lab-dialog');
    if (!dlg || dlg.dataset.opsBound === '1') return;
    dlg.dataset.opsBound = '1';

    document.getElementById('ops-lab-close')?.addEventListener('click', () => {
      stopLabTimer();
      dlg.close();
    });
    dlg.addEventListener('click', e => {
      if (e.target === dlg) {
        stopLabTimer();
        dlg.close();
      }
    });
    dlg.addEventListener('close', () => stopLabTimer());

    document.querySelectorAll('.ops-lab-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        initOperationsLab(btn.dataset.a, btn.dataset.b, btn.dataset.op || 'add');
      });
    });

    document.getElementById('ops-op-add')?.addEventListener('click', () => {
      const inA = document.getElementById('ops-input-a');
      const inB = document.getElementById('ops-input-b');
      initOperationsLab(inA ? inA.value : labA, inB ? inB.value : labB, 'add');
    });

    document.getElementById('ops-op-sub')?.addEventListener('click', () => {
      const inA = document.getElementById('ops-input-a');
      const inB = document.getElementById('ops-input-b');
      initOperationsLab(inA ? inA.value : labA, inB ? inB.value : labB, 'sub');
    });

    document.getElementById('ops-lab-load-btn')?.addEventListener('click', () => {
      const inA = document.getElementById('ops-input-a');
      const inB = document.getElementById('ops-input-b');
      initOperationsLab(inA ? inA.value : labA, inB ? inB.value : labB, labOp);
    });

    ['ops-input-a', 'ops-input-b'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const inA = document.getElementById('ops-input-a');
          const inB = document.getElementById('ops-input-b');
          initOperationsLab(inA ? inA.value : labA, inB ? inB.value : labB, labOp);
        }
      });
    });

    document.getElementById('ops-lab-step-btn')?.addEventListener('click', () => {
      stopLabTimer();
      const meta = computeCurrentMeta();
      if (meta && labStepCol >= meta.numCols) labStepCol = -1;
      stepOperationsLab();
    });

    document.getElementById('ops-lab-reset-btn')?.addEventListener('click', () => {
      stopLabTimer();
      labStepCol = -1;
      renderOperationsLabBoard();
    });

    document.getElementById('ops-lab-play-btn')?.addEventListener('click', () => {
      if (labTimer) {
        stopLabTimer();
        return;
      }
      const meta = computeCurrentMeta();
      if (!meta) return;
      if (labStepCol >= meta.numCols) {
        labStepCol = -1;
        renderOperationsLabBoard();
      }
      const playBtn = document.getElementById('ops-lab-play-btn');
      const span = playBtn?.querySelector('span');
      if (span) span.textContent = 'إيقاف مؤقت';

      if (!stepOperationsLab()) {
        stopLabTimer();
        return;
      }
      labTimer = setInterval(() => {
        if (!stepOperationsLab()) {
          stopLabTimer();
        }
      }, 900);
    });

    document.getElementById('ops-lab-voice-btn')?.addEventListener('click', () => {
      const meta = computeCurrentMeta();
      const txt = buildLabExplanation(meta);
      if (global.Lesson3RunnerDefs && typeof global.Lesson3RunnerDefs.speakOperationText === 'function') {
        global.Lesson3RunnerDefs.speakOperationText(txt);
      }
    });
  }

  global.openOperationsLab = openOperationsLab;
  global.initOperationsLab = initOperationsLab;
  global.setupOperationsLabEvents = setupOperationsLabEvents;
})(window);
