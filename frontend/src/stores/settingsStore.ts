import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartsProvider = 'navigraph' | 'chartfox' | 'msfs';

interface SettingsState {
    simbriefId: string;
    chartsProvider: ChartsProvider;
    setSimbriefId: (id: string) => void;
    setChartsProvider: (provider: ChartsProvider) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            simbriefId: '',
            chartsProvider: 'msfs',
            setSimbriefId: (id) => set({ simbriefId: id }),
            setChartsProvider: (provider) => set({ chartsProvider: provider }),
            resetSettings: () => set({ simbriefId: '', chartsProvider: 'msfs' }),
        }),
        {
            name: 'xpad-settings', // key in localStorage
        }
    )
);
