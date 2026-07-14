import React, { useEffect, useMemo, useRef } from 'react';
import { useOFPStore } from '../../stores/ofpStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { AlertTriangle, FileText } from 'lucide-react';

export const OFPModule: React.FC = () => {
    const { data, isLoading, error, fetchOFP } = useOFPStore();
    const { simbriefId } = useSettingsStore();

    useEffect(() => {
        if (simbriefId && !data && !isLoading && !error) {
            fetchOFP(simbriefId);
        }
    }, [fetchOFP, data, isLoading, error, simbriefId]);

    // Parse raw OFP text into lines
    const parsedLines = useMemo(() => {
        if (!data?.textOFP) return [];
        let text = data.textOFP;

        // If the text comes as HTML (contains <div> or <br>), convert block elements to newlines
        if (text.includes('<div') || text.includes('<br') || text.includes('<p')) {
            text = text.replace(/<\/(div|p|h[1-6])>/gi, '\n');
            text = text.replace(/<br\s*\/?>/gi, '\n');
            text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? '';
        } else {
            text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? text;
        }

        return text.split(/\r?\n/);
    }, [data?.textOFP]);

    const ofpContainerRef = useRef<HTMLDivElement>(null);

    const jumpToSection = (keywords: string[]) => {
        if (!parsedLines.length) return;
        const index = parsedLines.findIndex(line => {
            const cleanLine = line.replace(/[-=*_\[\]()]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
            if (!cleanLine) return false;

            return keywords.some(k => {
                const upperK = k.toUpperCase().replace(/[-=*_\[\]()]/g, '').trim();
                if (cleanLine === upperK) return true;
                if (upperK.endsWith(':') && cleanLine.startsWith(upperK)) return true;
                if (cleanLine.includes(upperK) && cleanLine.length < upperK.length + 10) return true;
                return false;
            });
        });

        if (index !== -1) {
            const el = document.getElementById(`ofp-line-${index}`);
            if (el) el.scrollIntoView({ block: 'start' });
        }
    };

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            <div className="flex-1 flex flex-col px-6 md:px-8 pt-4 pb-6 min-h-0 overflow-hidden">

                {error && (
                    <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red p-3 flex items-center gap-2 mb-4 shrink-0 text-sm font-bold uppercase">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {!data && !isLoading && !error && (
                    <div className="xp-empty flex-1">
                        <FileText className="w-16 h-16" />
                        <p className="text-lg font-bold uppercase tracking-wide">No active flight plan</p>
                        <p className="text-xs font-bold uppercase max-w-sm">
                            Configure your SimBrief ID in Settings and pull data from the Main Menu.
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className="xp-empty flex-1 text-text-primary">
                        Loading...
                    </div>
                )}

                {data && !isLoading && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
                        {/* Left Column: Navigation */}
                        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-2">
                            <div className="xp-panel">
                                <div className="xp-panel-header gap-2">
                                    <span className="xp-section-title">Quick Navigation</span>
                                </div>
                                <div className="p-3 grid grid-cols-1 gap-1.5">
                                    {[
                                        { label: 'Summary & Fuel',   keywords: ['OFP', 'DISPATCH', 'PLANNED FUEL'] },
                                        { label: 'Routing',          keywords: ['ROUTING:', 'RTE:'] },
                                        { label: 'Times & Weights',  keywords: ['TIMES', 'TIMES / WEIGHTS', 'LOAD/WEIGHTS', 'WEIGHTS'] },
                                        { label: 'Flight Log',       keywords: ['FLIGHT LOG'] },
                                        { label: 'Wind Info',        keywords: ['WIND INFORMATION', 'WIND INFO', 'WINDS'] },
                                        { label: 'ATC Flight Plan',  keywords: ['ATC FLIGHT PLAN', 'ATC CLEARANCE', 'FILED FLIGHT PLAN'] },
                                        { label: 'Additional Info',  keywords: ['ADDITIONAL INFO', 'DISPATCH REMARKS', 'REMARKS'] },
                                        { label: 'Runway Analysis',  keywords: ['RUNWAY ANALYSIS', 'TAKE-OFF', 'TAKEOFF'] },
                                        { label: 'Airport WX List',  keywords: ['AIRPORT WX LIST', 'WEATHER & NOTAM', 'WX/NOTAM', 'WEATHER', 'WX AND NOTAM'] },
                                        { label: 'NOTAMs',           keywords: ['NOTAMS', 'NOTAM'] },
                                        { label: 'Company NOTAM',    keywords: ['COMPANY NOTAM'] },
                                        { label: 'Weather Charts',   keywords: ['WEATHER CHARTS', 'CHARTS', 'SIGWX'] }
                                    ].map(section => (
                                        <button
                                            key={section.label}
                                            onClick={() => jumpToSection(section.keywords)}
                                            className="xp-btn-ghost w-full justify-center"
                                        >
                                            {section.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Flight Summary Card to utilize the column vertical space */}
                            <div className="xp-panel">
                                <div className="xp-panel-header">
                                    <span className="xp-section-title">Flight Summary</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="xp-overline text-[10px]">Callsign</span>
                                        <div className="text-base font-bold text-text-primary mt-0.5">
                                            {data.callsign || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="xp-overline text-[10px]">Aircraft</span>
                                        <div className="text-base font-bold text-text-primary mt-0.5">
                                            {data.aircraftType || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 border-t border-border-dark pt-2">
                                        <span className="xp-overline text-[10px]">Route</span>
                                        <div className="text-sm font-bold text-text-primary mt-0.5">
                                            {data.departure} → {data.arrival}
                                            {data.alternate && <span className="text-text-secondary"> (ALTN: {data.alternate})</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-2 border-t border-border-dark pt-2 grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="xp-overline text-[10px]">Altitude</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.cruiseFL ? `FL${data.cruiseFL}` : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="xp-overline text-[10px]">Planned Fuel</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.fuel ? `${data.fuel.toLocaleString()}` : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="xp-overline text-[10px]">Passengers</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.pax ? `${data.pax} PAX` : '0 PAX'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="xp-overline text-[10px]">Cost Index</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.costIndex || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 border-t border-border-dark pt-2 grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="xp-overline text-[10px]">Est. ZFW</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.zfw ? `${data.zfw.toLocaleString()}` : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="xp-overline text-[10px]">Est. TOW</span>
                                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                                {data.tow ? `${data.tow.toLocaleString()}` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Text OFP */}
                        <div className="flex-1 xp-panel flex flex-col overflow-hidden min-h-0">
                            <div className="xp-panel-header">
                                <h2 className="xp-section-title">Dispatch Release — Raw Text OFP</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pb-8 hide-scrollbar" ref={ofpContainerRef}>
                                <div className="font-mono text-sm md:text-base font-medium leading-relaxed text-text-secondary whitespace-pre-wrap mx-auto w-fit max-w-full">
                                    {parsedLines.map((line, i) => (
                                        <div key={i} id={`ofp-line-${i}`} className="min-h-[1.5em]">{line}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
