import { useState, useEffect } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

export const GlobalHeader: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const { activeModule, setActiveModule } = useUIStore();

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const dateStr = time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="w-full flex justify-between items-center py-1 px-1 text-text-secondary text-sm font-medium z-50">
            {/* Left: Navigation & Time and Date */}
            <div className="flex items-center gap-5 drop-shadow-md">
                {activeModule !== 'home' && (
                    <button 
                        onClick={() => setActiveModule('home')}
                        className="flex items-center justify-center gap-0.5 hover:opacity-80 transition-all font-bold text-accent-blue active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> xPad
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{hours}:{minutes}</span>
                    <span>{dateStr}</span>
                </div>
            </div>

            {/* Right: Status Icons */}
            <div className="flex items-center gap-4">
                <button className="w-8 h-8 flex items-center justify-center rounded-full glass-button group">
                    <Bell className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </button>
            </div>
        </div>
    );
};
