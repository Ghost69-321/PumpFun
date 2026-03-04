'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Token, TradeType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { SlippageSettings } from './SlippageSettings';
import { getBuyQuote, getSellQuote } from '@/lib/bonding-curve';
import { formatNumber, formatPrice } from '@/lib/utils';
import { DEFAULT_SLIPPAGE } from '@/lib/constants';

interface TradePanelProps {
  token: Token;
  onTradeComplete?: () => void;
}

export function TradePanel({ token, onTradeComplete }: TradePanelProps) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<{
    tokensOut?: number;
    solOut?: number;
    priceImpact: number;
    newPrice: number;
    fee: number;
  } | null>(null);

  // Recalculate quote on amount change
  useEffect(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setQuote(null);
      return;
    }

    if (tradeType === 'BUY') {
      const q = getBuyQuote(token.circulatingSupply, val);
      setQuote({
        tokensOut: q.tokensOut,
        priceImpact: q.priceImpact,
        newPrice: q.newPrice,
        fee: q.fee,
      });
    } else {
      const q = getSellQuote(token.circulatingSupply, val);
      setQuote({
        solOut: q.netSol,
        priceImpact: q.priceImpact,
        newPrice: q.newPrice,
        fee: q.fee,
      });
    }
  }, [amount, tradeType, token.circulatingSupply]);

  const quickAmounts =
    tradeType === 'BUY'
      ? ['0.1', '0.5', '1', '5']
      : ['25%', '50%', '75%', '100%'];

  const handleQuickAmount = (val: string) => {
    if (tradeType === 'BUY') {
      setAmount(val);
    } else {
      // For sell, handle percentage (would need holding data)
      setAmount(val.replace('%', ''));
    }
  };

  const handleTrade = async () => {
    if (!session) {
      toast({ type: 'error', title: 'Not connected', description: 'Connect your wallet to trade' });
      return;
    }

    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ type: 'error', title: 'Invalid amount', description: 'Enter a valid amount' });
      return;
    }

    setLoading(true);
    try {
      const body =
        tradeType === 'BUY'
          ? { tokenId: token.id, type: 'BUY', amountSol: val, slippage }
          : { tokenId: token.id, type: 'SELL', amountTokens: val, slippage };

      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ type: 'error', title: 'Trade failed', description: data.error });
        return;
      }

      toast({
        type: 'success',
        title: `${tradeType === 'BUY' ? '🟢 Bought' : '🔴 Sold'}`,
        description:
          tradeType === 'BUY'
            ? `${formatNumber(data.amountTokens)} ${token.ticker} for ${val} SOL`
            : `${formatNumber(val)} ${token.ticker} for ${formatPrice(data.amountSol)} SOL`,
      });

      setAmount('');
      setQuote(null);
      onTradeComplete?.();
    } catch {
      toast({ type: 'error', title: 'Error', description: 'Trade failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Trade {token.ticker}</h3>
          <SlippageSettings value={slippage} onChange={setSlippage} />
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Buy/Sell toggle */}
        <div className="flex bg-surface-3 rounded-lg p-1 gap-1">
          <button
            onClick={() => { setTradeType('BUY'); setAmount(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              tradeType === 'BUY'
                ? 'bg-green text-black'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => { setTradeType('SELL'); setAmount(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              tradeType === 'SELL'
                ? 'bg-red text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Amount input */}
        <div>
          <Input
            label={tradeType === 'BUY' ? 'Amount (SOL)' : `Amount (${token.ticker})`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            rightAddon={<span className="text-xs">{tradeType === 'BUY' ? 'SOL' : token.ticker}</span>}
          />

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickAmount(q)}
                className="py-1 text-xs bg-surface-3 hover:bg-surface-2 text-text-secondary hover:text-white rounded transition-colors border border-border"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Quote */}
        {quote && (
          <div className="bg-surface-3 rounded-lg p-3 space-y-2 text-xs">
            {quote.tokensOut !== undefined && (
              <div className="flex justify-between">
                <span className="text-text-muted">You receive</span>
                <span className="text-green font-medium">
                  ~{formatNumber(quote.tokensOut)} {token.ticker}
                </span>
              </div>
            )}
            {quote.solOut !== undefined && (
              <div className="flex justify-between">
                <span className="text-text-muted">You receive</span>
                <span className="text-green font-medium">
                  ~{formatPrice(quote.solOut)} SOL
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Price impact</span>
              <span className={quote.priceImpact > 5 ? 'text-red' : 'text-text-secondary'}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Fee (1%)</span>
              <span className="text-text-secondary">{quote.fee.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-text-muted">New price</span>
              <span className="text-white">{formatPrice(quote.newPrice)} SOL</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          variant={tradeType === 'BUY' ? 'success' : 'danger'}
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!session || !amount || parseFloat(amount) <= 0}
          onClick={handleTrade}
        >
          {!session
            ? '🔒 Connect Wallet'
            : tradeType === 'BUY'
            ? `Buy ${token.ticker}`
            : `Sell ${token.ticker}`}
        </Button>

        {!session && (
          <p className="text-text-muted text-xs text-center">
            Connect your wallet to start trading
          </p>
        )}
      </CardBody>
    </Card>
  );
}
