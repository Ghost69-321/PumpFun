# 🚀 PumpFun - Memecoin Launch Platform on Solana

A complete Pump.fun-style memecoin launch platform built with Next.js 14, Solana Web3.js, and a bonding curve AMM. Fair launches, no presales, no team allocations.

## ✨ Features

- **Fair Launch Bonding Curve** – Constant product AMM (x*y=k) with 85 SOL graduation threshold
- **Token Creation** – Launch any SPL token with metadata, image, and social links
- **Live Trading** – Buy/sell tokens against the bonding curve with real-time price updates
- **1% Platform Fee** – All fees routed to treasury wallet `CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw`
- **Graduation** – Tokens automatically graduate to a DEX at 85 SOL
- **Portfolio Tracking** – View holdings and trade history per wallet
- **Comments** – Community discussion per token
- **Trending Feed** – Real-time trending tokens bar

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS |
| Blockchain | Solana Web3.js, @solana/spl-token, @solana/wallet-adapter |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (wallet-based) |
| Charts | lightweight-charts |

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- A Solana wallet (Phantom recommended)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/PumpFun.git
cd PumpFun
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

Key environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `SOLANA_RPC_URL` | Solana RPC endpoint (server-side) |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint (client-side) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` or `devnet` |
| `PLATFORM_WALLET_ADDRESS` | Treasury: `CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw` |
| `PLATFORM_FEE_PERCENT` | Fee percentage (default: `1`) |
| `GRADUATION_THRESHOLD_SOL` | SOL to graduate (default: `85`) |

### 3. Database Setup
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.production.example`
4. Deploy

The `vercel.json` build command runs `npx prisma generate && next build` automatically.

### Docker

```bash
# Copy and fill in production env
cp .env.production.example .env

docker-compose up -d
```

Services started:
- **app** – Next.js on port 3000
- **db** – PostgreSQL 15 on port 5432
- **redis** – Redis 7 on port 6379

### VPS / Bare Metal

```bash
# Install dependencies
npm ci

# Generate Prisma client & run migrations
npx prisma migrate deploy
npx prisma generate

# Build
npm run build

# Start (use PM2 or systemd in production)
npm start
```

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── tokens/               # Token CRUD + trades/comments
│   │   ├── trade/                # Buy/sell execution
│   │   └── portfolio/            # Wallet portfolio
│   ├── token/[id]/               # Token detail page
│   ├── create/                   # Token creation page
│   ├── portfolio/                # Portfolio page
│   └── page.tsx                  # Home / explore page
├── components/
│   ├── layout/Header.tsx
│   ├── tokens/                   # TokenGrid, TokenCard, TokenDetail, CreateTokenForm
│   ├── trading/                  # TradePanel, TradeHistory
│   ├── comments/CommentSection
│   ├── feed/TrendingBar
│   └── portfolio/PortfolioOverview
├── lib/
│   ├── bonding-curve.ts          # AMM math (x*y=k)
│   ├── solana.ts                 # Solana helpers & fee instructions
│   ├── constants.ts              # Treasury wallet, fee rate, thresholds
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   └── utils.ts                  # Formatting helpers
├── types/index.ts
prisma/schema.prisma
```

---

## 💰 Fee Architecture

All platform fees are routed to the treasury wallet:

```
Treasury: CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw
Fee rate: 1% per trade (configurable via PLATFORM_FEE_PERCENT)
Graduation fee: 6 SOL (sent to treasury on DEX migration)
```

The fee is deducted from each trade before the net amount hits the bonding curve.

---

## ✅ Production Launch Checklist

- [ ] Set `NEXTAUTH_SECRET` to a strong random value (`openssl rand -base64 32`)
- [ ] Point `SOLANA_RPC_URL` / `NEXT_PUBLIC_SOLANA_RPC_URL` to a paid RPC (Helius, QuickNode, etc.)
- [ ] Set `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
- [ ] Verify `PLATFORM_WALLET_ADDRESS=CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw`
- [ ] Run `prisma migrate deploy` on the production database
- [ ] Configure HTTPS / SSL termination
- [ ] Set up database backups
- [ ] Monitor fee collection at treasury wallet

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Open a pull request

## 📄 License

MIT

Coin launch platform - initializing repository.