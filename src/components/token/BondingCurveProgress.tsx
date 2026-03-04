'use client';

import React from 'react';
import { Token } from '@/types';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import { calculateGraduationProgress, GRADUATION_SOL } from '@/lib/bonding-curve';

interface BondingCurveProgressProps {
  token: Token;
}

export function BondingCurveProgress({ token }: BondingCurveProgressProps) {
  const progress = calculateGraduationProgress(token.solRaised);
  const remaining = Math.max(0, GRADUATION_SOL - token.solRaised);
  const isNearGraduation = progress >= 80;
  const isGraduated = token.status === 'GRADUATED';

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Bonding Curve Progress</h3>
          <p className="text-text-muted text-xs mt-0.5">
            {isGraduated
              ? 'Graduated to DEX! 🎓'
              : `${remaining.toFixed(2)} SOL until graduation`}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold font-mono ${
              isGraduated ? 'text-yellow' : isNearGraduation ? 'text-green animate-pulse-green' : 'text-accent'
            }`}
          >
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>

      <Progress
        value={progress}
        size="lg"
        color={isGraduated ? 'yellow' : isNearGraduation ? 'green' : 'accent'}
        showLabel={false}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-text-muted text-xs">SOL Raised</p>
          <p className="text-white font-semibold text-sm">{token.solRaised.toFixed(3)} SOL</p>
        </div>
        <div className="text-center">
          <p className="text-text-muted text-xs">Target</p>
          <p className="text-white font-semibold text-sm">{GRADUATION_SOL} SOL</p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-xs">Circulating</p>
          <p className="text-white font-semibold text-sm">
            {formatNumber(token.circulatingSupply, 0)}
          </p>
        </div>
      </div>

      {isNearGraduation && !isGraduated && (
        <div className="mt-3 bg-green/10 border border-green/20 rounded-lg p-2 text-center">
          <p className="text-green text-xs font-medium animate-pulse-green">
            🚀 Almost there! Graduating to DEX soon!
          </p>
        </div>
      )}

      {isGraduated && (
        <div className="mt-3 bg-yellow/10 border border-yellow/20 rounded-lg p-2 text-center">
          <p className="text-yellow text-xs font-medium">
            🎓 This token has graduated to a decentralized exchange!
          </p>
        </div>
      )}
    </div>
  );
}
