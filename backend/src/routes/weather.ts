import { Router, Request, Response } from 'express';

export const weatherRouter = Router();

async function proxyAWC(endpoint: string, req: Request, res: Response) {
    const ids = req.query.ids as string;
    if (!ids) {
        res.status(400).json({ error: 'ids param required' });
        return;
    }
    try {
        const url = `https://aviationweather.gov/api/data/${endpoint}?ids=${encodeURIComponent(ids)}&format=json`;
        const upstream = await fetch(url);
        if (!upstream.ok) {
            res.status(upstream.status).json({ error: `Upstream error: ${upstream.statusText}` });
            return;
        }
        const data = await upstream.json();
        res.json(data);
    } catch (err: any) {
        res.status(502).json({ error: `Failed to fetch ${endpoint.toUpperCase()}`, detail: err.message });
    }
}

weatherRouter.get('/metar', (req, res) => { proxyAWC('metar', req, res); });
weatherRouter.get('/taf', (req, res) => { proxyAWC('taf', req, res); });
