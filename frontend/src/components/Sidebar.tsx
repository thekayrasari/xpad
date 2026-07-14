import React, { useEffect } from 'react';
import { RefreshCw, HelpCircle } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { MODULES } from '../config/modules';
import { useOFPStore } from '../stores/ofpStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useModulesStore } from '../stores/modulesStore';
import { ICON_MAP } from '../utils/iconMap';

interface SidebarItemProps {
    id: string;
    icon: React.ElementType;
    label: string;
}

const NavButton: React.FC<SidebarItemProps> = ({ id, icon: Icon, label }) => {
    const { activeModule, setActiveModule } = useUIStore();
    const isActive = activeModule === id;
    const isRotated = id === 'fenix' || id === 'fslabs';

    return (
        <button
            onClick={() => setActiveModule(id)}
            className={`w-full flex flex-col items-center justify-center py-2.5 px-1 gap-1 relative border-b border-dark-bg ${
                isActive
                    ? 'bg-accent-blue text-dark-bg'
                    : 'bg-nav-hover text-text-secondary hover:text-text-primary'
            }`}
            title={label}
        >
            <Icon className={`w-5 h-5 shrink-0 ${isRotated ? '-rotate-90' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wide leading-tight text-center w-full px-0.5 whitespace-normal break-words">
                {label}
            </span>
        </button>
    );
};

export const Sidebar: React.FC = () => {
    const { fetchOFP, isLoading } = useOFPStore();
    const simbriefId = useSettingsStore(state => state.simbriefId);
    const { modules: dynamicModules, fetchModules } = useModulesStore();

    useEffect(() => {
        void fetchModules();
    }, [fetchModules]);
    
    const staticMainModules = MODULES.filter(m => m.id !== 'settings');
    const settingsModule = MODULES.find(m => m.id === 'settings');

    // Combine static native modules and dynamic external modules
    const combinedMainModules = [
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

    const handleRefresh = async () => {
        if (simbriefId) {
            try {
                await fetchOFP(simbriefId);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="w-24 h-full bg-nav-hover border-r border-border-dark flex flex-col z-50 shrink-0 justify-between">
            {/* Top scrollable section */}
            <div className="flex flex-col w-full flex-1 overflow-y-auto hide-scrollbar">
                {combinedMainModules.map(m => (
                    <NavButton key={m.id} id={m.id} icon={m.icon} label={m.label} />
                ))}
            </div>

            {/* Bottom fixed section */}
            <div className="flex flex-col w-full border-t border-border-dark shrink-0">
                {/* Pull Data Button */}
                <button
                    onClick={handleRefresh}
                    disabled={!simbriefId || isLoading}
                    className={`w-full flex flex-col items-center justify-center py-2.5 px-1 gap-1 relative border-b border-dark-bg bg-nav-hover transition-colors ${
                        !simbriefId ? 'opacity-40 cursor-not-allowed text-text-secondary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title={simbriefId ? 'Pull SimBrief OFP' : 'No SimBrief ID Configured'}
                >
                    <RefreshCw className={`w-5 h-5 shrink-0 ${isLoading ? 'animate-spin text-accent-blue' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide leading-none text-center w-full truncate px-1">
                        PULL DATA
                    </span>
                </button>

                {/* Settings Button */}
                {settingsModule && (
                    <NavButton id={settingsModule.id} icon={settingsModule.icon} label={settingsModule.label} />
                )}
            </div>
        </div>
    );
};
