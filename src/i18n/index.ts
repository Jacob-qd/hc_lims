import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCommon from './locales/zh/common.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhLogin from './locales/zh/login.json';
import zhSample from './locales/zh/sample.json';
import zhTask from './locales/zh/task.json';
import zhReport from './locales/zh/report.json';
import zhQuality from './locales/zh/quality.json';
import zhInstrument from './locales/zh/instrument.json';
import zhInventory from './locales/zh/inventory.json';
import zhMethod from './locales/zh/method.json';
import zhPersonnel from './locales/zh/personnel.json';
import zhSystem from './locales/zh/system.json';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enLogin from './locales/en/login.json';
import enSample from './locales/en/sample.json';
import enTask from './locales/en/task.json';
import enReport from './locales/en/report.json';
import enQuality from './locales/en/quality.json';
import enInstrument from './locales/en/instrument.json';
import enInventory from './locales/en/inventory.json';
import enMethod from './locales/en/method.json';
import enPersonnel from './locales/en/personnel.json';
import enSystem from './locales/en/system.json';

const resources = {
  zh: {
    common: zhCommon,
    dashboard: zhDashboard,
    login: zhLogin,
    sample: zhSample,
    task: zhTask,
    report: zhReport,
    quality: zhQuality,
    instrument: zhInstrument,
    inventory: zhInventory,
    method: zhMethod,
    personnel: zhPersonnel,
    system: zhSystem,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    login: enLogin,
    sample: enSample,
    task: enTask,
    report: enReport,
    quality: enQuality,
    instrument: enInstrument,
    inventory: enInventory,
    method: enMethod,
    personnel: enPersonnel,
    system: enSystem,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'login', 'sample', 'task', 'report', 'quality', 'instrument', 'inventory', 'method', 'personnel', 'system'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hc_lims_locale',
    },
  });

export default i18n;
