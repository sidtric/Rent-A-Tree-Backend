import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });
  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch (err) {
    console.error('[protect] db lookup failed:', err);
    res.status(503).json({ message: 'Service temporarily unavailable.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  next();
}
