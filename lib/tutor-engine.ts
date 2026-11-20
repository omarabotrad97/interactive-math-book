export const ALLOWED_CHAT_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
export type ChatModelId = (typeof ALLOWED_CHAT_MODELS)[number];

export const ALLOWED_TTS_MODELS = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'] as const;
export type TtsModelId = (typeof ALLOWED_TTS_MODELS)[number];

export const ALLOWED_VOICES = ['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'] as const;
export type VoiceId = (typeof ALLOWED_VOICES)[number];

export const LIVE_VOICE_MODEL = 'gemini-3.8-live';

export interface LessonCurriculumInfo {
  id: number;
  title: string;
  pages: string;
  coreIdea: string;
  keyRules: string[];
  commonPitfalls: string[];
}

export const LESSON_CATALOG: Record<number, LessonCurriculumInfo> = {
  1: {
    id: 1,
    title: 'القيمة المنزلية ضمن الملايين',
    pages: '8 - 11',
    coreIdea: 'تحديد المنزلة والقيمة المنزلية لكل رقم في أعداد حتى مئات الملايين، وقراءتها وكتابتها بالصيغ القياسية واللفظية والتحليلية.',
    keyRules: [
      'نقسّم العدد من اليمين إلى دورات ثلاثية: دورة الآحاد، ثم دورة الألوف، ثم دورة الملايين.',
      'لقراءة العدد نبدأ من الدورة الكبرى في اليسار ثم الألوف ثم الآحاد.',
      'القيمة المنزلية للرقم = الرقم مضروباً في قيمة منزلته (أو نكتب الرقم ونستبدل كل خانة عن يمينه بصفر).',
      'الصفر يحفظ المنزلة في الصيغة القياسية، وقيمته المنزلية تساوي 0 دائماً فلا يُكتب في الصيغة التحليلية.'
    ],
    commonPitfalls: [
      'الخلط بين اسم المنزلة (مثل عشرات الألوف) والقيمة المنزلية (مثل 50,000).',
      'نسيان كتابة الأصفار الحافظة للمنازل عند التحويل من الصيغة اللفظية أو التحليلية إلى القياسية.'
    ]
  },
  2: {
    id: 2,
    title: 'مقارنة الأعداد وترتيبها',
    pages: '12 - 15',
    coreIdea: 'مقارنة الأعداد الكلية ضمن الملايين باستعمال (> ، < ، =) وترتيبها تصاعدياً وتنازلياً.',
    keyRules: [
      'الخطوة الأولى في المقارنة: نعدّ منازل العددين؛ العدد ذو المنازل الأكثر هو الأكبر مباشرة.',
      'إذا تساوى عدد المنازل: نقارن الأرقام بدءاً من أقصى اليسار (أكبر منزلة) حتى نجد أول رقمين مختلفين.',
      'فتحة رمز المقارنة (> أو <) تتجه دائماً نحو العدد الأكبر.',
      'الترتيب التصاعدي من الأصغر إلى الأكبر، والترتيب التنازلي من الأكبر إلى الأصغر.'
    ],
    commonPitfalls: [
      'مقارنة الرقم الأول من اليسار دون عدّ منازل العددين أولاً.',
      'البدء بالمقارنة من جهة الآحاد (اليمين) بدلاً من أكبر منزلة في اليسار.'
    ]
  },
  3: {
    id: 3,
    title: 'جمع الأعداد الكلية وطرحها',
    pages: '16 - 19',
    coreIdea: 'جمع الأعداد الكلية وطرحها ضمن الملايين مع إعادة التجميع وتقدير النواتج للتحقق من معقوليتها.',
    keyRules: [
      'نرتب الأعداد عمودياً بمحاذاة المنازل من اليمين: الآحاد تحت الآحاد والعشرات تحت العشرات.',
      'نبدأ الجمع أو الطرح دائماً من منزلة الآحاد (أقصى اليمين) متجهين نحو اليسار.',
      'في الجمع: إذا كان مجموع العمود 10 أو أكثر نعيد التجميع برفع العشرات إلى المنزلة التالية يساراً.',
      'في الطرح: إذا كان الرقم العلوي أصغر من السفلي نستلف 1 من المنزلة المجاورة يساراً، وعند الاستلاف عبر الصفر تتحول الأصفار الوسطى إلى 9.',
      'نقدّر الناتج بالتقريب إلى أعلى منزلة للتحقق من معقولية الإجابة الدقيقة.'
    ],
    commonPitfalls: [
      'محاذاة الأعداد مختلفة الطول من اليسار بدلاً من اليمين.',
      'الطرح المعكوس (طرح الكبير من الصغير في العمود بدلاً من الاستلاف).'
    ]
  },
  4: {
    id: 4,
    title: 'الأعداد السالبة',
    pages: '20 - 23',
    coreIdea: 'تعرّف الأعداد السالبة وتمثيلها على خط الأعداد الأفقي والرأسي (ميزان الحرارة والارتفاعات) وتفسير موقع الصفر.',
    keyRules: [
      'الصفر (0) هو نقطة المرجع الفاصلة (مثل سطح البحر، درجة التجمد، الطابق الأرضي) وهو ليس موجباً ولا سالباً.',
      'الأعداد الموجبة أكبر من الصفر وتقع يمين الصفر أو فوقه، والأعداد السالبة أصغر من الصفر وتقع يسار الصفر أو تحته وتُكتب بإشارة (-) عن يسار العدد مثل -5.',
      'على خط الأعداد الأفقي: نتحرك يسار الصفر خطوة خطوة (-1، -2، -3...) وكلما ابتعدنا يساراً قلّت القيمة.',
      'العددان المتعاكسان يبعدان المسافة نفسها عن الصفر في اتجاهين متعاكسين مثل +4 و -4.'
    ],
    commonPitfalls: [
      'الاعتقاد أن الصفر عدد موجب أو سالب.',
      'ترقيم خط الأعداد السالب بترتيب معكوس بدلاً من البدء بـ -1 بجوار الصفر مباشرة.'
    ]
  },
  5: {
    id: 5,
    title: 'خطة حل المسألة: أنشئ جدولاً',
    pages: '24 - 27',
    coreIdea: 'حل المسائل الحياتية متعددة الخطوات بتنظيم المعطيات والأنماط في جدول منظم عبر الخطوات الأربع (أفهم، أخطط، أحل، أتحقق).',
    keyRules: [
      'أفهم: نحدد المعطيات العددية بدقة والمطلوب إيجاده في السؤال.',
      'أخطط: ننشئ جدولاً بصفوف وأعمدة تمثّل المتغيرات أو المراحل المتتابعة.',
      'أحل: نملأ الجدول عموداً بعد عمود وفق النمط الثابت أو علاقة الضرب والجمع حتى نصل للشرط المطلوب.',
      'أتحقق: نراجع الحسابات بالعملية العكسية أو الضرب للتأكد من صحة النتيجة.'
    ],
    commonPitfalls: [
      'التسرع في تخمين الجواب دون متابعة النمط في جميع صفوف الجدول.',
      'إغفال خطوة التحقق من مطابقة المجموع أو الشرط لمعطيات المسألة.'
    ]
  }
};

export interface StudentSlideContext {
  lesson?: number;
  stationTitle?: string;
  stepKind?: string;
  stepIndex?: number;
  totalSteps?: number;
  isTeachingSlide?: boolean;
  slideTitle?: string;
  slideBody?: string;
  questionPrompt?: string;
  numbersInvolved?: string;
  options?: string[];
  hintText?: string;
  activeLab?: string;
  studentName?: string;
  points?: number;
  completedCount?: number;
  totalCount?: number;
  weakSkillLabel?: string;
}

export function sanitizeChatModel(model?: string): ChatModelId {
  if (model && (ALLOWED_CHAT_MODELS as readonly string[]).includes(model)) {
    return model as ChatModelId;
  }
  return 'gemini-4-hydrogen';
}

export function sanitizeTtsModel(model?: string): TtsModelId {
  if (model && (ALLOWED_TTS_MODELS as readonly string[]).includes(model)) {
    return model as TtsModelId;
  }
  return 'gemini-3.8-flash-lite-tts';
}

export function sanitizeVoiceName(voice?: string): VoiceId {
  if (voice && (ALLOWED_VOICES as readonly string[]).includes(voice)) {
    return voice as VoiceId;
  }
  return 'Kore';
}

export function normalizeLessonNumber(lesson?: number): number {
  const n = Number(lesson);
  if (Number.isInteger(n) && n >= 1 && n <= 5) return n;
  return 1;
}

export function stripEmojis(str: string): string {
  return String(str || '')
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu,
      ''
    )
    .replace(/\*\*+/g, '')
    .replace(/^#{1,6}\s+/gm, '');
}

export function ensureWavAudioBase64(
  audioBase64: string,
  mimeType?: string
): { audioBase64: string; mimeType: string } {
  const cleanB64 = String(audioBase64 || '').trim();
  const mime = String(mimeType || '').toLowerCase();

  if (!cleanB64) {
    return { audioBase64: '', mimeType: 'audio/wav' };
  }

  // Pass through already encoded container formats (MP3 / OGG)
  if (mime.includes('mp3') || mime.includes('mpeg') || mime.includes('ogg')) {
    return { audioBase64: cleanB64, mimeType: mimeType || 'audio/mpeg' };
  }

  const rawBuffer = Buffer.from(cleanB64, 'base64');
  // Check if it already has a RIFF WAVE header
  if (
    rawBuffer.length >= 12 &&
    rawBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    rawBuffer.toString('ascii', 8, 12) === 'WAVE'
  ) {
    return { audioBase64: cleanB64, mimeType: 'audio/wav' };
  }

  // Parse sample rate from mimeType if present (e.g. "audio/L16;codec=pcm;rate=24000")
  const rateMatch = mime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? Math.max(8000, Math.min(96000, Number(rateMatch[1]))) : 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = rawBuffer.length - (rawBuffer.length % 2);

  const wavHeader = Buffer.alloc(44);
  wavHeader.write('RIFF', 0, 'ascii');
  wavHeader.writeUInt32LE(36 + dataSize, 4);
  wavHeader.write('WAVE', 8, 'ascii');
  wavHeader.write('fmt ', 12, 'ascii');
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write('data', 36, 'ascii');
  wavHeader.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([wavHeader, rawBuffer.subarray(0, dataSize)]);
  return {
    audioBase64: wavBuffer.toString('base64'),
    mimeType: 'audio/wav'
  };
}

export function buildTutorSystemInstruction(
  rawCtx?: StudentSlideContext,
  mode: 'chat' | 'live' = 'chat'
): string {
  const ctx = rawCtx || {};
  const lessonNum = normalizeLessonNumber(ctx.lesson);
  const lessonInfo = LESSON_CATALOG[lessonNum];
  const studentName = (ctx.studentName || 'بطل الرياضيات').trim();
  const stationTitle = (ctx.stationTitle || lessonInfo.title).trim();

  const lines: string[] = [
    `أنت «المعلم الذكي» (البومة الحكيمة) في كتاب الرياضيات التفاعلي للصف الخامس الابتدائي (المنهاج الأردني).`,
    `الدرس الحالي (${lessonInfo.id} من 5): «${lessonInfo.title}» (الصفحات ${lessonInfo.pages}).`,
    `الفكرة المحورية للدرس: ${lessonInfo.coreIdea}`,
    `القواعد العلمية الدقيقة للدرس:\n- ${lessonInfo.keyRules.join('\n- ')}`,
    `أخطاء شائعة يجب الانتباه لها وتصحيحها بلطف:\n- ${lessonInfo.commonPitfalls.join('\n- ')}`,
    `بيانات الطالب: الاسم «${studentName}» | المحطة الحالية: «${stationTitle}»` +
      (ctx.stepIndex !== undefined && ctx.totalSteps
        ? ` (الشريحة/الخطوة ${ctx.stepIndex + 1} من ${ctx.totalSteps})`
        : '') +
      (ctx.weakSkillLabel ? ` | مهارة التركيز: «${ctx.weakSkillLabel}»` : '') +
      `.`
  ];

  if (ctx.activeLab) {
    lines.push(`المختبر التفاعلي المفتوح حالياً أمام الطالب: ${ctx.activeLab}.`);
  }

  if (ctx.slideTitle || ctx.slideBody) {
    lines.push(
      `محتوى الشريحة المعروضة أمام الطالب الآن:` +
        (ctx.slideTitle ? `\n- عنوان الشريحة: ${ctx.slideTitle}` : '') +
        (ctx.slideBody ? `\n- نص/شرح الشريحة: ${ctx.slideBody}` : '')
    );
  }

  if (ctx.questionPrompt) {
    lines.push(`السؤال أو النشاط المعروض في الشريحة الحالية: ${ctx.questionPrompt}`);
  }
  if (ctx.numbersInvolved) {
    lines.push(`الأعداد أو القيم الظاهرة في الشريحة: ${ctx.numbersInvolved}`);
  }
  if (Array.isArray(ctx.options) && ctx.options.length > 0) {
    lines.push(`الخيارات المتاحة أمام الطالب: ${ctx.options.join(' | ')}`);
  }
  if (ctx.hintText) {
    lines.push(`التلميح التربوي المرجعي لهذه الخطوة: ${ctx.hintText}`);
  }

  if (mode === 'live') {
    lines.push(
      'أسلوب المحادثة الصوتية المباشرة (Live Voice):',
      '1. تحدث باللغة العربية الفصحى الواضحة والبسيطة المناسبة لطالب في الصف الخامس بروح مشجعة ودافئة.',
      '2. اجعل كل رد صوتي قصيراً وتفاعلياً (جملتين إلى ثلاث جمل كحد أقصى في المرة الواحدة) حتى يتمكن الطالب من الحوار معك بسلاسة.',
      '3. اقرأ الأعداد لفظياً بوضوح بالعربية، واشرح الشريحة الحالية بمثال مبسط عند طلب الشرح.',
      '4. إذا كان الطالب يحل سؤالاً تقييمياً لم يُحسم بعد، وجهه بسؤال سقراطي لطيف يقوده إلى الحل بنفسه دون إعطاء الجواب النهائي فوراً.',
      '5. لا تستخدم أي رموز إيموجي أو تنسيقات ماركداون معقدة.'
    );
  } else {
    lines.push(
      'القواعد التربوية للإجابة النصية:',
      '1. إذا كانت الشريحة الحالية شريحة شرح أو طلب الطالب شرح الدرس أو توضيح الشريحة أو إعطاء مثال: اشرح الفكرة بوضوح تام في خطوات مرقمة قصيرة مع مثال عددي مرتبط بالشريحة.',
      '2. إذا كان الطالب يسأل عن حل سؤال تدريبي مفتوح أمامه: استخدم التوجيه السقراطي الذكي خطوة بخطوة لمساعدته على اكتشاف الحل بنفسه دون كشف الخيار النهائي مباشرة، إلا إذا طلب شرح القاعدة العامة.',
      '3. أجب بلغة عربية فصحى مشجعة وسليمة في 2 إلى 5 جمل مركزة ومنظمة، وبدون استخدام أي رموز إيموجي نهائياً.'
    );
  }

  return lines.join('\n');
}

export interface GeneratedQuiz {
  id: string;
  intro: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function generateDeterministicLessonQuiz(lesson?: number, variant = 0): GeneratedQuiz {
  const lessonNum = normalizeLessonNumber(lesson);
  const idx = Math.abs(Math.trunc(variant)) % 2;

  if (lessonNum === 2) {
    return idx === 0
      ? {
          id: `l2_det_0`,
          intro: 'سؤال سريع في مقارنة الأعداد ضمن الملايين:',
          question: 'أي الرموز التالية يجعل العبارة صحيحة: 3,759,120 ؟ 3,456,210',
          options: ['>', '<', '=', '+'],
          correctIndex: 0,
          explanation: 'كلا العددين مكوّن من 7 منازل، وفي منزلة آحاد الملايين يتساويان (3 = 3)، بينما في مئات الألوف 7 أكبر من 4؛ لذا 3,759,120 > 3,456,210.'
        }
      : {
          id: `l2_det_1`,
          intro: 'تحدٍّ سريع في عدّ المنازل والمقارنة:',
          question: 'أيهما أكبر: العدد 56,109,789 أم العدد 5,678,089؟',
          options: [
            '56,109,789 لأنه مكوّن من 8 منازل',
            '5,678,089 لأن فيه الرقم 8 مرتين',
            'العددان متساويان',
            '5,678,089 لأنه يبدأ بـ 5'
          ],
          correctIndex: 0,
          explanation: 'نعدّ المنازل أولاً: 56,109,789 يتكوّن من 8 منازل بينما 5,678,089 يتكوّن من 7 منازل، فالعدد ذو المنازل الأكثر هو الأكبر.'
        };
  }

  if (lessonNum === 3) {
    return idx === 0
      ? {
          id: `l3_det_0`,
          intro: 'سؤال سريع في جمع الأعداد الكلية وطرحها:',
          question: 'ما ناتج طرح: 6,000 − 2,400؟',
          options: ['3,600', '4,400', '3,400', '8,400'],
          correctIndex: 0,
          explanation: 'نستلف 1 من آحاد الألوف (6 تصبح 5) ومئات العدد الأول تصبح 10: 10 − 4 = 6 في المئات و5 − 2 = 3 في الألوف، فالناتج 3,600.'
        }
      : {
          id: `l3_det_1`,
          intro: 'سؤال سريع في التحقق بالتقدير:',
          question: 'ما ناتج جمع: 3,420,000 + 1,580,000؟',
          options: ['5,000,000', '4,900,000', '4,000,000', '5,100,000'],
          correctIndex: 0,
          explanation: 'نجمع من اليمين مع إعادة التجميع: 420 ألفاً + 580 ألفاً = مليون كامل يُضاف إلى 3 + 1 ملايين فيصبح الناتج 5,000,000.'
        };
  }

  if (lessonNum === 4) {
    return idx === 0
      ? {
          id: `l4_det_0`,
          intro: 'سؤال سريع في الأعداد السالبة:',
          question: 'إذا كانت درجة الحرارة في الشوبك 3 درجات تحت الصفر، فكيف نكتبها بالرموز؟',
          options: ['-3', '+3', '0', '30'],
          correctIndex: 0,
          explanation: 'عبارة «تحت الصفر» تعني قيمة أقل من الصفر، لذلك نمثّلها بعدد سالب مسبوق بإشارة (-) فيكون -3.'
        }
      : {
          id: `l4_det_1`,
          intro: 'سؤال سريع على خط الأعداد:',
          question: 'ما العدد المعاكس للعدد +7 على خط الأعداد؟',
          options: ['-7', '0', '+7', '-1'],
          correctIndex: 0,
          explanation: 'العددان المتعاكسان يبعدان المسافة نفسها (7 وحدات) عن الصفر في اتجاهين متعاكسين، فمعاكس +7 هو -7.'
        };
  }

  if (lessonNum === 5) {
    return idx === 0
      ? {
          id: `l5_det_0`,
          intro: 'سؤال سريع في خطة حل المسألة (أنشئ جدولاً):',
          question: 'يدّخر مهند 4 دنانير كل أسبوع. باستعمال جدول النمط، كم ديناراً يدّخر في 6 أسابيع؟',
          options: ['24 ديناراً', '10 دنانير', '20 ديناراً', '28 ديناراً'],
          correctIndex: 0,
          explanation: 'بتكرار النمط في الجدول (4، 8، 12، 16، 20، 24) أو بالتحقق عبر 6 × 4 نجد أنه يدّخر 24 ديناراً.'
        }
      : {
          id: `l5_det_1`,
          intro: 'سؤال سريع في تنظيم الجداول:',
          question: 'في كل باقة تضع لمياء 3 وردات حمراء مقابل 5 وردات بيضاء. إذا استعملت 9 وردات حمراء، فكم وردة بيضاء استعملت؟',
          options: ['15 وردة بيضاء', '12 وردة بيضاء', '10 وردات بيضاء', '18 وردة بيضاء'],
          correctIndex: 0,
          explanation: 'في الجدول: (3 حمراء ← 5 بيضاء)، (6 حمراء ← 10 بيضاء)، (9 حمراء ← 15 بيضاء) لأن 9 تساوي 3 باقات × 5 = 15.'
        };
  }

  return idx === 0
    ? {
        id: `l1_det_0`,
        intro: 'سؤال سريع في القيمة المنزلية ضمن الملايين:',
        question: 'ما القيمة المنزلية للرقم 5 في العدد 2,540,310؟',
        options: ['500,000', '50,000', '5,000,000', '5,000'],
        correctIndex: 0,
        explanation: 'الرقم 5 يقع في منزلة مئات الألوف وعلى يمينه 5 منازل، فقيمته المنزلية هي 500,000.'
      }
    : {
        id: `l1_det_1`,
        intro: 'سؤال سريع في الصيغة القياسية:',
        question: 'كيف نكتب العدد «أربعة ملايين وسبعون ألفاً ومئتان» بالصيغة القياسية؟',
        options: ['4,070,200', '4,700,200', '4,070,020', '40,700,200'],
        correctIndex: 0,
        explanation: 'في دورة الملايين 4، وفي دورة الألوف 070 (نحفظ مئات الألوف بصفر)، وفي دورة الآحاد 200، فيكون العدد 4,070,200.'
      };
}

export type VisualDiagramKind =
  | 'place_value'
  | 'comparison'
  | 'vertical_ops'
  | 'number_line'
  | 'pattern_table';

export interface PlaceValueCellSpec {
  indexFromRight: number;
  indexFromLeft: number;
  digit: number;
  placeName: string;
  periodName: 'دورة الآحاد' | 'دورة الألوف' | 'دورة الملايين';
  periodKey: 'ones' | 'thousands' | 'millions';
  placeValue: number;
  zerosCount: number;
  barHeightPct: number;
}

export interface PlaceValueDiagramData {
  targetNumber: number;
  formattedNumber: string;
  focusIndexFromLeft: number;
  cells: PlaceValueCellSpec[];
  expandedTerms: string[];
  summaryAr: string;
}

export interface ComparisonColumnSpec {
  indexFromLeft: number;
  placeName: string;
  digitA: number;
  digitB: number;
  status: 'equal' | 'decisive_a' | 'decisive_b' | 'after_decisive';
}

export interface ComparisonDiagramData {
  numA: number;
  numB: number;
  formattedA: string;
  formattedB: string;
  lenA: number;
  lenB: number;
  symbol: '>' | '<' | '=';
  sameLength: boolean;
  decisiveIndexFromLeft: number;
  columns: ComparisonColumnSpec[];
  summaryAr: string;
}

export interface VerticalOpColumnSpec {
  indexFromRight: number;
  placeName: string;
  rawTop: number;
  rawBottom: number;
  effectiveTop: number;
  carryIn: number;
  carryOut: number;
  borrowed: boolean;
  resultDigit: number;
  noteAr: string;
}

export interface VerticalOpsDiagramData {
  numA: number;
  numB: number;
  op: 'add' | 'sub';
  result: number;
  columns: VerticalOpColumnSpec[];
  summaryAr: string;
}

export interface NumberLineDiagramData {
  value: number;
  compareValue: number;
  oppositeValue: number;
  min: number;
  max: number;
  distanceFromZero: number;
  contextLabelAr: string;
  summaryAr: string;
}

export interface PatternTableCellSpec {
  step: number;
  rowA: number;
  rowB: number;
}

export interface PatternTableDiagramData {
  rowALabel: string;
  rowBLabel: string;
  stepDeltaA: number;
  stepDeltaB: number;
  targetStep: number;
  columns: PatternTableCellSpec[];
  summaryAr: string;
}

export interface VisualDiagramSpec {
  kind: VisualDiagramKind;
  title: string;
  subtitle: string;
  lesson: number;
  placeValue?: PlaceValueDiagramData;
  comparison?: ComparisonDiagramData;
  verticalOps?: VerticalOpsDiagramData;
  numberLine?: NumberLineDiagramData;
  patternTable?: PatternTableDiagramData;
}

const PLACE_NAMES_FROM_RIGHT = [
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

export function normalizeArabicDigits(input: string): string {
  return String(input || '').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function extractSignedNumbersFromText(text: string): number[] {
  const norm = normalizeArabicDigits(text);
  const matches = norm.match(/[+-]?\d[\d,]*/g) || [];
  const result: number[] = [];
  for (const m of matches) {
    const cleaned = m.replace(/,/g, '');
    const n = Number(cleaned);
    if (Number.isFinite(n)) {
      result.push(n);
    }
  }
  return result;
}

export function detectVisualDiagramKind(
  query: string,
  ctx?: StudentSlideContext
): VisualDiagramKind {
  const q = normalizeArabicDigits(`${query || ''} ${ctx?.questionPrompt || ''} ${ctx?.slideTitle || ''}`).toLowerCase();
  const rawQuery = normalizeArabicDigits(query || '');
  const queryNums = extractSignedNumbersFromText(rawQuery);

  // Explicit negative number or Lesson 4 concepts
  if (
    /سالب|تحت الصفر|فوق الصفر|ميزان الحرار|خط الأعداد|معاكس|درجة حرارة|عمق|سطح البحر/.test(rawQuery) ||
    queryNums.some((n) => n < 0 && n >= -200)
  ) {
    return 'number_line';
  }

  // Explicit pattern table / Lesson 5 concepts
  if (/جدول|نمط|يدخر|يدّخر|أسابيع|أسبوع|باقة|وردات|خطة حل المسألة/.test(rawQuery)) {
    return 'pattern_table';
  }

  // Explicit vertical addition/subtraction / Lesson 3 concepts
  if (
    /جمع|طرح|استلاف|نستلف|إعادة التجميع|اعادة التجميع|عمودي|ناتج جمع|ناتج طرح/.test(rawQuery) ||
    /\d[\d,]*\s*[+−-]\s*\d[\d,]*/.test(rawQuery)
  ) {
    return 'vertical_ops';
  }

  // Explicit comparison / ordering / Lesson 2 concepts
  if (
    /قارن|مقارنة|أكبر|أصغر|أيهما|ترتيب|تصاعدي|تنازلي|[><=]/.test(rawQuery) ||
    (queryNums.filter((n) => n >= 100).length >= 2 && /بين|أم|و/.test(rawQuery))
  ) {
    return 'comparison';
  }

  // Explicit place value / Lesson 1 concepts
  if (/منزلة|قيمة منزلية|دورة|دورات|تحليلية|لفظية|قياسية|أصفار|ملايين|ألوف/.test(rawQuery)) {
    return 'place_value';
  }

  // Fallback to active lesson context
  const lessonNum = normalizeLessonNumber(ctx?.lesson);
  if (lessonNum === 2) return 'comparison';
  if (lessonNum === 3) return 'vertical_ops';
  if (lessonNum === 4) return 'number_line';
  if (lessonNum === 5) return 'pattern_table';
  if (/سالب|تحت الصفر|خط الأعداد/.test(q)) return 'number_line';
  return 'place_value';
}

export function buildPlaceValueDiagram(targetNumRaw: number, focusDigitRaw?: number): PlaceValueDiagramData {
  const safeNum = Math.max(10, Math.min(999999999, Math.abs(Math.trunc(targetNumRaw || 2540310))));
  const str = String(safeNum);
  const len = str.length;

  let focusIndexFromLeft = Math.min(1, len - 1);
  if (focusDigitRaw !== undefined && focusDigitRaw >= 0 && focusDigitRaw <= 9) {
    const foundIdx = str.indexOf(String(focusDigitRaw));
    if (foundIdx !== -1) focusIndexFromLeft = foundIdx;
  } else {
    // Pick highest non-zero digit after the first digit if available, else index 0
    for (let i = 1; i < len; i++) {
      if (str[i] !== '0') {
        focusIndexFromLeft = i;
        break;
      }
    }
  }

  const cells: PlaceValueCellSpec[] = [];
  const expandedTerms: string[] = [];

  for (let i = 0; i < len; i++) {
    const digit = Number(str[i]);
    const indexFromRight = len - 1 - i;
    const placeName = PLACE_NAMES_FROM_RIGHT[indexFromRight] || `منزلة 10^${indexFromRight}`;
    const periodKey =
      indexFromRight >= 6 ? 'millions' : indexFromRight >= 3 ? 'thousands' : 'ones';
    const periodName =
      periodKey === 'millions'
        ? 'دورة الملايين'
        : periodKey === 'thousands'
          ? 'دورة الألوف'
          : 'دورة الآحاد';
    const placeValue = digit * Math.pow(10, indexFromRight);
    const barHeightPct = digit === 0 ? 8 : Math.round(18 + ((indexFromRight + 1) / len) * 65 + (digit / 9) * 17);

    cells.push({
      indexFromRight,
      indexFromLeft: i,
      digit,
      placeName,
      periodName,
      periodKey,
      placeValue,
      zerosCount: indexFromRight,
      barHeightPct: Math.min(100, barHeightPct)
    });

    if (digit > 0) {
      expandedTerms.push(placeValue.toLocaleString('en-US'));
    }
  }

  const focused = cells[focusIndexFromLeft] || cells[0];
  const formattedNumber = safeNum.toLocaleString('en-US');
  const summaryAr =
    `العدد ${formattedNumber} يتكوّن من ${len} منازل. الرقم ${focused.digit} يقع في منزلة «${focused.placeName}» (${focused.periodName}) وعلى يمينه ${focused.zerosCount} منازل، فقيمته المنزلية تساوي ${focused.placeValue.toLocaleString('en-US')}.`;

  return {
    targetNumber: safeNum,
    formattedNumber,
    focusIndexFromLeft,
    cells,
    expandedTerms,
    summaryAr
  };
}

export function buildComparisonDiagram(rawA: number, rawB: number): ComparisonDiagramData {
  const numA = Math.max(0, Math.min(999999999, Math.abs(Math.trunc(rawA || 3759120))));
  const numB = Math.max(0, Math.min(999999999, Math.abs(Math.trunc(rawB || 3456210))));
  const strA = String(numA);
  const strB = String(numB);
  const lenA = strA.length;
  const lenB = strB.length;
  const maxLen = Math.max(lenA, lenB);
  const padA = strA.padStart(maxLen, '0');
  const padB = strB.padStart(maxLen, '0');

  const sameLength = lenA === lenB;
  let decisiveIndexFromLeft = -1;
  const columns: ComparisonColumnSpec[] = [];

  for (let i = 0; i < maxLen; i++) {
    const dA = Number(padA[i]);
    const dB = Number(padB[i]);
    const idxRight = maxLen - 1 - i;
    const placeName = PLACE_NAMES_FROM_RIGHT[idxRight] || `منزلة ${idxRight + 1}`;
    let status: ComparisonColumnSpec['status'] = 'equal';

    if (decisiveIndexFromLeft === -1) {
      if (dA > dB) {
        decisiveIndexFromLeft = i;
        status = 'decisive_a';
      } else if (dB > dA) {
        decisiveIndexFromLeft = i;
        status = 'decisive_b';
      }
    } else {
      status = 'after_decisive';
    }

    columns.push({
      indexFromLeft: i,
      placeName,
      digitA: dA,
      digitB: dB,
      status
    });
  }

  const symbol: '>' | '<' | '=' = numA > numB ? '>' : numA < numB ? '<' : '=';
  const formattedA = numA.toLocaleString('en-US');
  const formattedB = numB.toLocaleString('en-US');

  let summaryAr = '';
  if (!sameLength) {
    summaryAr = `نعدّ المنازل أولاً: العدد ${formattedA} مكوّن من ${lenA} منازل بينما ${formattedB} مكوّن من ${lenB} منازل؛ العدد ذو المنازل الأكثر هو الأكبر مباشرة (${formattedA} ${symbol} ${formattedB}).`;
  } else if (decisiveIndexFromLeft >= 0) {
    const decCol = columns[decisiveIndexFromLeft];
    summaryAr = `العددان لهما نفس عدد المنازل (${lenA} منازل). نقارن من اليسار فنجد أول اختلاف في منزلة «${decCol.placeName}» حيث ${decCol.digitA} ${decCol.digitA > decCol.digitB ? '>' : '<'} ${decCol.digitB}، إذن ${formattedA} ${symbol} ${formattedB}.`;
  } else {
    summaryAr = `جميع منازل العددين متطابقة من اليسار إلى اليمين، إذن العددان متساويان (${formattedA} = ${formattedB}).`;
  }

  return {
    numA,
    numB,
    formattedA,
    formattedB,
    lenA,
    lenB,
    symbol,
    sameLength,
    decisiveIndexFromLeft: decisiveIndexFromLeft === -1 ? 0 : decisiveIndexFromLeft,
    columns,
    summaryAr
  };
}

export function buildVerticalOpsDiagram(
  rawA: number,
  rawB: number,
  op: 'add' | 'sub' = 'add'
): VerticalOpsDiagramData {
  let numA = Math.max(0, Math.min(99999999, Math.abs(Math.trunc(rawA || 3421664))));
  let numB = Math.max(0, Math.min(99999999, Math.abs(Math.trunc(rawB || 1897632))));
  if (op === 'sub' && numB > numA) {
    const tmp = numA;
    numA = numB;
    numB = tmp;
  }

  const result = op === 'add' ? numA + numB : numA - numB;
  const maxLen = Math.max(String(numA).length, String(numB).length, String(result).length);
  const strA = String(numA).padStart(maxLen, '0');
  const strB = String(numB).padStart(maxLen, '0');

  const columns: VerticalOpColumnSpec[] = [];

  if (op === 'add') {
    let carry = 0;
    for (let r = 0; r < maxLen; r++) {
      const i = maxLen - 1 - r;
      const dA = Number(strA[i]);
      const dB = Number(strB[i]);
      const carryIn = carry;
      const sum = dA + dB + carryIn;
      const resultDigit = sum % 10;
      const carryOut = Math.floor(sum / 10);
      const placeName = PLACE_NAMES_FROM_RIGHT[r] || `منزلة ${r + 1}`;
      const noteAr =
        carryIn > 0
          ? `في ${placeName}: ${dA} + ${dB} + ${carryIn} (المرفوع) = ${sum} ← نكتب ${resultDigit}` +
            (carryOut > 0 ? ` ونرفع ${carryOut} للمنزلة التالية.` : '.')
          : `في ${placeName}: ${dA} + ${dB} = ${sum}` +
            (carryOut > 0 ? ` ← نكتب ${resultDigit} ونرفع ${carryOut} للمنزلة التالية.` : '.');

      columns.push({
        indexFromRight: r,
        placeName,
        rawTop: dA,
        rawBottom: dB,
        effectiveTop: dA,
        carryIn,
        carryOut,
        borrowed: false,
        resultDigit,
        noteAr
      });
      carry = carryOut;
    }
  } else {
    const workTop = strA.split('').map(Number);
    const workBot = strB.split('').map(Number);

    for (let r = 0; r < maxLen; r++) {
      const i = maxLen - 1 - r;
      const rawTop = Number(strA[i]);
      const rawBottom = workBot[i];
      let borrowed = false;

      if (workTop[i] < rawBottom) {
        borrowed = true;
        // Borrow from next non-zero column to the left
        let k = i - 1;
        while (k >= 0 && workTop[k] === 0) {
          workTop[k] = 9;
          k--;
        }
        if (k >= 0) {
          workTop[k] -= 1;
        }
        workTop[i] += 10;
      }

      const effectiveTop = workTop[i];
      const resultDigit = effectiveTop - rawBottom;
      const placeName = PLACE_NAMES_FROM_RIGHT[r] || `منزلة ${r + 1}`;
      const noteAr = borrowed
        ? `في ${placeName}: ${effectiveTop - 10} أصغر من ${rawBottom}، نستلف 1 من اليسار فتصبح ${effectiveTop} ثم ${effectiveTop} − ${rawBottom} = ${resultDigit}.`
        : `في ${placeName}: ${effectiveTop} − ${rawBottom} = ${resultDigit}.`;

      columns.push({
        indexFromRight: r,
        placeName,
        rawTop,
        rawBottom,
        effectiveTop,
        carryIn: 0,
        carryOut: 0,
        borrowed,
        resultDigit,
        noteAr
      });
    }
  }

  const summaryAr =
    op === 'add'
      ? `الجمع العمودي من اليمين (الآحاد): ${numA.toLocaleString('en-US')} + ${numB.toLocaleString('en-US')} = ${result.toLocaleString('en-US')}.`
      : `الطرح العمودي من اليمين (الآحاد): ${numA.toLocaleString('en-US')} − ${numB.toLocaleString('en-US')} = ${result.toLocaleString('en-US')}.`;

  return {
    numA,
    numB,
    op,
    result,
    columns,
    summaryAr
  };
}

export function buildNumberLineDiagram(rawVal: number, rawSecond?: number): NumberLineDiagramData {
  let value = Number.isFinite(rawVal) ? Math.trunc(rawVal) : -4;
  if (value > 20 || value < -20) {
    value = value < 0 ? -5 : -3;
  }
  const oppositeValue = -value;
  const compareValue =
    rawSecond !== undefined && Number.isFinite(rawSecond) && Math.abs(rawSecond) <= 20
      ? Math.trunc(rawSecond)
      : oppositeValue;
  const bound = Math.max(10, Math.abs(value) + 2, Math.abs(compareValue) + 2);
  const min = -bound;
  const max = bound;
  const distanceFromZero = Math.abs(value);

  const contextLabelAr =
    value < 0
      ? `${distanceFromZero} وحدات تحت الصفر (يسار الصفر على خط الأعداد)`
      : value > 0
        ? `${distanceFromZero} وحدات فوق الصفر (يمين الصفر على خط الأعداد)`
        : 'نقطة المرجع الفاصلة (0 ليس موجباً ولا سالباً)';

  const summaryAr =
    value === 0
      ? 'العدد 0 هو نقطة المرجع الفاصلة بين الأعداد الموجبة والسالبة.'
      : `العدد ${value > 0 ? `+${value}` : value} يبعد ${distanceFromZero} وحدات عن الصفر، ومعاكسه على الجهة الأخرى هو ${oppositeValue > 0 ? `+${oppositeValue}` : oppositeValue}.`;

  return {
    value,
    compareValue,
    oppositeValue,
    min,
    max,
    distanceFromZero,
    contextLabelAr,
    summaryAr
  };
}

export function buildPatternTableDiagram(
  stepDeltaA = 1,
  stepDeltaB = 4,
  stepsCount = 6,
  rowALabel = 'الأسبوع',
  rowBLabel = 'المدخرات (دينار)'
): PatternTableDiagramData {
  const dA = Math.max(1, Math.min(50, Math.abs(Math.trunc(stepDeltaA || 1))));
  const dB = Math.max(1, Math.min(500, Math.abs(Math.trunc(stepDeltaB || 4))));
  const count = Math.max(4, Math.min(8, Math.trunc(stepsCount || 6)));

  const columns: PatternTableCellSpec[] = [];
  for (let s = 1; s <= count; s++) {
    columns.push({
      step: s,
      rowA: s * dA,
      rowB: s * dB
    });
  }

  const last = columns[columns.length - 1];
  const summaryAr = `يتزايد «${rowALabel}» بمقدار +${dA} في كل خطوة، ويتزايد «${rowBLabel}» بمقدار +${dB}؛ عند الخطوة ${count} نصل إلى ${last.rowB} (لأن ${count} × ${dB} = ${last.rowB}).`;

  return {
    rowALabel,
    rowBLabel,
    stepDeltaA: dA,
    stepDeltaB: dB,
    targetStep: count,
    columns,
    summaryAr
  };
}

export function buildVisualDiagramSpec(
  query: string,
  ctx?: StudentSlideContext,
  overrideKind?: VisualDiagramKind
): VisualDiagramSpec {
  const kind = overrideKind || detectVisualDiagramKind(query, ctx);
  const combinedSource = `${query || ''} ${ctx?.numbersInvolved || ''} ${ctx?.questionPrompt || ''} ${ctx?.slideBody || ''}`;
  const allNums = extractSignedNumbersFromText(combinedSource);
  const queryNums = extractSignedNumbersFromText(query || '');
  const lesson = normalizeLessonNumber(ctx?.lesson);

  if (kind === 'comparison') {
    const bigNums = (queryNums.filter((n) => n >= 10).length >= 2 ? queryNums : allNums).filter((n) => n >= 10);
    const numA = bigNums[0] ?? 3759120;
    const numB = bigNums[1] ?? (numA === 3456210 ? 3759120 : 3456210);
    const comparison = buildComparisonDiagram(numA, numB);
    return {
      kind: 'comparison',
      title: 'المُصوِّر البصري: ميزان مقارنة المنازل',
      subtitle: 'افحص المنازل من أقصى اليسار خطوة بخطوة لاكتشاف منزلة الحسم',
      lesson: 2,
      comparison
    };
  }

  if (kind === 'vertical_ops') {
    const bigNums = (queryNums.filter((n) => n >= 10).length >= 2 ? queryNums : allNums).filter((n) => n >= 10);
    const rawQ = normalizeArabicDigits(combinedSource);
    const isSub = /طرح|استلاف|نستلف|الفرق|\d\s*[−-]\s*\d/.test(rawQ);
    const op: 'add' | 'sub' = isSub ? 'sub' : 'add';
    const numA = bigNums[0] ?? (op === 'sub' ? 6000 : 3421664);
    const numB = bigNums[1] ?? (op === 'sub' ? 2400 : 1897632);
    const verticalOps = buildVerticalOpsDiagram(numA, numB, op);
    return {
      kind: 'vertical_ops',
      title: op === 'sub' ? 'المُصوِّر البصري: الطرح العمودي والاستلاف' : 'المُصوِّر البصري: الجمع العمودي وإعادة التجميع',
      subtitle: 'تتبّع حركة الأرقام من منزلة الآحاد يميناً مع تظليل الاستلاف والرفع',
      lesson: 3,
      verticalOps
    };
  }

  if (kind === 'number_line') {
    const signedCandidate =
      queryNums.find((n) => n < 0 && n >= -20) ??
      allNums.find((n) => n < 0 && n >= -20) ??
      queryNums.find((n) => Math.abs(n) <= 15 && n !== 0 && n !== 1 && n !== 4) ??
      -4;
    const secondCandidate = queryNums.length >= 2 ? queryNums[1] : -signedCandidate;
    const numberLine = buildNumberLineDiagram(signedCandidate, secondCandidate);
    return {
      kind: 'number_line',
      title: 'المُصوِّر البصري: خط الأعداد والميزان الحراري',
      subtitle: 'حرّك القيمة لاستكشاف موقع الصفر والأعداد الموجبة والسالبة والعدد المعاكس',
      lesson: 4,
      numberLine
    };
  }

  if (kind === 'pattern_table') {
    const smallNums = (queryNums.length > 0 ? queryNums : allNums).filter((n) => n >= 2 && n <= 50);
    const deltaA = smallNums.length >= 2 ? smallNums[0] : 1;
    const deltaB = smallNums.length >= 2 ? smallNums[1] : smallNums[0] || 4;
    const steps = smallNums.find((n) => n >= 4 && n <= 8 && n !== deltaB) || 6;
    const patternTable = buildPatternTableDiagram(
      deltaA === deltaB ? 1 : deltaA,
      deltaB,
      steps,
      deltaA === 1 || deltaA === deltaB ? 'الخطوة / الأسبوع' : 'المقدار الأول',
      'المقدار الناتج'
    );
    return {
      kind: 'pattern_table',
      title: 'المُصوِّر البصري: جدول النمط والتمثيل البياني',
      subtitle: 'تتبّع القاعدة الثابتة بين الصفوف وشاهد نمو الأعمدة البيانية حتى الوصول للحل',
      lesson: 5,
      patternTable
    };
  }

  const targetNum =
    queryNums.find((n) => n >= 100) ??
    allNums.find((n) => n >= 100) ??
    45308192;
  const focusDigit = queryNums.find((n) => n >= 0 && n <= 9);
  const placeValue = buildPlaceValueDiagram(targetNum, focusDigit);

  return {
    kind: 'place_value',
    title: 'المُصوِّر البصري: لوحة المنازل والتمثيل البياني',
    subtitle: 'اضغط على أي رقم في العدد لاستكشاف دورته ومنزلته وعدد أصفاره الحافظة',
    lesson: lesson || 1,
    placeValue
  };
}

