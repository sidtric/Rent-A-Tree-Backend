import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
export default router;
