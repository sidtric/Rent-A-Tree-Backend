import crypto from 'crypto';

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!secret) {
    console.error('[verifyRazorpay] RAZORPAY_KEY_SECRET is not set!');
    return false;
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}
