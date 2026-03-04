'use client';

import { useState, useCallback } from 'react';
import {
  calculatePrice,
  calculateMarketCap,
  calculateGraduationProgress,
  getBuyQuote,
  getSellQuote,
  GRADUATION_SOL,
} from '@/lib/bonding-curve';
import { BondingCurveState, TradeQuote } from '@/types';

export function useBondingCurve(
  circulatingSupply: number,
  totalSupply: number,
  solRaised: number
) {
  const currentPrice = calculatePrice(circulatingSupply);
  const marketCap = calculateMarketCap(circulatingSupply, totalSupply);
  const progressPercent = calculateGraduationProgress(solRaised);

  const state: BondingCurveState = {
    currentPrice,
    circulatingSupply,
    totalSupply,
    solRaised,
    progressPercent,
    marketCap,
  };

  const getQuote = useCallback(
    (type: 'BUY' | 'SELL', amount: number): TradeQuote | null => {
      if (!amount || amount <= 0) return null;

      if (type === 'BUY') {
        const q = getBuyQuote(circulatingSupply, amount);
        return {
          tokensOut: q.tokensOut,
          priceImpact: q.priceImpact,
          newPrice: q.newPrice,
          fee: q.fee,
        };
      } else {
        const q = getSellQuote(circulatingSupply, amount);
        return {
          solOut: q.netSol,
          priceImpact: q.priceImpact,
          newPrice: q.newPrice,
          fee: q.fee,
        };
      }
    },
    [circulatingSupply]
  );

  const isNearGraduation = progressPercent >= 80;
  const isGraduated = solRaised >= GRADUATION_SOL;
  const remainingToGraduation = Math.max(0, GRADUATION_SOL - solRaised);

  return {
    state,
    getQuote,
    isNearGraduation,
    isGraduated,
    remainingToGraduation,
  };
}
