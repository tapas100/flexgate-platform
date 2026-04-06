import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId } from '@/lib/db/queries';
import { PLANS } from '@/lib/stripe/plans';
import Link from 'next/link';

export default async function BillingPage() {
  const { userId } = await auth();
  const tenant = userId ? await getTenantByClerkId(userId) : null;
  const currentPlan = tenant?.plan ?? 'free';

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">Current Plan</p>
        <p className="text-2xl font-bold capitalize mb-1">{PLANS[currentPlan].name}</p>
        {PLANS[currentPlan].price > 0 && (
          <p className="text-gray-400 text-sm">${PLANS[currentPlan].price}/month</p>
        )}
        {tenant?.subscription_status && (
          <span className="inline-block mt-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {tenant.subscription_status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['starter', 'pro', 'enterprise'] as const).map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = currentPlan === planId;
          return (
            <div
              key={planId}
              className={`rounded-2xl border p-6 flex flex-col gap-3 ${
                isCurrent ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-extrabold">
                {planId === 'enterprise' ? 'Custom' : `$${plan.price}/mo`}
              </p>
              <p className="text-sm text-gray-500">
                {plan.requestLimit === Number.MAX_SAFE_INTEGER
                  ? 'Unlimited requests'
                  : `${plan.requestLimit.toLocaleString()} req/mo`}
              </p>
              {isCurrent ? (
                <span className="text-center text-sm text-indigo-600 font-semibold py-2">
                  Current plan
                </span>
              ) : planId === 'enterprise' ? (
                <a
                  href="mailto:hello@flexgate.io"
                  className="block text-center border border-gray-300 rounded-lg py-2 text-sm hover:border-indigo-400 transition"
                >
                  Contact us
                </a>
              ) : (
                <Link
                  href={`/api/billing/checkout?plan=${planId}`}
                  className="block text-center bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Upgrade
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
