import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthConfigError, getAuthConfig } from "@/lib/auth/config";
import { verifyTotpCode } from "@/lib/auth/mfa";
import { verifyPassword } from "@/lib/auth/password";
import { isSessionRevoked, revokeSession } from "@/lib/auth/revocation";
import { appendAudit, getStore } from "@/lib/data/store";
import type { AdminRole, AdminUser } from "@/lib/types";

export const SESSION_COOKIE = "ftx_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar: string;
  jti: string;
};

export type AuthResult =
  | { ok: true; admin: AdminUser }
  | { ok: false; requiresMfa: true }
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
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role as AdminRole,
    avatar: String(payload.avatar),
    jti: String(payload.jti ?? ""),
  };
}

export async function createSession(admin: AdminUser, remember = false) {
  const { sessionSecret } = getAuthConfig();
  const maxAge = remember ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const jti = randomUUID();
  const token = await new SignJWT({
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatar: admin.avatar,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(sessionSecret);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(maxAge));
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

  const store = getStore();
  const admin = store.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.status === "active",
  );

  // Always verify against the configured hash to reduce email-enumeration timing gaps.
  const passwordOk = await verifyPassword(password, config.passwordHash);

  if (!admin || !passwordOk) {
    appendAudit({
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

  if (admin.mfaEnabled) {
    if (!mfaCode) {
      return { ok: false, requiresMfa: true };
    }
    if (!verifyTotpCode(config.mfaSecret, mfaCode)) {
      appendAudit({
        adminId: admin.id,
        adminName: admin.name,
        adminRole: admin.role,
        action: "Failed MFA",
        target: "Login",
        result: "failure",
        reason: "Invalid MFA code",
        ip: "127.0.0.1",
      });
      return { ok: false, error: "Invalid authentication code." };
    }
  }

  admin.lastLoginAt = new Date().toISOString();
  appendAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: "Administrator login",
    target: "Session",
    result: "success",
    reason: admin.mfaEnabled ? "Successful MFA" : "Password authenticated",
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
