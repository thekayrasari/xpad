import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlannerState {
    // ── Flight Info ──────────────────────────────────────────────
    airline: string;          // ICAO airline code e.g. "BAW"
    flightNumber: string;     // e.g. "0001"
    departure: string;        // ICAO e.g. "EGLL"
    arrival: string;          // ICAO e.g. "KJFK"
    alternate: string;        // ICAO e.g. "KBOS"
    departureTime: string;    // "HHMM" 24hr or "NOW" or "" for EOBT

    // ── Aircraft Info ────────────────────────────────────────────
    aircraftType: string;     // ICAO type e.g. "A320"
    registration: string;     // e.g. "G-EUUU"
    selcal: string;           // e.g. "AB-CD"
    atcCallsign: string;      // e.g. "SPEEDBIRD1"
    climbProfile: string;     // "AUTO" | "CI0" | "CI10" | ...
    cruiseProfile: string;    // "AUTO" | "LRC" | "M78" | ...
    descentProfile: string;   // "AUTO" | "CI0" | ...

    // ── Selections ───────────────────────────────────────────────
    ofpLayout: string;        // "LIDO" | "UAL" | "AAL" | "PFPX" | ...
    units: string;            // "kgs" | "lbs"
    flightRules: string;      // "IFR" | "VFR" | "DVFR"
    typeOfFlight: string;     // "Scheduled" | "Non-Scheduled" | "Private" | "Ferry"
    flightMaps: string;       // "Detailed" | "Simple" | "None"
    alternatesCount: string;  // "0" | "1" | "2"
    taxiOut: string;          // minutes e.g. "20"
    taxiIn: string;           // minutes e.g. "8"

    // Toggles
    detailedNavlog: boolean;
    etops: boolean;
    stepclimbs: boolean;
    runwayAnalysis: boolean;
    notams: boolean;
    firNotams: boolean;

    // ── Optional Entries ─────────────────────────────────────────
    blockTimeHH: string;
    blockTimeMM: string;
    departureRunway: string;  // "AUTO" or specific e.g. "27L"
    arrivalRunway: string;    // "AUTO" or specific
    altitude: string;         // "AUTO" or flight level e.g. "370"
    passengers: string;       // "AUTO" or number
    freight: string;          // kg/lb value
    payload: string;          // "AUTO" or value
    zeroFuelWeight: string;   // "AUTO" or value

    // ── Actions ──────────────────────────────────────────────────
    setField: (field: keyof Omit<PlannerState, 'setField' | 'toggleField' | 'resetForm'>, value: string | boolean) => void;
    toggleField: (field: 'detailedNavlog' | 'etops' | 'stepclimbs' | 'runwayAnalysis' | 'notams' | 'firNotams') => void;
    resetForm: () => void;
}

const defaults: Omit<PlannerState, 'setField' | 'toggleField' | 'resetForm'> = {
    airline: '',
    flightNumber: '',
    departure: '',
    arrival: '',
    alternate: '',
    departureTime: '',
    aircraftType: '',
    registration: '',
    selcal: '',
    atcCallsign: '',
    climbProfile: 'AUTO',
    cruiseProfile: 'AUTO',
    descentProfile: 'AUTO',
    ofpLayout: 'LIDO',
    units: 'kgs',
    flightRules: 'IFR',
    typeOfFlight: 'Scheduled',
    flightMaps: 'Detailed',
    alternatesCount: '1',
    taxiOut: '20',
    taxiIn: '8',
    detailedNavlog: true,
    etops: true,
    stepclimbs: true,
    runwayAnalysis: true,
    notams: true,
    firNotams: true,
    blockTimeHH: '',
    blockTimeMM: '',
    departureRunway: 'AUTO',
    arrivalRunway: 'AUTO',
    altitude: '',
    passengers: '',
    freight: '',
    payload: '',
    zeroFuelWeight: '',
};

export const usePlannerStore = create<PlannerState>()(
    persist(
        (set) => ({
            ...defaults,

            setField: (field, value) => set({ [field]: value } as Partial<PlannerState>),

            toggleField: (field) => set((state) => ({ [field]: !state[field] } as Partial<PlannerState>)),

            resetForm: () => set(defaults),
        }),
        { name: 'xpad-planner-storage' }
    )
);
