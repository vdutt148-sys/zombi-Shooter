export function generateSingleFileHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Zombie Survival Shooter</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff;
    }
    #gameContainer {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: crosshair;
    }
    canvas {
      display: block;
      background: #111827;
      box-shadow: 0 0 30px rgba(0,0,0,0.8);
    }
    /* Top HUD */
    #hudTop {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 10;
    }
    .hud-card {
      background: rgba(17, 24, 39, 0.85);
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 10px 16px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      pointer-events: auto;
    }
    /* Health Bar */
    .health-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 200px;
    }
    .hud-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #9ca3af;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
    }
    .health-bar-track {
      width: 100%;
      height: 12px;
      background: #1f2937;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #4b5563;
    }
    #healthBarFill {
      height: 100%;
      width: 100%;
      background: #10b981;
      transition: width 0.15s ease-out, background 0.3s;
    }
    /* Wave & Objectives */
    .wave-badge {
      display: flex;
      gap: 20px;
      align-items: center;
      text-align: center;
    }
    .stat-val {
      font-size: 20px;
      font-weight: 900;
      color: #fbbf24;
      line-height: 1.1;
    }
    .stat-red {
      color: #ef4444;
    }
    /* Active Weapon & Bottom HUD */
    #hudBottom {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      z-index: 10;
      pointer-events: auto;
    }
    .weapon-selector {
      display: flex;
      gap: 8px;
      background: rgba(10, 15, 26, 0.9);
      padding: 6px;
      border-radius: 14px;
      border: 1px solid #374151;
    }
    .weapon-btn {
      background: #1f2937;
      border: 1px solid #374151;
      color: #9ca3af;
      padding: 8px 14px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.15s ease;
    }
    .weapon-btn.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #fff;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }
    .weapon-key {
      background: #111827;
      border-radius: 4px;
      padding: 2px 6px;
      color: #fbbf24;
      font-size: 11px;
    }
    .hint-bar {
      font-size: 11px;
      color: #9ca3af;
      background: rgba(0,0,0,0.6);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid #374151;
    }
    /* Modals & Banners */
    .banner {
      position: absolute;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(6, 78, 59, 0.95);
      border: 1px solid #10b981;
      padding: 14px 28px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
      display: none;
      z-index: 20;
    }
    .banner h2 {
      font-size: 22px;
      font-weight: 900;
      color: #fff;
    }
    .banner p {
      font-size: 12px;
      color: #a7f3d0;
      margin-top: 4px;
    }
    /* Game Over Modal */
    #gameOverModal {
      position: absolute;
      inset: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(8px);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }
    .modal-box {
      background: #111827;
      border: 1px solid #374151;
      border-radius: 20px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .modal-box h1 {
      color: #ef4444;
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .modal-box p {
      color: #9ca3af;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }
    .stat-item {
      background: #1f2937;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #374151;
    }
    .stat-title {
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
    }
    .stat-number {
      font-size: 18px;
      font-weight: 800;
      color: #fbbf24;
      margin-top: 2px;
    }
    .btn-restart {
      background: #dc2626;
      border: none;
      color: white;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 12px;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-restart:hover {
      background: #ef4444;
      transform: scale(1.02);
    }
  </style>
</head>
<body>
  <div id="gameContainer">
    <canvas id="gameCanvas"></canvas>

    <!-- Top HUD -->
    <div id="hudTop">
      <!-- Health Bar -->
      <div class="hud-card health-container">
        <div class="hud-label">
          <span>SOLDIER HEALTH</span>
          <span id="healthNum">100 / 100</span>
        </div>
        <div class="health-bar-track">
          <div id="healthBarFill"></div>
        </div>
      </div>

      <!-- Wave & Counter -->
      <div class="hud-card wave-badge">
        <div>
          <div class="hud-label">WAVE</div>
          <div class="stat-val" id="waveNum">LEVEL 1</div>
        </div>
        <div style="width: 1px; height: 28px; background: #374151;"></div>
        <div>
          <div class="hud-label">ZOMBIES LEFT</div>
          <div class="stat-val stat-red" id="zombiesNum">10</div>
        </div>
        <div style="width: 1px; height: 28px; background: #374151;"></div>
        <div>
          <div class="hud-label">SCORE</div>
          <div class="stat-val" style="color: #fff;" id="scoreNum">0</div>
        </div>
      </div>
    </div>

    <!-- Bottom Weapon HUD -->
    <div id="hudBottom">
      <div class="weapon-selector">
        <button class="weapon-btn active" id="btnW1" onclick="switchWeapon('pistol')">
          <span class="weapon-key">1</span>
          <div>
            <div>Pistol</div>
            <div style="font-size:10px; color:#fbbf24;" id="ammoPistol">∞ Ammo</div>
          </div>
        </button>
        <button class="weapon-btn" id="btnW2" onclick="switchWeapon('shotgun')">
          <span class="weapon-key">2</span>
          <div>
            <div>Shotgun</div>
            <div style="font-size:10px; color:#fb923c;" id="ammoShotgun">20 Shells</div>
          </div>
        </button>
        <button class="weapon-btn" id="btnW3" onclick="switchWeapon('rifle')">
          <span class="weapon-key">3</span>
          <div>
            <div>Assault Rifle</div>
            <div style="font-size:10px; color:#38bdf8;" id="ammoRifle">90 Ammo</div>
          </div>
        </button>
      </div>
      <div class="hint-bar">
        WASD / Arrows to Move | Aim with Mouse | Left Click / Hold to Fire | 1, 2, 3 to Switch Guns
      </div>
    </div>

    <!-- Wave Cleared Banner -->
    <div class="banner" id="levelCompleteBanner">
      <h2 id="bannerTitle">WAVE 1 CLEARED!</h2>
      <p>+25 Tactical Health Restored • Next wave deploying in <span id="bannerCountdown">3</span>s...</p>
    </div>

    <!-- Game Over Modal -->
    <div id="gameOverModal">
      <div class="modal-box">
        <h1>SOLDIER DEFEATED</h1>
        <p>The zombie swarm overwhelmed the perimeter.</p>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-title">WAVE REACHED</div>
            <div class="stat-number" id="finalWave">Level 1</div>
          </div>
          <div class="stat-item">
            <div class="stat-title">SCORE</div>
            <div class="stat-number" id="finalScore">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-title">ZOMBIES KILLED</div>
            <div class="stat-number" style="color: #ef4444;" id="finalKills">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-title">ACCURACY</div>
            <div class="stat-number" style="color: #38bdf8;" id="finalAcc">0%</div>
          </div>
        </div>
        <button class="btn-restart" onclick="restartGame()">RESTART MISSION</button>
      </div>
    </div>
  </div>

  <script>
    // --- AUDIO SYNTHESIZER (Web Audio API) ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function initAudio() {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    function playSnd(type) {
      try {
        initAudio();
        const t = audioCtx.currentTime;
        if (type === 'pistol') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(360, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.11);
        } else if (type === 'shotgun') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(170, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);
          gain.gain.setValueAtTime(0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.23);
        } else if (type === 'rifle') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(420, t);
          osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.08);
        } else if (type === 'zombieHit') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.09);
        } else if (type === 'pickup') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(540, t);
          osc.frequency.setValueAtTime(820, t + 0.07);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.19);
        } else if (type === 'playerHurt') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, t);
          osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.16);
        }
      } catch (e) {}
    }

    // --- GAME STATE ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    window.addEventListener('resize', () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    });

    const player = {
      x: W / 2,
      y: H / 2,
      radius: 20,
      speed: 4.2,
      hp: 100,
      maxHp: 100,
      rotation: 0,
      recoil: 0,
      flash: 0
    };

    const weapons = {
      pistol: { name: 'Pistol', damage: 22, rate: 260, speed: 14, spread: 0.03, pellets: 1, color: '#FACC15', ammo: -1 },
      shotgun: { name: 'Shotgun', damage: 19, rate: 680, speed: 12, spread: 0.28, pellets: 5, color: '#FB923C', ammo: 20, maxAmmo: 60 },
      rifle: { name: 'Assault Rifle', damage: 17, rate: 110, speed: 16, spread: 0.09, pellets: 1, color: '#38BDF8', ammo: 90, maxAmmo: 240 }
    };

    let activeWeapon = 'pistol';
    let lastShotTime = 0;
    let isMouseDown = false;
    let mousePos = { x: W / 2, y: H / 2 };
    const keys = {};

    let zombies = [];
    let bullets = [];
    let particles = [];
    let decals = [];
    let pickups = [];
    let floatingTexts = [];

    let level = 1;
    let zombiesInWave = 10;
    let zombiesSpawned = 0;
    let zombiesKilled = 0;
    let score = 0;
    let shotsFired = 0;
    let shotsHit = 0;
    let isGameOver = false;
    let isWaveComplete = false;
    let waveCountdown = 0;
    let spawnTimer = 0;
    let screenShake = 0;

    // Obstacles
    const obstacles = [
      { x: W * 0.25, y: H * 0.25, w: 70, h: 70 },
      { x: W * 0.75 - 70, y: H * 0.25, w: 70, h: 70 },
      { x: W * 0.25, y: H * 0.75 - 70, w: 70, h: 70 },
      { x: W * 0.75 - 70, y: H * 0.75 - 70, w: 70, h: 70 }
    ];

    // Input Listeners
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.key === '1') switchWeapon('pistol');
      if (e.key === '2') switchWeapon('shotgun');
      if (e.key === '3') switchWeapon('rifle');
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    });
    window.addEventListener('mousedown', e => {
      if (e.button === 0) { isMouseDown = true; tryShoot(); }
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) isMouseDown = false; });

    function switchWeapon(type) {
      activeWeapon = type;
      document.querySelectorAll('.weapon-btn').forEach(btn => btn.classList.remove('active'));
      if (type === 'pistol') document.getElementById('btnW1').classList.add('active');
      if (type === 'shotgun') document.getElementById('btnW2').classList.add('active');
      if (type === 'rifle') document.getElementById('btnW3').classList.add('active');
    }

    function tryShoot() {
      if (isGameOver || isWaveComplete) return;
      const now = performance.now();
      const w = weapons[activeWeapon];
      if (now - lastShotTime < w.rate) return;

      if (w.ammo !== -1 && w.ammo <= 0) {
        floatingTexts.push({ x: player.x, y: player.y - 30, text: 'NO AMMO!', color: '#EF4444', life: 1 });
        return;
      }

      if (w.ammo > 0) w.ammo--;
      lastShotTime = now;
      shotsFired += w.pellets;

      player.recoil = activeWeapon === 'shotgun' ? 7 : 3;
      player.flash = 4;
      screenShake = activeWeapon === 'shotgun' ? 6 : 2;

      playSnd(activeWeapon);

      const spawnX = player.x + Math.cos(player.rotation) * 30;
      const spawnY = player.y + Math.sin(player.rotation) * 30;

      for (let i = 0; i < w.pellets; i++) {
        let angle = player.rotation;
        if (w.pellets > 1) {
          const step = w.spread / (w.pellets - 1);
          angle = player.rotation - w.spread / 2 + step * i;
        } else {
          angle += (Math.random() - 0.5) * w.spread;
        }
        bullets.push({
          x: spawnX, y: spawnY,
          vx: Math.cos(angle) * w.speed,
          vy: Math.sin(angle) * w.speed,
          damage: w.damage,
          color: w.color,
          radius: 3.5,
          dist: 0,
          maxDist: 850
        });
      }
      updateHUD();
    }

    function checkCollision(x, y, r) {
      for (const o of obstacles) {
        const cx = Math.max(o.x, Math.min(x, o.x + o.w));
        const cy = Math.max(o.y, Math.min(y, o.y + o.h));
        if ((x - cx)**2 + (y - cy)**2 < r * r) return true;
      }
      return false;
    }

    function spawnZombie() {
      zombiesSpawned++;
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (side === 0) { x = Math.random() * W; y = -20; }
      else if (side === 1) { x = W + 20; y = Math.random() * H; }
      else if (side === 2) { x = Math.random() * W; y = H + 20; }
      else { x = -20; y = Math.random() * H; }

      let type = 'walker';
      if (level === 2) type = Math.random() < 0.35 ? 'runner' : 'walker';
      else if (level >= 3) {
        const r = Math.random();
        type = r < 0.25 ? 'heavy' : r < 0.65 ? 'runner' : 'walker';
      }

      let hp = 30 + (level - 1) * 5;
      let speed = 1.6 + (level - 1) * 0.1;
      let radius = 18;
      let color = '#4ADE80';
      let eyeColor = '#EF4444';

      if (type === 'runner') {
        hp = 22 + (level - 1) * 3;
        speed = 3.2 + (level - 1) * 0.12;
        radius = 15;
        color = '#F87171';
        eyeColor = '#FBBF24';
      } else if (type === 'heavy') {
        hp = 110 + (level - 1) * 20;
        speed = 1.1;
        radius = 28;
        color = '#15803D';
        eyeColor = '#DC2626';
      }

      zombies.push({
        x, y, radius, speed, hp, maxHp: hp, type, color, eyeColor,
        rotation: 0, hitFlash: 0, attackCd: 0, wobble: Math.random() * 6
      });
    }

    // --- GAME LOOP ---
    let lastTime = performance.now();
    function gameLoop(now) {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isGameOver) {
        update(delta);
      }
      render();
      requestAnimationFrame(gameLoop);
    }

    function update(delta) {
      if (isMouseDown) tryShoot();

      // Screen shake decay
      if (screenShake > 0) screenShake = Math.max(0, screenShake - delta * 15);
      if (player.recoil > 0) player.recoil = Math.max(0, player.recoil - delta * 20);
      if (player.flash > 0) player.flash--;

      // Movement
      let dx = 0, dy = 0;
      if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      const step = player.speed * (delta * 60);
      const nx = Math.max(30, Math.min(W - 30, player.x + dx * step));
      const ny = Math.max(30, Math.min(H - 30, player.y + dy * step));
      if (!checkCollision(nx, player.y, player.radius)) player.x = nx;
      if (!checkCollision(player.x, ny, player.radius)) player.y = ny;

      // Rotation towards cursor
      player.rotation = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);

      // Spawning
      if (!isWaveComplete && zombiesSpawned < zombiesInWave) {
        spawnTimer += delta;
        const interval = Math.max(0.4, 1.5 - (level - 1) * 0.15);
        if (spawnTimer >= interval) {
          spawnTimer = 0;
          spawnZombie();
        }
      }

      // Update Zombies
      for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        if (z.hitFlash > 0) z.hitFlash--;
        if (z.attackCd > 0) z.attackCd -= delta;
        z.wobble += delta * 6;

        const ang = Math.atan2(player.y - z.y, player.x - z.x);
        z.rotation = ang;

        let zStep = z.speed * (delta * 60);
        let tx = z.x + Math.cos(ang) * zStep;
        let ty = z.y + Math.sin(ang) * zStep;
        if (checkCollision(tx, z.y, z.radius)) tx = z.x;
        if (checkCollision(z.x, ty, z.radius)) ty = z.y;
        z.x = tx; z.y = ty;

        // Attack Soldier
        const dist = Math.hypot(player.x - z.x, player.y - z.y);
        if (dist < player.radius + z.radius && z.attackCd <= 0) {
          const dmg = z.type === 'heavy' ? 24 : z.type === 'runner' ? 10 : 15;
          player.hp = Math.max(0, player.hp - dmg);
          z.attackCd = 0.8;
          screenShake = 6;
          playSnd('playerHurt');
          decals.push({ x: player.x, y: player.y, r: 20, color: '#991B1B', alpha: 0.7 });
          updateHUD();
          if (player.hp <= 0) { gameOver(); return; }
        }
      }

      // Update Bullets
      for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const b = bullets[bIndex];
        b.x += b.vx; b.y += b.vy;
        b.dist += Math.hypot(b.vx, b.vy);

        if (b.dist > b.maxDist || b.x < 0 || b.x > W || b.y < 0 || b.y > H || checkCollision(b.x, b.y, b.radius)) {
          bullets.splice(bIndex, 1);
          continue;
        }

        let hit = false;
        for (let zIndex = zombies.length - 1; zIndex >= 0; zIndex--) {
          const z = zombies[zIndex];
          if (Math.hypot(b.x - z.x, b.y - z.y) < b.radius + z.radius) {
            hit = true;
            shotsHit++;
            z.hp -= b.damage;
            z.hitFlash = 5;
            playSnd('zombieHit');

            // Blood particles
            for (let p = 0; p < 4; p++) {
              particles.push({
                x: b.x, y: b.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 2,
                color: '#991B1B', life: 1
              });
            }

            if (z.hp <= 0) {
              zombiesKilled++;
              score += z.type === 'heavy' ? 300 : z.type === 'runner' ? 150 : 100;
              decals.push({ x: z.x, y: z.y, r: z.radius * 1.5, color: '#7F1D1D', alpha: 0.65 });

              // Drop chance
              if (Math.random() < 0.45) {
                const pType = Math.random() < 0.4 ? 'shotgun' : Math.random() < 0.8 ? 'rifle' : 'medkit';
                pickups.push({ x: z.x, y: z.y, type: pType, life: 25 });
              }
              zombies.splice(zIndex, 1);
            }
            break;
          }
        }
        if (hit) bullets.splice(bIndex, 1);
      }

      // Pickups check
      for (let pIndex = pickups.length - 1; pIndex >= 0; pIndex--) {
        const p = pickups[pIndex];
        p.life -= delta;
        if (p.life <= 0) { pickups.splice(pIndex, 1); continue; }

        if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + 18) {
          playSnd('pickup');
          if (p.type === 'shotgun') {
            weapons.shotgun.ammo = Math.min(60, weapons.shotgun.ammo + 8);
            floatingTexts.push({ x: p.x, y: p.y, text: '+8 SHELLS', color: '#FB923C', life: 1 });
          } else if (p.type === 'rifle') {
            weapons.rifle.ammo = Math.min(240, weapons.rifle.ammo + 30);
            floatingTexts.push({ x: p.x, y: p.y, text: '+30 RIFLE AMMO', color: '#38BDF8', life: 1 });
          } else {
            player.hp = Math.min(100, player.hp + 25);
            floatingTexts.push({ x: p.x, y: p.y, text: '+25 HEALTH', color: '#22C55E', life: 1 });
          }
          pickups.splice(pIndex, 1);
          updateHUD();
        }
      }

      // Check Wave Cleared
      if (!isWaveComplete && zombiesSpawned >= zombiesInWave && zombies.length === 0) {
        isWaveComplete = true;
        waveCountdown = 3.2;
        player.hp = Math.min(100, player.hp + 25);
        document.getElementById('bannerTitle').innerText = 'WAVE ' + level + ' CLEARED!';
        document.getElementById('levelCompleteBanner').style.display = 'block';
        updateHUD();
      }

      if (isWaveComplete) {
        waveCountdown -= delta;
        document.getElementById('bannerCountdown').innerText = Math.ceil(waveCountdown);
        if (waveCountdown <= 0) {
          isWaveComplete = false;
          level++;
          zombiesInWave = Math.floor(10 + Math.pow(level - 1, 1.35) * 6);
          zombiesSpawned = 0;
          document.getElementById('levelCompleteBanner').style.display = 'none';
          updateHUD();
        }
      }

      // Update Particles & Floating Text
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= delta * 2;
        if (p.life <= 0) particles.splice(i, 1);
      }
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= delta * 30;
        ft.life -= delta * 1.5;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      }

      updateHUD();
    }

    function render() {
      ctx.save();
      if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake * 2, (Math.random() - 0.5) * screenShake * 2);
      }

      // Background Grid
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Perimeter Danger Border
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Decals
      for (const d of decals) {
        ctx.save();
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Pickups
      for (const p of pickups) {
        ctx.save();
        ctx.fillStyle = p.type === 'shotgun' ? '#FB923C' : p.type === 'rifle' ? '#38BDF8' : '#22C55E';
        ctx.fillRect(p.x - 9, p.y - 9, 18, 18);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.type === 'medkit' ? '+' : 'A', p.x, p.y + 4);
        ctx.restore();
      }

      // Obstacles
      ctx.fillStyle = '#374151';
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 3;
      for (const o of obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeRect(o.x, o.y, o.w, o.h);
      }

      // Zombies
      for (const z of zombies) {
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(z.rotation);

        const color = z.hitFlash > 0 ? '#FFFFFF' : z.color;
        // Arms
        ctx.fillStyle = color;
        ctx.fillRect(z.radius * 0.2, -z.radius * 0.8, z.radius * 1.1, z.radius * 0.35);
        ctx.fillRect(z.radius * 0.2, z.radius * 0.45, z.radius * 1.1, z.radius * 0.35);

        // Body
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = z.eyeColor;
        ctx.beginPath();
        ctx.arc(z.radius * 0.5, -z.radius * 0.3, 3, 0, Math.PI * 2);
        ctx.arc(z.radius * 0.5, z.radius * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        ctx.rotate(-z.rotation);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-z.radius, -z.radius - 8, z.radius * 2, 4);
        ctx.fillStyle = z.type === 'heavy' ? '#3B82F6' : z.type === 'runner' ? '#EF4444' : '#22C55E';
        ctx.fillRect(-z.radius, -z.radius - 8, (z.radius * 2) * (z.hp / z.maxHp), 4);

        ctx.restore();
      }

      // Soldier (Player)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.rotation);
      if (player.recoil > 0) ctx.translate(-player.recoil, 0);

      // Gun barrel
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(8, -3.5, 24, 7);
      if (activeWeapon === 'shotgun') { ctx.fillStyle = '#FB923C'; ctx.fillRect(14, -4.5, 8, 9); }
      if (activeWeapon === 'rifle') { ctx.fillStyle = '#38BDF8'; ctx.fillRect(10, 3, 5, 8); }

      // Flash
      if (player.flash > 0) {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.moveTo(32, 0); ctx.lineTo(46, -8); ctx.lineTo(40, 0); ctx.lineTo(46, 8);
        ctx.closePath(); ctx.fill();
      }

      // Hands
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(14, -10, 5, 0, Math.PI * 2);
      ctx.arc(22, 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Body (Camouflage Blue / Green Soldier)
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0284C7';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, player.radius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#15803D';
      ctx.fill();

      // Helmet & Visor
      ctx.beginPath();
      ctx.arc(0, 0, player.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0369A1';
      ctx.fill();
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(3, -4, 4, 8);

      ctx.restore();

      // Bullets
      for (const b of bullets) {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 0.5, b.y - b.vy * 0.5);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Flashlight Ambient Darkness
      const darkGrad = ctx.createRadialGradient(player.x, player.y, 40, player.x, player.y, 500);
      darkGrad.addColorStop(0, 'rgba(0,0,0,0)');
      darkGrad.addColorStop(0.8, 'rgba(3,7,18,0.55)');
      darkGrad.addColorStop(1, 'rgba(3,7,18,0.85)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, W, H);

      // Floating Texts
      for (const ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
    }

    function updateHUD() {
      document.getElementById('healthNum').innerText = Math.ceil(player.hp) + ' / 100';
      document.getElementById('healthBarFill').style.width = Math.max(0, player.hp) + '%';
      document.getElementById('healthBarFill').style.background = player.hp > 60 ? '#10B981' : player.hp > 30 ? '#F59E0B' : '#EF4444';

      document.getElementById('waveNum').innerText = 'LEVEL ' + level;
      document.getElementById('zombiesNum').innerText = Math.max(0, zombiesInWave - zombiesKilled);
      document.getElementById('scoreNum').innerText = score;

      document.getElementById('ammoShotgun').innerText = weapons.shotgun.ammo + ' Shells';
      document.getElementById('ammoRifle').innerText = weapons.rifle.ammo + ' Ammo';
    }

    function gameOver() {
      isGameOver = true;
      document.getElementById('finalWave').innerText = 'Level ' + level;
      document.getElementById('finalScore').innerText = score;
      document.getElementById('finalKills').innerText = zombiesKilled;
      const acc = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
      document.getElementById('finalAcc').innerText = acc + '%';
      document.getElementById('gameOverModal').style.display = 'flex';
    }

    function restartGame() {
      player.x = W / 2;
      player.y = H / 2;
      player.hp = 100;
      weapons.shotgun.ammo = 20;
      weapons.rifle.ammo = 90;
      activeWeapon = 'pistol';
      switchWeapon('pistol');

      zombies = [];
      bullets = [];
      particles = [];
      decals = [];
      pickups = [];
      floatingTexts = [];

      level = 1;
      zombiesInWave = 10;
      zombiesSpawned = 0;
      zombiesKilled = 0;
      score = 0;
      shotsFired = 0;
      shotsHit = 0;
      isGameOver = false;
      isWaveComplete = false;

      document.getElementById('gameOverModal').style.display = 'none';
      document.getElementById('levelCompleteBanner').style.display = 'none';
      updateHUD();
    }

    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;
}
