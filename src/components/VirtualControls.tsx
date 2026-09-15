import React from 'react';
import { Crosshair } from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (code: string, active: boolean) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onFireStart,
  onFireEnd,
}) => {
  return (
    <div className="md:hidden absolute bottom-24 left-0 right-0 px-6 flex justify-between items-end pointer-events-none z-30 select-none">
      {/* Directional Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 p-1.5 bg-neutral-950/70 backdrop-blur rounded-2xl border border-neutral-800">
        <div />
        <button
          onTouchStart={() => onDirectionPress('KeyW', true)}
          onTouchEnd={() => onDirectionPress('KeyW', false)}
          className="bg-neutral-800/80 active:bg-amber-500 active:text-black rounded-lg text-neutral-300 font-bold text-sm flex items-center justify-center"
        >
          W
        </button>
        <div />

        <button
          onTouchStart={() => onDirectionPress('KeyA', true)}
          onTouchEnd={() => onDirectionPress('KeyA', false)}
          className="bg-neutral-800/80 active:bg-amber-500 active:text-black rounded-lg text-neutral-300 font-bold text-sm flex items-center justify-center"
        >
          A
        </button>
        <button
          onTouchStart={() => onDirectionPress('KeyS', true)}
          onTouchEnd={() => onDirectionPress('KeyS', false)}
          className="bg-neutral-800/80 active:bg-amber-500 active:text-black rounded-lg text-neutral-300 font-bold text-sm flex items-center justify-center"
        >
          S
        </button>
        <button
          onTouchStart={() => onDirectionPress('KeyD', true)}
          onTouchEnd={() => onDirectionPress('KeyD', false)}
          className="bg-neutral-800/80 active:bg-amber-500 active:text-black rounded-lg text-neutral-300 font-bold text-sm flex items-center justify-center"
        >
          D
        </button>
      </div>

      {/* Fire Button */}
      <button
        onTouchStart={onFireStart}
        onTouchEnd={onFireEnd}
        className="pointer-events-auto w-20 h-20 rounded-full bg-red-600 active:bg-red-500 text-white flex flex-col items-center justify-center shadow-2xl border-2 border-red-400 active:scale-95 transition-transform"
      >
        <Crosshair className="w-8 h-8" />
        <span className="text-[10px] font-black tracking-wider uppercase">FIRE</span>
      </button>
    </div>
  );
};
