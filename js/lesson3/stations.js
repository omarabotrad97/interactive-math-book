/* ==========================================================================
   LESSON 3: جمع الأعداد الكلية وطرحها - STATIONS, VERTICAL ENGINE & EXIT TICKET
   Covers Textbook pp. 16-19 across 16 stations + 8-skill Exit Ticket + Remedial
   Zero emoji enforced. Uses pure math helpers shared with #ops-lab-dialog.
   ========================================================================== */

(function (global) {
  'use strict';

  const L3_PLACE_NAMES = [
    'آحاد',
    'عشرات',
    'مئات',
    'آحاد الألوف',
    'عشرات الألوف',
    'مئات الألوف',
    'آحاد الملايين',
    'عشرات الملايين',
    'مئات الملايين'
  ];

  function roundToHighestPlace(n) {
    const val = Math.round(Math.abs(Number(n) || 0));
    if (val < 10) return val;
    const s = String(val);
    const pow = Math.pow(10, s.length - 1);
    const first = Number(s[0]);
    const second = Number(s[1] || 0);
    return (second >= 5 ? first + 1 : first) * pow;
  }

  function formatCleanNumber(n) {
    return typeof fmt === 'function' ? fmt(n) : Number(n).toLocaleString('en-US');
  }

  function arNum(n) {
    return typeof ar === 'function' ? ar(n) : String(n);
  }

  function speakOperationText(text) {
    if (!text) return;
    if (typeof speakText === 'function') {
      speakText(text);
    } else if (typeof speechSynthesis !== 'undefined') {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        speechSynthesis.speak(u);
      } catch (_e) { /* ignore speech errors */ }
    }
  }

  /* Compute full column-by-column addition trace from right (pos=0) to left */
  function computeVerticalAdditionMeta(rawOperands) {
    const operands = (Array.isArray(rawOperands) ? rawOperands : [0, 0]).map(v => Math.max(0, Math.floor(Number(v) || 0)));
    const exact = operands.reduce((acc, v) => acc + v, 0);
    const exactStr = String(exact);
    const numCols = Math.max(
      exactStr.length,
      ...operands.map(n => String(n).length)
    );

    const rowsDigits = operands.map(n => {
      const s = String(n).padStart(numCols, ' ');
      // Return array indexed by pos (0 = ones, numCols - 1 = highest)
      const arr = [];
      for (let pos = 0; pos < numCols; pos++) {
        const ch = s[numCols - 1 - pos];
        arr.push(ch === ' ' ? null : Number(ch));
      }
      return arr;
    });

    const columns = [];
    let carryIn = 0;
    for (let pos = 0; pos < numCols; pos++) {
      const colDigits = rowsDigits.map(r => (r[pos] === null ? 0 : r[pos]));
      const colSum = carryIn + colDigits.reduce((a, b) => a + b, 0);
      const resultDigit = colSum % 10;
      const carryOut = Math.floor(colSum / 10);
      columns.push({
        pos,
        placeName: L3_PLACE_NAMES[pos] || ('منزلة ' + arNum(pos + 1)),
        carryIn,
        operandDigits: rowsDigits.map(r => r[pos]),
        colSum,
        resultDigit,
        carryOut
      });
      carryIn = carryOut;
    }

    const roundedOperands = operands.map(roundToHighestPlace);
    const estimate = roundedOperands.reduce((a, b) => a + b, 0);

    return {
      op: 'add',
      operands,
      exact,
      numCols,
      columns,
      roundedOperands,
      estimate
    };
  }

  /* Compute full column-by-column subtraction trace with cascading borrows across zeros */
  function computeVerticalSubtractionMeta(rawTop, rawBottom) {
    let topNum = Math.max(0, Math.floor(Number(rawTop) || 0));
    let bottomNum = Math.max(0, Math.floor(Number(rawBottom) || 0));
    let swapped = false;
    if (bottomNum > topNum) {
      const tmp = topNum;
      topNum = bottomNum;
      bottomNum = tmp;
      swapped = true;
    }
    const exact = topNum - bottomNum;
    const numCols = Math.max(String(topNum).length, String(bottomNum).length);

    const origTop = [];
    const botArr = [];
    const sTop = String(topNum).padStart(numCols, '0');
    const sBot = String(bottomNum).padStart(numCols, ' ');
    for (let pos = 0; pos < numCols; pos++) {
      origTop.push(Number(sTop[numCols - 1 - pos]));
      const bc = sBot[numCols - 1 - pos];
      botArr.push(bc === ' ' ? null : Number(bc));
    }

    // Track working top digits after each column's borrow step
    const work = origTop.slice();
    const columns = [];

    for (let pos = 0; pos < numCols; pos++) {
      const preTop = work[pos];
      const botVal = botArr[pos] === null ? 0 : botArr[pos];
      let neededBorrow = false;
      const borrowEffects = []; // positions whose top digit gets updated when borrowing at this column

      if (work[pos] < botVal) {
        neededBorrow = true;
        let donor = pos + 1;
        while (donor < numCols && work[donor] === 0) {
          donor++;
        }
        if (donor < numCols) {
          work[donor] -= 1;
          borrowEffects.push({
            pos: donor,
            oldVal: work[donor] + 1,
            newVal: work[donor],
            isIntermediateZero: false
          });
          for (let mid = donor - 1; mid > pos; mid--) {
            // work[mid] was 0 -> becomes 10 -> borrows 1 down to become 9
            work[mid] = 9;
            borrowEffects.push({
              pos: mid,
              oldVal: 0,
              newVal: 9,
              isIntermediateZero: true
            });
          }
          work[pos] += 10;
          borrowEffects.push({
            pos,
            oldVal: preTop,
            newVal: work[pos],
            isReceiver: true
          });
        }
      }

      const postTop = work[pos];
      const resultDigit = postTop - botVal;
      columns.push({
        pos,
        placeName: L3_PLACE_NAMES[pos] || ('منزلة ' + arNum(pos + 1)),
        origTopDigit: origTop[pos],
        preBorrowTopDigit: preTop,
        postBorrowTopDigit: postTop,
        bottomDigit: botArr[pos],
        neededBorrow,
        borrowEffects,
        resultDigit
      });
    }

    const rTop = roundToHighestPlace(topNum);
    const rBot = roundToHighestPlace(bottomNum);
    const estimate = rTop - rBot;

    return {
      op: 'sub',
      operands: [topNum, bottomNum],
      swapped,
      exact,
      numCols,
      columns,
      roundedOperands: [rTop, rBot],
      estimate
    };
  }

  /* ------------------------------------------------------------------------
     Textbook Stations Builder (Stations 0..15)
     ------------------------------------------------------------------------ */
  function buildStationSteps(nodeId) {
    switch (nodeId) {
      /* Station 1 (node 0): أستكشف - أرباح الشركة + الأعداد الكلية */
      case 0:
        return [
          {
            kind: 'l3_teach',
            key: 's1_intro_whole',
            skillTag: 'فكرة الدرس · صفحة 16',
            title: 'الأعداد الكلية وترتيب المنازل',
            body: 'الأعداد الكلية هي: 0, 1, 2, 3, ... عند الجمع أو الطرح نرتّب الأرقام عموديًا (الآحاد تحت الآحاد والعشرات تحت العشرات) ونبدأ دائمًا من اليمين إلى اليسار.',
            bullets: [
              'نبدأ الحساب دائمًا من منزلة الآحاد باتجاه اليسار.',
              'إذا بلغ مجموع العمود 10 أو أكثر ننقل العشرات (1) للمنزلة التالية.'
            ],
            hasAudio: true,
            audioText: 'الأعداد الكلية هي صفر واحد اثنان ثلاثة وهكذا. عند جمع عددين كبيرين أو طرحهما نرتب المنازل بدقة تحت بعضها ونبدأ من اليمين إلى اليسار.'
          },
          {
            kind: 'l3_teach',
            key: 's1_intro_explore',
            skillTag: 'أستكشف · التقدير أولًا · ص 16',
            title: 'التقدير لأعلى منزلة قبل الحساب',
            visual: {
              type: 'rounding_arrows',
              title: 'أرباح شركة خلال عام كامل',
              rows: [
                { label: 'النصف الأول', from: '1,125,040', to: '1,000,000' },
                { label: 'النصف الثاني', from: '1,095,400', to: '1,000,000' }
              ],
              summary: 'التقدير: 1,000,000 + 1,000,000 = 2,000,000 دينار'
            },
            hasAudio: true,
            audioText: 'في مسألة أستكشف نقرب أرباح النصف الأول والنصف الثاني لأعلى منزلة، فيكون التقدير مليونين دينار للحكم على معقولية الناتج الدقيق.'
          },
          {
            kind: 'l2_mcq',
            key: 's1_est_mcq',
            skillTag: 'أستكشف · التقدير',
            prompt: 'أرباح شركة في النصف الأول 1,125,040 دينارًا وفي النصف الثاني 1,095,400 دينارًا. ما التقدير الصحيح لمجموع الأرباح بالتقريب لأعلى منزلة؟',
            options: [
              { label: '1,000,000 دينار (مليون واحد)', value: 1000000 },
              { label: '2,000,000 دينار (مليونان)', value: 2000000 },
              { label: '3,000,000 دينار (3 ملايين)', value: 3000000 }
            ],
            correctValue: 2000000,
            explainRight: 'أحسنت! كل من العددين أقرب إلى 1,000,000، ومجموعهما التقديري 2,000,000 دينار.',
            explainWrong: 'انظر إلى منزلة مئات الألوف في العددين: الرقم 1 والرقم 0 كلاهما أصغر من 5، فيقرّب كل عدد إلى 1,000,000.',
            hints: [
              'منزلة الملايين في العددين هي 1.',
              'الرقم الذي عن يمين الملايين هو 1 في الأول و0 في الثاني (أقل من 5).',
              'إذن التقدير هو 1,000,000 + 1,000,000 = 2,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's1_exact_op',
            skillTag: 'أستكشف · الحساب الدقيق',
            prompt: 'أوجد أرباح الشركة في نهاية العام بجمع 1,125,040 + 1,095,400 عموديًا خطوة بخطوة:',
            op: 'add',
            operands: [1125040, 1095400],
            customEst: 2000000,
            customEstFormula: '1,000,000 + 1,000,000 = 2,000,000',
            reasonNote: 'الناتج الدقيق 2,220,440 قريب جدًا من التقدير 2,000,000، فالإجابة معقولة.',
            explainRight: 'ممتاز! مجموع أرباح الشركة في نهاية العام هو 2,220,440 دينارًا.',
            hints: [
              'ابدأ من الآحاد (0 + 0 = 0) ثم العشرات (4 + 0 = 4) ثم المئات (0 + 4 = 4).',
              'في آحاد الألوف: 5 + 5 = 10؛ ضع 0 واحمل 1 إلى عشرات الألوف.',
              'في عشرات الألوف: 1 + 2 + 9 = 12؛ ضع 2 واحمل 1 إلى مئات الألوف لتصبح النتيجة 2,220,440.'
            ],
            hasAudio: true,
            audioText: 'نجمع مليونا ومئة وخمسة وعشرين ألفا وأربعين مع مليون وخمسة وتسعين ألفا وأربعمئة، فنحصل على مليونين ومئتين وعشرين ألفا وأربعمئة وأربعين.'
          }
        ];

      /* Station 2 (node 1): أتعلّم - التقدير لأعلى منزلة ومعقولية الإجابة */
      case 1:
        return [
          {
            kind: 'l2_mcq',
            key: 's2_round1',
            skillTag: 'أتعلّم · التقريب لأعلى منزلة',
            prompt: 'عند تقريب العدد 3,421,664 إلى أعلى منزلة (آحاد الملايين)، ما الناتج؟',
            visual: {
              type: 'rounding_arrows',
              title: 'تذكّر قاعدة التقريب لأعلى منزلة',
              rows: [
                { label: 'أعلى منزلة', from: '3,421,664', to: '؟' }
              ],
              summary: 'انظر إلى الرقم الذي يسبق أعلى منزلة مباشرة (مئات الألوف = 4)'
            },
            options: [
              { label: '3,400,000', value: 3400000 },
              { label: '4,000,000', value: 4000000 },
              { label: '3,000,000', value: 3000000 }
            ],
            correctValue: 3000000,
            explainRight: 'صحيح! لأن رقم مئات الألوف هو 4 (أصغر من 5) يبقى رقم الملايين 3 كما هو وتتحول باقي المنازل إلى أصفار.',
            explainWrong: 'للتقريب إلى أعلى منزلة ننظر إلى الخانة الثانية من اليسار (4): إذا كانت أقل من 5 لا نزيد رقم الملايين.',
            hints: [
              'أعلى منزلة في 3,421,664 هي آحاد الملايين (3).',
              'الرقم المجاور لها من اليمين هو 4 وهو أصغر من 5.',
              'لذلك يبقى الرقم 3 كما هو وتصبح النتيجة 3,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's2_round2',
            skillTag: 'أتعلّم · التقريب لأعلى منزلة',
            prompt: 'ما تقريب العدد 1,897,632 إلى أعلى منزلة؟',
            options: [
              { label: '2,000,000', value: 2000000 },
              { label: '1,000,000', value: 1000000 },
              { label: '1,900,000', value: 1900000 }
            ],
            correctValue: 2000000,
            explainRight: 'ممتاز! الرقم في مئات الألوف هو 8 (أكبر من 5)، فنضيف 1 إلى الملايين ليصبح 2,000,000.',
            explainWrong: 'الخانة المجاورة للملايين هي 8 (من الأرقام الكريمة 5 فأكثر)، لذا نزيد رقم الملايين بمقدار 1.',
            hints: [
              'أعلى منزلة هي 1 في آحاد الملايين.',
              'الرقم عن يمينها هو 8 وهو 5 فأكثر.',
              'نزيد 1 إلى آحاد الملايين فتصبح 2,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's2_est_sum',
            skillTag: 'أتعلّم · التقدير السريع',
            prompt: 'قدّر ناتج جمع 3,421,664 + 1,897,632 باستعمال ناتجي التقريب السابقين (اكتب الناتج بالأرقام):',
            displayText: '3,000,000 + 2,000,000',
            targetVal: 5000000,
            placeholder: 'مثال: 5000000',
            explainRight: 'رائع! 3,000,000 + 2,000,000 = 5,000,000.',
            explainWrong: 'اجمع 3 ملايين + مليونين = 5 ملايين (5 متبوعة بـ 6 أصفار).',
            hints: [
              'استبدل كل عدد بتقريبه: 3,000,000 و 2,000,000.',
              'اجمع 3 + 2 في منزلة الملايين.',
              'الناتج التقديري هو 5000000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's2_reason_check',
            skillTag: 'أتعلّم · الحكم على المعقولية',
            prompt: 'إذا كان الناتج التقديري لمسألة جمع هو 5,000,000، فأي الإجابات الدقيقة الآتية تُعد معقولة؟',
            options: [
              { label: '531,929', value: 'too_small' },
              { label: '15,319,296', value: 'too_big' },
              { label: '5,319,296', value: 'reasonable' }
            ],
            correctValue: 'reasonable',
            explainRight: 'ممتاز! 5,319,296 قريبة من 5,000,000 (في فئة الخمسة ملايين)، أما 531 ألفًا و15 مليونًا فبعيدتان جدًا.',
            explainWrong: 'قارن القيمة الكلية بالخمسة ملايين؛ أي عدد يقترب من 5 ملايين؟',
            hints: [
              'التقدير هو 5 ملايين تقريبًا.',
              'العدد 531,929 أصغر بعشر مرات، والعدد 15,319,296 أكبر بثلاث مرات.',
              'الإجابة المعقولة هي 5,319,296.'
            ],
            hasAudio: false
          }
        ];

      /* Station 3 (node 2): مثال 1 ص 16-17 (3,421,664 + 1,897,632) */
      case 2:
        return [
          {
            kind: 'l3_teach',
            key: 's3_ex1_est_teach',
            skillTag: 'مثال 1 · التقدير · ص 16',
            title: 'أولًا: نقدّر مجموع 3,421,664 + 1,897,632',
            visual: {
              type: 'rounding_arrows',
              title: 'التقريب لأعلى منزلة (الملايين)',
              rows: [
                { label: 'العدد الأول', from: '3,421,664', to: '3,000,000' },
                { label: 'العدد الثاني', from: '1,897,632', to: '2,000,000' }
              ],
              summary: 'التقدير: 3,000,000 + 2,000,000 = 5,000,000'
            },
            hasAudio: true,
            audioText: 'في المثال الأول نقرب العددين لأعلى منزلة: ثلاثة ملايين زائد مليونين يساوي خمسة ملايين.'
          },
          {
            kind: 'l3_teach',
            key: 's3_ex1_teach',
            skillTag: 'مثال 1 · إعادة التجميع · ص 17',
            title: 'ثانيًا: سر إعادة التجميع (الحمل)',
            body: 'نجمع من اليمين إلى اليسار عمودًا بعمود. كلما كان مجموع العمود 10 أو أكثر نكتب الآحاد في الأسفل ونرفع 1 في دائرة حمراء فوق المنزلة التالية.',
            bullets: [
              'المئات: 6 + 6 = 12 (نكتب 2 ونحمل 1 إلى آحاد الألوف).',
              'عشرات الألوف ومئات الألوف فيها حمل أيضًا حتى الملايين.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's3_carry_spot',
            skillTag: 'مثال 1 · مهارة الحمل',
            prompt: 'في عمود المئات للمسألة 3,421,664 + 1,897,632 نجمع 6 + 6 = 12. ماذا نفعل؟',
            options: [
              { label: 'نكتب 12 كاملة داخل خانة المئات', value: 'both' },
              { label: 'نكتب 2 في المئات ونحمل 1 إلى آحاد الألوف', value: 'carry' },
              { label: 'نكتب 1 في المئات ونحمل 2 إلى آحاد الألوف', value: 'swap' }
            ],
            correctValue: 'carry',
            explainRight: 'أحسنت! 12 تعني 2 مئات + 1 ألف (10 مئات)، فنكتب 2 ونعيد تجميع 1 إلى آحاد الألوف.',
            explainWrong: 'كل منزلة تتّسع لرقم واحد فقط (0 إلى 9)، فنضع الآحاد 2 ونرفع العشرات 1 للمنزلة اليسرى التالية.',
            hints: [
              'الرقم 12 يتكون من آحاد (2) وعشرة واحدة (1).',
              'نُبقي الآحاد (2) في مكانها.',
              'ننقل 1 في دائرة حمراء فوق منزلة آحاد الألوف.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's3_ex1_op',
            skillTag: 'مثال 1 · التنفيذ العمودي',
            prompt: 'نفّذ الجمع العمودي للمثال 1 عمودًا بعمود ولاحظ دوائر إعادة التجميع الحمراء:',
            op: 'add',
            operands: [3421664, 1897632],
            customEst: 5000000,
            customEstFormula: '3,000,000 + 2,000,000 = 5,000,000',
            reasonNote: 'بما أن الإجابة الدقيقة 5,319,296 قريبة من الإجابة المقدّرة 5,000,000 فهي معقولة.',
            explainRight: 'ممتاز! ناتج الجمع هو 5,319,296 وتطابق مع معقولية التقدير 5,000,000.',
            hints: [
              'الآحاد: 4+2=6، العشرات: 6+3=9، المئات: 6+6=12 (ضع 2 واحمل 1).',
              'آحاد الألوف: 1+1+7=9، عشرات الألوف: 2+9=11 (ضع 1 واحمل 1).',
              'مئات الألوف: 1+4+8=13 (ضع 3 واحمل 1)، الملايين: 1+3+1=5 ← الناتج 5,319,296.'
            ],
            hasAudio: true,
            audioText: 'الناتج خمسة ملايين وثلاثمئة وتسعة عشر ألفا ومئتان وستة وتسعون.'
          }
        ];

      /* Station 4 (node 3): أتحقق من فهمي (1) ص 17 (8 منازل: 35,421,664 + 17,897,632) */
      case 3:
        return [
          {
            kind: 'l2_mcq',
            key: 's4_est_8digits',
            skillTag: 'أتحقق من فهمي (1) · ص 17',
            prompt: 'في سؤال أتحقق: 35,421,664 + 17,897,632، العدد يتكون من 8 منازل (عشرات الملايين). ما ناتج التقدير لأعلى منزلة؟',
            options: [
              { label: '40,000,000 + 20,000,000 = 60,000,000', value: 60000000 },
              { label: '30,000,000 + 10,000,000 = 40,000,000', value: 40000000 },
              { label: '35,000,000 + 18,000,000 = 53,000,000', value: 53000000 }
            ],
            correctValue: 60000000,
            explainRight: 'صحيح! 35,421,664 يقرّب إلى 40,000,000 (لأن آحاد الملايين 5)، و17,897,632 يقرّب إلى 20,000,000، والمجموع التقديري 60,000,000.',
            explainWrong: 'أعلى منزلة هنا هي عشرات الملايين (3 و1)، وبجوارهما 5 و7 وكلاهما 5 فأكثر فيرتفعان إلى 4 و2.',
            hints: [
              'العدد الأول يبدأ بـ 35 مليونًا؛ الخمسة تقرّب الـ 3 إلى 4 أي 40,000,000.',
              'العدد الثاني يبدأ بـ 17 مليونًا؛ السبعة تقرّب الـ 1 إلى 2 أي 20,000,000.',
              '40,000,000 + 20,000,000 = 60,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's4_check1_op',
            skillTag: 'أتحقق من فهمي (1) · لوحة 8 منازل',
            prompt: 'أوجد ناتج الجمع في لوحة الـ 8 منازل: 35,421,664 + 17,897,632:',
            op: 'add',
            operands: [35421664, 17897632],
            customEst: 60000000,
            customEstFormula: '40,000,000 + 20,000,000 = 60,000,000',
            reasonNote: 'الناتج الدقيق 53,319,296 قريب من التقدير 60,000,000، والإجابة معقولة.',
            explainRight: 'رائع! أتممت جمع 8 منازل بنجاح: 53,319,296.',
            hints: [
              'الأرقام الستة الأولى تطابق المثال 1، فتنتج 319,296 مع حمل 1 إلى آحاد الملايين.',
              'في آحاد الملايين: 1 + 5 + 7 = 13 (ضع 3 واحمل 1 إلى عشرات الملايين).',
              'في عشرات الملايين: 1 + 3 + 1 = 5، فيكون الناتج 53,319,296.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's4_transfer_num',
            skillTag: 'تدريب إضافي · 8 منازل',
            prompt: 'اختبر سرعتك الذهنية: أوجد ناتج جمع 41,258,310 + 16,491,205:',
            displayText: '41,258,310 + 16,491,205',
            targetVal: 57749515,
            placeholder: 'أدخل الناتج بالأرقام',
            explainRight: 'دقيق! 41,258,310 + 16,491,205 = 57,749,515.',
            explainWrong: 'انتبه لإعادة تجميع 1 من عشرات الألوف (5+9=14) إلى مئات الألوف (1+2+4=7).',
            hints: [
              'الألوف الثلاثية: 258 + 491 = 749، والآحاد الثلاثية: 310 + 205 = 515.',
              'الملايين: 41 + 16 = 57.',
              'الناتج هو 57749515.'
            ],
            hasAudio: false
          }
        ];

      /* Station 5 (node 4): مثال 2 ص 17 (6,938,179 - 3,165,478) */
      case 4:
        return [
          {
            kind: 'l3_teach',
            key: 's5_ex2_est_teach',
            skillTag: 'مثال 2 · التقدير · ص 17',
            title: 'أولًا: نقدّر طرح 6,938,179 - 3,165,478',
            visual: {
              type: 'rounding_arrows',
              title: 'التقريب لأعلى منزلة (الملايين)',
              rows: [
                { label: 'المطروح منه', from: '6,938,179', to: '7,000,000' },
                { label: 'المطروح', from: '3,165,478', to: '3,000,000' }
              ],
              summary: 'التقدير: 7,000,000 - 3,000,000 = 4,000,000'
            },
            hasAudio: true,
            audioText: 'في المثال الثاني نقرب المطروح منه إلى سبعة ملايين والمطروح إلى ثلاثة ملايين، فالتقدير أربعة ملايين.'
          },
          {
            kind: 'l3_teach',
            key: 's5_ex2_teach',
            skillTag: 'مثال 2 · قاعدة الاستلاف · ص 17',
            title: 'ثانيًا: متى وكيف نستلف؟',
            body: 'عندما يكون الرقم العلوي أصغر من الرقم السفلي في أي عمود، نستلف 1 من الجار الأيسر (ينقص الجار بمقدار 1 ويزيد الرقم الحالي 10).',
            bullets: [
              'في المئات (1 < 4): نستلف من 8 (8 → 7) فتصبح 11 - 4 = 7.',
              'في عشرات الألوف (3 < 6): نستلف من 9 (9 → 8) فتصبح 13 - 6 = 7.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's5_borrow_check',
            skillTag: 'مثال 2 · فهم الاستلاف',
            prompt: 'في عشرات الألوف للعدد 6,938,179 نحتاج لطرح 3 - 6. بعد الاستلاف من مئات الألوف (9)، كيف تصبح المنزلتان؟',
            options: [
              { label: 'الرقم 9 يبقى 9، والرقم 3 يصبح 4', value: 'no_change' },
              { label: 'الرقم 9 يصبح 8، والرقم 3 يصبح 13 (فنحسب 13 - 6 = 7)', value: '13_and_8' },
              { label: 'نحسب 6 - 3 = 3 دون استلاف', value: 'reverse_sub' }
            ],
            correctValue: '13_and_8',
            explainRight: 'أحسنت! عند الاستلاف ينقص الجار الأيسر بمقدار 1 (9 → 8) ويزيد الرقم الحالي بمقدار 10 (3 → 13).',
            explainWrong: 'لا يجوز أبدًا طرح السفلي من العلوي بالعكس (6 - 3)، بل نستلف 1 من الجار الأيسر الذي ينقص 1 ونضيف 10 للخانة الحالية.',
            hints: [
              'الرقم العلوي 3 أصغر من 6، لذا نستلف من الجار الأيسر (9).',
              'ينقص الجار 9 ليصبح 8، ويحصل الرقم 3 على 10 ليصبح 13.',
              '13 - 6 = 7.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's5_ex2_op',
            skillTag: 'مثال 2 · الطرح العمودي',
            prompt: 'نفّذ عملية الطرح مستخدمًا زر الاستلاف عند الحاجة: 6,938,179 - 3,165,478:',
            op: 'sub',
            operands: [6938179, 3165478],
            customEst: 4000000,
            customEstFormula: '7,000,000 - 3,000,000 = 4,000,000',
            reasonNote: 'بما أن الإجابة الحقيقية 3,772,701 قريبة من الإجابة المقدّرة 4,000,000 فهي معقولة.',
            explainRight: 'رائع! ناتج الطرح الدقيق هو 3,772,701 وقد طبقت الاستلاف في المئات وعشرات الألوف بإتقان.',
            hints: [
              'الآحاد 9-8=1، العشرات 7-7=0، وفي المئات اضغط (استلاف 1) ليصبح 11-4=7.',
              'آحاد الألوف صارت 7: 7-5=2. وفي عشرات الألوف اضغط (استلاف 1) ليصبح 13-6=7.',
              'مئات الألوف صارت 8: 8 - 1 = 7، والملايين 6 - 3 = 3 ← الناتج 3,772,701.'
            ],
            hasAudio: true,
            audioText: 'ناتج الطرح ثلاثة ملايين وسبعمئة واثنان وسبعون ألفا وسبعمئة وواحد.'
          }
        ];

      /* Station 6 (node 5): أتحقق من فهمي (2) ص 18 (8,465,987 - 5,276,514) */
      case 5:
        return [
          {
            kind: 'l2_mcq',
            key: 's6_est_mcq',
            skillTag: 'أتحقق من فهمي (2) · ص 18',
            prompt: 'قبل طرح 8,465,987 - 5,276,514، ما التقدير الصحيح لأعلى منزلة؟',
            options: [
              { label: '8,000,000 - 6,000,000 = 2,000,000', value: 2000000 },
              { label: '9,000,000 - 5,000,000 = 4,000,000', value: 4000000 },
              { label: '8,000,000 - 5,000,000 = 3,000,000', value: 3000000 }
            ],
            correctValue: 3000000,
            explainRight: 'دقيق! 4 و2 في مئات الألوف أقل من 5، فيكون التقدير 8,000,000 - 5,000,000 = 3,000,000.',
            explainWrong: 'الرقم التالي للملايين في 8,465,987 هو 4 (أقل من 5) وفي 5,276,514 هو 2 (أقل من 5).',
            hints: [
              '8,465,987 يقرّب إلى 8,000,000.',
              '5,276,514 يقرّب إلى 5,000,000.',
              '8,000,000 - 5,000,000 = 3,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's6_check2_op',
            skillTag: 'أتحقق من فهمي (2) · الطرح العمودي',
            prompt: 'أوجد ناتج الطرح: 8,465,987 - 5,276,514:',
            op: 'sub',
            operands: [8465987, 5276514],
            customEst: 3000000,
            customEstFormula: '8,000,000 - 5,000,000 = 3,000,000',
            reasonNote: 'الناتج الدقيق 3,189,473 قريب من التقدير 3,000,000، فالإجابة معقولة.',
            explainRight: 'ممتاز! ناتج الطرح هو 3,189,473.',
            hints: [
              'دورة الآحاد تطرح مباشرة: 7-4=3، 8-1=7، 9-5=4.',
              'في آحاد الألوف الرقم العلوي أصغر من السفلي (5 < 6) فنستلف من 6 (تصبح 5) فيصير 15 - 6 = 9.',
              'في عشرات الألوف الرقم العلوي أصغر من السفلي (5 < 7) فنستلف من 4 (تصبح 3) فيصير 15 - 7 = 8، ثم 3 - 2 = 1 و 8 - 5 = 3.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's6_verify_sum',
            skillTag: 'التحقق العكسي',
            prompt: 'كيف نتحقق أن 8,465,987 - 5,276,514 = 3,189,473 صحيح؟',
            options: [
              { label: 'نجمع 8,465,987 + 5,276,514', value: 'add_orig' },
              { label: 'نجمع 5,276,514 + 3,189,473 فنجد الناتج 8,465,987', value: 'add_back' },
              { label: 'نطرح 5,276,514 - 3,189,473', value: 'sub_small' }
            ],
            correctValue: 'add_back',
            explainRight: 'أحسنت! جمع المطروح مع ناتج الطرح يعيدنا إلى المطروح منه (8,465,987).',
            explainWrong: 'العملية العكسية للطرح هي جمع المطروح + الناتج لنحصل على العدد الأكبر الأصلي.',
            hints: [
              'المطروح هو 5,276,514 والناتج هو 3,189,473.',
              'إذا جمعناهما معًا يجب أن يساويا المطروح منه 8,465,987.',
              'ابحث عن الخيار الذي يجمع المطروح (5,276,514) والناتج (3,189,473) للتحقق.'
            ],
            hasAudio: false
          }
        ];

      /* Station 7 (node 6): أتدرب 1 و 2 ص 18 */
      case 6:
        return [
          {
            kind: 'l2_mcq',
            key: 's7_q1_est',
            skillTag: 'أتدرب (1) · التقدير · ص 18',
            prompt: 'تمرين (1): 2,827,160 + 1,915,512. ما التقدير لأعلى منزلة؟',
            options: [
              { label: '2,000,000 + 1,000,000 = 3,000,000', value: 3000000 },
              { label: '2,000,000 + 2,000,000 = 4,000,000', value: 4000000 },
              { label: '3,000,000 + 2,000,000 = 5,000,000', value: 5000000 }
            ],
            correctValue: 5000000,
            explainRight: 'ممتاز! 8 و9 في مئات الألوف تقرّبان العددين إلى 3,000,000 و2,000,000 فالتقدير 5,000,000.',
            explainWrong: 'لاحظ أرقام مئات الألوف: 8 و9 كلاهما 5 فأكثر فيقرّبان الملايين للأعلى.',
            hints: [
              '2,827,160 أقرب إلى 3,000,000.',
              '1,915,512 أقرب إلى 2,000,000.',
              '3,000,000 + 2,000,000 = 5,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's7_q1_exact',
            skillTag: 'أتدرب (1) · الناتج الدقيق',
            prompt: 'أوجد ناتج التمرين (1) عموديًا: 2,827,160 + 1,915,512:',
            op: 'add',
            operands: [2827160, 1915512],
            customEst: 5000000,
            customEstFormula: '3,000,000 + 2,000,000 = 5,000,000',
            reasonNote: 'الناتج الدقيق 4,742,672 قريب من التقدير 5,000,000 (معقول).',
            explainRight: 'أحسنت! 2,827,160 + 1,915,512 = 4,742,672.',
            hints: [
              'الآحاد والعشرات والمئات لا تحتاج حمل: 2، 7، 6.',
              'آحاد الألوف: 7 + 5 = 12 (ضع 2 واحمل 1).',
              'عشرات الألوف: 1+2+1=4، مئات الألوف: 8+9=17 (ضع 7 واحمل 1)، الملايين: 1+2+1=4.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's7_q2_est',
            skillTag: 'أتدرب (2) · التقدير · ص 18',
            prompt: 'تمرين (2): قدّر ناتج جمع 2,713,220 + 4,856,223 بالتقريب لأعلى منزلة:',
            displayText: '2,713,220 + 4,856,223',
            targetVal: 8000000,
            placeholder: 'أدخل الناتج التقديري',
            explainRight: 'رائع! 3,000,000 + 5,000,000 = 8,000,000.',
            explainWrong: 'قرّب 2,713,220 إلى 3,000,000 وقرّب 4,856,223 إلى 5,000,000 ثم اجمع.',
            hints: [
              'في 2,713,220 رقم مئات الألوف (7 ≥ 5) فيقرّب إلى 3,000,000.',
              'في 4,856,223 رقم مئات الألوف (8 ≥ 5) فيقرّب إلى 5,000,000.',
              'المجموع التقديري: 3000000 + 5000000 = 8000000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's7_q2_exact',
            skillTag: 'أتدرب (2) · الناتج الدقيق',
            prompt: 'أوجد ناتج التمرين (2) عموديًا: 2,713,220 + 4,856,223:',
            op: 'add',
            operands: [2713220, 4856223],
            customEst: 8000000,
            customEstFormula: '3,000,000 + 5,000,000 = 8,000,000',
            reasonNote: 'الناتج الدقيق 7,569,443 قريب من التقدير 8,000,000 (معقول).',
            explainRight: 'ممتاز! 2,713,220 + 4,856,223 = 7,569,443.',
            hints: [
              'ابدأ من الآحاد: 0+3=3، 2+2=4، 2+2=4.',
              'الألوف: 3+6=9، عشرات الألوف: 1+5=6.',
              'مئات الألوف: 7+8=15 (ضع 5 واحمل 1)، الملايين: 1+2+4=7.'
            ],
            hasAudio: false
          }
        ];

      /* Station 8 (node 7): أتدرب 3 و 4 ص 18 (طرح مع أصفار واستلاف متتابع) */
      case 7:
        return [
          {
            kind: 'l2_mcq',
            key: 's8_q3_est_note',
            skillTag: 'أتدرب (3) · ملاحظة التقدير · ص 18',
            prompt: 'في التمرين (3): 7,810,294 - 7,732,198، كلا العددين يقرّب لأعلى منزلة (الملايين) إلى 8,000,000 فتظهر النتيجة 0. ماذا نفعل لنحصل على تقدير أدق؟',
            options: [
              { label: 'نقرّب إلى أقرب مئة ألف: 7,800,000 - 7,700,000 = 100,000', value: '100k' },
              { label: 'نعتبر الناتج الدقيق يساوي صفرًا حتمًا', value: 'zero' },
              { label: 'نجمع العددين بدلًا من طرحهما', value: 'add' }
            ],
            correctValue: '100k',
            explainRight: 'ذكاء رياضي! عندما يتقارب العددان في أعلى منزلة (الملايين)، نستخدم التقريب إلى مئات الألوف (7,800,000 - 7,700,000 = 100,000).',
            explainWrong: 'العددان غير متساويين فلا يساوي فرقهما صفرًا؛ بل نقرّبهما لأول منزلة يختلفان فيها (مئات الألوف).',
            hints: [
              'في 7,810,294 مئات الألوف 8 و1 بعدها، وفي 7,732,198 مئات الألوف 7 و3 بعدها.',
              'عند التقريب لمئة ألف: 7,800,000 و 7,700,000.',
              'الفرق التقديري الأدق هو 100,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's8_q3_exact',
            skillTag: 'أتدرب (3) · استلاف عبر الصفر',
            prompt: 'اطرح التمرين (3) منتبهًا للصفر في آحاد الألوف:',
            op: 'sub',
            operands: [7810294, 7732198],
            customEst: 100000,
            customEstLabel: 'التقدير (مئة ألف)',
            customEstFormula: '7,800,000 - 7,700,000 = 100,000',
            reasonNote: 'الناتج الدقيق 78,096 قريب من التقدير 100,000 (معقول). لاحظ أن الملايين تصبح 0!',
            explainRight: 'أبدعت! 7,810,294 - 7,732,198 = 78,096 (أدخلت 0 في مئات الألوف والملايين بشكل صحيح).',
            hints: [
              'الآحاد (4 < 8): نستلف من 9 (9 → 8) و 14 - 8 = 6. العشرات (8 < 9): نستلف من 2 (2 → 1) و 18 - 9 = 9. المئات 1 - 1 = 0.',
              'آحاد الألوف (0 < 2): نستلف من عشرات الألوف (1 → 0) و 10 - 2 = 8.',
              'عشرات الألوف صارت (0 < 3): نستلف من مئات الألوف (8 → 7) و 10 - 3 = 7، ثم 7 - 7 = 0 و 7 - 7 = 0!'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's8_q4_est',
            skillTag: 'أتدرب (4) · التقدير · ص 18',
            prompt: 'تمرين (4): 4,443,219 - 2,233,681. ما التقدير لأعلى منزلة؟',
            options: [
              { label: '4,000,000 - 3,000,000 = 1,000,000', value: 1000000 },
              { label: '4,000,000 - 2,000,000 = 2,000,000', value: 2000000 },
              { label: '5,000,000 - 2,000,000 = 3,000,000', value: 3000000 }
            ],
            correctValue: 2000000,
            explainRight: 'صحيح! 4 و2 في مئات الألوف أقل من 5، فالتقدير 4,000,000 - 2,000,000 = 2,000,000.',
            explainWrong: 'انظر للخانة الثانية من اليسار: 4 في الأول و2 في الثاني، كلاهما أقل من 5.',
            hints: [
              '4,443,219 تقرّب إلى 4,000,000.',
              '2,233,681 تقرّب إلى 2,000,000.',
              'الفرق التقديري = 2,000,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's8_q4_exact',
            skillTag: 'أتدرب (4) · الطرح العمودي',
            prompt: 'أوجد ناتج التمرين (4) عموديًا: 4,443,219 - 2,233,681:',
            op: 'sub',
            operands: [4443219, 2233681],
            customEst: 2000000,
            customEstFormula: '4,000,000 - 2,000,000 = 2,000,000',
            reasonNote: 'الناتج الدقيق 2,209,538 قريب من التقدير 2,000,000 (معقول).',
            explainRight: 'ممتاز! 4,443,219 - 2,233,681 = 2,209,538.',
            hints: [
              'الآحاد 9 - 1 = 8. في العشرات الرقم العلوي أصغر من السفلي (1 < 8) فنستلف من المئات فتصبح 11 - 8 = 3.',
              'في المئات صار العلوي أصغر من السفلي (1 < 6) فنستلف من آحاد الألوف ليصبح 11 - 6 = 5.',
              'في آحاد الألوف صار (2 < 3) فنستلف من 4 ليصبح 12 - 3 = 9، ثم 3 - 3 = 0، 4 - 2 = 2، 4 - 2 = 2.'
            ],
            hasAudio: false
          }
        ];

      /* Station 9 (node 8): أتدرب 5 ص 18 (جمع 3 أعداد دفعة واحدة) */
      case 8:
        return [
          {
            kind: 'l3_teach',
            key: 's9_three_teach',
            skillTag: 'أتدرب (5) · صفحة 18',
            title: 'حمل 1 أو 2 عند جمع 3 أعداد',
            body: 'نرتّب الأعداد الثلاثة عموديًا بدءًا من الآحاد بالآحاد، وننتبه أن مجموع 3 أرقام في عمود واحد قد يصل إلى 20 أو أكثر، فنحمل 2 إلى العمود التالي.',
            bullets: [
              'مثال: إذا كان مجموع العمود 21، نكتب 1 ونحمل 2.',
              'دائمًا اجمع الحمل الأعلى مع الأرقام الثلاثة في العمود التالي.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's9_q5_est',
            skillTag: 'أتدرب (5) · التقدير',
            prompt: 'قدّر مجموع 5,400,663 + 2,145,621 + 1,445,532 بالتقريب لأعلى منزلة:',
            displayText: '5,400,663 + 2,145,621 + 1,445,532',
            targetVal: 8000000,
            placeholder: 'أدخل المجموع التقديري',
            explainRight: 'أحسنت! 5,000,000 + 2,000,000 + 1,000,000 = 8,000,000.',
            explainWrong: 'أرقام مئات الألوف في الأعداد الثلاثة (4، 1، 4) كلها أصغر من 5، فالتقريب هو 5M + 2M + 1M.',
            hints: [
              '5,400,663 ← يقرب إلى 5,000,000.',
              '2,145,621 ← يقرب إلى 2,000,000 و 1,445,532 ← يقرب إلى 1,000,000.',
              '5 + 2 + 1 = 8 ملايين أي 8000000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's9_q5_op',
            skillTag: 'أتدرب (5) · الجمع العمودي لـ 3 أعداد',
            prompt: 'أوجد المجموع الدقيق للأعداد الثلاثة: 5,400,663 + 2,145,621 + 1,445,532:',
            op: 'add',
            operands: [5400663, 2145621, 1445532],
            customEst: 8000000,
            customEstFormula: '5,000,000 + 2,000,000 + 1,000,000 = 8,000,000',
            reasonNote: 'الناتج الدقيق 8,991,816 قريب من التقدير 8,000,000 (معقول).',
            explainRight: 'ممتاز! المجموع هو 8,991,816.',
            hints: [
              'الآحاد: 3+1+2=6، العشرات: 6+2+3=11 (ضع 1 واحمل 1).',
              'المئات: 1+6+6+5=18 (ضع 8 واحمل 1)، آحاد الألوف: 1+0+5+5=11 (ضع 1 واحمل 1).',
              'عشرات الألوف: 1+0+4+4=9، مئات الألوف: 4+1+4=9، الملايين: 5+2+1=8.'
            ],
            hasAudio: false
          }
        ];

      /* Station 10 (node 9, chest): مسألة 6 ص 18 - مساحات دول المغرب العربي + معلومة */
      case 9:
        return [
          {
            kind: 'l2_mcq',
            key: 's10_align_check',
            skillTag: 'سؤال 6 · دول · ص 18',
            prompt: 'الرقم 7 في مساحة المغرب (710,850) يقابل أي منزلة عند الجمع؟',
            visual: {
              type: 'maghreb_area_cards',
              countries: [
                { name: 'الجزائر', area: 2381741 },
                { name: 'ليبيا', area: 1759541 },
                { name: 'المغرب', area: 710850 }
              ],
              fact: 'تقع الجزائر في إفريقيا وهي أكبر دولة عربية مساحةً، وتليها السعودية.'
            },
            options: [
              { label: 'منزلة آحاد الملايين (تحت 2 في الجزائر و1 في ليبيا)', value: 'millions' },
              { label: 'منزلة عشرات الألوف', value: 'ten_thousands' },
              { label: 'منزلة مئات الألوف (تحت 3 في الجزائر و7 في ليبيا)', value: 'hundred_thousands' }
            ],
            correctValue: 'hundred_thousands',
            explainRight: 'صحيح تمامًا! مساحة المغرب تتكون من 6 منازل فقط، فتبقى منزلة آحاد الملايين خالية ويقع الرقم 7 في مئات الألوف.',
            explainWrong: 'عدّ منازل 710,850: ست منازل فقط (لا يوجد رقم في آحاد الملايين)، فالرقم 7 هو مئات الألوف.',
            hints: [
              'مساحة الجزائر وليبيا 7 منازل، بينما مساحة المغرب 6 منازل.',
              'نبدأ المحاذاة من اليمين (الآحاد تحت الآحاد) دائمًا.',
              'الرقم السادس من اليمين في 710,850 هو 7 في منزلة مئات الألوف.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's10_maghreb_op',
            skillTag: 'سؤال 6 · الجمع مع حمل 2',
            prompt: 'أوجد مجموع المساحات الثلاث (انتبه لظهور حمل يساوي 2):',
            op: 'add',
            operands: [2381741, 1759541, 710850],
            customEst: 5000000,
            customEstFormula: '2,000,000 + 2,000,000 + 700,000 = 4,700,000 (≈ 5,000,000)',
            reasonNote: 'المساحة الدقيقة 4,852,132 كيلومترًا مربعًا قريبة جدًا من التقدير 4,700,000.',
            explainRight: 'بطل! مساحة الدول الثلاث معًا = 4,852,132 كيلومترًا مربعًا.',
            hints: [
              'الآحاد: 1+1+0=2. العشرات: 4+4+5=13 (ضع 3 واحمل 1).',
              'المئات: 1+7+5+8=21! نضع 1 ونرفع 2 (اثنان) فوق آحاد الألوف!',
              'آحاد الألوف: 2+1+9+0=12 (ضع 2 واحمل 1)، عشرات الألوف: 1+8+5+1=15، مئات الألوف: 1+3+7+7=18، الملايين: 1+2+1=4.'
            ],
            hasAudio: true,
            audioText: 'مجموع مساحات الجزائر وليبيا والمغرب يساوي أربعة ملايين وثمانمئة واثنين وخمسين ألفا ومئة واثنين وثلاثين كيلومترا مربعا.'
          }
        ];

      /* Station 11 (node 10): مسألة 7 ص 18 - صادرات المملكة من الأسمدة */
      case 10:
        return [
          {
            kind: 'l2_mcq',
            key: 's11_table_op_choice',
            skillTag: 'سؤال 7 · صادرات · ص 18',
            prompt: 'يبين الجدول قيمة صادرات المملكة من الأسمدة في شهر كانون الأول لعامي 2016 و 2017م. كيف نجد مقدار زيادة الصادرات في عام 2017 على عام 2016؟',
            visual: {
              type: 'fertilizer_table',
              rows: [
                { year: '2016م', amount: 15300000 },
                { year: '2017م', amount: 27900000 }
              ]
            },
            options: [
              { label: 'نطرح قيمة عام 2016 من قيمة عام 2017: 27,900,000 - 15,300,000', value: 'sub' },
              { label: 'نجمع قيمتي العامين: 27,900,000 + 15,300,000', value: 'add' },
              { label: 'نطرح معكوسًا: 15,300,000 - 27,900,000', value: 'rev' }
            ],
            correctValue: 'sub',
            explainRight: 'أحسنت! كلمة «زيادة ... على ...» تعني الفرق بين القيمة الأكبر (2017) والقيمة الأصغر (2016).',
            explainWrong: 'لإيجاد مقدار زيادة عدد كبير على آخر، نطرح العدد الأصغر من العدد الأكبر.',
            hints: [
              'قيمة صادرات 2017 أكبر من 2016.',
              'مقدار الزيادة = القيمة الأكبر - القيمة الأصغر.',
              'نحسب 27,900,000 - 15,300,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's11_exports_op',
            skillTag: 'سؤال 7 · لوحة 8 منازل',
            prompt: 'أوجد قيمة زيادة الصادرات بطرح: 27,900,000 - 15,300,000:',
            op: 'sub',
            operands: [27900000, 15300000],
            customEst: 10000000,
            customEstFormula: '30,000,000 - 20,000,000 = 10,000,000',
            reasonNote: 'الزيادة الدقيقة 12,600,000 دينار قريبة من التقدير 10,000,000 (معقول).',
            explainRight: 'دقيق! زادت صادرات الأسمدة بمقدار 12,600,000 دينار.',
            hints: [
              'المنازل الخمس الأولى كلها أصفار: 0 - 0 = 0.',
              'مئات الألوف: 9 - 3 = 6.',
              'آحاد الملايين: 7 - 5 = 2، وعشرات الملايين: 2 - 1 = 1 ← الناتج 12,600,000.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's11_verify',
            skillTag: 'سؤال 7 · التحقق العكسي',
            prompt: 'تحقق من صحة حلك: اجمع صادرات عام 2016 مع مقدار الزيادة (15,300,000 + 12,600,000):',
            displayText: '15,300,000 + 12,600,000',
            targetVal: 27900000,
            placeholder: 'أدخل المجموع للتحقق',
            explainRight: 'تمامًا! عاد الناتج إلى 27,900,000 (صادرات 2017م) مما يؤكد دقة طرحنا.',
            explainWrong: 'اجمع المئات أولًا: 3+6=9 ثم الملايين 15+12=27.',
            hints: [
              'الأصفار الخمسة تبقى كما هي.',
              '300 ألف + 600 ألف = 900 ألف.',
              '15 مليونًا + 12 مليونًا = 27 مليونًا ← المجموع 27900000.'
            ],
            hasAudio: false
          }
        ];

      /* Station 12 (node 11): مسألة 8 ص 19 - الأرقام المفقودة */
      case 11:
        return [
          {
            kind: 'l3_teach',
            key: 's12_missing_teach',
            skillTag: 'سؤال 8 · صفحة 19',
            title: 'سر اكتشاف الأرقام المفقودة',
            body: 'نبدأ دائمًا من عمود الآحاد (اليمين) ونتحرك لليسار كي نكشف أي رقم محمول من عمود إلى آخر قبل إيجاد المربع التالي.',
            bullets: [
              'احسب ناتج العمود الظاهر أولًا لتعرف هل ينقل حملًا (1) لليسار.',
              'أضف الحمل القادم من اليمين قبل البحث عن الرقم المفقود.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_missing_digits',
            key: 's12_q8_grid',
            skillTag: 'سؤال 8 · التحدي التفاعلي',
            prompt: 'أضع الأرقام المناسبة في المربعات الفارغة؛ لتصبح عملية الجمع صحيحة:',
            topOperands: [3915266, 1237152],
            resultNum: 5152418,
            // missing entries keyed by row ('op1' = second operand, 'res' = result row) and column pos (0 = ones)
            slots: [
              { id: 'slot_res_0', row: 'res', pos: 0, answer: 8, label: 'ناتج الآحاد' },
              { id: 'slot_op1_2', row: 'op1', pos: 2, answer: 1, label: 'مئات العدد الثاني' },
              { id: 'slot_op1_5', row: 'op1', pos: 5, answer: 2, label: 'مئات الألوف للثاني' }
            ],
            carries: { 2: 1, 4: 1, 6: 1 },
            explainRight: 'بقوة الملاحظة! الأرقام المفقودة من اليمين إلى اليسار هي: 8 (الآحاد)، ثم 1 (المئات)، ثم 2 (مئات الألوف).',
            hints: [
              'الآحاد: 6 + 2 = 8 (المربع في الناتج = 8). العشرات: 6 + 5 = 11 ← نكتب 1 ونحمل 1 للمئات.',
              'المئات: 1 (محمول) + 2 + [المربع] = 4، إذن [المربع] = 1.',
              'آحاد الألوف: 5 + 7 = 12 (حمل 1)، عشرات الألوف: 1 + 1 + 3 = 5، مئات الألوف: 9 + [المربع] = 11 ← [المربع] = 2.'
            ],
            hasAudio: true,
            audioText: 'في سؤال ثمانية، الأرقام المفقودة هي ثمانية في آحاد الناتج، وواحد في مئات العدد الثاني، واثنان في مئات ألوف العدد الثاني.'
          },
          {
            kind: 'l2_mcq',
            key: 's12_missing_reason',
            skillTag: 'سؤال 8 · تدريب التفكير',
            prompt: 'لو كان لدينا عمود مئات يحتوي على (1 محمول من العشرات) + 6 + [مربع] وكان ناتجه الظاهر 4 (أي 14)، فما قيمة [المربع] وما الحمل التالي؟',
            options: [
              { label: 'المربع = 7، ولا يوجد حمل', value: '7_c0' },
              { label: 'المربع = 7، والحمل إلى آحاد الألوف = 1', value: '7_c1' },
              { label: 'المربع = 8، والحمل = 1', value: '8_c1' }
            ],
            correctValue: '7_c1',
            explainRight: 'أحسنت! 1 + 6 = 7، وللوصول إلى 14 نحتاج 7، وبما أن المجموع 14 فنحمل 1 إلى المنزلة التالية.',
            explainWrong: 'تذكّر احتساب الرقم المحمول (1) مع 6 قبل إيجاد المكمل للعدد 14.',
            hints: [
              'اجمع أولًا: 1 + 6 = 7.',
              'كم ينقص 7 لتصبح 14؟ 14 - 7 = 7.',
              'لأن المجموع 14 (وليس 4 فقط) فلا بد من حمل 1 للعمود التالي.'
            ],
            hasAudio: false
          }
        ];

      /* Station 13 (node 12): مسألة 9 ص 19 - طائرات الشحن (مسألة متعددة الخطوات) */
      case 12:
        return [
          {
            kind: 'l2_mcq',
            key: 's13_plan_mcq',
            skillTag: 'سؤال 9 · مهارات التفكير العليا · ص 19',
            prompt: 'كم يزيد مجموع الطائرتين الصغيرتين على الطائرة الكبيرة؟ ما خطة الحل؟',
            visual: {
              type: 'cargo_planes_chart',
              planes: [
                { id: 1, name: 'الطائرة 1', mass: 142618 },
                { id: 2, name: 'الطائرة 2', mass: 214711 },
                { id: 3, name: 'الطائرة 3', mass: 161013 }
              ],
              note: 'أتذكر (ص 19): المسألة متعددة الخطوات تحتاج أكثر من عملية.'
            },
            options: [
              { label: 'نجمع الطائرات الثلاث معًا دفعة واحدة', value: 'all_add' },
              { label: 'نطرح الصغرى من الكبرى فقط (214,711 - 142,618)', value: 'only_two' },
              { label: 'نجمع الصغيرتين (142,618 + 161,013) ثم نطرح الكبيرة (214,711)', value: 'plan_right' }
            ],
            correctValue: 'plan_right',
            explainRight: 'خطة ممتازة! أصغر طائرتين هما الطائرة 1 (142,618 kg) والطائرة 3 (161,013 kg)، وأكبرهما الطائرة 2 (214,711 kg).',
            explainWrong: 'نريد: (مجموع الصغيرتين) ناقص (كتلة الطائرة الكبيرة). حدد أي طائرتين هما الأصغر من الرسم البياني.',
            hints: [
              'قارن الأعمدة: الطائرة 2 (214,711) هي الأطول والأكبر.',
              'الصغيرتان هما الطائرة 1 (142,618) والطائرة 3 (161,013).',
              'الخطوة 1: جمع 1 و 3. الخطوة 2: طرح 2 من الناتج.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's13_planes_step1',
            skillTag: 'سؤال 9 · الخطوة (1) الجمع',
            prompt: 'الخطوة الأولى: أوجد مجموع كتلتي الطائرتين الصغيرتين: 142,618 + 161,013:',
            op: 'add',
            operands: [142618, 161013],
            customEst: 300000,
            customEstFormula: '100,000 + 200,000 = 300,000',
            reasonNote: 'مجموع الطائرتين الصغيرتين 303,631 kg قريب جدًا من التقدير 300,000 kg.',
            explainRight: 'رائع! مجموع كتلتي الطائرتين الصغيرتين = 303,631 kg. ننتقل الآن للخطوة الثانية!',
            hints: [
              'الآحاد: 8+3=11 (ضع 1 واحمل 1). العشرات: 1+1+1=3.',
              'المئات: 6+0=6، آحاد الألوف: 2+1=3.',
              'عشرات الألوف: 4 + 6 = 10 (ضع 0 واحمل 1)، مئات الألوف: 1 + 1 + 1 = 3 ← المجموع 303,631.'
            ],
            hasAudio: false
          },
          {
            kind: 'l3_vertical_op',
            key: 's13_planes_step2',
            skillTag: 'سؤال 9 · الخطوة (2) الطرح مع صفر',
            prompt: 'الخطوة (2): اطرح كتلة الكبيرة من مجموع الصغيرتين:',
            op: 'sub',
            operands: [303631, 214711],
            customEst: 100000,
            customEstFormula: '300,000 - 200,000 = 100,000',
            reasonNote: 'يزيد المجموع بمقدار 88,920 kg، وهي قيمة معقولة وقريبة من 100,000 kg.',
            explainRight: 'إنجاز مذهل! يزيد مجموع الطائرتين الصغيرتين على الطائرة الكبيرة بمقدار 88,920 kg.',
            hints: [
              'الآحاد 1 - 1 = 0، العشرات 3 - 1 = 2. المئات (6 < 7) نستلف من 3 (3 → 2) فيصير 16 - 7 = 9.',
              'في آحاد الألوف الآن (2 < 4)! وبما أن عشرات الألوف 0، نستلف من مئات الألوف (3 → 2) فيصير (0 → 9) وتصير آحاد الألوف 12!',
              '12 - 4 = 8 في آحاد الألوف، ثم 9 - 1 = 8 في عشرات الألوف، ثم 2 - 2 = 0 في مئات الألوف ← الناتج 88,920.'
            ],
            hasAudio: true,
            audioText: 'يزيد مجموع كتلتي الطائرتين الصغيرتين على كتلة الطائرة الكبيرة بمقدار ثمانية وثمانين ألفا وتسعمئة وعشرين كيلوغراما.'
          }
        ];

      /* Station 14 (node 13): مسألة 10 ص 19 - تبرير فارس */
      case 13:
        return [
          {
            kind: 'l2_mcq',
            key: 's14_fares_mcq',
            skillTag: 'سؤال 10 · تبرير · صفحة 19',
            prompt: 'يقول فارس إنّه يمكنه أن يتحقق من ناتج عملية الطرح بجمع المطروح والناتج. هل كلامه صحيح؟ وما التبرير الصحيح؟',
            options: [
              { label: 'لا كلامه خاطئ؛ يجب جمع المطروح منه والمطروح', value: 'false_wrong' },
              { label: 'نعم كلامه صحيح؛ لأن الجمع والطرح عمليتان عكسيتان، ومجموع المطروح والناتج يساوي المطروح منه', value: 'true_inverse' },
              { label: 'نعم، بشرط أن يكون المطروح أكبر من المطروح منه', value: 'false_cond' }
            ],
            correctValue: 'true_inverse',
            explainRight: 'أحسنت التبرير! في أي جملة طرح: المطروح منه - المطروح = الناتج، وبالتالي دائمًا: المطروح + الناتج = المطروح منه.',
            explainWrong: 'تذكّر قاعدة التحقق: إذا كان 10 - 3 = 7، فإن 3 + 7 = 10 دائمًا لأن الجمع يعكس الطرح.',
            hints: [
              'جرّب مثالًا بسيطًا: 15 - 6 = 9. هل 6 + 9 = 15؟',
              'نعم، العدد 6 هو المطروح و9 هو الناتج و15 هو المطروح منه.',
              'السبب الرياضي: الجمع والطرح عمليتان عكسيتان.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_num_input',
            key: 's14_inverse_drill',
            skillTag: 'سؤال 10 · تطبيق التبرير',
            prompt: 'طبّق قاعدة فارس للتحقق من الجملة: 945,320 - 412,180 = 533,140. اجمع المطروح + الناتج:',
            displayText: '412,180 + 533,140',
            targetVal: 945320,
            placeholder: 'أدخل ناتج التحقق',
            explainRight: 'تمامًا! 412,180 + 533,140 = 945,320 وهو يطابق المطروح منه، إذن الطرح صحيح 100%.',
            explainWrong: 'اجمع 80 + 40 = 120، ثم المئات 1 + 1 + 1 = 3، والألوف 412 + 533 = 945.',
            hints: [
              '0+0=0، 8+4=12 (ضع 2 واحمل 1).',
              '1+1+1=3، 2+3=5، 1+3=4، 4+5=9.',
              'الناتج 945320.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's14_mismatch_mcq',
            skillTag: 'سؤال 10 · كشف الخطأ بالتحقق',
            prompt: 'إذا طرح طالب عددين ثم استعمل طريقة فارس (جمع المطروح + الناتج)، فحصل على عدد يختلف عن المطروح منه. ماذا يستنتج؟',
            options: [
              { label: 'يوجد خطأ في عملية الطرح ويجب إعادة الحساب', value: 'recheck' },
              { label: 'طريقة فارس لا تصلح مع الأعداد الكبيرة', value: 'broken_rule' },
              { label: 'الناتج صحيح ما دام الفرق بسيطًا', value: 'ignore' }
            ],
            correctValue: 'recheck',
            explainRight: 'صحيح! إذا لم يتطابق مجموع المطروح والناتج مع المطروح منه، فحتمًا هناك خطأ في أحد الأعمدة أو الاستلاف.',
            explainWrong: 'القاعدة العكسية تنطبق على جميع الأعداد الكلية مهما كبرت؛ وعدم التطابق ينبّهنا لوجود خطأ.',
            hints: [
              'يجب أن يتطابق المجموع مع المطروح منه دائمًا.',
              'إذا لم يتطابق، فإما أن الطرح أو الجمع التحققي فيه سهو.',
              'نستنتج وجود خطأ تجب مراجعته.'
            ],
            hasAudio: false
          }
        ];

      /* Station 15 (node 14): مسألة 11 ص 19 (لانا وريم) + أتحدث */
      case 14:
        return [
          {
            kind: 'l2_mcq',
            key: 's15_lana_reem_mcq',
            skillTag: 'سؤال 11 · أكتشف الخطأ · ص 19',
            prompt: 'جمعت لانا وريم 1,748,215 + 4,115,783. من حلّها صحيح؟ ولماذا؟',
            visual: {
              type: 'lana_reem_notebooks',
              op1: '1748215',
              op2: '4115783',
              reemAns: '5863998',
              lanaAns: '5853998'
            },
            options: [
              { label: 'لانا صحيحة (5,853,998) لأن 4 + 1 = 5', value: 'lana_right' },
              { label: 'كلاهما على صواب', value: 'both_wrong' },
              { label: 'ريم صحيحة (5,863,998)؛ لانا نسيت الحمل 1', value: 'reem_right' }
            ],
            correctValue: 'reem_right',
            explainRight: 'أبدعت! في آحاد الألوف: 8 + 5 = 13، نضع 3 ونحمل 1 إلى عشرات الألوف ليصبح 1 + 4 + 1 = 6، كما كتبت ريم (5,863,998).',
            explainWrong: 'انظر إلى آحاد الألوف: 8 + 5 = 13! يجب رفع 1 إلى منزلة عشرات الألوف (4 + 1 + 1 = 6 وليس 5).',
            hints: [
              'قارن إجابة ريم (5,863,998) بإجابة لانا (5,853,998): الاختلاف في منزلة عشرات الألوف (6 مقابل 5).',
              'في العمود السابق (آحاد الألوف) نجمع 8 + 5 = 13 (حمل 1).',
              'ريم أضافت الحمل 1 (1+4+1=6) فهي الصحيحة، أما لانا فنسيته.'
            ],
            hasAudio: true,
            audioText: 'ريم إجابتها صحيحة وهي خمسة ملايين وثمانمئة وثلاثة وستون ألفا وتسعمئة وثمانية وتسعون، لأن لانا نسيت إضافة الواحد المعاد تجميعه إلى عشرات الألوف.'
          },
          {
            kind: 'l3_vertical_op',
            key: 's15_reem_verify_op',
            skillTag: 'سؤال 11 · تأكيد الحل الصحيح',
            prompt: 'تحقق من حل ريم بتنفيذ الجمع عموديًا: 1,748,215 + 4,115,783:',
            op: 'add',
            operands: [1748215, 4115783],
            customEst: 6000000,
            customEstFormula: '2,000,000 + 4,000,000 = 6,000,000',
            reasonNote: 'الناتج الدقيق 5,863,998 يطابق دفتر ريم وهو قريب من التقدير 6,000,000.',
            explainRight: 'ممتاز! أكدت عمليًا أن إجابة ريم 5,863,998 هي الإجابة الصحيحة.',
            hints: [
              'الآحاد 5+3=8، العشرات 1+8=9، المئات 2+7=9.',
              'آحاد الألوف: 8+5=13 (ضع 3 واحمل 1).',
              'عشرات الألوف: 1+4+1=6، مئات الألوف: 7+1=8، الملايين: 1+4=5.'
            ],
            hasAudio: false
          },
          {
            kind: 'l2_mcq',
            key: 's15_talk_reflect',
            skillTag: 'أتحدث · صفحة 19',
            prompt: 'سؤال «أتحدث»: لماذا نستعمل إعادة التجميع أحيانًا عند جمع منزلتين؟',
            options: [
              { label: 'لأن مجموع الرقمين قد يبلغ 10 أو أكثر، والمنزلة الواحدة تتسع لرقم واحد فقط (0 - 9) فننقل العشرة كـ 1 للمنزلة التالية', value: 'ten_or_more' },
              { label: 'لأننا نرغب في تصغير الناتج دائمًا', value: 'smaller' },
              { label: 'نستعملها فقط عند جمع الأعداد المتساوية', value: 'equal_only' }
            ],
            correctValue: 'ten_or_more',
            explainRight: 'تلخيص علمي دقيق! كل 10 وحدات في أي منزلة تساوي 1 في المنزلة الأكبر التي تليها، وهذا سر النظام العشري.',
            explainWrong: 'فكّر: هل يمكن كتابة رقمين مثل 13 داخل خانة واحدة فقط؟ لا، لذلك ننقل 1 عشرات للمنزلة الأعلى.',
            hints: [
              'أكبر رقم يُكتب في منزلة واحدة هو 9.',
              'عندما يصبح المجموع 10 إلى 18 (أو أكثر في 3 أعداد)، يتكون من آحاد وعشرات.',
              'نكتب الآحاد ونعيد تجميع العشرات إلى المنزلة الأكبر التالية.'
            ],
            hasAudio: false
          }
        ];

      /* Station 16 (node 15): تذكرة الإتقان النهائية (8 مهارات) */
      case 15:
        return L3_MASTERY_QUESTIONS.map((q, idx) => ({
          kind: 'l2_exit_mcq',
          key: 'exit_' + q.skill,
          skill: q.skill,
          skillLabel: q.skillLabel,
          skillTag: 'مهارة ' + arNum(idx + 1) + ' من 8 · تذكرة الإتقان',
          prompt: q.prompt,
          visual: q.visual || null,
          options: q.options.map(opt => ({ label: opt, value: opt })),
          correctValue: q.correct,
          reason: q.explainRight || 'إجابة متقنة!',
          explainRight: q.explainRight || 'إجابة متقنة!',
          explainWrong: q.explainWrong || 'راجع هذه المهارة بعناية.',
          hints: [],
          hasAudio: false
        }));

      default:
        return [];
    }
  }

  /* ------------------------------------------------------------------------
     Mastery Exit Ticket (8 core skills) & Remedial Bank (2 per skill)
     ------------------------------------------------------------------------ */
  const L3_MASTERY_QUESTIONS = [
    {
      skill: 'l3_estimate_sum',
      skillLabel: 'تقدير الجمع لأعلى منزلة',
      prompt: 'ما الناتج التقديري للجمع 4,620,100 + 2,315,900 بالتقريب لأعلى منزلة؟',
      options: [
        '6,000,000',
        '7,000,000',
        '8,000,000'
      ],
      correct: '7,000,000',
      explainRight: 'صحيح! 4,620,100 يقرب إلى 5,000,000 و2,315,900 يقرب إلى 2,000,000، والمجموع 7,000,000.'
    },
    {
      skill: 'l3_estimate_diff',
      skillLabel: 'تقدير الطرح والحكم على المعقولية',
      prompt: 'ما التقدير لأعلى منزلة لعملية الطرح 9,180,400 - 3,790,200؟',
      options: [
        '4,000,000',
        '6,000,000',
        '5,000,000'
      ],
      correct: '5,000,000',
      explainRight: 'أحسنت! 9,000,000 - 4,000,000 = 5,000,000.'
    },
    {
      skill: 'l3_add_carry',
      skillLabel: 'الجمع مع إعادة التجميع',
      prompt: 'ما ناتج الجمع الدقيق للعملية: 2,456,780 + 1,735,410؟',
      options: [
        '4,192,190',
        '3,192,190',
        '4,181,190'
      ],
      correct: '4,192,190',
      explainRight: 'دقيق! المجموع 4,192,190 مع إعادة التجميع في المئات وآحاد الألوف ومئات الألوف.'
    },
    {
      skill: 'l3_sub_borrow',
      skillLabel: 'الطرح مع الاستلاف',
      prompt: 'أوجد ناتج الطرح: 7,524,690 - 2,368,140:',
      options: [
        '5,166,550',
        '5,244,550',
        '5,156,550'
      ],
      correct: '5,156,550',
      explainRight: 'ممتاز! باستلاف آحاد الألوف وعشرات الألوف يصبح الفرق 5,156,550.'
    },
    {
      skill: 'l3_sub_zeros',
      skillLabel: 'الطرح عبر الأصفار (الاستلاف المتتابع)',
      prompt: 'أوجد ناتج الطرح: 5,003,400 - 1,452,100:',
      options: [
        '4,551,300',
        '3,551,300',
        '3,651,300'
      ],
      correct: '3,551,300',
      explainRight: 'متمكن! عند الاستلاف من 5 ملايين تصبح مئات الألوف 9 وعشرات الألوف 10 ← الناتج 3,551,300.'
    },
    {
      skill: 'l3_three_addends',
      skillLabel: 'جمع ثلاثة أعداد ومراعاة المحاذاة',
      prompt: 'ما مجموع: 3,200,400 + 1,500,800 + 450,200؟',
      options: [
        '5,151,400',
        '4,151,400',
        '5,251,400'
      ],
      correct: '5,151,400',
      explainRight: 'صحيح! مع محاذاة 450,200 من اليمين يكون المجموع 5,151,400.'
    },
    {
      skill: 'l3_missing_digit',
      skillLabel: 'اكتشاف الأرقام المفقودة',
      prompt: 'في جملة الجمع العمودية: في الآحاد (7 + 4 = 11 نضع 1 ونحمل 1)، وفي العشرات (1 + [مربع] + 3 = 9). ما الرقم في [المربع]؟',
      options: [
        '4',
        '6',
        '5'
      ],
      correct: '5',
      explainRight: 'ذكي! 1 (محمول) + 3 = 4، وللوصول إلى 9 ينقصنا الرقم 5.'
    },
    {
      skill: 'l3_reason_inverse',
      skillLabel: 'التبرير العكسي واكتشاف الخطأ',
      prompt: 'تحقق خالد من الطرح 850,000 - 320,000 = 520,000 فجمع 320,000 + 520,000 = 840,000. ماذا يستنتج؟',
      options: [
        'الإجابة 520,000 صحيحة لأن الفرق صغير',
        'الإجابة 520,000 خاطئة، والصحيح 530,000',
        'لا يمكن التحقق بالجمع'
      ],
      correct: 'الإجابة 520,000 خاطئة، والصحيح 530,000',
      explainRight: 'تبرير دقيق! لأن 840,000 ≠ 850,000 فالناتج الصحيح 850,000 - 320,000 = 530,000.'
    }
  ];

  const L3_REMEDIAL_BANK = {
    l3_estimate_sum: [
      {
        q: 'قدّر ناتج الجمع لأعلى منزلة: 5,810,200 + 3,120,400:',
        options: ['10,000,000', '8,000,000', '9,000,000'],
        correct: '9,000,000'
      },
      {
        q: 'أي ناتج يُعد معقولًا لجمع عددين تقديرهما 4,000,000 + 3,000,000؟',
        options: ['718,540', '7,185,400', '70,185,400'],
        correct: '7,185,400'
      }
    ],
    l3_estimate_diff: [
      {
        q: 'قدّر ناتج الطرح لأعلى منزلة: 7,410,000 - 2,850,000:',
        options: ['4,000,000', '5,000,000', '3,000,000'],
        correct: '4,000,000'
      },
      {
        q: 'لماذا نقرّب 8,920,000 - 8,140,000 إلى أقرب مئة ألف بدلًا من الملايين أحيانًا؟',
        options: [
          'لأن التقريب للملايين مستحيل في الطرح',
          'لتجنب تقدير يساوي 0 عندما يتقارب العددان في الملايين',
          'لجعل الناتج أكبر من المطروح منه'
        ],
        correct: 'لتجنب تقدير يساوي 0 عندما يتقارب العددان في الملايين'
      }
    ],
    l3_add_carry: [
      {
        q: 'عند جمع 9 + 8 في عمود المئات، ماذا نكتب وماذا نحمل؟',
        options: [
          'نكتب 17 في المئات',
          'نكتب 1 في المئات ونحمل 7 إلى آحاد الألوف',
          'نكتب 7 في المئات ونحمل 1 إلى آحاد الألوف'
        ],
        correct: 'نكتب 7 في المئات ونحمل 1 إلى آحاد الألوف'
      },
      {
        q: 'أوجد ناتج الجمع: 1,645,200 + 2,538,100:',
        options: ['4,183,300', '3,183,300', '4,173,300'],
        correct: '4,183,300'
      }
    ],
    l3_sub_borrow: [
      {
        q: 'عند طرح 6 - 9 في منزلة المئات بعد الاستلاف من آحاد الألوف (4)، ماذا يصبح الرقمان؟',
        options: [
          'نحسب 9 - 6 = 3',
          'آحاد الألوف تصبح 5، والمئات تصبح 6',
          'آحاد الألوف تصبح 3، والمئات تصبح 16 (فنحسب 16 - 9 = 7)'
        ],
        correct: 'آحاد الألوف تصبح 3، والمئات تصبح 16 (فنحسب 16 - 9 = 7)'
      },
      {
        q: 'ما ناتج: 6,418,500 - 2,254,300؟',
        options: ['4,244,200', '4,164,200', '4,154,200'],
        correct: '4,164,200'
      }
    ],
    l3_sub_zeros: [
      {
        q: 'في 400,200 - 135,100: إذا استلفنا 1 من مئات الألوف (4) لعبور الأصفار إلى آحاد الألوف، كم يصبح رقم عشرات الألوف (0)؟',
        options: ['يصبح 9', 'يبقى 0', 'يصبح 10'],
        correct: 'يصبح 9'
      },
      {
        q: 'احسب ناتج: 2,005,000 - 1,243,000:',
        options: ['1,242,000', '762,000', '862,000'],
        correct: '762,000'
      }
    ],
    l3_three_addends: [
      {
        q: 'في عمود واحد نجمع 9 + 8 + 7 (لثلاثة أعداد). ما الرقم المكتوب وما الحمل؟',
        options: [
          'نكتب 2 ونحمل 4',
          'نكتب 4 ونحمل 1 فقط',
          'نكتب 4 ونحمل 2 إلى المنزلة التالية'
        ],
        correct: 'نكتب 4 ونحمل 2 إلى المنزلة التالية'
      },
      {
        q: 'ما ناتج: 1,200,000 + 2,300,000 + 50,000؟',
        options: ['3,550,000', '4,000,000', '8,500,000'],
        correct: '3,550,000'
      }
    ],
    l3_missing_digit: [
      {
        q: 'في الجمع العمودي: 8 + [مربع] = 15 (كتبنا 5 وحملنا 1). ما قيمة [المربع]؟',
        options: ['3', '7', '8'],
        correct: '7'
      },
      {
        q: 'إذا كان في العشرات 4 + 6 = 10 (حمل 1)، وفي المئات 1 (محمول) + 2 + [مربع] = 8، فما قيمة [المربع]؟',
        options: ['4', '6', '5'],
        correct: '5'
      }
    ],
    l3_reason_inverse: [
      {
        q: 'للتحقق من ناتج الطرح (أ - ب = جـ)، أي عبارة يجب أن تتحقق؟',
        options: ['ب + جـ = أ', 'أ + ب = جـ', 'ب - جـ = أ'],
        correct: 'ب + جـ = أ'
      },
      {
        q: 'نسي طالب إضافة الحمل 1 إلى عشرات الألوف أثناء جمع 25,800 + 16,400 فكتب 31,200. ما الإجابة الصحيحة؟',
        options: ['41,200', '42,200', '32,200'],
        correct: '42,200'
      }
    ]
  };

  function getStepCount(nodeId) {
    return buildStationSteps(Number(nodeId)).length;
  }

  function buildLesson3Session(nodeId, opts) {
    const id = Number(nodeId);
    const node = (typeof L3_NODES !== 'undefined' && L3_NODES.find(n => n.id === id)) || {
      id,
      title: 'محطة الدرس الثالث',
      kind: 'practice',
      points: 15
    };
    const isReplay = Boolean(opts && opts.replay);
    const rec = typeof getLesson3NodeRecord === 'function'
      ? (isReplay && typeof resetLesson3NodeRecordForReplay === 'function'
          ? resetLesson3NodeRecordForReplay(id)
          : getLesson3NodeRecord(id))
      : { index: 0, passed: new Set(), assistedSteps: new Set(), independentSteps: new Set(), errors: 0, data: {} };

    const steps = buildStationSteps(id).map(st => {
      if (st && st.hasAudio && st.audioText && typeof st.audioFn !== 'function') {
        return { ...st, audioFn: () => speakOperationText(st.audioText) };
      }
      return st;
    });
    const startIdx = isReplay ? 0 : Math.min(Math.max(0, Number(rec.index) || 0), Math.max(0, steps.length - 1));

    return {
      lesson: 3,
      nodeId: id,
      title: node.title,
      kind: node.kind,
      points: node.points,
      steps,
      index: startIdx,
      passed: new Set(rec.passed || []),
      assistedSteps: new Set(rec.assistedSteps || []),
      independentSteps: new Set(rec.independentSteps || []),
      errors: Number(rec.errors) || 0,
      showHearts: id !== 15
    };
  }

  function buildLesson3RemedialSession(unmasteredList, roundNum) {
    const rawList = Array.isArray(unmasteredList) && unmasteredList.length
      ? unmasteredList
      : ['l3_add_carry', 'l3_sub_zeros'];
    const skills = rawList.map(item => (typeof item === 'string' ? item : item && item.skill)).filter(Boolean);
    const steps = [];
    skills.forEach(skill => {
      const bank = L3_REMEDIAL_BANK[skill] || [];
      bank.forEach((item, i) => {
        steps.push({
          kind: 'l2_exit_mcq',
          key: 'rem_' + skill + '_' + i,
          skill,
          skillTag: 'خطة علاجية (جولة ' + arNum(roundNum || 1) + ')',
          prompt: item.q,
          options: item.options.map(opt => ({ label: opt, value: opt })),
          correctValue: item.correct,
          reason: 'ممتاز! أتقنت هذه النقطة.',
          explainRight: 'ممتاز! أتقنت هذه النقطة.',
          explainWrong: 'راجع القاعدة مجددًا ثم اختر الإجابة الصحيحة.',
          hints: ['أعد قراءة المسألة مع مراعاة الترتيب المنزلي والحمل أو الاستلاف.'],
          hasAudio: false
        });
      });
    });

    return {
      lesson: 3,
      nodeId: 15,
      title: 'تعزيز المهارات المتبقية - الدرس 3',
      kind: 'remedial',
      points: 35,
      remedial: true,
      isRemedial: true,
      remedialSkills: skills,
      remedialRound: roundNum || 1,
      remedialPassed: new Set(),
      remedialResponses: [],
      steps,
      index: 0,
      passed: new Set(),
      assistedSteps: new Set(),
      independentSteps: new Set(),
      errors: 0,
      showHearts: true
    };
  }

  global.Lesson3RunnerDefs = {
    L3_PLACE_NAMES,
    roundToHighestPlace,
    computeVerticalAdditionMeta,
    computeVerticalSubtractionMeta,
    speakOperationText,
    L3_MASTERY_QUESTIONS,
    L3_REMEDIAL_BANK,
    getStepCount,
    buildLesson3Session,
    buildLesson3RemedialSession
  };
})(window);
