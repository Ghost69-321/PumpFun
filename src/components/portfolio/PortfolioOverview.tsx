'use client';

import React from 'react';
import { PortfolioStats } from '@/types';
import { formatPercent, formatSol } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PortfolioOverviewProps {
  stats: PortfolioStats | null;
  loading?: boolean;
}

export function PortfolioOverview({ stats, loading }: PortfolioOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
            <div className="h-3 w-20 bg-surface-3 rounded mb-3" />
            <div className="h-6 w-24 bg-surface-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const isPnlPositive = stats.totalPnl >= 0;

  const statItems = [
    {
      label: 'Portfolio Value',
      value: formatSol(stats.totalValue),
      highlight: true,
    },
    {
      label: 'Total Invested',
      value: formatSol(stats.totalInvested),
      highlight: false,
    },
    {
      label: 'Total P&L',
      value: formatSol(Math.abs(stats.totalPnl)),
      prefix: isPnlPositive ? '+' : '-',
      positive: isPnlPositive,
      negative: !isPnlPositive,
    },
    {
      label: 'P&L %',
      value: formatPercent(stats.totalPnlPercent),
      positive: isPnlPositive,
      negative: !isPnlPositive,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-surface border border-border rounded-xl p-4"
        >
          <p className="text-text-muted text-xs mb-1">{item.label}</p>
          <p
            className={cn(
              'text-lg font-bold',
              item.highlight && 'text-white',
              item.positive && 'text-green',
              item.negative && 'text-red',
              !item.highlight && !item.positive && !item.negative && 'text-white'
            )}
          >
            {item.prefix}{item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
