import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicUpdate extends Document {
  caption: string;
  media: { url: string; type: 'image' | 'video' }[];
  variety?: 'chausa' | 'dasheri' | 'langra';
}

const schema = new Schema<IPublicUpdate>({
  caption: { type: String, default: '' },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  variety: { type: String, enum: ['chausa', 'dasheri', 'langra'], default: null },
}, { timestamps: true });

export default mongoose.model<IPublicUpdate>('PublicUpdate', schema);
