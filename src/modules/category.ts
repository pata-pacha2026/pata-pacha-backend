import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const categoryRouter = Router();

// List categories (public)
categoryRouter.post('/list', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: categories });
});

// Create category
categoryRouter.post('/create', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.slug || !data.nameEn) {
    res.status(400).json({ success: false, error: 'slug and nameEn are required' });
    return;
  }
  const category = await prisma.category.create({
    data: {
      slug: data.slug,
      nameZh: data.nameZh || data.nameEn,
      nameEn: data.nameEn,
      nameEs: data.nameEs || data.nameEn,
      nameFr: data.nameFr || data.nameEn,
      nameDe: data.nameDe || data.nameEn,
      icon: data.icon || 'Tag',
      image: data.image || '',
      sortOrder: data.sortOrder || 0,
    },
  });
  res.json({ success: true, data: category });
});

// Update category
categoryRouter.post('/update', async (req: Request, res: Response) => {
  const { id, ...data } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Category ID is required' });
    return;
  }
  const updateData: any = {};
  const allowedFields = ['slug', 'nameZh', 'nameEn', 'nameEs', 'nameFr', 'nameDe', 'icon', 'image', 'sortOrder'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'sortOrder') {
        updateData[field] = Number(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }
  const category = await prisma.category.update({ where: { id: Number(id) }, data: updateData });
  res.json({ success: true, data: category });
});

// Delete category
categoryRouter.post('/delete', async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Category ID is required' });
    return;
  }
  await prisma.category.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});
