'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Token } from '@/types';
import { Badge } from '@/components/ui/badge';
import { BondingCurveProgress } from './BondingCurveProgress';
import { TokenStats } from './TokenStats';
import { formatPrice, formatRelativeTime, shortenAddress } from '@/lib/utils';
import { TradePanel } from '@/components/trading/TradePanel';
import { PriceChart } from '@/components/trading/PriceChart';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { CommentSection } from '@/components/comments/CommentSection';
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/tabs';

interface TokenDetailProps {
  token: Token;
}

export function TokenDetail({ token }: TokenDetailProps) {
  const isGraduated = token.status === 'GRADUATED';
  const creatorDisplay =
    token.creator?.username ||
    shortenAddress(token.creator?.walletAddress || '', 6);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4 bg-surface border border-border rounded-xl p-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-3 border border-border">
          {token.imageUrl ? (
            <Image src={token.imageUrl} alt={token.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-accent">
              {token.ticker.slice(0, 2)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{token.name}</h1>
            <Badge variant={isGraduated ? 'warning' : 'success'}>${token.ticker}</Badge>
            {isGraduated && <Badge variant="warning">🎓 Graduated</Badge>}
          </div>

          <p className="text-text-secondary text-sm mb-2">
            Created by{' '}
            <Link
              href={`/profile/${token.creator?.walletAddress}`}
              className="text-accent hover:underline"
            >
              {creatorDisplay}
            </Link>{' '}
            · {formatRelativeTime(token.createdAt)}
          </p>

          {token.description && (
            <p className="text-text-secondary text-sm">{token.description}</p>
          )}

          {/* Social links */}
          {token.socialLinks && (
            <div className="flex gap-3 mt-2">
              {token.socialLinks.twitter && (
                <a href={token.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="text-text-muted hover:text-blue text-xs flex items-center gap-1">
                  🐦 Twitter
                </a>
              )}
              {token.socialLinks.telegram && (
                <a href={token.socialLinks.telegram} target="_blank" rel="noopener noreferrer"
                  className="text-text-muted hover:text-blue text-xs flex items-center gap-1">
                  ✈️ Telegram
                </a>
              )}
              {token.socialLinks.website && (
                <a href={token.socialLinks.website} target="_blank" rel="noopener noreferrer"
                  className="text-text-muted hover:text-accent text-xs flex items-center gap-1">
                  🌐 Website
                </a>
              )}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white font-mono">
            {formatPrice(token.currentPrice)}
          </p>
          <p className="text-text-muted text-xs">SOL per token</p>
        </div>
      </div>

      {/* Stats */}
      <TokenStats token={token} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart + Trades */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bonding curve progress */}
          <BondingCurveProgress token={token} />

          {/* Chart */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <PriceChart tokenId={token.id} />
          </div>

          {/* Tabs: Trade History, Comments */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <Tabs defaultTab="trades">
              <TabList className="px-4">
                <TabTrigger value="trades">Trade History</TabTrigger>
                <TabTrigger value="comments">Comments</TabTrigger>
              </TabList>
              <TabPanel value="trades" className="p-0">
                <TradeHistory tokenId={token.id} />
              </TabPanel>
              <TabPanel value="comments" className="p-4">
                <CommentSection tokenId={token.id} />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        {/* Trade Panel */}
        <div>
          <div className="sticky top-20">
            <TradePanel token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
