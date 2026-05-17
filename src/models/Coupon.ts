import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPct: number;
  active: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPct: { type: Number, required: true, min: 0, max: 100 },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
