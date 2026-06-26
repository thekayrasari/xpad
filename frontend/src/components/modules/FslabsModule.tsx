import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const FslabsModule: React.FC = () => (
    <IframeConnectorModule
        port={23032}
        storageKey="xpad-fslabs-ip"
        productName="FSLabs xPad"
        productDescription="Enter the local network IP of the PC running your flight sim above to connect to the FSLabs A320-X/A319-X/A321-X EFB."
        notFoundTitle="FSLabs EFB Not Found"
        notFoundHint="Make sure MSFS/P3D is running with an FSLabs aircraft loaded, or check the IP address."
        certHint="FSLabs EFB is running but the browser is blocking the connection. This is a one-time setup."
        loadingText="Loading FSLabs EFB…"
        iframeTitle="FSLabs EFB"
        selfModule={{ id: 'fslabs', label: 'FSLabs', storageValue: 'fslabs' }}
        alternateModule={{ id: 'fenix', label: 'Fenix', storageValue: 'fenix' }}
    />
);
