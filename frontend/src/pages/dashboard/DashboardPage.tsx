import { useWallets, usePortfolioHistory, useTransactions } from '@/features/wallet/useWallet';
import { useMarketPrices } from '@/features/market/useMarketData';
import { BalanceCard } from '@/widgets/portfolio/BalanceCard';
import { PortfolioChart } from '@/widgets/portfolio/PortfolioChart';
import { HoldingsGrid } from '@/widgets/portfolio/HoldingsGrid';
import { QuickActions } from '@/widgets/portfolio/QuickActions';
import { RecentTransactions } from '@/widgets/portfolio/RecentTransactions';
import { ActiveSignalsWidget } from '@/widgets/portfolio/ActiveSignalsWidget';

export default function DashboardPage() {
  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const { data: pricesData, isLoading: pricesLoading } = useMarketPrices();
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 5 });
  const { data: chartData, isLoading: chartLoading } = usePortfolioHistory();

  // Extract data from query responses
  const summary = walletsData?.summary;
  const wallets = walletsData?.wallets;
  const transactions = txData?.transactions;
  const prices = pricesData?.prices;

  // Map prices to signals format (stub — replace with real signals hook)
  const mockSignals = prices
    ? prices.slice(0, 3).map((p) => ({
        id: `sig-${p.symbol}`,
        asset: p.symbol,
        direction: (Number(p.changePercent24h) >= 0 ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
        confidence: Math.min(Math.abs(Number(p.changePercent24h)) * 10 + 50, 95),
        entryPrice: `$${Number(p.price).toLocaleString()}`,
        targetPrice: `$${(Number(p.price) * 1.05).toLocaleString()}`,
        stopLoss: `$${(Number(p.price) * 0.95).toLocaleString()}`,
        providerName: 'Market Signal',
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-ink dark:text-white">Dashboard</h1>
        <p className="text-sm text-ink-50 dark:text-white-50">Portfolio overview and market summary</p>
      </div>

      {/* Balance card + Portfolio chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <BalanceCard summary={summary} isLoading={walletsLoading} />
        </div>
        <div className="lg:col-span-2">
          <PortfolioChart data={chartData} isLoading={chartLoading} />
        </div>
      </div>

      {/* Holdings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HoldingsGrid wallets={wallets} isLoading={walletsLoading} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Transactions & Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTransactions transactions={transactions} isLoading={txLoading} />
        <ActiveSignalsWidget signals={mockSignals} isLoading={pricesLoading} />
      </div>
    </div>
  );
}
