import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { calculateDoshaResult } from '../../utils/prakritiCalculator';
import { DoshaBadge, DoshaChart } from '../../components/UIElements';
import { Compass, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Wind, Flame, Droplet } from 'lucide-react';

const Quiz = () => {
  const { updateLocalDosha } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const questions = t('quiz.questions') || [];
  const question = questions[currentStep] || { options: [] };
  const progressPercent = Math.round((currentStep / questions.length) * 100);

  const handleSelectOption = (dosha) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: dosha
    }));

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 350);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1 && answers[question.id]) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert(t('quiz.alertUnanswered'));
      return;
    }

    setSubmitting(true);
    try {
      const calcResult = calculateDoshaResult(answers);
      const res = await api.patient.savePrakriti(answers);
      
      if (res.success) {
        setResult(calcResult);
        updateLocalDosha(calcResult.dominant);
      }
    } catch (err) {
      console.error('Error submitting quiz answers:', err.message);
      alert(t('quiz.alertFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const getDoshaInfo = (dosha) => {
    if (!dosha) return '';
    const clean = dosha.toLowerCase();
    
    if (clean === 'vata') {
      return t('quiz.vataInfo');
    }
    if (clean === 'pitta') {
      return t('quiz.pittaInfo');
    }
    if (clean === 'kapha') {
      return t('quiz.kaphaInfo');
    }
    return t('quiz.dualInfo');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      
      {/* 1. Results View (after completion) */}
      {result ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-herbal rounded-[32px] p-6 sm:p-10 border border-gray-100 dark:border-sage/15 shadow-xl space-y-8 text-center transition-colors duration-300"
        >
          <div className="inline-flex p-4.5 rounded-3xl bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light mb-2 border border-sage/20 dark:border-sage/35 animate-float">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div>
            <span className="text-xs font-bold text-sage dark:text-gold uppercase tracking-widest block">{t('quiz.completedTitle')}</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-black text-earth dark:text-white mt-1 font-heading">{t('quiz.profileTitle')}</h2>
            <div className="mt-3 flex justify-center">
              <DoshaBadge dosha={result.dominant} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-b border-gray-150/50 dark:border-sage/20 py-8 text-left">
            <div>
              <DoshaChart distribution={result.distribution} />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-playfair text-xl font-bold text-earth dark:text-white flex items-center gap-1.5 font-heading">
                <Sparkles className="w-5 h-5 text-gold" /> {t('quiz.constitutionTitle')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/70 leading-relaxed font-semibold">
                {getDoshaInfo(result.dominant)}
              </p>

              {/* Graphical percentage meters */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-sage/10">
                {/* Vata */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
                    <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> {t('quiz.vataLabel')}</span>
                    <span>{result.distribution.vata}%</span>
                  </div>
                  <div className="h-2 w-full bg-sky-50 dark:bg-sky-950/20 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 animate-pulse-glow" style={{ width: `${result.distribution.vata}%` }} />
                  </div>
                </div>

                {/* Pitta */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-saffron-dark dark:text-saffron">
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {t('quiz.pittaLabel')}</span>
                    <span>{result.distribution.pitta}%</span>
                  </div>
                  <div className="h-2 w-full bg-saffron/10 dark:bg-saffron/20 rounded-full overflow-hidden">
                    <div className="h-full bg-saffron" style={{ width: `${result.distribution.pitta}%` }} />
                  </div>
                </div>

                {/* Kapha */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-450">
                    <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> {t('quiz.kaphaLabel')}</span>
                    <span>{result.distribution.kapha}%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-50 dark:bg-emerald-950/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${result.distribution.kapha}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patient/dashboard')}
              className="px-8 py-4 bg-sage hover:bg-sage-dark text-white rounded-2xl font-bold text-sm shadow-md shadow-sage/10 cursor-pointer"
            >
              {t('quiz.dashboardBtn')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patient/plan')}
              className="px-8 py-4 bg-earth dark:bg-herbal-dark text-white rounded-2xl font-bold text-sm border border-transparent dark:border-sage/20 shadow-md shadow-earth/10 cursor-pointer"
            >
              {t('quiz.planBtn')}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* 2. Interactive Step-by-Step Quiz Form */
        <div className="bg-white dark:bg-herbal rounded-[32px] p-6 sm:p-8 border border-gray-150 dark:border-sage/15 shadow-sm space-y-6 transition-colors duration-300">
          {/* Header progress */}
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-white/45 uppercase tracking-widest mb-3">
              <span>{t('quiz.assessmentTitle')}</span>
              <span>{t('quiz.questionCount', { current: currentStep + 1, total: questions.length })}</span>
            </div>
            
            <div className="h-2 w-full bg-gray-100 dark:bg-herbal-dark/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-sage rounded-full"
                animate={{ width: `${progressPercent || 5}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2 space-y-1.5">
            <span className="text-xs font-bold text-saffron dark:text-gold uppercase tracking-widest bg-saffron/10 dark:bg-gold/15 border border-saffron/20 dark:border-gold/30 px-3 py-1 rounded-full">{question.category}</span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-earth dark:text-white leading-snug pt-1.5 font-heading">{question.text}</h2>
          </div>

          {/* Options List */}
          <div className="space-y-3.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {question.options.map((opt, idx) => {
                  const isSelected = answers[question.id] === opt.dosha;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      key={idx}
                      onClick={() => handleSelectOption(opt.dosha)}
                      className={`w-full text-left p-4.5 rounded-2xl border text-sm font-semibold leading-relaxed transition-all flex items-start space-x-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-sage/10 dark:bg-sage/15 border-sage dark:border-sage text-earth dark:text-white shadow-sm' 
                          : 'bg-white dark:bg-herbal border-gray-150 dark:border-sage/20 text-gray-700 dark:text-white/80 hover:bg-sage/5 dark:hover:bg-sage/10 hover:border-sage/30 dark:hover:border-sage/25'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-sage bg-sage text-white' : 'border-gray-300 dark:border-sage/30'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </span>
                      <span>{opt.text}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-5 border-t border-gray-50 dark:border-sage/10 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-sage/25 text-xs font-bold text-gray-500 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-herbal-dark/40 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('quiz.prevBtn')}</span>
            </motion.button>

            {currentStep === questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting || !answers[question.id]}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-xs font-bold shadow-md shadow-sage/10 disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? t('quiz.submitting') : t('quiz.finishBtn')}</span>
                <CheckCircle className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-earth dark:bg-herbal-dark text-white rounded-xl text-xs font-bold border border-transparent dark:border-sage/20 shadow-md shadow-earth/10 disabled:opacity-50 cursor-pointer"
              >
                <span>{t('quiz.nextBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Quiz;
