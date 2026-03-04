'use client';

import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { signIn } from 'next-auth/react';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { connected, publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  const handleSignIn = React.useCallback(async () => {
    if (!publicKey) return;

    try {
      const result = await signIn('wallet', {
        walletAddress: publicKey.toBase58(),
        redirect: false,
      });

      if (result?.ok) {
        toast({
          type: 'success',
          title: 'Connected!',
          description: `Wallet ${publicKey.toBase58().slice(0, 8)}... connected`,
        });
        onClose();
      } else {
        toast({
          type: 'error',
          title: 'Sign in failed',
          description: result?.error || 'Please try again',
        });
      }
    } catch {
      toast({
        type: 'error',
        title: 'Connection failed',
        description: 'Something went wrong. Please try again.',
      });
    }
  }, [publicKey, toast, onClose]);

  // When wallet connects, sign in with NextAuth
  useEffect(() => {
    if (connected && publicKey && open) {
      handleSignIn();
    }
  }, [connected, publicKey, open, handleSignIn]);

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const walletOptions = [
    {
      name: 'Phantom',
      icon: '👻',
      description: 'Popular Solana wallet',
    },
    {
      name: 'Solflare',
      icon: '🔥',
      description: 'Multi-platform Solana wallet',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Connect Wallet" size="sm">
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          Connect your Solana wallet to start trading memecoins on PumpFun.
        </p>

        <div className="space-y-2">
          {walletOptions.map((w) => (
            <button
              key={w.name}
              onClick={handleConnectWallet}
              className="w-full flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg hover:border-accent/30 hover:bg-surface-3 transition-all text-left"
            >
              <span className="text-2xl">{w.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{w.name}</p>
                <p className="text-text-muted text-xs">{w.description}</p>
              </div>
              <svg
                className="w-4 h-4 text-text-muted ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {connecting && (
          <div className="flex items-center justify-center gap-2 text-text-secondary text-sm py-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting...
          </div>
        )}

        <p className="text-text-muted text-xs text-center">
          By connecting, you agree to the terms of service.
          Make sure to only connect wallets you trust.
        </p>
      </div>
    </Dialog>
  );
}
