import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Tree from '../models/Tree';
import { AuthRequest } from '../middleware/auth';

const BOX_PRICES: Record<string, number> = {
  chausa: 1299,
  dasheri: 1499,
  langra: 1399,
};

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { type, treeId, variety, quantity = 1 } = req.body;

    let amount: number;
    if (type === 'rental') {
      if (!treeId) return res.status(400).json({ message: 'treeId is required for rental.' });
      const tree = await Tree.findById(treeId);
      if (!tree) return res.status(404).json({ message: 'Tree not found.' });
      amount = tree.price;
    } else if (type === 'box') {
      const price = BOX_PRICES[variety];
      if (!price) return res.status(400).json({ message: 'Invalid variety.' });
      amount = price * Number(quantity);
    } else {
      return res.status(400).json({ message: 'type must be "rental" or "box".' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

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
