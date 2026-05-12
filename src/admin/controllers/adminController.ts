import { Response } from 'express';
import Razorpay from 'razorpay';
import Tree from '../../models/Tree';
import User from '../../models/User';
import Rental from '../../models/Rental';
import BoxOrder from '../../models/BoxOrder';
import Review from '../../models/Review';
import PublicUpdate from '../../models/PublicUpdate';
import ContactMessage from '../../models/ContactMessage';
import { AuthRequest } from '../../middleware/auth';

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// ── Trees ──────────────────────────────────────────────────────────
export async function adminGetAllTrees(_req: AuthRequest, res: Response) {
  try {
    const trees = await Tree.find().sort({ createdAt: -1 });
    res.json(trees);
  } catch (err) {
    console.error('[adminGetAllTrees]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateTree(req: AuthRequest, res: Response) {
  try {
    const tree = await Tree.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tree) return res.status(404).json({ message: 'Tree not found.' });
    res.json(tree);
  } catch (err) {
    console.error('[adminUpdateTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteTree(req: AuthRequest, res: Response) {
  try {
    await Tree.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteTree]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Rentals ────────────────────────────────────────────────────────
export async function adminGetAllRentals(_req: AuthRequest, res: Response) {
  try {
    const rentals = await Rental.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('[adminGetAllRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateRentalStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    const valid = ['pending_payment', 'active', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    if (!rental) return res.status(404).json({ message: 'Rental not found.' });
    res.json(rental);
  } catch (err) {
    console.error('[adminUpdateRentalStatus]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Orders ─────────────────────────────────────────────────────────
export async function adminGetAllOrders(_req: AuthRequest, res: Response) {
  try {
    const orders = await BoxOrder.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('[adminGetAllOrders]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    const valid = ['pending_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const order = await BoxOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    console.error('[adminUpdateOrderStatus]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Reviews ────────────────────────────────────────────────────────
export async function adminGetAllReviews(_req: AuthRequest, res: Response) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('[adminGetAllReviews]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteReview(req: AuthRequest, res: Response) {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteReview]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Users ──────────────────────────────────────────────────────────
export async function adminSearchUsers(req: AuthRequest, res: Response) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email query param required.' });
    const users = await User.find({
      email: { $regex: String(email), $options: 'i' },
    }).select('-password').limit(20);
    res.json(users);
  } catch (err) {
    console.error('[adminSearchUsers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminUpdateUserRole(req: AuthRequest, res: Response) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be "user" or "admin".' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('[adminUpdateUserRole]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminGetAllUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('[adminGetAllUsers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Stats ──────────────────────────────────────────────────────────
export async function adminGetStats(_req: AuthRequest, res: Response) {
  try {
    const [
      totalTrees,
      availableTrees,
      totalRentals,
      cancelledRentals,
      activeRentals,
      totalReviews,
      totalUsers,
      totalOrders,
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

// ── Payments (Razorpay) ────────────────────────────────────────────
export async function adminGetPayments(req: AuthRequest, res: Response) {
  try {
    const count = Math.min(Number(req.query.count) || 50, 100);
    const razorpay = getRazorpay();
    const response = await razorpay.payments.all({ count });
    const items = (response as any).items || [];

    const rentals = await Rental.find({
      paymentId: { $in: items.map((p: any) => p.id) },
    }).populate('user', 'name email');

    const rentalMap = new Map(rentals.map(r => [r.paymentId, r]));

    const enriched = items.map((p: any) => ({
      ...p,
      amount: p.amount / 100,
      createdAt: new Date(p.created_at * 1000),
      rental: rentalMap.get(p.id) || null,
    }));

    const totalCaptured = enriched
      .filter((p: any) => p.status === 'captured')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    res.json({ payments: enriched, total: enriched.length, totalCaptured });
  } catch (err) {
    console.error('[adminGetPayments]', err);
    res.status(500).json({ message: 'Failed to fetch payments from Razorpay.' });
  }
}

// ── Contact Messages ───────────────────────────────────────────────
export async function adminGetMessages(_req: AuthRequest, res: Response) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('[adminGetMessages]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteMessage(req: AuthRequest, res: Response) {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeleteMessage]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Public Updates ─────────────────────────────────────────────────
export async function adminGetPublicUpdates(_req: AuthRequest, res: Response) {
  try {
    const updates = await PublicUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    console.error('[adminGetPublicUpdates]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeletePublicUpdate(req: AuthRequest, res: Response) {
  try {
    await PublicUpdate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[adminDeletePublicUpdate]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
