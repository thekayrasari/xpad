import React, { useEffect, useMemo, useRef } from 'react';
import { useOFPStore } from '../../stores/ofpStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { AlertTriangle, FileText, Fuel, Plane, AlignLeft } from 'lucide-react';

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
        // before using DOMParser, so that we don't squash lines together.
        if (text.includes('<div') || text.includes('<br') || text.includes('<p')) {
            text = text.replace(/<\/(div|p|h[1-6])>/gi, '\n');
            text = text.replace(/<br\s*\/?>/gi, '\n');
            text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? '';
        } else {
            // It might have HTML entities like &nbsp; even if it doesn't have divs
            text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? text;
        }
        
        return text.split(/\r?\n/);
    }, [data?.textOFP]);

    const ofpContainerRef = useRef<HTMLDivElement>(null);

    const jumpToSection = (keywords: string[]) => {
        if (!parsedLines.length) return;
        const index = parsedLines.findIndex(line => {
            // Strip dashes, equals, asterisks, underscores, brackets, and parens
            const cleanLine = line.replace(/[-=*_\[\]()]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
            if (!cleanLine) return false;
            
            return keywords.some(k => {
                const upperK = k.toUpperCase().replace(/[-=*_\[\]()]/g, '').trim();
                // Match exact cleaned line
                if (cleanLine === upperK) return true;
                // For keywords ending with colon like "ROUTING:"
                if (upperK.endsWith(':') && cleanLine.startsWith(upperK)) return true;
                // Generic contains check, but only if the line isn't too long (avoids matching regular text paragraphs)
                if (cleanLine.includes(upperK) && cleanLine.length < upperK.length + 10) return true;
                
                return false;
            });
        });
        
        if (index !== -1) {
            const el = document.getElementById(`ofp-line-${index}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };



    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            <div className="flex-1 flex flex-col px-6 md:px-8 pt-4 pb-6 min-h-0 overflow-hidden">
                {error && (
                    <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red p-4 rounded-md flex items-center gap-3 mb-6 shrink-0 font-bold uppercase">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

            {!data && !isLoading && !error && (
                <div className="flex-1 flex items-center justify-center text-text-secondary text-center flex-col gap-3">
                    <FileText className="w-16 h-16 opacity-20" />
                    <p className="text-lg font-bold uppercase tracking-wide">No active flight plan</p>
                    <p className="text-xs font-bold uppercase max-w-sm">Configure your SimBrief ID in Settings and pull data from the Main Menu.</p>
                </div>
            )}

            {isLoading && (
                <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden opacity-60 animate-pulse">
                    {/* Left Column: Summary */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                        <div className="glass-panel p-5 text-center h-[104px] bg-white/[0.02] border-white/[0.05]"></div>

                        {/* Aircraft & Fuel */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-panel p-4 h-[76px] bg-white/[0.02] border-white/[0.05]"></div>
                            <div className="glass-panel p-4 h-[76px] bg-white/[0.02] border-white/[0.05]"></div>
                        </div>

                        {/* Additional Info */}
                        <div className="glass-panel p-4 space-y-3 h-[148px] bg-white/[0.02] border-white/[0.05]"></div>
                    </div>

                    {/* Right Column: Text OFP */}
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden min-h-0 bg-white/[0.02] border-white/[0.05]"></div>
                </div>
            )}

            {data && !isLoading && (
                <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
                    {/* Left Column: Summary */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-2">
                        <div className="glass-panel p-5 text-center shrink-0">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <span className="text-4xl font-black text-text-primary tracking-tighter">{data.departure}</span>
                                <Plane className="w-6 h-6 text-accent-blue opacity-80" />
                                <span className="text-4xl font-black text-text-primary tracking-tighter">{data.arrival}</span>
                            </div>
                            {data.alternate && <div className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-black/20 py-1.5 rounded-md inline-block px-4 border border-white/[0.05]">ALTN: <span className="text-accent-orange">{data.alternate}</span></div>}
                        </div>

                        {/* Aircraft & Fuel */}
                        <div className="grid grid-cols-2 gap-3 shrink-0">
                            <div className="glass-panel p-4">
                                <div className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Plane className="w-3.5 h-3.5 text-accent-purple" /> Aircraft
                                </div>
                                <div className="text-xl font-bold text-text-primary">{data.aircraftType}</div>
                            </div>
                            <div className="glass-panel p-4">
                                <div className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Fuel className="w-3.5 h-3.5 text-accent-green" /> Block Fuel
                                </div>
                                <div className="text-xl font-bold text-text-primary">{data.fuel.toLocaleString()} <span className="text-xs text-text-secondary">LBS</span></div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="glass-panel p-4 space-y-3 shrink-0">
                            <div className="flex justify-between items-center text-sm font-bold border-b border-white/[0.05] pb-2">
                                <span className="text-text-secondary">PAX</span>
                                <span className="text-text-primary">{data.pax || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold border-b border-white/[0.05] pb-2">
                                <span className="text-text-secondary">ZFW</span>
                                <span className="text-text-primary">{(data.zfw || 0).toLocaleString()} <span className="text-xs font-normal text-text-secondary/70">LBS</span></span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold border-b border-white/[0.05] pb-2">
                                <span className="text-text-secondary">TOW</span>
                                <span className="text-text-primary">{(data.tow || 0).toLocaleString()} <span className="text-xs font-normal text-text-secondary/70">LBS</span></span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-text-secondary">Waypoints</span>
                                <span className="text-text-primary">{data.waypoints.length} Fixes</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="glass-panel p-4 flex flex-col gap-3 shrink-0">
                            <div className="text-xs text-text-secondary font-bold uppercase tracking-widest flex items-center gap-2">
                                <AlignLeft className="w-3.5 h-3.5 text-accent-blue" /> Quick Navigation
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Summary & Fuel', keywords: ['OFP', 'DISPATCH', 'PLANNED FUEL'] },
                                    { label: 'Additional Info', keywords: ['ADDITIONAL INFO', 'DISPATCH REMARKS', 'REMARKS'] },
                                    { label: 'Routing', keywords: ['ROUTING:', 'RTE:'] },
                                    { label: 'Runway Analysis', keywords: ['RUNWAY ANALYSIS', 'TAKE-OFF', 'TAKEOFF'] },
                                    { label: 'Times & Weights', keywords: ['TIMES', 'TIMES / WEIGHTS', 'LOAD/WEIGHTS', 'WEIGHTS'] },
                                    { label: 'Airport WX List', keywords: ['AIRPORT WX LIST', 'WEATHER & NOTAM', 'WX/NOTAM', 'WEATHER', 'WX AND NOTAM'] },
                                    { label: 'Flight Log', keywords: ['FLIGHT LOG'] },
                                    { label: 'NOTAMs', keywords: ['NOTAMS', 'NOTAM'] },
                                    { label: 'Wind Info', keywords: ['WIND INFORMATION', 'WIND INFO', 'WINDS'] },
                                    { label: 'Company NOTAM', keywords: ['COMPANY NOTAM'] },
                                    { label: 'ATC Flight Plan', keywords: ['ATC FLIGHT PLAN', 'ATC CLEARANCE', 'FILED FLIGHT PLAN'] },
                                    { label: 'Weather Charts', keywords: ['WEATHER CHARTS', 'CHARTS', 'SIGWX'] }
                                ].map(section => (
                                    <button
                                        key={section.label}
                                        onClick={() => jumpToSection(section.keywords)}
                                        className="px-2 py-2 bg-black/20 hover:bg-white/[0.05] border border-white/[0.05] text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 text-center flex items-center justify-center"
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Text OFP */}
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden min-h-0 relative">
                        <div className="p-3 border-b border-white/[0.05] bg-black/20 flex items-center justify-between gap-4 rounded-t-2xl shrink-0">
                            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" /> Dispatch Release — Raw Text OFP
                            </h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 pb-8 hide-scrollbar relative" ref={ofpContainerRef}>
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
