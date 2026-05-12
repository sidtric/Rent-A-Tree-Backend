import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

const EMAIL    = 'test-admin@test.local';
const PASSWORD = 'TestAdmin@123';
const NAME     = 'Test Admin';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('[seed] connected');

  let user = await User.findOne({ email: EMAIL });
  if (user) {
    user.password = PASSWORD;
    user.role     = 'admin';
    await user.save();
    console.log(`[seed] updated existing user: ${EMAIL}`);
  } else {
    user = await User.create({ name: NAME, email: EMAIL, password: PASSWORD, role: 'admin' });
    console.log(`[seed] created new user: ${EMAIL}`);
  }
  console.log(`[seed] role=${user.role} _id=${user._id}`);
  console.log(`[seed] CREDENTIALS -> ${EMAIL} / ${PASSWORD}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
