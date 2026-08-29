/**
 * Zilzal Platform - Core App Controller
 */

// 1. Web Audio API Synthesizer (Zero External Dependencies)
const SoundEngine = (() => {
  let audioCtx = null;
  let enabled = true;

  function init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  function play(type) {
    if (!enabled) return;
    if (!audioCtx) init();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'score') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  return { play, toggle, isEnabled: () => enabled };
})();

window.SoundEngine = SoundEngine;

// 2. Toast Notification Helper
function showToast(message, icon = 'fas fa-info-circle') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="${icon}" style="color:#ffd166; font-size:1.1rem;"></i><span>${message}</span>`;
  container.appendChild(toast);

  window.SoundEngine && window.SoundEngine.play('score');

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// 3. Visitor Tracking Engine
const VisitorEngine = (() => {
  const TOTAL_KEY = 'zilzal_total_visits';
  const TODAY_KEY = 'zilzal_today_visits';
  const LAST_VISIT_KEY = 'zilzal_last_visit_date';

  function init() {
    const config = window.ConfigManager.getConfig();
    const baseVisitors = (config.stats && config.stats.baseVisitors) || 3420;

    let total = parseInt(localStorage.getItem(TOTAL_KEY) || baseVisitors);
    let today = parseInt(localStorage.getItem(TODAY_KEY) || 185);
    const lastDate = localStorage.getItem(LAST_VISIT_KEY);
    const currentDate = new Date().toDateString();

    if (lastDate !== currentDate) {
      today = Math.floor(Math.random() * 20) + 15;
      localStorage.setItem(LAST_VISIT_KEY, currentDate);
    }

    // Increment visit once per session
    if (!sessionStorage.getItem('zilzal_session_counted')) {
      total++;
      today++;
      localStorage.setItem(TOTAL_KEY, total);
      localStorage.setItem(TODAY_KEY, today);
      sessionStorage.setItem('zilzal_session_counted', 'true');
    }

    renderStats(total, today);

    // Live fluctuating active online visitors
    setInterval(() => {
      const activeEl = document.getElementById('live-active-visitors');
      const navPill = document.getElementById('nav-visitor-count');
      const randomActive = Math.floor(18 + Math.random() * 16);
      if (activeEl) activeEl.textContent = randomActive;
      if (navPill) navPill.textContent = `${total.toLocaleString()} زائر (${randomActive} متصل)`;
    }, 4500);
  }

  function renderStats(total, today) {
    const totalEl = document.getElementById('stat-total-visits');
    const todayEl = document.getElementById('stat-today-visits');
    const navPill = document.getElementById('nav-visitor-count');

    if (totalEl) totalEl.textContent = total.toLocaleString();
    if (todayEl) todayEl.textContent = today.toLocaleString();
    if (navPill) navPill.textContent = `${total.toLocaleString()} زائر (24 متصل)`;
  }

  return { init };
})();

// 4. Main App Controller
document.addEventListener('DOMContentLoaded', async () => {
  await window.ConfigManager.loadConfig();
  renderApp();
  VisitorEngine.init();
  window.AiAssistant && window.AiAssistant.init();
  setupModals();
  setupSoundToggle();

  window.addEventListener('zilzal_config_updated', () => renderApp());
  window.addEventListener('zilzal_auth_changed', () => updateAuthUI());
  window.addEventListener('zilzal_points_updated', (e) => {
    updateAuthUI();
    showToast(`ربحت +${e.detail.gained} نقطة جديدة! 💎`, 'fas fa-gem');
  });

  updateAuthUI();
});

function renderApp() {
  const config = window.ConfigManager.getConfig();

  // Branding Title & Subtitle
  document.querySelectorAll('.brand-title-text').forEach(el => el.textContent = config.branding.name);
  document.querySelectorAll('.brand-tagline-text').forEach(el => el.textContent = config.branding.tagline);
  document.querySelectorAll('.brand-logo-img').forEach(el => el.src = config.branding.logoUrl);

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) heroTitle.textContent = config.branding.name;

  const heroDesc = document.getElementById('hero-desc');
  if (heroDesc) heroDesc.textContent = config.branding.tagline;

  // Ticker Bar
  const tickerWrap = document.getElementById('site-ticker-wrap');
  const tickerContent = document.getElementById('site-ticker-content');
  if (tickerWrap && tickerContent) {
    if (config.ticker.enabled) {
      tickerWrap.style.display = 'flex';
      tickerContent.textContent = config.ticker.text;
      tickerContent.href = config.ticker.link || '#games';
    } else {
      tickerWrap.style.display = 'none';
    }
  }

  // Render Social Cards
  renderSocialCards(config.social);

  // Render Games Grid
  renderGamesGrid(config.games);
}

function renderSocialCards(social = {}) {
  const grid = document.getElementById('social-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const socialItems = [
    { key: 'telegramChannel', cardClass: 'card-telegram', icon: 'fab fa-telegram-plane', defaultTitle: 'قناة التلجرام الرسمية' },
    { key: 'telegramGroup', cardClass: 'card-telegram-group', icon: 'fas fa-comments', defaultTitle: 'كروب الدردشة والمجتمع' },
    { key: 'tiktok', cardClass: 'card-tiktok', icon: 'fab fa-tiktok', defaultTitle: 'حساب تيك توك الرسمي' },
    { key: 'instagram', cardClass: 'card-instagram', icon: 'fab fa-instagram', defaultTitle: 'حساب انستغرام الرسمي' }
  ];

  socialItems.forEach(item => {
    const data = social[item.key] || {};
    const card = document.createElement('div');
    card.className = `social-card ${item.cardClass}`;
    card.innerHTML = `
      <div>
        <div class="social-top">
          <div class="social-icon-box"><i class="${data.icon || item.icon}"></i></div>
          <span class="social-badge">${data.badge || 'نشط 🔥'}</span>
        </div>
        <div class="social-info">
          <h3>${data.name || item.defaultTitle}</h3>
          <span class="social-handle">${data.handle || '@zilzal'}</span>
          <p class="social-desc">${data.description || 'تابعنا لمزيد من الأخبار والفعاليات الحصرية'}</p>
        </div>
      </div>
      <div class="social-actions">
        <a href="${data.url || '#'}" target="_blank" class="btn-social-join">
          <i class="fas fa-external-link-alt"></i> فتح الرابط
        </a>
        <button class="btn btn-outline btn-copy-link" data-url="${data.url || ''}" title="نسخ الرابط">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Copy Link listeners
  document.querySelectorAll('.btn-copy-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = btn.dataset.url;
      if (url) {
        navigator.clipboard.writeText(url);
        showToast('تم نسخ الرابط بنجاح! 📋', 'fas fa-check-circle');
      }
    });
  });
}

function renderGamesGrid(games = []) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  grid.innerHTML = '';

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="game-thumb-box">
        <img src="${game.image}" alt="${game.name}" class="game-thumb">
        <span class="game-badge">${game.badge || 'مميزة'}</span>
      </div>
      <div class="game-body">
        <div>
          <h3 class="game-name"><i class="${game.icon}"></i> ${game.name}</h3>
          <p class="game-desc">${game.description}</p>
        </div>
        <div class="game-footer">
          <span class="game-highscore">أفضل سكور: ${window.AuthService.getHighScore(game.id)}</span>
          <button class="btn btn-gold btn-play-game" data-game="${game.id}">
            <i class="fas fa-gamepad"></i> العب الآن
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.btn-play-game').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.game;
      openGameModal(gameId);
    });
  });
}

function openGameModal(gameId) {
  const modal = document.getElementById('game-modal');
  const body = document.getElementById('game-modal-body');
  const title = document.getElementById('game-modal-title');
  if (!modal || !body) return;

  modal.classList.add('active');
  window.SoundEngine && window.SoundEngine.play('click');

  if (gameId === 'snake') {
    title.innerHTML = '<i class="fas fa-dragon" style="color:#f5b700;"></i> ثعبان زلزال النيون';
    window.SnakeGame.init(body);
  } else if (gameId === 'flappy') {
    title.innerHTML = '<i class="fas fa-paper-plane" style="color:#00f0ff;"></i> صقر زلزال النفاث';
    window.FlappyGame.init(body);
  } else if (gameId === 'wheel') {
    title.innerHTML = '<i class="fas fa-dharmachakra" style="color:#ffd166;"></i> عجلة الحظ الذهبية';
    window.WheelGame.init(body);
  } else if (gameId === 'memory') {
    title.innerHTML = '<i class="fas fa-brain" style="color:#00ff88;"></i> تحدي بطاقات الذاكرة';
    window.MemoryGame.init(body);
  } else if (gameId === 'tictactoe') {
    title.innerHTML = '<i class="fas fa-times-circle" style="color:#ff0055;"></i> إكس أو زلزال التكتيكية';
    window.TicTacToeGame.init(body);
  }
}

function closeGameModal() {
  const modal = document.getElementById('game-modal');
  if (modal) modal.classList.remove('active');
  window.SnakeGame && window.SnakeGame.destroy();
  window.FlappyGame && window.FlappyGame.destroy();
  window.WheelGame && window.WheelGame.destroy();
  window.MemoryGame && window.MemoryGame.destroy();
  window.TicTacToeGame && window.TicTacToeGame.destroy();
}

function updateAuthUI() {
  const user = window.AuthService.getCurrentUser();
  const authBtn = document.getElementById('btn-nav-auth');
  const userGreetingWrap = document.getElementById('user-greeting-wrap');

  if (user) {
    if (authBtn) {
      authBtn.innerHTML = `<img src="${user.avatar}" class="user-avatar-sm" style="width:28px; height:28px; margin-left:6px;"> <span>${user.name} (${user.points} 💎)</span>`;
      authBtn.onclick = () => openProfileModal();
    }
    if (userGreetingWrap) {
      userGreetingWrap.style.display = 'inline-flex';
      userGreetingWrap.innerHTML = `
        <img src="${user.avatar}" class="user-avatar-sm" alt="${user.name}">
        <div class="user-greeting-info">
          <div class="user-greeting-name">أهلاً بك، ${user.name} 👑</div>
          <div class="user-greeting-points">💎 رصيد نقاطك: ${user.points} نقطة | ${user.isGuest ? 'دخول كزائر' : 'حساب رسمي'}</div>
        </div>
      `;
    }
  } else {
    if (authBtn) {
      authBtn.innerHTML = '<i class="fas fa-user-circle"></i> دخول / حساب';
      authBtn.onclick = () => openAuthModal();
    }
    if (userGreetingWrap) {
      userGreetingWrap.style.display = 'none';
    }
  }
}

function setupModals() {
  // Auth Modal
  const authModal = document.getElementById('auth-modal');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  if (btnCloseAuth && authModal) {
    btnCloseAuth.addEventListener('click', () => authModal.classList.remove('active'));
  }

  // Profile Modal
  const profileModal = document.getElementById('profile-modal');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  if (btnCloseProfile && profileModal) {
    btnCloseProfile.addEventListener('click', () => profileModal.classList.remove('active'));
  }

  // Game Modal Close
  const btnCloseGame = document.getElementById('btn-close-game');
  if (btnCloseGame) {
    btnCloseGame.addEventListener('click', closeGameModal);
  }

  // Auth Tabs Switching
  const authTabs = document.querySelectorAll('.auth-tab');
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('form-login').style.display = target === 'login' ? 'block' : 'none';
      document.getElementById('form-register').style.display = target === 'register' ? 'block' : 'none';
    });
  });

  // Guest Login Button
  const btnGuest = document.getElementById('btn-login-guest');
  if (btnGuest) {
    btnGuest.addEventListener('click', () => {
      window.AuthService.loginGuest();
      authModal.classList.remove('active');
      showToast('أهلاً بك كزائر في منصة زلزال! ⚡', 'fas fa-check-circle');
    });
  }

  // Register Form
  const formReg = document.getElementById('form-register-el');
  if (formReg) {
    formReg.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        window.AuthService.register(name, email, pass);
        authModal.classList.remove('active');
        showToast('تم إنشاء الحساب بنجاح وإضافة 100 نقطة ترحيبية! 🎉', 'fas fa-gift');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Login Form
  const formLog = document.getElementById('form-login-el');
  if (formLog) {
    formLog.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        window.AuthService.login(email, pass);
        authModal.classList.remove('active');
        showToast('تم تسجيل الدخول بنجاح! 👑', 'fas fa-check-circle');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Logout Button
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.AuthService.logout();
      profileModal.classList.remove('active');
      showToast('تم تسجيل الخروج بنجاح', 'fas fa-sign-out-alt');
    });
  }
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
}

function openProfileModal() {
  const user = window.AuthService.getCurrentUser();
  if (!user) return;
  const modal = document.getElementById('profile-modal');
  if (!modal) return;

  document.getElementById('profile-avatar-img').src = user.avatar;
  document.getElementById('profile-name-val').textContent = user.name;
  document.getElementById('profile-email-val').textContent = user.email;
  document.getElementById('profile-points-val').textContent = user.points;
  document.getElementById('profile-type-val').textContent = user.isGuest ? 'زائر' : (user.isAdmin ? 'مدير' : 'مستخدم مسجل');

  modal.classList.add('active');
}

function setupSoundToggle() {
  const btn = document.getElementById('btn-sound-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isEnabled = window.SoundEngine.toggle();
    btn.innerHTML = isEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    btn.title = isEnabled ? 'كتم الصوت' : 'تشغيل الصوت';
    if (isEnabled) window.SoundEngine.play('click');
  });
}
