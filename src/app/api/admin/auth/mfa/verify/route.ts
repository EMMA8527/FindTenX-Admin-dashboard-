import { NextResponse } from "next/server";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/rate-limit";
import { authenticateAdmin, createSession } from "@/lib/auth/session";

/** Explicit MFA verification step (same credential gate as login with code). */
export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const key = `login:${forwarded?.split(",")[0]?.trim() || "unknown"}`;
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    mfaCode?: string;
    remember?: boolean;
  };

  if (!body.email || !body.password || !body.mfaCode) {
    return NextResponse.json(
      { error: "Email, password, and MFA code are required." },
      { status: 400 },
    );
  }

  const result = await authenticateAdmin(body.email, body.password, body.mfaCode);
  if (!result.ok) {
    if ("requiresMfa" in result && result.requiresMfa) {
      return NextResponse.json({ error: "MFA code required." }, { status: 401 });
    }
    const failure = result as { ok: false; error: string; status?: number };
    return NextResponse.json({ error: failure.error }, { status: failure.status ?? 401 });
  }

  await createSession(result.admin, Boolean(body.remember));
  resetLoginRateLimit(key);
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
