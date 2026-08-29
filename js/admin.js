/**
 * Zilzal Platform - Admin Dashboard Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  await window.ConfigManager.loadConfig();
  checkAdminAuth();
  setupAdminNavigation();
  loadAllSettingsToForm();
  setupAdminFormHandlers();
  renderAdminStatsCharts();
  renderRegisteredUsersTable();
});

function checkAdminAuth() {
  const user = window.AuthService.getCurrentUser();
  const authGate = document.getElementById('admin-auth-gate');
  const mainContent = document.getElementById('admin-main-content');

  if (user && user.isAdmin) {
    if (authGate) authGate.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
  } else {
    if (authGate) authGate.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
  }

  // Admin Login Form
  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('admin-user').value;
      const p = document.getElementById('admin-pass').value;
      try {
        window.AuthService.loginAdmin(u, p);
        if (authGate) authGate.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        alert('تم تسجيل الدخول كمدير بنجاح! 👑');
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function setupAdminNavigation() {
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const panes = document.querySelectorAll('.admin-tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.tab;
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');
    });
  });

  const btnLogout = document.getElementById('btn-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.AuthService.logout();
      window.location.reload();
    });
  }
}

function loadAllSettingsToForm() {
  const config = window.ConfigManager.getConfig();

  // Branding
  if (config.branding) {
    document.getElementById('set-brand-name').value = config.branding.name || '';
    document.getElementById('set-brand-tagline').value = config.branding.tagline || '';
    document.getElementById('set-brand-logo').value = config.branding.logoUrl || '';
    document.getElementById('set-brand-banner').value = config.branding.bannerUrl || '';
  }

  // Ticker
  if (config.ticker) {
    document.getElementById('set-ticker-enabled').checked = !!config.ticker.enabled;
    document.getElementById('set-ticker-text').value = config.ticker.text || '';
    document.getElementById('set-ticker-link').value = config.ticker.link || '';
    document.getElementById('set-ticker-speed').value = config.ticker.speed || 25;
  }

  // Social
  if (config.social) {
    // Telegram Channel
    if (config.social.telegramChannel) {
      document.getElementById('set-tg-chan-url').value = config.social.telegramChannel.url || '';
      document.getElementById('set-tg-chan-handle').value = config.social.telegramChannel.handle || '';
      document.getElementById('set-tg-chan-badge').value = config.social.telegramChannel.badge || '';
    }
    // Telegram Group
    if (config.social.telegramGroup) {
      document.getElementById('set-tg-grp-url').value = config.social.telegramGroup.url || '';
      document.getElementById('set-tg-grp-handle').value = config.social.telegramGroup.handle || '';
      document.getElementById('set-tg-grp-badge').value = config.social.telegramGroup.badge || '';
    }
    // TikTok
    if (config.social.tiktok) {
      document.getElementById('set-tiktok-url').value = config.social.tiktok.url || '';
      document.getElementById('set-tiktok-handle').value = config.social.tiktok.handle || '';
      document.getElementById('set-tiktok-badge').value = config.social.tiktok.badge || '';
    }
    // Instagram
    if (config.social.instagram) {
      document.getElementById('set-insta-url').value = config.social.instagram.url || '';
      document.getElementById('set-insta-handle').value = config.social.instagram.handle || '';
      document.getElementById('set-insta-badge').value = config.social.instagram.badge || '';
    }
  }

  // AI
  if (config.ai) {
    document.getElementById('set-ai-botname').value = config.ai.botName || '';
    document.getElementById('set-ai-apikey').value = config.ai.apiKey || '';
    document.getElementById('set-ai-prompt').value = config.ai.systemPrompt || '';
  }

  // Admin Security
  if (config.admin) {
    document.getElementById('set-admin-username').value = config.admin.username || 'admin';
    document.getElementById('set-admin-password').value = config.admin.password || 'zilzal2026';
  }
}

function setupAdminFormHandlers() {
  // Save Branding
  document.getElementById('form-branding').addEventListener('submit', (e) => {
    e.preventDefault();
    const config = window.ConfigManager.getConfig();
    config.branding.name = document.getElementById('set-brand-name').value;
    config.branding.tagline = document.getElementById('set-brand-tagline').value;
    config.branding.logoUrl = document.getElementById('set-brand-logo').value;
    config.branding.bannerUrl = document.getElementById('set-brand-banner').value;
    window.ConfigManager.saveConfig(config);
    alert('تم حفظ الهوية والتصميم بنجاح! 👑');
  });

  // Save Ticker
  document.getElementById('form-ticker').addEventListener('submit', (e) => {
    e.preventDefault();
    const config = window.ConfigManager.getConfig();
    config.ticker.enabled = document.getElementById('set-ticker-enabled').checked;
    config.ticker.text = document.getElementById('set-ticker-text').value;
    config.ticker.link = document.getElementById('set-ticker-link').value;
    config.ticker.speed = parseInt(document.getElementById('set-ticker-speed').value) || 25;
    window.ConfigManager.saveConfig(config);
    alert('تم تحديث شريط الإعلانات بنجاح! 📢');
  });

  // Save Social
  document.getElementById('form-social').addEventListener('submit', (e) => {
    e.preventDefault();
    const config = window.ConfigManager.getConfig();
    
    config.social.telegramChannel.url = document.getElementById('set-tg-chan-url').value;
    config.social.telegramChannel.handle = document.getElementById('set-tg-chan-handle').value;
    config.social.telegramChannel.badge = document.getElementById('set-tg-chan-badge').value;

    config.social.telegramGroup.url = document.getElementById('set-tg-grp-url').value;
    config.social.telegramGroup.handle = document.getElementById('set-tg-grp-handle').value;
    config.social.telegramGroup.badge = document.getElementById('set-tg-grp-badge').value;

    config.social.tiktok.url = document.getElementById('set-tiktok-url').value;
    config.social.tiktok.handle = document.getElementById('set-tiktok-handle').value;
    config.social.tiktok.badge = document.getElementById('set-tiktok-badge').value;

    config.social.instagram.url = document.getElementById('set-insta-url').value;
    config.social.instagram.handle = document.getElementById('set-insta-handle').value;
    config.social.instagram.badge = document.getElementById('set-insta-badge').value;

    window.ConfigManager.saveConfig(config);
    alert('تم تحديث روابط السوشيال ميديا بنجاح! 🔗');
  });

  // Save AI
  document.getElementById('form-ai').addEventListener('submit', (e) => {
    e.preventDefault();
    const config = window.ConfigManager.getConfig();
    config.ai.botName = document.getElementById('set-ai-botname').value;
    config.ai.apiKey = document.getElementById('set-ai-apikey').value.trim();
    config.ai.systemPrompt = document.getElementById('set-ai-prompt').value;
    window.ConfigManager.saveConfig(config);
    alert('تم حفظ إعدادات الذكاء الاصطناعي بنجاح! 🤖');
  });

  // Save Admin Security
  document.getElementById('form-security').addEventListener('submit', (e) => {
    e.preventDefault();
    const config = window.ConfigManager.getConfig();
    config.admin.username = document.getElementById('set-admin-username').value;
    config.admin.password = document.getElementById('set-admin-password').value;
    window.ConfigManager.saveConfig(config);
    alert('تم تحديث بيانات دخول المدير بنجاح! 🔐');
  });

  // Export config.json
  document.getElementById('btn-export-config').addEventListener('click', () => {
    window.ConfigManager.exportConfigJSON();
  });

  // Import config.json
  const fileInput = document.getElementById('input-import-config');
  document.getElementById('btn-trigger-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (window.ConfigManager.importConfigJSON(event.target.result)) {
          alert('تم استيراد الإعدادات بنجاح!');
          window.location.reload();
        }
      };
      reader.readAsText(file);
    }
  });

  // Reset to Defaults
  document.getElementById('btn-reset-defaults').addEventListener('click', () => {
    if (confirm('هل أنت متأكد من رغبتك بإعادة ضبط كافة الإعدادات إلى الإعدادات الافتراضية؟')) {
      window.ConfigManager.resetConfig();
      alert('تمت استعادة الإعدادات الأصلية!');
      window.location.reload();
    }
  });
}

function renderAdminStatsCharts() {
  const canvas = document.getElementById('admin-stats-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simple Beautiful Pure HTML5 Canvas Bar & Line Graph
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const visits = [120, 185, 240, 310, 280, 420, 480];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const graphWidth = canvas.width - padding * 2;
  const graphHeight = canvas.height - padding * 2;
  const barWidth = graphWidth / days.length - 20;

  const maxVal = Math.max(...visits) * 1.2;

  // Draw Bars
  days.forEach((day, index) => {
    const x = padding + index * (graphWidth / days.length) + 10;
    const barH = (visits[index] / maxVal) * graphHeight;
    const y = canvas.height - padding - barH;

    // Bar Gradient
    const grad = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
    grad.addColorStop(0, '#f5b700');
    grad.addColorStop(1, '#ff0055');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barH);

    // Number text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(visits[index], x + barWidth / 2, y - 8);

    // Day label
    ctx.fillStyle = '#8e9bb0';
    ctx.font = '12px Cairo';
    ctx.fillText(day, x + barWidth / 2, canvas.height - padding + 20);
  });
}

function renderRegisteredUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  const users = window.AuthService.getRegisteredUsers();

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8e9bb0; padding:20px;">لا يوجد مستخدمين مسجلين بعد</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td><span style="color:#ffd166; font-weight:bold;">${u.points} 💎</span></td>
      <td>${new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
    </tr>
  `).join('');
}
