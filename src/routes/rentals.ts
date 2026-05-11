import { Router } from 'express';
import { createRental, getMyRentals, getAllRentals, cancelRental } from '../controllers/rentalController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/', createRental);
router.get('/my', getMyRentals);
router.get('/all', getAllRentals);
router.patch('/:id/cancel', cancelRental);
export default router;
