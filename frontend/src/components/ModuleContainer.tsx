import React, { Suspense, useState, useEffect } from 'react';
import { useUIStore, type ModuleType } from '../stores/uiStore';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { HomeModule } from './modules/HomeModule';
import { MapModule } from './modules/MapModule';
import { SettingsModule } from './modules/SettingsModule';
import { OFPModule } from './modules/OFPModule';

import { WeatherModule } from './modules/WeatherModule';
import { PDFModule } from './modules/PDFModule';
import { AOCModule } from './modules/AOCModule';
import { NotesModule } from './modules/NotesModule';
import { PlannerModule } from './modules/PlannerModule';
import { FenixModule } from './modules/FenixModule';
import { LinksModule } from './modules/LinksModule';

const Pane: React.FC<{ active: ModuleType }> = ({ active }) => {
    const [mounted, setMounted] = useState<Set<string>>(new Set([active]));
    
    useEffect(() => {
        setMounted(prev => {
            if (prev.has(active)) return prev;
            const next = new Set(prev);
            next.add(active);
            return next;
        });
    }, [active]);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-text-secondary">Loading module...</div>}>
            {mounted.has('home')      && <div className={`w-full h-full animate-page-enter ${active === 'home' ? 'block' : 'hidden'}`}><HomeModule /></div>}
            {mounted.has('ofp')       && <div className={`w-full h-full animate-page-enter ${active === 'ofp' ? 'block' : 'hidden'}`}><OFPModule /></div>}

            {mounted.has('map')       && <div className={`w-full h-full animate-page-enter ${active === 'map' ? 'block' : 'hidden'}`}><MapModule /></div>}
            {mounted.has('weather')   && <div className={`w-full h-full animate-page-enter ${active === 'weather' ? 'block' : 'hidden'}`}><WeatherModule /></div>}
            {mounted.has('pdf')       && <div className={`w-full h-full animate-page-enter ${active === 'pdf' ? 'block' : 'hidden'}`}><PDFModule /></div>}
            {mounted.has('aoc')       && <div className={`w-full h-full animate-page-enter ${active === 'aoc' ? 'block' : 'hidden'}`}><AOCModule /></div>}
            {mounted.has('notes')     && <div className={`w-full h-full animate-page-enter ${active === 'notes' ? 'block' : 'hidden'}`}><NotesModule /></div>}
            {mounted.has('planner')   && <div className={`w-full h-full animate-page-enter ${active === 'planner' ? 'block' : 'hidden'}`}><PlannerModule /></div>}
            {mounted.has('fenix')     && <div className={`w-full h-full animate-page-enter ${active === 'fenix' ? 'block' : 'hidden'}`}><FenixModule /></div>}
            {mounted.has('links')     && <div className={`w-full h-full animate-page-enter ${active === 'links' ? 'block' : 'hidden'}`}><LinksModule /></div>}
            {mounted.has('settings')  && <div className={`w-full h-full animate-page-enter ${active === 'settings' ? 'block' : 'hidden'}`}><SettingsModule /></div>}
        </Suspense>
    );
};

export const ModuleContainer: React.FC = () => {
    const { activeModule, secondaryModule } = useUIStore();

    return (
        <div className="flex-1 w-full h-full overflow-hidden relative">
            {!secondaryModule ? (
                <Pane active={activeModule} />
            ) : (
                <PanelGroup orientation="horizontal">
                    <Panel defaultSize={50} minSize={20} className="h-full">
                        <Pane active={activeModule} />
                    </Panel>
                    
                    <PanelResizeHandle className="w-2 hover:bg-white/5 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10 border-x border-white/[0.05]">
                        <div className="w-0.5 h-8 bg-text-secondary rounded-full opacity-50" />
                    </PanelResizeHandle>
                    
                    <Panel defaultSize={50} minSize={20} className="h-full">
                        <Pane active={secondaryModule} />
                    </Panel>
                </PanelGroup>
            )}
        </div>
    );
};
