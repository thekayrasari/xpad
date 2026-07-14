import { lazy } from 'react';
import { 
    FileText, CloudRain, BookOpen, Pen, 
    Briefcase, Calculator, Radio, Play, 
    Settings 
} from 'lucide-react';

export const MODULES = [
    { id: 'ofp', label: 'OFP', icon: FileText, component: lazy(() => import('../components/modules/OFPModule').then(m => ({ default: m.OFPModule }))) },
    { id: 'weather', label: 'Weather', icon: CloudRain, component: lazy(() => import('../components/modules/WeatherModule').then(m => ({ default: m.WeatherModule }))) },
    { id: 'pdf', label: 'Manuals', icon: BookOpen, component: lazy(() => import('../components/modules/PDFModule').then(m => ({ default: m.PDFModule }))) },
    { id: 'notes', label: 'Scratchpad', icon: Pen, component: lazy(() => import('../components/modules/NotesModule').then(m => ({ default: m.NotesModule }))) },
    { id: 'aoc', label: 'AOC', icon: Briefcase, component: lazy(() => import('../components/modules/AOCModule').then(m => ({ default: m.AOCModule }))) },
    { id: 'calculators', label: 'Calculators', icon: Calculator, component: lazy(() => import('../components/modules/CalculatorsModule').then(m => ({ default: m.CalculatorsModule }))) },
    { id: 'vpilot', label: 'vPilot', icon: Radio, component: lazy(() => import('../components/modules/VPilotModule').then(m => ({ default: m.VPilotModule }))) },
    { id: 'launcher', label: 'Launcher', icon: Play, component: lazy(() => import('../components/modules/LauncherModule').then(m => ({ default: m.LauncherModule }))) },
    { id: 'settings', label: 'Settings', icon: Settings, component: lazy(() => import('../components/modules/SettingsModule').then(m => ({ default: m.SettingsModule }))) },
] as const;

export type ModuleType = typeof MODULES[number]['id'];
