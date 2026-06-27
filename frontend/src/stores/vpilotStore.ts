import { create } from 'zustand';

export interface VPilotMessage {
    id: string;
    sender: string;
    content: string;
    frequency?: string;
    timestamp: number;
    isPrivate: boolean;
    isSentByMe: boolean;
    tab?: string;
}

export interface VPilotController {
    callsign: string;
    frequency: string;
}

interface VPilotStoreState {
    isConnected: boolean;
    com1: string;
    com2: string;
    messages: VPilotMessage[];
    controllers: VPilotController[];
    activeTab: string;
    pmTabs: string[];
    sendWsMessage: ((topic: string, payload: any) => void) | null;
    setConnectionStatus: (status: boolean) => void;
    setFrequencies: (com1: string, com2: string) => void;
    addMessage: (msg: VPilotMessage) => void;
    addController: (controller: VPilotController) => void;
    removeController: (callsign: string) => void;
    updateController: (callsign: string, frequency: string) => void;
    setActiveTab: (tab: string) => void;
    addPmTab: (callsign: string) => void;
    removePmTab: (callsign: string) => void;
    setSendWsMessage: (fn: (topic: string, payload: any) => void) => void;
}

export const useVPilotStore = create<VPilotStoreState>((set) => ({
    isConnected: false,
    com1: '122.800',
    com2: '122.800',
    messages: [],
    controllers: [],
    activeTab: 'ATC',
    pmTabs: [],
    sendWsMessage: null,
    setConnectionStatus: (status) => set({ isConnected: status }),
    setFrequencies: (com1, com2) => set({ com1, com2 }),
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    addController: (ctrl) => set((state) => ({ 
        controllers: state.controllers.some(c => c.callsign === ctrl.callsign) ? state.controllers : [...state.controllers, ctrl] 
    })),
    removeController: (callsign) => set((state) => ({ 
        controllers: state.controllers.filter(c => c.callsign !== callsign) 
    })),
    updateController: (callsign, frequency) => set((state) => ({ 
        controllers: state.controllers.map(c => c.callsign === callsign ? { ...c, frequency } : c) 
    })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    addPmTab: (callsign) => set((state) => ({
        pmTabs: state.pmTabs.includes(callsign) ? state.pmTabs : [...state.pmTabs, callsign],
        activeTab: callsign
    })),
    removePmTab: (callsign) => set((state) => ({
        pmTabs: state.pmTabs.filter(t => t !== callsign),
        activeTab: state.activeTab === callsign ? 'ATC' : state.activeTab
    })),
    setSendWsMessage: (fn) => set({ sendWsMessage: fn })
}));
