import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight select-none transition-all duration-[120ms] ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 rounded-control cursor-pointer';

    const variantStyles = {
      default:
        'bg-primary text-on-primary border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[5px_5px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
      secondary:
        'bg-card text-ink border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[5px_5px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
      outline:
        'bg-transparent text-ink border-2 border-ink hover:bg-card shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-0.5',
      ghost:
        'bg-transparent text-ink border-2 border-transparent hover:border-ink hover:bg-card/50 active:translate-y-0.5',
      danger:
        'bg-coral text-ink border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[5px_5px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    };

    const sizeStyles = {
      sm: 'min-h-[36px] px-3 py-1 text-xs',
      default: 'min-h-[44px] px-4 py-2 text-sm',
      lg: 'min-h-[50px] px-6 py-3 text-base',
      icon: 'min-h-[40px] w-10 h-10 p-2',
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
