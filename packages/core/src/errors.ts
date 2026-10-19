/**
 * Typed domain errors thrown by @repometric/core.
 * These are caught and mapped to HTTP status codes by API route handlers.
 */

export class RepoNotFoundError extends Error {
  readonly code = 'NOT_FOUND' as const;
  constructor(owner: string, name: string) {
    super(`Repository not found: ${owner}/${name}`);
    this.name = 'RepoNotFoundError';
  }
}

export class PrivateRepoError extends Error {
  readonly code = 'PRIVATE_REPO' as const;
  constructor(owner: string, name: string) {
    super(`Repository is private or requires authentication: ${owner}/${name}`);
    this.name = 'PrivateRepoError';
  }
}

export class RateLimitError extends Error {
  readonly code = 'RATE_LIMITED' as const;
  readonly resetAt: Date;

  constructor(resetAt: Date, message?: string) {
    const minutes = Math.max(1, Math.round((resetAt.getTime() - Date.now()) / 60000));
    super(
      message ||
        `GitHub rate limit reached. Resets in approximately ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    );
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
}

export class TooLargeError extends Error {
  readonly code = 'TOO_LARGE' as const;
  constructor(message: string) {
    super(message);
    this.name = 'TooLargeError';
  }
}

export class UpstreamError extends Error {
  readonly code = 'UPSTREAM_ERROR' as const;
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
  }
}
