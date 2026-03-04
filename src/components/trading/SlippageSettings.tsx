'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
} from '@/components/ui/dropdown-menu';
import { SLIPPAGE_PRESETS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SlippageSettingsProps {
  value: number;
  onChange: (value: number) => void;
}

export function SlippageSettings({ value, onChange }: SlippageSettingsProps) {
  const [custom, setCustom] = useState('');

  const handleCustomChange = (v: string) => {
    setCustom(v);
    const num = parseFloat(v);
    if (!isNaN(num) && num > 0 && num <= 50) {
      onChange(num);
    }
  };

  return (
    <DropdownMenu>
      <DropdownTrigger>
        <div className="flex items-center gap-1 text-xs text-text-secondary hover:text-white cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Slippage: {value}%
        </div>
      </DropdownTrigger>
      <DropdownContent align="right" className="p-3 w-48">
        <p className="text-text-muted text-xs mb-2">Slippage Tolerance</p>
        <div className="grid grid-cols-3 gap-1 mb-2">
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { onChange(preset); setCustom(''); }}
              className={cn(
                'py-1 text-xs rounded transition-colors',
                value === preset
                  ? 'bg-accent text-black font-bold'
                  : 'bg-surface-3 text-text-secondary hover:text-white'
              )}
            >
              {preset}%
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="50"
            placeholder="Custom"
            value={custom}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="flex-1 bg-surface-3 border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent"
          />
          <span className="text-text-muted text-xs">%</span>
        </div>
        {value > 5 && (
          <p className="text-yellow text-xs mt-2">⚠️ High slippage may result in unfavorable trades</p>
        )}
      </DropdownContent>
    </DropdownMenu>
  );
}
