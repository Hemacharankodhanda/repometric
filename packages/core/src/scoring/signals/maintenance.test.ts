import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../../types';
import { firstResponseSignal, prMergeRateSignal, staleIssuesSignal } from './maintenance';

function createMockSnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'acme',
      name: 'widget',
      defaultBranch: 'main',
      description: 'An acme widget tool',
      topics: ['widget'],
      homepage: null,
      license: 'MIT',
      stars: 10,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'commit1',
    now: '2026-03-01T12:00:00Z',
    tree: [],
    readme: null,
    commits: [],
    issues: [],
    pulls: [],
    releases: [],
    sampledSources: [],
    manifests: [],
    registry: {},
    ...overrides,
  };
}

describe('Maintenance Signals (T2.1)', () => {
  describe('maintenance.first_response', () => {
    it('returns no_data (4 points) when no external issues or PRs exist', () => {
      const snapshot = createMockSnapshot();
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('no_data');
      expect(res.evidence).toContain('No external issues or pull requests');
    });

    it('excludes issues/PRs created by repo owner (case-insensitive)', () => {
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'ACME', // repo owner in uppercase
            createdAt: '2026-02-01T10:00:00Z',
            updatedAt: '2026-02-01T12:00:00Z',
            state: 'open',
            firstResponseAt: '2026-02-01T11:00:00Z',
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.status).toBe('no_data');
      expect(res.earned).toBe(4);
    });

    it('excludes issues/PRs created by bots (login ending with [bot])', () => {
      const snapshot = createMockSnapshot({
        pulls: [
          {
            number: 1,
            author: 'dependabot[bot]',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-01T12:00:00Z',
            merged: true,
            firstResponseAt: '2026-02-01T11:00:00Z',
          },
          {
            number: 2,
            author: 'renovate[bot]',
            createdAt: '2026-02-05T10:00:00Z',
            closedAt: null,
            merged: false,
            firstResponseAt: '2026-02-05T11:00:00Z',
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.status).toBe('no_data');
      expect(res.earned).toBe(4);
    });

    it('excludes issues/PRs created more than 180 days ago', () => {
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'external_user',
            createdAt: '2025-08-01T10:00:00Z', // > 180 days before 2026-03-01
            updatedAt: '2025-08-01T11:00:00Z',
            state: 'closed',
            firstResponseAt: '2025-08-01T11:00:00Z',
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.status).toBe('no_data');
      expect(res.earned).toBe(4);
    });

    it('evaluates boundary <= 48 hours: 8 points, pass', () => {
      // Exactly 48 hours response time
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'external_user',
            createdAt: '2026-02-01T10:00:00Z',
            updatedAt: '2026-02-03T10:00:00Z',
            state: 'open',
            firstResponseAt: '2026-02-03T10:00:00Z', // 48h later
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(8);
      expect(res.status).toBe('pass');
    });

    it('evaluates boundary <= 168 hours (7 days): 6 points, partial', () => {
      // 49 hours response time (> 48 and <= 168)
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'external_user',
            createdAt: '2026-02-01T10:00:00Z',
            updatedAt: '2026-02-03T11:00:00Z',
            state: 'open',
            firstResponseAt: '2026-02-03T11:00:00Z', // 49h later
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary <= 720 hours (30 days): 3 points, partial', () => {
      // 200 hours response time (> 168 and <= 720)
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'external_user',
            createdAt: '2026-02-01T10:00:00Z',
            updatedAt: '2026-02-09T18:00:00Z',
            state: 'open',
            firstResponseAt: '2026-02-09T18:00:00Z', // 200h later
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary > 720 hours: 0 points, fail', () => {
      // 721 hours response time
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'external_user',
            createdAt: '2026-01-01T10:00:00Z',
            updatedAt: '2026-01-31T11:00:00Z',
            state: 'open',
            firstResponseAt: '2026-01-31T11:00:00Z', // 721h later
          },
        ],
      });
      const res = firstResponseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('maintenance.stale_issues', () => {
    it('returns 6 points (pass) when there are zero open issues', () => {
      const snapshot = createMockSnapshot({
        issues: [
          {
            number: 1,
            author: 'user1',
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-01T10:00:00Z',
            state: 'closed',
            firstResponseAt: null,
          },
        ],
      });
      const res = staleIssuesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('returns 6 points when stale ratio <= 10%', () => {
      // 1 stale issue out of 10 open issues = 10% ratio
      const nowMs = new Date('2026-03-01T12:00:00Z').getTime();
      const freshDate = new Date(nowMs - 10 * 24 * 60 * 60 * 1000).toISOString();
      const staleDate = new Date(nowMs - 100 * 24 * 60 * 60 * 1000).toISOString();

      const issues = Array(9)
        .fill(null)
        .map((_, i) => ({
          number: i + 1,
          author: 'user',
          createdAt: freshDate,
          updatedAt: freshDate,
          state: 'open' as const,
          firstResponseAt: null,
        }));
      issues.push({
        number: 10,
        author: 'user',
        createdAt: staleDate,
        updatedAt: staleDate,
        state: 'open' as const,
        firstResponseAt: null,
      });

      const snapshot = createMockSnapshot({ issues });
      const res = staleIssuesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('returns 3 points (mid) when stale ratio is 35%', () => {
      // 35% stale ratio -> 6 * (1 - (0.35 - 0.10) / 0.50) = 6 * 0.5 = 3.0
      const nowMs = new Date('2026-03-01T12:00:00Z').getTime();
      const freshDate = new Date(nowMs - 10 * 24 * 60 * 60 * 1000).toISOString();
      const staleDate = new Date(nowMs - 100 * 24 * 60 * 60 * 1000).toISOString();

      const issues = [
        ...Array(65)
          .fill(null)
          .map((_, i) => ({
            number: i + 1,
            author: 'user',
            createdAt: freshDate,
            updatedAt: freshDate,
            state: 'open' as const,
            firstResponseAt: null,
          })),
        ...Array(35)
          .fill(null)
          .map((_, i) => ({
            number: i + 66,
            author: 'user',
            createdAt: staleDate,
            updatedAt: staleDate,
            state: 'open' as const,
            firstResponseAt: null,
          })),
      ];

      const snapshot = createMockSnapshot({ issues });
      const res = staleIssuesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('returns 0 points when stale ratio >= 60%', () => {
      // 60% stale ratio -> 6 * (1 - (0.60 - 0.10) / 0.50) = 0
      const nowMs = new Date('2026-03-01T12:00:00Z').getTime();
      const staleDate = new Date(nowMs - 120 * 24 * 60 * 60 * 1000).toISOString();

      const issues = Array(10)
        .fill(null)
        .map((_, i) => ({
          number: i + 1,
          author: 'user',
          createdAt: staleDate,
          updatedAt: staleDate,
          state: 'open' as const,
          firstResponseAt: null,
        }));

      const snapshot = createMockSnapshot({ issues });
      const res = staleIssuesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('maintenance.pr_merge_rate', () => {
    it('returns no_data (3 points) when no PRs were closed in last 180 days', () => {
      const snapshot = createMockSnapshot({
        pulls: [
          {
            number: 1,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: null, // still open
            merged: false,
            firstResponseAt: null,
          },
        ],
      });
      const res = prMergeRateSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('no_data');
    });

    it('evaluates boundary >= 70% merge rate: 6 points, pass', () => {
      const pulls = [
        ...Array(7)
          .fill(null)
          .map((_, i) => ({
            number: i + 1,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-02T10:00:00Z',
            merged: true,
            firstResponseAt: null,
          })),
        ...Array(3)
          .fill(null)
          .map((_, i) => ({
            number: i + 8,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-02T10:00:00Z',
            merged: false,
            firstResponseAt: null,
          })),
      ];
      const snapshot70 = createMockSnapshot({ pulls });
      const res = prMergeRateSignal.compute({
        snapshot: snapshot70,
        now: new Date(snapshot70.now),
      });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('evaluates boundary 35% merge rate: 3 points, partial', () => {
      // 35% merged / 70% target = 0.5 * 6 = 3.0 points
      const pulls = [
        ...Array(35)
          .fill(null)
          .map((_, i) => ({
            number: i + 1,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-02T10:00:00Z',
            merged: true,
            firstResponseAt: null,
          })),
        ...Array(65)
          .fill(null)
          .map((_, i) => ({
            number: i + 36,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-02T10:00:00Z',
            merged: false,
            firstResponseAt: null,
          })),
      ];
      const snapshot = createMockSnapshot({ pulls });
      const res = prMergeRateSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary 0% merge rate: 0 points, fail', () => {
      const snapshot = createMockSnapshot({
        pulls: [
          {
            number: 1,
            author: 'user',
            createdAt: '2026-02-01T10:00:00Z',
            closedAt: '2026-02-02T10:00:00Z',
            merged: false,
            firstResponseAt: null,
          },
        ],
      });
      const res = prMergeRateSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });
});
