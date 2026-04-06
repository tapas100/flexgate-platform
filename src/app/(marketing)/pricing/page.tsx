import Link from 'next/link';
import { PLANS } from '@/lib/stripe/plans';

export default function PricingPage() {
  const plans = [PLANS.free, PLANS.starter, PLANS.pro, PLANS.enterprise];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <Link href="/" className="font-bold text-xl tracking-tight">⚡ FlexGate</Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/sign-in" className="hover:text-indigo-600">Sign in</Link>
          <Link href="/sign-up" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Get started free
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold text-center mb-4">Simple, transparent pricing</h1>
        <p className="text-center text-gray-500 mb-12">Start free. Upgrade when you need more.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 flex flex-col gap-4 ${
                plan.id === 'pro' ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start">
                  MOST POPULAR
                </div>
              )}
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <div className="text-4xl font-extrabold">
                {plan.price === 0 && plan.id === 'enterprise'
                  ? 'Custom'
                  : plan.price === 0
                  ? 'Free'
                  : `$${plan.price}`}
                {plan.price > 0 && <span className="text-base font-normal text-gray-400">/mo</span>}
              </div>
              <ul className="flex flex-col gap-2 text-sm text-gray-600 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.id === 'enterprise' ? 'mailto:hello@flexgate.io' : '/sign-up'}
                className={`block text-center py-3 rounded-lg font-semibold transition ${
                  plan.id === 'pro'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-gray-300 hover:border-indigo-400'
                }`}
              >
                {plan.id === 'free' ? 'Get started' : plan.id === 'enterprise' ? 'Contact us' : 'Upgrade'}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
