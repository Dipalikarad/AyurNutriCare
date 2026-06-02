const ChatHistory = require('../models/ChatHistory');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { generateChatResponse } = require('../services/aiService');

const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== 'string') return 'en';
  const clean = lang.toLowerCase().trim();
  if (clean.startsWith('hi')) return 'hi';
  if (clean.startsWith('mr')) return 'mr';
  return 'en';
};

const WELCOME_MESSAGES = {
  en: {
    base: "Namaste! I am AyurBot, your Ayurvedic dietitian assistant. ",
    hasDosha: (dosha) => `I see your dominant Prakriti (Dosha) is **${dosha}**. How can I help you customize your diet or understand incompatible combinations today?`,
    noDosha: "Take the **Prakriti Quiz** in the Profile section so I can tailor my recommendations to your body constitution! What would you like to ask me today?"
  },
  hi: {
    base: "नमस्ते! मैं आयुर्बॉट हूँ, आपका व्यक्तिगत आयुर्वेदिक आहार सहायक। ",
    hasDosha: (dosha) => `मैं देख सकता हूँ कि आपकी मुख्य प्रकृति (दोष) **${dosha}** है। आज मैं आपके आहार को अनुकूलित करने या विरुद्ध आहार को समझने में आपकी क्या मदद कर सकता हूँ?`,
    noDosha: "प्रोफ़ाइल अनुभाग में **प्रकृति प्रश्नोत्तरी (Prakriti Quiz)** लें ताकि मैं आपकी शारीरिक प्रकृति के अनुसार अपनी सिफारिशों को तैयार कर सकूँ! आज आप मुझसे क्या पूछना चाहेंगे?"
  },
  mr: {
    base: "नमस्ते! मी आयुर्बॉट आहे, तुमचा वैयक्तिक आयुर्वेदिक आहार सहाय्यक. ",
    hasDosha: (dosha) => `मी पाहू शकतो की तुमची मुख्य प्रकृती (दोष) **${dosha}** आहे. आज मी तुम्हाला तुमचा आहार सानुकूलित करण्यात किंवा विरुद्ध आहार समजून घेण्यात कशी मदत करू शकतो?`,
    noDosha: "प्रोफाइल विभागात **प्रकृती क्विझ (Prakriti Quiz)** घ्या जेणेकरून मी तुमच्या शरीर प्रकृतीनुसार माझ्या शिफारसी तयार करू शकेन! आज तुम्हाला मला काय विचारायचे आहे?"
  }
};

const translateDoshaName = (dosha, lang) => {
  if (!dosha) return 'Undetermined';
  if (dosha === 'Undetermined') return lang === 'mr' ? 'अनिर्धारित' : lang === 'hi' ? 'अनिर्धारित' : 'Undetermined';
  if (lang === 'en') return dosha;
  return dosha
    .split('-')
    .map(d => {
      const clean = d.trim().toLowerCase();
      if (clean === 'vata') return 'वात';
      if (clean === 'pitta') return 'पित्त';
      if (clean === 'kapha') return 'कफ';
      return d;
    })
    .join('-');
};

// @desc    Get chat history for patient
// @route   GET /api/chat/history/:patientId
// @access  Private
exports.getChatHistory = async (req, res) => {
  const patientId = req.params.patientId;

  // Authorization check
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ success: false, message: 'Unauthorized chat history access' });
  }

  try {
    let chat = await ChatHistory.findOne({ patientId });
    if (!chat) {
      // Lazy init with welcome message
      const profile = await PatientProfile.findOne({ userId: patientId });
      const user = await User.findById(patientId);
      const rawLang = user ? user.preferredLanguage || 'en' : 'en';
      const preferredLang = normalizeLanguage(rawLang);

      const dosha = profile ? profile.dominantDosha : 'Undetermined';
      const localizedDosha = translateDoshaName(dosha, preferredLang);
      
      const welcomeTemplates = WELCOME_MESSAGES[preferredLang] || WELCOME_MESSAGES.en;
      let welcomeText = welcomeTemplates.base;
      if (dosha && dosha !== 'Undetermined') {
        welcomeText += welcomeTemplates.hasDosha(localizedDosha);
      } else {
        welcomeText += welcomeTemplates.noDosha;
      }

      chat = await ChatHistory.create({
        patientId,
        messages: [
          {
            role: 'assistant',
            content: welcomeText,
            timestamp: new Date()
          }
        ]
      });
    }

    res.status(200).json({
      success: true,
      chatHistory: chat.messages
    });
  } catch (error) {
    console.error('getChatHistory error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Post a message and get response
// @route   POST /api/chat/message
// @access  Private (Patient only)
exports.sendMessage = async (req, res) => {
  const { message, language } = req.body;
  const rawLang = language || req.user.preferredLanguage || 'en';
  const preferredLang = normalizeLanguage(rawLang);

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  try {
    // 1. Get patient's profile to retrieve Dosha context
    const profile = await PatientProfile.findOne({ userId: req.user.id });
    const dosha = profile ? profile.dominantDosha : 'Undetermined';

    // 2. Fetch or create chat history
    let chat = await ChatHistory.findOne({ patientId: req.user.id });
    if (!chat) {
      chat = new ChatHistory({
        patientId: req.user.id,
        messages: []
      });
    }

    // Save user message first
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    chat.messages.push(userMessage);
    await chat.save();

    // 3. Request Claude/fallback response (pass message + dosha + last 10 messages for context)
    const recentHistory = chat.messages.slice(-10); // limit context size
    const replyText = await generateChatResponse(message, dosha, recentHistory, preferredLang);

    // 4. Save assistant response
    const assistantMessage = {
      role: 'assistant',
      content: replyText,
      timestamp: new Date()
    };
    chat.messages.push(assistantMessage);
    await chat.save();

    res.status(200).json({
      success: true,
      reply: replyText,
      chatHistory: chat.messages
    });
  } catch (error) {
    console.error('sendMessage error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
