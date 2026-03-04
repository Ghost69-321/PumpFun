import { INITIAL_VIRTUAL_SOL_RESERVES, INITIAL_VIRTUAL_TOKEN_RESERVES, INITIAL_TOKEN_SUPPLY } from './constants';

export interface BondingCurveState {
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;
  tokenTotalSupply: number;
  complete: boolean;
}

/**
 * Calculate tokens received for a given SOL input (buy)
 */
export function calculateBuyTokens(
  solAmount: number,
  state: BondingCurveState
): { tokenAmount: number; newPrice: number; priceImpact: number } {
  if (solAmount <= 0) return { tokenAmount: 0, newPrice: state.virtualSolReserves / state.virtualTokenReserves, priceImpact: 0 };

  const { virtualSolReserves, virtualTokenReserves } = state;
  
  // constant product formula: k = virtualSolReserves * virtualTokenReserves
  const k = virtualSolReserves * virtualTokenReserves;
  const newVirtualSolReserves = virtualSolReserves + solAmount;
  const newVirtualTokenReserves = k / newVirtualSolReserves;
  const tokenAmount = virtualTokenReserves - newVirtualTokenReserves;

  const oldPrice = virtualSolReserves / virtualTokenReserves;
  const newPrice = newVirtualSolReserves / newVirtualTokenReserves;
  const priceImpact = ((newPrice - oldPrice) / oldPrice) * 100;

  return { tokenAmount, newPrice, priceImpact };
}

/**
 * Calculate SOL received for a given token input (sell)
 */
export function calculateSellSol(
  tokenAmount: number,
  state: BondingCurveState
): { solAmount: number; newPrice: number; priceImpact: number } {
  if (tokenAmount <= 0) return { solAmount: 0, newPrice: state.virtualSolReserves / state.virtualTokenReserves, priceImpact: 0 };

  const { virtualSolReserves, virtualTokenReserves } = state;
  
  const k = virtualSolReserves * virtualTokenReserves;
  const newVirtualTokenReserves = virtualTokenReserves + tokenAmount;
  const newVirtualSolReserves = k / newVirtualTokenReserves;
  const solAmount = virtualSolReserves - newVirtualSolReserves;

  const oldPrice = virtualSolReserves / virtualTokenReserves;
  const newPrice = newVirtualSolReserves / newVirtualTokenReserves;
  const priceImpact = ((oldPrice - newPrice) / oldPrice) * 100;

  return { solAmount, newPrice, priceImpact };
}

/**
 * Get current price in SOL per token
 */
export function getCurrentPrice(state: BondingCurveState): number {
  return state.virtualSolReserves / state.virtualTokenReserves;
}

/**
 * Get market cap in SOL
 */
export function getMarketCap(state: BondingCurveState): number {
  return getCurrentPrice(state) * INITIAL_TOKEN_SUPPLY;
}

/**
 * Get bonding curve progress as percentage toward graduation
 */
export function getGraduationProgress(realSolReserves: number, graduationThreshold: number): number {
  return Math.min((realSolReserves / graduationThreshold) * 100, 100);
}

/**
 * Initialize a new bonding curve state
 */
export function initializeBondingCurve(): BondingCurveState {
  return {
    virtualSolReserves: INITIAL_VIRTUAL_SOL_RESERVES,
    virtualTokenReserves: INITIAL_VIRTUAL_TOKEN_RESERVES,
    realSolReserves: 0,
    realTokenReserves: INITIAL_TOKEN_SUPPLY,
    tokenTotalSupply: INITIAL_TOKEN_SUPPLY,
    complete: false,
  };
}
