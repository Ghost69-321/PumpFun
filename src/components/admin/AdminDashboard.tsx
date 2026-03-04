'use client';

import React, { useEffect, useState } from 'react';
import { Trade } from '@/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalTokens: number;
  activeTokens: number;
  graduatedTokens: number;
  totalTrades: number;
  totalVolume: number;
  totalUsers: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin');
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentTrades) setRecentTrades(data.recentTrades);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
            <div className="h-3 w-20 bg-surface-3 rounded mb-3" />
            <div className="h-8 w-16 bg-surface-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Tokens', value: stats.totalTokens, color: 'text-white' },
            { label: 'Active Tokens', value: stats.activeTokens, color: 'text-accent' },
            { label: 'Graduated', value: stats.graduatedTokens, color: 'text-yellow' },
            { label: 'Total Trades', value: stats.totalTrades, color: 'text-white' },
            { label: 'Total Volume (SOL)', value: stats.totalVolume.toFixed(2), color: 'text-green' },
            { label: 'Total Users', value: stats.totalUsers, color: 'text-blue' },
          ].map((stat) => (
            <Card key={stat.label} variant="bordered">
              <CardBody>
                <p className="text-text-muted text-xs mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Recent trades */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="text-white font-semibold">Recent Trades</h3>
        </CardHeader>
        <CardBody className="p-0">
          {recentTrades.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No trades yet</p>
          ) : (
            <div className="divide-y divide-border">
              {recentTrades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Badge variant={trade.type === 'BUY' ? 'success' : 'danger'}>
                    {trade.type}
                  </Badge>
                  <span className="text-white flex-1">
                    {trade.token?.name || 'Unknown'} (${trade.token?.ticker})
                  </span>
                  <span className="text-text-secondary">{trade.amountSol.toFixed(4)} SOL</span>
                  <span className="text-text-muted text-xs">{formatRelativeTime(trade.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
