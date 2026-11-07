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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "overview.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const metrics = getOverviewFromDb();
  const meta = getDataSourceMeta();
  return NextResponse.json({
    metrics,
    badges: dashboardBadges(),
    growth: userGrowth,
    engagement: engagementSeries,
    revenue: revenueSeries,
    activity: recentActivity,
    audit: recentAudit(10),
    dataSource: meta,
  });
}
