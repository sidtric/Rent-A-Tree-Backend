import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: npx ts-node-dev scripts/reset-password.ts <email> <newPassword>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI!);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`[reset] no user found with email: ${email}`);
    process.exit(2);
  }
  user.password = password;
  await user.save();
  console.log(`[reset] password updated for ${user.email}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
