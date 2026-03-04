'use client';

import React from 'react';
import { Token } from '@/types';
import { TokenCard } from './TokenCard';
import { TokenCardSkeleton } from '@/components/ui/skeleton';

interface TokenGridProps {
  tokens: Token[];
  loading?: boolean;
  emptyMessage?: string;
}

export function TokenGrid({ tokens, loading, emptyMessage }: TokenGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-text-secondary text-lg font-medium">No tokens found</p>
        <p className="text-text-muted text-sm mt-1">
          {emptyMessage || 'Be the first to launch a token!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
