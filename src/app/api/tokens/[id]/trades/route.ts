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

    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        where: { tokenId: params.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, walletAddress: true, username: true, avatar: true },
          },
        },
      }),
      prisma.trade.count({ where: { tokenId: params.id } }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('GET /api/tokens/[id]/trades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
