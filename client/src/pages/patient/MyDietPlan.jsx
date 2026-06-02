import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { MealCard } from '../../components/UIElements';
import { BookOpen, Calendar, Activity, Info, Sparkles, Flame, Wind, Droplet } from 'lucide-react';

const MyDietPlan = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  
  const [dietPlan, setDietPlan] = useState(null);
  const [complianceLog, setComplianceLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current date string 'YYYY-MM-DD'
  const getTodayDateString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();

  const loadPlan = async () => {
    try {
      setLoading(true);
      const planRes = await api.dietPlan.getPatientPlan(user._id);
      if (planRes.success) {
        setDietPlan(planRes.dietPlan);
      }

      const profileRes = await api.patient.getProfile(user._id);
      if (profileRes.success) {
        setComplianceLog(profileRes.patient.complianceLog || []);
      }
    } catch (err) {
      console.error('Error loading patient diet plan:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/diet-plan/${user._id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ayurnutricare_diet_plan_${user._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report PDF:', err.message);
      alert(t('plan.downloadError', 'Could not download the PDF report. Please try again.'));
    }
  };

  const handleToggleMealEaten = async (mealKey) => {
    const alreadyEaten = complianceLog.some(log => log.date === todayStr && log.mealKey === mealKey && log.eaten);
    
    // Optimistic UI update
    const updatedLog = [...complianceLog];
    const matchIdx = updatedLog.findIndex(log => log.date === todayStr && log.mealKey === mealKey);
    if (matchIdx > -1) {
      updatedLog[matchIdx].eaten = !alreadyEaten;
    } else {
      updatedLog.push({ date: todayStr, mealKey, eaten: !alreadyEaten });
    }
    setComplianceLog(updatedLog);

    try {
      await api.dietPlan.logCompliance({
        date: todayStr,
        mealKey,
        eaten: !alreadyEaten
      });
    } catch (err) {
      console.error('Error logging compliance:', err.message);
      loadPlan(); // rollback on failure
    }
  };

  // Calculate total macros of active plan
  const getPlanMacros = () => {
    if (!dietPlan || !dietPlan.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return dietPlan.meals.reduce((acc, meal) => {
      if (meal.nutrition) {
        acc.calories += meal.nutrition.calories || 0;
        acc.protein += meal.nutrition.protein || 0;
        acc.carbs += meal.nutrition.carbs || 0;
        acc.fat += meal.nutrition.fat || 0;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 dark:bg-herbal-dark/50 rounded-2xl"></div>
        <div className="h-48 w-full bg-white dark:bg-herbal rounded-3xl border border-gray-100 dark:border-sage/15"></div>
        <div className="h-96 w-full bg-white dark:bg-herbal rounded-3xl border border-gray-100 dark:border-sage/15"></div>
      </div>
    );
  }

  const totals = getPlanMacros();

  // Elements for Ritu
  const getSeasonElement = (s) => {
    if (!s) return null;
    const name = s.toLowerCase();
    if (name.includes('grishma')) return <Flame className="w-4 h-4 text-saffron" />;
    if (name.includes('varsha') || name.includes('shishira')) return <Droplet className="w-4 h-4 text-sky-500" />;
    return <Wind className="w-4 h-4 text-sage" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth dark:text-white transition-colors duration-300">{t('plan.title')}</h1>
          <p className="text-gray-405 dark:text-white/45 text-sm font-semibold mt-1 transition-colors duration-300">{t('plan.subtitle')}</p>
        </div>
        {dietPlan && (
          <button
            onClick={handleDownloadPDF}
            className="bg-saffron hover:bg-saffron-dark text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-md shadow-saffron/10 cursor-pointer border border-saffron/30"
          >
            <span>📄 {t('plan.downloadReportPDF')}</span>
          </button>
        )}
      </motion.div>

      {!dietPlan ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-herbal rounded-[32px] border border-gray-150 dark:border-sage/15 p-12 sm:p-16 text-center shadow-sm transition-colors duration-300"
        >
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <h3 className="font-playfair text-xl font-bold text-earth dark:text-white mb-2 transition-colors duration-300">{t('plan.noPlanTitle')}</h3>
          <p className="text-sm text-gray-500 dark:text-white/50 max-w-md mx-auto mb-6 leading-relaxed font-semibold transition-colors duration-300">
            {t('plan.noPlanDesc')}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          
          {/* Diet plan meta details card styled like Apple Health */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-herbal to-sage dark:from-herbal-dark dark:to-herbal rounded-[32px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300 border border-transparent dark:border-sage/15"
          >
            {/* Ambient gold shape */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-gold/10 blur-2xl" />
            <div className="absolute right-0 bottom-0 opacity-10 font-black font-playfair text-9xl select-none translate-y-12 translate-x-4">
              Ritu
            </div>

            <span className="text-[10px] font-bold text-sage-light dark:text-saffron-light uppercase tracking-widest bg-white/10 dark:bg-white/5 px-3 py-1 rounded-full border border-white/10 dark:border-white/5">
              {t('plan.activeSheet')}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <h3 className="text-xs text-sage-light/80 dark:text-white/60 font-bold uppercase tracking-wider">{t('plan.goalLabel')}</h3>
                <p className="font-playfair text-2xl sm:text-3xl font-black mt-1 text-glow-gold">{dietPlan.goal}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-white/10 dark:bg-black/20 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
                <div>
                  <span className="block text-[9px] text-sage-light/80 dark:text-white/50 font-bold uppercase tracking-widest">{t('plan.seasonLabel')}</span>
                  <span className="font-extrabold text-xs capitalize mt-1 flex items-center justify-center gap-1">
                    {getSeasonElement(dietPlan.season)}
                    {dietPlan.season}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-sage-light/80 dark:text-white/50 font-bold uppercase tracking-widest">{t('plan.durationLabel')}</span>
                  <span className="font-extrabold text-xs mt-1 block">{t('plan.durationVal', { duration: dietPlan.duration })}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-sage-light/80 dark:text-white/50 font-bold uppercase tracking-widest">{t('plan.targetLabel')}</span>
                  <span className="font-extrabold text-xs mt-1 block">{t('plan.targetVal', { kcal: totals.calories })}</span>
                </div>
              </div>
            </div>
            
            {/* Target Macronutrients targets indicators */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 dark:border-white/5 text-xs text-center text-sage-light">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-sage-light/75 dark:text-white/50">{t('plan.macroCalories')}</span>
                <span className="font-black text-white text-base mt-1 block">{t('plan.macroCaloriesVal', { kcal: totals.calories })}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-sage-light/75 dark:text-white/50">{t('plan.macroProtein')}</span>
                <span className="font-black text-white text-base mt-1 block">{t('plan.macroProteinVal', { g: totals.protein })}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-sage-light/75 dark:text-white/50">{t('plan.macroCarbs')}</span>
                <span className="font-black text-white text-base mt-1 block">{t('plan.macroCarbsVal', { g: totals.carbs })}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-sage-light/75 dark:text-white/50">{t('plan.macroFats')}</span>
                <span className="font-black text-white text-base mt-1 block">{t('plan.macroFatsVal', { g: totals.fat })}</span>
              </div>
            </div>
          </motion.div>

          {/* Ritu Charya Season Info Alert */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism-premium dark:glassmorphism-dark rounded-[24px] p-5 flex items-start space-x-3.5 text-earth/80 dark:text-white/80 text-sm shadow-sm transition-colors duration-300"
          >
            <div className="p-2 bg-saffron/15 dark:bg-saffron/20 rounded-xl text-saffron-dark dark:text-saffron flex-shrink-0 mt-0.5 border border-saffron/25 dark:border-saffron/40">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-playfair text-lg font-bold text-earth dark:text-white flex items-center gap-1.5 transition-colors duration-300">
                {t('plan.alignmentTitle', { season: dietPlan.season })}
              </h4>
              <p className="text-xs mt-1.5 leading-relaxed font-semibold text-gray-500 dark:text-white/50 transition-colors duration-300">
                {t('plan.alignmentDesc')}
              </p>
            </div>
          </motion.div>

          {/* Meals list */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="font-playfair text-2xl font-bold text-earth dark:text-white px-1 flex items-center gap-2 transition-colors duration-300">
              {t('plan.dailySchedule')}
            </h2>
            
            <div className="space-y-4">
              {dietPlan.meals.map((meal) => {
                const isEaten = complianceLog.some(log => log.date === todayStr && log.mealKey === meal.key && log.eaten);
                return (
                  <MealCard
                    key={meal.key}
                    meal={meal}
                    isEaten={isEaten}
                    onToggleEaten={() => handleToggleMealEaten(meal.key)}
                    showCheckbox={true}
                  />
                );
              })}
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
};

export default MyDietPlan;
