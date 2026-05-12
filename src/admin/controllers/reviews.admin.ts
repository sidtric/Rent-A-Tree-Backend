import { Response } from 'express';
import Review from '../../models/Review';
import { AuthRequest } from '../../middleware/auth';

export async function adminGetAllReviews(_req: AuthRequest, res: Response) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('[adminGetAllReviews]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteReview(req: AuthRequest, res: Response) {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteReview]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
