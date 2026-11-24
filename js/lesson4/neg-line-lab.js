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
            // Soft contrail behind tail
            '<path d="M-25 3 L-18 3" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.72" stroke-dasharray="3 2.5"/>' +
            // Far background wing
            '<path d="M-1 -1 L-7 -9 L-1 -9 L6 -1 Z" fill="#0284c7" stroke="#102a24" stroke-width="1.1" stroke-linejoin="round"/>' +
            // Tail stabilizer fin with warm gold airline stripe
            '<path d="M-16 1 L-21 -9 L-15 -9 L-10 0 Z" fill="#0f5d84" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<path d="M-17.5 -5.5 L-13.5 -5.5" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>' +
            // Sleek aerodynamic white/ice-blue fuselage + ocean-blue belly band
            '<path d="M-18 1.5 C-18 -2.5 -10 -4 4 -4 C13 -4 19 -1.5 21 1.5 C19 4.5 13 6 4 6 L-15 6 C-18 5.5 -19 3.5 -18 1.5 Z" fill="#f8fafc" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
            '<path d="M-16 3.2 L17 3.2 C15 5 10 5.8 4 5.8 L-14 5.8 Z" fill="#0f5d84"/>' +
            // Panoramic cockpit windshield
            '<path d="M12 -2.6 C15 -2.2 17.5 -1 18.8 0.5 L12.8 0.5 C11.8 -0.4 11.4 -1.6 12 -2.6 Z" fill="#38bdf8" stroke="#102a24" stroke-width="0.9" stroke-linejoin="round"/>' +
            // Cabin porthole windows
            '<circle cx="7.5" cy="0.2" r="1.15" fill="#0f5d84"/>' +
            '<circle cx="3.2" cy="0.2" r="1.15" fill="#0f5d84"/>' +
            '<circle cx="-1.1" cy="0.2" r="1.15" fill="#0f5d84"/>' +
            '<circle cx="-5.4" cy="0.2" r="1.15" fill="#0f5d84"/>' +
            // Swept foreground main wing + engine pod
            '<path d="M5 2.5 L-7 10.5 L-11 10.5 L-2 2.5 Z" fill="#38bdf8" stroke="#102a24" stroke-width="1.15" stroke-linejoin="round"/>' +
            '<rect x="-4" y="6.8" width="5.5" height="2.8" rx="1.4" fill="#64748b" stroke="#102a24" stroke-width="0.9"/>' +
          '</g>'
        );
      case 'boat':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Subtle water shimmer beneath hull
            '<path d="M-14 10 Q0 12 14 10" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>' +
            // Wooden mast + fluttering pennant
            '<path d="M-1 -16.5 L-1 0" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M-1 -16.5 L6 -14.2 L-1 -12 Z" fill="#d97706" stroke="#102a24" stroke-width="0.8" stroke-linejoin="round"/>' +
            // Billowing front jib sail (left)
            '<path d="M-2.2 -13.5 Q-11 -8.5 -13.5 -2.2 L-2.2 -2.2 Z" fill="#f0f9ff" stroke="#102a24" stroke-width="1.15" stroke-linejoin="round"/>' +
            // Billowing main sail (right) with warm sunlit fold
            '<path d="M0.5 -15 Q13 -9.5 14.5 -2 L0.5 -2 Z" fill="#fffbeb" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<path d="M1.8 -12.5 Q8.5 -8.5 9.5 -3 L1.8 -3 Z" fill="#fde68a" opacity="0.72"/>' +
            // Curved two-tone mahogany sailboat hull + white deck stripe + brass portholes
            '<path d="M-17.5 -1.5 Q0 0.5 18.5 -2.5 C16.5 4 13.5 8 8.5 8.2 L-10.5 8.2 C-14.5 8 -17 4.2 -17.5 -1.5 Z" fill="#b45309" stroke="#102a24" stroke-width="1.4" stroke-linejoin="round"/>' +
            '<path d="M-15.2 4.2 L14.5 4.2 C13 6.8 10.5 7.8 8 7.8 L-10 7.8 C-12.5 7.8 -14.2 6.4 -15.2 4.2 Z" fill="#78350f"/>' +
            '<path d="M-16 0.6 Q0 2.2 16.5 -0.2" fill="none" stroke="#fff7ed" stroke-width="1.35" stroke-linecap="round"/>' +
            '<circle cx="-5.5" cy="3" r="1.5" fill="#fef08a" stroke="#102a24" stroke-width="0.8"/>' +
            '<circle cx="2" cy="3" r="1.5" fill="#fef08a" stroke="#102a24" stroke-width="0.8"/>' +
            '<circle cx="9.5" cy="2.6" r="1.4" fill="#fef08a" stroke="#102a24" stroke-width="0.8"/>' +
          '</g>'
        );
      case 'fish':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Tiny rising bubbles near mouth
            '<circle cx="-18" cy="-4" r="1.6" fill="#ffffff" stroke="#0284c7" stroke-width="0.8" opacity="0.85"/>' +
            '<circle cx="-16" cy="-8.5" r="1.1" fill="#ffffff" opacity="0.75"/>' +
            // Swept swaying caudal tail fin
            '<g class="l4-anim-tail">' +
              '<path d="M9.5 0 C13 -4.5 17.5 -7.5 19.5 -6.5 C18 -2.5 17.5 -1 17 0 C17.5 1 18 2.5 19.5 6.5 C17.5 7.5 13 4.5 9.5 0 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1.25" stroke-linejoin="round"/>' +
              '<path d="M12.5 0 L17 -3 M12.5 0 L17 3" stroke="#fef3c7" stroke-width="0.9" stroke-linecap="round"/>' +
            '</g>' +
            // Sculpted dorsal and ventral fins
            '<path d="M-5 -7.2 C-2 -13 5 -12.5 7.5 -6.2 Z" fill="#ea580c" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<path d="M-2 7.2 C1 11.2 5.5 10.5 7 6.5 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1.1" stroke-linejoin="round"/>' +
            // Plump contoured tropical reef fish body + sunlit belly highlight
            '<path d="M-15 0.5 C-14.5 -6.8 -6 -9.5 2 -7.5 C7.5 -6 11 -2.5 11.5 0 C11 2.5 7.5 6.2 2 7.6 C-6 9.5 -14.5 6.8 -15 0.5 Z" fill="#fb923c" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
            '<path d="M-12 2.5 C-7 6.8 2 6.8 8 3.2 C3 5.2 -6 5.2 -12 2.5 Z" fill="#fed7aa" opacity="0.8"/>' +
            // Iconic clownfish curved white stripes
            '<path d="M-3.5 -8.1 C-1 -3 -1 3 -3.5 8.1 C-0.5 8.2 1.8 7.6 1.8 7.6 C3.8 2.5 3.8 -2.5 1.8 -7.6 C1.8 -7.6 -0.5 -8.2 -3.5 -8.1 Z" fill="#fffbeb" stroke="#102a24" stroke-width="0.95"/>' +
            '<path d="M6.2 -5.8 C7.6 -2 7.6 2 6.2 5.8 C7.8 5 9 3.6 9.2 2.8 C10 1 10 -1 9.2 -2.8 C9 -3.6 7.8 -5 6.2 -5.8 Z" fill="#fffbeb" stroke="#102a24" stroke-width="0.85"/>' +
            // Side pectoral fin
            '<path d="M-2 1.5 C1.5 0 4.5 1.8 3.2 4.6 C1.2 5.6 -1.5 4.2 -2 1.5 Z" fill="#fdba74" stroke="#102a24" stroke-width="1" stroke-linejoin="round"/>' +
            // Bright glossy eye + cheerful smile
            '<circle cx="-8.8" cy="-1.8" r="2.6" fill="#ffffff" stroke="#102a24" stroke-width="1"/>' +
            '<circle cx="-9.5" cy="-1.8" r="1.35" fill="#0f172a"/>' +
            '<circle cx="-10" cy="-2.4" r="0.55" fill="#ffffff"/>' +
            '<path d="M-14.2 2.2 Q-11.8 3.8 -9.8 2.4" fill="none" stroke="#102a24" stroke-width="1.05" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'bird':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Back swept wing for 3D depth
            '<path d="M0 -2 C4 -10 11 -13.5 16.5 -10.5 C12 -6.5 8 -3.5 4 -1 Z" fill="#cbd5e1" stroke="#102a24" stroke-width="1.15" stroke-linejoin="round"/>' +
            '<path d="M12 -11.5 L16.5 -10.5 L13.2 -7.6 Z" fill="#334155"/>' +
            // Fanned tail feathers
            '<path d="M9 1 L17.5 -2 L16.5 2.5 L10 4 Z" fill="#e2e8f0" stroke="#102a24" stroke-width="1.1" stroke-linejoin="round"/>' +
            // Streamlined gull body + soft underside shading
            '<path d="M-12.5 -1 C-11 -5.8 -4 -6.8 3 -3.5 C8 -1.2 12 0.8 11.5 3.5 C9 6.5 -1 7.2 -8 4.2 C-11.5 2.6 -13 1 -12.5 -1 Z" fill="#ffffff" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<path d="M-8.5 3.2 C-3 5.8 5 5.4 10 3.2 C4.5 4.2 -3 4.2 -8.5 3.2 Z" fill="#cbd5e1"/>' +
            // Curved golden gull beak
            '<path d="M-12.2 -0.8 L-18.5 1.2 C-15.5 2.8 -13 2.8 -11.2 2 Z" fill="#f59e0b" stroke="#102a24" stroke-width="1.05" stroke-linejoin="round"/>' +
            // Expressive eye with glint
            '<circle cx="-8.8" cy="-1.6" r="1.45" fill="#0f172a"/>' +
            '<circle cx="-9.2" cy="-2" r="0.5" fill="#ffffff"/>' +
            // Sweeping animated foreground primary wing
            '<g class="l4-anim-wing">' +
              '<path d="M-4 -1.5 C-1 -9.5 6.5 -14 14 -12.5 C10 -7.5 6 -3 1.5 2.5 C-1.5 2.5 -3.5 0.5 -4 -1.5 Z" fill="#f8fafc" stroke="#102a24" stroke-width="1.25" stroke-linejoin="round"/>' +
              '<path d="M8.5 -12.6 L14 -12.5 L11 -8.6 L7 -9.8 Z" fill="#1e3a5f"/>' +
              '<path d="M0 -3.5 Q5 -7 9.5 -8.5" fill="none" stroke="#94a3b8" stroke-width="0.95" stroke-linecap="round"/>' +
            '</g>' +
          '</g>'
        );
      case 'dolphin':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Delicate splash droplets under leaping dolphin
            '<circle cx="-5" cy="11.5" r="1.3" fill="#ffffff" opacity="0.85"/>' +
            '<circle cx="4" cy="12.5" r="1.1" fill="#bae6fd" opacity="0.9"/>' +
            '<circle cx="11" cy="10.5" r="1.4" fill="#ffffff" opacity="0.8"/>' +
            // Curved sickle dorsal fin
            '<path d="M-1 -7.2 C0.5 -13.5 5.5 -13.5 4.8 -6.8 Z" fill="#0369a1" stroke="#102a24" stroke-width="1.2" stroke-linejoin="round"/>' +
            // Graceful arched bottlenose dolphin silhouette (tail left -> leaping back -> snout right)
            '<path d="M-18.5 7.5 C-17 4.2 -14.5 2.5 -12.5 3.5 C-11 -3.5 -3.5 -9.5 6 -7.8 C12 -6.5 16 -2.5 17.2 0.2 L21.2 1.8 C21.8 2.6 20.8 4 18.2 3.8 L14.8 3.2 C11.5 4.2 7 3.8 2.8 2.2 C-3 0.2 -7.8 2.5 -10.5 7.2 C-9 9.2 -8 11.2 -10.2 12 C-12.5 11.5 -13.8 9.2 -14.5 7.6 C-16.5 8.8 -19 9.5 -18.5 7.5 Z" fill="#0284c7" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
            // Sculpted smooth pearl-white belly sweep
            '<path d="M-9.2 5.4 C-5 0.5 2.5 -0.8 9.8 1.4 C13 2.4 15.6 2.8 17.8 3.1 C14 3.8 8.5 3.8 3.2 2 C-2.2 0.2 -6.5 2.2 -9.2 5.4 Z" fill="#e0f2fe"/>' +
            // Swept pectoral flipper
            '<path d="M5 1.8 C5.5 6.2 2.5 9.2 0.5 8.4 C1.5 5.6 2 3.5 2.5 1.4 Z" fill="#0369a1" stroke="#102a24" stroke-width="1.1" stroke-linejoin="round"/>' +
            // Subtle sunlit back highlight
            '<path d="M-5.5 -4.2 C-1 -6.8 5.5 -7.2 10.5 -4.5" fill="none" stroke="#7dd3fc" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>' +
            // Friendly eye with white glint + smiling rostrum line
            '<circle cx="11.8" cy="-1.6" r="1.6" fill="#0f172a"/>' +
            '<circle cx="11.3" cy="-2.1" r="0.6" fill="#ffffff"/>' +
            '<path d="M13.8 1.5 Q16.8 2.2 19.8 2.2" fill="none" stroke="#102a24" stroke-width="0.95" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'shark':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Iconic asymmetric crescent shark tail (taller upper lobe!)
            '<g class="l4-anim-tail">' +
              '<path d="M10.5 -0.5 C14.5 -5 18.5 -10.5 21 -9.5 C19.5 -4.5 17.8 -1.5 16.5 0 C17.8 1.8 19 4.2 19.5 7.2 C17 7.5 14 4.2 10.5 1 Z" fill="#475569" stroke="#102a24" stroke-width="1.25" stroke-linejoin="round"/>' +
            '</g>' +
            // Small rear secondary dorsal fin
            '<path d="M6 -3.8 L8.5 -6.8 L9.5 -3.2 Z" fill="#475569" stroke="#102a24" stroke-width="0.95" stroke-linejoin="round"/>' +
            // Iconic tall swept primary dorsal fin
            '<path d="M-3.5 -5.8 C-1.5 -13.8 4.2 -14.2 5.2 -5.5 Z" fill="#475569" stroke="#102a24" stroke-width="1.3" stroke-linejoin="round"/>' +
            // Streamlined muscular shark body
            '<path d="M-19.5 0.5 C-15.5 -6.2 -5 -8 4.5 -5.2 C9 -3.8 12.2 -1.2 12.8 0.2 C12.2 1.8 8.8 4.5 3.5 5.8 C-5.5 7.6 -14.5 6.2 -19.5 0.5 Z" fill="#64748b" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
            // Crisp pale silver-white underbelly
            '<path d="M-18.2 1.2 C-12.5 5.6 -3.5 6.6 5.5 4.6 C8.5 3.8 10.5 2.4 11.4 1.2 C5 3.2 -5.5 3.6 -14.5 1.8 Z" fill="#f1f5f9"/>' +
            // Swept downward pectoral fin
            '<path d="M-3 3.5 C-1.5 8.8 2.8 10.5 4.8 9.2 C3.8 6.5 3 4.5 2.5 2.8 Z" fill="#475569" stroke="#102a24" stroke-width="1.15" stroke-linejoin="round"/>' +
            // Three curved gill slits
            '<path d="M-6.2 -1.4 Q-5.2 0.8 -6.2 2.8 M-4 -1.4 Q-3 0.8 -4 2.8 M-1.8 -1.2 Q-0.8 0.8 -1.8 2.6" fill="none" stroke="#1e293b" stroke-width="1.05" stroke-linecap="round"/>' +
            // Friendly snout grin + tiny clean cartoon tooth
            '<path d="M-15.8 3.2 Q-12.2 4.5 -9.5 3.3" fill="none" stroke="#102a24" stroke-width="1.1" stroke-linecap="round"/>' +
            '<polygon points="-14,3.6 -13,5.2 -12,3.8" fill="#ffffff"/>' +
            // Bright expressive shark eye with brow line
            '<circle cx="-12.2" cy="-1.6" r="2.2" fill="#ffffff" stroke="#102a24" stroke-width="0.95"/>' +
            '<circle cx="-12.8" cy="-1.6" r="1.15" fill="#0f172a"/>' +
            '<circle cx="-13.2" cy="-2.1" r="0.45" fill="#ffffff"/>' +
          '</g>'
        );
      case 'octopus':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Back depth tentacles in rich berry-magenta
            '<path d="M-6 4 C-10 8 -14 8 -15.5 11.5" fill="none" stroke="#9d174d" stroke-width="3.2" stroke-linecap="round"/>' +
            '<path d="M6 4 C10 8 14 8 15.5 11.5" fill="none" stroke="#9d174d" stroke-width="3.2" stroke-linecap="round"/>' +
            // 4 expressive curling foreground tentacles with dark outline + bright coral fill
            '<path d="M-8.5 3.5 C-13 6.5 -17.5 7.5 -16 12.2 C-15 14 -12 13.8 -11.5 11.8" fill="none" stroke="#102a24" stroke-width="4.4" stroke-linecap="round"/>' +
            '<path d="M-8.5 3.5 C-13 6.5 -17.5 7.5 -16 12.2 C-15 14 -12 13.8 -11.5 11.8" fill="none" stroke="#f472b6" stroke-width="2.6" stroke-linecap="round"/>' +
            '<path d="M-3.5 5.5 C-5.5 9.5 -8.5 12.5 -5.8 14.5 C-3.8 15.5 -2.2 14 -2.5 12.2" fill="none" stroke="#102a24" stroke-width="4.2" stroke-linecap="round"/>' +
            '<path d="M-3.5 5.5 C-5.5 9.5 -8.5 12.5 -5.8 14.5 C-3.8 15.5 -2.2 14 -2.5 12.2" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>' +
            '<path d="M3.5 5.5 C5.5 9.5 8.5 12.5 5.8 14.5 C3.8 15.5 2.2 14 2.5 12.2" fill="none" stroke="#102a24" stroke-width="4.2" stroke-linecap="round"/>' +
            '<path d="M3.5 5.5 C5.5 9.5 8.5 12.5 5.8 14.5 C3.8 15.5 2.2 14 2.5 12.2" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>' +
            '<path d="M8.5 3.5 C13 6.5 17.5 7.5 16 12.2 C15 14 12 13.8 11.5 11.8" fill="none" stroke="#102a24" stroke-width="4.4" stroke-linecap="round"/>' +
            '<path d="M8.5 3.5 C13 6.5 17.5 7.5 16 12.2 C15 14 12 13.8 11.5 11.8" fill="none" stroke="#f472b6" stroke-width="2.6" stroke-linecap="round"/>' +
            // Cute pale suction cup dots along tentacles
            '<circle cx="-13.2" cy="8.5" r="0.85" fill="#fdf2f8"/>' +
            '<circle cx="-6" cy="11.2" r="0.85" fill="#fdf2f8"/>' +
            '<circle cx="6" cy="11.2" r="0.85" fill="#fdf2f8"/>' +
            '<circle cx="13.2" cy="8.5" r="0.85" fill="#fdf2f8"/>' +
            // Plump domed octopus mantle head + glossy highlight & spots
            '<path d="M-10.5 -1.5 C-11.5 -12.5 11.5 -12.5 10.5 -1.5 C10 4.8 6 7 0 7 C-6 7 -10 4.8 -10.5 -1.5 Z" fill="#f472b6" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
            '<ellipse cx="-4.2" cy="-7.2" rx="3.2" ry="1.8" transform="rotate(-24 -4.2 -7.2)" fill="#fbcfe8" opacity="0.72"/>' +
            '<circle cx="5.2" cy="-6.8" r="1.4" fill="#db2777" opacity="0.45"/>' +
            '<circle cx="7.4" cy="-3.8" r="0.95" fill="#db2777" opacity="0.4"/>' +
            // Large friendly cartoon eyes + rosy cheeks + sweet smile
            '<circle cx="-3.8" cy="-1" r="2.6" fill="#ffffff" stroke="#102a24" stroke-width="1"/>' +
            '<circle cx="3.8" cy="-1" r="2.6" fill="#ffffff" stroke="#102a24" stroke-width="1"/>' +
            '<circle cx="-3.5" cy="-0.8" r="1.3" fill="#0f172a"/>' +
            '<circle cx="3.5" cy="-0.8" r="1.3" fill="#0f172a"/>' +
            '<circle cx="-4.1" cy="-1.5" r="0.5" fill="#ffffff"/>' +
            '<circle cx="2.9" cy="-1.5" r="0.5" fill="#ffffff"/>' +
            '<ellipse cx="-6.8" cy="1.8" rx="1.6" ry="0.9" fill="#e11d48" opacity="0.35"/>' +
            '<ellipse cx="6.8" cy="1.8" rx="1.6" ry="0.9" fill="#e11d48" opacity="0.35"/>' +
            '<path d="M-2.2 2.4 Q0 4.4 2.2 2.4" fill="none" stroke="#102a24" stroke-width="1.15" stroke-linecap="round"/>' +
          '</g>'
        );
      case 'tower':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Rooftop observatory beacon dome + signal arcs
            '<path d="M-11 -4 A12 12 0 0 1 -7 -10 M11 -4 A12 12 0 0 0 7 -10" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>' +
            '<circle cx="0" cy="0" r="8.5" fill="#0f5d84" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="0" cy="0" r="5" fill="#38bdf8" opacity="0.5"/>' +
            '<circle cx="0" cy="0" r="3.2" fill="#fde68a" stroke="#102a24" stroke-width="0.9"/>' +
          '</g>'
        );
      case 'ground':
        return (
          '<g class="l4-vscene-glyph" transform="translate(0,0)">' +
            // Refined hotel grand entrance portico + warm arched doorway + potted shrubs
            '<rect x="-12" y="-12" width="24" height="13.5" rx="2.5" fill="#fffdf7" stroke="#102a24" stroke-width="1.35"/>' +
            '<path d="M-14 -12 L14 -12 L12.5 -8.8 L-12.5 -8.8 Z" fill="#c88d21" stroke="#102a24" stroke-width="1.1" stroke-linejoin="round"/>' +
            '<path d="M-4.8 1.5 L-4.8 -4.5 A4.8 4.8 0 0 1 4.8 -4.5 L4.8 1.5 Z" fill="#bae6fd" stroke="#102a24" stroke-width="1.15"/>' +
            '<line x1="0" y1="-9" x2="0" y2="1.5" stroke="#102a24" stroke-width="1"/>' +
            // Miniature potted greenery flanking doorway
            '<circle cx="-8.8" cy="-3.5" r="2.4" fill="#15803d" stroke="#102a24" stroke-width="0.8"/>' +
            '<rect x="-10" y="-1.3" width="2.4" height="2.6" rx="0.5" fill="#b45309"/>' +
            '<circle cx="8.8" cy="-3.5" r="2.4" fill="#15803d" stroke="#102a24" stroke-width="0.8"/>' +
            '<rect x="7.6" y="-1.3" width="2.4" height="2.6" rx="0.5" fill="#b45309"/>' +
          '</g>'
        );
      case 'basement':
      default:
        return (
          '<g class="l4-vscene-glyph" transform="translate(-5,0)">' +
            // Compact sleek parked car in underground level -7 (clear of right pill)
            '<path d="M-13 0.5 L-11 -3.5 C-10 -5.5 -7.5 -6.5 -4.5 -6.5 L3.5 -6.5 C6.5 -6.5 8.5 -5 10 -2.2 L13.5 -1 C14.8 -0.4 15 1.2 14.5 3.2 L-13.5 3.2 C-14.5 2.4 -14 1.2 -13 0.5 Z" fill="#be123c" stroke="#102a24" stroke-width="1.25" stroke-linejoin="round"/>' +
            // Windows
            '<path d="M-8.5 -1.6 L-6.8 -5 L0 -5 L0 -1.6 Z" fill="#e0f2fe" stroke="#102a24" stroke-width="0.85"/>' +
            '<path d="M1.4 -5 L4.5 -5 C6.2 -5 7.4 -3.6 8.2 -1.6 L1.4 -1.6 Z" fill="#e0f2fe" stroke="#102a24" stroke-width="0.85"/>' +
            // Glowing headlight
            '<circle cx="13.2" cy="0.5" r="1.4" fill="#fef08a" stroke="#102a24" stroke-width="0.6"/>' +
            // Wheels with hubcaps
            '<circle cx="-7.5" cy="3.5" r="3" fill="#1e293b" stroke="#ffffff" stroke-width="0.9"/>' +
            '<circle cx="-7.5" cy="3.5" r="1.2" fill="#cbd5e1"/>' +
            '<circle cx="7.5" cy="3.5" r="3" fill="#1e293b" stroke="#ffffff" stroke-width="0.9"/>' +
            '<circle cx="7.5" cy="3.5" r="1.2" fill="#cbd5e1"/>' +
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
        // Main 50-story glass tower with subtle diagonal sunlight sheen
        '<rect x="' + towerX + '" y="' + yRoof.toFixed(2) + '" width="' + towerW + '" height="' + towerH.toFixed(2) + '" rx="3" fill="#0f5d84" stroke="#102a24" stroke-width="1.5"/>' +
        '<rect x="' + (towerX + 3) + '" y="' + (yRoof + 3).toFixed(2) + '" width="' + (towerW - 6) + '" height="' + (towerH - 4).toFixed(2) + '" fill="#156b96"/>' +
        '<polygon points="' + (towerX + 3) + ',' + (yRoof + 12).toFixed(1) + ' ' + (towerX + towerW - 3) + ',' + (yRoof + 3).toFixed(1) + ' ' + (towerX + towerW - 3) + ',' + (yRoof + 24).toFixed(1) + ' ' + (towerX + 3) + ',' + (yRoof + 38).toFixed(1) + '" fill="#ffffff" opacity="0.14"/>' +
        floorRows.join('') +
        // Rooftop crown parapet and spire right at +50
        '<rect x="' + (towerX - 2) + '" y="' + (yRoof - 3).toFixed(2) + '" width="' + (towerW + 4) + '" height="5" rx="2" fill="#102a24"/>' +
        '<line x1="' + towerCenter + '" y1="' + (yRoof - 13).toFixed(2) + '" x2="' + towerCenter + '" y2="' + (yRoof - 3).toFixed(2) + '" stroke="#102a24" stroke-width="2" stroke-linecap="round"/>' +
        // Ground-floor stone podium base + small stylized courtyard trees
        '<rect x="138" y="' + lobbyTop.toFixed(2) + '" width="88" height="14" rx="2.5" fill="#f5efe2" stroke="#102a24" stroke-width="1.5"/>' +
        '<line x1="138" y1="' + (lobbyTop + 4).toFixed(2) + '" x2="226" y2="' + (lobbyTop + 4).toFixed(2) + '" stroke="#cbd5e1" stroke-width="1"/>' +
        '<g transform="translate(128,' + yZero.toFixed(2) + ')">' +
          '<rect x="-1.2" y="-5" width="2.4" height="5" fill="#78350f"/>' +
          '<ellipse cx="0" cy="-9" rx="4.2" ry="6.5" fill="#15803d" stroke="#102a24" stroke-width="0.9"/>' +
        '</g>' +
        '<g transform="translate(234,' + yZero.toFixed(2) + ')">' +
          '<rect x="-1.2" y="-5" width="2.4" height="5" fill="#78350f"/>' +
          '<ellipse cx="0" cy="-9" rx="4.2" ry="6.5" fill="#15803d" stroke="#102a24" stroke-width="0.9"/>' +
        '</g>' +
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
        : (items.length === 3 ? [132, 194, 286] : (items.length === 2 ? [164, 260] : [206])));

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
      let d = 'M -20 ' + yZero.toFixed(1);
      for (let x = -20; x <= W + 20; x += 28) {
        d += ' Q ' + (x + 14) + ' ' + (yZero - 3.2).toFixed(1) + ' ' + (x + 28) + ' ' + yZero.toFixed(1);
      }
      return d;
    })();
    const waveBackD = (() => {
      let d = 'M -12 ' + (yZero + 2.5).toFixed(1);
      for (let x = -12; x <= W + 28; x += 34) {
        d += ' Q ' + (x + 17) + ' ' + (yZero + 5.8).toFixed(1) + ' ' + (x + 34) + ' ' + (yZero + 2.5).toFixed(1);
      }
      return d;
    })();

    const topGradTop = theme === 'tower' ? '#d9eefb' : '#d4edfc';
    const topGradBot = theme === 'tower' ? '#f6faec' : '#f2fafe';
    const botGradTop = theme === 'tower' ? '#eadac2' : '#c6e7f7';
    const botGradBot = theme === 'tower' ? '#c5a882' : '#7cbcd9';

    const ambientBackdropSVG = theme === 'sea'
      ? (
        '<g class="l4-vscene-ambient" aria-hidden="true">' +
          '<circle class="l4-vscene-sun" cx="304" cy="22" r="13" fill="#fde68a" opacity="0.72"/>' +
          '<circle cx="304" cy="22" r="8" fill="#f5b82e"/>' +
          '<path class="l4-vscene-cloud" d="M 86 24 h 30 a 6 6 0 0 0 0 -12 a 8 8 0 0 0 -15 -2 a 6 6 0 0 0 -15 4 a 5 5 0 0 0 0 10 z" fill="#ffffff" opacity="0.82"/>' +
          '<path class="l4-vscene-cloud is-slow" d="M 226 30 h 24 a 5 5 0 0 0 0 -10 a 6.5 6.5 0 0 0 -12 -1.5 a 5 5 0 0 0 -12 3 a 4.2 4.2 0 0 0 0 8.5 z" fill="#ffffff" opacity="0.72"/>' +
          '<path d="M 0 ' + H + ' L 0 ' + (H - 12) + ' Q 90 ' + (H - 22) + ' 175 ' + (H - 11) + ' T ' + W + ' ' + (H - 14) + ' L ' + W + ' ' + H + ' Z" fill="#4f95b8" opacity="0.32"/>' +
          '<path class="l4-vscene-wave-back" d="' + waveBackD + '" fill="none" stroke="#6db3d4" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round"/>' +
          '<path class="l4-vscene-wave" d="' + wavePathD + '" fill="none" stroke="#ffffff" stroke-opacity="0.78" stroke-width="2.4" stroke-linecap="round"/>' +
          '<circle class="l4-vscene-bubble" cx="116" cy="' + (H - 18) + '" r="2.6" fill="#ffffff" opacity="0.58"/>' +
          '<circle class="l4-vscene-bubble is-b2" cx="204" cy="' + (H - 14) + '" r="2" fill="#ffffff" opacity="0.52"/>' +
          '<circle class="l4-vscene-bubble is-b3" cx="272" cy="' + (H - 20) + '" r="2.8" fill="#ffffff" opacity="0.5"/>' +
        '</g>'
      )
      : (
        '<g class="l4-vscene-ambient" aria-hidden="true">' +
          '<circle class="l4-vscene-sun" cx="302" cy="24" r="12" fill="#fde68a" opacity="0.7"/>' +
          '<circle cx="302" cy="24" r="7.5" fill="#f5b82e"/>' +
          '<path class="l4-vscene-cloud" d="M 88 26 h 28 a 5.5 5.5 0 0 0 0 -11 a 7.5 7.5 0 0 0 -14 -2 a 5.5 5.5 0 0 0 -14 3.5 a 4.8 4.8 0 0 0 0 9.5 z" fill="#ffffff" opacity="0.84"/>' +
          '<line x1="0" y1="' + (yZero + 5).toFixed(1) + '" x2="' + W + '" y2="' + (yZero + 5).toFixed(1) + '" stroke="#b79b76" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="6 5"/>' +
        '</g>' +
        buildTowerBackdropSVG(valToY, yZero)
      );

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
      const floatCls = theme === 'sea' ? ('l4-vscene-art-float ' + clsZone) : 'l4-vscene-art-float is-still';
      return (
        '<g class="l4-vscene-item ' + clsZone + '" data-item-idx="' + idx + '" transform="translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')" role="button" tabindex="0" aria-pressed="false" aria-label="' + escHtmlAttr(it.label + ' ' + valText) + '">' +
          '<circle class="l4-vscene-halo" cx="0" cy="0" r="23"/>' +
          '<g class="' + floatCls + '">' + l4SceneVectorGroup(it.iconType) + '</g>' +
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
          ambientBackdropSVG +
          '<line class="l4-vscene-zero-line" x1="' + xAxis + '" y1="' + yZero.toFixed(2) + '" x2="' + W + '" y2="' + yZero.toFixed(2) + '"/>' +
          '<g class="l4-vscene-probe" hidden aria-hidden="true">' +
            '<line class="l4-vscene-probe-line" x1="' + xAxis + '" y1="' + yZero.toFixed(2) + '" x2="' + (W - 8) + '" y2="' + yZero.toFixed(2) + '"/>' +
            '<circle class="l4-vscene-probe-dot" cx="' + xAxis + '" cy="' + yZero.toFixed(2) + '" r="4.5"/>' +
            '<g class="l4-vscene-probe-pill" transform="translate(' + (xAxis + 12) + ',' + yZero.toFixed(2) + ')">' +
              '<rect x="0" y="-10" width="54" height="20" rx="10"/>' +
              '<text x="27" y="3.5" text-anchor="middle" dir="ltr" unicode-bidi="isolate">0</text>' +
            '</g>' +
          '</g>' +
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
    const probeGroup = svgEl.querySelector('.l4-vscene-probe');
    const probeLine = svgEl.querySelector('.l4-vscene-probe-line');
    const probeDot = svgEl.querySelector('.l4-vscene-probe-dot');
    const probePill = svgEl.querySelector('.l4-vscene-probe-pill');
    const probeText = probePill ? probePill.querySelector('text') : null;
    const itemEls = Array.from(svgEl.querySelectorAll('.l4-vscene-item'));
    let probing = false;

    function hideProbe() {
      if (probeGroup) probeGroup.setAttribute('hidden', '');
    }

    function updateProbeAtClientY(clientY) {
      if (!probeGroup || !probeLine || !probeDot || !probePill || !probeText) return;
      const rect = svgEl.getBoundingClientRect();
      if (!rect.height) return;
      const svgY = Math.max(yTop, Math.min(yBottom, ((clientY - rect.top) / rect.height) * H));
      const rawV = scaleMax - (svgY - yTop) / pxPerUnit;
      const roundedV = Math.round(rawV);
      const snappedY = valToY(roundedV);
      const pol = roundedV > 0 ? 'is-pos' : (roundedV < 0 ? 'is-neg' : 'is-zero');
      probeGroup.removeAttribute('hidden');
      probeGroup.classList.remove('is-pos', 'is-neg', 'is-zero');
      probeGroup.classList.add(pol);
      probeLine.setAttribute('y1', snappedY.toFixed(1));
      probeLine.setAttribute('y2', snappedY.toFixed(1));
      probeDot.setAttribute('cy', snappedY.toFixed(1));
      const pY = Math.max(16, Math.min(H - 16, snappedY));
      probePill.setAttribute('transform', 'translate(' + (xAxis + 12) + ',' + pY.toFixed(1) + ')');
      probeText.textContent = formatSigned(roundedV) + (unitText ? (' ' + unitText) : '');
    }

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
      hideProbe();
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
      g.addEventListener('click', ev => {
        ev.stopPropagation();
        selectItem(idx, true);
      });
      g.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          selectItem(idx, true);
        }
      });
    });

    svgEl.addEventListener('pointerdown', ev => {
      if (ev.target && ev.target.closest && ev.target.closest('.l4-vscene-item')) return;
      probing = true;
      updateProbeAtClientY(ev.clientY);
    });
    svgEl.addEventListener('pointermove', ev => {
      if (!probing) return;
      updateProbeAtClientY(ev.clientY);
    });
    const endProbe = () => { probing = false; };
    svgEl.addEventListener('pointerup', endProbe);
    svgEl.addEventListener('pointercancel', endProbe);

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
            // Wallet / Account Card on left with sleek sheen, EMV chip & contactless arc
            '<g transform="translate(18,14)">' +
              '<rect x="0" y="0" width="96" height="56" rx="10" fill="#0f5d84" stroke="#102a24" stroke-width="1.5"/>' +
              '<path d="M0 32 Q34 18 96 26 L96 46 Q96 56 86 56 L10 56 Q0 56 0 46 Z" fill="#0b4664" opacity="0.72"/>' +
              '<rect x="6" y="9" width="84" height="9" rx="3" fill="#083344"/>' +
              // Metallic EMV chip
              '<rect x="64" y="25" width="22" height="16" rx="3.5" fill="#fde68a" stroke="#92400e" stroke-width="1.1"/>' +
              '<path d="M71 25 L71 41 M79 25 L79 41 M64 33 L86 33" stroke="#b45309" stroke-width="0.8"/>' +
              // Contactless wave arcs
              '<path d="M52 29 A5 5 0 0 1 52 37 M48 27 A8 8 0 0 1 48 39" fill="none" stroke="#bae6fd" stroke-width="1.1" stroke-linecap="round"/>' +
              '<text x="44" y="47" text-anchor="end" fill="#ffffff" font-size="9" font-weight="800">رصيد مها</text>' +
            '</g>' +
            // Reference 0 line ("قبل السحب: 0 (لا تغيّر)")
            '<line class="l4-sitanim-zero-line" x1="124" y1="' + yZero + '" x2="' + (W - 10) + '" y2="' + yZero + '"/>' +
            '<g class="l4-sitanim-zero-pill" transform="translate(332,22)">' +
              '<rect x="-136" y="-9" width="136" height="18" rx="9"/>' +
              '<text x="-68" y="3.5" text-anchor="middle">قبل السحب: 0 (لا تغيّر)</text>' +
            '</g>' +
            // Withdrawn cash leather pouch tray below reference line
            '<g transform="translate(228,66)">' +
              '<rect x="0" y="0" width="94" height="44" rx="10" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.4" stroke-dasharray="4 3"/>' +
              '<rect x="5" y="5" width="84" height="22" rx="6" fill="#ffe4e6" opacity="0.65"/>' +
              '<text x="47" y="38" text-anchor="middle" fill="#9f1239" font-size="8.5" font-weight="800">مبلغ مسحوب</text>' +
            '</g>' +
            // Subtle curved guide path showing money leaving the card down to tray
            '<path d="M114 48 Q185 48 258 76" fill="none" stroke="#fda4af" stroke-width="1.4" stroke-dasharray="4 4"/>' +
            // Vertical drop meter track & animated arrow from yZero down to yDropTarget
            '<line x1="148" y1="20" x2="148" y2="112" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>' +
            '<circle cx="148" cy="' + yZero + '" r="4" fill="#ffffff" stroke="#102a24" stroke-width="1.8"/>' +
            '<line class="l4-sa-proj-line" x1="148" y1="' + yDropTarget + '" x2="148" y2="' + yDropTarget + '"/>' +
            '<line class="l4-sa-arrow-line is-neg" x1="148" y1="' + yZero + '" x2="148" y2="' + yZero + '"/>' +
            '<polygon class="l4-sa-arrow-head is-neg" points="148,' + yZero + ' 143,' + (yZero - 7) + ' 153,' + (yZero - 7) + '" hidden/>' +
            // Animated styled banknote + gleaming ribbed gold coins flowing out from card into tray
            '<g class="l4-sa-coin" data-idx="0" transform="translate(106,46)"><rect x="-15" y="-9" width="30" height="18" rx="3.5" fill="#fef3c7" stroke="#92400e" stroke-width="1.3"/><rect x="-12" y="-6" width="24" height="12" rx="2" fill="none" stroke="#d97706" stroke-width="0.9"/><text class="l4-sitanim-num" x="0" y="3" text-anchor="middle" font-size="8.5" font-weight="900" fill="#78350f">50</text></g>' +
            '<g class="l4-sa-coin" data-idx="1" transform="translate(106,46)"><circle r="8.2" fill="#f59e0b" stroke="#92400e" stroke-width="1.3"/><circle r="6" fill="#fde68a" stroke="#d97706" stroke-width="0.7"/><text class="l4-sitanim-num" x="0" y="2.8" text-anchor="middle" font-size="7" font-weight="900" fill="#78350f">JD</text></g>' +
            '<g class="l4-sa-coin" data-idx="2" transform="translate(106,46)"><circle r="8.2" fill="#fbbf24" stroke="#92400e" stroke-width="1.3"/><circle r="6" fill="#fef3c7" stroke="#d97706" stroke-width="0.7"/><text class="l4-sitanim-num" x="0" y="2.8" text-anchor="middle" font-size="7" font-weight="900" fill="#78350f">JD</text></g>' +
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
            // Warm sky sun & drifting soft cloud
            '<circle class="l4-vscene-sun" cx="28" cy="22" r="11" fill="#fde68a" opacity="0.72"/>' +
            '<circle cx="28" cy="22" r="6.8" fill="#f5b82e"/>' +
            '<path class="l4-vscene-cloud" d="M 122 24 h 26 a 5 5 0 0 0 0 -10 a 6.5 6.5 0 0 0 -12 -1.5 a 5 5 0 0 0 -14 3 a 4.2 4.2 0 0 0 0 8.5 z" fill="#ffffff" opacity="0.82"/>' +
            // Layered coastal cliff & sunlit green grassy hillside rising above sea level
            '<path d="M180 ' + yZero + ' Q200 ' + (yHouseBase + 4) + ' 216 ' + yHouseBase + ' L318 ' + yHouseBase + ' Q332 ' + (yHouseBase + 6) + ' 340 ' + yZero + ' Z" fill="#dfc9a3" stroke="#8b7355" stroke-width="1.3"/>' +
            '<path d="M196 ' + (yHouseBase + 10) + ' Q210 ' + yHouseBase + ' 222 ' + yHouseBase + ' L318 ' + yHouseBase + ' Q328 ' + (yHouseBase + 4) + ' 332 ' + (yHouseBase + 10) + ' Q264 ' + (yHouseBase + 15) + ' 196 ' + (yHouseBase + 10) + ' Z" fill="#65a30d" opacity="0.88"/>' +
            // Two stylized Mediterranean cypress/olive trees flanking the villa
            '<g transform="translate(226,' + yHouseBase + ')">' +
              '<rect x="-1.5" y="-6" width="3" height="6" fill="#78350f"/>' +
              '<ellipse cx="0" cy="-12" rx="4.5" ry="8" fill="#15803d" stroke="#102a24" stroke-width="1"/>' +
              '<ellipse cx="-1.2" cy="-14" rx="1.6" ry="3.5" fill="#4ade80" opacity="0.45"/>' +
            '</g>' +
            '<g transform="translate(306,' + yHouseBase + ')">' +
              '<rect x="-1.5" y="-5" width="3" height="5" fill="#78350f"/>' +
              '<circle cx="0" cy="-11" r="6" fill="#16a34a" stroke="#102a24" stroke-width="1"/>' +
              '<circle cx="-2" cy="-12.5" r="2.2" fill="#86efac" opacity="0.5"/>' +
            '</g>' +
            // Charming limestone Jordanian-inspired villa atop the plateau
            '<g transform="translate(266,' + yHouseBase + ')">' +
              // Cozy roof chimney
              '<rect x="11" y="-36" width="6" height="10" rx="1" fill="#9a3412" stroke="#102a24" stroke-width="1.1"/>' +
              // Limestone walls
              '<rect x="-24" y="-23" width="48" height="23" rx="2.5" fill="#fffdf5" stroke="#102a24" stroke-width="1.35"/>' +
              // Layered terracotta gabled roof with warm trim
              '<polygon points="-28,-22 0,-39 28,-22" fill="#c2410c" stroke="#102a24" stroke-width="1.35" stroke-linejoin="round"/>' +
              '<polygon points="-22,-23 0,-35.5 22,-23" fill="#ea580c" opacity="0.55"/>' +
              // Arched wooden doorway + brass knob
              '<path d="M-5.5 0 L-5.5 -10 A5.5 5.5 0 0 1 5.5 -10 L5.5 0 Z" fill="#b45309" stroke="#102a24" stroke-width="1.15"/>' +
              '<circle cx="2.5" cy="-6" r="1" fill="#fde68a"/>' +
              // Twin glowing shuttered windows with flower sills
              '<rect x="-19" y="-17" width="9" height="8.5" rx="1.2" fill="#fef08a" stroke="#102a24" stroke-width="1"/>' +
              '<line x1="-14.5" y1="-17" x2="-14.5" y2="-8.5" stroke="#102a24" stroke-width="0.8"/>' +
              '<rect x="-20" y="-8.5" width="11" height="2" rx="0.8" fill="#15803d"/>' +
              '<rect x="10" y="-17" width="9" height="8.5" rx="1.2" fill="#fef08a" stroke="#102a24" stroke-width="1"/>' +
              '<line x1="14.5" y1="-17" x2="14.5" y2="-8.5" stroke="#102a24" stroke-width="0.8"/>' +
              '<rect x="9" y="-8.5" width="11" height="2" rx="0.8" fill="#15803d"/>' +
            '</g>' +
            // Seabed silhouette & dual smooth sea waves
            '<path d="M 0 ' + H + ' L 0 ' + (H - 8) + ' Q 90 ' + (H - 14) + ' 180 ' + (H - 7) + ' T ' + W + ' ' + (H - 9) + ' L ' + W + ' ' + H + ' Z" fill="#4f95b8" opacity="0.32"/>' +
            '<path class="l4-vscene-wave" d="M-12 ' + (yZero + 4) + ' Q12 ' + (yZero + 1) + ' 36 ' + (yZero + 4) + ' T84 ' + (yZero + 4) + ' T132 ' + (yZero + 4) + ' T180 ' + (yZero + 4) + ' T228 ' + (yZero + 4) + ' T276 ' + (yZero + 4) + ' T324 ' + (yZero + 4) + ' T372 ' + (yZero + 4) + '" fill="none" stroke="#ffffff" stroke-opacity="0.65" stroke-width="2" stroke-linecap="round"/>' +
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
