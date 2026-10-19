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
          'flex min-h-[44px] w-full rounded-control border-2 bg-card px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/60 transition-all font-mono',
          'border-ink shadow-[2px_2px_0_var(--ink)] focus:shadow-[4px_4px_0_var(--ink)] focus:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2',
          error && 'border-coral text-coral-text focus-visible:ring-coral',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
