/**
 * Zilzal Lucky Spin Wheel Game
 */
const WheelGame = (() => {
  let canvas, ctx;
  let isSpinning = false;
  let currentAngle = 0;

  const prizes = [
    { label: '+50 نقطة', points: 50, color: '#f5b700' },
    { label: '+100 نقطة', points: 100, color: '#ff0055' },
    { label: '+25 نقطة', points: 25, color: '#00f0ff' },
    { label: '🔥 VIP حظ', points: 250, color: '#9d4edd' },
    { label: '+150 نقطة', points: 150, color: '#00ff88' },
    { label: '+75 نقطة', points: 75, color: '#ffd166' },
    { label: '👑 بطل زلزال', points: 500, color: '#d48b00' },
    { label: '+10 نقاط', points: 10, color: '#ff5400' }
  ];

  function init(containerEl) {
    containerEl.innerHTML = `
      <div class="game-hud">
        <div class="hud-stat"><i class="fas fa-coins" style="color:#f5b700;"></i> رصيدك: <span id="wheel-user-points">${window.AuthService.getCurrentUser() ? window.AuthService.getCurrentUser().points : 0}</span></div>
        <div class="hud-stat"><i class="fas fa-gift" style="color:#ff0055;"></i> جوائز يومية متجددة</div>
      </div>
      <div class="game-canvas-wrap" style="padding:15px; flex-direction:column;">
        <canvas id="wheel-canvas" width="340" height="340" class="game-canvas"></canvas>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <button class="btn btn-gold" id="btn-spin-wheel" style="font-size:1.15rem; padding:12px 35px;"><i class="fas fa-dharmachakra"></i> تدوير العجلة الآن!</button>
        <div id="wheel-result-msg" style="margin-top:10px; font-weight:800; font-size:1.1rem; color:#ffd166; min-height:28px;"></div>
      </div>
    `;

    canvas = document.getElementById('wheel-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('btn-spin-wheel').addEventListener('click', spin);
    drawWheel();
  }

  function drawWheel(angle = 0) {
    const numSlices = prizes.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const startA = i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startA, endA);
      ctx.closePath();

      ctx.fillStyle = prizes[i].color;
      ctx.fill();
      ctx.strokeStyle = '#0a0d14';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Cairo';
      ctx.fillText(prizes[i].label, radius - 15, 5);
      ctx.restore();
    }

    // Center Golden Circle
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0d111a';
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('زلزال', 0, 4);

    ctx.restore();

    // Top Pointer Arrow
    ctx.beginPath();
    ctx.moveTo(centerX - 14, 5);
    ctx.lineTo(centerX + 14, 5);
    ctx.lineTo(centerX, 28);
    ctx.closePath();
    ctx.fillStyle = '#ffd166';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f5b700';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    document.getElementById('wheel-result-msg').textContent = 'العجلة تدور... بالتوفيق! ⚡';
    window.SoundEngine && window.SoundEngine.play('click');

    const totalRounds = 5 + Math.random() * 4;
    const randomOffset = Math.random() * (Math.PI * 2);
    const targetAngle = currentAngle + totalRounds * (Math.PI * 2) + randomOffset;
    const duration = 4000;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const angle = currentAngle + (targetAngle - currentAngle) * easeProgress;

      drawWheel(angle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentAngle = angle % (Math.PI * 2);
        isSpinning = false;
        calculateWinner(currentAngle);
      }
    }

    requestAnimationFrame(animate);
  }

  function calculateWinner(finalAngle) {
    const numSlices = prizes.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Pointer is at Top (3 * PI / 2)
    const normalizedAngle = (Math.PI * 1.5 - finalAngle + Math.PI * 4) % (Math.PI * 2);
    const winningIndex = Math.floor(normalizedAngle / sliceAngle) % numSlices;
    const winner = prizes[winningIndex];

    window.SoundEngine && window.SoundEngine.play('win');
    window.AuthService.addPoints(winner.points);

    document.getElementById('wheel-result-msg').innerHTML = `مبروووك! 🎉 ربحت <span style="color:#00ff88;">${winner.label}</span> لحسابك!`;
    const userPts = document.getElementById('wheel-user-points');
    if (userPts && window.AuthService.getCurrentUser()) {
      userPts.textContent = window.AuthService.getCurrentUser().points;
    }
  }

  function destroy() {
    isSpinning = false;
  }

  return { init, destroy };
})();

window.WheelGame = WheelGame;
