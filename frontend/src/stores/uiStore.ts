import { create } from 'zustand';

export type ModuleType = 'home' | 'ofp' | 'map' | 'weather' | 'pdf' | 'aoc' | 'settings' | 'notes' | 'planner' | 'fenix' | 'links';

interface UIStoreState {
    activeModule: ModuleType;
    secondaryModule: ModuleType | null;
    setActiveModule: (module: ModuleType) => void;
    setSecondaryModule: (module: ModuleType | null) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
    activeModule: 'home',
    secondaryModule: null,
    setActiveModule: (module) => set({ activeModule: module, secondaryModule: null }), // closing secondary when changing main usually makes sense
    setSecondaryModule: (module) => set({ secondaryModule: module }),
}));
