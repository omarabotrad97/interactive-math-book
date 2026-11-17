/* Lesson 4: الأعداد السالبة — Standalone Interactive Lab (#neg-lab-dialog) & Shared Visual Helpers */

(function (global) {
  let labSetupDone = false;
  let currentMode = 'line'; // 'line' | 'thermo' | 'altitude'
  let currentVal = -3;
  let dropDemoNote = '';

  function bdiNum(val, forcePlus, unit) {
    const n = Number(val);
    const cls = n < 0 ? 'is-neg' : (n > 0 ? 'is-pos' : 'is-zero');
    const txt = (n > 0 && forcePlus) ? ('+' + n) : String(n);
    const suffix = unit ? String(unit) : '';
    return `<bdi class="l4-signed ${cls}" dir="ltr">${txt}${suffix}</bdi>`;
  }

  /**
   * Generates a crisp, accessible SVG Celsius thermometer shared across stations and lab.
   */
  function buildThermometerSVG(temp, minVal, maxVal, opts) {
    const min = Number.isFinite(minVal) ? minVal : -5;
    const max = Number.isFinite(maxVal) ? maxVal : 5;
    const val = Math.max(min, Math.min(max, Number(temp) || 0));
    const compact = Boolean(opts && opts.compact);
    const ratio = (val - min) / Math.max(1, max - min);

    const w = compact ? 76 : 92;
    const h = compact ? 168 : 206;
    const tubeTop = 22;
    const tubeBot = h - 38;
    const tubeH = tubeBot - tubeTop;
    const fillH = Math.max(4, Math.round(ratio * tubeH));
    const fillY = tubeBot - fillH;
    const fillColor = val < 0 ? '#a82834' : (val > 0 ? '#0f5d84' : '#c88d21');

    // Major ticks depend on span
    const span = max - min;
    const majorStep = span <= 12 ? 1 : (span <= 30 ? 5 : 20);
    const ticks = [];
    for (let t = min; t <= max; t += majorStep) {
      const r = (t - min) / Math.max(1, span);
      const y = (tubeBot - r * tubeH).toFixed(1);
      const isZero = t === 0;
      const tickColor = isZero ? '#102a24' : (t < 0 ? '#a82834' : '#0f5d84');
      const tickLbl = t > 0 ? ('+' + t) : String(t);
      ticks.push(
        `<line x1="40" y1="${y}" x2="${isZero ? 53 : 49}" y2="${y}" stroke="${tickColor}" stroke-width="${isZero ? 2.4 : 1.5}"/>` +
        `<text x="56" y="${Number(y) + 3.5}" font-size="${compact ? 10 : 11}" font-weight="${isZero ? 800 : 700}" fill="${tickColor}" font-family="Segoe UI, Tahoma, sans-serif">${tickLbl}</text>`
      );
    }

    return `
      <svg class="l4-thermo-svg" dir="ltr" style="direction:ltr;unicode-bidi:isolate" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
        <rect x="6" y="4" width="${w - 12}" height="${h - 8}" rx="18" fill="#fffdf7" stroke="#dfd6c1" stroke-width="2"/>
        <text x="29" y="16" font-size="11" font-weight="800" fill="#102a24" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif">°C</text>
        <rect x="23" y="${tubeTop}" width="12" height="${tubeH + 10}" rx="6" fill="#ebe4d2" stroke="#bcae92" stroke-width="1.5"/>
        <rect x="25.5" y="${fillY}" width="7" height="${fillH + 12}" rx="3.5" fill="${fillColor}"/>
        <circle cx="29" cy="${h - 24}" r="12.5" fill="${fillColor}" stroke="#ffffff" stroke-width="2"/>
        ${ticks.join('')}
      </svg>`;
  }

  /**
   * Builds a large, high-clarity SVG thermometer (-10..+10) whose liquid column
   * transitions smoothly and aligns to exact 1-degree scale ticks.
   */
  function buildHeroThermometerSVG(initialTemp, opts) {
    const min = Number.isFinite(Number(opts && opts.min)) ? Number(opts.min) : -10;
    const max = Number.isFinite(Number(opts && opts.max)) ? Number(opts.max) : 10;
    const span = Math.max(1, max - min);
    const val = Math.max(min, Math.min(max, Number.isFinite(Number(initialTemp)) ? Number(initialTemp) : 0));
    const showMarker = Boolean(opts && opts.showMarker);
    const ratio = (val - min) / span;

    const w = 132;
    const h = 252;
    const tubeTop = 26;
    const tubeBot = 206;
    const tubeH = tubeBot - tubeTop; // 180px
    const color = val < 0 ? '#a82834' : (val > 0 ? '#0f5d84' : '#c88d21');
    const markerY = Number((tubeBot - ratio * tubeH).toFixed(1));
    const markerOffset = Number((markerY - 116).toFixed(1));
    const clipId = 'l4-hero-thermo-clip-' + Math.random().toString(36).slice(2, 7);

    const tickStep = span <= 36 ? 1 : (span <= 60 ? 5 : 10);
    const majorStep = span <= 12 ? 1 : (span <= 36 ? 5 : 20);
    const majorFontSize = span <= 12 ? 12 : (span <= 24 ? 14 : 13);

    const ticks = [];
    for (let t = min; t <= max; t += tickStep) {
      const r = (t - min) / span;
      const y = Number((tubeBot - r * tubeH).toFixed(1));
      const isZero = t === 0;
      const isMajor = t % majorStep === 0;
      const tickColor = isZero ? '#102a24' : (t < 0 ? '#a82834' : '#0f5d84');
      if (isZero) {
        ticks.push(
          `<line x1="18" y1="${y}" x2="28" y2="${y}" stroke="#102a24" stroke-width="2.4" stroke-linecap="round"/>` +
          `<line x1="60" y1="${y}" x2="73" y2="${y}" stroke="#102a24" stroke-width="2.4" stroke-linecap="round"/>` +
          `<rect x="76" y="${y - 12}" width="38" height="24" rx="12" fill="#fbf3db" stroke="#c88d21" stroke-width="1.8"/>` +
          `<text x="95" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="#102a24" font-family="Segoe UI, Tahoma, sans-serif">0</text>`
        );
      } else if (isMajor) {
        const lbl = t > 0 ? ('+' + t) : ('−' + Math.abs(t));
        ticks.push(
          `<line x1="60" y1="${y}" x2="72" y2="${y}" stroke="${tickColor}" stroke-width="1.8" stroke-linecap="round"/>` +
          `<text x="78" y="${y + 4.5}" font-size="${majorFontSize}" font-weight="700" fill="${tickColor}" font-family="Segoe UI, Tahoma, sans-serif">${lbl}</text>`
        );
      } else {
        ticks.push(
          `<line x1="60" y1="${y}" x2="66" y2="${y}" stroke="#bcae92" stroke-width="1.2" stroke-linecap="round"/>`
        );
      }
    }

    return `
      <svg class="l4-hero-thermo-svg" dir="ltr" style="direction:ltr;unicode-bidi:isolate" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="${clipId}">
            <rect x="38.5" y="23" width="11" height="190" rx="5.5"/>
          </clipPath>
        </defs>
        <text x="44" y="15" font-size="13" font-weight="800" fill="#102a24" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif">°C</text>
        <rect x="32" y="19" width="24" height="202" rx="12" fill="#f6f1e4" stroke="#bcae92" stroke-width="1.6"/>
        <rect x="37" y="23" width="14" height="190" rx="7" fill="#ebe4d2"/>
        <rect class="l4-hero-thermo-stem" x="38.5" y="205" width="11" height="22" fill="${color}"/>
        <g clip-path="url(#${clipId})">
          <rect class="l4-hero-thermo-liquid" x="38.5" y="${tubeTop}" width="11" height="${tubeH}" fill="${color}" style="transform: scaleY(${ratio});"/>
        </g>
        <circle class="l4-hero-thermo-bulb" cx="44" cy="228" r="16" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="44" cy="228" r="17.2" fill="none" stroke="#bcae92" stroke-width="1.4"/>
        <circle cx="39" cy="223" r="3.2" fill="rgba(255,255,255,0.38)"/>
        ${ticks.join('')}
        <g class="l4-hero-thermo-marker${showMarker ? ' is-visible' : ''}" style="transform: translateY(${markerOffset}px);">
          <polygon points="28,116 19,110.5 19,121.5" fill="${color}"/>
          <line x1="6" y1="116" x2="21" y2="116" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
        </g>
      </svg>`;
  }

  function updateHeroThermometerSVG(container, temp, opts) {
    if (!container) return;
    const min = Number.isFinite(Number(opts && opts.min)) ? Number(opts.min) : -10;
    const max = Number.isFinite(Number(opts && opts.max)) ? Number(opts.max) : 10;
    const span = Math.max(1, max - min);
    const val = Math.max(min, Math.min(max, Number.isFinite(Number(temp)) ? Number(temp) : 0));
    const ratio = (val - min) / span;
    const tubeBot = 206;
    const tubeH = 180;
    const markerY = Number((tubeBot - ratio * tubeH).toFixed(1));
    const markerOffset = Number((markerY - 116).toFixed(1));
    const color = val < 0 ? '#a82834' : (val > 0 ? '#0f5d84' : '#c88d21');
    const showMarker = Boolean(opts && opts.showMarker);

    const liquid = container.querySelector('.l4-hero-thermo-liquid');
    const stem = container.querySelector('.l4-hero-thermo-stem');
    const bulb = container.querySelector('.l4-hero-thermo-bulb');
    const marker = container.querySelector('.l4-hero-thermo-marker');

    if (liquid) {
      liquid.style.transform = `scaleY(${ratio})`;
      liquid.setAttribute('fill', color);
    }
    if (stem) stem.setAttribute('fill', color);
    if (bulb) bulb.setAttribute('fill', color);
    if (marker) {
      marker.classList.toggle('is-visible', showMarker);
      marker.style.transform = `translateY(${markerOffset}px)`;
      const poly = marker.querySelector('polygon');
      const line = marker.querySelector('line');
      if (poly) poly.setAttribute('fill', color);
      if (line) line.setAttribute('stroke', color);
    }
  }

  function getRangeForMode(mode) {
    if (mode === 'thermo') return { min: -20, max: 20, step: 1, unit: '°C' };
    if (mode === 'altitude') return { min: -50, max: 50, step: 5, unit: 'm' };
    return { min: -10, max: 10, step: 1, unit: '' };
  }

  function describeValue(mode, val) {
    const absVal = Math.abs(val);
    const opp = -val;
    const polWord = val < 0 ? 'عدد سالب (أقل من الصفر)' : (val > 0 ? 'عدد موجب (أكبر من الصفر)' : 'الصفر: حد فاصل ليس سالبًا ولا موجبًا');
    const dirLine = val < 0
      ? `يقع على بُعد ${bdiNum(absVal)} خطوات إلى يسار الصفر، ومعاكسه هو ${bdiNum(opp, true)}.`
      : (val > 0
        ? `يقع على بُعد ${bdiNum(absVal)} خطوات إلى يمين الصفر، ومعاكسه هو ${bdiNum(opp)}.`
        : 'يمثّل نقطة البداية أو نقطة المرجع.');

    let contextLine = '';
    if (mode === 'thermo') {
      if (val < 0) contextLine = `درجة الحرارة ${bdiNum(absVal)} تحت الصفر (${bdiNum(val, false, '°C')}) — طقس شديد البرودة.`;
      else if (val > 0) contextLine = `درجة الحرارة ${bdiNum(val, true, '°C')} فوق الصفر — طقس معتدل/دافئ فوق التجمد.`;
      else contextLine = `درجة تجمد الماء ${bdiNum(0, false, '°C')} (الحد الفاصل بين فوق الصفر وتحت الصفر).`;
    } else if (mode === 'altitude') {
      if (val < 0) contextLine = `مقدار ${bdiNum(absVal)} تحت مستوى سطح البحر أو تحت سطح الأرض (عمق/طابق سفلي).`;
      else if (val > 0) contextLine = `مقدار ${bdiNum(absVal)} فوق مستوى سطح البحر أو فوق سطح الأرض (ارتفاع/طابق علوي).`;
      else contextLine = `عند مستوى سطح البحر أو مستوى سطح الأرض تمامًا (المرجع = ${bdiNum(0)}).`;
    } else {
      contextLine = dirLine;
    }

    return { polWord, dirLine, contextLine };
  }

  function renderLabStage() {
    const dlg = document.getElementById('neg-lab-dialog');
    if (!dlg) return;

    const range = getRangeForMode(currentMode);
    currentVal = Math.max(range.min, Math.min(range.max, currentVal));

    const stage = document.getElementById('neg-lab-stage');
    const summaryEl = document.getElementById('neg-lab-summary');
    const slider = document.getElementById('neg-lab-slider');
    const valBadge = document.getElementById('neg-lab-val-badge');

    dlg.querySelectorAll('.neg-lab-mode-btn').forEach((b) => {
      const active = b.dataset.mode === currentMode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });

    if (slider) {
      slider.min = String(range.min);
      slider.max = String(range.max);
      slider.step = String(range.step);
      slider.value = String(currentVal);
    }

    if (valBadge) {
      const cls = currentVal < 0 ? 'is-neg' : (currentVal > 0 ? 'is-pos' : 'is-zero');
      valBadge.className = 'l4-signed-badge ' + cls;
      valBadge.innerHTML = bdiNum(currentVal, true) + (range.unit ? ' ' + range.unit : '');
    }

    if (stage) {
      if (currentMode === 'line') {
        const cols = [];
        for (let n = -10; n <= 10; n++) {
          const cls = n < 0 ? 'is-neg' : (n > 0 ? 'is-pos' : 'is-zero');
          const pressed = n === currentVal;
          const lbl = n > 0 ? ('+' + n) : String(n);
          cols.push(
            `<div class="l4-nline-col">
              <button type="button" class="l4-tick-btn ${cls}${pressed ? ' is-selected' : ''}" data-lab-tick="${n}" aria-pressed="${pressed}" aria-label="العدد ${lbl}">
                <span class="l4-tick-dot"></span>
              </button>
              <span class="l4-tick-label ${cls}">${lbl}</span>
            </div>`
          );
        }
        stage.innerHTML = `
          <div class="l4-nline-card">
            <div class="l4-nline-dir-row">
              <span class="l4-dir-chip is-neg">أعداد سالبة (يسار <bdi dir="ltr">0</bdi>)</span>
              <span class="l4-dir-chip is-pos">أعداد موجبة (يمين <bdi dir="ltr">0</bdi>)</span>
            </div>
            <div class="l4-nline-scroll">
              <div class="l4-nline-track-wrap">
                <div class="l4-nline-grid">${cols.join('')}</div>
              </div>
            </div>
          </div>`;
        stage.querySelectorAll('[data-lab-tick]').forEach((btn) => {
          btn.addEventListener('click', () => {
            currentVal = Number(btn.dataset.labTick);
            dropDemoNote = '';
            renderLabStage();
          });
        });
      } else if (currentMode === 'thermo') {
        stage.innerHTML = `
          <div class="l4-thermo-probe">
            ${buildThermometerSVG(currentVal, -20, 20, { compact: false })}
            <div class="l4-thermo-probe-controls">
              <div class="l4-thermo-readout">القراءة الحالية: ${bdiNum(currentVal, true, '°C')}</div>
              <p class="l4-nline-readout">${dropDemoNote || `حرّك المنزلق أو اختر مثالًا من الكتاب لملاحظة الحرارة فوق وتحت ${bdiNum(0, false, '°C')}.`}</p>
            </div>
          </div>`;
      } else {
        // Altitude / building vertical scale
        const landmarks = [
          { label: 'طائرة / أعلى البرج', val: 40, zone: 'sky' },
          { label: 'طائر محلق', val: 10, zone: 'sky' },
          { label: 'نقطة المرجع (سطح البحر / الأرض)', val: 0, zone: 'zero' },
          { label: 'سمكة القرش / الطابق 5 سفلي', val: -5, zone: 'sea' },
          { label: 'الطابق 7 تحت الأرض (روتانا)', val: -7, zone: 'sea' },
          { label: 'الأخطبوط', val: -10, zone: 'sea' },
          { label: 'السمكة (مثال 1)', val: -20, zone: 'deep' }
        ];
        const rowsHtml = landmarks.map((lm) => {
          const active = currentVal === lm.val;
          const cls = lm.val < 0 ? 'is-neg' : (lm.val > 0 ? 'is-pos' : 'is-zero');
          return `
            <button type="button" class="l4-vscale-row zone-${lm.zone}${active ? ' is-selected' : ''}" data-lab-alt="${lm.val}">
              <span class="l4-vscale-num ${cls}">${lm.val > 0 ? '+' + lm.val : lm.val}</span>
              <span class="l4-vscale-info"><strong>${lm.label}</strong></span>
              <span class="l4-signed-badge ${cls}">${lm.val === 0 ? 'مرجع' : (lm.val > 0 ? 'فوق' : 'تحت')}</span>
            </button>`;
        }).join('');
        stage.innerHTML = `
          <div class="l4-vscale-card">
            <div class="l4-vscale-title">مقياس البُعد عن المرجع بالأمتار أو الطوابق</div>
            <div class="l4-vscale-list">${rowsHtml}</div>
          </div>`;
        stage.querySelectorAll('[data-lab-alt]').forEach((btn) => {
          btn.addEventListener('click', () => {
            currentVal = Number(btn.dataset.labAlt);
            dropDemoNote = '';
            renderLabStage();
          });
        });
      }
    }

    if (summaryEl) {
      const info = describeValue(currentMode, currentVal);
      summaryEl.innerHTML = `
        <div><strong>التصنيف:</strong> ${info.polWord}</div>
        <div>${info.contextLine}</div>
        <div>${info.dirLine}</div>`;
    }
  }

  function applyPreset(presetKey) {
    dropDemoNote = '';
    if (presetKey === 'shubak') {
      currentMode = 'thermo';
      currentVal = -3;
    } else if (presetKey === 'fish') {
      currentMode = 'altitude';
      currentVal = -20;
    } else if (presetKey === 'plane') {
      currentMode = 'altitude';
      currentVal = 40;
    } else if (presetKey === 'rotana') {
      currentMode = 'altitude';
      currentVal = -7;
    } else if (presetKey === 'tafilah') {
      currentMode = 'thermo';
      currentVal = -5;
    } else if (presetKey === 'nevin') {
      currentMode = 'thermo';
      currentVal = -5;
      dropDemoNote = `تحدي نيفين: البداية ${bdiNum(5, true, '°C')} وبانخفاض ${bdiNum(10)} درجات نصل عبر الصفر إلى ${bdiNum(-5, false, '°C')} (وليس ${bdiNum(-10, false, '°C')}).`;
    }
    renderLabStage();
  }

  function setupNegLineLabEvents() {
    const dlg = document.getElementById('neg-lab-dialog');
    if (!dlg || labSetupDone) return;
    labSetupDone = true;

    const closeBtn = document.getElementById('neg-lab-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());

    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });

    dlg.querySelectorAll('.neg-lab-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode || 'line';
        dropDemoNote = '';
        renderLabStage();
      });
    });

    dlg.querySelectorAll('.neg-lab-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    const slider = document.getElementById('neg-lab-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        currentVal = Number(slider.value);
        dropDemoNote = '';
        renderLabStage();
      });
    }

    dlg.querySelectorAll('[data-lab-delta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const range = getRangeForMode(currentMode);
        const delta = Number(btn.dataset.labDelta);
        if (btn.dataset.labDelta === 'zero') {
          currentVal = 0;
        } else if (btn.dataset.labDelta === 'opp') {
          currentVal = -currentVal;
        } else {
          currentVal = Math.max(range.min, Math.min(range.max, currentVal + delta));
        }
        dropDemoNote = '';
        renderLabStage();
      });
    });

    const speakBtn = document.getElementById('neg-lab-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if (typeof speak !== 'function') return;
        const absVal = Math.abs(currentVal);
        const msg = currentVal < 0
          ? `العدد سالب ${absVal}، يقع على بُعد ${absVal} خطوات إلى يسار الصفر، وقيمته أقل من الصفر.`
          : (currentVal > 0
            ? `العدد موجب ${currentVal}، يقع على بُعد ${absVal} خطوات إلى يمين الصفر.`
            : 'الصفر هو نقطة البداية والحد الفاصل، وليس عددًا سالبًا ولا موجبًا.');
        speak(msg);
      });
    }

    renderLabStage();
  }

  function openNegativeNumbersLab(presetKey) {
    setupNegLineLabEvents();
    if (presetKey) applyPreset(presetKey);
    else renderLabStage();
    const dlg = document.getElementById('neg-lab-dialog');
    if (dlg && typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    }
  }

  function l4SceneVectorGroup(iconType) {
    switch (iconType) {
      case 'plane':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M-19 2 L6 2 L16 -4 C19 -5 20 -2 17 0 L7 7 L-17 7 L-20 3 Z" fill="#0f5d84" stroke="#102a24" stroke-width="1.4" stroke-linejoin="round"/>' +
            '<path d="M-3 2 L-11 -9 L-5 -9 L5 2 Z" fill="#38bdf8" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<path d="M-16 3 L-20 -5 L-15 -5 L-11 2 Z" fill="#e0f2fe" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<circle cx="9" cy="1.5" r="1.4" fill="#ffffff"/>' +
            '<circle cx="3" cy="2.5" r="1.2" fill="#ffffff"/>' +
            '<circle cx="-2" cy="2.5" r="1.2" fill="#ffffff"/>' +
          '</g>'
        );
      case 'boat':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M0 -17 L0 -1" stroke="#102a24" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M1 -16 L13 -4 L1 -4 Z" fill="#fef3c7" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<path d="M-1 -14 L-10 -4 L-1 -4 Z" fill="#fde68a" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<path d="M-16 -1 L16 -1 L12 7 L-12 7 Z" fill="#c88d21" stroke="#102a24" stroke-width="1.5" stroke-linejoin="round"/>' +
            '<path d="M-13 2.5 L13 2.5" stroke="#fff7ed" stroke-width="1.3" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'fish':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M10 0 L18 -7 L16 0 L18 7 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<ellipse cx="-2" cy="0" rx="13" ry="8" fill="#fb923c" stroke="#102a24" stroke-width="1.4"/>' +
            '<path d="M-4 -7.5 L1 -12 L4 -7 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<circle cx="-9" cy="-2" r="2" fill="#ffffff" stroke="#102a24" stroke-width="1"/>' +
            '<circle cx="-9.5" cy="-2" r="0.9" fill="#102a24"/>' +
            '<path d="M1 -5 Q4 0 1 5" fill="none" stroke="#fff7ed" stroke-width="1.3" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'bird':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M-15 -3 Q-6 -12 0 -2 Q6 -12 15 -3" fill="none" stroke="#0f5d84" stroke-width="2.4" stroke-linecap="round"/>' +
            '<ellipse cx="0" cy="1" rx="7" ry="4.5" fill="#e0f2fe" stroke="#102a24" stroke-width="1.3"/>' +
            '<path d="M-7 1 L-12 2.5 L-7 3.5 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1" stroke-linejoin="round"/>' +
            '<circle cx="-3.5" cy="0" r="1" fill="#102a24"/>' +
          '</g>'
        );
      case 'dolphin':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M-15 5 C-11 -6 1 -10 11 -2 C14 0 17 2 18 4 C13 3 9 2 6 3 C2 0 -4 1 -8 6 L-12 9 Z" fill="#0284c7" stroke="#102a24" stroke-width="1.4" stroke-linejoin="round"/>' +
            '<path d="M-1 -7 L3 -13 L5 -5 Z" fill="#0369a1" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<circle cx="9" cy="-1.5" r="1.1" fill="#ffffff"/>' +
          '</g>'
        );
      case 'shark':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M11 0 L19 -7 L16 0 L19 7 Z" fill="#475569" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<path d="M-16 1 C-12 -6 2 -7 12 0 C2 6 -11 6 -16 1 Z" fill="#64748b" stroke="#102a24" stroke-width="1.4" stroke-linejoin="round"/>' +
            '<path d="M-2 -5 L2 -13 L6 -4 Z" fill="#475569" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<circle cx="-10" cy="-1" r="1.2" fill="#ffffff"/>' +
            '<path d="M-5 -1 L-5 2 M-3 -1 L-3 2" stroke="#102a24" stroke-width="1" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'octopus':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<path d="M-9 2 C-12 7 -15 9 -14 12 M-4 3 C-5 8 -7 11 -5 13 M4 3 C5 8 7 11 5 13 M9 2 C12 7 15 9 14 12" fill="none" stroke="#be185d" stroke-width="2.2" stroke-linecap="round"/>' +
            '<circle cx="0" cy="-3" r="9.5" fill="#f472b6" stroke="#102a24" stroke-width="1.4"/>' +
            '<circle cx="-3.5" cy="-3" r="1.5" fill="#ffffff"/><circle cx="3.5" cy="-3" r="1.5" fill="#ffffff"/>' +
            '<circle cx="-3.5" cy="-3" r="0.7" fill="#102a24"/><circle cx="3.5" cy="-3" r="0.7" fill="#102a24"/>' +
          '</g>'
        );
      case 'tower':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<circle cx="0" cy="0" r="8" fill="#0f5d84" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="0" cy="0" r="3" fill="#fde68a"/>' +
          '</g>'
        );
      case 'ground':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<rect x="-10" y="-11" width="20" height="12" rx="2" fill="#fffdf7" stroke="#102a24" stroke-width="1.4"/>' +
            '<rect x="-4" y="-8" width="8" height="9" rx="1" fill="#c88d21" stroke="#102a24" stroke-width="1.1"/>' +
            '<path d="M-12 -11 L12 -11" stroke="#0f5d84" stroke-width="2.2" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'basement':
      default:
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            '<rect x="-10" y="-7" width="20" height="14" rx="3.5" fill="#9f1239" stroke="#ffffff" stroke-width="1.5"/>' +
            '<path d="M0 -3.5 L0 3.5 M-3.5 0.5 L0 4 L3.5 0.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</g>'
        );
    }
  }

  function buildTowerBackdropSVG(valToY, yZero) {
    const yRoof = valToY(50);
    const yBase7 = valToY(-7);
    const towerX = 166;
    const towerW = 54;
    const towerCenter = towerX + towerW / 2; // 193
    const lobbyTop = yZero - 14;
    const towerH = Math.max(20, lobbyTop - yRoof);
    const shaftTop = yZero;
    const shaftBottom = yBase7 + 10;
    const shaftH = Math.max(16, shaftBottom - shaftTop);

    // Subtle illuminated story bands along the 50-floor glass facade
    const floorRows = [];
    const bandCount = 8;
    for (let i = 1; i <= bandCount; i++) {
      const fy = yRoof + (towerH * i) / (bandCount + 1);
      floorRows.push(
        '<rect x="' + (towerX + 7) + '" y="' + (fy - 2.5).toFixed(1) + '" width="11" height="4.5" rx="1" fill="#bae6fd" opacity="0.88"/>' +
        '<rect x="' + (towerX + 21.5) + '" y="' + (fy - 2.5).toFixed(1) + '" width="11" height="4.5" rx="1" fill="#e0f2fe" opacity="0.95"/>' +
        '<rect x="' + (towerX + 36) + '" y="' + (fy - 2.5).toFixed(1) + '" width="11" height="4.5" rx="1" fill="#bae6fd" opacity="0.88"/>'
      );
    }

    // Underground basement floor partitions from 0 down to -7
    const basementLines = [];
    for (let b = 1; b <= 6; b++) {
      const by = valToY(-b);
      basementLines.push(
        '<line x1="' + (towerX + 4) + '" y1="' + by.toFixed(1) + '" x2="' + (towerX + towerW - 4) + '" y2="' + by.toFixed(1) + '" stroke="#94a3b8" stroke-width="0.9" opacity="0.7"/>'
      );
    }

    return (
      '<g class="l4-vscene-tower-arch" aria-hidden="true">' +
        // Underground 7-level basement cutaway shaft connected straight below the tower
        '<rect x="' + towerX + '" y="' + shaftTop.toFixed(2) + '" width="' + towerW + '" height="' + shaftH.toFixed(2) + '" rx="4" fill="#475569" stroke="#102a24" stroke-width="1.5"/>' +
        '<rect x="' + (towerX + 4) + '" y="' + (shaftTop + 1).toFixed(2) + '" width="' + (towerW - 8) + '" height="' + (shaftH - 5).toFixed(2) + '" rx="2" fill="#e2e8f0"/>' +
        basementLines.join('') +
        // Highlighted 7th underground level floor strip at yBase7
        '<rect x="' + (towerX + 4) + '" y="' + (yBase7 - 2.5).toFixed(2) + '" width="' + (towerW - 8) + '" height="5" rx="1" fill="#fda4af" opacity="0.85"/>' +
        // Main 50-story glass tower
        '<rect x="' + towerX + '" y="' + yRoof.toFixed(2) + '" width="' + towerW + '" height="' + towerH.toFixed(2) + '" rx="3" fill="#0f5d84" stroke="#102a24" stroke-width="1.5"/>' +
        '<rect x="' + (towerX + 3) + '" y="' + (yRoof + 3).toFixed(2) + '" width="' + (towerW - 6) + '" height="' + (towerH - 4).toFixed(2) + '" fill="#156b96"/>' +
        floorRows.join('') +
        // Rooftop crown parapet and spire right at +50
        '<rect x="' + (towerX - 2) + '" y="' + (yRoof - 3).toFixed(2) + '" width="' + (towerW + 4) + '" height="5" rx="2" fill="#102a24"/>' +
        '<line x1="' + towerCenter + '" y1="' + (yRoof - 13).toFixed(2) + '" x2="' + towerCenter + '" y2="' + (yRoof - 3).toFixed(2) + '" stroke="#102a24" stroke-width="2" stroke-linecap="round"/>' +
        // Ground-floor stone podium base spanning to left lobby doorway & main tower
        '<rect x="138" y="' + lobbyTop.toFixed(2) + '" width="88" height="14" rx="2.5" fill="#f5efe2" stroke="#102a24" stroke-width="1.5"/>' +
        '<line x1="138" y1="' + (lobbyTop + 4).toFixed(2) + '" x2="226" y2="' + (lobbyTop + 4).toFixed(2) + '" stroke="#cbd5e1" stroke-width="1"/>' +
      '</g>'
    );
  }

  function createVerticalSceneWidget(config) {
    const cfg = config || {};
    const theme = cfg.theme === 'tower' ? 'tower' : 'sea';
    const items = Array.isArray(cfg.items) ? cfg.items : [];
    const unitText = cfg.unitText != null ? String(cfg.unitText) : 'م';
    const zeroLabel = cfg.zeroLabel || (theme === 'tower' ? 'سطح الأرض: 0' : 'سطح البحر: 0 م');
    const maskedSet = new Set(Array.isArray(cfg.maskItemIndices) ? cfg.maskItemIndices : []);
    let revealedMask = Boolean(cfg.revealedMask);
    let compact = Boolean(cfg.compact);
    let highlightZero = Boolean(cfg.highlightZero);
    let selectedIdx = Number.isInteger(cfg.selectedIdx) ? cfg.selectedIdx : null;
    const exploredSet = new Set(Array.isArray(cfg.exploredIndices) ? cfg.exploredIndices : []);

    // Compute exact proportional scale range from item values + 0
    const rawVals = items.map(it => Number(it.val || 0)).concat([0]);
    const rawMin = Math.min(...rawVals);
    const rawMax = Math.max(...rawVals);
    let majorStep = 10;
    if (rawMax <= 12 && rawMin >= -12) majorStep = 5;
    else if (rawMax <= 45 && rawMin >= -25 && rawMax % 20 === 0 && rawMin % 20 === 0) majorStep = 20;
    const scaleMax = Math.max(majorStep, Math.ceil(rawMax / majorStep) * majorStep);
    const scaleMin = Math.min(-majorStep, Math.floor(rawMin / majorStep) * majorStep);
    const span = Math.max(1, scaleMax - scaleMin);

    // SVG coordinate space (fixed reference line & scale ticks; zero overlap for 3 or 4 items)
    const W = 340;
    const H = 214;
    const yTop = 32;
    const yBottom = 184;
    const pxPerUnit = (yBottom - yTop) / span;
    const valToY = val => yTop + (scaleMax - val) * pxPerUnit;
    const yZero = valToY(0);

    const xAxis = 54;
    const xMeasure = 70;
    const xCols = theme === 'tower'
      ? [193, 154, 214]
      : (items.length >= 4
        ? [126, 182, 238, 294]
        : (items.length === 3 ? [144, 218, 290] : (items.length === 2 ? [164, 260] : [206])));

    const formatSigned = (num, showPlusZeroFalse) => {
      const n = Math.round(num);
      if (n < 0) return '−' + Math.abs(n);
      if (n > 0) return '+' + n;
      return showPlusZeroFalse ? '0' : '0';
    };

    const uid = 'l4vs_' + Math.random().toString(36).slice(2, 8);
    const rootEl = document.createElement('div');
    rootEl.className = 'l4-vscene-surface' + (theme === 'tower' ? ' is-tower' : ' is-sea') + (compact ? ' is-compact' : '');

    // Build static SVG layers + dynamic animation slots
    const ticks = [];
    for (let v = scaleMin; v <= scaleMax; v += majorStep) {
      ticks.push(v);
    }

    const wavePathD = (() => {
      const pts = [];
      for (let x = 0; x <= W; x += 17) {
        const dy = (x / 17) % 2 === 0 ? -1.8 : 1.8;
        pts.push((x === 0 ? 'M' : 'L') + x + ' ' + (yZero + dy).toFixed(1));
      }
      return pts.join(' ');
    })();

    const topGradTop = theme === 'tower' ? '#e7f4fb' : '#dff1fb';
    const topGradBot = theme === 'tower' ? '#f7f9eb' : '#f2f9fd';
    const botGradTop = theme === 'tower' ? '#eadac2' : '#cfeaf7';
    const botGradBot = theme === 'tower' ? '#cbb28e' : '#96cde8';

    const ticksSVG = ticks.map(v => {
      const ty = valToY(v).toFixed(2);
      const isZ = v === 0;
      const tickLabel = v === 0 ? '0' : (v > 0 ? '+' + v : '−' + Math.abs(v));
      const cls = isZ ? 'is-zero' : (v > 0 ? 'is-pos' : 'is-neg');
      return (
        '<g class="l4-vscene-tick ' + cls + '">' +
          '<line x1="' + (xAxis - (isZ ? 8 : 5)) + '" y1="' + ty + '" x2="' + (xAxis + (isZ ? 5 : 2)) + '" y2="' + ty + '"/>' +
          '<text x="' + (xAxis - 12) + '" y="' + (Number(ty) + 3.5).toFixed(2) + '" text-anchor="end">' + tickLabel + '</text>' +
        '</g>'
      );
    }).join('');

    const hitW = items.length >= 4 ? 55 : 58;
    const itemsSVG = items.map((it, idx) => {
      const cx = xCols[idx] ?? 206;
      const cy = valToY(Number(it.val || 0));
      const isMask = !revealedMask && maskedSet.has(idx);
      const valText = isMask ? '؟' : String(it.displayVal ?? formatSigned(it.val));
      const pillW = Math.max(30, valText.length * 8 + 12);
      let pillX = 0;
      let pillY = cy < 48 ? 21 : (cy > H - 36 ? -24 : (it.val >= 0 ? -26 : 21));
      if (theme === 'tower') {
        if (it.val > 0) { pillX = 48; pillY = 0; }
        else if (it.val === 0) { pillX = 0; pillY = -27; }
        else { pillX = 32; pillY = 0; }
      }
      const clsZone = it.val > 0 ? 'is-pos' : (it.val < 0 ? 'is-neg' : 'is-zero');
      return (
        '<g class="l4-vscene-item ' + clsZone + '" data-item-idx="' + idx + '" transform="translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')" role="button" tabindex="0" aria-pressed="false" aria-label="' + escHtmlAttr(it.label + ' ' + valText) + '">' +
          '<circle class="l4-vscene-halo" cx="0" cy="0" r="23"/>' +
          l4SceneVectorGroup(it.iconType) +
          '<g class="l4-vscene-tag" aria-hidden="true" transform="translate(' + pillX + ',' + pillY + ')">' +
            '<rect x="' + (-pillW / 2).toFixed(1) + '" y="-9" width="' + pillW + '" height="18" rx="9"/>' +
            '<text aria-hidden="true" x="0" y="3.5" text-anchor="middle">' + valText + '</text>' +
          '</g>' +
          '<rect class="l4-vscene-hit" x="' + (-hitW / 2).toFixed(1) + '" y="-30" width="' + hitW + '" height="60" rx="10" fill="transparent"/>' +
        '</g>'
      );
    }).join('');

    // Zero label pill width
    const zeroPillW = Math.max(102, Math.min(132, zeroLabel.length * 6.5 + 16));

    const stageEl = document.createElement('div');
    stageEl.className = 'l4-vscene-stage';
    stageEl.innerHTML = (
      '<svg class="l4-vscene-svg" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="مشهد تفاعلي يوضح الارتفاع فوق المرجع والعمق تحته">' +
        '<defs>' +
          '<linearGradient id="' + uid + '_top" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + topGradTop + '"/>' +
            '<stop offset="100%" stop-color="' + topGradBot + '"/>' +
          '</linearGradient>' +
          '<linearGradient id="' + uid + '_bot" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + botGradTop + '"/>' +
            '<stop offset="100%" stop-color="' + botGradBot + '"/>' +
          '</linearGradient>' +
          '<clipPath id="' + uid + '_clip"><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/></clipPath>' +
        '</defs>' +
        '<g clip-path="url(#' + uid + '_clip)">' +
          '<rect x="0" y="0" width="' + W + '" height="' + yZero.toFixed(2) + '" fill="url(#' + uid + '_top)"/>' +
          '<rect x="0" y="' + yZero.toFixed(2) + '" width="' + W + '" height="' + (H - yZero).toFixed(2) + '" fill="url(#' + uid + '_bot)"/>' +
          (theme === 'sea'
            ? '<path class="l4-vscene-wave" d="' + wavePathD + '" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>'
            : '<line x1="0" y1="' + (yZero + 4).toFixed(1) + '" x2="' + W + '" y2="' + (yZero + 4).toFixed(1) + '" stroke="#b79b76" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="6 5"/>' + buildTowerBackdropSVG(valToY, yZero)) +
          '<line class="l4-vscene-zero-line" x1="' + xAxis + '" y1="' + yZero.toFixed(2) + '" x2="' + W + '" y2="' + yZero.toFixed(2) + '"/>' +
          '<g class="l4-vscene-zero-badge" transform="translate(' + (W - 6) + ',' + (yZero - 14).toFixed(2) + ')">' +
            '<rect x="' + (-zeroPillW) + '" y="-9" width="' + zeroPillW + '" height="18" rx="9"/>' +
            '<text x="' + (-zeroPillW / 2) + '" y="3.5" text-anchor="middle">' + escapeSvgText(zeroLabel) + '</text>' +
          '</g>' +
          '<g class="l4-vscene-axis">' +
            '<line class="l4-vscene-axis-spine" x1="' + xAxis + '" y1="' + (yTop - 10) + '" x2="' + xAxis + '" y2="' + (yBottom + 10) + '"/>' +
            ticksSVG +
          '</g>' +
          '<g class="l4-vscene-measure" hidden>' +
            '<line class="l4-vscene-proj-line" x1="0" y1="0" x2="0" y2="0"/>' +
            '<line class="l4-vscene-meas-line" x1="' + xMeasure + '" y1="' + yZero.toFixed(2) + '" x2="' + xMeasure + '" y2="' + yZero.toFixed(2) + '"/>' +
            '<circle class="l4-vscene-zero-anchor" cx="' + xMeasure + '" cy="' + yZero.toFixed(2) + '" r="3.5"/>' +
            '<circle class="l4-vscene-meas-dot" cx="' + xMeasure + '" cy="' + yZero.toFixed(2) + '" r="5"/>' +
            '<g class="l4-vscene-counter-pill" transform="translate(' + (xMeasure + 8) + ',' + yZero.toFixed(2) + ')">' +
              '<rect x="0" y="-10" width="44" height="20" rx="10"/>' +
              '<text x="22" y="3.5" text-anchor="middle" dir="ltr" unicode-bidi="isolate">0</text>' +
            '</g>' +
          '</g>' +
          '<g class="l4-vscene-items">' + itemsSVG + '</g>' +
        '</g>' +
      '</svg>'
    );

    const explainBox = document.createElement('div');
    explainBox.className = 'l4-vscene-explain';
    explainBox.setAttribute('role', 'status');
    explainBox.setAttribute('aria-live', 'polite');

    const explainText = document.createElement('div');
    explainText.className = 'l4-vscene-explain-txt';

    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'l4-vscene-replay-btn';
    replayBtn.hidden = true;
    replayBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>' +
      '</svg>' +
      '<span>إعادة الحركة</span>';

    explainBox.append(explainText, replayBtn);
    rootEl.append(stageEl, explainBox);

    function escHtmlAttr(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escapeSvgText(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const svgEl = stageEl.querySelector('.l4-vscene-svg');
    const measureGroup = svgEl.querySelector('.l4-vscene-measure');
    const projLine = svgEl.querySelector('.l4-vscene-proj-line');
    const measLine = svgEl.querySelector('.l4-vscene-meas-line');
    const measDot = svgEl.querySelector('.l4-vscene-meas-dot');
    const counterPill = svgEl.querySelector('.l4-vscene-counter-pill');
    const counterRect = counterPill.querySelector('rect');
    const counterText = counterPill.querySelector('text');
    const zeroLine = svgEl.querySelector('.l4-vscene-zero-line');
    const zeroBadge = svgEl.querySelector('.l4-vscene-zero-badge');
    const itemEls = Array.from(svgEl.querySelectorAll('.l4-vscene-item'));

    let rafId = 0;
    let animToken = 0;

    function cancelAnim() {
      animToken += 1;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function prefersNoMotion() {
      const mq = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const calm = document.documentElement.classList.contains('calm');
      return Boolean(mq || calm);
    }

    function applyClasses() {
      rootEl.classList.toggle('is-compact', compact);
      rootEl.classList.toggle('is-zero-highlighted', highlightZero);
      zeroLine.classList.toggle('is-highlighted', highlightZero);
      zeroBadge.classList.toggle('is-highlighted', highlightZero);

      itemEls.forEach((g, idx) => {
        const isSel = selectedIdx === idx;
        const isExp = exploredSet.has(idx);
        const it = items[idx];
        const isMask = !revealedMask && maskedSet.has(idx);
        g.classList.toggle('is-selected', isSel);
        g.classList.toggle('is-explored', isExp);
        g.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        const tagText = g.querySelector('.l4-vscene-tag text');
        const tagRect = g.querySelector('.l4-vscene-tag rect');
        if (tagText && tagRect && it) {
          const valStr = isMask ? '؟' : String(it.displayVal ?? formatSigned(it.val));
          tagText.textContent = valStr;
          g.setAttribute('aria-label', it.label + ' ' + valStr);
          const pw = Math.max(30, valStr.length * 8 + 12);
          tagRect.setAttribute('x', (-pw / 2).toFixed(1));
          tagRect.setAttribute('width', String(pw));
        }
      });
    }

    function renderExplanation(idx) {
      if (idx === null || !items[idx]) {
        explainBox.classList.remove('has-selection', 'is-pos', 'is-neg', 'is-zero');
        explainText.innerHTML = '<span class="l4-vscene-placeholder">' + escHtmlAttr(cfg.initialPrompt || 'اضغط على أي عنصر في المشهد لقياس ارتفاعه أو عمقه من الصفر.') + '</span>';
        replayBtn.hidden = true;
        return;
      }
      const it = items[idx];
      const isMask = !revealedMask && maskedSet.has(idx);
      const clsPol = it.val > 0 ? 'is-pos' : (it.val < 0 ? 'is-neg' : 'is-zero');
      explainBox.classList.remove('is-pos', 'is-neg', 'is-zero');
      explainBox.classList.add('has-selection', clsPol);
      const detailHtml = (typeof cfg.formatText === 'function')
        ? cfg.formatText(it.detail || '')
        : bdiNum(it.detail || '');
      const distHtml = (cfg.showDistanceNote && !isMask && it.distanceNote)
        ? '<span class="l4-vscene-dist-note">' + ((typeof cfg.formatText === 'function') ? cfg.formatText(it.distanceNote) : bdiNum(it.distanceNote)) + '</span>'
        : '';
      explainText.innerHTML =
        '<strong class="l4-vscene-explain-title">' + escapeSvgText(it.label) + ':</strong> ' +
        '<span class="l4-vscene-explain-body">' + detailHtml + '</span>' +
        distHtml;
      replayBtn.hidden = cfg.showReplay === false;
    }

    function drawMeasurementAt(idx, t) {
      const it = items[idx];
      if (!it) {
        measureGroup.setAttribute('hidden', '');
        return;
      }
      const targetVal = Number(it.val || 0);
      const isMask = !revealedMask && maskedSet.has(idx);
      const curVal = targetVal * t;
      const curY = valToY(curVal);
      const targetY = valToY(targetVal);
      const cx = xCols[idx] ?? 206;
      const polCls = targetVal > 0 ? 'is-pos' : (targetVal < 0 ? 'is-neg' : 'is-zero');

      measureGroup.removeAttribute('hidden');
      measureGroup.classList.remove('is-pos', 'is-neg', 'is-zero');
      measureGroup.classList.add(polCls);

      if (targetVal === 0) {
        measLine.setAttribute('hidden', '');
        projLine.removeAttribute('hidden');
        const pEnd = xMeasure + (cx - 20 - xMeasure) * t;
        projLine.setAttribute('x1', String(xMeasure));
        projLine.setAttribute('y1', yZero.toFixed(2));
        projLine.setAttribute('x2', pEnd.toFixed(2));
        projLine.setAttribute('y2', yZero.toFixed(2));
        measDot.setAttribute('cx', String(xMeasure));
        measDot.setAttribute('cy', yZero.toFixed(2));
        const pillText = isMask ? '؟' : '0';
        counterText.textContent = pillText;
        const pw = 36;
        counterRect.setAttribute('width', String(pw));
        counterText.setAttribute('x', (pw / 2).toFixed(1));
        counterPill.setAttribute('transform', 'translate(' + (xMeasure + 8) + ',' + (yZero - 14).toFixed(2) + ')');
        return;
      }

      measLine.removeAttribute('hidden');
      measLine.setAttribute('x1', String(xMeasure));
      measLine.setAttribute('y1', yZero.toFixed(2));
      measLine.setAttribute('x2', String(xMeasure));
      measLine.setAttribute('y2', curY.toFixed(2));

      measDot.setAttribute('cx', String(xMeasure));
      measDot.setAttribute('cy', curY.toFixed(2));

      // Horizontal projection line fades/extends as measurement reaches item
      const projT = t >= 0.65 ? Math.min(1, (t - 0.65) / 0.35) : 0;
      if (projT > 0.02) {
        projLine.removeAttribute('hidden');
        const projX2 = xMeasure + (cx - 20 - xMeasure) * projT;
        projLine.setAttribute('x1', String(xMeasure));
        projLine.setAttribute('y1', targetY.toFixed(2));
        projLine.setAttribute('x2', projX2.toFixed(2));
        projLine.setAttribute('y2', targetY.toFixed(2));
      } else {
        projLine.setAttribute('hidden', '');
      }

      const roundedCur = t >= 0.999 ? targetVal : Math.round(curVal);
      const valStr = isMask ? '؟' : formatSigned(roundedCur);
      counterText.textContent = valStr;
      const pw = Math.max(36, valStr.length * 8 + 14);
      counterRect.setAttribute('width', String(pw));
      counterText.setAttribute('x', (pw / 2).toFixed(1));
      const pillOffsetY = curY < 54 ? curY + 18 : (curY > H - 46 ? curY - 18 : curY);
      const clampY = Math.max(18, Math.min(H - 18, pillOffsetY));
      counterPill.setAttribute('transform', 'translate(' + (xMeasure + 7) + ',' + clampY.toFixed(2) + ')');
    }

    function selectItem(idx, animate) {
      if (idx < 0 || idx >= items.length) return;
      cancelAnim();
      selectedIdx = idx;
      exploredSet.add(idx);
      const isZeroItem = items[idx].val === 0;
      if (isZeroItem) highlightZero = true;
      else if (!cfg.lockZeroHighlight) highlightZero = false;
      applyClasses();
      renderExplanation(idx);

      if (animate === false || prefersNoMotion()) {
        drawMeasurementAt(idx, 1);
      } else {
        const token = animToken;
        const duration = 700;
        const start = performance.now();
        const easeOutCubic = p => 1 - Math.pow(1 - p, 3);
        drawMeasurementAt(idx, 0);
        const tick = now => {
          if (token !== animToken) return;
          const elapsed = now - start;
          const rawP = Math.min(1, elapsed / duration);
          drawMeasurementAt(idx, easeOutCubic(rawP));
          if (rawP < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            rafId = 0;
          }
        };
        rafId = requestAnimationFrame(tick);
      }

      if (typeof cfg.onSelect === 'function') {
        cfg.onSelect(idx, items[idx], Array.from(exploredSet));
      }
    }

    itemEls.forEach((g, idx) => {
      g.addEventListener('click', () => selectItem(idx, true));
      g.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          selectItem(idx, true);
        }
      });
    });

    replayBtn.addEventListener('click', () => {
      if (selectedIdx !== null) selectItem(selectedIdx, true);
    });

    applyClasses();
    if (selectedIdx !== null && items[selectedIdx]) {
      renderExplanation(selectedIdx);
      drawMeasurementAt(selectedIdx, 1);
    } else {
      renderExplanation(null);
    }

    return {
      el: rootEl,
      select: (idx, animate) => selectItem(idx, animate !== false),
      replay: () => { if (selectedIdx !== null) selectItem(selectedIdx, true); },
      setCompact: val => {
        compact = Boolean(val);
        applyClasses();
      },
      setHighlightZero: val => {
        highlightZero = Boolean(val);
        applyClasses();
      },
      revealMasked: () => {
        revealedMask = true;
        applyClasses();
        if (selectedIdx !== null) {
          renderExplanation(selectedIdx);
          drawMeasurementAt(selectedIdx, 1);
        }
      },
      getExploredCount: () => exploredSet.size,
      destroy: () => cancelAnim()
    };
  }

  function createSituationAnimWidget(config) {
    const cfg = config || {};
    const sceneType = cfg.sceneType === 'house_elevation' ? 'house_elevation' : 'bank_withdraw';
    let revealedLabel = cfg.revealedLabel ? String(cfg.revealedLabel) : '';
    let zeroHighlighted = Boolean(cfg.zeroHighlighted);

    const uid = 'l4sa_' + Math.random().toString(36).slice(2, 8);
    const W = 340;
    const H = 124;

    const rootEl = document.createElement('div');
    rootEl.className = 'l4-sitanim-card';

    const stageEl = document.createElement('div');
    stageEl.className = 'l4-sitanim-stage';

    if (sceneType === 'bank_withdraw') {
      const yZero = 40;
      const yDropTarget = 98;
      stageEl.innerHTML =
        '<svg class="l4-sitanim-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="تمثيل متحرك لموقف سحب 50 دينارًا عن الرصيد قبل السحب">' +
          '<defs>' +
            '<linearGradient id="' + uid + '_bg" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#fef2f2"/>' +
            '</linearGradient>' +
            '<clipPath id="' + uid + '_clip"><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="12"/></clipPath>' +
          '</defs>' +
          '<g clip-path="url(#' + uid + '_clip)">' +
            '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + uid + '_bg)"/>' +
            // Wallet / Account Card on left
            '<g transform="translate(18,14)">' +
              '<rect x="0" y="0" width="96" height="54" rx="10" fill="#0f5d84" stroke="#102a24" stroke-width="1.5"/>' +
              '<rect x="6" y="10" width="84" height="10" rx="3" fill="#0b4664"/>' +
              '<rect x="62" y="30" width="24" height="14" rx="4" fill="#fde68a" stroke="#102a24" stroke-width="1.1"/>' +
              '<circle cx="74" cy="37" r="2.2" fill="#102a24"/>' +
              '<text x="54" y="40" text-anchor="start" fill="#ffffff" font-size="9" font-weight="800">رصيد مها</text>' +
            '</g>' +
            // Reference 0 line ("قبل السحب: 0 (لا تغيّر)")
            '<line class="l4-sitanim-zero-line" x1="124" y1="' + yZero + '" x2="' + (W - 10) + '" y2="' + yZero + '"/>' +
            '<g class="l4-sitanim-zero-pill" transform="translate(332,22)">' +
              '<rect x="-136" y="-9" width="136" height="18" rx="9"/>' +
              '<text x="-68" y="3.5" text-anchor="middle">قبل السحب: 0 (لا تغيّر)</text>' +
            '</g>' +
            // Withdrawn cash tray below reference line
            '<g transform="translate(230,68)">' +
              '<rect x="0" y="0" width="90" height="40" rx="9" fill="#fff1f2" stroke="#fca5a5" stroke-width="1.4" stroke-dasharray="4 3"/>' +
              '<text x="45" y="34" text-anchor="middle" fill="#9f1239" font-size="8.5" font-weight="800">مبلغ مسحوب</text>' +
            '</g>' +
            // Subtle curved guide path showing money leaving the card down to tray
            '<path d="M114 48 Q185 48 258 76" fill="none" stroke="#fda4af" stroke-width="1.4" stroke-dasharray="4 4"/>' +
            // Vertical drop meter track & animated arrow from yZero down to yDropTarget
            '<line x1="148" y1="20" x2="148" y2="112" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>' +
            '<circle cx="148" cy="' + yZero + '" r="4" fill="#ffffff" stroke="#102a24" stroke-width="1.8"/>' +
            '<line class="l4-sa-proj-line" x1="148" y1="' + yDropTarget + '" x2="148" y2="' + yDropTarget + '"/>' +
            '<line class="l4-sa-arrow-line is-neg" x1="148" y1="' + yZero + '" x2="148" y2="' + yZero + '"/>' +
            '<polygon class="l4-sa-arrow-head is-neg" points="148,' + yZero + ' 143,' + (yZero - 7) + ' 153,' + (yZero - 7) + '" hidden/>' +
            // Animated banknote + coins flowing out from card into withdrawn tray
            '<g class="l4-sa-coin" data-idx="0" transform="translate(106,46)"><rect x="-13" y="-8" width="26" height="16" rx="3" fill="#fde68a" stroke="#92400e" stroke-width="1.3"/><text class="l4-sitanim-num" x="0" y="3" text-anchor="middle" font-size="8" font-weight="900" fill="#78350f">50</text></g>' +
            '<g class="l4-sa-coin" data-idx="1" transform="translate(106,46)"><circle r="7.5" fill="#fbbf24" stroke="#92400e" stroke-width="1.3"/><text class="l4-sitanim-num" x="0" y="3" text-anchor="middle" font-size="7.5" font-weight="900" fill="#78350f">JD</text></g>' +
            '<g class="l4-sa-coin" data-idx="2" transform="translate(106,46)"><circle r="7.5" fill="#fcd34d" stroke="#92400e" stroke-width="1.3"/><text class="l4-sitanim-num" x="0" y="3" text-anchor="middle" font-size="7.5" font-weight="900" fill="#78350f">JD</text></g>' +
            // Live badge at tip
            '<g class="l4-sa-badge is-neg" transform="translate(186,' + yDropTarget + ')">' +
              '<rect x="-24" y="-11" width="48" height="22" rx="11"/>' +
              '<text class="l4-sitanim-num" x="0" y="4" text-anchor="middle">؟</text>' +
            '</g>' +
          '</g>' +
        '</svg>';
    } else {
      const yZero = 88;
      const yTop = 30;
      const yHouseBase = yTop + 16;
      const yMid1 = yZero - (yZero - yHouseBase) * 0.33;
      const yMid2 = yZero - (yZero - yHouseBase) * 0.67;
      stageEl.innerHTML =
        '<svg class="l4-sitanim-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="تمثيل متحرك لموقف منزل يرتفع 100 متر فوق سطح البحر">' +
          '<defs>' +
            '<linearGradient id="' + uid + '_sky" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#dff1fb"/><stop offset="100%" stop-color="#f2f9fd"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + uid + '_sea" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#cfeaf7"/><stop offset="100%" stop-color="#8ec7e6"/>' +
            '</linearGradient>' +
            '<clipPath id="' + uid + '_clip"><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="12"/></clipPath>' +
          '</defs>' +
          '<g clip-path="url(#' + uid + '_clip)">' +
            '<rect x="0" y="0" width="' + W + '" height="' + yZero + '" fill="url(#' + uid + '_sky)"/>' +
            '<rect x="0" y="' + yZero + '" width="' + W + '" height="' + (H - yZero) + '" fill="url(#' + uid + '_sea)"/>' +
            // Hill / plateau rising above sea level
            '<path d="M188 ' + yZero + ' L214 ' + yHouseBase + ' L316 ' + yHouseBase + ' L340 ' + yZero + ' Z" fill="#e5d4b3" stroke="#8b7355" stroke-width="1.4"/>' +
            // Crisp House atop the plateau
            '<g transform="translate(264,' + yHouseBase + ')">' +
              '<rect x="-24" y="-22" width="48" height="22" rx="2" fill="#fffef7" stroke="#102a24" stroke-width="1.4"/>' +
              '<polygon points="-28,-22 0,-38 28,-22" fill="#c2410c" stroke="#102a24" stroke-width="1.4" stroke-linejoin="round"/>' +
              '<rect x="-6" y="-14" width="12" height="14" rx="1.5" fill="#c88d21" stroke="#102a24" stroke-width="1.2"/>' +
              '<rect x="-18" y="-16" width="8" height="8" rx="1" fill="#bae6fd" stroke="#102a24" stroke-width="1"/>' +
              '<rect x="10" y="-16" width="8" height="8" rx="1" fill="#bae6fd" stroke="#102a24" stroke-width="1"/>' +
            '</g>' +
            // Subtle sea wave highlight + reference 0 line
            '<path class="l4-vscene-wave" d="M0 ' + (yZero + 4) + ' Q25 ' + (yZero + 1) + ' 50 ' + (yZero + 4) + ' T100 ' + (yZero + 4) + ' T150 ' + (yZero + 4) + ' T200 ' + (yZero + 4) + ' T250 ' + (yZero + 4) + ' T300 ' + (yZero + 4) + ' T350 ' + (yZero + 4) + '" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.8" stroke-linecap="round"/>' +
            '<line class="l4-sitanim-zero-line" x1="12" y1="' + yZero + '" x2="' + (W - 10) + '" y2="' + yZero + '"/>' +
            '<g class="l4-sitanim-zero-pill" transform="translate(158,' + (yZero + 16) + ')">' +
              '<rect x="-64" y="-9" width="128" height="18" rx="9"/>' +
              '<text x="0" y="3.5" text-anchor="middle">مستوى سطح البحر: 0</text>' +
            '</g>' +
            // Upward vertical measurement ruler with tick marks + dashed projection across to house base
            '<line x1="58" y1="22" x2="58" y2="' + (yZero + 12) + '" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>' +
            '<line x1="54" y1="' + yMid1.toFixed(1) + '" x2="62" y2="' + yMid1.toFixed(1) + '" stroke="#64748b" stroke-width="1.4"/>' +
            '<line x1="54" y1="' + yMid2.toFixed(1) + '" x2="62" y2="' + yMid2.toFixed(1) + '" stroke="#64748b" stroke-width="1.4"/>' +
            '<line x1="54" y1="' + yHouseBase + '" x2="62" y2="' + yHouseBase + '" stroke="#0f5d84" stroke-width="1.8"/>' +
            '<circle cx="58" cy="' + yZero + '" r="4" fill="#ffffff" stroke="#102a24" stroke-width="1.8"/>' +
            '<line class="l4-sa-proj-line" x1="58" y1="' + yHouseBase + '" x2="58" y2="' + yHouseBase + '"/>' +
            '<line class="l4-sa-arrow-line is-pos" x1="58" y1="' + yZero + '" x2="58" y2="' + yZero + '"/>' +
            '<polygon class="l4-sa-arrow-head is-pos" points="58,' + yZero + ' 53,' + (yZero + 7) + ' 63,' + (yZero + 7) + '" hidden/>' +
            // Badge at elevation
            '<g class="l4-sa-badge is-pos" transform="translate(102,' + yHouseBase + ')">' +
              '<rect x="-25" y="-11" width="50" height="22" rx="11"/>' +
              '<text class="l4-sitanim-num" x="0" y="4" text-anchor="middle">؟</text>' +
            '</g>' +
          '</g>' +
        '</svg>';
    }

    const footEl = document.createElement('div');
    footEl.className = 'l4-sitanim-foot';
    const captionEl = document.createElement('span');
    captionEl.className = 'l4-sitanim-caption';
    captionEl.textContent = sceneType === 'bank_withdraw'
      ? 'سحب 50 دينارًا: نقصان عن الرصيد قبل السحب'
      : 'يرتفع 100 م: صعود أعلى مستوى سطح البحر';

    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'l4-vscene-replay-btn';
    replayBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>' +
      '</svg>' +
      '<span>إعادة الحركة</span>';

    footEl.append(captionEl, replayBtn);
    rootEl.append(stageEl, footEl);

    const svgEl = stageEl.querySelector('.l4-sitanim-svg');
    const zeroLine = svgEl.querySelector('.l4-sitanim-zero-line');
    const zeroPill = svgEl.querySelector('.l4-sitanim-zero-pill');
    const arrowLine = svgEl.querySelector('.l4-sa-arrow-line');
    const arrowHead = svgEl.querySelector('.l4-sa-arrow-head');
    const badgeG = svgEl.querySelector('.l4-sa-badge');
    const badgeText = badgeG.querySelector('text');
    const badgeRect = badgeG.querySelector('rect');
    const coins = Array.from(svgEl.querySelectorAll('.l4-sa-coin'));
    const projLine = svgEl.querySelector('.l4-sa-proj-line');

    let rafId = 0;
    let animToken = 0;

    function cancelAnim() {
      animToken += 1;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    function prefersNoMotion() {
      const mq = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return Boolean(mq || document.documentElement.classList.contains('calm'));
    }

    function syncStaticState() {
      zeroLine.classList.toggle('is-highlighted', zeroHighlighted);
      zeroPill.classList.toggle('is-highlighted', zeroHighlighted);
      const labelTxt = revealedLabel || '؟';
      badgeText.textContent = labelTxt;
      const bw = Math.max(42, labelTxt.length * 9 + 16);
      badgeRect.setAttribute('x', (-bw / 2).toFixed(1));
      badgeRect.setAttribute('width', String(bw));
      badgeG.classList.toggle('is-revealed', Boolean(revealedLabel));
    }

    function drawFrame(t) {
      if (sceneType === 'bank_withdraw') {
        const y0 = 40;
        const yEnd = 98;
        const curY = y0 + (yEnd - y0) * t;
        arrowLine.setAttribute('y2', curY.toFixed(1));
        if (t > 0.08) {
          arrowHead.removeAttribute('hidden');
          arrowHead.setAttribute('points', '148,' + curY.toFixed(1) + ' 143,' + (curY - 7).toFixed(1) + ' 153,' + (curY - 7).toFixed(1));
        } else {
          arrowHead.setAttribute('hidden', '');
        }
        if (projLine) {
          const pEnd = 148 + (226 - 148) * Math.max(0, (t - 0.5) / 0.5);
          projLine.setAttribute('x2', pEnd.toFixed(1));
        }
        coins.forEach((c, i) => {
          const localT = Math.max(0, Math.min(1, (t - i * 0.12) / 0.72));
          const cx = 104 + (252 + i * 24 - 104) * localT;
          const cy = 44 + (82 + (i === 1 ? -8 : 6) - 44) * localT - Math.sin(localT * Math.PI) * 14;
          c.setAttribute('transform', 'translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')');
          c.setAttribute('opacity', localT <= 0.02 ? '0' : '1');
        });
      } else {
        const y0 = 88;
        const yHouseBase = 46;
        const curY = y0 - (y0 - yHouseBase) * t;
        arrowLine.setAttribute('y2', curY.toFixed(1));
        if (t > 0.08) {
          arrowHead.removeAttribute('hidden');
          arrowHead.setAttribute('points', '58,' + curY.toFixed(1) + ' 53,' + (curY + 7).toFixed(1) + ' 63,' + (curY + 7).toFixed(1));
        } else {
          arrowHead.setAttribute('hidden', '');
        }
        if (projLine) {
          const pEnd = 58 + (214 - 58) * Math.max(0, (t - 0.5) / 0.5);
          projLine.setAttribute('x2', pEnd.toFixed(1));
        }
      }
      badgeG.setAttribute('opacity', t > 0.35 ? String(Math.min(1, (t - 0.35) / 0.4)) : '0');
    }

    function play() {
      cancelAnim();
      syncStaticState();
      if (prefersNoMotion()) {
        drawFrame(1);
        return;
      }
      const token = animToken;
      const start = performance.now();
      const dur = 820;
      const easeOut = p => 1 - Math.pow(1 - p, 3);
      drawFrame(0);
      const tick = now => {
        if (token !== animToken) return;
        const rawP = Math.min(1, (now - start) / dur);
        drawFrame(easeOut(rawP));
        if (rawP < 1) rafId = requestAnimationFrame(tick);
        else rafId = 0;
      };
      rafId = requestAnimationFrame(tick);
    }

    replayBtn.addEventListener('click', play);

    syncStaticState();
    play();

    return {
      el: rootEl,
      play,
      revealNumber: lbl => {
        revealedLabel = lbl ? String(lbl) : '';
        syncStaticState();
      },
      setHighlightZero: val => {
        zeroHighlighted = Boolean(val);
        syncStaticState();
      },
      destroy: () => cancelAnim()
    };
  }

  global.L4Visuals = {
    bdiNum,
    buildThermometerSVG,
    buildHeroThermometerSVG,
    updateHeroThermometerSVG,
    createVerticalSceneWidget,
    createSituationAnimWidget
  };
  global.setupNegLineLabEvents = setupNegLineLabEvents;
  global.openNegativeNumbersLab = openNegativeNumbersLab;
})(window);
