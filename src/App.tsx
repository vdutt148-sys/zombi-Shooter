import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './gameEngine';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { WaveCompleteBanner } from './components/WaveCompleteBanner';
import { ExportHtmlModal } from './components/ExportHtmlModal';
import { VirtualControls } from './components/VirtualControls';
import { sound } from './audio';
import { WeaponType, GameStats, Player, WeaponConfig } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // React State for HUD and Modals
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    zombiesRemaining: 10,
    zombiesSpawned: 0,
    totalZombiesInWave: 10,
    score: 0,
    kills: 0,
    shotsFired: 0,
    shotsHit: 0,
    isWaveActive: true,
    isWaveComplete: false,
    waveTransitionCountdown: 0,
    isGameOver: false,
    isPaused: false,
  });

  const [player, setPlayer] = useState<Player>({
    x: 600,
    y: 400,
    radius: 20,
    speed: 4.2,
    hp: 100,
    maxHp: 100,
    rotation: 0,
    recoilOffset: 0,
    muzzleFlash: 0,
  });

  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('pistol');
  const [weapons, setWeapons] = useState<Record<WeaponType, WeaponConfig>>(() => {
    const tempEngine = new GameEngine(1200, 800);
    return tempEngine.weapons;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Initialize Game Engine and Canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const engine = new GameEngine(width, height);
    engineRef.current = engine;

    // Resize Observer for dynamic window scaling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && canvasRef.current) {
          canvasRef.current.width = newW;
          canvasRef.current.height = newH;
          engine.resize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.keys[e.code] = true;

      // Weapon hotkeys
      if (e.code === 'Digit1' || e.key === '1') {
        engine.switchWeapon('pistol');
        setActiveWeapon('pistol');
      } else if (e.code === 'Digit2' || e.key === '2') {
        engine.switchWeapon('shotgun');
        setActiveWeapon('shotgun');
      } else if (e.code === 'Digit3' || e.key === '3') {
        engine.switchWeapon('rifle');
        setActiveWeapon('rifle');
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        engine.stats.isPaused = !engine.stats.isPaused;
        setStats({ ...engine.stats });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let lastHudSync = 0;
    const ctx = canvas.getContext('2d');

    const loop = (now: number) => {
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (ctx) {
        engine.update(delta);
        ctx.clearRect(0, 0, engine.width, engine.height);
        engine.render(ctx);
      }

      // Sync React state for HUD every 80ms (approx 12fps) for buttery smooth performance
      if (now - lastHudSync > 80) {
        lastHudSync = now;
        setStats({ ...engine.stats });
        setPlayer({ ...engine.player });
        setWeapons({ ...engine.weapons });
        setActiveWeapon(engine.activeWeapon);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse aim and fire event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    engine.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click
    const engine = engineRef.current;
    if (!engine) return;

    engine.isMouseDown = true;
    engine.triggerShot();
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const engine = engineRef.current;
    if (!engine) return;

    engine.isMouseDown = false;
  }, []);

  // Weapon switch click handler
  const handleSelectWeapon = (type: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.switchWeapon(type);
      setActiveWeapon(type);
    }
  };

  // Sound toggle
  const handleToggleMute = () => {
    sound.muted = !sound.muted;
    setIsMuted(sound.muted);
  };

  // Pause toggle
  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.stats.isPaused = !engineRef.current.stats.isPaused;
      setStats({ ...engineRef.current.stats });
    }
  };

  // Restart Mission
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      setStats({ ...engineRef.current.stats });
      setPlayer({ ...engineRef.current.player });
      setWeapons({ ...engineRef.current.weapons });
      setActiveWeapon('pistol');
    }
  };

  // Virtual touch controls for mobile/tablet
  const handleVirtualDirection = (code: string, active: boolean) => {
    if (engineRef.current) {
      engineRef.current.keys[code] = active;
    }
  };

  const handleVirtualFireStart = () => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = true;
      engineRef.current.triggerShot();
    }
  };

  const handleVirtualFireEnd = () => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = false;
    }
  };

  return (
    <div
      id="app-root"
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-['Rajdhani',sans-serif] select-none"
    >
      {/* HTML5 Game Canvas */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Primary Military Top & Bottom Game HUD */}
      <GameHUD
        player={player}
        stats={stats}
        weapons={weapons}
        activeWeapon={activeWeapon}
        isMuted={isMuted}
        onSelectWeapon={handleSelectWeapon}
        onToggleMute={handleToggleMute}
        onTogglePause={handleTogglePause}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Wave Cleared Banner with Countdown */}
      {stats.isWaveComplete && (
        <WaveCompleteBanner
          level={stats.level}
          countdown={stats.waveTransitionCountdown}
        />
      )}

      {/* Game Over Modal */}
      {stats.isGameOver && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
        />
      )}

      {/* Pause Screen Overlay */}
      {stats.isPaused && !stats.isGameOver && (
        <div 
          id="overlay-paused"
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-40"
        >
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <h2 className="text-3xl font-black text-amber-400 uppercase tracking-widest mb-2">
              MISSION PAUSED
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Press P or resume button to return to the apocalyptic wasteland.
            </p>
            <button
              id="btn-resume-game"
              onClick={handleTogglePause}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              RESUME COMBAT
            </button>
          </div>
        </div>
      )}

      {/* Standalone Single-File HTML Export Modal */}
      <ExportHtmlModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Virtual On-Screen Controls for Touchscreens */}
      <VirtualControls
        onDirectionPress={handleVirtualDirection}
        onFireStart={handleVirtualFireStart}
        onFireEnd={handleVirtualFireEnd}
      />
    </div>
  );
}
