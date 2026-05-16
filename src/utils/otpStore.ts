interface OtpEntry {
  otp: string;
  expires: number;
  type: 'signup' | 'login';
  name?: string;
  phone?: string;
  cooldownUntil?: number;
}

const store = new Map<string, OtpEntry>();

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setOtp(email: string, entry: Omit<OtpEntry, 'expires' | 'cooldownUntil'>): void {
  const existing = store.get(email);
  store.set(email.toLowerCase(), {
    ...entry,
    expires: Date.now() + 10 * 60 * 1000,
    cooldownUntil: Date.now() + 30 * 1000,
    ...(existing?.cooldownUntil ? { cooldownUntil: existing.cooldownUntil } : {}),
  });
}

export function getOtp(email: string): OtpEntry | undefined {
  const entry = store.get(email.toLowerCase());
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    store.delete(email.toLowerCase());
    return undefined;
  }
  return entry;
}

export function isOnCooldown(email: string): boolean {
  const entry = store.get(email.toLowerCase());
  return !!entry?.cooldownUntil && Date.now() < entry.cooldownUntil;
}

export function deleteOtp(email: string): void {
  store.delete(email.toLowerCase());
}
