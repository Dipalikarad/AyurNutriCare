import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { StatCard, PatientCard, LoadingSkeleton } from '../../components/UIElements';
import { Users, BookOpen, Calendar, HelpCircle, PlusCircle, Clock, Check, Trash, Plus } from 'lucide-react';

const DietitianDashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({ totalPatients: 0, activePlans: 0, todayAppointments: 0, pendingReviews: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Slot generator state
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotMessage, setSlotMessage] = useState('');

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch overview analytics
      const analyticsRes = await api.analytics.getOverview();
      if (analyticsRes.success) {
        setStats(analyticsRes.stats);
      }

      // Fetch patients
      const patientRes = await api.patient.getAll();
      if (patientRes.success) {
        setRecentPatients(patientRes.patients.slice(0, 3)); // show top 3
      }

      // Fetch appointments
      const apptRes = await api.appointments.getMine();
      if (apptRes.success) {
        setAppointments(apptRes.appointments);
      }
    } catch (err) {
      console.error('Error loading dietitian dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotTime) return;

    try {
      const dateTimeString = `${newSlotDate}T${newSlotTime}`;
      const res = await api.appointments.createSlots({
        dateTimes: [dateTimeString],
        duration: slotDuration
      });

      if (res.success) {
        setSlotMessage('success');
        setNewSlotDate('');
        setNewSlotTime('');
        setTimeout(() => setSlotMessage(''), 3000);
        loadData(); // reload
      }
    } catch (err) {
      console.error('Error creating slot:', err.message);
      setSlotMessage('error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.appointments.updateStatus(id, { status });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error('Error updating appointment status:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-gray-250 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      
      {/* Welcome & Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth">{t('dietitian.dashboard.title')}</h1>
        <p className="text-gray-400 text-sm font-semibold mt-1">{t('dietitian.dashboard.subtitle')}</p>
      </motion.div>
 
      {/* Stats row */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard title={t('dietitian.dashboard.totalPatients')} value={stats.totalPatients} icon={Users} />
        <StatCard title={t('dietitian.dashboard.activePlans')} value={stats.activePlans} icon={BookOpen} />
        <StatCard title={t('dietitian.dashboard.todayAppointments')} value={stats.todayAppointments} icon={Calendar} />
        <StatCard title={t('dietitian.dashboard.pendingReviews')} value={stats.pendingReviews} icon={HelpCircle} />
      </motion.div>
 
      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Schedule and Patient list */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Calendar / Appointments List */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-playfair text-xl font-bold text-earth mb-5 flex items-center gap-1">
              {t('dietitian.dashboard.appointmentCalendar')}
            </h3>
            
            {appointments.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-255/70">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">{t('dietitian.dashboard.noAppointments')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {appointments.map((appt) => {
                  const date = new Date(appt.dateTime);
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      key={appt._id} 
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-2xl transition-all ${
                        appt.status === 'Scheduled' ? 'bg-amber-500/5 border-amber-250 shadow-sm shadow-amber-500/5' :
                        appt.status === 'Completed' ? 'bg-emerald-500/5 border-emerald-250 shadow-sm shadow-emerald-500/5' :
                        'bg-gray-50 border-gray-150'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        {/* Calendar Icon Layout */}
                        <div className="text-center bg-white border border-gray-200 rounded-2xl p-2 min-w-[70px] shadow-sm">
                          <span className="block text-[10px] font-black text-sage uppercase tracking-wider">
                            {date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'hi' ? 'hi-IN' : 'mr-IN', { weekday: 'short' })}
                          </span>
                          <span className="block text-xl font-black text-earth leading-none mt-0.5">
                            {date.getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({appt.duration} {t('dietitian.dashboard.durationMinShort')})
                          </p>
                          <h4 className="font-bold text-earth text-base mt-1">
                            {appt.patientId ? appt.patientId.name : t('dietitian.dashboard.unbookedSlot')}
                          </h4>
                          {appt.notes && <p className="text-xs text-gray-500 italic mt-0.5">{t('dietitian.dashboard.notes')}: {appt.notes}</p>}
                        </div>
                      </div>
 
                      {appt.status === 'Scheduled' && (
                        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(appt._id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold flex items-center shadow-md shadow-emerald-600/10 cursor-pointer"
                            title={t('dietitian.dashboard.statusCompleted')}
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(appt._id, 'Cancelled')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl border border-rose-150 text-xs font-bold flex items-center cursor-pointer shadow-sm"
                            title={t('dietitian.dashboard.statusCancelled')}
                          >
                            <Trash className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                      
                      {appt.status !== 'Scheduled' && (
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border mt-4 sm:mt-0 uppercase tracking-widest ${
                          appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          appt.status === 'Available' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                          'bg-gray-150 text-gray-500 border-gray-200'
                        }`}>
                          {t(`dietitian.dashboard.status${appt.status}`)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Recent Patients */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-playfair text-xl font-bold text-earth">👥 {t('dietitian.dashboard.recentPatients')}</h3>
              <button 
                onClick={() => navigate('/dietitian/patients')}
                className="text-sage font-extrabold text-sm hover:underline cursor-pointer"
              >
                {t('dietitian.dashboard.viewAllPatients')}
              </button>
            </div>
            {recentPatients.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-500">{t('dietitian.dashboard.noPatients')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recentPatients.map((pat) => (
                  <PatientCard 
                    key={pat._id} 
                    patient={pat} 
                    onClick={() => navigate('/dietitian/patients', { state: { selectedId: pat._id } })} 
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
 
        {/* Right Col: Quick Actions & Slot generator */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-playfair text-xl font-bold text-earth mb-4">⚡ {t('dietitian.dashboard.quickChannels', { defaultValue: 'Quick Channels' })}</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dietitian/patients', { state: { openCreatePlan: true } })}
                className="w-full py-4 px-4 bg-sage hover:bg-sage-dark text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-sage/15 cursor-pointer border border-sage/40"
              >
                <PlusCircle className="w-5 h-5 text-gold" />
                <span>{t('dietitian.dashboard.createDietPlan')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dietitian/patients')}
                className="w-full py-4 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-earth rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <Users className="w-5 h-5 text-gray-400" />
                <span>{t('dietitian.dashboard.managePatients')}</span>
              </motion.button>
            </div>
          </div>
 
          {/* Time Slot Generator Form */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-playfair text-xl font-bold text-earth mb-1.5 flex items-center">
              {t('dietitian.dashboard.addSlots')}
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold mb-4 uppercase tracking-widest">{t('dietitian.dashboard.createBookingSlots')}</p>
            
            <form onSubmit={handleCreateSlot} className="space-y-4 pt-1">
              {slotMessage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-xl text-xs font-bold border ${slotMessage === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}
                >
                  {slotMessage === 'success' ? t('dietitian.dashboard.slotSuccess') : t('dietitian.dashboard.slotFailed')}
                </motion.div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.dashboard.selectDate')}</label>
                <input 
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="mt-1.5 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-gray-50/50 font-semibold"
                />
              </div>
 
              <div>
                <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.dashboard.selectTime')}</label>
                <input 
                  type="time"
                  required
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="mt-1.5 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-gray-50/50 font-semibold"
                />
              </div>
 
              <div>
                <label className="block text-[10px] font-bold text-earth/50 uppercase tracking-widest">{t('dietitian.dashboard.duration')}</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="mt-1.5 block w-full border border-gray-250/70 rounded-xl px-3.5 py-2.5 text-sm focus:ring-sage focus:border-sage outline-none bg-white font-semibold"
                >
                  <option value={15}>{t('dietitian.dashboard.duration15')}</option>
                  <option value={30}>{t('dietitian.dashboard.duration30')}</option>
                  <option value={45}>{t('dietitian.dashboard.duration45')}</option>
                  <option value={60}>{t('dietitian.dashboard.duration60')}</option>
                </select>
              </div>
 
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-earth hover:bg-earth-dark text-white rounded-xl text-xs font-bold shadow-md shadow-earth/10 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('dietitian.dashboard.createTimeSlotBtn')}</span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DietitianDashboard;
