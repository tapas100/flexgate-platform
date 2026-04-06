import { auth } from '@clerk/nextjs/server';
import { getTenantByClerkId } from '@/lib/db/queries';
import { PLANS } from '@/lib/stripe/plans';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  const tenant = userId ? await getTenantByClerkId(userId) : null;
  const plan = tenant ? PLANS[tenant.plan] : PLANS.free;
  const used = tenant?.requests_used ?? 0;
  const limit = tenant?.request_limit ?? PLANS.free.requestLimit;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Plan card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Current Plan</p>
          <p className="text-2xl font-bold capitalize">{plan.name}</p>
          {plan.price > 0 && (
            <p className="text-sm text-gray-400 mt-1">${plan.price}/mo</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Requests Used</p>
          <p className="text-2xl font-bold">{used.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">of {limit.toLocaleString()}/mo</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Quota</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${pct > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{pct}% used</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/api-keys"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 transition"
        >
          <p className="text-lg font-semibold mb-1">🔑 API Keys</p>
          <p className="text-sm text-gray-500">Create and manage your access keys.</p>
        </Link>
        <Link
          href="/usage"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 transition"
        >
          <p className="text-lg font-semibold mb-1">📊 Usage Analytics</p>
          <p className="text-sm text-gray-500">View request volume, actions, and severity.</p>
        </Link>
        <Link
          href="/billing"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 transition"
        >
          <p className="text-lg font-semibold mb-1">💳 Billing</p>
          <p className="text-sm text-gray-500">Manage your subscription and payment method.</p>
        </Link>
        <a
          href="https://docs.flexgate.io"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 transition"
        >
          <p className="text-lg font-semibold mb-1">📚 Documentation</p>
          <p className="text-sm text-gray-500">Integration guides and API reference.</p>
        </a>
      </div>
    </div>
  );
}
