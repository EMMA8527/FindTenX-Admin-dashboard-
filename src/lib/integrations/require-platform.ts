import { NextResponse } from "next/server";
import { resolvePlatformAccess, type PlatformAccess } from "@/lib/integrations/platform";

export async function requirePlatformAccess(): Promise<
  { access: Extract<PlatformAccess, { ok: true }>; error?: undefined } | { access?: undefined; error: NextResponse }
> {
  const access = await resolvePlatformAccess();
  if (!access.ok) {
    return {
      error: NextResponse.json(
        {
          error: access.message,
          code: access.code,
          authority: access.authority,
          production: false,
          mode: access.mode,
        },
        { status: access.status },
      ),
    };
  }
  return { access };
}

export function withAuthority<T extends Record<string, unknown>>(
  access: Extract<PlatformAccess, { ok: true }>,
  payload: T,
) {
  return {
    ...payload,
    authority: access.authority,
    production: access.production,
    mode: access.mode,
    notice: access.message,
  };
}
