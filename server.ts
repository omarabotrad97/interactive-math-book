import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from '@google/genai';
import type { Content, LiveServerMessage, Session } from '@google/genai';
import {
  ALLOWED_CHAT_MODELS,
  ALLOWED_TTS_MODELS,
  ALLOWED_VOICES,
  LESSON_CATALOG,
  LIVE_VOICE_MODEL,
  buildTutorSystemInstruction,
  buildVisualDiagramSpec,
  ensureWavAudioBase64,
  generateDeterministicLessonQuiz,
  normalizeLessonNumber,
  sanitizeChatModel,
  sanitizeTtsModel,
  sanitizeVoiceName,
  stripEmojis
} from './lib/tutor-engine.ts';
import type { StudentSlideContext, VisualDiagramKind } from './lib/tutor-engine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

class MissingApiKeyError extends Error {
  statusCode: number;
  constructor() {
    super('مفتاح GEMINI_API_KEY غير مضبوط على الخادم. يرجى إضافته في إعدادات البيئة (Settings > Secrets).');
    this.name = 'MissingApiKeyError';
    this.statusCode = 503;
  }
}

let cachedClient: GoogleGenAI | null = null;
let cachedKey = '';
const cachedLiveClients = new Map<string, GoogleGenAI>();

function getApiKey(): string {
  return (process.env.GEMINI_API_KEY || '').trim();
}

function getGenAI(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new MissingApiKeyError();
  }
  if (!cachedClient || cachedKey !== key) {
    cachedClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    cachedKey = key;
    cachedLiveClients.clear();
  }
  return cachedClient;
}

function getLiveGenAI(apiVersion: 'v1beta' | 'v1alpha' = 'v1beta'): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new MissingApiKeyError();
  }
  const cacheId = `${apiVersion}:${key}`;
  const existing = cachedLiveClients.get(cacheId);
  if (existing) {
    return existing;
  }

  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      apiVersion,
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  // Fix @google/genai v3 URL.toString() trailing slash producing "//ws/..." 404 on BidiGenerateContent
  const liveInternal = client.live as unknown as {
    apiClient?: { getWebsocketBaseUrl?: () => string };
  };
  if (liveInternal?.apiClient && typeof liveInternal.apiClient.getWebsocketBaseUrl === 'function') {
    const origGetWsUrl = liveInternal.apiClient.getWebsocketBaseUrl.bind(liveInternal.apiClient);
    liveInternal.apiClient.getWebsocketBaseUrl = () => origGetWsUrl().replace(/\/+$/, '');
  }

  cachedLiveClients.set(cacheId, client);
  return client;
}

function getOrderedChatModels(requested?: string): string[] {
  const primary = sanitizeChatModel(requested);
  const others = ALLOWED_CHAT_MODELS.filter((m) => m !== primary);
  return [primary, ...others];
}

function getOrderedTtsModels(requested?: string): string[] {
  const primary = sanitizeTtsModel(requested);
  const others = ALLOWED_TTS_MODELS.filter((m) => m !== primary);
  return [primary, ...others];
}

function extractErrorDetails(err: unknown): {
  status: number;
  message: string;
  code: string;
  transient: boolean;
} {
  if (err instanceof MissingApiKeyError) {
    return { status: 503, message: err.message, code: 'MISSING_API_KEY', transient: false };
  }
  const anyErr = err as { status?: number; statusCode?: number; message?: string } | undefined;
  const rawMsg = anyErr?.message ? String(anyErr.message) : '';
  const rawStatus = Number(anyErr?.status || anyErr?.statusCode || 500);
  const isRateLimit = rawStatus === 429 || /429|RESOURCE_EXHAUSTED|quota/i.test(rawMsg);
  const isUnavailable =
    rawStatus === 503 ||
    rawStatus === 502 ||
    rawStatus === 504 ||
    /503|UNAVAILABLE|high demand|overloaded|DEADLINE_EXCEEDED|fetch failed/i.test(rawMsg);

  if (isRateLimit) {
    return {
      status: 429,
      message: 'تم الوصول مؤقتاً إلى حد الطلبات السريعة؛ يرجى المحاولة بعد لحظات.',
      code: 'RATE_LIMIT',
      transient: true
    };
  }
  if (isUnavailable) {
    return {
      status: 503,
      message: 'نموذج الذكاء الاصطناعي يشهد ضغطاً مؤقتاً حالياً؛ جرّب مرة أخرى بعد ثوانٍ.',
      code: 'TRANSIENT_UNAVAILABLE',
      transient: true
    };
  }

  const status = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
  return {
    status,
    message: 'تعذّر إتمام الطلب عبر خدمة المعلم الذكي حالياً، حاول مرة أخرى.',
    code: 'UPSTREAM_ERROR',
    transient: false
  };
}

app.get('/api/ai/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    configured: Boolean(getApiKey()),
    models: ALLOWED_CHAT_MODELS,
    ttsModels: ALLOWED_TTS_MODELS,
    voices: ALLOWED_VOICES,
    liveModel: LIVE_VOICE_MODEL
  });
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    message?: string;
    history?: Array<{ role?: string; text?: string }>;
    context?: StudentSlideContext;
    model?: string;
  };

  const userMessage = String(body.message || '').trim();
  if (!userMessage) {
    res.status(400).json({ error: 'يرجى كتابة سؤالك للمعلم الذكي أولاً.' });
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    const details = extractErrorDetails(err);
    res.status(details.status).json({ error: details.message, code: details.code });
    return;
  }

  const candidateModels = getOrderedChatModels(body.model);
  const systemInstruction = buildTutorSystemInstruction(body.context, 'chat');

  const contents: Content[] = [];
  if (Array.isArray(body.history)) {
    for (const item of body.history.slice(-10)) {
      const txt = String(item?.text || '').trim();
      if (!txt) continue;
      const role = item?.role === 'assistant' || item?.role === 'model' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: txt }] });
    }
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Immediately stream the interactive visual diagram spec matching the student's query and slide
  const visualSpec = buildVisualDiagramSpec(userMessage, body.context);
  res.write(`data: ${JSON.stringify({ visual: visualSpec })}\n\n`);

  let streamedAnyText = false;
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      for await (const chunk of stream) {
        const textPart = chunk.text ? stripEmojis(chunk.text) : '';
        if (textPart) {
          streamedAnyText = true;
          res.write(`data: ${JSON.stringify({ delta: textPart, model: modelName })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, model: modelName })}\n\n`);
      res.end();
      return;
    } catch (err) {
      lastError = err;
      if (streamedAnyText) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    }
  }

  const details = extractErrorDetails(lastError);
  if (details.transient) {
    res.write(`data: ${JSON.stringify({ fallback: true, code: details.code })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  res.write(`data: ${JSON.stringify({ error: details.message, code: details.code })}\n\n`);
  res.end();
});

app.post('/api/ai/visualize', (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    query?: string;
    context?: StudentSlideContext;
    kind?: VisualDiagramKind;
  };
  const visual = buildVisualDiagramSpec(String(body.query || ''), body.context, body.kind);
  res.json({ visual });
});

app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    context?: StudentSlideContext;
    model?: string;
    variant?: number;
  };

  const ctx = body.context || {};
  const lessonNum = normalizeLessonNumber(ctx.lesson);
  const lessonInfo = LESSON_CATALOG[lessonNum];

  if (!getApiKey()) {
    const fallbackQuiz = generateDeterministicLessonQuiz(lessonNum, body.variant ?? Date.now());
    res.json({ quiz: fallbackQuiz, source: 'curriculum' });
    return;
  }

  const ai = getGenAI();
  const candidateModels = getOrderedChatModels(body.model);
  const systemInstruction = buildTutorSystemInstruction(ctx, 'chat');

  const prompt = [
    `أنشئ سؤال اختيار من متعدد واحداً جديداً ومبتكراً لطالب الصف الخامس في درس «${lessonInfo.title}».`,
    ctx.slideTitle ? `اربط السؤال بمفهوم الشريحة الحالية: «${ctx.slideTitle}».` : '',
    ctx.questionPrompt ? `السؤال المعروض حالياً في الشريحة: «${ctx.questionPrompt}» (أنشئ سؤالاً مشابهاً بأعداد مختلفة).` : '',
    ctx.slideBody ? `تفاصيل الشريحة: ${ctx.slideBody}` : '',
    ctx.weakSkillLabel ? `ركّز على تقوية مهارة: «${ctx.weakSkillLabel}».` : '',
    'يجب أن يتكون السؤال من 4 خيارات دقيقة وواضحة أحدها فقط صحيح، مع شرح تربوي مختصر لسبب صحة الإجابة بدون أي إيموجي.'
  ]
    .filter(Boolean)
    .join('\n');

  let lastError: unknown = null;
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intro: {
                type: Type.STRING,
                description: 'مقدمة قصيرة مشجعة للسؤال بدون إيموجي'
              },
              question: {
                type: Type.STRING,
                description: 'نص السؤال الرياضي الواضح'
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'أربعة خيارات بالضبط'
              },
              correctIndex: {
                type: Type.INTEGER,
                description: 'فهرس الإجابة الصحيحة من 0 إلى 3'
              },
              explanation: {
                type: Type.STRING,
                description: 'شرح سبب صحة الإجابة بلغة مبسطة بدون إيموجي'
              }
            },
            required: ['intro', 'question', 'options', 'correctIndex', 'explanation']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}') as {
        intro?: string;
        question?: string;
        options?: string[];
        correctIndex?: number;
        explanation?: string;
      };

      if (
        !parsed.question ||
        !Array.isArray(parsed.options) ||
        parsed.options.length < 2 ||
        typeof parsed.correctIndex !== 'number'
      ) {
        throw new Error('استجابة السؤال التوليدي غير مكتملة.');
      }

      const cleanOptions = parsed.options.slice(0, 4).map((o) => stripEmojis(String(o)));
      const safeIdx = Math.max(0, Math.min(cleanOptions.length - 1, Math.trunc(parsed.correctIndex)));

      res.json({
        quiz: {
          id: `ai_${lessonNum}_${Date.now()}`,
          intro: stripEmojis(parsed.intro || `سؤال مخصص في «${lessonInfo.title}»:`),
          question: stripEmojis(parsed.question),
          options: cleanOptions,
          correctIndex: safeIdx,
          explanation: stripEmojis(parsed.explanation || '')
        },
        source: 'gemini',
        model: modelName
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback to deterministic curriculum quiz so the student never hits a dead-end during demand spikes
  const details = extractErrorDetails(lastError);
  if (details.transient || details.status >= 500) {
    const fallbackQuiz = generateDeterministicLessonQuiz(lessonNum, body.variant ?? Date.now());
    res.json({ quiz: fallbackQuiz, source: 'curriculum_fallback' });
    return;
  }

  res.status(details.status).json({ error: details.message, code: details.code });
});

async function synthesizeViaLiveApi(
  cleanText: string,
  voiceName: string
): Promise<{ audioBase64: string; mimeType: string; model: string }> {
  const runWithVersion = (apiVersion: 'v1beta' | 'v1alpha') =>
    new Promise<{ audioBase64: string; mimeType: string; model: string }>((resolve, reject) => {
      const ai = getLiveGenAI(apiVersion);
      const pcmBuffers: Buffer[] = [];
      let settled = false;
      let sessionRef: Session | null = null;

      const finish = (err?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (sessionRef) {
          try {
            sessionRef.close();
          } catch {}
        }
        if (err) {
          reject(err);
          return;
        }
        if (pcmBuffers.length === 0) {
          reject(new Error('No audio chunks received from Live API'));
          return;
        }
        const combinedPcm = Buffer.concat(pcmBuffers).toString('base64');
        const wavPayload = ensureWavAudioBase64(combinedPcm, 'audio/pcm;rate=24000');
        resolve({
          audioBase64: wavPayload.audioBase64,
          mimeType: wavPayload.mimeType,
          model: LIVE_VOICE_MODEL
        });
      };

      const timer = setTimeout(() => {
        if (pcmBuffers.length > 0) {
          finish();
        } else {
          finish(new Error('Live TTS timeout'));
        }
      }, 12000);

      ai.live
        .connect({
          model: LIVE_VOICE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
              }
            },
            systemInstruction:
              'أنت قارئ صوتي ناطق باللغة العربية الفصحى الواضحة. مهمتك الوحيدة قراءة النص الذي يرسله المستخدم كما هو بوضوح وهدوء دون إضافة أي كلمات من عندك.'
          },
          callbacks: {
            onopen: () => {},
            onmessage: (message: LiveServerMessage) => {
              const content = message.serverContent;
              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  pcmBuffers.push(Buffer.from(part.inlineData.data, 'base64'));
                }
              }
              if (content?.turnComplete) {
                finish();
              }
            },
            onerror: (err: unknown) => {
              finish(err);
            },
            onclose: () => {
              if (pcmBuffers.length > 0) {
                finish();
              } else {
                finish(new Error('Live session closed before audio'));
              }
            }
          }
        })
        .then((session) => {
          sessionRef = session;
          session.sendRealtimeInput({
            text: `اقرأ هذا النص فقط كما هو: ${cleanText}`
          });
        })
        .catch((err) => finish(err));
    });

  try {
    return await runWithVersion('v1beta');
  } catch {
    return await runWithVersion('v1alpha');
  }
}

app.post('/api/ai/tts', async (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    text?: string;
    model?: string;
    voice?: string;
  };

  const rawClean = stripEmojis(String(body.text || '').replace(/\s+/g, ' ').trim());
  const cleanText = rawClean.length > 360 ? rawClean.slice(0, 360) : rawClean;
  if (!cleanText) {
    res.status(400).json({ error: 'النص المطلوب قراءته فارغ.' });
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    const details = extractErrorDetails(err);
    res.status(details.status).json({ error: details.message, code: details.code });
    return;
  }

  const candidateModels = getOrderedTtsModels(body.model);
  const voiceName = sanitizeVoiceName(body.voice);
  let lastError: unknown = null;

  for (const ttsModel of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanText }]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        const wavPayload = ensureWavAudioBase64(inlineData.data, inlineData.mimeType);
        res.json({
          audioBase64: wavPayload.audioBase64,
          mimeType: wavPayload.mimeType,
          model: ttsModel
        });
        return;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback to Gemini Live Audio synthesis so TTS always returns high-quality WAV audio
  try {
    const liveWav = await synthesizeViaLiveApi(cleanText, voiceName);
    res.json(liveWav);
    return;
  } catch (liveErr) {
    lastError = lastError || liveErr;
  }

  const details = extractErrorDetails(lastError);
  res.status(details.status).json({ error: details.message, code: details.code });
});

app.post('/api/ai/evaluate-text', async (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    prompt?: string;
    systemInstruction?: string;
  };

  const prompt = String(body.prompt || '').trim();
  const sys = String(body.systemInstruction || 'أنت معلم رياضيات للصف الخامس الابتدائي.').trim();
  if (!prompt) {
    res.status(400).json({ error: 'النص المطلوب تقييمه فارغ.' });
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    const details = extractErrorDetails(err);
    res.status(details.status).json({ error: details.message, code: details.code });
    return;
  }

  let lastError: unknown = null;
  for (const modelName of ALLOWED_CHAT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: sys,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.STRING,
                description: 'حالة التقييم مثل correct أو partial أو incomplete أو error'
              },
              feedback: {
                type: Type.STRING,
                description: 'تغذية راجعة عربية قصيرة ومشجعة بدون إيموجي'
              }
            },
            required: ['status', 'feedback']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}') as { status?: string; feedback?: string };
      res.json({
        status: parsed.status || 'partial',
        feedback: stripEmojis(parsed.feedback || '')
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const details = extractErrorDetails(lastError);
  res.status(details.status).json({ error: details.message, code: details.code });
});

app.post('/api/ai/evaluate-audio', async (req: Request, res: Response) => {
  const body = (req.body || {}) as {
    audioBase64?: string;
    mimeType?: string;
    targetVal?: string | number;
    expectedWords?: string;
    mode?: 'reading' | 'explain';
  };

  const audioBase64 = String(body.audioBase64 || '').trim();
  if (!audioBase64) {
    res.status(400).json({ error: 'التسجيل الصوتي غير متوفر.' });
    return;
  }

  const mode = body.mode === 'explain' ? 'explain' : 'reading';
  const targetVal = String(body.targetVal ?? '');
  const expectedWords = String(body.expectedWords ?? '');

  const prompt =
    mode === 'reading'
      ? `أنت معلم رياضيات ذكي للصف الخامس الابتدائي. استمع جيداً لهذا التسجيل الصوتي للطالب.
العدد المطلوب قراءته باللغة العربية الفصحى هو: ${targetVal}${expectedWords ? ` (${expectedWords})` : ''}.
1. استخرج النص الدقيق لما نطق به الطالب في transcript.
2. قيّم صحة القراءة في status بالقيمة "correct" أو "partial" أو "error".
3. اكتب جملة تشجيعية توجيهية قصيرة بالعربية الفصحى بدون أي إيموجي في feedback.`
      : `أنت معلم رياضيات ذكي للصف الخامس الابتدائي. استمع لتسجيل الطالب لتبرير: هل تتساوى القيمة المنزلية للرقم ${targetVal || '9'} في العددين 9,605 و 149,605 ولماذا؟
1. استخرج النص الدقيق لما نطق به الطالب في transcript.
2. قيّم التبرير في status بالقيمة "correct" (إذا وضّح وقوعه في منزلة آحاد الألوف أو 3 خانات يمينه في العددين) أو "incomplete" أو "insufficient" أو "misconception".
3. اكتب جملة عربية مشجعة وموجهة بدون إيموجي في feedback.`;

  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    const details = extractErrorDetails(err);
    res.status(details.status).json({ error: details.message, code: details.code });
    return;
  }

  let lastError: unknown = null;
  for (const modelName of ALLOWED_CHAT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: body.mimeType || 'audio/webm',
                  data: audioBase64
                }
              },
              { text: prompt }
            ]
          }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING },
              status: { type: Type.STRING },
              feedback: { type: Type.STRING }
            },
            required: ['transcript', 'status', 'feedback']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}') as {
        transcript?: string;
        status?: string;
        feedback?: string;
      };

      res.json({
        transcript: stripEmojis(parsed.transcript || ''),
        status: parsed.status || 'partial',
        feedback: stripEmojis(parsed.feedback || '')
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const details = extractErrorDetails(lastError);
  res.status(details.status).json({ error: details.message, code: details.code });
});

// Protect internal directories/files and serve static frontend assets
app.use((req, res, next) => {
  if (
    req.path === '/book-mobile' ||
    req.path.startsWith('/book-mobile/') ||
    req.path.startsWith('/node_modules/') ||
    req.path.startsWith('/lib/') ||
    req.path.startsWith('/.git') ||
    req.path.startsWith('/.agents') ||
    req.path === '/package.json' ||
    req.path === '/package-lock.json' ||
    req.path === '/tsconfig.json' ||
    req.path === '/metadata.json' ||
    req.path === '/server.ts'
  ) {
    res.status(404).send('Not found');
    return;
  }
  next();
});

app.use(
  express.static(__dirname, {
    extensions: ['html'],
    dotfiles: 'ignore',
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (/\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  })
);

app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'مسار API غير موجود.' });
    return;
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

const httpServer = http.createServer(app);

// Gemini Live API WebSocket Bridge (/ws/live) -> model: gemini-3.8-live
const wss = new WebSocketServer({ server: httpServer, path: '/ws/live' });

wss.on('connection', (clientWs: WebSocket) => {
  let sessionPromise: Promise<Session> | null = null;
  let closed = false;

  const sendJson = (payload: Record<string, unknown>) => {
    if (!closed && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify(payload));
    }
  };

  const connectLiveWithVersion = (
    apiVersion: 'v1beta' | 'v1alpha',
    ctx?: StudentSlideContext,
    voice?: string
  ): Promise<Session> => {
    const ai = getLiveGenAI(apiVersion);
    const voiceName = sanitizeVoiceName(voice);
    const systemInstruction = buildTutorSystemInstruction(ctx, 'live');
    let setupFinished = false;

    return ai.live
      .connect({
        model: LIVE_VOICE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction
        },
        callbacks: {
          onopen: () => {},
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendJson({
                type: 'inputTranscript',
                text: stripEmojis(content.inputTranscription.text)
              });
            }
            if (content?.outputTranscription?.text) {
              sendJson({
                type: 'outputTranscript',
                text: stripEmojis(content.outputTranscription.text)
              });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson({
                  type: 'audio',
                  audio: part.inlineData.data
                });
              }
            }
            if (content?.interrupted) {
              sendJson({ type: 'interrupted', interrupted: true });
            }
            if (content?.turnComplete) {
              sendJson({ type: 'turnComplete', turnComplete: true });
            }
          },
          onerror: (err: unknown) => {
            if (!setupFinished) return;
            const details = extractErrorDetails(err);
            sendJson({ type: 'error', error: details.message, code: details.code });
          },
          onclose: () => {
            if (setupFinished && !closed) {
              sendJson({ type: 'closed' });
            }
          }
        }
      })
      .then((session) => {
        setupFinished = true;
        sendJson({ type: 'ready', model: LIVE_VOICE_MODEL, voice: voiceName });
        return session;
      });
  };

  const ensureSession = (ctx?: StudentSlideContext, voice?: string): Promise<Session> => {
    if (sessionPromise) return sessionPromise;

    if (!getApiKey()) {
      return Promise.reject(new MissingApiKeyError());
    }

    sessionPromise = connectLiveWithVersion('v1beta', ctx, voice).catch(() =>
      connectLiveWithVersion('v1alpha', ctx, voice)
    );

    return sessionPromise;
  };

  clientWs.on('message', (rawData) => {
    let msg: {
      type?: string;
      audio?: string;
      text?: string;
      voice?: string;
      context?: StudentSlideContext;
      initialPrompt?: string;
    };
    try {
      msg = JSON.parse(rawData.toString());
    } catch {
      return;
    }

    if (msg.type === 'setup') {
      ensureSession(msg.context, msg.voice)
        .then((session) => {
          if (msg.initialPrompt && String(msg.initialPrompt).trim()) {
            session.sendRealtimeInput({ text: String(msg.initialPrompt).trim() });
          }
        })
        .catch((err) => {
          sessionPromise = null;
          const details = extractErrorDetails(err);
          sendJson({ type: 'error', error: details.message, code: details.code });
          clientWs.close();
        });
      return;
    }

    if (msg.audio) {
      ensureSession()
        .then((session) => {
          session.sendRealtimeInput({
            audio: {
              data: String(msg.audio),
              mimeType: 'audio/pcm;rate=16000'
            }
          });
        })
        .catch((err) => {
          const details = extractErrorDetails(err);
          sendJson({ type: 'error', error: details.message, code: details.code });
        });
      return;
    }

    if (msg.type === 'text' && msg.text) {
      ensureSession()
        .then((session) => {
          session.sendRealtimeInput({ text: String(msg.text).trim() });
        })
        .catch((err) => {
          const details = extractErrorDetails(err);
          sendJson({ type: 'error', error: details.message, code: details.code });
        });
    }
  });

  clientWs.on('close', () => {
    closed = true;
    if (sessionPromise) {
      sessionPromise.then((session) => session.close()).catch(() => {});
      sessionPromise = null;
    }
  });

  clientWs.on('error', () => {
    closed = true;
    if (sessionPromise) {
      sessionPromise.then((session) => session.close()).catch(() => {});
      sessionPromise = null;
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Interactive Math Book + Smart Tutor server listening on http://0.0.0.0:${PORT}`);
});
