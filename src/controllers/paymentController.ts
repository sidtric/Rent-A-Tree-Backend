import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import PendingOrder from '../models/PendingOrder';

const BOX_PRICES: Record<string, number> = {
  chausa: 1299,
  dasheri: 1499,
  langra: 1399,
};

const PLAN_PRICES: Record<string, number> = {
  sapling: 799,
  adult: 1499,
  grand: 2499,
};

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { type, treeId, variety, quantity = 1, meta } = req.body;

    let amount: number;
    if (type === 'rental') {
      const plan = req.body.plan || treeId;
      const price = PLAN_PRICES[plan];
      if (!price) return res.status(400).json({ message: 'Invalid plan. Use sapling, adult, or grand.' });
      amount = price;
    } else if (type === 'box') {
      const price = BOX_PRICES[variety];
      if (!price) return res.status(400).json({ message: 'Invalid variety.' });
      amount = price * Number(quantity);
    } else if (type === 'cart') {
      const items: { variety?: string; plan?: string; quantity: number }[] = req.body.items || [];
      if (!items.length) return res.status(400).json({ message: 'Cart is empty.' });
      amount = items.reduce((sum, item) => {
        if (item.plan) {
          const price = PLAN_PRICES[item.plan];
          if (!price) throw new Error(`Invalid plan: ${item.plan}`);
          return sum + price * Number(item.quantity);
        }
        const price = BOX_PRICES[item.variety!];
        if (!price) throw new Error(`Invalid variety: ${item.variety}`);
        return sum + price * Number(item.quantity);
      }, 0);
    } else {
      return res.status(400).json({ message: 'type must be "rental", "box", or "cart".' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    if (meta && req.user) {
      await PendingOrder.create({
        razorpayOrderId: order.id,
        userId:          req.user._id,
        userName:        meta.userName  || req.user.name,
        userEmail:       meta.userEmail || req.user.email,
        userPhone:       meta.userPhone || '',
        deliveryAddress: meta.deliveryAddress || '',
        items:           meta.richItems || [],
      }).catch(() => {});
    }

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('[createOrder]', err);
    res.status(500).json({ message: 'Payment error.' });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment fields.' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    res.json({ success: true, paymentId: razorpayPaymentId, orderId: razorpayOrderId });
  } catch (err) {
    console.error('[verifyPayment]', err);
    res.status(500).json({ message: 'Verification error.' });
  }
}
