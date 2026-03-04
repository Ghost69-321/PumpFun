'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className, fallback }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const pixelSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden shrink-0', sizes[size], className)}>
        <Image
          src={src}
          alt={alt}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  // Fallback: show initials or default icon
  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt?.slice(0, 2).toUpperCase() || '??';

  return (
    <div
      className={cn(
        'rounded-full shrink-0 flex items-center justify-center font-bold',
        'bg-gradient-to-br from-accent/30 to-blue/30 text-accent border border-accent/20',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
