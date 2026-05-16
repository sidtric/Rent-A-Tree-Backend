import 'dotenv/config';
import connectDB from '../config/db';
import User from '../models/User';

const EMAIL    = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL) {
  console.error('Usage: ts-node-dev src/scripts/makeAdmin.ts <email> [password]');
  console.error('  - If user exists: promotes them to admin (password optional, only set if provided).');
  console.error('  - If user does not exist: creates new admin user (password required).');
  process.exit(1);
}

async function makeAdmin() {
  await connectDB();
  let user = await User.findOne({ email: EMAIL });

  if (user) {
    user.role = 'admin';
    if (PASSWORD) user.password = PASSWORD; // re-hashed by pre-save hook
    await user.save();
    console.log(`✅ Promoted existing user ${EMAIL} to admin`);
  } else {
    if (!PASSWORD) {
      console.error(`❌ User ${EMAIL} does not exist. Pass a password to create a new admin.`);
      process.exit(1);
    }
    user = await User.create({
      name: 'Admin',
      email: EMAIL,
      password: PASSWORD,
      role: 'admin',
    });
    console.log(`✅ Created new admin user`);
  }

  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD ? PASSWORD : '(unchanged from existing user)'}`);
  console.log(`   Role:     admin`);
  process.exit(0);
}

makeAdmin().catch(err => { console.error(err); process.exit(1); });
