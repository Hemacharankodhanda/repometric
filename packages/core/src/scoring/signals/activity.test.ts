import { describe, it, expect } from 'vitest';
import {
  commits90dSignal,
  lastCommitSignal,
  releasesSignal,
} from './activity';
import type { RepoSnapshot } from '../../types';

const BASE_NOW = new Date('2026-10-19T12:00:00Z');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function createDummySnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'test-owner',
      name: 'test-repo',
      defaultBranch: 'main',
      description: null,
      topics: [],
      homepage: null,
      license: null,
      stars: 0,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'sha1',
    now: BASE_NOW.toISOString(),
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

describe('Activity signals (T1.4)', () => {
  describe('activity.commits_90d boundaries', () => {
    it('returns 0 points (fail) for 0 commits in 90 days', () => {
      const snapshot = createDummySnapshot({ commits: [] });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('returns 4 points (partial) for 15 commits (half target)', () => {
      const commits = Array.from({ length: 15 }, (_, i) => ({
        date: new Date(BASE_NOW.getTime() - i * MS_PER_DAY).toISOString(),
        authorLogin: 'dev',
      }));
      const snapshot = createDummySnapshot({ commits });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('partial');
    });

    it('returns 7.73 points (partial) for 29 commits', () => {
      const commits = Array.from({ length: 29 }, (_, i) => ({
        date: new Date(BASE_NOW.getTime() - i * MS_PER_DAY).toISOString(),
        authorLogin: 'dev',
      }));
      const snapshot = createDummySnapshot({ commits });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(7.73);
      expect(res.status).toBe('partial');
    });

    it('returns 8 points (pass) for exactly 30 commits', () => {
      const commits = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(BASE_NOW.getTime() - i * MS_PER_DAY).toISOString(),
        authorLogin: 'dev',
      }));
      const snapshot = createDummySnapshot({ commits });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(8);
      expect(res.status).toBe('pass');
    });

    it('clamps to 8 points (pass) for 60 commits (exceeding target)', () => {
      const commits = Array.from({ length: 60 }, (_, i) => ({
        date: new Date(BASE_NOW.getTime() - i * MS_PER_DAY).toISOString(),
        authorLogin: 'dev',
      }));
      const snapshot = createDummySnapshot({ commits });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(8);
      expect(res.status).toBe('pass');
    });

    it('excludes commits older than 90 days', () => {
      const commits = [
        { date: new Date(BASE_NOW.getTime() - 10 * MS_PER_DAY).toISOString(), authorLogin: 'dev' },
        { date: new Date(BASE_NOW.getTime() - 95 * MS_PER_DAY).toISOString(), authorLogin: 'dev' },
      ];
      const snapshot = createDummySnapshot({ commits });
      const res = commits90dSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.evidence).toContain('1 commit in the last 90 days');
      expect(res.earned).toBe(0.27);
    });
  });

  describe('activity.last_commit boundaries', () => {
    it('returns 0 points (fail) for empty commits', () => {
      const snapshot = createDummySnapshot({ commits: [] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
      expect(res.evidence).toContain('No commits recorded');
    });

    it('returns 6 points (pass) for commit today (0 days)', () => {
      const snapshot = createDummySnapshot({
        commits: [{ date: BASE_NOW.toISOString(), authorLogin: 'dev' }],
      });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
      expect(res.evidence).toContain('Last commit was today');
    });

    it('returns 6 points (pass) at boundary <=14 days', () => {
      const date = new Date(BASE_NOW.getTime() - 14 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('returns 5 points (partial) at boundary 14.5 days (<=30 days)', () => {
      const date = new Date(BASE_NOW.getTime() - 14.5 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(5);
      expect(res.status).toBe('partial');
    });

    it('returns 5 points (partial) at boundary <=30 days', () => {
      const date = new Date(BASE_NOW.getTime() - 30 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(5);
      expect(res.status).toBe('partial');
    });

    it('returns 3 points (partial) at boundary 30.5 days (<=90 days)', () => {
      const date = new Date(BASE_NOW.getTime() - 30.5 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('returns 3 points (partial) at boundary <=90 days', () => {
      const date = new Date(BASE_NOW.getTime() - 90 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
    });

    it('returns 1 point (partial) at boundary 90.5 days (<=180 days)', () => {
      const date = new Date(BASE_NOW.getTime() - 90.5 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(1);
      expect(res.status).toBe('partial');
    });

    it('returns 1 point (partial) at boundary <=180 days', () => {
      const date = new Date(BASE_NOW.getTime() - 180 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(1);
      expect(res.status).toBe('partial');
    });

    it('returns 0 points (fail) for >180 days', () => {
      const date = new Date(BASE_NOW.getTime() - 181 * MS_PER_DAY).toISOString();
      const snapshot = createDummySnapshot({ commits: [{ date, authorLogin: 'dev' }] });
      const res = lastCommitSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('activity.releases boundaries', () => {
    it('returns 0 points (fail) for 0 releases', () => {
      const snapshot = createDummySnapshot({ releases: [] });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
      expect(res.evidence).toContain('No releases or tags');
    });

    it('returns 3 points (partial) for 1 release in last 365 days', () => {
      const snapshot = createDummySnapshot({
        releases: [{ publishedAt: new Date(BASE_NOW.getTime() - 30 * MS_PER_DAY).toISOString() }],
      });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
      expect(res.evidence).toContain('1 release published');
    });

    it('returns 3 points (partial) for 2 releases in last 365 days', () => {
      const snapshot = createDummySnapshot({
        releases: [
          { publishedAt: new Date(BASE_NOW.getTime() - 10 * MS_PER_DAY).toISOString() },
          { publishedAt: new Date(BASE_NOW.getTime() - 100 * MS_PER_DAY).toISOString() },
        ],
      });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('partial');
      expect(res.evidence).toContain('2 releases published');
    });

    it('returns 6 points (pass) for 3 releases in last 365 days', () => {
      const snapshot = createDummySnapshot({
        releases: [
          { publishedAt: new Date(BASE_NOW.getTime() - 10 * MS_PER_DAY).toISOString() },
          { publishedAt: new Date(BASE_NOW.getTime() - 50 * MS_PER_DAY).toISOString() },
          { publishedAt: new Date(BASE_NOW.getTime() - 100 * MS_PER_DAY).toISOString() },
        ],
      });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('returns 6 points (pass) for 10 releases', () => {
      const releases = Array.from({ length: 10 }, (_, i) => ({
        publishedAt: new Date(BASE_NOW.getTime() - i * 10 * MS_PER_DAY).toISOString(),
      }));
      const snapshot = createDummySnapshot({ releases });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(6);
      expect(res.status).toBe('pass');
    });

    it('excludes releases older than 365 days', () => {
      const snapshot = createDummySnapshot({
        releases: [
          { publishedAt: new Date(BASE_NOW.getTime() - 400 * MS_PER_DAY).toISOString() },
        ],
      });
      const res = releasesSignal.compute({ snapshot, now: BASE_NOW });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });
});
