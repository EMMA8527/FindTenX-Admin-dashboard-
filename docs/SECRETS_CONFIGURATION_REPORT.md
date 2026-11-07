# FindTenX Admin — Secrets Configuration Report

**Generated:** 2026-11-07 (Africa/Lagos)  
**App only:** FindTenX Admin Dashboard (`emmapaul852/findtenx-admin-dashboard` / GitHub `EMMA8527/FindTenX-Admin-dashboard-`)  
**No rename / no duplicate projects**

## Verdict

**Production Core connection is NOT complete.**  
Canonical Core URL is identified and configured for probing, but **DNS does not resolve** and FindTenX-Core is **not reachable**. No mock or local SQLite path is treated as production.

---

## 1. Production backend API URL (Core)

| Item | Value |
| --- | --- |
| Canonical host | `https://api.findtenx.app` |
| Source | FINDTENX-Mobile (`EXPO_PUBLIC_API_URL`, `eas.json`, `BACKEND_DNS_REQUIREMENTS.md`) + FindTenX-Core README (`cursor/core-api-3f74`) |
| Health route | `GET /api/v1/health` → `{ ok, service: "findtenx-core", database }` |
| Env var | `FINDTENX_API_URL` |
| Live probe (this VM) | **FAIL** — `Could not resolve host: api.findtenx.app` (NXDOMAIN) |
| Admin env | Set locally to `https://api.findtenx.app` for honest fail-closed probing; Cursor Secret still awaiting your value |

## 2. Database / Data API URL

| Item | Value |
| --- | --- |
| Repository | `EMMA8527/findtenx-data` (GitHub) / Origin `findtenx-data` |
| Repo contents | README-only on default branch — **no published API hostname** |
| Canonical Data URL | **Unknown — not inventable** |
| Env vars | `FINDTENX_DATA_API_URL`, `FINDTENX_DATA_API_KEY` |
| Fallback to Core | **Removed** — Data must not reuse Core URL/key |

Core’s own `DATABASE_URL` (Postgres) is a **Core server** secret, not an Admin Dashboard secret. Admin does not bind Core’s `DATABASE_URL`.

## 3. Environment variable name audit (duplicates)

| Name | Owner | Duplicate? |
| --- | --- | --- |
| `ADMIN_SESSION_SECRET` | Admin only | No |
| `ADMIN_PASSWORD_HASH` | Admin only | No |
| `ADMIN_MFA_SECRET` | Admin only | No |
| `FINDTENX_API_URL` | Admin → Core | No (unique) |
| `FINDTENX_ADMIN_API_KEY` | Admin → Core | No; **Core does not define this yet** |
| `FINDTENX_DATA_API_URL` | Admin → Data | No |
| `FINDTENX_DATA_API_KEY` | Admin → Data | No |
| Former Data→Core URL/key fallback | — | **Removed** (was a false production bridge) |

Mobile uses `EXPO_PUBLIC_API_URL` (client). Admin uses server-only `FINDTENX_API_URL`. Different names by design.

## 4–6. Admin auth secrets

Generated securely for this Admin app only (`node scripts/generate-admin-secrets.mjs --write --force`):

- `ADMIN_SESSION_SECRET` — 48-byte base64url
- `ADMIN_PASSWORD_HASH` — bcrypt cost 12, stored as `base64:…` for dotenv safety
- `ADMIN_MFA_SECRET` — TOTP base32

Values are in local `.env.local` (gitignored) and the agent artifact `admin-bootstrap-credentials.txt`.  
Cursor Secrets form still needs the same values for the published Admin app.

## 7. Connect Admin → FindTenX-Core

| Check | Result |
| --- | --- |
| Core repo inspected | GitHub branch `cursor/core-api-3f74` (default `TENCOINX-274` is README-only) |
| Origin `findtenx-core` / `findtenx-data` | Still **403** for this agent token |
| Probe `/api/v1/health` | **Unreachable** (DNS) |
| Platform gate | `CORE_UNREACHABLE` — fail closed; not `local_dev` production |
| Admin overview APIs on Core | **Not present** yet (user JWT `/api/v1/*` only) |

## 8. What still needs your authorization / external work

1. **DNS + TLS** for `api.findtenx.app` → Core load balancer / ingress  
2. **Deploy** FindTenX-Core so `GET /api/v1/health` returns 2xx  
3. **Confirm Data hostname** (or publish findtenx-data) before setting `FINDTENX_DATA_API_URL`  
4. **Admin API credentials on Core** — Core currently has no `ADMIN_API_KEY`; add an admin scheme or document how Admin should authenticate (service JWT)  
5. **Paste generated Admin auth values** into Cursor Secrets (secure form) for the Admin app  
6. Optional: Grant this agent Origin read on `findtenx-core` / `findtenx-data`

## 9. Explicit non-claims

- Not claiming production Core integration complete  
- Not using local SQLite as production  
- Not inventing a Data API URL or Admin API key  
- Not treating NXDOMAIN `api.findtenx.app` as a live connection  
