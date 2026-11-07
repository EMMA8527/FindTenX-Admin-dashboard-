import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { assertDbReady } from "@/lib/db/bootstrap";
import { reports } from "@/lib/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "reports.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }
  const db = assertDbReady();
  const rows = db.select().from(reports).orderBy(desc(reports.submittedAt)).limit(200).all();
  return NextResponse.json({ reports: rows });
}
