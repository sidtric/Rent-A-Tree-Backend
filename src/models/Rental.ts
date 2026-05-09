import mongoose, { Document, Schema } from 'mongoose';

export interface IRental extends Document {
  user: mongoose.Types.ObjectId;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  season: string;
  deliveryAddress: string;
  estimatedYield?: number;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled';
  razorpayOrderId?: string;
  paymentId?: string;
}

const schema = new Schema<IRental>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['sapling', 'adult', 'grand'], required: true },
  variety: { type: String, enum: ['chausa', 'dasheri', 'langra'], required: true },
  season: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  estimatedYield: Number,
  status: {
    type: String,
    enum: ['pending_payment', 'active', 'completed', 'cancelled'],
    default: 'pending_payment',
  },
  razorpayOrderId: String,
  paymentId: String,
}, { timestamps: true });

export default mongoose.model<IRental>('Rental', schema);
