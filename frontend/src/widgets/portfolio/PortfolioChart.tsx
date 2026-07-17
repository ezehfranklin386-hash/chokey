import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { PortfolioHistoryPoint } from '@/entities/wallet/wallet.types';
import { cn } from '@/shared/lib/cn';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: ValueType; name: NameType }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 px-3 py-2 shadow-sm">
      <p className="text-xs text-ink-50 dark:text-white-50">{label ? formatDate(label) : ''}</p>
      <p className="text-sm font-medium text-ink dark:text-white">
        ${Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
}

interface PortfolioChartProps {
  data: PortfolioHistoryPoint[] | undefined;
  isLoading: boolean;
}

function formatDate(time: string): string {
  try {
    const d = new Date(time);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return time;
  }
}

export function PortfolioChart({ data, isLoading }: PortfolioChartProps) {
  const isPositive = useMemo(() => {
    if (!data || data.length < 2) return true;
    return data[data.length - 1]!.value >= data[0]!.value;
  }, [data]);

  const chartColor = isPositive ? '#16A34A' : '#DC2626';

  if (isLoading) {
    return (
      <div className="rounded-lg border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6">
        <div className="skeleton mb-4 h-5 w-32 rounded" />
        <div className="skeleton h-48 w-full rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6">
        <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Portfolio Performance</h3>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-ink-50 dark:text-white-50">No history data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Portfolio Performance</h3>
        <span className={cn(
          'text-xs font-medium',
          isPositive ? 'text-market-green' : 'text-market-red',
        )}>
          {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}
          {data.length > 1
            ? `${(((data[data.length - 1]!.value - data[0]!.value) / data[0]!.value) * 100).toFixed(2)}%`
            : '0.00%'}
        </span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-ink-30/20 dark:stroke-white/5" />
            <XAxis
              dataKey="time"
              tickFormatter={formatDate}
              className="text-[11px]"
              tick={{ fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              className="text-[11px]"
              tick={{ fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              width={60}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: chartColor, className: 'stroke-white dark:stroke-primary-800', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

