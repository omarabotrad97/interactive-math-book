import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCurriculumProgress } from './curriculum-progress';

test('untouched unlocked lesson shows 0% width, not_started status, and ابدأ action', () => {
  const res = computeCurriculumProgress({ doneCount: 0, totalCount: 21, unlocked: true, hasPartialInteraction: false });
  assert.equal(res.pct, 0);
  assert.equal(res.fillWidthPct, 0);
  assert.equal(res.statusKey, 'not_started');
  assert.equal(res.statusLabel, 'لم يبدأ');
  assert.equal(res.actionLabel, 'ابدأ');
});

test('1% progress uses exact 1% fillWidthPct without artificial 14% inflation', () => {
  const res = computeCurriculumProgress({ doneCount: 1, totalCount: 77, unlocked: true });
  assert.equal(res.pct, 1);
  assert.equal(res.fillWidthPct, 1);
  assert.equal(res.statusKey, 'in_progress');
  assert.equal(res.statusLabel, 'قيد التعلم');
  assert.equal(res.actionLabel, 'تابع');
});

test('partial interaction inside first station marks lesson in_progress while keeping 0% completed stations honest', () => {
  const res = computeCurriculumProgress({ doneCount: 0, totalCount: 21, unlocked: true, hasPartialInteraction: true });
  assert.equal(res.pct, 0);
  assert.equal(res.fillWidthPct, 0);
  assert.equal(res.statusKey, 'in_progress');
  assert.equal(res.statusLabel, 'قيد التعلم');
  assert.equal(res.actionLabel, 'تابع');
});

test('completed lesson shows 100%, completed status, and راجع action', () => {
  const res = computeCurriculumProgress({ doneCount: 15, totalCount: 15, unlocked: true });
  assert.equal(res.pct, 100);
  assert.equal(res.fillWidthPct, 100);
  assert.equal(res.statusKey, 'completed');
  assert.equal(res.statusLabel, 'مكتمل');
  assert.equal(res.actionLabel, 'راجع');
});

test('locked lesson shows locked status and مقفل action', () => {
  const res = computeCurriculumProgress({ doneCount: 0, totalCount: 16, unlocked: false });
  assert.equal(res.pct, 0);
  assert.equal(res.statusKey, 'locked');
  assert.equal(res.statusLabel, 'مقفل');
  assert.equal(res.actionLabel, 'مقفل');
});
