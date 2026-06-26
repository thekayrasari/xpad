import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AOCEvent {
    id: string;
    timestamp: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'delay';
}

interface AOCStoreState {
    events: AOCEvent[];
    unreadCount: number;
    addEvent: (event: AOCEvent) => void;
    markAllRead: () => void;
    clearEvents: () => void;
}

export const useAOCStore = create<AOCStoreState>()(
    persist(
        (set) => ({
            events: [],
            unreadCount: 0,
            
            addEvent: (event) => set((state) => ({
                events: [event, ...state.events].slice(0, 50), // keep last 50
                unreadCount: state.unreadCount + 1
            })),
            
            markAllRead: () => set({ unreadCount: 0 }),
            
            clearEvents: () => set({ events: [], unreadCount: 0 })
        }),
        {
            name: 'xpad-aoc-storage'
        }
    )
);
