/**
 * Zilzal Flappy Falcon / Jet Arcade Game
 */
const FlappyGame = (() => {
  let canvas, ctx;
  let bird = { x: 60, y: 150, vy: 0, gravity: 0.38, jump: -6.5, radius: 12 };
  let pipes = [];
  let score = 0;
  let animationId = null;
  let isRunning = false;
  let frame = 0;

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><i class="fas fa-trophy" style="color:#f5b700;"></i> السكور: <span id="flappy-score">0</span></div>
        <div class="hud-stat"><i class="fas fa-crown" style="color:#ffd166;"></i> أفضل سكور: <span id="flappy-best">${window.AuthService.getHighScore('flappy')}</span></div>
        <button class="btn btn-gold" id="btn-flappy-start" style="padding:6px 14px; font-size:0.85rem;"><i class="fas fa-play"></i> طيران 🚀</button>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="flappy-canvas" width="380" height="420" class="game-canvas"></canvas>
      </div>
      <div style="text-align:center; margin-top:12px;">
        <button class="btn btn-outline" id="btn-flappy-tap" style="width:100%; max-width:320px; font-size:1.1rem; padding:12px;"><i class="fas fa-arrow-up"></i> اضغط للطيران أو المسافة (Space)</button>
      </div>
    `;

    canvas = document.getElementById('flappy-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('btn-flappy-start').addEventListener('click', start);
    document.getElementById('btn-flappy-tap').addEventListener('click', flap);
    canvas.addEventListener('click', flap);
    document.addEventListener('keydown', handleKey);

    drawWelcome();
  }

  function drawWelcome() {
    ctx.fillStyle = '#070a10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 20px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('انقر للشروع في الطيران ⚡🚀', canvas.width / 2, canvas.height / 2);
  }

  function start() {
    if (animationId) cancelAnimationFrame(animationId);
    bird.y = 180;
    bird.vy = 0;
    pipes = [];
    score = 0;
    frame = 0;
    isRunning = true;
    updateScore();
    loop();
    window.SoundEngine && window.SoundEngine.play('click');
  }

  function flap() {
    if (!isRunning) {
      start();
      return;
    }
    bird.vy = bird.jump;
    window.SoundEngine && window.SoundEngine.play('click');
  }

  function handleKey(e) {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  }

  function loop() {
    if (!isRunning) return;
    frame++;

    // Update Bird
    bird.vy += bird.gravity;
    bird.y += bird.vy;

    // Spawn pipes
    if (frame % 90 === 0) {
      const gap = 120;
      const topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 40;
      pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - (topHeight + gap),
        passed: false
      });
    }

    // Move pipes
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].x -= 2.2;

      // Score
      if (!pipes[i].passed && pipes[i].x + 40 < bird.x) {
        pipes[i].passed = true;
        score++;
        updateScore();
        window.SoundEngine && window.SoundEngine.play('score');
      }

      // Collision
      if (
        bird.x + bird.radius > pipes[i].x &&
        bird.x - bird.radius < pipes[i].x + 45
      ) {
        if (bird.y - bird.radius < pipes[i].top || bird.y + bird.radius > canvas.height - pipes[i].bottom) {
          gameOver();
          return;
        }
      }
    }

    // Remove offscreen pipes
    pipes = pipes.filter(p => p.x > -50);

    // Floor / Ceiling collision
    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
      gameOver();
      return;
    }

    draw();
    animationId = requestAnimationFrame(loop);
  }

  function updateScore() {
    const el = document.getElementById('flappy-score');
    if (el) el.textContent = score;
  }

  function draw() {
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Pipes with Neon Borders
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f5b700';
    pipes.forEach(p => {
      // Top pipe
      ctx.fillStyle = 'rgba(245, 183, 0, 0.15)';
      ctx.fillRect(p.x, 0, 45, p.top);
      ctx.strokeStyle = '#f5b700';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, 0, 45, p.top);

      // Bottom pipe
      ctx.fillRect(p.x, canvas.height - p.bottom, 45, p.bottom);
      ctx.strokeRect(p.x, canvas.height - p.bottom, 45, p.bottom);
    });

    // Draw Falcon / Jet Bird
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Jet Engine Trail
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(bird.x - 12, bird.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  function gameOver() {
    isRunning = false;
    window.SoundEngine && window.SoundEngine.play('gameover');
    const result = window.AuthService.saveGameScore('flappy', score);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 26px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('تحطم الصقر! 💥', canvas.width / 2, canvas.height / 2 - 25);

    ctx.fillStyle = '#ffd166';
    ctx.font = '18px Cairo';
    ctx.fillText(`سكورك: ${score} | ربحت +${result.earned} نقطة! 🎁`, canvas.width / 2, canvas.height / 2 + 15);

    document.getElementById('flappy-best').textContent = result.highscore;
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    document.removeEventListener('keydown', handleKey);
    isRunning = false;
  }

  return { init, destroy };
})();

window.FlappyGame = FlappyGame;
