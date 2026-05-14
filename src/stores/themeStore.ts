import { create } from 'zustand';
import { theme as antTheme } from 'antd';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  mode: ThemeMode;
  toggle: () => void;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  getConfig: () => { algorithm: any; token: any };
}

const STORAGE_KEY = 'hc_lims_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'light',
  mode: (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'light',
  toggle: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next, mode: next });
    window.location.reload();
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next, mode: next });
    window.location.reload();
  },
  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    set({ theme: mode, mode });
    window.location.reload();
  },
  getConfig: () => ({
    algorithm: get().theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: { colorPrimary: '#1677ff', borderRadius: 6 },
  }),
}));
