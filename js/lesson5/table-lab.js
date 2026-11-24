/* Lesson 5: خطة حل المسألة: أنشئ جدولاً — Interactive Table Strategy Lab (#table-lab-dialog) */

(function (global) {
  let labSetupDone = false;
  let currentPreset = 'marbles';
  let revealedCols = 1;

  const LAB_PRESETS = {
    marbles: {
      title: 'كرات مهند (ص 24)',
      ruleChip: 'المجموع المطلوب: 24 كرة · كل 1 خضراء يقابلها 3 حمراء (+4 كل صف)',
      kind: 'vgrid',
      columns: [
        { label: 'أخضر', tone: 'green' },
        { label: 'أحمر (× 3)', tone: 'red' },
        { label: 'المجموع', tone: 'sum' }
      ],
      rows: [
        { vals: ['1', '3', '4'] },
        { vals: ['2', '6', '8'] },
        { vals: ['3', '9', '12'] },
        { vals: ['4', '12', '16'] },
        { vals: ['5', '15', '20'] },
        { vals: ['6', '18', '24'], isGoal: true }
      ],
      notes: [
        'الصف 1: <bdi dir="ltr">1 + 3 = 4</bdi> كرات (لم نصل بعد إلى 24).',
        'الصف 2: <bdi dir="ltr">2 + 6 = 8</bdi> كرات.',
        'الصف 3: <bdi dir="ltr">3 + 9 = 12</bdi> كرة.',
        'الصف 4: <bdi dir="ltr">4 + 12 = 16</bdi> كرة.',
        'الصف 5: <bdi dir="ltr">5 + 15 = 20</bdi> كرة.',
        'وصلنا للهدف (الصف 6): 6 خضراء و18 حمراء · التحقق: <bdi dir="ltr">6 × 3 = 18</bdi> و <bdi dir="ltr">6 + 18 = 24</bdi>.'
      ]
    },
    flowers: {
      title: 'زهور لمياء (ص 25)',
      ruleChip: 'المجموع المطلوب: 36 زهرة · مقابل كل 1 صفراء 8 حمراء (+9 كل صف)',
      kind: 'vgrid',
      columns: [
        { label: 'صفراء', tone: 'gold' },
        { label: 'حمراء (× 8)', tone: 'red' },
        { label: 'المجموع', tone: 'sum' }
      ],
      rows: [
        { vals: ['1', '8', '9'] },
        { vals: ['2', '16', '18'] },
        { vals: ['3', '24', '27'] },
        { vals: ['4', '32', '36'], isGoal: true }
      ],
      notes: [
        'الصف 1: <bdi dir="ltr">1 + 8 = 9</bdi> زهرات.',
        'الصف 2: <bdi dir="ltr">2 + 16 = 18</bdi> زهرة.',
        'الصف 3: <bdi dir="ltr">3 + 24 = 27</bdi> زهرة.',
        'وصلنا للهدف (الصف 4): 4 صفراء و32 حمراء · التحقق: <bdi dir="ltr">4 × 8 = 32</bdi> و <bdi dir="ltr">4 + 32 = 36</bdi>.'
      ]
    },
    outfits: {
      title: 'ملابس مازن (ص 25)',
      ruleChip: '3 قمصان (أزرق، رمادي، أبيض) مع 4 ربطات عنق لكل قميص',
      kind: 'vgrid',
      columns: [
        { label: 'القميص', tone: 'neutral' },
        { label: 'عدد الربطات', tone: 'green' },
        { label: 'التراكمي', tone: 'sum' }
      ],
      rows: [
        { vals: ['أزرق', '4', '4'], textCols: [0] },
        { vals: ['رمادي', '4', '8'], textCols: [0] },
        { vals: ['أبيض', '4', '12'], textCols: [0], isGoal: true }
      ],
      notes: [
        'القميص الأزرق مع 4 ربطات مختلفة = 4 طرق.',
        'نضيف القميص الرمادي (4 طرق جديدة): <bdi dir="ltr">4 + 4 = 8</bdi> طرق.',
        'نضيف القميص الأبيض: <bdi dir="ltr">8 + 4 = 12</bdi> طريقة · التحقق: <bdi dir="ltr">3 × 4 = 12</bdi>.'
      ]
    },
    coffee: {
      title: 'آلة القهوة (ص 25)',
      ruleChip: 'ثمن الكوب 50 قرشًا · كلما نقصت عشرة نزيد خمستين',
      kind: 'vgrid',
      columns: [
        { label: 'فئة 10 قروش', tone: 'green' },
        { label: 'فئة 5 قروش', tone: 'red' },
        { label: 'القيمة', tone: 'sum' }
      ],
      rows: [
        { vals: ['5 (50 ق)', '0', '50'], textCols: [0] },
        { vals: ['4 (40 ق)', '2 (10 ق)', '50'], textCols: [0, 1] },
        { vals: ['3 (30 ق)', '4 (20 ق)', '50'], textCols: [0, 1] },
        { vals: ['2 (20 ق)', '6 (30 ق)', '50'], textCols: [0, 1] },
        { vals: ['1 (10 ق)', '8 (40 ق)', '50'], textCols: [0, 1] },
        { vals: ['0', '10 (50 ق)', '50'], textCols: [1], isGoal: true }
      ],
      notes: [
        'فئة واحدة: 5 عشرات + 0 خمسات = <bdi dir="ltr">50</bdi> قرشًا.',
        'الفئتان معًا (1): <bdi dir="ltr">40 + 10 = 50</bdi> قرشًا (4 عشرات وقطعتان من فئة 5).',
        'الفئتان معًا (2): <bdi dir="ltr">30 + 20 = 50</bdi> قرشًا (3 عشرات و4 خمسات).',
        'الفئتان معًا (3): <bdi dir="ltr">20 + 30 = 50</bdi> قرشًا (عشرتان و6 خمسات).',
        'الفئتان معًا (4): <bdi dir="ltr">10 + 40 = 50</bdi> قرشًا (عشرة واحدة و8 خمسات).',
        'فئة واحدة: 0 عشرات + 10 خمسات = <bdi dir="ltr">50</bdi> قرشًا (إجمالاً 6 طرق: 4 بالفئتين + 2 بفئة واحدة).'
      ]
    },
    rope: {
      title: 'القفز بالحبل (ص 25)',
      ruleChip: 'ريما ولانا وسحر وديمة: 2 تمسكان و2 تقفزان بلا تكرار · المجموع <bdi dir="ltr">3 + 2 + 1 = 6</bdi>',
      kind: 'pairs',
      pairs: [
        { num: 1, hold: 'ريما ولانا', jump: 'سحر وديمة' },
        { num: 2, hold: 'ريما وسحر', jump: 'لانا وديمة' },
        { num: 3, hold: 'ريما وديمة', jump: 'لانا وسحر' },
        { num: 4, hold: 'لانا وسحر', jump: 'ريما وديمة' },
        { num: 5, hold: 'لانا وديمة', jump: 'ريما وسحر' },
        { num: 6, hold: 'سحر وديمة', jump: 'ريما ولانا' }
      ],
      notes: [
        'البديل 1 (مع ريما): تمسك (ريما ولانا) وتقفز (سحر وديمة).',
        'البديل 2 (مع ريما): تمسك (ريما وسحر) وتقفز (لانا وديمة).',
        'البديل 3 (مع ريما): تمسك (ريما وديمة) وتقفز (لانا وسحر).',
        'البديل 4 (مع لانا بلا تكرار): تمسك (لانا وسحر) وتقفز (ريما وديمة).',
        'البديل 5 (مع لانا بلا تكرار): تمسك (لانا وديمة) وتقفز (ريما وسحر).',
        'البديل 6 (اكتمل الحصر): تمسك (سحر وديمة) وتقفز (ريما ولانا) — المجموع 6 طرق.'
      ]
    }
  };

  function getMaxSteps(preset) {
    if (!preset) return 1;
    if (preset.kind === 'pairs') return preset.pairs.length;
    if (preset.kind === 'vgrid') return preset.rows.length;
    return preset.colHeads.length;
  }

  function renderLabStage() {
    const dlg = document.getElementById('table-lab-dialog');
    if (!dlg) return;
    const preset = LAB_PRESETS[currentPreset] || LAB_PRESETS.marbles;
    const maxSteps = getMaxSteps(preset);
    revealedCols = Math.max(1, Math.min(maxSteps, revealedCols));

    dlg.querySelectorAll('.table-lab-preset-btn').forEach((btn) => {
      const active = btn.dataset.preset === currentPreset;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    const stage = document.getElementById('table-lab-stage');
    const summaryEl = document.getElementById('table-lab-summary');
    const prevBtn = document.getElementById('table-lab-prev');
    const nextBtn = document.getElementById('table-lab-next');

    if (prevBtn) prevBtn.disabled = revealedCols <= 1;
    if (nextBtn) nextBtn.disabled = revealedCols >= maxSteps;

    if (stage) {
      if (preset.kind === 'pairs') {
        const cardsHtml = preset.pairs.map((p, idx) => {
          const shown = idx < revealedCols;
          const active = idx === revealedCols - 1;
          return `
            <div class="l5-pair-card${active ? ' is-card-active' : ''}${shown ? '' : ' is-dim'}">
              <div class="l5-pair-num">الطريقة <bdi dir="ltr">${p.num}</bdi></div>
              <div class="l5-pair-static is-top">تمسك: ${shown ? p.hold : '؟'}</div>
              <div class="l5-pair-static">تقفز: ${shown ? p.jump : '؟'}</div>
            </div>`;
        }).join('');
        stage.innerHTML = `
          <div class="l5-table-card">
            <div class="l5-table-rule-chip">${preset.ruleChip}</div>
            <div class="l5-pair-grid">${cardsHtml}</div>
          </div>`;
      } else {
        const cols = preset.columns.length;
        const headHtml = preset.columns.map((c) =>
          `<div class="l5-vcell-head tone-${c.tone || 'neutral'}">${c.label}</div>`
        ).join('');
        const rowsHtml = preset.rows.map((r, rIdx) => {
          const shown = rIdx < revealedCols;
          const active = rIdx === revealedCols - 1;
          return r.vals.map((v, cIdx) => {
            const tone = preset.columns[cIdx]?.tone || 'neutral';
            const isTxt = Array.isArray(r.textCols) && r.textCols.includes(cIdx);
            const cls = `l5-vcell-static tone-${tone}${active ? ' is-active-row' : ''}${shown && r.isGoal ? ' is-goal' : ''}${shown ? '' : ' is-dim'}`;
            const valHtml = shown ? (isTxt ? v : `<bdi dir="ltr">${v}</bdi>`) : '<bdi dir="ltr">؟</bdi>';
            return `<div class="${cls}">${valHtml}</div>`;
          }).join('');
        }).join('');
        stage.innerHTML = `
          <div class="l5-table-card">
            <div class="l5-table-rule-chip">${preset.ruleChip}</div>
            <div class="l5-vtable" style="--l5-vcols:${cols}">
              ${headHtml}
              ${rowsHtml}
            </div>
          </div>`;
      }
    }

    if (summaryEl) {
      const idx = Math.min(preset.notes.length - 1, Math.max(0, revealedCols - 1));
      summaryEl.innerHTML = preset.notes[idx];
    }
  }

  function applyPreset(key) {
    currentPreset = LAB_PRESETS[key] ? key : 'marbles';
    revealedCols = 1;
    renderLabStage();
  }

  function setupTableLabEvents() {
    const dlg = document.getElementById('table-lab-dialog');
    if (!dlg || labSetupDone) return;
    labSetupDone = true;

    const closeBtn = document.getElementById('table-lab-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());

    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });

    dlg.querySelectorAll('.table-lab-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    const prevBtn = document.getElementById('table-lab-prev');
    const nextBtn = document.getElementById('table-lab-next');
    const allBtn = document.getElementById('table-lab-all');
    const speakBtn = document.getElementById('table-lab-speak');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (revealedCols > 1) {
          revealedCols -= 1;
          renderLabStage();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const preset = LAB_PRESETS[currentPreset] || LAB_PRESETS.marbles;
        const maxSteps = getMaxSteps(preset);
        if (revealedCols < maxSteps) {
          revealedCols += 1;
          renderLabStage();
        }
      });
    }
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        const preset = LAB_PRESETS[currentPreset] || LAB_PRESETS.marbles;
        revealedCols = getMaxSteps(preset);
        renderLabStage();
      });
    }
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if (typeof speakText === 'function') {
          const summaryEl = document.getElementById('table-lab-summary');
          if (summaryEl) speakText(summaryEl.textContent);
        } else if (typeof speak === 'function') {
          const summaryEl = document.getElementById('table-lab-summary');
          if (summaryEl) speak(summaryEl.textContent);
        }
      });
    }

    renderLabStage();
  }

  function openTableStrategyLab(presetKey) {
    setupTableLabEvents();
    if (presetKey && LAB_PRESETS[presetKey]) applyPreset(presetKey);
    else renderLabStage();
    const dlg = document.getElementById('table-lab-dialog');
    if (dlg && typeof dlg.showModal === 'function') {
      dlg.removeAttribute('inert');
      dlg.removeAttribute('aria-hidden');
      if (!dlg.open) dlg.showModal();
    }
  }

  global.setupTableLabEvents = setupTableLabEvents;
  global.openTableStrategyLab = openTableStrategyLab;
})(window);
