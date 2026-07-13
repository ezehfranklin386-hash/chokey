import { cn } from '@/shared/lib/cn';
import type { Wallet } from '@/entities/wallet/wallet.types';

interface AssetRowProps {
  wallet: Wallet;
  onSelect: (asset: string) => void;
}

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿', ETH: '⟠', SOL: '◎', USDT: '●', USDC: '●',
  ADA: '◆', XRP: '✕', DOT: '◈', DOGE: 'Ð', AVAX: '▲',
};

export function AssetRow({ wallet, onSelect }: AssetRowProps) {
  const icon = ASSET_ICONS[wallet.asset] || '●';
  const changeNum = Number(wallet.usdValue) > 0
    ? ((Number(wallet.balance) - Number(wallet.available)) / Number(wallet.balance)) * 100
    : 0;
  const isPositive = changeNum >= 0;

  return (
    <div
      onClick={() => onSelect(wallet.asset)}
      className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-primary-600/50 cursor-pointer border-b border-ink-30/10 dark:border-primary-500/40 last:border-0 sm:gap-4 sm:px-4 sm:py-3.5"
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm text-ink-90 dark:text-white-90 font-mono sm:h-9 sm:w-9 sm:text-base">
        {icon}
      </div>

      {/* Name + Asset */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink dark:text-white truncate">{wallet.name}</p>
        <p className="text-xs text-ink-50 dark:text-white-50 font-mono">{wallet.asset}</p>
      </div>

      {/* Balance */}
      <div className="text-right shrink-0">
        <p className="text-xs font-mono text-ink-90 dark:text-white-90 sm:text-sm">
          {Number(wallet.balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })}
        </p>
        <p className="text-[10px] text-ink-70 dark:text-white-70 font-mono sm:text-xs">
          ${Number(wallet.usdValue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* 24h change indicator - hide on very small screens */}
      <div className={cn(
        'hidden sm:block text-xs font-mono w-16 text-right',
        isPositive ? 'text-market-green' : 'text-market-red',
      )}>
        {isPositive ? '+' : ''}{changeNum.toFixed(2)}%
      </div>

      {/* Arrow */}
      <svg className="h-3 w-3 text-ink-30 dark:text-white-30 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}
