import mongoose, { Document, Schema } from 'mongoose';

export interface HeroMedia {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}

export interface ISiteSettings extends Document {
  heroMedia:      HeroMedia[];
  farmHeroMedia:  HeroMedia[];
}

const mediaSchema = {
  type: [{
    url:       { type: String, required: true },
    publicId:  { type: String, required: true },
    type:      { type: String, enum: ['image', 'video'], required: true },
  }],
  default: [],
};

const SiteSettingsSchema = new Schema<ISiteSettings>({
  heroMedia:     mediaSchema,
  farmHeroMedia: mediaSchema,
}, { timestamps: true });

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
