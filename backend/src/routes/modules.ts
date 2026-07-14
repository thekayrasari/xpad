import { Router } from 'express';
import { ModulesService } from '../services/modulesService';

export const modulesRouter = Router();
const modulesService = new ModulesService();

modulesRouter.get('/', (req, res) => {
    res.json(modulesService.getSettings());
});

modulesRouter.post('/', (req, res) => {
    const settings = req.body;
    if (Array.isArray(settings)) {
        modulesService.updateSettings(settings);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid settings format' });
    }
});
