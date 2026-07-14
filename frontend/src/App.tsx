import { useEffect } from 'react';
import { useFlightDataConnection } from './hooks/useFlightDataConnection';
import { ModuleContainer } from './components/ModuleContainer';
import { Sidebar } from './components/Sidebar';
import { useSettingsStore } from './stores/settingsStore';

const App = () => {
    useFlightDataConnection();
    const fetchSettings = useSettingsStore(s => s.fetchSettings);

    useEffect(() => {
        void fetchSettings();
    }, [fetchSettings]);

    return (
        <div className="absolute inset-0 flex flex-row overflow-hidden bg-dark-bg text-text-primary font-sans select-none">
            {/* Persistent Left Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 h-full overflow-hidden relative flex flex-col">
                <ModuleContainer />
            </div>
        </div>
    );
};

export default App;
