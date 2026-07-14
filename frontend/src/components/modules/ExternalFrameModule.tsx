import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, WifiOff, ShieldAlert, Plane, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ExternalModuleConfig } from '../../stores/modulesStore';

type ConnectionState = 'idle' | 'detecting' | 'connected' | 'cert_blocked' | 'offline';

interface ExternalFrameModuleProps {
    config: ExternalModuleConfig;
}

const CHARTS_PROVIDER_URLS: Record<string, string> = {
    msfs: 'https://planner.flightsimulator.com/',
    navigraph: 'https://charts.navigraph.com/',
    chartfox: 'https://chartfox.org/',
};

export const ExternalFrameModule: React.FC<ExternalFrameModuleProps> = ({ config }) => {
    const { type, id, port, productName, productDescription, notFoundTitle, notFoundHint, certHint } = config;
    
    // Settings store values
    const ip = useSettingsStore(s => s.simulatorIp);
    const chartsProvider = useSettingsStore(s => s.chartsProvider);

    // ── Webview rendering state ──
    const [webviewLoaded, setWebviewLoaded] = useState(false);
    const webviewAttachedRef = useRef(false);

    // ── Iframe connection states ──
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const iframeLoadedRef = useRef(false);
    const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Resolve target URL
    let moduleUrl = config.src || '';
    if (type === 'iframe' && port) {
        moduleUrl = ip ? `http://${ip}:${port}` : '';
    } else if (id === 'charts') {
        moduleUrl = CHARTS_PROVIDER_URLS[chartsProvider] || CHARTS_PROVIDER_URLS.msfs;
    }

    // ── Webview ref hook ──
    const webviewRef = (node: any) => {
        if (node && !webviewAttachedRef.current) {
            webviewAttachedRef.current = true;
            node.addEventListener('dom-ready', () => setWebviewLoaded(true));
        }
    };

    // ── Iframe connector methods ──
    const connect = async (targetIp = ip) => {
        if (type !== 'iframe' || !targetIp || !port) return;
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

    // Auto-connect iframe on mount or IP change
    useEffect(() => {
        if (type === 'iframe' && ip) {
            setTimeout(() => { void connect(ip); }, 0);
        }
        return () => {
            if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
        };
    }, [ip, type, port]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset webview loaded state when URL changes (e.g. Charts provider changes)
    useEffect(() => {
        if (type === 'webview') {
            setWebviewLoaded(false);
            webviewAttachedRef.current = false;
        }
    }, [moduleUrl, type]);

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

    // ── Render Webview ──
    if (type === 'webview') {
        return (
            <div className="w-full h-full bg-transparent flex flex-col overflow-hidden relative">
                {!webviewLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-transparent text-text-primary">
                        {config.loadingText || 'Loading...'}
                    </div>
                )}
                {/* @ts-ignore - React doesn't natively include webview definitions */}
                <webview
                    src={moduleUrl}
                    ref={webviewRef}
                    className={`w-full h-full border-0 ${webviewLoaded ? 'opacity-100' : 'opacity-0'}`}
                    title={config.label}
                    allowpopups={true}
                />
            </div>
        );
    }

    // ── Render Local Iframe Connector ──
    return (
        <div className="w-full h-full font-sans text-text-primary bg-transparent flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
                
                {/* No IP configured yet */}
                {!ip && connectionState === 'idle' && (
                    <div className="xp-empty h-full max-w-md mx-auto px-8">
                        <Plane className="w-12 h-12 text-accent-blue mb-4" />
                        <div className="text-center">
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">
                                {productName || config.label}
                            </h2>
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                {productDescription || 'Make sure your simulator IP is set correctly in Settings.'}
                            </p>
                        </div>
                        <p className="text-sm font-bold text-accent-blue/80">
                            Please configure your Simulator IP Address in the global Settings app.
                        </p>
                    </div>
                )}

                {/* Detecting */}
                {connectionState === 'detecting' && (
                    <div className="xp-empty h-full text-text-primary">
                        {config.loadingText || 'Loading...'}
                    </div>
                )}

                {/* Offline */}
                {connectionState === 'offline' && (
                    <div className="xp-empty h-full max-w-md mx-auto px-8">
                        <WifiOff className="w-12 h-12 text-accent-blue mb-4" />
                        <div className="text-center">
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">
                                {notFoundTitle || `${config.label} Not Found`}
                            </h2>
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                Could not reach <span className="text-accent-blue">{moduleUrl}</span>.
                                <br />{notFoundHint || 'Ensure the service is running and accessible.'}
                            </p>
                        </div>
                        <button onClick={() => connect()} className="xp-btn-primary">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}

                {/* Cert blocked */}
                {connectionState === 'cert_blocked' && (
                    <div className="xp-empty h-full max-w-xl mx-auto px-8">
                        <ShieldAlert className="w-12 h-12 text-accent-blue mb-4" />
                        <div className="text-center">
                            <h2 className="text-xl font-extrabold uppercase tracking-wide text-text-primary mb-2">
                                Certificate Trust Required
                            </h2>
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                {certHint || 'The connection might be blocked by a self-signed certificate.'}
                            </p>
                        </div>

                        <div className="w-full xp-panel p-5 text-left space-y-3">
                            <p className="xp-overline mb-2">One-Time Fix</p>
                            {[
                                'Click "Open in Browser" — your browser will show a security warning.',
                                'Click "Advanced" → "Proceed to ... (unsafe)" to trust the connection.',
                                'Close that tab, then click "Retry" here.',
                            ].map((text, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 bg-accent-orange/20 text-accent-orange text-xs font-bold flex items-center justify-center mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm font-medium text-text-primary leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(moduleUrl, '_blank')}
                                className="xp-btn-primary"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in Browser
                            </button>
                            <button onClick={() => connect()} className="xp-btn-ghost">
                                <RefreshCw className="w-4 h-4" /> Retry
                            </button>
                        </div>

                        <div className="flex items-start gap-2 px-4 py-3 bg-accent-blue/5 border border-accent-blue/15 max-w-md">
                            <AlertTriangle className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-text-secondary leading-relaxed">
                                You only need to trust the certificate once per browser session.
                            </p>
                        </div>
                    </div>
                )}

                {/* Iframe — connected */}
                {connectionState === 'connected' && (
                    <>
                        {!iframeLoaded && (
                            <div className="absolute inset-0 xp-empty z-10 text-text-primary">
                                {config.loadingText || 'Loading...'}
                            </div>
                        )}
                        <iframe
                            src={moduleUrl}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            className={`w-full h-full border-0 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                            title={config.label}
                            allow="fullscreen"
                        />
                    </>
                )}
            </div>
        </div>
    );
};
