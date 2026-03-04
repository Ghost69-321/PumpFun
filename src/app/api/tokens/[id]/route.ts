import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await prisma.token.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, walletAddress: true, username: true, avatar: true },
        },
        _count: {
          select: { trades: true, comments: true, holdings: true },
        },
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error('GET /api/tokens/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
