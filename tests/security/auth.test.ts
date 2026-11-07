import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { Secret } from "otpauth";
import { AuthConfigError, getAuthConfig } from "@/lib/auth/config";
import { encryptSecret } from "@/lib/auth/crypto";
import { currentTotpCode, verifyTotpCode } from "@/lib/auth/mfa";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  checkLoginRateLimit,
  clearLoginRateLimits,
} from "@/lib/auth/rate-limit";
import { can } from "@/lib/permissions";

const TEST_PASSWORD = "Unit-Test-Only-Password-9f3a!";
const TEST_SESSION_SECRET = "unit-test-session-secret-at-least-32-chars-long";
const OTHER_PASSWORD = "Other-Admin-Password-7k2q!";
let TEST_MFA_SECRET = "";
let OTHER_MFA_SECRET = "";
let dbPath = "";

function setAuthEnv() {
  process.env.ADMIN_SESSION_SECRET = TEST_SESSION_SECRET;
  // Shared globals must not be required anymore.
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_MFA_SECRET;
}

function clearAuthEnv() {
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_MFA_SECRET;
}

async function seedTwoAdmins() {
  process.env.PLATFORM_DATA_MODE = "core";
  const { ensureAdminDatabase } = await import("@/lib/db/bootstrap");
  ensureAdminDatabase();
  const { createAdminAccount, setAdminPasswordHash, completeAdminMfaEnrollment, setAdminStatus } =
    await import("@/lib/db/queries");
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const otherHash = await bcrypt.hash(OTHER_PASSWORD, 10);
  createAdminAccount({
    id: "adm_test_super",
    email: "super@findtenx.com",
    name: "Super Admin",
    role: "super_admin",
    status: "active",
  });
  createAdminAccount({
    id: "adm_test_support",
    email: "support@findtenx.com",
    name: "Support Admin",
    role: "support",
    status: "active",
  });
  setAdminPasswordHash("adm_test_super", passwordHash);
  setAdminPasswordHash("adm_test_support", otherHash);
  setAdminStatus("adm_test_super", "active");
  setAdminStatus("adm_test_support", "active");
  completeAdminMfaEnrollment(
    "adm_test_super",
    encryptSecret(TEST_MFA_SECRET, TEST_SESSION_SECRET),
    [],
  );
  completeAdminMfaEnrollment(
    "adm_test_support",
    encryptSecret(OTHER_MFA_SECRET, TEST_SESSION_SECRET),
    [],
  );
}

beforeEach(async () => {
  TEST_MFA_SECRET = new Secret({ size: 20 }).base32;
  OTHER_MFA_SECRET = new Secret({ size: 20 }).base32;
  dbPath = path.join(os.tmpdir(), `ftx-auth-${Date.now()}-${Math.random()}.sqlite`);
  process.env.FTX_SQLITE_PATH = dbPath;
  const g = globalThis as unknown as { __ftxSqlite?: unknown; __ftxDrizzle?: unknown };
  delete g.__ftxSqlite;
  delete g.__ftxDrizzle;
  vi.resetModules();
  setAuthEnv();
  clearLoginRateLimits();
  await seedTwoAdmins();
});

afterEach(() => {
  clearAuthEnv();
  clearLoginRateLimits();
  delete process.env.FTX_SQLITE_PATH;
  try {
    const g = globalThis as unknown as { __ftxSqlite?: { close?: () => void } };
    g.__ftxSqlite?.close?.();
  } catch {
    /* ignore */
  }
});

describe("auth config fail-closed", () => {
  it("rejects missing session secret", () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(() => getAuthConfig()).toThrow(AuthConfigError);
  });

  it("rejects short session secret", () => {
    process.env.ADMIN_SESSION_SECRET = "too-short";
    expect(() => getAuthConfig()).toThrow(/at least 32/);
  });

  it("does not require shared ADMIN_PASSWORD_HASH or ADMIN_MFA_SECRET", () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_MFA_SECRET;
    expect(() => getAuthConfig()).not.toThrow();
  });
});

describe("password + MFA primitives", () => {
  it("verifies bcrypt passwords", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    expect(await verifyPassword(TEST_PASSWORD, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("verifies TOTP codes and rejects invalid codes", () => {
    const code = currentTotpCode(TEST_MFA_SECRET);
    expect(verifyTotpCode(TEST_MFA_SECRET, code)).toBe(true);
    expect(verifyTotpCode(TEST_MFA_SECRET, "000000")).toBe(false);
  });
});

describe("individual authenticateAdmin", () => {
  it("rejects invalid credentials", async () => {
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const result = await auth("super@findtenx.com", "wrong", undefined);
    expect(result.ok).toBe(false);
  });

  it("does not accept one admin password for another admin email", async () => {
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const code = currentTotpCode(OTHER_MFA_SECRET);
    // Support password + support MFA against super email must fail
    const result = await auth("super@findtenx.com", OTHER_PASSWORD, code);
    expect(result.ok).toBe(false);
  });

  it("does not accept one admin MFA secret for another admin", async () => {
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const wrongMfa = currentTotpCode(OTHER_MFA_SECRET);
    const result = await auth("super@findtenx.com", TEST_PASSWORD, wrongMfa);
    expect(result.ok).toBe(false);
  });

  it("requires MFA after valid password for enrolled admin", async () => {
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const result = await auth("super@findtenx.com", TEST_PASSWORD);
    expect(result.ok).toBe(false);
    expect("requiresMfa" in result && result.requiresMfa).toBe(true);
  });

  it("accepts only that admin's password + TOTP", async () => {
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const code = currentTotpCode(TEST_MFA_SECRET);
    const result = await auth("super@findtenx.com", TEST_PASSWORD, code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.admin.role).toBe("super_admin");
      expect(result.admin.email).toBe("super@findtenx.com");
    }
  });

  it("rejects inactive administrators", async () => {
    const { setAdminStatus } = await import("@/lib/db/queries");
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    setAdminStatus("adm_test_support", "inactive");
    const code = currentTotpCode(OTHER_MFA_SECRET);
    const result = await auth("support@findtenx.com", OTHER_PASSWORD, code);
    expect(result.ok).toBe(false);
  });

  it("returns 503 when session secret is missing", async () => {
    clearAuthEnv();
    const { authenticateAdmin: auth } = await import("@/lib/auth/session");
    const result = await auth("super@findtenx.com", TEST_PASSWORD);
    expect(result.ok).toBe(false);
    if (!result.ok && !("requiresMfa" in result) && !("requiresMfaEnrollment" in result)) {
      expect(result.status).toBe(503);
    }
  });
});

describe("session tokens", () => {
  it("rejects tokens signed with the wrong secret", async () => {
    const { verifySessionToken } = await import("@/lib/auth/session");
    const forged = await new SignJWT({
      email: "attacker@example.com",
      name: "Attacker",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_evil")
      .setJti("jti-forged")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode("totally-different-secret-value-xxxxxx"));

    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("accepts tokens signed with the configured secret", async () => {
    const { verifySessionToken } = await import("@/lib/auth/session");
    const token = await new SignJWT({
      email: "super@findtenx.com",
      name: "Super Admin",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_test_super")
      .setJti("active-test-jti")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(TEST_SESSION_SECRET));

    const session = await verifySessionToken(token);
    expect(session?.sub).toBe("adm_test_super");
    expect(session?.role).toBe("super_admin");
  });

  it("rejects tokens that omit a session id", async () => {
    const { verifySessionToken } = await import("@/lib/auth/session");
    const token = await new SignJWT({
      email: "super@findtenx.com",
      name: "Super Admin",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_test_super")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(TEST_SESSION_SECRET));

    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects revoked session ids after logout-style revocation", async () => {
    const { revokeSession } = await import("@/lib/auth/revocation");
    const { verifySessionToken } = await import("@/lib/auth/session");
    const jti = "revoked-test-jti";
    const token = await new SignJWT({
      email: "super@findtenx.com",
      name: "Super Admin",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_test_super")
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(TEST_SESSION_SECRET));

    expect(await verifySessionToken(token)).not.toBeNull();
    revokeSession(jti, Date.now() + 60_000);
    expect(await verifySessionToken(token)).toBeNull();
  });
});

describe("rate limiting", () => {
  it("blocks excessive login attempts", () => {
    const key = "login:test-ip";
    for (let i = 0; i < 5; i += 1) {
      expect(checkLoginRateLimit(key).allowed).toBe(true);
    }
    expect(checkLoginRateLimit(key).allowed).toBe(false);
  });
});

describe("RBAC", () => {
  it("keeps support agents out of finance and staff management", () => {
    expect(can("support", "payments.manage")).toBe(false);
    expect(can("support", "staff.manage")).toBe(false);
    expect(can("support", "support.manage")).toBe(true);
  });

  it("keeps marketing out of verification and user management mutations", () => {
    expect(can("marketing", "verification.manage")).toBe(false);
    expect(can("marketing", "users.manage")).toBe(false);
    expect(can("marketing", "promotions.manage")).toBe(true);
  });

  it("grants super admin full access", () => {
    expect(can("super_admin", "staff.manage")).toBe(true);
    expect(can("super_admin", "security.view")).toBe(true);
    expect(can("super_admin", "payments.manage")).toBe(true);
  });
});

describe("source hygiene", () => {
  it("does not embed known demo secrets or shared credential fallbacks", () => {
    const roots = ["src", "scripts", "README.md", ".env.example"];
    const forbidden = [
      "FindTenX@Admin2026",
      "482916",
      "findtenx-admin-dev-secret-change-me",
      "DEMO_PASSWORD",
      "DEMO_MFA_CODE",
    ];

    const files: string[] = [];
    function walk(p: string) {
      const st = statSync(p);
      if (st.isDirectory()) {
        for (const name of readdirSync(p)) {
          if (name === "node_modules" || name === ".next") continue;
          walk(join(p, name));
        }
        return;
      }
      if (/\.(ts|tsx|js|mjs|md|example)$/.test(p) || p.endsWith("README.md")) {
        files.push(p);
      }
    }
    for (const root of roots) walk(join(process.cwd(), root));

    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of forbidden) {
        if (text.includes(needle)) offenders.push(`${file}: ${needle}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
