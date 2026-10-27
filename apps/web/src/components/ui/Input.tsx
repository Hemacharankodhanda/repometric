import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex min-h-[42px] w-full rounded-control border bg-card px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/50 transition-all font-mono',
          'border-slate-200 dark:border-slate-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none',
          error && 'border-coral text-coral-text focus:ring-coral/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
