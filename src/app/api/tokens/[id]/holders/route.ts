import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 20);

    const [holdings, total] = await Promise.all([
      prisma.holding.findMany({
        where: { tokenId: params.id, amount: { gt: 0 } },
        orderBy: { amount: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, walletAddress: true, username: true, avatar: true },
          },
        },
      }),
      prisma.holding.count({ where: { tokenId: params.id, amount: { gt: 0 } } }),
    ]);

    return NextResponse.json({
      items: holdings,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('GET /api/tokens/[id]/holders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
