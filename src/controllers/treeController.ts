import { Request, Response } from 'express';
import Tree from '../models/Tree';
import { AuthRequest } from '../middleware/auth';

export async function getAllTrees(_req: Request, res: Response) {
  try {
    const trees = await Tree.find({ available: true }).sort({ price: 1 });
    res.json(trees);
  } catch (err) {
    console.error('[getAllTrees]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getTree(req: Request, res: Response) {
  try {
    const tree = await Tree.findById(req.params.id);
    if (!tree) return res.status(404).json({ message: 'Tree not found.' });
    res.json(tree);
  } catch (err) {
    console.error('[getTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function createTree(req: AuthRequest, res: Response) {
  try {
    const { plan, variety, price, yieldMin, yieldMax } = req.body;
    const imageUrl = (req.file as any)?.path;
    const tree = await Tree.create({
      plan,
      variety,
      price: Number(price),
      yieldMin: Number(yieldMin),
      yieldMax: Number(yieldMax),
      imageUrl,
    });
    res.status(201).json(tree);
  } catch (err) {
    console.error('[createTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function updateTree(req: AuthRequest, res: Response) {
  try {
    const update: Record<string, any> = { ...req.body };
    if (req.file) update.imageUrl = (req.file as any).path;
    const tree = await Tree.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!tree) return res.status(404).json({ message: 'Tree not found.' });
    res.json(tree);
  } catch (err) {
    console.error('[updateTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function deleteTree(req: AuthRequest, res: Response) {
  try {
    await Tree.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[deleteTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
