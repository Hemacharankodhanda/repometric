'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('repometric-theme') as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setTheme(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem('repometric-theme', nextTheme);
      if (nextTheme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className={`inline-flex items-center rounded-control border-2 border-ink bg-card p-0.5 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => changeTheme('light')}
        className={`p-1.5 rounded-[8px] transition-colors ${
          theme === 'light'
            ? 'bg-sun text-ink font-bold shadow-[1px_1px_0_var(--ink)]'
            : 'text-ink-muted hover:text-ink'
        }`}
        title="Light mode"
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme('dark')}
        className={`p-1.5 rounded-[8px] transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-on-primary font-bold shadow-[1px_1px_0_var(--ink)]'
            : 'text-ink-muted hover:text-ink'
        }`}
        title="Dark mode"
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme('system')}
        className={`p-1.5 rounded-[8px] transition-colors ${
          theme === 'system'
            ? 'bg-lime text-ink font-bold shadow-[1px_1px_0_var(--ink)]'
            : 'text-ink-muted hover:text-ink'
        }`}
        title="System preference"
        aria-label="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
