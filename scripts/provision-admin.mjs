#!/usr/bin/env node
/**
 * Provision ONE administrator with their own password + MFA secret.
 * Never creates shared credentials. Does not auto-grant roles beyond --role.
 *
 * Usage:
 *   node scripts/provision-admin.mjs \
 *     --email emma@findtenx.com \
 *     --name "Emma Paul" \
 *     --role super_admin
 *
 * Prints password + MFA secret once. Store in a password manager.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { Secret } from "otpauth";
import Database from "better-sqlite3";
import { createCipheriv, scryptSync } from "node:crypto";

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function encryptSecret(plaintext, keyMaterial) {
  const key = scryptSync(keyMaterial, "findtenx-admin-mfa-v1", 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

loadEnvLocal();

const email = arg("email").trim().toLowerCase();
const name = arg("name").trim();
const role = arg("role", "operations").trim();
const id = arg("id", `adm_${randomBytes(6).toString("hex")}`);

if (!email || !name) {
  console.error("Required: --email and --name");
  console.error("Optional: --role (default operations), --id");
  process.exit(1);
}

const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
if (!sessionSecret || sessionSecret.length < 32) {
  console.error("ADMIN_SESSION_SECRET must be set in the environment or .env.local (min 32 chars).");
  process.exit(1);
}

const dbPath =
  process.env.FTX_SQLITE_PATH ||
  resolve(process.cwd(), "data", "admin.sqlite");

const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || `FTX-${randomBytes(18).toString("base64url")}`;
const passwordHash = await bcrypt.hash(password, 12);
const mfaSecret = new Secret({ size: 20 }).base32;
const mfaSecretEnc = encryptSecret(mfaSecret, sessionSecret);
const now = new Date().toISOString();

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '',
    password_hash TEXT,
    mfa_secret_enc TEXT,
    mfa_recovery_hashes_json TEXT NOT NULL DEFAULT '[]',
    mfa_pending_secret_enc TEXT,
    mfa_enabled INTEGER NOT NULL DEFAULT 0,
    mfa_enrolled_at TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    activated_at TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const existing = db.prepare("SELECT id FROM admins WHERE lower(email) = ?").get(email);
if (existing) {
  db.prepare(
    `UPDATE admins SET
      name = ?,
      role = ?,
      password_hash = ?,
      mfa_secret_enc = ?,
      mfa_recovery_hashes_json = '[]',
      mfa_pending_secret_enc = NULL,
      mfa_enabled = 1,
      mfa_enrolled_at = ?,
      status = 'active',
      activated_at = ?
     WHERE id = ?`,
  ).run(name, role, passwordHash, mfaSecretEnc, now, now, existing.id);
  console.log(`Updated existing administrator ${email} (${existing.id}) with individual credentials.`);
} else {
  db.prepare(
    `INSERT INTO admins (
      id, email, name, role, avatar, password_hash, mfa_secret_enc,
      mfa_recovery_hashes_json, mfa_enabled, mfa_enrolled_at, status, activated_at, created_at
    ) VALUES (?, ?, ?, ?, '', ?, ?, '[]', 1, ?, 'active', ?, ?)`,
  ).run(id, email, name, role, passwordHash, mfaSecretEnc, now, now, now);
  console.log(`Created administrator ${email} (${id}) with role ${role}.`);
}

console.log("");
console.log("Store these credentials privately (shown once):");
console.log(`Email:    ${email}`);
console.log(`Password: ${password}`);
console.log(`MFA:      ${mfaSecret}`);
console.log("");
console.log("Add the MFA secret to an authenticator app (TOTP, 6 digits, 30s).");
console.log("Do not commit these values. Do not reuse them across administrators.");
