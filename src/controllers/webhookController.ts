import { Request, Response } from 'express';
import Rental from '../models/Rental';
import BoxOrder from '../models/BoxOrder';
import PendingOrder from '../models/PendingOrder';
import { verifyWebhookSignature } from '../utils/verifyRazorpay';
import { BOX_PRICES } from '../constants/prices';

export async function handleWebhook(req: Request, res: Response) {
  const sig = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req.body as Buffer).toString('utf8');

  if (!verifyWebhookSignature(rawBody, sig)) {
    return res.status(400).json({ message: 'Invalid webhook signature.' });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch {
    return res.status(400).json({ message: 'Invalid JSON.' });
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (!payment) return res.json({ ok: true });

    const razorpayOrderId: string = payment.order_id;
    const paymentId: string = payment.id;

    // Check if the frontend already created records (happy path)
    const alreadyHandled = await Rental.exists({ razorpayOrderId }) || await BoxOrder.exists({ razorpayOrderId });
    if (alreadyHandled) return res.json({ ok: true });

    // Browser crashed — recover from PendingOrder
    const pending = await PendingOrder.findOneAndUpdate(
      { razorpayOrderId, status: 'pending' },
      { $set: { status: 'fulfilled' } },
      { new: false },
    );
    if (!pending) return res.json({ ok: true });

    const season = String(new Date().getFullYear());
    const creates: Promise<any>[] = [];

    for (const item of pending.items) {
      if (item.type === 'tree') {
        for (let i = 0; i < item.qty; i++) {
          creates.push(Rental.create({
            user:            pending.userId,
            plan:            item.plan,
            variety:         item.variety,
            season,
            deliveryAddress: pending.deliveryAddress,
            razorpayOrderId,
            paymentId,
            status:          'active',
          }));
        }
      } else {
        const pricePerBox = BOX_PRICES[item.variety] || 0;
        creates.push(BoxOrder.create({
          user:            pending.userId,
          variety:         item.variety,
          quantity:        item.qty,
          pricePerBox,
          totalAmount:     pricePerBox * item.qty,
          deliveryAddress: pending.deliveryAddress,
          phone:           pending.userPhone,
          razorpayOrderId,
          paymentId,
          status:          'confirmed',
        }));
      }
    }

    await Promise.allSettled(creates);
    console.log(`[webhook] recovered order ${razorpayOrderId} from PendingOrder`);
  }

  res.json({ ok: true });
}
