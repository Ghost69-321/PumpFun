'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HoldingWithValue } from '@/types';
import { formatNumber, formatPercent, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface HoldingsListProps {
  holdings: HoldingWithValue[];
  loading?: boolean;
}

export function HoldingsList({ holdings, loading }: HoldingsListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">💼</p>
        <p className="text-text-secondary font-medium">No holdings yet</p>
        <p className="text-text-muted text-sm mt-1">
          Start trading to build your portfolio
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-accent hover:underline text-sm"
        >
          Explore tokens →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {holdings.map((holding) => {
        const token = holding.token;
        const isPnlPositive = holding.pnl >= 0;

        return (
          <Link
            key={holding.id}
            href={`/token/${holding.tokenId}`}
            className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-accent/20 hover:bg-surface-2 transition-all"
          >
            {/* Token image */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-3 shrink-0">
              {token?.imageUrl ? (
                <Image src={token.imageUrl} alt={token.name || ''} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent">
                  {token?.ticker?.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Token info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{token?.name}</p>
              <p className="text-text-muted text-xs">
                {formatNumber(holding.amount, 2)} ${token?.ticker} · avg {formatPrice(holding.averageBuyPrice)} SOL
              </p>
            </div>

            {/* Value & PnL */}
            <div className="text-right shrink-0">
              <p className="text-white font-medium text-sm">
                {holding.currentValue.toFixed(4)} SOL
              </p>
              <p className={cn('text-xs font-medium', isPnlPositive ? 'text-green' : 'text-red')}>
                {isPnlPositive ? '+' : ''}{holding.pnl.toFixed(4)} SOL
                ({formatPercent(holding.pnlPercent)})
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
