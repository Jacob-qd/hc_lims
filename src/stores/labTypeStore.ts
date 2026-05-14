import { create } from 'zustand';

export type LabType = 'commercial' | 'research';

interface LabTypeState {
  labType: LabType;
  setLabType: (type: LabType) => void;
  isResearch: () => boolean;
  isCommercial: () => boolean;
}

const STORAGE_KEY = 'hc_lims_lab_type';

const getInitialType = (): LabType => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'research' || stored === 'commercial') return stored;
  } catch {}
  return 'commercial';
};

export const useLabTypeStore = create<LabTypeState>((set, get) => ({
  labType: getInitialType(),
  setLabType: (type) => {
    localStorage.setItem(STORAGE_KEY, type);
    set({ labType: type });
    window.location.reload();
  },
  isResearch: () => get().labType === 'research',
  isCommercial: () => get().labType === 'commercial',
}));
