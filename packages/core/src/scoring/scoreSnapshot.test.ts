import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../types';
import abandonedRepoFixture from '../../test/fixtures/abandoned-repo.json';
import noManifestFixture from '../../test/fixtures/no-manifest.json';
import soloMinimalFixture from '../../test/fixtures/solo-minimal.json';
import strongRepoFixture from '../../test/fixtures/strong-repo.json';
import studentRepoFixture from '../../test/fixtures/student-repo.json';
import { scoreSnapshot } from './scoreSnapshot';

describe('scoreSnapshot and Golden Snapshot Tests (T1.7)', () => {
  const fixtures: { name: string; snapshot: RepoSnapshot }[] = [
    { name: 'strong-repo', snapshot: strongRepoFixture as unknown as RepoSnapshot },
    { name: 'student-repo', snapshot: studentRepoFixture as unknown as RepoSnapshot },
    { name: 'abandoned-repo', snapshot: abandonedRepoFixture as unknown as RepoSnapshot },
    { name: 'solo-minimal', snapshot: soloMinimalFixture as unknown as RepoSnapshot },
    { name: 'no-manifest', snapshot: noManifestFixture as unknown as RepoSnapshot },
  ];

  it('generates deterministic full reports for all 5 golden fixtures', () => {
    for (const { snapshot } of fixtures) {
      const report1 = scoreSnapshot(snapshot);
      const report2 = scoreSnapshot(snapshot);

      // Deterministic output
      expect(report1).toEqual(report2);

      // Expected shapes
      expect(report1.repo.name).toBe(snapshot.meta.name);
      expect(report1.commitSha).toBe(snapshot.commitSha);
      expect(report1.categories).toHaveLength(6);
      expect(Array.isArray(report1.fixes)).toBe(true);
    }
  });

  describe('Golden snapshot assertions', () => {
    it('scores strong-repo as excellent (score >= 90)', () => {
      const report = scoreSnapshot(strongRepoFixture as unknown as RepoSnapshot);
      expect(report.score).toBeGreaterThanOrEqual(90);
      expect(report.grade).toBe('excellent');
      expect(report.categories.every((c) => !c.excluded)).toBe(true);
      expect(report.projectedScore).toBeGreaterThanOrEqual(report.score);
    });

    it('scores student-repo as needs-work or at-risk with actionable fixes', () => {
      const report = scoreSnapshot(studentRepoFixture as unknown as RepoSnapshot);
      expect(report.score).toBeLessThan(75);
      expect(['needs-work', 'at-risk']).toContain(report.grade);
      expect(report.fixes.length).toBeGreaterThan(0);

      // Should recommend adding tests, CI, and README improvements
      const fixSignalIds = report.fixes.map((f) => f.signalId);
      expect(fixSignalIds).toContain('hygiene.tests');
      expect(fixSignalIds).toContain('hygiene.ci');
      expect(fixSignalIds).toContain('docs.readme_sections');
    });

    it('scores abandoned-repo as at-risk (score < 55)', () => {
      const report = scoreSnapshot(abandonedRepoFixture as unknown as RepoSnapshot);
      expect(report.score).toBeLessThan(55);
      expect(report.grade).toBe('at-risk');

      const fixSignalIds = report.fixes.map((f) => f.signalId);
      expect(fixSignalIds).toContain('activity.last_commit');
      expect(fixSignalIds).toContain('activity.releases');
    });

    it('scores solo-minimal correctly with solo project detection', () => {
      const report = scoreSnapshot(soloMinimalFixture as unknown as RepoSnapshot);
      expect(Number.isInteger(report.score)).toBe(true);

      const communityCat = report.categories.find((c) => c.id === 'community');
      const busFactor = communityCat?.signals.find((s) => s.id === 'community.bus_factor');
      expect(busFactor?.evidence).toContain('Solo project with 1 author');
    });

    it('properly excludes dependencies category for no-manifest and renormalizes score', () => {
      const report = scoreSnapshot(noManifestFixture as unknown as RepoSnapshot);
      const depsCategory = report.categories.find((c) => c.id === 'dependencies');
      expect(depsCategory).toBeDefined();
      expect(depsCategory?.excluded).toBe(true);
      expect(depsCategory?.earned).toBe(0);

      // The other 5 categories must be included
      const included = report.categories.filter((c) => !c.excluded);
      expect(included).toHaveLength(5);

      // No fixes generated for na signals in excluded dependencies category
      const depFixes = report.fixes.filter((f) => f.signalId.startsWith('deps.'));
      expect(depFixes).toHaveLength(0);
    });
  });

  describe('Property tests across all fixtures and arbitrary variations', () => {
    it('always produces an integer score from 0 to 100', () => {
      for (const { snapshot } of fixtures) {
        const report = scoreSnapshot(snapshot);
        expect(Number.isInteger(report.score)).toBe(true);
        expect(report.score).toBeGreaterThanOrEqual(0);
        expect(report.score).toBeLessThanOrEqual(100);
      }
    });

    it('always satisfies projectedScore >= score and projectedScore <= 100', () => {
      for (const { snapshot } of fixtures) {
        const report = scoreSnapshot(snapshot);
        expect(Number.isInteger(report.projectedScore)).toBe(true);
        expect(report.projectedScore).toBeGreaterThanOrEqual(report.score);
        expect(report.projectedScore).toBeLessThanOrEqual(100);
      }
    });

    it('always sorts fixes by priority descending, with ties broken by pointsGain descending', () => {
      for (const { snapshot } of fixtures) {
        const report = scoreSnapshot(snapshot);
        for (let i = 0; i < report.fixes.length - 1; i++) {
          const current = report.fixes[i];
          const next = report.fixes[i + 1];

          if (current.priority !== next.priority) {
            expect(current.priority).toBeGreaterThanOrEqual(next.priority);
          } else {
            expect(current.pointsGain).toBeGreaterThanOrEqual(next.pointsGain);
          }
        }
      }
    });

    it('ensures every fix has valid effort, why (1 sentence), and how (actionable instructions)', () => {
      for (const { snapshot } of fixtures) {
        const report = scoreSnapshot(snapshot);
        for (const fix of report.fixes) {
          expect(['S', 'M', 'L']).toContain(fix.effort);
          expect(fix.title.trim().length).toBeGreaterThan(0);
          expect(fix.why.trim().length).toBeGreaterThan(10);
          expect(fix.how.trim().length).toBeGreaterThan(10);
          expect(fix.pointsGain).toBeGreaterThan(0);
        }
      }
    });
  });
});
