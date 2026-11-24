/* Unit 2 Lesson 1: مختبر الضرب الذهني التفاعلي (#mental-mul-lab-dialog)
   Mode 1: Doubling & Halving Chain (÷2 / ×2) with Book Presets & Custom Numbers
   Mode 2: Split-Tree Decomposition (Doubling / Halving) with Step-by-Step Reveal */

(function (global) {
  let labBound = false;
  let activeMode = 'chain'; // 'chain' | 'tree'

  // Chain state
  let chainRows = [{ a: 35, b: 16, opA: '', opB: '' }];

  // Tree state
  let treeOp = 'double'; // 'double' | 'half'
  let treeNum = 57;
  let treeStage = 1; // 1: split, 2: apply op, 3: sum

  const CHAIN_PRESETS = [
    { id: 'explore', label: 'أستكشف: 8 × 36', a: 8, b: 36 },
    { id: 'ex2_1', label: 'مثال 2: 35 × 16', a: 35, b: 16 },
    { id: 'ex2_2', label: 'مثال 2: 15 × 32', a: 15, b: 32 },
    { id: 'q13', label: 'أتدرب 13: 25 × 24', a: 25, b: 24 },
    { id: 'q15', label: 'أتدرب 15: 28 × 45', a: 28, b: 45 },
    { id: 'q17', label: 'س17 (فرديان): 29 × 29', a: 29, b: 29 }
  ];

  const TREE_PRESETS = [
    { id: 'd57', label: 'ضعف 57', op: 'double', n: 57 },
    { id: 'h94', label: 'نصف 94', op: 'half', n: 94 },
    { id: 'd75', label: 'ضعف 75', op: 'double', n: 75 },
    { id: 'h480', label: 'نصف 480', op: 'half', n: 480 },
    { id: 'd79', label: 'ضعف 79', op: 'double', n: 79 },
    { id: 'h168', label: 'نصف 168', op: 'half', n: 168 }
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function cleanInt(raw, fallback) {
    const norm = typeof normalizeDigits === 'function' ? normalizeDigits(String(raw ?? '')) : String(raw ?? '');
    const digits = norm.replace(/[^\d]/g, '');
    if (!digits) return fallback;
    const val = Number(digits);
    if (!Number.isFinite(val) || val < 1) return fallback;
    return Math.min(999, Math.trunc(val));
  }

  function decomposePlaceValue(n) {
    const str = String(Math.abs(Math.trunc(n)));
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const d = Number(str[i]);
      if (d === 0) continue;
      const pow = Math.pow(10, str.length - 1 - i);
      const val = d * pow;
      const label = pow === 100 ? 'المئات' : (pow === 10 ? 'العشرات' : 'الآحاد');
      out.push({ label, val });
    }
    return out.length ? out : [{ label: 'العدد', val: n }];
  }

  function renderLabPresets() {
    const wrap = byId('mm-lab-presets');
    if (!wrap) return;
    wrap.replaceChildren();
    if (activeMode === 'chain') {
      const first = chainRows[0] || { a: 35, b: 16 };
      CHAIN_PRESETS.forEach((p) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isOn = first.a === p.a && first.b === p.b;
        btn.className = 'u2-lab-preset-btn' + (isOn ? ' is-active' : '');
        btn.setAttribute('aria-pressed', String(isOn));
        btn.innerHTML = p.label.replace(/(\d+\s*×\s*\d+)/g, '<bdi dir="ltr">$1</bdi>');
        btn.addEventListener('click', () => {
          loadChainPair(p.a, p.b);
        });
        wrap.append(btn);
      });
    } else {
      TREE_PRESETS.forEach((p) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isOn = treeOp === p.op && treeNum === p.n;
        btn.className = 'u2-lab-preset-btn' + (isOn ? ' is-active' : '');
        btn.setAttribute('aria-pressed', String(isOn));
        btn.innerHTML = p.label.replace(/(\d+)/g, '<bdi dir="ltr">$1</bdi>');
        btn.addEventListener('click', () => {
          treeOp = p.op;
          treeNum = p.n;
          treeStage = 1;
          syncCustomInputs();
          renderLab();
        });
        wrap.append(btn);
      });
    }
  }

  function syncCustomInputs() {
    const customRow = byId('mm-lab-custom');
    if (!customRow) return;
    customRow.replaceChildren();
    if (activeMode === 'chain') {
      const first = chainRows[0] || { a: 35, b: 16 };
      customRow.innerHTML = ''
        + '<div class="u2-lab-field">'
        + '<label for="mm-input-a">العدد الأول</label>'
        + '<input type="text" id="mm-input-a" inputmode="numeric" maxlength="3" value="' + first.a + '">'
        + '</div>'
        + '<div class="u2-lab-field">'
        + '<label for="mm-input-b">العدد الثاني</label>'
        + '<input type="text" id="mm-input-b" inputmode="numeric" maxlength="3" value="' + first.b + '">'
        + '</div>'
        + '<button type="button" class="u2-action-btn is-primary" id="mm-apply-chain">تطبيق المسألة</button>';
      byId('mm-apply-chain')?.addEventListener('click', () => {
        const a = cleanInt(byId('mm-input-a')?.value, 35);
        const b = cleanInt(byId('mm-input-b')?.value, 16);
        loadChainPair(a, b);
      });
    } else {
      customRow.innerHTML = ''
        + '<div class="u2-lab-field">'
        + '<label for="mm-input-tree">العدد المطلوب تجزئته</label>'
        + '<input type="text" id="mm-input-tree" inputmode="numeric" maxlength="3" value="' + treeNum + '">'
        + '</div>'
        + '<button type="button" class="u2-action-btn' + (treeOp === 'double' ? ' is-primary' : '') + '" id="mm-tree-op-double" aria-pressed="' + String(treeOp === 'double') + '">مضاعفة (<bdi dir="ltr">× 2</bdi>)</button>'
        + '<button type="button" class="u2-action-btn' + (treeOp === 'half' ? ' is-info' : '') + '" id="mm-tree-op-half" aria-pressed="' + String(treeOp === 'half') + '">تنصيف (<bdi dir="ltr">÷ 2</bdi>)</button>'
        + '<button type="button" class="u2-action-btn" id="mm-apply-tree">عرض</button>';

      byId('mm-tree-op-double')?.addEventListener('click', () => {
        treeOp = 'double';
        treeNum = cleanInt(byId('mm-input-tree')?.value, treeNum);
        treeStage = 1;
        renderLab();
      });
      byId('mm-tree-op-half')?.addEventListener('click', () => {
        treeOp = 'half';
        treeNum = cleanInt(byId('mm-input-tree')?.value, treeNum);
        treeStage = 1;
        renderLab();
      });
      byId('mm-apply-tree')?.addEventListener('click', () => {
        treeNum = cleanInt(byId('mm-input-tree')?.value, treeNum);
        treeStage = 1;
        renderLab();
      });
    }
  }

  function loadChainPair(a, b) {
    chainRows = [{ a, b, opA: '', opB: '' }];
    syncCustomInputs();
    renderLab();
  }

  function applyChainStep(halveSide) {
    const cur = chainRows[chainRows.length - 1];
    if (!cur || chainRows.length >= 6) return;
    if (halveSide === 'A' && cur.a % 2 === 0 && cur.a >= 2) {
      chainRows.push({ a: cur.a / 2, b: cur.b * 2, opA: '÷ 2', opB: '× 2' });
    } else if (halveSide === 'B' && cur.b % 2 === 0 && cur.b >= 2) {
      chainRows.push({ a: cur.a * 2, b: cur.b / 2, opA: '× 2', opB: '÷ 2' });
    }
    if (typeof sound === 'function') sound(true);
    renderLab();
  }

  function renderChainStage(stageEl, summaryEl, ctrlEl) {
    const first = chainRows[0];
    const cur = chainRows[chainRows.length - 1];
    const prod = first.a * first.b;
    const bothOdd = cur.a % 2 !== 0 && cur.b % 2 !== 0;

    const list = document.createElement('div');
    list.className = 'u2-chain-list';

    chainRows.forEach((row, idx) => {
      if (idx > 0) {
        const conn = document.createElement('div');
        conn.className = 'u2-chain-connector';
        conn.innerHTML = ''
          + '<span class="u2-op-badge' + (row.opA === '÷ 2' ? ' is-half' : '') + '"><bdi dir="ltr">↓ ' + row.opA + '</bdi></span>'
          + '<span class="u2-op-badge' + (row.opB === '÷ 2' ? ' is-half' : '') + '"><bdi dir="ltr">↓ ' + row.opB + '</bdi></span>';
        list.append(conn);
      }
      const isLast = idx === chainRows.length - 1;
      const rEl = document.createElement('div');
      rEl.className = 'u2-chain-row' + (isLast ? ' is-active' : '');
      rEl.innerHTML = ''
        + '<div class="u2-chain-factor' + (isLast && row.a % 2 === 0 ? ' is-even-choice' : '') + '">'
        + '<span class="u2-chain-val"><bdi dir="ltr">' + row.a + '</bdi></span>'
        + '<span class="u2-tree-part-lbl">' + (row.a % 2 === 0 ? 'زوجي' : 'فردي') + '</span>'
        + '</div>'
        + '<span class="u2-chain-mul-sign" aria-hidden="true">×</span>'
        + '<div class="u2-chain-factor' + (isLast && row.b % 2 === 0 ? ' is-even-choice' : '') + '">'
        + '<span class="u2-chain-val"><bdi dir="ltr">' + row.b + '</bdi></span>'
        + '<span class="u2-tree-part-lbl">' + (row.b % 2 === 0 ? 'زوجي' : 'فردي') + '</span>'
        + '</div>';
      list.append(rEl);
    });

    stageEl.append(list);

    const canHalveA = cur.a % 2 === 0 && cur.a >= 2 && chainRows.length < 6;
    const canHalveB = cur.b % 2 === 0 && cur.b >= 2 && chainRows.length < 6;

    if (bothOdd && chainRows.length === 1) {
      summaryEl.className = 'u2-lab-summary is-warn';
      summaryEl.innerHTML = 'العددان <bdi dir="ltr">' + cur.a + '</bdi> و<bdi dir="ltr">' + cur.b + '</bdi> كلاهما فردي؛ لذا لا يمكن استعمال التنصيف والمضاعفة للأعداد الكلية هنا (كما في سؤال 17). الناتج الحقيقي هو <bdi dir="ltr">' + prod + '</bdi>.';
    } else {
      summaryEl.className = 'u2-lab-summary';
      summaryEl.innerHTML = 'الناتج ثابت في كل خطوة: <bdi dir="ltr">' + cur.a + ' × ' + cur.b + ' = ' + prod + '</bdi>'
        + (bothOdd ? ' · وصلنا إلى عددين فرديين (توقّف التنصيف).' : ' · يمكنك متابعة التنصيف والمضاعفة لتبسيط الضرب أكثر.');
    }

    const btnA = document.createElement('button');
    btnA.type = 'button';
    btnA.className = 'u2-action-btn is-info';
    btnA.disabled = !canHalveA;
    btnA.innerHTML = 'نصّف <bdi dir="ltr">' + cur.a + '</bdi> وضاعف <bdi dir="ltr">' + cur.b + '</bdi>';
    btnA.addEventListener('click', () => applyChainStep('A'));

    const btnB = document.createElement('button');
    btnB.type = 'button';
    btnB.className = 'u2-action-btn is-primary';
    btnB.disabled = !canHalveB;
    btnB.innerHTML = 'ضاعف <bdi dir="ltr">' + cur.a + '</bdi> ونصّف <bdi dir="ltr">' + cur.b + '</bdi>';
    btnB.addEventListener('click', () => applyChainStep('B'));

    const btnUndo = document.createElement('button');
    btnUndo.type = 'button';
    btnUndo.className = 'u2-action-btn';
    btnUndo.disabled = chainRows.length <= 1;
    btnUndo.textContent = 'تراجع';
    btnUndo.addEventListener('click', () => {
      if (chainRows.length > 1) {
        chainRows.pop();
        renderLab();
      }
    });

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'u2-action-btn';
    btnReset.disabled = chainRows.length <= 1;
    btnReset.textContent = 'إعادة';
    btnReset.addEventListener('click', () => {
      chainRows = [chainRows[0]];
      renderLab();
    });

    const btnSpeak = document.createElement('button');
    btnSpeak.type = 'button';
    btnSpeak.className = 'u2-action-btn';
    btnSpeak.textContent = 'استمع';
    btnSpeak.addEventListener('click', speakCurrentLabSummary);

    ctrlEl.append(btnA, btnB, btnUndo, btnReset, btnSpeak);
  }

  function renderTreeStage(stageEl, summaryEl, ctrlEl) {
    const isHalf = treeOp === 'half';
    const isOddHalf = isHalf && treeNum % 2 !== 0;
    const parts = decomposePlaceValue(treeNum);
    const results = parts.map((pt) => (isHalf ? pt.val / 2 : pt.val * 2));
    const total = isHalf ? treeNum / 2 : treeNum * 2;

    const board = document.createElement('div');
    board.className = 'u2-tree-board';

    const rootEl = document.createElement('div');
    rootEl.className = 'u2-tree-root' + (isHalf ? ' is-half' : '');
    const splitExpr = parts.map((p) => p.val).join(' + ');
    rootEl.innerHTML = '<bdi dir="ltr">' + treeNum + ' = ' + splitExpr + '</bdi>';
    board.append(rootEl);

    if (!isOddHalf) {
      const branches = document.createElement('div');
      branches.className = 'u2-tree-branches' + (parts.length >= 3 ? ' is-three' : '');
      parts.forEach((pt, idx) => {
        const br = document.createElement('div');
        br.className = 'u2-tree-branch';
        const valText = treeStage >= 2 ? String(results[idx]) : '؟';
        br.innerHTML = ''
          + '<span class="u2-tree-part-lbl">' + pt.label + '</span>'
          + '<span class="u2-tree-part-val"><bdi dir="ltr">' + pt.val + '</bdi></span>'
          + '<span class="u2-tree-op-tag' + (isHalf ? ' is-half' : '') + '"><bdi dir="ltr">' + (isHalf ? '÷ 2' : '× 2') + '</bdi></span>'
          + '<span class="u2-chain-val"><bdi dir="ltr">' + valText + '</bdi></span>';
        branches.append(br);
      });
      board.append(branches);

      if (treeStage >= 3) {
        const sumRow = document.createElement('div');
        sumRow.className = 'u2-tree-sum-row';
        sumRow.innerHTML = '<span>المجموع:</span><bdi dir="ltr">' + results.join(' + ') + ' = ' + total + '</bdi>';
        board.append(sumRow);
      }
    }

    stageEl.append(board);

    if (isOddHalf) {
      summaryEl.className = 'u2-lab-summary is-warn';
      summaryEl.innerHTML = 'العدد <bdi dir="ltr">' + treeNum + '</bdi> فردي فلا يقبل التنصيف لعدد كلي؛ جرّب عددًا زوجيًا مثل <bdi dir="ltr">' + (treeNum + 1) + '</bdi> أو اختر وضع المضاعفة (<bdi dir="ltr">× 2</bdi>).';
    } else if (treeStage === 1) {
      summaryEl.className = 'u2-lab-summary';
      summaryEl.innerHTML = 'الخطوة 1: جزّأنا العدد <bdi dir="ltr">' + treeNum + '</bdi> حسب القيمة المنزلية إلى <bdi dir="ltr">' + splitExpr + '</bdi>. اضغط «الخطوة التالية» لتطبيق <bdi dir="ltr">' + (isHalf ? '÷ 2' : '× 2') + '</bdi>.';
    } else if (treeStage === 2) {
      summaryEl.className = 'u2-lab-summary';
      summaryEl.innerHTML = 'الخطوة 2: طبّقنا <bdi dir="ltr">' + (isHalf ? '÷ 2' : '× 2') + '</bdi> على كل جزء فحصلنا على <bdi dir="ltr">' + results.join(' ، ') + '</bdi>. بقي جمعها!';
    } else {
      summaryEl.className = 'u2-lab-summary';
      summaryEl.innerHTML = 'الخطوة 3: جمعنا الأجزاء <bdi dir="ltr">' + results.join(' + ') + ' = ' + total + '</bdi>. إذن ' + (isHalf ? 'نصف' : 'ضعف') + ' العدد <bdi dir="ltr">' + treeNum + '</bdi> هو <bdi dir="ltr">' + total + '</bdi>.';
    }

    const btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'u2-action-btn';
    btnPrev.disabled = isOddHalf || treeStage <= 1;
    btnPrev.textContent = 'خطوة سابقة';
    btnPrev.addEventListener('click', () => {
      treeStage = Math.max(1, treeStage - 1);
      renderLab();
    });

    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'u2-action-btn is-primary';
    btnNext.disabled = isOddHalf || treeStage >= 3;
    btnNext.textContent = 'الخطوة التالية';
    btnNext.addEventListener('click', () => {
      treeStage = Math.min(3, treeStage + 1);
      if (typeof sound === 'function') sound(true);
      renderLab();
    });

    const btnAll = document.createElement('button');
    btnAll.type = 'button';
    btnAll.className = 'u2-action-btn';
    btnAll.disabled = isOddHalf || treeStage >= 3;
    btnAll.textContent = 'كل الشجرة';
    btnAll.addEventListener('click', () => {
      treeStage = 3;
      renderLab();
    });

    const btnSpeak = document.createElement('button');
    btnSpeak.type = 'button';
    btnSpeak.className = 'u2-action-btn';
    btnSpeak.textContent = 'استمع';
    btnSpeak.addEventListener('click', speakCurrentLabSummary);

    ctrlEl.append(btnPrev, btnNext, btnAll, btnSpeak);
  }

  function speakCurrentLabSummary() {
    const txt = byId('mm-lab-summary')?.textContent?.trim();
    if (txt && typeof speakText === 'function') {
      speakText(txt);
    }
  }

  function renderLab() {
    const dlg = byId('mental-mul-lab-dialog');
    if (!dlg) return;

    dlg.querySelectorAll('[data-mm-mode]').forEach((tab) => {
      const on = tab.dataset.mmMode === activeMode;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-pressed', String(on));
    });

    renderLabPresets();

    const stageEl = byId('mm-lab-stage');
    const summaryEl = byId('mm-lab-summary');
    const ctrlEl = byId('mm-lab-controls');
    if (!stageEl || !summaryEl || !ctrlEl) return;
    stageEl.replaceChildren();
    ctrlEl.replaceChildren();

    if (activeMode === 'chain') {
      renderChainStage(stageEl, summaryEl, ctrlEl);
    } else {
      renderTreeStage(stageEl, summaryEl, ctrlEl);
    }
  }

  function setupMentalMulLabEvents() {
    if (labBound) return;
    const dlg = byId('mental-mul-lab-dialog');
    if (!dlg) return;
    labBound = true;

    byId('mm-lab-close')?.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener('close', () => {
      if (typeof stopSpeech === 'function') stopSpeech();
    });

    dlg.querySelectorAll('[data-mm-mode]').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeMode = tab.dataset.mmMode === 'tree' ? 'tree' : 'chain';
        syncCustomInputs();
        renderLab();
      });
    });

    syncCustomInputs();
    renderLab();
  }

  function openMentalMulLab(opts) {
    setupMentalMulLabEvents();
    const dlg = byId('mental-mul-lab-dialog');
    if (!dlg) return;

    if (opts && opts.mode === 'tree') {
      activeMode = 'tree';
      treeOp = opts.op === 'half' ? 'half' : 'double';
      treeNum = cleanInt(opts.num, 57);
      treeStage = 1;
    } else if (opts && Number.isFinite(opts.a) && Number.isFinite(opts.b)) {
      activeMode = 'chain';
      chainRows = [{ a: cleanInt(opts.a, 35), b: cleanInt(opts.b, 16), opA: '', opB: '' }];
    }

    syncCustomInputs();
    renderLab();
    if (!dlg.open) dlg.showModal();
  }

  global.setupMentalMulLabEvents = setupMentalMulLabEvents;
  global.openMentalMulLab = openMentalMulLab;
})(window);
