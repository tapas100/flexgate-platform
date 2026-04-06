import crypto from 'crypto';

export interface GeneratedKey {
  /** Full raw key — show to user ONCE, never store */
  raw: string;
  /** SHA-256 hash — store in DB */
  hash: string;
  /** First 16 chars — safe to display in UI */
  prefix: string;
}

export function generateApiKey(): GeneratedKey {
  const random = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const raw = `fg_live_${random}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const prefix = raw.slice(0, 16); // "fg_live_xxxxxxxx"
  return { raw, hash, prefix };
}
