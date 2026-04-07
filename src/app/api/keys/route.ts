import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId, listApiKeys, createApiKey } from '@/lib/db/queries';
import { generateApiKey } from '@/lib/keys/generate';
import { z } from 'zod';

// GET /api/keys — list all keys for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantByClerkId(userId);
  if (!tenant) return NextResponse.json({ keys: [] });

  const keys = await listApiKeys(tenant.id);
  // Normalize key_prefix → prefix for the client
  const normalized = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.key_prefix,
    is_active: k.is_active,
    last_used_at: k.last_used_at,
    created_at: k.created_at,
  }));
  return NextResponse.json({ keys: normalized });
}

// POST /api/keys — create a new API key
const CreateKeySchema = z.object({
  name: z.string().min(1).max(64).default('Default'),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantByClerkId(userId);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  let name = 'Default';
  try {
    const body = await req.json();
    const parsed = CreateKeySchema.safeParse(body);
    if (parsed.success) name = parsed.data.name;
  } catch {
    // use default name
  }

  const { raw, hash, prefix } = generateApiKey();
  const key = await createApiKey(tenant.id, hash, prefix, name);

  // Return the raw key ONCE — it will never be shown again
  return NextResponse.json({
    id: key.id,
    name: key.name,
    prefix: key.key_prefix,
    raw, // ← shown once
    createdAt: key.created_at,
  });
}
