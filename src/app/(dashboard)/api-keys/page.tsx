'use client';

import { useEffect, useState } from 'react';

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  async function loadKeys() {
    const res = await fetch('/api/keys');
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }

  useEffect(() => { loadKeys(); }, []);

  async function createKey() {
    setCreating(true);
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName || 'Default' }),
    });
    const data = await res.json();
    setRevealedKey(data.raw);
    setNewKeyName('');
    await loadKeys();
    setCreating(false);
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this key? This cannot be undone.')) return;
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    await loadKeys();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">API Keys</h1>

      {/* Create new key */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Create a new key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {creating ? 'Creating…' : 'Create key'}
          </button>
        </div>
      </div>

      {/* Revealed key (shown once) */}
      {revealedKey && (
        <div className="bg-green-50 border border-green-300 rounded-2xl p-6 mb-6">
          <p className="font-semibold text-green-800 mb-2">✅ Key created — copy it now!</p>
          <p className="text-xs text-green-700 mb-3">This key will never be shown again.</p>
          <code className="block bg-white border border-green-200 rounded-lg p-3 text-sm font-mono break-all">
            {revealedKey}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(revealedKey); }}
            className="mt-3 text-sm text-green-700 underline"
          >
            Copy to clipboard
          </button>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-3 ml-4 text-sm text-gray-500 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Key list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No keys yet. Create one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Prefix</th>
                <th className="px-6 py-3 text-left">Last used</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-6 py-4 font-medium">{k.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{k.prefix}…</td>
                  <td className="px-6 py-4 text-gray-400">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(k.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
