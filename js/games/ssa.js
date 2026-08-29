/**
 * Zilzal Neon Dodge / Space Arcade Game
 * لعبة تفادي النيازك - مشابهة في الهيكل للعبة FlappyGame
 */
const NeonDodgeGame = (() => {
  let canvas, ctx;
  let player;
  let meteors = [];
  let score = 0;
  let animationId = null;
  let isRunning = false;
  let frame = 0;
  let keys = {};

  const GAME_WIDTH = 380;
  const GAME_HEIGHT = 420;

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat">
          <i class="fas fa-star" style="color:#f5b700;"></i>
          السكور:
          <span id="dodge-score">0</span>
        </div>

        <div class="hud-stat">
          <i class="fas fa-crown" style="color:#ffd166;"></i>
          أفضل سكور:
          <span id="dodge-best">
            ${window.AuthService.getHighScore('neon-dodge')}
          </span>
        </div>

        <button
          class="btn btn-gold"
          id="btn-dodge-start"
          style="padding:6px 14px; font-size:0.85rem;"
        >
          <i class="fas fa-play"></i> ابدأ
        </button>
      </div>

      <div class="game-canvas-wrap">
        <canvas
          id="dodge-canvas"
          width="${GAME_WIDTH}"
          height="${GAME_HEIGHT}"
          class="game-canvas"
        ></canvas>
      </div>

      <div style="text-align:center; margin-top:12px;">
        <button
          class="btn btn-outline"
          id="btn-dodge-left"
          style="width:45%; max-width:150px; font-size:1.1rem; padding:12px;"
        >
          <i class="fas fa-arrow-right"></i> يمين
        </button>

        <button
          class="btn btn-outline"
          id="btn-dodge-right"
          style="width:45%; max-width:150px; font-size:1.1rem; padding:12px;"
        >
          <i class="fas fa-arrow-left"></i> يسار
        </button>
      </div>

      <div style="
        text-align:center;
        color:#888;
        font-size:0.85rem;
        margin-top:8px;
      ">
        استخدم ← → أو A / D للتحرك
      </div>
    `;

    canvas = document.getElementById('dodge-canvas');
    ctx = canvas.getContext('2d');

    player = {
      x: GAME_WIDTH / 2 - 18,
      y: GAME_HEIGHT - 65,
      width: 36,
      height: 42,
      speed: 5
    };

    document
      .getElementById('btn-dodge-start')
      .addEventListener('click', start);

    document
      .getElementById('btn-dodge-left')
      .addEventListener('click', () => movePlayer(-1));

    document
      .getElementById('btn-dodge-right')
      .addEventListener('click', () => movePlayer(1));

    canvas.addEventListener('click', () => {
      if (!isRunning) start();
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    drawWelcome();
  }

  function drawWelcome() {
    ctx.fillStyle = '#03050b';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawStars();

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 24px Cairo';
    ctx.textAlign = 'center';

    ctx.fillText(
      'NEON DODGE',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 30
    );

    ctx.fillStyle = '#ffd166';
    ctx.font = '16px Cairo';

    ctx.fillText(
      'تجنب النيازك ⚡',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 5
    );

    ctx.fillStyle = '#888';
    ctx.font = '13px Cairo';

    ctx.fillText(
      'اضغط ابدأ للعب',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 35
    );
  }

  function start() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    player.x = GAME_WIDTH / 2 - player.width / 2;

    meteors = [];
    score = 0;
    frame = 0;
    isRunning = true;

    updateScore();

    window.SoundEngine &&
      window.SoundEngine.play('click');

    loop();
  }

  function handleKeyDown(e) {
    keys[e.code] = true;

    if (
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'KeyA' ||
      e.code === 'KeyD'
    ) {
      e.preventDefault();
    }

    if (e.code === 'Space' && !isRunning) {
      e.preventDefault();
      start();
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  function movePlayer(direction) {
    if (!isRunning) {
      start();
      return;
    }

    player.x += direction * 35;

    if (player.x < 0) {
      player.x = 0;
    }

    if (player.x + player.width > GAME_WIDTH) {
      player.x = GAME_WIDTH - player.width;
    }

    window.SoundEngine &&
      window.SoundEngine.play('click');
  }

  function updatePlayer() {
    let direction = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) {
      direction -= 1;
    }

    if (keys['ArrowRight'] || keys['KeyD']) {
      direction += 1;
    }

    player.x += direction * player.speed;

    // حدود الشاشة
    if (player.x < 0) {
      player.x = 0;
    }

    if (player.x + player.width > GAME_WIDTH) {
      player.x = GAME_WIDTH - player.width;
    }
  }

  function spawnMeteor() {
    // كلما ارتفع السكور تزيد الصعوبة
    const difficulty = Math.min(score * 0.03, 2);

    const size =
      Math.floor(Math.random() * 20) + 18;

    meteors.push({
      x: Math.random() * (GAME_WIDTH - size),
      y: -size,
      size: size,

      speed:
        2.5 +
        Math.random() * 2 +
        difficulty,

      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        (Math.random() - 0.5) * 0.08
    });
  }

  function updateMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const meteor = meteors[i];

      meteor.y += meteor.speed;
      meteor.rotation += meteor.rotationSpeed;

      // احتساب النقاط عند تجاوز اللاعب
      if (!meteor.passed &&
          meteor.y > GAME_HEIGHT) {

        meteor.passed = true;

        score++;

        updateScore();

        window.SoundEngine &&
          window.SoundEngine.play('score');
      }

      // حذف النيزك
      if (meteor.y > GAME_HEIGHT + 50) {
        meteors.splice(i, 1);
        continue;
      }

      // التصادم
      if (checkCollision(player, meteor)) {
        gameOver();
        return;
      }
    }
  }

  function checkCollision(p, m) {
    const meteorX = m.x + m.size / 2;
    const meteorY = m.y + m.size / 2;

    const playerX =
      p.x + p.width / 2;

    const playerY =
      p.y + p.height / 2;

    const dx = meteorX - playerX;
    const dy = meteorY - playerY;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    const collisionDistance =
      m.size / 2 + Math.min(p.width, p.height) / 2 - 6;

    return distance < collisionDistance;
  }

  function loop() {
    if (!isRunning) return;

    frame++;

    updatePlayer();

    // Spawn rate
    const spawnRate =
      Math.max(22, 65 - Math.floor(score / 3));

    if (frame % spawnRate === 0) {
      spawnMeteor();

      // أحياناً يظهر نيزكان
      if (score > 15 && Math.random() < 0.25) {
        spawnMeteor();
      }
    }

    updateMeteors();

    if (!isRunning) return;

    draw();

    animationId =
      requestAnimationFrame(loop);
  }

  function updateScore() {
    const el =
      document.getElementById('dodge-score');

    if (el) {
      el.textContent = score;
    }
  }

  function draw() {
    // Background
    ctx.fillStyle = '#03050b';
    ctx.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    drawStars();

    drawMeteors();

    drawPlayer();

    // Neon border
    ctx.strokeStyle = 'rgba(0,240,255,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      1,
      1,
      GAME_WIDTH - 2,
      GAME_HEIGHT - 2
    );
  }

  function drawStars() {
    ctx.fillStyle = '#ffffff';

    // نجوم بسيطة تتحرك بصرياً حسب frame
    for (let i = 0; i < 45; i++) {
      const x =
        (i * 83) % GAME_WIDTH;

      const y =
        ((i * 47 + frame * (1 + i % 3)) %
          GAME_HEIGHT);

      const size =
        i % 5 === 0 ? 2 : 1;

      ctx.globalAlpha =
        0.25 + (i % 5) * 0.1;

      ctx.fillRect(
        x,
        y,
        size,
        size
      );
    }

    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const x = player.x;
    const y = player.y;

    // Glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f0ff';

    // جسم المركبة
    ctx.fillStyle = '#00f0ff';

    ctx.beginPath();

    ctx.moveTo(
      x + player.width / 2,
      y
    );

    ctx.lineTo(
      x + player.width,
      y + player.height
    );

    ctx.lineTo(
      x + player.width / 2,
      y + player.height - 10
    );

    ctx.lineTo(
      x,
      y + player.height
    );

    ctx.closePath();

    ctx.fill();

    // الزجاج
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ffffff';

    ctx.fillStyle = '#07111c';

    ctx.beginPath();

    ctx.arc(
      x + player.width / 2,
      y + 17,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // محرك النار
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';

    ctx.fillStyle =
      frame % 8 < 4
        ? '#ff0055'
        : '#ffd166';

    ctx.beginPath();

    ctx.moveTo(
      x + 10,
      y + player.height - 2
    );

    ctx.lineTo(
      x + 18,
      y + player.height +
        15 +
        Math.random() * 8
    );

    ctx.lineTo(
      x + 26,
      y + player.height - 2
    );

    ctx.closePath();

    ctx.fill();

    ctx.shadowBlur = 0;
  }

  function drawMeteors() {
    meteors.forEach(meteor => {
      const centerX =
        meteor.x + meteor.size / 2;

      const centerY =
        meteor.y + meteor.size / 2;

      ctx.save();

      ctx.translate(
        centerX,
        centerY
      );

      ctx.rotate(
        meteor.rotation
      );

      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0055';

      // نيزك
      ctx.fillStyle = '#ff1744';

      ctx.beginPath();

      const points = 8;

      for (let i = 0; i < points; i++) {
        const angle =
          (Math.PI * 2 * i) / points;

        const radius =
          meteor.size / 2 *
          (0.75 +
            Math.random() * 0.25);

        const px =
          Math.cos(angle) * radius;

        const py =
          Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fill();

      // قلب النيزك
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff6b35';

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        meteor.size * 0.22,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();
    });
  }

  function gameOver() {
    isRunning = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    window.SoundEngine &&
      window.SoundEngine.play('gameover');

    const result =
      window.AuthService.saveGameScore(
        'neon-dodge',
        score
      );

    // Overlay
    ctx.fillStyle =
      'rgba(0, 0, 0, 0.88)';

    ctx.fillRect(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';

    ctx.fillStyle = '#ff0055';

    ctx.font =
      'bold 27px Cairo';

    ctx.textAlign = 'center';

    ctx.fillText(
      'اصطدمت! 💥',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 35
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffd166';

    ctx.font = '18px Cairo';

    ctx.fillText(
      `سكورك: ${score}`,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 5
    );

    ctx.fillStyle = '#00f0ff';

    ctx.font = '15px Cairo';

    ctx.fillText(
      `ربحت +${result.earned} نقطة! 🎁`,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 35
    );

    const best =
      document.getElementById(
        'dodge-best'
      );

    if (best) {
      best.textContent =
        result.highscore;
    }
  }

  function destroy() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    document.removeEventListener(
      'keydown',
      handleKeyDown
    );

    document.removeEventListener(
      'keyup',
      handleKeyUp
    );

    isRunning = false;
    meteors = [];
  }

  return {
    init,
    destroy
  };
})();

window.NeonDodgeGame = NeonDodgeGame;
