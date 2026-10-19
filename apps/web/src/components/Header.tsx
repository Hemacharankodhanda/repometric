import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Wordmark: lowercase repometric */}
        <div className="flex items-center space-x-6 shrink-0">
          <Link
            href="/"
            className="text-lg font-heading font-bold tracking-tight text-ink hover:text-teal transition-colors"
          >
            repometric
          </Link>
        </div>

        {/* Center / Search bar if passed */}
        {children && <div className="flex-1 max-w-xl mx-auto">{children}</div>}

        {/* Right Tools */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/methodology"
            className="text-xs text-ink-muted hover:text-ink hidden sm:inline-block font-medium"
          >
            Methodology
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
