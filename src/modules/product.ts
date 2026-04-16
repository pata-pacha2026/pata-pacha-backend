import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const productRouter = Router();

// List products with filters (public: only published unless admin=true)
productRouter.post('/list', async (req: Request, res: Response) => {
  const { category, isHot, isNew, search, sort, page = 1, pageSize = 12, admin } = req.body;

  const where: any = {};
  // Only show published products unless admin mode
  if (!admin) {
    where.isPublished = true;
  }
  if (category) where.category = category;
  if (isHot !== undefined) where.isHot = isHot;
  if (isNew !== undefined) where.isNew = isNew;
  if (search) {
    where.OR = [
      { nameZh: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { nameEs: { contains: search, mode: 'insensitive' } },
      { nameFr: { contains: search, mode: 'insensitive' } },
      { nameDe: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = {};
  if (sort === 'popular') orderBy.rating = 'desc';
  else if (sort === 'newest') orderBy.createdAt = 'desc';
  else if (sort === 'price_low') orderBy.price = 'asc';
  else if (sort === 'price_high') orderBy.price = 'desc';
  else orderBy.createdAt = 'desc';

  const skip = (Number(page) - 1) * Number(pageSize);
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: Number(pageSize) }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, data: { products, total, page: Number(page), pageSize: Number(pageSize) } });
});

// Get product detail (only published for public)
productRouter.post('/detail', async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Product ID is required' });
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  // Get related products (same category, published only, exclude current)
  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id }, isPublished: true },
    take: 4,
    orderBy: { rating: 'desc' },
  });

  res.json({ success: true, data: { product, related } });
});

// Create product
productRouter.post('/create', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.nameEn || !data.price) {
    res.status(400).json({ success: false, error: 'nameEn and price are required' });
    return;
  }
  const product = await prisma.product.create({
    data: {
      nameZh: data.nameZh || data.nameEn,
      nameEn: data.nameEn,
      nameEs: data.nameEs || data.nameEn,
      nameFr: data.nameFr || data.nameEn,
      nameDe: data.nameDe || data.nameEn,
      descZh: data.descZh || '',
      descEn: data.descEn || '',
      descEs: data.descEs || '',
      descFr: data.descFr || '',
      descDe: data.descDe || '',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      images: data.images || [],
      category: data.category || 'toys',
      rating: Number(data.rating) || 4.5,
      stock: Number(data.stock) || 100,
      isHot: data.isHot || false,
      isNew: data.isNew || true,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
    },
  });
  res.json({ success: true, data: product });
});

// Update product (supports isPublished toggle for 上下架)
productRouter.post('/update', async (req: Request, res: Response) => {
  const { id, ...data } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Product ID is required' });
    return;
  }
  const updateData: any = {};
  const allowedFields = [
    'nameZh', 'nameEn', 'nameEs', 'nameFr', 'nameDe',
    'descZh', 'descEn', 'descEs', 'descFr', 'descDe',
    'price', 'originalPrice', 'images', 'category', 'rating', 'stock', 'isHot', 'isNew', 'isPublished',
  ];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (['price', 'originalPrice', 'rating', 'stock'].includes(field)) {
        updateData[field] = Number(data[field]);
      } else if (field === 'images') {
        updateData[field] = data[field];
      } else if (['isHot', 'isNew', 'isPublished'].includes(field)) {
        updateData[field] = Boolean(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }
  const product = await prisma.product.update({ where: { id: Number(id) }, data: updateData });
  res.json({ success: true, data: product });
});

// Delete product
productRouter.post('/delete', async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Product ID is required' });
    return;
  }
  await prisma.product.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});
