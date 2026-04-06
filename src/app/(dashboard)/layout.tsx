import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

const NAV = [
  { href: '/dashboard', label: '🏠 Dashboard' },
  { href: '/api-keys', label: '🔑 API Keys' },
  { href: '/usage', label: '📊 Usage' },
  { href: '/billing', label: '💳 Billing' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="font-bold text-lg tracking-tight">⚡ FlexGate</Link>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <UserButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
