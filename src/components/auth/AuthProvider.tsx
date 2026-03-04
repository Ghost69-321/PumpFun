'use client';

import React, { useMemo } from 'react';
import { SessionProvider } from 'next-auth/react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ToastProvider } from '@/components/ui/toast';
import { SOLANA_RPC_URL } from '@/lib/constants';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Parameters<typeof SessionProvider>[0]['session'];
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <SessionProvider session={session}>
      <ConnectionProvider endpoint={SOLANA_RPC_URL}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ToastProvider>{children}</ToastProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SessionProvider>
  );
}
