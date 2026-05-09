import { Request, Response } from 'express';
import PublicUpdate from '../models/PublicUpdate';
import { AuthRequest } from '../middleware/auth';

export async function getUpdates(_req: Request, res: Response) {
  try {
    const updates = await PublicUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    console.error('[getUpdates]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function createUpdate(req: AuthRequest, res: Response) {
  try {
    const { caption } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];
    const media = files.map(f => ({
      url: (f as any).path,
      type: f.mimetype.startsWith('video/') ? 'video' : 'image',
    }));
    const update = await PublicUpdate.create({ caption, media });
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
