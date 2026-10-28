import { describe, it, expect } from 'vitest';
import { evaluateSignal, calculateCategoryScore, aggregateScore } from './engine';
import { calculateGrade, clamp01 } from './config';
import type { Signal, SignalContext } from './types';
import type { SignalResult } from '../types';

describe('Scoring Framework & Normalization Engine (T1.3)', () => {
  describe('clamp01 helper', () => {
    it('clamps below 0 to 0', () => {
      expect(clamp01(-0.5)).toBe(0);
    });
    it('clamps above 1 to 1', () => {
      expect(clamp01(1.5)).toBe(1);
    });
    it('preserves values between 0 and 1', () => {
      expect(clamp01(0.75)).toBe(0.75);
    });
  });

  describe('calculateGrade boundaries', () => {
    it('maps scores to exact grade boundaries', () => {
      expect(calculateGrade(100)).toBe('excellent');
      expect(calculateGrade(90)).toBe('excellent');
      expect(calculateGrade(89)).toBe('good');
      expect(calculateGrade(75)).toBe('good');
      expect(calculateGrade(74)).toBe('needs-work');
      expect(calculateGrade(55)).toBe('needs-work');
      expect(calculateGrade(54)).toBe('at-risk');
      expect(calculateGrade(0)).toBe('at-risk');
    });
  });

  describe('evaluateSignal', () => {
    const dummyContext = {} as SignalContext;

    it('awards 100% of max points for pass', () => {
      const sig: Signal = {
        id: 'test.pass',
        categoryId: 'activity',
        label: 'Test Pass',
        max: 8,
        compute: () => ({
          id: 'test.pass',
          categoryId: 'activity',
          label: 'Test Pass',
          earned: 0,
          max: 8,
          status: 'pass',
          evidence: 'Passed perfectly',
        }),
      };

      const result = evaluateSignal(sig, dummyContext);
      expect(result.status).toBe('pass');
      expect(result.earned).toBe(8);
    });

    it('awards 0 points for fail', () => {
      const sig: Signal = {
        id: 'test.fail',
        categoryId: 'activity',
        label: 'Test Fail',
        max: 6,
        compute: () => ({
          id: 'test.fail',
          categoryId: 'activity',
          label: 'Test Fail',
          earned: 3,
          max: 6,
          status: 'fail',
          evidence: 'Failed completely',
        }),
      };

      const result = evaluateSignal(sig, dummyContext);
      expect(result.status).toBe('fail');
      expect(result.earned).toBe(0);
    });

    it('awards exactly 50% of max points and updates evidence for no_data', () => {
      const sig: Signal = {
        id: 'test.no_data',
        categoryId: 'maintenance',
        label: 'Response Time',
        max: 8,
        compute: () => ({
          id: 'test.no_data',
          categoryId: 'maintenance',
          label: 'Response Time',
          earned: 0,
          max: 8,
          status: 'no_data',
          evidence: 'Zero issues opened in last 180 days',
        }),
      };

      const result = evaluateSignal(sig, dummyContext);
      expect(result.status).toBe('no_data');
      expect(result.earned).toBe(4); // 50% of 8
      expect(result.evidence).toContain('not enough data');
    });

    it('awards 0 points and preserves na status', () => {
      const sig: Signal = {
        id: 'test.na',
        categoryId: 'dependencies',
        label: 'Dep freshness',
        max: 10,
        compute: () => ({
          id: 'test.na',
          categoryId: 'dependencies',
          label: 'Dep freshness',
          earned: 0,
          max: 10,
          status: 'na',
          evidence: 'No package manifest found',
        }),
      };

      const result = evaluateSignal(sig, dummyContext);
      expect(result.status).toBe('na');
      expect(result.earned).toBe(0);
    });
  });

  describe('calculateCategoryScore with na and exclusion', () => {
    it('excludes na signals from applicableMax and computes categoryEarned', () => {
      // Category with 2 signals: one pass (6/6), one na (0/4)
      const signals: SignalResult[] = [
        {
          id: 'sig.pass',
          categoryId: 'dependencies',
          label: 'Lockfile present',
          earned: 6,
          max: 6,
          status: 'pass',
          evidence: 'Lockfile found',
        },
        {
          id: 'sig.na',
          categoryId: 'dependencies',
          label: 'Freshness',
          earned: 0,
          max: 4,
          status: 'na',
          evidence: 'Not applicable',
        },
      ];

      // Weight 10: 6/6 earned should give full 10 points
      const evaluated = calculateCategoryScore('dependencies', signals);
      expect(evaluated.applicableMax).toBe(6); // only the pass signal
      expect(evaluated.earnedPoints).toBe(6);
      expect(evaluated.categoryEarned).toBe(10); // 10 * (6 / 6) = 10
    });

    it('marks category as excluded when all signals are na (applicableMax === 0)', () => {
      const signals: SignalResult[] = [
        {
          id: 'sig.na',
          categoryId: 'dependencies',
          label: 'Freshness',
          earned: 0,
          max: 10,
          status: 'na',
          evidence: 'No manifest',
        },
      ];

      const evaluated = calculateCategoryScore('dependencies', signals);
      expect(evaluated.applicableMax).toBe(0);
      expect(evaluated.categoryEarned).toBeNull();
    });
  });

  describe('aggregateScore and category renormalization', () => {
    it('renormalizes the final score when a category is excluded', () => {
      // 5 categories with perfect scores (weight 90 total)
      // 1 category (dependencies, weight 10) is excluded (categoryEarned === null)
      const evaluated = [
        calculateCategoryScore('activity', [
          {
            id: '1',
            categoryId: 'activity',
            label: 'C',
            earned: 20,
            max: 20,
            status: 'pass',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('maintenance', [
          {
            id: '2',
            categoryId: 'maintenance',
            label: 'M',
            earned: 20,
            max: 20,
            status: 'pass',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('community', [
          {
            id: '3',
            categoryId: 'community',
            label: 'Com',
            earned: 15,
            max: 15,
            status: 'pass',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('documentation', [
          {
            id: '4',
            categoryId: 'documentation',
            label: 'D',
            earned: 20,
            max: 20,
            status: 'pass',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('hygiene', [
          {
            id: '5',
            categoryId: 'hygiene',
            label: 'H',
            earned: 15,
            max: 15,
            status: 'pass',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('dependencies', [
          {
            id: '6',
            categoryId: 'dependencies',
            label: 'Dep',
            earned: 0,
            max: 10,
            status: 'na',
            evidence: 'na',
          },
        ]),
      ];

      const summary = aggregateScore(evaluated);

      // Total earned: 20 + 20 + 15 + 20 + 15 = 90
      // Included weight: 20 + 20 + 15 + 20 + 15 = 90
      // Normalized: 100 * (90 / 90) = 100!
      expect(summary.score).toBe(100);
      expect(summary.grade).toBe('excellent');
      expect(summary.categories.length).toBe(6);
    });

    it('renormalizes proportional partial scores when a category is excluded', () => {
      // Suppose each included category earned 50%
      const evaluated = [
        calculateCategoryScore('activity', [
          {
            id: '1',
            categoryId: 'activity',
            label: 'C',
            earned: 10,
            max: 20,
            status: 'partial',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('maintenance', [
          {
            id: '2',
            categoryId: 'maintenance',
            label: 'M',
            earned: 10,
            max: 20,
            status: 'partial',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('community', [
          {
            id: '3',
            categoryId: 'community',
            label: 'Com',
            earned: 7.5,
            max: 15,
            status: 'partial',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('documentation', [
          {
            id: '4',
            categoryId: 'documentation',
            label: 'D',
            earned: 10,
            max: 20,
            status: 'partial',
            evidence: 'ok',
          },
        ]),
        calculateCategoryScore('hygiene', [
          {
            id: '5',
            categoryId: 'hygiene',
            label: 'H',
            earned: 7.5,
            max: 15,
            status: 'partial',
            evidence: 'ok',
          },
        ]),
        // Excluded category
        calculateCategoryScore('dependencies', [
          {
            id: '6',
            categoryId: 'dependencies',
            label: 'Dep',
            earned: 0,
            max: 10,
            status: 'na',
            evidence: 'na',
          },
        ]),
      ];

      const summary = aggregateScore(evaluated);

      // Included earned = 10 + 10 + 7.5 + 10 + 7.5 = 45
      // Included weight = 90
      // 100 * (45 / 90) = 50 -> grade 'at-risk'
      expect(summary.score).toBe(50);
      expect(summary.grade).toBe('at-risk');
    });

    it('returns score 0 when all categories are excluded', () => {
      const evaluated = [
        calculateCategoryScore('activity', [
          {
            id: '1',
            categoryId: 'activity',
            label: 'A',
            earned: 0,
            max: 10,
            status: 'na',
            evidence: 'na',
          },
        ]),
      ];

      const summary = aggregateScore(evaluated);
      expect(summary.score).toBe(0);
      expect(summary.grade).toBe('at-risk');
    });
  });
});
