'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import type { TokenData } from '@/types';
import { PLATFORM_FEE_RATE, INITIAL_VIRTUAL_SOL_RESERVES, INITIAL_VIRTUAL_TOKEN_RESERVES } from '@/lib/constants';
import { calculateBuyTokens, calculateSellSol } from '@/lib/bonding-curve';

interface TradePanelProps {
  token: TokenData;
  onTradeComplete?: () => void;
}

export function TradePanel({ token, onTradeComplete }: TradePanelProps) {
  const { publicKey, connected } = useWallet();
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const bondingCurveState = {
    virtualSolReserves: INITIAL_VIRTUAL_SOL_RESERVES + token.reserveBalance,
    virtualTokenReserves: INITIAL_VIRTUAL_TOKEN_RESERVES - Number(token.currentSupply) / 1_000_000,
    realSolReserves: token.reserveBalance,
    realTokenReserves: 1_000_000_000 - Number(token.currentSupply) / 1_000_000,
    tokenTotalSupply: 1_000_000_000,
    complete: token.graduated,
  };

  const solAmount = parseFloat(amount) || 0;
  const buyEstimate = tradeType === 'BUY' ? calculateBuyTokens(solAmount * (1 - PLATFORM_FEE_RATE), bondingCurveState) : null;
  const sellEstimate = tradeType === 'SELL' ? calculateSellSol(solAmount, bondingCurveState) : null;

  async function handleTrade() {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: token.id,
          type: tradeType,
          solAmount: tradeType === 'BUY' ? parseFloat(amount) : undefined,
          tokenAmount: tradeType === 'SELL' ? parseFloat(amount) : undefined,
          walletAddress: publicKey.toString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Trade failed');

      toast.success(`${tradeType === 'BUY' ? 'Bought' : 'Sold'} successfully! Fee sent to treasury.`);
      setAmount('');
      onTradeComplete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Trade failed');
    } finally {
      setLoading(false);
    }
  }

  if (token.graduated) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 text-center">
        <p className="text-purple-400 font-semibold">🎓 Graduated to DEX</p>
        <p className="text-sm text-gray-500 mt-1">Trade on a DEX</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 sticky top-20">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTradeType('BUY')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tradeType === 'BUY' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType('SELL')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tradeType === 'SELL' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">
          {tradeType === 'BUY' ? 'SOL Amount' : `${token.symbol} Amount`}
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
          placeholder="0.0"
          min="0"
          step="0.01"
        />
      </div>

      {/* Trade estimate */}
      {amount && parseFloat(amount) > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">You receive (est.)</span>
            <span className="text-white">
              {tradeType === 'BUY' && buyEstimate
                ? `${buyEstimate.tokenAmount.toFixed(0)} ${token.symbol}`
                : sellEstimate
                ? `${(sellEstimate.solAmount * (1 - PLATFORM_FEE_RATE)).toFixed(4)} SOL`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Platform fee (1%)</span>
            <span className="text-yellow-400">
              {tradeType === 'BUY'
                ? `${(parseFloat(amount) * PLATFORM_FEE_RATE).toFixed(4)} SOL`
                : sellEstimate
                ? `${(sellEstimate.solAmount * PLATFORM_FEE_RATE).toFixed(4)} SOL`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Price impact</span>
            <span className={`${(buyEstimate?.priceImpact || sellEstimate?.priceImpact || 0) > 5 ? 'text-red-400' : 'text-green-400'}`}>
              {(buyEstimate?.priceImpact || sellEstimate?.priceImpact || 0).toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleTrade}
        disabled={loading || !connected || !amount}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
          tradeType === 'BUY'
            ? 'bg-green-500 hover:bg-green-400 text-black disabled:bg-gray-700 disabled:text-gray-500'
            : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-gray-700 disabled:text-gray-500'
        }`}
      >
        {loading ? 'Processing...' : !connected ? 'Connect Wallet' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${token.symbol}`}
      </button>

      <p className="text-xs text-gray-600 text-center mt-2">
        1% fee → treasury
      </p>
    </div>
  );
}
