'use client';

import React from 'react';
import { Tilly, type TillyMood } from './Tilly';
import { ChunkyButton } from './ChunkyButton';

export interface EmptyStateProps {
  mood?: TillyMood;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  mood = 'neutral',
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-card border-2 border-ink bg-card p-8 sm:p-12 text-center shadow-[4px_4px_0_var(--ink)] flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}
    >
      <Tilly mood={mood} size={84} />
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-lg sm:text-xl text-ink tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed max-w-sm">
          {description}
        </p>
      </div>

      {(actionText && (onAction || actionHref)) && (
        <div className="pt-2">
          {actionHref ? (
            <a href={actionHref}>
              <ChunkyButton variant="primary" size="md">
                {actionText}
              </ChunkyButton>
            </a>
          ) : (
            <ChunkyButton onClick={onAction} variant="primary" size="md">
              {actionText}
            </ChunkyButton>
          )}
        </div>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  mood?: TillyMood;
  title?: string;
  message: string;
  solution?: string;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  mood = 'worried',
  title = 'Something went wrong',
  message,
  solution = 'Check the repository spelling and make sure it is public on GitHub.',
  retryText = 'Try again',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-card border-2 border-ink bg-card p-8 sm:p-12 text-center shadow-[4px_4px_0_var(--ink)] flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}
      role="alert"
    >
      <Tilly mood={mood} size={88} />
      <div className="space-y-2">
        <h3 className="font-display font-bold text-lg sm:text-xl text-coral-text tracking-tight">
          {title}
        </h3>
        <p className="text-sm font-medium text-ink leading-relaxed">
          {message}
        </p>
        {solution && (
          <p className="text-xs text-ink-muted leading-relaxed">
            {solution}
          </p>
        )}
      </div>

      {onRetry && (
        <div className="pt-2">
          <ChunkyButton onClick={onRetry} variant="secondary" size="md">
            {retryText}
          </ChunkyButton>
        </div>
      )}
    </div>
  );
}
