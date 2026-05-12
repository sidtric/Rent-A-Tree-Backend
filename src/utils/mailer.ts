import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"YourOrchard" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

const OWNER = process.env.OWNER_EMAIL || 'siddharthfuloria06@gmail.com';

export function customerOrderHtml(params: {
  customerName: string;
  items: { label: string; qty: number; price: number }[];
  total: number;
  deliveryAddress: string;
}) {
  const rows = params.items.map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.label}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.qty}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${i.price.toLocaleString('en-IN')}</td></tr>`
  ).join('');

  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
  <div style="background:#2d5a27;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">Order Confirmed! 🥭</h1>
  </div>
  <div style="padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px">Hi <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555">Thank you for ordering from YourOrchard! Here's your order summary:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead><tr style="background:#f6f9f5">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">Item</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280">Qty</th>
        <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280">Price</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;border-top:2px solid #2d5a27;padding-top:12px;margin-bottom:24px">
      <span>Total</span><span>₹${params.total.toLocaleString('en-IN')}</span>
    </div>
    <div style="background:#f6f9f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Delivery Address</p>
      <p style="margin:0;color:#374151">${params.deliveryAddress}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:13px">We'll keep you updated as your order progresses. For any questions, reply to this email or contact us at yourorchard.in.</p>
  </div>
</div>`;
}

export async function notifyOwnerNewOrder(params: {
  customerName: string;
  customerEmail: string;
  items: string;
  total: number;
  deliveryAddress: string;
  type: 'rental' | 'box' | 'mixed';
}) {
  const subject = `New ${params.type === 'rental' ? 'Tree Rental' : params.type === 'box' ? 'Box Order' : 'Order'} — ₹${params.total.toLocaleString('en-IN')}`;
  const html = `<div style="font-family:sans-serif;max-width:480px">
  <h2 style="color:#2d5a27">New order received!</h2>
  <p><strong>Customer:</strong> ${params.customerName} (${params.customerEmail})</p>
  <p><strong>Items:</strong> ${params.items}</p>
  <p><strong>Total:</strong> ₹${params.total.toLocaleString('en-IN')}</p>
  <p><strong>Delivery to:</strong> ${params.deliveryAddress}</p>
</div>`;
  await sendMail(OWNER, subject, html);
}
