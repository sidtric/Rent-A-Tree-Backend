import mongoose, { Document, Schema } from 'mongoose';

export interface IMasterOrderItem {
  type: 'tree' | 'box';
  plan?: string;           // sapling | adult | grand
  variety: string;
  productId?: string;      // e.g. "chausa-base"
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  refId?: mongoose.Types.ObjectId;
  refModel?: 'Rental' | 'BoxOrder';
}

export interface IMasterOrder extends Document {
  orderNumber: string;      // YO-2026-XXXXX, unique
  user: mongoose.Types.ObjectId;
  razorpayOrderId: string;  // unique index — prevents duplicates
  razorpayPaymentId: string;
  razorpaySignature: string;
  buyer: { name: string; email: string; phone: string };
  deliveryAddress: { flat: string; street: string; city: string; state: string; pincode: string; full: string };
  items: IMasterOrderItem[];
  subtotal: number;
  totalAmount: number;
  currency: string;
  season: string;
  status: 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  notes?: string;
}

const masterOrderItemSchema = new Schema<IMasterOrderItem>({
  type:      { type: String, enum: ['tree', 'box'], required: true },
  plan:      String,
  variety:   { type: String, required: true },
  productId: String,
  quantity:  { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  refId:     { type: Schema.Types.ObjectId },
  refModel:  { type: String, enum: ['Rental', 'BoxOrder'] },
}, { _id: false });

const schema = new Schema<IMasterOrder>({
  orderNumber:       { type: String, required: true, unique: true },
  user:              { type: Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId:   { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  buyer: {
    name:  { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  deliveryAddress: {
    flat:    { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    full:    { type: String, required: true },
  },
  items:       { type: [masterOrderItemSchema], required: true },
  subtotal:    { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  currency:    { type: String, default: 'INR' },
  season:      { type: String, required: true },
  status:      { type: String, enum: ['confirmed', 'dispatched', 'delivered', 'cancelled'], default: 'confirmed' },
  notes:       { type: String, default: '' },
}, { timestamps: true });

export function generateOrderNumber(): string {
  return 'YO-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default mongoose.model<IMasterOrder>('MasterOrder', schema);
