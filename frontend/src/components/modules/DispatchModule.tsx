import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';

export const DispatchModule: React.FC = () => {
    const [iframeLoaded, setIframeLoaded] = useState(false);

    return (
        <div className="w-full h-full bg-transparent flex flex-col overflow-hidden relative">
            {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center z-10 bg-transparent">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
                            <ClipboardList className="w-7 h-7 text-[#10b981]" />
                        </div>
                        <div className="absolute inset-0 rounded-xl border-2 border-[#10b981]/30 animate-ping" />
                    </div>
                    <p className="text-sm font-bold uppercase text-text-secondary">Loading SimBrief Dispatch...</p>
                </div>
            )}
            {/* @ts-ignore - React doesn't natively include webview definitions */}
            <webview
                src="https://dispatch.simbrief.com/"
                ref={(node: any) => {
                    if (node) {
                        node.addEventListener('dom-ready', () => setIframeLoaded(true));
                    }
                }}
                className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                title="SimBrief Dispatch"
                allowpopups={true}
            />
        </div>
    );
};
