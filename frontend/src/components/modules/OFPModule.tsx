import React, { useEffect, useMemo } from 'react';
import { useOFPStore } from '../../stores/ofpStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { AlertTriangle, FileText, Fuel, Plane } from 'lucide-react';

export const OFPModule: React.FC = () => {
    const { data, isLoading, error, fetchOFP } = useOFPStore();
    const { simbriefId } = useSettingsStore();

    useEffect(() => {
        if (simbriefId && !data && !isLoading && !error) {
            fetchOFP(simbriefId);
        }
    }, [fetchOFP, data, isLoading, error, simbriefId]);



    // Memoize expensive HTML sanitization — only recomputes when textOFP changes
    const cleanOFP = useMemo(() => {
        if (!data?.textOFP) return '';
        return new DOMParser().parseFromString(data.textOFP, 'text/html').body.textContent ?? '';
    }, [data?.textOFP]);



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

            {data && (
                <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
                    {/* Left Column: Summary */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                        <div className="glass-panel p-5 text-center">
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <span className="text-4xl font-black text-text-primary tracking-tighter">{data.departure}</span>
                                <Plane className="w-6 h-6 text-accent-blue opacity-80" />
                                <span className="text-4xl font-black text-text-primary tracking-tighter">{data.arrival}</span>
                            </div>
                            {data.alternate && <div className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-black/20 py-1.5 rounded-md inline-block px-4 border border-white/[0.05]">ALTN: <span className="text-accent-orange">{data.alternate}</span></div>}
                        </div>

                        {/* Aircraft & Fuel */}
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="glass-panel p-4 space-y-3">
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
                    </div>

                    {/* Right Column: Text OFP */}
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden min-h-0">
                        <div className="p-3 border-b border-white/[0.05] bg-black/20 flex items-center justify-between gap-4 rounded-t-2xl shrink-0">
                            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Dispatch Release — Raw Text OFP</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 pb-8 hide-scrollbar">
                            <pre className="text-xs font-bold leading-relaxed text-text-secondary whitespace-pre-wrap">{cleanOFP}</pre>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
