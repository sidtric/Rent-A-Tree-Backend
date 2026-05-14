import { Response } from 'express';
import BoxOrder from '../models/BoxOrder';
import { AuthRequest } from '../middleware/auth';
import { verifyPaymentSignature } from '../utils/verifyRazorpay';
import { sendMail, customerOrderHtml, notifyOwnerNewOrder } from '../utils/mailer';
import { BOX_PRICES } from '../constants/prices';

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { variety, quantity = 1, deliveryAddress, phone, razorpayOrderId, paymentId, razorpaySignature } = req.body;
    const pricePerBox = BOX_PRICES[variety];
    if (!pricePerBox) return res.status(400).json({ message: 'Invalid variety.' });
    if (!deliveryAddress || !phone) {
      return res.status(400).json({ message: 'deliveryAddress and phone are required.' });
    }
    if (typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 10) {
      return res.status(400).json({ message: 'Please enter a complete delivery address (at least 10 characters).' });
    }
    if (razorpayOrderId && paymentId && razorpaySignature) {
      if (!verifyPaymentSignature(razorpayOrderId, paymentId, razorpaySignature)) {
        return res.status(400).json({ message: 'Invalid payment signature.' });
      }
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
    }
    const order = await BoxOrder.create({
      user: req.user!._id,
      variety,
      quantity: qty,
      pricePerBox,
      totalAmount: pricePerBox * qty,
      deliveryAddress,
      phone,
      razorpayOrderId,
      paymentId,
      status: 'confirmed',
    });

    const label = `${variety.charAt(0).toUpperCase() + variety.slice(1)} Mango Box (10 kg)`;
    Promise.all([
      sendMail(req.user!.email, 'Your Mango Box Order is Confirmed! 🥭', customerOrderHtml({
        customerName: req.user!.name,
        items: [{ label, qty, price: pricePerBox * qty }],
        total: pricePerBox * qty,
        deliveryAddress,
      })),
      notifyOwnerNewOrder({
        customerName: req.user!.name,
        customerEmail: req.user!.email,
        items: `${qty}× ${label}`,
        total: pricePerBox * qty,
        deliveryAddress,
        type: 'box',
      }),
    ]).catch(err => console.error('[mailer]', err));

    res.status(201).json(order);
  } catch (err) {
    console.error('[createOrder]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await BoxOrder.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('[getMyOrders]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
