import crypto from 'crypto';
import { getKeyByHash, touchApiKeyLastUsed } from '@/lib/db/queries';
import type { Tenant } from '@/lib/db/schema';

export interface ValidatedKey {
  tenant: Tenant;
  keyId: string;
}

export type ValidateResult =
  | { ok: true; data: ValidatedKey }
  | { ok: false; status: 401 | 402 | 429; message: string; upgradeUrl?: string };

export async function validateApiKey(rawKey: string): Promise<ValidateResult> {
  if (!rawKey.startsWith('fg_live_')) {
    return { ok: false, status: 401, message: 'Invalid API key format.' };
  }

  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const row = await getKeyByHash(hash);

  if (!row) {
    return { ok: false, status: 401, message: 'API key not found or inactive.' };
  }

  const { tenant } = row;

  if (tenant.requests_used >= tenant.request_limit) {
    return {
      ok: false,
      status: 429,
      message: `Monthly request limit reached (${tenant.request_limit.toLocaleString()}). Upgrade to continue.`,
      upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    };
  }

  // touch last_used async (fire-and-forget)
  touchApiKeyLastUsed(row.id).catch(() => {});

  return { ok: true, data: { tenant, keyId: row.id } };
}
