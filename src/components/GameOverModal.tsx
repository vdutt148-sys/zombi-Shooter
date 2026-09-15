import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Skull, Target, Trophy, Award } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart }) => {
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;

  return (
    <div 
      id="modal-game-over"
      className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
    >
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-center">
        {/* Skull Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 border border-red-500/30">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black text-white tracking-wider uppercase mb-1">
          SOLDIER DEFEATED
        </h2>
        <p className="text-sm text-neutral-400 mb-6">
          The horde overwhelmed your defenses in the wasteland arena.
        </p>

        {/* Combat Debriefing Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-xl text-left">
            <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> FINAL SCORE
            </div>
            <div className="text-xl font-black text-amber-400">{stats.score}</div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-xl text-left">
            <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> WAVE REACHED
            </div>
            <div className="text-xl font-black text-emerald-400">LEVEL {stats.level}</div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-xl text-left">
            <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
              <Skull className="w-3.5 h-3.5 text-red-400" /> ZOMBIES ERADICATED
            </div>
            <div className="text-xl font-black text-red-400">{stats.kills}</div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-xl text-left">
            <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5 text-sky-400" /> ACCURACY
            </div>
            <div className="text-xl font-black text-sky-400">{accuracy}%</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          id="btn-restart-game"
          onClick={onRestart}
          className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          RESTART MISSION
        </button>
      </div>
    </div>
  );
};
