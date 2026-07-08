import { cn } from '@/shared/lib/cn';

const variants = {
  text: 'h-4 rounded',
  card: 'h-48 rounded-card',
  table: 'h-10 rounded',
  chart: 'h-64 rounded-card',
  circle: 'h-10 w-10 rounded-full',
} as const;

export interface SkeletonProps {
  variant?: keyof typeof variants;
  className?: string;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ variant = 'text', className, width, height, lines }: SkeletonProps) {
  if (lines && variant === 'text') {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 rounded"
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
