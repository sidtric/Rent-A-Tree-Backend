import mongoose from 'mongoose';
import User from './src/models/User';
import dotenv from 'dotenv';
dotenv.config();

const email = process.argv[2];
if (!email) { console.error('Usage: npx ts-node make-admin.ts <email>'); process.exit(1); }

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) { console.error('No user found with email:', email); process.exit(1); }
  console.log(`✓ ${user.email} is now role="${user.role}"`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
