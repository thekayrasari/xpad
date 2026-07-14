import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useSettingsStore, type ChartsProvider } from '../../stores/settingsStore';

export const SettingsModule: React.FC = () => {
    const { simbriefId, chartsProvider, simulatorIp, fetchSettings, saveSettings, resetSettings } = useSettingsStore();

    // Local state for inputs before saving
    const [localSimbrief, setLocalSimbrief] = useState(simbriefId);
    const [localChartsProvider, setLocalChartsProvider] = useState<ChartsProvider>(chartsProvider);
    const [localSimulatorIp, setLocalSimulatorIp] = useState(simulatorIp);
    const [saved, setSaved] = useState(false);

    // Fetch settings on mount
    useEffect(() => {
        void fetchSettings();
    }, [fetchSettings]);

    // Sync local state when store settings load
    useEffect(() => {
        setLocalSimbrief(simbriefId);
        setLocalChartsProvider(chartsProvider);
        setLocalSimulatorIp(simulatorIp);
    }, [simbriefId, chartsProvider, simulatorIp]);

    const handleSave = async () => {
        try {
            await saveSettings(localSimbrief, localChartsProvider, localSimulatorIp);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save settings:', err);
        }
    };

    const handleErase = async () => {
        if (confirm('Are you sure you want to erase all local data? This will reset your settings and caches.')) {
            await resetSettings();
            localStorage.clear();
        }
    };

    return (
        <div className="w-full h-full p-6 md:p-8 overflow-y-auto hide-scrollbar flex flex-col font-sans text-text-primary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">

                {/* Integrations Section */}
                <div className="xp-panel">
                    <div className="xp-panel-header">
                        <h2 className="xp-section-title">Integrations</h2>
                    </div>

                    <div className="p-5 space-y-5">
                        <div>
                            <label className="xp-label">SimBrief Pilot ID / Username</label>
                            <input
                                type="text"
                                value={localSimbrief}
                                onChange={(e) => setLocalSimbrief(e.target.value)}
                                placeholder="Enter ID (e.g. 123456 or thekal)"
                                className="xp-input"
                            />
                            <p className="text-xs text-text-secondary/70 mt-1">
                                Used to fetch your latest Operational Flight Plan (OFP).
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border-dark">
                            <label className="xp-label">Charts Provider</label>
                            <select
                                value={localChartsProvider}
                                onChange={(e) => setLocalChartsProvider(e.target.value as ChartsProvider)}
                                className="xp-input"
                            >
                                <option value="msfs">MSFS Flight Planner</option>
                                <option value="navigraph">Navigraph Charts</option>
                                <option value="chartfox">Chartfox</option>
                            </select>
                            <p className="text-xs text-text-secondary/70 mt-1">
                                Select which provider opens when you click the Charts app.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border-dark">
                            <label className="xp-label">Simulator IP Address</label>
                            <input
                                type="text"
                                value={localSimulatorIp}
                                onChange={(e) => setLocalSimulatorIp(e.target.value)}
                                placeholder="e.g. 192.168.1.10"
                                className="xp-input"
                            />
                            <p className="text-xs text-text-secondary/70 mt-1">
                                Used by GSX, Fenix, and FSLabs to connect to your simulator across the network. Use 127.0.0.1 if running on the same PC.
                            </p>
                        </div>
                    </div>

                    <div className="xp-toolbar justify-end">
                        <button onClick={handleSave} className="xp-btn-primary">
                            <Save className="w-4 h-4" />
                            {saved ? 'Saved!' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="xp-panel border-accent-red/30">
                    <div className="xp-panel-header border-accent-red/30 bg-accent-red/5">
                        <h2 className="xp-section-title text-accent-red flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Danger Zone
                        </h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-sm text-text-secondary">
                            Erase all local data including settings, simbrief data, and cached PDF files.
                            This action cannot be undone.
                        </p>
                        <div className="xp-toolbar mt-2">
                        <button onClick={handleErase} className="xp-btn">
                            <Trash2 className="w-4 h-4" /> Erase Configuration
                        </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
