import { Request, Response } from 'express';
import Rental from '../models/Rental';
import BoxOrder from '../models/BoxOrder';
import PendingOrder from '../models/PendingOrder';
import MasterOrder, { IMasterOrderItem, generateOrderNumber } from '../models/MasterOrder';
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

    const results = await Promise.allSettled(creates);
    console.log(`[webhook] recovered order ${razorpayOrderId} from PendingOrder`);

    // Also create a MasterOrder for the crash-recovery path
    try {
      const alreadyHasMaster = await MasterOrder.exists({ razorpayOrderId });
      if (!alreadyHasMaster) {
        const masterItems: IMasterOrderItem[] = [];
        let totalAmount = 0;
        let resultIdx = 0;

        for (const item of pending.items) {
          if (item.type === 'tree') {
            for (let i = 0; i < item.qty; i++) {
              const r = results[resultIdx++];
              const rental = r.status === 'fulfilled' ? r.value : null;
              const unitPrice = 0; // price not stored in PendingOrder items
              masterItems.push({
                type: 'tree',
                plan: item.plan,
                variety: item.variety,
                quantity: 1,
                unitPrice,
                lineTotal: unitPrice,
                refId: rental?._id,
                refModel: 'Rental',
              });
            }
          } else {
            const r = results[resultIdx++];
            const boxOrder = r.status === 'fulfilled' ? r.value : null;
            const pricePerBox = BOX_PRICES[item.variety] || 0;
            const lineTotal = pricePerBox * item.qty;
            totalAmount += lineTotal;
            masterItems.push({
              type: 'box',
              variety: item.variety,
              quantity: item.qty,
              unitPrice: pricePerBox,
              lineTotal,
              refId: boxOrder?._id,
              refModel: 'BoxOrder',
            });
          }
        }

        const orderNumber = generateOrderNumber();
        const deliveryFull = pending.deliveryAddress;
        await MasterOrder.create({
          orderNumber,
          user: pending.userId,
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: '',
          buyer: { name: pending.userName, email: pending.userEmail, phone: pending.userPhone },
          deliveryAddress: { flat: '', street: '', city: '', state: '', pincode: '', full: deliveryFull },
          items: masterItems,
          subtotal: totalAmount,
          totalAmount,
          currency: 'INR',
          season,
          status: 'confirmed',
          notes: '',
        });
        console.log(`[webhook] created MasterOrder ${orderNumber} for recovered order ${razorpayOrderId}`);
      }
    } catch (masterErr) {
      console.error('[webhook] MasterOrder creation failed (non-fatal):', masterErr);
    }
  }

  res.json({ ok: true });
}
