import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/keys/validate';
import { callIntelligence } from '@/lib/intelligence/proxy';
import { logUsageEvent, incrementUsage } from '@/lib/db/queries';
import type { AnalyzeRequest } from '@/lib/intelligence/proxy';

export async function POST(req: NextRequest) {
  // ── 1. Extract Bearer token ───────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const apiKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing Authorization header.' },
      { status: 401 }
    );
  }

  // ── 2. Validate key + check quota ──────────────────────────────────────
  const result = await validateApiKey(apiKey);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, ...(result.upgradeUrl ? { upgradeUrl: result.upgradeUrl } : {}) },
      { status: result.status }
    );
  }

  const { tenant, keyId } = result.data;

  // ── 3. Parse body ──────────────────────────────────────────────────────
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const start = Date.now();

  // ── 4. Call intelligence engine ────────────────────────────────────────
  const decision = await callIntelligence(body, tenant.id);
  const latencyMs = Date.now() - start;

  // ── 5. Log usage + increment counter (fire-and-forget) ─────────────────
  Promise.all([
    logUsageEvent({
      tenant_id: tenant.id,
      api_key_id: keyId,
      upstream: body.upstream ?? '',
      path: body.path ?? '',
      method: body.method ?? 'GET',
      action: decision.action,
      severity: decision.severity,
      confidence: decision.confidence,
      latency_ms: latencyMs,
      decision_id: decision.meta.decisionId,
    }),
    incrementUsage(tenant.id),
  ]).catch(() => {});

  // ── 6. Return decision ─────────────────────────────────────────────────
  return NextResponse.json(decision, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'POST /api/v1/analyze' });
}
