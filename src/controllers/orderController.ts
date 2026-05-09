import { Response } from 'express';
import BoxOrder from '../models/BoxOrder';
import { AuthRequest } from '../middleware/auth';

const BOX_PRICES: Record<string, number> = {
  chausa: 1299,
  dasheri: 1499,
  langra: 1399,
};

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { variety, quantity = 1, deliveryAddress, phone, razorpayOrderId, paymentId } = req.body;
    const pricePerBox = BOX_PRICES[variety];
    if (!pricePerBox) return res.status(400).json({ message: 'Invalid variety.' });
    if (!deliveryAddress || !phone) {
      return res.status(400).json({ message: 'deliveryAddress and phone are required.' });
    }
    const qty = Number(quantity);
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
