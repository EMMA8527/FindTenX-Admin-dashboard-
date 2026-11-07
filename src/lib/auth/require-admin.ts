import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/permissions";
import { writeAudit } from "@/lib/db/queries";

export async function requireAdmin(
  permission: Permission,
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!can(session.role, permission)) {
    writeAudit({
      adminId: session.sub,
      adminName: session.name,
      adminRole: session.role,
      action: `Denied ${permission}`,
      target: permission,
      result: "denied",
      reason: "Missing permission",
      ip: "0.0.0.0",
    });
    return { error: NextResponse.json({ error: "Permission denied" }, { status: 403 }) };
  }
  return { session };
}

export function auditAdminAction(
  session: SessionPayload,
  action: string,
  target: string,
  result: "success" | "failure" | "denied",
  reason = "",
) {
  writeAudit({
    adminId: session.sub,
    adminName: session.name,
    adminRole: session.role,
    action,
    target,
    result,
    reason,
    ip: "0.0.0.0",
  });
}
