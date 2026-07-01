import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const GSXModule: React.FC = () => {
    return (
        <IframeConnectorModule
            port={8744}
            storageKey="xpad-gsx-ip"
            productName="GSX Pro Remote"
            productDescription="Access the FSDreamTeam GSX Pro web interface to control ground services."
            notFoundTitle="GSX Not Found"
            notFoundHint="Ensure GSX is running and the Remote Server is enabled in its settings."
            certHint="GSX might use a self-signed certificate for local connections."
            loadingText="Connecting to GSX..."
            iframeTitle="GSX Pro Web Remote"
            alternateModule={{ id: 'fenix', label: 'Aircraft EFB', storageValue: 'fenix' }}
            selfModule={{ id: 'gsx', label: 'GSX', storageValue: 'gsx' }}
        />
    );
};
