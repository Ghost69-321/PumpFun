'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  ticker: string;
  imageUrl?: string | null;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = React.useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/tokens?search=${encodeURIComponent(q)}&pageSize=5`);
        const data = await res.json();
        setResults(data.items || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    search(query);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (token: SearchResult) => {
    router.push(`/token/${token.id}`);
    setQuery('');
    setResults([]);
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/?search=${encodeURIComponent(query)}`);
      setFocused(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tokens..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
        {loading && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {/* Dropdown results */}
      {focused && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-surface-2 border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((token) => (
            <button
              key={token.id}
              onClick={() => handleSelect(token)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-3 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                {token.ticker.slice(0, 2)}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{token.name}</p>
                <p className="text-text-muted text-xs">${token.ticker}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
