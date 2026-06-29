import React, { Suspense, useState, useEffect } from 'react';
import { useUIStore, type ModuleType } from '../stores/uiStore';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { HomeModule } from './modules/HomeModule';

const RadarModule = React.lazy(() => import('./modules/RadarModule').then(m => ({ default: m.RadarModule })));
const SettingsModule = React.lazy(() => import('./modules/SettingsModule').then(m => ({ default: m.SettingsModule })));
const OFPModule = React.lazy(() => import('./modules/OFPModule').then(m => ({ default: m.OFPModule })));
const WeatherModule = React.lazy(() => import('./modules/WeatherModule').then(m => ({ default: m.WeatherModule })));
const PDFModule = React.lazy(() => import('./modules/PDFModule').then(m => ({ default: m.PDFModule })));
const AOCModule = React.lazy(() => import('./modules/AOCModule').then(m => ({ default: m.AOCModule })));
const NotesModule = React.lazy(() => import('./modules/NotesModule').then(m => ({ default: m.NotesModule })));
const SimbriefModule = React.lazy(() => import('./modules/SimbriefModule').then(m => ({ default: m.SimbriefModule })));
const FenixModule = React.lazy(() => import('./modules/FenixModule').then(m => ({ default: m.FenixModule })));
const FslabsModule = React.lazy(() => import('./modules/FslabsModule').then(m => ({ default: m.FslabsModule })));
const ChartsModule = React.lazy(() => import('./modules/ChartsModule').then(m => ({ default: m.ChartsModule })));
const FlightsimtoModule = React.lazy(() => import('./modules/FlightsimtoModule').then(m => ({ default: m.FlightsimtoModule })));
const NattrakModule = React.lazy(() => import('./modules/NattrakModule').then(m => ({ default: m.NattrakModule })));
const VPilotModule = React.lazy(() => import('./modules/VPilotModule').then(m => ({ default: m.VPilotModule })));
const LauncherModule = React.lazy(() => import('./modules/LauncherModule').then(m => ({ default: m.LauncherModule })));

const MODULE_REGISTRY: Record<string, React.ComponentType<any>> = {
    home: HomeModule,
    radar: RadarModule,
    settings: SettingsModule,
    ofp: OFPModule,
    weather: WeatherModule,
    pdf: PDFModule,
    aoc: AOCModule,
    notes: NotesModule,
    simbrief: SimbriefModule,
    fenix: FenixModule,
    fslabs: FslabsModule,
    charts: ChartsModule,
    flightsimto: FlightsimtoModule,
    nattrak: NattrakModule,
    vpilot: VPilotModule,
    launcher: LauncherModule,
};

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
            {Array.from(mounted).map(moduleId => {
                const Component = MODULE_REGISTRY[moduleId];
                if (!Component) return null;
                return (
                    <div key={moduleId} className={`w-full h-full animate-page-enter ${active === moduleId ? 'block' : 'hidden'}`}>
                        <Component />
                    </div>
                );
            })}
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
