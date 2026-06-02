import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { MessageBubble, DoshaBadge } from '../../components/UIElements';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';

const Chatbot = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);

  const messagesEndRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await api.chat.getHistory(user._id);
      if (res.success) {
        setMessages(res.chatHistory);
      }
    } catch (err) {
      console.error('Error loading chat logs:', err.message);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingResponse]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setInputMessage('');
    setLoadingResponse(true);

    // Optimistically push user message
    const tempUserMsg = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.chat.sendMessage(text, i18n.language);
      if (res.success) {
        setMessages(res.chatHistory);
      }
    } catch (err) {
      console.error('Error sending message:', err.message);
      
      const errorMsg = {
        role: 'assistant',
        content: t('chatbot.connectionError', { name: user.name || 'Rahul' }),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const suggestions = [
    t('chatbot.suggestion1', { dosha: user.dominantDosha || t('common.unknown') }),
    t('chatbot.suggestion2'),
    t('chatbot.suggestion3'),
    t('chatbot.suggestion4')
  ];

  return (
    <div className="bg-mesh dark:bg-mesh-dark min-h-[calc(100vh-64px)] flex flex-col relative overflow-hidden pb-10 transition-colors duration-300">
      {/* Glow Orbs */}
      <div className="absolute top-10 right-[-100px] w-96 h-96 bg-gold/5 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-20 left-[-100px] w-96 h-96 bg-sage/10 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative z-10">
        
        {/* Chat Room Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-herbal border border-sage-light/20 dark:border-sage/20 rounded-[28px] p-4.5 flex items-center justify-between shadow-xl flex-shrink-0 mb-5 transition-colors duration-300"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center relative shadow-md shadow-gold/5">
              <Bot className="w-6 h-6 animate-float" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-herbal" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-black text-earth dark:text-white flex items-center tracking-wide text-glow-gold font-heading">
                {t('chatbot.title')}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-ping" />
              </h3>
              <p className="text-[10px] text-sage/70 dark:text-sage-light/80 font-bold uppercase tracking-widest mt-0.5">{t('chatbot.roleDesc')}</p>
            </div>
          </div>
          <div className="hidden sm:block">
            {user.dominantDosha && user.dominantDosha !== 'Undetermined' && (
              <DoshaBadge dosha={user.dominantDosha} />
            )}
          </div>
        </motion.div>

        {/* Conversation Thread */}
        <div className="flex-1 bg-white/40 dark:bg-herbal/30 backdrop-blur-md rounded-[32px] border border-sage-light/10 dark:border-sage/20 p-5 overflow-y-auto space-y-4 min-h-0 dark-scrollbar shadow-inner shadow-black/5 transition-colors duration-300">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3.5"
              >
                <div className="w-16 h-16 rounded-3xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-playfair text-xl font-bold text-earth dark:text-white text-glow-gold font-heading">{t('chatbot.greeting', { name: user.name })}</h4>
                  <p className="text-xs text-gray-500 dark:text-sage-light/70 max-w-sm mx-auto mt-2 leading-relaxed font-semibold">
                    {t('chatbot.emptyPrompt')}
                  </p>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))
            )}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loadingResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-gradient-to-br from-herbal/95 to-herbal border border-sage/25 text-white rounded-3xl rounded-tl-none px-5 py-4 shadow-md flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-gold rounded-full bounce-dot"></span>
                <span className="w-2.5 h-2.5 bg-gold rounded-full bounce-dot"></span>
                <span className="w-2.5 h-2.5 bg-gold rounded-full bounce-dot"></span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length < 4 && !loadingResponse && (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="flex flex-wrap gap-2.5 mt-5 flex-shrink-0 justify-center"
          >
            {suggestions.map((sug, idx) => (
              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={idx}
                onClick={() => handleSendMessage(sug)}
                className="bg-white dark:bg-herbal hover:bg-sage/10 dark:hover:bg-sage border border-sage-light/30 dark:border-sage/35 text-sage dark:text-sage-light hover:text-earth dark:hover:text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {sug}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Chat Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-5 flex items-center space-x-3.5 flex-shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('chatbot.inputPlaceholder')}
            className="flex-1 bg-white dark:bg-herbal border border-sage-light/30 dark:border-sage/30 rounded-2xl px-5 py-4 text-sm text-earth dark:text-white placeholder-sage/40 dark:placeholder-sage-light/50 outline-none focus:border-gold/45 focus:ring-1 focus:ring-gold/20 transition-all shadow-inner"
            disabled={loadingResponse}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loadingResponse || !inputMessage.trim()}
            className="bg-gold hover:bg-gold-dark text-earth-dark p-4 rounded-2xl shadow-xl shadow-gold/5 transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
          >
            <Send className="w-5 h-5 fill-current" />
          </motion.button>
        </form>

      </div>
    </div>
  );
};

export default Chatbot;
