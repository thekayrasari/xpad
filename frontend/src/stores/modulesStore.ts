import { create } from 'zustand';

export interface ExternalModuleConfig {
    id: string;
    label: string;
    icon: string;
    type: 'webview' | 'iframe';
    src?: string;
    port?: number;
    productName?: string;
    productDescription?: string;
    notFoundTitle?: string;
    notFoundHint?: string;
    certHint?: string;
    loadingText?: string;
}

interface ModulesState {
    modules: ExternalModuleConfig[];
    isLoading: boolean;
    error: string | null;
    fetchModules: () => Promise<void>;
}

export const useModulesStore = create<ModulesState>((set) => ({
    modules: [],
    isLoading: false,
    error: null,
    fetchModules: async () => {
        set({ isLoading: true, error: null });
        try {
            const baseUrl = window.location.port === '5173' ? 'http://localhost:3001' : '';
            const res = await fetch(`${baseUrl}/api/modules`);
            if (!res.ok) {
                throw new Error('Failed to fetch modules config');
            }
            const data = await res.json() as ExternalModuleConfig[];
            set({ modules: data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Unknown error', isLoading: false });
        }
    }
}));
