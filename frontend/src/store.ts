import { create } from 'zustand';

export interface FlightData {
    altitude: number;
    latitude: number;
    longitude: number;
    heading: number;
    airspeed: number;
}

interface FlightStoreState extends FlightData {
    isConnected: boolean;
    updateFlight: (data: Partial<FlightData>) => void;
    setConnectionStatus: (status: boolean) => void;
}

export const useFlightStore = create<FlightStoreState>((set) => ({
    altitude: 0,
    latitude: 0,
    longitude: 0,
    heading: 0,
    airspeed: 0,
    isConnected: false,
    updateFlight: (data) => set(data),
    setConnectionStatus: (status) => set({ isConnected: status }),
}));
