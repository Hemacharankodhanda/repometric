'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

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
        The 0–100 score is calculated across six weighted engineering categories: Activity,
        Maintenance, Community, Documentation, Hygiene, and Dependencies. Every single point
        deduction includes clear evidence. Read all 23 checks on our{' '}
        <Link href="/methodology" className="font-semibold text-primary underline">
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
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-card overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              id={`faq-question-${idx}`}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-display font-semibold text-base sm:text-lg text-ink hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="pr-4">{item.question}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={`w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center shrink-0 text-ink-muted ${
                  isOpen ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500/30' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-sm text-ink-muted leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
