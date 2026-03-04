'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress } from '@/lib/utils';

export function Header() {
  const { publicKey } = useWallet();

  return (
    <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-green-400">
            🚀 PumpFun
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/create" className="hover:text-white transition-colors">Create</Link>
            {publicKey && (
              <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {publicKey && (
            <span className="text-xs text-gray-500 hidden md:block">
              {shortenAddress(publicKey.toString())}
            </span>
          )}
          <WalletMultiButton className="!bg-green-500 hover:!bg-green-400 !text-black !font-semibold !text-sm !rounded-lg !h-9" />
        </div>
      </div>
    </header>
  );
}
