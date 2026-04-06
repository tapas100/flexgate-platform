import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId, deactivateApiKey } from '@/lib/db/queries';

// DELETE /api/keys/[id] — revoke a key
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantByClerkId(userId);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { id } = await params;
  await deactivateApiKey(id, tenant.id);
  return NextResponse.json({ success: true });
}
