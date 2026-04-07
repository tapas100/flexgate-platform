'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  keyPrefix: string;
  planName: string;
  lastUsedAt: string | null;
  appUrl: string;
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

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

export default function ActiveKeyCard({ keyPrefix, planName, lastUsedAt, appUrl }: Props) {
  const [copied, setCopied] = useState(false);

  // The prefix is the first 16 chars — safe to display and copy as an identifier
  // Full key is never stored; user must go to /api-keys to regenerate and see it once
  async function handleCopy() {
    await copyToClipboard(keyPrefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
            Active API Key — {planName} plan
          </p>
          <p className="text-sm text-gray-600">
            Use this key to authenticate requests to the FlexGate Intelligence Server.
          </p>
        </div>
        <Link
          href="/api-keys"
          className="text-sm text-indigo-600 hover:underline whitespace-nowrap"
        >
          Manage keys →
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <code className="bg-white border border-indigo-200 text-indigo-800 text-sm px-4 py-2 rounded-lg font-mono flex-1 min-w-0 truncate">
          {keyPrefix}••••••••••••••••••••••••••••••••
        </code>
        <button
          onClick={handleCopy}
          className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shrink-0"
        >
          {copied ? '✓ Copied!' : 'Copy prefix'}
        </button>
      </div>

      {lastUsedAt && (
        <p className="text-xs text-gray-400 mt-3">
          Last used: {new Date(lastUsedAt).toLocaleString()}
        </p>
      )}

      <div className="mt-4 bg-white border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-mono text-gray-400 mb-2">Usage example</p>
        <code className="text-xs text-gray-700 font-mono break-all">
          curl -H &quot;Authorization: Bearer YOUR_FULL_KEY&quot; \<br />
          &nbsp;&nbsp;{appUrl}/api/v1/analyze
        </code>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Need your full key? Go to{' '}
        <Link href="/api-keys" className="text-indigo-500 underline">
          API Keys
        </Link>{' '}
        → revoke and create a new one to see it once.
      </p>
    </div>
  );
}
