import { useEffect, useRef } from 'react';
import { useFlightStore } from '../stores/flightStore';
import { useAOCStore } from '../stores/aocStore';
import { useVPilotStore } from '../stores/vpilotStore';

export function useFlightDataConnection(url: string = 'ws://localhost:8080') {
    const updateFlight = useFlightStore((state) => state.updateFlight);
    const setConnectionStatus = useFlightStore((state) => state.setConnectionStatus);
    const wsRef = useRef<WebSocket | null>(null);
    const retryCount = useRef(0);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Connected to Flight Data WebSocket');
                retryCount.current = 0; // Reset counter on success
                setConnectionStatus(true);
                
                // Expose sendMessage to vPilotStore
                useVPilotStore.getState().setSendWsMessage((topic: string, payload: any) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ topic, payload }));
                    }
                });
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    if (message.topic === 'flight_data') {
                        updateFlight(message.payload);
                    } else if (message.topic === 'aoc_event') {
                        useAOCStore.getState().addEvent(message.payload);
                    } else if (message.topic.startsWith('vpilot_')) {
                        const vStore = useVPilotStore.getState();
                        
                        // Fallback connection sync: if we missed the connection event but received a vpilot message, assume online
                        if (!vStore.isConnected && (message.topic === 'vpilot_message_received' || message.topic === 'vpilot_controller_added' || message.topic === 'vpilot_controller_updated')) {
                            vStore.setConnectionStatus(true);
                        }

                        if (message.topic === 'vpilot_connection_status') {
                            vStore.setConnectionStatus(message.payload.isConnected);
                        } else if (message.topic === 'vpilot_frequencies') {
                            vStore.setFrequencies(message.payload.com1, message.payload.com2);
                        } else if (message.topic === 'vpilot_message_received') {
                            if (message.payload.isPrivate) {
                                vStore.addPmTab(message.payload.sender);
                            }
                            vStore.addMessage({
                                ...message.payload,
                                id: Date.now().toString() + Math.random().toString(),
                                timestamp: Date.now()
                            });
                        } else if (message.topic === 'vpilot_controller_added') {
                            vStore.addController(message.payload);
                        } else if (message.topic === 'vpilot_controller_deleted') {
                            vStore.removeController(message.payload.callsign);
                        } else if (message.topic === 'vpilot_controller_updated') {
                            vStore.updateController(message.payload.callsign, message.payload.frequency);
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse websocket data', err);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('Disconnected from Flight Data WebSocket');
                setConnectionStatus(false);
                useVPilotStore.getState().setSendWsMessage(null as any);
                wsRef.current = null;
                
                // Exponential backoff: 3s, 6s, 12s, up to max 30s
                const backoff = Math.min(3000 * Math.pow(2, retryCount.current), 30000);
                retryCount.current++;
                reconnectTimeoutRef.current = setTimeout(connect, backoff);
            };
        };

        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                // Ensure we don't trigger the reconnect timeout on unmount
                wsRef.current.onclose = null; 
                wsRef.current.close();
                setConnectionStatus(false);
            }
        };
    }, [url, updateFlight, setConnectionStatus]);
}
