import React, { useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface WebviewModuleProps {
    src: string;
    title: string;
    icon: LucideIcon;
    iconColor: string;
    loadingText: string;
}

export const WebviewModule: React.FC<WebviewModuleProps> = ({ src, title }) => {
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
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-transparent text-text-primary">
                    Loading...
                </div>
            )}
            {/* @ts-ignore - React doesn't natively include webview definitions */}
            <webview
                src={src}
                ref={webviewRef}
                className={`w-full h-full border-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                title={title}
                allowpopups={true}
            />
        </div>
    );
};
