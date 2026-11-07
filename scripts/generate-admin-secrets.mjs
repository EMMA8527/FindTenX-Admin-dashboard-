#!/usr/bin/env node
/**
 * Generates ADMIN_SESSION_SECRET for JWT + MFA-at-rest encryption.
 * Per-admin passwords and MFA secrets are NOT global — provision with:
 *   node scripts/provision-admin.mjs --email ... --name ... --role ...
 *
 * Usage:
 *   node scripts/generate-admin-secrets.mjs --write
 *   node scripts/generate-admin-secrets.mjs --write --force
 */
import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const write = process.argv.includes("--write");
const force = process.argv.includes("--force");
const sessionSecret = randomBytes(48).toString("base64url");

const contents = `# Generated ${new Date().toISOString()} — DO NOT COMMIT
# Session signing + MFA-at-rest encryption only.
# Do NOT put shared ADMIN_PASSWORD_HASH / ADMIN_MFA_SECRET here — those are removed.
ADMIN_SESSION_SECRET=${sessionSecret}
PLATFORM_DATA_MODE=core
# FINDTENX_API_URL=https://api.findtenx.app
# FINDTENX_ADMIN_API_KEY=
# FINDTENX_DATA_API_URL=
# FINDTENX_DATA_API_KEY=
`;

if (write) {
  const target = resolve(process.cwd(), ".env.local");
  if (existsSync(target) && !force) {
    // Preserve non-auth keys; rotate session secret if forced separately.
    console.error(".env.local already exists. Re-run with --force to overwrite, or edit manually.");
    console.error("Provision individual admins with: node scripts/provision-admin.mjs --help");
    process.exit(1);
  }
  writeFileSync(target, contents, { mode: 0o600 });
  console.log("Wrote .env.local (gitignored) with ADMIN_SESSION_SECRET only.");
  console.log("Next: node scripts/provision-admin.mjs --email you@findtenx.com --name \"Your Name\" --role super_admin");
} else {
  process.stdout.write(contents);
  console.error("\n# Re-run with --write to create .env.local");
  console.error("# Then provision individual admins with scripts/provision-admin.mjs");
}

if (existsSync(resolve(process.cwd(), ".env.local")) && !write) {
  void readFileSync;
}
