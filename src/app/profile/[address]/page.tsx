import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatRelativeTime, shortenAddress } from '@/lib/utils';
import { TokenCard } from '@/components/token/TokenCard';
import { Token } from '@/types';

interface ProfilePageProps {
  params: Promise<{ address: string }>;
}

async function getProfile(address: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        tokens: {
          orderBy: { createdAt: 'desc' },
          take: 12,
          include: {
            creator: { select: { id: true, walletAddress: true, username: true } },
            _count: { select: { trades: true, comments: true, holdings: true } },
          },
        },
        _count: {
          select: { tokens: true, trades: true },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { address } = await params;
  return {
    title: `Profile ${shortenAddress(address)} | PumpFun`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { address } = await params;
  const user = await getProfile(address);

  if (!user) {
    notFound();
  }

  const displayName =
    user.username || shortenAddress(address, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-blue/30 border border-accent/20 flex items-center justify-center text-2xl font-bold text-accent shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-text-muted text-sm font-mono mt-0.5">{address}</p>
            <p className="text-text-muted text-xs mt-1">
              Joined {formatRelativeTime(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user._count.tokens}</p>
            <p className="text-text-muted text-xs">Tokens Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user._count.trades}</p>
            <p className="text-text-muted text-xs">Total Trades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{user.role}</p>
            <p className="text-text-muted text-xs">Role</p>
          </div>
        </div>
      </div>

      {/* Created tokens */}
      <h2 className="text-xl font-bold text-white mb-4">
        Tokens Created ({user._count.tokens})
      </h2>

      {user.tokens.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <p className="text-4xl mb-3">🪙</p>
          <p className="text-text-secondary">No tokens created yet</p>
          <Link href="/create" className="text-accent text-sm hover:underline mt-2 block">
            Launch the first token →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={{
                ...token,
                socialLinks: token.socialLinks as Token['socialLinks'],
                creator: token.creator as Token['creator'],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
