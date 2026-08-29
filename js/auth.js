/**
 * Zilzal Platform - Authentication & User Service
 */
const AuthService = (() => {
  const SESSION_KEY = 'zilzal_current_user';
  const USERS_KEY = 'zilzal_registered_users';
  const HIGHSCORES_KEY = 'zilzal_highscores';

  function getRegisteredUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  function getCurrentUser() {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
  }

  function loginGuest() {
    const randomId = Math.floor(100 + Math.random() * 900);
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'زائر_زلزال_' + randomId,
      email: 'guest' + randomId + '@guest.com',
      isGuest: true,
      isAdmin: false,
      points: 50,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(guestUser));
    window.dispatchEvent(new CustomEvent('zilzal_auth_changed', { detail: guestUser }));
    return guestUser;
  }

  function register(name, email, password) {
    if (!name || !email || !password) throw new Error('جميع الحقول مطلوبة');
    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('البريد الإلكتروني مسجل بالفعل مسبقاً');
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      isGuest: false,
      isAdmin: false,
      points: 100,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    window.dispatchEvent(new CustomEvent('zilzal_auth_changed', { detail: newUser }));
    return newUser;
  }

  function login(email, password) {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('zilzal_auth_changed', { detail: user }));
    return user;
  }

  function loginAdmin(username, password) {
    const config = window.ConfigManager ? window.ConfigManager.getConfig() : {};
    const adminCreds = config.admin || { username: 'admin', password: 'zilzal2026' };
    if (username === adminCreds.username && password === adminCreds.password) {
      const adminUser = {
        id: 'admin_01',
        name: 'مدير منصة زلزال',
        email: 'admin@zilzal.com',
        isAdmin: true,
        isGuest: false,
        points: 9999,
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      window.dispatchEvent(new CustomEvent('zilzal_auth_changed', { detail: adminUser }));
      return adminUser;
    }
    throw new Error('اسم المستخدم أو كلمة مرور المدير غير صحيحة');
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('zilzal_auth_changed', { detail: null }));
  }

  function addPoints(amount) {
    const user = getCurrentUser();
    if (!user) return;
    user.points = (user.points || 0) + amount;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    if (!user.isGuest && !user.isAdmin) {
      const users = getRegisteredUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx].points = user.points;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
    window.dispatchEvent(new CustomEvent('zilzal_points_updated', { detail: { user, gained: amount } }));
    return user.points;
  }

  function saveGameScore(gameId, score) {
    const scores = JSON.parse(localStorage.getItem(HIGHSCORES_KEY) || '{}');
    const currentBest = scores[gameId] || 0;
    if (score > currentBest) {
      scores[gameId] = score;
      localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(scores));
    }
    const earned = Math.max(10, Math.floor(score / 2));
    addPoints(earned);
    return { highscore: scores[gameId], earned };
  }

  function getHighScore(gameId) {
    const scores = JSON.parse(localStorage.getItem(HIGHSCORES_KEY) || '{}');
    return scores[gameId] || 0;
  }

  return {
    getCurrentUser,
    getRegisteredUsers,
    loginGuest,
    register,
    login,
    loginAdmin,
    logout,
    addPoints,
    saveGameScore,
    getHighScore
  };
})();

window.AuthService = AuthService;
