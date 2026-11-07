# FindTenX Admin Dashboard

Enterprise administration portal for the FindTenX dating and relationship platform.

## Features

- Secure admin login with TOTP MFA and role-based access control
- Overview KPIs, charts, recent activity, and pending actions
- User, profile, verification, discovery, likes/matches, and chat operations
- Reports & moderation, subscriptions, payments, notifications, and promotions
- Referrals, communications, fraud ops, website content shells
- Customer support tickets, analytics, staff permissions, platform settings
- API & integration monitoring (live Core/Data probes)
- Security audit logs for sensitive administrative actions
- Light, dark, and system themes

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts
- JWT HttpOnly session cookies (`jose`)
- bcrypt password verification + TOTP MFA (`otpauth`)
- SQLite + Drizzle for **admin-local** operational storage only

## Security configuration (required)

Authentication secrets are **never** embedded in source code. The app fails closed if they are missing.

| Variable | Purpose |
| --- | --- |
| `ADMIN_SESSION_SECRET` | JWT signing key + MFA-at-rest encryption (min 32 characters) |

Per-admin passwords and MFA secrets are stored in the admin database — **not** as shared env vars.

```bash
node scripts/generate-admin-secrets.mjs --write
node scripts/provision-admin.mjs --email you@findtenx.com --name "Your Name" --role super_admin
```

## Backend authority

**FindTenX Core** is the authoritative platform backend. **FindTenX Data** is for analytics/reporting.

| Variable | Purpose |
| --- | --- |
| `FINDTENX_API_URL` | Core base URL |
| `FINDTENX_ADMIN_API_KEY` | Core admin credential |
| `FINDTENX_DATA_API_URL` | Data API base URL (optional; falls back to Core URL for probes) |
| `FINDTENX_DATA_API_KEY` | Data API credential |
| `PLATFORM_DATA_MODE` | `core` (default, fail closed) or `local_dev` (explicit non-production local SQLite) |

Local SQLite is **not** a substitute for the production FindTenX database. In `core` mode, platform modules return `CORE_REQUIRED` until Core is configured and reachable. Use `PLATFORM_DATA_MODE=local_dev` only for explicit local development. Production builds refuse `local_dev` unless `ALLOW_LOCAL_PLATFORM_DATA=true`.

See `docs/FINAL_PRODUCTION_INTEGRATION_REPORT.md` and `docs/INTEGRATION_STATUS.md` for the live integration report. Do not treat local_dev counts as production figures.

## Run locally

```bash
npm install
node scripts/generate-admin-secrets.mjs --write   # first time only
# optional for local UI without Core:
# echo 'PLATFORM_DATA_MODE=local_dev' >> .env.local
npm run dev
```

Open [http://localhost:3456](http://localhost:3456).

## Admin APIs

- `POST /api/admin/auth/login|logout`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/mfa/verify`
- `POST|PUT /api/admin/auth/password/reset`
- `GET /api/admin/overview|users|verification|reports|health|integrations`
- `GET /api/admin/catalog?resource=…`
- Legacy session routes under `/api/auth/*` remain for the login UI

## Scripts

- `npm run dev` — development server on port 3456
- `npm run build` — production build
- `npm run start` — production server on port 3456
- `npm run lint` — ESLint
- `npm run test` — all tests
- `npm run test:security` — auth security tests
- `npm run test:persistence` — SQLite persistence tests
- `npm run test:integration` — Core gate / probe tests

## Product restrictions

FindTenX admin tooling does **not** include voice/video calling, Stories, Status updates, live streaming, or public online directories.
