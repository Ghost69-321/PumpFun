import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { tradeSchema } from '@/lib/validators';
import {
  getBuyQuote,
  getSellQuote,
  calculatePrice,
  calculateMarketCap,
  GRADUATION_SOL,
} from '@/lib/bonding-curve';
import { TOTAL_SUPPLY } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = tradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { tokenId, type, amountSol, amountTokens, slippage } = parsed.data;

    // Fetch token
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    if (token.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Token is not available for trading' },
        { status: 400 }
      );
    }

    let actualAmountTokens: number;
    let actualAmountSol: number;
    let actualPrice: number;
    let newCirculatingSupply: number;

    if (type === 'BUY') {
      if (!amountSol || amountSol <= 0) {
        return NextResponse.json({ error: 'SOL amount required for buy' }, { status: 400 });
      }

      const quote = getBuyQuote(token.circulatingSupply, amountSol);
      actualAmountTokens = quote.tokensOut;
      actualAmountSol = amountSol;
      actualPrice = quote.newPrice;
      newCirculatingSupply = token.circulatingSupply + actualAmountTokens;

      // Slippage check: ensure price impact is within tolerance
      if (quote.priceImpact > slippage) {
        return NextResponse.json(
          { error: `Price impact ${quote.priceImpact.toFixed(2)}% exceeds slippage tolerance ${slippage}%` },
          { status: 400 }
        );
      }

      if (actualAmountTokens <= 0) {
        return NextResponse.json({ error: 'Amount too small' }, { status: 400 });
      }
    } else {
      // SELL
      if (!amountTokens || amountTokens <= 0) {
        return NextResponse.json({ error: 'Token amount required for sell' }, { status: 400 });
      }

      // Check user's holding
      const holding = await prisma.holding.findUnique({
        where: { userId_tokenId: { userId: session.user.id, tokenId } },
      });

      if (!holding || holding.amount < amountTokens) {
        return NextResponse.json({ error: 'Insufficient token balance' }, { status: 400 });
      }

      const quote = getSellQuote(token.circulatingSupply, amountTokens);
      actualAmountTokens = amountTokens;
      actualAmountSol = quote.netSol;
      actualPrice = calculatePrice(token.circulatingSupply - amountTokens);
      newCirculatingSupply = token.circulatingSupply - actualAmountTokens;

      if (quote.priceImpact > slippage) {
        return NextResponse.json(
          { error: `Price impact ${quote.priceImpact.toFixed(2)}% exceeds slippage tolerance ${slippage}%` },
          { status: 400 }
        );
      }
    }

    // Execute trade in a transaction
    const newPrice = calculatePrice(newCirculatingSupply);
    const newMarketCap = calculateMarketCap(newCirculatingSupply, TOTAL_SUPPLY);
    const newSolRaised =
      type === 'BUY'
        ? token.solRaised + actualAmountSol
        : token.solRaised - actualAmountSol;

    const result = await prisma.$transaction(async (tx) => {
      // Create trade record
      const trade = await tx.trade.create({
        data: {
          tokenId,
          userId: session.user.id,
          type,
          amountTokens: actualAmountTokens,
          amountSol: actualAmountSol,
          price: actualPrice,
        },
      });

      // Update token stats
      const updatedToken = await tx.token.update({
        where: { id: tokenId },
        data: {
          currentPrice: newPrice,
          marketCap: newMarketCap,
          circulatingSupply: newCirculatingSupply,
          solRaised: Math.max(0, newSolRaised),
          status:
            newSolRaised >= GRADUATION_SOL ? 'GRADUATED' : token.status,
        },
      });

      // Update user's holding
      if (type === 'BUY') {
        await tx.holding.upsert({
          where: { userId_tokenId: { userId: session.user.id, tokenId } },
          create: {
            userId: session.user.id,
            tokenId,
            amount: actualAmountTokens,
            averageBuyPrice: actualPrice,
          },
          update: {
            amount: { increment: actualAmountTokens },
            averageBuyPrice: actualPrice, // simplified avg
          },
        });
      } else {
        await tx.holding.update({
          where: { userId_tokenId: { userId: session.user.id, tokenId } },
          data: { amount: { decrement: actualAmountTokens } },
        });
      }

      // Update candle data
      const now = new Date();
      const timeframeMs = 5 * 60 * 1000; // 5 min default
      const candleTime = new Date(
        Math.floor(now.getTime() / timeframeMs) * timeframeMs
      );

      const existingCandle = await tx.candle.findUnique({
        where: {
          tokenId_timeframe_timestamp: {
            tokenId,
            timeframe: '5m',
            timestamp: candleTime,
          },
        },
      });

      if (existingCandle) {
        await tx.candle.update({
          where: {
            tokenId_timeframe_timestamp: {
              tokenId,
              timeframe: '5m',
              timestamp: candleTime,
            },
          },
          data: {
            high: Math.max(existingCandle.high, actualPrice),
            low: Math.min(existingCandle.low, actualPrice),
            close: actualPrice,
            volume: existingCandle.volume + actualAmountSol,
          },
        });
      } else {
        await tx.candle.create({
          data: {
            tokenId,
            timeframe: '5m',
            timestamp: candleTime,
            open: token.currentPrice,
            high: Math.max(token.currentPrice, actualPrice),
            low: Math.min(token.currentPrice, actualPrice),
            close: actualPrice,
            volume: actualAmountSol,
          },
        });
      }

      return { trade, token: updatedToken };
    });

    return NextResponse.json({
      ...result.trade,
      newPrice,
      newMarketCap,
    });
  } catch (error) {
    console.error('POST /api/trade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
