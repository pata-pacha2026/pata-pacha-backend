import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'pata-pacha-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Admin login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { id: admin.id, email: admin.email, name: admin.name },
    },
  });
});

// Verify token (for frontend to check if token is still valid)
authRouter.post('/verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
    if (!admin) {
      res.status(401).json({ success: false, error: 'Admin not found' });
      return;
    }
    res.json({
      success: true,
      data: { user: { id: admin.id, email: admin.email, name: admin.name } },
    });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});
