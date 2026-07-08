import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallets, useTransactions } from '@/features/wallet/useWallet';
import { WalletSummary } from '@/widgets/wallet/WalletSummary';
import { SearchBar } from '@/widgets/wallet/SearchBar';
import { AssetRow } from '@/widgets/wallet/AssetRow';
import { TransactionList } from '@/widgets/wallet/TransactionList';
import { Button } from '@/shared/ui';

export default function WalletPage() {
  const navigate = useNavigate();
  const { data: walletData, isLoading: walletsLoading } = useWallets();
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 10 });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');

  // Filter wallets by search
  const filteredWallets = useMemo(() => {
    if (!walletData?.wallets) return [];
    if (!search.trim()) return walletData.wallets;
    const q = search.toLowerCase();
    return walletData.wallets.filter(
      (w) => w.asset.toLowerCase().includes(q) || w.name.toLowerCase().includes(q),
    );
  }, [walletData?.wallets, search]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Wallet</h1>
          <p className="text-sm text-ink-50 dark:text-white-50">Manage your assets and transactions</p>
        </div>
      </div>

      {/* Summary */}
      <WalletSummary summary={walletData?.summary} isLoading={walletsLoading} />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/app/wallet/BTC')}>
          Deposit
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app/wallet/BTC')}>
          Withdraw
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app/trade')}>
          Trade
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-30/10 dark:border-primary-500/40">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'assets'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-ink-50 dark:text-white-50 hover:text-ink-70 dark:hover:text-white-70'
          }`}
        >
          Assets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-ink-50 dark:text-white-50 hover:text-ink-70 dark:hover:text-white-70'
          }`}
        >
          History
        </button>
      </div>

      {/* Search (only show for assets tab) */}
      {activeTab === 'assets' && (
        <SearchBar value={search} onChange={setSearch} />
      )}

      {/* Content */}
      {activeTab === 'assets' && (
        <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800">
          {walletsLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="skeleton h-3 w-12 rounded" />
                </div>
              ))}
            </div>
          ) : !filteredWallets || filteredWallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 text-3xl text-ink-30 dark:text-white-30">💼</div>
              <p className="text-sm text-ink-70 dark:text-white-70">
                {search ? 'No assets match your search' : 'No assets yet'}
              </p>
              <p className="mt-1 text-xs text-ink-50 dark:text-white-50">
                {search ? 'Try a different search term' : 'Deposit or buy crypto to get started'}
              </p>
            </div>
          ) : (
            <div>
              {filteredWallets.map((w) => (
                <AssetRow
                  key={w.asset}
                  wallet={w}
                  onSelect={(asset) => navigate(`/app/wallet/${asset}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800">
          <div className="px-4 py-3 border-b border-ink-30/10 dark:border-primary-500/40">
            <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Recent Transactions</h3>
          </div>
          <TransactionList
            transactions={txData?.transactions}
            isLoading={txLoading}
          />
        </div>
      )}
    </div>
  );
}
