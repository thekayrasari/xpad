import React, { useState } from 'react';
import { useAOCStore } from '../../stores/aocStore';
import { MessageSquare, Clock, Info, AlertTriangle, Trash2, Send, X } from 'lucide-react';
import { DELAY_CODES } from '../../utils/delayCodes';

// Derived once at module load — DELAY_CODES is static and never changes
const DELAY_CATEGORIES = Array.from(new Set(DELAY_CODES.map(c => c.category)));

export const AOCModule: React.FC = () => {
    const { events, unreadCount, markAllRead, deleteEvent, addEvent } = useAOCStore();
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
            case 'delay':   return <Clock className="w-5 h-5 text-accent-orange" />;
            case 'info':
            default:        return <Info className="w-5 h-5 text-accent-blue" />;
        }
    };

    const getBgForType = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-accent-red/10 border-accent-red/30';
            case 'delay':   return 'bg-accent-orange/10 border-accent-orange/30';
            case 'info':
            default:        return 'bg-pane-bg border-border-dark';
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
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden relative">
            {/* ── Messages List ── */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-20 relative">
                {events.length === 0 ? (
                    <div className="xp-empty h-full">
                        <MessageSquare className="w-16 h-16" />
                        <p className="text-lg font-bold">No company messages yet.</p>
                        <p className="text-sm">Dispatch events will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="space-y-3 w-full">
                        {events.map(event => (
                            <div
                                key={event.id}
                                className={`xp-panel p-4 border ${getBgForType(event.type)}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5">{getIconForType(event.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center">
                                                <span className="xp-badge ml-2 shrink-0">
                                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                                <button 
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="xp-btn-ghost p-1 ml-2 text-text-secondary hover:text-accent-red"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-text-primary leading-relaxed text-sm whitespace-pre-wrap mt-1">
                                            {event.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Send Delay Button */}
                <button
                    onClick={() => setShowDelayModal(true)}
                    className="xp-btn-primary absolute bottom-6 right-8 shadow-lg z-10"
                >
                    <Clock className="w-4 h-4" />
                    Send Delay
                </button>
            </div>

            {/* ── Send Delay Modal (Overlay) ── */}
            {showDelayModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg xp-panel shadow-2xl flex flex-col overflow-hidden">
                        <div className="xp-panel-header justify-between shrink-0">
                            <h2 className="xp-section-title flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent-orange" />
                                Send Delay Report
                            </h2>
                            <button onClick={() => setShowDelayModal(false)} className="xp-btn-ghost p-1.5 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="xp-label">IATA Delay Code</label>
                                <div className="relative">
                                    <select
                                        value={selectedCode}
                                        onChange={(e) => setSelectedCode(e.target.value)}
                                        className="xp-input appearance-none cursor-pointer pr-8"
                                    >
                                        <option value="" disabled className="bg-dark-bg text-text-secondary">
                                            Select a delay reason...
                                        </option>
                                        {DELAY_CATEGORIES.map(cat => (
                                            <optgroup key={cat} label={cat} className="bg-dark-bg font-bold text-accent-orange">
                                                {DELAY_CODES.filter(c => c.category === cat).map(c => (
                                                    <option key={c.code} value={c.code} className="bg-dark-bg text-text-primary">
                                                        {c.code} ({c.iata}) - {c.description}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-xs">▼</div>
                                </div>
                            </div>

                            <div>
                                <label className="xp-label">Remarks (Optional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter any additional details..."
                                    className="xp-input resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="xp-toolbar justify-end gap-3 border-t border-border-dark px-6 py-4 bg-nav-bg">
                            <button
                                onClick={() => setShowDelayModal(false)}
                                className="xp-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendDelay}
                                disabled={!selectedCode}
                                className="xp-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                Transmit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
