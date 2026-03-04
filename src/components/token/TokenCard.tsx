'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Token } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatNumber, formatPrice, formatRelativeTime, shortenAddress } from '@/lib/utils';
import { calculateGraduationProgress } from '@/lib/bonding-curve';

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const progress = calculateGraduationProgress(token.solRaised);
  const isGraduated = token.status === 'GRADUATED';

  return (
    <Link href={`/token/${token.id}`}>
      <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 hover:bg-surface-2 transition-all duration-200 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Token Image */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-3 border border-border">
            {token.imageUrl ? (
              <Image
                src={token.imageUrl}
                alt={token.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-accent">
                {token.ticker.slice(0, 2)}
              </div>
            )}
            {isGraduated && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow rounded-full flex items-center justify-center text-xs">
                🎓
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-sm truncate group-hover:text-accent transition-colors">
                {token.name}
              </h3>
              <Badge variant={isGraduated ? 'warning' : 'success'} size="sm">
                ${token.ticker}
              </Badge>
            </div>
            <p className="text-text-muted text-xs mt-0.5">
              by {token.creator?.username || shortenAddress(token.creator?.walletAddress || '', 4)}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-white text-sm font-mono font-medium">
              {formatPrice(token.currentPrice)} SOL
            </p>
          </div>
        </div>

        {/* Description */}
        {token.description && (
          <p className="text-text-secondary text-xs line-clamp-2 mb-3">{token.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <p className="text-text-muted">Market Cap</p>
            <p className="text-white font-medium">{formatNumber(token.marketCap)} SOL</p>
          </div>
          <div className="text-right">
            <p className="text-text-muted">SOL Raised</p>
            <p className="text-accent font-medium">{token.solRaised.toFixed(2)} SOL</p>
          </div>
        </div>

        {/* Bonding curve progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-muted">Bonding curve</span>
            <span className="text-accent">{progress.toFixed(1)}%</span>
          </div>
          <Progress
            value={progress}
            size="sm"
            color={progress > 80 ? 'green' : 'accent'}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
          <span>{formatRelativeTime(token.createdAt)}</span>
          {token._count && (
            <span>{formatNumber(token._count.trades, 0)} trades</span>
          )}
        </div>
      </div>
    </Link>
  );
}
