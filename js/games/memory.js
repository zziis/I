/**
 * Zilzal Memory Match Cards Game
 */
const MemoryGame = (() => {
  const icons = ['👑', '⚡', '🎮', '💎', '🚀', '🦁', '🔥', '🏆'];
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let isLocked = false;

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><i class="fas fa-hand-pointer" style="color:#f5b700;"></i> الحركات: <span id="mem-moves">0</span></div>
        <div class="hud-stat"><i class="fas fa-check-circle" style="color:#00ff88;"></i> التطابقات: <span id="mem-matches">0/8</span></div>
        <button class="btn btn-gold" id="btn-mem-restart" style="padding:6px 14px; font-size:0.85rem;"><i class="fas fa-redo"></i> إعادة</button>
      </div>
      <div class="game-canvas-wrap" style="padding:20px;">
        <div class="memory-grid" id="mem-grid"></div>
      </div>
    `;

    document.getElementById('btn-mem-restart').addEventListener('click', start);
    start();
  }

  function start() {
    cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;

    updateHUD();

    const grid = document.getElementById('mem-grid');
    grid.innerHTML = '';

    cards.forEach((icon, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card-item';
      card.dataset.index = index;
      card.dataset.icon = icon;
      card.innerHTML = `<span style="opacity:0;">${icon}</span>`;
      card.addEventListener('click', () => handleCardClick(card));
      grid.appendChild(card);
    });
  }

  function handleCardClick(card) {
    if (isLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    card.querySelector('span').style.opacity = '1';
    flippedCards.push(card);
    window.SoundEngine && window.SoundEngine.play('click');

    if (flippedCards.length === 2) {
      moves++;
      updateHUD();
      checkForMatch();
    }
  }

  function checkForMatch() {
    isLocked = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.icon === card2.dataset.icon) {
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];
        matchedPairs++;
        updateHUD();
        window.SoundEngine && window.SoundEngine.play('score');
        isLocked = false;

        if (matchedPairs === 8) {
          gameWon();
        }
      }, 400);
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.querySelector('span').style.opacity = '0';
        card2.querySelector('span').style.opacity = '0';
        flippedCards = [];
        isLocked = false;
      }, 900);
    }
  }

  function updateHUD() {
    document.getElementById('mem-moves').textContent = moves;
    document.getElementById('mem-matches').textContent = `${matchedPairs}/8`;
  }

  function gameWon() {
    window.SoundEngine && window.SoundEngine.play('win');
    const score = Math.max(10, 100 - moves * 3);
    const result = window.AuthService.saveGameScore('memory', score);

    setTimeout(() => {
      alert(`🎉 كفو عليك يا بطل! أنهيت التحدي في ${moves} حركة وحصلت على +${result.earned} نقطة! 👑`);
    }, 300);
  }

  function destroy() {
    flippedCards = [];
    isLocked = false;
  }

  return { init, destroy };
})();

window.MemoryGame = MemoryGame;
