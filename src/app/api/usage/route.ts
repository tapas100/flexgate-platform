import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId, getUsageStats } from '@/lib/db/queries';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantByClerkId(userId);
  if (!tenant) return NextResponse.json({ events: [], tenant: null });

  const events = await getUsageStats(tenant.id, 30);
  return NextResponse.json({
    events,
    tenant: {
      plan: tenant.plan,
      requests_used: tenant.requests_used,
      request_limit: tenant.request_limit,
    },
  });
}
