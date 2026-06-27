import { WebSocketServer, WebSocket } from 'ws';
import { FlightDataService } from '../services/flightDataService';

export class WebSocketController {
    private wss: WebSocketServer;
    private cleanupFlight: () => void;
    private lastConnectionStatus: unknown = null;

    constructor(port: number, flightService: FlightDataService) {
        this.wss = new WebSocketServer({ port });

        console.log(`WebSocket server initialized on port ${port}`);

        // Subscribe to flight data
        this.cleanupFlight = flightService.subscribe((data) => {
            this.broadcast('flight_data', data);
            
            // Extract and broadcast com1/com2 for vPilot
            const { com1, com2 } = data as any;
            if (com1 && com2) {
                this.broadcast('vpilot_frequencies', { com1, com2 });
            }
        });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected to WebSocket.');
            if (this.lastConnectionStatus) {
                ws.send(JSON.stringify({ topic: 'vpilot_connection_status', payload: this.lastConnectionStatus }));
            }
            
            ws.on('message', (data: Buffer) => {
                try {
                    const parsed = JSON.parse(data.toString());
                    // If a client (frontend or plugin) sends a vpilot message, broadcast it
                    // so the other side receives it.
                    if (parsed.topic && parsed.topic.startsWith('vpilot_')) {
                        if (parsed.topic === 'vpilot_connection_status') {
                            this.lastConnectionStatus = parsed.payload;
                        } else if (parsed.topic === 'vpilot_tune_radio') {
                            const freqStr = parsed.payload.frequency;
                            const mhz = parseFloat(freqStr);
                            if (!isNaN(mhz)) {
                                flightService.tuneCom1(mhz);
                            }
                        }
                        this.broadcast(parsed.topic, parsed.payload);
                    }
                } catch (e) {
                    console.error('Failed to parse incoming WS message:', e);
                }
            });

            ws.on('error', console.error);
            ws.on('close', () => {
                console.log('Client disconnected from WebSocket.');
            });
        });
    }

    public broadcast(topic: string, payload: unknown) {
        const message = JSON.stringify({ topic, payload });
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    public shutdown() {
        if (this.cleanupFlight) this.cleanupFlight();
        this.wss.close();
    }
}
