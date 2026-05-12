import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth';

import { adminGetAllTrees, adminUpdateTree, adminDeleteTree } from '../controllers/trees.admin';
import { adminGetAllRentals, adminUpdateRentalStatus } from '../controllers/rentals.admin';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../controllers/orders.admin';
import { adminGetAllReviews, adminDeleteReview } from '../controllers/reviews.admin';
import { adminGetAllUsers, adminSearchUsers, adminUpdateUserRole } from '../controllers/users.admin';
import { adminGetStats, adminGetPayments } from '../controllers/stats.admin';
import { adminGetMessages, adminDeleteMessage, adminGetPublicUpdates, adminDeletePublicUpdate } from '../controllers/content.admin';

const router = Router();
router.use(protect, adminOnly);

// Trees
router.get('/trees',          adminGetAllTrees);
router.patch('/trees/:id',    adminUpdateTree);
router.delete('/trees/:id',   adminDeleteTree);

// Rentals
router.get('/rentals',                    adminGetAllRentals);
router.patch('/rentals/:id/status',       adminUpdateRentalStatus);

// Box Orders
router.get('/orders',                     adminGetAllOrders);
router.patch('/orders/:id/status',        adminUpdateOrderStatus);

// Reviews
router.get('/reviews',                    adminGetAllReviews);
router.delete('/reviews/:id',             adminDeleteReview);

// Users
router.get('/users',                      adminGetAllUsers);
router.get('/users/search',               adminSearchUsers);
router.patch('/users/:id/role',           adminUpdateUserRole);

// Dashboard stats
router.get('/stats',                      adminGetStats);

// Payments (Razorpay)
router.get('/payments',                   adminGetPayments);

// Contact messages
router.get('/messages',                   adminGetMessages);
router.delete('/messages/:id',            adminDeleteMessage);

// Public updates
router.get('/public-updates',             adminGetPublicUpdates);
router.delete('/public-updates/:id',      adminDeletePublicUpdate);

export default router;
