import React from 'react';
import { WeaponType, WeaponConfig, GameStats, Player } from '../types';
import { 
  Heart, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  Download, 
  Skull, 
  ShieldAlert, 
  Pause, 
  Play 
} from 'lucide-react';

interface GameHUDProps {
  player: Player;
  stats: GameStats;
  weapons: Record<WeaponType, WeaponConfig>;
  activeWeapon: WeaponType;
  isMuted: boolean;
  onSelectWeapon: (type: WeaponType) => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenExport: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  stats,
  weapons,
  activeWeapon,
  isMuted,
  onSelectWeapon,
  onToggleMute,
  onTogglePause,
  onOpenExport,
}) => {
  const currentWeapon = weapons[activeWeapon];
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const isLowHp = player.hp <= 30;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none">
      {/* Top HUD Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Player Vital Status */}
        <div 
          id="hud-player-vitals"
          className="bg-neutral-900/90 backdrop-blur border border-neutral-800 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3.5 min-w-[240px]"
        >
          <div className={`p-2 rounded-lg ${isLowHp ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold tracking-wider text-neutral-300 uppercase mb-1">
              <span>SOLDIER HEALTH</span>
              <span className={isLowHp ? 'text-red-400 font-extrabold animate-pulse' : 'text-neutral-200'}>
                {Math.ceil(player.hp)} / {player.maxHp}
              </span>
            </div>
            {/* Health Bar Track */}
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700/60">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isLowHp
                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : hpPercent > 60
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Mission Objectives (Wave & Remaining) */}
        <div 
          id="hud-mission-objectives"
          className="bg-neutral-900/90 backdrop-blur border border-neutral-800 px-6 py-2 rounded-xl shadow-lg flex items-center gap-6"
        >
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">MISSION WAVE</div>
            <div className="text-2xl font-black text-amber-400 tracking-wider">LEVEL {stats.level}</div>
          </div>

          <div className="h-8 w-px bg-neutral-800" />

          <div className="text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center justify-center gap-1">
              <Skull className="w-3.5 h-3.5 text-red-400 inline" /> ZOMBIES LEFT
            </div>
            <div className="text-2xl font-black text-red-400 tracking-wider">
              {stats.zombiesRemaining}
            </div>
          </div>

          <div className="h-8 w-px bg-neutral-800 hidden sm:block" />

          <div className="text-center hidden sm:block">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">SCORE</div>
            <div className="text-2xl font-black text-white tracking-wider">{stats.score}</div>
          </div>
        </div>

        {/* Top Right Controls & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-pause"
            onClick={onTogglePause}
            className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl transition shadow-md"
            title={stats.isPaused ? "Resume Game (P)" : "Pause Game (P)"}
          >
            {stats.isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            id="btn-toggle-mute"
            onClick={onToggleMute}
            className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl transition shadow-md"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            id="btn-open-export-html"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition shadow-md font-semibold text-xs tracking-wider"
            title="Download or copy single-file index.html"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">EXPORT HTML</span>
          </button>
        </div>
      </div>

      {/* Bottom Weapon Selection Bar */}
      <div className="w-full flex flex-col items-center gap-3 pointer-events-auto">
        {/* Active Weapon Indicator Details */}
        <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">ACTIVE WEAPON:</span>
            <span className="text-sm font-bold text-white tracking-wide">{currentWeapon.name}</span>
          </div>

          <div className="h-5 w-px bg-neutral-800" />

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">AMMO:</span>
            <span className={`text-base font-mono font-black ${currentWeapon.ammo === 0 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
              {currentWeapon.ammo === -1 ? '∞ UNLIMITED' : `${currentWeapon.ammo} / ${currentWeapon.maxAmmo}`}
            </span>
          </div>
        </div>

        {/* Quick Weapon Slots (1, 2, 3) */}
        <div className="flex items-center gap-2.5 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800/80 shadow-2xl">
          {(['pistol', 'shotgun', 'rifle'] as WeaponType[]).map((wKey) => {
            const w = weapons[wKey];
            const isSelected = activeWeapon === wKey;
            const isDepleted = w.ammo === 0;

            return (
              <button
                key={wKey}
                id={`btn-weapon-${wKey}`}
                onClick={() => onSelectWeapon(wKey)}
                className={`relative px-4 py-2 rounded-xl text-left transition-all duration-150 flex items-center gap-3 border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:bg-neutral-800/90 hover:text-neutral-200'
                }`}
              >
                {/* Hotkey Badge */}
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                  isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {w.keyLabel}
                </span>

                <div>
                  <div className="text-xs font-bold leading-tight">{w.name}</div>
                  <div className={`text-[11px] font-mono ${isDepleted ? 'text-red-400 font-bold' : isSelected ? 'text-amber-300' : 'text-neutral-400'}`}>
                    {w.ammo === -1 ? '∞ Unlimited' : `${w.ammo} Rnds`}
                  </div>
                </div>

                {isDepleted && (
                  <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/60">
                    EMPTY
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Controls Reminder Hint */}
        <div className="text-[11px] text-neutral-400 bg-neutral-950/60 px-3 py-1 rounded-full border border-neutral-800/60 tracking-wider">
          <span className="text-neutral-300 font-bold">WASD / ARROWS</span> Move | <span className="text-neutral-300 font-bold">MOUSE</span> Aim | <span className="text-neutral-300 font-bold">LEFT CLICK / HOLD</span> Auto-Fire | <span className="text-neutral-300 font-bold">1, 2, 3</span> Switch Guns
        </div>
      </div>
    </div>
  );
};
