import {
  WeaponConfig,
  WeaponType,
  Zombie,
  ZombieType,
  Player,
  Bullet,
  Particle,
  BloodDecal,
  Pickup,
  FloatingText,
  Obstacle,
  GameStats,
} from './types';
import { sound } from './audio';

export const INITIAL_WEAPONS: Record<WeaponType, WeaponConfig> = {
  pistol: {
    id: 'pistol',
    name: 'Tactical Pistol',
    keyLabel: '1',
    damage: 22,
    fireRate: 260, // ms
    bulletSpeed: 14,
    bulletSpread: 0.03,
    pelletCount: 1,
    bulletColor: '#FACC15', // Bright Yellow
    bulletRadius: 3.5,
    maxRange: 900,
    ammo: -1, // Unlimited
    recoil: 3,
    description: 'Standard issue sidearm with unlimited ammunition and reliable precision.',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Combat Shotgun',
    keyLabel: '2',
    damage: 19, // per pellet x 5 = 95 close range
    fireRate: 680,
    bulletSpeed: 12,
    bulletSpread: 0.28,
    pelletCount: 5,
    bulletColor: '#FB923C', // Orange Flame
    bulletRadius: 3,
    maxRange: 420,
    ammo: 20,
    maxAmmo: 60,
    recoil: 7,
    description: 'Devastating close-range blast. Fires 5 high-impact pellets.',
  },
  rifle: {
    id: 'rifle',
    name: 'Assault Rifle',
    keyLabel: '3',
    damage: 17,
    fireRate: 110,
    bulletSpeed: 16,
    bulletSpread: 0.09,
    pelletCount: 1,
    bulletColor: '#38BDF8', // Cyan tracer
    bulletRadius: 3,
    maxRange: 850,
    ammo: 90,
    maxAmmo: 240,
    recoil: 2,
    description: 'Rapid-fire fully automatic carbine with high suppressive power.',
  },
};

export class GameEngine {
  public width: number = 1200;
  public height: number = 800;
  public player: Player;
  public weapons: Record<WeaponType, WeaponConfig>;
  public activeWeapon: WeaponType = 'pistol';
  public zombies: Zombie[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public decals: BloodDecal[] = [];
  public pickups: Pickup[] = [];
  public floatingTexts: FloatingText[] = [];
  public obstacles: Obstacle[] = [];
  public stats: GameStats;

  public keys: Record<string, boolean> = {};
  public mousePos: { x: number; y: number } = { x: 0, y: 0 };
  public isMouseDown: boolean = false;
  private lastShotTime: number = 0;
  private nextZombieId: number = 1;
  private nextBulletId: number = 1;
  private nextParticleId: number = 1;
  private nextPickupId: number = 1;
  private nextTextId: number = 1;
  private spawnIntervalTimer: number = 0;
  private screenShake: number = 0;

  constructor(w: number = 1200, h: number = 800) {
    this.width = w;
    this.height = h;

    this.player = {
      x: w / 2,
      y: h / 2,
      radius: 20,
      speed: 4.2,
      hp: 100,
      maxHp: 100,
      rotation: 0,
      recoilOffset: 0,
      muzzleFlash: 0,
    };

    this.weapons = JSON.parse(JSON.stringify(INITIAL_WEAPONS));

    this.stats = {
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
    };

    this.initArenaObstacles();
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.initArenaObstacles();
  }

  public initArenaObstacles() {
    this.obstacles = [
      // Central cover barriers
      { x: this.width * 0.28, y: this.height * 0.28, width: 70, height: 70, type: 'crate' },
      { x: this.width * 0.72 - 70, y: this.height * 0.28, width: 70, height: 70, type: 'crate' },
      { x: this.width * 0.28, y: this.height * 0.72 - 70, width: 70, height: 70, type: 'crate' },
      { x: this.width * 0.72 - 70, y: this.height * 0.72 - 70, width: 70, height: 70, type: 'crate' },
      // Center hazard barrels
      { x: this.width / 2 - 25, y: this.height * 0.22, width: 50, height: 50, type: 'barrel' },
      { x: this.width / 2 - 25, y: this.height * 0.78 - 50, width: 50, height: 50, type: 'barrel' },
    ];
  }

  public resetGame() {
    this.player.x = this.width / 2;
    this.player.y = this.height / 2;
    this.player.hp = 100;
    this.player.maxHp = 100;
    this.player.recoilOffset = 0;
    this.player.muzzleFlash = 0;

    this.weapons = JSON.parse(JSON.stringify(INITIAL_WEAPONS));
    this.activeWeapon = 'pistol';

    this.zombies = [];
    this.bullets = [];
    this.particles = [];
    this.decals = [];
    this.pickups = [];
    this.floatingTexts = [];

    this.stats = {
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
    };
  }

  public switchWeapon(type: WeaponType) {
    if (this.activeWeapon !== type) {
      this.activeWeapon = type;
      sound.playEmptyClick();
    }
  }

  public triggerShot() {
    if (this.stats.isGameOver || this.stats.isPaused || this.stats.isWaveComplete) return;

    const now = performance.now();
    const weapon = this.weapons[this.activeWeapon];

    if (now - this.lastShotTime < weapon.fireRate) {
      return;
    }

    // Check Ammo
    if (weapon.ammo !== -1 && weapon.ammo <= 0) {
      sound.playEmptyClick();
      this.lastShotTime = now;
      this.addFloatingText(this.player.x, this.player.y - 30, 'NO AMMO!', '#EF4444');
      return;
    }

    if (weapon.ammo > 0) {
      weapon.ammo--;
    }

    this.lastShotTime = now;
    this.stats.shotsFired += weapon.pelletCount;

    // Recoil kick & muzzle flash
    this.player.recoilOffset = weapon.recoil;
    this.player.muzzleFlash = 4;
    this.screenShake = weapon.id === 'shotgun' ? 7 : weapon.id === 'rifle' ? 2 : 3;

    // Audio
    if (weapon.id === 'pistol') sound.playPistol();
    else if (weapon.id === 'shotgun') sound.playShotgun();
    else if (weapon.id === 'rifle') sound.playRifle();

    // Fire pellets
    const baseAngle = this.player.rotation;
    const barrelLength = 32;
    const spawnX = this.player.x + Math.cos(baseAngle) * barrelLength;
    const spawnY = this.player.y + Math.sin(baseAngle) * barrelLength;

    for (let i = 0; i < weapon.pelletCount; i++) {
      let angle = baseAngle;
      if (weapon.pelletCount > 1) {
        // Spread for shotgun
        const step = weapon.bulletSpread / (weapon.pelletCount - 1);
        angle = baseAngle - weapon.bulletSpread / 2 + step * i + (Math.random() - 0.5) * 0.05;
      } else {
        // Slight random spread for rifle/pistol
        angle = baseAngle + (Math.random() - 0.5) * weapon.bulletSpread;
      }

      this.bullets.push({
        id: this.nextBulletId++,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * weapon.bulletSpeed,
        vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage,
        radius: weapon.bulletRadius,
        color: weapon.bulletColor,
        distanceTraveled: 0,
        maxRange: weapon.maxRange,
        fromWeapon: weapon.id,
      });

      // Muzzle spark particles
      for (let s = 0; s < 3; s++) {
        const sparkAngle = angle + (Math.random() - 0.5) * 0.6;
        const speed = Math.random() * 4 + 2;
        this.particles.push({
          id: this.nextParticleId++,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(sparkAngle) * speed,
          vy: Math.sin(sparkAngle) * speed,
          color: '#FEF08A',
          size: Math.random() * 2.5 + 1.5,
          life: 1,
          maxLife: 1,
          decay: 0.12,
          shape: 'spark',
        });
      }
    }
  }

  public update(delta: number) {
    if (this.stats.isGameOver || this.stats.isPaused) return;

    // Wave transition countdown
    if (this.stats.isWaveComplete) {
      this.stats.waveTransitionCountdown -= delta;
      if (this.stats.waveTransitionCountdown <= 0) {
        this.startNextWave();
      }
    }

    // Auto-fire if mouse is held down
    if (this.isMouseDown) {
      this.triggerShot();
    }

    // Smooth screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - delta * 15);
    }

    // Player Recoil & Flash Decay
    if (this.player.recoilOffset > 0) {
      this.player.recoilOffset = Math.max(0, this.player.recoilOffset - delta * 20);
    }
    if (this.player.muzzleFlash > 0) {
      this.player.muzzleFlash--;
    }

    // Player 8-directional movement
    this.updatePlayerMovement(delta);

    // Aim Player towards mouse cursor
    this.player.rotation = Math.atan2(this.mousePos.y - this.player.y, this.mousePos.x - this.player.x);

    // Spawning Zombies
    this.updateZombieSpawning(delta);

    // Update Zombies
    this.updateZombies(delta);

    // Update Bullets
    this.updateBullets();

    // Update Pickups
    this.updatePickups(delta);

    // Update Particles
    this.updateParticles(delta);

    // Update Floating Texts
    this.updateFloatingTexts(delta);

    // Check Wave Completion
    if (
      this.stats.isWaveActive &&
      !this.stats.isWaveComplete &&
      this.stats.zombiesSpawned >= this.stats.totalZombiesInWave &&
      this.zombies.length === 0
    ) {
      this.stats.isWaveComplete = true;
      this.stats.waveTransitionCountdown = 3.2; // 3.2 seconds rest
      sound.playLevelUp();
      this.addFloatingText(this.player.x, this.player.y - 45, 'WAVE CLEARED!', '#22C55E');
      // Wave bonus health
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
    }
  }

  private updatePlayerMovement(delta: number) {
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      // Normalize diagonal vector
      const invSqrt = 1 / Math.SQRT2;
      dx *= invSqrt;
      dy *= invSqrt;
    }

    const moveStep = this.player.speed * (delta * 60);
    const targetX = this.player.x + dx * moveStep;
    const targetY = this.player.y + dy * moveStep;

    // Check Arena boundaries
    const boundX = Math.max(this.player.radius + 20, Math.min(this.width - this.player.radius - 20, targetX));
    const boundY = Math.max(this.player.radius + 20, Math.min(this.height - this.player.radius - 20, targetY));

    // Obstacle collisions
    if (!this.checkObstacleCollision(boundX, this.player.y, this.player.radius)) {
      this.player.x = boundX;
    }
    if (!this.checkObstacleCollision(this.player.x, boundY, this.player.radius)) {
      this.player.y = boundY;
    }
  }

  private checkObstacleCollision(x: number, y: number, r: number): boolean {
    for (const obs of this.obstacles) {
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.height));
      const distX = x - closestX;
      const distY = y - closestY;
      if (distX * distX + distY * distY < r * r) {
        return true;
      }
    }
    return false;
  }

  private updateZombieSpawning(delta: number) {
    if (!this.stats.isWaveActive || this.stats.isWaveComplete) return;

    if (this.stats.zombiesSpawned < this.stats.totalZombiesInWave) {
      this.spawnIntervalTimer += delta;
      // Faster spawn rate in higher levels
      const spawnDelay = Math.max(0.4, 1.6 - (this.stats.level - 1) * 0.15);

      if (this.spawnIntervalTimer >= spawnDelay) {
        this.spawnIntervalTimer = 0;
        this.spawnZombie();
      }
    }
  }

  private spawnZombie() {
    this.stats.zombiesSpawned++;

    // Pick spawn side along perimeter
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const padding = 20;

    switch (side) {
      case 0: // Top
        x = Math.random() * this.width;
        y = -padding;
        break;
      case 1: // Right
        x = this.width + padding;
        y = Math.random() * this.height;
        break;
      case 2: // Bottom
        x = Math.random() * this.width;
        y = this.height + padding;
        break;
      case 3: // Left
        x = -padding;
        y = Math.random() * this.height;
        break;
    }

    // Determine type based on level
    let type: ZombieType = 'walker';
    const lvl = this.stats.level;

    if (lvl === 1) {
      type = 'walker';
    } else if (lvl === 2) {
      type = Math.random() < 0.35 ? 'runner' : 'walker';
    } else {
      const rand = Math.random();
      if (rand < 0.28) {
        type = 'heavy';
      } else if (rand < 0.65) {
        type = 'runner';
      } else {
        type = 'walker';
      }
    }

    let hp = 30 + (lvl - 1) * 6;
    let speed = 1.6 + Math.min(1.2, (lvl - 1) * 0.1);
    let radius = 18;
    let color = '#4ADE80'; // Dark Green
    let eyeColor = '#EF4444'; // Red
    let scoreValue = 100;

    if (type === 'runner') {
      hp = 22 + (lvl - 1) * 4;
      speed = 3.2 + Math.min(1.0, (lvl - 1) * 0.12);
      radius = 15;
      color = '#F87171'; // Reddish-tinted zombie
      eyeColor = '#FBBF24'; // Yellow glowing eyes
      scoreValue = 150;
    } else if (type === 'heavy') {
      hp = 110 + (lvl - 1) * 25;
      speed = 1.05 + Math.min(0.5, (lvl - 1) * 0.05);
      radius = 28;
      color = '#15803D'; // Deep dark green hulk
      eyeColor = '#DC2626'; // Bloody crimson eyes
      scoreValue = 300;
    }

    this.zombies.push({
      id: this.nextZombieId++,
      x,
      y,
      radius,
      speed,
      hp,
      maxHp: hp,
      type,
      color,
      eyeColor,
      rotation: 0,
      hitFlashTimer: 0,
      attackCooldown: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      scoreValue,
    });
  }

  private updateZombies(delta: number) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      if (z.hitFlashTimer > 0) z.hitFlashTimer--;
      if (z.attackCooldown > 0) z.attackCooldown -= delta;

      // Zombie wobble walk animation
      z.wobblePhase += delta * 6;

      // Calculate vector towards player
      const angle = Math.atan2(this.player.y - z.y, this.player.x - z.x);
      z.rotation = angle;

      // Zombie separation & obstacle avoidance
      let pushX = 0;
      let pushY = 0;

      for (let j = 0; j < this.zombies.length; j++) {
        if (i === j) continue;
        const other = this.zombies[j];
        const distSq = (z.x - other.x) ** 2 + (z.y - other.y) ** 2;
        const minDist = z.radius + other.radius;
        if (distSq < minDist * minDist && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          pushX += ((z.x - other.x) / dist) * overlap * 0.4;
          pushY += ((z.y - other.y) / dist) * overlap * 0.4;
        }
      }

      // Move toward player
      const step = z.speed * (delta * 60);
      let nextX = z.x + Math.cos(angle) * step + pushX;
      let nextY = z.y + Math.sin(angle) * step + pushY;

      // Obstacle sliding
      if (this.checkObstacleCollision(nextX, z.y, z.radius)) {
        nextX = z.x;
      }
      if (this.checkObstacleCollision(z.x, nextY, z.radius)) {
        nextY = z.y;
      }

      z.x = nextX;
      z.y = nextY;

      // Attack player check
      const distToPlayer = Math.hypot(this.player.x - z.x, this.player.y - z.y);
      if (distToPlayer < this.player.radius + z.radius && z.attackCooldown <= 0) {
        const damage = z.type === 'heavy' ? 24 : z.type === 'runner' ? 10 : 15;
        this.player.hp -= damage;
        z.attackCooldown = 0.8; // attacks every 0.8s
        this.screenShake = 6;
        sound.playPlayerHurt();
        this.addBloodDecal(this.player.x, this.player.y, 22, '#991B1B');

        if (this.player.hp <= 0) {
          this.player.hp = 0;
          this.handleGameOver();
          return;
        }
      }
    }
  }

  private updateBullets() {
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      const b = this.bullets[bIndex];
      b.x += b.vx;
      b.y += b.vy;
      b.distanceTraveled += Math.hypot(b.vx, b.vy);

      // Check range or out of bounds
      if (
        b.distanceTraveled > b.maxRange ||
        b.x < 0 ||
        b.x > this.width ||
        b.y < 0 ||
        b.y > this.height
      ) {
        this.bullets.splice(bIndex, 1);
        continue;
      }

      // Check obstacle collisions
      if (this.checkObstacleCollision(b.x, b.y, b.radius)) {
        // Bullet sparks against obstacle
        for (let s = 0; s < 4; s++) {
          this.particles.push({
            id: this.nextParticleId++,
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#E5E7EB',
            size: Math.random() * 2 + 1,
            life: 1,
            maxLife: 1,
            decay: 0.15,
            shape: 'spark',
          });
        }
        this.bullets.splice(bIndex, 1);
        continue;
      }

      // Check collision with zombies
      let hit = false;
      for (let zIndex = this.zombies.length - 1; zIndex >= 0; zIndex--) {
        const z = this.zombies[zIndex];
        const dist = Math.hypot(b.x - z.x, b.y - z.y);

        if (dist < b.radius + z.radius) {
          hit = true;
          this.stats.shotsHit++;
          z.hp -= b.damage;
          z.hitFlashTimer = 5; // flash for 5 frames

          // Knockback
          const hitAngle = Math.atan2(b.vy, b.vx);
          const knockback = b.fromWeapon === 'shotgun' ? 5 : 2;
          z.x += Math.cos(hitAngle) * knockback;
          z.y += Math.sin(hitAngle) * knockback;

          // Sound
          sound.playZombieHit();

          // Blood impact particles
          for (let p = 0; p < 5; p++) {
            const spreadAngle = hitAngle + (Math.random() - 0.5) * 1.2;
            const pSpeed = Math.random() * 4 + 1.5;
            this.particles.push({
              id: this.nextParticleId++,
              x: b.x,
              y: b.y,
              vx: Math.cos(spreadAngle) * pSpeed,
              vy: Math.sin(spreadAngle) * pSpeed,
              color: Math.random() < 0.7 ? '#991B1B' : '#B91C1C',
              size: Math.random() * 3 + 2,
              life: 1,
              maxLife: 1,
              decay: 0.06,
              shape: 'circle',
            });
          }

          // Check Zombie Death
          if (z.hp <= 0) {
            this.killZombie(zIndex);
          }

          break; // Bullet hits one zombie (unless penetration is implemented)
        }
      }

      if (hit) {
        this.bullets.splice(bIndex, 1);
      }
    }
  }

  private killZombie(zIndex: number) {
    const z = this.zombies[zIndex];
    this.zombies.splice(zIndex, 1);

    this.stats.kills++;
    this.stats.score += z.scoreValue;
    this.stats.zombiesRemaining = Math.max(0, this.stats.totalZombiesInWave - this.stats.kills);

    sound.playZombieDeath();

    // Splatter decals on ground
    this.addBloodDecal(z.x, z.y, z.radius * 1.5, '#7F1D1D');

    // Death explosion particles
    const particleCount = z.type === 'heavy' ? 30 : 16;
    for (let p = 0; p < particleCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        id: this.nextParticleId++,
        x: z.x,
        y: z.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.6 ? '#7F1D1D' : '#991B1B',
        size: Math.random() * 4 + 2,
        life: 1,
        maxLife: 1,
        decay: 0.04,
        shape: 'circle',
      });
    }

    // Chance to drop ammo or medkit
    this.rollDrop(z.x, z.y, z.type);
  }

  private rollDrop(x: number, y: number, zType: ZombieType) {
    const dropRate = zType === 'heavy' ? 0.95 : zType === 'runner' ? 0.35 : 0.28;
    if (Math.random() > dropRate) return;

    const rand = Math.random();
    let type: 'shotgun_ammo' | 'rifle_ammo' | 'medkit' = 'shotgun_ammo';
    let amount = 8;

    if (rand < 0.4) {
      type = 'shotgun_ammo';
      amount = zType === 'heavy' ? 12 : 8;
    } else if (rand < 0.8) {
      type = 'rifle_ammo';
      amount = zType === 'heavy' ? 45 : 30;
    } else {
      type = 'medkit';
      amount = zType === 'heavy' ? 40 : 25;
    }

    this.pickups.push({
      id: this.nextPickupId++,
      x,
      y,
      type,
      amount,
      duration: 25, // 25s despawn timer
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  private updatePickups(delta: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.duration -= delta;
      p.bobPhase += delta * 4;

      if (p.duration <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }

      // Check player distance for pickup
      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < this.player.radius + 18) {
        if (p.type === 'shotgun_ammo') {
          const max = this.weapons.shotgun.maxAmmo || 60;
          this.weapons.shotgun.ammo = Math.min(max, this.weapons.shotgun.ammo + p.amount);
          this.addFloatingText(p.x, p.y, `+${p.amount} SHOTGUN SHELLS`, '#FB923C');
        } else if (p.type === 'rifle_ammo') {
          const max = this.weapons.rifle.maxAmmo || 240;
          this.weapons.rifle.ammo = Math.min(max, this.weapons.rifle.ammo + p.amount);
          this.addFloatingText(p.x, p.y, `+${p.amount} RIFLE AMMO`, '#38BDF8');
        } else if (p.type === 'medkit') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + p.amount);
          this.addFloatingText(p.x, p.y, `+${p.amount} HEALTH`, '#22C55E');
        }

        sound.playPickup();
        this.pickups.splice(i, 1);
      }
    }
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * (delta * 60);
      p.y += p.vy * (delta * 60);
      p.vx *= 0.94; // friction
      p.vy *= 0.94;
      p.life -= p.decay * (delta * 60);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(delta: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= delta * 35; // rise upward
      ft.life -= delta * 1.5;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public addBloodDecal(x: number, y: number, radius: number, color: string) {
    // Keep max 80 decals to prevent frame drops
    if (this.decals.length > 80) {
      this.decals.shift();
    }
    this.decals.push({
      x,
      y,
      radius,
      color,
      alpha: 0.65,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: this.nextTextId++,
      x,
      y,
      text,
      color,
      life: 1,
      maxLife: 1,
    });
  }

  private startNextWave() {
    this.stats.level++;
    // Wave formula: 10, 16, 24, 34, 46...
    const count = Math.floor(10 + Math.pow(this.stats.level - 1, 1.35) * 6);
    this.stats.totalZombiesInWave = count;
    this.stats.zombiesRemaining = count;
    this.stats.zombiesSpawned = 0;
    this.stats.isWaveActive = true;
    this.stats.isWaveComplete = false;
    this.stats.waveTransitionCountdown = 0;
    this.spawnIntervalTimer = 0;

    this.addFloatingText(this.player.x, this.player.y - 40, `WAVE ${this.stats.level} START!`, '#FACC15');
  }

  private handleGameOver() {
    this.stats.isGameOver = true;
    sound.playGameOver();
  }

  // ==================== RENDERING ====================
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Screen Shake application
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Dark Wasteland Arena Background
    this.renderBackground(ctx);

    // 2. Blood Decals
    this.renderDecals(ctx);

    // 3. Pickups
    this.renderPickups(ctx);

    // 4. Obstacles
    this.renderObstacles(ctx);

    // 5. Zombies
    this.renderZombies(ctx);

    // 6. Player Character
    this.renderPlayer(ctx);

    // 7. Bullets & Tracers
    this.renderBullets(ctx);

    // 8. Particles (Muzzle sparks, blood sprays)
    this.renderParticles(ctx);

    // 9. Lighting / Darkness Vignette with Flashlight Cone
    this.renderAtmosphere(ctx);

    // 10. Floating Damage / Pickup Texts
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Base dark industrial concrete tone
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid pattern
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    const gridSize = 64;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Perimeter Hazard Warning Borders
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, this.width - 20, this.height - 20);

    // Border inner glow line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, this.width - 32, this.height - 32);
  }

  private renderDecals(ctx: CanvasRenderingContext2D) {
    for (const d of this.decals) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = d.alpha;

      ctx.beginPath();
      ctx.ellipse(0, 0, d.radius, d.radius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Additional blotches
      ctx.beginPath();
      ctx.arc(d.radius * 0.5, d.radius * 0.3, d.radius * 0.25, 0, Math.PI * 2);
      ctx.arc(-d.radius * 0.4, -d.radius * 0.2, d.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderPickups(ctx: CanvasRenderingContext2D) {
    for (const p of this.pickups) {
      ctx.save();
      const bobY = p.y + Math.sin(p.bobPhase) * 3;

      // Glow halo
      ctx.beginPath();
      ctx.arc(p.x, bobY, 16, 0, Math.PI * 2);
      if (p.type === 'shotgun_ammo') ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      else if (p.type === 'rifle_ammo') ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      else ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.fill();

      // Box body
      const size = 18;
      ctx.translate(p.x - size / 2, bobY - size / 2);
      ctx.fillStyle = p.type === 'shotgun_ammo' ? '#FB923C' : p.type === 'rifle_ammo' ? '#38BDF8' : '#22C55E';
      ctx.fillRect(0, 0, size, size);

      // Icon details
      ctx.fillStyle = '#FFFFFF';
      if (p.type === 'medkit') {
        // Red cross
        ctx.fillRect(size * 0.38, size * 0.18, size * 0.24, size * 0.64);
        ctx.fillRect(size * 0.18, size * 0.38, size * 0.64, size * 0.24);
      } else {
        // Ammo bullet glyphs
        ctx.fillRect(size * 0.25, size * 0.25, 3, size * 0.5);
        ctx.fillRect(size * 0.55, size * 0.25, 3, size * 0.5);
      }

      ctx.restore();
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (const o of this.obstacles) {
      ctx.save();

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(o.x + 4, o.y + 4, o.width, o.height);

      if (o.type === 'crate') {
        // Metal/wood tactical supply crate
        ctx.fillStyle = '#374151';
        ctx.fillRect(o.x, o.y, o.width, o.height);

        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 3;
        ctx.strokeRect(o.x, o.y, o.width, o.height);

        // Crisscross pattern
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(o.x + o.width, o.y + o.height);
        ctx.moveTo(o.x + o.width, o.y);
        ctx.lineTo(o.x, o.y + o.height);
        ctx.stroke();
      } else if (o.type === 'barrel') {
        // Explosive or toxic barrel
        ctx.fillStyle = '#B91C1C';
        ctx.beginPath();
        ctx.arc(o.x + o.width / 2, o.y + o.height / 2, o.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner hazard ring
        ctx.beginPath();
        ctx.arc(o.x + o.width / 2, o.y + o.height / 2, o.width / 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF08A';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderZombies(ctx: CanvasRenderingContext2D) {
    for (const z of this.zombies) {
      ctx.save();
      ctx.translate(z.x, z.y);
      ctx.rotate(z.rotation);

      // Hit-flash impact animation (white/red flash)
      const isFlashing = z.hitFlashTimer > 0;
      const bodyColor = isFlashing ? '#FFFFFF' : z.color;

      // Zombie Arms reached forward
      const armWobble = Math.sin(z.wobblePhase) * 3;
      ctx.fillStyle = bodyColor;

      // Left Arm
      ctx.fillRect(z.radius * 0.2, -z.radius * 0.85 + armWobble, z.radius * 1.1, z.radius * 0.35);
      // Right Arm
      ctx.fillRect(z.radius * 0.2, z.radius * 0.5 - armWobble, z.radius * 1.1, z.radius * 0.35);

      // Zombie Body (Circle)
      ctx.beginPath();
      ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();

      // Zombie dark outline
      ctx.strokeStyle = isFlashing ? '#EF4444' : '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = z.eyeColor;
      // Left eye
      ctx.beginPath();
      ctx.arc(z.radius * 0.5, -z.radius * 0.3, z.radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.arc(z.radius * 0.5, z.radius * 0.3, z.radius * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Health bar above zombie
      ctx.rotate(-z.rotation); // un-rotate for horizontal health bar
      const barW = z.radius * 2;
      const barH = 4;
      const barY = -z.radius - 8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-barW / 2, barY, barW, barH);

      const healthRatio = Math.max(0, z.hp / z.maxHp);
      ctx.fillStyle = z.type === 'heavy' ? '#3B82F6' : z.type === 'runner' ? '#EF4444' : '#22C55E';
      ctx.fillRect(-barW / 2, barY, barW * healthRatio, barH);

      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.rotation);

    // Apply recoil translation
    if (this.player.recoilOffset > 0) {
      ctx.translate(-this.player.recoilOffset, 0);
    }

    // 1. Gun Barrel Vector
    const weapon = this.weapons[this.activeWeapon];
    ctx.fillStyle = '#1E293B'; // Dark gun metal
    ctx.fillRect(8, -3.5, 24, 7);

    // Weapon accents based on active weapon
    if (weapon.id === 'shotgun') {
      ctx.fillStyle = '#FB923C';
      ctx.fillRect(14, -4.5, 8, 9); // Shotgun pump
    } else if (weapon.id === 'rifle') {
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(10, 3, 5, 8); // Extended magazine
    }

    // Muzzle Flash
    if (this.player.muzzleFlash > 0) {
      ctx.save();
      ctx.translate(32, 0);
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, -9);
      ctx.lineTo(10, 0);
      ctx.lineTo(16, 9);
      ctx.closePath();
      ctx.fill();

      // Glow halo
      ctx.beginPath();
      ctx.arc(6, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.fill();
      ctx.restore();
    }

    // 2. Soldier Hands gripping gun
    ctx.fillStyle = '#22C55E'; // Tactical green gloves
    ctx.beginPath();
    ctx.arc(14, -10, 5, 0, Math.PI * 2);
    ctx.arc(22, 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Soldier Torso / Tactical Armor (Green/Blue soldier sprite)
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0284C7'; // Blue / Green Soldier camouflage
    ctx.fill();

    // Tactical Vest
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = '#15803D'; // Military Green Vest
    ctx.fill();

    // 4. Combat Helmet
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0369A1'; // Helmet base
    ctx.fill();

    // Goggles / Visor (Facing forward)
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(3, -5, 4, 10);

    ctx.restore();
  }

  private renderBullets(ctx: CanvasRenderingContext2D) {
    for (const b of this.bullets) {
      ctx.save();

      // Bullet Tracer Trail
      const trailLength = 12;
      const angle = Math.atan2(b.vy, b.vx);
      const tailX = b.x - Math.cos(angle) * trailLength;
      const tailY = b.y - Math.sin(angle) * trailLength;

      const grad = ctx.createLinearGradient(tailX, tailY, b.x, b.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, b.color);

      ctx.strokeStyle = grad;
      ctx.lineWidth = b.radius * 1.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Bullet Core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderAtmosphere(ctx: CanvasRenderingContext2D) {
    // Flashlight cone from player towards mouse cursor
    ctx.save();

    // Cut out flashlight beam using destination-out or radial gradient
    const flashlightRadius = 550;
    const fov = 0.85; // beam angle in radians

    // Dark ambient overlay with flashlight cutout
    const darknessCanvas = document.createElement('canvas');
    darknessCanvas.width = this.width;
    darknessCanvas.height = this.height;
    const dCtx = darknessCanvas.getContext('2d');

    if (dCtx) {
      // Base dark apocalypse gloom
      dCtx.fillStyle = 'rgba(3, 7, 18, 0.72)';
      dCtx.fillRect(0, 0, this.width, this.height);

      // Cutout flashlight beam
      dCtx.globalCompositeOperation = 'destination-out';

      // 1. Forward flashlight cone
      dCtx.beginPath();
      dCtx.moveTo(this.player.x, this.player.y);
      dCtx.arc(
        this.player.x,
        this.player.y,
        flashlightRadius,
        this.player.rotation - fov / 2,
        this.player.rotation + fov / 2
      );
      dCtx.closePath();

      const beamGrad = dCtx.createRadialGradient(
        this.player.x,
        this.player.y,
        10,
        this.player.x,
        this.player.y,
        flashlightRadius
      );
      beamGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      beamGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dCtx.fillStyle = beamGrad;
      dCtx.fill();

      // 2. Personal immediate ambient circle around player
      dCtx.beginPath();
      dCtx.arc(this.player.x, this.player.y, 90, 0, Math.PI * 2);
      const personalGrad = dCtx.createRadialGradient(
        this.player.x,
        this.player.y,
        20,
        this.player.x,
        this.player.y,
        90
      );
      personalGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      personalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dCtx.fillStyle = personalGrad;
      dCtx.fill();

      ctx.drawImage(darknessCanvas, 0, 0);
    }

    // Flashlight soft yellow beam highlight
    const beamHighlight = ctx.createRadialGradient(
      this.player.x,
      this.player.y,
      10,
      this.player.x,
      this.player.y,
      flashlightRadius
    );
    beamHighlight.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
    beamHighlight.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(this.player.x, this.player.y);
    ctx.arc(
      this.player.x,
      this.player.y,
      flashlightRadius,
      this.player.rotation - fov / 2,
      this.player.rotation + fov / 2
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
