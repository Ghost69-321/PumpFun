'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
});

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { setOpen, open } = useContext(DropdownMenuContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(!open),
    });
  }

  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn('flex items-center gap-1', className)}
    >
      {children}
    </button>
  );
}

interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function DropdownContent({ children, className, align = 'left' }: DropdownContentProps) {
  const { open } = useContext(DropdownMenuContext);

  if (!open) return null;

  const alignClass = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'absolute top-full mt-1 z-50 min-w-[160px] bg-surface-2 border border-border',
        'rounded-lg shadow-xl py-1 animate-fade-in',
        alignClass[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({ children, danger, className, onClick, ...props }: DropdownItemProps) {
  const { setOpen } = useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
        danger
          ? 'text-red hover:bg-red/10'
          : 'text-text-secondary hover:text-white hover:bg-surface-3',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-border', className)} />;
}
