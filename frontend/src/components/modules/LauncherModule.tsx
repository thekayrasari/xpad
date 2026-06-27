import React, { useState, useEffect } from 'react';
import { Rocket, Settings, Check, X, Play, Folder } from 'lucide-react';
import { BACKEND_URL } from '../../config';

interface AppConfig {
    id: string;
    name: string;
    path: string;
    type: 'exe' | 'shell';
}

export const LauncherModule: React.FC = () => {
    const [settings, setSettings] = useState<AppConfig[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/launcher/settings`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            setSettings(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/launcher/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Failed to save settings');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const launchApp = async (appId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/launcher/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to launch app');
            }
        } catch (err: any) {
            alert(`Launch error: ${err.message}`);
        }
    };

    const updateAppPath = (appId: string, newPath: string) => {
        setSettings(settings.map(app => app.id === appId ? { ...app, path: newPath } : app));
    };

    if (loading) return <div className="p-8 text-text-secondary">Loading launcher...</div>;
    if (error) return <div className="p-8 text-accent-red">Error: {error}</div>;

    return (
        <div className="w-full h-full flex flex-col p-6 animate-fade-in relative z-10 overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-teal/20 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-accent-teal" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary tracking-wide">Launcher</h2>
                </div>

                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <Settings className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm font-medium text-text-secondary">Configure Paths</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { setIsEditing(false); fetchSettings(); }}
                            className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-accent-red hover:bg-accent-red/10 transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button 
                            onClick={saveSettings}
                            className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-accent-teal hover:bg-accent-teal/10 transition-colors"
                        >
                            <Check className="w-4 h-4" /> Save
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {!isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {settings.map(app => (
                        <button
                            key={app.id}
                            onClick={() => launchApp(app.id)}
                            className="glass-panel p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all group active:scale-95 text-left relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/0 to-accent-teal/0 group-hover:from-accent-teal/5 group-hover:to-transparent transition-all pointer-events-none" />
                            <div className="w-16 h-16 rounded-2xl bg-dark-bg/50 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Play className="w-8 h-8 text-accent-teal drop-shadow-md" fill="currentColor" />
                            </div>
                            <span className="font-semibold text-text-primary text-center">{app.name}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-text-secondary text-sm mb-2 bg-accent-blue/10 p-4 rounded-xl border border-accent-blue/20">
                        Edit the paths to your executables below. For MS Store / Xbox apps, the "shell:AppsFolder" paths are usually correct and do not need to be changed unless the Package Family Name differs.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {settings.map(app => (
                            <div key={app.id} className="glass-panel p-4 flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-primary">{app.name}</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Folder className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="text" 
                                            value={app.path}
                                            onChange={(e) => updateAppPath(app.id, e.target.value)}
                                            className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                                            placeholder="C:\Path\To\App.exe"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
