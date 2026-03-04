'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trade } from '@/types';
import { formatRelativeTime, formatNumber, formatPrice, shortenAddress } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TradeRowSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
  userId?: string;
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const url = userId ? `/api/portfolio?userId=${userId}&type=trades` : '/api/portfolio?type=trades';
        const res = await fetch(url);
        const data = await res.json();
        if (data.trades) setTrades(data.trades);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [userId]);

  if (loading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => <TradeRowSkeleton key={i} />)}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trades.map((trade) => {
        const isBuy = trade.type === 'BUY';
        return (
          <div
            key={trade.id}
            className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors"
          >
            {/* Type indicator */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                isBuy ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
              )}
            >
              {isBuy ? '↑' : '↓'}
            </div>

            {/* Token info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/token/${trade.tokenId}`}
                  className="text-white text-sm font-medium hover:text-accent transition-colors"
                >
                  {trade.token?.name || 'Unknown Token'}
                </Link>
                <Badge variant={isBuy ? 'success' : 'danger'} size="sm">
                  {trade.type}
                </Badge>
              </div>
              <p className="text-text-muted text-xs">
                {formatNumber(trade.amountTokens, 0)} ${trade.token?.ticker}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className={cn('text-sm font-medium', isBuy ? 'text-red' : 'text-green')}>
                {isBuy ? '-' : '+'}{trade.amountSol.toFixed(4)} SOL
              </p>
              <p className="text-text-muted text-xs">{formatRelativeTime(trade.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
