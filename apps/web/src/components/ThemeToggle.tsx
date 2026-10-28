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
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-paper-2 p-0.5 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => changeTheme('light')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light' ? 'bg-card text-amber-500 shadow-sm' : 'text-ink-muted hover:text-ink'
        }`}
        title="Light mode"
        aria-label="Light mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme('dark')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-card text-indigo-500 dark:text-indigo-400 shadow-sm'
            : 'text-ink-muted hover:text-ink'
        }`}
        title="Dark mode"
        aria-label="Dark mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme('system')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'system' ? 'bg-card text-primary shadow-sm' : 'text-ink-muted hover:text-ink'
        }`}
        title="System preference"
        aria-label="System preference"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
