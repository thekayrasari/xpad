import React, { useEffect, useState } from 'react';
import { useWeatherStore, type FlightCategory } from '../../stores/weatherStore';
import { useOFPStore } from '../../stores/ofpStore';
import { Cloud, RefreshCw, AlertTriangle, Wind, Eye, Thermometer, Search } from 'lucide-react';

// ── Flight category helpers ───────────────────────────────────────────────────
const catConfig: Record<FlightCategory, { label: string; color: string; glow: string }> = {
    VFR:     { label: 'VFR',     color: 'text-accent-green',    glow: 'shadow-[0_0_12px_var(--color-accent-green)]' },
    MVFR:    { label: 'MVFR',    color: 'text-accent-blue',     glow: 'shadow-[0_0_12px_var(--color-accent-blue)]' },
    IFR:     { label: 'IFR',     color: 'text-accent-red',      glow: 'shadow-[0_0_12px_var(--color-accent-red)]' },
    LIFR:    { label: 'LIFR',    color: 'text-accent-purple',    glow: 'shadow-[0_0_12px_var(--color-accent-purple)]' },
    UNKNOWN: { label: '- - -',   color: 'text-text-secondary', glow: '' },
};

function windDirToCompass(deg: number | null): string {
    if (deg === null) return '---';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
}

// ── Single station card ───────────────────────────────────────────────────────
const StationCard: React.FC<{ icao: string; label: string }> = ({ icao, label }) => {
    const { stations, fetchWeather } = useWeatherStore();
    const station = stations[icao.toUpperCase()];
    const metar = station?.metar ?? null;
    const taf = station?.taf ?? null;
    const cat = catConfig[metar?.flightCategory ?? 'UNKNOWN'];

    useEffect(() => {
        if (icao) fetchWeather(icao);
    }, [icao, fetchWeather]);

    return (
        <div className="glass-panel overflow-hidden mb-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05] bg-black/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-extrabold tracking-wide uppercase text-text-primary">{icao.toUpperCase()}</span>
                    <span className="text-xs font-bold uppercase text-text-secondary">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    {metar && (
                        <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase border ${
                            metar.flightCategory === 'VFR'  ? 'border-accent-green/40 bg-accent-green/10 text-accent-green' :
                            metar.flightCategory === 'MVFR' ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue' :
                            metar.flightCategory === 'IFR'  ? 'border-accent-red/40 bg-accent-red/10 text-accent-red' :
                            metar.flightCategory === 'LIFR' ? 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple' :
                            'border-white/[0.1] bg-white/5 text-text-secondary'
                        } ${cat.glow}`}>
                            {cat.label}
                        </div>
                    )}
                    <button
                        onClick={() => fetchWeather(icao)}
                        disabled={station?.isLoading}
                        className="glass-button p-2 text-accent-blue hover:text-accent-blue/80 transition-all active:scale-95 disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${station?.isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {station?.isLoading && (
                <div className="p-6 text-center text-text-secondary text-sm font-bold uppercase">Fetching weather data...</div>
            )}

            {station?.error && !station.isLoading && (
                <div className="p-4 flex items-center gap-3 text-accent-red text-sm font-bold uppercase">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {station.error}
                </div>
            )}

            {metar && !station?.isLoading && (
                <div className="p-4 space-y-4">
                    {/* Key stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="glass-button p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Wind className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Wind</span>
                            </div>
                            <div className="text-base font-bold font-sans text-text-primary">
                                {metar.windDir !== null ? `${String(metar.windDir).padStart(3,'0')}°` : 'VRB'}
                                {' '}{metar.windSpeedKt ?? '--'}kt
                            </div>
                            {metar.windGustKt && (
                                <div className="text-xs font-bold text-accent-red mt-0.5">G{metar.windGustKt}kt</div>
                            )}
                            <div className="text-xs font-bold text-text-secondary mt-0.5">{windDirToCompass(metar.windDir)}</div>
                        </div>

                        <div className="glass-button p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Visibility</span>
                            </div>
                            <div className="text-base font-bold font-sans text-text-primary">
                                {metar.visibilitySm !== null ? `${metar.visibilitySm} sm` : '---'}
                            </div>
                        </div>

                        <div className="glass-button p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Cloud className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Ceiling</span>
                            </div>
                            <div className="text-base font-bold font-sans text-text-primary">
                                {metar.ceilingFt !== null ? `${metar.ceilingFt.toLocaleString()} ft` : 'CLR'}
                            </div>
                        </div>

                        <div className="glass-button p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Thermometer className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Temp / Dew</span>
                            </div>
                            <div className="text-base font-bold font-sans text-text-primary">
                                {metar.tempC ?? '--'}° / {metar.dewpointC ?? '--'}°
                            </div>
                            {metar.altimeterInHg && (
                                <div className="text-xs font-bold text-text-secondary mt-0.5">
                                    {metar.altimeterInHg.toFixed(2)} inHg
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Present weather */}
                    {metar.wxString && (
                        <div className="text-sm font-bold text-accent-orange bg-black/20 px-3 py-2 rounded-md border border-white/[0.05]">
                            {metar.wxString}
                        </div>
                    )}

                    {/* Raw METAR */}
                    <div>
                        <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">Raw METAR</div>
                        <pre className="text-xs bg-black/30 p-3 rounded-md border border-white/[0.05] text-text-secondary whitespace-pre-wrap">
                            {metar.raw}
                        </pre>
                    </div>

                    {/* TAF */}
                    {taf && (
                        <div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5 mt-4">TAF</div>
                            <pre className="text-xs bg-black/30 p-3 rounded-md border border-white/[0.05] text-text-secondary whitespace-pre-wrap">
                                {taf.raw}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Weather Module ───────────────────────────────────────────────────────
export const WeatherModule: React.FC = () => {
    const ofpData = useOFPStore(s => s.data);
    const [customIcao, setCustomIcao] = useState('');
    const [searchedIcao, setSearchedIcao] = useState<string | null>(null);

    const departure = ofpData?.departure ?? '';
    const arrival = ofpData?.arrival ?? '';
    const alternate = ofpData?.alternate ?? '';

    const handleSearch = () => {
        const trimmed = customIcao.trim().toUpperCase();
        if (trimmed.length >= 3) setSearchedIcao(trimmed);
    };

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary overflow-hidden">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-6 space-y-5">
                {/* OFP stations */}
                {!departure && !arrival && (
                    <div className="flex flex-col items-center justify-center text-center text-text-secondary gap-3 py-20">
                        <Cloud className="w-16 h-16 opacity-20" />
                        <p className="text-lg font-bold uppercase">No active flight plan</p>
                        <p className="text-sm max-w-sm font-bold">Load an OFP in the OFP module to automatically fetch departure and destination weather, or search an ICAO below.</p>
                    </div>
                )}

                {departure && <StationCard icao={departure} label="Departure" />}
                {arrival && <StationCard icao={arrival} label="Destination" />}
                {alternate && <StationCard icao={alternate} label="Alternate" />}

                {/* Custom searched station */}
                {searchedIcao && searchedIcao !== departure && searchedIcao !== arrival && searchedIcao !== alternate && (
                    <StationCard icao={searchedIcao} label="Custom Search" />
                )}
            </div>

            {/* ── Bottom Toolbar ── */}
            <div className="shrink-0 px-6 md:px-8 py-4 border-t border-white/[0.05] bg-black/20 flex items-center justify-end z-10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customIcao}
                        onChange={e => setCustomIcao(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="ICAO (e.g. EGLL)"
                        maxLength={4}
                        className="w-36 bg-black/20 border border-white/[0.1] rounded-md px-3 py-2 text-sm font-bold uppercase text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    />
                    <button
                        onClick={handleSearch}
                        className="glass-button flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase text-accent-blue hover:text-accent-blue/80 transition-all active:scale-95 shadow-xl border border-white/[0.05]"
                    >
                        <Search className="w-4 h-4" /> Fetch
                    </button>
                </div>
            </div>
        </div>
    );
};
