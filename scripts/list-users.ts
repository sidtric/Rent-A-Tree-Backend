import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  const users = await User.find({}, '_id name email role phone createdAt').sort({ createdAt: 1 }).lean();
  console.log(`\nFound ${users.length} user(s):\n`);
  const pad = (s: any, n: number) => String(s ?? '').padEnd(n).slice(0, n);
  console.log(pad('email', 38), pad('role', 8), pad('name', 22), pad('phone', 14), 'createdAt');
  console.log('-'.repeat(110));
  for (const u of users) {
    console.log(
      pad(u.email, 38),
      pad(u.role, 8),
      pad(u.name, 22),
      pad(u.phone, 14),
      new Date(u.createdAt as any).toISOString().slice(0, 16),
    );
  }
  console.log('');
  const admins = users.filter(u => u.role === 'admin');
  console.log(`Admins: ${admins.length} · Users: ${users.length - admins.length}`);
  console.log('\nNOTE: Passwords are bcrypt-hashed and cannot be recovered.');
  console.log('To grant admin: use the User Roles tab in the dashboard,');
  console.log('or run: npx ts-node-dev scripts/promote-admin.ts <email>');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
