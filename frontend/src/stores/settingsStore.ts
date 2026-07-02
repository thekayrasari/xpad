import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartsProvider = 'navigraph' | 'chartfox' | 'msfs';

interface SettingsState {
    simbriefId: string;
    chartsProvider: ChartsProvider;
    simulatorIp: string;
    setSimbriefId: (id: string) => void;
    setChartsProvider: (provider: ChartsProvider) => void;
    setSimulatorIp: (ip: string) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            simbriefId: '',
            chartsProvider: 'msfs',
            simulatorIp: '127.0.0.1',
            setSimbriefId: (id) => set({ simbriefId: id }),
            setChartsProvider: (provider) => set({ chartsProvider: provider }),
            setSimulatorIp: (ip) => set({ simulatorIp: ip }),
            resetSettings: () => set({ simbriefId: '', chartsProvider: 'msfs', simulatorIp: '127.0.0.1' }),
        }),
        {
            name: 'xpad-settings', // key in localStorage
        }
    )
);
