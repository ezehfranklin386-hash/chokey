# Signals & Charts Architecture
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. Trading Signals — Overview

The signals system is a core differentiator. It combines **algorithmic technical analysis** (server-side scanning every pair/timeframe), **community signals** (user-submitted), and **copy trading** (mirror top traders).

```
┌──────────────────────────────────────────────────────────────────┐
│                      SIGNALS PIPELINE                            │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐   │
│  │ TA Scanner   │   │ Community    │   │ Copy Trading      │   │
│  │ (Cron / Bull)│   │ (User Submit)│   │ (Mirror Strategy) │   │
│  └──────┬───────┘   └──────┬───────┘   └────────┬──────────┘   │
│         │                  │                     │              │
│         ▼                  ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 SIGNAL AGGREGATOR                         │  │
│  │  - Deduplication                                          │  │
│  │  - Confidence scoring                                     │  │
│  │  - Risk assessment                                        │  │
│  │  - Performance tracking                                   │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WebSocket Broadcast to Users                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User Notification (Push / Email / In-App)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Algorithmic Signal Generation

### 2.1 Strategy Engine

```typescript
// Server-side TA scanning system architecture

class TechnicalAnalysisEngine {
  private indicators: Map<string, IndicatorCalculator>;
  private strategies: TradingStrategy[];

  constructor() {
    this.indicators = new Map([
      ['rsi', new RSICalculator()],
      ['macd', new MACDCalculator()],
      ['ema', new EMACalculator()],
      ['sma', new SMACalculator()],
      ['bb', new BollingerBandsCalculator()],
      ['ichimoku', new IchimokuCalculator()],
      ['volume', new VolumeAnalyzer()],
      ['support_resistance', new SupportResistanceDetector()],
      ['pattern', new CandlestickPatternDetector()],
    ]);
  }

  /**
   * Scan all active asset pairs across multiple timeframes
   * Runs every hour for 1H+ timeframes
   * Runs every 4 hours for 4H+ timeframes
   * Runs daily for 1D+ timeframes
   */
  async scan(assetId: string, candles: Candle[]): Promise<SignalResult[]> {
    const results: SignalResult[] = [];
    const timeframes = ['1h', '4h', '1d', '1w'];

    for (const tf of timeframes) {
      const tfCandles = this.filterByTimeframe(candles, tf);
      // Run all strategies
      for (const strategy of this.strategies) {
        const signal = await strategy.evaluate(assetId, tfCandles, tf);
        if (signal) results.push(signal);
      }
    }

    return this.deduplicateAndScore(results);
  }
}
```

### 2.2 Trading Strategies Implemented

| Strategy | Indicators | Timeframe | Signal Strength |
|----------|-----------|-----------|-----------------|
| **RSI Oversold Bounce** | RSI(14) < 30 + bullish divergence | 4H, 1D | Strong |
| **RSI Overbought Drop** | RSI(14) > 70 + bearish divergence | 4H, 1D | Strong |
| **MACD Crossover** | MACD line crosses signal line | 1H, 4H, 1D | Medium |
| **Golden Cross** | MA50 crosses above MA200 | 1D, 1W | Strong |
| **Death Cross** | MA50 crosses below MA200 | 1D, 1W | Strong |
| **Bollinger Squeeze** | BB width < 20th percentile + volume | 1H, 4H | Medium |
| **Bollinger Bounce** | Price touches lower/upper band + RSI confirmation | 1H, 4H | Medium |
| **Volume Spike** | Volume > 2x MA(20) + price breakout | 15m, 1H, 4H | Medium |
| **Engulfing Pattern** | Bullish/bearish engulfing + volume | 4H, 1D | Medium |
| **Support Bounce** | Price bounces from key support level | 1H, 4H, 1D | Medium |
| **Resistance Break** | Price breaks above resistance with volume | 1H, 4H, 1D | Medium |
| **Ichimoku Cloud Break** | Price breaks above/below cloud | 4H, 1D | Strong |
| **Triple Confirmation** | 3+ indicators agree (e.g., RSI + MACD + Volume) | Any | Very Strong |

### 2.3 Confidence Scoring Algorithm

```typescript
function calculateConfidence(signal: RawSignal): number {
  let score = 50; // base

  // Multi-timeframe confirmation
  if (signal.confirmingTimeframes.length >= 2) score += 15;
  if (signal.confirmingTimeframes.length >= 3) score += 10;

  // Volume confirmation
  if (signal.volumeRatio > 2.0) score += 10;
  if (signal.volumeRatio > 3.0) score += 5;

  // Multiple indicator alignment
  if (signal.confirmingIndicators >= 3) score += 10;
  if (signal.confirmingIndicators >= 5) score += 5;

  // Trend alignment (signal with trend is stronger than against)
  if (signal.alignsWithTrend) score += 10;

  // Proximity to key levels
  if (signal.nearSupportResistance) score += 5;

  // Historical accuracy of this strategy
  score += signal.strategyHistoricalWinRate * 0.3;

  return Math.min(100, Math.max(0, Math.round(score)));
}
```

### 2.4 Bull/Queue Job Configuration

```typescript
// Bull queue jobs for signal generation

interface SignalJobData {
  assetId: string;
  timeframe: string;
  type: 'technical_scan' | 'strategy_evaluation' | 'performance_recalc';
}

// Schedule
const technicalScanQueue = new Queue<SignalJobData>('technical-scan', {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 60_000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Hourly scan
technicalScanQueue.add(
  { assetId: '*', timeframe: '1h', type: 'technical_scan' },
  { repeat: { cron: '0 * * * *' } } // every hour at :00
);

// Daily deep scan
technicalScanQueue.add(
  { assetId: '*', timeframe: '1d', type: 'technical_scan' },
  { repeat: { cron: '0 6 * * *' } } // every day at 06:00
);

// Performance recalculation (nightly)
const performanceQueue = new Queue('signal-performance', {
  defaultJobOptions: { attempts: 3 },
});

performanceQueue.add(
  { type: 'performance_recalc' },
  { repeat: { cron: '0 2 * * *' } } // every night at 02:00
);
```

---

## 3. Community Signals

### 3.1 Signal Creation & Moderation

```
Flow:
  1. Premium user submits signal via CreateSignalPage
  2. Automated validation:
     - Entry price within 5% of current market price
     - Target prices logical (Buy: target > entry, Sell: target < entry)
     - Rationale > 50 characters
     - Not duplicate of active signal (same pair, same direction)
  3. Flagged for moderation if user's win rate < 40%
  4. Admin reviews in moderation queue
  5. Approved signal goes live with provider attribution
  6. Performance auto-tracked (entry hits targets or stop-loss)
```

### 3.2 Signal Provider Tiers

| Tier | Requirements | Revenue Share | Features |
|------|-------------|---------------|----------|
| **Free** | Registered user | - | View signals only |
| **Premium** | $9.99/month | - | Create signals, advanced filters |
| **Provider** | > 60% win rate, 50+ signals | 50% of subscription revenue from followers | Copy trading enabled, performance stats, subscribers |
| **Elite Provider** | > 70% win rate, 200+ signals | 70% revenue share | Featured listing, verified badge, API access |

### 3.3 Signal Display in Frontend

```tsx
// SignalCard widget — handles all states
function SignalCard({ signal }: { signal: Signal }) {
  const isPositive = signal.direction === 'BUY' || signal.direction === 'STRONG_BUY';

  return (
    <Card className={
      cn('border-l-4', {
        'border-market-green': isPositive,
        'border-market-red': !isPositive,
      })
    }>
      {/* Header: Asset + Direction Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AssetIcon symbol={signal.asset.symbol} />
          <span className="font-semibold">{signal.asset.symbol}/USD</span>
          <Badge variant={isPositive ? 'success' : 'danger'}>
            {signal.direction.replace('_', ' ')}
          </Badge>
          {signal.isPremium && <Badge variant="premium">Premium</Badge>}
        </div>
        <span className="text-xs text-muted-foreground">
          {signal.timeframe} • {formatRelativeTime(signal.publishedAt)}
        </span>
      </div>

      {/* Price Targets */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {signal.stopLoss && (
          <PriceTarget label="Stop Loss" value={signal.stopLoss} variant="danger" />
        )}
        <PriceTarget label="Entry" value={signal.entryPrice} variant="neutral" />
        <PriceTarget label="Target 1" value={signal.targetPrice1} variant={isPositive ? 'success' : 'danger'} />
        <PriceTarget label="Target 2" value={signal.targetPrice2} variant={isPositive ? 'success' : 'danger'} />
      </div>

      {/* Confidence + Rationale */}
      <div className="mt-2 flex items-center gap-4">
        <ConfidenceBar value={signal.confidence} />
        <span className="text-sm">{signal.strategyName}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{signal.rationale}</p>

      {/* Provider + Actions */}
      <div className="mt-3 flex items-center justify-between">
        <SignalProvider provider={signal.provider} />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => subscribe(signal.id)}>
            Follow
          </Button>
          <Button variant="outline" size="sm" onClick={() => trade(signal)}>
            Trade Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 4. Charts — Architecture

### 4.1 Chart Library Decision

| Feature | TradingView Charting Lib | Lightweight Charts | Recharts |
|---------|------------------------|-------------------|----------|
| **Use Case** | Main trading page | Mini-charts, sparklines | Portfolio overview |
| **License** | Free for websites | Apache 2.0 (free) | MIT (free) |
| **Bundle Size** | ~400KB gzip | ~45KB gzip | ~30KB gzip |
| **Indicators** | 100+ built-in | Custom only | - |
| **Drawing Tools** | Full suite | None | - |
| **Timeframes** | All | Configurable | - |
| **Real-time** | Yes (streaming adapter) | Yes | Polling only |

**Decision:**
- **TradingView Charting Library** → Main trading view (full-featured)
- **Lightweight Charts** → Mini charts on market overview, coin detail sparklines
- **Recharts** → Portfolio performance over time, allocation pie chart

### 4.2 TradingView Integration

```typescript
// widgets/trading/TradingChart.tsx
// TradingView Charting Library integration

import { widget, IChartingLibraryWidget } from '@cryptowallet/charting_library';

interface TradingChartProps {
  symbol: string;        // "BINANCE:BTCUSD"
  container: HTMLElement;
  theme: 'Dark' | 'Light';
  locale: string;
}

class TradingChartWidget {
  private widget: IChartingLibraryWidget | null = null;

  async init({ symbol, container, theme, locale }: TradingChartProps) {
    this.widget = new widget({
      symbol: symbol,
      interval: '60', // 1 hour default
      container: container,
      library_path: '/charting_library/',
      locale: locale,
      theme: theme,
      disabled_features: [
        'header_compare',
        'header_screenshot',
        'header_symbol_search', // we provide our own
      ],
      enabled_features: ['study_templates'],
      charts_storage_url: `${API_BASE}/v1/chart-layout`,
      charts_storage_api_version: '1.1',
      client_id: 'cryptowallet',
      user_id: currentUser.id,
      custom_css_url: '/tv-custom.css',
      loading_screen: { backgroundColor: '#1a1a2e' },
      overrides: {
        'paneProperties.background': '#1a1a2e',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.vertGridProperties.color': '#2d3748',
        'paneProperties.horzGridProperties.color': '#2d3748',
        'mainSeriesProperties.candleStyle.upColor': '#22c55e',
        'mainSeriesProperties.candleStyle.downColor': '#ef4444',
        'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
      },
      studies_overrides: {
        'RSI.color': '#60a5fa',
        'MACD.macd.color': '#60a5fa',
        'MACD.signal.color': '#f59e0b',
        'Bollinger Bands.median.color': '#a78bfa',
      },
      // Custom datafeed
      datafeed: new CustomDatafeed(),
    });

    // Subscribe to crosshair move for order form sync
    this.widget.subscribe('crosshair', (params) => {
      if (params.time && params.price) {
        onCrosshairMove?.(params.time, params.price);
      }
    });
  }

  async setSymbol(symbol: string) {
    await this.widget?.setSymbol(symbol, '60');
  }

  async setInterval(interval: string) {
    await this.widget?.setInterval(interval);
  }

  destroy() {
    this.widget?.remove();
    this.widget = null;
  }
}
```

### 4.3 Custom Datafeed Implementation

```typescript
// TradingView requires a custom datafeed adapter
// Connects to our backend API + WebSocket for real-time

class CustomDatafeed implements IDatafeedChartApi {
  private socket: Socket;

  constructor() {
    this.socket = io(`${WS_URL}/prices`, {
      transports: ['websocket'],
    });
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams
  ): Promise<IBar[]> {
    const { from, to, firstDataRequest } = periodParams;
    const interval = this.resolutionToInterval(resolution);

    // Fetch historical bars from our API
    const response = await fetch(
      `${API_BASE}/v1/market/candles/${symbolInfo.name}` +
      `?interval=${interval}&from=${from}&to=${to}&limit=10000`
    );

    const data = await response.json();
    return data.candles.map(c => ({
      time: new Date(c.openTime).getTime() / 1000,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume),
    }));
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onTick: (bar: Bar) => void,
    subscriberUID: string
  ): void {
    // Listen for real-time candle updates via WebSocket
    this.socket.emit('subscribe:candles', {
      symbol: symbolInfo.name,
      interval: resolution,
    });

    this.socket.on(`candle:${symbolInfo.name}:${resolution}`, (candle) => {
      onTick({
        time: candle.timestamp,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
      });
    });
  }

  unsubscribeBars(subscriberUID: string): void {
    this.socket.emit('unsubscribe:candles', { subscriberUID });
  }

  resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo> {
    return fetch(`${API_BASE}/v1/market/symbol/${symbolName}`)
      .then(r => r.json())
      .then(s => ({
        name: s.symbol,
        ticker: s.symbol,
        description: s.name,
        type: 'crypto',
        session: '24x7',
        timezone: 'UTC',
        exchange: 'CryptoWallet',
        minmov: 1,
        pricescale: s.priceScale, // e.g., 100 for 2 decimal places
        has_intraday: true,
        has_weekly_and_monthly: true,
        currency_code: 'USD',
      }));
  }
}
```

### 4.4 Lightweight Charts (Mini Charts)

```tsx
// shared/ui/MiniChart.tsx
import { createChart, IChartApi, LineData } from 'lightweight-charts';

// Used on MarketPage, WalletCard, SignalCard sparklines
// 45KB gzipped, fast render, no API key needed

interface MiniChartProps {
  data: { time: string; value: number }[];
  color?: string;
  height?: number;
  width?: number;
  showAxis?: boolean;
  isPositive?: boolean;
}

export function MiniChart({ data, color, height = 60, width = 180, isPositive }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#6b7280',
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: showAxis },
      crosshair: { mode: CrosshairMode.Normal },
    });

    const lineSeries = chartRef.current.addLineSeries({
      color: color ?? (isPositive ? '#22c55e' : '#ef4444'),
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      lastValueVisible: false,
      priceLineVisible: false,
    });

    lineSeries.setData(data as LineData[]);

    return () => {
      chartRef.current?.remove();
    };
  }, [data]);

  return <div ref={containerRef} />;
}
```

---

## 5. Signal Performance Tracking

### 5.1 Performance Metrics Calculation

```sql
-- Recalculated nightly via Bull queue job

WITH signal_trades AS (
  SELECT
    s.id,
    s.direction,
    s.entry_price,
    s.target_price_1,
    s.target_price_2,
    s.stop_loss,
    s.published_at,
    sp.exit_price,
    sp.exit_price >= s.target_price_1 AS hit_target_1,
    sp.exit_price >= s.target_price_2 AS hit_target_2,
    sp.exit_price <= s.stop_loss AS hit_stop_loss,
    (sp.exit_price - s.entry_price) / s.entry_price * 100 AS pnl_pct,
    (sp.exit_price - s.entry_price) * sp.quantity AS pnl_abs
  FROM signals s
  JOIN signal_performance sp ON sp.signal_id = s.id
  WHERE sp.exited_at IS NOT NULL
    AND sp.exited_at >= NOW() - INTERVAL '90 days'
)
SELECT
  id,
  COUNT(*) AS total_signals,
  SUM(CASE WHEN pnl_pct > 0 THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN pnl_pct <= 0 THEN 1 ELSE 0 END) AS losses,
  ROUND(AVG(pnl_pct), 2) AS avg_pnl_pct,
  ROUND(SUM(pnl_abs), 2) AS total_pnl,
  ROUND(MAX(drawdown), 2) AS max_drawdown,
  ROUND(profit_factor, 2) AS profit_factor
FROM signal_trades
GROUP BY id;
```

### 5.2 Signal Display Chart

```tsx
// Signal performance visualization — shown on SignalDetailPage
// Uses Recharts for bar/line charts

function SignalPerformanceChart({ signalId }: { signalId: string }) {
  const { data, isLoading } = useSignalPerformance(signalId);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Win Rate" value={`${data.winRate}%`} change={data.winRate > 50 ? 'up' : 'down'} />
        <StatCard title="Total P&L" value={`$${formatNumber(data.totalPnl)}`} change={data.totalPnl > 0 ? 'up' : 'down'} />
        <StatCard title="Avg Return" value={`${data.avgPnlPercent}%`} change={data.avgPnlPercent > 0 ? 'up' : 'down'} />
        <StatCard title="Max Drawdown" value={`${data.maxDrawdown}%`} change="neutral" />
      </div>

      {/* Cumulative P&L Chart */}
      <Card>
        <CardHeader>Performance Over Time</CardHeader>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.cumulativePnl}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="pnl" stroke="#22c55e" fill="url(#pnlGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
```

---

## 6. Order Flow Integration with Charts

```
User sees signal → Clicks "Trade Now"
  → Signal data pre-fills the order form
    → Asset: BTC
    → Side: BUY
    → Price: Entry price (for limit) or market
    → Quantity: Default 1% of portfolio
    → Stop Loss: Pre-filled from signal data
    → Take Profit: Pre-filled from target prices

User can adjust any field before submitting
```

---

## 7. Chart Layout Persistence

```typescript
// TradingView saves chart layouts to our backend
// Endpoint: POST /api/v1/chart-layout
// Structure stored per user per symbol

interface ChartLayout {
  userId: string;
  symbol: string;
  drawings: Drawing[];
  indicators: IndicatorSetting[];
  visibleRange: { from: number; to: number };
  resolution: string;
  lastModified: number;
}

// Restored on next visit per symbol
// User can also save named layouts ("BTC Daily Analysis")
```

---

## 8. Real-Time Signal Broadcasting

```typescript
// When a new signal is generated/approved:
// 1. Save to database
// 2. Emit via WebSocket to subscribed users
// 3. Push notification via Firebase Cloud Messaging / Web Push API
// 4. Email notification (if user enabled)

async function publishSignal(signal: Signal) {
  const saved = await signalRepository.create(signal);

  // WebSocket broadcast to signal subscribers
  io.to(`signals:${saved.assetId}`).emit('signal:new', {
    signal: sanitizeSignal(saved),
  });

  // Send push notifications
  const subscribers = await userRepository.getSignalSubscribers(saved.assetId);
  for (const user of subscribers) {
    if (user.settings.pushNotifications) {
      await pushService.send({
        userId: user.id,
        title: `New ${saved.direction} signal for ${saved.asset.symbol}`,
        body: `Target: $${saved.targetPrice1} | Confidence: ${saved.confidence}%`,
        data: { signalId: saved.id, url: `/signals/${saved.id}` },
      });
    }
  }
}
```

---

**Next Document:** [08-PWA-Implementation-Guide.md](08-PWA-Implementation-Guide.md)
