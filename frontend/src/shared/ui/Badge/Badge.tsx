import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

const variants = {
  brand: 'bg-brand-500/15 text-brand-500 border-brand-500/30',
  success: 'bg-market-green/15 text-market-green border-market-green/30',
  danger: 'bg-market-red/15 text-market-red border-market-red/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  gold: 'bg-gold-500/15 text-gold-500 border-gold-500/30',
  info: 'bg-info/15 text-info border-info/30',
  outline: 'bg-transparent text-ink-70 dark:text-white-70 border-ink-30/20 dark:border-white-30',
} as const;

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  pulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'brand', size = 'md', pulse, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium tracking-wide',
          variants[variant],
          sizes[size],
          pulse && 'animate-pulse-gold',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
