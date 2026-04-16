import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const orderRouter = Router();

// Create order (public)
orderRouter.post('/create', async (req: Request, res: Response) => {
  const { email, fullName, phone, address, city, state, zipCode, country, items, totalAmount, paymentMethod } = req.body;

  if (!email || !fullName || !phone || !address || !city || !zipCode || !country || !items || !totalAmount) {
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }

  const order = await prisma.order.create({
    data: {
      email,
      fullName,
      phone,
      address,
      city,
      state: state || '',
      zipCode,
      country,
      items,
      totalAmount,
      paymentMethod: paymentMethod || null,
      paymentId: null,
      status: 'pending',
    },
  });

  res.json({ success: true, data: order });
});

// Get order detail (public)
orderRouter.post('/detail', async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ success: false, error: 'Order ID is required' });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  res.json({ success: true, data: order });
});

// List orders (admin)
orderRouter.post('/list', async (req: Request, res: Response) => {
  const { status, search, page = 1, pageSize = 20 } = req.body;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: Number(pageSize) }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: { orders, total, page: Number(page), pageSize: Number(pageSize) } });
});

// Update order status (admin)
orderRouter.post('/update-status', async (req: Request, res: Response) => {
  const { id, status, paymentMethod, paymentId } = req.body;
  if (!id || !status) {
    res.status(400).json({ success: false, error: 'Order ID and status are required' });
    return;
  }

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const updateData: any = { status };
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (paymentId) updateData.paymentId = paymentId;

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.json({ success: true, data: order });
});
