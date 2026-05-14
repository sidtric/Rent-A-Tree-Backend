import { Router } from 'express';
import { createRental, getMyRentals, getAllRentals, cancelRental, payBalance } from '../controllers/rentalController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/', createRental);
router.get('/my', getMyRentals);
router.get('/all', adminOnly, getAllRentals);
router.patch('/:id/cancel', cancelRental);
router.patch('/:id/pay-balance', payBalance);
export default router;
