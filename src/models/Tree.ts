import mongoose, { Document, Schema } from 'mongoose';

export type TreePlan = 'sapling' | 'adult' | 'grand';
export type Variety = 'chausa' | 'dasheri' | 'langra';

export interface ITree extends Document {
  plan: TreePlan;
  variety: Variety;
  price: number;
  yieldMin: number;
  yieldMax: number;
  imageUrl?: string;
  available: boolean;
}

const schema = new Schema<ITree>({
  plan: { type: String, enum: ['sapling', 'adult', 'grand'], required: true },
  variety: { type: String, enum: ['chausa', 'dasheri', 'langra'], required: true },
  price: { type: Number, required: true },
  yieldMin: { type: Number, required: true },
  yieldMax: { type: Number, required: true },
  imageUrl: String,
  available: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ITree>('Tree', schema);
