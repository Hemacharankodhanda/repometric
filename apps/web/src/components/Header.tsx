'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { ChunkyButton } from './ChunkyButton';
import { Menu, X, Activity } from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export interface HeaderProps {
  children?: React.ReactNode;
  showCta?: boolean;
  statusText?: string;
}

export function Header({ children, showCta, statusText }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';
  const shouldShowCta = showCta !== undefined ? showCta : isHome;

  const handleCtaClick = () => {
    if (isHome) {
      const el = document.getElementById('repo-input-field');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    router.push('/#repo-input-field');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-paper/85 dark:bg-paper/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark with modern radar icon */}
        <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-ink">
            repometric
          </span>
        </Link>

        {/* Center slot: search bar in report page OR status text in analyzing screen */}
        {children ? (
          <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden sm:block">{children}</div>
        ) : statusText ? (
          <div className="flex-1 hidden sm:flex items-center justify-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>{statusText}</span>
            </div>
          </div>
        ) : null}

        {/* Right side navigation & tools */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          {!children && (
            <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-ink-muted">
              {isHome ? (
                <>
                  <a href="#how-it-works" className="hover:text-ink transition-colors">
                    How it works
                  </a>
                  <a href="#what-you-get" className="hover:text-ink transition-colors">
                    What you get
                  </a>
                  <a href="#faq" className="hover:text-ink transition-colors">
                    FAQ
                  </a>
                </>
              ) : null}
              <Link href="/methodology" className="hover:text-ink transition-colors">
                Methodology
              </Link>
              <a
                href="https://github.com/Hemacharankodhanda/repometric"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors flex items-center space-x-1.5"
                title="View on GitHub"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </nav>
          )}

          {children && (
            <div className="hidden lg:flex items-center space-x-4 text-xs font-medium text-ink-muted">
              <Link href="/methodology" className="hover:text-ink transition-colors">
                Methodology
              </Link>
              <a
                href="https://github.com/Hemacharankodhanda/repometric"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors flex items-center space-x-1.5"
                title="View on GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          )}

          {/* Right Tools: ThemeToggle and optional CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <ThemeToggle />
            {shouldShowCta && (
              <ChunkyButton
                variant="primary"
                size="sm"
                onClick={handleCtaClick}
                className="hidden sm:inline-flex"
              >
                Analyze a repo
              </ChunkyButton>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-control border border-slate-200 dark:border-slate-800 bg-card text-ink md:hidden shadow-sm"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-card p-4 space-y-3 font-medium text-sm shadow-lg overflow-hidden"
          >
            {children && (
              <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                  Analyze another repo
                </span>
                {children}
              </div>
            )}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded hover:bg-paper-2 text-ink"
            >
              Home
            </Link>
            {isHome ? (
              <>
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
              </>
            ) : (
              <>
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 rounded hover:bg-paper-2 text-ink"
                >
                  How it works
                </Link>
                <Link
                  href="/#what-you-get"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 rounded hover:bg-paper-2 text-ink"
                >
                  What you get
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 rounded hover:bg-paper-2 text-ink"
                >
                  FAQ
                </Link>
              </>
            )}
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
            {shouldShowCta && (
              <div className="pt-2">
                <ChunkyButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCtaClick();
                  }}
                  className="w-full"
                >
                  Analyze a repo
                </ChunkyButton>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
