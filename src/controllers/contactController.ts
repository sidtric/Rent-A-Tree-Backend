import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { sendMail } from '../utils/mailer';

const OWNER = process.env.OWNER_EMAIL || 'siddharthfuloria06@gmail.com';

export async function submitContact(req: Request, res: Response) {
  try {
    const { name, email, message, type } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const msgType = type === 'notify' ? 'notify' : 'contact';
    await ContactMessage.create({ name, email, message, type: msgType });

    const subject = msgType === 'notify'
      ? `Harvest Notification Request — ${name}`
      : `New Contact Message — ${name}`;
    const html = `
<div style="font-family:sans-serif;max-width:480px;color:#111">
  <h2 style="color:#2d5a27">${msgType === 'notify' ? 'Harvest Notify Request' : 'New Contact Message'}</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
  <p><strong>Message:</strong></p>
  <div style="background:#f6f9f5;padding:14px 16px;border-radius:8px;border-left:3px solid #2d5a27;font-size:14px;line-height:1.6;color:#374151">${message}</div>
</div>`;
    sendMail(OWNER, subject, html).catch(() => {});

    res.status(201).json({ message: 'Message received! We will get back to you soon.' });
  } catch (err) {
    console.error('[submitContact]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
