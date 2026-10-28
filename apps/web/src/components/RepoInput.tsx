'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { ChunkyButton } from './ChunkyButton';

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match full URL: https://github.com/owner/repo(.git)?
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/.*)?$/,
  );
  if (urlMatch && urlMatch[1] && urlMatch[2]) {
    return { owner: urlMatch[1].toLowerCase(), repo: urlMatch[2].toLowerCase() };
  }

  // Match owner/repo
  const slashMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (slashMatch && slashMatch[1] && slashMatch[2]) {
    return { owner: slashMatch[1].toLowerCase(), repo: slashMatch[2].toLowerCase() };
  }

  return null;
}

export const EXAMPLE_REPOS = [
  { name: 'facebook/react', label: 'react' },
  { name: 'expressjs/express', label: 'express' },
  { name: 'pallets/flask', label: 'flask' },
  { name: 'vercel/next.js', label: 'next.js' },
];

export interface RepoInputProps {
  defaultValue?: string;
  showChips?: boolean;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  compact?: boolean;
}

export function RepoInput({
  defaultValue = '',
  showChips = true,
  className = '',
  autoFocus = false,
  id = 'repo-input-field',
  compact = false,
}: RepoInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const prevDefaultRef = React.useRef(defaultValue);
  React.useEffect(() => {
    if (prevDefaultRef.current !== defaultValue) {
      prevDefaultRef.current = defaultValue;
      setValue(defaultValue);
      setLoading(false);
    }
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError("That doesn't look like a GitHub repo. Try owner/repo or paste the URL.");
      return;
    }

    setError(null);
    setLoading(true);
    router.push(`/r/${parsed.owner}/${parsed.repo}`);
  };

  const handleChipClick = (repoSlug: string) => {
    setValue(repoSlug);
    setError(null);
    const parsed = parseRepoInput(repoSlug);
    if (parsed) {
      setLoading(true);
      router.push(`/r/${parsed.owner}/${parsed.repo}`);
    }
  };

  if (compact) {
    return (
      <div className={`w-full max-w-md relative ${className}`}>
        <form onSubmit={handleSubmit} className="w-full relative">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-card px-3 py-1 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-9">
            <Search className="w-3.5 h-3.5 text-ink-muted mr-2 shrink-0" aria-hidden="true" />
            <input
              id={id}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="owner/repo"
              aria-label="Repository URL or owner and name"
              autoFocus={autoFocus}
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none min-w-0"
            />
            <ChunkyButton
              type="submit"
              disabled={loading}
              size="sm"
              variant="primary"
              className="shrink-0 h-6 px-2 text-[11px] font-semibold ml-1.5 rounded-lg"
              aria-label="Analyze repository"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </ChunkyButton>
          </div>

          {error && (
            <div
              className="absolute left-0 top-full mt-2 z-50 rounded-lg border border-rose-200 dark:border-rose-900 bg-card px-3 py-1.5 text-xs text-coral-text font-medium shadow-md flex items-center space-x-1.5 whitespace-nowrap"
              role="alert"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-coral-text" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Large command bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-card p-1.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <div className="relative flex-1 flex items-center px-3.5 py-1.5">
            <Search className="w-5 h-5 text-ink-muted mr-3 shrink-0" aria-hidden="true" />
            <input
              id={id}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="github.com/owner/repo or owner/repo"
              aria-label="Repository URL or owner and name"
              autoFocus={autoFocus}
              className="w-full bg-transparent font-mono text-sm sm:text-base text-ink placeholder:text-ink-muted/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 px-1 sm:px-0">
            <ChunkyButton
              type="submit"
              disabled={loading}
              size="md"
              variant="primary"
              className="w-full sm:w-auto font-semibold rounded-xl text-sm"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Analyzing...' : 'Analyze repo'}
            </ChunkyButton>
          </div>
        </div>

        {/* Inline friendly validation message */}
        {error && (
          <div
            className="mt-2.5 flex items-center space-x-1.5 text-xs text-coral-text font-medium"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Helper text & Example chips */}
      {showChips && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="font-medium text-ink-muted">Try sample:</span>
          {EXAMPLE_REPOS.map((ex) => (
            <button
              key={ex.name}
              type="button"
              onClick={() => handleChipClick(ex.name)}
              className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-paper-2 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 text-ink font-mono text-xs transition-colors"
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
