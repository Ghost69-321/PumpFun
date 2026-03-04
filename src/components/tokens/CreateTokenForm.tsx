'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Keypair } from '@solana/web3.js';

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  websiteUrl: string;
}

export function CreateTokenForm() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    twitterUrl: '',
    telegramUrl: '',
    websiteUrl: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const mintKeypair = Keypair.generate();
      const mintAddress = mintKeypair.publicKey.toString();

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mintAddress,
          creatorWallet: publicKey.toString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create token');
      }

      const token = await res.json();
      toast.success('Token created successfully!');
      router.push(`/token/${token.id}`);
    } catch (error) {
      console.error('Failed to create token:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create token');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Token Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            placeholder="e.g. PepeCoin"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Symbol *</label>
          <input
            name="symbol"
            value={form.symbol}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            placeholder="e.g. PEPE"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 resize-none"
          placeholder="Tell people about your token..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image URL</label>
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Twitter</label>
          <input
            name="twitterUrl"
            value={form.twitterUrl}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            placeholder="https://twitter.com/..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Telegram</label>
          <input
            name="telegramUrl"
            value={form.telegramUrl}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            placeholder="https://t.me/..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Website</label>
          <input
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !connected}
        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Creating...' : !connected ? 'Connect Wallet to Create' : 'Create Token'}
      </button>
    </form>
  );
}
