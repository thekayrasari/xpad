import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { FlightDataService } from './services/flightDataService';
import { WebSocketController } from './controllers/websocketController';

// Handle global exceptions
process.on('uncaughtException', (err: any) => {
    console.error("Fatal Unhandled Exception:", err);
    process.exit(1);
});

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
if (isDev) {
    app.use(cors({ origin: 'http://localhost:5173' })); // Allow Vite dev server
} else {
    // In production, the frontend is served locally via express.static, 
    // so no CORS is needed. Wildcard CORS is disabled for security.
    app.use(cors({ origin: false })); 
}

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

const HTTP_PORT = process.env.HTTP_PORT ? (parseInt(process.env.HTTP_PORT, 10) || 3001) : 3001;
const WS_PORT = process.env.WS_PORT ? (parseInt(process.env.WS_PORT, 10) || 8080) : 8080;

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mockMode: true });
});

// ── Aviation Weather Proxy ─────────────────────────────────────────────────────
// AWC blocks CORS from browsers; we proxy the request server-side instead.
async function proxyAWC(endpoint: string, req: express.Request, res: express.Response) {
    const ids = req.query.ids as string;
    if (!ids) return res.status(400).json({ error: 'ids param required' });
    try {
        const url = `https://aviationweather.gov/api/data/${endpoint}?ids=${encodeURIComponent(ids)}&format=json`;
        const upstream = await fetch(url);
        if (!upstream.ok) {
            return res.status(upstream.status).json({ error: `Upstream error: ${upstream.statusText}` });
        }
        const data = await upstream.json();
        res.json(data);
    } catch (err: any) {
        res.status(502).json({ error: `Failed to fetch ${endpoint.toUpperCase()}`, detail: err.message });
    }
}

app.get('/api/weather/metar', (req, res) => proxyAWC('metar', req, res));
app.get('/api/weather/taf', (req, res) => proxyAWC('taf', req, res));

import { VPilotInstallerService } from './services/vpilotInstaller';

// Initialize services
VPilotInstallerService.installPlugin();
const flightService = new FlightDataService();
const wsController = new WebSocketController(WS_PORT, flightService);


// Start HTTP Server
const server = app.listen(HTTP_PORT, () => {
    console.log(`xPad Backend HTTP server running on port ${HTTP_PORT}`);
    console.log(`WebSocket server running on port ${WS_PORT}`);
    console.log(`Mock Mode: PERMANENTLY ENABLED`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
    console.log('Shutdown signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        wsController.shutdown();
        flightService.shutdown();
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
