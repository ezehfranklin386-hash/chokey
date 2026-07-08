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

  const chartColor = isPositive ? '#22C55E' : '#EF4444';

  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <div className="skeleton mb-4 h-5 w-32 rounded" />
        <div className="skeleton h-48 w-full rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Portfolio Performance</h3>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-ink-50 dark:text-white-50">No history data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tickFormatter={formatDate}
              tick={{ fill: '#808394', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              tick={{ fill: '#808394', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: '#151D45',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#E5E6EB',
                fontSize: '13px',
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio']}
              labelFormatter={(label: any) => formatDate(label)}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: chartColor, stroke: '#0F1636', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

