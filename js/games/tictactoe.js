/**
 * Zilzal AI Tic-Tac-Toe Game
 */
const TicTacToeGame = (() => {
  let board = Array(9).fill('');
  let isGameOver = false;
  let userScore = 0;
  let aiScore = 0;

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><i class="fas fa-user" style="color:#f5b700;"></i> أنت (X): <span id="ttt-user-score">${userScore}</span></div>
        <div class="hud-stat"><i class="fas fa-robot" style="color:#ff0055;"></i> الذكاء (O): <span id="ttt-ai-score">${aiScore}</span></div>
        <button class="btn btn-gold" id="btn-ttt-restart" style="padding:6px 14px; font-size:0.85rem;"><i class="fas fa-redo"></i> جولة جديدة</button>
      </div>
      <div class="game-canvas-wrap" style="padding:20px; flex-direction:column;">
        <div class="ttt-grid" id="ttt-grid"></div>
        <div id="ttt-status" style="margin-top:16px; font-weight:800; font-size:1.1rem; color:#ffd166; text-align:center;">دورك للعب (X)</div>
      </div>
    `;

    document.getElementById('btn-ttt-restart').addEventListener('click', start);
    start();
  }

  function start() {
    board = Array(9).fill('');
    isGameOver = false;
    document.getElementById('ttt-status').textContent = 'دورك للعب (X) ⚡';

    const grid = document.getElementById('ttt-grid');
    grid.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => handleCellClick(i));
      grid.appendChild(cell);
    }
  }

  function handleCellClick(index) {
    if (board[index] !== '' || isGameOver) return;

    // User move
    makeMove(index, 'X');
    window.SoundEngine && window.SoundEngine.play('click');

    const winner = checkWinner(board);
    if (winner) {
      endGame(winner);
      return;
    }

    if (board.every(cell => cell !== '')) {
      endGame('draw');
      return;
    }

    // AI Move
    document.getElementById('ttt-status').textContent = 'الذكاء الاصطناعي يفكر... 🤖';
    setTimeout(() => {
      aiMove();
      const aiWinner = checkWinner(board);
      if (aiWinner) {
        endGame(aiWinner);
      } else if (board.every(cell => cell !== '')) {
        endGame('draw');
      } else {
        document.getElementById('ttt-status').textContent = 'دورك للعب (X) ⚡';
      }
    }, 450);
  }

  function makeMove(index, player) {
    board[index] = player;
    const cells = document.querySelectorAll('.ttt-cell');
    if (cells[index]) {
      cells[index].textContent = player;
      cells[index].classList.add(player.toLowerCase());
    }
  }

  function aiMove() {
    // Minimax or smart rule
    let bestMove = -1;

    // 1. Can AI Win?
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        if (checkWinner(board) === 'O') { bestMove = i; board[i] = ''; break; }
        board[i] = '';
      }
    }

    // 2. Can User Win? (Block)
    if (bestMove === -1) {
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          if (checkWinner(board) === 'X') { bestMove = i; board[i] = ''; break; }
          board[i] = '';
        }
      }
    }

    // 3. Take Center
    if (bestMove === -1 && board[4] === '') bestMove = 4;

    // 4. Random Corner / Empty
    if (bestMove === -1) {
      const emptyCells = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      if (emptyCells.length > 0) {
        bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    if (bestMove !== -1) {
      makeMove(bestMove, 'O');
      window.SoundEngine && window.SoundEngine.play('score');
    }
  }

  function checkWinner(b) {
    const winLines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let [x, y, z] of winLines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
    }
    return null;
  }

  function endGame(winner) {
    isGameOver = true;
    const status = document.getElementById('ttt-status');

    if (winner === 'X') {
      userScore++;
      document.getElementById('ttt-user-score').textContent = userScore;
      status.innerHTML = '🎉 <span style="color:#00ff88;">فزت على الذكاء الاصطناعي! +30 نقطة</span>';
      window.SoundEngine && window.SoundEngine.play('win');
      window.AuthService.addPoints(30);
    } else if (winner === 'O') {
      aiScore++;
      document.getElementById('ttt-ai-score').textContent = aiScore;
      status.innerHTML = '💥 <span style="color:#ff0055;">فاز الذكاء الاصطناعي! حظ أوفر بالجولة القادمة</span>';
      window.SoundEngine && window.SoundEngine.play('gameover');
    } else {
      status.innerHTML = '🤝 <span style="color:#ffd166;">تعادل قوي بينكما! +10 نقاط</span>';
      window.SoundEngine && window.SoundEngine.play('score');
      window.AuthService.addPoints(10);
    }
  }

  function destroy() {
    isGameOver = true;
  }

  return { init, destroy };
})();

window.TicTacToeGame = TicTacToeGame;
