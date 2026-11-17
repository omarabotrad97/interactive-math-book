/* Lesson 5: خطة حل المسألة: أنشئ جدولاً — Interactive Table Strategy Lab (#table-lab-dialog) */

(function (global) {
  let labSetupDone = false;
  let currentPreset = 'marbles';
  let revealedCols = 1;

  const LAB_PRESETS = {
    marbles: {
      title: 'كرات مهند (ص 24)',
      ruleChip: 'المجموع المطلوب: 24 كرة · كل 1 خضراء يقابلها 3 حمراء',
      kind: 'grid',
      colHeads: ['١', '٢', '٣', '٤', '٥', '٦'],
      rows: [
        { label: 'أخضر', tone: 'green', vals: ['1', '2', '3', '4', '5', '6'] },
        { label: 'أحمر', tone: 'red', vals: ['3', '6', '9', '12', '15', '18'] },
        { label: 'المجموع', tone: 'sum', vals: ['4', '8', '12', '16', '20', '24'] }
      ],
      notes: [
        'العمود 1: 1 خضراء + 3 حمراء = 4 كرات.',
        'العمود 2: 2 خضراء + 6 حمراء = 8 كرات.',
        'العمود 3: 3 خضراء + 9 حمراء = 12 كرة.',
        'العمود 4: 4 خضراء + 12 حمراء = 16 كرة.',
        'العمود 5: 5 خضراء + 15 حمراء = 20 كرة.',
        'الحل (عمود 6): 6 خضراء و18 حمراء = 24 كرة · التحقق: <bdi dir="ltr">6 × 3 = 18</bdi>.'
      ]
    },
    flowers: {
      title: 'زهور لمياء (ص 25)',
      ruleChip: 'المجموع المطلوب: 36 زهرة · مقابل كل 1 صفراء 8 حمراء',
      kind: 'grid',
      colHeads: ['١', '٢', '٣', '٤'],
      rows: [
        { label: 'صفراء', tone: 'sum', vals: ['1', '2', '3', '4'] },
        { label: 'حمراء', tone: 'red', vals: ['8', '16', '24', '32'] },
        { label: 'المجموع', tone: 'green', vals: ['9', '18', '27', '36'] }
      ],
      notes: [
        'العمود 1: 1 صفراء + 8 حمراء = 9 زهرات.',
        'العمود 2: 2 صفراء + 16 حمراء = 18 زهرة.',
        'العمود 3: 3 صفراء + 24 حمراء = 27 زهرة.',
        'الحل (عمود 4): 4 صفراء و32 حمراء = 36 زهرة · التحقق: <bdi dir="ltr">4 × 8 = 32</bdi>.'
      ]
    },
    outfits: {
      title: 'ملابس مازن (ص 25)',
      ruleChip: '3 قمصان (أزرق، رمادي، أبيض) مع 4 ربطات عنق لكل قميص',
      kind: 'grid',
      colHeads: ['أزرق', 'رمادي', 'أبيض'],
      rows: [
        { label: 'ربطات العنق', tone: 'green', vals: ['4', '4', '4'] },
        { label: 'المجموع التراكمي', tone: 'sum', vals: ['4', '8', '12'] }
      ],
      notes: [
        'القميص الأزرق: 4 ربطات عنق مختلفة (المجموع: 4 طرق).',
        'إضافة القميص الرمادي: 4 طرق جديدة (المجموع: 8 طرق).',
        'الحل: 12 طريقة مختلفة · التحقق: <bdi dir="ltr">3 × 4 = 12</bdi>.'
      ]
    },
    coffee: {
      title: 'آلة القهوة (ص 25)',
      ruleChip: 'ثمن الكوب 50 قرشًا من فئتي 10 قروش و5 قروش',
      kind: 'grid',
      colHeads: ['١', '٢', '٣', '٤'],
      rows: [
        { label: 'فئة 10 قروش', tone: 'green', vals: ['4', '3', '2', '1'] },
        { label: 'فئة 5 قروش', tone: 'red', vals: ['2', '4', '6', '8'] },
        { label: 'المبلغ', tone: 'sum', vals: ['50', '50', '50', '50'] }
      ],
      notes: [
        'مجموعة 1: 4 عشرات (40) + 2 خمسات (10) = 50 قرشًا.',
        'مجموعة 2: 3 عشرات (30) + 4 خمسات (20) = 50 قرشًا.',
        'مجموعة 3: 2 عشرات (20) + 6 خمسات (30) = 50 قرشًا.',
        'مجموعة 4: 1 عشرة + 8 خمسات = 50 قرشًا (وتُضاف حالتا الفئة الواحدة).'
      ]
    },
    rope: {
      title: 'القفز بالحبل (ص 25)',
      ruleChip: 'ريما ولانا وسحر وديمة: 2 تمسكان و2 تقفزان بلا تكرار',
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
        'البديل 1: تمسك (ريما ولانا) وتقفز (سحر وديمة).',
        'البديل 2: تمسك (ريما وسحر) وتقفز (لانا وديمة).',
        'البديل 3: تمسك (ريما وديمة) وتقفز (لانا وسحر).',
        'البديل 4: تمسك (لانا وسحر) وتقفز (ريما وديمة).',
        'البديل 5: تمسك (لانا وديمة) وتقفز (ريما وسحر).',
        'البديل 6 (اكتمل الحصر): تمسك (سحر وديمة) وتقفز (ريما ولانا) — المجموع 6 طرق.'
      ]
    }
  };

  function getMaxSteps(preset) {
    if (!preset) return 1;
    return preset.kind === 'pairs' ? preset.pairs.length : preset.colHeads.length;
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
            <div class="l5-pair-card${active ? ' is-selected' : ''}" style="${shown ? '' : 'opacity:0.35'}">
              <div class="l5-pair-static is-top">${p.num}) تمسك: ${shown ? p.hold : '؟'}</div>
              <div class="l5-pair-static">تقفز: ${shown ? p.jump : '؟'}</div>
            </div>`;
        }).join('');
        stage.innerHTML = `
          <div class="l5-table-card">
            <div class="l5-table-rule-chip">${preset.ruleChip}</div>
            <div class="l5-pair-grid">${cardsHtml}</div>
          </div>`;
      } else {
        const cols = preset.colHeads.length;
        const headHtml = `<div class="l5-cell-head">البيان</div>` +
          preset.colHeads.map((h, i) => `<div class="l5-cell-head${i === revealedCols - 1 ? ' is-active-col' : ''}">${h}</div>`).join('');
        const rowsHtml = preset.rows.map((r) => {
          const cells = r.vals.map((v, i) => {
            const shown = i < revealedCols;
            const active = i === revealedCols - 1;
            const cls = `l5-cell-static tone-${r.tone}${active ? ' is-active-col' : ''}${shown ? '' : ' is-dim'}`;
            return `<div class="${cls}"><bdi dir="ltr">${shown ? v : '؟'}</bdi></div>`;
          }).join('');
          return `<div class="l5-row-lbl tone-${r.tone}">${r.label}</div>${cells}`;
        }).join('');
        stage.innerHTML = `
          <div class="l5-table-card">
            <div class="l5-table-rule-chip">${preset.ruleChip}</div>
            <div class="l5-data-table${cols >= 5 ? ' is-static-wide' : ''}" style="--l5-cols:${cols}">
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
