'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Token } from '@/types';
import { formatPrice } from '@/lib/utils';

export function TrendingBar() {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/tokens?sortBy=trending&pageSize=10');
        const data = await res.json();
        if (data.items) setTokens(data.items);
      } catch {
        // ignore
      }
    };
    fetch_();

    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  if (tokens.length === 0) return null;

  return (
    <div className="bg-surface border-b border-border overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 px-4 py-2 bg-accent text-black text-xs font-bold flex items-center gap-1">
          🔥 TRENDING
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="flex items-center gap-6 px-4 py-2 animate-none whitespace-nowrap"
            style={{ animation: 'scroll-x 30s linear infinite' }}
          >
            {tokens.map((token) => (
              <Link
                key={token.id}
                href={`/token/${token.id}`}
                className="flex items-center gap-2 text-sm hover:text-accent transition-colors shrink-0"
              >
                <span className="text-text-muted">${token.ticker}</span>
                <span className="text-white font-mono">{formatPrice(token.currentPrice)}</span>
                <span className="text-accent text-xs">
                  {token.solRaised.toFixed(1)} SOL
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
