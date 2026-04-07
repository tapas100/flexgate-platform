// Intelligence Server HTTP client
// The intelligence engine runs as a separate service (Railway in prod, localhost:4000 in dev).
// This file is the only place that knows the server URL — everything else just calls callIntelligence().

export interface AnalyzeRequest {
  upstream: string;
  path: string;
  method: string;
  statusCode?: number;
  latencyMs?: number;
  payloadSize?: number;
  clientIpHash?: string;
  timestamp: string;
}

export interface AnalyzeResponse {
  action: 'allow' | 'block' | 'throttle' | 'cache' | 'alert';
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  confidence: number;
  meta: {
    decisionId: string;
    ruleFired: string | null;
    anomaly: boolean;
    ttlMs: number;
    mode: 'rule' | 'anomaly' | 'signal' | 'default';
  };
}

/** Max ms to wait for the intelligence server before failing open */
const TIMEOUT_MS = 2000;

export async function callIntelligence(
  body: AnalyzeRequest,
  _tenantId: string
): Promise<AnalyzeResponse> {
  const baseUrl = process.env.INTELLIGENCE_SERVER_URL;
  const secret  = process.env.INTELLIGENCE_SERVER_SECRET;

  if (!baseUrl || !secret || baseUrl === 'https://api.flexgate.io') {
    return defaultAllow('Intelligence server not configured');
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${baseUrl}/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[intelligence] server returned ${res.status}`);
      return defaultAllow(`Upstream error ${res.status}`);
    }

    return (await res.json()) as AnalyzeResponse;
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.warn(`[intelligence] ${isTimeout ? 'timeout' : 'error'}:`, err);
    // Always fail open — never block traffic due to intelligence unavailability
    return defaultAllow(isTimeout ? 'Intelligence server timeout' : 'Intelligence server unreachable');
  }
}

function defaultAllow(reason = 'Default allow'): AnalyzeResponse {
  return {
    action:     'allow',
    severity:   'none',
    reason,
    confidence: 0,
    meta: {
      decisionId: crypto.randomUUID(),
      ruleFired:  null,
      anomaly:    false,
      ttlMs:      0,
      mode:       'default',
    },
  };
}
