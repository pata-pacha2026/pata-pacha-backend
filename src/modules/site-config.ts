import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const siteConfigRouter = Router();

// Get site config (public)
siteConfigRouter.post('/get', async (req: Request, res: Response) => {
  const { key } = req.body;
  if (key) {
    const config = await prisma.siteConfig.findUnique({ where: { key } });
    if (!config) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: { key: config.key, value: config.value } });
  } else {
    const configs = await prisma.siteConfig.findMany();
    const data: Record<string, any> = {};
    for (const c of configs) {
      data[c.key] = c.value;
    }
    res.json({ success: true, data });
  }
});

// Upsert site config (protected by auth middleware applied in app.ts)
siteConfigRouter.post('/upsert', async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    res.status(400).json({ success: false, error: 'Key and value are required' });
    return;
  }
  const config = await prisma.siteConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  res.json({ success: true, data: config });
});
