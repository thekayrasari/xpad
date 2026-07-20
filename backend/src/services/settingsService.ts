import fs from 'fs';
import path from 'path';

export interface GlobalSettings {
    simbriefId: string;
    chartsProvider: string;
    simulatorIp: string;
    moduleOrder?: string[];
}

export class SettingsService {
    private readonly settingsDir = path.join(process.env.APPDATA || process.env.USERPROFILE || __dirname, 'xPad');
    private readonly settingsPath = path.join(this.settingsDir, 'settings.json');
    private settings: GlobalSettings = {
        simbriefId: '',
        chartsProvider: 'msfs',
        simulatorIp: '127.0.0.1',
        moduleOrder: []
    };

    constructor() {
        this.loadSettings();
    }

    private loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf-8');
                const userSettings = JSON.parse(data) as Partial<GlobalSettings>;
                this.settings = {
                    simbriefId: userSettings.simbriefId ?? '',
                    chartsProvider: userSettings.chartsProvider ?? 'msfs',
                    simulatorIp: userSettings.simulatorIp ?? '127.0.0.1',
                    moduleOrder: userSettings.moduleOrder ?? []
                };
            } else {
                this.saveSettings();
            }
        } catch (e) {
            console.error('Failed to load global settings:', e);
        }
    }

    public getSettings(): GlobalSettings {
        return this.settings;
    }

    public updateSettings(newSettings: Partial<GlobalSettings>) {
        this.settings = {
            simbriefId: newSettings.simbriefId ?? this.settings.simbriefId,
            chartsProvider: newSettings.chartsProvider ?? this.settings.chartsProvider,
            simulatorIp: newSettings.simulatorIp ?? this.settings.simulatorIp,
            moduleOrder: newSettings.moduleOrder ?? this.settings.moduleOrder
        };
        this.saveSettings();
    }

    private saveSettings() {
        try {
            if (!fs.existsSync(this.settingsDir)) {
                fs.mkdirSync(this.settingsDir, { recursive: true });
            }
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
        } catch (e) {
            console.error('Failed to save global settings:', e);
        }
    }
}
