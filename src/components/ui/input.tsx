'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm text-text-secondary font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-text-secondary text-sm">{leftAddon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm',
              'placeholder:text-text-muted',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red focus:border-red focus:ring-red/30' : null,
              leftAddon ? 'pl-9' : null,
              rightAddon ? 'pr-9' : null,
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 text-text-secondary text-sm">{rightAddon}</div>
          )}
        </div>
        {error && <p className="text-red text-xs">{error}</p>}
        {hint && !error && <p className="text-text-muted text-xs">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm text-text-secondary font-medium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm',
            'placeholder:text-text-muted resize-vertical min-h-[80px]',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red focus:border-red focus:ring-red/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-red text-xs">{error}</p>}
        {hint && !error && <p className="text-text-muted text-xs">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
