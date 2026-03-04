'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trade, PaginatedResponse } from '@/types';

export function useTrades(tokenId: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrades = useCallback(
    async (pageNum: number, replace = false) => {
      if (!tokenId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/tokens/${tokenId}/trades?page=${pageNum}`);
        const data: PaginatedResponse<Trade> = await res.json();
        setTrades((prev) => (replace ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [tokenId]
  );

  useEffect(() => {
    fetchTrades(1, true);
  }, [fetchTrades]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrades(nextPage, false);
  };

  // Listen for new trades via SSE
  useEffect(() => {
    if (!tokenId) return;
    const eventSource = new EventSource('/api/sse');
    eventSource.addEventListener('trade', (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.tokenId === tokenId) {
          fetchTrades(1, true);
        }
      } catch {
        // ignore
      }
    });
    return () => eventSource.close();
  }, [tokenId, fetchTrades]);

  return { trades, loading, hasMore, loadMore, refetch: () => fetchTrades(1, true) };
}
