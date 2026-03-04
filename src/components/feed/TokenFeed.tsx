'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Token, TokenQueryParams } from '@/types';
import { TokenGrid } from '@/components/token/TokenGrid';
import { Button } from '@/components/ui/button';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

interface TokenFeedProps {
  initialTokens?: Token[];
  queryParams?: TokenQueryParams;
}

export function TokenFeed({ initialTokens = [], queryParams = {} }: TokenFeedProps) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTokens = useCallback(
    async (pageNum: number, replace = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          pageSize: String(DEFAULT_PAGE_SIZE),
          ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
          ...(queryParams.filter && { filter: queryParams.filter }),
          ...(queryParams.search && { search: queryParams.search }),
        });

        const res = await fetch(`/api/tokens?${params}`);
        const data = await res.json();

        if (data.items) {
          setTokens((prev) => (replace ? data.items : [...prev, ...data.items]));
          setHasMore(data.hasMore);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [queryParams.sortBy, queryParams.filter, queryParams.search]
  );

  // Re-fetch when query params change
  useEffect(() => {
    setPage(1);
    fetchTokens(1, true);
  }, [queryParams.sortBy, queryParams.filter, queryParams.search, fetchTokens]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTokens(nextPage, false);
  };

  // SSE - listen for new tokens
  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    eventSource.addEventListener('new_token', () => {
      fetchTokens(1, true);
    });
    return () => eventSource.close();
  }, [fetchTokens]);

  return (
    <div className="space-y-6">
      <TokenGrid
        tokens={tokens}
        loading={loading && page === 1}
        emptyMessage="No tokens match your search. Try different filters."
      />

      {hasMore && tokens.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="md"
            onClick={loadMore}
            loading={loading && page > 1}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
