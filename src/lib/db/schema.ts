// ── Supabase schema types ────────────────────────────────────────────────

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  clerk_user_id: string;
  email: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  request_limit: number;
  requests_used: number;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  tenant_id: string;
  api_key_id: string;
  upstream: string;
  path: string;
  method: string;
  action: string;
  severity: string;
  confidence: number;
  latency_ms: number;
  decision_id: string | null;
  timestamp: string;
}

// ── SQL (run once in Supabase SQL editor) ───────────────────────────────
// Run the following SQL in your Supabase project:
//
// create table if not exists tenants (
//   id uuid primary key default gen_random_uuid(),
//   clerk_user_id text unique not null,
//   email text not null,
//   plan text not null default 'free',
//   stripe_customer_id text,
//   stripe_subscription_id text,
//   subscription_status text,
//   request_limit bigint not null default 100000,
//   requests_used bigint not null default 0,
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );
//
// create table if not exists api_keys (
//   id uuid primary key default gen_random_uuid(),
//   tenant_id uuid not null references tenants(id) on delete cascade,
//   key_hash text unique not null,
//   key_prefix text not null,
//   name text not null default 'Default',
//   is_active boolean not null default true,
//   last_used_at timestamptz,
//   expires_at timestamptz,
//   created_at timestamptz not null default now()
// );
//
// create table if not exists usage_events (
//   id uuid primary key default gen_random_uuid(),
//   tenant_id uuid not null references tenants(id) on delete cascade,
//   api_key_id uuid references api_keys(id) on delete set null,
//   upstream text not null,
//   path text not null,
//   method text not null default 'GET',
//   action text not null,
//   severity text not null,
//   confidence float not null default 0,
//   latency_ms int not null default 0,
//   decision_id text,
//   timestamp timestamptz not null default now()
// );
//
// create index if not exists idx_api_keys_hash on api_keys(key_hash);
// create index if not exists idx_usage_tenant_ts on usage_events(tenant_id, timestamp desc);
//
// alter table tenants enable row level security;
// alter table api_keys enable row level security;
// alter table usage_events enable row level security;
