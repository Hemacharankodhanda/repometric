import type { CategoryId, Grade } from '../types';

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  weight: number;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'activity', name: 'Activity', weight: 20 },
  { id: 'maintenance', name: 'Maintenance', weight: 20 },
  { id: 'community', name: 'Community', weight: 15 },
  { id: 'documentation', name: 'Documentation', weight: 20 },
  { id: 'hygiene', name: 'Hygiene', weight: 15 },
  { id: 'dependencies', name: 'Dependencies', weight: 10 },
];

export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  activity: 20,
  maintenance: 20,
  community: 15,
  documentation: 20,
  hygiene: 15,
  dependencies: 10,
};

/**
 * Clamps a number to the [0, 1] interval.
 */
export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * Assigns a grade based on the final 0-100 score.
 * 90+ excellent, 75-89 good, 55-74 needs-work, below 55 at-risk.
 */
export function calculateGrade(score: number): Grade {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 55) return 'needs-work';
  return 'at-risk';
}
