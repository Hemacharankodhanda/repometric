import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { GitHubClient, normalizeRepoTarget } from './client';
import { PrivateRepoError, RateLimitError, RepoNotFoundError } from '../errors';

const API_BASE = 'https://api.github.com';
const RAW_BASE = 'https://raw.githubusercontent.com';

const mockRepoMeta = {
  name: 'test-repo',
  owner: { login: 'test-owner' },
  default_branch: 'main',
  description: 'A great test repository',
  topics: ['typescript', 'analyzer'],
  homepage: 'https://repometric.dev',
  license: { spdx_id: 'MIT' },
  stargazers_count: 120,
  has_wiki: true,
  archived: false,
  private: false,
};

const mockBranch = {
  name: 'main',
  commit: { sha: 'a1b2c3d4e5f60000000000000000000000000000' },
};

const mockTree = {
  sha: 'tree-sha-123',
  truncated: false,
  tree: [
    {
      path: 'README.md',
      type: 'blob',
      size: 1500,
      mode: '100644',
      sha: 'blob-readme',
      url: 'url',
    },
    {
      path: 'package.json',
      type: 'blob',
      size: 400,
      mode: '100644',
      sha: 'blob-pkg',
      url: 'url',
    },
    {
      path: 'src/index.ts',
      type: 'blob',
      size: 800,
      mode: '100644',
      sha: 'blob-ts',
      url: 'url',
    },
    {
      path: 'src/index.test.ts',
      type: 'blob',
      size: 350,
      mode: '100644',
      sha: 'blob-test',
      url: 'url',
    },
    {
      path: 'requirements.txt',
      type: 'blob',
      size: 120,
      mode: '100644',
      sha: 'blob-py',
      url: 'url',
    },
  ],
};

const mockCommits = [
  {
    sha: 'c1',
    commit: {
      author: { date: '2026-10-15T12:00:00Z', name: 'Dev' },
      committer: { date: '2026-10-15T12:00:00Z' },
      message: 'feat: init',
    },
    author: { login: 'dev-user' },
  },
];

const mockIssues = [
  {
    number: 1,
    title: 'Bug report',
    user: { login: 'reporter' },
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
    closed_at: null,
    state: 'open',
    comments: 2,
  },
  {
    number: 2,
    title: 'PR feature',
    user: { login: 'contributor' },
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-06T12:00:00Z',
    closed_at: '2026-10-06T12:00:00Z',
    state: 'closed',
    comments: 1,
    pull_request: {},
  },
];

const mockReleases = [
  {
    tag_name: 'v1.0.0',
    published_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
  },
];

const server = setupServer(
  // 1. Success Repo
  http.get(`${API_BASE}/repos/test-owner/test-repo`, () => {
    return HttpResponse.json(mockRepoMeta);
  }),
  http.get(`${API_BASE}/repos/test-owner/test-repo/branches/main`, () => {
    return HttpResponse.json(mockBranch);
  }),
  http.get(`${API_BASE}/repos/test-owner/test-repo/git/trees/:sha`, () => {
    return HttpResponse.json(mockTree);
  }),
  http.get(`${API_BASE}/repos/test-owner/test-repo/commits`, () => {
    return HttpResponse.json(mockCommits);
  }),
  http.get(`${API_BASE}/repos/test-owner/test-repo/issues`, () => {
    return HttpResponse.json(mockIssues);
  }),
  http.get(`${API_BASE}/repos/test-owner/test-repo/releases`, () => {
    return HttpResponse.json(mockReleases);
  }),
  http.get(`${RAW_BASE}/test-owner/test-repo/:sha/README.md`, () => {
    return new HttpResponse('# Test Repo\nWelcome to our project.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),
  http.get(`${RAW_BASE}/test-owner/test-repo/:sha/package.json`, () => {
    return HttpResponse.json({
      dependencies: { react: '^18.0.0' },
      devDependencies: { vitest: '^2.0.0' },
    });
  }),
  http.get(`${RAW_BASE}/test-owner/test-repo/:sha/requirements.txt`, () => {
    return new HttpResponse('flask>=2.0.0\npytest>=7.0.0\n', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),
  http.get(`${RAW_BASE}/test-owner/test-repo/:sha/src/index.ts`, () => {
    return new HttpResponse('// Sample file\nexport const x = 42;\n', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),

  // 2. 404 Repo
  http.get(`${API_BASE}/repos/test-owner/not-found-repo`, () => {
    return new HttpResponse(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      statusText: 'Not Found',
    });
  }),

  // 3. Private Repo
  http.get(`${API_BASE}/repos/test-owner/private-repo`, () => {
    return new HttpResponse(JSON.stringify({ message: 'Forbidden' }), {
      status: 403,
      statusText: 'Forbidden',
    });
  }),

  // 4. Rate Limited Repo
  http.get(`${API_BASE}/repos/test-owner/rate-limited-repo`, () => {
    return new HttpResponse(JSON.stringify({ message: 'API rate limit exceeded' }), {
      status: 403,
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1800000000',
      },
    });
  }),

  // 5. Truncated Tree Repo
  http.get(`${API_BASE}/repos/test-owner/truncated-repo`, () => {
    return HttpResponse.json(mockRepoMeta);
  }),
  http.get(`${API_BASE}/repos/test-owner/truncated-repo/branches/main`, () => {
    return HttpResponse.json(mockBranch);
  }),
  http.get(`${API_BASE}/repos/test-owner/truncated-repo/git/trees/:sha`, () => {
    return HttpResponse.json({
      ...mockTree,
      truncated: true,
    });
  }),
  http.get(`${API_BASE}/repos/test-owner/truncated-repo/commits`, () => {
    return HttpResponse.json([]);
  }),
  http.get(`${API_BASE}/repos/test-owner/truncated-repo/issues`, () => {
    return HttpResponse.json([]);
  }),
  http.get(`${API_BASE}/repos/test-owner/truncated-repo/releases`, () => {
    return HttpResponse.json([]);
  }),
);

describe('GitHubClient and target normalization (T1.2)', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('normalizeRepoTarget', () => {
    it('normalizes simple owner/repo', () => {
      expect(normalizeRepoTarget('Facebook/React')).toEqual({
        owner: 'facebook',
        name: 'react',
      });
    });

    it('normalizes full github URLs with .git and trailing slashes', () => {
      expect(
        normalizeRepoTarget('https://github.com/vercel/next.js.git/'),
      ).toEqual({
        owner: 'vercel',
        name: 'next.js',
      });
    });

    it('strips tree/branch path from github URL', () => {
      expect(
        normalizeRepoTarget('https://github.com/tailwindlabs/tailwindcss/tree/main/src'),
      ).toEqual({
        owner: 'tailwindlabs',
        name: 'tailwindcss',
      });
    });

    it('throws error for invalid format', () => {
      expect(() => normalizeRepoTarget('not-a-repo')).toThrowError(
        /Invalid GitHub repository format/,
      );
    });
  });

  describe('GitHubClient snapshot and errors', () => {
    let client: GitHubClient;

    beforeEach(() => {
      client = new GitHubClient();
    });

    it('successfully fetches a complete RepoSnapshot', async () => {
      const snapshot = await client.getSnapshot('test-owner', 'test-repo', {
        now: '2026-10-19T10:00:00Z',
      });

      expect(snapshot.meta.owner).toBe('test-owner');
      expect(snapshot.meta.name).toBe('test-repo');
      expect(snapshot.meta.defaultBranch).toBe('main');
      expect(snapshot.meta.license).toBe('MIT');
      expect(snapshot.meta.stars).toBe(120);
      expect(snapshot.commitSha).toBe(mockBranch.commit.sha);
      expect(snapshot.truncatedTree).toBe(false);

      // Verify Tree
      expect(snapshot.tree.length).toBe(5);
      const tsFile = snapshot.tree.find((f) => f.path === 'src/index.ts');
      expect(tsFile?.language).toBe('TypeScript');
      expect(tsFile?.isTest).toBe(false);

      const testFile = snapshot.tree.find((f) => f.path === 'src/index.test.ts');
      expect(testFile?.isTest).toBe(true);

      // Verify Readme
      expect(snapshot.readme).toContain('# Test Repo');

      // Verify Manifests
      expect(snapshot.manifests).toEqual([
        {
          ecosystem: 'npm',
          path: 'package.json',
          dependencies: { react: '^18.0.0' },
          devDependencies: { vitest: '^2.0.0' },
          hasLockfile: false,
        },
        {
          ecosystem: 'pypi',
          path: 'requirements.txt',
          dependencies: { flask: '>=2.0.0', pytest: '>=7.0.0' },
          devDependencies: {},
          hasLockfile: false,
        },
      ]);

      // Verify Commits & Issues & Pulls
      expect(snapshot.commits.length).toBe(1);
      expect(snapshot.commits[0].authorLogin).toBe('dev-user');
      expect(snapshot.issues.length).toBe(1);
      expect(snapshot.issues[0].number).toBe(1);
      expect(snapshot.pulls.length).toBe(1);
      expect(snapshot.pulls[0].number).toBe(2);
      expect(snapshot.pulls[0].merged).toBe(true);

      // Verify Sampled sources
      expect(snapshot.sampledSources.length).toBe(1);
      expect(snapshot.sampledSources[0].path).toBe('src/index.ts');
    });

    it('throws RepoNotFoundError on 404', async () => {
      await expect(
        client.getSnapshot('test-owner', 'not-found-repo'),
      ).rejects.toThrow(RepoNotFoundError);
    });

    it('throws PrivateRepoError on 403 private', async () => {
      await expect(
        client.getSnapshot('test-owner', 'private-repo'),
      ).rejects.toThrow(PrivateRepoError);
    });

    it('throws RateLimitError on rate limit exhaustion', async () => {
      await expect(
        client.getSnapshot('test-owner', 'rate-limited-repo'),
      ).rejects.toThrow(RateLimitError);

      try {
        await client.getSnapshot('test-owner', 'rate-limited-repo');
      } catch (err) {
        expect(err instanceof RateLimitError).toBe(true);
        const rateLimitErr = err as RateLimitError;
        expect(rateLimitErr.resetAt.getTime()).toBe(1800000000 * 1000);
      }
    });

    it('detects truncated tree correctly', async () => {
      const snapshot = await client.getSnapshot('test-owner', 'truncated-repo');
      expect(snapshot.truncatedTree).toBe(true);
    });

    it('supports ETag caching with 304 response', async () => {
      let callCount = 0;
      server.use(
        http.get(`${API_BASE}/repos/test-owner/etag-repo`, ({ request }) => {
          callCount++;
          const ifNoneMatch = request.headers.get('if-none-match');
          if (ifNoneMatch === 'W/"12345"') {
            return new HttpResponse(null, { status: 304 });
          }
          return HttpResponse.json(mockRepoMeta, {
            headers: { ETag: 'W/"12345"' },
          });
        }),
      );

      const etagCache = new Map();
      const cachedClient = new GitHubClient({ etagCache });

      // First call -> 200 with ETag stored in cache
      await cachedClient['request']('/repos/test-owner/etag-repo');
      expect(callCount).toBe(1);
      expect(etagCache.size).toBe(1);

      // Second call -> sends If-None-Match, gets 304, returns cached data
      const data2 = await cachedClient['request']<typeof mockRepoMeta>(
        '/repos/test-owner/etag-repo',
      );
      expect(callCount).toBe(2);
      expect(data2.name).toBe('test-repo');
    });

    it('provides a RepoDataSource adapter for graph and scoring', async () => {
      const dataSource = client.asDataSource('test-owner', 'test-repo', mockBranch.commit.sha);
      const file = await dataSource.getFile('README.md');
      expect(file).toContain('# Test Repo');
      const snapshot = await dataSource.getSnapshot();
      expect(snapshot.meta.name).toBe('test-repo');
    });
  });
});
