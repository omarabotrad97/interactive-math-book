export interface AITutorResponse {
  text: string;
  isFallback: boolean;
}

export interface StudentContext {
  studentName: string;
  score: number;
  completedCount: number;
  weakSkillLabel: string;
  currentStationTitle: string;
}

export function buildLocalPedagogicalAnswer(
  userQuery: string,
  ctx: StudentContext
): string {
  const q = userQuery.trim().toLowerCase();
  const name = ctx.studentName || 'يا بطل';

  if (q.includes('اشرح') || q.includes('وضح') || q.includes('فهم')) {
    return (
      `بكل سرور يا ${name}! في درس الملايين نقسم أي عدد من اليمين إلى دورات ثلاثية: ` +
      `1. دورة الآحاد (آحاد، عشرات، مئات). ` +
      `2. دورة الألوف (آحاد الألوف، عشرات الألوف، مئات الألوف). ` +
      `3. دورة الملايين (آحاد الملايين، عشرات الملايين، مئات الملايين). ` +
      `لقراءة أي عدد، نبدأ دائماً من الدورة الأكبر يساراً ثم التي تليها.`
    );
  }

  if (q.includes('تلميح') || q.includes('ساعد') || q.includes('كيف احل')) {
    return (
      `تلميح سقراطي ذكي يا ${name}: حدّد أولاً الدورة التي يقع فيها الرقم (الآحاد أم الألوف أم الملايين)، ` +
      `ثم استبدل كل رقم على يمينه بصفر لتحصل على قيمته المنزلية بدقة. كم رقماً يقع على يمين الرقم المطلوب؟`
    );
  }

  if (q.includes('شخص') || q.includes('مستوى') || q.includes('اداء') || q.includes('مهارة')) {
    return (
      `تحليل مستواك الشخصي يا ${name}: نقاطك الحالية هي ${ctx.score} نقطة، ` +
      `وأنجزت ${ctx.completedCount} من 12 مهمة. ` +
      `مهارتك الأجدر بالتركيز الآن هي «${ctx.weakSkillLabel}». تدرب عليها في تبويب التحدي لرفع إتقانك!`
    );
  }

  if (q.includes('صيغة') || q.includes('تحليل') || q.includes('قياس') || q.includes('لفظ')) {
    return (
      `للأعداد ثلاث صيغ رئيسية يا ${name}: ` +
      `1. الصيغة القياسية: كتابة العدد بالأرقام مثل 2,450,000. ` +
      `2. الصيغة اللفظية: كتابة العدد بالكلمات. ` +
      `3. الصيغة التحليلية: كتابة العدد كمجموع قيم أرقامه (مثل 2,000,000 + 400,000 + 50,000).`
    );
  }

  return (
    `أهلاً بك يا ${name}! أنا معك خطوة بخطوة في محطة «${ctx.currentStationTitle}». ` +
    `تذكّر دائماً: عند كتابة أي عدد بالصيغة التحليلية، نهمل المنازل التي تحتوي على الرقم صفر لأن قيمتها صفر.`
  );
}

export async function askGeminiTutor(
  userPrompt: string,
  ctx: StudentContext,
  apiKey: string,
  model: string = 'gemini-3.5-flash-lite'
): Promise<AITutorResponse> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return {
      text: buildLocalPedagogicalAnswer(userPrompt, ctx),
      isFallback: true,
    };
  }

  const systemInstruction = [
    'أنت «البومة الحكيمة»، المعلم الذكي في كتاب الرياضيات التفاعلي للصف الخامس الأردني (درس: القيمة المنزلية ضمن الملايين).',
    `بيانات الطالب: اسمه «${ctx.studentName || 'بطل الأعداد'}»، نقاطه ${ctx.score}، مهام أنجزها ${ctx.completedCount}/12، ومهارة التركيز: «${ctx.weakSkillLabel}».`,
    `نشاطه الحالي: محطة «${ctx.currentStationTitle}».`,
    'قواعدك التربوية:',
    '1. أجب بلغة عربية فصحى مشجعة وواضحة في 2 إلى 4 جمل.',
    '2. لا تعطِ الإجابة النهائية الجاهزة مباشرة، بل استخدم الأسلوب السقراطي لتوجيهه خطوة بخطوة.',
    '3. ممنوع استخدام أي رموز إيموجي نهائياً في الإجابة.',
  ].join('\n');

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      const clean = candidate.replace(
        /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu,
        ''
      );
      return { text: clean.trim(), isFallback: false };
    }
    throw new Error('Empty response');
  } catch {
    return {
      text: buildLocalPedagogicalAnswer(userPrompt, ctx),
      isFallback: true,
    };
  }
}
