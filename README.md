# FlexGate Platform

The SaaS platform for [FlexGate Intelligence](https://github.com/tapas100/flexgate-intelligence) — Intelligent API gateway with rule engine, anomaly detection, and signal scoring.

## Stack

| Layer | Service |
|-------|---------|
| Frontend & API | Next.js 14 App Router on Vercel |
| Auth | Clerk |
| Payments | Stripe |
| Database | Supabase (Postgres) |
| Email | Resend |
| Intelligence Server | Railway |

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local` with real values from each provider dashboard.

### 3. Run Supabase migration
Open `supabase/schema.sql` and run it in your Supabase SQL editor.

### 4. Start dev server
```bash
npm run dev
```

## API

### POST /api/v1/analyze
```
Authorization: Bearer fg_live_<key>
{ "upstream", "path", "method", "statusCode", "latencyMs", "payloadSize", "clientIpHash", "timestamp" }
```

Response: `{ action, severity, reason, confidence, meta }`

## Deployment
1. Push to GitHub
2. Import in Vercel — add all env vars
3. Set Stripe webhook: `https://your-domain.vercel.app/api/webhooks/stripe`

## License
MIT
