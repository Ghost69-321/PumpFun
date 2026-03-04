import { z } from 'zod';

export const createTokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  ticker: z
    .string()
    .min(1, 'Ticker is required')
    .max(10, 'Ticker must be 10 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Ticker must be uppercase letters and numbers only')
    .transform((v) => v.toUpperCase()),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  socialLinks: z
    .object({
      twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
      telegram: z.string().url('Invalid Telegram URL').optional().or(z.literal('')),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
      discord: z.string().url('Invalid Discord URL').optional().or(z.literal('')),
    })
    .optional(),
  initialBuyAmount: z
    .number()
    .min(0, 'Initial buy amount must be non-negative')
    .max(10, 'Initial buy amount cannot exceed 10 SOL')
    .optional(),
});

export const tradeSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  type: z.enum(['BUY', 'SELL']),
  amountSol: z.number().positive('Amount must be positive').optional(),
  amountTokens: z.number().positive('Amount must be positive').optional(),
  slippage: z
    .number()
    .min(0.1, 'Slippage must be at least 0.1%')
    .max(50, 'Slippage cannot exceed 50%')
    .default(1),
});

export const commentSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less'),
  parentId: z.string().optional(),
});

export const tokenQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['newest', 'trending', 'marketcap', 'volume']).default('newest'),
  filter: z.enum(['all', 'active', 'graduated']).default('all'),
  search: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type TradeInput = z.infer<typeof tradeSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type TokenQueryInput = z.infer<typeof tokenQuerySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
