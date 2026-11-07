import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthConfigError, getAuthConfig } from "@/lib/auth/config";
import { DUMMY_PASSWORD_HASH, decryptSecret, hashRecoveryCode } from "@/lib/auth/crypto";
import { verifyTotpCode } from "@/lib/auth/mfa";
import { verifyPassword } from "@/lib/auth/password";
import { isSessionRevoked, revokeSession } from "@/lib/auth/revocation";
import {
  consumeAdminRecoveryCode,
  findAdminByEmail,
  touchAdminLogin,
  writeAudit,
} from "@/lib/db/queries";
import { assertDbReady } from "@/lib/db/bootstrap";
import type { AdminRole, AdminUser } from "@/lib/types";

export const SESSION_COOKIE = "ftx_admin_session";
export const MFA_ENROLL_COOKIE = "ftx_mfa_enroll";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar: string;
  jti: string;
  /** When true, session may only complete MFA enrollment — not access the dashboard. */
  mfaEnrollmentOnly?: boolean;
};

export type AuthResult =
  | { ok: true; admin: AdminUser }
  | { ok: false; requiresMfa: true }
  | { ok: false; requiresMfaEnrollment: true; admin: AdminUser }
  | { ok: false; error: string; status?: number };

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function payloadFromJwt(payload: Record<string, unknown>): SessionPayload {
  const jti = typeof payload.jti === "string" ? payload.jti : "";
  if (!jti) {
    throw new Error("missing jti");
  }
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role as AdminRole,
    avatar: String(payload.avatar),
    jti,
    mfaEnrollmentOnly: Boolean(payload.mfaEnrollmentOnly),
  };
}

function toAdminUser(row: NonNullable<ReturnType<typeof findAdminByEmail>>): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AdminRole,
    avatar: row.avatar,
    mfaEnabled: Boolean(row.mfaEnabled),
    status: row.status as AdminUser["status"],
    lastLoginAt: row.lastLoginAt ?? "",
    createdAt: row.createdAt,
  };
}

export async function createSession(
  admin: AdminUser,
  remember = false,
  options: { mfaEnrollmentOnly?: boolean } = {},
) {
  const { sessionSecret } = getAuthConfig();
  const enrollmentOnly = Boolean(options.mfaEnrollmentOnly);
  const maxAge = enrollmentOnly ? 60 * 30 : remember ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const jti = randomUUID();
  const token = await new SignJWT({
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatar: admin.avatar,
    mfaEnrollmentOnly: enrollmentOnly,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(sessionSecret);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(maxAge));
  if (enrollmentOnly) {
    jar.set(MFA_ENROLL_COOKIE, "1", cookieOptions(maxAge));
  } else {
    jar.set(MFA_ENROLL_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  }
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { sessionSecret } = getAuthConfig();
      const { payload } = await jwtVerify(token, sessionSecret);
      const jti = typeof payload.jti === "string" ? payload.jti : "";
      const expMs =
        typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + SESSION_TTL_SECONDS * 1000;
      revokeSession(jti, expMs);
    } catch {
      // Cookie may already be invalid; still clear it.
    }
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  jar.set(MFA_ENROLL_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { sessionSecret } = getAuthConfig();
    const { payload } = await jwtVerify(token, sessionSecret);
    if (isSessionRevoked(typeof payload.jti === "string" ? payload.jti : null)) {
      return null;
    }
    return payloadFromJwt(payload as Record<string, unknown>);
  } catch (error) {
    if (error instanceof AuthConfigError) return null;
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/**
 * Authenticate one administrator with their own password (+ MFA when enrolled).
 * Never uses a shared global password or MFA secret.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
  mfaCode?: string,
): Promise<AuthResult> {
  let config;
  try {
    config = getAuthConfig();
  } catch (error) {
    const message =
      error instanceof AuthConfigError
        ? error.message
        : "Authentication is not configured.";
    return { ok: false, error: message, status: 503 };
  }

  assertDbReady();
  const row = findAdminByEmail(email);

  // Always run a password compare to reduce email-enumeration timing gaps.
  const hashToCheck = row?.passwordHash || DUMMY_PASSWORD_HASH;
  const passwordOk = await verifyPassword(password, hashToCheck);

  if (!row || !row.passwordHash || !passwordOk) {
    writeAudit({
      adminId: "unknown",
      adminName: email || "Unknown",
      adminRole: "support",
      action: "Failed login",
      target: "Login",
      result: "failure",
      reason: "Invalid credentials",
      ip: "127.0.0.1",
    });
    return { ok: false, error: "Invalid email or password." };
  }

  if (row.status !== "active") {
    writeAudit({
      adminId: row.id,
      adminName: row.name,
      adminRole: row.role as AdminRole,
      action: "Failed login",
      target: "Login",
      result: "denied",
      reason: "Account inactive",
      ip: "127.0.0.1",
    });
    return { ok: false, error: "This administrator account is inactive." };
  }

  const admin = toAdminUser(row);

  if (!row.mfaEnabled || !row.mfaSecretEnc) {
    // Password ok but MFA not enrolled — allow a limited session only after caller enrolls MFA.
    return { ok: false, requiresMfaEnrollment: true, admin };
  }

  if (!mfaCode) {
    return { ok: false, requiresMfa: true };
  }

  const secret = decryptSecret(row.mfaSecretEnc, config.sessionSecretRaw);
  if (!secret) {
    return { ok: false, error: "MFA configuration is invalid. Contact a super administrator.", status: 503 };
  }

  const totpOk = verifyTotpCode(secret, mfaCode);
  let recoveryOk = false;
  if (!totpOk) {
    const hashes: string[] = JSON.parse(row.mfaRecoveryHashesJson || "[]");
    const submitted = hashRecoveryCode(mfaCode);
    const idx = hashes.indexOf(submitted);
    if (idx >= 0) {
      recoveryOk = true;
      const remaining = [...hashes.slice(0, idx), ...hashes.slice(idx + 1)];
      consumeAdminRecoveryCode(row.id, remaining);
      writeAudit({
        adminId: admin.id,
        adminName: admin.name,
        adminRole: admin.role,
        action: "MFA recovery code used",
        target: "Login",
        result: "success",
        reason: "Single-use recovery code consumed",
        ip: "127.0.0.1",
      });
    }
  }

  if (!totpOk && !recoveryOk) {
    writeAudit({
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      action: "Failed MFA",
      target: "Login",
      result: "failure",
      reason: "Invalid MFA or recovery code",
      ip: "127.0.0.1",
    });
    return { ok: false, error: "Invalid authentication code." };
  }

  touchAdminLogin(admin.id);
  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: "Administrator login",
    target: "Session",
    result: "success",
    reason: recoveryOk ? "Recovery code" : "Successful MFA",
    ip: "127.0.0.1",
  });

  return { ok: true, admin };
}

/** Verify a raw JWT with the configured secret (used by security tests). */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { sessionSecret } = getAuthConfig();
    const { payload } = await jwtVerify(token, sessionSecret);
    if (isSessionRevoked(typeof payload.jti === "string" ? payload.jti : null)) {
      return null;
    }
    return payloadFromJwt(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}
