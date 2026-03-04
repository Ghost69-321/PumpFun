'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui/dropdown-menu';
import { shortenAddress } from '@/lib/utils';
import { LoginModal } from './LoginModal';
import Link from 'next/link';

export function WalletButton() {
  const { data: session } = useSession();
  const { connected, publicKey, disconnect } = useWallet();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleDisconnect = async () => {
    await disconnect();
    await signOut({ redirect: false });
  };

  if (session?.user?.walletAddress) {
    const address = session.user.walletAddress;
    const displayName =
      session.user.name && !session.user.name.startsWith('user_')
        ? session.user.name
        : shortenAddress(address);

    return (
      <>
        <DropdownMenu>
          <DropdownTrigger>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-accent/30 transition-colors cursor-pointer">
              <Avatar
                src={session.user.image}
                alt={displayName}
                fallback={address}
                size="xs"
              />
              <span className="text-sm text-white hidden sm:block">{displayName}</span>
              <svg
                className="w-4 h-4 text-text-secondary hidden sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </DropdownTrigger>
          <DropdownContent align="right">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-text-muted">Connected wallet</p>
              <p className="text-sm text-white font-mono">{shortenAddress(address, 6)}</p>
            </div>
            <Link href={`/profile/${address}`}>
              <DropdownItem>Profile</DropdownItem>
            </Link>
            <Link href="/portfolio">
              <DropdownItem>Portfolio</DropdownItem>
            </Link>
            <DropdownSeparator />
            <DropdownItem danger onClick={handleDisconnect}>
              Disconnect
            </DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setLoginOpen(true)}
        className="shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Connect
      </Button>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
