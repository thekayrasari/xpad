import React, { useState, useEffect } from 'react';
import { Settings, AppWindow } from 'lucide-react';
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

    if (loading) return (
        <div className="xp-empty h-full text-text-primary">
            Loading...
        </div>
    );

    if (error) return (
        <div className="xp-empty h-full">
            <span className="text-sm font-bold text-accent-red">Error: {error}</span>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {settings.map(app => (
                        editingAppId === app.id ? (
                            /* ── Edit mode ── */
                            <div key={app.id} className="xp-panel p-5 flex flex-col gap-3">
                                <label className="xp-label">{app.name}</label>
                                <input
                                    type="text"
                                    value={editPath}
                                    onChange={(e) => setEditPath(e.target.value)}
                                    className="xp-input font-mono text-xs"
                                    placeholder="C:\Path\To\App.exe"
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSaveSingleApp(app.id);
                                        if (e.key === 'Escape') setEditingAppId(null);
                                    }}
                                />
                                <div className="flex gap-2 justify-end mt-1">
                                    <button
                                        onClick={() => setEditingAppId(null)}
                                        className="xp-btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSaveSingleApp(app.id)}
                                        className="xp-btn-primary"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Launch mode ── */
                            <button
                                key={app.id}
                                onClick={() => launchApp(app.id)}
                                className="xp-panel p-6 flex flex-col items-center justify-center gap-4
                                           hover:bg-nav-hover transition-colors group relative overflow-hidden"
                            >
                                {/* Settings gear — appears on hover */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAppId(app.id);
                                        setEditPath(app.path);
                                    }}
                                    className="absolute top-2.5 right-2.5 p-1.5 text-text-secondary
                                               hover:text-text-primary hover:bg-nav-hover transition-colors
                                               opacity-0 group-hover:opacity-100"
                                    title="Edit Path"
                                >
                                    <Settings className="w-4 h-4" />
                                </div>

                                <AppWindow className="w-10 h-10 text-text-secondary group-hover:text-accent-blue transition-colors" />
                                <span className="font-bold text-text-primary text-sm text-center">{app.name}</span>
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};
