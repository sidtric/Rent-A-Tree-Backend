import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendMail, otpEmailHtml } from '../utils/mailer';
import { generateOtp, setOtp, getOtp, deleteOtp, isOnCooldown } from '../utils/otpStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

function userPayload(user: any) {
  const p: Record<string, unknown> = {
    id:    user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
  };
  if (user.phone)           p.phone           = user.phone;
  if (user.deliveryAddress) p.deliveryAddress = user.deliveryAddress;
  return p;
}

// ── OTP: send ────────────────────────────────────────────────────────────────

export async function sendOtp(req: Request, res: Response) {
  try {
    const { email, name, phone } = req.body;
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    const lEmail = email.toLowerCase();

    if (await isOnCooldown(lEmail)) {
      return res.status(429).json({ message: 'Please wait 30 seconds before requesting another OTP.' });
    }

    const existingUser = await User.findOne({ email: lEmail });

    if (name) {
      // Signup mode
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered. Please log in.' });
      }
      if (!phone) return res.status(400).json({ message: 'Phone number is required.' });

      const existing = await getOtp(lEmail);
      const otp = (existing && existing.type === 'signup') ? existing.otp : generateOtp();
      await setOtp(lEmail, { otp, type: 'signup', name: name.trim(), phone });
      const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      sendMail(lEmail, `Your YourOrchard verification code · ${ts}`, otpEmailHtml(name.trim(), otp));
    } else {
      // Login mode
      if (!existingUser) {
        return res.status(404).json({ message: 'No account found. Please sign up first.' });
      }

      const existing = await getOtp(lEmail);
      const otp = (existing && existing.type === 'login') ? existing.otp : generateOtp();
      await setOtp(lEmail, { otp, type: 'login' });
      const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      sendMail(lEmail, `Your YourOrchard sign-in code · ${ts}`, otpEmailHtml(existingUser.name, otp));
    }

    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('[sendOtp]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── OTP: verify ───────────────────────────────────────────────────────────────

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const lEmail = email.toLowerCase();
    const entry = await getOtp(lEmail);

    if (!entry) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }
    if (entry.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    await deleteOtp(lEmail);

    let user;
    if (entry.type === 'signup') {
      user = await User.create({ name: entry.name, email: lEmail, phone: entry.phone });
    } else {
      user = await User.findOne({ email: lEmail });
      if (!user) return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      token: signToken(String(user._id)),
      user:  userPayload(user),
    });
  } catch (err) {
    console.error('[verifyOtp]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function googleAuth(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Credential is required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: 'Invalid Google token.' });
    }

    const { email, name, sub: googleId } = payload;
    const lEmail = email.toLowerCase();

    let user = await User.findOne({ $or: [{ googleId }, { email: lEmail }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({ name: name || lEmail, email: lEmail, googleId });
    }

    res.json({
      token: signToken(String(user._id)),
      user:  userPayload(user),
    });
  } catch (err) {
    console.error('[googleAuth]', err);
    res.status(400).json({ message: 'Google authentication failed.' });
  }
}

// ── Legacy (kept for admin/backward compat) ───────────────────────────────────

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      token: signToken(String(user._id)),
      user:  userPayload(user),
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({
      token: signToken(String(user._id)),
      user:  userPayload(user),
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  res.json(req.user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { phone, deliveryAddress } = req.body;
    const update: Record<string, unknown> = {};
    if (phone !== undefined) update.phone = phone;
    if (deliveryAddress) update.deliveryAddress = deliveryAddress;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: update },
      { new: true, select: '-password' }
    );
    res.json(user);
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
