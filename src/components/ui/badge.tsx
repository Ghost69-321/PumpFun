'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-surface-3 text-text-secondary',
    success: 'bg-green/10 text-green border border-green/20',
    danger: 'bg-red/10 text-red border border-red/20',
    warning: 'bg-yellow/10 text-yellow border border-yellow/20',
    info: 'bg-blue/10 text-blue border border-blue/20',
    outline: 'bg-transparent text-text-secondary border border-border',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
