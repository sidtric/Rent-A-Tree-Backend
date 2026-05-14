import { Request, Response } from 'express';
import fs from 'fs';
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

type MediaField = 'heroMedia' | 'farmHeroMedia' | 'saplingMedia' | 'adultMedia' | 'grandMedia';

async function uploadMedia(req: AuthRequest, res: Response, field: MediaField) {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) return res.status(400).json({ message: 'No files uploaded.' });

  let results: any[];
  try {
    results = await Promise.all(
      files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder:        'yourorchard/hero',
          resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        }).finally(() => fs.unlink(file.path, () => {}))
      )
    );
  } catch (err) {
    files.forEach(f => fs.unlink(f.path, () => {}));
    throw err;
  }

  const settings = await getSettings();
  for (const r of results) {
    settings[field].push({
      url:      r.secure_url,
      publicId: r.public_id,
      type:     r.resource_type === 'video' ? 'video' : 'image',
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

export async function adminUploadSaplingMedia(req: AuthRequest, res: Response) {
  try { await uploadMedia(req, res, 'saplingMedia'); }
  catch (err) { console.error('[adminUploadSaplingMedia]', err); res.status(500).json({ message: 'Upload failed.' }); }
}

export async function adminDeleteSaplingMedia(req: AuthRequest, res: Response) {
  try { await deleteMedia(req, res, 'saplingMedia'); }
  catch (err) { console.error('[adminDeleteSaplingMedia]', err); res.status(500).json({ message: 'Server error.' }); }
}

export async function adminUploadAdultMedia(req: AuthRequest, res: Response) {
  try { await uploadMedia(req, res, 'adultMedia'); }
  catch (err) { console.error('[adminUploadAdultMedia]', err); res.status(500).json({ message: 'Upload failed.' }); }
}

export async function adminDeleteAdultMedia(req: AuthRequest, res: Response) {
  try { await deleteMedia(req, res, 'adultMedia'); }
  catch (err) { console.error('[adminDeleteAdultMedia]', err); res.status(500).json({ message: 'Server error.' }); }
}

export async function adminUploadGrandMedia(req: AuthRequest, res: Response) {
  try { await uploadMedia(req, res, 'grandMedia'); }
  catch (err) { console.error('[adminUploadGrandMedia]', err); res.status(500).json({ message: 'Upload failed.' }); }
}

export async function adminDeleteGrandMedia(req: AuthRequest, res: Response) {
  try { await deleteMedia(req, res, 'grandMedia'); }
  catch (err) { console.error('[adminDeleteGrandMedia]', err); res.status(500).json({ message: 'Server error.' }); }
}

// Public endpoint — no auth
export async function publicGetSettings(_req: Request, res: Response) {
  try {
    const s = await getSettings();
    const toPublic = (arr: typeof s.heroMedia) => arr.map(m => ({ url: m.url, type: m.type }));
    res.json({
      heroMedia:     toPublic(s.heroMedia),
      farmHeroMedia: toPublic(s.farmHeroMedia),
      saplingMedia:  toPublic(s.saplingMedia),
      adultMedia:    toPublic(s.adultMedia),
      grandMedia:    toPublic(s.grandMedia),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}
