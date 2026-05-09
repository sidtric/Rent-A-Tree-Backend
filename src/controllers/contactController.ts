import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';

export async function submitContact(req: Request, res: Response) {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message received! We will get back to you soon.' });
  } catch (err) {
    console.error('[submitContact]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
