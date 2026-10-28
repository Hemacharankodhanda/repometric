import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold tracking-tight select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:scale-100 rounded-control cursor-pointer';

    const variantStyles = {
      default:
        'bg-primary text-on-primary border border-primary/20 shadow-sm hover:shadow-md hover:shadow-primary/20 hover:brightness-105 active:scale-[0.98]',
      secondary:
        'bg-card text-ink border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-paper-2 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98]',
      outline:
        'bg-transparent text-ink border border-slate-200 dark:border-slate-800 hover:bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98]',
      ghost: 'bg-transparent text-ink hover:bg-ink/5 dark:hover:bg-white/10 active:scale-[0.98]',
      danger:
        'bg-coral text-white border border-coral/30 shadow-sm hover:brightness-105 active:scale-[0.98]',
    };

    const sizeStyles = {
      sm: 'min-h-[34px] px-3 py-1 text-xs',
      default: 'min-h-[40px] px-4 py-2 text-sm',
      lg: 'min-h-[48px] px-6 py-3 text-base',
      icon: 'min-h-[36px] w-9 h-9 p-2',
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
