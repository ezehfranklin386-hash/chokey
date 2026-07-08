import { cn } from '@/shared/lib/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'gold' | 'green' | 'red' | 'blue';
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  gold: 'bg-gold-500',
  green: 'bg-market-green',
  red: 'bg-market-red',
  blue: 'bg-info',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'gold',
  label,
  showPercent = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs text-white-70">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-white">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-primary-600', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
