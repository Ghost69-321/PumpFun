# PumpFun — Memecoin Launch Platform on Solana

A full-featured Pump.fun-style memecoin launch and trading platform built on Solana. Fair-launch bonding curve mechanics, real-time trading, TradingView-compatible charts, and wallet-based authentication.

![PumpFun Platform](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Solana](https://img.shields.io/badge/Solana-Web3.js-9945FF?style=flat-square&logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)

---

## Features

- 🚀 **Token Launch** — Anyone can launch a memecoin with a fair bonding curve (no pre-mine, no team allocation)
- 📈 **Linear Bonding Curve** — Price increases linearly as more tokens are purchased
- 🎓 **DEX Graduation** — Tokens automatically graduate to a DEX when 85 SOL is raised
- 💹 **Real-time Trading** — Server-Sent Events (SSE) push live trade updates to all connected clients
- 📊 **Price Charts** — Candlestick charts powered by `lightweight-charts` (TradingView library)
- 👛 **Wallet Auth** — Sign in with Phantom or Solflare via `@solana/wallet-adapter`
- 💼 **Portfolio** — Track holdings, P&L, and transaction history
- 💬 **Comments** — Token-specific threaded comment sections
- 🔒 **Admin Panel** — Moderate tokens, view platform stats
- 🌑 **Dark Theme** — Neon green accent on deep dark background

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 3 |
| Database ORM | Prisma 5 + PostgreSQL |
| Blockchain | Solana Web3.js + SPL Token |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Auth | NextAuth.js v4 (JWT + wallet credentials) |
| Charts | lightweight-charts v4 (TradingView) |
| Real-time | Server-Sent Events (SSE) |
| Validation | Zod |

---

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth handler
│   │   │   ├── tokens/        # Token CRUD + trades/comments/holders/chart
│   │   │   ├── trade/         # Execute buy/sell trades
│   │   │   ├── portfolio/     # User portfolio stats
│   │   │   ├── upload/        # Image upload
│   │   │   ├── admin/         # Admin endpoints
│   │   │   └── sse/           # Server-Sent Events stream
│   │   ├── token/[id]/        # Token detail page
│   │   ├── create/            # Token creation page
│   │   ├── profile/[address]/ # User profile page
│   │   ├── portfolio/         # Portfolio page
│   │   └── admin/             # Admin panel page
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── auth/              # Wallet connect, auth provider
│   │   ├── token/             # Token cards, detail, forms
│   │   ├── trading/           # Trade panel, charts, history
│   │   ├── feed/              # Token feed, search, trending bar
│   │   ├── portfolio/         # Portfolio components
│   │   ├── comments/          # Comment section & items
│   │   └── admin/             # Admin dashboard & moderation
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities, constants, Prisma client
│   └── types/                 # TypeScript types & interfaces
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Phantom or Solflare wallet (browser extension)

### 1. Clone and install

```bash
git clone https://github.com/your-org/pumpfun.git
cd pumpfun
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/pumpfun"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Solana RPC (use devnet for testing)
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Bonding Curve Mathematics

PumpFun uses a **linear bonding curve** where token price increases proportionally to the circulating supply.

### Price Formula

```
price(s) = BASE_PRICE + SLOPE × s

BASE_PRICE = 0.000001 SOL  (price at zero supply)
SLOPE      = 0.000000001 SOL/token  (price increase per token)
```

### Buy Cost (integral)

To buy `x` tokens from supply `s`:

```
cost = ∫[s to s+x] price(t) dt
     = BASE_PRICE × x + SLOPE × (s × x + x²/2)
```

### Tokens from SOL (quadratic formula)

Given `solIn` SOL to spend, solve for `x`:

```
(SLOPE/2) × x² + (BASE_PRICE + SLOPE × s) × x - solIn = 0
x = (-b + √(b² + 4 × (SLOPE/2) × solIn)) / (2 × SLOPE/2)
```

### Sell Proceeds

To sell `x` tokens from supply `s`:

```
proceeds = ∫[s-x to s] price(t) dt
         = BASE_PRICE × x + SLOPE × (s × x - x²/2)
```

### Graduation

When `solRaised ≥ 85 SOL`, the token graduates to a DEX. The token status changes to `GRADUATED` and trading stops on the bonding curve.

---

## API Reference

### Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tokens` | List tokens with pagination, sorting, filtering |
| POST | `/api/tokens` | Create a new token |
| GET | `/api/tokens/:id` | Get single token |
| GET | `/api/tokens/:id/trades` | Get trade history |
| GET | `/api/tokens/:id/comments` | Get comments |
| POST | `/api/tokens/:id/comments` | Post a comment |
| GET | `/api/tokens/:id/holders` | Get token holders |
| GET | `/api/tokens/:id/chart` | Get candlestick chart data |

### Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trade` | Execute a buy or sell trade |

### Portfolio & User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get user portfolio stats and holdings |
| POST | `/api/upload` | Upload token image |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin` | Get platform stats (admin only) |
| PATCH | `/api/admin` | Update token status (admin only) |

### Real-time (SSE)

| Endpoint | Description |
|----------|-------------|
| GET `/api/sse` | Server-Sent Events stream |

#### SSE Event Types

```typescript
'trade'        // New trade executed
'price_update' // Token price changed
'new_token'    // New token launched
'graduation'   // Token graduated to DEX
'comment'      // New comment posted
'heartbeat'    // Keep-alive ping (every 15s)
```

---

## Database Schema

```
User          → has many Tokens, Trades, Comments, Holdings, Notifications
Token         → has many Trades, Comments, Holdings, Candles
Trade         → belongs to Token, User
Comment       → belongs to Token, User; self-referential replies
Holding       → belongs to User, Token (unique per user+token)
Candle        → belongs to Token (unique per token+timeframe+timestamp)
Notification  → belongs to User
```

---

## Configuration

### Platform Fee

Set in `.env`:
```
NEXT_PUBLIC_PLATFORM_FEE_BPS=100  # 1% (100 basis points)
```

### Graduation Threshold

Change `GRADUATION_SOL` in `src/lib/bonding-curve.ts`:
```typescript
export const GRADUATION_SOL = 85; // SOL
```

### Token Supply

Change `TOTAL_SUPPLY` in `src/lib/constants.ts`:
```typescript
export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion
```

---

## 🚀 Deployment

### Vercel (recommended)

1. Push your repository to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Set the required environment variables (see `.env.production.example`):
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL (e.g. `https://your-domain.com`)
   - `NEXT_PUBLIC_SOLANA_RPC_URL` — a reliable mainnet RPC (Helius, QuickNode, etc.)
   - `NEXT_PUBLIC_SOLANA_NETWORK` — `mainnet-beta`
   - `PLATFORM_WALLET_ADDRESS` — `CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw`
4. Deploy. The build command in `vercel.json` runs `prisma generate` automatically.
5. Run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```

### Docker

```bash
# Start the platform with PostgreSQL and Redis
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

Edit `docker-compose.yml` to set a strong `NEXTAUTH_SECRET` and your production domain.

### Manual VPS (DigitalOcean, AWS EC2, etc.)

1. Install Node.js 20 and PostgreSQL on your server.
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-org/pumpfun.git
   cd pumpfun
   npm ci
   ```
3. Copy and edit the production env file:
   ```bash
   cp .env.production.example .env
   # Edit .env with your production values
   ```
4. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Build and start:
   ```bash
   npm run build
   npm start
   ```
   For process management use PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name pumpfun -- start
   ```
6. Set up Nginx as a reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
7. Obtain an SSL certificate with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## ✅ Production Launch Checklist

- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Set `NEXTAUTH_SECRET` to a strong random string
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Set `SOLANA_RPC_URL` to a reliable mainnet RPC (Helius, QuickNode, etc.)
- [ ] Verify `PLATFORM_WALLET_ADDRESS` is `CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw`
- [ ] Run database migrations (`npx prisma migrate deploy`)
- [ ] Test wallet connection on mainnet
- [ ] Test token creation flow
- [ ] Test buy/sell flow and verify fees arrive at treasury wallet
- [ ] Set up monitoring and error tracking

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

---

## Security Notes

- All trading endpoints require wallet authentication via NextAuth
- Admin endpoints verify `role === 'ADMIN'` from the JWT session
- File uploads are validated for type (image/*) and size (≤5MB)
- Slippage protection prevents trades exceeding user-defined price impact tolerance
- Prisma parameterized queries protect against SQL injection

---

## License

MIT


Coin launch platform - initializing repository.