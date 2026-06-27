import { useVPilotStore } from '../../stores/vpilotStore';
import { MessageSquare, Send, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const VPilotModule = () => {
    const { isConnected, com1, com2, messages, controllers, activeTab, pmTabs, setActiveTab, addPmTab, removePmTab, sendWsMessage } = useVPilotStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredMessages = messages.filter(m => {
        return m.tab === activeTab;
    });

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
            content: textToSend, // No need for "To recipient:" anymore since it's in its own tab
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 text-text-primary">
            {/* Header / Radio Panel */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">COM 1</span>
                    <span className="text-2xl font-bold text-accent-blue">{com1}</span>
                </div>
                <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">COM 2</span>
                    <span className="text-2xl font-bold text-text-secondary">{com2}</span>
                </div>
                <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">Network</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent-green' : 'bg-accent-red animate-pulse'}`} />
                        <span className="font-bold">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Chat Interface */}
                <div className="flex-1 flex flex-col bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-white/[0.05] overflow-x-auto no-scrollbar">
                        {['ATC'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 px-6 text-sm font-bold transition-all duration-200 min-w-max ${activeTab === tab ? 'bg-white/[0.08] text-white' : 'text-text-secondary hover:bg-white/[0.04]'}`}
                            >
                                {tab}
                            </button>
                        ))}
                        {pmTabs.map(tab => (
                            <div key={tab} className={`flex items-center flex-1 min-w-max transition-all duration-200 ${activeTab === tab ? 'bg-white/[0.08] text-white' : 'text-text-secondary hover:bg-white/[0.04]'}`}>
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className="flex-1 py-3 pl-6 pr-2 text-sm font-bold text-left"
                                >
                                    {tab}
                                </button>
                                <button 
                                    onClick={() => removePmTab(tab)}
                                    className="p-1 mr-4 rounded-md hover:bg-white/[0.1] text-text-secondary hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {filteredMessages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                <MessageSquare className="w-12 h-12 mb-2" />
                                <span>No messages yet</span>
                            </div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.isSentByMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-text-secondary mb-1 px-1">{msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.isSentByMe ? 'bg-accent-blue text-white rounded-br-sm' : 'bg-white/[0.08] text-text-primary rounded-bl-sm'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/[0.05] flex gap-2 bg-black/20">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Message ${activeTab}...`}
                            className="flex-1 bg-white/[0.05] border border-white/[0.05] rounded-xl px-4 py-2 text-white outline-none focus:border-accent-blue/50 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!isConnected || !inputText.trim()}
                            className="bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 disabled:hover:bg-accent-blue text-white p-2 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center w-10"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Controllers Sidebar */}
                <div className="w-64 flex flex-col bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] overflow-hidden">
                    <div className="p-4 border-b border-white/[0.05] bg-black/10">
                        <h3 className="font-bold text-xs tracking-widest text-text-secondary">ACTIVE CONTROLLERS</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                        {controllers.length === 0 ? (
                            <div className="p-4 text-center text-xs text-text-secondary opacity-50 mt-4">
                                No controllers online
                            </div>
                        ) : (
                            controllers.map(c => (
                                <div 
                                    key={c.callsign} 
                                    onClick={() => handleTuneRadio(c.frequency)}
                                    className="flex justify-between items-center p-3 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.02] cursor-pointer select-none"
                                    title="Click to tune COM1"
                                >
                                    <span className="font-bold text-sm tracking-wide">{c.callsign}</span>
                                    <span className="text-xs text-accent-blue font-mono font-bold bg-accent-blue/10 px-2 py-1 rounded-md">{c.frequency}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
