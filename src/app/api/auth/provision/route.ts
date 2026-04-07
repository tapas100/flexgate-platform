import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getTenantByClerkId, upsertTenant, listApiKeys, createApiKey } from '@/lib/db/queries';
import { generateApiKey } from '@/lib/keys/generate';

/**
 * POST /api/auth/provision
 * Called automatically after login to ensure:
 *  1. A tenant row exists for this Clerk user
 *  2. At least one free API key exists
 *
 * Idempotent — safe to call on every dashboard load.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await currentUser();
  const email =
    user?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.flexgate.io`;

  // 1. Upsert tenant (creates if not exists, updates updated_at otherwise)
  const tenant = await upsertTenant(userId, email);

  // 2. Check if they already have an API key
  const existing = await listApiKeys(tenant.id);
  if (existing.length > 0) {
    return NextResponse.json({ provisioned: false, message: 'Already provisioned' });
  }

  // 3. Auto-create a free default API key
  const { raw, hash, prefix } = generateApiKey();
  await createApiKey(tenant.id, hash, prefix, 'Free Tier Key');

  return NextResponse.json({
    provisioned: true,
    message: 'Tenant and free API key created',
    // We do NOT return `raw` here — user must go to /api-keys to see it
  });
}
