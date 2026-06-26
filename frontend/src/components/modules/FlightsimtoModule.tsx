import React from 'react';
import { Download } from 'lucide-react';
import { WebviewModule } from './WebviewModule';

export const FlightsimtoModule: React.FC = () => (
    <WebviewModule
        src="https://flightsim.to/"
        title="Flightsim.to"
        icon={Download}
        iconColor="#06b6d4"
        loadingText="Loading Flightsim.to..."
    />
);
