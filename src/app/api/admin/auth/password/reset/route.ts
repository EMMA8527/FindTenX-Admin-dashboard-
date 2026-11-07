import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkLoginRateLimit } from "@/lib/auth/rate-limit";
import { hashPassword } from "@/lib/auth/password";
import { assertDbReady } from "@/lib/db/bootstrap";
import { passwordResetTokens } from "@/lib/db/schema";
import { clearAdminMfa, findAdminByEmail, findAdminById, setAdminPasswordHash, writeAudit } from "@/lib/db/queries";
import type { AdminRole } from "@/lib/types";

/**
 * Issues a password-reset token for an individual administrator.
 * Completing the reset sets that admin's own password hash (never a shared global secret).
 */
export async function POST(request: Request) {
  const key = `reset:${request.headers.get("x-forwarded-for") || "unknown"}`;
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many reset attempts." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  if (!body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const generic = {
    ok: true,
    message:
      "If an administrator account exists for that email, a reset token has been created. Configure an email provider to deliver it.",
  };

  const admin = findAdminByEmail(body.email);
  if (!admin || admin.status !== "active") return NextResponse.json(generic);

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const db = assertDbReady();
  db.insert(passwordResetTokens)
    .values({
      id: `prt_${Date.now()}_${randomBytes(4).toString("hex")}`,
      adminId: admin.id,
      tokenHash,
      expiresAt,
    })
    .run();

  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role as AdminRole,
    action: "Password reset token issued",
    target: admin.id,
    result: "success",
    reason: "Administrator requested password reset",
    ip: "127.0.0.1",
  });

  if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_RESET_TOKEN === "1") {
    return NextResponse.json({ ...generic, devToken: rawToken, expiresAt });
  }

  return NextResponse.json(generic);
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };
  if (!body.token || !body.password) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }
  if (body.password.length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  const db = assertDbReady();
  const row = db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .get();
  if (!row || row.usedAt || new Date(row.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
  }

  const admin = findAdminById(row.adminId);
  if (!admin) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
  }

  const passwordHash = await hashPassword(body.password);
  setAdminPasswordHash(admin.id, passwordHash);
  // Force MFA re-enrollment after password recovery for account safety.
  clearAdminMfa(admin.id);

  db.update(passwordResetTokens)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(passwordResetTokens.id, row.id))
    .run();

  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role as AdminRole,
    action: "Password reset completed",
    target: admin.id,
    result: "success",
    reason: "Per-admin password rotated; MFA cleared for re-enrollment",
    ip: "127.0.0.1",
  });

  return NextResponse.json({
    ok: true,
    message: "Password updated for this administrator. Sign in and enroll MFA again.",
  });
}
