import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { getComputedOverviewBundle } from "@/lib/db/analytics";
import { resolvePlatformAccess } from "@/lib/integrations/platform";
import { tryFetchCoreOverview } from "@/lib/integrations/core-overview";
import type { OverviewBreakdowns } from "@/lib/db/analytics";
import type { OverviewMetrics } from "@/lib/types";

const emptyBreakdowns = (): OverviewBreakdowns => ({
  gender: [
    { name: "Female", value: 0, count: 0 },
    { name: "Male", value: 0, count: 0 },
    { name: "Other", value: 0, count: 0 },
  ],
  verification: [
    { label: "Verified", value: 0, pct: 0, color: "#22c55e" },
    { label: "Pending", value: 0, pct: 0, color: "#ffc84a" },
    { label: "Rejected", value: 0, pct: 0, color: "#ef4444" },
    { label: "Resubmission", value: 0, pct: 0, color: "#ff1493" },
  ],
  revenue: { subscriptions: 0, boosts: 0, other: 0, total: 0 },
  pendingActions: [
    { label: "Verification Requests", count: 0, href: "/verification", key: "verification" },
    { label: "Reported Users", count: 0, href: "/reports", key: "reports" },
    { label: "Support Tickets", count: 0, href: "/support", key: "support" },
    { label: "Suspended Accounts", count: 0, href: "/users", key: "suspended" },
  ],
  growth: [],
  engagement: [],
  revenueSeries: [],
  activity: [],
});

const emptyMetrics = (): OverviewMetrics => ({
  totalUsers: 0,
  activeUsers: 0,
  newRegistrations: 0,
  verifiedUsers: 0,
  pendingVerifications: 0,
  totalMatches: 0,
  totalLikes: 0,
  totalConversations: 0,
  premiumSubscribers: 0,
  totalRevenue: 0,
  pendingReports: 0,
  suspendedAccounts: 0,
  changes: {},
});

export default async function OverviewPage() {
  const access = await resolvePlatformAccess();
  const meta = getDataSourceMeta();

  if (!access.ok) {
    return (
      <div className="space-y-4">
        <IntegrationBanner authority={access.authority} message={access.message} />
        <EmptyState
          title="DEMO / offline — FindTenX Core not connected"
          description="Production user, revenue, and admin operations stay locked until https://api.findtenx.app is deployed and FINDTENX_API_URL + FINDTENX_ADMIN_API_KEY are verified. Sample or local_dev data is never shown here as live production."
        />
      </div>
    );
  }

  let metrics = emptyMetrics();
  let breakdowns = emptyBreakdowns();
  let sourceNote = access.message;

  if (access.authority === "findtenx-core") {
    const core = await tryFetchCoreOverview();
    if (!core.ok) {
      return (
        <div className="space-y-4">
          <IntegrationBanner
            authority="unavailable"
            message={core.error || "Core is configured but overview endpoints did not return usable metrics."}
          />
          <EmptyState
            title="Core overview unavailable"
            description="FINDTENX_API_URL is set, but no tested Core overview payload was returned. Map real admin analytics routes after Origin access to findtenx-core is granted."
          />
        </div>
      );
    }
    metrics = core.metrics;
    breakdowns = { ...emptyBreakdowns(), ...core.breakdowns };
    sourceNote = "Serving live metrics from FindTenX Core.";
  } else {
    // Explicit local_dev only — computed from tables, never seed snapshots / hardcoded charts.
    const bundle = getComputedOverviewBundle();
    metrics = bundle.metrics;
    breakdowns = bundle.breakdowns;
    sourceNote =
      "PLATFORM_DATA_MODE=local_dev — metrics computed from admin-local SQLite counts only. Not FindTenX Core production.";
  }

  return (
    <div className="space-y-4">
      <IntegrationBanner authority={access.authority} message={sourceNote} />
      <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        Data source: <span className="font-medium text-foreground">{meta.source}</span>
        {" · "}
        Mode: <span className="font-medium text-foreground">{meta.platformDataMode}</span>
        {" · "}
        Production authority: FindTenX Core
      </div>
      <OverviewDashboard
        metrics={metrics}
        growth={breakdowns.growth}
        engagement={breakdowns.engagement}
        revenue={breakdowns.revenueSeries}
        activity={breakdowns.activity}
        breakdowns={breakdowns}
      />
    </div>
  );
}
