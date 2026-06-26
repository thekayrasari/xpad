import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

export const GlobalHeader: React.FC = () => {
    const { activeModule, setActiveModule } = useUIStore();

    return (
        <div className="w-full flex justify-between items-center py-1 px-1 text-text-secondary text-sm font-medium z-50">
            {/* Left: Navigation */}
            <div className="flex items-center gap-5 drop-shadow-md">
                {activeModule !== 'home' && (
                    <button 
                        onClick={() => setActiveModule('home')}
                        className="flex items-center justify-center gap-0.5 hover:opacity-80 transition-all font-bold text-accent-blue active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> xPad
                    </button>
                )}
            </div>
        </div>
    );
};
