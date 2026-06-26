import React, { useState } from 'react';
import { useUIStore, type ModuleType } from '../../stores/uiStore';
import { useOFPStore } from '../../stores/ofpStore';
import { useWeatherStore } from '../../stores/weatherStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Plane, FileText, MessageSquare, Cloud, BookOpen, FileEdit, ClipboardList, Settings, Map as MapIcon, Globe, RefreshCw, AlertTriangle } from 'lucide-react';

const apps: { id: ModuleType; label: string; icon: React.FC<any>; color: string }[] = [
    { id: 'ofp', label: 'OFP', icon: FileText, color: 'text-accent-teal' },

    { id: 'pdf', label: 'Manuals', icon: BookOpen, color: 'text-accent-orange' },
    { id: 'map', label: 'Map', icon: MapIcon, color: 'text-accent-blue' },
    { id: 'weather', label: 'Weather', icon: Cloud, color: 'text-text-primary' },
    { id: 'aoc', label: 'Dispatch', icon: MessageSquare, color: 'text-accent-purple' },
    { id: 'planner', label: 'Planner', icon: ClipboardList, color: 'text-accent-green' },
    { id: 'notes', label: 'Notes', icon: FileEdit, color: 'text-accent-orange' },
    { id: 'fenix', label: 'Fenix EFB', icon: Plane, color: 'text-accent-blue' },
    { id: 'links', label: 'Links', icon: Globe, color: 'text-accent-green' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-text-secondary' },
];

export const HomeModule: React.FC = () => {
    const { setActiveModule } = useUIStore();
    const { fetchOFP, isLoading: isOfpLoading } = useOFPStore();
    const { fetchWeather } = useWeatherStore();
    const { simbriefId } = useSettingsStore();
    const [localError, setLocalError] = useState<string | null>(null);

    const handlePullFlightData = async () => {
        if (!simbriefId) {
            setLocalError('Please configure your SimBrief ID in Settings first.');
            return;
        }
        setLocalError(null);
        await fetchOFP(simbriefId);
        
        const latestData = useOFPStore.getState().data;
        if (latestData) {
            if (latestData.departure) fetchWeather(latestData.departure);
            if (latestData.arrival) fetchWeather(latestData.arrival);
            if (latestData.alternate) fetchWeather(latestData.alternate);
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative animate-page-enter">
            {/* Massive Centered Header */}
            <div className="flex flex-col items-center justify-end flex-1 pb-12 pt-8">
                <div className="flex items-baseline gap-[2px] mb-4">
                    <span className="font-sans font-light text-[5rem] md:text-[7rem] tracking-widest text-text-primary leading-none">x</span>
                    <span className="font-sans font-bold text-[5rem] md:text-[7rem] tracking-widest text-text-primary leading-none">Pad</span>
                </div>
                <p className="text-text-secondary font-medium tracking-[0.2em] uppercase text-xs md:text-sm mb-8">Welcome to your EFB</p>
                
                <div className="flex flex-col items-center">
                    <button 
                        onClick={handlePullFlightData}
                        disabled={isOfpLoading}
                        className="glass-button flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] text-sm font-bold uppercase text-accent-blue hover:text-accent-blue/80 transition-all active:scale-95 disabled:opacity-50 shadow-2xl border border-white/[0.05]"
                    >
                        <RefreshCw className={`w-4 h-4 ${isOfpLoading ? 'animate-spin' : ''}`} />
                        {isOfpLoading ? 'Pulling Data...' : 'Pull Flight Data'}
                    </button>
                    {localError && (
                        <div className="flex items-center gap-2 mt-4 text-accent-red text-xs font-bold uppercase bg-accent-red/10 border border-accent-red/20 px-4 py-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {localError}
                        </div>
                    )}
                </div>
            </div>

            {/* Apps Grid */}
            <div className="flex-[1.5] flex items-start justify-center px-8">
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8 max-w-5xl mx-auto w-full">
                    {apps.map((app) => {
                        const Icon = app.icon;
                        return (
                            <button
                                key={app.id}
                                onClick={() => setActiveModule(app.id)}
                                className="group flex flex-col items-center gap-3 transition-transform duration-200 active:scale-95"
                            >
                                <div className="w-20 h-20 rounded-[1.75rem] glass-button flex items-center justify-center">
                                    <Icon className={`w-10 h-10 ${app.color} transition-colors drop-shadow-md`} strokeWidth={1.5} />
                                </div>
                                <span className="text-sm font-medium text-text-primary tracking-wide drop-shadow-md transition-colors">
                                    {app.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
