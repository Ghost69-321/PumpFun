import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE));
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      isFlagged: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { symbol: { contains: search, mode: 'insensitive' as const } },
          { mintAddress: { contains: search } },
        ],
      }),
    };

    const orderBy = sort === 'trending'
      ? { volume24h: 'desc' as const }
      : sort === 'marketcap'
      ? { marketCap: 'desc' as const }
      : { createdAt: 'desc' as const };

    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: {
            select: { id: true, username: true, walletAddress: true, avatar: true },
          },
          _count: {
            select: { trades: true, comments: true, holders: true },
          },
        },
      }),
      prisma.token.count({ where }),
    ]);

    return NextResponse.json({
      items: tokens,
      total,
      page,
      pageSize: limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, description, imageUrl, twitterUrl, telegramUrl, websiteUrl, mintAddress, creatorWallet } = body;

    if (!name || !symbol || !mintAddress || !creatorWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let creator = await prisma.user.findUnique({ where: { walletAddress: creatorWallet } });
    if (!creator) {
      creator = await prisma.user.create({
        data: {
          walletAddress: creatorWallet,
          username: `user_${creatorWallet.slice(0, 8)}`,
        },
      });
    }

    const token = await prisma.token.create({
      data: {
        mintAddress,
        name,
        symbol,
        description,
        imageUrl,
        twitterUrl,
        telegramUrl,
        websiteUrl,
        creatorId: creator.id,
        initialSupply: BigInt(1_000_000_000_000_000),
        currentSupply: BigInt(0),
        reserveBalance: 0,
        marketCap: 0,
        price: 0,
      },
      include: {
        creator: {
          select: { id: true, username: true, walletAddress: true, avatar: true },
        },
      },
    });

    return NextResponse.json(token, { status: 201 });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
