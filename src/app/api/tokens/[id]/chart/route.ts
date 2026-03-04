import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculatePrice } from '@/lib/bonding-curve';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '5m';

    // Fetch candles from DB
    const candles = await prisma.candle.findMany({
      where: { tokenId: id, timeframe },
      orderBy: { timestamp: 'asc' },
      take: 500,
    });

    // If no candles, generate synthetic candles from trades
    if (candles.length === 0) {
      const trades = await prisma.trade.findMany({
        where: { tokenId: id },
        orderBy: { createdAt: 'asc' },
      });

      if (trades.length > 0) {
        // Generate candles from trade data
        const timeframeMs = getTimeframeMs(timeframe);
        const candleMap = new Map<number, {
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
          timestamp: Date;
        }>();

        for (const trade of trades) {
          const bucket = Math.floor(trade.createdAt.getTime() / timeframeMs) * timeframeMs;
          const existing = candleMap.get(bucket);

          if (existing) {
            existing.high = Math.max(existing.high, trade.price);
            existing.low = Math.min(existing.low, trade.price);
            existing.close = trade.price;
            existing.volume += trade.amountSol;
          } else {
            candleMap.set(bucket, {
              open: trade.price,
              high: trade.price,
              low: trade.price,
              close: trade.price,
              volume: trade.amountSol,
              timestamp: new Date(bucket),
            });
          }
        }

        const syntheticCandles = Array.from(candleMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([, c]) => c);

        return NextResponse.json({ candles: syntheticCandles, synthetic: true });
      }

      // Generate flat candle from current token state
      const token = await prisma.token.findUnique({ where: { id } });
      if (token) {
        const price = token.currentPrice || calculatePrice(0);
        const now = Date.now();
        const syntheticCandles = Array.from({ length: 10 }, (_, i) => ({
          open: price,
          high: price * 1.001,
          low: price * 0.999,
          close: price,
          volume: 0,
          timestamp: new Date(now - (10 - i) * getTimeframeMs(timeframe)),
        }));
        return NextResponse.json({ candles: syntheticCandles, synthetic: true });
      }
    }

    return NextResponse.json({ candles });
  } catch (error) {
    console.error('GET /api/tokens/[id]/chart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getTimeframeMs(timeframe: string): number {
  const map: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };
  return map[timeframe] || map['5m'];
}
