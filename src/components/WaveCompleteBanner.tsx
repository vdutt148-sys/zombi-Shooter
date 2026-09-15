import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface WaveCompleteBannerProps {
  level: number;
  countdown: number;
}

export const WaveCompleteBanner: React.FC<WaveCompleteBannerProps> = ({ level, countdown }) => {
  return (
    <div 
      id="banner-wave-complete"
      className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-40 animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="bg-neutral-950/90 backdrop-blur-md border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.35)] px-8 py-4 rounded-2xl text-center min-w-[320px]">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
          <ShieldCheck className="w-4 h-4" /> SECTOR SECURED
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
          WAVE {level} CLEARED!
        </h3>
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-medium mb-3">
          <Heart className="w-3.5 h-3.5 fill-current" /> +25 Tactical Health Restored
        </div>
        <div className="text-xs text-neutral-400">
          Next Wave {level + 1} begins in <span className="font-bold text-amber-400 text-sm">{Math.ceil(countdown)}s</span>
        </div>
      </div>
    </div>
  );
};
