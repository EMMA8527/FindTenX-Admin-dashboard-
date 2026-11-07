import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { getUserFromDb, updateUserStatusInDb } from "@/lib/db/queries";
import type { AccountStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "users.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }
  const { id } = await context.params;
  const user = getUserFromDb(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "users.manage")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as { status?: AccountStatus; reason?: string };
  if (!body.status || !body.reason || body.reason.trim().length < 5) {
    return NextResponse.json(
      { error: "Status and a detailed reason are required." },
      { status: 400 },
    );
  }
  const user = updateUserStatusInDb(
    id,
    body.status,
    { id: session.sub, name: session.name, role: session.role },
    body.reason.trim(),
  );
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
