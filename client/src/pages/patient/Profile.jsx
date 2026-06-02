import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { DoshaBadge, DoshaChart } from '../../components/UIElements';
import { User, Sparkles, Calendar, Plus, Check, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const Profile = () => {
  const { user, updateLocalDosha } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const translateDosha = (d) => {
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

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [formMsg, setFormMsg] = useState('');

  // Booking state
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.patient.getProfile(user._id);
      if (res.success) {
        setProfile(res.patient);
        setAge(res.patient.age || '');
        setGender(res.patient.gender || 'male');
        setHeight(res.patient.height || '');
        setWeight(res.patient.weight || '');
      }

      const apptsRes = await api.appointments.getMine();
      if (apptsRes.success) {
        setMyAppointments(apptsRes.appointments);
      }

      const slotsRes = await api.appointments.getAvailable();
      if (slotsRes.success) {
        setAvailableSlots(slotsRes.slots);
      }
    } catch (err) {
      console.error('Error loading patient profile data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormMsg('');

    try {
      const res = await api.patient.updateProfile({
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight)
      });

      if (res.success) {
        setFormMsg(t('profile.updateSuccess'));
        setTimeout(() => setFormMsg(''), 3000);
        loadProfileData();
      }
    } catch (err) {
      setFormMsg(err.message || t('profile.updateFailed'));
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) return;
    setBookingMsg('');

    try {
      const res = await api.appointments.book({
        slotId: selectedSlotId,
        notes: bookingNotes
      });

      if (res.success) {
        setBookingMsg(t('profile.bookSuccess'));
        setSelectedSlotId('');
        setBookingNotes('');
        setTimeout(() => setBookingMsg(''), 3500);
        loadProfileData(); // refresh appointments
      }
    } catch (err) {
      setBookingMsg(err.message || t('profile.bookFailed'));
    }
  };

  const getCountdown = (dateTimeString) => {
    const apptDate = new Date(dateTimeString);
    const today = new Date();
    today.setHours(0,0,0,0);
    apptDate.setHours(0,0,0,0);

    const diffTime = apptDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('profile.countdownToday');
    if (diffDays === 1) return t('profile.countdownTomorrow');
    if (diffDays < 0) return t('profile.countdownPassed');
    return t('profile.countdownDays', { days: diffDays });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-gray-250 dark:bg-herbal-dark/50 rounded-2xl"></div>
        <div className="h-96 w-full bg-white dark:bg-herbal rounded-[32px] border border-gray-150 dark:border-sage/15"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: t('profile.tabProfile'), icon: User },
    { id: 'dosha', label: t('profile.tabDosha'), icon: Sparkles },
    { id: 'appointments', label: t('profile.tabAppointments'), icon: Calendar },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      
      {/* Tab bar header styled like Stripe */}
      <div className="flex space-x-1 border-b border-gray-200/80 dark:border-sage/20 mb-8 overflow-x-auto pb-0.5 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 font-playfair text-lg font-bold border-b-2 outline-none transition-all flex items-center space-x-2 relative cursor-pointer ${
                active ? 'text-sage dark:text-sage-light border-sage dark:border-sage-light' : 'border-transparent text-gray-400 dark:text-white/40 hover:text-earth dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? 'text-sage dark:text-sage-light' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {active && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-sage dark:bg-sage-light" 
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {/* 1. Tab Content: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Edit form */}
              <div className="md:col-span-2 bg-white dark:bg-herbal rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-sage/15 shadow-sm space-y-4 transition-colors duration-300">
                <h3 className="font-playfair text-xl font-bold text-earth dark:text-white border-b border-gray-100/70 dark:border-sage/15 pb-3 flex items-center gap-1.5 font-heading">
                  <FileText className="w-5 h-5 text-sage" /> {t('profile.demographicsTitle')}
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
                  {formMsg && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 rounded-xl text-xs font-bold border ${
                        formMsg === t('profile.updateSuccess')
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-rose-50 dark:bg-rose-955/20 text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                      }`}
                    >
                      {formMsg}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest">{t('profile.ageLabel')}</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="mt-1.5 block w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-gray-50/50 dark:bg-herbal-dark/50 text-earth dark:text-white font-semibold"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest">{t('profile.genderLabel')}</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1.5 block w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-white dark:bg-herbal-dark text-earth dark:text-white font-semibold"
                      >
                        <option value="male">{t('profile.genderMale')}</option>
                        <option value="female">{t('profile.genderFemale')}</option>
                        <option value="other">{t('profile.genderOther')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest">{t('profile.heightLabel')}</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="mt-1.5 block w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-gray-50/50 dark:bg-herbal-dark/50 text-earth dark:text-white font-semibold"
                        placeholder="170"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest">{t('profile.weightLabel')}</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-1.5 block w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-gray-50/50 dark:bg-herbal-dark/50 text-earth dark:text-white font-semibold"
                        placeholder="70"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-sage hover:bg-sage-dark text-white rounded-xl text-xs font-bold shadow-md shadow-sage/10 border border-transparent dark:border-sage/35 transition-all cursor-pointer"
                  >
                    {t('profile.saveBtn')}
                  </motion.button>
                </form>
              </div>

              {/* Right sidebar: Medical History */}
              <div className="md:col-span-1 bg-white dark:bg-herbal rounded-3xl p-6 border border-gray-100 dark:border-sage/15 shadow-sm transition-colors duration-300">
                <h3 className="font-playfair text-lg font-bold text-earth dark:text-white mb-3 border-b border-gray-100/70 dark:border-sage/15 pb-3 font-heading">
                  {t('profile.medicalTitle')}
                </h3>
                <p className="text-xs text-gray-400 dark:text-white/45 font-semibold leading-relaxed mb-4">
                  {t('profile.medicalDesc')}
                </p>
                {profile?.medicalHistory?.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-white/40 font-semibold italic">{t('profile.medicalEmpty')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.medicalHistory?.map((cond, index) => (
                      <span 
                        key={index} 
                        className="bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border border-rose-100/75 dark:border-rose-900/30 text-xs px-2.5 py-1 rounded-xl font-bold"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Tab Content: Prakriti results */}
          {activeTab === 'dosha' && (
            <div className="bg-white dark:bg-herbal rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-sage/15 shadow-sm space-y-6 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-sage/15 pb-4.5 gap-3">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-earth dark:text-white font-heading">{t('profile.doshaTitle')}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-white/45 font-semibold uppercase tracking-widest mt-0.5">{t('profile.doshaSubtitle')}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/patient/quiz')}
                  className="bg-saffron/10 dark:bg-saffron/20 border border-saffron/20 dark:border-saffron/40 hover:bg-saffron/20 dark:hover:bg-saffron/25 text-saffron-dark dark:text-saffron px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  {t('profile.retakeBtn')}
                </motion.button>
              </div>

              {profile?.dominantDosha === 'Undetermined' ? (
                <div className="text-center py-16 bg-gray-50/50 dark:bg-herbal-dark/30 rounded-3xl border border-dashed border-gray-200 dark:border-sage/20">
                  <Sparkles className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-500 dark:text-white/50">{t('profile.doshaEmpty')}</p>
                  <button
                    onClick={() => navigate('/patient/quiz')}
                    className="mt-4 px-6 py-3 bg-sage hover:bg-sage-dark text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t('profile.startAssessment')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                  <div>
                    <DoshaChart distribution={profile.doshaDistribution} />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest block">{t('profile.dominantLabel')}</span>
                      <div className="mt-1 flex items-center space-x-2.5">
                        <span className="text-2xl sm:text-3xl font-black font-playfair text-earth dark:text-white font-heading">{translateDosha(profile.dominantDosha)}</span>
                        <DoshaBadge dosha={profile.dominantDosha} />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-white/70 leading-relaxed space-y-3.5 border-t border-gray-100 dark:border-sage/10 pt-4 font-semibold">
                      <p>{t('profile.constitBalance')}</p>
                      <ul className="space-y-1.5 text-xs">
                        <li>💨 <strong className="text-earth dark:text-white">{t('profile.constitVata')}:</strong> {profile.doshaDistribution.vata}%</li>
                        <li>🔥 <strong className="text-earth dark:text-white">{t('profile.constitPitta')}:</strong> {profile.doshaDistribution.pitta}%</li>
                        <li>💧 <strong className="text-earth dark:text-white">{t('profile.constitKapha')}:</strong> {profile.doshaDistribution.kapha}%</li>
                      </ul>
                      <p className="text-xs text-gray-450 dark:text-white/60 italic mt-3 font-medium leading-relaxed bg-cream/30 dark:bg-herbal-dark/30 border border-cream-dark/30 dark:border-sage/20 rounded-2xl p-3.5">
                        {t('profile.constitNote')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Tab Content: Appointments scheduler */}
          {activeTab === 'appointments' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* List of my bookings */}
              <div className="md:col-span-2 bg-white dark:bg-herbal rounded-3xl p-6 border border-gray-100 dark:border-sage/15 shadow-sm space-y-4 transition-colors duration-300">
                <h3 className="font-playfair text-xl font-bold text-earth dark:text-white border-b border-gray-100 dark:border-sage/15 pb-3.5 font-heading">
                  {t('profile.appointmentsTitle')}
                </h3>
                
                {myAppointments.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400 dark:text-white/40 font-semibold italic bg-gray-50/50 dark:bg-herbal-dark/30 rounded-2xl border border-dashed border-gray-200 dark:border-sage/20">
                    {t('profile.appointmentsEmpty')}
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {myAppointments.map((appt) => {
                      const date = new Date(appt.dateTime);
                      const countdown = getCountdown(appt.dateTime);
                      return (
                        <div 
                          key={appt._id} 
                          className={`flex justify-between items-center p-4 border rounded-2xl transition-all ${
                            appt.status === 'Scheduled' 
                              ? 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 shadow-sm' 
                              : 'bg-gray-50 dark:bg-herbal-dark/40 border-gray-150 dark:border-sage/15'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 rounded-xl bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 dark:text-white/45 font-bold uppercase tracking-widest">
                                {date.toLocaleDateString()} @ {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <h4 className="font-bold text-earth dark:text-white text-sm mt-0.5">
                                {t('profile.consultWith', { name: appt.dietitianId.name })}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`block text-xs font-black uppercase tracking-wider ${
                              countdown === t('profile.countdownToday') || countdown === t('profile.countdownTomorrow') 
                                ? 'text-saffron-dark dark:text-saffron' 
                                : 'text-gray-550 dark:text-white/50'
                            }`}>
                              {countdown}
                            </span>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border capitalize mt-0.5 ${
                              appt.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-150 text-gray-500 border-gray-200'
                            }`}>
                              {appt.status === 'Scheduled' ? t('profile.statusScheduled') : (appt.status === 'Cancelled' ? t('profile.statusCancelled') : appt.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking form */}
              <div className="md:col-span-1 bg-white dark:bg-herbal rounded-3xl p-6 border border-gray-100 dark:border-sage/15 shadow-sm transition-colors duration-300">
                <h3 className="font-playfair text-lg font-bold text-earth dark:text-white mb-3 border-b border-gray-100 dark:border-sage/15 pb-3 flex items-center gap-1.5 font-heading">
                  {t('profile.bookTitle')}
                </h3>

                <form onSubmit={handleBookAppointment} className="space-y-4 pt-1">
                  {bookingMsg && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 rounded-xl text-xs font-bold border ${
                        bookingMsg.includes('successfully') 
                          ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-rose-50 dark:bg-rose-955/20 text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                      }`}
                    >
                      {bookingMsg}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest mb-1.5">{t('profile.bookSlotsLabel')}</label>
                    {availableSlots.length === 0 ? (
                      <div className="text-xs text-gray-400 dark:text-white/40 font-semibold p-3 bg-gray-50 dark:bg-herbal-dark/30 rounded-xl border border-gray-100 dark:border-sage/20 leading-relaxed text-center">
                        {t('profile.bookSlotsEmpty')}
                      </div>
                    ) : (
                      <select
                        value={selectedSlotId}
                        onChange={(e) => setSelectedSlotId(e.target.value)}
                        className="w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3 py-2.5 text-xs focus:ring-sage focus:border-sage outline-none bg-white dark:bg-herbal-dark text-earth dark:text-white font-semibold"
                        required
                      >
                        <option value="">{t('profile.bookChooseOption')}</option>
                        {availableSlots.map((slot) => {
                          const d = new Date(slot.dateTime);
                          return (
                            <option key={slot._id} value={slot._id}>
                              {d.toLocaleDateString()} @ {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({slot.dietitianId.name})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-earth/50 dark:text-white/50 uppercase tracking-widest mb-1.5">{t('profile.bookNotesLabel')}</label>
                    <textarea
                      rows={3}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder={t('profile.bookNotesPlaceholder')}
                      className="w-full border border-gray-200 dark:border-sage/25 rounded-xl px-3 py-2.5 text-xs focus:ring-sage focus:border-sage outline-none bg-gray-50/50 dark:bg-herbal-dark/50 text-earth dark:text-white font-semibold"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!selectedSlotId}
                    className="w-full py-3 bg-earth dark:bg-herbal-dark hover:bg-earth-dark dark:hover:bg-herbal text-white rounded-xl text-xs font-bold border border-transparent dark:border-sage/35 shadow-md shadow-earth/10 cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('profile.bookBtn')}</span>
                  </motion.button>
                </form>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Profile;
