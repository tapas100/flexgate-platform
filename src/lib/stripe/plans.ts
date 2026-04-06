import type { Plan } from '@/lib/db/schema';

export interface PlanConfig {
  id: Plan;
  name: string;
  price: number; // USD/mo
  requestLimit: number;
  stripePriceId: string | null;
  features: string[];
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    requestLimit: 100_000,
    stripePriceId: null,
    features: [
      '100k requests/month',
      'Rule engine',
      'Anomaly detection',
      'Community support',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    requestLimit: 1_000_000,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
    features: [
      '1M requests/month',
      'All Free features',
      'Signal engine',
      'Email support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    requestLimit: 10_000_000,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: [
      '10M requests/month',
      'All Starter features',
      'Priority support',
      'Usage analytics',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // custom
    requestLimit: Number.MAX_SAFE_INTEGER,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? null,
    features: [
      'Unlimited requests',
      'All Pro features',
      'SLA guarantee',
      'Dedicated support',
      'Custom rules',
    ],
  },
};

export function getPlanByPriceId(priceId: string): Plan | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.stripePriceId === priceId) return plan as Plan;
  }
  return null;
}
