import { Request, Response } from 'express';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export async function getReviews(_req: Request, res: Response) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('[getReviews]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'rating and comment are required.' });
    }
    const existing = await Review.countDocuments({ user: req.user!._id });
    if (existing >= 3) {
      return res.status(400).json({ message: 'You can post a maximum of 3 reviews.' });
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const media = files.map(f => ({
      url: (f as any).path,
      type: f.mimetype.startsWith('video/') ? 'video' : 'image',
    }));

    const review = await Review.create({
      user: req.user!._id,
      name: req.user!.name,
      rating: Number(rating),
      comment,
      media,
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('[createReview]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
