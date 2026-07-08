import { cn } from '@/shared/lib/cn';

interface HoldingsGridProps {
  wallets: Array<{
    asset: string;
    name: string;
    balance: string;
    usdValue: string;
    changePercent24h?: string;
    icon?: string;
  }> | undefined;
  isLoading: boolean;
}

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: '⟠',
  SOL: '◎',
  USDT: '●',
  USDC: '●',
  ADA: '◆',
  XRP: '✕',
  DOT: '◈',
  DOGE: 'Ð',
  AVAX: '▲',
};

export function HoldingsGrid({ wallets, isLoading }: HoldingsGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-card border border-white-10 bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-white-70">Holdings</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
              <div className="space-y-1 text-right">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return (
      <div className="rounded-card border border-white-10 bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-white-70">Holdings</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 text-3xl text-white-30">💰</div>
          <p className="text-sm text-white-70">No assets yet</p>
          <p className="mt-1 text-xs text-white-50">Deposit or buy crypto to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white-10 bg-primary-800 p-6">
      <h3 className="mb-4 text-sm font-medium text-white-70">Holdings</h3>
      <div className="space-y-1">
        {wallets.map((wallet) => {
          const change = wallet.changePercent24h;
          const isPositive = change && !change.startsWith('-');
          const icon = wallet.icon || ASSET_ICONS[wallet.asset] || '●';

          return (
            <div
              key={wallet.asset}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-primary-600/50 cursor-pointer"
            >
              {/* Icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm text-white-90 font-mono">
                {icon}
              </div>

              {/* Asset info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{wallet.name}</p>
                <p className="text-xs text-white-50 font-mono">{wallet.balance} {wallet.asset}</p>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="text-sm font-mono text-white-90">
                  ${Number(wallet.usdValue).toLocaleString()}
                </p>
                {change && (
                  <p className={cn(
                    'text-xs font-mono',
                    isPositive ? 'text-market-green' : 'text-market-red',
                  )}>
                    {isPositive ? '+' : ''}{change}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
