'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tilly } from './Tilly';
import { ThemeToggle } from './ThemeToggle';
import { ChunkyButton } from './ChunkyButton';
import { Menu, X } from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function Header({ children }: { children?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToInput = () => {
    const el = document.getElementById('repo-input-field');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-card/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Wordmark with small Tilly */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <Tilly mood="idle" size={32} className="transition-transform group-hover:scale-110" />
          <span className="font-display font-extrabold text-xl tracking-tight text-ink">
            repometric
          </span>
        </Link>

        {/* Center slot (e.g. search bar in report page) */}
        {children && <div className="flex-1 max-w-xl mx-auto hidden md:block">{children}</div>}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-ink">
          <a href="#how-it-works" className="text-ink-muted hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#what-you-get" className="text-ink-muted hover:text-ink transition-colors">
            What you get
          </a>
          <a href="#faq" className="text-ink-muted hover:text-ink transition-colors">
            FAQ
          </a>
          <Link href="/methodology" className="text-ink-muted hover:text-ink transition-colors">
            Methodology
          </Link>
          <a
            href="https://github.com/Hemacharankodhanda/repometric"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted hover:text-ink transition-colors flex items-center space-x-1"
            title="View on GitHub"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center space-x-3 shrink-0">
          <ThemeToggle />
          <ChunkyButton
            variant="primary"
            size="sm"
            onClick={scrollToInput}
            className="hidden sm:inline-flex"
          >
            Analyze a repo
          </ChunkyButton>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-control border-2 border-ink bg-paper-2 text-ink md:hidden shadow-[2px_2px_0_var(--ink)]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-card p-4 space-y-3 font-bold text-sm shadow-[4px_4px_0_var(--ink)]">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 rounded hover:bg-paper-2 text-ink"
          >
            How it works
          </a>
          <a
            href="#what-you-get"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 rounded hover:bg-paper-2 text-ink"
          >
            What you get
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 rounded hover:bg-paper-2 text-ink"
          >
            FAQ
          </a>
          <Link
            href="/methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 rounded hover:bg-paper-2 text-ink"
          >
            Methodology
          </Link>
          <Link
            href="/kit"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 rounded hover:bg-paper-2 text-ink"
          >
            Component Kit
          </Link>
          <a
            href="https://github.com/Hemacharankodhanda/repometric"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 rounded hover:bg-paper-2 text-ink"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub repository</span>
          </a>
          <div className="pt-2">
            <ChunkyButton
              variant="primary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToInput();
              }}
              className="w-full"
            >
              Analyze a repo
            </ChunkyButton>
          </div>
        </div>
      )}
    </header>
  );
}
