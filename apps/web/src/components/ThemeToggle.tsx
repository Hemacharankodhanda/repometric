'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('repometric-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      setTheme('system');
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const changeTheme = (next: Theme) => {
    setTheme(next);
    if (next === 'system') {
      localStorage.removeItem('repometric-theme');
      document.documentElement.removeAttribute('data-theme');
    } else {
      localStorage.setItem('repometric-theme', next);
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  if (!mounted) {
    return <div className="w-24 h-8 rounded-control bg-fog/20" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center p-0.5 rounded-control bg-surface border border-line text-ink-muted text-xs"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Light theme"
        onClick={() => changeTheme('light')}
        className={`p-1.5 rounded-control transition-colors ${
          theme === 'light' ? 'bg-paper text-ink font-medium shadow-xs' : 'hover:text-ink'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        aria-label="System theme"
        onClick={() => changeTheme('system')}
        className={`p-1.5 rounded-control transition-colors ${
          theme === 'system' ? 'bg-paper text-ink font-medium shadow-xs' : 'hover:text-ink'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Dark theme"
        onClick={() => changeTheme('dark')}
        className={`p-1.5 rounded-control transition-colors ${
          theme === 'dark' ? 'bg-paper text-ink font-medium shadow-xs' : 'hover:text-ink'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
