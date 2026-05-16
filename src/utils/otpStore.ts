import OtpToken from '../models/OtpToken';

export interface OtpEntry {
  otp: string;
  type: 'signup' | 'login';
  name?: string;
  phone?: string;
  cooldownUntil?: number;
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function setOtp(
  email: string,
  entry: Omit<OtpEntry, 'cooldownUntil'>,
): Promise<void> {
  const lEmail = email.toLowerCase();
  const existing = await OtpToken.findOne({ email: lEmail });
  const cooldownUntil =
    existing?.cooldownUntil && existing.cooldownUntil > Date.now()
      ? existing.cooldownUntil
      : Date.now() + 30 * 1000;

  await OtpToken.findOneAndUpdate(
    { email: lEmail },
    {
      $set: {
        otp:           entry.otp,
        type:          entry.type,
        name:          entry.name,
        phone:         entry.phone,
        cooldownUntil,
        expiresAt:     new Date(Date.now() + 10 * 60 * 1000),
      },
    },
    { upsert: true, new: true },
  );
}

export async function getOtp(email: string): Promise<OtpEntry | null> {
  const entry = await OtpToken.findOne({ email: email.toLowerCase() });
  if (!entry) return null;
  return {
    otp:           entry.otp,
    type:          entry.type as 'signup' | 'login',
    name:          entry.name          ?? undefined,
    phone:         entry.phone         ?? undefined,
    cooldownUntil: entry.cooldownUntil ?? undefined,
  };
}

export async function isOnCooldown(email: string): Promise<boolean> {
  const entry = await OtpToken.findOne({ email: email.toLowerCase() });
  return !!entry?.cooldownUntil && Date.now() < entry.cooldownUntil;
}

export async function deleteOtp(email: string): Promise<void> {
  await OtpToken.deleteOne({ email: email.toLowerCase() });
}
