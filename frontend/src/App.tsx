import { useFlightDataConnection } from './hooks/useFlightDataConnection';
import { ModuleContainer } from './components/ModuleContainer';
import { ThemeProvider } from './components/ThemeProvider';
import { GlobalHeader } from './components/GlobalHeader';
import { useUIStore } from './stores/uiStore';

const App = () => {
    useFlightDataConnection();
    const { setActiveModule } = useUIStore();

    return (
        <ThemeProvider>
            {/* Background Gradients to make glassmorphism visible */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-dark-bg">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-teal/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-blue/20 blur-[120px]" />
            </div>

            <div className="h-screen w-screen flex flex-col overflow-hidden p-2 gap-2 relative">
                <GlobalHeader />
                <div className="flex-1 w-full overflow-hidden relative z-10">
                    <ModuleContainer />
                </div>
            </div>
        </ThemeProvider>
    );
};

export default App;
