import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationMR from './locales/mr/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    resources: {
      en: {
        translation: translationEN
      },
      hi: {
        translation: translationHI
      },
      mr: {
        translation: translationMR
      }
    },
    fallbackLng: 'en',
    load: 'languageOnly',
    supportedLngs: ['en', 'hi', 'mr'],
    returnObjects: true,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ayn-lang',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
      prefix: '{',
      suffix: '}'
    },
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      console.warn(
        `[i18n] MISSING KEY → lang: [${lngs}], ns: "${ns}", key: "${key}", fallback: "${fallbackValue}"`
      );
    }
  });

// Log language change events for debugging
i18n.on('languageChanged', (lng) => {
  console.log(`[i18n] 🌐 Language changed to: "${lng}"`);
  console.log(`[i18n]   localStorage ayn-lang: "${localStorage.getItem('ayn-lang')}"`);
  console.log(`[i18n]   dietitian.dashboard.title → "${i18n.t('dietitian.dashboard.title')}"`);
});

// Verify initial load
console.log(`[i18n] ✅ Initialized — language: "${i18n.language}"`);
console.log(`[i18n]   EN dietitian keys loaded: ${!!translationEN?.dietitian}`);
console.log(`[i18n]   HI dietitian keys loaded: ${!!translationHI?.dietitian}`);
console.log(`[i18n]   MR dietitian keys loaded: ${!!translationMR?.dietitian}`);

export default i18n;
