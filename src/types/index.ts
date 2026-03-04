export interface TokenData {
  id: string;
  mintAddress: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  creatorId: string;
  creator?: {
    id: string;
    username?: string;
    walletAddress?: string;
    avatar?: string;
  };
  initialSupply: string;
  currentSupply: string;
  reserveBalance: number;
  marketCap: number;
  price: number;
  volume24h: number;
  graduated: boolean;
  graduatedAt?: string;
  isActive: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trades: number;
    comments: number;
    holders: number;
  };
}

export interface TradeData {
  id: string;
  tokenId: string;
  token?: {
    id: string;
    name: string;
    symbol: string;
    imageUrl?: string;
    mintAddress: string;
  };
  userId: string;
  user?: {
    id: string;
    username?: string;
    walletAddress?: string;
    avatar?: string;
  };
  type: 'BUY' | 'SELL';
  solAmount: number;
  tokenAmount: string;
  price: number;
  fee: number;
  txHash?: string;
  createdAt: string;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BondingCurveData {
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;
  progress: number;
  currentPrice: number;
  marketCap: number;
}

export interface UserProfile {
  id: string;
  walletAddress?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  _count?: {
    tokens: number;
    trades: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
