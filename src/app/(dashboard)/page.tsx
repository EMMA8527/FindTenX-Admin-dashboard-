import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import {
  engagementSeries,
  recentActivity,
  revenueSeries,
  userGrowth,
} from "@/lib/data/seed";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { getOverviewFromDb } from "@/lib/db/queries";
import { resolvePlatformAccess } from "@/lib/integrations/platform";
import { EmptyState } from "@/components/shared/empty-state";

export default async function OverviewPage() {
  const access = await resolvePlatformAccess();
  const meta = getDataSourceMeta();

  if (!access.ok) {
    return (
      <div className="space-y-4">
        <IntegrationBanner authority={access.authority} message={access.message} />
        <EmptyState
          title="Overview waiting on FindTenX Core"
          description="Platform metrics are not served from local bootstrap in core mode. Configure FINDTENX_API_URL or set PLATFORM_DATA_MODE=local_dev for explicit local-only development."
        />
      </div>
    );
  }

  const metrics = getOverviewFromDb();

  return (
    <div className="space-y-4">
      <IntegrationBanner authority={access.authority} message={access.message} />
      <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        Data source: <span className="font-medium text-foreground">{meta.source}</span>
        {" · "}
        Mode: <span className="font-medium text-foreground">{meta.platformDataMode}</span>
        {" · "}
        Production authority: FindTenX Core
      </div>
      <OverviewDashboard
        metrics={metrics}
        growth={access.authority === "findtenx-core" ? [] : userGrowth}
        engagement={access.authority === "findtenx-core" ? [] : engagementSeries}
        revenue={access.authority === "findtenx-core" ? [] : revenueSeries}
        activity={access.authority === "findtenx-core" ? [] : recentActivity}
      />
    </div>
  );
}
