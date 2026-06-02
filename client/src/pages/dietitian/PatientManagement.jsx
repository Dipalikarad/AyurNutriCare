import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { DoshaBadge, DoshaChart } from '../../components/UIElements';
import { Search, Plus, Trash2, ArrowRight, BookOpen, AlertCircle, Phone, Mail, CalendarDays } from 'lucide-react';

const PatientManagement = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Medical history edit state
  const [newCondition, setNewCondition] = useState('');
  const [updatingHistory, setUpdatingHistory] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Load all patients
  const loadPatients = async (selectId = null) => {
    try {
      setLoading(true);
      const res = await api.patient.getAll();
      if (res.success) {
        setPatients(res.patients);
        
        // Decide which patient to select
        const queryId = selectId || location.state?.selectedId;
        if (queryId) {
          fetchPatientDetail(queryId);
        } else if (res.patients.length > 0) {
          fetchPatientDetail(res.patients[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading patients:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetail = async (patientId) => {
    try {
      setLoadingDetail(true);
      const res = await api.patient.getProfile(patientId);
      if (res.success) {
        setSelectedPatient(res.patient);

        // Check if redirecting immediately to create diet plan
        if (location.state?.openCreatePlan && patientId === location.state?.selectedId) {
          navigate('/dietitian/create-plan', { state: { patientId: res.patient._id, name: res.patient.name, dominantDosha: res.patient.dominantDosha } });
        }
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [location.state]);

  const handleAddCondition = async (e) => {
    e.preventDefault();
    if (!newCondition.trim() || !selectedPatient) return;

    setUpdatingHistory(true);
    try {
      const updatedHistory = [...selectedPatient.medicalHistory, newCondition.trim()];
      const res = await api.patient.updateMedicalHistory(selectedPatient._id, updatedHistory);
      if (res.success) {
        setSelectedPatient(prev => ({
          ...prev,
          medicalHistory: res.medicalHistory
        }));
        setNewCondition('');
      }
    } catch (err) {
      console.error('Error adding condition:', err.message);
    } finally {
      setUpdatingHistory(false);
    }
  };

  const handleRemoveCondition = async (indexToRemove) => {
    if (!selectedPatient) return;
    
    setUpdatingHistory(true);
    try {
      const updatedHistory = selectedPatient.medicalHistory.filter((_, idx) => idx !== indexToRemove);
      const res = await api.patient.updateMedicalHistory(selectedPatient._id, updatedHistory);
      if (res.success) {
        setSelectedPatient(prev => ({
          ...prev,
          medicalHistory: res.medicalHistory
        }));
      }
    } catch (err) {
      console.error('Error removing condition:', err.message);
    } finally {
      setUpdatingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col pb-20">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex-shrink-0"
      >
        <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth">{t('dietitian.patients.title')}</h1>
        <p className="text-gray-400 text-sm font-semibold mt-1">{t('dietitian.patients.subtitle')}</p>
      </motion.div>

      {loading ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          <div className="md:col-span-1 space-y-4">
            <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
            <div className="h-40 w-full bg-white rounded-3xl border border-gray-100"></div>
          </div>
          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6"></div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 mb-4">
          
          {/* Left Column: Patient List (Scrollable) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-4.5 border-b border-gray-50 flex-shrink-0 bg-gray-55/10">
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={t('dietitian.patients.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 block w-full border border-gray-250/70 rounded-xl focus:ring-sage focus:border-sage text-xs outline-none bg-gray-50/20 font-semibold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50/80 p-3.5 space-y-2 scrollbar-thin">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-400 font-bold">
                  {t('dietitian.patients.noPatientsFound')}
                </div>
              ) : (
                filteredPatients.map((pat) => {
                  const isSelected = selectedPatient?._id === pat._id;
                  return (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={pat._id}
                      onClick={() => fetchPatientDetail(pat._id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex justify-between items-center border ${
                        isSelected 
                          ? 'bg-sage/10 border-sage/40 shadow-sm shadow-sage/5 border-l-4 border-l-sage' 
                          : 'hover:bg-gray-50/80 border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-sm text-earth truncate">{pat.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{pat.email}</p>
                      </div>
                      <DoshaBadge dosha={pat.dominantDosha} />
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Right Column: Selected Patient Profile details (Scrollable) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {loadingDetail ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
              </div>
            ) : selectedPatient ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* Header Profile Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-4 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-sage-dark text-white flex items-center justify-center text-xl font-bold shadow-md shadow-sage/10">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-playfair text-2xl font-black text-earth leading-tight">{selectedPatient.name}</h2>
                      <p className="text-[10px] text-gray-450 font-bold uppercase tracking-widest mt-0.5">{t('dietitian.patients.joined')} {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DoshaBadge dosha={selectedPatient.dominantDosha} />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/dietitian/create-plan', { 
                        state: { 
                          patientId: selectedPatient._id,
                          name: selectedPatient.name,
                          dominantDosha: selectedPatient.dominantDosha 
                        } 
                      })}
                      className="px-4.5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-xs font-bold shadow-md shadow-sage/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-gold" />
                      <span>{t('dietitian.patients.prescribeDietPlanBtn')}</span>
                    </motion.button>
                  </div>
                </div>

                {/* Info parameters Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <div>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dietitian.patients.age')}</span>
                    <span className="font-extrabold text-sm text-earth">{selectedPatient.age || 'N/A'} {t('dietitian.patients.ageYrs')}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dietitian.patients.gender')}</span>
                    <span className="font-extrabold text-sm text-earth capitalize">
                      {selectedPatient.gender === 'male' ? t('profile.genderMale') : selectedPatient.gender === 'female' ? t('profile.genderFemale') : selectedPatient.gender === 'other' ? t('profile.genderOther') : (selectedPatient.gender || 'N/A')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dietitian.patients.height')}</span>
                    <span className="font-extrabold text-sm text-earth">{selectedPatient.height || 'N/A'} cm</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dietitian.patients.weight')}</span>
                    <span className="font-extrabold text-sm text-earth">{selectedPatient.weight || 'N/A'} kg</span>
                  </div>
                </div>

                {/* Dosha Assessment Chart & Medical History columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dosha Radar */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-white flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 self-start">
                      🧬 {t('dietitian.patients.doshaChartTitle')}
                    </h3>
                    {selectedPatient.dominantDosha === 'Undetermined' ? (
                      <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-xs text-gray-400 font-semibold space-y-1.5">
                        <AlertCircle className="w-8 h-8 text-gray-300" />
                        <span>{t('dietitian.patients.noQuizTaken')}</span>
                      </div>
                    ) : (
                      <DoshaChart distribution={selectedPatient.doshaDistribution} />
                    )}
                  </div>

                  {/* Medical History */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        📋 {t('dietitian.patients.medicalHistory')}
                      </h3>
                      
                      <form onSubmit={handleAddCondition} className="flex space-x-2 mb-4">
                        <input
                          type="text"
                          placeholder={t('dietitian.patients.addConditionPlaceholder')}
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          className="flex-1 border border-gray-250/70 rounded-xl px-3 py-1.5 text-xs focus:ring-sage focus:border-sage outline-none bg-gray-50/50 font-semibold"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={updatingHistory}
                          className="bg-earth hover:bg-earth-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center cursor-pointer shadow-md shadow-earth/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </form>

                      {selectedPatient.medicalHistory.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold italic">{t('dietitian.patients.noMedicalRecorded')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                          <AnimatePresence>
                            {selectedPatient.medicalHistory.map((cond, idx) => (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={idx}
                                className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold"
                              >
                                <span>{cond}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCondition(idx)}
                                  className="text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact and credentials */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-[10px] font-bold text-gray-450 uppercase tracking-widest mb-3">📞 {t('dietitian.patients.contactChannels')}</h3>
                  <div className="text-xs space-y-2.5 text-gray-500 font-semibold">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sage" />
                      <span className="text-earth">{selectedPatient.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-sage" />
                      <span className="text-earth">{selectedPatient.phone || 'N/A'}</span>
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-xs text-gray-400 font-semibold">
                <CalendarDays className="w-12 h-12 text-gray-200 mb-2" />
                <span>{t('dietitian.patients.selectFromList')}</span>
              </div>
            )}
          </motion.div>
          
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
