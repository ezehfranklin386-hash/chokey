import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

const variants = {
  default:
    'bg-white dark:bg-primary-800 border border-ink-30/15 dark:border-white/10',
  premium:
    'bg-white dark:bg-gradient-to-br dark:from-primary-800 dark:to-primary-700 border border-brand-500/20 dark:border-brand-500/20',
  stat: 'bg-surface-secondary dark:bg-primary-800/60',
  interactive:
    'bg-white dark:bg-primary-800 border border-ink-30/15 dark:border-white/10 hover:border-brand-500/30 hover:shadow-sm dark:hover:shadow-none cursor-pointer transition-all duration-200',
} as const;

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
} as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variants[variant],
          paddings[padding],
          hoverable && 'cursor-pointer hover:border-brand-500/30',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
