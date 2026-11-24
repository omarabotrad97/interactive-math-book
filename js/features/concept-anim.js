(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const PAL = {
    ink: '#17382f',
    muted: '#526b62',
    white: '#ffffff',
    teal: '#0f5c4b',
    tealSoft: '#e4f2ed',
    tealBorder: '#79b2a1',
    gold: '#c88d21',
    goldInk: '#7c5308',
    goldSoft: '#fdf4de',
    blue: '#1c5a8a',
    blueSoft: '#e7f1fa',
    neg: '#a52a32',
    negSoft: '#fbeaea',
    sky: '#eef6fb',
    sea: '#d8eef5',
    grid: '#d5dfd0',
    track: '#f2f4ec',
    surface: '#ffffff'
  };

  function isCalmOrReduced() {
    if (document.documentElement.classList.contains('calm')) return true;
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => el.setAttribute(k, String(attrs[k])));
    }
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }

  function fmtNum(n) {
    if (typeof window.fmt === 'function') return window.fmt(n);
    return Number(n).toLocaleString('en-US');
  }

  function formatCaptionHTML(raw) {
    const escaped = String(raw || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/([+\-\u2212]?\d+(?:,\d+)*(?:°[CF])?|°[CF]|0\u20134|5\u20139|0-4|5-9)/g, m => '<bdi dir="ltr">' + m + '</bdi>');
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  }

  /* ------------------------------------------------------------------
     Scene 1: Lesson 1 — Place Value Periods & Alignment
     ------------------------------------------------------------------ */
  function drawPlacePeriods(svg, cfg, p) {
    const mode = cfg.mode || 'periods';
    if (mode === 'compare_digits') {
      const nums = Array.isArray(cfg.nums) ? cfg.nums : [9605, 149605];
      const strs = nums.map(n => String(n).padStart(6, ' '));
      const labels = ['العدد ٢', 'العدد ١'];
      const colW = 30;
      const startX = 94;
      const highlightIdx = 6 - 1 - (Number.isFinite(cfg.targetPlace) ? cfg.targetPlace : 3);
      for (let i = 0; i < 6; i++) {
        const x = startX + i * colW;
        const isTarget = i === highlightIdx;
        if (isTarget) {
          svg.append(svgEl('rect', {
            x: x - 2, y: 6, width: colW - 2, height: 84, rx: 6,
            fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 2,
            opacity: 0.35 + 0.65 * p
          }));
        }
        strs.forEach((s, row) => {
          const ch = s[row === 0 ? i : i];
          const val = s[i];
          const y = row === 0 ? 18 : 54;
          svg.append(svgEl('rect', {
            x, y, width: colW - 6, height: 26, rx: 5,
            fill: val === ' ' ? PAL.track : (isTarget ? PAL.white : PAL.tealSoft),
            stroke: isTarget ? PAL.gold : PAL.grid, 'stroke-width': 1.2
          }));
          svg.append(svgEl('text', {
            x: x + (colW - 6) / 2, y: y + 17, 'text-anchor': 'middle',
            fill: isTarget ? PAL.goldInk : PAL.ink, 'font-size': 13, class: 'ca-num-txt'
          }, val === ' ' ? '·' : val));
        });
      }
      labels.forEach((lb, r) => {
        svg.append(svgEl('text', {
          x: 298, y: r === 0 ? 35 : 71, 'text-anchor': 'end',
          fill: PAL.muted, 'font-size': 11, class: 'ca-ar-txt'
        }, lb));
      });
      svg.append(svgEl('text', {
        x: startX + highlightIdx * colW + (colW - 6) / 2, y: 92, 'text-anchor': 'middle',
        fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt', opacity: p
      }, 'نفس المنزلة'));
      return;
    }

    if (mode === 'expanded_eq') {
      const chips = ['+ □', '+ 40,000', '2,000,000'];
      chips.forEach((txt, i) => {
        const w = 82;
        const x = 22 + i * 94;
        const show = Math.min(1, Math.max(0, (p - i * 0.16) / 0.5));
        const isHole = txt.includes('□');
        svg.append(svgEl('rect', {
          x, y: 30, width: w, height: 34, rx: 8,
          fill: isHole ? PAL.goldSoft : PAL.tealSoft,
          stroke: isHole ? PAL.gold : PAL.tealBorder,
          'stroke-width': isHole ? 2 : 1.4,
          opacity: 0.25 + 0.75 * show
        }));
        svg.append(svgEl('text', {
          x: x + w / 2, y: 52, 'text-anchor': 'middle',
          fill: isHole ? PAL.goldInk : PAL.ink, 'font-size': 12.5, class: 'ca-num-txt',
          opacity: 0.25 + 0.75 * show
        }, txt));
      });
      svg.append(svgEl('text', {
        x: 160, y: 18, 'text-anchor': 'middle',
        fill: PAL.muted, 'font-size': 10.5, class: 'ca-ar-txt'
      }, 'كل منزلة تساوي الرقم × أصفار يمينه'));
      return;
    }

    const rawStr = cfg.num !== undefined ? String(cfg.num) : '14582903';
    const padded = rawStr.padStart(9, ' ');
    const periods = [
      { title: 'الملايين', slice: padded.slice(0, 3), bg: PAL.goldSoft, stroke: PAL.gold, x: 12 },
      { title: 'الألوف', slice: padded.slice(3, 6), bg: PAL.blueSoft, stroke: PAL.blue, x: 112 },
      { title: 'الآحاد', slice: padded.slice(6, 9), bg: PAL.tealSoft, stroke: PAL.tealBorder, x: 212 }
    ];
    const targetP = Number.isFinite(cfg.targetPlace) ? Number(cfg.targetPlace) : -1;
    periods.forEach((pd, idx) => {
      const orderDelay = cfg.scanRtl === false ? idx : (2 - idx);
      const localP = Math.min(1, Math.max(0, (p - orderDelay * 0.18) / 0.55));
      svg.append(svgEl('rect', {
        x: pd.x, y: 12, width: 92, height: 70, rx: 9,
        fill: pd.bg, stroke: pd.stroke, 'stroke-width': 1.5,
        opacity: 0.3 + 0.7 * localP
      }));
      svg.append(svgEl('text', {
        x: pd.x + 46, y: 28, 'text-anchor': 'middle',
        fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt'
      }, 'دورة ' + pd.title));
      for (let j = 0; j < 3; j++) {
        const placeIdx = (2 - idx) * 3 + (2 - j);
        const ch = pd.slice[j];
        const isHit = placeIdx === targetP;
        const bx = pd.x + 8 + j * 26;
        svg.append(svgEl('rect', {
          x: bx, y: 38, width: 22, height: 32, rx: 5,
          fill: isHit ? PAL.gold : PAL.white,
          stroke: isHit ? PAL.goldInk : pd.stroke, 'stroke-width': isHit ? 1.8 : 1
        }));
        svg.append(svgEl('text', {
          x: bx + 11, y: 59, 'text-anchor': 'middle',
          fill: isHit ? PAL.white : PAL.ink, 'font-size': 14, class: 'ca-num-txt'
        }, ch === ' ' ? '·' : ch));
      }
    });
  }

  /* ------------------------------------------------------------------
     Scene 2: Lesson 2 — Compare Sweep & Order Staircase
     ------------------------------------------------------------------ */
  function drawCompareSweep(svg, cfg, p) {
    const mode = cfg.mode || 'sweep';
    if (mode === 'order') {
      const asc = cfg.dir !== 'desc';
      const heights = asc ? [20, 40, 62] : [62, 40, 20];
      const labels = asc ? ['الأصغر', 'الأوسط', 'الأكبر'] : ['الأكبر', 'الأوسط', 'الأصغر'];
      heights.forEach((h, i) => {
        const bx = 242 - i * 86;
        const barH = Math.round(h * (0.35 + 0.65 * Math.min(1, Math.max(0, (p - i * 0.14) / 0.6))));
        svg.append(svgEl('rect', {
          x: bx - 30, y: 74 - barH, width: 60, height: barH, rx: 7,
          fill: i === 1 ? PAL.blueSoft : PAL.tealSoft,
          stroke: i === 1 ? PAL.blue : PAL.tealBorder, 'stroke-width': 1.6
        }));
        svg.append(svgEl('text', {
          x: bx, y: 89, 'text-anchor': 'middle',
          fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt'
        }, labels[i]));
      });
      svg.append(svgEl('text', {
        x: 160, y: 15, 'text-anchor': 'middle',
        fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-ar-txt'
      }, asc ? 'من الأصغر ← إلى الأكبر' : 'من الأكبر ← إلى الأصغر'));
      return;
    }

    const leftDigits = String(cfg.left || '6450120').replace(/,/g, '').slice(0, 9);
    const rightDigits = String(cfg.right || '6710000').replace(/,/g, '').slice(0, 9);
    const maxLen = Math.max(leftDigits.length, rightDigits.length, 6);
    const boxW = Math.min(26, Math.floor(252 / maxLen));
    const startX = Math.round((320 - maxLen * (boxW + 3)) / 2);
    const sweepIdx = cfg.lenHint ? 0 : Math.min(maxLen - 1, Math.floor(p * Math.min(maxLen, 5)));
    const sweepX = startX + sweepIdx * (boxW + 3) - 2;

    svg.append(svgEl('rect', {
      x: sweepX, y: 18, width: boxW + 4, height: 64, rx: 6,
      fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.8, opacity: 0.9
    }));
    svg.append(svgEl('text', {
      x: 160, y: 13, 'text-anchor': 'middle',
      fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt'
    }, cfg.lenHint ? 'قارن عدد المنازل أولًا ثم ابدأ من اليسار' : 'الفحص يبدأ من اليسار ←'));

    [leftDigits, rightDigits].forEach((digits, row) => {
      const pad = digits.padStart(maxLen, ' ');
      const y = row === 0 ? 23 : 52;
      for (let i = 0; i < maxLen; i++) {
        const ch = pad[i];
        const x = startX + i * (boxW + 3);
        const isBlank = ch === '□';
        svg.append(svgEl('rect', {
          x, y, width: boxW, height: 24, rx: 4,
          fill: isBlank ? PAL.goldSoft : (ch === ' ' ? PAL.track : PAL.surface),
          stroke: isBlank ? PAL.gold : PAL.grid, 'stroke-width': isBlank ? 1.8 : 1
        }));
        svg.append(svgEl('text', {
          x: x + boxW / 2, y: y + 16, 'text-anchor': 'middle',
          fill: isBlank ? PAL.goldInk : PAL.ink, 'font-size': 12.5, class: 'ca-num-txt'
        }, ch === ' ' ? '·' : ch));
      }
    });

    svg.append(svgEl('text', {
      x: 160, y: 92, 'text-anchor': 'middle',
      fill: PAL.teal, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl'
    }, cfg.lenHint ? 'العدد الأكثر منازل هو الأكبر' : 'توقّف عند أول منزلة مختلفة'));
  }

  /* ------------------------------------------------------------------
     Scene 3: Lesson 3 — Carry, Borrow, Rounding Ruler, Inverse Loop
     ------------------------------------------------------------------ */
  function drawCarryBorrow(svg, cfg, p) {
    const mode = cfg.mode || 'carry_arc';
    if (mode === 'round_ruler') {
      const kDigit = Number.isFinite(cfg.keyDigit) ? Math.max(0, Math.min(9, cfg.keyDigit)) : 6;
      const up = kDigit >= 5;
      svg.append(svgEl('rect', { x: 20, y: 34, width: 138, height: 24, rx: 6, fill: PAL.negSoft, stroke: PAL.neg }));
      svg.append(svgEl('rect', { x: 162, y: 34, width: 138, height: 24, rx: 6, fill: PAL.tealSoft, stroke: PAL.tealBorder }));
      svg.append(svgEl('text', { x: 89, y: 50, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, '0–4: يبقى كما هو'));
      svg.append(svgEl('text', { x: 231, y: 50, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, '5–9: نضيف +1'));
      const targetX = up ? 231 : 89;
      const curX = 160 + (targetX - 160) * p;
      svg.append(svgEl('polygon', {
        points: (curX - 6) + ',18 ' + (curX + 6) + ',18 ' + curX + ',29',
        fill: PAL.gold
      }));
      svg.append(svgEl('text', {
        x: 160, y: 14, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt'
      }, 'انظر إلى الرقم المجاور: ' + kDigit));
      svg.append(svgEl('text', {
        x: 160, y: 78, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt'
      }, 'نقرّب كل عدد لأعلى منزلة ← ثم نطبّق العملية'));
      return;
    }

    if (mode === 'inverse_loop') {
      const boxes = [
        { x: 24, lbl: 'الفرق' },
        { x: 118, lbl: 'المطروح' },
        { x: 214, lbl: 'المطروح منه' }
      ];
      boxes.forEach((b, i) => {
        svg.append(svgEl('rect', {
          x: b.x, y: 34, width: 82, height: 28, rx: 7,
          fill: i === 2 ? PAL.goldSoft : PAL.tealSoft,
          stroke: i === 2 ? PAL.gold : PAL.tealBorder, 'stroke-width': 1.4
        }));
        svg.append(svgEl('text', {
          x: b.x + 41, y: 52, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 11, class: 'ca-ar-txt'
        }, b.lbl));
      });
      svg.append(svgEl('text', { x: 111, y: 52, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 14, class: 'ca-num-txt' }, '+'));
      svg.append(svgEl('text', { x: 207, y: 52, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 14, class: 'ca-num-txt' }, '='));
      svg.append(svgEl('path', {
        d: 'M 255 30 Q 160 6 65 30', fill: 'none', stroke: PAL.blue, 'stroke-width': 2,
        'stroke-dasharray': '180', 'stroke-dashoffset': String(Math.round(180 * (1 - p)))
      }));
      svg.append(svgEl('text', {
        x: 160, y: 80, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10.5, class: 'ca-ar-txt'
      }, 'للتحقق من الطرح نجمع الناتج + المطروح'));
      return;
    }

    const isBorrow = mode === 'borrow_arc';
    const cols = isBorrow ? ['مئات', 'عشرات', 'آحاد'] : ['م.ألوف', 'ع.ألوف', 'آ.ألوف'];
    cols.forEach((lbl, i) => {
      const cx = 82 + i * 78;
      svg.append(svgEl('rect', {
        x: cx - 28, y: 28, width: 56, height: 42, rx: 7,
        fill: i === 1 ? PAL.goldSoft : PAL.surface,
        stroke: i === 1 ? PAL.gold : PAL.grid, 'stroke-width': 1.5
      }));
      svg.append(svgEl('text', {
        x: cx, y: 42, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 9.5, class: 'ca-ar-txt'
      }, lbl));
      svg.append(svgEl('text', {
        x: cx, y: 61, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 13, class: 'ca-num-txt'
      }, i === 2 ? (isBorrow ? '+10' : '≥ 10') : (isBorrow ? '9 ← 0' : '+1')));
    });
    const arcPath = isBorrow ? 'M 94 24 Q 160 6 226 24' : 'M 226 24 Q 160 6 94 24';
    svg.append(svgEl('path', {
      d: arcPath, fill: 'none', stroke: isBorrow ? PAL.neg : PAL.teal,
      'stroke-width': 2.2, 'stroke-dasharray': '160', 'stroke-dashoffset': String(Math.round(160 * (1 - p)))
    }));
    svg.append(svgEl('text', {
      x: 160, y: 86, 'text-anchor': 'middle',
      fill: isBorrow ? PAL.neg : PAL.teal, 'font-size': 10.5, class: 'ca-ar-txt'
    }, isBorrow ? 'الاستلاف: نقل ١ (١٠ أمثال) من المنزلة الأعلى' : 'الحمل: عندما يبلغ العمود ١٠ فأكثر نرفع +١ يسارًا'));
  }

  /* ------------------------------------------------------------------
     Scene 4: Lesson 4 — Rich Interactive Illustrated Mini-Simulators
     Modes: tower/lift, sea, thermo/temp, shift, bank, line_sym
     ViewBox: 0 0 320 124
     ------------------------------------------------------------------ */
  let uidCounter = 0;

  function addGrad(defs, id, x1, y1, x2, y2, stops) {
    const lg = svgEl('linearGradient', { id, x1, y1, x2, y2 });
    stops.forEach(s => lg.append(svgEl('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] !== undefined ? s[2] : 1 })));
    defs.append(lg);
  }

  function formatSignedBadge(n, unit) {
    const num = Math.round(Number(n) || 0);
    const sign = num > 0 ? '+' : (num < 0 ? '−' : '');
    return sign + Math.abs(num) + (unit || '');
  }

  function drawNegContext(svg, cfg, p, st) {
    const mode = cfg.mode || 'line_sym';
    const uid = (st && st.uid) || 'ca4';
    const isLive = Boolean(cfg.live);
    const defs = svgEl('defs');
    svg.append(defs);

    const clipId = uid + '_clip';
    const cp = svgEl('clipPath', { id: clipId });
    cp.append(svgEl('rect', { x: 0, y: 0, width: 320, height: 124, rx: 9 }));
    defs.append(cp);

    const g = svgEl('g', { 'clip-path': 'url(#' + clipId + ')' });
    svg.append(g);

    /* ---------- 1. SEA LEVEL & SUBMARINE/DIVER ---------- */
    if (mode === 'sea') {
      const targetVal = st ? st.val : (isLive ? -Math.abs(Number(cfg.mag || 10)) : -8);
      const curVal = st && st.tweenFrom !== undefined ? (st.tweenFrom + (targetVal - st.tweenFrom) * p) : (targetVal * p);
      const yZero = 44;
      const minV = isLive ? -50 : -20;
      const maxV = isLive ? 10 : 12;
      const valToY = v => {
        if (v >= 0) return yZero - (v / Math.max(1, maxV)) * 28;
        return yZero + (Math.abs(v) / Math.max(1, Math.abs(minV))) * 64;
      };
      const actorY = Math.max(16, Math.min(108, valToY(curVal)));

      addGrad(defs, uid + '_sky', '0', '0', '0', '1', [['0%', '#d7eefc'], ['100%', '#f5fbff']]);
      addGrad(defs, uid + '_sea', '0', '0', '0', '1', [['0%', '#bfe6f7'], ['48%', '#6eb6d8'], ['100%', '#246689']]);

      g.append(svgEl('rect', { x: 0, y: 0, width: 320, height: yZero, fill: 'url(#' + uid + '_sky)' }));
      g.append(svgEl('rect', { x: 0, y: yZero, width: 320, height: 124 - yZero, fill: 'url(#' + uid + '_sea)' }));

      // Soft sun + drifting cloud
      const sunG = svgEl('g', { class: 'ca-sun-pulse' });
      sunG.append(svgEl('circle', { cx: 292, cy: 17, r: 10, fill: '#f8d984', opacity: 0.7 }));
      sunG.append(svgEl('circle', { cx: 292, cy: 17, r: 6.5, fill: '#f2b830' }));
      g.append(sunG);

      const cloudG = svgEl('g', { class: 'ca-cloud-drift' });
      cloudG.append(svgEl('path', { d: 'M 218 22 h 28 a 6 6 0 0 0 0 -12 a 8 8 0 0 0 -15 -2 a 6 6 0 0 0 -13 4 a 5 5 0 0 0 0 10 z', fill: '#ffffff', opacity: 0.85 }));
      g.append(cloudG);

      // Subtle seabed silhouette + gentle swaying sea kelp & tiny background reef fish
      g.append(svgEl('path', { d: 'M 0 124 L 0 116 Q 60 109 130 117 T 260 114 T 320 118 L 320 124 Z', fill: '#194e6b', opacity: 0.45 }));
      g.append(svgEl('path', { d: 'M 68 122 Q 64 112 69 104 Q 73 111 71 122 Z M 75 122 Q 79 114 76 108 Q 72 115 74 122 Z', fill: '#145369', opacity: 0.55 }));
      g.append(svgEl('path', { d: 'M 224 122 Q 220 113 225 106 Q 229 113 227 122 Z', fill: '#145369', opacity: 0.5 }));
      // Distant ambient swimming reef fish silhouettes
      g.append(svgEl('path', { d: 'M 224 72 Q 230 68 236 72 Q 230 76 224 72 M 236 72 L 240 69 L 240 75 Z', fill: '#ffffff', opacity: 0.28 }));
      g.append(svgEl('path', { d: 'M 244 80 Q 248 77.5 252 80 Q 248 82.5 244 80 M 252 80 L 255 78 L 255 82 Z', fill: '#ffffff', opacity: 0.24 }));

      // Dual animated waves
      g.append(svgEl('path', {
        class: 'ca-wave-drift-slow',
        d: 'M -16 44 Q 4 40 24 44 T 64 44 T 104 44 T 144 44 T 184 44 T 224 44 T 264 44 T 304 44 T 344 44',
        fill: 'none', stroke: '#ffffff', 'stroke-width': 2.2, opacity: 0.55
      }));
      g.append(svgEl('path', {
        class: 'ca-wave-drift',
        d: 'M -12 45 Q 10 49 32 45 T 76 45 T 120 45 T 164 45 T 208 45 T 252 45 T 296 45 T 340 45',
        fill: 'none', stroke: PAL.blue, 'stroke-width': 2, opacity: 0.85
      }));

      // Rising underwater bubbles
      g.append(svgEl('circle', { cx: 88, cy: 96, r: 2.6, fill: '#ffffff', opacity: 0.55, class: 'ca-bubble-rise' }));
      g.append(svgEl('circle', { cx: 118, cy: 102, r: 1.8, fill: '#ffffff', opacity: 0.5, class: 'ca-bubble-rise-delay' }));
      g.append(svgEl('circle', { cx: 256, cy: 92, r: 2.2, fill: '#ffffff', opacity: 0.45, class: 'ca-bubble-rise' }));

      // Calibrated left depth scale
      g.append(svgEl('line', { x1: 42, y1: 14, x2: 42, y2: 112, stroke: '#ffffff', 'stroke-width': 1.5, opacity: 0.7 }));
      const seaTicks = isLive ? [0, -25, -50] : [10, 0, -10, -20];
      seaTicks.forEach(t => {
        const ty = valToY(t);
        const isZ = t === 0;
        g.append(svgEl('line', { x1: 36, y1: ty, x2: isZ ? 49 : 46, y2: ty, stroke: isZ ? PAL.gold : '#ffffff', 'stroke-width': isZ ? 2.2 : 1.3 }));
        g.append(svgEl('text', {
          x: 33, y: ty + 3.5, 'text-anchor': 'end',
          fill: isZ ? PAL.goldInk : (t > 0 ? PAL.blue : '#ffffff'),
          'font-size': 9.5, class: 'ca-num-txt'
        }, formatSignedBadge(t, '')));
      });

      // Zero reference horizon & badge (clean 10px gutter from live badge at x=130..186)
      g.append(svgEl('line', { x1: 48, y1: yZero, x2: 314, y2: yZero, stroke: PAL.gold, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }));
      g.append(svgEl('rect', { x: 196, y: 27, width: 108, height: 19, rx: 9.5, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.3 }));
      g.append(svgEl('text', { x: 250, y: 40, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, 'سطح البحر = 0 م'));

      // Vertical measurement line from 0 to actor
      const actorX = 104;
      const lineColor = curVal < -0.2 ? '#ffdad7' : (curVal > 0.2 ? PAL.blue : PAL.gold);
      g.append(svgEl('line', { x1: actorX, y1: yZero, x2: actorX, y2: actorY, stroke: lineColor, 'stroke-width': 2.2, 'stroke-dasharray': '3 3' }));
      g.append(svgEl('circle', { cx: actorX, cy: yZero, r: 3.5, fill: PAL.gold, stroke: '#ffffff', 'stroke-width': 1.2 }));

      // Handcrafted Exploration Submarine (below/at 0) or Striped Hot-Air Balloon (above 0)
      const actorG = svgEl('g', { transform: 'translate(' + actorX + ',' + actorY.toFixed(1) + ')' });
      const bobG = svgEl('g', { class: 'ca-bob-gentle' });
      if (curVal > 0.5) {
        // Vibrant striped teardrop hot-air balloon (stripes neatly contained inside smooth dome outline)
        const balloonPath = 'M -10 -4.5 C -10 -13.5 10 -13.5 10 -4.5 C 10 1.5 5 5.5 4 7.5 L -4 7.5 C -5 5.5 -10 1.5 -10 -4.5 Z';
        bobG.append(svgEl('path', { d: balloonPath, fill: PAL.blue }));
        bobG.append(svgEl('path', { d: 'M -4.2 -10.8 C -5 -4 -3 3 -2.6 7.5 L 2.6 7.5 C 3 3 5 -4 4.2 -10.8 Q 0 -11.8 -4.2 -10.8 Z', fill: '#f59e0b' }));
        bobG.append(svgEl('path', { d: 'M -1.5 -11.2 C -1.9 -4 -1 3 -0.9 7.5 L 0.9 7.5 C 1 3 1.9 -4 1.5 -11.2 Q 0 -11.5 -1.5 -11.2 Z', fill: '#fffbeb' }));
        bobG.append(svgEl('path', { d: balloonPath, fill: 'none', stroke: '#102a24', 'stroke-width': 1.25, 'stroke-linejoin': 'round' }));
        bobG.append(svgEl('circle', { cx: 0, cy: 8.8, r: 1.4, fill: '#f97316' }));
        bobG.append(svgEl('line', { x1: -3.2, y1: 7.5, x2: -2.6, y2: 10.6, stroke: '#78350f', 'stroke-width': 0.9 }));
        bobG.append(svgEl('line', { x1: 3.2, y1: 7.5, x2: 2.6, y2: 10.6, stroke: '#78350f', 'stroke-width': 0.9 }));
        bobG.append(svgEl('rect', { x: -4.2, y: 10.4, width: 8.4, height: 5.2, rx: 1.4, fill: '#b45309', stroke: '#102a24', 'stroke-width': 1 }));
        bobG.append(svgEl('line', { x1: -4, y1: 13, x2: 4, y2: 13, stroke: '#fde68a', 'stroke-width': 0.7 }));
      } else {
        // Detailed exploration mini submarine with periscope, propeller, brass porthole & belly highlight
        const hullCol = curVal < -0.5 ? '#c6363e' : '#d97706';
        const hullDark = curVal < -0.5 ? '#881337' : '#92400e';
        // Rear propeller shaft + dual blades + tail fin
        bobG.append(svgEl('path', { d: 'M -16 0 L -21 0', stroke: '#e2e8f0', 'stroke-width': 2.2 }));
        bobG.append(svgEl('ellipse', { cx: -21.5, cy: -3.2, rx: 1.8, ry: 3.4, fill: '#f59e0b', stroke: '#102a24', 'stroke-width': 0.85 }));
        bobG.append(svgEl('ellipse', { cx: -21.5, cy: 3.2, rx: 1.8, ry: 3.4, fill: '#f59e0b', stroke: '#102a24', 'stroke-width': 0.85 }));
        bobG.append(svgEl('path', { d: 'M -15 -4.5 L -19 -8.5 L -13 -7.5 Z M -15 4.5 L -19 8.5 L -13 7.5 Z', fill: hullDark, stroke: '#ffffff', 'stroke-width': 0.8 }));
        // Periscope tube + optical head
        bobG.append(svgEl('path', { d: 'M -1 -12 L -1 -16.5 L 3.5 -16.5', fill: 'none', stroke: '#e2e8f0', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        bobG.append(svgEl('circle', { cx: 3.8, cy: -16.5, r: 1.3, fill: '#38bdf8' }));
        // Conning tower hatch
        bobG.append(svgEl('path', { d: 'M -5 -7.5 L -4 -13.5 L 4 -13.5 L 5.5 -7.5 Z', fill: hullDark, stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
        // Rounded submarine hull + golden trim stripe + top gloss
        bobG.append(svgEl('ellipse', { cx: 0, cy: 0, rx: 17.5, ry: 9.8, fill: hullCol, stroke: '#ffffff', 'stroke-width': 1.6 }));
        bobG.append(svgEl('path', { d: 'M -14 3.5 Q 0 6.5 14 3.5', fill: 'none', stroke: '#fde68a', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
        bobG.append(svgEl('path', { d: 'M -9 -6 Q 0 -8.2 9 -5.5', fill: 'none', stroke: '#ffffff', 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.5 }));
        // Brass-rimmed recessed cockpit porthole + glint
        bobG.append(svgEl('circle', { cx: 6.5, cy: -0.5, r: 4.5, fill: '#e0f2fe', stroke: '#fde68a', 'stroke-width': 1.6 }));
        bobG.append(svgEl('circle', { cx: 5.2, cy: -1.8, r: 1.4, fill: '#ffffff', opacity: 0.9 }));
        // Side viewing port + rivets
        bobG.append(svgEl('circle', { cx: -3.5, cy: -0.5, r: 2.6, fill: '#bae6fd', stroke: '#fde68a', 'stroke-width': 1.1 }));
        bobG.append(svgEl('circle', { cx: -10.5, cy: -0.5, r: 1.1, fill: '#fde68a', opacity: 0.85 }));
      }
      actorG.append(bobG);
      g.append(actorG);

      // Live value badge beside actor (clean 10px gutter from zero badge)
      const dispVal = Math.round(curVal);
      const badgeFill = dispVal < 0 ? '#a82834' : (dispVal > 0 ? PAL.blue : PAL.gold);
      const bY = Math.max(18, Math.min(104, actorY));
      g.append(svgEl('rect', { x: 130, y: bY - 12, width: 56, height: 24, rx: 12, fill: badgeFill, stroke: '#ffffff', 'stroke-width': 1.5 }));
      g.append(svgEl('text', { x: 158, y: bY + 4, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 11.5, class: 'ca-num-txt' }, formatSignedBadge(dispVal, ' m')));

      // Zone caption bottom-right
      const zoneLbl = dispVal < 0 ? 'تحت سطح البحر (−)' : (dispVal > 0 ? 'فوق سطح البحر (+)' : 'عند خط المرجع (0)');
      g.append(svgEl('rect', { x: 198, y: 94, width: 112, height: 21, rx: 10.5, fill: '#ffffff', opacity: 0.92 }));
      g.append(svgEl('text', { x: 254, y: 108, 'text-anchor': 'middle', fill: dispVal < 0 ? PAL.neg : (dispVal > 0 ? PAL.blue : PAL.goldInk), 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, zoneLbl));
      return;
    }

    /* ---------- 2. SMART TOWER & GLASS ELEVATOR ---------- */
    if (mode === 'tower' || mode === 'elevator' || mode === 'lift') {
      const targetVal = st ? st.val : (isLive ? -Math.abs(Number(cfg.mag || 3)) : -2);
      const curVal = st && st.tweenFrom !== undefined ? (st.tweenFrom + (targetVal - st.tweenFrom) * p) : (targetVal * p);
      const yGround = 62;
      const minF = isLive ? -50 : -3;
      const maxF = isLive ? 10 : 3;
      const floorToY = f => {
        if (f >= 0) return yGround - (f / Math.max(1, maxF)) * 44;
        return yGround + (Math.abs(f) / Math.max(1, Math.abs(minF))) * 46;
      };
      const cabY = Math.max(15, Math.min(106, floorToY(curVal)));

      addGrad(defs, uid + '_ts', '0', '0', '0', '1', [['0%', '#dceffb'], ['100%', '#f6faee']]);
      addGrad(defs, uid + '_te', '0', '0', '0', '1', [['0%', '#eadac2'], ['100%', '#c9ae87']]);

      g.append(svgEl('rect', { x: 0, y: 0, width: 320, height: yGround, fill: 'url(#' + uid + '_ts)' }));
      g.append(svgEl('rect', { x: 0, y: yGround, width: 320, height: 124 - yGround, fill: 'url(#' + uid + '_te)' }));

      // Drifting sky cloud
      g.append(svgEl('path', {
        class: 'ca-cloud-drift',
        d: 'M 226 24 h 26 a 5.5 5.5 0 0 0 0 -11 a 7 7 0 0 0 -13 -2 a 5.5 5.5 0 0 0 -13 3.5 a 4.5 4.5 0 0 0 0 9.5 z',
        fill: '#ffffff', opacity: 0.85
      }));

      // Underground soil line texture
      g.append(svgEl('line', { x1: 0, y1: 86, x2: 320, y2: 86, stroke: '#b5976e', 'stroke-width': 1, 'stroke-dasharray': '8 6', opacity: 0.5 }));
      g.append(svgEl('line', { x1: 0, y1: 108, x2: 320, y2: 108, stroke: '#a18259', 'stroke-width': 1, 'stroke-dasharray': '6 6', opacity: 0.45 }));

      // Building silhouette (above ground + basement)
      const bX = 48;
      const bW = 86;
      // Roof spire
      g.append(svgEl('line', { x1: bX + bW / 2, y1: 4, x2: bX + bW / 2, y2: 12, stroke: PAL.teal, 'stroke-width': 2 }));
      g.append(svgEl('circle', { cx: bX + bW / 2, cy: 4, r: 2.2, fill: PAL.gold }));
      // Above-ground tower with subtle glass diagonal sheen & rooftop trim
      g.append(svgEl('rect', { x: bX, y: 12, width: bW, height: yGround - 12, rx: 4, fill: '#1a5a7a', stroke: '#0f3d54', 'stroke-width': 1.5 }));
      g.append(svgEl('polygon', { points: (bX + 2) + ',26 ' + (bX + bW - 2) + ',14 ' + (bX + bW - 2) + ',30 ' + (bX + 2) + ',44', fill: '#ffffff', opacity: 0.12 }));
      // Underground parking concrete
      g.append(svgEl('rect', { x: bX, y: yGround, width: bW, height: 54, rx: 4, fill: '#475569', stroke: '#334155', 'stroke-width': 1.5 }));
      // Stylized green ground-level tree beside tower
      g.append(svgEl('rect', { x: bX + bW + 7, y: yGround - 7, width: 2.5, height: 7, fill: '#78350f' }));
      g.append(svgEl('ellipse', { cx: bX + bW + 8.2, cy: yGround - 12, rx: 5, ry: 7, fill: '#15803d', stroke: '#0f3d2e', 'stroke-width': 0.9 }));

      // Illuminated windows left & right of shaft
      [20, 34, 48].forEach(wy => {
        [bX + 8, bX + 19, bX + bW - 27, bX + bW - 16].forEach(wx => {
          g.append(svgEl('rect', { x: wx, y: wy, width: 8, height: 8, rx: 1.5, fill: '#bfe7f7', opacity: 0.88 }));
        });
      });
      // Underground parking bays + miniature parked car silhouettes
      [70, 86, 102].forEach((py, bIdx) => {
        g.append(svgEl('line', { x1: bX + 4, y1: py, x2: bX + 30, y2: py, stroke: '#94a3b8', 'stroke-width': 1, opacity: 0.6 }));
        g.append(svgEl('line', { x1: bX + bW - 30, y1: py, x2: bX + bW - 4, y2: py, stroke: '#94a3b8', 'stroke-width': 1, opacity: 0.6 }));
        // Subtle parked car on alternating bays
        const carX = bIdx % 2 === 0 ? (bX + 8) : (bX + bW - 25);
        g.append(svgEl('path', {
          d: 'M ' + carX + ' ' + (py + 9) + ' L ' + (carX + 3) + ' ' + (py + 5) + ' L ' + (carX + 12) + ' ' + (py + 5) + ' L ' + (carX + 15) + ' ' + (py + 9) + ' L ' + (carX + 17) + ' ' + (py + 12) + ' L ' + (carX - 1) + ' ' + (py + 12) + ' Z',
          fill: bIdx === 1 ? '#e2e8f0' : '#94a3b8', opacity: 0.65
        }));
      });

      // Central glass elevator shaft
      const shaftX = bX + bW / 2 - 11;
      g.append(svgEl('rect', { x: shaftX, y: 14, width: 22, height: 100, rx: 3, fill: '#eef6fb', stroke: '#94a3b8', 'stroke-width': 1.2 }));
      // Steel cable
      g.append(svgEl('line', { x1: bX + bW / 2, y1: 14, x2: bX + bW / 2, y2: cabY - 7, stroke: '#64748b', 'stroke-width': 1.5 }));

      // Ground horizon line (0)
      g.append(svgEl('line', { x1: 0, y1: yGround, x2: 320, y2: yGround, stroke: PAL.gold, 'stroke-width': 2.2, 'stroke-dasharray': '5 3' }));

      // Floor scale ticks on left of tower
      const flTicks = isLive ? [0, -25, -50] : [3, 2, 1, 0, -1, -2, -3];
      flTicks.forEach(f => {
        const fy = floorToY(f);
        const isZ = f === 0;
        g.append(svgEl('line', { x1: 37, y1: fy, x2: 45, y2: fy, stroke: isZ ? PAL.gold : (f > 0 ? PAL.blue : PAL.neg), 'stroke-width': isZ ? 2.2 : 1.3 }));
        g.append(svgEl('text', {
          x: 33, y: fy + 3.5, 'text-anchor': 'end',
          fill: isZ ? PAL.goldInk : (f > 0 ? PAL.blue : PAL.neg),
          'font-size': 9.5, class: 'ca-num-txt'
        }, formatSignedBadge(f, '')));
      });

      // Moving lit elevator cabin
      const dispF = Math.round(curVal);
      const cabColor = dispF < 0 ? '#b4232c' : (dispF > 0 ? '#0f5d84' : '#c88d21');
      g.append(svgEl('rect', { x: shaftX + 2, y: cabY - 7.5, width: 18, height: 15, rx: 3, fill: cabColor, stroke: '#ffffff', 'stroke-width': 1.5 }));
      g.append(svgEl('rect', { x: shaftX + 5, y: cabY - 4.5, width: 12, height: 6, rx: 1.5, fill: '#fef9e7', opacity: 0.9 }));

      // Right-side info cards (clean 10px gutter from live floor pill at x=140..182)
      g.append(svgEl('text', { x: 248, y: 24, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, 'طوابق عليا (+)'));
      g.append(svgEl('rect', { x: 192, y: 52, width: 112, height: 20, rx: 10, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.3 }));
      g.append(svgEl('text', { x: 248, y: 66, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, 'سطح الأرض = 0'));
      g.append(svgEl('text', { x: 248, y: 112, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, 'مواقف تحت الأرض (−)'));

      // Live floor badge aligned to cabin (never overlaps right-side badges)
      const badgeY = Math.max(24, Math.min(102, cabY));
      g.append(svgEl('rect', { x: 140, y: badgeY - 11, width: 42, height: 22, rx: 11, fill: cabColor, stroke: '#ffffff', 'stroke-width': 1.4 }));
      g.append(svgEl('text', { x: 161, y: badgeY + 4, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 11, class: 'ca-num-txt' }, formatSignedBadge(dispF, '')));
      return;
    }

    /* ---------- 3. WEATHER-REACTIVE GLASS THERMOMETER ---------- */
    if (mode === 'thermo' || mode === 'temp') {
      const targetVal = st ? st.val : (isLive ? -Math.abs(Number(cfg.mag || 6)) : -4);
      const curVal = st && st.tweenFrom !== undefined ? (st.tweenFrom + (targetVal - st.tweenFrom) * p) : (targetVal * p);
      const minT = isLive ? -50 : -10;
      const maxT = isLive ? 10 : 10;
      const dispT = Math.round(curVal);
      const isCold = curVal < -0.2;
      const isWarm = curVal > 0.2;

      addGrad(defs, uid + '_bgc', '0', '0', '1', '0', [['0%', '#dceef9'], ['50%', '#eef6fb'], ['100%', '#fdf6e4']]);
      g.append(svgEl('rect', { x: 0, y: 0, width: 320, height: 124, fill: 'url(#' + uid + '_bgc)' }));

      // Weather mood visuals: intricate 6-point ice crystal snowflakes on left, warm glowing sun on right
      // Note: CSS float animation goes on an INNER <g> so it never overrides SVG translate(x,y)
      const snowOp = isCold ? 0.94 : 0.3;
      const sunOp = isWarm ? 0.96 : 0.32;
      [[34, 22, 1], [64, 16, 0.85], [94, 24, 0.92]].forEach((pt, idx) => {
        const posG = svgEl('g', { transform: 'translate(' + pt[0] + ',' + pt[1] + ') scale(' + pt[2] + ')', opacity: snowOp });
        const sg = svgEl('g', { class: idx % 2 === 0 ? 'ca-snow-float' : '' });
        for (let a = 0; a < 6; a++) {
          const rad = (a * Math.PI) / 3;
          const x2 = Math.cos(rad) * 6.5;
          const y2 = Math.sin(rad) * 6.5;
          sg.append(svgEl('line', { x1: 0, y1: 0, x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: PAL.blue, 'stroke-width': 1.25, 'stroke-linecap': 'round' }));
          // Delicate ice crystal side barb
          const bx = Math.cos(rad) * 3.8;
          const by = Math.sin(rad) * 3.8;
          sg.append(svgEl('line', {
            x1: bx.toFixed(1), y1: by.toFixed(1),
            x2: (bx + Math.cos(rad + 0.65) * 2.2).toFixed(1), y2: (by + Math.sin(rad + 0.65) * 2.2).toFixed(1),
            stroke: '#38bdf8', 'stroke-width': 0.95, 'stroke-linecap': 'round'
          }));
          sg.append(svgEl('line', {
            x1: bx.toFixed(1), y1: by.toFixed(1),
            x2: (bx + Math.cos(rad - 0.65) * 2.2).toFixed(1), y2: (by + Math.sin(rad - 0.65) * 2.2).toFixed(1),
            stroke: '#38bdf8', 'stroke-width': 0.95, 'stroke-linecap': 'round'
          }));
        }
        sg.append(svgEl('circle', { cx: 0, cy: 0, r: 1.5, fill: '#ffffff', stroke: PAL.blue, 'stroke-width': 0.9 }));
        posG.append(sg);
        g.append(posG);
      });

      const sunG = svgEl('g', { opacity: sunOp, class: 'ca-sun-pulse' });
      sunG.append(svgEl('circle', { cx: 282, cy: 22, r: 13, fill: '#fde68a', opacity: 0.45 }));
      sunG.append(svgEl('circle', { cx: 282, cy: 22, r: 8.5, fill: '#f5b82e', stroke: '#d97706', 'stroke-width': 1 }));
      sunG.append(svgEl('circle', { cx: 279.5, cy: 19.5, r: 2.5, fill: '#fef9c3', opacity: 0.85 }));
      for (let a = 0; a < 8; a++) {
        const rad = (a * Math.PI) / 4;
        sunG.append(svgEl('line', {
          x1: (282 + Math.cos(rad) * 11).toFixed(1), y1: (22 + Math.sin(rad) * 11).toFixed(1),
          x2: (282 + Math.cos(rad) * 15.5).toFixed(1), y2: (22 + Math.sin(rad) * 15.5).toFixed(1),
          stroke: '#d99b26', 'stroke-width': 1.7, 'stroke-linecap': 'round'
        }));
      }
      g.append(sunG);

      // Horizontal Glass Thermometer Tube
      const tubeX = 48;
      const tubeW = 240;
      const tubeY = 52;
      const tubeH = 20;
      const valToX = v => tubeX + ((v - minT) / Math.max(1, maxT - minT)) * tubeW;
      const zeroX = valToX(0);
      const curX = Math.max(tubeX + 4, Math.min(tubeX + tubeW - 4, valToX(curVal)));

      // Glass outer shell
      g.append(svgEl('rect', { x: tubeX - 2, y: tubeY - 2, width: tubeW + 6, height: tubeH + 4, rx: 12, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.8 }));
      g.append(svgEl('rect', { x: tubeX + 2, y: tubeY + 2, width: tubeW - 2, height: tubeH - 4, rx: 8, fill: '#f1f5f9' }));

      // Mercury column from zeroX to curX (shows distance from 0 clearly!)
      const mercColor = isCold ? '#b4232c' : (isWarm ? '#0f5d84' : '#c88d21');
      const barX = Math.min(zeroX, curX);
      const barW = Math.max(6, Math.abs(curX - zeroX));
      g.append(svgEl('rect', { x: barX, y: tubeY + 4, width: barW, height: tubeH - 8, rx: 6, fill: mercColor }));
      // Specular glass highlight
      g.append(svgEl('line', { x1: tubeX + 8, y1: tubeY + 5, x2: tubeX + tubeW - 8, y2: tubeY + 5, stroke: '#ffffff', 'stroke-width': 1.8, opacity: 0.65, 'stroke-linecap': 'round' }));

      // Thermometer round bulb on left
      g.append(svgEl('circle', { cx: 36, cy: tubeY + tubeH / 2, r: 15, fill: '#ffffff', stroke: '#cbd5e1', 'stroke-width': 1.8 }));
      g.append(svgEl('circle', { cx: 36, cy: tubeY + tubeH / 2, r: 10.5, fill: mercColor }));
      g.append(svgEl('circle', { cx: 32.5, cy: tubeY + tubeH / 2 - 3.5, r: 3, fill: '#ffffff', opacity: 0.55 }));

      // Golden 0°C freezing gate line
      g.append(svgEl('line', { x1: zeroX, y1: 35, x2: zeroX, y2: 86, stroke: PAL.gold, 'stroke-width': 2.4 }));
      g.append(svgEl('rect', { x: zeroX - 20, y: 14, width: 40, height: 19, rx: 9.5, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.3 }));
      g.append(svgEl('text', { x: zeroX, y: 27, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-num-txt' }, '0°C'));

      // Scale ticks below tube
      const tTicks = isLive ? [-50, -25, 0, 10] : [-10, -5, 0, 5, 10];
      tTicks.forEach(t => {
        const tx = valToX(t);
        g.append(svgEl('line', { x1: tx, y1: tubeY + tubeH + 2, x2: tx, y2: tubeY + tubeH + 7, stroke: t === 0 ? PAL.gold : PAL.muted, 'stroke-width': t === 0 ? 2 : 1.2 }));
        g.append(svgEl('text', {
          x: tx, y: tubeY + tubeH + 18, 'text-anchor': 'middle',
          fill: t < 0 ? PAL.neg : (t === 0 ? PAL.goldInk : PAL.blue),
          'font-size': 9.5, class: 'ca-num-txt'
        }, formatSignedBadge(t, '')));
      });

      // Draggable glossy thumb marker
      g.append(svgEl('circle', { cx: curX, cy: tubeY + tubeH / 2, r: 9.5, fill: '#ffffff', stroke: mercColor, 'stroke-width': 2.6 }));
      g.append(svgEl('circle', { cx: curX, cy: tubeY + tubeH / 2, r: 3.5, fill: mercColor }));

      // Bottom zone labels
      g.append(svgEl('text', { x: 96, y: 113, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, 'تحت الصفر (−)'));
      g.append(svgEl('text', { x: 244, y: 113, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, 'فوق الصفر (+)'));
      if (isLive) {
        // Live pill centered in clear top sky between snowflakes (<=99) and 0°C badge (>=228)
        g.append(svgEl('rect', { x: 130, y: 13, width: 62, height: 22, rx: 11, fill: mercColor, stroke: '#ffffff', 'stroke-width': 1.4 }));
        g.append(svgEl('text', { x: 161, y: 28, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 11, class: 'ca-num-txt' }, formatSignedBadge(dispT, '°C')));
      }
      return;
    }

    /* ---------- 4. STEP-BY-STEP ZERO-CROSSING HOPPER (SHIFT) ---------- */
    if (mode === 'shift') {
      const start = Number(cfg.start !== undefined ? cfg.start : 3);
      const totalSteps = Math.max(1, Number(cfg.steps || 8));
      const targetHop = st ? st.hop : totalSteps;
      const curHopFloat = st && st.tweenFrom !== undefined ? (st.tweenFrom + (targetHop - st.tweenFrom) * p) : (targetHop * p);
      const minN = Math.min(-8, start - totalSteps - 1);
      const maxN = Math.max(6, start + 1);
      const span = Math.max(1, maxN - minN);
      const xStart = 24;
      const xEnd = 296;
      const nToX = n => xStart + ((n - minN) / span) * (xEnd - xStart);
      const yLine = 74;
      const zeroX = nToX(0);

      // Subtle negative vs positive zone washes
      g.append(svgEl('rect', { x: 0, y: 0, width: zeroX, height: 124, fill: '#fdf3f3' }));
      g.append(svgEl('rect', { x: zeroX, y: 0, width: 320 - zeroX, height: 124, fill: '#f0f7fc' }));

      // Golden 0 gate
      g.append(svgEl('line', { x1: zeroX, y1: 30, x2: zeroX, y2: 96, stroke: PAL.gold, 'stroke-width': 2.2, 'stroke-dasharray': '4 3' }));
      g.append(svgEl('rect', { x: zeroX - 13, y: 14, width: 26, height: 18, rx: 9, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.2 }));
      g.append(svgEl('text', { x: zeroX, y: 26.5, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-num-txt' }, '0'));

      // Number line spine + ticks
      g.append(svgEl('line', { x1: 16, y1: yLine, x2: 304, y2: yLine, stroke: PAL.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
      for (let t = Math.ceil(minN); t <= Math.floor(maxN); t++) {
        const tx = nToX(t);
        const isMajor = t === 0 || t % 2 === 0;
        g.append(svgEl('line', {
          x1: tx, y1: yLine - (isMajor ? 7 : 4), x2: tx, y2: yLine + (isMajor ? 7 : 4),
          stroke: t === 0 ? PAL.gold : (isMajor ? PAL.ink : PAL.muted), 'stroke-width': t === 0 ? 2.5 : (isMajor ? 1.6 : 1)
        }));
        if (isMajor) {
          g.append(svgEl('text', {
            x: tx, y: yLine + 21, 'text-anchor': 'middle',
            fill: t < 0 ? PAL.neg : (t === 0 ? PAL.goldInk : PAL.blue),
            'font-size': 10, class: 'ca-num-txt'
          }, formatSignedBadge(t, '')));
        }
      }

      // Start marker
      const sx = nToX(start);
      g.append(svgEl('circle', { cx: sx, cy: yLine, r: 5.5, fill: PAL.blue, stroke: '#ffffff', 'stroke-width': 1.6 }));
      g.append(svgEl('text', { x: sx, y: yLine - 12, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 9.5, class: 'ca-num-txt' }, formatSignedBadge(start, '')));

      // Individual animated hop arcs!
      const wholeHops = Math.floor(curHopFloat);
      const fracHop = curHopFloat - wholeHops;
      for (let h = 0; h < wholeHops; h++) {
        const x1 = nToX(start - h);
        const x2 = nToX(start - h - 1);
        const crossed = (start - h - 1) < 0;
        g.append(svgEl('path', {
          d: 'M ' + x1.toFixed(1) + ' ' + (yLine - 5) + ' Q ' + ((x1 + x2) / 2).toFixed(1) + ' ' + (yLine - 27) + ' ' + x2.toFixed(1) + ' ' + (yLine - 5),
          fill: 'none', stroke: crossed ? PAL.neg : PAL.teal, 'stroke-width': 2.1, 'stroke-linecap': 'round'
        }));
      }
      if (fracHop > 0.02 && wholeHops < totalSteps) {
        const x1 = nToX(start - wholeHops);
        const x2 = nToX(start - wholeHops - 1);
        const cx = x1 + (x2 - x1) * fracHop;
        const cy = yLine - 5 - Math.sin(fracHop * Math.PI) * 18;
        g.append(svgEl('path', {
          d: 'M ' + x1.toFixed(1) + ' ' + (yLine - 5) + ' Q ' + ((x1 + cx) / 2).toFixed(1) + ' ' + (yLine - 24) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1),
          fill: 'none', stroke: PAL.neg, 'stroke-width': 2.2
        }));
      }

      // Active hopper marker (keeps final target as ؟ so MCQs are NEVER spoiled!)
      const hopX = nToX(start - curHopFloat);
      const atEnd = curHopFloat >= totalSteps - 0.05;
      const crossedZero = (start - curHopFloat) < 0;
      g.append(svgEl('circle', {
        cx: hopX, cy: yLine, r: atEnd ? 10 : 7.5,
        fill: atEnd ? PAL.goldSoft : (crossedZero ? PAL.neg : PAL.teal),
        stroke: atEnd ? PAL.gold : '#ffffff', 'stroke-width': 2
      }));
      if (atEnd) {
        g.append(svgEl('text', { x: hopX, y: yLine + 4, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11.5, class: 'ca-ar-txt' }, '؟'));
      }

      // Top status chip
      const statusTxt = curHopFloat <= 0.1
        ? 'نقطة البداية قبل الانخفاض'
        : (crossedZero ? 'عبرنا الصفر نحو السالب (−)!' : 'نتحرك يسارًا نحو الصفر');
      g.append(svgEl('text', { x: 160, y: 112, 'text-anchor': 'middle', fill: crossedZero ? PAL.neg : PAL.ink, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, statusTxt));
      return;
    }

    /* ---------- 5. BANK BALANCE VAULT ---------- */
    if (mode === 'bank') {
      const targetVal = st ? st.val : -Math.abs(Number(cfg.mag || 15));
      const curVal = st && st.tweenFrom !== undefined ? (st.tweenFrom + (targetVal - st.tweenFrom) * p) : (targetVal * p);
      const minB = isLive ? -50 : -30;
      const maxB = isLive ? 10 : 30;
      const barLeft = 28;
      const barW = 264;
      const valToX = v => barLeft + ((v - minB) / Math.max(1, maxB - minB)) * barW;
      const zeroX = valToX(0);
      const curX = Math.max(barLeft + 6, Math.min(barLeft + barW - 6, valToX(curVal)));
      const dispB = Math.round(curVal);

      addGrad(defs, uid + '_bk', '0', '0', '1', '0', [['0%', '#fdf1f1'], ['70%', '#f6f8f3'], ['100%', '#eaf5f1']]);
      g.append(svgEl('rect', { x: 0, y: 0, width: 320, height: 124, fill: 'url(#' + uid + '_bk)' }));

      // Sculpted 3D golden dinar coins near top
      const coinG = svgEl('g', { class: 'ca-bob-gentle' });
      [0, 1, 2].forEach(i => {
        const cx = 44 + i * 11;
        coinG.append(svgEl('circle', { cx: cx + 1, cy: 25, r: 8.5, fill: '#b45309', opacity: 0.45 }));
        coinG.append(svgEl('circle', { cx, cy: 24, r: 8.5, fill: '#f59e0b', stroke: '#92400e', 'stroke-width': 1.25 }));
        coinG.append(svgEl('circle', { cx, cy: 24, r: 6.2, fill: '#fde68a', stroke: '#d97706', 'stroke-width': 0.8 }));
      });
      coinG.append(svgEl('path', { d: 'M 63 18.5 Q 67 17.5 69.5 20.5', fill: 'none', stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.85 }));
      coinG.append(svgEl('text', { x: 66, y: 27.5, 'text-anchor': 'middle', fill: '#78350f', 'font-size': 9.5, class: 'ca-ar-txt' }, 'د'));
      g.append(coinG);

      // Zero reference
      g.append(svgEl('line', { x1: zeroX, y1: 34, x2: zeroX, y2: 84, stroke: PAL.gold, 'stroke-width': 2.4 }));
      g.append(svgEl('rect', { x: zeroX - 42, y: 12, width: 84, height: 20, rx: 10, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.3 }));
      g.append(svgEl('text', { x: zeroX, y: 25.5, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, 'الرصيد = 0'));

      // Gauge track + fill
      g.append(svgEl('rect', { x: barLeft, y: 49, width: barW, height: 20, rx: 10, fill: '#ffffff', stroke: PAL.grid, 'stroke-width': 1.6 }));
      const fillColor = dispB < 0 ? '#b4232c' : (dispB > 0 ? PAL.teal : PAL.gold);
      const fx = Math.min(zeroX, curX);
      const fw = Math.max(6, Math.abs(curX - zeroX));
      g.append(svgEl('rect', { x: fx, y: 53, width: fw, height: 12, rx: 6, fill: fillColor }));

      // Draggable handle
      g.append(svgEl('circle', { cx: curX, cy: 59, r: 10, fill: '#ffffff', stroke: fillColor, 'stroke-width': 2.6 }));
      g.append(svgEl('circle', { cx: curX, cy: 59, r: 3.5, fill: fillColor }));

      // Live badge
      g.append(svgEl('rect', { x: 96, y: 88, width: 128, height: 24, rx: 12, fill: fillColor }));
      g.append(svgEl('text', { x: 160, y: 104, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 11, class: 'ca-num-txt' }, formatSignedBadge(dispB, ' JD')));
      return;
    }

    /* ---------- 6. INTERACTIVE MIRROR SYMMETRY NUMBER LINE (line_sym) ---------- */
    const targetMag = Math.min(6, Math.max(0, Math.abs(st ? st.val : 4)));
    const curMag = st && st.tweenFrom !== undefined ? (Math.abs(st.tweenFrom) + (targetMag - Math.abs(st.tweenFrom)) * p) : (targetMag * p);
    const yLine = 74;

    // Split negative (left) vs positive (right) backdrop + golden mirror axis
    g.append(svgEl('rect', { x: 0, y: 0, width: 160, height: 124, fill: '#fdf3f3' }));
    g.append(svgEl('rect', { x: 160, y: 0, width: 160, height: 124, fill: '#eff6fc' }));
    g.append(svgEl('line', { x1: 160, y1: 14, x2: 160, y2: 108, stroke: PAL.gold, 'stroke-width': 2.2, 'stroke-dasharray': '4 3' }));

    // Mirror badge at top
    g.append(svgEl('rect', { x: 120, y: 8, width: 80, height: 19, rx: 9.5, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.2 }));
    g.append(svgEl('text', { x: 160, y: 21, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl' }, 'المرآة: الصفر 0'));

    // Number line spine + arrows
    g.append(svgEl('line', { x1: 16, y1: yLine, x2: 304, y2: yLine, stroke: PAL.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    g.append(svgEl('path', { d: 'M 22 69 L 14 74 L 22 79', fill: 'none', stroke: PAL.neg, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    g.append(svgEl('path', { d: 'M 298 69 L 306 74 L 298 79', fill: 'none', stroke: PAL.blue, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    // Symmetric twin arcs from 0 to -curMag and +curMag
    if (curMag > 0.08) {
      const spanPx = curMag * 21;
      const peakY = Math.max(30, yLine - 16 - curMag * 4.5);
      g.append(svgEl('path', {
        d: 'M 160 ' + (yLine - 6) + ' Q ' + (160 - spanPx / 2).toFixed(1) + ' ' + peakY.toFixed(1) + ' ' + (160 - spanPx).toFixed(1) + ' ' + (yLine - 6),
        fill: 'none', stroke: PAL.neg, 'stroke-width': 2.5, 'stroke-linecap': 'round'
      }));
      g.append(svgEl('path', {
        d: 'M 160 ' + (yLine - 6) + ' Q ' + (160 + spanPx / 2).toFixed(1) + ' ' + peakY.toFixed(1) + ' ' + (160 + spanPx).toFixed(1) + ' ' + (yLine - 6),
        fill: 'none', stroke: PAL.blue, 'stroke-width': 2.5, 'stroke-linecap': 'round'
      }));
      // Twin glowing endpoint beads
      g.append(svgEl('circle', { cx: 160 - spanPx, cy: yLine, r: 7, fill: PAL.neg, stroke: '#ffffff', 'stroke-width': 2 }));
      g.append(svgEl('circle', { cx: 160 + spanPx, cy: yLine, r: 7, fill: PAL.blue, stroke: '#ffffff', 'stroke-width': 2 }));
    } else {
      g.append(svgEl('circle', { cx: 160, cy: yLine, r: 8, fill: PAL.gold, stroke: '#ffffff', 'stroke-width': 2 }));
    }

    // All integer ticks (-6 to +6) clickable!
    for (let n = -6; n <= 6; n++) {
      const x = 160 + n * 21;
      const isSelected = targetMag > 0 ? Math.abs(n) === targetMag : n === 0;
      const isEven = n % 2 === 0;
      g.append(svgEl('line', {
        x1: x, y1: yLine - (isEven || isSelected ? 7 : 4), x2: x, y2: yLine + (isEven || isSelected ? 7 : 4),
        stroke: n === 0 ? PAL.gold : (isSelected ? (n < 0 ? PAL.neg : PAL.blue) : PAL.muted),
        'stroke-width': n === 0 || isSelected ? 2.4 : 1.3
      }));
      if (isEven || isSelected) {
        g.append(svgEl('text', {
          x, y: yLine + 22, 'text-anchor': 'middle',
          fill: n < 0 ? PAL.neg : (n === 0 ? PAL.goldInk : PAL.blue),
          'font-size': isSelected ? 11.5 : 9.5, class: 'ca-num-txt'
        }, formatSignedBadge(n, '')));
      }
    }

    // Zone labels bottom
    g.append(svgEl('text', { x: 64, y: 114, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 9.5, class: 'ca-ar-txt', direction: 'rtl' }, 'يسار الصفر: سالب (−)'));
    g.append(svgEl('text', { x: 256, y: 114, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 9.5, class: 'ca-ar-txt', direction: 'rtl' }, 'يمين الصفر: موجب (+)'));
  }

  /* ------------------------------------------------------------------
     Scene 5: Lesson 5 — Pattern Table, Grid Pairs, Coin Balance, Rope Pairs
     ------------------------------------------------------------------ */
  function drawPatternTable(svg, cfg, p) {
    const mode = cfg.mode || 'ratio_grow';
    if (mode === 'grid_pairs') {
      const rightN = Math.min(4, Number(cfg.rows || 3));
      const leftN = Math.min(5, Number(cfg.cols || 4));
      const rightLbl = cfg.rightLabel || 'القمصان';
      const leftLbl = cfg.leftLabel || 'الربطات';
      svg.append(svgEl('text', { x: 256, y: 12, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt' }, rightLbl));
      svg.append(svgEl('text', { x: 68, y: 12, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10, class: 'ca-ar-txt' }, leftLbl));

      const rStep = rightN <= 2 ? 28 : 22;
      const rStart = rightN <= 2 ? 32 : 26;
      const lStep = leftN <= 3 ? 21 : 17;
      const lStart = leftN <= 3 ? 26 : 23;

      const maxLinks = Math.ceil(p * rightN);
      for (let i = 0; i < maxLinks; i++) {
        const sy = rStart + i * rStep;
        for (let j = 0; j < leftN; j++) {
          const ey = lStart + j * lStep;
          svg.append(svgEl('line', {
            x1: 245, y1: sy, x2: 78, y2: ey,
            stroke: i === 0 ? PAL.teal : PAL.tealBorder,
            'stroke-width': i === 0 ? 1.6 : 0.9,
            opacity: i === 0 ? 0.92 : 0.4
          }));
        }
      }
      for (let i = 0; i < rightN; i++) {
        const y = rStart + i * rStep;
        svg.append(svgEl('circle', { cx: 256, cy: y, r: 8.5, fill: i === 0 ? PAL.goldSoft : PAL.surface, stroke: PAL.gold, 'stroke-width': i === 0 ? 1.8 : 1.4 }));
        svg.append(svgEl('text', { x: 256, y: y + 3.5, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-num-txt' }, String(i + 1)));
      }
      for (let j = 0; j < leftN; j++) {
        const y = lStart + j * lStep;
        svg.append(svgEl('circle', { cx: 68, cy: y, r: 6.5, fill: PAL.blueSoft, stroke: PAL.blue, 'stroke-width': 1.4 }));
        svg.append(svgEl('text', { x: 68, y: y + 3, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 9, class: 'ca-num-txt' }, String(j + 1)));
      }
      svg.append(svgEl('text', { x: 162, y: 91, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10, class: 'ca-ar-txt' }, 'كل خيار من اليمين يرتبط بكل خيارات اليسار'));
      return;
    }

    if (mode === 'rope_pairs') {
      if (cfg.hideSpoiler === 'dup') {
        svg.append(svgEl('rect', { x: 188, y: 24, width: 112, height: 34, rx: 10, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.6 }));
        svg.append(svgEl('text', { x: 244, y: 45, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11.5, class: 'ca-ar-txt' }, 'ريما ولانا'));
        svg.append(svgEl('circle', { cx: 160, cy: 41, r: 14, fill: PAL.surface, stroke: PAL.tealBorder, 'stroke-width': 1.6, opacity: 0.4 + 0.6 * p }));
        svg.append(svgEl('text', { x: 160, y: 45, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 13, class: 'ca-ar-txt' }, '؟'));
        svg.append(svgEl('rect', { x: 20, y: 24, width: 112, height: 34, rx: 10, fill: PAL.tealSoft, stroke: PAL.tealBorder, 'stroke-width': 1.6, opacity: 0.35 + 0.65 * p }));
        svg.append(svgEl('text', { x: 76, y: 45, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 11.5, class: 'ca-ar-txt' }, 'لانا وريما'));
        svg.append(svgEl('text', { x: 160, y: 81, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10.5, class: 'ca-ar-txt' }, 'هل تبديل ترتيب الاسمين يصنع زوجًا جديدًا؟'));
        return;
      }

      const names = ['ريما', 'لانا', 'سحر', 'ديمة'];
      const xs = [262, 194, 126, 58];
      const hideJump = cfg.hideSpoiler === 'jump';
      names.forEach((nm, i) => {
        const hold = i < 2;
        svg.append(svgEl('circle', {
          cx: xs[i], cy: 48, r: 16,
          fill: hold ? PAL.goldSoft : (hideJump ? PAL.surface : PAL.tealSoft),
          stroke: hold ? PAL.gold : PAL.tealBorder,
          'stroke-width': 1.8,
          'stroke-dasharray': !hold && hideJump ? '3 3' : ''
        }));
        svg.append(svgEl('text', { x: xs[i], y: 52, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, !hold && hideJump ? '؟' : nm));
      });
      svg.append(svgEl('path', {
        d: 'M 262 28 Q 228 10 194 28', fill: 'none', stroke: PAL.gold,
        'stroke-width': 2.2, 'stroke-dasharray': '90', 'stroke-dashoffset': String(Math.round(90 * (1 - p)))
      }));
      svg.append(svgEl('path', {
        d: 'M 126 28 Q 92 10 58 28', fill: 'none', stroke: PAL.teal,
        'stroke-width': 2.2, 'stroke-dasharray': '90', 'stroke-dashoffset': String(Math.round(90 * (1 - p)))
      }));
      svg.append(svgEl('text', { x: 228, y: 14, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt' }, 'تمسكان الحبل'));
      svg.append(svgEl('text', { x: 92, y: 14, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10, class: 'ca-ar-txt' }, 'تقفزان'));
      svg.append(svgEl('text', { x: 160, y: 84, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, hideJump ? 'الصديقات الأربع: ريما · لانا · سحر · ديمة' : 'نحصر كل الأزواج بانتظام دون تكرار'));
      return;
    }

    if (mode === 'coin_swap') {
      svg.append(svgEl('text', { x: 160, y: 16, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, 'التبديل بين فئة 10 قروش وفئة 5 قروش'));
      svg.append(svgEl('circle', { cx: 232, cy: 48, r: 20, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 2 }));
      svg.append(svgEl('text', { x: 232, y: 53, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 13, class: 'ca-num-txt' }, '10'));
      svg.append(svgEl('text', { x: 176, y: 53, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 15, class: 'ca-num-txt' }, '='));
      svg.append(svgEl('rect', { x: 46, y: 30, width: 102, height: 36, rx: 18, fill: PAL.tealSoft, stroke: PAL.tealBorder, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: 0.35 + 0.65 * p }));
      svg.append(svgEl('text', { x: 97, y: 53, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 12.5, class: 'ca-num-txt', opacity: 0.35 + 0.65 * p }, '□ × 5'));
      svg.append(svgEl('text', { x: 160, y: 86, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, 'كم قطعة من فئة 5 قروش تساوي 10 قروش؟'));
      return;
    }

    if (mode === 'coin_balance') {
      const target = Number(cfg.target || 50);
      const tensCount = Number.isFinite(cfg.tensCount) ? Number(cfg.tensCount) : 3;
      const fixedVal = tensCount * 10;
      const remVal = Math.max(0, target - fixedVal);
      svg.append(svgEl('text', { x: 160, y: 17, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, 'توزيع المبلغ الكلي (50 قرشًا) بين الفئتين'));
      svg.append(svgEl('rect', { x: 24, y: 31, width: 272, height: 26, rx: 12, fill: PAL.white, stroke: PAL.grid, 'stroke-width': 1.5 }));
      const fixedW = Math.max(76, Math.round((fixedVal / target) * 268));
      const remMaxW = Math.max(60, 266 - fixedW);
      const remW = Math.round(remMaxW * Math.max(0.25, p));
      svg.append(svgEl('rect', { x: 26, y: 33, width: fixedW, height: 22, rx: 9, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.4 }));
      svg.append(svgEl('text', { x: 26 + fixedW / 2, y: 48, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-num-txt' }, tensCount + ' × 10 = ' + fixedVal));
      svg.append(svgEl('rect', { x: 28 + fixedW, y: 33, width: remW, height: 22, rx: 9, fill: PAL.tealSoft, stroke: PAL.tealBorder, 'stroke-width': 1.4 }));
      svg.append(svgEl('text', { x: 28 + fixedW + remW / 2, y: 48, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 11, class: 'ca-num-txt', opacity: p }, '□ × 5 = ' + remVal));
      svg.append(svgEl('text', { x: 160, y: 78, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, 'اطرح قيمة العشرات من 50 ثم اقسم الباقي على 5'));
      return;
    }

    // ratio_grow: labeled 3-row animated table progression (Row A, Row B, Sum)
    const a = Number(cfg.baseA || 1);
    const b = Number(cfg.baseB || 3);
    const lblA = cfg.labelA || 'الأول';
    const lblB = cfg.labelB || 'الثاني';
    const hideSum = Boolean(cfg.hideCol1Sum);
    const colXs = [212, 134, 56];

    svg.append(svgEl('text', { x: 308, y: 24, 'text-anchor': 'end', fill: PAL.blue, 'font-size': 10, class: 'ca-ar-txt' }, lblA));
    svg.append(svgEl('text', { x: 308, y: 46, 'text-anchor': 'end', fill: PAL.neg, 'font-size': 10, class: 'ca-ar-txt' }, lblB));
    svg.append(svgEl('text', { x: 308, y: 69, 'text-anchor': 'end', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt' }, 'المجموع'));

    colXs.forEach((cx, i) => {
      const show = Math.min(1, Math.max(0, (p - i * 0.18) / 0.52));
      const isLast = i === 2;
      svg.append(svgEl('rect', {
        x: cx - 30, y: 8, width: 60, height: 68, rx: 7,
        fill: isLast ? PAL.goldSoft : PAL.surface,
        stroke: isLast ? PAL.gold : PAL.tealBorder, 'stroke-width': 1.4,
        opacity: 0.25 + 0.75 * show
      }));
      svg.append(svgEl('text', {
        x: cx, y: 24, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 11, class: 'ca-num-txt', opacity: 0.25 + 0.75 * show
      }, isLast ? '؟' : String(a * (i + 1))));
      svg.append(svgEl('line', { x1: cx - 22, y1: 31, x2: cx + 22, y2: 31, stroke: PAL.grid }));
      svg.append(svgEl('text', {
        x: cx, y: 46, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 11, class: 'ca-num-txt', opacity: 0.25 + 0.75 * show
      }, isLast ? '؟' : String(b * (i + 1))));
      svg.append(svgEl('line', { x1: cx - 22, y1: 53, x2: cx + 22, y2: 53, stroke: PAL.grid }));
      const sumTxt = isLast || hideSum ? '؟' : String((a + b) * (i + 1));
      svg.append(svgEl('text', {
        x: cx, y: 69, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-num-txt', opacity: 0.25 + 0.75 * show
      }, sumTxt));
    });
    svg.append(svgEl('text', { x: 173, y: 46, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-num-txt', opacity: p }, '←'));
    svg.append(svgEl('text', { x: 95, y: 46, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-num-txt', opacity: p }, '←'));
    svg.append(svgEl('text', { x: 160, y: 91, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10, class: 'ca-ar-txt' }, hideSum ? 'نجمع العددين في العمود الواحد لإيجاد المجموع' : 'في كل عمود نضاعف النسبة ونجمع حتى نصل للهدف'));
  }

  /* ------------------------------------------------------------------
     Scene 6: Unit 2 Lesson 1 — Mental Multiplication (Doubling & Halving)
     ------------------------------------------------------------------ */
  function drawMentalMul(svg, cfg, p) {
    const mode = cfg.mode || 'dh_balance';

    if (mode === 'split_double' || mode === 'split_half') {
      const isHalf = mode === 'split_half';
      const num = Number(cfg.num || (isHalf ? 480 : 75));
      const parts = Array.isArray(cfg.parts) && cfg.parts.length >= 2
        ? cfg.parts
        : (isHalf ? [400, 80] : [70, 5]);
      const accent = isHalf ? PAL.blue : '#3b6b18';
      const accentSoft = isHalf ? PAL.blueSoft : '#eef6e6';
      const opText = isHalf ? '÷ 2' : '× 2';
      const results = parts.map(v => (isHalf ? v / 2 : v * 2));
      const total = results.reduce((s, v) => s + v, 0);

      // Top root pill
      svg.append(svgEl('rect', {
        x: 112, y: 6, width: 96, height: 22, rx: 7,
        fill: accentSoft, stroke: accent, 'stroke-width': 1.6
      }));
      svg.append(svgEl('text', {
        x: 160, y: 21, 'text-anchor': 'middle',
        fill: PAL.ink, 'font-size': 12.5, class: 'ca-num-txt'
      }, num + ' = ' + parts.join(' + ')));

      const p1 = Math.min(1, p / 0.55);
      const p2 = Math.min(1, Math.max(0, (p - 0.35) / 0.55));
      const xs = parts.length === 3 ? [58, 160, 262] : [94, 226];

      parts.forEach((partVal, i) => {
        const cx = xs[i];
        svg.append(svgEl('line', {
          x1: 160, y1: 28, x2: cx, y2: 40,
          stroke: accent, 'stroke-width': 1.4, opacity: 0.3 + 0.7 * p1
        }));
        svg.append(svgEl('rect', {
          x: cx - 36, y: 40, width: 72, height: 24, rx: 6,
          fill: PAL.white, stroke: accent, 'stroke-width': 1.3,
          opacity: 0.25 + 0.75 * p1
        }));
        svg.append(svgEl('text', {
          x: cx, y: 55, 'text-anchor': 'middle',
          fill: accent, 'font-size': 11, class: 'ca-num-txt',
          opacity: 0.25 + 0.75 * p1
        }, partVal + ' ' + opText + ' = ' + results[i]));
      });

      // Bottom sum pill
      svg.append(svgEl('rect', {
        x: 78, y: 70, width: 164, height: 22, rx: 7,
        fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.6,
        opacity: 0.2 + 0.8 * p2
      }));
      svg.append(svgEl('text', {
        x: 160, y: 85, 'text-anchor': 'middle',
        fill: PAL.goldInk, 'font-size': 12, class: 'ca-num-txt',
        opacity: 0.2 + 0.8 * p2
      }, results.join(' + ') + ' = ' + total));
      return;
    }

    // dh_balance: horizontal progression of equivalent products (÷2 / ×2)
    const steps = Array.isArray(cfg.steps) && cfg.steps.length
      ? cfg.steps
      : [['35', '16'], ['70', '8']];
    const count = Math.min(4, steps.length);
    const boxW = count >= 4 ? 64 : (count === 3 ? 82 : 112);
    const gap = count >= 4 ? 14 : (count === 3 ? 22 : 44);
    const totalW = count * boxW + (count - 1) * gap;
    const startX = Math.round((320 - totalW) / 2);

    svg.append(svgEl('text', {
      x: 160, y: 15, 'text-anchor': 'middle',
      fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl'
    }, 'ننصّف عددًا ونضاعف الآخر فيبقى الناتج متساويًا'));

    steps.slice(0, count).forEach((pair, idx) => {
      const localP = Math.min(1, Math.max(0, (p - idx * 0.16) / 0.55));
      const x = startX + idx * (boxW + gap);
      const isLast = idx === count - 1;
      svg.append(svgEl('rect', {
        x, y: 26, width: boxW, height: 42, rx: 8,
        fill: isLast ? '#eef6e6' : PAL.white,
        stroke: isLast ? '#3b6b18' : PAL.tealBorder,
        'stroke-width': isLast ? 2 : 1.4,
        opacity: 0.25 + 0.75 * localP
      }));
      svg.append(svgEl('text', {
        x: x + boxW / 2, y: 52, 'text-anchor': 'middle',
        fill: isLast ? '#25450d' : PAL.ink,
        'font-size': count >= 4 ? 11.5 : 13, class: 'ca-num-txt',
        opacity: 0.25 + 0.75 * localP
      }, pair[0] + ' × ' + pair[1]));

      if (idx < count - 1) {
        const ax = x + boxW + gap / 2;
        svg.append(svgEl('text', {
          x: ax, y: 51, 'text-anchor': 'middle',
          fill: PAL.goldInk, 'font-size': 13, class: 'ca-num-txt',
          opacity: localP
        }, '='));
      }
    });

    svg.append(svgEl('rect', {
      x: 62, y: 74, width: 92, height: 19, rx: 9.5,
      fill: PAL.blueSoft, stroke: PAL.blue, 'stroke-width': 1
    }));
    svg.append(svgEl('text', {
      x: 84, y: 86.5, 'text-anchor': 'middle',
      fill: PAL.blue, 'font-size': 10, class: 'ca-num-txt'
    }, '÷ 2'));
    svg.append(svgEl('text', {
      x: 126, y: 86.5, 'text-anchor': 'middle',
      fill: PAL.blue, 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl'
    }, 'تنصيف'));

    svg.append(svgEl('rect', {
      x: 166, y: 74, width: 92, height: 19, rx: 9.5,
      fill: '#eef6e6', stroke: '#3b6b18', 'stroke-width': 1
    }));
    svg.append(svgEl('text', {
      x: 188, y: 86.5, 'text-anchor': 'middle',
      fill: '#25450d', 'font-size': 10, class: 'ca-num-txt'
    }, '× 2'));
    svg.append(svgEl('text', {
      x: 230, y: 86.5, 'text-anchor': 'middle',
      fill: '#25450d', 'font-size': 10, class: 'ca-ar-txt', direction: 'rtl'
    }, 'مضاعفة'));
  }

  /* ------------------------------------------------------------------
     Public Mount API: BookConceptAnim.mount(cfg, container, opts)
     ------------------------------------------------------------------ */
  function renderFrame(svg, cfg, progress, negState) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const kind = cfg.kind || 'neg_context';
    if (kind === 'place_periods') drawPlacePeriods(svg, cfg, progress);
    else if (kind === 'compare_sweep') drawCompareSweep(svg, cfg, progress);
    else if (kind === 'carry_borrow') drawCarryBorrow(svg, cfg, progress);
    else if (kind === 'pattern_table') drawPatternTable(svg, cfg, progress);
    else if (kind === 'mental_mul') drawMentalMul(svg, cfg, progress);
    else drawNegContext(svg, cfg, progress, negState);
  }

  function makeNegState(cfg) {
    uidCounter += 1;
    const mode = cfg.mode || 'line_sym';
    const isLive = Boolean(cfg.live);
    let val = 0;
    let hop = Number(cfg.steps || 8);
    if (mode === 'sea') val = isLive ? -Math.abs(Number(cfg.mag || 15)) : -8;
    else if (mode === 'tower' || mode === 'elevator' || mode === 'lift') val = isLive ? -Math.abs(Number(cfg.mag || 3)) : -2;
    else if (mode === 'thermo' || mode === 'temp') val = isLive ? -Math.abs(Number(cfg.mag || 6)) : -4;
    else if (mode === 'bank') val = isLive ? -Math.abs(Number(cfg.mag || 25)) : -15;
    else if (mode === 'line_sym') val = 4;
    return { uid: 'ca4_' + uidCounter, val, hop, tweenFrom: undefined, dragging: false };
  }

  function getNegBounds(cfg) {
    const mode = cfg.mode || 'line_sym';
    const isLive = Boolean(cfg.live);
    if (mode === 'sea') return isLive ? { min: -50, max: -1, step: 1 } : { min: -20, max: 12, step: 2 };
    if (mode === 'tower' || mode === 'elevator' || mode === 'lift') return isLive ? { min: -50, max: -1, step: 1 } : { min: -3, max: 3, step: 1 };
    if (mode === 'thermo' || mode === 'temp') return isLive ? { min: -50, max: -1, step: 1 } : { min: -10, max: 10, step: 1 };
    if (mode === 'bank') return isLive ? { min: -50, max: -1, step: 1 } : { min: -30, max: 30, step: 5 };
    if (mode === 'line_sym') return { min: 0, max: 6, step: 1 };
    return { min: 0, max: Number(cfg.steps || 8), step: 1 };
  }

  function mount(cfg, container, opts) {
    if (!container || !cfg) return null;
    const options = opts || {};
    let currentCfg = Object.assign({}, cfg);
    let rafId = 0;
    const isNegInteractive = (currentCfg.kind || 'neg_context') === 'neg_context';
    let negState = isNegInteractive ? makeNegState(currentCfg) : null;

    const card = document.createElement('div');
    card.className = 'ca-card'
      + (options.compact ? ' ca-talk-stage' : '')
      + (isNegInteractive ? ' is-interactive' : '');
    card.setAttribute('aria-label', currentCfg.caption || 'توضيح متحرك للفكرة');

    const head = document.createElement('div');
    head.className = 'ca-head';
    const caption = document.createElement('div');
    caption.className = 'ca-caption';
    caption.innerHTML = formatCaptionHTML(currentCfg.caption || 'شاهد الحركة لفهم القاعدة');

    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'ca-replay-btn';
    replayBtn.setAttribute('aria-label', 'إعادة عرض الحركة التوضيحية');
    replayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg><span>إعادة</span>';

    head.append(caption, replayBtn);

    const stage = document.createElement('div');
    stage.className = 'ca-stage';
    const svg = svgEl('svg', {
      class: 'ca-svg',
      viewBox: isNegInteractive ? '0 0 320 124' : '0 0 320 96',
      direction: 'ltr',
      role: 'img',
      'aria-hidden': 'true'
    });
    stage.append(svg);

    let ctrlMount = null;
    if (isNegInteractive) {
      ctrlMount = document.createElement('div');
    }

    if (options.hideHeader) {
      card.append(stage);
      if (ctrlMount) card.append(ctrlMount);
    } else {
      card.append(head, stage);
      if (ctrlMount) card.append(ctrlMount);
    }

    container.append(card);

    const stopRaf = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const runAnim = (durMs) => {
      stopRaf();
      if (isCalmOrReduced()) {
        renderFrame(svg, currentCfg, 1, negState);
        if (negState) negState.tweenFrom = undefined;
        return;
      }
      const startTs = performance.now();
      const dur = durMs || 680;
      const tick = now => {
        const raw = (now - startTs) / dur;
        const t = easeOutCubic(raw);
        renderFrame(svg, currentCfg, t, negState);
        if (raw < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = 0;
          if (negState) negState.tweenFrom = undefined;
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const syncControls = () => {
      if (!isNegInteractive || !ctrlMount || !negState) return;
      ctrlMount.innerHTML = '';
      const mode = currentCfg.mode || 'line_sym';
      const isLive = Boolean(currentCfg.live);
      const bounds = getNegBounds(currentCfg);

      if (options.hideHeader && isLive) {
        const hint = document.createElement('div');
        hint.className = 'ca-drag-hint';
        hint.textContent = (mode === 'sea' || mode === 'tower' || mode === 'lift' || mode === 'elevator')
          ? 'اسحب أو اضغط داخل المشهد عموديًا لتغيير المقدار مباشرة'
          : 'اسحب أو اضغط داخل المشهد أفقيًا لتغيير المقدار مباشرة';
        ctrlMount.append(hint);
        return;
      }

      const bar = document.createElement('div');
      bar.className = 'ca-ctrl-bar';

      if (mode === 'shift') {
        const total = Math.max(1, Number(currentCfg.steps || 8));
        const hopBtn = document.createElement('button');
        hopBtn.type = 'button';
        hopBtn.className = 'ca-ctrl-btn is-neg';
        hopBtn.innerHTML = '<span>قفزة</span><bdi dir="ltr">−1</bdi>';
        hopBtn.addEventListener('click', () => {
          const prev = negState.hop;
          const next = prev >= total ? 1 : prev + 1;
          negState.tweenFrom = prev >= total ? 0 : prev;
          negState.hop = next;
          runAnim(320);
          syncControls();
        });

        const readout = document.createElement('div');
        const start = Number(currentCfg.start !== undefined ? currentCfg.start : 3);
        const crossed = (start - negState.hop) < 0;
        readout.className = 'ca-ctrl-readout ' + (crossed ? 'is-neg' : (negState.hop === 0 ? 'is-pos' : 'is-zero'));
        readout.setAttribute('aria-live', 'polite');
        readout.innerHTML = '<span>الخطوات:</span><bdi dir="ltr">' + negState.hop + ' / ' + total + '</bdi>';

        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'ca-ctrl-btn is-primary';
        allBtn.textContent = negState.hop >= total ? 'من البداية' : 'شغّل الكل';
        allBtn.addEventListener('click', () => {
          if (negState.hop >= total) {
            negState.tweenFrom = total;
            negState.hop = 0;
            runAnim(280);
          } else {
            negState.tweenFrom = negState.hop;
            negState.hop = total;
            runAnim(680);
          }
          syncControls();
        });

        bar.append(hopBtn, readout, allBtn);
        ctrlMount.append(bar);
        return;
      }

      if (mode === 'line_sym') {
        const decBtn = document.createElement('button');
        decBtn.type = 'button';
        decBtn.className = 'ca-ctrl-btn is-neg';
        decBtn.textContent = 'أقرب للصفر';
        decBtn.disabled = negState.val <= 0;
        decBtn.addEventListener('click', () => setValSmooth(negState.val - 1));

        const readout = document.createElement('div');
        readout.className = 'ca-ctrl-readout ' + (negState.val === 0 ? 'is-zero' : 'is-pos');
        readout.setAttribute('aria-live', 'polite');
        readout.innerHTML = negState.val === 0
          ? '<span>الصفر محايد:</span><bdi dir="ltr">0</bdi>'
          : '<span>التناظر:</span><bdi dir="ltr">−' + negState.val + ' ↔ +' + negState.val + '</bdi>';

        const incBtn = document.createElement('button');
        incBtn.type = 'button';
        incBtn.className = 'ca-ctrl-btn is-pos';
        incBtn.textContent = 'أبعد عن 0';
        incBtn.disabled = negState.val >= 6;
        incBtn.addEventListener('click', () => setValSmooth(negState.val + 1));

        bar.append(incBtn, readout, decBtn);
        ctrlMount.append(bar);
        return;
      }

      // Vertical or Horizontal Explorer: sea | tower | thermo | bank
      const labels = mode === 'sea'
        ? { up: 'صعود ↑', down: 'غوص ↓', unit: ' m' }
        : ((mode === 'tower' || mode === 'elevator' || mode === 'lift')
          ? { up: 'أعلى ↑', down: 'أسفل ↓', unit: '' }
          : (mode === 'bank'
            ? { up: 'إيداع +', down: 'سحب −', unit: ' JD' }
            : { up: 'أدفأ +', down: 'أبرد −', unit: '°C' }));

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'ca-ctrl-btn is-pos';
      upBtn.textContent = labels.up;
      upBtn.disabled = negState.val >= bounds.max;
      upBtn.addEventListener('click', () => setValSmooth(negState.val + bounds.step));

      const readout = document.createElement('div');
      const pol = negState.val < 0 ? 'is-neg' : (negState.val > 0 ? 'is-pos' : 'is-zero');
      readout.className = 'ca-ctrl-readout ' + pol;
      readout.setAttribute('aria-live', 'polite');
      const polWord = mode === 'sea'
        ? (negState.val < 0 ? 'تحت البحر' : (negState.val > 0 ? 'فوق البحر' : 'سطح البحر'))
        : ((mode === 'tower' || mode === 'elevator' || mode === 'lift')
          ? (negState.val < 0 ? 'تحت الأرض' : (negState.val > 0 ? 'فوق الأرض' : 'الأرضي'))
          : (mode === 'bank'
            ? (negState.val < 0 ? 'سحب' : (negState.val > 0 ? 'إيداع' : 'متوازن'))
            : (negState.val < 0 ? 'تحت الصفر' : (negState.val > 0 ? 'فوق الصفر' : 'تجمّد'))));
      readout.innerHTML = '<span>' + polWord + ':</span><bdi dir="ltr">' + formatSignedBadge(negState.val, labels.unit) + '</bdi>';

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'ca-ctrl-btn is-neg';
      downBtn.textContent = labels.down;
      downBtn.disabled = negState.val <= bounds.min;
      downBtn.addEventListener('click', () => setValSmooth(negState.val - bounds.step));

      bar.append(upBtn, readout, downBtn);
      ctrlMount.append(bar);
    };

    const setValSmooth = (nextRaw) => {
      if (!negState) return;
      const bounds = getNegBounds(currentCfg);
      const clamped = Math.max(bounds.min, Math.min(bounds.max, Math.round(nextRaw)));
      if (clamped === negState.val) return;
      negState.tweenFrom = negState.val;
      negState.val = clamped;
      runAnim(320);
      syncControls();
      if (typeof options.onValueChange === 'function') {
        options.onValueChange(Math.abs(clamped), clamped);
      }
    };

    const applyPointerToNeg = (clientX, clientY, immediate) => {
      if (!negState) return;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const svgX = ((clientX - rect.left) / rect.width) * 320;
      const svgY = ((clientY - rect.top) / rect.height) * 124;
      const mode = currentCfg.mode || 'line_sym';
      const isLive = Boolean(currentCfg.live);
      const bounds = getNegBounds(currentCfg);

      if (mode === 'shift') {
        const start = Number(currentCfg.start !== undefined ? currentCfg.start : 3);
        const total = Math.max(1, Number(currentCfg.steps || 8));
        const minN = Math.min(-8, start - total - 1);
        const maxN = Math.max(6, start + 1);
        const numAtX = minN + ((svgX - 24) / (296 - 24)) * (maxN - minN);
        const nextHop = Math.max(0, Math.min(total, Math.round(start - numAtX)));
        if (nextHop !== negState.hop) {
          negState.tweenFrom = immediate ? undefined : negState.hop;
          negState.hop = nextHop;
          if (immediate) renderFrame(svg, currentCfg, 1, negState);
          else runAnim(260);
          syncControls();
        }
        return;
      }

      let nextVal = negState.val;
      if (mode === 'sea') {
        const yZero = 44;
        if (svgY <= yZero) {
          nextVal = Math.round(((yZero - svgY) / 28) * (isLive ? 10 : 12));
        } else {
          nextVal = -Math.round(((svgY - yZero) / 64) * (isLive ? 50 : 20));
        }
      } else if (mode === 'tower' || mode === 'elevator' || mode === 'lift') {
        const yGround = 62;
        if (svgY <= yGround) {
          nextVal = Math.round(((yGround - svgY) / 44) * (isLive ? 10 : 3));
        } else {
          nextVal = -Math.round(((svgY - yGround) / 46) * (isLive ? 50 : 3));
        }
      } else if (mode === 'thermo' || mode === 'temp') {
        const minT = isLive ? -50 : -10;
        const maxT = isLive ? 10 : 10;
        nextVal = Math.round(minT + ((svgX - 48) / 240) * (maxT - minT));
      } else if (mode === 'bank') {
        const minB = isLive ? -50 : -30;
        const maxB = isLive ? 10 : 30;
        nextVal = Math.round(minB + ((svgX - 28) / 264) * (maxB - minB));
      } else {
        // line_sym
        const n = Math.round((svgX - 160) / 21);
        nextVal = Math.max(0, Math.min(6, Math.abs(n)));
      }

      const clamped = Math.max(bounds.min, Math.min(bounds.max, nextVal));
      if (clamped !== negState.val) {
        if (immediate) {
          stopRaf();
          negState.tweenFrom = undefined;
          negState.val = clamped;
          renderFrame(svg, currentCfg, 1, negState);
        } else {
          negState.tweenFrom = negState.val;
          negState.val = clamped;
          runAnim(260);
        }
        syncControls();
        if (typeof options.onValueChange === 'function') {
          options.onValueChange(Math.abs(clamped), clamped);
        }
      }
    };

    if (isNegInteractive) {
      stage.addEventListener('pointerdown', e => {
        if (e.button && e.button !== 0) return;
        negState.dragging = true;
        stage.classList.add('is-dragging');
        if (typeof stage.setPointerCapture === 'function') {
          try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        }
        applyPointerToNeg(e.clientX, e.clientY, false);
      });
      stage.addEventListener('pointermove', e => {
        if (!negState.dragging) return;
        applyPointerToNeg(e.clientX, e.clientY, true);
      });
      const endDrag = () => {
        if (!negState.dragging) return;
        negState.dragging = false;
        stage.classList.remove('is-dragging');
      };
      stage.addEventListener('pointerup', endDrag);
      stage.addEventListener('pointercancel', endDrag);
    }

    const play = () => {
      if (isNegInteractive && negState) {
        if ((currentCfg.mode || 'line_sym') === 'shift') {
          negState.tweenFrom = 0;
          negState.hop = Number(currentCfg.steps || 8);
        } else {
          negState.tweenFrom = 0;
        }
      }
      runAnim(720);
      syncControls();
    };

    replayBtn.addEventListener('click', play);
    play();

    return {
      replay: play,
      update: nextCfg => {
        const prevMode = currentCfg.mode;
        currentCfg = Object.assign({}, nextCfg);
        caption.innerHTML = formatCaptionHTML(currentCfg.caption || '');
        if (isNegInteractive && negState) {
          if (currentCfg.mode !== prevMode) {
            negState = makeNegState(currentCfg);
            play();
          } else if (currentCfg.live && currentCfg.mag !== undefined) {
            const nextV = -Math.abs(Number(currentCfg.mag) || 1);
            if (nextV !== negState.val) {
              negState.tweenFrom = negState.val;
              negState.val = nextV;
              runAnim(280);
              syncControls();
            }
          } else {
            play();
          }
        } else {
          play();
        }
      },
      destroy: () => {
        stopRaf();
        card.remove();
      }
    };
  }

  window.BookConceptAnim = { mount };
})();
