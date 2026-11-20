import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LESSON_CATALOG,
  buildTutorSystemInstruction,
  buildVisualDiagramSpec,
  ensureWavAudioBase64,
  generateDeterministicLessonQuiz,
  normalizeLessonNumber,
  sanitizeChatModel,
  sanitizeTtsModel,
  sanitizeVoiceName,
  stripEmojis
} from './tutor-engine';

test('model and voice sanitizers enforce valid Gemini models and defaults', () => {
  assert.equal(sanitizeChatModel('gemini-4-hydrogen'), 'gemini-4-hydrogen');
  assert.equal(sanitizeChatModel('gemini-3.1-flash-lite'), 'gemini-3.1-flash-lite');
  assert.equal(sanitizeChatModel('gemini-2.0-flash'), 'gemini-4-hydrogen');
  assert.equal(sanitizeChatModel(undefined), 'gemini-4-hydrogen');

  assert.equal(sanitizeTtsModel('gemini-3.8-flash-tts'), 'gemini-3.8-flash-tts');
  assert.equal(sanitizeTtsModel('invalid-tts'), 'gemini-3.8-flash-lite-tts');

  assert.equal(sanitizeVoiceName('Zephyr'), 'Zephyr');
  assert.equal(sanitizeVoiceName('Puck'), 'Puck');
  assert.equal(sanitizeVoiceName('UnknownVoice'), 'Kore');
});

test('normalizeLessonNumber clamps invalid values to Lesson 1 and keeps Lessons 1-5', () => {
  for (let i = 1; i <= 5; i++) {
    assert.equal(normalizeLessonNumber(i), i);
    assert.ok(LESSON_CATALOG[i].title.length > 0);
  }
  assert.equal(normalizeLessonNumber(0), 1);
  assert.equal(normalizeLessonNumber(99), 1);
  assert.equal(normalizeLessonNumber(undefined), 1);
});

test('buildTutorSystemInstruction includes exact lesson curriculum, slide text, and live mode rules', () => {
  const sysChat = buildTutorSystemInstruction(
    {
      lesson: 2,
      stationTitle: 'لوحة المقارنة المنزلية',
      stepIndex: 2,
      totalSteps: 6,
      slideTitle: 'مقارنة عددين لهما نفس عدد المنازل',
      slideBody: 'نبدأ من أقصى اليسار حتى نجد أول رقم مختلف.',
      numbersInvolved: '3,456,210 و 3,759,120',
      studentName: 'سارة'
    },
    'chat'
  );

  assert.match(sysChat, /مقارنة الأعداد وترتيبها/);
  assert.match(sysChat, /سارة/);
  assert.match(sysChat, /الشريحة\/الخطوة 3 من 6/);
  assert.match(sysChat, /مقارنة عددين لهما نفس عدد المنازل/);
  assert.match(sysChat, /3,456,210 و 3,759,120/);

  const sysLive = buildTutorSystemInstruction(
    {
      lesson: 4,
      stationTitle: 'درجات الحرارة تحت الصفر',
      questionPrompt: 'ماذا يمثل العدد 0 في ميزان الحرارة؟'
    },
    'live'
  );

  assert.match(sysLive, /الأعداد السالبة/);
  assert.match(sysLive, /أسلوب المحادثة الصوتية المباشرة/);
  assert.match(sysLive, /ماذا يمثل العدد 0 في ميزان الحرارة؟/);
});

test('generateDeterministicLessonQuiz returns valid 4-option quizzes for all 5 lessons', () => {
  for (let lesson = 1; lesson <= 5; lesson++) {
    for (let variant = 0; variant < 2; variant++) {
      const quiz = generateDeterministicLessonQuiz(lesson, variant);
      assert.equal(quiz.options.length, 4);
      assert.ok(quiz.correctIndex >= 0 && quiz.correctIndex < 4);
      assert.ok(quiz.question.length > 5);
      assert.ok(quiz.explanation.length > 10);
      assert.equal(stripEmojis(quiz.explanation), quiz.explanation);
    }
  }
});

test('ensureWavAudioBase64 wraps raw 24kHz PCM16 audio in a valid 44-byte WAV RIFF header and is idempotent', () => {
  const rawSamples = Buffer.alloc(480); // 240 16-bit samples
  const rawB64 = rawSamples.toString('base64');

  const wrapped = ensureWavAudioBase64(rawB64, 'audio/L16;codec=pcm;rate=24000');
  assert.equal(wrapped.mimeType, 'audio/wav');

  const wavBuf = Buffer.from(wrapped.audioBase64, 'base64');
  assert.equal(wavBuf.length, 44 + 480);
  assert.equal(wavBuf.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wavBuf.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wavBuf.toString('ascii', 12, 16), 'fmt ');
  assert.equal(wavBuf.readUInt32LE(24), 24000);
  assert.equal(wavBuf.readUInt16LE(34), 16);
  assert.equal(wavBuf.toString('ascii', 36, 40), 'data');
  assert.equal(wavBuf.readUInt32LE(40), 480);

  // Idempotent when already WAV
  const secondPass = ensureWavAudioBase64(wrapped.audioBase64, 'audio/wav');
  assert.equal(secondPass.audioBase64, wrapped.audioBase64);

  // Markdown bold and emojis stripped cleanly
  assert.equal(stripEmojis('### **القيمة المنزلية** للرقم 5'), 'القيمة المنزلية للرقم 5');
});

test('buildVisualDiagramSpec accurately classifies and builds all 5 interactive diagram types from student queries', () => {
  // 1. Place value
  const pv = buildVisualDiagramSpec('ما القيمة المنزلية للرقم 5 في العدد 2,540,310؟', { lesson: 1 });
  assert.equal(pv.kind, 'place_value');
  assert.equal(pv.placeValue?.targetNumber, 2540310);
  assert.equal(pv.placeValue?.cells[pv.placeValue.focusIndexFromLeft].digit, 5);
  assert.equal(pv.placeValue?.cells[pv.placeValue.focusIndexFromLeft].placeValue, 500000);

  // 2. Comparison
  const cmp = buildVisualDiagramSpec('قارن بين العددين 3,759,120 و 3,456,210', { lesson: 2 });
  assert.equal(cmp.kind, 'comparison');
  assert.equal(cmp.comparison?.symbol, '>');
  assert.equal(cmp.comparison?.decisiveIndexFromLeft, 1);

  // 3. Vertical subtraction with borrowing across zeros
  const ops = buildVisualDiagramSpec('كيف نحسب ناتج طرح 6,000 - 2,400 مع الاستلاف؟', { lesson: 3 });
  assert.equal(ops.kind, 'vertical_ops');
  assert.equal(ops.verticalOps?.op, 'sub');
  assert.equal(ops.verticalOps?.result, 3600);
  assert.equal(ops.verticalOps?.columns[2].borrowed, true);

  // 4. Negative numbers & number line
  const neg = buildVisualDiagramSpec('كيف نمثل -6 على خط الأعداد وميزان الحرارة؟', { lesson: 4 });
  assert.equal(neg.kind, 'number_line');
  assert.equal(neg.numberLine?.value, -6);
  assert.equal(neg.numberLine?.oppositeValue, 6);

  // 5. Pattern table
  const tbl = buildVisualDiagramSpec('اشرح خطة حل المسألة بإنشاء جدول نمط يدخر 5 دنانير كل أسبوع', { lesson: 5 });
  assert.equal(tbl.kind, 'pattern_table');
  assert.equal(tbl.patternTable?.stepDeltaB, 5);
  assert.ok((tbl.patternTable?.columns.length || 0) >= 4);
});

