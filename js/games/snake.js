/**
 * Zilzal Neon Snake Game
 */
const SnakeGame = (() => {
  let canvas, ctx;
  let snake = [];
  let food = {};
  let dx = 20, dy = 0;
  let score = 0;
  let gameInterval = null;
  let isRunning = false;
  const gridSize = 20;

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><i class="fas fa-trophy" style="color:#f5b700;"></i> السكور: <span id="snake-score">0</span></div>
        <div class="hud-stat"><i class="fas fa-crown" style="color:#ffd166;"></i> أفضل سكور: <span id="snake-best">${window.AuthService.getHighScore('snake')}</span></div>
        <button class="btn btn-gold" id="btn-snake-start" style="padding:6px 14px; font-size:0.85rem;"><i class="fas fa-play"></i> ابدأ اللعب</button>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="snake-canvas" width="400" height="400" class="game-canvas"></canvas>
      </div>
      <div class="mobile-controls">
        <div></div>
        <button class="ctrl-btn" id="s-up"><i class="fas fa-arrow-up"></i></button>
        <div></div>
        <button class="ctrl-btn" id="s-left"><i class="fas fa-arrow-right"></i></button>
        <button class="ctrl-btn" id="s-down"><i class="fas fa-arrow-down"></i></button>
        <button class="ctrl-btn" id="s-right"><i class="fas fa-arrow-left"></i></button>
      </div>
    `;

    canvas = document.getElementById('snake-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('btn-snake-start').addEventListener('click', start);
    
    // Controls
    document.addEventListener('keydown', handleKey);
    document.getElementById('s-up').addEventListener('click', () => changeDirection(0, -gridSize));
    document.getElementById('s-down').addEventListener('click', () => changeDirection(0, gridSize));
    document.getElementById('s-left').addEventListener('click', () => changeDirection(gridSize, 0)); // RTL right/left
    document.getElementById('s-right').addEventListener('click', () => changeDirection(-gridSize, 0));

    drawWelcome();
  }

  function drawWelcome() {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 20px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('اضغط "ابدأ اللعب" للبدء 🐍⚡', canvas.width / 2, canvas.height / 2);
  }

  function start() {
    if (gameInterval) clearInterval(gameInterval);
    snake = [
      { x: 160, y: 200 },
      { x: 140, y: 200 },
      { x: 120, y: 200 }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    updateScore();
    spawnFood();
    isRunning = true;
    gameInterval = setInterval(gameLoop, 110);
    window.SoundEngine && window.SoundEngine.play('click');
  }

  function gameLoop() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wrap around borders
    if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;
    if (head.y >= canvas.height) head.y = 0;

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      spawnFood();
      window.SoundEngine && window.SoundEngine.play('score');
    } else {
      snake.pop();
    }

    draw();
  }

  function changeDirection(newDx, newDy) {
    if (!isRunning) return;
    if ((newDx === -dx && newDx !== 0) || (newDy === -dy && newDy !== 0)) return;
    dx = newDx;
    dy = newDy;
  }

  function handleKey(e) {
    if (!isRunning) return;
    switch (e.key) {
      case 'ArrowUp': case 'w': changeDirection(0, -gridSize); e.preventDefault(); break;
      case 'ArrowDown': case 's': changeDirection(0, gridSize); e.preventDefault(); break;
      case 'ArrowLeft': case 'a': changeDirection(-gridSize, 0); e.preventDefault(); break;
      case 'ArrowRight': case 'd': changeDirection(gridSize, 0); e.preventDefault(); break;
    }
  }

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
  }

  function updateScore() {
    const el = document.getElementById('snake-score');
    if (el) el.textContent = score;
  }

  function draw() {
    // Clear background
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(245, 183, 0, 0.04)';
    for (let i = 0; i < canvas.width; i += gridSize) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw Food (Glowing Neon Apple)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    snake.forEach((part, index) => {
      ctx.shadowBlur = index === 0 ? 20 : 10;
      ctx.shadowColor = index === 0 ? '#ffd166' : '#f5b700';
      ctx.fillStyle = index === 0 ? '#ffd166' : '#f5b700';
      ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });

    ctx.shadowBlur = 0;
  }

  function gameOver() {
    clearInterval(gameInterval);
    isRunning = false;
    window.SoundEngine && window.SoundEngine.play('gameover');
    
    const result = window.AuthService.saveGameScore('snake', score);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 26px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('انتهت اللعبة! 💥', canvas.width / 2, canvas.height / 2 - 25);

    ctx.fillStyle = '#ffd166';
    ctx.font = '18px Cairo';
    ctx.fillText(`سكورك: ${score} | ربحت +${result.earned} نقطة! 🎁`, canvas.width / 2, canvas.height / 2 + 15);

    document.getElementById('snake-best').textContent = result.highscore;
  }

  function destroy() {
    if (gameInterval) clearInterval(gameInterval);
    document.removeEventListener('keydown', handleKey);
    isRunning = false;
  }

  return { init, destroy };
})();

window.SnakeGame = SnakeGame;
