import mongoose, { Document, Schema } from 'mongoose';

export interface IBoxOrder extends Document {
  user: mongoose.Types.ObjectId;
  variety: 'chausa' | 'dasheri' | 'langra';
  quantity: number;
  pricePerBox: number;
  totalAmount: number;
  deliveryAddress: string;
  phone: string;
  status: 'pending_payment' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  paymentId?: string;
}

const schema = new Schema<IBoxOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  variety: { type: String, enum: ['chausa', 'dasheri', 'langra'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  pricePerBox: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending_payment',
  },
  razorpayOrderId: String,
  paymentId: String,
}, { timestamps: true });

export default mongoose.model<IBoxOrder>('BoxOrder', schema);
