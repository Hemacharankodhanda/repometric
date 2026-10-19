'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

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

export function RepoInput({
  defaultValue = '',
  className = '',
}: {
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setValue(defaultValue);
    setLoading(false);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError('Please enter a valid owner/repo (e.g. facebook/react) or a GitHub repository URL.');
      return;
    }

    setError(null);
    setLoading(true);
    router.push(`/r/${parsed.owner}/${parsed.repo}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="owner/repo or github.com/owner/repo"
            error={!!error}
            aria-label="Repository URL or owner and name"
            className="h-11 px-4 text-sm font-mono"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading} size="lg" className="shrink-0 font-sans">
          <Search className="w-4 h-4 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze repository'}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-danger-text" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
