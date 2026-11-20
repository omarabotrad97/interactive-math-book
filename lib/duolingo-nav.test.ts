import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLessonTheme,
  computeWindingOffset,
  getNextLessonTransition,
  formatStickyBannerMeta,
  LESSON_ORDER,
} from './duolingo-nav';

test('getLessonTheme returns unique rich themes for all 5 lessons and falls back safely', () => {
  const colors = new Set(LESSON_ORDER.map(k => getLessonTheme(k).bannerBg));
  assert.equal(colors.size, 5);
  assert.equal(getLessonTheme('lesson2').num, 2);
  assert.equal(getLessonTheme('lesson4').labLabel, 'مختبر السالبة');
  assert.equal(getLessonTheme('unknown').key, 'lesson1');
});

test('computeWindingOffset creates a balanced symmetric S-curve that stays compact on mobile', () => {
  const wide = [0, 1, 2, 3, 4, 5, 6, 7].map(i => computeWindingOffset(i, false));
  const mobile = [0, 1, 2, 3, 4, 5, 6, 7].map(i => computeWindingOffset(i, true));
  assert.equal(wide[0], 0);
  assert.equal(wide[2], -wide[6]);
  assert.ok(Math.max(...mobile.map(Math.abs)) <= 44);
  assert.ok(Math.max(...wide.map(Math.abs)) <= 64);
});

test('getNextLessonTransition links lessons 1 through 5 sequentially and ends at unit1_exam', () => {
  assert.equal(getNextLessonTransition('lesson1').targetKey, 'lesson2');
  assert.equal(getNextLessonTransition('lesson2').targetKey, 'lesson3');
  assert.equal(getNextLessonTransition('lesson3').targetKey, 'lesson4');
  assert.equal(getNextLessonTransition('lesson4').targetKey, 'lesson5');
  assert.equal(getNextLessonTransition('lesson5').targetKey, 'unit1_exam');
});

test('formatStickyBannerMeta formats both lesson default and scroll-linked stage header', () => {
  const base = formatStickyBannerMeta('lesson2');
  assert.equal(base.kicker, 'القسم 1 · الدرس 2 من 5');
  assert.equal(base.title, 'مقارنة الأعداد وترتيبها');

  const stage = formatStickyBannerMeta('lesson1', {
    num: 2,
    total: 5,
    title: 'أفهم المنزلة والقيمة',
  });
  assert.equal(stage.kicker, 'القسم 1 · الدرس 1 · المرحلة 2 من 5');
  assert.equal(stage.title, 'أفهم المنزلة والقيمة');
});
