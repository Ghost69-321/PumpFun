'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { TokenData } from '@/types';
import { TradePanel } from '@/components/trading/TradePanel';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { BondingCurveProgress } from './BondingCurveProgress';
import { CommentSection } from '@/components/comments/CommentSection';
import { formatSOL, formatNumber, timeAgo, shortenAddress } from '@/lib/utils';

interface TokenDetailProps {
  tokenId: string;
}

export function TokenDetail({ tokenId }: TokenDetailProps) {
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 10000);
    return () => clearInterval(interval);
  }, [tokenId]);

  async function fetchToken() {
    try {
      const res = await fetch(`/api/tokens/${tokenId}`);
      if (res.ok) {
        const data = await res.json();
        setToken(data);
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-900 h-32 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 h-24 rounded-xl col-span-2" />
          <div className="bg-gray-900 h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!token) {
    return <div className="text-center py-12 text-gray-400">Token not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="flex items-start gap-4 bg-gray-900 rounded-xl p-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
          {token.imageUrl ? (
            <Image src={token.imageUrl} alt={token.name} width={80} height={80} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🪙</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{token.name}</h1>
            <span className="text-gray-400 text-lg">${token.symbol}</span>
            {token.graduated && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">🎓 Graduated</span>
            )}
          </div>
          {token.description && <p className="text-gray-400 text-sm mb-2">{token.description}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Created by {token.creator?.username || shortenAddress(token.creator?.walletAddress || '')}</span>
            <span>•</span>
            <span>{timeAgo(token.createdAt)}</span>
          </div>
          <div className="flex gap-3 mt-2">
            {token.twitterUrl && (
              <a href={token.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">Twitter</a>
            )}
            {token.telegramUrl && (
              <a href={token.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">Telegram</a>
            )}
            {token.websiteUrl && (
              <a href={token.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">Website</a>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="hidden md:grid grid-cols-2 gap-4 text-right">
          <div>
            <p className="text-xs text-gray-500">Market Cap</p>
            <p className="text-white font-semibold">{formatSOL(token.marketCap)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-green-400 font-semibold">{token.price.toFixed(8)} SOL</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">24h Volume</p>
            <p className="text-white font-semibold">{formatSOL(token.volume24h)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trades</p>
            <p className="text-white font-semibold">{formatNumber(token._count?.trades || 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - trades and comments */}
        <div className="lg:col-span-2 space-y-6">
          <BondingCurveProgress token={token} />
          <TradeHistory tokenId={token.id} />
          <CommentSection tokenId={token.id} />
        </div>
        {/* Right column - trade panel */}
        <div>
          <TradePanel token={token} onTradeComplete={fetchToken} />
        </div>
      </div>
    </div>
  );
}
