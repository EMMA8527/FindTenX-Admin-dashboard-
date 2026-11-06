import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import {
  engagementSeries,
  overviewMetrics,
  recentActivity,
  revenueSeries,
  userGrowth,
} from "@/lib/data/seed";
import { getStore } from "@/lib/data/store";

export default function OverviewPage() {
  const store = getStore();
  return (
    <OverviewDashboard
      metrics={store.metrics ?? overviewMetrics}
      growth={userGrowth}
      engagement={engagementSeries}
      revenue={revenueSeries}
      activity={store.activity ?? recentActivity}
    />
  );
}
