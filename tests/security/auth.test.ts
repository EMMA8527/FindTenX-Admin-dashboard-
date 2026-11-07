import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { Secret } from "otpauth";
import { AuthConfigError, getAuthConfig } from "@/lib/auth/config";
import { currentTotpCode, verifyTotpCode } from "@/lib/auth/mfa";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  checkLoginRateLimit,
  clearLoginRateLimits,
} from "@/lib/auth/rate-limit";
import { authenticateAdmin, verifySessionToken } from "@/lib/auth/session";
import { can } from "@/lib/permissions";

const TEST_PASSWORD = "Unit-Test-Only-Password-9f3a!";
const TEST_SESSION_SECRET = "unit-test-session-secret-at-least-32-chars-long";
let TEST_MFA_SECRET = "";
let TEST_PASSWORD_HASH = "";

function setAuthEnv() {
  process.env.ADMIN_SESSION_SECRET = TEST_SESSION_SECRET;
  process.env.ADMIN_PASSWORD_HASH = TEST_PASSWORD_HASH;
  process.env.ADMIN_MFA_SECRET = TEST_MFA_SECRET;
}

function clearAuthEnv() {
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_MFA_SECRET;
}

beforeEach(async () => {
  TEST_MFA_SECRET = new Secret({ size: 20 }).base32;
  TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);
  setAuthEnv();
  clearLoginRateLimits();
});

afterEach(() => {
  clearAuthEnv();
  clearLoginRateLimits();
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

  it("rejects missing password hash", () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    expect(() => getAuthConfig()).toThrow(AuthConfigError);
  });

  it("rejects non-bcrypt password hash", () => {
    process.env.ADMIN_PASSWORD_HASH = "plaintext-not-allowed";
    expect(() => getAuthConfig()).toThrow(/bcrypt hash/);
  });

  it("accepts base64-encoded bcrypt hashes", async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 10);
    process.env.ADMIN_PASSWORD_HASH = `base64:${Buffer.from(hash, "utf8").toString("base64")}`;
    expect(getAuthConfig().passwordHash.startsWith("$2")).toBe(true);
  });

  it("rejects missing MFA secret", () => {
    delete process.env.ADMIN_MFA_SECRET;
    expect(() => getAuthConfig()).toThrow(AuthConfigError);
  });
});

describe("password + MFA", () => {
  it("verifies bcrypt passwords", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    expect(await verifyPassword(TEST_PASSWORD, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("verifies TOTP codes and rejects invalid codes", () => {
    const code = currentTotpCode(TEST_MFA_SECRET);
    expect(verifyTotpCode(TEST_MFA_SECRET, code)).toBe(true);
    expect(verifyTotpCode(TEST_MFA_SECRET, "000000")).toBe(false);
    expect(verifyTotpCode(TEST_MFA_SECRET, "abcdef")).toBe(false);
  });
});

describe("authenticateAdmin", () => {
  it("rejects invalid credentials", async () => {
    const result = await authenticateAdmin("emma@findtenx.com", "wrong", undefined);
    expect(result.ok).toBe(false);
    if (!result.ok && !("requiresMfa" in result)) {
      expect(result.error).toMatch(/Invalid/i);
    }
  });

  it("requires MFA after valid password for MFA-enabled admin", async () => {
    const result = await authenticateAdmin("emma@findtenx.com", TEST_PASSWORD);
    expect(result.ok).toBe(false);
    expect("requiresMfa" in result && result.requiresMfa).toBe(true);
  });

  it("accepts valid password + TOTP", async () => {
    const code = currentTotpCode(TEST_MFA_SECRET);
    const result = await authenticateAdmin("emma@findtenx.com", TEST_PASSWORD, code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.admin.role).toBe("super_admin");
    }
  });

  it("returns 503-style failure when auth is not configured", async () => {
    clearAuthEnv();
    const result = await authenticateAdmin("emma@findtenx.com", TEST_PASSWORD);
    expect(result.ok).toBe(false);
    if (!result.ok && !("requiresMfa" in result)) {
      expect(result.status).toBe(503);
    }
  });
});

describe("session tokens", () => {
  it("rejects tokens signed with the wrong secret", async () => {
    const forged = await new SignJWT({
      email: "attacker@example.com",
      name: "Attacker",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_evil")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode("totally-different-secret-value-xxxxxx"));

    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("accepts tokens signed with the configured secret", async () => {
    const token = await new SignJWT({
      email: "emma@findtenx.com",
      name: "Emma Paul",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_001")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(TEST_SESSION_SECRET));

    const session = await verifySessionToken(token);
    expect(session?.sub).toBe("adm_001");
    expect(session?.role).toBe("super_admin");
  });

  it("rejects revoked session ids after logout-style revocation", async () => {
    const { revokeSession } = await import("@/lib/auth/revocation");
    const jti = "revoked-test-jti";
    const token = await new SignJWT({
      email: "emma@findtenx.com",
      name: "Emma Paul",
      role: "super_admin",
      avatar: "x",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("adm_001")
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
  it("does not embed known demo secrets or session fallbacks in shipped source", () => {
    const roots = ["src", "scripts", "README.md", ".env.example"];
    const forbidden = [
      "FindTenX@Admin2026",
      "482916",
      "findtenx-admin-dev-secret-change-me",
      "DEMO_PASSWORD",
      "DEMO_MFA_CODE",
    ];

    const files: string[] = [];
    function walk(path: string) {
      const st = statSync(path);
      if (st.isDirectory()) {
        for (const name of readdirSync(path)) {
          if (name === "node_modules" || name === ".next") continue;
          walk(join(path, name));
        }
        return;
      }
      if (/\.(ts|tsx|js|mjs|md|example)$/.test(path) || path.endsWith("README.md")) {
        files.push(path);
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
