import React from 'react';
import { notFound } from 'next/navigation';
import { TokenDetail } from '@/components/token/TokenDetail';
import prisma from '@/lib/prisma';
import { Token } from '@/types';

interface TokenPageProps {
  params: { id: string };
}

async function getToken(id: string): Promise<Token | null> {
  try {
    const token = await prisma.token.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            trades: true,
            comments: true,
            holdings: true,
          },
        },
      },
    });

    if (!token) return null;

    return {
      ...token,
      socialLinks: token.socialLinks as Token['socialLinks'],
      creator: token.creator as Token['creator'],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: TokenPageProps) {
  const token = await getToken(params.id);
  if (!token) return { title: 'Token Not Found' };

  return {
    title: `${token.name} ($${token.ticker}) | PumpFun`,
    description: token.description || `Trade ${token.name} on PumpFun`,
  };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const token = await getToken(params.id);

  if (!token) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <TokenDetail token={token} />
    </div>
  );
}
