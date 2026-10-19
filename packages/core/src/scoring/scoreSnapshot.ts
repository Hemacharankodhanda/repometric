import type { AnalysisReport, CategoryId, RepoSnapshot } from '../types';
import { CATEGORIES } from './config';
import {
  aggregateScore,
  calculateCategoryScore,
  evaluateSignal,
  type EvaluatedCategory,
} from './engine';
import { generateFixes } from './fixes';
import {
  commits90dSignal,
  lastCommitSignal,
  releasesSignal,
} from './signals/activity';
import {
  busFactorSignal,
  communityFilesSignal,
  contributorsSignal,
} from './signals/community';
import {
  deprecatedDepsSignal,
  lockfileSignal,
  outdatedDepsSignal,
} from './signals/dependencies';
import {
  commentsSignal,
  docsFolderSignal,
  metadataSignal,
  readmeExistsSignal,
  readmeSectionsSignal,
} from './signals/documentation';
import {
  ciSignal,
  gitignoreSignal,
  licenseSignal,
  lintFormatSignal,
  secretsSignal,
  testsSignal,
} from './signals/hygiene';
import {
  firstResponseSignal,
  prMergeRateSignal,
  staleIssuesSignal,
} from './signals/maintenance';
import type { Signal } from './types';

export const ALL_SIGNALS_BY_CATEGORY: Record<CategoryId, Signal[]> = {
  activity: [commits90dSignal, lastCommitSignal, releasesSignal],
  maintenance: [firstResponseSignal, staleIssuesSignal, prMergeRateSignal],
  community: [busFactorSignal, contributorsSignal, communityFilesSignal],
  documentation: [
    readmeExistsSignal,
    readmeSectionsSignal,
    metadataSignal,
    docsFolderSignal,
    commentsSignal,
  ],
  hygiene: [
    testsSignal,
    ciSignal,
    lintFormatSignal,
    gitignoreSignal,
    licenseSignal,
    secretsSignal,
  ],
  dependencies: [lockfileSignal, outdatedDepsSignal, deprecatedDepsSignal],
};

export const CORE_VERSION = '0.1.0';

/**
 * Pure function: scoreSnapshot(snapshot) -> AnalysisReport.
 * Injected now inside snapshot is respected, deterministic output.
 */
export function scoreSnapshot(snapshot: RepoSnapshot): AnalysisReport {
  const now = new Date(snapshot.now);
  const evaluatedCategories: EvaluatedCategory[] = [];

  let sumOfIncludedWeights = 0;

  for (const catConfig of CATEGORIES) {
    const signals = ALL_SIGNALS_BY_CATEGORY[catConfig.id] ?? [];
    const evaluatedSignals = signals.map((s) => evaluateSignal(s, { snapshot, now }));

    const evaluatedCat = calculateCategoryScore(catConfig.id, evaluatedSignals, catConfig.weight);
    evaluatedCategories.push(evaluatedCat);

    if (evaluatedCat.applicableMax > 0) {
      sumOfIncludedWeights += catConfig.weight;
    }
  }

  const { score, grade, categories } = aggregateScore(evaluatedCategories);

  // Generate fixes
  const fixes = generateFixes(evaluatedCategories, sumOfIncludedWeights);

  // projectedScore = min(100, round(score + sum(pointsGain)))
  const totalGain = fixes.reduce((sum, f) => sum + f.pointsGain, 0);
  const projectedScore = Math.min(100, Math.round(score + totalGain));

  return {
    repo: snapshot.meta,
    commitSha: snapshot.commitSha,
    score,
    grade,
    categories,
    fixes,
    projectedScore,
    analyzedAt: snapshot.now,
    coreVersion: CORE_VERSION,
  };
}
