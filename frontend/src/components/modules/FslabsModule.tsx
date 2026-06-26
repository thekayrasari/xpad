import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, Wifi, WifiOff, ShieldAlert, Plane, AlertTriangle, Settings, Check } from 'lucide-react';

const FSLABS_PORT = 23032;

type ConnectionState = 'idle' | 'detecting' | 'connected' | 'cert_blocked' | 'offline';

// Persist the user's IP in localStorage directly (no Zustand needed for a single string)
const STORAGE_KEY = 'xpad-fslabs-ip';
const getSavedIp = () => localStorage.getItem(STORAGE_KEY) || '';
const saveIp = (ip: string) => localStorage.setItem(STORAGE_KEY, ip);

export const FslabsModule: React.FC = () => {
    const [ip, setIp] = useState(getSavedIp);
    const [inputIp, setInputIp] = useState(getSavedIp);
    const [showSettings, setShowSettings] = useState(!getSavedIp()); // open by default if no IP saved
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fslabsUrl = ip ? `http://${ip}:${FSLABS_PORT}` : '';

    const connect = async (targetIp = ip) => {
        if (!targetIp) return;
        setConnectionState('detecting');
        setIframeLoaded(false);
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);

        try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 3000);
            await fetch(`http://${targetIp}:${FSLABS_PORT}`, { mode: 'no-cors', signal: ctrl.signal });
            clearTimeout(timeout);

            // Server is reachable — try loading iframe
            setConnectionState('connected');

            // Watchdog: if iframe hasn't loaded in 5s, cert or X-Frame blocked it
            iframeTimeoutRef.current = setTimeout(() => {
                setConnectionState(prev => (prev === 'connected' && !iframeLoaded ? 'cert_blocked' : prev));
            }, 5000);

        } catch {
            setConnectionState('offline');
        }
    };

    // Auto-connect on mount if we have a saved IP
    useEffect(() => {
        if (ip) setTimeout(() => { void connect(ip); }, 0);
        return () => { if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSaveAndConnect = () => {
        const trimmed = inputIp.trim();
        if (!trimmed) return;
        saveIp(trimmed);
        setIp(trimmed);
        setShowSettings(false);
        connect(trimmed);
    };

    const handleIframeLoad = () => {
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
        setIframeLoaded(true);
        setConnectionState('connected');
    };

    const handleIframeError = () => {
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
        setConnectionState('cert_blocked');
    };

    // ── Status dot helper ───────────────────────────────────────
    const statusColor =
        connectionState === 'connected' && iframeLoaded ? 'bg-accent-green' :
        connectionState === 'offline'                   ? 'bg-accent-red' :
        connectionState === 'cert_blocked'              ? 'bg-accent-orange' :
        connectionState === 'detecting'                 ? 'bg-accent-blue animate-pulse' :
        'bg-white/[0.05]';

    const statusLabel =
        connectionState === 'detecting'                 ? 'Detecting…' :
        connectionState === 'connected' && iframeLoaded ? 'Connected' :
        connectionState === 'cert_blocked'              ? 'Cert Required' :
        connectionState === 'offline'                   ? 'Offline' :
        ip ? 'Idle' : 'No IP set';

    return (
        <div className="w-full h-full font-sans text-text-primary bg-transparent flex flex-col overflow-hidden">

            {/* ── Content area ───────────────────────────────────── */}
            <div className="flex-1 overflow-hidden relative">

                {/* No IP configured yet */}
                {!ip && connectionState === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8 max-w-md mx-auto">
                        <div className="p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
                            <Plane className="w-10 h-10 text-accent-purple" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">FSLabs xPad</h2>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                Enter the local network IP of the PC running your flight sim above to connect to the FSLabs A320-X/A319-X/A321-X EFB.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="glass-button flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase text-accent-purple hover:text-accent-purple/80 transition-all active:scale-95"
                        >
                            <Settings className="w-4 h-4" /> Configure IP
                        </button>
                    </div>
                )}

                {/* Detecting */}
                {connectionState === 'detecting' && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                                <Wifi className="w-7 h-7 text-accent-blue" />
                            </div>
                            <div className="absolute inset-0 rounded-xl border-2 border-accent-blue/40 animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold uppercase text-text-primary mb-1">Connecting…</h2>
                            <p className="text-sm font-bold text-text-secondary">{fslabsUrl}</p>
                        </div>
                    </div>
                )}

                {/* Offline */}
                {connectionState === 'offline' && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
                            <WifiOff className="w-7 h-7 text-accent-red" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">FSLabs EFB Not Found</h2>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                Could not reach <span className="text-accent-blue">{fslabsUrl}</span>.
                                <br />Make sure MSFS/P3D is running with an FSLabs aircraft loaded, or check the IP address.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => connect()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-ctp-base font-bold uppercase text-sm hover:bg-accent-blue/90 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Retry
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.05] text-text-secondary hover:text-text-primary hover:bg-white/[0.05] text-sm font-bold uppercase transition-all"
                            >
                                <Settings className="w-4 h-4" /> Change IP
                            </button>
                        </div>
                    </div>
                )}

                {/* Cert blocked */}
                {connectionState === 'cert_blocked' && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8 max-w-xl mx-auto">
                        <div className="w-16 h-16 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
                            <ShieldAlert className="w-7 h-7 text-accent-orange" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">Certificate Trust Required</h2>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                FSLabs EFB is running but the browser is blocking the connection.
                                This is a one-time setup.
                            </p>
                        </div>
                        <div className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 text-left space-y-3">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-3">One-Time Fix</p>
                            {[
                                'Click "Open in Browser" — your browser will show a security warning.',
                                'Click "Advanced" → "Proceed to ... (unsafe)" to trust the connection.',
                                'Close that tab, then click "Retry" here.',
                            ].map((text, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent-orange/20 text-accent-orange text-xs font-bold flex items-center justify-center mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm font-bold text-text-primary leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(fslabsUrl, '_blank')}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-orange text-ctp-base font-bold uppercase text-sm hover:bg-accent-orange/90 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in Browser
                            </button>
                            <button
                                onClick={() => connect()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.05] text-text-secondary hover:text-text-primary hover:bg-white/[0.05] text-sm font-bold uppercase transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Retry
                            </button>
                        </div>
                        <div className="flex items-start gap-2 px-4 py-3 bg-accent-blue/5 border border-accent-blue/15 rounded-xl max-w-md">
                            <AlertTriangle className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-text-secondary text-left leading-relaxed">
                                You only need to trust the certificate once per browser session.
                            </p>
                        </div>
                    </div>
                )}

                {/* Iframe — connected */}
                {connectionState === 'connected' && (
                    <>
                        {!iframeLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center z-10 bg-transparent">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
                                        <Plane className="w-7 h-7 text-accent-purple" />
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-accent-purple/30 animate-ping" />
                                </div>
                                <p className="text-sm font-bold uppercase text-text-secondary">Loading FSLabs EFB…</p>
                            </div>
                        )}
                        <iframe
                            src={fslabsUrl}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                            title="FSLabs EFB"
                            allow="fullscreen"
                        />
                    </>
                )}
            </div>

            {/* ── IP Settings Panel (collapsible) ───────────────── */}
            {showSettings && (
                <div className="shrink-0 mx-6 md:mx-8 mb-4 p-6 glass-panel z-20">
                    <p className="text-xs font-bold tracking-widest uppercase text-text-secondary mb-3">
                        Sim PC Connection
                    </p>
                    <div className="flex items-center gap-3 max-w-lg">
                        <div className="flex-1 flex items-center bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-hidden focus-within:border-accent-blue transition-colors">
                            <span className="pl-4 text-sm font-bold text-text-secondary select-none">http://</span>
                            <input
                                type="text"
                                value={inputIp}
                                onChange={e => setInputIp(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveAndConnect()}
                                placeholder="192.168.1.50"
                                className="flex-1 bg-transparent px-2 py-3 text-sm font-bold text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
                                spellCheck={false}
                            />
                            <span className="pr-4 text-sm font-bold text-text-secondary select-none">:{FSLABS_PORT}</span>
                        </div>
                        <button
                            onClick={handleSaveAndConnect}
                            disabled={!inputIp.trim()}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-ctp-base font-bold text-sm uppercase hover:bg-accent-blue/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Check className="w-4 h-4" />
                            Connect
                        </button>
                    </div>
                    <p className="text-xs font-bold text-text-secondary/70 mt-3">
                        Enter the local network IP of the PC running the sim + FSLabs. Your IP is usually something like <span className="text-accent-blue">192.168.x.x</span>.
                    </p>
                </div>
            )}

            {/* ── Bottom Toolbar ─────────────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-end px-6 md:px-8 py-4 border-t border-white/[0.05] bg-black/20 z-10">
                <div className="flex items-center gap-2 bg-black/20 p-1 border border-white/[0.05] rounded-xl">
                    <div className="flex items-center gap-2 px-3">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="text-xs font-bold uppercase text-text-secondary">{statusLabel}</span>
                    </div>
                    <div className="w-px h-5 bg-white/[0.05] mx-1 self-center" />
                    {ip && (
                        <button
                            onClick={() => connect()}
                            className="p-1.5 px-3 text-text-secondary hover:text-text-primary rounded-lg transition-all active:scale-95"
                            title="Retry connection"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                    {fslabsUrl && (
                        <button
                            onClick={() => window.open(fslabsUrl, '_blank')}
                            className="p-1.5 px-3 text-text-secondary hover:text-text-primary rounded-lg transition-all active:scale-95"
                            title="Open in browser tab"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowSettings(s => !s)}
                        className={`p-1.5 px-3 rounded-lg transition-all active:scale-95 ${showSettings ? 'bg-white/[0.1] text-accent-blue shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                        title="Configure IP"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
