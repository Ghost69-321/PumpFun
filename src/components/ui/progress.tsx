'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  color?: 'accent' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  color = 'accent',
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    accent: 'bg-accent',
    green: 'bg-green',
    red: 'bg-red',
    yellow: 'bg-yellow',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-surface-3 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            percentage > 80 && 'animate-pulse-green',
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>{percentage.toFixed(1)}%</span>
          <span>{value.toFixed(2)} / {max}</span>
        </div>
      )}
    </div>
  );
}
