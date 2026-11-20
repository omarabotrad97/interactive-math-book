export type LearningStatusKey = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface CurriculumProgressInput {
  doneCount: number;
  totalCount: number;
  unlocked: boolean;
  hasPartialInteraction?: boolean;
}

export interface CurriculumProgressMetrics {
  done: number;
  total: number;
  pct: number;
  fillWidthPct: number;
  statusKey: LearningStatusKey;
  statusLabel: string;
  actionLabel: string;
}

/**
 * Computes accurate, uninflated progress percentage, learning status, and primary CTA label.
 * Enforces 0% => 0% fill width and 1% => 1% fill width (never artificial min-width).
 */
export function computeCurriculumProgress(input: CurriculumProgressInput): CurriculumProgressMetrics {
  const total = Math.max(1, Math.floor(input.totalCount || 1));
  const done = Math.max(0, Math.min(total, Math.floor(input.doneCount || 0)));
  const rawPct = (done / total) * 100;
  const pct = done === 0 ? 0 : done >= total ? 100 : Math.max(1, Math.min(99, Math.round(rawPct)));

  if (!input.unlocked && done < total) {
    return {
      done,
      total,
      pct,
      fillWidthPct: pct,
      statusKey: 'locked',
      statusLabel: 'مقفل',
      actionLabel: 'مقفل',
    };
  }

  if (done >= total) {
    return {
      done,
      total,
      pct: 100,
      fillWidthPct: 100,
      statusKey: 'completed',
      statusLabel: 'مكتمل',
      actionLabel: 'راجع',
    };
  }

  if (done > 0 || Boolean(input.hasPartialInteraction)) {
    return {
      done,
      total,
      pct,
      fillWidthPct: pct,
      statusKey: 'in_progress',
      statusLabel: 'قيد التعلم',
      actionLabel: 'تابع',
    };
  }

  return {
    done: 0,
    total,
    pct: 0,
    fillWidthPct: 0,
    statusKey: 'not_started',
    statusLabel: 'لم يبدأ',
    actionLabel: 'ابدأ',
  };
}
