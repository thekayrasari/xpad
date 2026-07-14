import React, { Suspense, useState, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { MODULES } from '../config/modules';
import { useModulesStore } from '../stores/modulesStore';
import { ExternalFrameModule } from './modules/ExternalFrameModule';

const MODULE_REGISTRY = Object.fromEntries(
    MODULES.map(m => [m.id, m.component])
) as Record<string, React.ComponentType<any>>;

const Pane: React.FC<{ active: string }> = ({ active }) => {
    const [mounted, setMounted] = useState<Set<string>>(new Set([active]));
    const dynamicModules = useModulesStore(s => s.modules);
    
    useEffect(() => {
        setMounted(prev => {
            if (prev.has(active)) return prev;
            const next = new Set(prev);
            next.add(active);
            return next;
        });
    }, [active]);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-text-primary">Loading...</div>}>
            {Array.from(mounted).map(moduleId => {
                const StaticComponent = MODULE_REGISTRY[moduleId];
                
                if (StaticComponent) {
                    return (
                        <div key={moduleId} className={`w-full h-full ${active === moduleId ? 'block' : 'hidden'}`}>
                            <StaticComponent />
                        </div>
                    );
                }

                const dynModule = dynamicModules.find(m => m.id === moduleId);
                if (dynModule) {
                    return (
                        <div key={moduleId} className={`w-full h-full ${active === moduleId ? 'block' : 'hidden'}`}>
                            <ExternalFrameModule config={dynModule} />
                        </div>
                    );
                }

                return null;
            })}
        </Suspense>
    );
};

export const ModuleContainer: React.FC = () => {
    const { activeModule } = useUIStore();

    return (
        <div className="flex-1 w-full h-full overflow-hidden relative">
            <Pane active={activeModule} />
        </div>
    );
};
