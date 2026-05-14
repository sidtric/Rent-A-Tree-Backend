import { Request, Response } from 'express';
import fs from 'fs';
import cloudinary from '../config/cloudinary';
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
  const files = (req.files as Express.Multer.File[]) || [];
  try {
    const { caption, variety } = req.body;

    // Upload all files to Cloudinary in parallel — much faster than sequential middleware uploads
    const results = await Promise.all(
      files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: 'yourorchard/media',
          resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        }).finally(() => fs.unlink(file.path, () => {}))
      )
    );

    const media = results.map(r => ({
      url: r.secure_url,
      type: (r.resource_type === 'video' ? 'video' : 'image') as 'image' | 'video',
    }));

    const update = await PublicUpdate.create({ caption, media, variety: variety || null });
    res.status(201).json(update);
  } catch (err) {
    // Clean up any temp files that weren't already cleaned
    files.forEach(f => fs.unlink(f.path, () => {}));
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
