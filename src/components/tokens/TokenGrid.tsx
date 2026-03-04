'use client';

import { useState, useEffect } from 'react';
import { TokenCard } from './TokenCard';
import type { TokenData } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'marketcap', label: 'Market Cap' },
];

export function TokenGrid() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTokens(true);
  }, [sort, search]);

  async function fetchTokens(reset = false) {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await fetch(`/api/tokens?sort=${sort}&search=${search}&page=${currentPage}`);
      const data = await res.json();
      
      if (reset) {
        setTokens(data.items || []);
        setPage(1);
      } else {
        setTokens(prev => [...prev, ...(data.items || [])]);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tokens..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === opt.value
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && tokens.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No tokens found</p>
          <p className="text-sm mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tokens.map(token => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => { setPage(p => p + 1); fetchTokens(); }}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
