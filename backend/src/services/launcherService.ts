import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';

export interface AppConfig {
    id: string;
    name: string;
    path: string; // The user-defined or detected path.
    type: 'exe' | 'shell'; // exe = direct path, shell = shell:AppsFolder
}

export class LauncherService {
    private readonly settingsDir = path.join(process.env.APPDATA || process.env.USERPROFILE || __dirname, 'xPad');
    private readonly settingsPath = path.join(this.settingsDir, 'launcher-settings.json');
    private settings: AppConfig[] = [];

    // Default configuration with common paths
    private defaultApps: AppConfig[] = [
        { id: 'msfs2020', name: 'MSFS 2020 (Steam)', path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\MicrosoftFlightSimulator\\FlightSimulator.exe', type: 'exe' },
        { id: 'msfs2020_xbox', name: 'MSFS 2020 (Xbox)', path: 'shell:AppsFolder\\Microsoft.FlightSimulator_8wekyb3d8bbwe!App', type: 'shell' },
        { id: 'msfs2024', name: 'MSFS 2024 (Steam)', path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Microsoft Flight Simulator 2024\\FlightSimulator2024.exe', type: 'exe' },
        { id: 'msfs2024_xbox', name: 'MSFS 2024 (Xbox)', path: 'shell:AppsFolder\\Microsoft.FlightSimulator2024_8wekyb3d8bbwe!App', type: 'shell' },
        { id: 'xplane11', name: 'X-Plane 11', path: 'C:\\X-Plane 11\\X-Plane.exe', type: 'exe' },
        { id: 'xplane12', name: 'X-Plane 12', path: 'C:\\X-Plane 12\\X-Plane.exe', type: 'exe' },
        { id: 'vpilot', name: 'vPilot', path: process.env.LOCALAPPDATA + '\\vPilot\\vPilot.exe', type: 'exe' },
        { id: 'xpilot', name: 'xPilot', path: process.env.LOCALAPPDATA + '\\xPilot\\xPilot.exe', type: 'exe' },
        { id: 'beyondatc', name: 'BeyondATC', path: 'C:\\Program Files (x86)\\BeyondATC\\BeyondATC.exe', type: 'exe' },
        { id: 'sayintentions', name: 'SayIntentions', path: 'C:\\Program Files\\SayIntentions\\SayIntentions.exe', type: 'exe' },
    ];

    constructor() {
        this.loadSettings();
    }

    private loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf-8');
                const userSettings = JSON.parse(data) as AppConfig[];
                // Merge with defaults to ensure missing ones are added
                this.settings = this.defaultApps.map(def => {
                    const userVal = userSettings.find(u => u.id === def.id);
                    return userVal ? userVal : def;
                });
            } else {
                this.settings = [...this.defaultApps];
                this.saveSettings();
            }
        } catch (e) {
            console.error('Failed to load launcher settings:', e);
            this.settings = [...this.defaultApps];
        }
    }

    public getSettings(): AppConfig[] {
        return this.settings;
    }

    public updateSettings(newSettings: AppConfig[]) {
        this.settings = newSettings;
        this.saveSettings();
    }

    private saveSettings() {
        try {
            if (!fs.existsSync(this.settingsDir)) {
                fs.mkdirSync(this.settingsDir, { recursive: true });
            }
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
        } catch (e) {
            console.error('Failed to save launcher settings:', e);
        }
    }

    public launchApp(appId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const app = this.settings.find(a => a.id === appId);
            if (!app) {
                return reject(new Error('App not found'));
            }

            if (app.type === 'shell') {
                const child = spawn('explorer.exe', [app.path], {
                    shell: false,
                    detached: true,
                    stdio: 'ignore'
                });
                
                child.on('error', (err) => {
                    reject(err);
                });
                
                child.unref();
                resolve();
            } else {
                // Determine the working directory to prevent missing DLLs
                const dir = path.dirname(app.path);
                
                // We use spawn to detach so the backend isn't tied to the lifetime of the launched app
                const child = spawn(app.path, [], {
                    cwd: dir,
                    detached: true,
                    stdio: 'ignore'
                });
                
                child.on('error', (err) => {
                    reject(err);
                });
                
                child.unref();
                resolve();
            }
        });
    }
}
