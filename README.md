# FindTenX Admin Dashboard

Enterprise administration portal for the FindTenX dating and relationship platform.

## Features

- Secure admin login with TOTP MFA and role-based access control
- Overview KPIs, charts, recent activity, and pending actions
- User, profile, verification, discovery, likes/matches, and chat operations
- Reports & moderation, subscriptions, payments, notifications, and promotions
- Customer support tickets, analytics, staff permissions, platform settings
- Security audit logs for sensitive administrative actions
- Light, dark, and system themes

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts
- JWT HttpOnly session cookies (`jose`)
- bcrypt password verification + TOTP MFA (`otpauth`)

## Security configuration (required)

Authentication secrets are **never** embedded in source code. The app fails closed if they are missing.

| Variable | Purpose |
| --- | --- |
| `ADMIN_SESSION_SECRET` | JWT signing key (min 32 characters) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password |
| `ADMIN_MFA_SECRET` | Base32 TOTP secret for authenticator apps |

Generate a local `.env.local` (gitignored):

```bash
node scripts/generate-admin-secrets.mjs --write
```

Store the printed bootstrap password and add `ADMIN_MFA_SECRET` to your authenticator app. For hosted deployments, set the same variables in your secrets manager / Cursor app secrets — do not commit them.

See `.env.example` for the variable list without values.

## Run locally

```bash
npm install
node scripts/generate-admin-secrets.mjs --write   # first time only
npm run dev
```

Open [http://localhost:3456](http://localhost:3456).

Sign in with an active administrator email from the staff directory (for example the seeded Super Administrator account), the bootstrap password from secret generation, and a current TOTP code.

## Data layer

The admin app persists operational data in SQLite by default (`./data/findtenx-admin.sqlite`, gitignored).

- First boot runs migrations and a one-time bootstrap into the DB.
- Overview and Users modules read/write the database via `/api/admin/*`.
- Set `DATABASE_URL=file:/path/to.db` or `FTX_SQLITE_PATH` to relocate the file.

### FindTenX Core integration (required for true production)

This agent currently **cannot clone** `findtenx-core` / `findtenx-data` (Origin token 403). When access is granted, set:

```bash
FINDTENX_API_URL=https://your-findtenx-core-api
```

and replace local bootstrap with Core sync. Do not treat the local bootstrap dataset as production customer truth.

## Admin APIs

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/mfa/verify`
- `POST|PUT /api/admin/auth/password/reset`
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET|PATCH /api/admin/users/:id`
- `GET /api/admin/verification`
- `GET /api/admin/reports`
- `GET /api/admin/health`

## Product restrictions

FindTenX admin tooling does **not** include voice/video calling, Stories, Status updates, live streaming, or public online directories. Online presence remains a mobile Chat-only concern.

## Scripts

- `npm run dev` — development server on port 3456
- `npm run build` — production build
- `npm run start` — production server on port 3456
- `npm run lint` — ESLint
- `npm run test:security` — authentication and authorization security tests
- `node scripts/generate-admin-secrets.mjs --write` — create local secrets
