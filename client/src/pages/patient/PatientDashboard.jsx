import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { DoshaBadge, MealCard, SafeChart } from '../../components/UIElements';
import { 
  MessageSquare, ShieldAlert, Sparkles, BookOpen, Droplet, 
  Flame, Sun, TrendingUp, CheckCircle, Zap, AlertCircle, 
  Calendar, ArrowRight, User 
} from 'lucide-react';
import { getLocalizedField } from '../../utils/getLocalizedText';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const navigate = useNavigate();

  const [dietPlan, setDietPlan] = useState(null);
  const [hydrationCount, setHydrationCount] = useState(0);
  const [complianceLog, setComplianceLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderCharts, setRenderCharts] = useState(false);

  // New features data states
  const [rituData, setRituData] = useState(null);
  const [deficiencies, setDeficiencies] = useState([]);
  const [progressData, setProgressData] = useState({
    weightHistory: [],
    complianceData: [],
    streak: 0,
    milestone: '',
    doshaBalance: { initial: 60, current: 60 }
  });

  const getTodayDateString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch core profile and plan
      const profileRes = await api.patient.getProfile(user._id);
      if (profileRes.success) {
        const todayHydration = profileRes.patient.hydrationLog.find(log => log.date === todayStr);
        setHydrationCount(todayHydration ? todayHydration.count : 0);
        setComplianceLog(profileRes.patient.complianceLog || []);
      }

      const planRes = await api.dietPlan.getPatientPlan(user._id);
      if (planRes.success) {
        setDietPlan(planRes.dietPlan);
      }

      // Fetch Ritu Charya Seasonal Advisor
      try {
        const rituRes = await api.ritu.getCurrent();
        if (rituRes.success) {
          setRituData(rituRes.ritu);
        }
      } catch (err) {
        console.error('Ritu load error:', err.message);
      }

      // Fetch Nutritional Deficiency Alerts
      try {
        const defRes = await api.analytics.getDeficiencies(user._id);
        if (defRes.success) {
          setDeficiencies(defRes.deficiencies.filter(d => d.isDeficient));
        }
      } catch (err) {
        console.error('Deficiency load error:', err.message);
      }

      // Fetch Progress Tracking stats
      try {
        const progRes = await api.patient.getProgress(user._id);
        if (progRes.success) {
          setProgressData({
            weightHistory: progRes.weightHistory || [],
            complianceData: progRes.complianceData || [],
            streak: progRes.streak || 0,
            milestone: progRes.milestone || '',
            doshaBalance: progRes.doshaBalance || { initial: 60, current: 60 }
          });
        }
      } catch (err) {
        console.error('Progress load error:', err.message);
      }

    } catch (err) {
      console.error('Error loading patient dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setRenderCharts(false);
    if (!loading) {
      const timer = setTimeout(() => {
        setRenderCharts(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, lang]);

  const handleUpdateHydration = async (newCount) => {
    if (newCount < 0 || newCount > 12) return;
    setHydrationCount(newCount);
    try {
      await api.patient.updateHydration(todayStr, newCount);
    } catch (err) {
      console.error('Error updating hydration log:', err.message);
    }
  };

  const handleToggleMealEaten = async (mealKey) => {
    const alreadyEaten = complianceLog.some(log => log.date === todayStr && log.mealKey === mealKey && log.eaten);
    
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
      // reload progress to update charts & streak count in real-time
      const progRes = await api.patient.getProgress(user._id);
      if (progRes.success) {
        setProgressData(prev => ({
          ...prev,
          complianceData: progRes.complianceData || [],
          streak: progRes.streak || 0,
          milestone: progRes.milestone || '',
          doshaBalance: progRes.doshaBalance || { initial: 60, current: 60 }
        }));
      }
    } catch (err) {
      console.error('Error logging compliance:', err.message);
      loadData();
    }
  };

  const getTodayMeals = () => {
    if (!dietPlan || !dietPlan.meals) return [];
    return dietPlan.meals.filter(m => 
      m.key === 'breakfast' || m.key === 'lunch' || m.key === 'dinner'
    );
  };

  const getLocalizedMilestone = (m) => {
    if (!m) return '';
    if (m === "Start tracking to hit your milestones!") {
      return t('dashboard.milestoneStart');
    }
    if (m.includes("more days to complete your")) {
      const match = m.match(/(\d+)\s+more days to complete your\s+(\d+)-week plan!/);
      if (match) {
        return t('dashboard.milestoneProgress', { days: match[1], weeks: match[2] });
      }
    }
    if (m.includes("Congratulations! You have completed your")) {
      const match = m.match(/Congratulations! You have completed your\s+(\d+)-week plan!/);
      if (match) {
        return t('dashboard.milestoneComplete', { weeks: match[1] });
      }
    }
    return m;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-250 dark:bg-herbal-dark/50 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-herbal rounded-3xl border border-gray-100 dark:border-sage/15"></div>
          <div className="lg:col-span-1 space-y-6">
            <div className="h-48 bg-white dark:bg-herbal rounded-3xl border border-gray-100 dark:border-sage/15"></div>
            <div className="h-48 bg-white dark:bg-herbal rounded-3xl border border-gray-100 dark:border-sage/15"></div>
          </div>
        </div>
      </div>
    );
  }

  const todayMeals = getTodayMeals();
  const hydrationPercent = Math.min(Math.round((hydrationCount / 8) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      
      {/* Welcome header with animated gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-mesh border border-sage-light/15 dark:border-sage/20 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden"
      >
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-bold text-sage dark:text-gold uppercase tracking-widest bg-sage/10 dark:bg-gold/15 px-3 py-1 rounded-full border border-sage/20 dark:border-gold/30">
            {t('common.namaste')}
          </span>
          <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth dark:text-white mt-1.5 font-heading">
            {t('dashboard.welcomeBack', { name: user.name })}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/60 font-semibold">{t('dashboard.welcomeSubtitle')}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 relative z-10 flex-shrink-0">
          <span className="text-[10px] text-gray-400 dark:text-white/44 font-bold uppercase tracking-widest">{t('dashboard.prakritiProfile')}</span>
          {user.dominantDosha && user.dominantDosha !== 'Undetermined' ? (
            <DoshaBadge dosha={user.dominantDosha} />
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patient/quiz')}
              className="bg-saffron/10 dark:bg-saffron/20 border border-saffron/30 dark:border-saffron/40 text-saffron-dark dark:text-saffron hover:bg-saffron/20 dark:hover:bg-saffron/25 px-4 py-2 rounded-2xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-saffron/5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold animate-bounce" />
              <span>{t('dashboard.assessPrakritiBtn')}</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* RITU CHARYA SEASONAL ADVISOR BANNER */}
      {rituData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#FEFAE0]/70 to-[#FEFAE0]/40 dark:from-herbal dark:to-herbal/70 border border-sage-light/20 dark:border-sage/15 rounded-[32px] p-6 sm:p-7 shadow-sm transition-all"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-6 h-6 text-saffron animate-spin-slow" />
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-earth dark:text-white">
              {t('dashboard.rituCharyaTitle')}: {rituData['name_' + lang] || rituData.name_en}
            </h2>
            <span className="text-[10px] ml-auto font-black bg-saffron/10 text-saffron-dark dark:text-saffron px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {t('dashboard.dominantDosha')}: {rituData.dominant_dosha}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold">
            {/* Foods to favor */}
            <div className="bg-white/80 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-sage/10 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                👍 {t('dashboard.foodsToFavor')}
              </span>
              <p className="text-gray-500 dark:text-white/60">
                {(rituData['favor_' + lang] || rituData.favor_en).join(', ')}
              </p>
            </div>

            {/* Foods to avoid */}
            <div className="bg-white/80 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-sage/10 space-y-2">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block">
                👎 {t('dashboard.foodsToAvoid')}
              </span>
              <p className="text-gray-500 dark:text-white/60">
                {(rituData['avoid_' + lang] || rituData.avoid_en).join(', ')}
              </p>
            </div>

            {/* Dinacharya recommendation */}
            <div className="bg-white/80 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-sage/10 space-y-2">
              <span className="text-[10px] font-bold text-saffron-dark dark:text-saffron uppercase tracking-widest block">
                🌅 {t('dashboard.dailyRoutine')}
              </span>
              <ul className="list-disc list-inside text-gray-500 dark:text-white/60 space-y-1">
                {(rituData['dinacharya_' + lang] || rituData.dinacharya_en).slice(0, 3).map((act, i) => (
                  <li key={i} className="truncate">{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Meals & Recharts Graphs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Meals */}
          <div className="bg-white dark:bg-herbal rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-sage/15 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-earth dark:text-white font-heading">
                  {t('dashboard.mealsTitle')}
                </h2>
                <p className="text-xs text-gray-400 dark:text-white/45 font-semibold mt-0.5 uppercase tracking-wider">{t('dashboard.mealsSubtitle')}</p>
              </div>
              {dietPlan && (
                <button
                  onClick={() => navigate('/patient/plan')}
                  className="text-xs font-extrabold text-sage dark:text-sage-light hover:underline flex items-center cursor-pointer"
                >
                  {t('dashboard.viewFullSchedule')}
                </button>
              )}
            </div>

            {!dietPlan ? (
              <div className="text-center py-16 bg-gray-50/50 dark:bg-herbal-dark/30 rounded-3xl border border-dashed border-gray-200 dark:border-sage/20">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500 dark:text-white/50">{t('dashboard.noPlan')}</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1.5 max-w-sm mx-auto leading-relaxed">{t('dashboard.noPlanDesc')}</p>
              </div>
            ) : (
              <motion.div layout className="space-y-4">
                {todayMeals.map((meal) => {
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
              </motion.div>
            )}
          </div>

          {/* PROGRESS TRACKING VISUALS (Recharts) */}
          <div className="bg-white dark:bg-herbal rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-sage/15 shadow-sm space-y-6 transition-colors duration-300">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-earth dark:text-white font-heading">
                {t('dashboard.progressTitle')}
              </h2>
              <p className="text-xs text-gray-400 dark:text-white/45 font-semibold mt-0.5 uppercase tracking-wider">
                {t('dashboard.progressSubtitle')}
              </p>
            </div>

            {/* Streak & Milestone boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Streak Card */}
              <div className="bg-saffron/10 border border-saffron/20 rounded-2xl p-4.5 flex items-center gap-4">
                <div className="p-3 bg-saffron text-white rounded-2xl shadow-md shadow-saffron/20">
                  <Zap className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">{t('dashboard.currentStreak')}</span>
                  <span className="text-2xl font-black text-earth dark:text-white">{progressData.streak} {t('dashboard.days')}</span>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t('dashboard.keepCheckingMeals')}</p>
                </div>
              </div>

              {/* Milestone Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4.5 flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">{t('dashboard.nextMilestone')}</span>
                  <span className="text-sm font-black text-earth dark:text-white block mt-1 leading-snug">{getLocalizedMilestone(progressData.milestone) || t('dashboard.milestonePlaceholder')}</span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Trend Line Chart */}
              <div className="space-y-2 min-w-0">
                <span className="block text-[10px] font-extrabold text-earth/50 dark:text-white/40 uppercase tracking-widest">{t('dashboard.weightTrendTitle')}</span>
                <div className="h-56 bg-gray-50/50 dark:bg-herbal-dark/25 border border-gray-150 dark:border-sage/10 rounded-2xl p-3 relative min-w-0 w-full overflow-hidden">
                  {progressData.weightHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 font-bold">{t('dashboard.noWeightData')}</div>
                  ) : renderCharts ? (
                    <SafeChart>
                      {(width, height) => (
                        <LineChart data={progressData.weightHistory} width={width} height={height}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="currentColor" opacity={0.5} />
                          <YAxis tick={{ fontSize: 9 }} stroke="currentColor" opacity={0.5} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: '12px', fontSize: 11 }} />
                          <Line type="monotone" dataKey="weight" stroke="#E65F2B" strokeWidth={3} dot={{ fill: '#E65F2B', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      )}
                    </SafeChart>
                  ) : null}
                </div>
              </div>

              {/* Compliance Bar Chart */}
              <div className="space-y-2 min-w-0">
                <span className="block text-[10px] font-extrabold text-earth/50 dark:text-white/40 uppercase tracking-widest">{t('dashboard.weeklyComplianceTitle')}</span>
                <div className="h-56 bg-gray-50/50 dark:bg-herbal-dark/25 border border-gray-150 dark:border-sage/10 rounded-2xl p-3 relative min-w-0 w-full overflow-hidden">
                  {progressData.complianceData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 font-bold">{t('dashboard.noComplianceData')}</div>
                  ) : renderCharts ? (
                    <SafeChart>
                      {(width, height) => (
                        <BarChart data={progressData.complianceData} width={width} height={height}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tickFormatter={(v) => v.replace('Wk', t('dashboard.weekAbbr', 'Wk'))} tick={{ fontSize: 9 }} stroke="currentColor" opacity={0.5} />
                          <YAxis tick={{ fontSize: 9 }} stroke="currentColor" opacity={0.5} domain={[0, 100]} />
                          <Tooltip contentStyle={{ background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: '12px', fontSize: 11 }} />
                          <Bar dataKey="rate" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      )}
                    </SafeChart>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Dosha balance improvement bar */}
            <div className="space-y-2 border-t border-gray-100 dark:border-sage/10 pt-4">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-white/60">
                <span>{t('dashboard.doshaIndexTitle')}</span>
                <span>{progressData.doshaBalance.current}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden relative">
                {/* Initial balance line */}
                <div 
                  className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-saffron z-10" 
                  title="Initial Prakriti Quiz State (60%)"
                />
                <motion.div 
                  initial={{ width: '60%' }}
                  animate={{ width: `${progressData.doshaBalance.current}%` }}
                  className="h-full bg-gradient-to-r from-sage to-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[8px] text-gray-400 font-bold">
                <span>{t('dashboard.quizBaseline')}</span>
                <span>{t('dashboard.perfectEquilibrium')}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Deficiency alerts, Hydration & Quick Links */}
        <div className="space-y-6">
          
          {/* NUTRITIONAL DEFICIENCY ALERTS */}
          {deficiencies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-250 rounded-3xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{t('dashboard.deficienciesTitle')}</span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {deficiencies.map((def) => (
                  <div 
                    key={def.nutrient}
                    className="p-3 bg-white/60 dark:bg-herbal-dark/40 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-[11px] leading-relaxed font-semibold space-y-2"
                  >
                    <div className="flex justify-between text-xs text-earth dark:text-white font-extrabold">
                      <span>⚠️ {def[`label_${lang}`] || def.label_en}</span>
                      <span className="text-rose-600">{def.percent}% {t('dashboard.ofRDA')}</span>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 dark:text-white/40">
                      {t('dashboard.deficiencyDesc')}
                    </p>

                    <div className="space-y-1.5 border-t border-gray-100 dark:border-sage/10 pt-1.5 mt-1 text-[9.5px]">
                      {def.suggestions.slice(0, 2).map((sug, i) => (
                        <div key={i}>
                          <span className="font-extrabold text-saffron-dark dark:text-saffron">
                            • {sug[`name_${lang}`] || sug.name_en}:
                          </span>
                          <span className="text-gray-450 dark:text-white/50 ml-1">
                            {sug[`properties_${lang}`] || sug.properties_en}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Hydration Tracker Card */}
          <div className="bg-white dark:bg-herbal rounded-3xl p-6 border border-gray-100 dark:border-sage/15 shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <h3 className="font-playfair text-xl font-bold text-earth dark:text-white mb-1 flex items-center font-heading">
                <Droplet className="w-5 h-5 text-sky-500 mr-1.5" /> {t('dashboard.hydrationTitle')}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-white/45 font-semibold uppercase tracking-widest mb-4">{t('dashboard.hydrationSubtitle')}</p>
            </div>

            {/* Cup indicators grid */}
            <div className="grid grid-cols-4 gap-3 my-2">
              {Array.from({ length: 8 }).map((_, idx) => {
                const filled = idx < hydrationCount;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpdateHydration(filled ? idx : idx + 1)}
                    className={`h-12 border rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                      filled 
                        ? 'bg-gradient-to-t from-sky-500 to-sky-400 border-sky-600 dark:border-sky-550 text-white shadow-md shadow-sky-500/10' 
                        : 'bg-white dark:bg-herbal-dark border-gray-200 dark:border-sage/25 text-gray-300 dark:text-white/40 hover:bg-sky-500/5 dark:hover:bg-sky-500/10'
                    }`}
                  >
                    {filled && (
                      <div className="absolute inset-x-0 bottom-0 bg-white/20 h-1/2 rounded-b-xl" />
                    )}
                    <Droplet className={`w-5 h-5 relative z-10 ${filled ? 'fill-current text-white' : 'text-gray-300 dark:text-white/30'}`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Hydration progress line */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-white/50">
                <span>{t('dashboard.hydrationProgress')}</span>
                <span>{hydrationPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${hydrationPercent}%` }}
                  className="h-full bg-sky-500 rounded-full"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-sage/10 text-sm">
              <span className="text-gray-550 dark:text-white/50 font-bold text-xs">{t('dashboard.hydrationTotal', { count: hydrationCount })}</span>
              <div className="flex space-x-1.5">
                <button 
                  onClick={() => handleUpdateHydration(hydrationCount - 1)}
                  className="w-8 h-8 rounded-xl border border-gray-200 dark:border-sage/25 flex items-center justify-center font-bold text-gray-600 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-herbal-dark/40 cursor-pointer text-xs"
                >
                  -
                </button>
                <button 
                  onClick={() => handleUpdateHydration(hydrationCount + 1)}
                  className="w-8 h-8 rounded-xl border border-gray-200 dark:border-sage/25 flex items-center justify-center font-bold text-gray-600 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-herbal-dark/40 cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick links portal */}
          <div className="bg-white dark:bg-herbal rounded-3xl p-6 border border-gray-100 dark:border-sage/15 shadow-sm space-y-4 transition-colors duration-300">
            <div>
              <h3 className="font-playfair text-xl font-bold text-earth dark:text-white font-heading">{t('dashboard.quickChannels')}</h3>
              <p className="text-[10px] text-gray-400 dark:text-white/45 font-semibold uppercase tracking-widest mt-0.5">{t('dashboard.quickChannelsSubtitle')}</p>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patient/chat')}
                className="w-full py-4 px-4 bg-herbal dark:bg-herbal-dark text-white rounded-2xl text-sm font-bold shadow-md shadow-herbal/10 flex items-center justify-between hover:bg-herbal-light dark:hover:bg-herbal transition-all cursor-pointer border border-herbal/35 dark:border-sage/20"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-5 h-5 text-gold text-glow-gold" />
                  <div className="text-left">
                    <span className="block font-bold">{t('dashboard.quickAyurbot')}</span>
                    <span className="block text-[10px] text-sage-light/80 dark:text-white/50 font-medium font-sans">{t('dashboard.quickContent')}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gold" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patient/checker')}
                className="w-full py-4 px-4 bg-saffron/10 dark:bg-saffron/15 border border-saffron/20 dark:border-saffron/30 hover:bg-saffron/20 dark:hover:bg-saffron/25 text-saffron-dark dark:text-saffron rounded-2xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-saffron-dark dark:text-saffron" />
                  <div className="text-left">
                    <span className="block font-bold text-earth dark:text-white">{t('dashboard.quickChecker')}</span>
                    <span className="block text-[10px] text-gray-550 dark:text-white/60 font-medium font-sans">{t('dashboard.quickCheckerDesc')}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
