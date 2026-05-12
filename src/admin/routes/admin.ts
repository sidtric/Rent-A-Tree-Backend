import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth';
import {
  adminGetAllTrees,
  adminUpdateTree,
  adminDeleteTree,
  adminGetAllRentals,
  adminUpdateRentalStatus,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminGetAllReviews,
  adminDeleteReview,
  adminSearchUsers,
  adminUpdateUserRole,
  adminGetAllUsers,
  adminGetStats,
  adminGetPayments,
  adminGetMessages,
  adminDeleteMessage,
  adminGetPublicUpdates,
  adminDeletePublicUpdate,
} from '../controllers/adminController';

const router = Router();

router.use(protect, adminOnly);

// Trees
router.get('/trees', adminGetAllTrees);
router.patch('/trees/:id', adminUpdateTree);
router.delete('/trees/:id', adminDeleteTree);

// Rentals
router.get('/rentals', adminGetAllRentals);
router.patch('/rentals/:id/status', adminUpdateRentalStatus);

// Orders
router.get('/orders', adminGetAllOrders);
router.patch('/orders/:id/status', adminUpdateOrderStatus);

// Reviews
router.get('/reviews', adminGetAllReviews);
router.delete('/reviews/:id', adminDeleteReview);

// Users
router.get('/users', adminGetAllUsers);
router.get('/users/search', adminSearchUsers);
router.patch('/users/:id/role', adminUpdateUserRole);

// Stats
router.get('/stats', adminGetStats);

// Payments (Razorpay)
router.get('/payments', adminGetPayments);

// Contact messages
router.get('/messages', adminGetMessages);
router.delete('/messages/:id', adminDeleteMessage);

// Public updates
router.get('/public-updates', adminGetPublicUpdates);
router.delete('/public-updates/:id', adminDeletePublicUpdate);

export default router;
