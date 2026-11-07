import { coreGet } from "@/lib/integrations/core-client";
import type { OverviewBreakdowns } from "@/lib/db/analytics";
import type { OverviewMetrics } from "@/lib/types";

type CoreOverviewResult =
  | {
      ok: true;
      metrics: OverviewMetrics;
      breakdowns: Partial<OverviewBreakdowns>;
      path: string;
    }
  | { ok: false; error: string };

/**
 * Attempt to load overview metrics from FindTenX Core.
 * Paths are provisional until the Core repo is readable; only successful JSON
 * that contains recognizable metric fields is accepted. Failures are returned
 * honestly — never synthesize production figures.
 */
export async function tryFetchCoreOverview(): Promise<CoreOverviewResult> {
  const candidates = [
    "/api/admin/overview",
    "/admin/overview",
    "/api/admin/metrics",
    "/api/metrics/overview",
    "/v1/admin/overview",
  ];

  const errors: string[] = [];

  for (const path of candidates) {
    const result = await coreGet<Record<string, unknown>>(path);
    if (!result.ok) {
      errors.push(`${path}: ${result.error || result.status}`);
      continue;
    }
    const payload = result.data;
    if (!payload || typeof payload !== "object") {
      errors.push(`${path}: empty body`);
      continue;
    }

    const metricsCandidate =
      (payload.metrics as Record<string, unknown> | undefined) ||
      (payload.data as Record<string, unknown> | undefined) ||
      payload;

    const totalUsers = Number(
      metricsCandidate.totalUsers ?? metricsCandidate.total_users ?? metricsCandidate.users,
    );
    if (!Number.isFinite(totalUsers)) {
      errors.push(`${path}: no recognizable totalUsers field`);
      continue;
    }

    const metrics: OverviewMetrics = {
      totalUsers,
      activeUsers: Number(metricsCandidate.activeUsers ?? metricsCandidate.active_users ?? 0) || 0,
      newRegistrations:
        Number(metricsCandidate.newRegistrations ?? metricsCandidate.new_registrations ?? 0) || 0,
      verifiedUsers:
        Number(metricsCandidate.verifiedUsers ?? metricsCandidate.verified_users ?? 0) || 0,
      pendingVerifications:
        Number(
          metricsCandidate.pendingVerifications ?? metricsCandidate.pending_verifications ?? 0,
        ) || 0,
      totalMatches: Number(metricsCandidate.totalMatches ?? metricsCandidate.total_matches ?? 0) || 0,
      totalLikes: Number(metricsCandidate.totalLikes ?? metricsCandidate.total_likes ?? 0) || 0,
      totalConversations:
        Number(metricsCandidate.totalConversations ?? metricsCandidate.total_conversations ?? 0) ||
        0,
      premiumSubscribers:
        Number(
          metricsCandidate.premiumSubscribers ?? metricsCandidate.premium_subscribers ?? 0,
        ) || 0,
      totalRevenue: Number(metricsCandidate.totalRevenue ?? metricsCandidate.total_revenue ?? 0) || 0,
      pendingReports:
        Number(metricsCandidate.pendingReports ?? metricsCandidate.pending_reports ?? 0) || 0,
      suspendedAccounts:
        Number(metricsCandidate.suspendedAccounts ?? metricsCandidate.suspended_accounts ?? 0) || 0,
      changes:
        (metricsCandidate.changes as OverviewMetrics["changes"] | undefined) &&
        typeof metricsCandidate.changes === "object"
          ? (metricsCandidate.changes as OverviewMetrics["changes"])
          : {},
    };

    return {
      ok: true,
      metrics,
      breakdowns: {
        growth: Array.isArray(payload.growth) ? (payload.growth as OverviewBreakdowns["growth"]) : [],
        engagement: Array.isArray(payload.engagement)
          ? (payload.engagement as OverviewBreakdowns["engagement"])
          : [],
        revenueSeries: Array.isArray(payload.revenue)
          ? (payload.revenue as OverviewBreakdowns["revenueSeries"])
          : [],
        activity: Array.isArray(payload.activity)
          ? (payload.activity as OverviewBreakdowns["activity"])
          : [],
      },
      path,
    };
  }

  return {
    ok: false,
    error:
      errors.slice(0, 5).join(" · ") ||
      "No Core overview endpoint returned usable metrics. Grant Origin access to findtenx-core to map the real routes.",
  };
}
