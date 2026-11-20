import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeMathRuns,
  parseTutorStructuredBlocks,
  formatLessonContextSummary,
  isNearScrollBottom,
} from './tutor-ui';

test('tokenizeMathRuns isolates numbers, negative values, and comparisons without swallowing trailing punctuation', () => {
  const runs = tokenizeMathRuns('نقارن بين 6,710,000 > 6,420,100 والعدد 4,050,200.');
  const mathValues = runs.filter(r => r.kind === 'math').map(r => r.value.trim());
  assert.ok(mathValues.includes('6,710,000 > 6,420,100'));
  assert.ok(mathValues.includes('4,050,200'));
  assert.ok(!mathValues.includes('4,050,200.'));
});

test('parseTutorStructuredBlocks splits numbered steps and bullet lists cleanly', () => {
  const raw = [
    'لنقارن العددين معاً خطوة بخطوة:',
    '1. نعدّ منازل كل عدد أولاً.',
    '2. نقارن الأرقام من أقصى اليسار.',
    '- آحاد الملايين متساوية: 3 = 3',
    '- مئات الألوف حاسمة: 7 > 4',
  ].join('\n');

  const blocks = parseTutorStructuredBlocks(raw);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'ordered-list');
  assert.equal(blocks[1].items.length, 2);
  assert.equal(blocks[2].type, 'unordered-list');
  assert.equal(blocks[2].items.length, 2);
});

test('parseTutorStructuredBlocks expands inline numbered steps like 1) ... 2) ...', () => {
  const inlineText =
    'قاعدة المقارنة: 1) نعدّ أرقام كل عدد أولاً. 2) نفحص الأرقام من أقصى اليسار.';
  const blocks = parseTutorStructuredBlocks(inlineText);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'ordered-list');
  assert.equal(blocks[1].items.length, 2);
});

test('formatLessonContextSummary produces calm headline, concise slide subline, and full details', () => {
  const summary = formatLessonContextSummary({
    lesson: 2,
    lessonTitle: 'مقارنة الأعداد وترتيبها',
    stationTitle: '1. رحلة أعداد الحجاج',
    slideTitle: 'جدول أعداد الحجاج',
    slideBody: 'انظر إلى جدول حُجّاج بيت الله الحرام. ما الرقم المشترك في منزلة الملايين؟',
    weakSkillLabel: 'المقارنة من اليسار وعدّ المنازل',
    numbersInvolved: '2,352,122 ، 1,862,909',
    stepIndex: 1,
    totalSteps: 8,
    isTeachingSlide: true,
    rewardedCount: 2,
  });

  assert.equal(summary.headline, 'نتعلم الآن: مقارنة الأعداد وترتيبها');
  assert.equal(summary.subline, 'جدول أعداد الحجاج · الشريحة 2 من 8');
  assert.equal(
    summary.detailsFocus,
    'انظر إلى جدول حُجّاج بيت الله الحرام. ما الرقم المشترك في منزلة الملايين؟'
  );
  assert.equal(summary.rewardLabel, 'مكافآت اليوم: 2 من 3');
});

test('isNearScrollBottom respects threshold so reading scrolled-up history is never interrupted', () => {
  // At very bottom
  assert.equal(isNearScrollBottom(500, 900, 400, 72), true);
  // Within 50px of bottom
  assert.equal(isNearScrollBottom(450, 900, 400, 72), true);
  // Scrolled up 180px from bottom -> should NOT auto-scroll
  assert.equal(isNearScrollBottom(320, 900, 400, 72), false);
  // Short content that fits without scrolling
  assert.equal(isNearScrollBottom(0, 320, 400, 72), true);
});
