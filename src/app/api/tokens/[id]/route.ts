import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await prisma.token.findFirst({
      where: {
        OR: [
          { id: params.id },
          { mintAddress: params.id },
        ],
      },
      include: {
        creator: {
          select: { id: true, username: true, walletAddress: true, avatar: true },
        },
        _count: {
          select: { trades: true, comments: true, holders: true },
        },
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
