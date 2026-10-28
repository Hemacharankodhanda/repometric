import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../../types';
import { busFactorSignal, communityFilesSignal, contributorsSignal } from './community';

function createMockSnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'acme',
      name: 'community-project',
      defaultBranch: 'main',
      description: 'A community driven project',
      topics: ['community'],
      homepage: null,
      license: 'MIT',
      stars: 100,
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

describe('Community Signals (T2.2)', () => {
  describe('community.bus_factor', () => {
    it('returns no_data (3.5 points) when 0 commits exist in last 365 days', () => {
      const snapshot = createMockSnapshot({ commits: [] });
      const res = busFactorSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3.5);
      expect(res.status).toBe('no_data');
    });

    it('identifies solo project (1 author) and gives 0 points (share = 100%)', () => {
      const snapshot = createMockSnapshot({
        commits: [
          { date: '2026-02-01T10:00:00Z', authorLogin: 'solo_author' },
          { date: '2026-01-15T10:00:00Z', authorLogin: 'solo_author' },
        ],
      });
      const res = busFactorSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
      expect(res.evidence).toContain('Solo project with 1 author');
    });

    it('evaluates boundary share <= 50%: 7 points, pass', () => {
      // 2 authors, 50% each: 7 * clamp01((0.95 - 0.50) / 0.45) = 7 * 1 = 7.0
      const snapshot = createMockSnapshot({
        commits: [
          { date: '2026-02-01T10:00:00Z', authorLogin: 'author1' },
          { date: '2026-02-02T10:00:00Z', authorLogin: 'author2' },
        ],
      });
      const res = busFactorSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(7);
      expect(res.status).toBe('pass');
    });

    it('evaluates boundary share = 72.5%: 3.5 points, partial', () => {
      // 72.5% share -> 7 * (0.95 - 0.725) / 0.45 = 7 * 0.5 = 3.5
      // 29 commits author1, 11 commits author2 = 40 commits total (29/40 = 72.5%)
      const commits = [
        ...Array(29)
          .fill(null)
          .map((_, i) => ({
            date: `2026-02-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
            authorLogin: 'author1',
          })),
        ...Array(11)
          .fill(null)
          .map((_, i) => ({
            date: `2026-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
            authorLogin: 'author2',
          })),
      ];
      const snapshot = createMockSnapshot({ commits });
      const res = busFactorSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3.5);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary share >= 95%: 0 points, fail', () => {
      // 95% share -> 7 * (0.95 - 0.95) / 0.45 = 0
      // 19 commits author1, 1 commit author2 = 20 total (19/20 = 95%)
      const commits = [
        ...Array(19)
          .fill(null)
          .map(() => ({
            date: '2026-02-01T10:00:00Z',
            authorLogin: 'author1',
          })),
        { date: '2026-02-02T10:00:00Z', authorLogin: 'author2' },
      ];
      const snapshot = createMockSnapshot({ commits });
      const res = busFactorSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('community.contributors', () => {
    it('evaluates boundary n = 0: 0 points, fail', () => {
      const snapshot = createMockSnapshot({ commits: [] });
      const res = contributorsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('evaluates boundary n = 1: 0 points, fail', () => {
      // 4 * (1 - 1) / 4 = 0
      const snapshot = createMockSnapshot({
        commits: [{ date: '2026-02-01T10:00:00Z', authorLogin: 'single_author' }],
      });
      const res = contributorsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('evaluates boundary n = 3: 2 points, partial', () => {
      // 4 * (3 - 1) / 4 = 2.0
      const snapshot = createMockSnapshot({
        commits: [
          { date: '2026-02-01T10:00:00Z', authorLogin: 'alice' },
          { date: '2026-02-02T10:00:00Z', authorLogin: 'bob' },
          { date: '2026-02-03T10:00:00Z', authorLogin: 'charlie' },
        ],
      });
      const res = contributorsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary n >= 5: 4 points, pass', () => {
      // 4 * (5 - 1) / 4 = 4.0
      const snapshot = createMockSnapshot({
        commits: [
          { date: '2026-02-01T10:00:00Z', authorLogin: 'user1' },
          { date: '2026-02-02T10:00:00Z', authorLogin: 'user2' },
          { date: '2026-02-03T10:00:00Z', authorLogin: 'user3' },
          { date: '2026-02-04T10:00:00Z', authorLogin: 'user4' },
          { date: '2026-02-05T10:00:00Z', authorLogin: 'user5' },
        ],
      });
      const res = contributorsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('pass');
    });
  });

  describe('community.files', () => {
    it('returns 0 points when no community files exist', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/main.ts', size: 100, language: 'TypeScript', isTest: false }],
      });
      const res = communityFilesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('returns 2 points for CONTRIBUTING.md', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'CONTRIBUTING.md', size: 500, language: 'Markdown', isTest: false }],
      });
      const res = communityFilesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('partial');
    });

    it('returns 3 points for CONTRIBUTING + CODE_OF_CONDUCT', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'CONTRIBUTING.md', size: 500, language: 'Markdown', isTest: false },
          { path: 'CODE_OF_CONDUCT.md', size: 500, language: 'Markdown', isTest: false },
        ],
      });
      const res = communityFilesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('returns 4 points (pass) when all three are present', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'CONTRIBUTING.md', size: 500, language: 'Markdown', isTest: false },
          { path: 'CODE_OF_CONDUCT.md', size: 500, language: 'Markdown', isTest: false },
          {
            path: '.github/issue_template/bug_report.md',
            size: 200,
            language: 'Markdown',
            isTest: false,
          },
        ],
      });
      const res = communityFilesSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('pass');
    });
  });
});
