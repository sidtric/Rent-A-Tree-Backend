import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

const EMAIL    = 'test-user@test.local';
const PASSWORD = 'TestUser@123';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  let user = await User.findOne({ email: EMAIL });
  if (user) {
    user.password = PASSWORD;
    user.role     = 'user';
    await user.save();
    console.log('[seed] updated:', EMAIL);
  } else {
    user = await User.create({ name: 'Test User', email: EMAIL, password: PASSWORD, role: 'user' });
    console.log('[seed] created:', EMAIL);
  }
  console.log(`CREDENTIALS -> ${EMAIL} / ${PASSWORD} (role=${user.role})`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
