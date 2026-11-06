#!/usr/bin/env node
/**
 * Generates local-only admin secrets for development.
 * Never commits the output. Prefer writing to .env.local (gitignored).
 *
 * Usage:
 *   node scripts/generate-admin-secrets.mjs
 *   node scripts/generate-admin-secrets.mjs --write
 *   ADMIN_BOOTSTRAP_PASSWORD='...' node scripts/generate-admin-secrets.mjs --write --force
 */
import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { Secret } from "otpauth";

const write = process.argv.includes("--write");
const password =
  process.env.ADMIN_BOOTSTRAP_PASSWORD ||
  `FTX-${randomBytes(18).toString("base64url")}`;

const sessionSecret = randomBytes(48).toString("base64url");
const passwordHash = await bcrypt.hash(password, 12);
const passwordHashEnv = `base64:${Buffer.from(passwordHash, "utf8").toString("base64")}`;
const mfaSecret = new Secret({ size: 20 }).base32;

function envLine(key, value) {
  return `${key}=${value}`;
}

const contents = `# Generated ${new Date().toISOString()} — DO NOT COMMIT
# ADMIN_PASSWORD_HASH uses base64: encoding so dotenv cannot corrupt bcrypt '$' characters.
${envLine("ADMIN_SESSION_SECRET", sessionSecret)}
${envLine("ADMIN_PASSWORD_HASH", passwordHashEnv)}
${envLine("ADMIN_MFA_SECRET", mfaSecret)}
`;

if (write) {
  const target = resolve(process.cwd(), ".env.local");
  if (existsSync(target) && !process.argv.includes("--force")) {
    console.error(".env.local already exists. Re-run with --force to overwrite.");
    process.exit(1);
  }
  writeFileSync(target, contents, { mode: 0o600 });
  console.log("Wrote .env.local (gitignored).");
  console.log("Bootstrap password (store in your password manager, shown once):");
  console.log(password);
  console.log("MFA: add ADMIN_MFA_SECRET to an authenticator as a TOTP key (base32).");
} else {
  process.stdout.write(contents);
  console.error("\n# Bootstrap password (not written to env file):");
  console.error(`# ${password}`);
  console.error("# Re-run with --write to create .env.local");
}
