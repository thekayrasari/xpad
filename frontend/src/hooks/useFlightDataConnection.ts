import { useEffect, useRef } from 'react';
import { useFlightStore } from '../store';
import { useAOCStore } from '../stores/aocStore';

export function useFlightDataConnection(url: string = 'ws://localhost:8080') {
    const updateFlight = useFlightStore((state) => state.updateFlight);
    const setConnectionStatus = useFlightStore((state) => state.setConnectionStatus);
    const wsRef = useRef<WebSocket | null>(null);
    const retryCount = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Connected to Flight Data WebSocket');
                retryCount.current = 0; // Reset counter on success
                setConnectionStatus(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    if (message.topic === 'flight_data') {
                        updateFlight(message.payload);
                    } else if (message.topic === 'aoc_event') {
                        useAOCStore.getState().addEvent(message.payload);
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
