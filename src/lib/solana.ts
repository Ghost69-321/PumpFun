import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  clusterApiUrl('devnet');

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export function getPublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = getPublicKey(walletAddress);
    if (!pubkey) return 0;
    const balance = await connection.getBalance(pubkey);
    return balance / 1e9; // lamports to SOL
  } catch {
    return 0;
  }
}

export async function confirmTransaction(signature: string): Promise<boolean> {
  try {
    const result = await connection.confirmTransaction(signature, 'confirmed');
    return !result.value.err;
  } catch {
    return false;
  }
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
