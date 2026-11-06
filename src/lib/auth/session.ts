import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { admins, DEMO_MFA_CODE, DEMO_PASSWORD } from "@/lib/data/seed";
import { appendAudit, getStore } from "@/lib/data/store";
import type { AdminRole, AdminUser } from "@/lib/types";

const COOKIE = "ftx_admin_session";
const secret = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? "findtenx-admin-dev-secret-change-me",
);

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar: string;
};

export async function createSession(admin: AdminUser) {
  const token = await new SignJWT({
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatar: admin.avatar,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as AdminRole,
      avatar: String(payload.avatar),
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function authenticateAdmin(email: string, password: string, mfaCode?: string) {
  const store = getStore();
  const admin = store.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.status === "active",
  );

  if (!admin || password !== DEMO_PASSWORD) {
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
    return { ok: false as const, error: "Invalid email or password." };
  }

  if (admin.mfaEnabled) {
    if (!mfaCode) {
      return { ok: false as const, requiresMfa: true as const };
    }
    if (mfaCode !== DEMO_MFA_CODE) {
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
      return { ok: false as const, error: "Invalid authentication code." };
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

  return { ok: true as const, admin };
}

export { COOKIE, DEMO_MFA_CODE, DEMO_PASSWORD, admins };
