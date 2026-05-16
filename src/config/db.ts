import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 2,
  });
  console.log('[db] connected');

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected, will auto-retry'));
  mongoose.connection.on('reconnected',  () => console.log('[db] reconnected'));
  mongoose.connection.on('error',        err => console.error('[db] error:', err?.message || err));
}
