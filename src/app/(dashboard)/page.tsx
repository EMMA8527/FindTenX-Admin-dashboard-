import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import {
  engagementSeries,
  recentActivity,
  revenueSeries,
  userGrowth,
} from "@/lib/data/seed";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { getOverviewFromDb } from "@/lib/db/queries";

export default function OverviewPage() {
  const metrics = getOverviewFromDb();
  const meta = getDataSourceMeta();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        Data source: <span className="font-medium text-foreground">{meta.source}</span>
        {meta.findtenxApiConfigured
          ? " · FINDTENX_API_URL is set (Core sync pending agent access)."
          : " · Persistent local admin DB (Core/Data repos not accessible to this agent)."}
      </div>
      <OverviewDashboard
        metrics={metrics}
        growth={userGrowth}
        engagement={engagementSeries}
        revenue={revenueSeries}
        activity={recentActivity}
      />
    </div>
  );
}
