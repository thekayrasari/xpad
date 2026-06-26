import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
    base: string;
    surface0: string;
    surface1: string;
    text: string;
    subtext0: string;
    blue: string;
    green: string;
    red: string;
    mauve: string;
    peach: string;
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
    base: '#1e1e2e',
    surface0: '#313244',
    surface1: '#45475a',
    text: '#cdd6f4',
    subtext0: '#a6adc8',
    blue: '#89b4fa',
    green: '#a6e3a1',
    red: '#f38ba8',
    mauve: '#cba6f7',
    peach: '#fab387'
};

interface SettingsState {
    simbriefId: string;
    themeColors: ThemeColors;
    setSimbriefId: (id: string) => void;
    setThemeColors: (colors: Partial<ThemeColors>) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            simbriefId: '',
            themeColors: DEFAULT_THEME_COLORS,
            setSimbriefId: (id) => set({ simbriefId: id }),
            setThemeColors: (colors) => set((state) => ({ 
                themeColors: { ...state.themeColors, ...colors } 
            })),
            resetSettings: () => set({ simbriefId: '', themeColors: DEFAULT_THEME_COLORS }),
        }),
        {
            name: 'xpad-settings', // key in localStorage
        }
    )
);
