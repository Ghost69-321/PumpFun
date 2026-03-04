import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { TokenGrid } from '@/components/tokens/TokenGrid';
import { TrendingBar } from '@/components/feed/TrendingBar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <TrendingBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading tokens...</div>}>
          <TokenGrid />
        </Suspense>
      </div>
    </main>
  );
}
