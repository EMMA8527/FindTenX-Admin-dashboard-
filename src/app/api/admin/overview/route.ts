import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { getComputedOverviewBundle } from "@/lib/db/analytics";
import { dashboardBadges } from "@/lib/db/queries";
import { requirePlatformAccess, withAuthority } from "@/lib/integrations/require-platform";
import { tryFetchCoreOverview } from "@/lib/integrations/core-overview";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "overview.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;
  const { access } = gate;
  const meta = getDataSourceMeta();

  if (access.authority === "findtenx-core") {
    const core = await tryFetchCoreOverview();
    if (!core.ok) {
      return NextResponse.json(
        {
          error: core.error,
          code: "CORE_OVERVIEW_UNMAPPED",
          authority: access.authority,
          production: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      withAuthority(access, {
        metrics: core.metrics,
        breakdowns: core.breakdowns,
        badges: dashboardBadges(),
        growth: core.breakdowns.growth ?? [],
        engagement: core.breakdowns.engagement ?? [],
        revenue: core.breakdowns.revenueSeries ?? [],
        activity: core.breakdowns.activity ?? [],
        dataSource: meta,
        corePath: core.path,
      }),
    );
  }

  const bundle = getComputedOverviewBundle();
  return NextResponse.json(
    withAuthority(access, {
      metrics: bundle.metrics,
      breakdowns: bundle.breakdowns,
      badges: dashboardBadges(),
      growth: bundle.breakdowns.growth,
      engagement: bundle.breakdowns.engagement,
      revenue: bundle.breakdowns.revenueSeries,
      activity: bundle.breakdowns.activity,
      dataSource: meta,
    }),
  );
}
