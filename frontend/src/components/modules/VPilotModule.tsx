import { useVPilotStore } from '../../stores/vpilotStore';
import { MessageSquare, Send, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const VPilotModule = () => {
    const { isConnected, com1, com2, messages, controllers, activeTab, pmTabs, setActiveTab, addPmTab, removePmTab, sendWsMessage } = useVPilotStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredMessages = messages.filter(m => m.tab === activeTab);

    const handleSend = () => {
        if (!inputText.trim() || !sendWsMessage) return;

        let freq = com1;
        if (activeTab === 'UNICOM') freq = '122.800';

        let textToSend = inputText;
        let isPriv = activeTab !== 'ATC' && activeTab !== 'UNICOM';
        let recipient = isPriv ? activeTab : '';

        if (textToSend.toLowerCase().startsWith('.msg ') || textToSend.toLowerCase().startsWith('.chat ')) {
            const parts = textToSend.split(' ');
            if (parts.length > 2) {
                recipient = parts[1].toUpperCase();
                textToSend = parts.slice(2).join(' ');
                isPriv = true;
                addPmTab(recipient);
                setActiveTab(recipient);
            }
        }

        sendWsMessage('vpilot_send_message', {
            content: textToSend,
            frequency: freq,
            isPrivate: isPriv,
            recipient: recipient
        });

        // Optimistically add message
        useVPilotStore.getState().addMessage({
            id: Date.now().toString(),
            sender: 'Me',
            content: textToSend,
            frequency: freq,
            timestamp: Date.now(),
            isPrivate: isPriv,
            isSentByMe: true,
            tab: isPriv ? recipient : activeTab
        });

        setInputText('');
    };

    const handleTuneRadio = (frequency: string) => {
        if (!sendWsMessage) return;
        sendWsMessage('vpilot_tune_radio', { frequency });
    };

    const handleFreqDoubleClick = (freq: string) => {
        if (!sendWsMessage) return;

        const controller = useVPilotStore.getState().controllers.find(c => c.frequency === freq);
        const target = controller ? controller.callsign : freq;
        const textToSend = `.atis ${target}`;

        sendWsMessage('vpilot_send_message', {
            content: textToSend,
            frequency: com1,
            isPrivate: false,
            recipient: ''
        });

        useVPilotStore.getState().addMessage({
            id: Date.now().toString(),
            sender: 'Me',
            content: textToSend,
            frequency: com1,
            timestamp: Date.now(),
            isPrivate: false,
            isSentByMe: true,
            tab: activeTab
        });
    };

    const renderMessageContent = (content: string) => {
        const freqRegex = /\b1[1-3][0-9]\.[0-9]{2,3}\b/g;
        const parts = content.split(freqRegex);
        const matches = content.match(freqRegex);

        if (!matches) return content;

        return parts.map((part, i) => (
            <span key={i}>
                {part}
                {matches[i] && (
                    <span
                        onDoubleClick={() => handleFreqDoubleClick(matches[i])}
                        className="cursor-pointer text-accent-blue font-bold hover:underline hover:text-accent-blue/80 transition-colors"
                        title="Double-click to fetch ATIS"
                    >
                        {matches[i]}
                    </span>
                )}
            </span>
        ));
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 text-text-primary">
            {/* Header / Radio Panel */}
            <div className="flex gap-4 shrink-0">
                <div className="xp-stat-card flex-1">
                    <span className="xp-overline">COM 1</span>
                    <span className="text-2xl font-bold text-accent-blue">{com1}</span>
                </div>
                <div className="xp-stat-card flex-1">
                    <span className="xp-overline">COM 2</span>
                    <span className="text-2xl font-bold text-text-secondary">{com2}</span>
                </div>
                <div className="xp-stat-card flex-1">
                    <span className="xp-overline">Network</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2.5 h-2.5 ${isConnected ? 'bg-accent-green' : 'bg-accent-red'}`} />
                        <span className="font-bold text-sm">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Chat Interface */}
                <div className="flex-1 flex flex-col xp-panel overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-border-dark overflow-x-auto no-scrollbar bg-nav-bg">
                        {['ATC'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors min-w-max
                                    ${activeTab === tab ? 'xp-tab xp-tab-active' : 'xp-tab'}`}
                            >
                                {tab}
                            </button>
                        ))}
                        {pmTabs.map(tab => (
                            <div
                                key={tab}
                                className={`flex items-center min-w-max transition-colors
                                    ${activeTab === tab ? 'xp-tab xp-tab-active' : 'xp-tab'}`}
                            >
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className="flex-1 py-1 pl-2 pr-1 text-xs font-bold text-left"
                                >
                                    {tab}
                                </button>
                                <button
                                    onClick={() => removePmTab(tab)}
                                    className="xp-btn-ghost p-1 mr-2"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Message List */}
                    <div key={activeTab} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
                        {filteredMessages.length === 0 ? (
                            <div className="xp-empty flex-1">
                                <MessageSquare className="w-10 h-10" />
                                <span className="text-sm font-bold">No messages yet</span>
                            </div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.isSentByMe ? 'items-end' : 'items-start'}`}>
                                    <span className="xp-overline mb-1 px-1">
                                        {msg.sender} · {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                    <div className={`px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm
                                        ${msg.isSentByMe
                                            ? 'bg-accent-blue text-white'
                                            : 'bg-nav-hover text-text-primary border border-border-dark'}`}
                                    >
                                        {renderMessageContent(msg.content)}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div className="xp-toolbar gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Message ${activeTab}...`}
                            className="xp-input flex-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!isConnected || !inputText.trim()}
                            className="xp-btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-10 h-9 p-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Controllers Sidebar */}
                <div className="w-60 flex flex-col xp-panel overflow-hidden">
                    <div className="xp-panel-header">
                        <span className="xp-section-title">Active Controllers</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5 hide-scrollbar">
                        {controllers.length === 0 ? (
                            <div className="xp-empty py-8">
                                <span className="text-xs">No controllers online</span>
                            </div>
                        ) : (
                            controllers.map(c => (
                                <div
                                    key={c.callsign}
                                    onClick={() => handleTuneRadio(c.frequency)}
                                    className="flex justify-between items-center px-3 py-2.5
                                               hover:bg-nav-hover border border-transparent hover:border-border-dark
                                               cursor-pointer transition-colors"
                                    title="Click to tune COM1"
                                >
                                    <span className="font-bold text-sm tracking-wide">{c.callsign}</span>
                                    <span className="xp-badge text-accent-blue border-accent-blue/30 bg-accent-blue/10">
                                        {c.frequency}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
