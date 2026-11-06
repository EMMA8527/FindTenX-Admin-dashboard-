# FindTenX Admin Dashboard

Enterprise administration portal for the FindTenX dating and relationship platform.

## Features

- Secure admin login with MFA challenge and role-based access control
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
- JWT session cookies (`jose`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3456](http://localhost:3456).

### Demo credentials

- Email: `emma@findtenx.com`
- Password: `FindTenX@Admin2026`
- MFA code: `482916`

## Backend integration

This repository ships with a local operations data store and API routes so the dashboard is fully usable without the mobile backend connected yet.

Point production traffic at the FindTenX backend by setting:

```bash
FINDTENX_API_URL=https://api.findtenx.example
ADMIN_SESSION_SECRET=replace-with-long-random-secret
```

Server-side authorization, audit logging, and permission checks must remain on the backend. Frontend permission checks are UX only.

## Product restrictions

FindTenX admin tooling does **not** include voice/video calling, Stories, Status updates, live streaming, or public online directories. Online presence remains a mobile Chat-only concern.

## Scripts

- `npm run dev` — development server on port 3456
- `npm run build` — production build
- `npm run start` — production server on port 3456
- `npm run lint` — ESLint
