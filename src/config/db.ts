import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  console.log('[db] connected');
  mongoose.connection.on('error', err => {
    console.error('[db] connection error (non-fatal):', err.message);
  });
}
