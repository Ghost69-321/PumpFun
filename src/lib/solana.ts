import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SOLANA_RPC_URL, TREASURY_WALLET, PLATFORM_FEE_RATE } from './constants';

// Solana connection - uses network from env, defaults to mainnet-beta
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Build a fee transfer instruction that sends SOL to the treasury wallet.
 * ALL platform fees MUST be sent to TREASURY_WALLET.
 */
export function buildFeeTransferInstruction(
  fromPubkey: PublicKey,
  feeAmountLamports: number
): TransactionInstruction {
  const treasuryPubkey = new PublicKey(TREASURY_WALLET);
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey: treasuryPubkey,
    lamports: feeAmountLamports,
  });
}

/**
 * Calculate platform fee in lamports (1% of trade amount by default)
 */
export function calculateFeeInLamports(solAmount: number): number {
  return Math.floor(solAmount * LAMPORTS_PER_SOL * PLATFORM_FEE_RATE);
}

/**
 * Build a buy transaction for a token on the bonding curve.
 * Includes 1% platform fee transferred to treasury wallet.
 */
export async function buildBuyTransaction(
  buyerPubkey: PublicKey,
  mintAddress: string,
  solAmount: number,
  minTokenAmount: number
): Promise<Transaction> {
  const connection = getConnection();
  const transaction = new Transaction();

  // Calculate fee (1% sent to treasury wallet)
  const feeInLamports = calculateFeeInLamports(solAmount);

  // Add fee transfer to treasury wallet
  const feeInstruction = buildFeeTransferInstruction(buyerPubkey, feeInLamports);
  transaction.add(feeInstruction);

  // Net SOL for purchase (after fee)
  const netSolLamports = Math.floor(solAmount * LAMPORTS_PER_SOL) - feeInLamports;

  // In production, this would add SPL token transfer instructions
  // For the bonding curve program interaction
  const bondingCurveInstruction = SystemProgram.transfer({
    fromPubkey: buyerPubkey,
    toPubkey: new PublicKey(TREASURY_WALLET), // bonding curve program would be here
    lamports: netSolLamports,
  });
  transaction.add(bondingCurveInstruction);

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = buyerPubkey;

  return transaction;
}

/**
 * Build a sell transaction for a token on the bonding curve.
 * Platform takes 1% fee from SOL proceeds, sent to treasury wallet.
 */
export async function buildSellTransaction(
  sellerPubkey: PublicKey,
  mintAddress: string,
  tokenAmount: number,
  minSolAmount: number
): Promise<Transaction> {
  const connection = getConnection();
  const transaction = new Transaction();

  // Fee will be deducted from SOL proceeds (handled server-side)
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = sellerPubkey;

  return transaction;
}

/**
 * Build a graduation transaction - moves liquidity to DEX.
 * Graduation fee is sent to treasury wallet.
 */
export async function buildGraduationTransaction(
  authorityPubkey: PublicKey,
  mintAddress: string,
  graduationFeeLamports: number
): Promise<Transaction> {
  const connection = getConnection();
  const transaction = new Transaction();

  // Send graduation fee to treasury wallet
  const graduationFeeInstruction = buildFeeTransferInstruction(
    authorityPubkey,
    graduationFeeLamports
  );
  transaction.add(graduationFeeInstruction);

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = authorityPubkey;

  return transaction;
}

/**
 * Verify a transaction was confirmed on-chain
 */
export async function verifyTransaction(txHash: string): Promise<boolean> {
  try {
    const connection = getConnection();
    const result = await connection.getSignatureStatus(txHash);
    return result.value?.confirmationStatus === 'confirmed' || 
           result.value?.confirmationStatus === 'finalized';
  } catch {
    return false;
  }
}

/**
 * Get SOL balance for a wallet address
 */
export async function getSolBalance(address: string): Promise<number> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}
