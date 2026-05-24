import React from 'react';
import { Sparkles } from 'lucide-react';

interface FitConfidenceBadgeProps {
  score: number;
  onClick?: () => void;
  className?: string;
}

export const FitConfidenceBadge: React.FC<FitConfidenceBadgeProps> = ({
  score,
  onClick,
  className = ''
}) => {
  // Determine color matching levels forDevFest top 10% submission (Green/Yellow/Red score indicators)
  let badgeColor = 'text-[#C5A880] border-[#E8E2D9] bg-white/95';
  if (score >= 95) {
    badgeColor = 'text-emerald-600 border-emerald-200 bg-emerald-50/95';
  } else if (score >= 92) {
    badgeColor = 'text-amber-600 border-amber-200 bg-amber-50/95';
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`absolute bottom-3 right-3 z-20 text-[9px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 shadow-md transition-transform duration-200 active:scale-95 ${badgeColor} ${className}`}
    >
      <Sparkles className="w-2.5 h-2.5" />
      <span>{score}% True Fit</span>
    </button>
  );
};
