import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const FenixModule: React.FC = () => (
    <IframeConnectorModule
        port={8083}
        productName="Fenix EFB"
        productDescription="Make sure your simulator IP is set correctly in the Settings app."
        notFoundTitle="Fenix EFB Not Found"
        notFoundHint="Make sure MSFS is running with a Fenix aircraft loaded, or check the IP address in Settings."
        certHint="Fenix EFB is running but the browser is blocking the connection. This is a one-time setup."
        loadingText="Loading Fenix EFB…"
        iframeTitle="Fenix EFB"
    />
);
