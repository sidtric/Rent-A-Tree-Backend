import mongoose, { Document, Schema } from 'mongoose';

export interface IRichItem {
  type: 'tree' | 'box';
  plan?: string;
  variety: string;
  qty: number;
}

export interface IPendingOrder extends Document {
  razorpayOrderId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryAddress: string;
  items: IRichItem[];
  status: 'pending' | 'fulfilled';
}

const schema = new Schema<IPendingOrder>({
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName:        { type: String, required: true },
  userEmail:       { type: String, required: true },
  userPhone:       { type: String, default: '' },
  deliveryAddress: { type: String, required: true },
  items:           [{ type: { type: String }, plan: String, variety: String, qty: Number }],
  status:          { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IPendingOrder>('PendingOrder', schema);
