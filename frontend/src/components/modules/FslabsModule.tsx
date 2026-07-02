import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const FslabsModule: React.FC = () => (
    <IframeConnectorModule
        port={23032}
        productName="FSLabs EFB"
        productDescription="Make sure your simulator IP is set correctly in the Settings app."
        notFoundTitle="FSLabs EFB Not Found"
        notFoundHint="Make sure MSFS is running with a FSLabs aircraft loaded, or check the IP address in Settings."
        certHint="FSLabs EFB is running but the browser is blocking the connection. This is a one-time setup."
        loadingText="Loading FSLabs EFB…"
        iframeTitle="FSLabs EFB"
    />
);
