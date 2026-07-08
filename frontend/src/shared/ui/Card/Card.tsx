import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

const variants = {
  default:
    'bg-primary-800 border border-white-30/10 hover:border-gold-500/20',
  premium:
    'bg-gradient-to-br from-primary-800 to-primary-600 border border-gold-500/30 shadow-glow-gold-md',
  stat: 'bg-primary-800 rounded-xl p-4',
  interactive:
    'bg-primary-800 border border-white-30/10 hover:border-gold-500/30 hover:bg-primary-700 cursor-pointer transition-all duration-200',
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
          'rounded-card transition-all duration-200',
          variants[variant],
          paddings[padding],
          hoverable && 'cursor-pointer hover:border-gold-500/30',
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
