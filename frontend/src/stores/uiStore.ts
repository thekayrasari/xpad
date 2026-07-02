import { create } from 'zustand';

export type ModuleType = 'home' | 'ofp' | 'radar' | 'weather' | 'pdf' | 'aoc' | 'settings' | 'notes' | 'simbrief' | 'fenix' | 'charts' | 'flightsimto' | 'nattrak' | 'fslabs' | 'vpilot' | 'launcher' | 'gsx' | 'calculators';

interface UIStoreState {
    activeModule: ModuleType;
    setActiveModule: (module: ModuleType) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
    activeModule: 'home',
    setActiveModule: (module) => set({ activeModule: module }),
}));
