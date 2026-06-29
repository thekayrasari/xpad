import React from 'react';
import { ClipboardList } from 'lucide-react';
import { WebviewModule } from './WebviewModule';

export const SimbriefModule: React.FC = () => (
    <WebviewModule
        src="https://dispatch.simbrief.com/"
        title="SimBrief"
        icon={ClipboardList}
        iconColor="#10b981"
        loadingText="Loading SimBrief..."
    />
);
