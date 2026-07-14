import { Router } from 'express';
import { SettingsService } from '../services/settingsService';

export const settingsRouter = Router();
const settingsService = new SettingsService();

settingsRouter.get('/', (req, res) => {
    res.json(settingsService.getSettings());
});

settingsRouter.post('/', (req, res) => {
    const settings = req.body;
    if (settings && typeof settings === 'object') {
        settingsService.updateSettings(settings);
        res.json({ success: true, settings: settingsService.getSettings() });
    } else {
        res.status(400).json({ error: 'Invalid settings format' });
    }
});
