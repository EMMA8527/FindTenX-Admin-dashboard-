# FindTenX Admin — App Secrets (updated after per-admin auth)

**App:** FindTenX Admin Dashboard only  
Repos names unchanged.

## Admin authentication secrets

| Variable | Purpose | Notes |
| --- | --- | --- |
| `ADMIN_SESSION_SECRET` | JWT signing + encrypts per-admin MFA secrets at rest | **Required.** Generate with `node scripts/generate-admin-secrets.mjs --write` |

**Removed (do not use):** `ADMIN_PASSWORD_HASH`, `ADMIN_MFA_SECRET`  
Passwords and MFA are **per administrator** in the database. Provision with:

```bash
node scripts/provision-admin.mjs --email you@findtenx.com --name "Your Name" --role super_admin
```

## Backend integration secrets (unchanged)

| Variable | Source | Enter when |
| --- | --- | --- |
| `FINDTENX_API_URL` | FindTenX-Core | After `api.findtenx.app` is live |
| `FINDTENX_ADMIN_API_KEY` | FindTenX-Core `ADMIN_API_KEY` | After Core admin key is set |
| `FINDTENX_DATA_API_URL` | FindTenX-Data | After Data is live |
| `FINDTENX_DATA_API_KEY` | FindTenX-Data | After Data is live |

Confirm removal of obsolete shared `ADMIN_PASSWORD_HASH` / `ADMIN_MFA_SECRET` in Cursor Secrets.
