import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <span className="font-bold text-xl tracking-tight">⚡ FlexGate</span>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="hover:text-indigo-600">Pricing</Link>
          <Link href="/docs" className="hover:text-indigo-600">Docs</Link>
          <Link href="/sign-in" className="hover:text-indigo-600">Sign in</Link>
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24 gap-6">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
          Intelligent API Gateway
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Stop bad traffic before it reaches your servers
        </h1>
        <p className="text-xl text-gray-500 max-w-xl">
          FlexGate wraps your proxy with rule-based filtering, anomaly detection, and adaptive
          signal scoring — all in under 50ms.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start free — 100k req/mo
          </Link>
          <Link
            href="/pricing"
            className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:border-indigo-400 transition"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 pb-20 max-w-6xl mx-auto w-full">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} FlexGate. All rights reserved.
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: '🔒',
    title: 'Rule Engine',
    desc: 'Define JSON rules that fire on path patterns, status codes, latency thresholds, and more.',
  },
  {
    icon: '🔭',
    title: 'Anomaly Detection',
    desc: 'Z-score and IQR-based outlier detection on latency and error rates — no ML training required.',
  },
  {
    icon: '📡',
    title: 'Signal Scoring',
    desc: 'Composite traffic health scores built from rolling windows, trend lines, and adaptive thresholds.',
  },
];
