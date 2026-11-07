import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin, auditAdminAction } from "@/lib/auth/require-admin";
import { createAdminAccount, findAdminByEmail, setAdminStatus } from "@/lib/db/queries";
import type { AdminRole } from "@/lib/types";

const ALLOWED_ROLES: AdminRole[] = [
  "super_admin",
  "operations",
  "verification",
  "moderator",
  "support",
  "finance",
  "marketing",
];

/**
 * Invite / create an administrator directory row (no password, inactive until activated).
 * Does not grant credentials and never assigns a shared password.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin("staff.manage");
  if ("error" in auth) return auth.error;
  if (auth.session.mfaEnrollmentOnly) {
    return NextResponse.json({ error: "Complete MFA enrollment first." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    role?: AdminRole;
  };

  if (!body.email || !body.name || !body.role) {
    return NextResponse.json({ error: "email, name, and role are required." }, { status: 400 });
  }
  if (!ALLOWED_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  // Prevent silent privilege escalation: only super_admin may create another super_admin.
  if (body.role === "super_admin" && auth.session.role !== "super_admin") {
    auditAdminAction(auth.session, "Denied create super_admin", body.email, "denied", "Privilege escalation");
    return NextResponse.json({ error: "Only a super administrator may create that role." }, { status: 403 });
  }
  if (findAdminByEmail(body.email)) {
    return NextResponse.json({ error: "An administrator with that email already exists." }, { status: 409 });
  }

  const id = `adm_${randomBytes(6).toString("hex")}`;
  const created = createAdminAccount({
    id,
    email: body.email,
    name: body.name,
    role: body.role,
    status: "inactive",
  });

  auditAdminAction(auth.session, "Administrator invited", id, "success", `role=${body.role}`);

  return NextResponse.json({
    ok: true,
    admin: created
      ? {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
          status: created.status,
        }
      : null,
    nextStep:
      "Send a password-reset link so this administrator sets their own password and enrolls MFA. No shared credentials were created.",
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin("staff.manage");
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    status?: "active" | "inactive";
  };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }
  if (body.id === auth.session.sub && body.status === "inactive") {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  setAdminStatus(body.id, body.status);
  auditAdminAction(auth.session, `Administrator set ${body.status}`, body.id, "success");
  return NextResponse.json({ ok: true });
}
