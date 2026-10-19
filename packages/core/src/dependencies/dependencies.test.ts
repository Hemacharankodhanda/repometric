import { describe, expect, it, vi } from 'vitest';
import type { RepoSnapshot } from '../types';
import {
  parsePackageJson,
  parsePyprojectToml,
  parseRequirementsTxt,
} from './manifests';
import {
  fetchNpmPackageInfo,
  fetchPyPiPackageInfo,
  lookupDependencies,
} from './registry';
import {
  deprecatedDepsSignal,
  lockfileSignal,
  outdatedDepsSignal,
  parseMajorVersion,
} from '../scoring/signals/dependencies';

function createMockSnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'acme',
      name: 'widget',
      defaultBranch: 'main',
      description: 'Test widget',
      topics: ['tools'],
      homepage: null,
      license: 'MIT',
      stars: 10,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'sha1',
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

describe('Dependency Manifests & Registry Lookups (T2.3)', () => {
  describe('parsePackageJson', () => {
    it('parses dependencies and devDependencies from valid package.json', () => {
      const pkg = JSON.stringify({
        name: 'my-pkg',
        dependencies: {
          react: '^18.2.0',
          lodash: '4.17.21',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      });

      const res = parsePackageJson(pkg);
      expect(res.dependencies).toEqual({
        react: '^18.2.0',
        lodash: '4.17.21',
      });
      expect(res.devDependencies).toEqual({
        typescript: '^5.0.0',
      });
    });

    it('gracefully handles empty or invalid content', () => {
      expect(parsePackageJson(null)).toEqual({ dependencies: {}, devDependencies: {} });
      expect(parsePackageJson('invalid json {')).toEqual({ dependencies: {}, devDependencies: {} });
    });
  });

  describe('parseRequirementsTxt', () => {
    it('parses packages and detects >= 80% pinned lockfile condition', () => {
      const content = `
# Requirements file
requests==2.28.1
urllib3==1.26.12
certifi==2022.9.24
idna==3.4
flask>=2.0.0 # not pinned
`;
      // 5 packages, 4 pinned with == (80%)
      const res = parseRequirementsTxt(content);
      expect(Object.keys(res.dependencies)).toHaveLength(5);
      expect(res.dependencies['requests']).toBe('==2.28.1');
      expect(res.dependencies['flask']).toBe('>=2.0.0');
      expect(res.isPinnedLockfile).toBe(true);
    });

    it('returns isPinnedLockfile = false when fewer than 80% are pinned', () => {
      const content = `
requests>=2.0.0
flask>=2.0.0
urllib3==1.26.0
`;
      // 1 of 3 pinned = 33.3%
      const res = parseRequirementsTxt(content);
      expect(res.isPinnedLockfile).toBe(false);
    });
  });

  describe('parsePyprojectToml', () => {
    it('parses PEP 621 dependencies from pyproject.toml', () => {
      const content = `
[project]
name = "demo"
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn[standard]==0.22.0",
    "pydantic~=2.0.0",
]

[project.optional-dependencies]
test = [
    "pytest>=7.0.0",
]
`;
      const res = parsePyprojectToml(content);
      expect(res.dependencies['fastapi']).toBe('>=0.100.0');
      expect(res.dependencies['uvicorn']).toBe('==0.22.0');
      expect(res.dependencies['pydantic']).toBe('~=2.0.0');
      expect(res.devDependencies['pytest']).toBe('>=7.0.0');
    });

    it('parses Poetry style dependencies table', () => {
      const content = `
[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"
django = { version = ">=4.2,<5.0" }

[tool.poetry.group.dev.dependencies]
black = "^23.3.0"
`;
      const res = parsePyprojectToml(content);
      expect(res.dependencies['python']).toBeUndefined(); // Python runtime skipped
      expect(res.dependencies['requests']).toBe('^2.31.0');
      expect(res.dependencies['django']).toBe('>=4.2,<5.0');
      expect(res.devDependencies['black']).toBe('^23.3.0');
    });
  });

  describe('parseMajorVersion (range-to-major parsing)', () => {
    it('correctly extracts major version numbers from semver ranges and specifiers', () => {
      expect(parseMajorVersion('^18.2.0')).toBe(18);
      expect(parseMajorVersion('~1.4.2')).toBe(1);
      expect(parseMajorVersion('>=2.0.0')).toBe(2);
      expect(parseMajorVersion('<=3.1.0')).toBe(3);
      expect(parseMajorVersion('==4.0.0')).toBe(4);
      expect(parseMajorVersion('18.x')).toBe(18);
      expect(parseMajorVersion('0.5.2')).toBe(0);
      expect(parseMajorVersion('v2.1.0')).toBe(2);
      expect(parseMajorVersion('*')).toBe(null);
      expect(parseMajorVersion('')).toBe(null);
    });
  });

  describe('Registry lookups and deprecated flag parsing', () => {
    it('reads latest version and non-deprecated flag from npm registry response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          'dist-tags': { latest: '18.2.0' },
          versions: {
            '18.2.0': { version: '18.2.0' },
          },
        }),
      });

      const info = await fetchNpmPackageInfo('react', mockFetch as unknown as typeof fetch);
      expect(info).toEqual({ latest: '18.2.0', deprecated: false });
    });

    it('detects deprecated packages on npm registry', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          'dist-tags': { latest: '2.5.0' },
          versions: {
            '2.5.0': { version: '2.5.0', deprecated: 'This package has been deprecated.' },
          },
        }),
      });

      const info = await fetchNpmPackageInfo('request', mockFetch as unknown as typeof fetch);
      expect(info).toEqual({ latest: '2.5.0', deprecated: true });
    });

    it('reads latest version and deprecated/yanked flag from PyPI registry response', async () => {
      const mockFetchNormal = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          info: { version: '2.28.1', yanked: false, classifiers: [] },
        }),
      });

      const infoNormal = await fetchPyPiPackageInfo('requests', mockFetchNormal as unknown as typeof fetch);
      expect(infoNormal).toEqual({ latest: '2.28.1', deprecated: false });

      const mockFetchDeprecated = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          info: {
            version: '1.0.0',
            yanked: false,
            classifiers: ['Development Status :: 7 - Inactive'],
          },
        }),
      });

      const infoDeprecated = await fetchPyPiPackageInfo('old-py-pkg', mockFetchDeprecated as unknown as typeof fetch);
      expect(infoDeprecated).toEqual({ latest: '1.0.0', deprecated: true });
    });

    it('performs concurrent dependency lookups up to concurrency limit', async () => {
      let activeCount = 0;
      let maxSeenConcurrency = 0;

      const mockFetch = vi.fn().mockImplementation(async () => {
        activeCount++;
        maxSeenConcurrency = Math.max(maxSeenConcurrency, activeCount);
        await new Promise((resolve) => setTimeout(resolve, 5));
        activeCount--;
        return {
          ok: true,
          json: async () => ({
            'dist-tags': { latest: '1.0.0' },
            versions: { '1.0.0': {} },
          }),
        };
      });

      const items = Array.from({ length: 20 }, (_, i) => ({
        name: `pkg-${i}`,
        ecosystem: 'npm' as const,
      }));

      const results = await lookupDependencies(items, {
        fetch: mockFetch as unknown as typeof fetch,
        concurrency: 8,
      });

      expect(Object.keys(results)).toHaveLength(20);
      expect(maxSeenConcurrency).toBeLessThanOrEqual(8);
    });
  });

  describe('Dependency scoring signals (AC validation)', () => {
    it('returns status na when no manifest exists', () => {
      const snapshot = createMockSnapshot({ manifests: [] });
      const now = new Date(snapshot.now);

      const resLock = lockfileSignal.compute({ snapshot, now });
      const resOut = outdatedDepsSignal.compute({ snapshot, now });
      const resDep = deprecatedDepsSignal.compute({ snapshot, now });

      expect(resLock.status).toBe('na');
      expect(resLock.earned).toBe(0);
      expect(resOut.status).toBe('na');
      expect(resOut.earned).toBe(0);
      expect(resDep.status).toBe('na');
      expect(resDep.earned).toBe(0);
    });

    it('evaluates lockfile pass (3 pts) and fail (0 pts)', () => {
      const now = new Date('2026-03-01T12:00:00Z');
      const passSnapshot = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { react: '^18.0.0' },
            devDependencies: {},
            hasLockfile: true,
          },
        ],
      });
      expect(lockfileSignal.compute({ snapshot: passSnapshot, now }).earned).toBe(3);

      const failSnapshot = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { react: '^18.0.0' },
            devDependencies: {},
            hasLockfile: false,
          },
        ],
      });
      expect(lockfileSignal.compute({ snapshot: failSnapshot, now }).earned).toBe(0);
    });

    it('evaluates outdated dependencies formula boundaries', () => {
      const now = new Date('2026-03-01T12:00:00Z');

      // 0 behind: 5 points, pass
      const snapshotFresh = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { react: '^18.0.0' },
            devDependencies: {},
            hasLockfile: true,
          },
        ],
        registry: {
          'npm:react': { latest: '18.2.0', deprecated: false },
        },
      });
      expect(outdatedDepsSignal.compute({ snapshot: snapshotFresh, now }).earned).toBe(5);

      // 100% behind: 0 points, fail
      const snapshotOutdated = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { react: '^16.0.0' },
            devDependencies: {},
            hasLockfile: true,
          },
        ],
        registry: {
          'npm:react': { latest: '18.2.0', deprecated: false },
        },
      });
      expect(outdatedDepsSignal.compute({ snapshot: snapshotOutdated, now }).earned).toBe(0);
    });

    it('evaluates deprecated dependencies: 0 if deprecated, 2 if clean', () => {
      const now = new Date('2026-03-01T12:00:00Z');

      const cleanSnapshot = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { react: '^18.0.0' },
            devDependencies: {},
            hasLockfile: true,
          },
        ],
        registry: {
          'npm:react': { latest: '18.2.0', deprecated: false },
        },
      });
      expect(deprecatedDepsSignal.compute({ snapshot: cleanSnapshot, now }).earned).toBe(2);

      const depSnapshot = createMockSnapshot({
        manifests: [
          {
            ecosystem: 'npm',
            path: 'package.json',
            dependencies: { request: '^2.88.0' },
            devDependencies: {},
            hasLockfile: true,
          },
        ],
        registry: {
          'npm:request': { latest: '2.88.2', deprecated: true },
        },
      });
      expect(deprecatedDepsSignal.compute({ snapshot: depSnapshot, now }).earned).toBe(0);
    });
  });
});
