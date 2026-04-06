import { createClient } from '@supabase/supabase-js';
import type { Tenant, ApiKey, UsageEvent, Plan } from './schema';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Tenants ──────────────────────────────────────────────────────────────

export async function getTenantByClerkId(clerkUserId: string): Promise<Tenant | null> {
  const { data } = await adminClient()
    .from('tenants')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  return data ?? null;
}

export async function upsertTenant(
  clerkUserId: string,
  email: string
): Promise<Tenant> {
  const { data, error } = await adminClient()
    .from('tenants')
    .upsert(
      { clerk_user_id: clerkUserId, email, updated_at: new Date().toISOString() },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTenantPlan(
  tenantId: string,
  plan: Plan,
  requestLimit: number,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  subscriptionStatus?: string
): Promise<void> {
  const { error } = await adminClient()
    .from('tenants')
    .update({
      plan,
      request_limit: requestLimit,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId);
  if (error) throw error;
}

export async function incrementUsage(tenantId: string, count = 1): Promise<void> {
  await adminClient().rpc('increment_requests_used', {
    p_tenant_id: tenantId,
    p_count: count,
  });
  // Fallback: update directly (if RPC not available yet)
  // await adminClient()
  //   .from('tenants')
  //   .update({ requests_used: supabase.rpc('requests_used + 1') })
  //   .eq('id', tenantId);
}

export async function getTenantByStripeCustomerId(
  stripeCustomerId: string
): Promise<Tenant | null> {
  const { data } = await adminClient()
    .from('tenants')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
  return data ?? null;
}

// ── API Keys ─────────────────────────────────────────────────────────────

export async function getKeyByHash(hash: string): Promise<(ApiKey & { tenant: Tenant }) | null> {
  const { data } = await adminClient()
    .from('api_keys')
    .select('*, tenant:tenants(*)')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .single();
  return data ?? null;
}

export async function listApiKeys(tenantId: string): Promise<ApiKey[]> {
  const { data } = await adminClient()
    .from('api_keys')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createApiKey(
  tenantId: string,
  hash: string,
  prefix: string,
  name: string
): Promise<ApiKey> {
  const { data, error } = await adminClient()
    .from('api_keys')
    .insert({ tenant_id: tenantId, key_hash: hash, key_prefix: prefix, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateApiKey(id: string, tenantId: string): Promise<void> {
  const { error } = await adminClient()
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) throw error;
}

export async function touchApiKeyLastUsed(id: string): Promise<void> {
  await adminClient()
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', id);
}

// ── Usage Events ──────────────────────────────────────────────────────────

export async function logUsageEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): Promise<void> {
  await adminClient().from('usage_events').insert(event);
}

export async function getUsageStats(tenantId: string, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data } = await adminClient()
    .from('usage_events')
    .select('action, severity, timestamp')
    .eq('tenant_id', tenantId)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true });
  return data ?? [];
}
