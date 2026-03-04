import Link from 'next/link';
import Image from 'next/image';
import type { TokenData } from '@/types';
import { formatSOL, timeAgo, shortenAddress } from '@/lib/utils';
import { GRADUATION_THRESHOLD_SOL } from '@/lib/constants';

interface TokenCardProps {
  token: TokenData;
}

export function TokenCard({ token }: TokenCardProps) {
  const progress = Math.min((token.reserveBalance / GRADUATION_THRESHOLD_SOL) * 100, 100);

  return (
    <Link href={`/token/${token.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 hover:bg-gray-800 transition-all cursor-pointer">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
            {token.imageUrl ? (
              <Image
                src={token.imageUrl}
                alt={token.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🪙</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">{token.name}</span>
              {token.graduated && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">🎓</span>
              )}
            </div>
            <span className="text-xs text-gray-400">${token.symbol}</span>
          </div>
        </div>

        {token.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{token.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Market Cap</span>
            <span className="text-white">{formatSOL(token.marketCap)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Price</span>
            <span className="text-green-400">{token.price.toFixed(8)} SOL</span>
          </div>

          {!token.graduated && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Bonding curve</span>
                <span className="text-gray-400">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-green-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
          <span>by {token.creator?.username || shortenAddress(token.creator?.walletAddress || '', 4)}</span>
          <span>{timeAgo(token.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
