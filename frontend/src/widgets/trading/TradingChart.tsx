import { memo, useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type UTCTimestamp } from 'lightweight-charts';
import { cn } from '@/shared/lib/cn';
import type { Candle } from '@/entities/market/asset.types';
import { Spinner } from '@/shared/ui';

interface TradingChartProps {
  candles: Candle[] | undefined;
  isLoading: boolean;
  symbol: string;
}

export const TradingChart = memo(function TradingChart({ candles, isLoading, symbol }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 480,
      layout: {
        background: { color: '#0F1636' },
        textColor: '#808394',
      },
      grid: {
        vertLines: { color: '#1C2554' },
        horzLines: { color: '#1C2554' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#D4A843', width: 1, style: 2, labelBackgroundColor: '#D4A843' },
        horzLine: { color: '#D4A843', width: 1, style: 2, labelBackgroundColor: '#D4A843' },
      },
      timeScale: {
        borderColor: '#24306A',
        timeVisible: false,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#24306A',
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      wickUpColor: '#22C55E',
    });
    candleSeriesRef.current = candleSeries;

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeriesRef.current = volumeSeries;

    // Volume axis
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles || candles.length === 0) return;

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? '#22C55E40' : '#EF444440',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-primary-800 rounded-card border border-white-10" style={{ height: 480 }}>
        <Spinner />
      </div>
    );
  }

  const lastCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;
  const prevCandle = candles && candles.length > 1 ? candles[candles.length - 2] : null;
  const priceChange = lastCandle && prevCandle
    ? ((lastCandle.close - prevCandle.close) / prevCandle.close * 100).toFixed(2)
    : '0.00';
  const isUp = lastCandle && prevCandle ? lastCandle.close >= prevCandle.close : true;

  return (
    <div className="rounded-card border border-white-10 bg-primary-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary-500/40">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-white font-mono">{symbol}</h3>
          {lastCandle && (
            <>
              <span className="text-sm font-mono text-white-90">
                ${lastCandle.close.toLocaleString()}
              </span>
              <span className={cn(
                'flex items-center gap-1 text-sm font-mono',
                isUp ? 'text-market-green' : 'text-market-red',
              )}>
                <span aria-hidden="true">{isUp ? '▲' : '▼'}</span>
                {priceChange}%
              </span>
            </>
          )}
        </div>
        {!lastCandle && !isLoading && (
          <span className="text-xs text-white-50">No chart data</span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
});
