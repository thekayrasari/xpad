import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { FlightDataService } from './services/flightDataService';
import { WebSocketController } from './controllers/websocketController';
import { VPilotInstallerService } from './services/vpilotInstaller';
import { weatherRouter } from './routes/weather';
import { launcherRouter } from './routes/launcher';

// Handle global exceptions
process.on('uncaughtException', (err: any) => {
    console.error("Fatal Uncaught Exception:", err);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error("Fatal Unhandled Rejection at:", promise, "reason:", reason);
});

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
if (isDev) {
    app.use(cors({ origin: 'http://localhost:5173' })); // Allow Vite dev server
} else {
    // In production, the frontend is served locally via express.static on the same origin, 
    // so no CORS is needed. Wildcard CORS is disabled for security by setting origin: false.
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

app.use('/api/weather', weatherRouter);
app.use('/api/launcher', launcherRouter);

// Initialize services
try {
    VPilotInstallerService.installPlugin();
} catch (e) {
    console.error('Failed to install vPilot plugin:', e);
}
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
