'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { TokenData } from '@/types';

export function TrendingBar() {
  const [trending, setTrending] = useState<TokenData[]>([]);

  useEffect(() => {
    fetch('/api/tokens?sort=trending&limit=10')
      .then(r => r.json())
      .then(d => setTrending(d.items || []))
      .catch(() => {});
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="bg-gray-950 border-b border-gray-800 py-2 overflow-hidden">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 px-4 flex-shrink-0">🔥 Trending:</span>
        <div className="flex gap-6 px-4">
          {trending.map(token => (
            <Link key={token.id} href={`/token/${token.id}`} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-white font-medium">${token.symbol}</span>
              <span className="text-xs text-green-400">{token.price.toFixed(6)} SOL</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
