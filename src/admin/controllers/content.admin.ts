import { Response } from 'express';
import ContactMessage from '../../models/ContactMessage';
import PublicUpdate from '../../models/PublicUpdate';
import { AuthRequest } from '../../middleware/auth';

export async function adminGetMessages(_req: AuthRequest, res: Response) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('[adminGetMessages]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteMessage(req: AuthRequest, res: Response) {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteMessage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminGetPublicUpdates(_req: AuthRequest, res: Response) {
  try {
    const updates = await PublicUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    console.error('[adminGetPublicUpdates]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeletePublicUpdate(req: AuthRequest, res: Response) {
  try {
    await PublicUpdate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeletePublicUpdate]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
