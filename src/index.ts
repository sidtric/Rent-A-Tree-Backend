import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import treeRoutes from './routes/trees';
import rentalRoutes from './routes/rentals';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import publicUpdateRoutes from './routes/publicUpdates';
import contactRoutes from './routes/contact';
import adminRoutes from './admin/routes/admin';
import webhookRoutes from './routes/webhook';
import settingsRoutes from './routes/settings';
import checkoutRoutes from './routes/checkout';

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Webhook needs raw body for signature verification — mount before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://yourorchard.in',
  'https://www.yourorchard.in',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false, skip: () => isDev });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, skip: () => isDev });

app.use('/api', limiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/public-updates', publicUpdateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/checkout', checkoutRoutes);

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`[server] running on port ${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
