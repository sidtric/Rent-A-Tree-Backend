import 'dotenv/config';
import connectDB from '../config/db';
import Coupon from '../models/Coupon';

const COUPONS = [
  { code: 'YOURORCHARD99', discountPct: 99, active: true },
];

async function seed() {
  await connectDB();
  for (const c of COUPONS) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    console.log(`✅  ${c.code} — ${c.discountPct}% discount`);
  }
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
