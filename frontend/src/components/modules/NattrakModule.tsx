import React from 'react';
import { Navigation } from 'lucide-react';
import { WebviewModule } from './WebviewModule';

export const NattrakModule: React.FC = () => (
    <WebviewModule
        src="https://nattrak.vatsim.net/"
        title="NatTrak"
        icon={Navigation}
        iconColor="#14b8a6"
        loadingText="Loading NatTrak..."
    />
);
