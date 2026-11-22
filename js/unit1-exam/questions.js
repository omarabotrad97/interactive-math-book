/* Unit 1 End-of-Unit Interactive Exam — Questions Dataset & Pure Evaluators (pp. 26-27, Q1-Q21) */
(function (global) {
  'use strict';

  const DIGIT_AR = /[\u0660-\u0669]/g;
  const DIGIT_FA = /[\u06F0-\u06F9]/g;

  function normalizeDigits(raw) {
    if (raw === null || raw === undefined) return '';
    return String(raw)
      .replace(DIGIT_AR, (d) => String(d.charCodeAt(0) - 1632))
      .replace(DIGIT_FA, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[\u2212\u2013\u2014]/g, '-');
  }

  function parseExamInt(raw, allowNegative) {
    const cleaned = normalizeDigits(raw)
      .replace(/[\s,،._\u066C]/g, '')
      .trim();
    if (!cleaned) return null;
    const re = allowNegative ? /^[+-]?\d+$/ : /^\+?\d+$/;
    if (!re.test(cleaned)) return null;
    const val = Number(cleaned);
    return Number.isSafeInteger(val) ? val : null;
  }

  function formatExamNumber(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return String(n ?? '');
    const sign = n < 0 ? '-' : '';
    const absStr = Math.abs(Math.trunc(n)).toLocaleString('en-US');
    return sign + absStr;
  }

  function formatSignedNumber(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return String(n ?? '');
    if (n > 0) return '+' + String(Math.trunc(n));
    if (n < 0) return '-' + String(Math.abs(Math.trunc(n)));
    return '0';
  }

  const UNIT1_EXAM_SECTIONS = [
    {
      id: 0,
      key: 'objective',
      kicker: 'القسم الأول · ص 26',
      title: 'الأسئلة الموضوعية',
      rangeLabel: 'الأسئلة 1 – 10',
      sub: 'اختيار من متعدد (1–7)، مقارنة الأعداد بالرموز (8–9)، وخط الأعداد السالبة (10).',
      questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      points: 60
    },
    {
      id: 1,
      key: 'short_answer',
      kicker: 'القسم الثاني · ص 26–27',
      title: 'الأسئلة ذات الإجابة القصيرة',
      rangeLabel: 'الأسئلة 11 – 18',
      sub: 'تقدير النواتج، كتابة الصيغة القياسية، علاقة المنازل، ترتيب السكان، وجدول الثروة الحيوانية.',
      questionIds: [11, 12, 13, 14, 15, 16, 17, 18],
      points: 60
    },
    {
      id: 2,
      key: 'international',
      kicker: 'القسم الثالث · ص 27',
      title: 'التدريب على الاختبارات الدولية',
      rangeLabel: 'الأسئلة 19 – 21',
      sub: 'مسائل تفكير ومهارات قياس دولية في التقريب والمقارنة وتصحيح أخطاء الآلة الحاسبة.',
      questionIds: [19, 20, 21],
      points: 60
    }
  ];

  const UNIT1_LESSON_META = {
    1: { key: 'lesson1', num: 1, title: 'القيمة المنزلية ضمن الملايين' },
    2: { key: 'lesson2', num: 2, title: 'مقارنة الأعداد وترتيبها' },
    3: { key: 'lesson3', num: 3, title: 'جمع الأعداد الكلية وطرحها' },
    4: { key: 'lesson4', num: 4, title: 'الأعداد السالبة' },
    5: { key: 'lesson5', num: 5, title: 'خطة حل المسألة: أنشئ جدولاً' }
  };

  const UNIT1_EXAM_QUESTIONS = [
    /* ===================== Section 0: Objective (Q1 - Q10) ===================== */
    {
      id: 1,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'التحويل من الصيغة التحليلية إلى القياسية',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'العدد الذي تمثّله الصيغة التحليلية الآتية هو:',
      displayExpr: '8,000,000 + 90,000 + 400 + 7',
      options: [
        { key: 'a', label: '8,479', raw: '8479' },
        { key: 'b', label: '89,407', raw: '89407' },
        { key: 'c', label: '8,090,407', raw: '8090407' },
        { key: 'd', label: '8,009,407', raw: '8009407' }
      ],
      correctKey: 'c',
      hints: [
        'عدّ المنازل: أكبر حد هو 8,000,000، إذن العدد يتكوّن من 7 منازل.',
        'ضع كل رقم في منزلته: 8 في آحاد الملايين، 9 في عشرات الألوف، 4 في المئات، 7 في الآحاد.',
        'احفظ المنازل الفارغة (مئات الألوف، آحاد الألوف، العشرات) بالأصفار لنحصل على 8,090,407.'
      ],
      explainRight: 'صحيح! عند تجميع المنازل مع حفظ المنازل الخالية بالأصفار ينتج العدد 8,090,407.',
      explainWrong: 'تذكّر حفظ المنازل الخالية بالأصفار: مئات الألوف 0، آحاد الألوف 0، والعشرات 0؛ فيكون الناتج 8,090,407 (الخيار c).',
      numbersText: '8,000,000 + 90,000 + 400 + 7'
    },
    {
      id: 2,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'القيمة المنزلية لرقم ضمن الملايين',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'القيمة المنزلية للرقم 7 في العدد الآتي هي:',
      highlightNumber: { num: '3047002', targetIndex: 3 },
      options: [
        { key: 'a', label: '700', raw: '700' },
        { key: 'b', label: '7,000', raw: '7000' },
        { key: 'c', label: '7', raw: '7' },
        { key: 'd', label: '70,000', raw: '70000' }
      ],
      correctKey: 'b',
      hints: [
        'قسّم العدد 3,047,002 إلى دورات ثلاثية من اليمين: 002 | 047 | 3.',
        'يقع الرقم 7 في منزلة آحاد الألوف، وعن يمينه ثلاث منازل.',
        'نستبدل كل منزلة عن يمين الرقم 7 بصفر، فتصبح القيمة 7,000.'
      ],
      explainRight: 'أحسنت! يقع الرقم 7 في منزلة آحاد الألوف (عن يمينه 3 منازل)، لذا فقيمته المنزلية 7,000.',
      explainWrong: 'الرقم 7 في 3,047,002 يقع في منزلة آحاد الألوف وعن يمينه 3 منازل، فتكون قيمته 7,000 (الخيار b).',
      numbersText: '3,047,002 (الرقم 7)'
    },
    {
      id: 3,
      sectionId: 0,
      page: 26,
      lessonRef: 3,
      skillLabel: 'تقدير ناتج الجمع ضمن الملايين',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'أفضل تقدير لناتج الجمع الآتي هو:',
      displayExpr: '1,580,044 + 692,312',
      options: [
        { key: 'a', label: '2,000,000', raw: '2000000' },
        { key: 'b', label: '2,300,000', raw: '2300000' },
        { key: 'c', label: '3,000,000', raw: '3000000' },
        { key: 'd', label: '2,700,000', raw: '2700000' }
      ],
      correctKey: 'b',
      hints: [
        'العدد الأصغر 692,312 أعلى منزلة فيه هي مئات الألوف؛ لذا فإن تقريب العددين إلى أقرب مئة ألف يعطي أفضل تقدير.',
        'قرّب 1,580,044 إلى أقرب مئة ألف فيصبح 1,600,000، وقرّب 692,312 فيصبح 700,000.',
        'اجمع العددين المقرّبين: 1,600,000 + 700,000 = 2,300,000.'
      ],
      explainRight: 'ممتاز! بالتقريب لأقرب مئة ألف: 1,600,000 + 700,000 = 2,300,000، وهو أفضل تقدير لأنه الأقرب للناتج الدقيق 2,272,356 (بينما 2,700,000 أبعد بكثير).',
      explainWrong: 'للحصول على أفضل تقدير نقرّب العددين إلى أقرب مئة ألف: 1,580,044 ≈ 1,600,000 و 692,312 ≈ 700,000، والمجموع 2,300,000 (الخيار b)، وهو الأقرب للناتج الدقيق 2,272,356.',
      numbersText: '1,580,044 + 692,312'
    },
    {
      id: 4,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'تكوين العدد من منازله',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'العدد 2 آحاد + 3 مئات + 5 آلاف + 6 ملايين، يساوي:',
      options: [
        { key: 'a', label: '6,532', raw: '6532' },
        { key: 'b', label: '65,302', raw: '65302' },
        { key: 'c', label: '65,032', raw: '65032' },
        { key: 'd', label: '6,005,302', raw: '6005302' }
      ],
      correctKey: 'd',
      hints: [
        'انتبه لترتيب المنازل المذكورة: 6 ملايين تعني أن العدد في منزلة الملايين (7 منازل).',
        'المنازل الموجودة: 6 في آحاد الملايين، 5 في آحاد الألوف، 3 في المئات، و2 في الآحاد.',
        'ضع 0 في المنازل غير المذكورة (مئات الألوف، عشرات الألوف، والعشرات) لتجد 6,005,302.'
      ],
      explainRight: 'رائع! 6,000,000 + 5,000 + 300 + 2 = 6,005,302.',
      explainWrong: 'وجود «6 ملايين» يعني 7 منازل: نضع 0 في مئات الألوف وعشرات الألوف والعشرات، فيصبح العدد 6,005,302 (الخيار d).',
      numbersText: '2 آحاد + 3 مئات + 5 آلاف + 6 ملايين'
    },
    {
      id: 5,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'تمييز اسم المنزلة في العدد',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'الرقم الذي يقع في منزلة مئات الألوف في العدد الآتي هو:',
      displayExpr: '2,345,678',
      options: [
        { key: 'a', label: '2', raw: '2' },
        { key: 'b', label: '3', raw: '3' },
        { key: 'c', label: '4', raw: '4' },
        { key: 'd', label: '6', raw: '6' }
      ],
      correctKey: 'b',
      hints: [
        'قسّم العدد من اليمين إلى دورات ثلاثية: الآحاد (678)، الألوف (345)، الملايين (2).',
        'انظر إلى دورة الألوف (345): 5 آحاد الألوف، 4 عشرات الألوف، والرقم الأيسر فيها هو مئات الألوف.',
        'الرقم في منزلة مئات الألوف هو 3.'
      ],
      explainRight: 'صحيح! في دورة الألوف (345) يقع الرقم 3 في منزلة مئات الألوف.',
      explainWrong: 'بعد تقسيم 2,345,678 إلى دورات نجد أن 2 في آحاد الملايين، و3 في مئات الألوف (الخيار b).',
      numbersText: '2,345,678'
    },
    {
      id: 6,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'التحويل من الصيغة اللفظية إلى القياسية',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'الصيغة القياسية للعدد: «ثمانية ملايين ومئة ألف وسبعة» هي:',
      options: [
        { key: 'a', label: '8,000,010,007', raw: '8000010007' },
        { key: 'b', label: '81,000,007', raw: '81000007' },
        { key: 'c', label: '8,100,007', raw: '8100007' },
        { key: 'd', label: '8,170,000', raw: '8170000' }
      ],
      correctKey: 'c',
      hints: [
        'وزّع الكلمات على ثلاث دورات: دورة الملايين (8)، دورة الألوف (100)، دورة الآحاد (007).',
        'تأكّد أن كل دورة (الألوف والآحاد) تتكوّن من 3 خانات بالضبط.',
        'دمج الدورات يعطي: 8,100,007.'
      ],
      explainRight: 'أحسنت! دورة الملايين 8، ودورة الألوف 100، ودورة الآحاد 007، فيُكتب العدد 8,100,007.',
      explainWrong: 'ثمانية ملايين (8) ومئة ألف (100) وسبعة (007) تُكتب بالصيغة القياسية 8,100,007 (الخيار c).',
      numbersText: 'ثمانية ملايين ومئة ألف وسبعة'
    },
    {
      id: 7,
      sectionId: 0,
      page: 26,
      lessonRef: 1,
      skillLabel: 'كتابة الصيغة التحليلية للعدد',
      type: 'mcq',
      optionLayout: 'stack',
      groupLabel: 'أختار الإجابة الصحيحة:',
      prompt: 'الصيغة التحليلية للعدد الآتي هي:',
      displayExpr: '6,058,000',
      options: [
        { key: 'a', label: '60 + 50 + 8', raw: '60+50+8' },
        { key: 'b', label: '600,000 + 50,000 + 8,000', raw: '600000+50000+8000' },
        { key: 'c', label: '6,000,000 + 50,000 + 8,000', raw: '6000000+50000+8000' },
        { key: 'd', label: '8,000 + 500 + 6', raw: '8000+500+6' }
      ],
      correctKey: 'c',
      hints: [
        'العدد 6,058,000 يتكوّن من 7 منازل؛ لذا الرقم 6 يقع في آحاد الملايين.',
        'قيمة 6 هي 6,000,000، وقيمة 5 هي 50,000، وقيمة 8 هي 8,000.',
        'الصيغة التحليلية هي مجموع القيم المنزلية للأرقام غير الصفرية: 6,000,000 + 50,000 + 8,000.'
      ],
      explainRight: 'ممتاز! 6 في الملايين (6,000,000) + 5 في عشرات الألوف (50,000) + 8 في آحاد الألوف (8,000).',
      explainWrong: 'الرقم 6 في 6,058,000 عن يمينه 6 منازل فقيمته 6,000,000، لذا فالصيغة التحليلية الصحيحة هي 6,000,000 + 50,000 + 8,000 (الخيار c).',
      numbersText: '6,058,000'
    },
    {
      id: 8,
      sectionId: 0,
      page: 26,
      lessonRef: 2,
      skillLabel: 'مقارنة عددين مختلفين في عدد المنازل',
      type: 'symbol_compare',
      groupLabel: 'أقارن بين العددين:',
      prompt: 'اختر الرمز المناسب للمقارنة بين العددين:',
      leftNum: 932157,
      rightNum: 3402018,
      correctSymbol: '<',
      labHint: 'compare',
      hints: [
        'ابدأ دائماً بعدّ منازل كل عدد قبل مقارنة الأرقام.',
        'العدد 932,157 يتكوّن من 6 منازل، بينما العدد 3,402,018 يتكوّن من 7 منازل.',
        'العدد ذو المنازل الأكثر هو الأكبر، إذن 932,157 < 3,402,018.'
      ],
      explainRight: 'أحسنت! 932,157 يتكوّن من 6 منازل فقط، بينما 3,402,018 يتكوّن من 7 منازل؛ إذن 932,157 < 3,402,018.',
      explainWrong: 'عدّ المنازل أولاً: للعدد 932,157 ست منازل وللعدد 3,402,018 سبع منازل، لذا 932,157 < 3,402,018.',
      numbersText: '932,157 و 3,402,018'
    },
    {
      id: 9,
      sectionId: 0,
      page: 26,
      lessonRef: 2,
      skillLabel: 'مقارنة عددين متساويين في عدد المنازل',
      type: 'symbol_compare',
      groupLabel: 'أقارن بين العددين:',
      prompt: 'اختر الرمز المناسب للمقارنة بين العددين:',
      leftNum: 4263751,
      rightNum: 4208753,
      correctSymbol: '>',
      labHint: 'compare',
      hints: [
        'كلا العددين يتكوّن من 7 منازل؛ لذا نبدأ المقارنة من أقصى اليسار.',
        'آحاد الملايين (4 = 4) ومئات الألوف (2 = 2) متساويتان؛ انتقل إلى عشرات الألوف.',
        'في عشرات الألوف: 6 > 0، إذن 4,263,751 > 4,208,753.'
      ],
      explainRight: 'رائع! تساوت المنازل حتى مئات الألوف، ثم في عشرات الألوف 6 > 0، لذا 4,263,751 > 4,208,753.',
      explainWrong: 'عند المقارنة من اليسار: 4 = 4 ثم 2 = 2 ثم في عشرات الألوف 6 > 0، فتكون الإشارة الصحيحة 4,263,751 > 4,208,753.',
      numbersText: '4,263,751 و 4,208,753'
    },
    {
      id: 10,
      sectionId: 0,
      page: 26,
      lessonRef: 4,
      skillLabel: 'تمثيل الأعداد السالبة على خط الأعداد',
      type: 'number_line_fill',
      groupLabel: 'خط الأعداد والأعداد السالبة:',
      prompt: 'أكتب العدد المناسب في المربع الفارغ على خط الأعداد:',
      min: -5,
      max: 5,
      missingVal: -5,
      quickPicks: [-6, -5, -4, 5],
      labHint: 'negative',
      hints: [
        'انظر إلى اتجاه الترقيم يسار الصفر: -1، -2، -3، -4...',
        'كلما تحرّكنا خطوة واحدة نحو اليسار على خط الأعداد ننقص 1.',
        'العدد الذي يلي -4 مباشرة إلى اليسار هو -5.'
      ],
      explainRight: 'ممتاز! على خط الأعداد نعدّ يسار الصفر: -1، -2، -3، -4، ثم -5.',
      explainWrong: 'يسار الصفر تتزايد القيمة العددية مع الإشارة السالبة خطوة بخطوة: -1، -2، -3، -4، فالعدد المفقود هو -5.',
      numbersText: '[ ] , -4 , -3 , -2 , -1 , 0 , +1 , +2 , +3 , +4 , +5'
    },

    /* ===================== Section 1: Short Answer (Q11 - Q18) ===================== */
    {
      id: 11,
      sectionId: 1,
      page: 26,
      lessonRef: 3,
      skillLabel: 'تقدير ناتج الجمع ضمن الملايين',
      type: 'num_input',
      groupLabel: 'أسئلة ذات إجابة قصيرة · أقدّر الناتج:',
      prompt: 'أقدّر ناتج الجمع الآتي واكتبه بالأرقام:',
      displayExpr: '3,124,560 + 2,729,801',
      placeholder: '0,000,000',
      acceptedValues: [6000000, 5800000],
      primaryAnswer: 6000000,
      labHint: 'operations',
      hints: [
        'قرّب كل عدد إلى أعلى منزلة فيه (أقرب مليون) أو إلى أقرب مئة ألف.',
        'لأقرب مليون: 3,124,560 ≈ 3,000,000 و 2,729,801 ≈ 3,000,000.',
        'اجمع العددين المقرّبين: 3,000,000 + 3,000,000 = 6,000,000 (ولأقرب مئة ألف: 3,100,000 + 2,700,000 = 5,800,000).'
      ],
      explainByValue: {
        6000000: 'أحسنت! بالتقريب لأعلى منزلة (أقرب مليون): 3,000,000 + 3,000,000 = 6,000,000 (وبالتقريب الأدق لأقرب مئة ألف: 5,800,000، وكلاهما تقدير صحيح).',
        5800000: 'رائع جداً! استخدمت التقريب الأدق لأقرب مئة ألف: 3,100,000 + 2,700,000 = 5,800,000 (وبالتقريب لأقرب مليون يكون التقدير 6,000,000، وكلاهما مقبول).'
      },
      explainRight: 'أحسنت! التقدير الصحيح هو 6,000,000 (لأقرب مليون) أو 5,800,000 (لأقرب مئة ألف).',
      explainWrong: 'لأقرب مليون: 3,124,560 ≈ 3,000,000 و 2,729,801 ≈ 3,000,000 فيكون التقدير 6,000,000 (كما يُقبل التقدير الأدق لأقرب مئة ألف 5,800,000).',
      numbersText: '3,124,560 + 2,729,801'
    },
    {
      id: 12,
      sectionId: 1,
      page: 26,
      lessonRef: 3,
      skillLabel: 'تقدير ناتج الطرح ضمن الملايين',
      type: 'num_input',
      groupLabel: 'أسئلة ذات إجابة قصيرة · أقدّر الناتج:',
      prompt: 'أقدّر ناتج الطرح الآتي واكتبه بالأرقام:',
      displayExpr: '7,320,250 − 4,270,016',
      placeholder: '0,000,000',
      acceptedValues: [3000000],
      primaryAnswer: 3000000,
      labHint: 'operations',
      hints: [
        'قرّب كل عدد إلى أعلى منزلة (أقرب مليون): انظر إلى رقم مئات الألوف في كل عدد.',
        '7,320,250 يُقرّب إلى 7,000,000 (لأن 3 < 5)، و4,270,016 يُقرّب إلى 4,000,000 (لأن 2 < 5).',
        'اطرح العددين المقرّبين: 7,000,000 − 4,000,000 = 3,000,000.'
      ],
      explainRight: 'ممتاز! 7,000,000 − 4,000,000 = 3,000,000 (وحتى بالتقريب لأقرب مئة ألف: 7,300,000 − 4,300,000 = 3,000,000).',
      explainWrong: 'قرّب العددين لأعلى منزلة: 7,320,250 ≈ 7,000,000 و4,270,016 ≈ 4,000,000، ثم اطرح: 7,000,000 − 4,000,000 = 3,000,000.',
      numbersText: '7,320,250 − 4,270,016'
    },
    {
      id: 13,
      sectionId: 1,
      page: 27,
      lessonRef: 1,
      skillLabel: 'كتابة العدد بالصيغة القياسية',
      type: 'num_input',
      groupLabel: 'أكتب الأعداد بالصيغة القياسية:',
      prompt: 'اكتب العدد الآتي بالصيغة القياسية (بالأرقام):',
      verbalQuote: 'مليونٌ وستمئةُ ألفٍ ومئتانِ وخمسةٌ.',
      placeholder: '0,000,000',
      acceptedValues: [1600205],
      primaryAnswer: 1600205,
      placeHelper: true,
      hints: [
        'قسّم العدد إلى ثلاث دورات: دورة الملايين، دورة الألوف، ودورة الآحاد.',
        'الملايين: 1 | الألوف: 600 | الآحاد: 205.',
        'بدمج الدورات الثلاث ينتج العدد 1,600,205.'
      ],
      explainRight: 'صحيح! مليون (1) وستمئة ألف (600) ومئتان وخمسة (205) = 1,600,205.',
      explainWrong: 'رتّب كل دورة من 3 منازل: الملايين 1، والألوف 600، والآحاد 205؛ فتكون الصيغة القياسية 1,600,205.',
      numbersText: 'مليون وستمئة ألف ومئتان وخمسة'
    },
    {
      id: 14,
      sectionId: 1,
      page: 27,
      lessonRef: 1,
      skillLabel: 'كتابة العدد بالصيغة القياسية مع حفظ المنازل بالأصفار',
      type: 'num_input',
      groupLabel: 'أكتب الأعداد بالصيغة القياسية:',
      prompt: 'اكتب العدد الآتي بالصيغة القياسية (بالأرقام):',
      verbalQuote: 'ثلاثةُ ملايينَ وثمانمئةٍ وواحدٌ.',
      placeholder: '0,000,000',
      acceptedValues: [3000801],
      primaryAnswer: 3000801,
      placeHelper: true,
      hints: [
        'انتبه: هل ذُكرت دورة الألوف في الجملة؟ لم تُذكر، إذن نحفظ منازلها الثلاث بالأصفار (000).',
        'الملايين: 3 | الألوف: 000 | الآحاد: 801 (حيث العشرات 0).',
        'الصيغة القياسية للعدد هي 3,000,801.'
      ],
      explainRight: 'أحسنت! حفظت دورة الألوف بـ 000 والعشرات بـ 0، فكان العدد الصحيح 3,000,801.',
      explainWrong: 'لأن دورة الألوف غير مذكورة نضع مكانها 000، وثمانمئة وواحد هي 801، فتصبح الصيغة القياسية 3,000,801.',
      numbersText: 'ثلاثة ملايين وثمانمئة وواحد'
    },
    {
      id: 15,
      sectionId: 1,
      page: 27,
      lessonRef: 1,
      skillLabel: 'العلاقة بين قيمتي الرقم نفسه في منزلتين',
      type: 'digit_relation_8',
      groupLabel: 'تحليل القيمة المنزلية:',
      prompt: 'ما العلاقة بين رقمي 8 في العدد 6,843,281؟ حدّد قيمة كل رقم ثم اكتبهما على صورة ضرب أو قسمة.',
      numberStr: '6843281',
      highIndex: 1, // 8 in hundred thousands -> 800,000
      lowIndex: 5,  // 8 in tens -> 80
      highValue: 800000,
      lowValue: 80,
      factor: 10000,
      highChoices: [80000, 800000, 8000000],
      lowChoices: [8, 80, 800],
      factorChoices: [100, 1000, 10000, 100000],
      hints: [
        'الرقم 8 الأول من اليسار في مئات الألوف (قيمته 800,000)، والرقم 8 الثاني في العشرات (قيمته 80).',
        'عدّ الفارق في عدد المنازل (أو الأصفار) بين 800,000 و80: توجد 4 منازل، أي عامل قدره 10,000.',
        'يمكن كتابة العلاقة بالضرب: 800,000 = 80 × 10,000، أو بالقسمة: 80 = 800,000 ÷ 10,000.'
      ],
      explainRight: 'إتقان رائع! قيمة 8 في مئات الألوف هي 800,000، وفي العشرات هي 80؛ وتساوي القيمة الكبرى 10,000 مثل القيمة الصغرى (800,000 = 80 × 10,000 أو 80 = 800,000 ÷ 10,000).',
      explainWrong: 'الرقمان هما 800,000 (مئات الألوف) و80 (العشرات). الفارق بينهما 4 منازل أي 10,000؛ لذا نكتب: 800,000 = 80 × 10,000 أو 80 = 800,000 ÷ 10,000.',
      numbersText: '6,843,281 (رقما 8: 800,000 و 80)'
    },
    {
      id: 16,
      sectionId: 1,
      page: 27,
      lessonRef: 2,
      secondaryLessonRef: 5,
      skillLabel: 'قراءة جدول بيانات وترتيب الأعداد تنازلياً',
      type: 'order_cities',
      groupLabel: 'سكان · قراءة الجدول والترتيب التنازلي:',
      prompt: 'في الجدول الآتي أعداد سكان 3 محافظات: عمّان وإربد والزرقاء. أرتّب هذه المدن حسب عدد السكان تنازلياً (من الأكبر إلى الأصغر):',
      tableRows: [
        { id: 'amman', city: 'عمّان', pop: 4440978 },
        { id: 'irbid', city: 'إربد', pop: 1957000 },
        { id: 'zarqa', city: 'الزرقاء', pop: 1498722 }
      ],
      initialOrder: ['irbid', 'zarqa', 'amman'],
      correctOrder: ['amman', 'irbid', 'zarqa'],
      labHint: 'compare',
      hints: [
        'الترتيب التنازلي يبدأ من المحافظة ذات عدد السكان الأكبر إلى الأصغر.',
        'جميع الأعداد من 7 منازل؛ قارن منزلة الملايين أولاً (4 أكبر من 1)، إذن عمّان أولاً.',
        'للمقارنة بين إربد (1,957,000) والزرقاء (1,498,722): في مئات الألوف 9 > 4، إذن إربد ثم الزرقاء.'
      ],
      explainRight: 'أحسنت! الترتيب التنازلي الصحيح هو: عمّان (4,440,978) ← إربد (1,957,000) ← الزرقاء (1,498,722).',
      explainWrong: 'في الترتيب التنازلي نبدأ بالأكبر: عمّان (4,440,978) أولاً، ثم إربد (1,957,000) لأن 9 > 4 في مئات الألوف، ثم الزرقاء (1,498,722).',
      numbersText: 'عمّان 4,440,978 | إربد 1,957,000 | الزرقاء 1,498,722'
    },
    {
      id: 17,
      sectionId: 1,
      page: 27,
      lessonRef: 3,
      secondaryLessonRef: 5,
      skillLabel: 'تحليل جدول بيانات وجمع ومقارنة المجاميع',
      type: 'livestock_table',
      groupLabel: 'الثروة الحيوانية · جدول بيانات عام 2017:',
      prompt: 'قدّرت دائرة الإحصاءات العامة أعداد الضأن والماعز والأبقار في شهرين من عام 2017. احسب مجموع كل شهر ثم قارن بين مجموع الثروة الحيوانية في الشهرين:',
      columns: ['ضأن', 'ماعز', 'أبقار'],
      rows: [
        { key: 'april', label: 'نيسان', values: [3057950, 770770, 72640], expectedSum: 3901360 },
        { key: 'november', label: 'تشرين الثاني', values: [3063120, 772670, 75500], expectedSum: 3911290 }
      ],
      expectedSymbol: '<', // aprilSum (3,901,360) < novemberSum (3,911,290)
      diffAmount: 9930,
      labHint: 'operations',
      hints: [
        'اجمع أعداد شهر نيسان الثلاثة مع محاذاة المنازل من اليمين: 3,057,950 + 770,770 + 72,640.',
        'مجموع نيسان هو 3,901,360، ومجموع تشرين الثاني هو 3,063,120 + 772,670 + 75,500 = 3,911,290.',
        'قارن بين 3,901,360 و 3,911,290: في عشرات الألوف 0 < 1، إذن نيسان < تشرين الثاني (تشرين الثاني أكبر بفارق 9,930).'
      ],
      explainRight: 'عمل متكامل ورائع! مجموع نيسان 3,901,360 ومجموع تشرين الثاني 3,911,290، إذن 3,901,360 < 3,911,290 (ثروة تشرين الثاني أكبر بمقدار 9,930 رأساً).',
      explainWrong: 'مجموع نيسان = 3,057,950 + 770,770 + 72,640 = 3,901,360، ومجموع تشرين الثاني = 3,063,120 + 772,670 + 75,500 = 3,911,290؛ وبالتالي مجموع نيسان < مجموع تشرين الثاني.',
      numbersText: 'نيسان: 3,057,950 + 770,770 + 72,640 | تشرين الثاني: 3,063,120 + 772,670 + 75,500'
    },
    {
      id: 18,
      sectionId: 1,
      page: 27,
      lessonRef: 3,
      secondaryLessonRef: 1,
      skillLabel: 'إيجاد العدد المفقود في جملة الجمع باستخدام القيمة المنزلية',
      type: 'num_input',
      groupLabel: 'الجملة المفتوحة والقيمة المنزلية:',
      prompt: 'أكتب العدد المناسب في المربع الفارغ لتصبح الجملة صحيحة:',
      displayExpr: '3,365,484 = [ ؟ ] + 3,265,484',
      placeholder: '000,000',
      acceptedValues: [100000],
      primaryAnswer: 100000,
      placeHelper: true,
      hints: [
        'قارن بين منازل العدد 3,265,484 والعدد 3,365,484 منزلة بمنزلة.',
        'جميع المنازل متطابقة ما عدا منزلة مئات الألوف: زادت من 2 إلى 3 بمقدار 1 في مئات الألوف.',
        '1 في منزلة مئات الألوف يساوي 100,000.'
      ],
      explainRight: 'ذكي جداً! تغيّرت منزلة مئات الألوف فقط من 2 إلى 3، إذن العدد المفقود هو 100,000.',
      explainWrong: 'بطرح 3,365,484 − 3,265,484 (أو بملاحظة تغيّر منزلة مئات الألوف من 2 إلى 3) نجد أن العدد المفقود هو 100,000.',
      numbersText: '3,365,484 = [ ] + 3,265,484'
    },

    /* ===================== Section 2: International Tests (Q19 - Q21) ===================== */
    {
      id: 19,
      sectionId: 2,
      page: 27,
      lessonRef: 3,
      skillLabel: 'التقريب إلى أقرب مليون (اختبارات دولية)',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'تدريب على الاختبارات الدولية:',
      prompt: 'العدد الذي يُقرّب إلى 7,000,000 عند التقريب إلى أقرب مليون هو:',
      options: [
        { key: 'a', label: '6,231,010', raw: '6231010' },
        { key: 'b', label: '1,700,000', raw: '1700000' },
        { key: 'c', label: '6,099,931', raw: '6099931' },
        { key: 'd', label: '6,800,412', raw: '6800412' }
      ],
      correctKey: 'd',
      hints: [
        'للتقريب إلى أقرب مليون، ننظر إلى الرقم الواقع في منزلة مئات الألوف (عن يمين الملايين مباشرة).',
        'إذا كان رقم مئات الألوف 5 فأكثر نزيد منزلة الملايين 1؛ وإذا كان أقل من 5 تبقى كما هي.',
        'في 6,800,412 رقم مئات الألوف هو 8 (أكبر من 5)، فيُقرّب 6 إلى 7 ويصبح 7,000,000.'
      ],
      explainRight: 'أحسنت! في العدد 6,800,412 الرقم في مئات الألوف هو 8 (≥ 5)، فيُقرّب إلى 7,000,000.',
      explainWrong: 'العدد 6,231,010 و6,099,931 يُقرّبان إلى 6,000,000، و1,700,000 يُقرّب إلى 2,000,000؛ أما 6,800,412 فيُقرّب إلى 7,000,000 (الخيار d).',
      numbersText: 'التقريب إلى أقرب مليون = 7,000,000'
    },
    {
      id: 20,
      sectionId: 2,
      page: 27,
      lessonRef: 2,
      skillLabel: 'الحكم على صحة عبارات المقارنة (اختبارات دولية)',
      type: 'mcq',
      optionLayout: 'stack',
      groupLabel: 'تدريب على الاختبارات الدولية:',
      prompt: 'إحدى العبارات الآتية صحيحة:',
      options: [
        { key: 'a', label: '5,680,000 < 6,580,000', raw: '5680000<6580000', isEquation: true },
        { key: 'b', label: '5,680,000 > 6,850,000', raw: '5680000>6850000', isEquation: true },
        { key: 'c', label: '8,650,000 < 6,580,000', raw: '8650000<6580000', isEquation: true },
        { key: 'd', label: '5,680,000 = 6,850,000', raw: '5680000=6850000', isEquation: true }
      ],
      correctKey: 'a',
      hints: [
        'جميع الأعداد في العبارات الأربع تتكوّن من 7 منازل؛ قارن رقم الملايين (أقصى اليسار) في كل عبارة.',
        'تذكّر أن فتحة الإشارة (< أو >) تتجه دائماً نحو العدد الأكبر.',
        'في العبارة (a): 5 ملايين أصغر من 6 ملايين، أي 5,680,000 < 6,580,000 وهي عبارة صحيحة.'
      ],
      explainRight: 'ممتاز! 5 < 6 في منزلة الملايين، لذا فالعبارة 5,680,000 < 6,580,000 هي الوحيدة الصحيحة.',
      explainWrong: 'بمقارنة منزلة الملايين: 5 أصغر من 6، لذا فالعبارة الصحيحة هي 5,680,000 < 6,580,000 (الخيار a).',
      numbersText: '5,680,000 و 6,580,000 و 6,850,000 و 8,650,000'
    },
    {
      id: 21,
      sectionId: 2,
      page: 27,
      lessonRef: 3,
      secondaryLessonRef: 1,
      skillLabel: 'تصحيح خطأ إدخال الآلة الحاسبة (اختبارات دولية)',
      type: 'mcq',
      optionLayout: 'grid2',
      groupLabel: 'تدريب على الاختبارات الدولية:',
      prompt: 'أرادت سلمى استعمال الآلة الحاسبة لجمع 3,420,000 و 1,572,001، فأدخلت 1,472,001 + 3,420,000؛ لتصحيح الخطأ فإنها:',
      compareBadges: [
        { label: 'المطلوب', val: '1,572,001' },
        { label: 'المُدخل', val: '1,472,001' }
      ],
      options: [
        { key: 'a', label: 'تجمع 1', raw: '+1' },
        { key: 'b', label: 'تجمع 100,000', raw: '+100000' },
        { key: 'c', label: 'تطرح 1', raw: '-1' },
        { key: 'd', label: 'تطرح 100,000', raw: '-100000' }
      ],
      correctKey: 'b',
      hints: [
        'قارن العدد المطلوب 1,572,001 بالعدد الذي أدخلته سلمى 1,472,001.',
        'الرقم 4 أقل من 5 بمقدار 1 في منزلة مئات الألوف؛ أي أن الناتج نقص بمقدار 100,000.',
        'لتعويض النقص البالغ 100,000 يجب أن تجمع 100,000.'
      ],
      explainRight: 'تحليل ممتاز! أدخلت سلمى 4 بدل 5 في مئات الألوف فقلّ المجموع بمقدار 100,000، ولتصحيح الخطأ تجمع 100,000.',
      explainWrong: 'الفرق بين 1,572,001 و1,472,001 هو 100,000 بالنقصان، لذا لتصحيح الخطأ فإنها تجمع 100,000 (الخيار b).',
      numbersText: '3,420,000 + 1,572,001 مقابل 3,420,000 + 1,472,001'
    }
  ];

  function getQuestionById(id) {
    return UNIT1_EXAM_QUESTIONS.find((q) => q.id === Number(id)) || null;
  }

  function getSectionQuestions(sectionId) {
    const sec = UNIT1_EXAM_SECTIONS.find((s) => s.id === Number(sectionId));
    if (!sec) return [];
    return sec.questionIds.map((id) => getQuestionById(id)).filter(Boolean);
  }

  function evaluateUnit1ExamQuestion(q, answer) {
    if (!q) {
      return { isAnswered: false, isCorrect: false, partial: false, feedback: '', userSummary: 'لم يُجب', correctSummary: '' };
    }

    if (q.type === 'mcq') {
      const pickedKey = answer && typeof answer === 'object' ? answer.key : (typeof answer === 'string' ? answer : '');
      const pickedOpt = q.options.find((o) => o.key === pickedKey);
      const correctOpt = q.options.find((o) => o.key === q.correctKey);
      if (!pickedOpt) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: false,
          feedback: 'اختر إجابة أولاً.',
          userSummary: 'لم يُجب',
          correctSummary: correctOpt ? (correctOpt.key + ') ' + correctOpt.label) : ''
        };
      }
      const ok = pickedOpt.key === q.correctKey;
      return {
        isAnswered: true,
        isCorrect: ok,
        partial: false,
        feedback: ok ? q.explainRight : q.explainWrong,
        userSummary: pickedOpt.key + ') ' + pickedOpt.label,
        correctSummary: correctOpt ? (correctOpt.key + ') ' + correctOpt.label) : ''
      };
    }

    if (q.type === 'symbol_compare') {
      const sym = answer && typeof answer === 'object' ? answer.symbol : (typeof answer === 'string' ? answer : '');
      const exprCorrect = formatExamNumber(q.leftNum) + ' ' + q.correctSymbol + ' ' + formatExamNumber(q.rightNum);
      if (!sym || !['<', '>', '='].includes(sym)) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: false,
          feedback: 'اختر أحد الرموز (< أو > أو =).',
          userSummary: 'لم يُجب',
          correctSummary: exprCorrect
        };
      }
      const ok = sym === q.correctSymbol;
      return {
        isAnswered: true,
        isCorrect: ok,
        partial: false,
        feedback: ok ? q.explainRight : q.explainWrong,
        userSummary: formatExamNumber(q.leftNum) + ' ' + sym + ' ' + formatExamNumber(q.rightNum),
        correctSummary: exprCorrect
      };
    }

    if (q.type === 'number_line_fill') {
      const rawVal = answer && typeof answer === 'object' ? answer.raw : (answer !== undefined && answer !== null ? String(answer) : '');
      const parsed = parseExamInt(rawVal, true);
      if (parsed === null) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: false,
          feedback: 'أدخل العدد المناسب (مع إشارة السالب) في المربع الفارغ.',
          userSummary: 'لم يُجب',
          correctSummary: formatSignedNumber(q.missingVal)
        };
      }
      const ok = parsed === q.missingVal;
      return {
        isAnswered: true,
        isCorrect: ok,
        partial: false,
        feedback: ok ? q.explainRight : q.explainWrong,
        userSummary: formatSignedNumber(parsed),
        correctSummary: formatSignedNumber(q.missingVal)
      };
    }

    if (q.type === 'num_input') {
      const rawVal = answer && typeof answer === 'object' ? answer.raw : (answer !== undefined && answer !== null ? String(answer) : '');
      const parsed = parseExamInt(rawVal, false);
      const correctDisplay = q.acceptedValues.length > 1
        ? q.acceptedValues.map(formatExamNumber).join(' أو ')
        : formatExamNumber(q.primaryAnswer);
      if (parsed === null) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: false,
          feedback: 'اكتب العدد بالأرقام أولاً.',
          userSummary: 'لم يُجب',
          correctSummary: correctDisplay
        };
      }
      const ok = q.acceptedValues.includes(parsed);
      const specificExplain = ok && q.explainByValue && q.explainByValue[parsed]
        ? q.explainByValue[parsed]
        : (ok ? q.explainRight : q.explainWrong);
      return {
        isAnswered: true,
        isCorrect: ok,
        partial: false,
        feedback: specificExplain,
        userSummary: formatExamNumber(parsed),
        correctSummary: correctDisplay
      };
    }

    if (q.type === 'digit_relation_8') {
      const a = answer && typeof answer === 'object' ? answer : {};
      const highVal = parseExamInt(a.highVal, false);
      const lowVal = parseExamInt(a.lowVal, false);
      const op = a.op === 'mul' || a.op === 'div' ? a.op : '';
      const factorVal = parseExamInt(a.factor, false);
      const correctSummary = '800,000 و 80 | 800,000 = 80 × 10,000 أو 80 = 800,000 ÷ 10,000';

      if (highVal === null || lowVal === null || !op || factorVal === null) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: Boolean(highVal !== null || lowVal !== null || op || factorVal !== null),
          feedback: 'أكمل الخطوتين: اختر قيمتي الرقمين 8، ثم أكمل جملة الضرب أو القسمة.',
          userSummary: 'إجابة غير مكتملة',
          correctSummary
        };
      }

      const valuesOk = highVal === q.highValue && lowVal === q.lowValue;
      const eqOk = factorVal === q.factor && (op === 'mul' || op === 'div');
      const ok = valuesOk && eqOk;
      const eqText = op === 'mul'
        ? (formatExamNumber(highVal) + ' = ' + formatExamNumber(lowVal) + ' × ' + formatExamNumber(factorVal))
        : (formatExamNumber(lowVal) + ' = ' + formatExamNumber(highVal) + ' ÷ ' + formatExamNumber(factorVal));

      let feedback = ok ? q.explainRight : q.explainWrong;
      if (!ok && valuesOk && !eqOk) {
        feedback = 'أحسنت في تحديد القيمتين (800,000 و 80)! الآن راجع العامل: كم صفراً زاد بين 80 و 800,000؟ أربعة أصفار تعني 10,000.';
      } else if (!ok && !valuesOk && eqOk) {
        feedback = 'العامل 10,000 صحيح! راجع قيمتي الرقم 8: الأول في مئات الألوف (800,000) والثاني في العشرات (80).';
      }

      return {
        isAnswered: true,
        isCorrect: ok,
        partial: (valuesOk || eqOk) && !ok,
        feedback,
        userSummary: formatExamNumber(highVal) + ' و ' + formatExamNumber(lowVal) + ' | ' + eqText,
        correctSummary
      };
    }

    if (q.type === 'order_cities') {
      const a = answer && typeof answer === 'object' ? answer : {};
      const order = Array.isArray(a.order) ? a.order : [];
      const touched = Boolean(a.touched);
      const cityNameById = Object.fromEntries(q.tableRows.map((r) => [r.id, r.city]));
      const correctSummary = q.correctOrder.map((id) => cityNameById[id]).join(' ← ');

      if (!touched || order.length !== q.correctOrder.length) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: false,
          feedback: 'رتّب المحافظات الثلاث تنازلياً (من الأكبر سكاناً إلى الأصغر).',
          userSummary: 'لم يُرتّب بعد',
          correctSummary
        };
      }
      const ok = q.correctOrder.every((id, idx) => order[idx] === id);
      return {
        isAnswered: true,
        isCorrect: ok,
        partial: false,
        feedback: ok ? q.explainRight : q.explainWrong,
        userSummary: order.map((id) => cityNameById[id] || id).join(' ← '),
        correctSummary
      };
    }

    if (q.type === 'livestock_table') {
      const a = answer && typeof answer === 'object' ? answer : {};
      const aprilSum = parseExamInt(a.aprilSum, false);
      const novSum = parseExamInt(a.novemberSum, false);
      const sym = ['<', '>', '='].includes(a.symbol) ? a.symbol : '';
      const expApril = q.rows[0].expectedSum;
      const expNov = q.rows[1].expectedSum;
      const correctSummary = 'نيسان: 3,901,360 < تشرين الثاني: 3,911,290';

      if (aprilSum === null || novSum === null || !sym) {
        return {
          isAnswered: false,
          isCorrect: false,
          partial: Boolean(aprilSum !== null || novSum !== null || sym),
          feedback: 'احسب مجموع نيسان ومجموع تشرين الثاني ثم اختر رمز المقارنة المناسب.',
          userSummary: 'إجابة غير مكتملة',
          correctSummary
        };
      }

      const aprilOk = aprilSum === expApril;
      const novOk = novSum === expNov;
      const symOk = sym === q.expectedSymbol;
      const ok = aprilOk && novOk && symOk;

      let feedback = ok ? q.explainRight : q.explainWrong;
      if (!ok) {
        const parts = [];
        if (!aprilOk) parts.push('راجع مجموع نيسان (3,057,950 + 770,770 + 72,640)');
        if (!novOk) parts.push('راجع مجموع تشرين الثاني (3,063,120 + 772,670 + 75,500)');
        if (aprilOk && novOk && !symOk) parts.push('المجموعان صحيحان؛ قارن بينهما: 3,901,360 أصغر من 3,911,290');
        if (parts.length) feedback = parts.join('، ') + '.';
      }

      return {
        isAnswered: true,
        isCorrect: ok,
        partial: (aprilOk || novOk || symOk) && !ok,
        feedback,
        userSummary: 'نيسان: ' + formatExamNumber(aprilSum) + ' ' + sym + ' تشرين الثاني: ' + formatExamNumber(novSum),
        correctSummary
      };
    }

    return { isAnswered: false, isCorrect: false, partial: false, feedback: '', userSummary: '', correctSummary: '' };
  }

  function computeUnit1ExamReport(answersMap) {
    const map = answersMap && typeof answersMap === 'object' ? answersMap : {};
    const itemResults = [];
    const lessonBuckets = {
      1: { lesson: 1, title: UNIT1_LESSON_META[1].title, correct: 0, total: 0, missedIds: [] },
      2: { lesson: 2, title: UNIT1_LESSON_META[2].title, correct: 0, total: 0, missedIds: [] },
      3: { lesson: 3, title: UNIT1_LESSON_META[3].title, correct: 0, total: 0, missedIds: [] },
      4: { lesson: 4, title: UNIT1_LESSON_META[4].title, correct: 0, total: 0, missedIds: [] },
      5: { lesson: 5, title: UNIT1_LESSON_META[5].title, correct: 0, total: 0, missedIds: [] }
    };

    let correctCount = 0;
    let answeredCount = 0;

    UNIT1_EXAM_QUESTIONS.forEach((q) => {
      const ev = evaluateUnit1ExamQuestion(q, map[String(q.id)] ?? map[q.id]);
      if (ev.isAnswered) answeredCount++;
      if (ev.isCorrect) correctCount++;
      itemResults.push({
        id: q.id,
        sectionId: q.sectionId,
        lessonRef: q.lessonRef,
        skillLabel: q.skillLabel,
        prompt: q.prompt,
        isAnswered: ev.isAnswered,
        isCorrect: ev.isCorrect,
        partial: ev.partial,
        userSummary: ev.userSummary,
        correctSummary: ev.correctSummary,
        feedback: ev.feedback
      });

      const primaryBucket = lessonBuckets[q.lessonRef];
      if (primaryBucket) {
        primaryBucket.total++;
        if (ev.isCorrect) primaryBucket.correct++;
        else primaryBucket.missedIds.push(q.id);
      }
      if (q.secondaryLessonRef && lessonBuckets[q.secondaryLessonRef]) {
        const secBucket = lessonBuckets[q.secondaryLessonRef];
        secBucket.total++;
        if (ev.isCorrect) secBucket.correct++;
        else secBucket.missedIds.push(q.id);
      }
    });

    const total = UNIT1_EXAM_QUESTIONS.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 80;
    const lessonBreakdown = [1, 2, 3, 4, 5].map((num) => {
      const b = lessonBuckets[num];
      const lPct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 100;
      return {
        lesson: num,
        lessonKey: 'lesson' + num,
        title: b.title,
        correct: b.correct,
        total: b.total,
        pct: lPct,
        needsReview: lPct < 80,
        missedIds: b.missedIds
      };
    });

    return {
      total,
      answeredCount,
      correctCount,
      wrongCount: total - correctCount,
      pct,
      passed,
      passingThreshold: 80,
      lessonBreakdown,
      itemResults,
      submittedAt: new Date().toISOString()
    };
  }

  global.Unit1ExamData = {
    normalizeDigits,
    parseExamInt,
    formatExamNumber,
    formatSignedNumber,
    SECTIONS: UNIT1_EXAM_SECTIONS,
    LESSON_META: UNIT1_LESSON_META,
    QUESTIONS: UNIT1_EXAM_QUESTIONS,
    getQuestionById,
    getSectionQuestions,
    evaluateUnit1ExamQuestion,
    computeUnit1ExamReport
  };
})(window);
