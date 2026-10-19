import type {
  CategoryId,
  CategoryResult,
  Grade,
  SignalResult,
} from '../types';
import { CATEGORIES, CATEGORY_WEIGHTS, calculateGrade } from './config';
import type { Signal, SignalContext } from './types';

export interface EvaluatedCategory {
  id: CategoryId;
  weight: number;
  earnedPoints: number; // raw earned across signals
  applicableMax: number; // sum of max of signals where status != 'na'
  categoryEarned: number | null; // null if excluded (applicableMax === 0)
  signals: SignalResult[];
}

export interface ScoreSummary {
  score: number;
  grade: Grade;
  categories: CategoryResult[];
}

/**
 * Evaluates a single signal, enforcing the 50% earned rule for 'no_data'.
 */
export function evaluateSignal(signal: Signal, context: SignalContext): SignalResult {
  const result = signal.compute(context);

  if (result.status === 'no_data') {
    return {
      ...result,
      earned: Number((signal.max * 0.5).toFixed(2)),
      evidence: result.evidence.toLowerCase().includes('not enough data')
        ? result.evidence
        : `${result.evidence} (not enough data)`.trim(),
    };
  }

  if (result.status === 'pass') {
    return { ...result, earned: signal.max };
  }

  if (result.status === 'fail') {
    return { ...result, earned: 0 };
  }

  if (result.status === 'na') {
    return { ...result, earned: 0 };
  }

  return result;
}

/**
 * Calculates category score per SCORING_SPEC.md:
 * applicableMax = sum(max of signals where status != 'na')
 * categoryEarned = applicableMax == 0 ? excluded : weight * (sum(earned) / applicableMax)
 */
export function calculateCategoryScore(
  categoryId: CategoryId,
  signals: SignalResult[],
  weightOverride?: number,
): EvaluatedCategory {
  const weight = weightOverride ?? CATEGORY_WEIGHTS[categoryId];

  let sumEarned = 0;
  let applicableMax = 0;

  for (const sig of signals) {
    if (sig.status === 'na') {
      continue;
    }
    applicableMax += sig.max;
    sumEarned += sig.earned;
  }

  const categoryEarned =
    applicableMax === 0 ? null : (weight * sumEarned) / applicableMax;

  return {
    id: categoryId,
    weight,
    earnedPoints: sumEarned,
    applicableMax,
    categoryEarned,
    signals,
  };
}

/**
 * Aggregates all evaluated categories into the final 0-100 score and grade:
 * score = round(100 * sum(categoryEarned of included categories) / sum(weight of included categories))
 */
export function aggregateScore(evaluatedCategories: EvaluatedCategory[]): ScoreSummary {
  let totalEarned = 0;
  let totalWeight = 0;

  const categories: CategoryResult[] = [];

  for (const cat of evaluatedCategories) {
    const config = CATEGORIES.find((c) => c.id === cat.id);
    const label = config?.name || cat.id;

    if (cat.categoryEarned !== null) {
      totalEarned += cat.categoryEarned;
      totalWeight += cat.weight;

      categories.push({
        id: cat.id,
        label,
        weight: cat.weight,
        earned: Number(cat.categoryEarned.toFixed(2)),
        excluded: false,
        signals: cat.signals,
      });
    } else {
      // Excluded category
      categories.push({
        id: cat.id,
        label,
        weight: cat.weight,
        earned: 0,
        excluded: true,
        signals: cat.signals,
      });
    }
  }

  const rawScore =
    totalWeight > 0 ? (100 * totalEarned) / totalWeight : 0;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const grade = calculateGrade(score);

  return {
    score,
    grade,
    categories,
  };
}
