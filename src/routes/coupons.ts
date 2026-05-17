import { Router, Request, Response } from 'express';
import Coupon from '../models/Coupon';

const router = Router();

router.get('/validate', async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ message: 'Code is required.' });
    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code.' });
    res.json({ code: coupon.code, discountPct: coupon.discountPct });
  } catch (err) {
    console.error('[validateCoupon]', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
