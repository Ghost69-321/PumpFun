/**
 * Linear Bonding Curve Implementation
 *
 * Price formula: price = BASE_PRICE + SLOPE * circulatingSupply
 * This means price increases linearly as more tokens are bought.
 *
 * For buying X tokens starting from supply S:
 *   cost = integral from S to (S+X) of (BASE_PRICE + SLOPE * t) dt
 *        = BASE_PRICE * X + SLOPE * (S * X + X^2 / 2)
 *
 * For selling X tokens starting from supply S:
 *   proceeds = integral from (S-X) to S of (BASE_PRICE + SLOPE * t) dt
 *            = BASE_PRICE * X + SLOPE * (S * X - X^2 / 2)
 */

export const BASE_PRICE = 0.000001; // SOL per token at zero supply
export const SLOPE = 0.000000001; // SOL per token^2
export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 100); // 1%
export const GRADUATION_SOL = 85; // SOL needed to graduate

/**
 * Calculate the current price given circulating supply
 */
export function calculatePrice(circulatingSupply: number): number {
  return BASE_PRICE + SLOPE * circulatingSupply;
}

/**
 * Calculate SOL cost to buy a given number of tokens from current supply
 */
export function calculateBuyCost(
  circulatingSupply: number,
  tokensToBuy: number
): number {
  const s = circulatingSupply;
  const x = tokensToBuy;
  return BASE_PRICE * x + SLOPE * (s * x + (x * x) / 2);
}

/**
 * Calculate SOL received from selling a given number of tokens from current supply
 */
export function calculateSellProceeds(
  circulatingSupply: number,
  tokensToSell: number
): number {
  const s = circulatingSupply;
  const x = tokensToSell;
  return BASE_PRICE * x + SLOPE * (s * x - (x * x) / 2);
}

/**
 * Given a SOL amount, calculate how many tokens can be purchased.
 * Uses quadratic formula to solve:
 *   solIn = BASE_PRICE * x + SLOPE * (s * x + x^2 / 2)
 *   (SLOPE/2) * x^2 + (BASE_PRICE + SLOPE * s) * x - solIn = 0
 */
export function calculateTokensFromSol(
  circulatingSupply: number,
  solAmount: number
): number {
  const a = SLOPE / 2;
  const b = BASE_PRICE + SLOPE * circulatingSupply;
  const c = -solAmount;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;

  const tokens = (-b + Math.sqrt(discriminant)) / (2 * a);
  return Math.max(0, tokens);
}

/**
 * Calculate market cap at given circulating supply
 */
export function calculateMarketCap(
  circulatingSupply: number,
  totalSupply: number
): number {
  const currentPrice = calculatePrice(circulatingSupply);
  return currentPrice * totalSupply;
}

/**
 * Calculate graduation progress percentage
 */
export function calculateGraduationProgress(solRaised: number): number {
  return Math.min((solRaised / GRADUATION_SOL) * 100, 100);
}

/**
 * Apply platform fee to a SOL amount
 */
export function applyFee(solAmount: number): { net: number; fee: number } {
  const fee = (solAmount * PLATFORM_FEE_BPS) / 10000;
  return { net: solAmount - fee, fee };
}

/**
 * Get buy quote: how many tokens you get for a given SOL amount
 */
export function getBuyQuote(
  circulatingSupply: number,
  solIn: number
): {
  tokensOut: number;
  priceImpact: number;
  newPrice: number;
  fee: number;
  effectiveCost: number;
} {
  const { net: solAfterFee, fee } = applyFee(solIn);
  const tokensOut = calculateTokensFromSol(circulatingSupply, solAfterFee);
  const newSupply = circulatingSupply + tokensOut;
  const oldPrice = calculatePrice(circulatingSupply);
  const newPrice = calculatePrice(newSupply);
  const avgPrice = solAfterFee / tokensOut;
  const priceImpact = ((avgPrice - oldPrice) / oldPrice) * 100;

  return {
    tokensOut,
    priceImpact,
    newPrice,
    fee,
    effectiveCost: solIn,
  };
}

/**
 * Get sell quote: how much SOL you receive for selling tokens
 */
export function getSellQuote(
  circulatingSupply: number,
  tokensIn: number
): {
  solOut: number;
  priceImpact: number;
  newPrice: number;
  fee: number;
  netSol: number;
} {
  const grossSol = calculateSellProceeds(circulatingSupply, tokensIn);
  const { net: netSol, fee } = applyFee(grossSol);
  const newSupply = circulatingSupply - tokensIn;
  const newPrice = calculatePrice(newSupply);
  const oldPrice = calculatePrice(circulatingSupply);
  const avgPrice = grossSol / tokensIn;
  const priceImpact = ((oldPrice - avgPrice) / oldPrice) * 100;

  return {
    solOut: grossSol,
    priceImpact,
    newPrice,
    fee,
    netSol,
  };
}
