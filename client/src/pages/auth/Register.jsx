import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Phone, AlertCircle, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password) {
      setError(t('register.errorEmpty'));
      return;
    }

    if (password.length < 6) {
      setError(t('register.errorPasswordLength'));
      return;
    }

    setLoadingForm(true);
    const result = await register(name, email, password, role, phone);
    setLoadingForm(false);

    if (result.success) {
      if (role === 'dietitian') {
        navigate('/dietitian/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      setError(t('register.errorFailed'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FEFAE0]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl">🌿</span>
        <h2 className="mt-4 text-3xl font-black text-earth tracking-tight font-playfair">
          {t('register.title')}
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          {t('register.subtitle')}{' '}
          <Link to="/login" className="font-bold text-sage hover:text-sage-dark transition-colors">
            {t('register.signInLink')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-sage-light/15 sm:rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-start space-x-2 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('register.roleLabel')}
              </label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all text-center ${role === 'patient' ? 'bg-sage text-white border-sage shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {t('register.rolePatient')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('dietitian')}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all text-center ${role === 'dietitian' ? 'bg-sage text-white border-sage shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {t('register.roleDietitian')}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('register.nameLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none"
                  placeholder={t('register.namePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('register.emailLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none"
                  placeholder={t('register.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('register.phoneLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none"
                  placeholder={t('register.phonePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('register.passwordLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none"
                  placeholder={t('register.passwordPlaceholder')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loadingForm}
                className="w-full flex justify-center py-3.5 px-4 bg-sage hover:bg-sage-dark text-white rounded-xl text-sm font-bold shadow-md shadow-sage/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loadingForm ? t('register.loadingBtn') : t('register.submitBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
