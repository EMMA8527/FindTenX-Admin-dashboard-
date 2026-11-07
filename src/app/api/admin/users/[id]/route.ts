import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUserFromDb, updateUserStatusInDb } from "@/lib/db/queries";
import { requirePlatformAccess, withAuthority } from "@/lib/integrations/require-platform";
import type { AccountStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("users.view");
  if ("error" in auth) return auth.error;
  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;

  const { id } = await context.params;
  const user = getUserFromDb(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(withAuthority(gate.access, { user }));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("users.manage");
  if ("error" in auth) return auth.error;
  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;

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
    { id: auth.session.sub, name: auth.session.name, role: auth.session.role },
    body.reason.trim(),
  );
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(withAuthority(gate.access, { user }));
}
