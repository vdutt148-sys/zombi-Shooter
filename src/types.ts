export type WeaponType = 'pistol' | 'shotgun' | 'rifle';

export interface WeaponConfig {
  id: WeaponType;
  name: string;
  keyLabel: string;
  damage: number;
  fireRate: number; // milliseconds between shots
  bulletSpeed: number;
  bulletSpread: number; // in radians
  pelletCount: number;
  bulletColor: string;
  bulletRadius: number;
  maxRange: number;
  ammo: number; // -1 for unlimited (pistol)
  maxAmmo?: number;
  recoil: number;
  description: string;
}

export type ZombieType = 'walker' | 'runner' | 'heavy';

export interface Zombie {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: ZombieType;
  color: string;
  eyeColor: string;
  rotation: number;
  hitFlashTimer: number; // frames
  attackCooldown: number;
  wobblePhase: number;
  scoreValue: number;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  rotation: number; // angle in radians
  recoilOffset: number;
  muzzleFlash: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  color: string;
  distanceTraveled: number;
  maxRange: number;
  fromWeapon: WeaponType;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'smoke';
}

export interface BloodDecal {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  rotation: number;
}

export type PickupType = 'shotgun_ammo' | 'rifle_ammo' | 'medkit';

export interface Pickup {
  id: number;
  x: number;
  y: number;
  type: PickupType;
  amount: number;
  duration: number; // despawn timer
  bobPhase: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'crate' | 'barrel' | 'barrier';
}

export interface GameStats {
  level: number;
  zombiesRemaining: number;
  zombiesSpawned: number;
  totalZombiesInWave: number;
  score: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  isWaveActive: boolean;
  isWaveComplete: boolean;
  waveTransitionCountdown: number;
  isGameOver: boolean;
  isPaused: boolean;
}
