'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is it free?',
    answer:
      'Yes, 100% free with no account or sign-up required. RepoMetric is built to run on standard free tiers with zero paid AI APIs.',
  },
  {
    question: 'Does it work on private repos?',
    answer:
      'Not yet in v1. RepoMetric currently analyzes public repositories only so you never have to grant sensitive write permissions.',
  },
  {
    question: 'How is the score calculated?',
    answer: (
      <span>
        The 0–100 score is calculated across six weighted engineering categories: Activity, Maintenance, Community, Documentation, Hygiene, and Dependencies. Every single point deduction includes clear evidence. Read all 23 checks on our{' '}
        <Link href="/methodology" className="font-bold text-primary-text underline">
          Methodology page
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'Which languages are supported?',
    answer:
      'The health score and interactive Repo Map work for any programming language. The dependency graph and architecture diagram support JavaScript, TypeScript, and Python.',
  },
  {
    question: 'Does it run my code?',
    answer:
      'Never. RepoMetric only reads public metadata, commits, documentation, and AST import statements. Analyzed code is never executed, compiled, or cloned.',
  },
  {
    question: 'How do I add the badge?',
    answer:
      'After analyzing your repository, click the "Share" menu on your report page and select "Copy badge snippet". Paste the Markdown into your GitHub README.md to display your live score grade.',
  },
];

export function FaqAccordion({ className = '' }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={`space-y-3 w-full max-w-3xl mx-auto ${className}`}>
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-card border-2 border-ink bg-card shadow-[3px_3px_0_var(--ink)] overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              id={`faq-question-${idx}`}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-display font-bold text-base sm:text-lg text-ink hover:bg-paper-2 transition-colors cursor-pointer"
            >
              <span className="pr-4">{item.question}</span>
              <div
                className={`p-1 rounded-control border-2 border-ink bg-paper-2 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-lime' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4 text-ink" />
              </div>
            </button>

            {isOpen && (
              <div
                id={`faq-answer-${idx}`}
                role="region"
                aria-labelledby={`faq-question-${idx}`}
                className="px-4 pb-5 sm:px-5 sm:pb-6 text-sm text-ink-muted leading-relaxed border-t-2 border-ink/20 pt-3"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
