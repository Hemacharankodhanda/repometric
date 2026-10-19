import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-control text-sm cursor-pointer select-none';

    const variantStyles = {
      default: 'bg-teal text-paper hover:bg-teal/90 active:bg-teal/95',
      secondary: 'bg-surface text-ink hover:bg-fog/30 border border-line',
      outline: 'bg-transparent text-ink border border-line hover:bg-surface',
      ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface',
      danger: 'bg-danger text-paper hover:bg-danger/90 active:bg-danger/95',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-9 px-4 py-2 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
