layout_content = r"""import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { upsertTenant, listApiKeys, createApiKey } from '@/lib/db/queries';
import { currentUser } from '@clerk/nextjs/server';
import { generateApiKey } from '@/lib/keys/generate';

async function provisionUser(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email =
    user?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.flexgate.io`;
  const tenant = await upsertTenant(userId, email);
  const existing = await listApiKeys(tenant.id);
  if (existing.length === 0) {
    const { raw, hash, prefix } = generateApiKey();
    await createApiKey(tenant.id, hash, prefix, 'Free Tier Key');
    return raw;
  }
  return null;
}

const NAV = [
  { href: '/dashboard', label: '🏠 Dashboard' },
  { href: '/api-keys', label: '🔑 API Keys' },
  { href: '/usage', label: '📊 Usage' },
  { href: '/billing', label: '💳 Billing' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const newKey = await provisionUser();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {newKey && (
        <script
          dangerouslySetInnerHTML={{
            __html: `sessionStorage.setItem('fg_new_key', ${JSON.stringify(newKey)});`,
          }}
        />
      )}
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
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
"""

with open('src/app/(dashboard)/layout.tsx', 'w') as f:
    f.write(layout_content)
print('Layout written successfully')
