# FindTenX Admin — the seven App Secrets (before you enter them)

**App:** FindTenX Admin Dashboard only  
**Repos:** unchanged (`findtenx-admin-dashboard` / `FindTenX-Admin-dashboard-`)

Enter values in Cursor’s secure Secrets form **only when the source system is ready**. Empty is correct for undeployed backends — do not invent placeholders.

---

## Complete names

| # | Environment variable |
| --- | --- |
| 1 | `ADMIN_SESSION_SECRET` |
| 2 | `ADMIN_PASSWORD_HASH` |
| 3 | `ADMIN_MFA_SECRET` |
| 4 | `FINDTENX_API_URL` |
| 5 | `FINDTENX_ADMIN_API_KEY` |
| 6 | `FINDTENX_DATA_API_URL` |
| 7 | `FINDTENX_DATA_API_KEY` |

---

## What each does + where the value comes from

| Variable | What it does | Source |
| --- | --- | --- |
| `ADMIN_SESSION_SECRET` | Signs Admin JWT session cookies | **Admin authentication** — generate with `openssl rand -base64 48` or `node scripts/generate-admin-secrets.mjs` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the Admin login password (prefer `base64:…` encoding) | **Admin authentication** — from the same generator |
| `ADMIN_MFA_SECRET` | TOTP secret for Admin MFA | **Admin authentication** — from the same generator |
| `FINDTENX_API_URL` | Base URL for FindTenX-Core HTTP API | **FindTenX-Core** — production host is `https://api.findtenx.app` **only after DNS + deploy succeed** |
| `FINDTENX_ADMIN_API_KEY` | Authenticates Admin → Core `/api/v1/admin/*` | **FindTenX-Core** — same value as Core’s `ADMIN_API_KEY` (set on the Core host, then copy here) |
| `FINDTENX_DATA_API_URL` | Base URL for FindTenX-Data analytics | **FindTenX-Data** — leave empty until Data is deployed with a real hostname |
| `FINDTENX_DATA_API_KEY` | Authenticates Admin → Data admin routes | **FindTenX-Data** — same value as Data’s `DATA_API_KEY`; leave empty until Data is live |

---

## Deployed vs not (verified 2026-11-07 Africa/Lagos)

| Service | Repo | Deployed? | Evidence |
| --- | --- | --- | --- |
| FindTenX Admin Dashboard | Admin repos | Code on Origin + GitHub; Cursor publish optional | Running in agent VM; publish awaits your confirm |
| FindTenX-Core | `EMMA8527/FindTenX-Core` | **Not publicly deployed** | `api.findtenx.app` → DNS NXDOMAIN; health probe fails |
| FindTenX-Data | `EMMA8527/findtenx-data` | **Not deployed** (scaffold only) | No production hostname; analytics pipelines not built |
| FINDTENX-Mobile | `EMMA8527/FINDTENX-Mobile` | App code exists; depends on Core | Uses `https://api.findtenx.app` when live |
| Payments / email / SMS / push / IDV | External | **Not configured** | Intentionally disabled in Admin |

---

## What to enter now vs later

**Enter now (Admin auth — required for Admin login):**

1. `ADMIN_SESSION_SECRET`
2. `ADMIN_PASSWORD_HASH`
3. `ADMIN_MFA_SECRET`

**Enter only after Core is live** (see FindTenX-Core `DEPLOY.md`):

4. `FINDTENX_API_URL` = `https://api.findtenx.app` (after `GET /api/v1/health` returns 2xx)
5. `FINDTENX_ADMIN_API_KEY` = Core `ADMIN_API_KEY`

**Leave empty until Data is live:**

6. `FINDTENX_DATA_API_URL`
7. `FINDTENX_DATA_API_KEY`

---

## Rules

- No fake credentials or placeholder production URLs in Secrets.
- Sample / local Admin SQLite is **not** production user data.
- Demo preview (if published) must stay labelled sample until Core probe succeeds.
