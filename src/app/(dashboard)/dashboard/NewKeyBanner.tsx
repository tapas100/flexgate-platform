'use client';

import { useState, useEffect } from 'react';

function copyToClipboard(text: string) {
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

export default function NewKeyBanner() {
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = sessionStorage.getItem('fg_new_key');
    if (key) setRawKey(key);
  }, []);

  if (!rawKey) return null;

  async function handleCopy() {
    await copyToClipboard(rawKey!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDismiss() {
    sessionStorage.removeItem('fg_new_key');
    setRawKey(null);
  }

  return (
    <div className="bg-green-50 border border-green-300 rounded-2xl p-6 mb-8">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-green-800 text-sm">🎉 Your Free Tier API Key is ready!</p>
          <p className="text-xs text-green-700 mt-1">
            Copy it now — this is the <strong>only time</strong> the full key will be shown.
            You can always generate a new one from API Keys.
          </p>
        </div>
        <button onClick={handleDismiss} className="text-green-500 hover:text-green-700 text-lg leading-none ml-4">✕</button>
      </div>
      <code className="block bg-white border border-green-200 rounded-xl px-4 py-3 text-sm font-mono break-all text-gray-800 mb-3">
        {rawKey}
      </code>
      <button
        onClick={handleCopy}
        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        {copied ? '✓ Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  );
}
