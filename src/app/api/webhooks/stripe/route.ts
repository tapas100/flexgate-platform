import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { getPlanByPriceId, PLANS } from '@/lib/stripe/plans';
import { getTenantByStripeCustomerId, updateTenantPlan } from '@/lib/db/queries';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn('[stripe-webhook] payment failed for customer:', invoice.customer);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const tenant = await getTenantByStripeCustomerId(customerId);
  if (!tenant) return;

  const priceId = sub.items.data[0]?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : null;

  if (!plan) return;

  const planConfig = PLANS[plan];
  await updateTenantPlan(
    tenant.id,
    plan,
    planConfig.requestLimit,
    customerId,
    sub.id,
    sub.status
  );
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const tenant = await getTenantByStripeCustomerId(customerId);
  if (!tenant) return;

  await updateTenantPlan(
    tenant.id,
    'free',
    PLANS.free.requestLimit,
    customerId,
    undefined,
    'canceled'
  );
}
