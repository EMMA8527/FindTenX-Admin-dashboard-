import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { listUsersFromDb } from "@/lib/db/queries";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "users.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const url = new URL(request.url);
  const result = listUsersFromDb({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    verification: url.searchParams.get("verification") ?? undefined,
    membership: url.searchParams.get("membership") ?? undefined,
    limit: Number(url.searchParams.get("limit") ?? 50),
    offset: Number(url.searchParams.get("offset") ?? 0),
  });
  return NextResponse.json(result);
}
