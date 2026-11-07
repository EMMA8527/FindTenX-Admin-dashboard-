import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { listReports } from "@/lib/db/module-queries";
import { requirePlatformAccess, withAuthority } from "@/lib/integrations/require-platform";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "reports.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }
  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;
  return NextResponse.json(withAuthority(gate.access, { reports: listReports() }));
}
