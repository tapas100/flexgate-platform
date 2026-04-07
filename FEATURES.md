# FlexGate Platform — Feature Summary

> **FlexGate** is an Intelligent API Gateway SaaS platform. It wraps your backend proxy with rule-based filtering, anomaly detection, and adaptive signal scoring — all in under 50ms.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Auth | Clerk (`@clerk/nextjs` v7) |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| Email | Resend |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Deployment | Vercel-ready |

---

## 🔐 Authentication

- **Sign Up / Sign In** via Clerk — email/password + OAuth
- Route protection via `src/proxy.ts` (Next.js middleware)
  - Public routes: `/`, `/pricing`, `/sign-in`, `/sign-up`, `/api/health`, `/api/v1/*`, `/api/webhooks/*`
  - Protected routes: all `/dashboard/*`, `/api-keys`, `/usage`, `/billing`
- Signed-in users visiting `/` or auth pages are **automatically redirected** to `/dashboard`
- Signed-out users visiting protected routes are **redirected to `/sign-in`**

---

## 👤 Tenant Auto-Provisioning

On first dashboard visit after signup:
1. A **tenant record** is created in Supabase with the user's email and `free` plan
2. A **default Free Tier API key** is auto-generated (`fg_live_...`)
3. The full raw key is injected into `sessionStorage` via a `<script>` tag
4. A **green banner** on the dashboard shows the full key **once** — copy it before dismissing

---

## 🏠 Dashboard (`/dashboard`)

- **API Key card** — shows active key prefix (masked) + "Copy prefix" button + last used timestamp
- **No key state** — onboarding card with instructions and a "Create API key →" CTA
- **New key banner** — one-time reveal of full key after signup (reads from `sessionStorage`)
- **Stats cards**:
  - Current Plan (Free / Starter / Pro / Enterprise)
  - Requests Used (e.g. `0 of 100,000/mo`)
  - Quota progress bar (turns red above 80%)
- **Quick links** — API Keys, Usage Analytics, Billing, Documentation

---

## 🔑 API Keys (`/api-keys`)

- **Create a key** — name your key, click "Create key" → full key shown **once** in green banner
- **Key list table** — shows Name, Prefix, Last Used, Created date
- **Revoke** — soft-deletes key (`is_active = false`); only active keys are shown
- Only **one active key** is used on the dashboard at a time
- Keys are stored as **SHA-256 hashes** — the raw value is never stored in the database
- Key format: `fg_live_<64 hex chars>`

**API Routes:**
- `GET /api/keys` — list active keys (normalized `key_prefix` → `prefix`)
- `POST /api/keys` — create a new key, returns `raw` once
- `DELETE /api/keys/[id]` — revoke a key

---

## 📊 Usage Analytics (`/usage`)

- Bar chart of **actions by type** (last 30 days): `allow`, `block`, `throttle`, `alert`, `cache`
- Colour-coded bars per action type
- Summary cards: Plan, Requests Used, Monthly Limit
- Powered by `usage_events` table in Supabase

**API Route:**
- `GET /api/usage` — returns tenant metadata + raw usage events

---

## 💳 Billing (`/billing`)

- Shows current plan with subscription status badge
- **Plan cards** for Starter ($29/mo), Pro ($99/mo), Enterprise (custom)
- "Upgrade" button → Stripe Checkout session
- "Contact us" for Enterprise (`mailto:hello@flexgate.io`)
- Current plan highlighted in indigo

**API Routes:**
- `GET /api/billing/checkout?plan=<id>` — creates Stripe Checkout session
- `POST /api/webhooks/stripe` — handles Stripe webhook events (subscription updates)

---

## ⚡ Intelligence API (`/api/v1/analyze`)

The core product endpoint — proxies requests through FlexGate's intelligence server:

```bash
POST /api/v1/analyze
Authorization: Bearer fg_live_<your_key>
Content-Type: application/json
```

**Flow:**
1. Extracts `Bearer` token from `Authorization` header
2. Validates API key against SHA-256 hash in DB
3. Checks tenant quota (blocks if over limit with upgrade URL)
4. Forwards request to Intelligence Server (Railway)
5. Logs usage event to `usage_events` table
6. Increments `requests_used` counter atomically via Supabase RPC

---

## 🗄️ Database Schema (Supabase)

### `tenants`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `clerk_user_id` | text | Unique Clerk user ID |
| `email` | text | User email |
| `plan` | text | `free` \| `starter` \| `pro` \| `enterprise` |
| `request_limit` | bigint | Monthly request quota |
| `requests_used` | bigint | Requests used this month |
| `stripe_customer_id` | text | Stripe customer |
| `stripe_subscription_id` | text | Active subscription |
| `subscription_status` | text | e.g. `active`, `canceled` |

### `api_keys`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `tenant_id` | uuid | FK to tenants |
| `key_hash` | text | SHA-256 of raw key |
| `key_prefix` | text | First 16 chars (display only) |
| `name` | text | Human label |
| `is_active` | boolean | False = revoked |
| `last_used_at` | timestamptz | Last request timestamp |

### `usage_events`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `tenant_id` | uuid | FK to tenants |
| `api_key_id` | uuid | FK to api_keys |
| `action` | text | `allow`, `block`, `throttle`, etc. |
| `severity` | text | Severity level |
| `confidence` | float | ML confidence score |
| `latency_ms` | int | Response time |
| `path` | text | Request path |
| `method` | text | HTTP method |

---

## 💰 Pricing Plans

| Plan | Price | Requests/mo | Features |
|---|---|---|---|
| **Free** | $0 | 100,000 | Rule engine, Anomaly detection, Community support |
| **Starter** | $29/mo | 1,000,000 | + Signal engine, Email support |
| **Pro** | $99/mo | 10,000,000 | + Priority support, Usage analytics |
| **Enterprise** | Custom | Custom | All Pro features + custom limits |

---

## 🌐 Marketing Pages

- **Home** (`/`) — Hero, feature highlights (Rule Engine, Anomaly Detection, Signal Scoring), CTA
- **Pricing** (`/pricing`) — Plan comparison cards
- Signed-in users are redirected from these pages to `/dashboard`

---

## 📁 Project Structure

```
src/
├── proxy.ts                  # Next.js middleware (auth + redirects)
├── app/
│   ├── (auth)/               # Sign-in / Sign-up pages (Clerk)
│   ├── (marketing)/          # Public landing + pricing pages
│   ├── (dashboard)/          # Protected dashboard layout + pages
│   │   ├── layout.tsx        # Sidebar nav + tenant provisioning
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── api-keys/         # API key management
│   │   ├── usage/            # Usage analytics
│   │   └── billing/          # Subscription management
│   └── api/
│       ├── v1/analyze/       # Intelligence proxy endpoint
│       ├── keys/             # CRUD for API keys
│       ├── usage/            # Usage stats
│       ├── billing/checkout/ # Stripe checkout
│       ├── webhooks/stripe/  # Stripe webhook handler
│       └── health/           # Health check
├── lib/
│   ├── db/
│   │   ├── schema.ts         # TypeScript types
│   │   └── queries.ts        # Supabase queries
│   ├── keys/
│   │   ├── generate.ts       # API key generation (fg_live_...)
│   │   └── validate.ts       # Key validation + quota check
│   ├── intelligence/
│   │   └── proxy.ts          # Intelligence server client
│   └── stripe/
│       ├── client.ts         # Stripe SDK client
│       └── plans.ts          # Plan config + pricing
└── supabase/
    └── schema.sql            # Full DB schema + RLS + RPC
```

---

## 🔒 Security

- API keys stored as **SHA-256 hashes only** — raw keys never persisted
- Row Level Security (RLS) enabled on all Supabase tables
- Clerk handles all auth token verification
- Stripe webhooks verified via signing secret
- Service role key used only server-side (never exposed to client)

---

*Last updated: April 2026*
