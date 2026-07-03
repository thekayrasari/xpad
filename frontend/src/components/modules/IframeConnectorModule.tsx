import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, Wifi, WifiOff, ShieldAlert, Plane, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

type ConnectionState = 'idle' | 'detecting' | 'connected' | 'cert_blocked' | 'offline';

interface IframeConnectorModuleProps {
    port: number;
    productName: string;
    productDescription: string;
    notFoundTitle: string;
    notFoundHint: string;
    certHint: string;
    loadingText: string;
    iframeTitle: string;
}

export const IframeConnectorModule: React.FC<IframeConnectorModuleProps> = ({
    port,
    productName,
    productDescription,
    notFoundTitle,
    notFoundHint,
    certHint,
    loadingText,
    iframeTitle,
}) => {
    const ip = useSettingsStore(s => s.simulatorIp);

    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const iframeLoadedRef = useRef(false);
    const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const moduleUrl = ip ? `http://${ip}:${port}` : '';

    const connect = async (targetIp = ip) => {
        if (!targetIp) return;
        setConnectionState('detecting');
        setIframeLoaded(false);
        iframeLoadedRef.current = false;
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);

        try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 3000);
            await fetch(`http://${targetIp}:${port}`, { mode: 'no-cors', signal: ctrl.signal });
            clearTimeout(timeout);

            setConnectionState('connected');

            // Watchdog: if iframe hasn't loaded in 5s, cert or X-Frame blocked it
            iframeTimeoutRef.current = setTimeout(() => {
                if (!iframeLoadedRef.current) {
                    setConnectionState(prev => (prev === 'connected' ? 'cert_blocked' : prev));
                }
            }, 5000);
        } catch {
            setConnectionState('offline');
        }
    };

    // Auto-connect on mount or IP change
    useEffect(() => {
        if (ip) setTimeout(() => { void connect(ip); }, 0);
        return () => { if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current); };
    }, [ip]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleIframeLoad = () => {
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
        iframeLoadedRef.current = true;
        setIframeLoaded(true);
        setConnectionState('connected');
    };

    const handleIframeError = () => {
        if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
        setConnectionState('cert_blocked');
    };

    return (
        <div className="w-full h-full font-sans text-text-primary bg-transparent flex flex-col overflow-hidden rounded-[1.5rem]">
            {/* Content area */}
            <div className="flex-1 overflow-hidden relative">
                {/* No IP configured yet */}
                {!ip && connectionState === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8 max-w-md mx-auto">
                        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl">
                            <Plane className="w-10 h-10 text-[#ef4444]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">{productName}</h2>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                {productDescription}
                            </p>
                        </div>
                        <p className="text-sm font-bold text-accent-blue/80 mt-2">
                            Please configure your Simulator IP Address in the global Settings app.
                        </p>
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
                            <p className="text-sm font-bold text-text-secondary">{moduleUrl}</p>
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
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">{notFoundTitle}</h2>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                Could not reach <span className="text-accent-blue">{moduleUrl}</span>.
                                <br />{notFoundHint}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => connect()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-ctp-base font-bold uppercase text-sm hover:bg-accent-blue/90 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Retry
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
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">{certHint}</p>
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
                                onClick={() => window.open(moduleUrl, '_blank')}
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
                                    <div className="w-16 h-16 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
                                        <Plane className="w-7 h-7 text-[#ef4444]" />
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-[#ef4444]/30 animate-ping" />
                                </div>
                                <p className="text-sm font-bold uppercase text-text-secondary">{loadingText}</p>
                            </div>
                        )}
                        <iframe
                            src={moduleUrl}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            className={`w-full h-full border-0 transition-opacity duration-500 rounded-[1.5rem] ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                            title={iframeTitle}
                            allow="fullscreen"
                        />
                    </>
                )}
            </div>
        </div>
    );
};
