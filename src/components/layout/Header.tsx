'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { WalletButton } from '@/components/auth/WalletButton';
import { SearchBar } from '@/components/feed/SearchBar';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-black font-black text-xs">P</span>
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">{APP_NAME}</span>
        </Link>

        {/* Search - Desktop */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors rounded-md hover:bg-surface-2"
          >
            Explore
          </Link>
          <Link
            href="/create"
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors rounded-md hover:bg-surface-2"
          >
            Launch
          </Link>
          {session?.user && (
            <Link
              href="/portfolio"
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors rounded-md hover:bg-surface-2"
            >
              Portfolio
            </Link>
          )}
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm text-yellow hover:text-yellow/80 transition-colors rounded-md hover:bg-surface-2"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          <WalletButton />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-1">
            <div className="pb-3">
              <SearchBar />
            </div>
            <Link
              href="/"
              className="block px-3 py-2 text-sm text-text-secondary hover:text-white rounded-md hover:bg-surface-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="block px-3 py-2 text-sm text-text-secondary hover:text-white rounded-md hover:bg-surface-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch Token
            </Link>
            {session?.user && (
              <Link
                href="/portfolio"
                className="block px-3 py-2 text-sm text-text-secondary hover:text-white rounded-md hover:bg-surface-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
