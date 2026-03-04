import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculatePrice } from '@/lib/bonding-curve';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'trades') {
      // Return trade history
      const trades = await prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          token: {
            select: { id: true, name: true, ticker: true, imageUrl: true },
          },
        },
      });
      return NextResponse.json({ trades });
    }

    // Return full portfolio stats
    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id, amount: { gt: 0 } },
      include: {
        token: true,
      },
    });

    // Calculate portfolio stats
    let totalValue = 0;
    let totalInvested = 0;

    const holdingsWithValue = holdings.map((h) => {
      const currentPrice = calculatePrice(h.token.circulatingSupply);
      const currentValue = h.amount * currentPrice;
      const invested = h.amount * h.averageBuyPrice;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

      totalValue += currentValue;
      totalInvested += invested;

      return {
        ...h,
        token: {
          ...h.token,
          socialLinks: h.token.socialLinks,
        },
        currentValue,
        pnl,
        pnlPercent,
      };
    });

    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return NextResponse.json({
      totalValue,
      totalInvested,
      totalPnl,
      totalPnlPercent,
      holdings: holdingsWithValue,
    });
  } catch (error) {
    console.error('GET /api/portfolio error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
