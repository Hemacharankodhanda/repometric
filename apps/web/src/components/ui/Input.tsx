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
          'flex h-10 w-full rounded-control border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 transition-colors',
          'border-line focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
          error && 'border-danger focus-visible:outline-danger',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
