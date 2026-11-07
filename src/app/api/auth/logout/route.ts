import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/db/queries";
import { assertDbReady } from "@/lib/db/bootstrap";

export async function POST() {
  assertDbReady();
  const session = await getSession();
  if (session) {
    writeAudit({
      adminId: session.sub,
      adminName: session.name,
      adminRole: session.role,
      action: "Administrator logout",
      target: "Session",
      result: "success",
      reason: "Signed out",
      ip: "127.0.0.1",
    });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
