import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
export default router;
