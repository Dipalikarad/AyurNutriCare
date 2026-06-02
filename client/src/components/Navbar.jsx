import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, User, Compass, Activity, Calendar, 
  MessageSquare, ShieldAlert, Sparkles, BookOpen, Sun, Moon 
} from 'lucide-react';
import { DoshaBadge } from './UIElements';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, updateLocalLanguage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const isEnglish = currentLanguage.startsWith('en');
  const navigate = useNavigate();
  const location = useLocation();
  const [showLangDropdown, setShowLangDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown on clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
    ${isActive(path) 
      ? 'text-earth dark:text-white' 
      : 'text-earth/65 dark:text-white/65 hover:text-earth dark:hover:text-white hover:bg-sage/10 dark:hover:bg-sage/15'
    }
  `;

  return (
    <nav className="bg-white/70 dark:bg-herbal/90 backdrop-blur-md border-b border-sage-light/15 dark:border-sage/20 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-earth dark:text-white font-playfair font-black text-xl tracking-tight hover:scale-[1.01] transition-transform">
              <span className="text-sage text-2xl animate-float">🌿</span>
              <span>Ayur<span className="text-sage">Nutri</span>Care</span>
            </Link>

            {user && (
              <div className="hidden md:flex space-x-1 items-center">
                {user.role === 'dietitian' ? (
                  <>
                    <Link to="/dietitian/dashboard" className={linkClass('/dietitian/dashboard')}>
                      <Activity className="w-4 h-4 text-sage" />
                      <span>{t('nav.dashboard')}</span>
                      {isActive('/dietitian/dashboard') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/dietitian/patients" className={linkClass('/dietitian/patients')}>
                      <User className="w-4 h-4 text-sage" />
                      <span>{t('nav.patients')}</span>
                      {isActive('/dietitian/patients') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/dietitian/analytics" className={linkClass('/dietitian/analytics')}>
                      <Compass className="w-4 h-4 text-sage" />
                      <span>{t('nav.analytics')}</span>
                      {isActive('/dietitian/analytics') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/patient/dashboard" className={linkClass('/patient/dashboard')}>
                      <Activity className="w-4 h-4 text-sage" />
                      <span>{t('nav.dashboard')}</span>
                      {isActive('/patient/dashboard') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/patient/plan" className={linkClass('/patient/plan')}>
                      <BookOpen className="w-4 h-4 text-sage" />
                      <span>{t('nav.plan')}</span>
                      {isActive('/patient/plan') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/patient/chat" className={linkClass('/patient/chat')}>
                      <MessageSquare className="w-4 h-4 text-sage" />
                      <span>{t('nav.ayurbot')}</span>
                      {isActive('/patient/chat') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/patient/checker" className={linkClass('/patient/checker')}>
                      <ShieldAlert className="w-4 h-4 text-sage" />
                      <span>{t('nav.checker')}</span>
                      {isActive('/patient/checker') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                    <Link to="/patient/profile" className={linkClass('/patient/profile')}>
                      <User className="w-4 h-4 text-sage" />
                      <span>{t('nav.profile')}</span>
                      {isActive('/patient/profile') && (
                        <motion.span layoutId="activeNav" className="absolute bottom-[-16px] left-3 right-3 h-0.5 bg-gold shadow-md shadow-gold" />
                      )}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Premium Language Dropdown */}
            <div className="relative font-bold" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-sage/25 text-earth dark:text-sage-light hover:bg-sage/10 dark:hover:bg-sage/15 hover:text-sage dark:hover:text-gold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 text-xs font-black bg-white dark:bg-herbal/30"
              >
                <span>🌐</span>
                <span>
                  {currentLanguage === 'en' ? '🇬🇧 English' : currentLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇮🇳 मराठी'}
                </span>
                <span className="text-[8px] transition-transform duration-200" style={{ transform: showLangDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </motion.button>

              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 rounded-2xl shadow-xl bg-white/90 dark:bg-herbal/95 backdrop-blur-md border border-sage-light/20 dark:border-sage/35 overflow-hidden z-50 py-1"
                  >
                    <button
                      onClick={async () => {
                        await i18n.changeLanguage('en');
                        localStorage.setItem('ayn-lang', 'en');
                        if (user) {
                          try {
                            await api.auth.updateLanguage('en');
                            updateLocalLanguage('en');
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                        currentLanguage === 'en'
                          ? 'bg-sage/10 dark:bg-sage/20 text-sage dark:text-gold font-black'
                          : 'text-earth dark:text-sage-light hover:bg-sage/5 dark:hover:bg-sage/10 hover:text-sage dark:hover:text-white'
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>English</span>
                    </button>
                    <button
                      onClick={async () => {
                        await i18n.changeLanguage('hi');
                        localStorage.setItem('ayn-lang', 'hi');
                        if (user) {
                          try {
                            await api.auth.updateLanguage('hi');
                            updateLocalLanguage('hi');
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                        currentLanguage === 'hi'
                          ? 'bg-sage/10 dark:bg-sage/20 text-sage dark:text-gold font-black'
                          : 'text-earth dark:text-sage-light hover:bg-sage/5 dark:hover:bg-sage/10 hover:text-sage dark:hover:text-white'
                      }`}
                    >
                      <span>🇮🇳</span>
                      <span>हिंदी</span>
                    </button>
                    <button
                      onClick={async () => {
                        await i18n.changeLanguage('mr');
                        localStorage.setItem('ayn-lang', 'mr');
                        if (user) {
                          try {
                            await api.auth.updateLanguage('mr');
                            updateLocalLanguage('mr');
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                        currentLanguage === 'mr'
                          ? 'bg-sage/10 dark:bg-sage/20 text-sage dark:text-gold font-black'
                          : 'text-earth dark:text-sage-light hover:bg-sage/5 dark:hover:bg-sage/10 hover:text-sage dark:hover:text-white'
                      }`}
                    >
                      <span>🇮🇳</span>
                      <span>मराठी</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Animated Light/Dark Mode Switcher */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-150 dark:border-sage/25 text-gray-500 dark:text-sage-light hover:bg-sage/10 dark:hover:bg-sage/15 hover:text-sage dark:hover:text-gold transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title={theme === 'light' ? t('nav.switchToDarkMode', 'Switch to Dark Mode') : t('nav.switchToLightMode', 'Switch to Light Mode')}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-gold" /> : <Moon className="w-4.5 h-4.5 text-earth" />}
              </motion.div>
            </motion.button>

            {user ? (
              <div className="flex items-center space-x-3.5 border-l border-gray-100 dark:border-sage/20 pl-3.5">
                {user.role === 'patient' && user.dominantDosha && user.dominantDosha !== 'Undetermined' && (
                  <div className="hidden sm:block">
                    <DoshaBadge dosha={user.dominantDosha} />
                  </div>
                )}
                
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-sage font-bold uppercase tracking-wider">{t(`common.${user.role}`)}</p>
                  <p className="text-sm font-bold text-earth dark:text-white">{user.name}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2.5 rounded-xl border border-gray-150 dark:border-sage/25 text-gray-500 dark:text-white/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-450 hover:border-rose-200 dark:hover:border-rose-900/30 transition-all cursor-pointer shadow-sm"
                  title={t('common.navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 border-l border-gray-100 dark:border-sage/20 pl-3.5">
                <Link 
                  to="/login" 
                  className="px-4.5 py-2.5 rounded-xl text-sm font-bold text-earth dark:text-white/80 hover:bg-sage/10 dark:hover:bg-sage/15 transition-all"
                >
                  {t('common.navLogin')}
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/register" 
                    className="px-5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-sm font-bold shadow-md shadow-sage/15 transition-all block"
                  >
                    {t('common.navSignUp')}
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation bottom bar */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/80 dark:bg-herbal/90 backdrop-blur-lg border border-sage-light/20 dark:border-sage/25 rounded-2xl p-2.5 flex justify-around shadow-xl shadow-earth/5 dark:shadow-black/20 transition-all duration-300">
          {user.role === 'dietitian' ? (
            <>
              <Link to="/dietitian/dashboard" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/dietitian/dashboard') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <Activity className="w-4.5 h-4.5" />
                <span>{t('nav.dashboard')}</span>
              </Link>
              <Link to="/dietitian/patients" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/dietitian/patients') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <User className="w-4.5 h-4.5" />
                <span>{t('nav.patients')}</span>
              </Link>
              <Link to="/dietitian/analytics" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/dietitian/analytics') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <Compass className="w-4.5 h-4.5" />
                <span>{t('nav.analytics')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/patient/dashboard" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/patient/dashboard') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <Activity className="w-4.5 h-4.5" />
                <span>{t('nav.dashboard')}</span>
              </Link>
              <Link to="/patient/plan" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/patient/plan') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <BookOpen className="w-4.5 h-4.5" />
                <span>{t('nav.plan')}</span>
              </Link>
              <Link to="/patient/chat" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/patient/chat') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <MessageSquare className="w-4.5 h-4.5" />
                <span>{t('nav.ayurbot')}</span>
              </Link>
              <Link to="/patient/checker" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/patient/checker') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>{t('nav.checker')}</span>
              </Link>
              <Link to="/patient/profile" className={`p-2 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${isActive('/patient/profile') ? 'text-sage font-bold bg-sage/10 dark:bg-sage/25' : 'text-gray-500 dark:text-white/60 hover:text-earth dark:hover:text-white'}`}>
                <User className="w-4.5 h-4.5" />
                <span>{t('nav.profile')}</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
