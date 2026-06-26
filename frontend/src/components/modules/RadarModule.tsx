import React from 'react';
import { Radar } from 'lucide-react';
import { WebviewModule } from './WebviewModule';

export const RadarModule: React.FC = () => (
    <WebviewModule
        src="https://vatsim-radar.com/"
        title="VATSIM Radar"
        icon={Radar}
        iconColor="#3b82f6"
        loadingText="Loading Radar..."
    />
);
