import React from 'react';
import { CreateTokenForm } from '@/components/token/CreateTokenForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launch a Token | PumpFun',
  description: 'Create and launch your own memecoin on Solana with a fair bonding curve',
};

export default function CreatePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          🚀 Launch a Token
        </h1>
        <p className="text-text-secondary">
          Create your own memecoin with a fair launch bonding curve.
          No pre-mine, no team allocation — just pure market dynamics.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-surface-2 border border-border rounded-xl p-4 mb-6">
        <h3 className="text-white font-semibold text-sm mb-3">How it works</h3>
        <div className="space-y-2">
          {[
            { step: '1', text: 'Fill in your token details and optionally buy some tokens' },
            { step: '2', text: 'Your token launches with a linear bonding curve' },
            { step: '3', text: 'Price increases as more people buy' },
            { step: '4', text: 'At 85 SOL raised, your token graduates to a DEX!' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-text-secondary text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <CreateTokenForm />
    </div>
  );
}
