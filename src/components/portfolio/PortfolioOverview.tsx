'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { formatSOL, timeAgo } from '@/lib/utils';

export function PortfolioOverview() {
  const { publicKey, connected } = useWallet();
  const [portfolio, setPortfolio] = useState<{ holdings: unknown[]; trades: unknown[]; totalValue: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      fetch(`/api/portfolio?wallet=${publicKey.toString()}`)
        .then(r => r.json())
        .then(d => setPortfolio(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Connect your wallet to view portfolio</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading portfolio...</div>;
  }

  const holdings = portfolio?.holdings as Array<{tokenId: string; token: {name: string; symbol: string; price: number}; balance: string; currentValue: number; solSpent: number}> || [];
  const trades = portfolio?.trades as Array<{id: string; type: string; solAmount: number; createdAt: string; token: {name: string; symbol: string}}> || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Holdings</h2>
        {holdings.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500">
            <p>No holdings yet.</p>
            <Link href="/" className="text-green-400 text-sm mt-2 inline-block hover:underline">
              Explore tokens →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map(h => (
              <div key={h.tokenId} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">{h.token?.name}</span>
                  <span className="text-gray-400 text-sm ml-2">${h.token?.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatSOL(h.currentValue)}</p>
                  <p className="text-xs text-gray-500">Spent: {formatSOL(h.solSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
        {trades.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trades yet</p>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 20).map((t: { id: string; type: string; solAmount: number; createdAt: string; token: { name: string; symbol: string } }) => (
              <div key={t.id} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${t.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type}
                  </span>
                  <span className="text-white text-sm">{t.token?.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{formatSOL(t.solAmount)}</p>
                  <p className="text-xs text-gray-500">{timeAgo(t.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
