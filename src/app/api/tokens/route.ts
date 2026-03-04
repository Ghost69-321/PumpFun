import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { tokenQuerySchema, createTokenSchema } from '@/lib/validators';
import { calculatePrice, calculateMarketCap } from '@/lib/bonding-curve';
import { TOTAL_SUPPLY } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const parsed = tokenQuerySchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      sortBy: searchParams.get('sortBy'),
      filter: searchParams.get('filter'),
      search: searchParams.get('search'),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 });
    }

    const { page, pageSize, sortBy, filter, search } = parsed.data;

    const where: Record<string, unknown> = {};

    if (filter !== 'all') {
      where.status = filter === 'active' ? 'ACTIVE' : 'GRADUATED';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ticker: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string>[] = [];
    if (sortBy === 'newest') orderBy.push({ createdAt: 'desc' });
    else if (sortBy === 'marketcap') orderBy.push({ marketCap: 'desc' });
    else if (sortBy === 'volume') orderBy.push({ solRaised: 'desc' });
    else if (sortBy === 'trending') {
      // Sort by recent trade activity
      orderBy.push({ updatedAt: 'desc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const [items, total] = await Promise.all([
      prisma.token.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          creator: {
            select: { id: true, walletAddress: true, username: true, avatar: true },
          },
          _count: {
            select: { trades: true, comments: true, holdings: true },
          },
        },
      }),
      prisma.token.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('GET /api/tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, ticker, description, imageUrl, socialLinks, initialBuyAmount } = parsed.data;

    // Check if ticker already exists
    const existing = await prisma.token.findFirst({
      where: { ticker: ticker.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ticker $${ticker.toUpperCase()} already exists` },
        { status: 409 }
      );
    }

    const initialPrice = calculatePrice(0);
    const initialMarketCap = calculateMarketCap(0, TOTAL_SUPPLY);

    const token = await prisma.token.create({
      data: {
        name,
        ticker: ticker.toUpperCase(),
        description,
        imageUrl,
        socialLinks: socialLinks ?? {},
        creatorId: session.user.id,
        currentPrice: initialPrice,
        marketCap: initialMarketCap,
        totalSupply: TOTAL_SUPPLY,
        circulatingSupply: 0,
        solRaised: 0,
        status: 'ACTIVE',
      },
    });

    // If initial buy amount provided, execute the buy directly
    if (initialBuyAmount && initialBuyAmount > 0) {
      const { getBuyQuote, calculatePrice: calcPrice, calculateMarketCap: calcMC, GRADUATION_SOL } = await import('@/lib/bonding-curve');
      const quote = getBuyQuote(0, initialBuyAmount);

      if (quote.tokensOut > 0) {
        const newSupply = quote.tokensOut;
        const newPrice = calcPrice(newSupply);
        const newMarketCap = calcMC(newSupply, TOTAL_SUPPLY);

        await prisma.$transaction([
          prisma.trade.create({
            data: {
              tokenId: token.id,
              userId: session.user.id,
              type: 'BUY',
              amountTokens: quote.tokensOut,
              amountSol: initialBuyAmount,
              price: newPrice,
            },
          }),
          prisma.token.update({
            where: { id: token.id },
            data: {
              currentPrice: newPrice,
              marketCap: newMarketCap,
              circulatingSupply: newSupply,
              solRaised: initialBuyAmount,
              status: initialBuyAmount >= GRADUATION_SOL ? 'GRADUATED' : 'ACTIVE',
            },
          }),
          prisma.holding.create({
            data: {
              userId: session.user.id,
              tokenId: token.id,
              amount: quote.tokensOut,
              averageBuyPrice: newPrice,
            },
          }),
        ]);
      }
    }

    return NextResponse.json(token, { status: 201 });
  } catch (error) {
    console.error('POST /api/tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
