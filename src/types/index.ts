export type Role = 'USER' | 'ADMIN';
export type TokenStatus = 'ACTIVE' | 'GRADUATED' | 'FAILED';
export type TradeType = 'BUY' | 'SELL';

export interface User {
  id: string;
  walletAddress?: string | null;
  email?: string | null;
  username?: string | null;
  avatar?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  name?: string | null;
  image?: string | null;
}

export interface SocialLinks {
  twitter?: string;
  telegram?: string;
  website?: string;
  discord?: string;
}

export interface Token {
  id: string;
  name: string;
  ticker: string;
  description?: string | null;
  imageUrl?: string | null;
  creatorId: string;
  mintAddress?: string | null;
  bondingCurveAddress?: string | null;
  currentPrice: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  status: TokenStatus;
  graduationThreshold: number;
  solRaised: number;
  socialLinks?: SocialLinks | null;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
  _count?: {
    trades: number;
    comments: number;
    holdings: number;
  };
}

export interface Trade {
  id: string;
  tokenId: string;
  userId: string;
  type: TradeType;
  amountTokens: number;
  amountSol: number;
  price: number;
  txSignature?: string | null;
  createdAt: Date;
  user?: Pick<User, 'id' | 'walletAddress' | 'username' | 'avatar'>;
  token?: Pick<Token, 'id' | 'name' | 'ticker' | 'imageUrl'>;
}

export interface Comment {
  id: string;
  tokenId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  createdAt: Date;
  user?: Pick<User, 'id' | 'walletAddress' | 'username' | 'avatar'>;
  replies?: Comment[];
}

export interface Holding {
  id: string;
  userId: string;
  tokenId: string;
  amount: number;
  averageBuyPrice: number;
  updatedAt: Date;
  token?: Token;
  user?: User;
}

export interface Candle {
  id: string;
  tokenId: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown> | null;
  createdAt: Date;
}

// API response types
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

// Trade form types
export interface TradeFormData {
  tokenId: string;
  type: TradeType;
  amountSol?: number;
  amountTokens?: number;
  slippage: number;
}

// Token creation form
export interface CreateTokenFormData {
  name: string;
  ticker: string;
  description?: string;
  imageUrl?: string;
  socialLinks?: SocialLinks;
  initialBuyAmount?: number;
}

// Bonding curve types
export interface BondingCurveState {
  currentPrice: number;
  circulatingSupply: number;
  totalSupply: number;
  solRaised: number;
  progressPercent: number;
  marketCap: number;
}

export interface TradeQuote {
  tokensOut?: number;
  solOut?: number;
  priceImpact: number;
  newPrice: number;
  fee: number;
}

// SSE event types
export type SSEEventType =
  | 'trade'
  | 'price_update'
  | 'new_token'
  | 'graduation'
  | 'comment'
  | 'heartbeat';

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
  timestamp: number;
}

export interface TradeSSEEvent {
  type: 'trade';
  data: {
    tokenId: string;
    tradeType: TradeType;
    amountSol: number;
    amountTokens: number;
    price: number;
    user: string;
    newMarketCap: number;
    newPrice: number;
  };
  timestamp: number;
}

// Chart types
export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number;
}

// Portfolio types
export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdings: HoldingWithValue[];
}

export interface HoldingWithValue extends Holding {
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

// Filter/sort types
export type TokenSortBy = 'newest' | 'trending' | 'marketcap' | 'volume';
export type TokenFilter = 'all' | 'active' | 'graduated';

export interface TokenQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: TokenSortBy;
  filter?: TokenFilter;
  search?: string;
}
