import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Point {
    x: number;
    y: number;
}

export interface Stroke {
    id: string;
    points: Point[];
    color: string;
    width: number;
}

interface NotesState {
    // Text fields structured by section
    textData: Record<string, string>;
    
    // Canvas drawing data
    strokes: Stroke[];
    
    // UI State (persisted so it remembers the mode)
    mode: 'type' | 'draw';

    // Actions
    setText: (fieldId: string, value: string) => void;
    updateTexts: (fields: Record<string, string>) => void;
    addStroke: (stroke: Stroke) => void;
    undoStroke: () => void;
    clearDrawing: () => void;
    clearText: () => void;
    clearAll: () => void;
    setMode: (mode: 'type' | 'draw') => void;
}

export const useNotesStore = create<NotesState>()(
    persist(
        (set) => ({
            textData: {},
            strokes: [],
            mode: 'type',

            setText: (fieldId, value) => set((state) => ({
                textData: { ...state.textData, [fieldId]: value }
            })),
            
            updateTexts: (fields) => set((state) => ({
                textData: { ...state.textData, ...fields }
            })),

            addStroke: (stroke) => set((state) => ({
                strokes: [...state.strokes, stroke]
            })),

            undoStroke: () => set((state) => ({
                strokes: state.strokes.slice(0, -1)
            })),

            clearDrawing: () => set({ strokes: [] }),
            
            clearText: () => set({ textData: {} }),

            clearAll: () => set({ textData: {}, strokes: [] }),

            setMode: (mode) => set({ mode })
        }),
        {
            name: 'xpad-notes-storage',
            // Omit large arrays from frequent localStorage syncing if needed, 
            // but Zustand handles it well enough for basic usage.
        }
    )
);
