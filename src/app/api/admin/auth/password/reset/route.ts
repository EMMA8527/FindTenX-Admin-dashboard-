import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { assertDbReady } from "@/lib/db/bootstrap";
import { passwordResetTokens } from "@/lib/db/schema";
import { findAdminByEmail, writeAudit } from "@/lib/db/queries";
import { checkLoginRateLimit } from "@/lib/auth/rate-limit";

/**
 * Issues a password-reset token hash for an administrator.
 * The raw token is never logged. Delivery to email requires an email provider secret.
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

  // Always return a generic response to avoid account enumeration.
  const generic = {
    ok: true,
    message:
      "If an administrator account exists for that email, a reset token has been created. Configure an email provider to deliver it.",
  };

  const admin = findAdminByEmail(body.email);
  if (!admin) return NextResponse.json(generic);

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const db = assertDbReady();
  db.insert(passwordResetTokens)
    .values({
      id: `prt_${Date.now()}`,
      adminId: admin.id,
      tokenHash,
      expiresAt,
    })
    .run();

  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: "Password reset token issued",
    target: admin.id,
    result: "success",
    reason: "Administrator requested password reset",
    ip: "127.0.0.1",
  });

  // Development-only: return token when explicitly enabled. Never in production.
  if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_RESET_TOKEN === "1") {
    return NextResponse.json({ ...generic, devToken: rawToken, expiresAt });
  }

  return NextResponse.json(generic);
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    passwordHash?: string;
  };
  // Completing reset requires rotating ADMIN_PASSWORD_HASH via secrets manager in this architecture.
  // Accept token validation only; password rotation is an ops secret change.
  if (!body.token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
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
  db.update(passwordResetTokens)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(passwordResetTokens.id, row.id))
    .run();
  return NextResponse.json({
    ok: true,
    message:
      "Reset token validated. Rotate ADMIN_PASSWORD_HASH in your secrets manager, then sign in with the new password.",
  });
}
