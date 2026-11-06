import { NextResponse } from "next/server";
import { AuthConfigError } from "@/lib/auth/config";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/rate-limit";
import { authenticateAdmin, createSession } from "@/lib/auth/session";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const key = `login:${clientKey(request)}`;
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: {
    email?: string;
    password?: string;
    mfaCode?: string;
    remember?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await authenticateAdmin(body.email, body.password, body.mfaCode);

    if (!result.ok) {
      if ("requiresMfa" in result && result.requiresMfa) {
        return NextResponse.json({ requiresMfa: true });
      }
      const failure = result as { ok: false; error: string; status?: number };
      return NextResponse.json(
        { error: failure.error },
        { status: failure.status ?? 401 },
      );
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
  } catch (error) {
    if (error instanceof AuthConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
