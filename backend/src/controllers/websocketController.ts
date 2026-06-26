import { WebSocketServer, WebSocket } from 'ws';
import { FlightDataService } from '../services/flightDataService';

export class WebSocketController {
    private wss: WebSocketServer;
    private cleanupFlight: () => void;

    constructor(port: number, flightService: FlightDataService) {
        this.wss = new WebSocketServer({ port });

        console.log(`WebSocket server initialized on port ${port}`);

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected to WebSocket.');
            ws.on('error', console.error);
            ws.on('close', () => {
                console.log('Client disconnected from WebSocket.');
            });
        });

        // Subscribe to flight data
        this.cleanupFlight = flightService.subscribe((data) => {
            this.broadcast('flight_data', data);
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
