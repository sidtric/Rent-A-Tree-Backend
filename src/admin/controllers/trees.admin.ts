import { Response } from 'express';
import Tree from '../../models/Tree';
import { AuthRequest } from '../../middleware/auth';

export async function adminGetAllTrees(_req: AuthRequest, res: Response) {
  try {
    const trees = await Tree.find().sort({ createdAt: -1 });
    res.json(trees);
  } catch (err) {
    console.error('[adminGetAllTrees]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateTree(req: AuthRequest, res: Response) {
  try {
    const tree = await Tree.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tree) return res.status(404).json({ message: 'Tree not found.' });
    res.json(tree);
  } catch (err) {
    console.error('[adminUpdateTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteTree(req: AuthRequest, res: Response) {
  try {
    await Tree.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
