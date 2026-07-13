import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useCandles } from '@/features/market/useMarketData';
import { useTradingPairs, useOrderBook, useRecentTrades } from '@/features/trading/useTrading';
import { TradingChart } from '@/widgets/trading/TradingChart';
import { OrderBook } from '@/widgets/trading/OrderBook';
import { TradeForm } from '@/widgets/trading/TradeForm';
import { MarketPairs } from '@/widgets/trading/MarketPairs';
import { RecentTrades } from '@/widgets/trading/RecentTrades';

type MobileTab = 'chart' | 'trade' | 'orderbook';

export default function TradePage() {
  const { pair: pairParam } = useParams<{ pair: string }>();
  const [activePair, setActivePair] = useState(pairParam || 'BTCUSDT');
  const [mobileTab, setMobileTab] = useState<MobileTab>('chart');

  // Update when URL param changes
  useEffect(() => {
    if (pairParam) setActivePair(pairParam);
  }, [pairParam]);

  // Data fetching
  const { data: pairs, isLoading: pairsLoading } = useTradingPairs();
  const { data: candles, isLoading: candlesLoading } = useCandles(activePair, '15m', 200);
  const { data: orderBook, isLoading: orderBookLoading } = useOrderBook(activePair);
  const { data: recentTrades, isLoading: tradesLoading } = useRecentTrades(activePair);

  // Find active pair details
  const activePairData = pairs?.find((p) => p.symbol === activePair);
  const baseAsset = activePairData?.baseAsset || activePair.replace(/USDT|USD|BUSD|EUR/, '');
  const quoteAsset = activePairData?.quoteAsset || 'USDT';
  const lastPrice = activePairData?.price;

  const MOBILE_TABS = [
    { key: 'chart' as const, label: 'Chart' },
    { key: 'trade' as const, label: 'Trade' },
    { key: 'orderbook' as const, label: 'Book' },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:flex-row">
      {/* Left: Market Pairs (desktop only) */}
      <div className="hidden lg:block w-[240px] shrink-0 border-r border-ink-30/10 dark:border-primary-500/40">
        <MarketPairs
          pairs={pairs}
          isLoading={pairsLoading}
          activePair={activePair}
          onSelect={setActivePair}
        />
      </div>

      {/* Center: Chart + Trade Form */}
      <div className="flex flex-1 flex-col min-w-0 relative">
        {/* Mobile tab bar */}
        <div className="flex border-b border-ink-30/10 dark:border-primary-500/40 bg-surface dark:bg-primary-900 lg:hidden">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 py-2 text-xs font-medium transition-colors border-b-2 ${
                mobileTab === tab.key
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-ink-50 dark:text-white-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile: Chart panel */}
        <div className={`flex-1 min-h-[300px] ${mobileTab !== 'chart' ? 'hidden lg:flex' : ''}`}>
          <TradingChart
            candles={candles}
            isLoading={candlesLoading}
            symbol={activePair}
          />
        </div>

        {/* Mobile: OrderBook panel */}
        <div className={`${mobileTab !== 'orderbook' ? 'hidden lg:block' : ''} xl:hidden w-full`}>
          {mobileTab === 'orderbook' && (
            <div className="p-4">
              <OrderBook
                data={orderBook}
                isLoading={orderBookLoading}
                symbol={activePair}
              />
            </div>
          )}
        </div>

        {/* Mobile: TradeForm panel */}
        <div className={`${mobileTab !== 'trade' ? 'hidden lg:block' : ''}`}>
          {mobileTab === 'trade' && (
            <div className="p-4">
              <TradeForm
                symbol={activePair}
                baseAsset={baseAsset}
                quoteAsset={quoteAsset}
                lastPrice={lastPrice}
              />
            </div>
          )}
        </div>

        {/* Desktop: Bottom row - Trade Form + Recent Trades */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border-t border-ink-30/10 dark:border-primary-500/40 bg-surface dark:bg-primary-900">
          <TradeForm
            symbol={activePair}
            baseAsset={baseAsset}
            quoteAsset={quoteAsset}
            lastPrice={lastPrice}
          />
          <RecentTrades
            trades={recentTrades}
            isLoading={tradesLoading}
          />
        </div>
      </div>

      {/* Right: Order Book (desktop xl) */}
      <div className="hidden xl:block w-[260px] shrink-0 border-l border-ink-30/10 dark:border-primary-500/40">
        <OrderBook
          data={orderBook}
          isLoading={orderBookLoading}
          symbol={activePair}
        />
      </div>
    </div>
  );
}
