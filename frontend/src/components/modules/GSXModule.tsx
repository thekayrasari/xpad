import React from 'react';
import { IframeConnectorModule } from './IframeConnectorModule';

export const GSXModule: React.FC = () => {
    return (
        <IframeConnectorModule
            port={8744}
            productName="GSX Pro Remote"
            productDescription="Make sure your simulator IP is set correctly in the Settings app."
            notFoundTitle="GSX Not Found"
            notFoundHint="Ensure GSX is running and the Remote Server is enabled in its settings."
            certHint="GSX might use a self-signed certificate for local connections."
            loadingText="Connecting to GSX..."
            iframeTitle="GSX Pro Web Remote"
        />
    );
};
