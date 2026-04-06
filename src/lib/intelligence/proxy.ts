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

const TIMEOUT_MS = 50;

export async function callIntelligence(
  body: AnalyzeRequest,
  _tenantId: string
): Promise<AnalyzeResponse> {
  const baseUrl = process.env.INTELLIGENCE_SERVER_URL;
  const secret = process.env.INTELLIGENCE_SERVER_SECRET;

  if (!baseUrl || !secret) {
    return defaultAllow();
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${baseUrl}/v1/internal/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return defaultAllow();
    return (await res.json()) as AnalyzeResponse;
  } catch {
    // fail open — never block traffic due to intelligence timeout
    return defaultAllow();
  }
}

function defaultAllow(): AnalyzeResponse {
  return {
    action: 'allow',
    severity: 'none',
    reason: 'Default allow (intelligence unavailable)',
    confidence: 0,
    meta: {
      decisionId: crypto.randomUUID(),
      ruleFired: null,
      anomaly: false,
      ttlMs: 0,
      mode: 'default',
    },
  };
}
