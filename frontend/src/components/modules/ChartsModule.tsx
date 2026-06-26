import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { WebviewModule } from './WebviewModule';

const PROVIDER_URLS: Record<string, string> = {
    msfs: 'https://planner.flightsimulator.com/',
    navigraph: 'https://charts.navigraph.com/',
    chartfox: 'https://chartfox.org/',
};

export const ChartsModule: React.FC = () => {
    const { chartsProvider } = useSettingsStore();

    return (
        <WebviewModule
            src={PROVIDER_URLS[chartsProvider] || PROVIDER_URLS.msfs}
            title="Charts"
            icon={MapIcon}
            iconColor="#ec4899"
            loadingText="Loading Charts..."
        />
    );
};
