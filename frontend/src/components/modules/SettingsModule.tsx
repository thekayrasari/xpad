import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { useSettingsStore, type ChartsProvider } from '../../stores/settingsStore';
import { MODULES } from '../../config/modules';
import { useModulesStore } from '../../stores/modulesStore';
import { ICON_MAP } from '../../utils/iconMap';

interface CombinedModule {
    id: string;
    label: string;
    icon: React.ElementType;
}

export const SettingsModule: React.FC = () => {
    const { simbriefId, chartsProvider, simulatorIp, moduleOrder, fetchSettings, saveSettings, resetSettings } = useSettingsStore();
    const { modules: dynamicModules, fetchModules } = useModulesStore();

    // Local state for inputs before saving
    const [localSimbrief, setLocalSimbrief] = useState(simbriefId);
    const [localChartsProvider, setLocalChartsProvider] = useState<ChartsProvider>(chartsProvider);
    const [localSimulatorIp, setLocalSimulatorIp] = useState(simulatorIp);
    const [saved, setSaved] = useState(false);

    // Local state for drag and drop list
    const [orderedModules, setOrderedModules] = useState<CombinedModule[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Fetch settings and modules on mount
    useEffect(() => {
        void fetchSettings();
        void fetchModules();
    }, [fetchSettings, fetchModules]);

    // Sync local state when store settings load
    useEffect(() => {
        setLocalSimbrief(simbriefId);
        setLocalChartsProvider(chartsProvider);
        setLocalSimulatorIp(simulatorIp);
    }, [simbriefId, chartsProvider, simulatorIp]);

    // Build and sort combined list based on moduleOrder
    useEffect(() => {
        const staticMainModules = MODULES.filter(m => m.id !== 'settings');
        const combined = [
            ...staticMainModules.map(m => ({
                id: m.id as string,
                label: m.label,
                icon: m.icon as React.ElementType
            })),
            ...dynamicModules.map(d => ({
                id: d.id,
                label: d.label,
                icon: ICON_MAP[d.icon] || HelpCircle
            }))
        ];

        const sorted = [...combined].sort((a, b) => {
            const indexA = moduleOrder.indexOf(a.id);
            const indexB = moduleOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) {
                return combined.findIndex(x => x.id === a.id) - combined.findIndex(x => x.id === b.id);
            }
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        setOrderedModules(sorted);
    }, [moduleOrder, dynamicModules]);

    const handleSave = async () => {
        try {
            await saveSettings(localSimbrief, localChartsProvider, localSimulatorIp, moduleOrder);
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

    // Drag and drop event handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const updated = [...orderedModules];
            const [draggedItem] = updated.splice(draggedIndex, 1);
            updated.splice(dragOverIndex, 0, draggedItem);

            setOrderedModules(updated);

            const newOrder = updated.map(m => m.id);
            try {
                await saveSettings(localSimbrief, localChartsProvider, localSimulatorIp, newOrder);
            } catch (err) {
                console.error('Failed to save module order:', err);
            }
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
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

                {/* Navigation Bar Apps (Drag & Drop Reordering) */}
                <div className="xp-panel">
                    <div className="xp-panel-header">
                        <h2 className="xp-section-title">Navigation Bar Apps</h2>
                    </div>

                    <div className="p-5 space-y-4">
                        <p className="text-sm text-text-secondary">
                            Drag and drop the apps below to customize their order in the left navigation sidebar. Changes save automatically.
                        </p>

                        <div className="space-y-2 select-none">
                            {orderedModules.map((m, index) => {
                                const Icon = m.icon;
                                const isDragging = draggedIndex === index;
                                const isDragOver = dragOverIndex === index;
                                return (
                                    <div
                                        key={m.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-3 p-3 bg-nav-bg border rounded-md cursor-grab active:cursor-grabbing transition-all ${
                                            isDragging ? 'opacity-30 border-border-dark scale-98' :
                                            isDragOver ? 'border-accent-blue bg-nav-hover scale-102 shadow-lg shadow-accent-blue/10' :
                                            'border-border-dark hover:border-border-dark/80 hover:bg-nav-hover'
                                        }`}
                                    >
                                        <GripVertical className="w-4 h-4 text-text-secondary/40 shrink-0" />
                                        <Icon className="w-4 h-4 text-accent-blue shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                            {m.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
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
