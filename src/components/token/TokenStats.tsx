'use client';

import React from 'react';
import { Token } from '@/types';
import { formatNumber, formatPrice } from '@/lib/utils';

interface TokenStatsProps {
  token: Token;
}

interface StatItemProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

function StatItem({ label, value, subValue, highlight }: StatItemProps) {
  return (
    <div className="bg-surface-2 rounded-lg p-3">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className={`font-semibold text-sm ${highlight ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
      {subValue && <p className="text-text-muted text-xs mt-0.5">{subValue}</p>}
    </div>
  );
}

export function TokenStats({ token }: TokenStatsProps) {
  const supplyPercent =
    token.totalSupply > 0
      ? ((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatItem
        label="Price"
        value={`${formatPrice(token.currentPrice)} SOL`}
        highlight
      />
      <StatItem
        label="Market Cap"
        value={`${formatNumber(token.marketCap)} SOL`}
      />
      <StatItem
        label="Total Supply"
        value={formatNumber(token.totalSupply, 0)}
        subValue="1B tokens"
      />
      <StatItem
        label="Circulating"
        value={formatNumber(token.circulatingSupply, 0)}
        subValue={`${supplyPercent}% of supply`}
      />
    </div>
  );
}
