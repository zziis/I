/**
 * Zilzal Platform - AI Assistant Engine
 */
const AiAssistant = (() => {
  function init() {
    const fab = document.querySelector('.ai-fab');
    const chatWindow = document.querySelector('.ai-chat-window');
    const closeBtn = document.querySelector('.ai-close');
    const sendBtn = document.querySelector('.btn-send');
    const input = document.querySelector('.ai-input');
    const chips = document.querySelectorAll('.suggestion-chip');

    if (fab && chatWindow) {
      fab.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        window.SoundEngine && window.SoundEngine.play('click');
      });
    }

    if (closeBtn && chatWindow) {
      closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
      });
    }

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => sendMessage(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage(input.value);
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        sendMessage(chip.textContent.trim());
      });
    });
  }

  async function sendMessage(userText) {
    userText = (userText || '').trim();
    if (!userText) return;

    const msgsContainer = document.querySelector('.ai-messages');
    const input = document.querySelector('.ai-input');
    if (input) input.value = '';

    appendBubble(userText, 'user');
    window.SoundEngine && window.SoundEngine.play('click');

    const typingEl = appendTyping();

    const config = window.ConfigManager ? window.ConfigManager.getConfig() : {};
    const aiConfig = config.ai || {};

    let responseText = '';

    if (aiConfig.apiKey && aiConfig.apiKey.trim().startsWith('AIza')) {
      try {
        responseText = await fetchGeminiResponse(userText, aiConfig);
      } catch (e) {
        console.warn('Gemini API request failed, using smart engine fallback', e);
        responseText = generateSmartOfflineResponse(userText, config);
      }
    } else {
      await new Promise(r => setTimeout(r, 600));
      responseText = generateSmartOfflineResponse(userText, config);
    }

    if (typingEl) typingEl.remove();
    appendBubble(responseText, 'bot');
    window.SoundEngine && window.SoundEngine.play('win');
  }

  function appendBubble(text, role) {
    const msgsContainer = document.querySelector('.ai-messages');
    if (!msgsContainer) return;
    const d = document.createElement('div');
    d.className = 'chat-bubble ' + role;
    d.innerHTML = formatMessageText(text);
    msgsContainer.appendChild(d);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
    return d;
  }

  function appendTyping() {
    const msgsContainer = document.querySelector('.ai-messages');
    if (!msgsContainer) return;
    const d = document.createElement('div');
    d.className = 'chat-bubble bot typing';
    d.innerHTML = '<span>● </span><span>● </span><span>●</span> جاري التفكير...';
    msgsContainer.appendChild(d);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
    return d;
  }

  function formatMessageText(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  async function fetchGeminiResponse(userText, aiConfig) {
    const model = aiConfig.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
    const systemPrompt = aiConfig.systemPrompt || 'أنت مساعد ذكي ولطيف وفخم لمنصة زلزال.';
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `تعليمات النظام: ${systemPrompt}\n\nسؤال المستخدم: ${userText}` }]
          }
        ]
      })
    });

    const data = await res.json();
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('No candidate returned');
  }

  function generateSmartOfflineResponse(text, config) {
    const t = text.toLowerCase();
    const social = config.social || {};

    if (t.includes('مرحبا') || t.includes('السلام') || t.includes('هلا') || t.includes('صباح') || t.includes('مساء')) {
      return 'وعليكم السلام ورحمة الله وبركاته! 👑\nأهلاً بك في **منصة زلزال الفاخرة** ⚡\nأنا مساعدك الذكي، يمكنك سؤالي عن ألعابنا، قنواتنا الاجتماعية، طريقة جمع النقاط، أو أي استفسار تريده!';
    }
    if (t.includes('تلجرام') || t.includes('قناة') || t.includes('كروب') || t.includes('جروب')) {
      const ch = social.telegramChannel ? social.telegramChannel.url : 'https://t.me/zilzal_channel';
      const gr = social.telegramGroup ? social.telegramGroup.url : 'https://t.me/zilzal_chat';
      return `📢 **قنواتنا الرسمية على التلجرام:**\n• **القناة الرسمية:** ${ch}\n• **كروب الدردشة التفاعلي:** ${gr}\n\nانضم الآن وشارك في المسابقات اليومية والجوائز الحصرية! 🎁`;
    }
    if (t.includes('تيك') || t.includes('tiktok')) {
      const tk = social.tiktok ? social.tiktok.url : 'https://tiktok.com/@zilzal_official';
      return `🔥 **حساب تيك توك الرسمي:**\n${tk}\nتابعنا لمشاهدة أقوى التحديات والبثوث المباشرة والفعاليات!`;
    }
    if (t.includes('انستا') || t.includes('instagram')) {
      const ig = social.instagram ? social.instagram.url : 'https://instagram.com/zilzal_official';
      return `📸 **حساب انستغرام الرسمي:**\n${ig}\nتابع يوميات مجتمع زلزال والقصص التفاعلية الحصرية!`;
    }
    if (t.includes('العاب') || t.includes('ألعاب') || t.includes('لعبة') || t.includes('ثعبان') || t.includes('صقر') || t.includes('عجلة') || t.includes('ذاكرة') || t.includes('اكس')) {
      return `🎮 **صالة ألعاب زلزال الفاخرة:**\n1. **ثعبان زلزال النيون:** اجمع تفاح النيون وحقق أطول ثعبان!\n2. **صقر زلزال النفاث:** طر بين الأعمدة الكهربائية وحقق أعلى سكور.\n3. **عجلة الحظ الذهبية:** أدرها يومياً واربح مكافآت فورية.\n4. **تحدي الذاكرة:** اختبر تركيزك مع البطاقات المتطابقة.\n5. **إكس أو الذكية:** تحدى الذكاء الاصطناعي على 3 مستويات صعوبة!`;
    }
    if (t.includes('نقاط') || t.includes('مكافآت') || t.includes('جوائز') || t.includes('فلوس') || t.includes('ربح')) {
      return `💎 **نظام النقاط في منصة زلزال:**\n• تحصل على **50 نقطة** فورية عند الدخول كزائر.\n• تحصل على **100 نقطة** عند تسجيل حساب جديد بالإيميل.\n• كل لعبة تلعبها تمنحك نقاطاً تضاف مباشرة لرصيدك بناءً على نتيجتك!\n• أدر **عجلة الحظ** لتربح ما يصل إلى 500 نقطة إضافية! 🎁`;
    }
    if (t.includes('من انت') || t.includes('مين انت') || t.includes('منصة زلزال') || t.includes('عن الموقع')) {
      return `👑 **منصة زلزال:**\nالمنصة العربية الفاخرة للترفيه الرقمي، الألعاب التفاعلية، والمجتمعات الحصرية.\nتتميز بتصميم Dark Luxury Neon فخم، دعم كامل للجوال والكمبيوتر، وتعمل مباشرة على GitHub Pages! 🚀`;
    }
    if (t.includes('مدير') || t.includes('لوحة') || t.includes('ادارة') || t.includes('admin')) {
      return `🔐 **لوحة الإدارة:**\nيمكن لمدير المنصة الدخول من زر لوحة التحكم في الهيدر باسم المستخدم وكلمة المرور لتعديل الإعلانات، الروابط، الصور، وإحصائيات الزوار!`;
    }
    if (t.includes('نكتة') || t.includes('ضحكني') || t.includes('تحشيش') || t.includes('مزحة')) {
      const jokes = [
        ' هاي اكو واحد اسمه شويش ميفتح بث ليش ؟ لان عتقلو ههههه🎡😂😂',
        ' هاي اكو واحد اسمة سعيدي دخل بسنتات صار حزيني ههههه 🎡😂😂',
        ' قزمه فاتت ب الغساله عبالها ديلاب هوى 🎡😂😂',
        'دجاجه راحت للمستشفى ليش ؟ عدها ديك تنفس 😂😂',
         'اكو فد يوم سكران طب يسبح فتح الدوش وباوع عليه كله ليش تبجي اني شمسويلك 😂😂🙂',
         'اكو واحد اسمة سعود كبر صار نزول 😂😂',
         'كو واحد خشمة مسدود طلع عالخدمي 😂😂',
         'اكو واحد متدين تحارش بوحده ذبلها السبحه 📿😂😂',
         'اكو شيعي وسنيه تزوجو جابو اشعه سينيه 😂😂😂',
         'اكو بنيه اسمها هنا مشت شويه صارت هناك 😂😂😢',
         'فديوم ابو بريص كله ل ابنه من تنجح اجيبلك حايط هديه 😂😂🌚',
         'فايروس ديودع فايروس جان يكله الى اللقاح 😂😂',
         'واحد حجز عند الدكتور ثاني يوم خابره كله ما اكدر اجيك مريض 😂',
         'اكو واحد اكل اسمنت ليش ؟ حته يبني مستقبله 😂🌚',
        'اكو محامي فطر ليش وكلوا قضيه 😂😔',
        'واحده اهله علمو الأدب دك باب الثلاجه قبل ميفتحها😂🌚'
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    return `سؤال رائع! ⚡\nأنا هنا لمساعدتك في كل ما يخص **منصة زلزال**. يمكنك اختيار أحد الأسئلة المقترحة في الأسفل أو! 👑`;
  }

  return {
    init,
    sendMessage
  };
})();

window.AiAssistant = AiAssistant;
