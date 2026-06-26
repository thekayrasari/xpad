import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { useSettingsStore, DEFAULT_THEME_COLORS, type ThemeColors, type ChartsProvider } from '../../stores/settingsStore';

export const SettingsModule: React.FC = () => {
    const { simbriefId, themeColors, chartsProvider, setSimbriefId, setThemeColors, setChartsProvider, resetSettings } = useSettingsStore();
    
    // Local state for inputs before saving
    const [localSimbrief, setLocalSimbrief] = useState(simbriefId);
    const [localTheme, setLocalTheme] = useState<ThemeColors>(themeColors);
    const [localChartsProvider, setLocalChartsProvider] = useState<ChartsProvider>(chartsProvider);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSimbriefId(localSimbrief);
        setThemeColors(localTheme);
        setChartsProvider(localChartsProvider);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleErase = () => {
        if (confirm('Are you sure you want to erase all local data? This will reset your settings and caches.')) {
            resetSettings();
            setLocalSimbrief('');
            setLocalTheme(DEFAULT_THEME_COLORS);
            setLocalChartsProvider('msfs');
            localStorage.clear();
        }
    };

    return (
        <div className="w-full h-full p-6 md:p-8 overflow-y-auto flex flex-col font-sans text-text-primary">


            <div className="max-w-xl space-y-8">
                {/* Integrations Section */}
                <div className="glass-panel p-6 space-y-6">
                    <h2 className="text-base font-bold text-text-primary uppercase">Integrations</h2>
                    
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-text-secondary">
                            SimBrief Pilot ID / Username
                        </label>
                        <input
                            type="text"
                            value={localSimbrief}
                            onChange={(e) => setLocalSimbrief(e.target.value)}
                            placeholder="Enter ID (e.g. 123456 or thekal)"
                            className="w-full bg-dark-bg border border-white/[0.1] rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                        />
                        <p className="text-xs text-text-secondary/70">
                            Used to fetch your latest Operational Flight Plan (OFP).
                        </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/[0.05]">
                        <label className="block text-xs font-bold uppercase text-text-secondary">
                            Charts Provider
                        </label>
                        <select
                            value={localChartsProvider}
                            onChange={(e) => setLocalChartsProvider(e.target.value as ChartsProvider)}
                            className="w-full bg-dark-bg border border-white/[0.1] rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                        >
                            <option value="msfs">MSFS Flight Planner</option>
                            <option value="navigraph">Navigraph Charts</option>
                            <option value="chartfox">Chartfox</option>
                        </select>
                        <p className="text-xs text-text-secondary/70">
                            Select which provider opens when you click the Charts app.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.05] flex justify-end">
                        <button
                            onClick={handleSave}
                            className="glass-button flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase text-accent-blue hover:text-accent-blue/80 active:scale-95 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {saved ? 'Saved!' : 'Save Integrations'}
                        </button>
                    </div>
                </div>


                {/* Danger Zone */}
                <div className="bg-accent-red/5 rounded-xl p-6 border border-accent-red/20 space-y-4">
                    <h2 className="text-base font-bold text-accent-red uppercase flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-text-secondary">
                        Erase all local data including settings, simbrief data, and cached PDF files. 
                        This action cannot be undone.
                    </p>
                    <button
                        onClick={handleErase}
                        className="glass-button flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase text-accent-red hover:text-accent-red/80 active:scale-95 transition-all"
                    >
                        Erase Local Data
                    </button>
                </div>
            </div>
        </div>
    );
};
