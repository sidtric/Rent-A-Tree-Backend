import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node-dev scripts/promote-admin.ts <email>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI!);
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true },
  );
  if (!user) {
    console.error(`[promote] no user found with email: ${email}`);
    process.exit(2);
  }
  console.log(`[promote] ${user.email} -> role=${user.role}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
