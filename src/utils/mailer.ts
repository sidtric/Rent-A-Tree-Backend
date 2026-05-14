import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[mailer] EMAIL_USER or EMAIL_PASS not set — skipping email to', to);
    return;
  }
  try {
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
    console.log('[mailer] sent to', to, '—', subject);
  } catch (err: any) {
    console.error('[mailer] FAILED to', to, '—', err.message);
  }
}

const OWNER = process.env.OWNER_EMAIL || 'siddharthfuloria06@gmail.com';

export function customerOrderHtml(params: {
  customerName: string;
  items: { label: string; qty: number; price: number }[];
  total: number;
  deliveryAddress: string;
  type?: 'rental' | 'box' | 'balance';
}) {
  const isRental  = params.type === 'rental' || params.type === 'balance';
  const isBalance = params.type === 'balance';

  const rows = params.items.map(i =>
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;font-size:14px;color:#374151">${i.label}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;text-align:center;font-size:14px;color:#374151">${i.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;text-align:right;font-size:14px;color:#374151;font-weight:600">₹${i.price.toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const nextSteps = isBalance ? '' : isRental ? `
  <div style="margin:28px 0;padding:24px;background:#f6f9f5;border-radius:12px;">
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#2d5a27;text-transform:uppercase;letter-spacing:1px;">What happens next</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;vertical-align:top;width:32px;font-size:20px;">🌳</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Your tree is tagged</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Our orchardists in Ramnagar have set aside your tree for this season.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;font-size:20px;">💳</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Pay the balance within 7 days</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Log in to your dashboard and click "Pay Balance" to secure your slot.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;font-size:20px;">🥭</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Harvest delivered to your door</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Fresh mangoes from your tree, packed and dispatched the same day they're picked.</p>
        </td>
      </tr>
    </table>
  </div>` : `
  <div style="margin:28px 0;padding:24px;background:#f6f9f5;border-radius:12px;">
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#2d5a27;text-transform:uppercase;letter-spacing:1px;">What happens next</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;vertical-align:top;width:32px;font-size:20px;">📦</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Order confirmed</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">We've received your order and will begin packing as soon as the harvest starts.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;font-size:20px;">🚚</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Dispatched fresh</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Your box is packed and shipped the same day it's picked — no cold storage, ever.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;font-size:20px;">🥭</td>
        <td style="padding:8px 0;vertical-align:top;">
          <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Enjoy the harvest</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Pure Ramnagar mangoes, straight from our orchard to your doorstep.</p>
        </td>
      </tr>
    </table>
  </div>`;

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7f2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:#2d5a27;padding:40px 32px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Ramnagar, Uttarakhand</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">YourOrchard 🌳</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Own the harvest. Not the farm.</p>
  </div>

  <!-- Confirmation banner -->
  <div style="background:#3a7234;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">
      ${isBalance ? '✅ Balance Payment Received!' : '✅ ' + (isRental ? 'Tree Rental Confirmed!' : 'Order Confirmed!')}
    </p>
  </div>

  <!-- Body -->
  <div style="background:#fff;padding:32px;">
    <p style="margin:0 0 6px;font-size:17px;color:#111;">Hi <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
      ${isBalance
        ? 'Your balance payment has been received. Your tree slot is now fully secured for this season — thank you!'
        : isRental
        ? 'Welcome to the orchard! Your tree has been tagged and our orchardists in Ramnagar are already taking care of it. Here\'s a summary of your booking:'
        : 'Your mango box is booked! We\'ll pack and dispatch it fresh from our orchard the day the harvest starts. Here\'s your order summary:'}
    </p>

    <!-- Order table -->
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5eddf;">
      <thead>
        <tr style="background:#f6f9f5;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 14px;background:#f6f9f5;border:1px solid #e5eddf;border-top:none;border-radius:0 0 10px 10px;margin-bottom:24px;">
      <span style="font-size:15px;font-weight:700;color:#111;">Total Paid</span>
      <span style="font-size:18px;font-weight:800;color:#2d5a27;">₹${params.total.toLocaleString('en-IN')}</span>
    </div>

    <!-- Delivery address -->
    <div style="padding:16px 18px;border:1px solid #e5eddf;border-radius:10px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Delivery Address</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${params.deliveryAddress}</p>
    </div>

    ${nextSteps}

    <!-- Thank you note -->
    <div style="margin-top:28px;padding:24px;background:#fef9f0;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;">
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#92400e;">A note from our orchard 🙏</p>
      <p style="margin:0;font-size:13.5px;color:#78350f;line-height:1.7;">
        Every tree you rent helps a farming family in Ramnagar grow with dignity. Your support means the world to us and to them. We promise to send you only the freshest, most honest mangoes — picked at the right time, packed with care, delivered with love.
      </p>
      <p style="margin:12px 0 0;font-size:13px;color:#78350f;font-style:italic;">— The YourOrchard Team, Ramnagar</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#1e3d1a;padding:24px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.9);font-size:13px;">Questions? Reply to this email or write to us at</p>
    <p style="margin:0 0 16px;"><a href="mailto:support.yourorchard@gmail.com" style="color:#86efac;font-size:13px;text-decoration:none;">support.yourorchard@gmail.com</a></p>
    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">© ${new Date().getFullYear()} YourOrchard · Ramnagar, Uttarakhand 244715</p>
  </div>

</div>
</body>
</html>`;
}

export function rentalStatusHtml(params: { customerName: string; plan: string; variety: string; status: string; deliveryAddress: string }) {
  const messages: Record<string, { headline: string; body: string }> = {
    completed: {
      headline: 'Your Season is Complete! 🥭',
      body: `Your <strong>${params.plan} (${params.variety})</strong> tree has had a great season. Your mangoes are being harvested and will be dispatched to your delivery address shortly. Thank you for being part of YourOrchard!`,
    },
    cancelled: {
      headline: 'Rental Cancelled',
      body: `Your <strong>${params.plan} (${params.variety})</strong> tree rental has been cancelled. If you have any questions or need assistance, please reach out to us.`,
    },
  };
  const m = messages[params.status] || { headline: `Rental Update: ${params.status}`, body: `Your rental status has been updated to <strong>${params.status}</strong>.` };

  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
  <div style="background:#2d5a27;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">${m.headline}</h1>
  </div>
  <div style="padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px">Hi <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 24px;color:#374151">${m.body}</p>
    <div style="background:#f6f9f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Delivery Address</p>
      <p style="margin:0;color:#374151">${params.deliveryAddress}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:13px">Questions? Reply to this email or contact us at yourorchard.in.</p>
  </div>
</div>`;
}

export function orderStatusHtml(params: { customerName: string; variety: string; quantity: number; status: string; deliveryAddress: string }) {
  const messages: Record<string, { headline: string; body: string }> = {
    dispatched: {
      headline: 'Your Mango Box is On Its Way! 🥭',
      body: `Your <strong>${params.quantity} × ${params.variety} mango box</strong> has been dispatched and is on its way to you. Expect delivery in the next 2–3 days.`,
    },
    delivered: {
      headline: 'Delivered — Enjoy Your Mangoes! 🌿',
      body: `Your <strong>${params.quantity} × ${params.variety} mango box</strong> has been delivered. We hope you enjoy every bite! Leave us a review — it means a lot to the team.`,
    },
    cancelled: {
      headline: 'Order Cancelled',
      body: `Your <strong>${params.quantity} × ${params.variety} mango box</strong> order has been cancelled. If you have questions, please reach out to us.`,
    },
  };
  const m = messages[params.status] || { headline: `Order Update: ${params.status}`, body: `Your order status has been updated to <strong>${params.status}</strong>.` };

  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
  <div style="background:#2d5a27;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">${m.headline}</h1>
  </div>
  <div style="padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <p style="margin:0 0 16px">Hi <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 24px;color:#374151">${m.body}</p>
    <div style="background:#f6f9f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Delivery Address</p>
      <p style="margin:0;color:#374151">${params.deliveryAddress}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:13px">Questions? Reply to this email or contact us at yourorchard.in.</p>
  </div>
</div>`;
}

export function masterOrderConfirmationEmail(params: {
  orderNumber: string;
  buyer: { name: string; email: string; phone: string };
  deliveryAddress: { full: string };
  items: Array<{ type: string; plan?: string; variety: string; quantity: number; unitPrice: number; lineTotal: number }>;
  totalAmount: number;
  season: string;
  notes?: string;
  hasTree: boolean;
  hasBox: boolean;
}) {
  const rows = params.items.map(i => {
    const label = i.type === 'tree'
      ? `${i.variety.charAt(0).toUpperCase() + i.variety.slice(1)} ${i.plan ? i.plan.charAt(0).toUpperCase() + i.plan.slice(1) : ''} Tree Rental (Token)`
      : `${i.variety.charAt(0).toUpperCase() + i.variety.slice(1)} Mango Box`;
    return `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;font-size:14px;color:#374151">${label}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;text-align:center;font-size:14px;color:#374151">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;text-align:right;font-size:14px;color:#374151">₹${i.unitPrice.toLocaleString('en-IN')}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f4ee;text-align:right;font-size:14px;color:#374151;font-weight:600">₹${i.lineTotal.toLocaleString('en-IN')}</td>
    </tr>`;
  }).join('');

  const treeSteps = params.hasTree ? `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:32px;font-size:20px;">🌳</td>
      <td style="padding:8px 0;vertical-align:top;">
        <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Your tree is tagged</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Our orchardists in Ramnagar have set aside your tree for this season.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 0;vertical-align:top;font-size:20px;">💳</td>
      <td style="padding:8px 0;vertical-align:top;">
        <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Pay the balance within 7 days</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Log in to your dashboard and click "Pay Balance" to secure your slot.</p>
      </td>
    </tr>` : '';

  const boxSteps = params.hasBox ? `
    <tr>
      <td style="padding:8px 0;vertical-align:top;font-size:20px;">📦</td>
      <td style="padding:8px 0;vertical-align:top;">
        <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Mango box confirmed</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">We'll pack and dispatch your box fresh from the orchard on harvest day.</p>
      </td>
    </tr>` : '';

  const harvestStep = `
    <tr>
      <td style="padding:8px 0;vertical-align:top;font-size:20px;">🥭</td>
      <td style="padding:8px 0;vertical-align:top;">
        <p style="margin:0;font-size:13.5px;font-weight:700;color:#111;">Harvest delivered to your door</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Fresh Ramnagar mangoes, packed and dispatched the same day they're picked.</p>
      </td>
    </tr>`;

  const notesSection = params.notes ? `
    <div style="padding:16px 18px;border:1px solid #e5eddf;border-radius:10px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your Notes</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${params.notes}</p>
    </div>` : '';

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7f2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:#2d5a27;padding:40px 32px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Ramnagar, Uttarakhand</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">YourOrchard 🌳</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Own the harvest. Not the farm.</p>
  </div>

  <!-- Confirmation banner -->
  <div style="background:#3a7234;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">✅ Order Confirmed!</p>
  </div>

  <!-- Body -->
  <div style="background:#fff;padding:32px;">

    <!-- Order number -->
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Order Number</p>
      <p style="margin:0;font-size:24px;font-weight:800;color:#2d5a27;">#${params.orderNumber}</p>
    </div>

    <p style="margin:0 0 6px;font-size:17px;color:#111;">Hi <strong>${params.buyer.name}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
      Thank you for your order! We're thrilled to have you as part of the YourOrchard family. Here's a summary of everything you booked:
    </p>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5eddf;">
      <thead>
        <tr style="background:#f6f9f5;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Unit Price</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 14px;background:#f6f9f5;border:1px solid #e5eddf;border-top:none;border-radius:0 0 10px 10px;margin-bottom:24px;">
      <span style="font-size:15px;font-weight:700;color:#111;">Total Paid</span>
      <span style="font-size:18px;font-weight:800;color:#2d5a27;">₹${params.totalAmount.toLocaleString('en-IN')}</span>
    </div>

    <!-- Delivery address -->
    <div style="padding:16px 18px;border:1px solid #e5eddf;border-radius:10px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Delivery Address</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${params.deliveryAddress.full}</p>
    </div>

    ${notesSection}

    <!-- What happens next -->
    <div style="margin:28px 0;padding:24px;background:#f6f9f5;border-radius:12px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#2d5a27;text-transform:uppercase;letter-spacing:1px;">What happens next</p>
      <table style="width:100%;border-collapse:collapse;">
        ${treeSteps}
        ${boxSteps}
        ${harvestStep}
      </table>
    </div>

    <!-- Thank you note -->
    <div style="margin-top:28px;padding:24px;background:#fef9f0;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;">
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#92400e;">A note from our orchard 🙏</p>
      <p style="margin:0;font-size:13.5px;color:#78350f;line-height:1.7;">
        Every tree you rent helps a farming family in Ramnagar grow with dignity. Your support means the world to us and to them. We promise to send you only the freshest, most honest mangoes — picked at the right time, packed with care, delivered with love.
      </p>
      <p style="margin:12px 0 0;font-size:13px;color:#78350f;font-style:italic;">— The YourOrchard Team, Ramnagar</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#1e3d1a;padding:24px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.9);font-size:13px;">Questions? Reply to this email or write to us at</p>
    <p style="margin:0 0 16px;"><a href="mailto:support.yourorchard@gmail.com" style="color:#86efac;font-size:13px;text-decoration:none;">support.yourorchard@gmail.com</a></p>
    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">© ${new Date().getFullYear()} YourOrchard · Ramnagar, Uttarakhand 244715</p>
  </div>

</div>
</body>
</html>`;
}

export function ownerMasterOrderNotificationEmail(params: {
  orderNumber: string;
  buyer: { name: string; email: string; phone: string };
  customerEmail: string;
  deliveryAddress: { full: string };
  items: Array<{ type: string; plan?: string; variety: string; quantity: number; unitPrice: number; lineTotal: number }>;
  totalAmount: number;
  season: string;
  notes?: string;
  hasTree: boolean;
  hasBox: boolean;
}) {
  const itemLines = params.items.map(i => {
    const label = i.type === 'tree'
      ? `${i.variety} ${i.plan || ''} Tree Rental (Token) ×${i.quantity}`
      : `${i.variety} Mango Box ×${i.quantity}`;
    return `<li style="margin:4px 0;font-size:14px;color:#374151;">${label} — ₹${i.lineTotal.toLocaleString('en-IN')}</li>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7f2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:520px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#2d5a27;padding:28px 32px;text-align:center;">
    <h2 style="margin:0;color:#fff;font-size:20px;font-weight:800;">New Order #${params.orderNumber}</h2>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">₹${params.totalAmount.toLocaleString('en-IN')} · ${params.season} Season</p>
  </div>
  <div style="background:#fff;padding:28px 32px;">
    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Customer</p>
    <p style="margin:0 0 16px;font-size:15px;color:#111;">${params.buyer.name} · ${params.customerEmail} · ${params.buyer.phone}</p>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Items</p>
    <ul style="margin:0 0 16px;padding-left:20px;">${itemLines}</ul>

    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Deliver to</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">${params.deliveryAddress.full}</p>

    ${params.notes ? `<p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Customer Notes</p><p style="margin:0;font-size:14px;color:#374151;">${params.notes}</p>` : ''}
  </div>
</div>
</body>
</html>`;
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
