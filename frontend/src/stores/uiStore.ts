import { create } from 'zustand';
import type { ModuleType } from '../config/modules';

export type { ModuleType };

interface UIStoreState {
    activeModule: string;
    setActiveModule: (module: string) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
    activeModule: 'ofp',
    setActiveModule: (module) => set({ activeModule: module }),
}));
