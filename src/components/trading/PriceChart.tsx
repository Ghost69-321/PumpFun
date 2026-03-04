'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType } from 'lightweight-charts';
import { COLORS, CHART_TIMEFRAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  tokenId: string;
}

export function PriceChart({ tokenId }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [timeframe, setTimeframe] = useState('5m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.surface },
        textColor: COLORS.textSecondary,
      },
      grid: {
        vertLines: { color: COLORS.border },
        horzLines: { color: COLORS.border },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: COLORS.border,
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: COLORS.green,
      downColor: COLORS.red,
      borderUpColor: COLORS.green,
      borderDownColor: COLORS.red,
      wickUpColor: COLORS.green,
      wickDownColor: COLORS.red,
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tokens/${tokenId}/chart?timeframe=${timeframe}`);
        const data = await res.json();
        if (seriesRef.current && data.candles) {
          const formattedCandles: CandlestickData[] = data.candles.map(
            (c: { timestamp: string; open: number; high: number; low: number; close: number }) => ({
              time: Math.floor(new Date(c.timestamp).getTime() / 1000) as unknown as CandlestickData['time'],
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            })
          );
          seriesRef.current.setData(formattedCandles);
          if (chartRef.current) chartRef.current.timeScale().fitContent();
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchCandles();
  }, [tokenId, timeframe]);

  return (
    <div>
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-border">
        <span className="text-text-muted text-xs mr-2">Timeframe:</span>
        {CHART_TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={cn(
              'px-2.5 py-1 text-xs rounded transition-colors',
              timeframe === tf.value
                ? 'bg-accent text-black font-bold'
                : 'text-text-secondary hover:text-white hover:bg-surface-2'
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-10">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading chart...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="chart-container" />
      </div>
    </div>
  );
}
