import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart, Apple, Bot, ShieldCheck, ArrowRight, Star, Users, Flame, Award } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-24 overflow-hidden relative">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-[-100px] w-[350px] h-[350px] rounded-full bg-sage-light/20 dark:bg-sage/10 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-100px] w-[400px] h-[400px] rounded-full bg-saffron/10 dark:bg-gold/5 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-[10px] font-extrabold bg-sage/10 dark:bg-sage/20 text-sage-dark dark:text-sage-light border border-sage/20 dark:border-sage/35 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-bounce" /> {t('home.reconnecting')}
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-black text-earth dark:text-white tracking-tight font-playfair max-w-5xl mx-auto leading-none"
        >
          {t('home.titleStart')} <span className="text-sage text-glow-gold relative inline-block">{t('home.titleAyurveda')}<span className="absolute bottom-1 left-0 w-full h-1 bg-gold/30 rounded-full" /></span> {t('home.titleMiddle')} <span className="text-saffron">{t('home.titleNutrition')}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg lg:text-xl text-gray-500 dark:text-white/60 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          {t('home.subtitle')}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto sm:max-w-none"
        >
          {user ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={user.role === 'dietitian' ? '/dietitian/dashboard' : '/patient/dashboard'}
                className="px-8 py-4 bg-sage hover:bg-sage-dark text-white rounded-2xl text-base font-extrabold shadow-lg shadow-sage/20 flex items-center gap-2"
              >
                <span>{t('home.dashboardBtn')}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-sage hover:bg-sage-dark text-white rounded-2xl text-base font-extrabold shadow-lg shadow-sage/25 flex items-center gap-2"
                >
                  <span>{t('home.getStartedBtn')}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/80 dark:bg-herbal/30 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-herbal/45 border border-gray-200 dark:border-sage/25 text-earth dark:text-white rounded-2xl text-base font-extrabold shadow-sm transition-all block"
                >
                  {t('home.loginBtn')}
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Trust Metrics Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/50 dark:bg-herbal/40 backdrop-blur-md rounded-3xl p-6 border border-sage-light/10 dark:border-sage/20 shadow-sm text-center">
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-sage dark:text-gold">50K+</span>
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider">{t('home.stats.meals')}</span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-sage dark:text-gold">12K+</span>
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider">{t('home.stats.quizzes')}</span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-sage dark:text-gold">98%</span>
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider">{t('home.stats.compliance')}</span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-sage dark:text-gold">24/7</span>
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider">{t('home.stats.guidance')}</span>
          </div>
        </div>
      </motion.div>

      {/* Feature Blocks Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10">
        <h2 className="text-center font-playfair text-3xl sm:text-4xl font-extrabold text-earth dark:text-white mb-12">
          {t('home.philosophy.title')}
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white/80 dark:bg-herbal/50 backdrop-blur-sm rounded-3xl p-7 shadow-sm border border-sage-light/10 dark:border-sage/15 hover:shadow-xl hover:shadow-sage/5 dark:hover:shadow-black/20 transition-all text-earth dark:text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-sage-light/15 dark:bg-sage/20 text-sage dark:text-gold flex items-center justify-center mb-6 shadow-sm border border-transparent dark:border-sage/10">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-playfair text-xl font-bold mb-2.5">{t('home.features.prakritiTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.features.prakritiDesc')}
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white/80 dark:bg-herbal/50 backdrop-blur-sm rounded-3xl p-7 shadow-sm border border-sage-light/10 dark:border-sage/15 hover:shadow-xl hover:shadow-sage/5 dark:hover:shadow-black/20 transition-all text-earth dark:text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-saffron/10 dark:bg-saffron/20 text-saffron flex items-center justify-center mb-6 shadow-sm border border-transparent dark:border-sage/10">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="font-playfair text-xl font-bold mb-2.5">{t('home.features.dietTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.features.dietDesc')}
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white/80 dark:bg-herbal/50 backdrop-blur-sm rounded-3xl p-7 shadow-sm border border-sage-light/10 dark:border-sage/15 hover:shadow-xl hover:shadow-sage/5 dark:hover:shadow-black/20 transition-all text-earth dark:text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-herbal-light/15 dark:bg-sage/20 text-sage dark:text-gold flex items-center justify-center mb-6 shadow-sm border border-transparent dark:border-sage/10">
              <Bot className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-playfair text-xl font-bold mb-2.5">{t('home.features.botTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.features.botDesc')}
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="bg-white/80 dark:bg-herbal/50 backdrop-blur-sm rounded-3xl p-7 shadow-sm border border-sage-light/10 dark:border-sage/15 hover:shadow-xl hover:shadow-sage/5 dark:hover:shadow-black/20 transition-all text-earth dark:text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-sm border border-transparent dark:border-sage/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-playfair text-xl font-bold mb-2.5">{t('home.features.checkerTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.features.checkerDesc')}
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Wellness Philosophy Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10"
      >
        <div className="bg-white/80 dark:bg-herbal/40 backdrop-blur-md rounded-[32px] p-8 sm:p-14 shadow-md border border-sage-light/10 dark:border-sage/15 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-earth/20 dark:from-black/40 to-transparent rounded-2xl z-10" />
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-gold rounded-tl-2xl pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-4 border-r-4 border-sage rounded-br-2xl pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500" 
              alt="Ayurvedic herbs and wellness" 
              className="rounded-2xl object-cover h-72 sm:h-80 w-full shadow-inner relative z-0"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-5">
            <span className="text-[10px] font-bold text-saffron dark:text-gold uppercase tracking-widest bg-saffron/10 dark:bg-saffron/20 border border-saffron/20 dark:border-saffron/35 px-3.5 py-1 rounded-full">Philosophy</span>
            <h3 className="font-playfair text-3xl sm:text-4xl font-black text-earth dark:text-white leading-tight">{t('home.philosophy.prakritiTitle')}</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.philosophy.prakritiDesc1')}
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 leading-relaxed font-medium">
              {t('home.philosophy.prakritiDesc2')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10">
        <h2 className="text-center font-playfair text-3xl sm:text-4xl font-extrabold text-earth dark:text-white mb-4">
          {t('home.testimonials.title')}
        </h2>
        <p className="text-center text-sm text-gray-400 dark:text-white/40 font-semibold uppercase tracking-widest mb-12">{t('home.testimonials.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-herbal/45 backdrop-blur-sm p-6 rounded-3xl border border-gray-150 dark:border-sage/15 shadow-sm space-y-4 text-earth dark:text-white">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
            </div>
            <p className="text-sm text-gray-500 dark:text-white/75 leading-relaxed italic font-medium">
              {t('home.testimonials.user1Text')}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-sage/10 text-sage dark:text-gold flex items-center justify-center font-bold text-xs">P</div>
              <div>
                <h4 className="text-xs font-bold">{t('home.testimonials.user1Name')}</h4>
                <p className="text-[10px] text-gray-400 dark:text-white/50">{t('home.testimonials.user1Desc')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-herbal/45 backdrop-blur-sm p-6 rounded-3xl border border-gray-150 dark:border-sage/15 shadow-sm space-y-4 text-earth dark:text-white">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
            </div>
            <p className="text-sm text-gray-500 dark:text-white/75 leading-relaxed italic font-medium">
              {t('home.testimonials.user2Text')}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-saffron/10 text-saffron-dark dark:text-gold flex items-center justify-center font-bold text-xs">R</div>
              <div>
                <h4 className="text-xs font-bold">{t('home.testimonials.user2Name')}</h4>
                <p className="text-[10px] text-gray-400 dark:text-white/50">{t('home.testimonials.user2Desc')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white/70 dark:bg-herbal/45 backdrop-blur-sm p-6 rounded-3xl border border-gray-150 dark:border-sage/15 shadow-sm space-y-4 text-earth dark:text-white">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
            </div>
            <p className="text-sm text-gray-500 dark:text-white/75 leading-relaxed italic font-medium">
              {t('home.testimonials.user3Text')}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 dark:text-gold flex items-center justify-center font-bold text-xs">A</div>
              <div>
                <h4 className="text-xs font-bold">{t('home.testimonials.user3Name')}</h4>
                <p className="text-[10px] text-gray-400 dark:text-white/50">{t('home.testimonials.user3Desc')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
