/* Unit 2 Opener & Project Interactive Experience (#u2-project-dialog)
   Page 28: غلاف الوحدة 2 (أهمية الوحدة، تعلمت سابقًا، سأتعلم في هذه الوحدة)
   Page 29: مشروع الوحدة: الضرب بالخطوط (23 × 13 = 299) والطريقة الشبكية (349 × 63 = 21987) */

(function (global) {
  let projBound = false;
  let activeTab = 'overview'; // 'overview' | 'lines' | 'lattice'
  let exploredLines = false;
  let exploredLattice = false;

  // Line multiplication state
  const LINE_EXAMPLES = [
    { id: 'book', label: 'مثال الكتاب: 23 × 13', a: 23, b: 13 },
    { id: 'ex2', label: 'تجربة: 12 × 21', a: 12, b: 21 },
    { id: 'ex3', label: 'تجربة: 31 × 12', a: 31, b: 12 }
  ];
  let activeLineEx = LINE_EXAMPLES[0];
  let lineStep = 0; // 0: lines only, 1: ones, 2: tens, 3: hundreds + total

  // Lattice multiplication state
  const LATTICE_EXAMPLES = [
    { id: 'book', label: 'مثال الكتاب: 349 × 63', a: 349, b: 63 },
    { id: 'ex2', label: 'تجربة: 214 × 32', a: 214, b: 32 }
  ];
  let activeLatticeEx = LATTICE_EXAMPLES[0];
  let latticeStep = 0; // 0: empty grid, 1: row 1, 2: row 2, 3: diagonals + answer

  function byId(id) {
    return document.getElementById(id);
  }

  function renderLineSvg(ex, step) {
    const a1 = Math.floor(ex.a / 10);
    const a0 = ex.a % 10;
    const b1 = Math.floor(ex.b / 10);
    const b0 = ex.b % 10;

    const topYs = [];
    for (let i = 0; i < a1; i++) topYs.push(34 + i * 14);
    const botYs = [];
    for (let i = 0; i < a0; i++) botYs.push(132 + i * 14);

    const leftXs = [];
    for (let i = 0; i < b1; i++) leftXs.push(64 + i * 14);
    const rightXs = [];
    for (let i = 0; i < b0; i++) rightXs.push(208 + i * 14);

    const allYs = topYs.concat(botYs);
    const allXs = leftXs.concat(rightXs);
    const minX = 36;
    const maxX = 276;
    const minY = 18;
    const maxY = 186;

    const onesCount = a0 * b0;
    const tensCount = a1 * b0 + a0 * b1;
    const hundredsCount = a1 * b1;
    const product = ex.a * ex.b;

    let svg = '<svg class="u2-proj-svg" viewBox="0 0 320 218" role="img" aria-label="تمثيل الضرب بالخطوط للعملية ' + ex.a + ' ضرب ' + ex.b + '">';

    // Highlight rings by step
    if (step >= 3) {
      const cx = (leftXs[0] + leftXs[leftXs.length - 1]) / 2;
      const cy = (topYs[0] + topYs[topYs.length - 1]) / 2;
      svg += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (16 + b1 * 6) + '" ry="' + (16 + a1 * 6) + '" fill="#eef6e6" stroke="#3b6b18" stroke-width="2" stroke-dasharray="4 3"/>';
    }
    if (step >= 2) {
      const rx1 = (rightXs[0] + rightXs[rightXs.length - 1]) / 2;
      const ry1 = (topYs[0] + topYs[topYs.length - 1]) / 2;
      const rx2 = (leftXs[0] + leftXs[leftXs.length - 1]) / 2;
      const ry2 = (botYs[0] + botYs[botYs.length - 1]) / 2;
      svg += '<ellipse cx="' + rx1 + '" cy="' + ry1 + '" rx="' + (14 + b0 * 6) + '" ry="' + (14 + a1 * 6) + '" fill="#e6f1f6" stroke="#0f5d84" stroke-width="1.8" stroke-dasharray="4 3"/>';
      svg += '<ellipse cx="' + rx2 + '" cy="' + ry2 + '" rx="' + (14 + b1 * 6) + '" ry="' + (14 + a0 * 6) + '" fill="#e6f1f6" stroke="#0f5d84" stroke-width="1.8" stroke-dasharray="4 3"/>';
    }
    if (step >= 1) {
      const ox = (rightXs[0] + rightXs[rightXs.length - 1]) / 2;
      const oy = (botYs[0] + botYs[botYs.length - 1]) / 2;
      svg += '<ellipse cx="' + ox + '" cy="' + oy + '" rx="' + (16 + b0 * 6) + '" ry="' + (16 + a0 * 6) + '" fill="#fcf5e3" stroke="#c88d21" stroke-width="2"/>';
    }

    // Horizontal lines (first number a)
    allYs.forEach((y) => {
      svg += '<line x1="' + minX + '" y1="' + y + '" x2="' + maxX + '" y2="' + y + '" stroke="#b4232c" stroke-width="2" stroke-linecap="round"/>';
    });
    // Vertical lines (second number b)
    allXs.forEach((x) => {
      svg += '<line x1="' + x + '" y1="' + minY + '" x2="' + x + '" y2="' + maxY + '" stroke="#0f5d84" stroke-width="2" stroke-linecap="round"/>';
    });

    // Digit labels
    svg += '<text x="20" y="' + ((topYs[0] + topYs[topYs.length - 1]) / 2 + 5) + '" text-anchor="middle" fill="#b4232c" font-size="14" font-weight="800">' + a1 + '</text>';
    svg += '<text x="20" y="' + ((botYs[0] + botYs[botYs.length - 1]) / 2 + 5) + '" text-anchor="middle" fill="#b4232c" font-size="14" font-weight="800">' + a0 + '</text>';
    svg += '<text x="' + ((leftXs[0] + leftXs[leftXs.length - 1]) / 2) + '" y="205" text-anchor="middle" fill="#0f5d84" font-size="14" font-weight="800">' + b1 + '</text>';
    svg += '<text x="' + ((rightXs[0] + rightXs[rightXs.length - 1]) / 2) + '" y="205" text-anchor="middle" fill="#0f5d84" font-size="14" font-weight="800">' + b0 + '</text>';

    // Intersection dots
    topYs.forEach((y) => {
      leftXs.forEach((x) => {
        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (step >= 3 ? 4.5 : 3) + '" fill="' + (step >= 3 ? '#3b6b18' : '#1c362d') + '"/>';
      });
      rightXs.forEach((x) => {
        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (step >= 2 ? 4.5 : 3) + '" fill="' + (step >= 2 ? '#0f5d84' : '#1c362d') + '"/>';
      });
    });
    botYs.forEach((y) => {
      leftXs.forEach((x) => {
        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (step >= 2 ? 4.5 : 3) + '" fill="' + (step >= 2 ? '#0f5d84' : '#1c362d') + '"/>';
      });
      rightXs.forEach((x) => {
        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (step >= 1 ? 4.5 : 3) + '" fill="' + (step >= 1 ? '#c88d21' : '#1c362d') + '"/>';
      });
    });

    svg += '</svg>';

    const notes = [
      'رسمنا <bdi dir="ltr">' + a1 + '</bdi> و<bdi dir="ltr">' + a0 + '</bdi> خطوط أفقية للعدد <bdi dir="ltr">' + ex.a + '</bdi>، و<bdi dir="ltr">' + b1 + '</bdi> و<bdi dir="ltr">' + b0 + '</bdi> خطوط عمودية للعدد <bdi dir="ltr">' + ex.b + '</bdi>. اضغط «الخطوة التالية» لعدّ نقاط التقاطع!',
      'الخطوة 1 (الآحاد: الزاوية السفلية اليمنى): عدد نقاط التقاطع = <bdi dir="ltr">' + a0 + ' × ' + b0 + ' = ' + onesCount + '</bdi>.',
      'الخطوة 2 (العشرات: المنطقتان القطريتان الوسطيان): <bdi dir="ltr">(' + a1 + ' × ' + b0 + ') + (' + a0 + ' × ' + b1 + ') = ' + (a1 * b0) + ' + ' + (a0 * b1) + ' = ' + tensCount + '</bdi>.',
      'الخطوة 3 (المئات: الزاوية العلوية اليسرى): <bdi dir="ltr">' + a1 + ' × ' + b1 + ' = ' + hundredsCount + '</bdi> · إذن <bdi dir="ltr">' + ex.a + ' × ' + ex.b + ' = ' + product + '</bdi>!'
    ];

    return { svg, note: notes[step] };
  }

  function renderLatticeSvg(ex, step) {
    const aDigits = String(ex.a).split('').map(Number); // 3 digits
    const bDigits = String(ex.b).split('').map(Number); // 2 digits
    const cellW = 58;
    const cellH = 54;
    const ox = 72;
    const oy = 38;
    const gridW = aDigits.length * cellW;
    const gridH = bDigits.length * cellH;

    // Precompute cell tens/ones
    const cells = bDigits.map((bd) =>
      aDigits.map((ad) => {
        const p = ad * bd;
        return { tens: Math.floor(p / 10), ones: p % 10 };
      })
    );

    // Compute diagonal sums from rightmost diagonal (idx 4) to leftmost (idx 0)
    // Diagonal index d = col + row + (0 for tens, 1 for ones)
    // For 3 cols (0,1,2) and 2 rows (0,1): d ranges 0..4
    const diagSums = [0, 0, 0, 0, 0];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        diagSums[c + r] += cells[r][c].tens;
        diagSums[c + r + 1] += cells[r][c].ones;
      }
    }
    const finalDigits = [0, 0, 0, 0, 0];
    const carries = [0, 0, 0, 0, 0];
    let carry = 0;
    for (let d = 4; d >= 0; d--) {
      const s = diagSums[d] + carry;
      finalDigits[d] = s % 10;
      carry = Math.floor(s / 10);
      if (d > 0) carries[d - 1] = carry;
    }

    let svg = '<svg class="u2-proj-svg" viewBox="0 0 320 202" role="img" aria-label="الطريقة الشبكية لضرب ' + ex.a + ' في ' + ex.b + '">';

    // Top digits (a)
    aDigits.forEach((d, c) => {
      svg += '<text x="' + (ox + c * cellW + cellW / 2) + '" y="' + (oy - 12) + '" text-anchor="middle" fill="#102820" font-size="16" font-weight="800">' + d + '</text>';
    });
    // Right digits (b)
    bDigits.forEach((d, r) => {
      svg += '<text x="' + (ox + gridW + 20) + '" y="' + (oy + r * cellH + cellH / 2 + 6) + '" text-anchor="middle" fill="#102820" font-size="16" font-weight="800">' + d + '</text>';
    });

    // Grid cells + diagonals
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = ox + c * cellW;
        const y = oy + r * cellH;
        const showCell = (r === 0 && step >= 1) || (r === 1 && step >= 2);
        const fillBg = showCell ? (r === 0 ? '#eef6e6' : '#e6f1f6') : '#ffffff';
        svg += '<rect x="' + x + '" y="' + y + '" width="' + cellW + '" height="' + cellH + '" fill="' + fillBg + '" stroke="#1c362d" stroke-width="1.6"/>';
        svg += '<line x1="' + x + '" y1="' + (y + cellH) + '" x2="' + (x + cellW) + '" y2="' + y + '" stroke="#6e8279" stroke-width="1.2"/>';
        if (showCell) {
          svg += '<text x="' + (x + 16) + '" y="' + (y + 20) + '" text-anchor="middle" fill="#0f5d84" font-size="14" font-weight="800">' + cells[r][c].tens + '</text>';
          svg += '<text x="' + (x + cellW - 15) + '" y="' + (y + cellH - 11) + '" text-anchor="middle" fill="#3b6b18" font-size="14" font-weight="800">' + cells[r][c].ones + '</text>';
        }
      }
    }

    // Final diagonal result digits around left & bottom when step >= 3
    if (step >= 3) {
      // Bottom 3 digits: finalDigits[2], finalDigits[3], finalDigits[4]
      for (let c = 0; c < 3; c++) {
        const tx = ox + c * cellW + 18;
        const ty = oy + gridH + 28;
        svg += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" fill="#b4232c" font-size="16" font-weight="800">' + finalDigits[c + 2] + '</text>';
        svg += '<line x1="' + (tx + 12) + '" y1="' + (oy + gridH + 4) + '" x2="' + (tx + 4) + '" y2="' + (ty - 14) + '" stroke="#0f5d84" stroke-width="1.6"/>';
      }
      // Left 2 digits: finalDigits[0] (top-left), finalDigits[1] (bottom-left)
      svg += '<text x="' + (ox - 26) + '" y="' + (oy + 32) + '" text-anchor="middle" fill="#b4232c" font-size="16" font-weight="800">' + finalDigits[0] + '</text>';
      svg += '<text x="' + (ox - 26) + '" y="' + (oy + cellH + 34) + '" text-anchor="middle" fill="#b4232c" font-size="16" font-weight="800">' + finalDigits[1] + '</text>';
      svg += '<line x1="' + (ox - 4) + '" y1="' + (oy + 24) + '" x2="' + (ox - 16) + '" y2="' + (oy + 28) + '" stroke="#0f5d84" stroke-width="1.6"/>';
      svg += '<line x1="' + (ox - 4) + '" y1="' + (oy + cellH + 26) + '" x2="' + (ox - 16) + '" y2="' + (oy + cellH + 30) + '" stroke="#0f5d84" stroke-width="1.6"/>';
    }

    svg += '</svg>';

    const prod = ex.a * ex.b;
    const notes = [
      'كتبنا أرقام <bdi dir="ltr">' + ex.a + '</bdi> أعلى الشبكة وأرقام <bdi dir="ltr">' + ex.b + '</bdi> على يمينها، وقسّمنا كل مربع بقطر إلى مثلثين (عشرات أعلى، آحاد أسفل).',
      'الخطوة 1 (الصف الأول × <bdi dir="ltr">' + bDigits[0] + '</bdi>): ضربنا كل رقم علوي في <bdi dir="ltr">' + bDigits[0] + '</bdi> ووزّعنا العشرات في الأعلى والآحاد في الأسفل.',
      'الخطوة 2 (الصف الثاني × <bdi dir="ltr">' + bDigits[1] + '</bdi>): ملأنا خلايا الصف الثاني بنواتج الضرب في <bdi dir="ltr">' + bDigits[1] + '</bdi>.',
      'الخطوة 3 (جمع الأقطار مع إعادة التجميع): نقرأ الأرقام الحمراء من أعلى اليسار إلى أسفل اليمين فنحصل على <bdi dir="ltr">' + ex.a + ' × ' + ex.b + ' = ' + prod + '</bdi>!'
    ];

    return { svg, note: notes[step] };
  }

  function renderProjectDialog() {
    const dlg = byId('u2-project-dialog');
    if (!dlg) return;

    dlg.querySelectorAll('[data-u2p-tab]').forEach((btn) => {
      const on = btn.dataset.u2pTab === activeTab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    const stage = byId('u2-proj-stage');
    if (!stage) return;
    stage.replaceChildren();

    if (activeTab === 'overview') {
      stage.innerHTML = ''
        + '<div class="u2-card is-tint">'
        + '<h3 class="u2-teach-panel-title">ما أهمية الوحدة الثانية (الضرب والقسمة)؟ · ص <bdi dir="ltr">28</bdi></h3>'
        + '<p class="u2-train-stop-desc">نستعمل عمليتي الضرب والقسمة كثيرًا في حياتنا اليومية؛ فمثلاً نستعملهما في أثناء التسوق لنحسب سعر العبوة الواحدة من الماء إذا علمنا سعر صندوق كبير يحتوي على عدد من العبوات.</p>'
        + '</div>'
        + '<div class="u2-proj-overview-grid">'
        + '<div class="u2-card">'
        + '<span class="u2-op-badge">تعلّمت سابقًا</span>'
        + '<ul class="u2-proj-list">'
        + '<li>ضرب الأعداد الكلية في <bdi dir="ltr">10</bdi>، <bdi dir="ltr">100</bdi>، <bdi dir="ltr">1000</bdi> وقسمتها عليها.</li>'
        + '<li>ضرب عدد كلي من <bdi dir="ltr">3</bdi> منازل في عدد من منزلة واحدة وقسمته عليه.</li>'
        + '<li>ضرب عدد من منزلتين في عدد من منزلتين.</li>'
        + '</ul>'
        + '</div>'
        + '<div class="u2-card is-info">'
        + '<span class="u2-op-badge is-half">سأتعلّم في هذه الوحدة</span>'
        + '<ul class="u2-proj-list">'
        + '<li>ضرب عدد من <bdi dir="ltr">4</bdi> منازل على الأكثر في عدد من منزلة واحدة.</li>'
        + '<li>ضرب عدد من <bdi dir="ltr">3</bdi> منازل على الأكثر في عدد من منزلتين.</li>'
        + '<li>قسمة عدد من <bdi dir="ltr">3</bdi> منازل على عدد من منزلتين.</li>'
        + '</ul>'
        + '</div>'
        + '</div>';
    } else if (activeTab === 'lines') {
      exploredLines = true;
      const presets = document.createElement('div');
      presets.className = 'u2-lab-presets';
      LINE_EXAMPLES.forEach((ex) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u2-lab-preset-btn' + (activeLineEx.id === ex.id ? ' is-active' : '');
        b.innerHTML = ex.label.replace(/(\d+\s*×\s*\d+)/g, '<bdi dir="ltr">$1</bdi>');
        b.addEventListener('click', () => {
          activeLineEx = ex;
          lineStep = 0;
          renderProjectDialog();
        });
        presets.append(b);
      });
      stage.append(presets);

      const { svg, note } = renderLineSvg(activeLineEx, lineStep);
      const svgCard = document.createElement('div');
      svgCard.className = 'u2-proj-svg-wrap';
      svgCard.innerHTML = svg;
      stage.append(svgCard);

      const sumEl = document.createElement('div');
      sumEl.className = 'u2-lab-summary';
      sumEl.innerHTML = note;
      stage.append(sumEl);

      const ctrls = document.createElement('div');
      ctrls.className = 'u2-lab-controls';
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'u2-action-btn';
      prevBtn.disabled = lineStep <= 0;
      prevBtn.textContent = 'خطوة سابقة';
      prevBtn.addEventListener('click', () => {
        lineStep = Math.max(0, lineStep - 1);
        renderProjectDialog();
      });
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'u2-action-btn is-primary';
      nextBtn.disabled = lineStep >= 3;
      nextBtn.textContent = lineStep === 0 ? 'ابدأ عدّ التقاطعات' : 'الخطوة التالية';
      nextBtn.addEventListener('click', () => {
        lineStep = Math.min(3, lineStep + 1);
        if (typeof sound === 'function') sound(true);
        renderProjectDialog();
      });
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'u2-action-btn';
      allBtn.disabled = lineStep >= 3;
      allBtn.textContent = 'عرض الناتج كاملًا';
      allBtn.addEventListener('click', () => {
        lineStep = 3;
        renderProjectDialog();
      });
      ctrls.append(prevBtn, nextBtn, allBtn);
      stage.append(ctrls);
    } else {
      exploredLattice = true;
      const presets = document.createElement('div');
      presets.className = 'u2-lab-presets';
      LATTICE_EXAMPLES.forEach((ex) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'u2-lab-preset-btn' + (activeLatticeEx.id === ex.id ? ' is-active' : '');
        b.innerHTML = ex.label.replace(/(\d+\s*×\s*\d+)/g, '<bdi dir="ltr">$1</bdi>');
        b.addEventListener('click', () => {
          activeLatticeEx = ex;
          latticeStep = 0;
          renderProjectDialog();
        });
        presets.append(b);
      });
      stage.append(presets);

      const { svg, note } = renderLatticeSvg(activeLatticeEx, latticeStep);
      const svgCard = document.createElement('div');
      svgCard.className = 'u2-proj-svg-wrap';
      svgCard.innerHTML = svg;
      stage.append(svgCard);

      const sumEl = document.createElement('div');
      sumEl.className = 'u2-lab-summary';
      sumEl.innerHTML = note;
      stage.append(sumEl);

      const ctrls = document.createElement('div');
      ctrls.className = 'u2-lab-controls';
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'u2-action-btn';
      prevBtn.disabled = latticeStep <= 0;
      prevBtn.textContent = 'خطوة سابقة';
      prevBtn.addEventListener('click', () => {
        latticeStep = Math.max(0, latticeStep - 1);
        renderProjectDialog();
      });
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'u2-action-btn is-primary';
      nextBtn.disabled = latticeStep >= 3;
      nextBtn.textContent = latticeStep === 0 ? 'ملء الصف الأول' : 'الخطوة التالية';
      nextBtn.addEventListener('click', () => {
        latticeStep = Math.min(3, latticeStep + 1);
        if (typeof sound === 'function') sound(true);
        renderProjectDialog();
      });
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'u2-action-btn';
      allBtn.disabled = latticeStep >= 3;
      allBtn.textContent = 'عرض الشبكة كاملة';
      allBtn.addEventListener('click', () => {
        latticeStep = 3;
        renderProjectDialog();
      });
      ctrls.append(prevBtn, nextBtn, allBtn);
      stage.append(ctrls);
    }

    // Completion Bar
    const compWrap = byId('u2-proj-complete-bar');
    if (compWrap) {
      const done = Boolean(typeof state === 'object' && state && state.unit2ProjectDone);
      const bothExplored = exploredLines && exploredLattice;
      compWrap.innerHTML = ''
        + '<div class="u2-proj-check-pills">'
        + '<span class="u2-op-badge' + (exploredLines ? '' : ' is-gold') + '">' + (exploredLines ? 'تم استكشاف الضرب بالخطوط' : 'استكشف الضرب بالخطوط') + '</span>'
        + '<span class="u2-op-badge' + (exploredLattice ? '' : ' is-gold') + '">' + (exploredLattice ? 'تم استكشاف الطريقة الشبكية' : 'استكشف الطريقة الشبكية') + '</span>'
        + '</div>'
        + '<button type="button" class="u2-action-btn is-primary" id="u2-proj-finish-btn"' + (done ? '' : (bothExplored ? '' : '')) + '>'
        + (done ? 'مكتمل · الانتقال إلى الدرس 1 (الضرب الذهني)' : 'إنجاز مشروع الوحدة الثانية (+25 نقطة)')
        + '</button>';

      byId('u2-proj-finish-btn')?.addEventListener('click', () => {
        if (typeof state === 'object' && state) {
          const wasDone = Boolean(state.unit2ProjectDone);
          state.unit2ProjectDone = true;
          if (typeof saveState === 'function') saveState();
          if (typeof renderHUD === 'function') renderHUD();
          if (typeof renderDuolingoMap === 'function') renderDuolingoMap();
          if (!wasDone) {
            if (typeof sound === 'function') sound(true);
            if (typeof guide === 'function') {
              guide('أحسنت! أتممت مشروع الوحدة الثانية (الضرب بالخطوط والطريقة الشبكية) وحصلت على 25 نقطة.', 5000);
            }
          }
        }
        dlg.close();
        if (typeof setMapSubView === 'function' && typeof isU2L1Unlocked === 'function' && isU2L1Unlocked()) {
          setMapSubView('u2_lesson1', true);
        }
      });
    }
  }

  function setupUnit2ProjectEvents() {
    if (projBound) return;
    const dlg = byId('u2-project-dialog');
    if (!dlg) return;
    projBound = true;

    byId('u2-proj-close')?.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
    dlg.querySelectorAll('[data-u2p-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.u2pTab || 'overview';
        renderProjectDialog();
      });
    });

    renderProjectDialog();
  }

  function openUnit2Project(initialTab) {
    setupUnit2ProjectEvents();
    const dlg = byId('u2-project-dialog');
    if (!dlg) return;
    if (initialTab) activeTab = initialTab;
    renderProjectDialog();
    if (!dlg.open) dlg.showModal();
  }

  global.setupUnit2ProjectEvents = setupUnit2ProjectEvents;
  global.openUnit2Project = openUnit2Project;
})(window);
