'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { HoldingsList } from '@/components/portfolio/HoldingsList';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/tabs';

export default function PortfolioPage() {
  const { data: session } = useSession();
  const { stats, loading } = usePortfolio();

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-text-secondary mb-6">
          Connect your Solana wallet to view your portfolio and transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Portfolio</h1>
        <p className="text-text-secondary text-sm">
          Track your memecoin holdings and trading history
        </p>
      </div>

      {/* Overview stats */}
      <PortfolioOverview stats={stats} loading={loading} />

      {/* Holdings & History tabs */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <Tabs defaultTab="holdings">
          <TabList className="px-4">
            <TabTrigger value="holdings">Holdings</TabTrigger>
            <TabTrigger value="history">Transaction History</TabTrigger>
          </TabList>

          <TabPanel value="holdings" className="p-4">
            <HoldingsList
              holdings={stats?.holdings || []}
              loading={loading}
            />
          </TabPanel>

          <TabPanel value="history" className="p-4">
            <TransactionHistory />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
