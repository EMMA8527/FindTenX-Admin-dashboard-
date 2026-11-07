import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import {
  dashboardBadges,
  getOverviewFromDb,
  recentAudit,
} from "@/lib/db/queries";
import {
  engagementSeries,
  recentActivity,
  revenueSeries,
  userGrowth,
} from "@/lib/data/seed";
import { requirePlatformAccess, withAuthority } from "@/lib/integrations/require-platform";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "overview.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;
  const { access } = gate;

  const metrics = getOverviewFromDb();
  const meta = getDataSourceMeta();
  const useLocalSeries = access.authority === "admin_local_dev";

  return NextResponse.json(
    withAuthority(access, {
      metrics,
      badges: dashboardBadges(),
      growth: useLocalSeries ? userGrowth : [],
      engagement: useLocalSeries ? engagementSeries : [],
      revenue: useLocalSeries ? revenueSeries : [],
      activity: useLocalSeries ? recentActivity : [],
      audit: recentAudit(10),
      dataSource: meta,
    }),
  );
}
