import { NextResponse } from "next/server";
import { authenticateAdmin, createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    mfaCode?: string;
    remember?: boolean;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = authenticateAdmin(body.email, body.password, body.mfaCode);

  if (!result.ok) {
    if ("requiresMfa" in result && result.requiresMfa) {
      return NextResponse.json({ requiresMfa: true });
    }
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await createSession(result.admin);
  return NextResponse.json({
    ok: true,
    admin: {
      id: result.admin.id,
      name: result.admin.name,
      email: result.admin.email,
      role: result.admin.role,
      avatar: result.admin.avatar,
    },
  });
}
