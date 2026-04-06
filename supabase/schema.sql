-- Run this in your Supabase SQL editor (Database > SQL Editor)

-- 1. Tenants
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  plan text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  request_limit bigint not null default 100000,
  requests_used bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. API Keys
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  key_hash text unique not null,
  key_prefix text not null,
  name text not null default 'Default',
  is_active boolean not null default true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. Usage Events
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  api_key_id uuid references api_keys(id) on delete set null,
  upstream text not null,
  path text not null,
  method text not null default 'GET',
  action text not null,
  severity text not null,
  confidence float not null default 0,
  latency_ms int not null default 0,
  decision_id text,
  timestamp timestamptz not null default now()
);

-- 4. Indexes
create index if not exists idx_api_keys_hash on api_keys(key_hash);
create index if not exists idx_usage_tenant_ts on usage_events(tenant_id, timestamp desc);

-- 5. Row-Level Security
alter table tenants enable row level security;
alter table api_keys enable row level security;
alter table usage_events enable row level security;

-- 6. RPC for atomic increment
create or replace function increment_requests_used(p_tenant_id uuid, p_count int default 1)
returns void language sql as $$
  update tenants
  set requests_used = requests_used + p_count,
      updated_at = now()
  where id = p_tenant_id;
$$;
