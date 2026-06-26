import { create } from 'zustand';
import { BACKEND_URL } from '../config';

export type FlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNKNOWN';

export interface MetarData {
    raw: string;
    station: string;
    obsTime: string;
    tempC: number | null;
    dewpointC: number | null;
    windDir: number | null;
    windSpeedKt: number | null;
    windGustKt: number | null;
    visibilitySm: number | null;
    altimeterInHg: number | null;
    flightCategory: FlightCategory;
    ceilingFt: number | null;
    wxString: string;
}

export interface TafData {
    raw: string;
    station: string;
}

export interface StationWeather {
    icao: string;
    metar: MetarData | null;
    taf: TafData | null;
    fetchedAt: number;
    isLoading: boolean;
    error: string | null;
}

interface WeatherStoreState {
    stations: Record<string, StationWeather>;
    fetchWeather: (icao: string) => Promise<void>;
    clearStation: (icao: string) => void;
}

const CACHE_MS = 30 * 60 * 1000; // 30 minutes

interface AWCCloud {
    cover?: string;
    base?: number;
}

interface AWCRaw {
    flightCategory?: string;
    clouds?: AWCCloud[];
    rawOb?: string;
    raw_text?: string;
    icaoId?: string;
    station_id?: string;
    obsTime?: string;
    observation_time?: string;
    temp?: number;
    temp_c?: number;
    dewp?: number;
    dewpoint_c?: number;
    wdir?: string | number;
    wind_dir_degrees?: number;
    wspd?: number;
    wind_speed_kt?: number;
    wgst?: number;
    wind_gust_kt?: number;
    visib?: number;
    visibility_statute_mi?: number;
    altim?: number;
    altim_in_hg?: number;
    wxString?: string;
    wx_string?: string;
    rawTAF?: string;
}

function parseMetar(raw: AWCRaw): MetarData {
    // AWC API v2 field names differ from v1
    // v2: temp, dewp, wdir, wspd, wgst, visib, altim, rawOb, icaoId, flightCategory
    // clouds is an array of { cover, base } objects
    const flightCat = (raw.flightCategory ?? 'UNKNOWN') as FlightCategory;
    const clouds: AWCCloud[] = raw.clouds ?? [];

    // Find lowest ceiling (BKN or OVC layer)
    let ceilingFt: number | null = null;
    for (const cloud of clouds) {
        if (cloud.cover === 'BKN' || cloud.cover === 'OVC') {
            const base = cloud.base ?? null;
            if (base !== null && (ceilingFt === null || base < ceilingFt)) {
                ceilingFt = base;
            }
        }
    }

    return {
        raw: raw.rawOb ?? raw.raw_text ?? '',
        station: raw.icaoId ?? raw.station_id ?? '',
        obsTime: raw.obsTime ?? raw.observation_time ?? '',
        tempC: raw.temp ?? raw.temp_c ?? null,
        dewpointC: raw.dewp ?? raw.dewpoint_c ?? null,
        windDir: raw.wdir === 'VRB' ? null : (raw.wdir !== undefined && raw.wdir !== null ? Number(raw.wdir) : (raw.wind_dir_degrees !== undefined && raw.wind_dir_degrees !== null ? Number(raw.wind_dir_degrees) : null)),
        windSpeedKt: raw.wspd ?? raw.wind_speed_kt ?? null,
        windGustKt: raw.wgst ?? raw.wind_gust_kt ?? null,
        visibilitySm: raw.visib ?? raw.visibility_statute_mi ?? null,
        altimeterInHg: raw.altim ?? raw.altim_in_hg ?? null,
        flightCategory: flightCat,
        ceilingFt,
        wxString: raw.wxString ?? raw.wx_string ?? '',
    };
}

export const useWeatherStore = create<WeatherStoreState>((set, get) => ({
    stations: {},

    fetchWeather: async (icao: string) => {
        const upper = icao.toUpperCase();

        // Check cache
        const existing = get().stations[upper];
        if (existing && !existing.isLoading && Date.now() - existing.fetchedAt < CACHE_MS) {
            return;
        }

        set(state => ({
            stations: {
                ...state.stations,
                [upper]: {
                    icao: upper,
                    metar: existing?.metar ?? null,
                    taf: existing?.taf ?? null,
                    fetchedAt: existing?.fetchedAt ?? 0,
                    isLoading: true,
                    error: null,
                },
            },
        }));

        try {

            const [metarRes, tafRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/weather/metar?ids=${upper}`),
                fetch(`${BACKEND_URL}/api/weather/taf?ids=${upper}`),
            ]);

            const metarJson: AWCRaw[] = metarRes.ok ? await metarRes.json() : [];
            const tafJson: AWCRaw[] = tafRes.ok ? await tafRes.json() : [];

            const metar = metarJson.length > 0 ? parseMetar(metarJson[0]) : null;
            const taf: TafData | null = tafJson.length > 0
                ? {
                    raw: tafJson[0].rawTAF ?? tafJson[0].raw_text ?? '',
                    station: tafJson[0].icaoId ?? tafJson[0].station_id ?? upper
                  }
                : null;

            set(state => ({
                stations: {
                    ...state.stations,
                    [upper]: {
                        icao: upper,
                        metar,
                        taf,
                        fetchedAt: Date.now(),
                        isLoading: false,
                        error: metar === null ? `No METAR data found for ${upper}` : null,
                    },
                },
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch weather';
            set(state => ({
                stations: {
                    ...state.stations,
                    [upper]: {
                        ...state.stations[upper],
                        isLoading: false,
                        error: message,
                    },
                },
            }));
        }
    },

    clearStation: (icao: string) => {
        set(state => {
            const next = { ...state.stations };
            delete next[icao.toUpperCase()];
            return { stations: next };
        });
    },
}));
