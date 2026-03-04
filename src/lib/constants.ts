export const APP_NAME = 'PumpFun';
export const APP_DESCRIPTION = 'Launch and trade memecoins on Solana';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Treasury wallet — all platform fees are sent here
export const TREASURY_WALLET = 'CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw';
export const PLATFORM_WALLET_ADDRESS = TREASURY_WALLET;
export const PLATFORM_FEE_RATE = 0.01; // 1%

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Token constants
export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
export const GRADUATION_THRESHOLD_SOL = 85; // SOL to graduate to DEX
export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 100); // 1%
export const CREATE_TOKEN_FEE_SOL = 0.02; // Cost to create a token

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Chart timeframes
export const CHART_TIMEFRAMES = [
  { label: '1m', value: '1m', seconds: 60 },
  { label: '5m', value: '5m', seconds: 300 },
  { label: '15m', value: '15m', seconds: 900 },
  { label: '1h', value: '1h', seconds: 3600 },
  { label: '4h', value: '4h', seconds: 14400 },
  { label: '1d', value: '1d', seconds: 86400 },
] as const;

// Slippage presets
export const SLIPPAGE_PRESETS = [0.5, 1, 2, 5, 10];
export const DEFAULT_SLIPPAGE = 1; // 1%

// SSE
export const SSE_HEARTBEAT_INTERVAL = 15000; // 15 seconds

// Token image max size
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Colors
export const COLORS = {
  accent: '#00ff88',
  accentDim: '#00cc6a',
  green: '#00ff88',
  red: '#ff4444',
  yellow: '#ffaa00',
  blue: '#4488ff',
  background: '#0a0a0a',
  surface: '#111111',
  surface2: '#1a1a1a',
  border: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
} as const;

// Trending score weights
export const TRENDING_WEIGHTS = {
  recentTrades: 3,
  volume24h: 2,
  priceChange24h: 1,
  holders: 1,
} as const;
