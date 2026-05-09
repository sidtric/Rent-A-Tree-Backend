import { Router } from 'express';
import { createRental, getMyRentals, cancelRental } from '../controllers/rentalController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/', createRental);
router.get('/my', getMyRentals);
router.patch('/:id/cancel', cancelRental);
export default router;
