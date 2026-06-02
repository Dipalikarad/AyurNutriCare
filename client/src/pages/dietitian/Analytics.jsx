import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  BarChart, Bar, Legend
} from 'recharts';
import { Activity, TrendingUp, Compass, Award, Sparkles, BookOpen, CalendarDays } from 'lucide-react';
import { translateFoodHelper, SafeChart } from '../../components/UIElements';

const Analytics = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renderCharts, setRenderCharts] = useState(false);

  useEffect(() => {
    setRenderCharts(false);
    if (!loading) {
      const timer = setTimeout(() => {
        setRenderCharts(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, lang]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.analytics.getOverview();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching analytics details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-gray-250 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-white rounded-3xl border border-gray-100"></div>
          <div className="h-80 bg-white rounded-3xl border border-gray-100"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { charts } = data;

  // Custom colors for charts
  const COLORS = ['#52796F', '#F4A261', '#E76F51', '#2D6A4F', '#D4AF37', '#3D2B1F', '#CAD2C5'];
  const DOSHA_COLORS = {
    'Vata': '#54A0FF',       // Blue for Air/Space
    'Pitta': '#FF6B6B',      // Red for Fire/Water
    'Kapha': '#1DD1A1',      // Green for Earth/Water
    'Vata-Pitta': '#FF9F43',
    'Vata-Kapha': '#48DBFB',
    'Pitta-Kapha': '#10AC84',
    'Undetermined': '#C8D6E5'
  };

  const translateDosha = (d) => {
    if (!d) return t('common.unknown');
    if (d === 'Undetermined') return t('common.unknown');
    return d.split('-').map(part => {
      const clean = part.trim().toLowerCase();
      if (clean === 'vata') return t('profile.constitVata');
      if (clean === 'pitta') return t('profile.constitPitta');
      if (clean === 'kapha') return t('profile.constitKapha');
      return part;
    }).join('-');
  };

  const translateGoal = (g) => {
    if (g === 'General Wellness') return t('dietitian.goals.general', { defaultValue: 'General Wellness' });
    if (g === 'Weight Loss') return t('dietitian.goals.weight', { defaultValue: 'Weight Loss' });
    if (g === 'Immunity Boost') return t('dietitian.goals.immunity', { defaultValue: 'Immunity Boost' });
    if (g === 'Digestive Health') return t('dietitian.goals.digestive', { defaultValue: 'Digestive Health' });
    return g;
  };

  const translateVal = (val) => {
    if (!val) return val;
    const cleanLower = val.toLowerCase();
    if (cleanLower.includes('vata') || cleanLower.includes('pitta') || cleanLower.includes('kapha') || cleanLower.includes('undetermined')) {
      return translateDosha(val);
    }
    if (val === 'General Wellness' || val === 'Weight Loss' || val === 'Immunity Boost' || val === 'Digestive Health') {
      return translateGoal(val);
    }
    if (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(val)) {
      return t(`months.${val}`, { defaultValue: val });
    }
    if (val.includes('Week')) {
      return val.replace('Week', i18n.language === 'en' ? 'Week' : i18n.language === 'hi' ? 'सप्ताह' : 'आठवडा');
    }
    return translateFoodHelper(val, i18n);
  };

  // Custom Tooltip Component for premium look
  const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      const getUnitTranslation = (u) => {
        if (!u) return '';
        const trimmed = u.trim();
        if (trimmed === 'patients') return t('dietitian.analytics.patientsUnit');
        if (trimmed === 'prescriptions') return t('dietitian.analytics.prescriptionsUnit');
        return u;
      };

      const translatedLabel = translateVal(label);

      return (
        <div className="bg-white/90 backdrop-blur-md border border-gray-150 p-3.5 rounded-2xl shadow-xl text-xs font-bold text-earth">
          {label && <p className="mb-1 font-playfair text-sm font-bold text-gray-500 border-b border-gray-100 pb-1">{translatedLabel}</p>}
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color }}>
              {translateVal(p.name)}: <strong className="text-earth">{p.value}{getUnitTranslation(unit)}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth">{t('dietitian.analytics.title')}</h1>
        <p className="text-gray-400 text-sm font-semibold mt-1">{t('dietitian.analytics.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Dosha Distribution (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-w-0"
        >
          <div>
            <h3 className="font-playfair text-xl font-bold text-earth mb-1 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-sage" /> {t('dietitian.analytics.doshaTitle')}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{t('dietitian.analytics.doshaSubtitle')}</p>
          </div>
          <div className="h-64 w-full relative">
            {renderCharts && (
              <SafeChart>
                {(width, height) => (
                  <PieChart width={width} height={height}>
                    <Pie
                      data={charts.doshaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${translateDosha(name)} (${(percent * 100).toFixed(0)}%)` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {charts.doshaData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={DOSHA_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                )}
              </SafeChart>
            )}
          </div>
        </motion.div>

        {/* 2. Patient Growth (Line Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-w-0"
        >
          <div>
            <h3 className="font-playfair text-xl font-bold text-earth mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-saffron" /> {t('dietitian.analytics.growthTitle')}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{t('dietitian.analytics.growthSubtitle')}</p>
          </div>
          <div className="h-64 w-full relative">
            {renderCharts && (
              <SafeChart>
                {(width, height) => (
                  <LineChart data={charts.growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} width={width} height={height}>
                    {/* SVG Linear Gradient definitions */}
                    <defs>
                      <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#52796F" />
                        <stop offset="100%" stopColor="#F4A261" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="month" tickFormatter={(val) => t(`months.${val}`, { defaultValue: val })} tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '600' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '600' }} />
                    <Tooltip content={<CustomTooltip unit=" patients" />} />
                    <Line 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="url(#lineColor)" 
                      strokeWidth={4}
                      activeDot={{ r: 8 }} 
                      dot={{ stroke: '#52796F', strokeWidth: 3, r: 4, fill: 'white' }}
                    />
                  </LineChart>
                )}
              </SafeChart>
            )}
          </div>
        </motion.div>

        {/* 3. Diet Plan Compliance (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-w-0"
        >
          <div>
            <h3 className="font-playfair text-xl font-bold text-earth mb-1 flex items-center gap-1.5">
              <Activity className="w-5 h-5 text-emerald-600" /> {t('dietitian.analytics.complianceTitle')}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{t('dietitian.analytics.complianceSubtitle')}</p>
          </div>
          <div className="h-64 w-full relative">
            {renderCharts && (
              <SafeChart>
                {(width, height) => (
                  <BarChart data={charts.complianceData} width={width} height={height}>
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F4A261" />
                        <stop offset="100%" stopColor="#E76F51" />
                      </linearGradient>
                      <linearGradient id="barColorHighlight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#52796F" />
                        <stop offset="100%" stopColor="#1B4332" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="name" tickFormatter={(val) => val.includes('Week') ? val.replace('Week', i18n.language === 'en' ? 'Week' : i18n.language === 'hi' ? 'सप्ताह' : 'आठवडा') : val} tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '600' }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '600' }} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Bar dataKey="rate" fill="#F4A261" radius={[8, 8, 0, 0]}>
                      {charts.complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? 'url(#barColorHighlight)' : 'url(#barColor)'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </SafeChart>
            )}
          </div>
        </motion.div>

        {/* 4. Top Recommended Foods (Horizontal Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-w-0"
        >
          <div>
            <h3 className="font-playfair text-xl font-bold text-earth mb-1 flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-earth" /> {t('dietitian.analytics.topFoodsTitle')}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{t('dietitian.analytics.topFoodsSubtitle')}</p>
          </div>
          <div className="h-64 w-full relative">
            {renderCharts && (
              <SafeChart>
                {(width, height) => (
                  <BarChart
                    data={charts.topFoodsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    width={width}
                    height={height}
                  >
                    <defs>
                      <linearGradient id="horizontalBarColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1B4332" />
                        <stop offset="100%" stopColor="#52796F" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '600' }} />
                    <YAxis dataKey="name" type="category" tickFormatter={(val) => translateFoodHelper(val, i18n)} tick={{ fill: '#3D2B1F', fontSize: 11, fontWeight: '700' }} />
                    <Tooltip content={<CustomTooltip unit=" prescriptions" />} />
                    <Bar dataKey="count" fill="url(#horizontalBarColor)" radius={[0, 8, 8, 0]} barSize={16} />
                  </BarChart>
                )}
              </SafeChart>
            )}
          </div>
        </motion.div>

        {/* 5. Health Goals Distribution (Donut Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-2 min-w-0"
        >
          <div>
            <h3 className="font-playfair text-xl font-bold text-earth mb-1 flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-purple-600" /> {t('dietitian.analytics.goalsTitle')}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{t('dietitian.analytics.goalsSubtitle')}</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-3">
            <div className="h-56 w-56 relative flex items-center justify-center">
              {renderCharts && (
                <SafeChart>
                  {(width, height) => (
                    <PieChart width={width} height={height}>
                      <Pie
                        data={charts.goalsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.goalsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip unit=" targets" />} />
                    </PieChart>
                  )}
                </SafeChart>
              )}
              {/* Donut Chart Center stats text */}
              <div className="absolute text-center flex flex-col items-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('dietitian.analytics.active')}</span>
                <span className="block text-2xl font-black text-earth leading-none">{t('dietitian.analytics.sheets')}</span>
              </div>
            </div>
            
            {/* Custom Legend Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs font-semibold">
              {charts.goalsData.map((goal, idx) => (
                <div key={goal.name} className="flex items-center space-x-2.5 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                  <span className="w-3.5 h-3.5 rounded-xl shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-bold text-gray-500">{translateGoal(goal.name)}:</span>
                  <span className="text-earth font-black text-sm">{goal.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Analytics;
