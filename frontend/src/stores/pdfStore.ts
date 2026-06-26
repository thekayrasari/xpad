import { create } from 'zustand';

export interface PDFFileEntry {
    name: string;
    url: string; // object URL
}

interface PDFStoreState {
    files: PDFFileEntry[];
    activeFileUrl: string | null;
    addFiles: (entries: PDFFileEntry[]) => void;
    removeFile: (url: string) => void;
    setActiveFile: (url: string) => void;
}

export const usePDFStore = create<PDFStoreState>((set) => ({
    files: [],
    activeFileUrl: null,

    addFiles: (entries) => {
        set(state => {
            const existing = new Set(state.files.map(f => f.name));
            const fresh = entries.filter(e => !existing.has(e.name));
            const files = [...state.files, ...fresh];
            const activeFileUrl = state.activeFileUrl ?? (fresh[0]?.url ?? files[0]?.url ?? null);
            return { files, activeFileUrl };
        });
    },

    removeFile: (url) => {
        URL.revokeObjectURL(url);
        set(state => {
            const files = state.files.filter(f => f.url !== url);
            let activeFileUrl = state.activeFileUrl;
            if (activeFileUrl === url) {
                activeFileUrl = files[0]?.url ?? null;
            }
            return { files, activeFileUrl };
        });
    },

    setActiveFile: (url) => set({ activeFileUrl: url }),
}));
