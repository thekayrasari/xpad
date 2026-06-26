import React, { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const PROVIDER_URLS = {
    msfs: 'https://planner.flightsimulator.com/',
    navigraph: 'https://charts.navigraph.com/',
    chartfox: 'https://chartfox.org/'
};

export const ChartsModule: React.FC = () => {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const { chartsProvider } = useSettingsStore();

    return (
        <div className="w-full h-full bg-transparent flex flex-col overflow-hidden relative">
            {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center z-10 bg-transparent">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center">
                            <MapIcon className="w-7 h-7 text-[#ec4899]" />
                        </div>
                        <div className="absolute inset-0 rounded-xl border-2 border-[#ec4899]/30 animate-ping" />
                    </div>
                    <p className="text-sm font-bold uppercase text-text-secondary">Loading Charts...</p>
                </div>
            )}
            {/* @ts-ignore - React doesn't natively include webview definitions */}
            <webview
                src={PROVIDER_URLS[chartsProvider] || PROVIDER_URLS.msfs}
                ref={(node: any) => {
                    if (node) {
                        node.addEventListener('dom-ready', () => setIframeLoaded(true));
                    }
                }}
                className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                title="Charts"
                allowpopups={true}
            />
        </div>
    );
};
