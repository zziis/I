/**
 * Zilzal Platform - Configuration Manager
 */
const ConfigManager = (() => {
  const STORAGE_KEY = 'zilzal_custom_config';
  let currentConfig = null;

  async function loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        currentConfig = JSON.parse(saved);
        return currentConfig;
      }
      
      const response = await fetch('config.json');
      if (response.ok) {
        currentConfig = await response.json();
        return currentConfig;
      }
    } catch (e) {
      console.warn('Fallback to local default config', e);
    }
    return getConfig();
  }

  function getConfig() {
    if (!currentConfig) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        currentConfig = JSON.parse(saved);
      } else {
        currentConfig = {
          branding: {
            name: "منصة زلزال",
            tagline: "المنصة  للترفيه، الألعاب المصغرة، والمجتمع الرقمي الحصري",
            logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
            bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
            themeColor: "#f5b700",
            accentColor: "#ff0055",
            welcomeMessage: "أهلاً بك في منصة زلزال الفاخرة! استمتع بأقوى الألعاب وتواصل معنا عبر قنواتنا الحصرية."
          },
          ticker: {
            enabled: true,
            text: "🔥 مرحباً بكم في منصة زلزال الرسمية! 🌟 تابعوا قناتنا على التلجرام لأحدث المسابقات والجوائز 🎮 جربوا ألعاب زلزال الحماسية الآن واجمعوا النقاط ⚡ انضموا لكروب الدردشة وتفاعلوا مع الأعضاء!",
            link: "#games",
            speed: 25
          },
          social: {
            telegramChannel: {
              name: "قناة التلجرام الرسمية",
              url: "https://t.me/zilzal_channel",
              handle: "@zilzal_channel",
              description: "القناة الرسمية للأخبار والتحديثات اليومية والمسابقات والجوائز الحصرية",
              badge: "50K+ مشترك",
              icon: "fab fa-telegram-plane"
            },
            telegramGroup: {
              name: "كروب الدردشة والمجتمع",
              url: "https://t.me/zilzal_chat",
              handle: "@zilzal_chat",
              description: "ملتقى الأعضاء والدردشة والتفاعل المباشر ومشاركة النتائج على مدار الساعة",
              badge: "25K+ عضو",
              icon: "fas fa-comments"
            },
            tiktok: {
              name: "حساب تيك توك الرسمي",
              url: "https://tiktok.com/@zilzal_official",
              handle: "@zilzal_official",
              description: "أقوى مقاطع الفيديو والتحديات الحماسية والبثوث المباشرة",
              badge: "120K+ متابع",
              icon: "fab fa-tiktok"
            },
            instagram: {
              name: "حساب انستغرام الرسمي",
              url: "https://instagram.com/zilzal_official",
              handle: "@zilzal_official",
              description: "الصور واليوميات والقصص التفاعلية مع مجتمع زلزال",
              badge: "80K+ متابع",
              icon: "fab fa-instagram"
            }
          },
          admin: {
            username: "admin",
            password: "zilzal2026"
          },
          ai: {
            enabled: true,
            botName: "مساعد زلزال الذكي",
            welcome: "مرحباً بك يا بطل في منصة زلزال الفاخرة! أنا مساعدك الذكي ⚡ يمكنك سؤالي عن ألعابنا، روابط مجتمعنا، أو أي استفسار تريده! 👑",
            systemPrompt: "أنت مساعد ذكي ولطيف وفخم اسمه 'مساعد زلزال الذكي' لمنصة 'زلزال'. تتميز بالحديث بأسلوب عربي راقٍ وحماسي ومرحب. تجيب عن استفسارات الألعاب وقنوات السوشيال ميديا وتساعد الزوار في كل ما يخص المنصة.",
            apiKey: "",
            model: "gemini-1.5-flash"
          },
          games: [
            { id: "snake", name: "ثعبان زلزال النيون", description: "اللعبة الكلاسيكية الشهيرة بتصميم نيون ذهبي فاخر ومؤثرات صوتية حماسية", icon: "fas fa-dragon", badge: "شائعة 🔥", image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=500&q=80" },
            { id: "flappy", name: "صقر زلزال النفاث", description: "تحكم بالصقر النفاث وتجاوز العقبات الكهربائية وحقق أعلى سكور", icon: "fas fa-paper-plane", badge: "تحدي عالي ⚡", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=500&q=80" },
            { id: "wheel", name: "عجلة الحظ الذهبية", description: "أدر العجلة كل يوم لتربح نقاطاً ومكافآت حصرية", icon: "fas fa-dharmachakra", badge: "جوائز يومية 🎁", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80" },
            { id: "memory", name: "تحدي بطاقات الذاكرة", description: "اختبر قوة تركيزك وسرعة بديهتك واكشف البطاقات المتطابقة", icon: "fas fa-brain", badge: "ذكاء 🧠", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80" },
            { id: "tictactoe", name: "إكس أو زلزال التكتيكية", description: "تحدي الذكاء الاصطناعي في لعبة X-O الفاخرة", icon: "fas fa-times-circle", badge: "ضد الذكاء 🤖", image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=500&q=80" }
          ],
          stats: {
            baseVisitors: 3420,
            todayVisits: 185,
            activeUsers: 24
          }
        };
      }
    }
    return currentConfig;
  }

  function saveConfig(newConfig) {
    currentConfig = { ...getConfig(), ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    window.dispatchEvent(new CustomEvent('zilzal_config_updated', { detail: currentConfig }));
    return currentConfig;
  }

  function resetConfig() {
    localStorage.removeItem(STORAGE_KEY);
    currentConfig = null;
    const defs = getConfig();
    window.dispatchEvent(new CustomEvent('zilzal_config_updated', { detail: defs }));
    return defs;
  }

  function exportConfigJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getConfig(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importConfigJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      saveConfig(parsed);
      return true;
    } catch (e) {
      alert('خطأ في قراءة ملف التكوين: ' + e.message);
      return false;
    }
  }

  return {
    loadConfig,
    getConfig,
    saveConfig,
    resetConfig,
    exportConfigJSON,
    importConfigJSON
  };
})();

window.ConfigManager = ConfigManager;
