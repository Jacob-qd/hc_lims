import { create } from 'zustand';
import i18n from '../i18n';

type Locale = 'zh' | 'en';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: (localStorage.getItem('hc_lims_locale') as Locale) || 'zh',
  setLocale: (locale) => {
    localStorage.setItem('hc_lims_locale', locale);
    i18n.changeLanguage(locale);
    set({ locale });
  },
  t: (key, options) => {
    // Use i18next if initialized, fallback to simple key return
    if (i18n.isInitialized) {
      const opts = options || {};
      if (i18n.exists(key, opts)) {
        return i18n.t(key, opts) as string;
      }
      // Fallback: try namespace prefix syntax (e.g., login:title)
      const nsKey = key.replace('.', ':');
      if (nsKey !== key && i18n.exists(nsKey, opts)) {
        return i18n.t(nsKey, opts) as string;
      }
      return key;
    }
    return key;
  },
}));

// Sync i18n language on store initialization
if (i18n.isInitialized) {
  const saved = localStorage.getItem('hc_lims_locale') as Locale;
  if (saved && (saved === 'zh' || saved === 'en')) {
    i18n.changeLanguage(saved);
  }
} else {
  i18n.on('initialized', () => {
    const saved = localStorage.getItem('hc_lims_locale') as Locale;
    if (saved && (saved === 'zh' || saved === 'en')) {
      i18n.changeLanguage(saved);
    }
  });
}
