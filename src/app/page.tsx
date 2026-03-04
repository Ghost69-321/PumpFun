'use client';

import React, { useState } from 'react';
import { TrendingBar } from '@/components/feed/TrendingBar';
import { TokenFeed } from '@/components/feed/TokenFeed';
import { cn } from '@/lib/utils';
import { TokenSortBy, TokenFilter } from '@/types';
import Link from 'next/link';

const SORT_OPTIONS: { label: string; value: TokenSortBy }[] = [
  { label: '🆕 New', value: 'newest' },
  { label: '🔥 Trending', value: 'trending' },
  { label: '💎 Market Cap', value: 'marketcap' },
  { label: '📊 Volume', value: 'volume' },
];

const FILTER_OPTIONS: { label: string; value: TokenFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: '🎓 Graduated', value: 'graduated' },
];

export default function HomePage() {
  const [sortBy, setSortBy] = useState<TokenSortBy>('newest');
  const [filter, setFilter] = useState<TokenFilter>('all');

  return (
    <div>
      {/* Trending bar */}
      <TrendingBar />

      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="text-accent">Launch</span>{' '}
            <span className="text-white">your memecoin.</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-lg mx-auto mb-6">
            Fair launch bonding curve. No pre-sales. No rugs.
            Graduate to DEX at 85 SOL market cap.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-accent text-black font-bold px-6 py-3 rounded-xl hover:bg-accent-dim transition-colors text-sm"
          >
            🚀 Launch a Token
          </Link>
        </div>
      </div>

      {/* Token feed */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sort */}
          <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors font-medium',
                  sortBy === opt.value
                    ? 'bg-accent text-black'
                    : 'text-text-secondary hover:text-white'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors font-medium',
                  filter === opt.value
                    ? 'bg-surface-3 text-white'
                    : 'text-text-secondary hover:text-white'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <TokenFeed queryParams={{ sortBy, filter }} />
      </div>
    </div>
  );
}
