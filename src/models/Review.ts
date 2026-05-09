import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  media?: { url: string; type: 'image' | 'video' }[];
}

const schema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
}, { timestamps: true });

export default mongoose.model<IReview>('Review', schema);
