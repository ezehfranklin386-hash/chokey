import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, LineSeries, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';
import { cn } from '@/shared/lib/cn';

export interface MiniChartDataPoint {
  time: string | number;
  value: number;
}

export interface MiniChartProps {
  data: MiniChartDataPoint[];
  color?: string;
  height?: number;
  width?: number;
  isPositive?: boolean;
  type?: 'line' | 'area';
  className?: string;
}

export function MiniChart({
  data,
  color,
  height = 60,
  width,
  isPositive,
  type = 'area',
  className,
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const lineColor = color ?? (isPositive !== undefined
    ? isPositive ? '#22C55E' : '#EF4444'
    : '#D4A843');

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: width ?? containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = type === 'area'
      ? chart.addSeries(AreaSeries, {
          lineColor,
          topColor: `${lineColor}40`,
          bottomColor: `${lineColor}05`,
          lineWidth: 2,
        })
      : chart.addSeries(LineSeries, {
          color: lineColor,
          lineWidth: 2,
        });

    seriesRef.current = series as ISeriesApi<'Line'> | null;

    const chartData: LineData[] = data.map((d) => ({
      time: d.time,
      value: d.value,
    }));
    series.setData(chartData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, height, width, lineColor, type]);

  return <div ref={containerRef} className={cn('overflow-hidden', className)} />;
}
