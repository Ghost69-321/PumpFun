import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TREASURY_WALLET, PLATFORM_FEE_RATE, GRADUATION_THRESHOLD_SOL, INITIAL_VIRTUAL_SOL_RESERVES, INITIAL_VIRTUAL_TOKEN_RESERVES } from '@/lib/constants';
import { calculateBuyTokens, calculateSellSol } from '@/lib/bonding-curve';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, type, solAmount, tokenAmount, walletAddress, txHash } = body;

    if (!tokenId || !type || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type !== 'BUY' && type !== 'SELL') {
      return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 });
    }

    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.graduated) {
      return NextResponse.json({ error: 'Token has graduated to DEX' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
        },
      });
    }

    // Build current bonding curve state
    const bondingCurveState = {
      virtualSolReserves: INITIAL_VIRTUAL_SOL_RESERVES + token.reserveBalance,
      virtualTokenReserves: INITIAL_VIRTUAL_TOKEN_RESERVES - Number(token.currentSupply) / 1_000_000,
      realSolReserves: token.reserveBalance,
      realTokenReserves: 1_000_000_000 - Number(token.currentSupply) / 1_000_000,
      tokenTotalSupply: 1_000_000_000,
      complete: token.graduated,
    };

    let tradeTokenAmount: number;
    let tradeSolAmount: number;
    let newPrice: number;

    if (type === 'BUY') {
      // For BUY: fee is deducted from incoming SOL before entering the curve
      const feeAmountBuy = (solAmount || 0) * PLATFORM_FEE_RATE;
      const netAmount = (solAmount || 0) - feeAmountBuy;
      const result = calculateBuyTokens(netAmount, bondingCurveState);
      tradeTokenAmount = result.tokenAmount;
      tradeSolAmount = solAmount || 0;
      newPrice = result.newPrice;

      // Update token reserve with net (post-fee) SOL
      const newReserveBalance = token.reserveBalance + netAmount;
      const newCurrentSupply = BigInt(token.currentSupply) + BigInt(Math.floor(tradeTokenAmount * 1_000_000));
      const newMarketCap = newPrice * 1_000_000_000;
      const shouldGraduate = newReserveBalance >= GRADUATION_THRESHOLD_SOL && !token.graduated;

      const trade = await prisma.trade.create({
        data: {
          tokenId,
          userId: user.id,
          type: 'BUY',
          solAmount: tradeSolAmount,
          tokenAmount: BigInt(Math.floor(tradeTokenAmount * 1_000_000)),
          price: newPrice,
          fee: feeAmountBuy,
          txHash,
        },
      });

      await prisma.token.update({
        where: { id: tokenId },
        data: {
          reserveBalance: Math.max(0, newReserveBalance),
          currentSupply: newCurrentSupply < BigInt(0) ? BigInt(0) : newCurrentSupply,
          price: newPrice,
          marketCap: newMarketCap,
          ...(shouldGraduate && { graduated: true, graduatedAt: new Date() }),
        },
      });

      return NextResponse.json({
        trade,
        treasuryWallet: TREASURY_WALLET,
        feeAmount: feeAmountBuy,
        graduated: shouldGraduate,
      });
    } else {
      // For SELL: calculate gross SOL out, then deduct fee
      const result = calculateSellSol(tokenAmount, bondingCurveState);
      const sellFee = result.solAmount * PLATFORM_FEE_RATE;
      tradeSolAmount = result.solAmount - sellFee;
      tradeTokenAmount = tokenAmount;
      newPrice = result.newPrice;

      const newReserveBalance = token.reserveBalance - result.solAmount;
      const newCurrentSupply = BigInt(token.currentSupply) - BigInt(Math.floor(tradeTokenAmount * 1_000_000));
      const newMarketCap = newPrice * 1_000_000_000;

      const trade = await prisma.trade.create({
        data: {
          tokenId,
          userId: user.id,
          type: 'SELL',
          solAmount: tradeSolAmount,
          tokenAmount: BigInt(Math.floor(tradeTokenAmount * 1_000_000)),
          price: newPrice,
          fee: sellFee,
          txHash,
        },
      });

      await prisma.token.update({
        where: { id: tokenId },
        data: {
          reserveBalance: Math.max(0, newReserveBalance),
          currentSupply: newCurrentSupply < BigInt(0) ? BigInt(0) : newCurrentSupply,
          price: newPrice,
          marketCap: newMarketCap,
        },
      });

      return NextResponse.json({
        trade,
        treasuryWallet: TREASURY_WALLET,
        feeAmount: sellFee,
        graduated: false,
      });
    }
  } catch (error) {
    console.error('Error processing trade:', error);
    return NextResponse.json({ error: 'Failed to process trade' }, { status: 500 });
  }
}
