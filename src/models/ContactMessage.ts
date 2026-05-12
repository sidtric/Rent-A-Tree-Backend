import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  type: 'contact' | 'notify';
}

const schema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['contact', 'notify'], default: 'contact' },
}, { timestamps: true });

export default mongoose.model<IContactMessage>('ContactMessage', schema);
