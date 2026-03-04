'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { TokenModeration } from '@/components/admin/TokenModeration';
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/tabs';

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-text-secondary">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow/20 flex items-center justify-center">
          <span className="text-yellow text-sm">⚡</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-text-muted text-xs">Manage tokens and platform settings</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <Tabs defaultTab="dashboard">
          <TabList className="px-4">
            <TabTrigger value="dashboard">Dashboard</TabTrigger>
            <TabTrigger value="moderation">Token Moderation</TabTrigger>
          </TabList>

          <TabPanel value="dashboard" className="p-4">
            <AdminDashboard />
          </TabPanel>

          <TabPanel value="moderation" className="p-4">
            <TokenModeration />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
