import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicUpdate extends Document {
  caption: string;
  media: { url: string; type: 'image' | 'video' }[];
}

const schema = new Schema<IPublicUpdate>({
  caption: { type: String, default: '' },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
}, { timestamps: true });

export default mongoose.model<IPublicUpdate>('PublicUpdate', schema);
