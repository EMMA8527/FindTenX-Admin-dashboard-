import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { decryptSecret, encryptSecret, generateRecoveryCodes, hashRecoveryCode } from "@/lib/auth/crypto";
import { generateTotpSecret, totpUri, verifyTotpCode } from "@/lib/auth/mfa";
import { createSession, getSession } from "@/lib/auth/session";
import {
  beginAdminMfaEnrollment,
  completeAdminMfaEnrollment,
  findAdminById,
  writeAudit,
} from "@/lib/db/queries";
import type { AdminRole, AdminUser } from "@/lib/types";

/** Start MFA enrollment — returns otpauth URI + secret for authenticator setup. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = findAdminById(session.sub);
  if (!admin || admin.status !== "active") {
    return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
  }
  if (admin.mfaEnabled && admin.mfaSecretEnc && !session.mfaEnrollmentOnly) {
    return NextResponse.json({ error: "MFA is already enrolled." }, { status: 409 });
  }

  const { sessionSecretRaw } = getAuthConfig();
  const secret = generateTotpSecret();
  const pendingEnc = encryptSecret(secret, sessionSecretRaw);
  beginAdminMfaEnrollment(admin.id, pendingEnc);

  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role as AdminRole,
    action: "MFA enrollment started",
    target: admin.id,
    result: "success",
    reason: "Pending authenticator confirmation",
    ip: "127.0.0.1",
  });

  return NextResponse.json({
    secret,
    otpauthUrl: totpUri(secret, admin.email),
    email: admin.email,
  });
}

/** Confirm MFA enrollment with a TOTP code from the new authenticator. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  if (!body.code) {
    return NextResponse.json({ error: "Authentication code is required." }, { status: 400 });
  }

  const admin = findAdminById(session.sub);
  if (!admin?.mfaPendingSecretEnc) {
    return NextResponse.json({ error: "No MFA enrollment in progress." }, { status: 400 });
  }

  const { sessionSecretRaw } = getAuthConfig();
  const pending = decryptSecret(admin.mfaPendingSecretEnc, sessionSecretRaw);
  if (!pending || !verifyTotpCode(pending, body.code)) {
    return NextResponse.json({ error: "Invalid authentication code." }, { status: 400 });
  }

  const recoveryCodes = generateRecoveryCodes(8);
  const recoveryHashes = recoveryCodes.map(hashRecoveryCode);
  const secretEnc = encryptSecret(pending, sessionSecretRaw);
  completeAdminMfaEnrollment(admin.id, secretEnc, recoveryHashes);

  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role as AdminRole,
    action: "MFA enrollment completed",
    target: admin.id,
    result: "success",
    reason: "Authenticator verified; recovery codes issued",
    ip: "127.0.0.1",
  });

  const user: AdminUser = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as AdminRole,
    avatar: admin.avatar,
    mfaEnabled: true,
    status: admin.status as AdminUser["status"],
    lastLoginAt: admin.lastLoginAt ?? "",
    createdAt: admin.createdAt,
  };
  await createSession(user, false);

  return NextResponse.json({
    ok: true,
    recoveryCodes,
    message: "Store these recovery codes securely. Each can be used once.",
  });
}
