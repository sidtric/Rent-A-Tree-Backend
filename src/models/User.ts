import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDeliveryAddress {
  flat: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  deliveryAddress?: IDeliveryAddress;
  comparePassword(plain: string): Promise<boolean>;
}

const schema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  deliveryAddress: {
    flat:    String,
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },
}, { timestamps: true });

schema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model<IUser>('User', schema);
