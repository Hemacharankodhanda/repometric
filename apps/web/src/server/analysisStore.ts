import 'server-only';

import type { AnalysisReport, FileNode, GraphData } from '@repometric/core';
import type { Json } from '../types/database.types';
import { getServiceClient, normalizeRepo } from './db';

export interface StoredAnalysis {
  id: string;
  repo: {
    owner: string;
    name: string;
    defaultBranch: string | null;
  };
  commitSha: string;
  report: AnalysisReport;
  files: FileNode[];
  graphStatus: 'ready' | 'missing' | 'unsupported';
  graphData?: GraphData;
  createdAt: string;
}

// In-memory fallback cache when Supabase is not configured
declare global {
  var __repometric_cache: Map<string, StoredAnalysis> | undefined;
  var __repometric_rate_limits: Map<string, { count: number; resetAt: number }> | undefined;
}

const inMemoryCache = (globalThis.__repometric_cache ??= new Map<string, StoredAnalysis>());
const inMemoryRateLimits = (globalThis.__repometric_rate_limits ??= new Map<string, { count: number; resetAt: number }>());

function getCacheKey(owner: string, name: string, sha: string): string {
  return `${owner.toLowerCase()}/${name.toLowerCase()}@${sha}`;
}

/**
 * Checks rate limiting for an IP address (20 requests per hour).
 * Returns { allowed: boolean, remaining: number, resetSeconds: number }
 */
export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}> {
  const maxRequests = 20;
  const windowMs = 3600 * 1000;
  const now = Date.now();

  const record = inMemoryRateLimits.get(ip);
  if (!record || record.resetAt <= now) {
    inMemoryRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: 3600 };
  }

  if (record.count >= maxRequests) {
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetSeconds };
  }

  record.count++;
  const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
  return { allowed: true, remaining: maxRequests - record.count, resetSeconds };
}

/**
 * Retrieves a stored analysis by (owner, name, sha).
 */
export async function getStoredAnalysis(
  owner: string,
  name: string,
  sha: string,
): Promise<StoredAnalysis | null> {
  const norm = normalizeRepo(owner, name);
  const cacheKey = getCacheKey(norm.owner, norm.name, sha);

  // Check in-memory cache first
  const cached = inMemoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Check Supabase if configured
  try {
    const supabase = getServiceClient();
    const { data: repoData } = await supabase
      .from('repos')
      .select('id, default_branch')
      .eq('owner', norm.owner)
      .eq('name', norm.name)
      .maybeSingle();

    if (!repoData) return null;

    const { data: analysisData } = await supabase
      .from('analyses')
      .select('*')
      .eq('repo_id', repoData.id)
      .eq('commit_sha', sha)
      .maybeSingle();

    if (!analysisData) return null;

    const report: AnalysisReport = {
      repo: {
        owner: norm.owner,
        name: norm.name,
        defaultBranch: repoData.default_branch || 'main',
        description: null,
        topics: [],
        homepage: null,
        license: null,
        stars: 0,
        hasWiki: false,
        archived: false,
      },
      commitSha: analysisData.commit_sha,
      score: analysisData.score,
      grade: analysisData.grade as AnalysisReport['grade'],
      categories: analysisData.category_scores as unknown as AnalysisReport['categories'],
      fixes: analysisData.fixes as unknown as AnalysisReport['fixes'],
      projectedScore: analysisData.projected_score,
      analyzedAt: analysisData.created_at,
      coreVersion: analysisData.core_version,
    };

    const stored: StoredAnalysis = {
      id: analysisData.id,
      repo: {
        owner: norm.owner,
        name: norm.name,
        defaultBranch: repoData.default_branch,
      },
      commitSha: analysisData.commit_sha,
      report,
      files: [],
      graphStatus: 'missing',
      createdAt: analysisData.created_at,
    };

    inMemoryCache.set(cacheKey, stored);
    return stored;
  } catch {
    // Supabase not configured or unreachable; fallback to in-memory
    return null;
  }
}

/**
 * Retrieves the latest stored analysis for a repo (used by GET /api/report/[owner]/[repo]).
 */
export async function getLatestStoredAnalysis(
  owner: string,
  name: string,
): Promise<StoredAnalysis | null> {
  const norm = normalizeRepo(owner, name);

  // Check in-memory cache
  for (const item of inMemoryCache.values()) {
    if (
      item.repo.owner.toLowerCase() === norm.owner &&
      item.repo.name.toLowerCase() === norm.name
    ) {
      return item;
    }
  }

  // Check Supabase if configured
  try {
    const supabase = getServiceClient();
    const { data: repoData } = await supabase
      .from('repos')
      .select('id, default_branch')
      .eq('owner', norm.owner)
      .eq('name', norm.name)
      .maybeSingle();

    if (!repoData) return null;

    const { data: analysisData } = await supabase
      .from('analyses')
      .select('*')
      .eq('repo_id', repoData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysisData) return null;

    const report: AnalysisReport = {
      repo: {
        owner: norm.owner,
        name: norm.name,
        defaultBranch: repoData.default_branch || 'main',
        description: null,
        topics: [],
        homepage: null,
        license: null,
        stars: 0,
        hasWiki: false,
        archived: false,
      },
      commitSha: analysisData.commit_sha,
      score: analysisData.score,
      grade: analysisData.grade as AnalysisReport['grade'],
      categories: analysisData.category_scores as unknown as AnalysisReport['categories'],
      fixes: analysisData.fixes as unknown as AnalysisReport['fixes'],
      projectedScore: analysisData.projected_score,
      analyzedAt: analysisData.created_at,
      coreVersion: analysisData.core_version,
    };

    return {
      id: analysisData.id,
      repo: {
        owner: norm.owner,
        name: norm.name,
        defaultBranch: repoData.default_branch,
      },
      commitSha: analysisData.commit_sha,
      report,
      files: [],
      graphStatus: 'missing',
      createdAt: analysisData.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Saves an analysis to Supabase (if available) and in-memory cache.
 */
export async function saveAnalysis(
  owner: string,
  name: string,
  defaultBranch: string,
  commitSha: string,
  report: AnalysisReport,
  files: FileNode[],
  graphStatus: 'ready' | 'missing' | 'unsupported',
  graphData?: GraphData,
): Promise<StoredAnalysis> {
  const norm = normalizeRepo(owner, name);
  const now = new Date().toISOString();
  const id = `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const stored: StoredAnalysis = {
    id,
    repo: {
      owner: norm.owner,
      name: norm.name,
      defaultBranch,
    },
    commitSha,
    report,
    files,
    graphStatus,
    graphData,
    createdAt: now,
  };

  // Cache in-memory
  const cacheKey = getCacheKey(norm.owner, norm.name, commitSha);
  inMemoryCache.set(cacheKey, stored);

  // Persist to Supabase if credentials are set
  try {
    const supabase = getServiceClient();

    // 1. Upsert repo
    const { data: repoRow } = await supabase
      .from('repos')
      .upsert(
        {
          owner: norm.owner,
          name: norm.name,
          default_branch: defaultBranch,
          last_analyzed_at: now,
        },
        { onConflict: 'owner,name' },
      )
      .select('id')
      .single();

    if (repoRow) {
      // 2. Insert analysis
      await supabase.from('analyses').upsert(
        {
          repo_id: repoRow.id,
          commit_sha: commitSha,
          score: report.score,
          grade: report.grade,
          category_scores: report.categories as unknown as Json,
          fixes: report.fixes as unknown as Json,
          projected_score: report.projectedScore,
          core_version: report.coreVersion,
        },
        { onConflict: 'repo_id,commit_sha' },
      );
    }
  } catch {
    // Supabase not available, in-memory cache is active
  }

  return stored;
}
