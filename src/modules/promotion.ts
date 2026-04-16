import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const promotionRouter = Router();

// List promotions (public: only active)
promotionRouter.post('/list', async (req: Request, res: Response) => {
  const { admin } = req.body;
  const where: any = {};
  if (!admin) {
    where.isActive = true;
  }
  const promotions = await prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: promotions });
});

// Create promotion
promotionRouter.post('/create', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.titleEn) {
    res.status(400).json({ success: false, error: 'titleEn is required' });
    return;
  }
  const promotion = await prisma.promotion.create({
    data: {
      titleZh: data.titleZh || data.titleEn,
      titleEn: data.titleEn,
      titleEs: data.titleEs || data.titleEn,
      titleFr: data.titleFr || data.titleEn,
      titleDe: data.titleDe || data.titleEn,
      subtitleZh: data.subtitleZh || '',
      subtitleEn: data.subtitleEn || '',
      subtitleEs: data.subtitleEs || '',
      subtitleFr: data.subtitleFr || '',
      subtitleDe: data.subtitleDe || '',
      type: data.type || 'flash',
      discount: Number(data.discount) || 0,
      image: data.image || '',
      bgColor: data.bgColor || '#1C1917',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  res.json({ success: true, data: promotion });
});

// Update promotion
promotionRouter.post('/update', async (req: Request, res: Response) => {
  const { id, ...data } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Promotion ID is required' });
    return;
  }
  const updateData: any = {};
  const allowedFields = [
    'titleZh', 'titleEn', 'titleEs', 'titleFr', 'titleDe',
    'subtitleZh', 'subtitleEn', 'subtitleEs', 'subtitleFr', 'subtitleDe',
    'type', 'discount', 'image', 'bgColor', 'isActive', 'startDate', 'endDate',
  ];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'discount') {
        updateData[field] = Number(data[field]);
      } else if (field === 'isActive') {
        updateData[field] = Boolean(data[field]);
      } else if (field === 'startDate' || field === 'endDate') {
        updateData[field] = data[field] ? new Date(data[field]) : null;
      } else {
        updateData[field] = data[field];
      }
    }
  }
  const promotion = await prisma.promotion.update({ where: { id: Number(id) }, data: updateData });
  res.json({ success: true, data: promotion });
});

// Delete promotion
promotionRouter.post('/delete', async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Promotion ID is required' });
    return;
  }
  await prisma.promotion.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});
