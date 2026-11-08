import React from 'react';
import { Heart, PawPrint } from 'lucide-react';

interface BrandLogoProps {
  size?: 'compact' | 'large';
  tone?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'compact', tone = 'dark' }) => {
  const isLarge = size === 'large';
  const isLight = tone === 'light';

  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`relative inline-flex shrink-0 items-center justify-center bg-teal-700 text-white shadow-sm ${
          isLarge ? 'h-12 w-12 rounded-2xl' : 'h-9 w-9 rounded-xl'
        }`}
      >
        <PawPrint className={isLarge ? 'h-6 w-6' : 'h-[18px] w-[18px]'} strokeWidth={2.2} />
        <span className={`absolute flex items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white ${
          isLarge ? '-right-1 -top-1 h-5 w-5' : '-right-1 -top-1 h-4 w-4'
        }`}>
          <Heart className={isLarge ? 'h-2.5 w-2.5' : 'h-2 w-2'} fill="currentColor" strokeWidth={2.4} />
        </span>
      </span>
      <span className="block leading-tight">
        <span className={`block font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} ${isLarge ? 'text-2xl' : 'text-base'}`}>
          PAW
        </span>
        <span className={`block font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'} ${isLarge ? 'text-[9px]' : 'text-[8px]'}`}>
          Pet adoption & care
        </span>
      </span>
    </div>
  );
};