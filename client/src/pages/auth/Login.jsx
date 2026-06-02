import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t('login.errorEmpty'));
      return;
    }

    setLoadingForm(true);
    const result = await login(email, password);
    setLoadingForm(false);

    if (result.success) {
      // Redirect based on role
      const destination = redirectUrl || (result.user.role === 'dietitian' ? '/dietitian/dashboard' : '/patient/dashboard');
      navigate(destination);
    } else {
      setError(t('login.errorInvalid'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FEFAE0]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl">🌿</span>
        <h2 className="mt-4 text-3xl font-black text-earth tracking-tight font-playfair">
          {t('login.title')}
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          {t('login.subtitle')}{' '}
          <Link to="/register" className="font-bold text-sage hover:text-sage-dark transition-colors">
            {t('login.createAccount')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-sage-light/15 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-start space-x-2 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('login.emailLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none transition-shadow duration-150"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-earth/70">
                {t('login.passwordLabel')}
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-4 py-3 block w-full border border-gray-200 rounded-xl focus:ring-sage focus:border-sage sm:text-sm outline-none transition-shadow duration-150"
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loadingForm}
                className="w-full flex justify-center py-3.5 px-4 bg-sage hover:bg-sage-dark text-white rounded-xl text-sm font-bold shadow-md shadow-sage/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loadingForm ? t('login.loadingBtn') : t('login.submitBtn')}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center text-xs text-gray-400 font-medium">
            {t('login.secureFooter')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
