import { NextResponse } from "next/server";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { dbHealth } from "@/lib/db/queries";
import { getIntegrationStatus } from "@/lib/integrations/platform";

export async function GET() {
  try {
    const [health, meta, integrations] = await Promise.all([
      Promise.resolve(dbHealth()),
      Promise.resolve(getDataSourceMeta()),
      getIntegrationStatus(),
    ]);
    return NextResponse.json({
      ...health,
      dataSource: meta,
      integrations: {
        access: integrations.access,
        core: {
          configured: integrations.core.configured,
          reachable: integrations.core.reachable,
          message: integrations.core.message,
        },
        data: {
          configured: integrations.data.configured,
          reachable: integrations.data.reachable,
          message: integrations.data.message,
        },
        repositories: integrations.repositories,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database unavailable",
      },
      { status: 500 },
    );
  }
}
