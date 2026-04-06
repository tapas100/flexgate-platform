'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ACTION_COLORS: Record<string, string> = {
  allow: '#22c55e',
  block: '#ef4444',
  throttle: '#f59e0b',
  alert: '#6366f1',
  cache: '#06b6d4',
};

export default function UsagePage() {
  const [data, setData] = useState<{ action: string; count: number }[]>([]);
  const [meta, setMeta] = useState<{ plan: string; requests_used: number; request_limit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => {
        setMeta(d.tenant);
        // aggregate by action
        const agg: Record<string, number> = {};
        for (const e of d.events ?? []) {
          agg[e.action] = (agg[e.action] ?? 0) + 1;
        }
        setData(Object.entries(agg).map(([action, count]) => ({ action, count })));
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Usage Analytics</h1>

      {meta && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Plan</p>
            <p className="text-xl font-bold capitalize">{meta.plan}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Requests Used</p>
            <p className="text-xl font-bold">{meta.requests_used.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Monthly Limit</p>
            <p className="text-xl font-bold">{meta.request_limit.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Actions (last 30 days)</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet. Start sending requests to your API key.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <XAxis dataKey="action" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.action} fill={ACTION_COLORS[entry.action] ?? '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
