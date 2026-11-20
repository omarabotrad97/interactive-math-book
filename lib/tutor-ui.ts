export interface InlineRun {
  kind: 'text' | 'math';
  value: string;
}

export interface StructuredBlock {
  type: 'paragraph' | 'ordered-list' | 'unordered-list';
  items: InlineRun[][];
}

export interface TutorSlideContextInput {
  lesson?: number;
  lessonTitle?: string;
  stationTitle?: string;
  slideTitle?: string;
  slideBody?: string;
  questionPrompt?: string;
  activeLab?: string;
  weakSkillLabel?: string;
  numbersInvolved?: string;
  stepIndex?: number;
  totalSteps?: number;
  isTeachingSlide?: boolean;
  rewardedCount?: number;
}

export interface FormattedLessonContext {
  headline: string;
  subline: string;
  hasDetails: boolean;
  detailsFocus: string;
  detailsSkill: string;
  detailsNumbers: string;
  rewardLabel: string;
}

const EMOJI_AND_MD_RE =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu;

/**
 * Strips decorative markdown markers and emojis while preserving math operators.
 */
export function sanitizeTutorText(raw: string): string {
  return String(raw || '')
    .replace(EMOJI_AND_MD_RE, '')
    .replace(/\*\*+/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Splits a single line of Arabic prose into alternating Arabic text runs and LTR math/number runs
 * so numbers (-3, +12, 4,350,200) and equations/comparisons (6,710,000 > 6,420,100) render cleanly in <bdi dir="ltr">.
 */
const NUM_PART = '[+-]?\\d(?:[\\d,]*\\d)?(?:\\.\\d+)?';
const MATH_RUN_RE = new RegExp(
  `(?:${NUM_PART}(?:\\s*(?:[<>≤≥=×÷+\\-−/]|°C|m)\\s*${NUM_PART})*(?:°C|%|m)?|[<>≤≥=])`,
  'g'
);

export function tokenizeMathRuns(line: string): InlineRun[] {
  const source = String(line || '');
  if (!source) return [];

  const runs: InlineRun[] = [];
  let lastIdx = 0;

  for (const match of source.matchAll(MATH_RUN_RE)) {
    const idx = match.index ?? 0;
    const token = match[0];
    if (!token) continue;

    if (idx > lastIdx) {
      runs.push({ kind: 'text', value: source.slice(lastIdx, idx) });
    }
    runs.push({ kind: 'math', value: token });
    lastIdx = idx + token.length;
  }

  if (lastIdx < source.length) {
    runs.push({ kind: 'text', value: source.slice(lastIdx) });
  }

  return runs.length ? runs : [{ kind: 'text', value: source }];
}

const ORDERED_ITEM_RE = /^\s*(?:\d+|[١-٩][٠-٩]*)[\.\)\-–:]\s+(.+)$/;
const UNORDERED_ITEM_RE = /^\s*[•\-\*▪◦]\s+(.+)$/;

/**
 * Parses tutor response text into structured paragraphs, numbered step lists, and bullet lists.
 * Also splits inline numbered sequences like "قاعدة المقارنة: 1) نعد الأرقام 2) نقارن من اليسار"
 * into readable list items without altering the wording.
 */
export function parseTutorStructuredBlocks(rawText: string): StructuredBlock[] {
  const cleaned = sanitizeTutorText(rawText);
  if (!cleaned) return [];

  // Normalize inline numbered steps " ... : 1) ... 2) ... " onto separate lines when preceded by space/colon
  const expanded = cleaned.replace(/([:：.،])\s*(\d+[\)\.])\s+/g, '$1\n$2 ').replace(/\s+(\d+\))\s+/g, '\n$1 ');

  const rawLines = expanded
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  const blocks: StructuredBlock[] = [];

  for (const line of rawLines) {
    const orderedMatch = line.match(ORDERED_ITEM_RE);
    if (orderedMatch) {
      const content = orderedMatch[1].trim();
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === 'ordered-list') {
        prev.items.push(tokenizeMathRuns(content));
      } else {
        blocks.push({
          type: 'ordered-list',
          items: [tokenizeMathRuns(content)],
        });
      }
      continue;
    }

    const unorderedMatch = line.match(UNORDERED_ITEM_RE);
    if (unorderedMatch) {
      const content = unorderedMatch[1].trim();
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === 'unordered-list') {
        prev.items.push(tokenizeMathRuns(content));
      } else {
        blocks.push({
          type: 'unordered-list',
          items: [tokenizeMathRuns(content)],
        });
      }
      continue;
    }

    blocks.push({
      type: 'paragraph',
      items: [tokenizeMathRuns(line)],
    });
  }

  return blocks;
}

export function cleanStationName(title?: string): string {
  return String(title || '')
    .replace(/^\s*\d+[\.\-\s]+/, '')
    .trim();
}

/**
 * Builds the calm lesson context strip ("نتعلم الآن: <lesson>") + concise slide subtitle + expandable full details.
 */
export function formatLessonContextSummary(ctx: TutorSlideContextInput): FormattedLessonContext {
  const lessonTitle = String(ctx.lessonTitle || 'القيمة المنزلية ضمن الملايين').trim();
  const headline = `نتعلم الآن: ${lessonTitle}`;

  const stationClean = cleanStationName(ctx.stationTitle);
  const stepText =
    typeof ctx.stepIndex === 'number' && ctx.totalSteps
      ? `الشريحة ${ctx.stepIndex + 1} من ${ctx.totalSteps}`
      : '';

  let subline = '';
  if (ctx.activeLab) {
    subline = ctx.activeLab.split('—')[0].trim();
  } else if (ctx.slideTitle) {
    subline = stepText ? `${ctx.slideTitle} · ${stepText}` : ctx.slideTitle;
  } else if (stationClean) {
    subline = stepText ? `${stationClean} · ${stepText}` : stationClean;
  }

  const rawFocus = ctx.activeLab
    ? ctx.activeLab
    : ctx.isTeachingSlide
      ? ctx.slideBody || ctx.slideTitle || ''
      : ctx.questionPrompt || ctx.slideBody || ctx.slideTitle || '';

  const detailsFocus = String(rawFocus || '')
    .replace(/^(الشرح الحالي|التركيز الحالي)\s*:\s*/g, '')
    .trim();

  const detailsSkill = String(ctx.weakSkillLabel || '').trim();
  const detailsNumbers = String(ctx.numbersInvolved || '').trim();
  const safeReward = Math.min(3, Math.max(0, Number(ctx.rewardedCount) || 0));
  const rewardLabel = `مكافآت اليوم: ${safeReward} من 3`;

  const hasDetails = Boolean(detailsFocus || detailsSkill || detailsNumbers || rewardLabel);

  return {
    headline,
    subline,
    hasDetails,
    detailsFocus,
    detailsSkill,
    detailsNumbers,
    rewardLabel,
  };
}

/**
 * Determines whether the chat scroll container is near the bottom so auto-scroll
 * never yanks a student who scrolled up to read earlier steps.
 */
export function isNearScrollBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  thresholdPx = 72
): boolean {
  if (scrollHeight <= clientHeight) return true;
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  return distanceFromBottom <= thresholdPx;
}
