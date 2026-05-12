import { Router, Request, Response, NextFunction } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';
import multer from 'multer';

const router = Router();
router.get('/', getReviews);
router.post(
  '/',
  protect,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMedia.array('media', 5)(req, res, (err: any) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Images max 10 MB, videos max 100 MB.' });
      }
      if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
      next();
    });
  },
  createReview,
);
export default router;
