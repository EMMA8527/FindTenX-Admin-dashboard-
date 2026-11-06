import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { appendAudit } from "@/lib/data/store";

export async function POST() {
  const session = await getSession();
  if (session) {
    appendAudit({
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
