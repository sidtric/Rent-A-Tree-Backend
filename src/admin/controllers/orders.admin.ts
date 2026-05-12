import { Response } from 'express';
import BoxOrder from '../../models/BoxOrder';
import { AuthRequest } from '../../middleware/auth';

const VALID_STATUSES = ['pending_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

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
    if (!VALID_STATUSES.includes(status)) {
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
