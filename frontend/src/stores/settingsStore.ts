import { create } from 'zustand';

export type ChartsProvider = 'navigraph' | 'chartfox' | 'msfs';

interface SettingsState {
    simbriefId: string;
    chartsProvider: ChartsProvider;
    simulatorIp: string;
    isLoading: boolean;
    error: string | null;
    setSimbriefId: (id: string) => void;
    setChartsProvider: (provider: ChartsProvider) => void;
    setSimulatorIp: (ip: string) => void;
    fetchSettings: () => Promise<void>;
    saveSettings: (simbriefId: string, chartsProvider: ChartsProvider, simulatorIp: string) => Promise<void>;
    resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    simbriefId: '',
    chartsProvider: 'msfs',
    simulatorIp: '127.0.0.1',
    isLoading: false,
    error: null,
    setSimbriefId: (id) => set({ simbriefId: id }),
    setChartsProvider: (provider) => set({ chartsProvider: provider }),
    setSimulatorIp: (ip) => set({ simulatorIp: ip }),
    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const baseUrl = window.location.port === '5173' ? 'http://localhost:3001' : '';
            const res = await fetch(`${baseUrl}/api/settings`);
            if (!res.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await res.json();
            set({
                simbriefId: data.simbriefId || '',
                chartsProvider: data.chartsProvider || 'msfs',
                simulatorIp: data.simulatorIp || '127.0.0.1',
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Unknown error', isLoading: false });
        }
    },
    saveSettings: async (simbriefId, chartsProvider, simulatorIp) => {
        set({ isLoading: true, error: null });
        try {
            const baseUrl = window.location.port === '5173' ? 'http://localhost:3001' : '';
            const res = await fetch(`${baseUrl}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ simbriefId, chartsProvider, simulatorIp })
            });
            if (!res.ok) {
                throw new Error('Failed to save settings');
            }
            const data = await res.json();
            set({
                simbriefId: data.settings.simbriefId,
                chartsProvider: data.settings.chartsProvider,
                simulatorIp: data.settings.simulatorIp,
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Unknown error', isLoading: false });
            throw err;
        }
    },
    resetSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const baseUrl = window.location.port === '5173' ? 'http://localhost:3001' : '';
            const res = await fetch(`${baseUrl}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ simbriefId: '', chartsProvider: 'msfs', simulatorIp: '127.0.0.1' })
            });
            if (!res.ok) {
                throw new Error('Failed to reset settings');
            }
            const data = await res.json();
            set({
                simbriefId: data.settings.simbriefId,
                chartsProvider: data.settings.chartsProvider,
                simulatorIp: data.settings.simulatorIp,
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Unknown error', isLoading: false });
        }
    }
}));
