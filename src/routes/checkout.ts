import { Router } from 'express';
import { confirmOrder, getMyOrders } from '../controllers/checkoutController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/confirm', confirmOrder);
router.get('/my-orders', getMyOrders);
export default router;
