import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';

const router = Router();
router.get('/', getReviews);
router.post('/', protect, uploadMedia.array('media', 5), createReview);
export default router;
