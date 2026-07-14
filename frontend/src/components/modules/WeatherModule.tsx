import React, { useEffect } from 'react';
import { useWeatherStore, type FlightCategory } from '../../stores/weatherStore';
import { useOFPStore } from '../../stores/ofpStore';
import { Cloud, RefreshCw, AlertTriangle, Wind, Eye, Thermometer } from 'lucide-react';

// ── Flight category helpers ───────────────────────────────────────────────────
const catConfig: Record<FlightCategory, { label: string; color: string; border: string; bg: string }> = {
    VFR:     { label: 'VFR',   color: 'text-accent-green',  border: 'border-accent-green/40',  bg: 'bg-accent-green/10' },
    MVFR:    { label: 'MVFR',  color: 'text-accent-blue',   border: 'border-accent-blue/40',   bg: 'bg-accent-blue/10' },
    IFR:     { label: 'IFR',   color: 'text-accent-red',    border: 'border-accent-red/40',    bg: 'bg-accent-red/10' },
    LIFR:    { label: 'LIFR',  color: 'text-accent-purple', border: 'border-accent-purple/40', bg: 'bg-accent-purple/10' },
    UNKNOWN: { label: '- - -', color: 'text-text-secondary', border: 'border-border-dark',     bg: 'bg-nav-bg' },
};

function windDirToCompass(deg: number | null): string {
    if (deg === null) return '---';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
}

// ── TAF parser/decoder helpers ────────────────────────────────────────────────
function splitTafIntoPeriods(tafText: string): string[] {
    const cleanText = tafText.replace(/\s+/g, ' ').trim();
    // Split before FM, TEMPO, BECMG, PROB
    const parts = cleanText.split(/\s(?=(?:FM\d{6}|TEMPO\s|BECMG\s|PROB\d{2}\s))/i);
    return parts.filter(Boolean);
}

interface DecodedTafPeriod {
    type: string;
    period: string;
    wind: string;
    visibility: string;
    clouds: string;
    wx: string;
    rawText: string;
}

function parseTafLine(line: string): DecodedTafPeriod | null {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length === 0) return null;

    let type = 'BASE';
    let period = '';
    let wind = '---';
    let visibility = '---';
    let clouds: string[] = [];
    let wx = '';

    let tokenIndex = 0;
    const firstToken = tokens[0].toUpperCase();

    if (firstToken === 'TAF') {
        type = 'BASE';
        tokenIndex = 2; // skip TAF and ICAO
        const validity = tokens[3] || '';
        if (validity.includes('/')) {
            period = validity;
            tokenIndex = 4;
        }
    } else if (firstToken.startsWith('FM')) {
        type = 'FROM';
        const timePart = firstToken.substring(2);
        if (timePart.length === 6) {
            period = `${timePart.substring(2, 4)}:${timePart.substring(4, 6)}Z`;
        } else {
            period = firstToken;
        }
        tokenIndex = 1;
    } else if (firstToken === 'TEMPO') {
        type = 'TEMPO';
        period = tokens[1] || '';
        tokenIndex = 2;
    } else if (firstToken === 'BECMG') {
        type = 'BECMG';
        period = tokens[1] || '';
        tokenIndex = 2;
    } else if (firstToken.startsWith('PROB')) {
        type = firstToken;
        period = tokens[1] || '';
        tokenIndex = 2;
    }

    for (let i = tokenIndex; i < tokens.length; i++) {
        const token = tokens[i].toUpperCase();

        if (token.endsWith('KT')) {
            const match = token.match(/^(\d{3}|VRB)(\d{2})(G\d{2})?KT$/);
            if (match) {
                const dir = match[1];
                const speed = match[2];
                const gust = match[3] ? ` G${match[3].substring(1)}` : '';
                wind = `${dir === 'VRB' ? 'VRB' : dir + '°'}@${speed}${gust}kt`;
            } else {
                wind = token.toLowerCase();
            }
        }
        else if (token.endsWith('SM')) {
            visibility = token.replace('SM', ' SM');
        } else if (token === '9999') {
            visibility = '>10 km';
        } else if (token === 'CAVOK') {
            visibility = '>10 km';
            clouds.push('CAVOK');
        }
        else if (token.match(/^(FEW|SCT|BKN|OVC)\d{3}/)) {
            const typeWord = token.substring(0, 3);
            const baseFt = parseInt(token.substring(3), 10) * 100;
            clouds.push(`${typeWord} ${baseFt.toLocaleString()}ft`);
        } else if (token === 'SKC' || token === 'CLR' || token === 'NSC') {
            clouds.push('CLR');
        }
        else if (token.match(/^[-+]?(TS|SH|DZ|RA|SN|SG|PL|GR|GS|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)+$/)) {
            wx = token;
        }
    }

    return {
        type,
        period,
        wind,
        visibility,
        clouds: clouds.length > 0 ? clouds.join(', ') : 'CLR',
        wx,
        rawText: line
    };
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
        <div className="xp-panel overflow-hidden">
            {/* Header */}
            <div className="xp-panel-header justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold tracking-wide uppercase text-text-primary">{icao.toUpperCase()}</span>
                    <span className="xp-section-title">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {metar && metar.flightCategory !== 'UNKNOWN' && (
                        <span className={`xp-badge ${cat.color} ${cat.border} ${cat.bg}`}>
                            {cat.label}
                        </span>
                    )}
                    <button
                        onClick={() => fetchWeather(icao, true)}
                        disabled={station?.isLoading}
                        className="xp-btn-ghost p-1.5 disabled:opacity-40"
                    >
                        <RefreshCw className="w-4 h-4 text-accent-blue" />
                    </button>
                </div>
            </div>

            {station?.isLoading && (
                <div className="p-5 text-center text-text-primary">Loading...</div>
            )}

            {station?.error && !station.isLoading && (
                <div className="p-4 flex items-center gap-2 text-accent-red text-sm font-bold uppercase">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {station.error}
                </div>
            )}

            {metar && !station?.isLoading && (
                <div className="p-4 space-y-4">
                    {/* Key stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="xp-panel p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Wind className="w-3.5 h-3.5" />
                                <span className="xp-overline">Wind</span>
                            </div>
                            <div className="text-base font-bold text-text-primary">
                                {metar.windDir !== null ? `${String(metar.windDir).padStart(3,'0')}°` : 'VRB'}
                                {' '}{metar.windSpeedKt ?? '--'}kt
                            </div>
                            {metar.windGustKt && (
                                <div className="text-xs font-bold text-accent-red mt-0.5">G{metar.windGustKt}kt</div>
                            )}
                            <div className="text-xs font-bold text-text-secondary mt-0.5">{windDirToCompass(metar.windDir)}</div>
                        </div>

                        <div className="xp-panel p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                <span className="xp-overline">Visibility</span>
                            </div>
                            <div className="text-base font-bold text-text-primary">
                                {metar.visibilitySm !== null ? `${metar.visibilitySm} sm` : '---'}
                            </div>
                        </div>

                        <div className="xp-panel p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Cloud className="w-3.5 h-3.5" />
                                <span className="xp-overline">Ceiling</span>
                            </div>
                            <div className="text-base font-bold text-text-primary">
                                {metar.ceilingFt !== null ? `${metar.ceilingFt.toLocaleString()} ft` : 'CLR'}
                            </div>
                        </div>

                        <div className="xp-panel p-3">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1.5">
                                <Thermometer className="w-3.5 h-3.5" />
                                <span className="xp-overline">Temp / Dew</span>
                            </div>
                            <div className="text-base font-bold text-text-primary">
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
                        <div className="xp-badge text-accent-orange border-accent-orange/30 bg-accent-orange/10 px-3 py-1.5">
                            {metar.wxString}
                        </div>
                    )}

                    {/* Raw METAR */}
                    <div>
                        <div className="xp-overline mb-1.5">Raw METAR</div>
                        <pre className="text-xs bg-nav-bg border border-border-dark p-3 text-text-secondary whitespace-pre-wrap">
                            {metar.raw}
                        </pre>
                    </div>

                    {/* TAF */}
                    {taf && (
                        <div className="pt-2 border-t border-border-dark">
                            <div className="xp-overline mb-2">Decoded TAF Forecast</div>
                            <div className="space-y-2">
                                {splitTafIntoPeriods(taf.raw).map((periodText, index) => {
                                    const parsed = parseTafLine(periodText);
                                    if (!parsed) return null;

                                    let badgeColor = 'text-accent-green border-accent-green/30 bg-accent-green/10';
                                    if (parsed.type === 'FROM') {
                                        badgeColor = 'text-accent-blue border-accent-blue/30 bg-accent-blue/10';
                                    } else if (parsed.type === 'TEMPO') {
                                        badgeColor = 'text-accent-orange border-accent-orange/30 bg-accent-orange/10';
                                    } else if (parsed.type === 'BECMG') {
                                        badgeColor = 'text-accent-purple border-accent-purple/30 bg-accent-purple/10';
                                    } else if (parsed.type.startsWith('PROB')) {
                                        badgeColor = 'text-accent-red border-accent-red/30 bg-accent-red/10';
                                    }

                                    return (
                                        <div key={index} className="xp-panel p-2.5 text-xs flex flex-col md:flex-row md:items-center gap-3">
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`xp-badge text-[10px] px-1.5 py-0.5 font-black tracking-wider uppercase ${badgeColor}`}>
                                                    {parsed.type}
                                                </span>
                                                <span className="font-bold text-text-primary text-[11px] shrink-0">
                                                    {parsed.period}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-text-secondary">
                                                <div>
                                                    <span className="text-[9px] uppercase tracking-wider block text-text-secondary/60">Wind</span>
                                                    <span className="font-bold text-text-primary">{parsed.wind}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] uppercase tracking-wider block text-text-secondary/60">Visibility</span>
                                                    <span className="font-bold text-text-primary">{parsed.visibility}</span>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <span className="text-[9px] uppercase tracking-wider block text-text-secondary/60">Clouds</span>
                                                    <span className="font-bold text-text-primary truncate block" title={parsed.clouds}>{parsed.clouds}</span>
                                                </div>
                                            </div>

                                            {parsed.wx && (
                                                <span className="xp-badge text-accent-orange border-accent-orange/20 bg-accent-orange/5 self-start md:self-auto">
                                                    {parsed.wx}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="xp-overline mb-1.5 mt-4">Raw TAF</div>
                            <pre className="text-xs bg-nav-bg border border-border-dark p-3 text-text-secondary whitespace-pre-wrap">
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

    const departure  = ofpData?.departure ?? '';
    const arrival    = ofpData?.arrival ?? '';
    const alternate  = ofpData?.alternate ?? '';

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary overflow-hidden">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-6">
                {!departure && !arrival && (
                    <div className="xp-empty py-20">
                        <Cloud className="w-16 h-16" />
                        <p className="text-lg font-bold uppercase">No active flight plan</p>
                        <p className="text-sm max-w-sm">
                            Load an OFP in the OFP module to automatically fetch departure, destination, and alternate weather.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {departure && <StationCard icao={departure} label="Departure" />}
                    {arrival   && <StationCard icao={arrival}   label="Destination" />}
                    {alternate && <StationCard icao={alternate} label="Alternate" />}
                </div>
            </div>
        </div>
    );
};
