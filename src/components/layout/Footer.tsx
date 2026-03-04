import React from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                <span className="text-black font-black text-xs">P</span>
              </div>
              <span className="text-white font-bold">{APP_NAME}</span>
            </div>
            <p className="text-text-secondary text-sm max-w-xs">
              The premier platform for launching and trading memecoins on Solana.
              Fair launch, bonding curve mechanics, zero rug pulls.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent">Devnet</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-text-secondary text-sm hover:text-white transition-colors">
                  Explore Tokens
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-text-secondary text-sm hover:text-white transition-colors">
                  Launch Token
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-text-secondary text-sm hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary text-sm hover:text-white transition-colors"
                >
                  Solana Docs
                </a>
              </li>
              <li>
                <a
                  href="https://solscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary text-sm hover:text-white transition-colors"
                >
                  Solscan Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Trading memecoins involves significant risk. Only invest what you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
}
