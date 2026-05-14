import { Request, Response } from 'express';
import Rental from '../models/Rental';
import { AuthRequest } from '../middleware/auth';
import { verifyPaymentSignature } from '../utils/verifyRazorpay';
import { sendMail, customerOrderHtml, notifyOwnerNewOrder } from '../utils/mailer';
import { PLAN_PRICES, PLAN_FULL_PRICES, PLAN_LABELS } from '../constants/prices';

export async function createRental(req: AuthRequest, res: Response) {
  try {
    const { plan, variety, season, deliveryAddress, razorpayOrderId, paymentId, razorpaySignature } = req.body;
    if (!plan || !variety || !deliveryAddress) {
      return res.status(400).json({ message: 'plan, variety, and deliveryAddress are required.' });
    }
    if (typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 10) {
      return res.status(400).json({ message: 'Please enter a complete delivery address (at least 10 characters).' });
    }
    const VALID_PLANS = ['sapling', 'adult', 'grand'];
    const VALID_VARIETIES = ['chausa', 'dasheri', 'langra'];
    if (!VALID_PLANS.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan. Use sapling, adult, or grand.' });
    }
    if (!VALID_VARIETIES.includes(variety)) {
      return res.status(400).json({ message: 'Invalid variety. Use chausa, dasheri, or langra.' });
    }
    if (razorpayOrderId && paymentId && razorpaySignature) {
      if (!verifyPaymentSignature(razorpayOrderId, paymentId, razorpaySignature)) {
        return res.status(400).json({ message: 'Invalid payment signature.' });
      }
      // idempotency: return existing rental if same order was already processed
      const existing = await Rental.findOne({ razorpayOrderId, user: req.user!._id, plan, variety });
      if (existing) return res.status(201).json(existing);
    }
    const rental = await Rental.create({
      user: req.user!._id,
      plan,
      variety,
      season: season || String(new Date().getFullYear()),
      deliveryAddress,
      razorpayOrderId,
      paymentId,
      status: 'active',
    });

    const price = PLAN_PRICES[plan] || 0;
    const label = `${PLAN_LABELS[plan] || plan} (${variety})`;
    Promise.all([
      sendMail(req.user!.email, 'Your Tree Rental is Confirmed! 🌳', customerOrderHtml({
        customerName: req.user!.name,
        items: [{ label, qty: 1, price }],
        total: price,
        deliveryAddress,
        type: 'rental',
      })),
      notifyOwnerNewOrder({
        customerName: req.user!.name,
        customerEmail: req.user!.email,
        items: label,
        total: price,
        deliveryAddress,
        type: 'rental',
      }),
    ]).catch(err => console.error('[mailer]', err));

    res.status(201).json(rental);
  } catch (err) {
    console.error('[createRental]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMyRentals(req: AuthRequest, res: Response) {
  try {
    const rentals = await Rental.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('[getMyRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getAllRentals(req: AuthRequest, res: Response) {
  try {
    const rentals = await Rental.find({ status: 'active' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('[getAllRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function cancelRental(req: AuthRequest, res: Response) {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, user: req.user!._id });
    if (!rental) return res.status(404).json({ message: 'Rental not found.' });
    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Only active rentals can be cancelled.' });
    }
    rental.status = 'cancelled';
    await rental.save();
    res.json(rental);
  } catch (err) {
    console.error('[cancelRental]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getPublicRentals(_req: Request, res: Response) {
  try {
    const rentals = await Rental.find({ status: 'active' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(rentals.map(r => ({
      _id:      r._id,
      plan:     r.plan,
      variety:  r.variety,
      season:   r.season,
      userName: ((r.user as any)?.name || 'A member').split(' ')[0],
    })));
  } catch (err) {
    console.error('[getPublicRentals]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function payBalance(req: AuthRequest, res: Response) {
  try {
    const { razorpayOrderId, paymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !paymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment fields.' });
    }
    if (!verifyPaymentSignature(razorpayOrderId, paymentId, razorpaySignature)) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }
    const rental = await Rental.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id, balancePaid: false, status: 'active' },
      { balancePaid: true, balancePaymentId: paymentId },
      { new: true },
    );
    if (!rental) return res.status(404).json({ message: 'Rental not found or balance already paid.' });

    const fullPrice = PLAN_FULL_PRICES[rental.plan] || 0;
    const token     = PLAN_PRICES[rental.plan] || 0;
    const balance   = fullPrice - token;
    const label     = `${PLAN_LABELS[rental.plan] || rental.plan} (${rental.variety}) — balance payment`;
    sendMail(req.user!.email, 'Balance Payment Received — YourOrchard 🌳', customerOrderHtml({
      customerName: req.user!.name,
      items: [{ label, qty: 1, price: balance }],
      total: balance,
      deliveryAddress: rental.deliveryAddress,
      type: 'balance',
    })).catch(err => console.error('[mailer]', err));

    res.json(rental);
  } catch (err) {
    console.error('[payBalance]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
