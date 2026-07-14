import fs from 'fs';
import path from 'path';

export interface ExternalModuleConfig {
    id: string;
    label: string;
    icon: string;
    type: 'webview' | 'iframe';
    src?: string;
    port?: number;
    productName?: string;
    productDescription?: string;
    notFoundTitle?: string;
    notFoundHint?: string;
    certHint?: string;
    loadingText?: string;
}

export class ModulesService {
    private readonly settingsDir = path.join(process.env.APPDATA || process.env.USERPROFILE || __dirname, 'xPad');
    private readonly settingsPath = path.join(this.settingsDir, 'modules-settings.json');
    private settings: ExternalModuleConfig[] = [];

    private defaultModules: ExternalModuleConfig[] = [
        {
            id: 'charts',
            label: 'Charts',
            icon: 'Map',
            type: 'webview',
            src: 'https://planner.flightsimulator.com/',
            loadingText: 'Loading Charts...'
        },
        {
            id: 'simbrief',
            label: 'SimBrief',
            icon: 'Route',
            type: 'webview',
            src: 'https://dispatch.simbrief.com/',
            loadingText: 'Loading SimBrief...'
        },
        {
            id: 'flightsimto',
            label: 'Flightsim.to',
            icon: 'Navigation',
            type: 'webview',
            src: 'https://flightsim.to/',
            loadingText: 'Loading Flightsim.to...'
        },
        {
            id: 'nattrak',
            label: 'VATSIM NatTrak',
            icon: 'VIcon',
            type: 'webview',
            src: 'https://nattrak.vatsim.net/',
            loadingText: 'Loading VATSIM NatTrak...'
        },
        {
            id: 'radar',
            label: 'VATSIM Radar',
            icon: 'Radar',
            type: 'webview',
            src: 'https://vatsim-radar.com/',
            loadingText: 'Loading VATSIM Radar...'
        },
        {
            id: 'fenix',
            label: 'Fenix EFB',
            icon: 'Tablet',
            type: 'iframe',
            port: 8083,
            productName: 'Fenix EFB',
            productDescription: 'Make sure your simulator IP is set correctly in the Settings app.',
            notFoundTitle: 'Fenix EFB Not Found',
            notFoundHint: 'Make sure MSFS is running with a Fenix aircraft loaded, or check the IP address in Settings.',
            certHint: 'Fenix EFB is running but the browser is blocking the connection. This is a one-time setup.',
            loadingText: 'Loading Fenix EFB…'
        },
        {
            id: 'fslabs',
            label: 'FSLabs EFB',
            icon: 'Tablet',
            type: 'iframe',
            port: 8084,
            productName: 'FSLabs EFB',
            productDescription: 'Make sure your simulator IP is set correctly in the Settings app.',
            notFoundTitle: 'FSLabs EFB Not Found',
            notFoundHint: 'Make sure the simulator is running with FSLabs EFB enabled, or check the IP address in Settings.',
            certHint: 'FSLabs EFB is running but the browser is blocking the connection. This is a one-time setup.',
            loadingText: 'Loading FSLabs EFB…'
        },
        {
            id: 'gsx',
            label: 'GSX',
            icon: 'Truck',
            type: 'iframe',
            port: 8744,
            productName: 'GSX Pro Remote',
            productDescription: 'Make sure your simulator IP is set correctly in the Settings app.',
            notFoundTitle: 'GSX Not Found',
            notFoundHint: 'Ensure GSX is running and the Remote Server is enabled in its settings.',
            certHint: 'GSX might use a self-signed certificate for local connections.',
            loadingText: 'Connecting to GSX...'
        }
    ];

    constructor() {
        this.loadSettings();
    }

    private loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf-8');
                let userSettings = JSON.parse(data) as ExternalModuleConfig[];
                
                // Migrate legacy labels to official names
                let migrated = false;
                userSettings = userSettings.map(u => {
                    if (u.id === 'radar' && u.label === 'Radar') {
                        migrated = true;
                        return { ...u, label: 'VATSIM Radar' };
                    }
                    if (u.id === 'nattrak' && u.label === 'NatTrak') {
                        migrated = true;
                        return { ...u, label: 'VATSIM NatTrak' };
                    }
                    if (u.id === 'fenix' && u.label === 'Fenix') {
                        migrated = true;
                        return { ...u, label: 'Fenix EFB' };
                    }
                    if (u.id === 'fslabs' && u.label === 'FSLabs') {
                        migrated = true;
                        return { ...u, label: 'FSLabs EFB' };
                    }
                    return u;
                });

                // Merge with defaults to ensure missing ones are added
                this.settings = this.defaultModules.map(def => {
                    const userVal = userSettings.find(u => u.id === def.id);
                    return userVal ? userVal : def;
                });
                // Add any custom ones the user created
                userSettings.forEach(u => {
                    if (!this.settings.some(s => s.id === u.id)) {
                        this.settings.push(u);
                    }
                });

                if (migrated) {
                    this.saveSettings();
                }
            } else {
                this.settings = [...this.defaultModules];
                this.saveSettings();
            }
        } catch (e) {
            console.error('Failed to load external modules settings:', e);
            this.settings = [...this.defaultModules];
        }
    }

    public getSettings(): ExternalModuleConfig[] {
        return this.settings;
    }

    public updateSettings(newSettings: ExternalModuleConfig[]) {
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
            console.error('Failed to save external modules settings:', e);
        }
    }
}
