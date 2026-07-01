import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const FenixModule: React.FC = () => (
    <IframeConnectorModule
        port={8083}
        storageKey="xpad-fenix-ip"
        productName="Fenix EFB"
        productDescription="Enter the local network IP of the PC running your flight sim above to connect to the Fenix A320/A330 EFB."
        notFoundTitle="Fenix EFB Not Found"
        notFoundHint="Make sure MSFS is running with a Fenix aircraft loaded, or check the IP address."
        certHint="Fenix EFB is running but the browser is blocking the connection. This is a one-time setup."
        loadingText="Loading Fenix EFB…"
        iframeTitle="Fenix EFB"
        selfModule={{ id: 'fenix', label: 'Fenix', storageValue: 'fenix' }}
        alternateModule={{ id: 'fslabs', label: 'FSLabs', storageValue: 'fslabs' }}
    />
);
