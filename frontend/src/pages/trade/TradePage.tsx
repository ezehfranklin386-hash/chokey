import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCandles } from '@/features/market/useMarketData';
import { useTradingPairs, useOrderBook, useRecentTrades } from '@/features/trading/useTrading';
import { TradingChart } from '@/widgets/trading/TradingChart';
import { OrderBook } from '@/widgets/trading/OrderBook';
import { TradeForm } from '@/widgets/trading/TradeForm';
import { MarketPairs } from '@/widgets/trading/MarketPairs';
import { RecentTrades } from '@/widgets/trading/RecentTrades';

export default function TradePage() {
  const { pair: pairParam } = useParams<{ pair: string }>();
  const [activePair, setActivePair] = useState(pairParam || 'BTCUSDT');

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

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left: Market Pairs */}
      <div className="hidden lg:block w-[240px] shrink-0 border-r border-ink-30/10 dark:border-primary-500/40">
        <MarketPairs
          pairs={pairs}
          isLoading={pairsLoading}
          activePair={activePair}
          onSelect={setActivePair}
        />
      </div>

      {/* Center: Chart + Trade Form */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chart */}
        <div className="flex-1 min-h-[400px]">
          <TradingChart
            candles={candles}
            isLoading={candlesLoading}
            symbol={activePair}
          />
        </div>

        {/* Bottom: Trade Form + Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border-t border-ink-30/10 dark:border-primary-500/40 bg-surface dark:bg-primary-900">
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

      {/* Right: Order Book */}
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
