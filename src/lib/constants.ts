// Treasury wallet - ALL platform fees are sent to this address
export const TREASURY_WALLET = 'CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw';
export const PLATFORM_WALLET_ADDRESS = 'CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw';

// Platform fee configuration
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 1;
export const PLATFORM_FEE_RATE = PLATFORM_FEE_PERCENT / 100; // 0.01 = 1%

// Graduation threshold
export const GRADUATION_THRESHOLD_SOL = Number(process.env.GRADUATION_THRESHOLD_SOL) || 85;
export const GRADUATION_FEE_SOL = 6; // SOL fee on graduation

// Token supply
export const INITIAL_TOKEN_SUPPLY = 1_000_000_000; // 1 billion tokens
export const DECIMALS = 6;

// Solana network - defaults to mainnet-beta for production
export const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta') as 'mainnet-beta' | 'devnet' | 'testnet';

// RPC endpoints
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 
  (SOLANA_NETWORK === 'mainnet-beta' 
    ? 'https://api.mainnet-beta.solana.com'
    : `https://api.${SOLANA_NETWORK}.solana.com`);

export const NEXT_PUBLIC_SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  (SOLANA_NETWORK === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : `https://api.${SOLANA_NETWORK}.solana.com`);

// Bonding curve parameters
export const INITIAL_VIRTUAL_SOL_RESERVES = 30; // SOL
export const INITIAL_VIRTUAL_TOKEN_RESERVES = 1_073_000_191; // tokens

// Upload limits
export const MAX_UPLOAD_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB) || 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
