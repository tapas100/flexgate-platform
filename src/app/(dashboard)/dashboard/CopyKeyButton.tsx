'use client';

import { useState } from 'react';

interface Props {
  keyPrefix: string;
  keyId: string;
}

function copyToClipboard(text: string) {
  // Modern clipboard API
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

export default function CopyKeyButton({ keyId }: Props) {
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCopy() {
    if (fullKey) {
      await copyToClipboard(fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    if (!confirm('To copy the full key, we need to regenerate it (the old key will be revoked). Continue?')) return;

    setLoading(true);
    await fetch(`/api/keys/${keyId}`, { method: 'DELETE' });
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Free Tier Key' }),
    });
    const data = await res.json();
    setFullKey(data.raw);
    await copyToClipboard(data.raw);
    setCopied(true);
    setLoading(false);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      disabled={loading}
      className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
    >
      {loading ? 'Regenerating…' : copied ? '✓ Copied!' : fullKey ? 'Copy again' : 'Copy full key'}
    </button>
  );
}
