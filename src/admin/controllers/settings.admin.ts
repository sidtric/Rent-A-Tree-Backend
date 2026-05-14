import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';
import SiteSettings from '../../models/SiteSettings';
import { AuthRequest } from '../../middleware/auth';

async function getSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  return settings;
}

export async function adminGetSettings(_req: Request, res: Response) {
  try {
    res.json(await getSettings());
  } catch (err) {
    console.error('[adminGetSettings]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

type MediaField = 'heroMedia' | 'farmHeroMedia';

async function uploadMedia(req: AuthRequest, res: Response, field: MediaField) {
  const files = req.files as (Express.Multer.File & { path: string; filename: string; mimetype: string })[];
  if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded.' });
  const settings = await getSettings();
  for (const file of files) {
    settings[field].push({
      url:      file.path,
      publicId: file.filename,
      type:     file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  }
  await settings.save();
  res.json({ [field]: settings[field] });
}

async function deleteMedia(req: AuthRequest, res: Response, field: MediaField) {
  const idx = parseInt(req.params.index, 10);
  const settings = await getSettings();
  if (isNaN(idx) || idx < 0 || idx >= settings[field].length) {
    return res.status(400).json({ message: 'Invalid index.' });
  }
  const [removed] = settings[field].splice(idx, 1);
  await cloudinary.uploader.destroy(removed.publicId, {
    resource_type: removed.type === 'video' ? 'video' : 'image',
  }).catch(() => {});
  await settings.save();
  res.json({ [field]: settings[field] });
}

export async function adminUploadHeroMedia(req: AuthRequest, res: Response) {
  try { await uploadMedia(req, res, 'heroMedia'); }
  catch (err) { console.error('[adminUploadHeroMedia]', err); res.status(500).json({ message: 'Upload failed.' }); }
}

export async function adminDeleteHeroMedia(req: AuthRequest, res: Response) {
  try { await deleteMedia(req, res, 'heroMedia'); }
  catch (err) { console.error('[adminDeleteHeroMedia]', err); res.status(500).json({ message: 'Server error.' }); }
}

export async function adminUploadFarmHeroMedia(req: AuthRequest, res: Response) {
  try { await uploadMedia(req, res, 'farmHeroMedia'); }
  catch (err) { console.error('[adminUploadFarmHeroMedia]', err); res.status(500).json({ message: 'Upload failed.' }); }
}

export async function adminDeleteFarmHeroMedia(req: AuthRequest, res: Response) {
  try { await deleteMedia(req, res, 'farmHeroMedia'); }
  catch (err) { console.error('[adminDeleteFarmHeroMedia]', err); res.status(500).json({ message: 'Server error.' }); }
}

// Public endpoint — no auth
export async function publicGetSettings(_req: Request, res: Response) {
  try {
    const s = await getSettings();
    res.json({
      heroMedia:     s.heroMedia.map(m => ({ url: m.url, type: m.type })),
      farmHeroMedia: s.farmHeroMedia.map(m => ({ url: m.url, type: m.type })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}
