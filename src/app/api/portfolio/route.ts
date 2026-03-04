import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return NextResponse.json({ holdings: [], trades: [], totalValue: 0 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        token: {
          select: { id: true, name: true, symbol: true, imageUrl: true, mintAddress: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate holdings
    const holdingsMap = new Map<string, { tokenAmount: bigint; solSpent: number; token: typeof trades[0]['token'] }>();
    
    for (const trade of trades) {
      const existing = holdingsMap.get(trade.tokenId) || { tokenAmount: BigInt(0), solSpent: 0, token: trade.token };
      if (trade.type === 'BUY') {
        existing.tokenAmount += trade.tokenAmount;
        existing.solSpent += trade.solAmount;
      } else {
        existing.tokenAmount -= trade.tokenAmount;
        existing.solSpent -= trade.solAmount;
      }
      holdingsMap.set(trade.tokenId, existing);
    }

    const holdings = Array.from(holdingsMap.entries())
      .filter(([, h]) => h.tokenAmount > BigInt(0))
      .map(([tokenId, h]) => ({
        tokenId,
        token: h.token,
        balance: h.tokenAmount.toString(),
        solSpent: h.solSpent,
        currentValue: (Number(h.tokenAmount) / 1_000_000) * (h.token?.price || 0),
      }));

    return NextResponse.json({ holdings, trades, user });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
