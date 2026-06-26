import React, { useState } from 'react';
import { useAOCStore } from '../../stores/aocStore';
import { MessageSquare, Clock, Info, AlertTriangle, Trash2, Send, X } from 'lucide-react';
import { DELAY_CODES } from '../../utils/delayCodes';

// Derived once at module load — DELAY_CODES is static and never changes
const DELAY_CATEGORIES = Array.from(new Set(DELAY_CODES.map(c => c.category)));

export const AOCModule: React.FC = () => {
    const { events, unreadCount, markAllRead, clearEvents, addEvent } = useAOCStore();
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState('');
    const [remarks, setRemarks] = useState('');

    // Mark as read when opening the module
    React.useEffect(() => {
        if (unreadCount > 0) {
            markAllRead();
        }
    }, [unreadCount, markAllRead]);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-accent-red" />;
            case 'delay': return <Clock className="w-5 h-5 text-accent-orange" />;
            case 'info':
            default: return <Info className="w-5 h-5 text-accent-blue" />;
        }
    };

    const getBgForType = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-accent-red/10 border-accent-red/30';
            case 'delay': return 'bg-accent-orange/10 border-accent-orange/30';
            case 'info':
            default: return 'bg-white/[0.03] border-white/[0.05]';
        }
    };

    const handleSendDelay = () => {
        if (!selectedCode) return;
        const codeInfo = DELAY_CODES.find(c => c.code === selectedCode);
        if (!codeInfo) return;

        addEvent({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            title: `Delay Report Sent: ${codeInfo.code} (${codeInfo.iata})`,
            message: `${codeInfo.description}${remarks ? `\n\nRemarks: ${remarks}` : ''}`,
            type: 'info'
        });

        setShowDelayModal(false);
        setSelectedCode('');
        setRemarks('');
    };

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-6">
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                        <MessageSquare className="w-16 h-16 mb-4" />
                        <p className="text-lg font-bold">No company messages yet.</p>
                        <p className="text-sm">Dispatch events will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {events.map(event => (
                            <div 
                                key={event.id}
                                className={`rounded-xl p-5 border ${getBgForType(event.type)}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {getIconForType(event.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-text-primary text-base uppercase">{event.title}</h3>
                                            <span className="text-xs text-text-secondary bg-black/20 px-2 py-1 rounded">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-text-primary leading-relaxed text-sm whitespace-pre-wrap mt-2">
                                            {event.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Send Delay Panel (collapsible inline card) ── */}
            {showDelayModal && (
                <div className="shrink-0 mx-6 md:mx-8 mb-4 p-6 glass-panel z-20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-start z-10 mb-6">
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                                <Clock className="w-5 h-5 text-accent-orange" />
                                Send Delay
                            </h2>
                            <p className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-widest mt-1">AOC Messaging System</p>
                        </div>
                        <button onClick={() => setShowDelayModal(false)} className="p-1.5 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all active:scale-95">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase text-text-secondary tracking-widest">
                                IATA Delay Code
                            </label>
                            <div className="relative">
                                <select 
                                    value={selectedCode}
                                    onChange={(e) => setSelectedCode(e.target.value)}
                                    className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-bold text-text-primary focus:outline-none focus:border-accent-orange focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-dark-bg text-text-secondary">Select a delay reason...</option>
                                    {DELAY_CATEGORIES.map(cat => (
                                        <optgroup key={cat} label={cat} className="bg-dark-bg font-black text-accent-orange">
                                            {DELAY_CODES.filter(c => c.category === cat).map(c => (
                                                <option key={c.code} value={c.code} className="bg-dark-bg text-text-primary font-bold">
                                                    {c.code} ({c.iata}) - {c.description}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase text-text-secondary tracking-widest">
                                Remarks (Optional)
                            </label>
                            <textarea 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter any additional details..."
                                className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-orange focus:bg-white/[0.05] transition-all resize-none h-[52px]"
                            />
                        </div>
                    </div>

                    <div className="pt-5 mt-5 flex justify-end gap-3 border-t border-white/[0.05]">
                        <button 
                            onClick={handleSendDelay}
                            disabled={!selectedCode}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-accent-orange text-black font-black text-xs uppercase tracking-wider hover:bg-accent-orange/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(250,169,22,0.2)]"
                        >
                            <Send className="w-4 h-4" />
                            Transmit
                        </button>
                    </div>
                </div>
            )}

            {/* ── Bottom Toolbar ── */}
            <div className="shrink-0 px-6 md:px-8 py-4 border-t border-white/[0.05] bg-black/20 flex items-center justify-end z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowDelayModal(true)}
                        className="glass-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-accent-orange hover:text-accent-orange/80 transition-all active:scale-95"
                    >
                        <Clock className="w-4 h-4" />
                        Send Delay
                    </button>
                    {events.length > 0 && (
                        <button 
                            onClick={clearEvents}
                            className="glass-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-accent-red hover:text-accent-red/80 transition-all active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
