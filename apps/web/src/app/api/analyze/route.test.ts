import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { NextRequest } from 'next/server';
import { POST } from './route';
import {
  GitHubClient,
  RepoNotFoundError,
  PrivateRepoError,
  RateLimitError,
} from '@repometric/core';
import type { RepoSnapshot } from '@repometric/core';

// Mock GitHubClient
vi.mock('@repometric/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repometric/core')>();
  return {
    ...actual,
    GitHubClient: vi.fn(),
  };
});

describe('POST /api/analyze (T2.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSnapshot: RepoSnapshot = {
    meta: {
      owner: 'testowner',
      name: 'testrepo',
      defaultBranch: 'main',
      description: 'A test repo',
      topics: ['testing'],
      homepage: null,
      license: 'MIT',
      stars: 120,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'a1b2c3d4e5f678901234567890abcdef12345678',
    now: '2026-10-19T10:00:00Z',
    readme:
      '# Test Repo\n\nA great test repo with documentation and setup.\n\n## Install\n```sh\nnpm install\n```\n\n## Usage\n```ts\nimport test from "test";\n```\n\n## License\nMIT\n',
    tree: [
      { path: 'index.ts', size: 100, language: 'TypeScript', isTest: false },
      { path: 'README.md', size: 500, language: 'Markdown', isTest: false },
    ],
    commits: [
      { date: '2026-10-18T10:00:00Z', authorLogin: 'alice' },
      { date: '2026-10-15T10:00:00Z', authorLogin: 'bob' },
    ],
    issues: [
      {
        number: 1,
        author: 'charlie',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
        state: 'closed',
        firstResponseAt: '2026-10-01T11:00:00Z',
      },
    ],
    pulls: [
      {
        number: 2,
        author: 'david',
        createdAt: '2026-10-03T10:00:00Z',
        closedAt: '2026-10-04T10:00:00Z',
        merged: true,
        firstResponseAt: '2026-10-03T11:00:00Z',
      },
    ],
    releases: [{ publishedAt: '2026-09-01T00:00:00Z' }],
    sampledSources: [{ path: 'index.ts', content: '// comment\nexport const x = 1;\n' }],
    manifests: [],
    registry: {},
  };

  it('returns 400 INVALID_REPO for malformed request body', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('INVALID_REPO');
  });

  it('returns 404 NOT_FOUND when repository does not exist', async () => {
    const mockGetHeadSha = vi.fn().mockRejectedValue(new RepoNotFoundError('missing', 'repo'));
    (GitHubClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getHeadSha: mockGetHeadSha,
      getSnapshot: vi.fn(),
    }));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo: 'missing/repo' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 PRIVATE_REPO when repository is private', async () => {
    const mockGetHeadSha = vi.fn().mockRejectedValue(new PrivateRepoError('secret', 'repo'));
    (GitHubClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getHeadSha: mockGetHeadSha,
      getSnapshot: vi.fn(),
    }));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo: 'secret/repo' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('PRIVATE_REPO');
  });

  it('returns 429 RATE_LIMITED when GitHub rate limit is exceeded', async () => {
    const resetDate = new Date(Date.now() + 60000);
    const mockGetHeadSha = vi.fn().mockRejectedValue(new RateLimitError(resetDate));
    (GitHubClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getHeadSha: mockGetHeadSha,
      getSnapshot: vi.fn(),
    }));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo: 'ratelimited/repo' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error.code).toBe('RATE_LIMITED');
  });

  it('analyzes repository and second call for the same SHA makes zero GitHub calls', async () => {
    const mockGetHeadSha = vi.fn().mockResolvedValue({
      meta: mockSnapshot.meta,
      headSha: mockSnapshot.commitSha,
    });
    const mockGetSnapshot = vi.fn().mockResolvedValue(mockSnapshot);

    (GitHubClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getHeadSha: mockGetHeadSha,
      getSnapshot: mockGetSnapshot,
    }));

    // First call: fresh analysis
    const req1 = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo: 'testowner/testrepo' }),
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.cached).toBe(false);
    expect(json1.analysis.score).toBeGreaterThan(0);
    expect(mockGetSnapshot).toHaveBeenCalledTimes(1);

    // Second call with the same SHA (passed directly or resolved via getHeadSha)
    const req2 = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo: 'testowner/testrepo', sha: mockSnapshot.commitSha }),
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.cached).toBe(true);
    expect(json2.analysis.score).toBe(json1.analysis.score);
    // getSnapshot should STILL have been called only once (zero additional GitHub calls)
    expect(mockGetSnapshot).toHaveBeenCalledTimes(1);
  });
});
