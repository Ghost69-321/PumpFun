'use client';

import { Header } from '@/components/layout/Header';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Portfolio</h1>
        <PortfolioOverview />
      </div>
    </main>
  );
}
