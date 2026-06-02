import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { 
  Flame, Droplet, Wind, Clock, User, ArrowRight, 
  CheckCircle2, TrendingUp, Sparkles, Utensils, Apple, Copy, Check 
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const translateDoshaHelper = (d, t) => {
  if (!d) return t('common.unknown');
  if (d === 'Undetermined') return t('common.unknown');
  const parts = d.split('-');
  const translatedParts = parts.map(part => {
    const clean = part.trim().toLowerCase();
    if (clean === 'vata') return t('profile.constitVata');
    if (clean === 'pitta') return t('profile.constitPitta');
    if (clean === 'kapha') return t('profile.constitKapha');
    return part;
  });
  return translatedParts.join('-');
};

export const translateFoodHelper = (f, i18n) => {
  if (!f) return f;
  const lower = f.toLowerCase().trim();
  const foodMap = {
    'moong dal': { en: 'Moong Dal', hi: 'मूंग दाल', mr: 'मूग डाळ' },
    'chana dal': { en: 'Chana Dal', hi: 'चना दाल', mr: 'चना डाळ' },
    'rice': { en: 'Rice', hi: 'चावल', mr: 'भात' },
    'wheat': { en: 'Wheat', hi: 'गेहूं', mr: 'गहू' },
    'ghee': { en: 'Ghee', hi: 'घी', mr: 'तूप' },
    'milk': { en: 'Milk', hi: 'दूध', mr: 'दूध' },
    'curd': { en: 'Curd', hi: 'दही', mr: 'दही' },
    'ginger': { en: 'Ginger', hi: 'अदरक', mr: 'आले' },
    'turmeric': { en: 'Turmeric', hi: 'हल्दी', mr: 'हळद' },
    'cumin': { en: 'Cumin', hi: 'जीरा', mr: 'जिरे' },
    'coriander': { en: 'Coriander', hi: 'धनिया', mr: 'धणे' },
    'amla': { en: 'Amla', hi: 'आंवला', mr: 'आवळा' },
    'ashwagandha': { en: 'Ashwagandha', hi: 'अश्वगंधा', mr: 'अश्वगंधा' },
    'triphala': { en: 'Triphala', hi: 'त्रिफला', mr: 'त्रिफळा' },
    'spinach': { en: 'Spinach', hi: 'पालक', mr: 'पालक' },
    'methi': { en: 'Methi', hi: 'मेथी', mr: 'मेथी' },
    'pomegranate': { en: 'Pomegranate', hi: 'अनार', mr: 'डाळिंब' },
    'coconut': { en: 'Coconut', hi: 'नारियल', mr: 'नारळ' },
    'sesame': { en: 'Sesame', hi: 'तिल', mr: 'तीळ' },
    'honey': { en: 'Honey', hi: 'शहद', mr: 'मध' },
    'garlic': { en: 'Garlic', hi: 'लहसुन', mr: 'लसूण' },
    'onion': { en: 'Onion', hi: 'प्याज़', mr: 'कांदा' },
    'lemon': { en: 'Lemon', hi: 'नींबू', mr: 'लिंबू' },
    'tomato': { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
    'potato': { en: 'Potato', hi: 'आलू', mr: 'बटाटा' },
    'mustard seeds': { en: 'Mustard Seeds', hi: 'सरसों के बीज', mr: 'मोहरी' },
    'black pepper': { en: 'Black Pepper', hi: 'काली मिर्च', mr: 'काळी मिरी' },
    'cardamom': { en: 'Cardamom', hi: 'इलायची', mr: 'वेलदोडा' },
    'fennel seeds': { en: 'Fennel Seeds', hi: 'सौंफ', mr: 'बडीशेप' },
    'mint': { en: 'Mint', hi: 'पुदीना', mr: 'पुदिना' },
    'almonds': { en: 'Almonds', hi: 'बादाम', mr: 'बदाम' },
    'cashews': { en: 'Cashews', hi: 'काजू', mr: 'काजू' },
    'raisins': { en: 'Raisins', hi: 'किशमिश', mr: 'मनुका' },
    'dates': { en: 'Dates', hi: 'खजूर', mr: 'खजूर' },
    'figs': { en: 'Figs', hi: 'अंजीर', mr: 'अंजीर' },
    'apple': { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' },
    'banana': { en: 'Banana', hi: 'केला', mr: 'केळे' },
    'mango': { en: 'Mango', hi: 'आम', mr: 'आंबा' },
    'papaya': { en: 'Papaya', hi: 'पपीता', mr: 'पपई' },
    'bitter gourd (karela)': { en: 'Bitter Gourd', hi: 'करेला', mr: 'कारले' },
    'bottle gourd (lauki)': { en: 'Bottle Gourd', hi: 'लौकी', mr: 'दुधी भोपळा' },
    'eggplant (baingan)': { en: 'Eggplant', hi: 'बैंगन', mr: 'वांगे' },
    'okra (bhindi)': { en: 'Okra', hi: 'भिंडी', mr: 'भेंडी' },
    'chickpeas (kabuli chana)': { en: 'Chickpeas', hi: 'चना', mr: 'हरभरा' },
    'buttermilk (takra)': { en: 'Buttermilk', hi: 'छाछ', mr: 'ताक' },
    'paneer': { en: 'Paneer', hi: 'पनीर', mr: 'पनीर' },
    'fish (rohu)': { en: 'Fish', hi: 'मछली', mr: 'मासे' },
    'chicken': { en: 'Chicken', hi: 'चिकन', mr: 'चिकन' },
    'basil (tulsi)': { en: 'Basil', hi: 'तुलसी', mr: 'तुळस' },
    'jaggery (gur)': { en: 'Jaggery', hi: 'गुड़', mr: 'गूळ' }
  };

  const match = Object.keys(foodMap).find(k => lower.includes(k) || k.includes(lower));
  if (match) {
    const currentLang = i18n.language || 'en';
    const langKey = currentLang.startsWith('en') ? 'en' : currentLang.startsWith('hi') ? 'hi' : 'mr';
    return foodMap[match][langKey];
  }
  return f;
};

// 1. DoshaBadge
export const DoshaBadge = ({ dosha }) => {
  const { t } = useTranslation();

  const translateDosha = (d) => {
    return translateDoshaHelper(d, t);
  };

  const getStyle = (d) => {
    if (!d) return 'from-gray-100 to-gray-200 dark:from-herbal-dark/40 dark:to-herbal-dark/60 text-gray-700 dark:text-white/70 border-gray-300/30 dark:border-sage/20';
    const cleanDosha = d.toLowerCase();
    
    if (cleanDosha.includes('vata-pitta') || cleanDosha.includes('pitta-vata')) {
      return 'from-sky-500/10 to-saffron/10 dark:from-sky-500/20 dark:to-saffron/20 text-saffron-dark dark:text-saffron border-saffron/20 shadow-sm shadow-saffron/5';
    }
    if (cleanDosha.includes('vata-kapha') || cleanDosha.includes('kapha-vata')) {
      return 'from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20 text-emerald-800 dark:text-emerald-450 border-emerald-500/20 shadow-sm shadow-emerald-500/5';
    }
    if (cleanDosha.includes('pitta-kapha') || cleanDosha.includes('kapha-pitta')) {
      return 'from-saffron/10 to-emerald-500/10 dark:from-saffron/20 dark:to-emerald-500/20 text-emerald-800 dark:text-emerald-450 border-emerald-500/20 shadow-sm shadow-emerald-500/5';
    }
    if (cleanDosha.includes('vata')) {
      return 'from-sky-500/10 to-sky-500/5 dark:from-sky-500/20 dark:to-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 shadow-sm shadow-sky-500/5';
    }
    if (cleanDosha.includes('pitta')) {
      return 'from-saffron/10 to-saffron/5 dark:from-saffron/20 dark:to-saffron/10 text-saffron-dark dark:text-saffron border-saffron/20 shadow-sm shadow-saffron/5';
    }
    if (cleanDosha.includes('kapha')) {
      return 'from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20 shadow-sm shadow-emerald-500/5';
    }
    return 'from-orange-50 to-orange-100 text-orange-700 border-orange-200';
  };

  const getIcon = (d) => {
    if (!d) return null;
    const clean = d.toLowerCase();
    if (clean.includes('vata') && clean.includes('pitta')) return <Sparkles className="w-3.5 h-3.5 text-saffron" />;
    if (clean.includes('vata')) return <Wind className="w-3.5 h-3.5 text-sky-500 dark:text-sky-450" />;
    if (clean.includes('pitta')) return <Flame className="w-3.5 h-3.5 text-saffron-dark dark:text-saffron" />;
    if (clean.includes('kapha')) return <Droplet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />;
    return <Sparkles className="w-3.5 h-3.5 text-saffron" />;
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-gradient-to-r ${getStyle(dosha)}`}>
      {getIcon(dosha)}
      <span className="capitalize">{translateDosha(dosha)}</span>
    </span>
  );
};

// 2. NutritionCard
export const NutritionCard = ({ food }) => {
  const { t } = useTranslation();
  if (!food) return null;
  const { nutrition, ayurveda, category, incompatible_with } = food;

  const translateDosha = (d) => {
    return translateDoshaHelper(d, t);
  };

  const getPercent = (value, max) => Math.min(Math.round((value / max) * 100), 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glassmorphism-premium dark:bg-herbal/90 dark:border-sage/20 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-sage/5 transition-all duration-300"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-herbal to-sage dark:from-herbal-dark dark:to-herbal p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-playfair text-2xl font-bold tracking-wide text-glow-gold">{food.name}</h3>
            <p className="text-xs text-cream/70 dark:text-white/60 font-semibold tracking-widest uppercase mt-0.5">{category}</p>
          </div>
          {ayurveda?.dosha_effect && (
            <div className="flex flex-wrap gap-1">
              {Object.keys(ayurveda.dosha_effect).map((d) => (
                ayurveda.dosha_effect[d] === 'balances' && (
                  <span key={d} className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                    {translateDosha(d)} {t('ui.balances')}
                  </span>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-150/40 dark:divide-sage/20 p-5">
        {/* Left Side: Modern Nutrition */}
        <div className="pb-4 md:pb-0 md:pr-5">
          <h4 className="text-xs font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Apple className="w-4 h-4 text-saffron" /> {t('ui.modernNutrition')}
          </h4>
          <div className="space-y-3">
            {/* Calories */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-white/70">
                <span>{t('ui.calories')}</span>
                <span className="font-bold text-earth dark:text-white">{nutrition?.calories || 0} kcal</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
                <div className="h-full bg-saffron rounded-full" style={{ width: `${getPercent(nutrition?.calories || 0, 400)}%` }}></div>
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-white/70">
                <span>{t('ui.protein')}</span>
                <span className="font-bold text-earth dark:text-white">{nutrition?.protein || 0}g</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
                <div className="h-full bg-sage rounded-full" style={{ width: `${getPercent(nutrition?.protein || 0, 30)}%` }}></div>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-white/70">
                <span>{t('ui.carbs')}</span>
                <span className="font-bold text-earth dark:text-white">{nutrition?.carbs || 0}g</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${getPercent(nutrition?.carbs || 0, 80)}%` }}></div>
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-white/70">
                <span>{t('ui.fat')}</span>
                <span className="font-bold text-earth dark:text-white">{nutrition?.fat || 0}g</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${getPercent(nutrition?.fat || 0, 20)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ayurvedic Attributes */}
        <div className="pt-4 md:pt-0 md:pl-5">
          <h4 className="text-xs font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sage" /> {t('ui.ayurvedicAttributes')}
          </h4>
          <div className="space-y-3.5 text-sm text-gray-700 dark:text-white/80">
            <div>
              <span className="text-gray-400 dark:text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1">{t('ui.rasa')}</span>
              <div className="flex flex-wrap gap-1.5">
                {ayurveda?.rasa?.map((r) => (
                  <span key={r} className="bg-cream dark:bg-herbal-dark border border-cream-dark/50 dark:border-sage/20 text-earth dark:text-white/90 text-xs px-2.5 py-0.5 rounded-lg font-bold capitalize">
                    {r}
                  </span>
                )) || <span className="text-gray-400 dark:text-white/40 text-xs font-semibold">N/A</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-gray-450 dark:text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1">{t('ui.virya')}</span>
                <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-xl capitalize ${
                  ayurveda?.virya === 'Ushna' 
                    ? 'bg-saffron/10 text-saffron-dark dark:text-saffron border border-saffron/20' 
                    : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25'
                }`}>
                  {ayurveda?.virya || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1">{t('ui.vipaka')}</span>
                <span className="font-bold text-xs text-earth dark:text-white bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light border border-sage/20 dark:border-sage/35 px-2.5 py-1 rounded-xl inline-block">
                  {ayurveda?.vipaka || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Incompatible alerts */}
      {incompatible_with && incompatible_with.length > 0 && (
        <div className="bg-rose-500/5 dark:bg-rose-500/10 border-t border-rose-500/10 dark:border-rose-500/20 px-5 py-3">
          <p className="text-xs text-rose-700 dark:text-rose-450 font-bold flex items-center gap-1.5">
            <span>⚠️ {t('ui.incompatibleWith')}</span> 
            <span className="font-semibold text-earth-dark/70 dark:text-white/70">{incompatible_with.join(', ')}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

// 3. MealCard
export const MealCard = ({ meal, isEaten, onToggleEaten, showCheckbox = true }) => {
  const [expanded, setExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  if (!meal) return null;
  const { name, time, description, nutrition, ayurvedaNote, foods } = meal;

  const getTranslatedMealName = (meal) => {
    if (!meal) return '';
    const key = meal.key;
    if (key) {
      const translated = t(`meal_slots.${key}`);
      if (translated && translated !== `meal_slots.${key}`) return translated;
    }
    // Fallback: search by name
    const nameLower = meal.name?.toLowerCase().trim().replace(/\s+/g, '');
    if (nameLower === 'morningroutine') return t('meal_slots.morningRoutine');
    if (nameLower === 'breakfast') return t('meal_slots.breakfast');
    if (nameLower === 'midmorningsnack') return t('meal_slots.midMorningSnack');
    if (nameLower === 'lunch') return t('meal_slots.lunch');
    if (nameLower === 'eveningsnack') return t('meal_slots.eveningSnack');
    if (nameLower === 'dinner') return t('meal_slots.dinner');
    if (nameLower === 'bedtimeroutine') return t('meal_slots.bedtime');
    return meal.name;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-3xl p-5 shadow-sm transition-all duration-300 overflow-hidden ${
        isEaten 
          ? 'bg-sage/5 dark:bg-sage/10 border-sage/30 shadow-inner' 
          : 'bg-white dark:bg-herbal border-gray-100 dark:border-sage/15 hover:border-sage/35 hover:shadow-lg hover:shadow-sage/5'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-saffron/10 dark:bg-saffron/15 text-saffron shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-white/50 font-bold uppercase tracking-widest">{time}</span>
            <h4 className="font-playfair text-xl font-bold text-earth dark:text-white mt-0.5">{getTranslatedMealName(meal)}</h4>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showCheckbox && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleEaten}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                isEaten 
                  ? 'bg-sage text-white border-sage shadow-md shadow-sage/10' 
                  : 'bg-white dark:bg-herbal-dark text-sage dark:text-sage-light border-sage/40 dark:border-sage/30 hover:bg-sage/5 dark:hover:bg-sage/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEaten ? t('mealCard.eaten') : t('mealCard.markEaten')}</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-white/80 leading-relaxed font-medium">{description}</p>
      </div>

      {/* Expand/Collapse Button */}
      {((foods && foods.length > 0) || ayurvedaNote || nutrition) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-sage dark:text-sage-light font-extrabold flex items-center hover:underline focus:outline-none cursor-pointer"
        >
          {expanded ? t('mealCard.hideDetails') : t('mealCard.showDetails')}
        </button>
      )}

      {/* Expandable Section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100/70 dark:border-sage/15 space-y-4">
              
              {/* Ingredients Pills */}
              {foods && foods.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-earth/50 dark:text-white/45 uppercase tracking-widest">{t('mealCard.ingredients')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {foods.map(f => (
                      <span key={f} className="bg-sage/10 dark:bg-sage/20 border border-sage/20 dark:border-sage/35 text-sage-dark dark:text-sage-light text-xs px-2.5 py-1 rounded-xl font-semibold">
                        {translateFoodHelper(f, i18n)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition Summary Bar */}
              {nutrition && (nutrition.calories > 0 || nutrition.protein > 0) && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-earth/50 dark:text-white/45 uppercase tracking-widest">{t('mealCard.nutritionEstimation')}</span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-gray-50 border border-gray-100 dark:bg-herbal-dark/50 dark:border-sage/10 rounded-xl p-2">
                      <span className="block text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase">{t('mealCard.calories')}</span>
                      <strong className="text-earth dark:text-white text-sm font-bold">{nutrition.calories} kcal</strong>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 dark:bg-herbal-dark/50 dark:border-sage/10 rounded-xl p-2">
                      <span className="block text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase">{t('mealCard.protein')}</span>
                      <strong className="text-earth dark:text-white text-sm font-bold">{nutrition.protein}g</strong>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 dark:bg-herbal-dark/50 dark:border-sage/10 rounded-xl p-2">
                      <span className="block text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase">{t('mealCard.carbs')}</span>
                      <strong className="text-earth dark:text-white text-sm font-bold">{nutrition.carbs}g</strong>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 dark:bg-herbal-dark/50 dark:border-sage/10 rounded-xl p-2">
                      <span className="block text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase">{t('mealCard.fats')}</span>
                      <strong className="text-earth dark:text-white text-sm font-bold">{nutrition.fat}g</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Ayurvedic Note */}
              {ayurvedaNote && (
                <div className="bg-cream-light/60 border border-cream-dark/35 dark:bg-herbal-dark/30 dark:border-sage/20 rounded-2xl p-3.5 text-xs text-earth/80 dark:text-white/90 font-medium">
                  <span className="font-bold text-saffron dark:text-gold inline-flex items-center gap-1 mb-1 font-playfair text-sm text-glow-gold">
                    <Sparkles className="w-3.5 h-3.5" /> {t('mealCard.ayurvedicInsight')}
                  </span>
                  <p className="italic leading-relaxed">{ayurvedaNote}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 4. PatientCard
export const PatientCard = ({ patient, onClick }) => {
  const { t } = useTranslation();
  if (!patient) return null;
  const { name, dominantDosha, email, phone, age, gender } = patient;

  return (
    <motion.div 
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white dark:bg-herbal rounded-3xl shadow-sm border border-gray-100/80 dark:border-sage/15 p-5 hover:shadow-xl hover:shadow-sage/5 hover:border-sage/20 cursor-pointer transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage to-sage-dark text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sage/10">
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="font-playfair text-lg font-black text-earth dark:text-white truncate">{name}</h4>
            <p className="text-xs text-gray-400 dark:text-white/50 font-medium truncate">{email}</p>
          </div>
        </div>
        <DoshaBadge dosha={dominantDosha} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-500 dark:text-white/60 pt-3.5 border-t border-gray-50 dark:border-sage/10">
        <div>
          <span className="block text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider text-[9px]">{t('ui.ageGender')}</span>
          <span className="font-semibold text-earth dark:text-white/90 capitalize">{age || 'N/A'} {t('dietitian.patients.ageYrs')}, {gender || 'N/A'}</span>
        </div>
        <div>
          <span className="block text-gray-400 dark:text-white/40 font-bold uppercase tracking-wider text-[9px]">{t('ui.contact')}</span>
          <span className="font-semibold text-earth dark:text-white/90 truncate block">{phone || 'N/A'}</span>
        </div>
        <div className="text-right flex items-end justify-end">
          <span className="text-sage dark:text-sage-light font-extrabold inline-flex items-center gap-0.5 hover:gap-1 transition-all">
            {t('ui.open')} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// 5. MessageBubble
export const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const { role, content, timestamp } = message;
  const isBot = role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-sm relative group transition-all duration-300 ${
        isBot 
          ? 'bg-gradient-to-br from-herbal/95 to-herbal dark:from-herbal dark:to-herbal-dark text-white rounded-tl-none border border-sage/20 dark:border-sage/35' 
          : 'bg-saffron/10 dark:bg-sage/10 border border-saffron/20 dark:border-sage/25 text-earth dark:text-white/90 rounded-tr-none'
      }`}>
        
        {isBot && (
          <div className="text-[10px] font-bold text-gold flex items-center gap-1.5 uppercase tracking-widest mb-1.5 text-glow-gold">
            <span>🌿</span> {t('ayurbot')}
          </div>
        )}
        
        {/* Render paragraphs and list items cleanly */}
        <div className="text-sm leading-relaxed space-y-1.5 whitespace-pre-line font-medium">
          {content}
        </div>
        
        <div className={`text-[9px] mt-2 text-right font-bold uppercase tracking-wider ${isBot ? 'text-sage-light/60' : 'text-gray-400/80 dark:text-white/50'}`}>
          {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>

        {/* Action button on hover */}
        <button 
          onClick={handleCopy}
          className="absolute opacity-0 group-hover:opacity-100 transition-opacity -bottom-8 right-1 bg-white dark:bg-herbal border border-gray-150 dark:border-sage/20 text-gray-500 dark:text-white/80 hover:text-earth dark:hover:text-white px-2.5 py-1 rounded-xl text-[10px] z-10 font-bold flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{t('ui.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>{t('ui.copy')}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// 6. StatCard
export const StatCard = ({ title, value, icon: Icon, trend, trendType }) => {
  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-herbal rounded-3xl shadow-sm border border-gray-100 dark:border-sage/15 p-6 flex items-center justify-between hover:shadow-xl hover:shadow-sage/5 transition-all duration-300"
    >
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">{title}</span>
        <h3 className="font-playfair text-4xl font-black text-earth dark:text-white tracking-tight">{value}</h3>
        {trend && (
          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg border ${
            trendType === 'up' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
          }`}>
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> {trend}
          </span>
        )}
      </div>
      <div className="p-4 bg-gradient-to-br from-sage/10 to-sage/5 dark:from-sage/20 dark:to-sage/10 text-sage dark:text-sage-light rounded-2xl shadow-inner border border-sage/10 dark:border-sage/20">
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

// 7. DoshaChart
export const DoshaChart = ({ distribution }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const [renderChart, setRenderChart] = useState(false);

  useEffect(() => {
    setRenderChart(false);
    const timer = setTimeout(() => {
      setRenderChart(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [lang]);

  const labelColor = theme === 'dark' ? '#F8F9FA' : '#3D2B1F';

  const data = [
    { subject: t('quiz.vataLabel'), A: distribution?.vata || 0, fullMark: 100 },
    { subject: t('quiz.pittaLabel'), A: distribution?.pitta || 0, fullMark: 100 },
    { subject: t('quiz.kaphaLabel'), A: distribution?.kapha || 0, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      {renderChart && (
        <SafeChart>
          {(width, height) => (
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} width={width} height={height}>
              <PolarGrid stroke={theme === 'dark' ? '#52796F' : '#E9E5C9'} strokeWidth={1.5} opacity={theme === 'dark' ? 0.3 : 1} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: labelColor, fontSize: 11, fontWeight: '700' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: labelColor, fontSize: 9 }} />
              <Radar 
                name="Dosha distribution" 
                dataKey="A" 
                stroke="#D4AF37" 
                strokeWidth={2}
                fill="#52796F" 
                fillOpacity={theme === 'dark' ? 0.45 : 0.35} 
              />
            </RadarChart>
          )}
        </SafeChart>
      )}
    </div>
  );
};

// 8. LoadingSkeleton
export const LoadingSkeleton = ({ type = 'card' }) => {
  if (type === 'message') {
    return (
      <div className="flex justify-start mb-4">
        <div className="animate-shimmer w-64 h-16 rounded-3xl rounded-tl-none border border-sage/10 dark:border-sage/20 bg-gray-100 dark:bg-herbal/30"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-herbal border border-gray-100 dark:border-sage/15 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gray-200 dark:bg-herbal-dark/50 rounded-2xl animate-pulse"></div>
          <div className="space-y-1.5">
            <div className="w-24 h-4 bg-gray-200 dark:bg-herbal-dark/50 rounded-xl animate-pulse"></div>
            <div className="w-16 h-3 bg-gray-100 dark:bg-herbal-dark/30 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div className="w-12 h-6 bg-gray-200 dark:bg-herbal-dark/50 rounded-full animate-pulse"></div>
      </div>
      <div className="w-full h-12 bg-gray-150 dark:bg-herbal-dark/40 rounded-2xl animate-pulse"></div>
      <div className="w-3/4 h-3.5 bg-gray-200 dark:bg-herbal-dark/50 rounded-xl animate-pulse"></div>
    </div>
  );
};

export const SafeChart = ({ children }) => {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-w-0 min-h-0 relative">
      {dimensions.width > 0 && dimensions.height > 0 && children(dimensions.width, dimensions.height)}
    </div>
  );
};

