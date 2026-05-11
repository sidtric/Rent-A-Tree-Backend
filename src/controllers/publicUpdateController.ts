import { Request, Response } from 'express';
import PublicUpdate from '../models/PublicUpdate';
import { AuthRequest } from '../middleware/auth';

export async function getUpdates(req: Request, res: Response) {
  try {
    const { variety } = req.query;
    const filter = variety
      ? { $or: [{ variety }, { variety: null }, { variety: { $exists: false } }] }
      : {};
    const updates = await PublicUpdate.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json(updates);
  } catch (err) {
    console.error('[getUpdates]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function createUpdate(req: AuthRequest, res: Response) {
  try {
    const { caption, variety } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];
    const media = files.map(f => ({
      url: (f as any).path,
      type: f.mimetype.startsWith('video/') ? 'video' : 'image',
    }));
    const update = await PublicUpdate.create({ caption, media, variety: variety || null });
    res.status(201).json(update);
  } catch (err) {
    console.error('[createUpdate]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function deleteUpdate(req: AuthRequest, res: Response) {
  try {
    const update = await PublicUpdate.findByIdAndDelete(req.params.id);
    if (!update) return res.status(404).json({ message: 'Update not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[deleteUpdate]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
