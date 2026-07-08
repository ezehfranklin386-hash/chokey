import { cn } from '@/shared/lib/cn';

export interface PriceTickerProps {
  price: string;
  change?: string;
  changePercent?: string;
  large?: boolean;
  mono?: boolean;
  className?: string;
}

export function PriceTicker({
  price,
  change,
  changePercent,
  large = false,
  mono = true,
  className,
}: PriceTickerProps) {
  const isPositive = change && parseFloat(change) >= 0;

  return (
    <div className={cn('inline-flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-semibold tracking-tight text-white',
          mono && 'font-mono',
          large ? 'text-3xl' : 'text-lg',
        )}
      >
        {price}
      </span>
      {(change || changePercent) && (
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-market-green' : 'text-market-red',
          )}
        >
          {isPositive ? '▲' : '▼'}
          {change && <span>{change}</span>}
          {changePercent && <span>({changePercent})</span>}
        </span>
      )}
    </div>
  );
}
