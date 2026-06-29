import { Router } from 'express';
import { LauncherService } from '../services/launcherService';

export const launcherRouter = Router();
const launcherService = new LauncherService();

launcherRouter.get('/settings', (req, res) => {
    res.json(launcherService.getSettings());
});

launcherRouter.post('/settings', (req, res) => {
    const settings = req.body;
    if (Array.isArray(settings)) {
        launcherService.updateSettings(settings);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid settings format' });
    }
});

launcherRouter.post('/launch', async (req, res) => {
    const { appId } = req.body;
    if (!appId) {
        res.status(400).json({ error: 'appId is required' });
        return;
    }
    try {
        await launcherService.launchApp(appId);
        res.json({ success: true });
    } catch (err: any) {
        console.error('Launch error:', err);
        res.status(500).json({ error: err.message || 'Failed to launch app' });
    }
});
