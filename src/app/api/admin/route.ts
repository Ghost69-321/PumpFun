import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalTokens, activeTokens, graduatedTokens, totalTrades, totalUsers, volumeResult] =
      await Promise.all([
        prisma.token.count(),
        prisma.token.count({ where: { status: 'ACTIVE' } }),
        prisma.token.count({ where: { status: 'GRADUATED' } }),
        prisma.trade.count(),
        prisma.user.count(),
        prisma.trade.aggregate({ _sum: { amountSol: true } }),
      ]);

    const recentTrades = await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        token: { select: { id: true, name: true, ticker: true } },
        user: { select: { id: true, walletAddress: true, username: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalTokens,
        activeTokens,
        graduatedTokens,
        totalTrades,
        totalVolume: volumeResult._sum.amountSol || 0,
        totalUsers,
      },
      recentTrades,
    });
  } catch (error) {
    console.error('GET /api/admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { tokenId, status } = body;

    if (!tokenId || !status) {
      return NextResponse.json({ error: 'tokenId and status required' }, { status: 400 });
    }

    if (!['ACTIVE', 'GRADUATED', 'FAILED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const token = await prisma.token.update({
      where: { id: tokenId },
      data: { status },
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error('PATCH /api/admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
