export type LessonKey = 'lesson1' | 'lesson2' | 'lesson3' | 'lesson4' | 'lesson5';

export interface LessonTheme {
  key: LessonKey;
  num: number;
  shortLabel: string;
  title: string;
  pages: string;
  bannerBg: string;
  bannerShadow: string;
  bannerBorder: string;
  tintBg: string;
  accentText: string;
  labLabel: string;
}

export interface NextLessonTransition {
  targetKey: LessonKey | 'unit1_exam';
  kicker: string;
  title: string;
  ctaLabel: string;
}

export const LESSON_THEMES: Record<LessonKey, LessonTheme> = {
  lesson1: {
    key: 'lesson1',
    num: 1,
    shortLabel: 'القيمة المنزلية',
    title: 'القيمة المنزلية ضمن الملايين',
    pages: '8 – 11',
    bannerBg: '#116b55',
    bannerShadow: '#0a4637',
    bannerBorder: '#0d5644',
    tintBg: '#e8f5f0',
    accentText: '#0b4f3f',
    labLabel: 'دليل الدرس',
  },
  lesson2: {
    key: 'lesson2',
    num: 2,
    shortLabel: 'مقارنة الأعداد',
    title: 'مقارنة الأعداد وترتيبها',
    pages: '12 – 15',
    bannerBg: '#0e6b74',
    bannerShadow: '#08484f',
    bannerBorder: '#0b575f',
    tintBg: '#e5f4f6',
    accentText: '#094b52',
    labLabel: 'مختبر المقارنة',
  },
  lesson3: {
    key: 'lesson3',
    num: 3,
    shortLabel: 'الجمع والطرح',
    title: 'جمع الأعداد الكلية وطرحها',
    pages: '16 – 19',
    bannerBg: '#276e43',
    bannerShadow: '#184a2c',
    bannerBorder: '#1f5a36',
    tintBg: '#e8f5ec',
    accentText: '#1a4f2f',
    labLabel: 'مختبر العمليات',
  },
  lesson4: {
    key: 'lesson4',
    num: 4,
    shortLabel: 'الأعداد السالبة',
    title: 'الأعداد السالبة وخط الأعداد',
    pages: '20 – 23',
    bannerBg: '#255c82',
    bannerShadow: '#173d57',
    bannerBorder: '#1d4a69',
    tintBg: '#e7f1f8',
    accentText: '#19425e',
    labLabel: 'مختبر السالبة',
  },
  lesson5: {
    key: 'lesson5',
    num: 5,
    shortLabel: 'أنشئ جدولاً',
    title: 'خطة حل المسألة: أنشئ جدولاً',
    pages: '24 – 25',
    bannerBg: '#7a4b8c',
    bannerShadow: '#512e5e',
    bannerBorder: '#643c73',
    tintBg: '#f3ebf7',
    accentText: '#553063',
    labLabel: 'مختبر الجداول',
  },
};

export const LESSON_ORDER: LessonKey[] = ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5'];

export function getLessonTheme(key: string): LessonTheme {
  if (key in LESSON_THEMES) {
    return LESSON_THEMES[key as LessonKey];
  }
  return LESSON_THEMES.lesson1;
}

/**
 * Computes Duolingo-style gentle sinusoidal S-curve horizontal offset (px) for each station node.
 * Keeps amplitude tighter on narrow mobile viewports (<= 420px) so node captions & mascot never clip.
 */
const WIDE_CURVE = [0, -44, -64, -44, 0, 44, 64, 44];
const COMPACT_CURVE = [0, -30, -44, -30, 0, 30, 44, 30];

export function computeWindingOffset(index: number, compactMobile: boolean): number {
  const safeIdx = Math.max(0, Math.floor(index));
  const table = compactMobile ? COMPACT_CURVE : WIDE_CURVE;
  return table[safeIdx % table.length];
}

/**
 * Returns the end-of-lesson jump transition card metadata so students can progress linearly
 * from Lesson 1 -> 2 -> 3 -> 4 -> 5 -> Unit 1 Exam without scrolling back to the top.
 */
export function getNextLessonTransition(currentKey: string): NextLessonTransition {
  const idx = LESSON_ORDER.indexOf(currentKey as LessonKey);
  if (idx >= 0 && idx < LESSON_ORDER.length - 1) {
    const nextKey = LESSON_ORDER[idx + 1];
    const nextTheme = LESSON_THEMES[nextKey];
    return {
      targetKey: nextKey,
      kicker: `الدرس التالي · الدرس ${nextTheme.num} من 5`,
      title: nextTheme.title,
      ctaLabel: `انتقل إلى الدرس ${nextTheme.num}`,
    };
  }
  return {
    targetKey: 'unit1_exam',
    kicker: 'ختام الوحدة الأولى',
    title: 'اختبار نهاية الوحدة الأولى',
    ctaLabel: 'عرض تفاصيل الاختبار',
  };
}

export interface StageHeaderMeta {
  num: number;
  total: number;
  title: string;
}

/**
 * Computes the sticky banner subtitle reflecting the stage currently scrolled into view.
 */
export function formatStickyBannerMeta(
  lessonKey: string,
  stage?: StageHeaderMeta | null
): { kicker: string; title: string } {
  const theme = getLessonTheme(lessonKey);
  if (stage && stage.title) {
    return {
      kicker: `القسم 1 · الدرس ${theme.num} · المرحلة ${stage.num} من ${stage.total}`,
      title: stage.title,
    };
  }
  return {
    kicker: `القسم 1 · الدرس ${theme.num} من 5`,
    title: theme.title,
  };
}
