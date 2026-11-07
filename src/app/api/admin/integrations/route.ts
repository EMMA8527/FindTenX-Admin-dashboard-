import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { getIntegrationStatus } from "@/lib/integrations/platform";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const status = await getIntegrationStatus();
  return NextResponse.json(status);
}
