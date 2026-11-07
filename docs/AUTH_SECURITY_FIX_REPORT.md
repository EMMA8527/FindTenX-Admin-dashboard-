# FindTenX Admin — Authentication security fix report

**Date:** 2026-11-07 (Africa/Lagos)  
**Status:** Individual admin auth implemented and tested. **Not publishing yet** — remaining blockers listed below.

## What changed

1. **Per-admin passwords** — bcrypt hashes stored on each `admins` row (`password_hash`). Shared `ADMIN_PASSWORD_HASH` removed from auth config.
2. **Per-admin MFA** — unique TOTP secrets encrypted at rest (`mfa_secret_enc`) with key material from `ADMIN_SESSION_SECRET`. Recovery codes (hashed) supported. Shared `ADMIN_MFA_SECRET` removed.
3. **Activation / deactivation** — `status` active|inactive; inactive accounts cannot sign in. Invite API creates inactive directory rows without credentials.
4. **Password reset** — token completes by setting **that admin’s** password and clearing MFA for re-enrollment.
5. **MFA enrollment** — `/enroll-mfa` + `/api/admin/auth/mfa/enroll`; enrollment-only sessions cannot access admin APIs.
6. **RBAC** — backend `requireAdmin(permission)` unchanged and still enforced; enrollment-only sessions blocked.
7. **Sessions** — JWT + jti revocation, 8h / 7d remember, secure cookie flags, rate limiting preserved.
8. **Audit** — login, MFA, password reset, staff invite/deactivate recorded.
9. **Privilege escalation** — only `super_admin` may invite another `super_admin`.

## Tests run

| Suite | Result |
| --- | --- |
| `npm run test:security` | **21/21 passed** (includes cross-account password/MFA rejection) |
| Full `npm run test` | **29/29 passed** |
| `npm run build` | **Succeeded** |

## How to provision (no shared defaults)

```bash
node scripts/generate-admin-secrets.mjs --write --force
node scripts/provision-admin.mjs --email you@findtenx.com --name "Your Name" --role super_admin
```

Each run prints **one** password + MFA secret. Do not reuse across admins. Do not commit them.

## Remaining blockers (before production publish)

1. **Core still unreachable** — `api.findtenx.app` DNS NXDOMAIN; production platform data not connected.
2. **Cursor Secrets** — set `ADMIN_SESSION_SECRET` (and Core/Data when live). Confirm removal of obsolete `ADMIN_PASSWORD_HASH` / `ADMIN_MFA_SECRET`.
3. **Email delivery** for password-reset tokens not configured (tokens issued; delivery needs a provider).
4. **Publish** — deferred until you confirm this report; demo must stay labelled offline until Core is verified.

## Explicit non-claims

- Auth is production-ready for **individual admin login/MFA/RBAC** in this app.
- Platform/Core production integration is **not** complete.
- No shared admin credentials remain in auth code paths.
