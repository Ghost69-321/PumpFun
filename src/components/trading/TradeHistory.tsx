'use client';

import { useState, useEffect } from 'react';
import type { TradeData } from '@/types';
import { formatSOL, timeAgo, shortenAddress } from '@/lib/utils';

interface TradeHistoryProps {
  tokenId: string;
}

export function TradeHistory({ tokenId }: TradeHistoryProps) {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, [tokenId]);

  async function fetchTrades() {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/trades`);
      if (res.ok) {
        setTrades(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Trade History</h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded h-8 animate-pulse" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No trades yet. Be the first!</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.type}
                </span>
                <span className="text-gray-400">
                  {trade.user?.username || shortenAddress(trade.user?.walletAddress || '')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white">{formatSOL(trade.solAmount)}</span>
                <span className="text-gray-500 ml-2">{timeAgo(trade.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
