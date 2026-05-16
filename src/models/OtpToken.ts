import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true },
  otp:           { type: String, required: true },
  type:          { type: String, enum: ['signup', 'login'], required: true },
  name:          String,
  phone:         String,
  cooldownUntil: Number,
  expiresAt:     { type: Date, required: true },
});

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', schema);
