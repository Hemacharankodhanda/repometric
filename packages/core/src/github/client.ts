import type { FileNode, ManifestInfo, RepoDataSource, RepoMeta, RepoSnapshot } from '../types';
import {
  PrivateRepoError,
  RateLimitError,
  RepoNotFoundError,
  TooLargeError,
  UpstreamError,
} from '../errors';
import { getLanguageForPath, isTestPath, isVendorPath } from './languages';

export interface GitHubClientOptions {
  token?: string;
  fetch?: typeof fetch;
  apiBase?: string;
  rawBase?: string;
  etagCache?: Map<string, { etag: string; data: unknown }>;
}

export interface NormalizedRepo {
  owner: string;
  name: string;
}

/**
 * Normalizes input strings like "owner/repo", "https://github.com/owner/repo.git", etc.
 */
export function normalizeRepoTarget(input: string): NormalizedRepo {
  let cleaned = input.trim();
  // Strip protocol and domain if present
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  // Strip trailing slashes first
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');
  // Strip any trailing tree/branch path like /tree/main
  cleaned = cleaned.replace(/\/tree\/[^/]+(\/.*)?$/i, '');
  // Strip trailing .git
  cleaned = cleaned.replace(/\.git$/i, '');
  // Strip trailing slashes again
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');

  const parts = cleaned.split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid GitHub repository format: "${input}". Expected "owner/repo".`);
  }

  return {
    owner: parts[0].toLowerCase(),
    name: parts[1].toLowerCase(),
  };
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated?: boolean;
}

interface GitHubRepoResponse {
  name: string;
  owner: { login: string };
  default_branch: string;
  description: string | null;
  topics?: string[];
  homepage: string | null;
  license: { spdx_id?: string; name?: string } | null;
  stargazers_count: number;
  has_wiki: boolean;
  archived: boolean;
  private: boolean;
}

interface GitHubCommitResponse {
  sha: string;
  commit: {
    author: {
      date: string;
      name?: string;
    } | null;
    committer: {
      date: string;
    } | null;
    message: string;
  };
  author: {
    login: string;
  } | null;
}

interface GitHubIssueResponse {
  number: number;
  title: string;
  user: { login: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  state: 'open' | 'closed';
  comments: number;
  pull_request?: Record<string, unknown>;
}

interface GitHubReleaseResponse {
  published_at: string | null;
  created_at: string;
  tag_name: string;
}

function parsePackageJson(content: string | null): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  if (!content) return { dependencies: {}, devDependencies: {} };
  try {
    const parsed = JSON.parse(content);
    return {
      dependencies:
        typeof parsed.dependencies === 'object' && parsed.dependencies !== null
          ? parsed.dependencies
          : {},
      devDependencies:
        typeof parsed.devDependencies === 'object' && parsed.devDependencies !== null
          ? parsed.devDependencies
          : {},
    };
  } catch {
    return { dependencies: {}, devDependencies: {} };
  }
}

function parseRequirementsTxt(content: string | null): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  if (!content) return { dependencies: {}, devDependencies: {} };
  const dependencies: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(.*)$/);
    if (match) {
      dependencies[match[1]] = match[2]?.trim() || '*';
    }
  }
  return { dependencies, devDependencies: {} };
}

export class GitHubClient {
  private readonly options: GitHubClientOptions;
  private readonly token?: string;
  private readonly apiBase: string;
  private readonly rawBase: string;
  private readonly etagCache: Map<string, { etag: string; data: unknown }>;

  constructor(options: GitHubClientOptions = {}) {
    this.options = options;
    this.token = options.token;
    this.apiBase = (options.apiBase || 'https://api.github.com').replace(/\/+$/, '');
    this.rawBase = (options.rawBase || 'https://raw.githubusercontent.com').replace(/\/+$/, '');
    this.etagCache = options.etagCache || new Map();
  }

  private get fetchFn(): typeof fetch {
    return this.options.fetch || globalThis.fetch;
  }

  /**
   * Helper to execute a GitHub API request with ETag caching, rate-limit and error checking.
   */
  private async request<T>(path: string, headers: Record<string, string> = {}): Promise<T> {
    const url = `${this.apiBase}${path}`;
    const reqHeaders: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      ...headers,
    };

    if (this.token) {
      reqHeaders.Authorization = `Bearer ${this.token}`;
    }

    const cached = this.etagCache.get(url);
    if (cached) {
      reqHeaders['If-None-Match'] = cached.etag;
    }

    const response = await this.fetchFn(url, { headers: reqHeaders });

    if (response.status === 304 && cached) {
      return cached.data as T;
    }

    // Rate limit handling
    const remaining = response.headers.get('x-ratelimit-remaining');
    const resetHeader = response.headers.get('x-ratelimit-reset');

    if (
      response.status === 429 ||
      (response.status === 403 && remaining === '0')
    ) {
      const resetSeconds = resetHeader ? parseInt(resetHeader, 10) : Math.floor(Date.now() / 1000) + 3600;
      throw new RateLimitError(new Date(resetSeconds * 1000));
    }

    if (response.status === 404) {
      const parts = path.split('/');
      const owner = parts[2] || '';
      const name = parts[3] || '';
      throw new RepoNotFoundError(owner, name);
    }

    if (response.status === 403) {
      const parts = path.split('/');
      const owner = parts[2] || '';
      const name = parts[3] || '';
      throw new PrivateRepoError(owner, name);
    }

    if (!response.ok) {
      throw new UpstreamError(`GitHub API error ${response.status}: ${response.statusText}`, response.status);
    }

    const etag = response.headers.get('etag');
    const data = (await response.json()) as T;

    if (etag) {
      this.etagCache.set(url, { etag, data });
    }

    return data;
  }

  /**
   * Fetch a raw file from raw.githubusercontent.com (does not consume API rate limit quota).
   */
  async getFile(owner: string, name: string, sha: string, path: string): Promise<string | null> {
    const rawUrl = `${this.rawBase}/${owner}/${name}/${sha}/${path}`;
    try {
      const response = await this.fetchFn(rawUrl);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new UpstreamError(`Failed to fetch file from raw: ${response.statusText}`, response.status);
      }
      return await response.text();
    } catch (err) {
      if (err instanceof UpstreamError) throw err;
      return null;
    }
  }

  /**
   * Builds a full RepoSnapshot from GitHub for scoring.
   */
  async getSnapshot(
    owner: string,
    name: string,
    options: { now?: string } = {},
  ): Promise<RepoSnapshot & { truncatedTree?: boolean }> {
    const now = options.now || new Date().toISOString();

    // 1. Fetch Repository Metadata
    const repoData = await this.request<GitHubRepoResponse>(`/repos/${owner}/${name}`);
    if (repoData.private) {
      throw new PrivateRepoError(owner, name);
    }

    const meta: RepoMeta = {
      owner: repoData.owner.login.toLowerCase(),
      name: repoData.name.toLowerCase(),
      defaultBranch: repoData.default_branch,
      description: repoData.description,
      topics: repoData.topics || [],
      homepage: repoData.homepage || null,
      license: repoData.license?.spdx_id || repoData.license?.name || null,
      stars: repoData.stargazers_count,
      hasWiki: repoData.has_wiki,
      archived: repoData.archived,
    };

    // 2. Fetch latest commit SHA on default branch
    const branchData = await this.request<{ commit: { sha: string } }>(
      `/repos/${owner}/${name}/branches/${encodeURIComponent(meta.defaultBranch)}`,
    );
    const commitSha = branchData.commit.sha;

    // 3. Fetch recursive Git Tree
    const treeData = await this.request<GitHubTreeResponse>(
      `/repos/${owner}/${name}/git/trees/${commitSha}?recursive=1`,
    );

    const isTreeTruncated = Boolean(treeData.truncated);
    if (treeData.tree.length > 50000) {
      throw new TooLargeError(`Repository tree exceeds maximum limit of 50,000 files.`);
    }

    const hasNpmLock = treeData.tree.some(
      (f) =>
        /^(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb)$/i.test(f.path) ||
        f.path.endsWith('/package-lock.json') ||
        f.path.endsWith('/pnpm-lock.yaml') ||
        f.path.endsWith('/yarn.lock'),
    );

    const hasPyLock = treeData.tree.some(
      (f) =>
        /^(poetry\.lock|Pipfile\.lock|pdm\.lock|requirements\.lock)$/i.test(f.path) ||
        f.path.endsWith('/poetry.lock') ||
        f.path.endsWith('/Pipfile.lock'),
    );

    const tree: FileNode[] = [];
    const manifestPaths: { ecosystem: 'npm' | 'pypi'; path: string }[] = [];
    const candidateSourceFiles: string[] = [];

    for (const item of treeData.tree) {
      if (item.type !== 'blob') continue;
      const path = item.path;
      const size = item.size ?? 0;
      const language = getLanguageForPath(path);
      const isTest = isTestPath(path);

      tree.push({ path, size, language, isTest });

      // Identify manifests
      if (path === 'package.json' || path.endsWith('/package.json')) {
        manifestPaths.push({ ecosystem: 'npm', path });
      } else if (
        path === 'requirements.txt' ||
        path.endsWith('/requirements.txt') ||
        path === 'pyproject.toml' ||
        path.endsWith('/pyproject.toml')
      ) {
        manifestPaths.push({ ecosystem: 'pypi', path });
      }

      // Collect candidate source files for comment density sampling
      if (
        language &&
        !isTest &&
        !isVendorPath(path) &&
        size > 50 &&
        size < 100000 &&
        ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#'].includes(language)
      ) {
        candidateSourceFiles.push(path);
      }
    }

    // 4. Fetch README (if present in root)
    let readme: string | null = null;
    const readmeNode = tree.find((f) => /^readme(\.[a-z0-9]+)?$/i.test(f.path));
    if (readmeNode) {
      readme = await this.getFile(meta.owner, meta.name, commitSha, readmeNode.path);
    }

    // Parse manifests
    const manifests: ManifestInfo[] = [];
    for (const m of manifestPaths) {
      const content = await this.getFile(meta.owner, meta.name, commitSha, m.path);
      if (m.ecosystem === 'npm') {
        const parsed = parsePackageJson(content);
        manifests.push({
          ecosystem: 'npm',
          path: m.path,
          dependencies: parsed.dependencies,
          devDependencies: parsed.devDependencies,
          hasLockfile: hasNpmLock,
        });
      } else {
        const parsed = parseRequirementsTxt(content);
        manifests.push({
          ecosystem: 'pypi',
          path: m.path,
          dependencies: parsed.dependencies,
          devDependencies: parsed.devDependencies,
          hasLockfile: hasPyLock,
        });
      }
    }

    // 5. Fetch Commits (last 365 days, up to 500)
    const oneYearAgo = new Date(new Date(now).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const commitsData = await this.request<GitHubCommitResponse[]>(
      `/repos/${owner}/${name}/commits?since=${encodeURIComponent(oneYearAgo)}&per_page=100`,
    );

    const commits = commitsData.map((c) => ({
      date: c.commit.author?.date || c.commit.committer?.date || now,
      authorLogin: c.author?.login || null,
    }));

    // 6. Fetch Issues and PRs (last 180 days)
    const sixMonthsAgo = new Date(new Date(now).getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const issuesData = await this.request<GitHubIssueResponse[]>(
      `/repos/${owner}/${name}/issues?state=all&since=${encodeURIComponent(sixMonthsAgo)}&per_page=100`,
    );

    const issues: RepoSnapshot['issues'] = [];
    const pulls: RepoSnapshot['pulls'] = [];

    for (const item of issuesData) {
      if (item.pull_request) {
        pulls.push({
          number: item.number,
          author: item.user?.login || null,
          createdAt: item.created_at,
          closedAt: item.closed_at,
          merged: item.state === 'closed', // default conservative heuristic
          firstResponseAt: item.comments > 0 ? item.updated_at : null,
        });
      } else {
        issues.push({
          number: item.number,
          author: item.user?.login || null,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          state: item.state,
          firstResponseAt: item.comments > 0 ? item.updated_at : null,
        });
      }
    }

    // 7. Fetch Releases & Tags
    const releasesData = await this.request<GitHubReleaseResponse[]>(
      `/repos/${owner}/${name}/releases?per_page=100`,
    );
    const releases = releasesData
      .map((r) => ({ publishedAt: r.published_at || r.created_at }))
      .filter((r) => new Date(r.publishedAt).getTime() >= new Date(oneYearAgo).getTime());

    // 8. Sample up to 40 source files for comment density calculation
    const sampledFiles = candidateSourceFiles.slice(0, 40);
    const sampledSources: { path: string; content: string }[] = [];
    for (const filePath of sampledFiles) {
      const content = await this.getFile(meta.owner, meta.name, commitSha, filePath);
      if (content !== null) {
        sampledSources.push({ path: filePath, content });
      }
    }

    return {
      meta,
      commitSha,
      now,
      tree,
      readme,
      commits,
      issues,
      pulls,
      releases,
      sampledSources,
      manifests,
      registry: {},
      truncatedTree: isTreeTruncated,
    };
  }

  asDataSource(owner: string, name: string, sha?: string): RepoDataSource {
    return new GitHubRepoDataSource(this, owner, name, sha);
  }
}

export class GitHubRepoDataSource implements RepoDataSource {
  constructor(
    private readonly client: GitHubClient,
    private readonly owner: string,
    private readonly name: string,
    private readonly sha?: string,
  ) {}

  async getSnapshot(): Promise<RepoSnapshot> {
    return this.client.getSnapshot(this.owner, this.name);
  }

  async getFile(path: string): Promise<string | null> {
    const sha = this.sha || 'HEAD';
    return this.client.getFile(this.owner, this.name, sha, path);
  }
}
