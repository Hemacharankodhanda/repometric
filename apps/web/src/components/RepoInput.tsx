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
  { name: 'facebook/react', label: 'react', bg: 'bg-sky/25 hover:bg-sky' },
  { name: 'expressjs/express', label: 'express', bg: 'bg-lime/30 hover:bg-lime' },
  { name: 'pallets/flask', label: 'flask', bg: 'bg-sun/30 hover:bg-sun' },
  { name: 'vercel/next.js', label: 'next.js', bg: 'bg-coral/25 hover:bg-coral' },
];

export interface RepoInputProps {
  defaultValue?: string;
  showChips?: boolean;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}

export function RepoInput({
  defaultValue = '',
  showChips = true,
  className = '',
  autoFocus = false,
  id = 'repo-input-field',
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

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Large field with attached button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-card border-2 border-ink bg-card p-1.5 shadow-[4px_4px_0_var(--ink)] focus-within:shadow-[6px_6px_0_var(--ink)] focus-within:-translate-y-0.5 transition-all">
          <div className="relative flex-1 flex items-center px-3 py-1">
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
              className="w-full bg-transparent font-mono text-sm sm:text-base text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <ChunkyButton
            type="submit"
            disabled={loading}
            size="md"
            variant="primary"
            className="sm:w-auto mt-2 sm:mt-0 font-bold tracking-normal"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Analyzing...' : 'Analyze repo'}
          </ChunkyButton>
        </div>

        {/* Inline friendly validation message */}
        {error && (
          <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-coral-text font-medium" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Helper text & Example chips */}
      {showChips && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink">Try one:</span>
          {EXAMPLE_REPOS.map((ex) => (
            <button
              key={ex.name}
              type="button"
              onClick={() => handleChipClick(ex.name)}
              className={`inline-flex items-center px-2.5 py-1 rounded-pill border-2 border-ink ${ex.bg} text-ink font-mono text-xs font-bold shadow-[2px_2px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
