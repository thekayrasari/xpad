import React, { useState, useEffect } from 'react';
import { Settings, Play } from 'lucide-react';
import { BACKEND_URL } from '../../config';

interface AppConfig {
    id: string;
    name: string;
    path: string;
    type: 'exe' | 'shell';
}

export const LauncherModule: React.FC = () => {
    const [settings, setSettings] = useState<AppConfig[]>([]);
    const [editingAppId, setEditingAppId] = useState<string | null>(null);
    const [editPath, setEditPath] = useState('');
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

    const saveSettings = async (newSettings: AppConfig[]) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/launcher/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (!res.ok) throw new Error('Failed to save settings');
            setSettings(newSettings);
            setEditingAppId(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSaveSingleApp = (appId: string) => {
        const newSettings = settings.map(app => app.id === appId ? { ...app, path: editPath } : app);
        void saveSettings(newSettings);
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

    if (loading) return <div className="p-8 text-text-secondary">Loading launcher...</div>;
    if (error) return <div className="p-8 text-accent-red">Error: {error}</div>;

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden animate-fade-in relative z-10">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {settings.map(app => (
                        editingAppId === app.id ? (
                            <div key={app.id} className="glass-panel p-6 flex flex-col gap-3 relative overflow-hidden">
                                <label className="text-sm font-semibold text-text-primary">{app.name}</label>
                                <input 
                                    type="text" 
                                    value={editPath}
                                    onChange={(e) => setEditPath(e.target.value)}
                                    className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-text-primary focus:outline-none focus:border-accent-teal transition-colors font-mono"
                                    placeholder="C:\Path\To\App.exe"
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSaveSingleApp(app.id);
                                        if (e.key === 'Escape') setEditingAppId(null);
                                    }}
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <button 
                                        onClick={() => setEditingAppId(null)} 
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => handleSaveSingleApp(app.id)} 
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-accent-teal text-black hover:bg-accent-teal/90 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                key={app.id}
                                onClick={() => launchApp(app.id)}
                                className="glass-panel p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all group active:scale-95 text-left relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/0 to-accent-teal/0 group-hover:from-accent-teal/5 group-hover:to-transparent transition-all pointer-events-none" />
                                
                                <div 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setEditingAppId(app.id); 
                                        setEditPath(app.path); 
                                    }}
                                    className="absolute top-3 right-3 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit Path"
                                >
                                    <Settings className="w-4 h-4" />
                                </div>

                                <div className="w-16 h-16 rounded-2xl bg-dark-bg/50 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <Play className="w-8 h-8 text-accent-teal drop-shadow-md" fill="currentColor" />
                                </div>
                                <span className="font-semibold text-text-primary text-center">{app.name}</span>
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};
