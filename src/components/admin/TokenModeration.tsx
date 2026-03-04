'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Token } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { formatRelativeTime, formatNumber } from '@/lib/utils';

export function TokenModeration() {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/tokens?pageSize=50&sortBy=newest');
      const data = await res.json();
      if (data.items) setTokens(data.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleStatusChange = async (tokenId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, status }),
      });

      if (res.ok) {
        toast({ type: 'success', title: 'Token updated' });
        fetchTokens();
      } else {
        toast({ type: 'error', title: 'Failed to update token' });
      }
    } catch {
      toast({ type: 'error', title: 'Error' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/token/${token.id}`}
                className="text-white font-medium hover:text-accent transition-colors"
              >
                {token.name}
              </Link>
              <Badge variant={token.status === 'ACTIVE' ? 'success' : token.status === 'GRADUATED' ? 'warning' : 'danger'}>
                {token.status}
              </Badge>
            </div>
            <p className="text-text-muted text-xs mt-0.5">
              ${token.ticker} · {formatRelativeTime(token.createdAt)} · {formatNumber(token.solRaised, 2)} SOL raised
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {token.status !== 'GRADUATED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(token.id, 'GRADUATED')}
              >
                Graduate
              </Button>
            )}
            {token.status !== 'FAILED' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleStatusChange(token.id, 'FAILED')}
              >
                Fail
              </Button>
            )}
            {token.status === 'FAILED' && (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleStatusChange(token.id, 'ACTIVE')}
              >
                Restore
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
