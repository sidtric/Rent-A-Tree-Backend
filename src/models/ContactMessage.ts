import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
}

const schema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IContactMessage>('ContactMessage', schema);
