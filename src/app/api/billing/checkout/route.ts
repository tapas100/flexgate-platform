import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId } from '@/lib/db/queries';
import { stripe } from '@/lib/stripe/client';
import { PLANS } from '@/lib/stripe/plans';
import type { Plan } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

  const plan = req.nextUrl.searchParams.get('plan') as Plan | null;
  if (!plan || !PLANS[plan] || PLANS[plan].price === 0) {
    return NextResponse.redirect(new URL('/billing', req.url));
  }

  const priceId = PLANS[plan].stripePriceId;
  if (!priceId) {
    return NextResponse.redirect(new URL('/billing', req.url));
  }

  const tenant = await getTenantByClerkId(userId);
  if (!tenant) return NextResponse.redirect(new URL('/billing', req.url));

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: tenant.stripe_customer_id ?? undefined,
    customer_email: tenant.stripe_customer_id ? undefined : tenant.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
    metadata: { tenant_id: tenant.id },
  });

  return NextResponse.redirect(session.url!);
}
