import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useWalletBalance, useTransactions } from '@/features/wallet/useWallet';
import { usePrice, useCandles } from '@/features/market/useMarketData';
import { TransactionList } from '@/widgets/wallet/TransactionList';
import { SearchBar } from '@/widgets/wallet/SearchBar';
import { DepositFlow } from '@/features/wallet/DepositFlow';
import { WithdrawFlow } from '@/features/wallet/WithdrawFlow';
import { Button, MiniChart, Spinner } from '@/shared/ui';

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿', ETH: '⟠', SOL: '◎', USDT: '●', USDC: '●',
  ADA: '◆', XRP: '✕', DOT: '◈', DOGE: 'Ð', AVAX: '▲',
};

export default function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txSearch, setTxSearch] = useState('');

  const { data: wallet, isLoading: walletLoading } = useWalletBalance(assetId || '');
  const { data: priceData, isLoading: _priceLoading } = usePrice(assetId || '');
  const { data: candles, isLoading: candlesLoading } = useCandles(assetId || '', '1d', 30);
  const { data: txData, isLoading: txLoading } = useTransactions({
    assetId: assetId,
    limit: 20,
  });

  const icon = ASSET_ICONS[assetId || ''] || '●';
  const isPositive = priceData ? Number(priceData.change24h) >= 0 : true;

  if (!assetId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-ink-70 dark:text-white-70">Asset not specified</p>
        <Button variant="secondary" onClick={() => navigate('/wallet')} className="mt-4">
          Back to Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => navigate('/wallet')}
        className="flex items-center gap-1 text-sm text-ink-50 dark:text-white-50 hover:text-ink-70 dark:hover:text-white-90 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Wallet
      </button>

      {/* Header */}
      {walletLoading ? (
        <div className="flex items-center gap-4">
          <div className="skeleton h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-primary-600 text-xl text-brand-600 dark:text-white-90 font-mono">
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">{wallet?.name || assetId}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-50 dark:text-white-50 font-mono">{assetId}</span>
              {priceData && (
                <>
                  <span className="text-sm font-mono text-ink dark:text-white-90">
                    ${Number(priceData.price).toLocaleString()}
                  </span>
                  <span className={cn(
                    'text-sm font-mono',
                    isPositive ? 'text-market-green' : 'text-market-red',
                  )}>
                    {isPositive ? '+' : ''}{priceData.change24h}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Balance breakdown */}
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        {walletLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-8 w-40 rounded" />
            <div className="flex gap-8">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-50 dark:text-white-50">Total Balance</p>
            <p className="text-3xl font-bold font-mono text-ink dark:text-white mt-1">
              {Number(wallet?.balance || 0).toLocaleString()} {assetId}
            </p>
            <p className="text-sm text-ink-70 dark:text-white-70 font-mono mt-1">
              ${Number(wallet?.usdValue || 0).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-6 mt-4">
              <div>
                <p className="text-xs text-ink-50 dark:text-white-50">Available</p>
                <p className="text-sm font-mono text-ink dark:text-white-90">
                  {Number(wallet?.available || 0).toLocaleString()} {assetId}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-50 dark:text-white-50">In Orders</p>
                <p className="text-sm font-mono text-ink dark:text-white-90">
                  {Number(wallet?.locked || 0).toLocaleString()} {assetId}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-50 dark:text-white-50">USD Value</p>
                <p className="text-sm font-mono text-ink dark:text-white-90">
                  ${Number(wallet?.usdValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mini chart */}
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-4">
        <h3 className="text-sm font-medium text-ink-70 dark:text-white-70 mb-3">Price Chart (30D)</h3>
        {candlesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : candles && candles.length > 0 ? (
          <MiniChart
            data={candles.map((c) => ({ time: c.time, value: c.close }))}
            height={200}
            color={isPositive ? '#22C55E' : '#EF4444'}
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-ink-50 dark:text-white-50">
            Chart data unavailable
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => setShowDeposit(true)}>
          Deposit
        </Button>
        <Button variant="secondary" onClick={() => setShowWithdraw(true)}>
          Withdraw
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/trade/${assetId}`)}>
          Trade
        </Button>
      </div>

      {/* Transaction History */}
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-30/10 dark:border-primary-500/40">
          <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Transaction History</h3>
          <SearchBar value={txSearch} onChange={setTxSearch} />
        </div>
        <TransactionList
          transactions={txData?.transactions}
          isLoading={txLoading}
        />
      </div>

      {/* Modals */}
      {showDeposit && (
        <DepositFlow
          assetId={assetId}
          assetName={wallet?.name || assetId}
          onClose={() => setShowDeposit(false)}
        />
      )}
      {showWithdraw && (
        <WithdrawFlow
          assetId={assetId}
          assetName={wallet?.name || assetId}
          availableBalance={String(Number(wallet?.available || 0).toLocaleString())}
          onClose={() => setShowWithdraw(false)}
        />
      )}
    </div>
  );
}
