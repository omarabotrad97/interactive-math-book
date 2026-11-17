// Service for evaluating student-produced Arabic math reading and justifications.
// Supports deterministic local Arabic NLP with optional Gemini API semantic assessment.
// Zero-emoji policy strictly enforced.

export interface NumberReadingEvaluation {
  status: 'correct' | 'partial' | 'error' | 'unclear' | 'empty';
  feedback: string;
  isAIEvaluated?: boolean;
}

export interface JustificationEvaluation {
  status: 'correct' | 'incomplete' | 'insufficient' | 'misconception' | 'incorrect' | 'unclear' | 'empty';
  feedback: string;
  isAIEvaluated?: boolean;
}

export function normalizeArabicText(text: string): string {
  if (!text) return '';
  let str = text;
  // Remove diacritics
  str = str.replace(/[\u064B-\u065F\u0670]/g, '');
  // Normalize hamzas
  str = str.replace(/[إأآا]/g, 'ا');
  // Normalize taa marbuta
  str = str.replace(/[ة]/g, 'ه');
  // Normalize alif maqsura
  str = str.replace(/[ى]/g, 'ي');
  // Normalize punctuation to spaces
  str = str.replace(/[,،؛.\-_'"?!]/g, ' ');
  // Convert Eastern Arabic numerals to standard
  str = str.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));
  str = str.replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776));
  // Compress whitespace
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function evaluateLocalNumberReading(
  rawInput: string,
  targetNumber: number
): NumberReadingEvaluation {
  const norm = normalizeArabicText(rawInput);
  if (!norm) {
    return {
      status: 'empty',
      feedback: 'يرجى إدخال قراءتك للعدد أولاً.',
    };
  }

  if (targetNumber === 3040125 || targetNumber === 7060314) {
    // 7-digit numbers with internal zero in thousands
    const is3M = targetNumber === 3040125;
    const millionsPattern = is3M ? /ثلاث(ه)?\s+ملايين|3\s+ملايين/ : /سبع(ه)?\s+ملايين|7\s+ملايين/;
    const thousandsPattern = is3M ? /اربع(ون|ين)\s+الف/ : /ست(ون|ين)\s+الف/;
    const onesPattern = is3M ? /م(ئ|ائ)ه\s+و\s*خمس(ه)?\s+و\s*عشر(ون|ين)|125/ : /ثلاث\s*م(ئ|ائ)ه\s+و\s*اربع(ه)?\s+عشر|314/;

    if (norm.includes('مليون') && norm.includes('اربعون مليون')) {
      return {
        status: 'error',
        feedback: 'انتبه لدورات العدد: الرقم يقع في دورة الألوف وليس في دورة الملايين.',
      };
    }

    const hasM = millionsPattern.test(norm);
    const hasT = thousandsPattern.test(norm);
    const hasO = onesPattern.test(norm);

    if (hasM && hasT && hasO) {
      return {
        status: 'correct',
        feedback: 'قراءة ممتازة ودقيقة للعدد من سبع خانات! قرأت دورة الملايين ثم الألوف ثم الآحاد بالترتيب السليم.',
      };
    }
    if (!hasM) {
      return {
        status: 'partial',
        feedback: 'ابدأ بقراءة دورة الملايين أولاً على اليسار.',
      };
    }
    if (!hasT) {
      return {
        status: 'partial',
        feedback: 'اقرأ دورة الألوف في الوسط بدقة (لاحظ وجود الصفر).',
      };
    }
    return {
      status: 'partial',
      feedback: 'أكمل قراءة دورة الآحاد في نهاية العدد.',
    };
  }

  if (targetNumber === 25000084 || targetNumber === 42000019) {
    // 8-digit numbers with full zero thousands cycle
    const is25M = targetNumber === 25000084;
    const millionsPattern = is25M ? /خمس(ه)?\s+و\s*عشر(ون|ين)\s+مليون/ : /اثن(ان|ين)\s+و\s*اربع(ون|ين)\s+مليون/;
    const onesPattern = is25M ? /اربع(ه)?\s+و\s*ثمان(ون|ين)/ : /تسع(ه)?\s+عشر/;
    const mentionsNonZeroThousands = /(خمس|ست|سبع|ثمان|تسع|عشر|م(ئ|ائ)|الف|الاف)\s+الف/.test(norm) && !/صفر\s+الف/.test(norm);

    if (mentionsNonZeroThousands) {
      return {
        status: 'error',
        feedback: 'لاحظ أن دورة الألوف كلها أصفار (000)، لذلك لا نذكر الألوف في القراءة وننتقل مباشرة إلى دورة الآحاد.',
      };
    }

    const hasM = millionsPattern.test(norm);
    const hasO = onesPattern.test(norm);

    if (hasM && hasO) {
      return {
        status: 'correct',
        feedback: 'رائع جداً! تجاوزت دورة الألوف الصفرية بذكاء وقرأت الملايين والآحاد بشكل صحيح.',
      };
    }
    if (!hasM) {
      return {
        status: 'partial',
        feedback: 'اقرأ دورة الملايين أولاً من خانتين.',
      };
    }
    return {
      status: 'partial',
      feedback: 'اقرأ دورة الآحاد في نهاية العدد.',
    };
  }

  if (targetNumber === 604200007 || targetNumber === 805400003) {
    // 9-digit numbers with multiple internal zeros
    const is604M = targetNumber === 604200007;
    const millionsPattern = is604M ? /ست\s*م(ئ|ائ)ه\s+و\s*اربع(ه)?\s+ملايين/ : /ثمان\s*م(ئ|ائ)ه\s+و\s*خمس(ه)?\s+ملايين/;
    const thousandsPattern = is604M ? /م(ئ|ائ)ت(ا|ان|ي|ين)\s+الف/ : /اربع\s*م(ئ|ائ)ه\s+الف/;
    const onesPattern = is604M ? /سبع(ه)?/ : /ثلاث(ه)?/;

    const hasM = millionsPattern.test(norm);
    const hasT = thousandsPattern.test(norm);
    const hasO = onesPattern.test(norm);

    if (hasM && hasT && hasO) {
      return {
        status: 'correct',
        feedback: 'إتقان مذهل لقراءة عدد من تسع خانات مع أصفار داخلية! أنت بطل حقيقي في الملايين.',
      };
    }
    if (!hasM) {
      return {
        status: 'partial',
        feedback: 'اقرأ دورة الملايين المكونة من ثلاث خانات مع الصفر في العشرات.',
      };
    }
    if (!hasT) {
      return {
        status: 'partial',
        feedback: 'اقرأ دورة الألوف بدقة.',
      };
    }
    return {
      status: 'partial',
      feedback: 'اقرأ دورة الآحاد في اليمين.',
    };
  }

  return {
    status: 'unclear',
    feedback: 'أعد قراءة العدد بدقة بدءاً من الملايين يساراً ثم الألوف ثم الآحاد.',
  };
}

export function evaluateLocalJustification(
  rawInput: string,
  targetDigit: number = 9
): JustificationEvaluation {
  const norm = normalizeArabicText(rawInput);
  if (!norm) {
    return {
      status: 'empty',
      feedback: 'يرجى كتابة تبريرك الرياضي أولاً.',
    };
  }

  // 1. Contradiction check: negation before thousands place
  const negationPattern = /(ليس|ليست|غير|لا يقع|لا تقع)\s+(في\s+)?(احاد\s+)?الالوف/;
  if (negationPattern.test(norm)) {
    return {
      status: 'incorrect',
      feedback: 'الرقم يقع بالفعل في آحاد الألوف في العددين. تتبع منازل العددين بدقة.',
    };
  }

  // 2. Misconception: numbers are equal
  if (/العدد(ين|ان)\s+متساوي(ان|ين)/.test(norm) || /متساوي(ان|ين)\s+في\s+كل\s+شيء/.test(norm)) {
    return {
      status: 'misconception',
      feedback: 'انتبه يا بطل: العددان مختلفان في الطول والقيمة الكلية، بينما قيمة الرقم 9 فقط هي المتساوية. لماذا تتساوى قيمته المنزلية؟',
    };
  }

  // 3. Insufficient: because it is the same digit
  const isSameDigitOnly = /(لانه|لانها)\s+(نفس\s+الرقم|الرقم\s+نفسه|الرقم\s+9)/.test(norm) || /كلاهما\s+9/.test(norm);
  const mentionsPlace = /(احاد\s+)?الالوف|منزله|خانه|بيوت/.test(norm);
  const mentionsZerosOrDigitsCount = /(3|ثلاث|ثلاثه)\s+(خانات|منازل|ارقام|اصفار)/.test(norm);

  if (isSameDigitOnly && !mentionsPlace && !mentionsZerosOrDigitsCount) {
    return {
      status: 'insufficient',
      feedback: 'تبرير غير كافٍ يا بطل: الرقم نفسه تتغير قيمته تماماً إذا تغير مكانه (مثل 90 و 9,000). ما اسم المنزلة المشتركة للرقم 9 في العددين؟',
    };
  }

  // 4. Incomplete: mentions 9000 without explaining the place
  const mentions9000 = /9000|9\s*000|تسعه\s+الاف|تسعة\s+الاف/.test(norm);
  if (mentions9000 && !mentionsPlace && !mentionsZerosOrDigitsCount) {
    return {
      status: 'incomplete',
      feedback: 'نتيجة صحيحة (قيمته 9,000)! ولكن ما سبب ذلك؟ في أي منزلة يقع الرقم 9 في كلا العددين؟',
    };
  }

  // 5. Correct: mentions thousands place OR 3 digits/zeros to right
  const mentionsWrongPlace = /عشرات\s+الالوف|مئات\s+الالوف|عشرات|مئات|ملايين/.test(norm);
  if (!mentionsWrongPlace && (mentionsPlace || mentionsZerosOrDigitsCount)) {
    return {
      status: 'correct',
      feedback: 'أحسنت! تبرير رياضي دقيق: يقع الرقم 9 في منزلة آحاد الألوف في العددين على بعد 3 خانات من اليمين، لذلك قيمته 9,000 في كليهما بغض النظر عن طول العدد.',
    };
  }

  return {
    status: 'unclear',
    feedback: 'وضّح إجابتك أكثر: اذكر اسم المنزلة التي يقع فيها الرقم 9 في كلا العددين.',
  };
}

export async function evaluateWithGemini(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<string | null> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) return null;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      cleanKey
    )}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

export async function evaluateArabicNumberReading(
  input: string,
  targetNumber: number,
  apiKey?: string
): Promise<NumberReadingEvaluation> {
  const localRes = evaluateLocalNumberReading(input, targetNumber);
  if (!apiKey) return localRes;

  const systemPrompt = [
    'أنت معلم رياضيات ذكي للصف الخامس. قيّم قراءة الطالب للعدد باللغة العربية.',
    `العدد المطلوب: ${targetNumber}.`,
    'أجب بصيغة JSON تحتوي:',
    '{"status": "correct"|"partial"|"error", "feedback": "تغذية راجعة مشجعة باللغة العربية الفصحى بدون إيموجي"}',
    'لا تستخدم أي إيموجي نهائياً.',
  ].join('\n');

  const geminiText = await evaluateWithGemini(input, systemPrompt, apiKey);
  if (geminiText) {
    try {
      const parsed = JSON.parse(geminiText.replace(/```json|```/g, '').trim());
      if (parsed.status && parsed.feedback) {
        return {
          status: parsed.status,
          feedback: parsed.feedback,
          isAIEvaluated: true,
        };
      }
    } catch {}
  }

  return localRes;
}

export async function evaluatePlaceValueJustification(
  input: string,
  comparePair: [number, number],
  targetDigit: number,
  apiKey?: string
): Promise<JustificationEvaluation> {
  const localRes = evaluateLocalJustification(input, targetDigit);
  if (!apiKey) return localRes;

  const systemPrompt = [
    'أنت معلم رياضيات للصف الخامس. السؤال: قيمة الرقم 9 متساوية في العددين 9,605 و 149,605 لأن...',
    'صنّف الإجابة إلى إحدى الحالات التالية:',
    '- correct: إذا ذكر أن الرقم يقع في آحاد الألوف في العددين أو على يمينه 3 خانات.',
    '- incomplete: إذا ذكر النتيجة (قيمته 9000) دون ذكر المنزلة.',
    '- insufficient: إذا قال فقط لأنه نفس الرقم.',
    '- misconception: إذا قال لأن العددين متساويان.',
    '- incorrect: إذا كان هناك تناقض رياضي أو نفي خاطئ.',
    'أجب بصيغة JSON: {"status": "...", "feedback": "جملة عربية مشجعة بدون إيموجي"}',
  ].join('\n');

  const geminiText = await evaluateWithGemini(input, systemPrompt, apiKey);
  if (geminiText) {
    try {
      const parsed = JSON.parse(geminiText.replace(/```json|```/g, '').trim());
      if (parsed.status && parsed.feedback) {
        return {
          status: parsed.status,
          feedback: parsed.feedback,
          isAIEvaluated: true,
        };
      }
    } catch {}
  }

  return localRes;
}
