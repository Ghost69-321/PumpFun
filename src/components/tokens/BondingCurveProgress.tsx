import type { TokenData } from '@/types';
import { GRADUATION_THRESHOLD_SOL } from '@/lib/constants';
import { formatSOL } from '@/lib/utils';

interface BondingCurveProgressProps {
  token: TokenData;
}

export function BondingCurveProgress({ token }: BondingCurveProgressProps) {
  const progress = Math.min((token.reserveBalance / GRADUATION_THRESHOLD_SOL) * 100, 100);
  const remaining = Math.max(GRADUATION_THRESHOLD_SOL - token.reserveBalance, 0);

  if (token.graduated) {
    return (
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-purple-400">
          <span>🎓</span>
          <span className="font-semibold">Graduated to DEX</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">This token has graduated and is trading on a DEX</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-white">Bonding Curve Progress</h3>
        <span className="text-sm text-green-400">{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-green-600 to-green-400 rounded-full h-3 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatSOL(token.reserveBalance)} raised</span>
        <span>{formatSOL(remaining)} needed to graduate</span>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        When this token raises {GRADUATION_THRESHOLD_SOL} SOL, it graduates to a DEX
      </p>
    </div>
  );
}
