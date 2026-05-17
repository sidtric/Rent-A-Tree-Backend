import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Coupon from '../../models/Coupon';

export async function adminListCoupons(req: AuthRequest, res: Response) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error('[adminListCoupons]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminCreateCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, discountPct } = req.body;
    if (!code || discountPct == null) {
      return res.status(400).json({ message: 'code and discountPct are required.' });
    }
    const coupon = await Coupon.findOneAndUpdate(
      { code: String(code).toUpperCase().trim() },
      { code: String(code).toUpperCase().trim(), discountPct: Number(discountPct), active: true },
      { upsert: true, new: true }
    );
    res.status(201).json(coupon);
  } catch (err) {
    console.error('[adminCreateCoupon]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminToggleCoupon(req: AuthRequest, res: Response) {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    coupon.active = !coupon.active;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    console.error('[adminToggleCoupon]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function adminDeleteCoupon(req: AuthRequest, res: Response) {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    console.error('[adminDeleteCoupon]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
