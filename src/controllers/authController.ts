import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

function signToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      token: signToken(String(user._id)),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({
      token: signToken(String(user._id)),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  res.json(req.user);
}
