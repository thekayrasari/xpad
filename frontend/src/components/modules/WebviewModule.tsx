import React, { useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface WebviewModuleProps {
    src: string;
    title: string;
    icon: LucideIcon;
    iconColor: string;
    loadingText: string;
}

export const WebviewModule: React.FC<WebviewModuleProps> = ({ src, title, icon: Icon, iconColor, loadingText }) => {
    const [loaded, setLoaded] = useState(false);
    const attachedRef = useRef(false);

    const webviewRef = (node: any) => {
        if (node && !attachedRef.current) {
            attachedRef.current = true;
            node.addEventListener('dom-ready', () => setLoaded(true));
        }
    };

    return (
        <div className="w-full h-full bg-transparent flex flex-col overflow-hidden relative">
            {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center z-10 bg-transparent">
                    <div className="relative">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${iconColor}1a`, borderColor: `${iconColor}33`, borderWidth: 1, borderStyle: 'solid' }}
                        >
                            <Icon className="w-7 h-7" style={{ color: iconColor }} />
                        </div>
                        <div
                            className="absolute inset-0 rounded-xl border-2 animate-ping"
                            style={{ borderColor: `${iconColor}4d` }}
                        />
                    </div>
                    <p className="text-sm font-bold uppercase text-text-secondary">{loadingText}</p>
                </div>
            )}
            {/* @ts-ignore - React doesn't natively include webview definitions */}
            <webview
                src={src}
                ref={webviewRef}
                className={`w-full h-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                title={title}
                allowpopups={true}
            />
        </div>
    );
};
