'use client';

import React, { useEffect, useState } from 'react';
import { Trade } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { TradeRowSkeleton } from '@/components/ui/skeleton';
import { formatRelativeTime, formatNumber, shortenAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TradeHistoryProps {
  tokenId: string;
}

export function TradeHistory({ tokenId }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch(`/api/tokens/${tokenId}/trades`);
        const data = await res.json();
        if (data.items) setTrades(data.items);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [tokenId]);

  // Listen for SSE trade updates
  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    eventSource.addEventListener('trade', (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.tokenId === tokenId) {
          // Refresh trades
          fetch(`/api/tokens/${tokenId}/trades`)
            .then((r) => r.json())
            .then((data) => { if (data.items) setTrades(data.items); });
        }
      } catch {
        // ignore
      }
    });
    return () => eventSource.close();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <TradeRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-muted text-sm">No trades yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-text-muted sticky top-0 bg-surface">
        <span>Trader</span>
        <span>Type</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {trades.map((trade) => {
        const isBuy = trade.type === 'BUY';
        const displayName =
          trade.user?.username ||
          shortenAddress(trade.user?.walletAddress || '', 4);

        return (
          <div
            key={trade.id}
            className={cn(
              'grid grid-cols-4 gap-2 px-4 py-2.5 items-center text-xs hover:bg-surface-2 transition-colors',
              isBuy ? 'border-l-2 border-l-green' : 'border-l-2 border-l-red'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                src={trade.user?.avatar}
                alt={displayName}
                fallback={trade.user?.walletAddress || '??'}
                size="xs"
              />
              <span className="text-text-secondary truncate">{displayName}</span>
            </div>

            <span
              className={cn(
                'font-bold uppercase',
                isBuy ? 'text-green' : 'text-red'
              )}
            >
              {trade.type}
            </span>

            <div className="text-right">
              <p className={cn('font-medium', isBuy ? 'text-green' : 'text-red')}>
                {isBuy ? '+' : '-'}{formatNumber(trade.amountTokens, 0)}
              </p>
              <p className="text-text-muted">{trade.amountSol.toFixed(3)} SOL</p>
            </div>

            <span className="text-text-muted text-right">
              {formatRelativeTime(trade.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
