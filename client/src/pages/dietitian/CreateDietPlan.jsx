import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ArrowLeft, Plus, Sparkles, Check, Info } from 'lucide-react';
import { translateFoodHelper } from '../../components/UIElements';

const CreateDietPlan = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form parameters
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientDosha, setSelectedPatientDosha] = useState('');
  const [goal, setGoal] = useState('General Wellness');
  const [duration, setDuration] = useState(4);
  const [season, setSeason] = useState('Vasanta');
  
  // Meals state (7 structured slots)
  const [meals, setMeals] = useState([
    { key: 'morningRoutine', name: 'Morning Routine', time: '06:30 AM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'breakfast', name: 'Breakfast', time: '08:30 AM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'midMorningSnack', name: 'Mid-Morning Snack', time: '11:00 AM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'lunch', name: 'Lunch', time: '01:30 PM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'eveningSnack', name: 'Evening Snack', time: '05:00 PM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'dinner', name: 'Dinner', time: '08:00 PM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
    { key: 'bedtime', name: 'Bedtime Routine', time: '09:30 PM', foods: [], description: '', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }, ayurvedaNote: '' },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Validation report states
  const [validationReport, setValidationReport] = useState(null);
  const [validating, setValidating] = useState(false);

  // Load baseline parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientRes = await api.patient.getAll();
        if (patientRes.success) {
          setPatients(patientRes.patients);
        }

        const foodRes = await api.foods.getAll();
        if (foodRes.success) {
          setFoods(foodRes.foods);
        }

        // Apply router states if present
        if (location.state?.patientId) {
          setSelectedPatientId(location.state.patientId);
          setSelectedPatientDosha(location.state.dominantDosha || 'Vata');
        }
      } catch (err) {
        console.error('Error fetching baseline data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // Sync selected patient's Dosha state when selectedId changes
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const match = patients.find(p => p._id === selectedPatientId);
      if (match) {
        setSelectedPatientDosha(match.dominantDosha);
      }
    }
  }, [selectedPatientId, patients]);

  // Calculate meal nutrition parameters when description or foods changes
  const updateMealField = (index, field, value) => {
    setMeals(prevMeals => {
      const copy = [...prevMeals];
      copy[index] = { ...copy[index], [field]: value };
      
      // If updating foods array, auto-calculate total calories, macros
      if (field === 'foods') {
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        value.forEach((foodName) => {
          const match = foods.find(f => f.name.toLowerCase() === foodName.toLowerCase());
          if (match) {
            calories += match.nutrition.calories || 0;
            protein += match.nutrition.protein || 0;
            carbs += match.nutrition.carbs || 0;
            fat += match.nutrition.fat || 0;
          }
        });
        copy[index].nutrition = { calories, protein, carbs, fat };
      }
      
      return copy;
    });
  };

  // Auto template generator based on Dosha and Season
  const handleAutoGenerate = () => {
    if (!selectedPatientDosha || selectedPatientDosha === 'Undetermined') {
      alert(t('dietitian.createPlan.alertPrakritiQuiz'));
      return;
    }

    const dosha = selectedPatientDosha.toLowerCase();
    let templateDoshaKey = 'vata';
    if (dosha.includes('vata')) templateDoshaKey = 'vata';
    else if (dosha.includes('pitta')) templateDoshaKey = 'pitta';
    else if (dosha.includes('kapha')) templateDoshaKey = 'kapha';

    // Apply templates to state
    setMeals(prevMeals => {
      return prevMeals.map((meal) => {
        // Fetch from dynamic translations
        const desc = t(`templates.${templateDoshaKey}.${meal.key}.desc`);
        const note = t(`templates.${templateDoshaKey}.${meal.key}.note`);
        
        let foodsList = [];
        if (templateDoshaKey === 'vata') {
          if (meal.key === 'morningRoutine') foodsList = ['Honey'];
          else if (meal.key === 'breakfast') foodsList = ['Wheat', 'Ghee'];
          else if (meal.key === 'midMorningSnack') foodsList = ['Pomegranate'];
          else if (meal.key === 'lunch') foodsList = ['Rice', 'Moong Dal', 'Ghee', 'Ginger'];
          else if (meal.key === 'eveningSnack') foodsList = ['Almonds'];
          else if (meal.key === 'dinner') foodsList = ['Bottle Gourd (Lauki)', 'Rice', 'Cumin'];
          else if (meal.key === 'bedtime') foodsList = ['Milk', 'Cardamom'];
        } else if (templateDoshaKey === 'pitta') {
          if (meal.key === 'morningRoutine') foodsList = ['Coconut'];
          else if (meal.key === 'breakfast') foodsList = ['Rice', 'Coriander'];
          else if (meal.key === 'midMorningSnack') foodsList = ['Amla'];
          else if (meal.key === 'lunch') foodsList = ['Rice', 'Moong Dal', 'Spinach', 'Ghee'];
          else if (meal.key === 'eveningSnack') foodsList = ['Pomegranate'];
          else if (meal.key === 'dinner') foodsList = ['Bottle Gourd (Lauki)', 'Wheat'];
          else if (meal.key === 'bedtime') foodsList = ['Milk', 'Cardamom'];
        } else { // kapha
          if (meal.key === 'morningRoutine') foodsList = ['Honey', 'Ginger'];
          else if (meal.key === 'breakfast') foodsList = ['Methi'];
          else if (meal.key === 'midMorningSnack') foodsList = ['Amla'];
          else if (meal.key === 'lunch') foodsList = ['Chana Dal', 'Bitter Gourd (Karela)', 'Turmeric'];
          else if (meal.key === 'eveningSnack') foodsList = ['Honey'];
          else if (meal.key === 'dinner') foodsList = ['Moong Dal', 'Spinach', 'Black Pepper'];
          else if (meal.key === 'bedtime') foodsList = ['Ginger'];
        }

        // Find matching foods to recalculate nutrition
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        foodsList.forEach((foodName) => {
          const match = foods.find(f => f.name.toLowerCase() === foodName.toLowerCase());
          if (match) {
            calories += match.nutrition.calories || 0;
            protein += match.nutrition.protein || 0;
            carbs += match.nutrition.carbs || 0;
            fat += match.nutrition.fat || 0;
          }
        });
        return {
          ...meal,
          foods: foodsList,
          description: desc,
          ayurvedaNote: note,
          nutrition: { calories, protein, carbs, fat }
        };
      });
    });
  };

  const handleValidatePlan = async () => {
    if (!selectedPatientId) {
      alert(t('dietitian.createPlan.alertSelectPatient'));
      return;
    }
    const hasContent = meals.some(m => m.description.trim() !== '');
    if (!hasContent) {
      alert(t('dietitian.createPlan.alertFillMealsValidate'));
      return;
    }

    setValidating(true);
    setErrorMsg('');
    try {
      const res = await api.dietPlan.validate({
        patientId: selectedPatientId,
        goal,
        season,
        meals
      });
      if (res.success) {
        setValidationReport(res);
      }
    } catch (err) {
      console.error('Error validating plan:', err.message);
      setErrorMsg(err.message || 'Validation failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPatientId) {
      setErrorMsg(t('dietitian.createPlan.alertSelectPatient'));
      return;
    }

    // Validate that at least some meals are filled
    const hasContent = meals.some(m => m.description.trim() !== '');
    if (!hasContent) {
      setErrorMsg(t('dietitian.createPlan.alertFillMealsSave'));
      return;
    }

    setSaving(true);
    try {
      const res = await api.dietPlan.create({
        patientId: selectedPatientId,
        goal,
        duration,
        season,
        meals
      });

      if (res.success) {
        navigate('/dietitian/patients', { state: { selectedId: selectedPatientId } });
      }
    } catch (err) {
      console.error('Error saving plan:', err.message);
      setErrorMsg(err.message || t('dietitian.createPlan.failedSave'));
    } finally {
      setSaving(false);
    }
  };

  const translateFood = (f) => {
    return translateFoodHelper(f, i18n);
  };

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

  const getTimingIssueText = (issue) => {
    if (i18n.language === 'mr') return issue.issue_mr || issue.issue_en;
    if (i18n.language === 'hi') return issue.issue_hi || issue.issue_en;
    return issue.issue_en;
  };

  const getSeasonalIssueText = (issue) => {
    if (i18n.language === 'mr') return issue.issue_mr || issue.issue_en;
    if (i18n.language === 'hi') return issue.issue_hi || issue.issue_en;
    return issue.issue_en;
  };

  const getCompatibilityIssueText = (issue) => {
    if (i18n.language === 'mr') return issue.reason_mr || issue.reason_en;
    if (i18n.language === 'hi') return issue.reason_hi || issue.reason_en;
    return issue.reason_en;
  };

  const getDoshaIssueText = (issue) => {
    if (i18n.language === 'mr') return issue.issue_mr || issue.issue_en;
    if (i18n.language === 'hi') return issue.issue_hi || issue.issue_en;
    return issue.issue_en;
  };

  const translateDoshaHelper = (d) => {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-2xl"></div>
        <div className="h-16 w-full bg-white rounded-3xl border border-gray-100"></div>
        <div className="h-96 w-full bg-white rounded-3xl border border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      {/* Back link */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-earth mb-5 uppercase tracking-widest cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('dietitian.createPlan.back')}</span>
      </button>

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-5 mb-6 gap-4">
        <div>
          <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth">{t('dietitian.createPlan.title')}</h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">{t('dietitian.createPlan.subtitle')}</p>
        </div>
        {selectedPatientId && selectedPatientDosha !== 'Undetermined' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleAutoGenerate}
            className="bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-sage text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-sage/15 flex items-center space-x-2 transition-all cursor-pointer border border-sage/40"
          >
            <Sparkles className="w-4.5 h-4.5 text-gold animate-bounce" />
            <span>{t('dietitian.createPlan.autoGenerateBtn')}</span>
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSavePlan} className="space-y-8">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl text-rose-800 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Global Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.patientSelection')}</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-2 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-white"
              required
            >
              <option value="">{t('dietitian.createPlan.choosePatient')}</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({translateDoshaHelper(p.dominantDosha)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.healthGoal')}</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mt-2 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-white"
            >
              <option value="General Wellness">{t('dietitian.goals.general')}</option>
              <option value="Weight Loss">{t('dietitian.goals.weight')}</option>
              <option value="Immunity Boost">{t('dietitian.goals.immunity')}</option>
              <option value="Digestive Health">{t('dietitian.goals.digestive')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.rituSeason')}</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-2 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-white"
            >
              <option value="Vasanta">{t('vasanta_ritu')}</option>
              <option value="Grishma">{t('grishma_ritu')}</option>
              <option value="Varsha">{t('varsha_ritu')}</option>
              <option value="Sharad">{t('sharad_ritu')}</option>
              <option value="Hemanta">{t('hemanta_ritu')}</option>
              <option value="Shishira">{t('shishira_ritu')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.planDuration')}</label>
            <input
              type="number"
              min={1}
              max={52}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-2 block w-full border border-gray-300/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-gray-50/50"
            />
          </div>
        </div>

        {/* Meal Slots Section */}
        <div className="space-y-6">
          <h2 className="font-playfair text-2xl font-bold text-earth px-1">🍱 {t('dietitian.createPlan.prescribedMeals')}</h2>
          
          <div className="space-y-5">
            {meals.map((meal, index) => (
              <div key={meal.key} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🥣</span>
                    <h3 className="font-playfair text-lg font-bold text-earth">{getTranslatedMealName(meal)}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('common.time', { defaultValue: 'Time:' })}</span>
                    <input
                      type="text"
                      value={meal.time}
                      onChange={(e) => updateMealField(index, 'time', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-center font-bold w-24 focus:ring-sage focus:border-sage outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Description and Note */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.instructionsLabel')}</label>
                      <textarea
                        rows={2}
                        value={meal.description}
                        onChange={(e) => updateMealField(index, 'description', e.target.value)}
                        placeholder={t('dietitian.createPlan.instructionsPlaceholder')}
                        className="mt-1.5 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-gray-50/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.createPlan.insightLabel')}</label>
                      <input
                        type="text"
                        value={meal.ayurvedaNote}
                        onChange={(e) => updateMealField(index, 'ayurvedaNote', e.target.value)}
                        placeholder={t('dietitian.createPlan.insightPlaceholder')}
                        className="mt-1.5 block w-full border border-gray-300/70 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-sage focus:border-sage outline-none bg-gray-50/20"
                      />
                    </div>
                  </div>

                  {/* Foods Multi-Select and Nutrition summary */}
                  <div className="md:col-span-1 bg-gray-100/30 border border-gray-200/75 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-[9px] font-bold text-earth/50 uppercase tracking-widest mb-1.5">{t('dietitian.createPlan.selectIngredients')}</label>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin mt-1.5">
                        {foods.map((food) => {
                          const isSelected = meal.foods.some(f => f.toLowerCase() === food.name.toLowerCase());
                          return (
                            <button
                              key={food._id}
                              type="button"
                              onClick={() => {
                                const newFoods = isSelected
                                  ? meal.foods.filter(f => f.toLowerCase() !== food.name.toLowerCase())
                                  : [...meal.foods, food.name];
                                updateMealField(index, 'foods', newFoods);
                              }}
                              className={`text-[9px] px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                                isSelected
                                  ? 'bg-earth text-white border-earth shadow-sm'
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100/60'
                              }`}
                            >
                              {translateFood(food.name)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-200/70 pt-3 mt-3 space-y-1 text-[10px] text-gray-500 font-bold">
                      <span className="block text-[8px] text-earth/40 uppercase tracking-wider">{t('dietitian.createPlan.autoCalculated')}</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-semibold text-gray-600">
                        <span>{t('dietitian.createPlan.calories')}: <strong className="text-earth">{meal.nutrition.calories} kcal</strong></span>
                        <span>{t('dietitian.createPlan.protein')}: <strong className="text-earth">{meal.nutrition.protein.toFixed(1)}g</strong></span>
                        <span>{t('dietitian.createPlan.carbs')}: <strong className="text-earth">{meal.nutrition.carbs.toFixed(1)}g</strong></span>
                        <span>{t('dietitian.createPlan.fats')}: <strong className="text-earth">{meal.nutrition.fat.toFixed(1)}g</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Report Card */}
        {validationReport && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-playfair text-xl font-bold text-earth">🌿 {t('dietitian.createPlan.validationReport')}</h3>
                <p className="text-xs text-gray-450 font-semibold mt-0.5">{t('dietitian.createPlan.automatedCheck')}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                validationReport.score >= 90 ? 'bg-emerald-500/10 text-emerald-700' :
                validationReport.score >= 60 ? 'bg-amber-500/10 text-amber-700' :
                'bg-rose-500/10 text-rose-700'
              }`}>
                {t('dietitian.createPlan.scoreLabel')}: {validationReport.score}/100 ({validationReport.status === 'perfect' ? t('perfect_combination', 'Perfect') : validationReport.status === 'caution' ? t('warning', 'Caution') : t('incompatible', 'Poor')})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
              {/* Timing Issues */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-455 uppercase tracking-widest block">⏰ {t('dietitian.createPlan.timingCompliance')}</span>
                {validationReport?.timingIssues?.length === 0 ? (
                  <p className="text-emerald-600">✓ {t('dietitian.createPlan.allMealsTimingOk')}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {validationReport?.timingIssues?.map((issue, idx) => (
                      <li key={idx} className="text-amber-700 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                        ⚠️ <strong>{getTranslatedMealName({ key: issue.meal })}</strong> ({issue.time}): {getTimingIssueText(issue)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Seasonal Alignment */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-455 uppercase tracking-widest block">🍂 {t('dietitian.createPlan.seasonalSuitability')}</span>
                {validationReport?.seasonalIssues?.length === 0 ? (
                  <p className="text-emerald-600">✓ {t('dietitian.createPlan.allSeasonOk')}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {validationReport?.seasonalIssues?.map((issue, idx) => (
                       <li key={idx} className="text-amber-700 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                         ⚠️ <strong>{getTranslatedMealName({ key: issue.meal })}</strong>: {getSeasonalIssueText(issue)}
                       </li>
                     ))}
                  </ul>
                )}
              </div>

              {/* Incompatibility Rules (Viruddha Ahara) */}
              <div className="space-y-2 md:col-span-2">
                <span className="text-[10px] text-gray-455 uppercase tracking-widest block">❌ {t('dietitian.createPlan.viruddhaConflicts')}</span>
                {validationReport?.compatibilityIssues?.length === 0 ? (
                  <p className="text-emerald-600">✓ {t('dietitian.createPlan.allCompatibleOk')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {validationReport?.compatibilityIssues?.map((issue, idx) => (
                       <div key={idx} className="text-rose-700 bg-rose-50/50 p-3 rounded-xl border border-rose-100 space-y-1">
                         <span className="font-extrabold text-xs block">❌ {issue.pair.join(' + ')} ({getTranslatedMealName({ key: issue.meal })})</span>
                         <p className="text-[10px] leading-relaxed text-gray-500">{getCompatibilityIssueText(issue)}</p>
                         <span className="text-[8px] bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase font-black tracking-widest inline-block">{t('checker.hazardTag', { severity: t(issue.severity, issue.severity) })}</span>
                       </div>
                     ))}
                  </div>
                )}
              </div>

              {/* Dosha Aggravations */}
              <div className="space-y-2 md:col-span-2">
                <span className="text-[10px] text-gray-455 uppercase tracking-widest block">🧬 {t('dietitian.createPlan.doshaCompatibility')}</span>
                {validationReport?.doshaIssues?.length === 0 ? (
                  <p className="text-emerald-600">✓ {t('dietitian.createPlan.allDoshaOk')}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {validationReport?.doshaIssues?.map((issue, idx) => (
                       <li key={idx} className="text-purple-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                         ⚡ <strong>{getTranslatedMealName({ key: issue.meal })}</strong>: {getDoshaIssueText(issue)}
                       </li>
                     ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleValidatePlan}
            disabled={validating || saving}
            className="bg-saffron text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-md shadow-saffron/10 transition-all disabled:opacity-50 cursor-pointer border border-saffron/30"
          >
            {validating ? t('dietitian.createPlan.validating') : validationReport ? t('dietitian.createPlan.reValidateBtn') : t('dietitian.createPlan.validateBtn')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || !validationReport}
            className="bg-sage hover:bg-sage-dark text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-sage/15 transition-all disabled:opacity-50 flex items-center space-x-2 cursor-pointer border border-sage/40"
          >
            {saving ? (
              <span>{t('dietitian.createPlan.saving')}</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>{t('dietitian.createPlan.saveBtn')}</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CreateDietPlan;
