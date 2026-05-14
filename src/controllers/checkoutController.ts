import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Rental from '../models/Rental';
import BoxOrder from '../models/BoxOrder';
import PendingOrder from '../models/PendingOrder';
import MasterOrder, { IMasterOrderItem, generateOrderNumber } from '../models/MasterOrder';
import { sendMail, masterOrderConfirmationEmail, ownerMasterOrderNotificationEmail } from '../utils/mailer';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const OWNER = process.env.OWNER_EMAIL || 'siddharthfuloria06@gmail.com';

export async function confirmOrder(req: AuthRequest, res: Response) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      buyer,
      deliveryAddress,
      items,
      notes,
    } = req.body;

    // --- Verify Razorpay HMAC signature ---
    const expectedSig = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // --- Idempotency: return existing master order if already processed ---
    const existing = await MasterOrder.findOne({ razorpayOrderId });
    if (existing) {
      return res.status(200).json({ orderNumber: existing.orderNumber, masterOrderId: existing._id });
    }

    // --- Compute line totals ---
    const season = String(new Date().getFullYear());
    const addrFull = `${deliveryAddress.flat}, ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} – ${deliveryAddress.pincode}`;

    let totalAmount = 0;
    const masterItems: IMasterOrderItem[] = [];

    for (const item of items) {
      const lineTotal = item.unitPrice * item.quantity;
      totalAmount += lineTotal;

      if (item.type === 'tree') {
        // Find-or-create pattern for idempotency
        let rental = await Rental.findOne({
          razorpayOrderId,
          plan: item.plan,
          variety: item.variety,
          user: req.user!._id,
        });
        if (!rental) {
          rental = await Rental.create({
            user: req.user!._id,
            plan: item.plan,
            variety: item.variety,
            season,
            deliveryAddress: addrFull,
            razorpayOrderId,
            paymentId: razorpayPaymentId,
            status: 'active',
          });
        }
        masterItems.push({
          type: 'tree',
          plan: item.plan,
          variety: item.variety,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal,
          refId: rental._id as any,
          refModel: 'Rental',
        });
      } else {
        // box item
        let boxOrder = await BoxOrder.findOne({
          razorpayOrderId,
          variety: item.variety,
          user: req.user!._id,
        });
        if (!boxOrder) {
          boxOrder = await BoxOrder.create({
            user: req.user!._id,
            variety: item.variety,
            quantity: item.quantity,
            pricePerBox: item.unitPrice,
            totalAmount: lineTotal,
            deliveryAddress: addrFull,
            phone: buyer.phone,
            razorpayOrderId,
            paymentId: razorpayPaymentId,
            status: 'confirmed',
          });
        }
        masterItems.push({
          type: 'box',
          variety: item.variety,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal,
          refId: boxOrder._id as any,
          refModel: 'BoxOrder',
        });
      }
    }

    // --- Generate order number ---
    const orderNumber = generateOrderNumber();

    // --- Create MasterOrder ---
    const masterOrder = await MasterOrder.create({
      orderNumber,
      user: req.user!._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      buyer,
      deliveryAddress: {
        flat: deliveryAddress.flat,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
        full: addrFull,
      },
      items: masterItems,
      subtotal: totalAmount,
      totalAmount,
      currency: 'INR',
      season,
      status: 'confirmed',
      notes: notes || '',
    });

    // --- Mark PendingOrder fulfilled ---
    PendingOrder.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'fulfilled' },
    ).catch(() => {});

    // --- Send emails ---
    const hasTree = items.some((i: any) => i.type === 'tree');
    const hasBox  = items.some((i: any) => i.type === 'box');
    const emailParams = {
      orderNumber,
      buyer,
      deliveryAddress: { full: addrFull },
      items: masterItems,
      totalAmount,
      season,
      notes: notes || '',
      hasTree,
      hasBox,
    };

    sendMail(
      buyer.email,
      `Your YourOrchard Order #${orderNumber} is Confirmed`,
      masterOrderConfirmationEmail(emailParams),
    ).catch(err => console.error('[mailer] customer email failed:', err));

    sendMail(
      OWNER,
      `New Order #${orderNumber} — ₹${totalAmount.toLocaleString('en-IN')}`,
      ownerMasterOrderNotificationEmail({ ...emailParams, customerEmail: buyer.email }),
    ).catch(err => console.error('[mailer] owner email failed:', err));

    return res.status(201).json({ orderNumber, masterOrderId: masterOrder._id });
  } catch (err) {
    console.error('[confirmOrder]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await MasterOrder.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json(orders);
  } catch (err) {
    console.error('[getMyOrders]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}
