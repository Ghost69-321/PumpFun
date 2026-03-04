'use client';

import { useState, useEffect, useCallback } from 'react';
import { Token } from '@/types';

export function useTokenData(tokenId: string) {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    if (!tokenId) return;
    try {
      setError(null);
      const res = await fetch(`/api/tokens/${tokenId}`);
      if (!res.ok) throw new Error('Token not found');
      const data = await res.json();
      setToken(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch token');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Listen for price updates via SSE
  useEffect(() => {
    if (!tokenId) return;
    const eventSource = new EventSource('/api/sse');

    eventSource.addEventListener('price_update', (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.tokenId === tokenId) {
          setToken((prev) =>
            prev
              ? {
                  ...prev,
                  currentPrice: event.newPrice,
                  marketCap: event.newMarketCap,
                  solRaised: event.solRaised,
                  circulatingSupply: event.circulatingSupply,
                }
              : prev
          );
        }
      } catch {
        // ignore
      }
    });

    return () => eventSource.close();
  }, [tokenId]);

  return { token, loading, error, refetch: fetchToken };
}
