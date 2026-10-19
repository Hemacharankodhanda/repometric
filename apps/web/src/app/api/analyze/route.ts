import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  GitHubClient,
  normalizeRepoTarget,
  scoreSnapshot,
  PrivateRepoError,
  RateLimitError,
  RepoNotFoundError,
  TooLargeError,
  UpstreamError,
} from '@repometric/core';
import {
  checkRateLimit,
  getStoredAnalysis,
  saveAnalysis,
} from '../../../server/analysisStore';

export const maxDuration = 60;

const requestSchema = z.object({
  repo: z.string().min(1, 'Repository is required'),
  sha: z.string().optional(),
});

function formatError(code: string, message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers },
  );
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting by client IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return formatError(
      'RATE_LIMITED',
      `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetSeconds / 60)} minutes.`,
      429,
      { 'Retry-After': String(rateLimit.resetSeconds) },
    );
  }

  // 2. Validate input body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return formatError('INVALID_REPO', 'Invalid JSON payload.', 400);
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    return formatError(
      'INVALID_REPO',
      'Input must include a valid repo (e.g. "owner/name" or GitHub URL).',
      400,
    );
  }

  // 3. Normalize repo target
  let normalized: { owner: string; name: string };
  try {
    normalized = normalizeRepoTarget(parseResult.data.repo);
  } catch {
    return formatError(
      'INVALID_REPO',
      'Invalid repository format. Expected "owner/repo" or a valid github.com URL.',
      400,
    );
  }

  const { owner, name } = normalized;
  const token = process.env.GITHUB_TOKEN;
  const client = new GitHubClient({ token });

  // 4. Fetch head SHA and check cache
  try {
    let headSha = parseResult.data.sha;
    if (!headSha) {
      const headInfo = await client.getHeadSha(owner, name);
      headSha = headInfo.headSha;
    }

    if (headSha) {
      const cached = await getStoredAnalysis(owner, name, headSha);
      if (cached) {
        return NextResponse.json({
          cached: true,
          analysis: {
            id: cached.id,
            ...cached.report,
          },
          graph: { status: cached.graphStatus },
          files: cached.files,
        });
      }
    }

    // 5. Cache miss: build full snapshot and score
    const snapshot = await client.getSnapshot(owner, name);
    const commitSha = snapshot.commitSha;

    // Run pure score engine
    const report = scoreSnapshot(snapshot);

    // Determine graph status per VISUALIZER_SPEC.md:
    // 'unsupported' if repo has > 20,000 files or no JS/TS/Python source files
    const hasCode = snapshot.tree.some(
      (f) =>
        f.language &&
        ['TypeScript', 'JavaScript', 'Python'].includes(f.language) &&
        !f.isTest,
    );
    const isTooLarge = snapshot.tree.length > 20000;
    const graphStatus: 'ready' | 'missing' | 'unsupported' =
      !hasCode || isTooLarge ? 'unsupported' : 'missing';

    // Files list for Repo Map (cap at 20,000)
    const files = snapshot.tree.slice(0, 20000);

    // Persist
    const stored = await saveAnalysis(
      owner,
      name,
      snapshot.meta.defaultBranch || 'main',
      commitSha,
      report,
      files,
      graphStatus,
    );

    return NextResponse.json({
      cached: false,
      analysis: {
        id: stored.id,
        ...report,
      },
      graph: { status: graphStatus },
      files,
    });
  } catch (err: unknown) {
    if (err instanceof RepoNotFoundError) {
      return formatError(
        'NOT_FOUND',
        `Repository "${err.owner}/${err.name}" does not exist.`,
        404,
      );
    }
    if (err instanceof PrivateRepoError) {
      return formatError(
        'PRIVATE_REPO',
        `Repository "${err.owner}/${err.name}" is private or requires authentication.`,
        403,
      );
    }
    if (err instanceof RateLimitError) {
      const waitMinutes = Math.max(1, Math.ceil((err.resetAt.getTime() - Date.now()) / 60000));
      return formatError(
        'RATE_LIMITED',
        `GitHub API rate limit reached. Try again in ${waitMinutes} minutes.`,
        429,
        { 'Retry-After': String(Math.ceil((err.resetAt.getTime() - Date.now()) / 1000)) },
      );
    }
    if (err instanceof TooLargeError) {
      return formatError(
        'TOO_LARGE',
        'Repository exceeds supported size limits.',
        413,
      );
    }
    if (err instanceof UpstreamError) {
      return formatError(
        'UPSTREAM_ERROR',
        `GitHub or registry upstream error: ${err.message}`,
        502,
      );
    }

    const message = err instanceof Error ? err.message : 'An internal error occurred.';
    return formatError('INTERNAL', message, 500);
  }
}
