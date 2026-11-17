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
     Scene 4: Lesson 4 — Tower, Sea, Thermo, Line Symmetry, Shift, Live Talk
     ------------------------------------------------------------------ */
  function drawNegContext(svg, cfg, p) {
    const mode = cfg.mode || 'tower';

    if (mode === 'tower' || mode === 'elevator' || mode === 'lift') {
      const mag = Number(cfg.mag || 3);
      const isLive = Boolean(cfg.live);
      svg.append(svgEl('rect', { x: 0, y: 0, width: 320, height: 50, fill: PAL.sky }));
      svg.append(svgEl('rect', { x: 0, y: 50, width: 320, height: 46, fill: PAL.negSoft }));
      svg.append(svgEl('line', { x1: 0, y1: 50, x2: 320, y2: 50, stroke: PAL.gold, 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }));
      svg.append(svgEl('rect', { x: 32, y: 8, width: 72, height: 80, rx: 6, fill: PAL.white, stroke: PAL.tealBorder, 'stroke-width': 1.5 }));
      [22, 36, 64, 78].forEach(y => {
        svg.append(svgEl('line', { x1: 36, y1: y, x2: 100, y2: y, stroke: PAL.grid, 'stroke-width': 1 }));
      });
      const cabY = isLive ? (52 + Math.min(20, Math.round(mag * 1.1)) * p) : (18 + Math.sin(p * Math.PI) * 46);
      svg.append(svgEl('rect', { x: 58, y: cabY, width: 20, height: 14, rx: 3, fill: isLive ? PAL.neg : PAL.gold }));
      svg.append(svgEl('text', { x: 210, y: 26, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, 'فوق الأرض (+)'));
      svg.append(svgEl('rect', { x: 150, y: 41, width: 120, height: 18, rx: 6, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1 }));
      svg.append(svgEl('text', { x: 210, y: 54, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-ar-txt', direction: 'rtl' }, 'سطح الأرض = 0'));
      svg.append(svgEl('text', { x: 210, y: 78, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, isLive ? ('طابق تحت الأرض (-' + mag + ')') : 'مواقف سفلية (-)'));
      return;
    }

    if (mode === 'sea') {
      const mag = Number(cfg.mag || 10);
      const isLive = Boolean(cfg.live);
      svg.append(svgEl('rect', { x: 0, y: 0, width: 320, height: 34, fill: PAL.sky }));
      svg.append(svgEl('rect', { x: 0, y: 34, width: 320, height: 62, fill: PAL.sea }));
      svg.append(svgEl('path', { d: 'M0 34 Q 40 29 80 34 T 160 34 T 240 34 T 320 34', fill: 'none', stroke: PAL.blue, 'stroke-width': 2 }));
      svg.append(svgEl('text', { x: 225, y: 23, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-ar-txt', direction: 'rtl' }, 'سطح البحر = 0 م'));
      const subY = 38 + Math.min(34, (isLive ? mag * 1.3 : 24) * p);
      svg.append(svgEl('circle', { cx: 92, cy: subY + 8, r: 9, fill: PAL.neg, stroke: PAL.white, 'stroke-width': 1.5 }));
      svg.append(svgEl('line', { x1: 92, y1: 34, x2: 92, y2: subY, stroke: PAL.neg, 'stroke-width': 1.8, 'stroke-dasharray': '3 3' }));
      svg.append(svgEl('text', {
        x: 206, y: subY + 12, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 11.5, class: 'ca-ar-txt', direction: 'rtl'
      }, isLive ? ('العمق: -' + mag + ' م') : 'تحت سطح البحر (-)'));
      return;
    }

    if (mode === 'thermo' || mode === 'temp') {
      const isLive = Boolean(cfg.live);
      const val = Number(cfg.mag || 5);
      svg.append(svgEl('rect', { x: 36, y: 36, width: 248, height: 18, rx: 9, fill: PAL.white, stroke: PAL.grid, 'stroke-width': 1.5 }));
      svg.append(svgEl('line', { x1: 160, y1: 20, x2: 160, y2: 72, stroke: PAL.gold, 'stroke-width': 2.5 }));
      svg.append(svgEl('text', { x: 160, y: 15, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-num-txt', direction: 'ltr' }, '0°C'));
      const fillW = isLive ? Math.min(114, Math.max(18, val * 4 * p)) : 70 * p;
      svg.append(svgEl('rect', { x: 160 - fillW, y: 40, width: fillW, height: 10, rx: 4, fill: PAL.neg }));
      const negTxt = svgEl('text', { x: 96, y: 84, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' });
      if (isLive) {
        negTxt.append(svgEl('tspan', {}, 'تحت الصفر: '));
        negTxt.append(svgEl('tspan', { direction: 'ltr', 'unicode-bidi': 'isolate' }, '-' + val + '°C'));
      } else {
        negTxt.textContent = 'تحت الصفر (-)';
      }
      svg.append(negTxt);
      svg.append(svgEl('text', { x: 224, y: 84, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 10.5, class: 'ca-ar-txt', direction: 'rtl' }, 'فوق الصفر (+)'));
      return;
    }

    if (mode === 'shift') {
      const start = Number(cfg.start || 3);
      const steps = Number(cfg.steps || 8);
      svg.append(svgEl('line', { x1: 24, y1: 58, x2: 296, y2: 58, stroke: PAL.muted, 'stroke-width': 2 }));
      const ticks = [-8, -6, -4, -2, 0, 2, 4];
      ticks.forEach(t => {
        const tx = 160 + t * 14;
        svg.append(svgEl('line', { x1: tx, y1: 52, x2: tx, y2: 64, stroke: t === 0 ? PAL.gold : PAL.muted, 'stroke-width': t === 0 ? 2.5 : 1.5 }));
        svg.append(svgEl('text', { x: tx, y: 79, 'text-anchor': 'middle', fill: t < 0 ? PAL.neg : (t === 0 ? PAL.goldInk : PAL.blue), 'font-size': 10, class: 'ca-num-txt', direction: 'ltr' }, (t > 0 ? '+' : '') + t));
      });
      const sx = 160 + start * 14;
      const ex = 160 - (steps - start) * 14;
      svg.append(svgEl('circle', { cx: sx, cy: 58, r: 5, fill: PAL.blue }));
      svg.append(svgEl('path', {
        d: 'M ' + sx + ' 47 Q ' + ((sx + ex) / 2) + ' 8 ' + ex + ' 45',
        fill: 'none', stroke: PAL.neg, 'stroke-width': 2.2,
        'stroke-dasharray': '190', 'stroke-dashoffset': String(Math.round(190 * (1 - p)))
      }));
      svg.append(svgEl('circle', { cx: ex, cy: 58, r: 9, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.8, opacity: p }));
      svg.append(svgEl('text', { x: ex, y: 62, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 11, class: 'ca-ar-txt', opacity: p }, '؟'));
      svg.append(svgEl('text', { x: 160, y: 15, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, 'الانخفاض يعني التحرك يسارًا عبر الصفر'));
      return;
    }

    if (mode === 'bank') {
      const mag = Number(cfg.mag || 5);
      svg.append(svgEl('rect', { x: 28, y: 36, width: 264, height: 18, rx: 9, fill: PAL.white, stroke: PAL.grid, 'stroke-width': 1.5 }));
      svg.append(svgEl('line', { x1: 160, y1: 20, x2: 160, y2: 70, stroke: PAL.gold, 'stroke-width': 2.5 }));
      svg.append(svgEl('text', { x: 160, y: 15, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-ar-txt' }, 'الرصيد = 0'));
      const barW = Math.min(115, Math.max(20, mag * 3.5 * p));
      svg.append(svgEl('rect', { x: 160 - barW, y: 40, width: barW, height: 10, rx: 4, fill: PAL.neg }));
      svg.append(svgEl('text', { x: 102, y: 84, 'text-anchor': 'middle', fill: PAL.neg, 'font-size': 11, class: 'ca-ar-txt' }, 'سحب -' + mag + ' دنانير'));
      return;
    }

    // Default: symmetric number line around 0
    svg.append(svgEl('line', { x1: 22, y1: 58, x2: 298, y2: 58, stroke: PAL.muted, 'stroke-width': 2 }));
    [-6, -4, -2, 0, 2, 4, 6].forEach(n => {
      const x = 160 + n * 18;
      svg.append(svgEl('line', { x1: x, y1: 52, x2: x, y2: 64, stroke: n === 0 ? PAL.gold : PAL.muted, 'stroke-width': n === 0 ? 2.5 : 1.4 }));
      svg.append(svgEl('text', {
        x, y: 80, 'text-anchor': 'middle',
        fill: n < 0 ? PAL.neg : (n === 0 ? PAL.goldInk : PAL.blue), 'font-size': 10.5, class: 'ca-num-txt', direction: 'ltr'
      }, n > 0 ? ('+' + n) : String(n)));
    });
    const span = 72 * p;
    svg.append(svgEl('path', {
      d: 'M 160 50 Q ' + (160 - span / 2) + ' 14 ' + (160 - span) + ' 50',
      fill: 'none', stroke: PAL.neg, 'stroke-width': 2
    }));
    svg.append(svgEl('path', {
      d: 'M 160 50 Q ' + (160 + span / 2) + ' 14 ' + (160 + span) + ' 50',
      fill: 'none', stroke: PAL.blue, 'stroke-width': 2
    }));
    svg.append(svgEl('text', { x: 160, y: 15, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, 'مسافتان متساويتان في اتجاهين متعاكسين حول 0'));
  }

  /* ------------------------------------------------------------------
     Scene 5: Lesson 5 — Pattern Table, Grid Pairs, Coin Balance, Rope Pairs
     ------------------------------------------------------------------ */
  function drawPatternTable(svg, cfg, p) {
    const mode = cfg.mode || 'ratio_grow';
    if (mode === 'grid_pairs') {
      const leftN = Math.min(4, Number(cfg.rows || 3));
      const rightN = Math.min(5, Number(cfg.cols || 4));
      for (let i = 0; i < leftN; i++) {
        const y = 20 + i * 24;
        svg.append(svgEl('circle', { cx: 256, cy: y, r: 8, fill: PAL.goldSoft, stroke: PAL.gold, 'stroke-width': 1.5 }));
        svg.append(svgEl('text', { x: 256, y: y + 4, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-num-txt' }, String(i + 1)));
      }
      for (let j = 0; j < rightN; j++) {
        const y = 13 + j * 18;
        svg.append(svgEl('circle', { cx: 74, cy: y, r: 6.5, fill: PAL.blueSoft, stroke: PAL.blue, 'stroke-width': 1.4 }));
      }
      const maxLinks = Math.ceil(p * leftN);
      for (let i = 0; i < maxLinks; i++) {
        const sy = 20 + i * 24;
        for (let j = 0; j < rightN; j++) {
          const ey = 13 + j * 18;
          svg.append(svgEl('line', {
            x1: 246, y1: sy, x2: 83, y2: ey,
            stroke: i === 0 ? PAL.teal : PAL.tealBorder,
            'stroke-width': i === 0 ? 1.4 : 0.9,
            opacity: i === 0 ? 0.9 : 0.45
          }));
        }
      }
      svg.append(svgEl('text', { x: 165, y: 90, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10.5, class: 'ca-ar-txt' }, 'كل خيار من اليمين يرتبط بجميع خيارات اليسار'));
      return;
    }

    if (mode === 'rope_pairs') {
      const names = ['ريما', 'لانا', 'سحر', 'ديمة'];
      const xs = [262, 194, 126, 58];
      names.forEach((nm, i) => {
        const hold = i < 2;
        svg.append(svgEl('circle', {
          cx: xs[i], cy: 52, r: 16,
          fill: hold ? PAL.goldSoft : PAL.tealSoft,
          stroke: hold ? PAL.gold : PAL.tealBorder, 'stroke-width': 1.8
        }));
        svg.append(svgEl('text', { x: xs[i], y: 56, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, nm));
      });
      svg.append(svgEl('path', {
        d: 'M 262 32 Q 228 12 194 32', fill: 'none', stroke: PAL.gold,
        'stroke-width': 2.2, 'stroke-dasharray': '90', 'stroke-dashoffset': String(Math.round(90 * (1 - p)))
      }));
      svg.append(svgEl('path', {
        d: 'M 126 32 Q 92 12 58 32', fill: 'none', stroke: PAL.teal,
        'stroke-width': 2.2, 'stroke-dasharray': '90', 'stroke-dashoffset': String(Math.round(90 * (1 - p)))
      }));
      svg.append(svgEl('text', { x: 228, y: 14, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10, class: 'ca-ar-txt' }, 'تمسكان الحبل'));
      svg.append(svgEl('text', { x: 92, y: 14, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10, class: 'ca-ar-txt' }, 'تقفزان'));
      svg.append(svgEl('text', { x: 160, y: 87, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, '(أ، ب) = (ب، أ) بدون تكرار'));
      return;
    }

    if (mode === 'coin_balance') {
      const target = 50;
      svg.append(svgEl('rect', { x: 30, y: 36, width: 260, height: 22, rx: 11, fill: PAL.white, stroke: PAL.grid, 'stroke-width': 1.5 }));
      const fixedW = Math.round((30 / target) * 260);
      const remW = Math.round((20 / target) * 260 * p);
      svg.append(svgEl('rect', { x: 30, y: 38, width: fixedW, height: 18, rx: 8, fill: PAL.goldSoft, stroke: PAL.gold }));
      svg.append(svgEl('text', { x: 30 + fixedW / 2, y: 51, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 10.5, class: 'ca-ar-txt' }, '3 × 10 قروش = 30'));
      svg.append(svgEl('rect', { x: 32 + fixedW, y: 38, width: remW, height: 18, rx: 8, fill: PAL.tealSoft, stroke: PAL.tealBorder }));
      svg.append(svgEl('text', { x: 32 + fixedW + remW / 2, y: 51, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 10.5, class: 'ca-ar-txt', opacity: p }, '؟ × 5'));
      svg.append(svgEl('text', { x: 160, y: 18, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 11, class: 'ca-ar-txt' }, 'الهدف الكلي = 50 قرشًا'));
      svg.append(svgEl('text', { x: 160, y: 80, 'text-anchor': 'middle', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, 'اطرح المبلغ المستعمل ثم قسّم على فئة 5'));
      return;
    }

    // ratio_grow: animated table progression columns (right to left)
    const a = Number(cfg.baseA || 1);
    const b = Number(cfg.baseB || 3);
    const colXs = [234, 152, 70];
    colXs.forEach((cx, i) => {
      const show = Math.min(1, Math.max(0, (p - i * 0.2) / 0.5));
      const isLast = i === 2;
      svg.append(svgEl('rect', {
        x: cx - 32, y: 18, width: 64, height: 58, rx: 7,
        fill: isLast ? PAL.goldSoft : PAL.surface,
        stroke: isLast ? PAL.gold : PAL.tealBorder, 'stroke-width': 1.5,
        opacity: 0.25 + 0.75 * show
      }));
      svg.append(svgEl('text', {
        x: cx, y: 36, 'text-anchor': 'middle', fill: PAL.blue, 'font-size': 11, class: 'ca-num-txt', opacity: 0.25 + 0.75 * show
      }, isLast ? '؟' : String(a * (i + 1))));
      svg.append(svgEl('line', { x1: cx - 24, y1: 44, x2: cx + 24, y2: 44, stroke: PAL.grid }));
      svg.append(svgEl('text', {
        x: cx, y: 63, 'text-anchor': 'middle', fill: PAL.teal, 'font-size': 11.5, class: 'ca-num-txt', opacity: 0.25 + 0.75 * show
      }, isLast ? '؟' : String(b * (i + 1))));
    });
    svg.append(svgEl('text', { x: 294, y: 36, 'text-anchor': 'end', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, '١'));
    svg.append(svgEl('text', { x: 294, y: 63, 'text-anchor': 'end', fill: PAL.muted, 'font-size': 10, class: 'ca-ar-txt' }, '٢'));
    svg.append(svgEl('text', { x: 193, y: 50, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 12, class: 'ca-num-txt', opacity: p }, '←'));
    svg.append(svgEl('text', { x: 111, y: 50, 'text-anchor': 'middle', fill: PAL.goldInk, 'font-size': 12, class: 'ca-num-txt', opacity: p }, '←'));
    svg.append(svgEl('text', { x: 160, y: 90, 'text-anchor': 'middle', fill: PAL.ink, 'font-size': 10.5, class: 'ca-ar-txt' }, 'القاعدة تتكرر بثبات في كل عمود ← المجموع'));
  }

  /* ------------------------------------------------------------------
     Public Mount API: BookConceptAnim.mount(cfg, container, opts)
     ------------------------------------------------------------------ */
  function renderFrame(svg, cfg, progress) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const kind = cfg.kind || 'neg_context';
    if (kind === 'place_periods') drawPlacePeriods(svg, cfg, progress);
    else if (kind === 'compare_sweep') drawCompareSweep(svg, cfg, progress);
    else if (kind === 'carry_borrow') drawCarryBorrow(svg, cfg, progress);
    else if (kind === 'pattern_table') drawPatternTable(svg, cfg, progress);
    else drawNegContext(svg, cfg, progress);
  }

  function mount(cfg, container, opts) {
    if (!container || !cfg) return null;
    const options = opts || {};
    let currentCfg = Object.assign({}, cfg);
    let rafId = 0;

    const card = document.createElement('div');
    card.className = 'ca-card' + (options.compact ? ' ca-talk-stage' : '');
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
      viewBox: '0 0 320 96',
      direction: 'ltr',
      role: 'img',
      'aria-hidden': 'true'
    });
    stage.append(svg);

    if (options.hideHeader) {
      card.append(stage);
    } else {
      card.append(head, stage);
    }

    container.append(card);

    const stopRaf = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const play = () => {
      stopRaf();
      if (isCalmOrReduced()) {
        renderFrame(svg, currentCfg, 1);
        return;
      }
      const startTs = performance.now();
      const dur = 680;
      const tick = now => {
        const raw = (now - startTs) / dur;
        const t = easeOutCubic(raw);
        renderFrame(svg, currentCfg, t);
        if (raw < 1) rafId = requestAnimationFrame(tick);
        else rafId = 0;
      };
      rafId = requestAnimationFrame(tick);
    };

    replayBtn.addEventListener('click', play);
    play();

    return {
      replay: play,
      update: nextCfg => {
        currentCfg = Object.assign({}, nextCfg);
        caption.innerHTML = formatCaptionHTML(currentCfg.caption || '');
        play();
      },
      destroy: () => {
        stopRaf();
        card.remove();
      }
    };
  }

  window.BookConceptAnim = { mount };
})();
