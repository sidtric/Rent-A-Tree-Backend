import { Response } from 'express';
import Razorpay from 'razorpay';
import Tree from '../../models/Tree';
import User from '../../models/User';
import Rental from '../../models/Rental';
import BoxOrder from '../../models/BoxOrder';
import Review from '../../models/Review';
import { AuthRequest } from '../../middleware/auth';

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function adminGetStats(_req: AuthRequest, res: Response) {
  try {
    const [
      totalTrees, availableTrees,
      totalRentals, cancelledRentals, activeRentals,
      totalReviews, totalUsers, totalOrders,
    ] = await Promise.all([
      Tree.countDocuments(),
      Tree.countDocuments({ available: true }),
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'cancelled' }),
      Rental.countDocuments({ status: 'active' }),
      Review.countDocuments(),
      User.countDocuments(),
      BoxOrder.countDocuments(),
    ]);

    const revenueResult = await Rental.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$estimatedYield' } } },
    ]);

    res.json({
      totalTrees,
      availableTrees,
      rentedTrees: totalTrees - availableTrees,
      totalRentals,
      cancelledRentals,
      activeRentals,
      reviews: totalReviews,
      users: totalUsers,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (err) {
    console.error('[adminGetStats]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function enrichPaymentsWithRentals(items: any[]) {
  const rentals = await Rental.find({
    paymentId: { $in: items.map((p: any) => p.id) },
  }).populate('user', 'name email');
  const rentalMap = new Map(rentals.map(r => [r.paymentId, r]));
  return items.map((p: any) => ({
    ...p,
    amount: p.amount / 100,
    createdAt: new Date(p.created_at * 1000),
    rental: rentalMap.get(p.id) || null,
  }));
}

export async function adminGetPayments(req: AuthRequest, res: Response) {
  try {
    const count = Math.min(Number(req.query.count) || 50, 100);
    const razorpay = getRazorpay();
    const response = await razorpay.payments.all({ count });
    const items = (response as any).items || [];

    const enriched = await enrichPaymentsWithRentals(items);
    const totalCaptured = enriched
      .filter((p: any) => p.status === 'captured')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    res.json({ payments: enriched, total: enriched.length, totalCaptured });
  } catch (err) {
    console.error('[adminGetPayments]', err);
    res.status(500).json({ message: 'Failed to fetch payments from Razorpay.' });
  }
}
