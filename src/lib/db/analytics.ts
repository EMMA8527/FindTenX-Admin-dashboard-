import { count, desc, eq, sql } from "drizzle-orm";
import { assertDbReady } from "@/lib/db/bootstrap";
import * as t from "@/lib/db/schema";
import type { ActivityItem, OverviewMetrics } from "@/lib/types";
import { getOverviewFromDb, dashboardBadges } from "@/lib/db/queries";

export type OverviewBreakdowns = {
  gender: { name: string; value: number; count: number }[];
  verification: { label: string; value: number; pct: number; color: string }[];
  revenue: { subscriptions: number; boosts: number; other: number; total: number };
  pendingActions: { label: string; count: number; href: string; key: string }[];
  growth: { label: string; users: number; registrations: number }[];
  engagement: { label: string; likes: number; matches: number }[];
  revenueSeries: { label: string; subscriptions: number; boosts: number; other: number }[];
  activity: ActivityItem[];
};

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * Compute overview analytics strictly from admin DB tables.
 * Used only when PLATFORM_DATA_MODE=local_dev is explicitly allowed.
 * Never invent demographic/revenue percentages beyond table counts.
 */
export function getComputedOverviewBundle(): {
  metrics: OverviewMetrics;
  breakdowns: OverviewBreakdowns;
} {
  const db = assertDbReady();
  const metrics = getOverviewFromDb();

  const genderRows = db
    .select({ gender: t.users.gender, c: count() })
    .from(t.users)
    .groupBy(t.users.gender)
    .all();
  const genderTotal = genderRows.reduce((sum, row) => sum + Number(row.c), 0) || metrics.totalUsers;
  const gender = ["female", "male", "other"].map((name) => {
    const row = genderRows.find((g) => g.gender === name);
    const c = Number(row?.c ?? 0);
    return { name: name[0]!.toUpperCase() + name.slice(1), value: pct(c, genderTotal), count: c };
  });

  const verificationStatuses = ["verified", "pending", "rejected", "resubmission"] as const;
  const colors: Record<(typeof verificationStatuses)[number], string> = {
    verified: "#22c55e",
    pending: "#ffc84a",
    rejected: "#ef4444",
    resubmission: "#ff1493",
  };
  const verificationCounts = verificationStatuses.map((status) => {
    const value =
      db.select({ c: count() }).from(t.verifications).where(eq(t.verifications.status, status)).get()
        ?.c ?? 0;
    return {
      label: status[0]!.toUpperCase() + status.slice(1),
      value,
      pct: pct(value, metrics.totalUsers || 1),
      color: colors[status],
    };
  });

  const txRows = db.select().from(t.transactions).all();
  const revenue = { subscriptions: 0, boosts: 0, other: 0, total: 0 };
  for (const tx of txRows) {
    if (tx.status !== "successful") continue;
    const amount = Number(tx.amount) || 0;
    revenue.total += amount;
    const type = (tx.type || "").toLowerCase();
    if (type.includes("sub")) revenue.subscriptions += amount;
    else if (type.includes("boost") || type.includes("promo")) revenue.boosts += amount;
    else revenue.other += amount;
  }
  metrics.totalRevenue = revenue.total;

  const badges = dashboardBadges();
  const pendingActions = [
    { label: "Verification Requests", count: badges.verification, href: "/verification", key: "verification" },
    { label: "Reported Users", count: badges.reports, href: "/reports", key: "reports" },
    { label: "Support Tickets", count: badges.support, href: "/support", key: "support" },
    {
      label: "Suspended Accounts",
      count: metrics.suspendedAccounts,
      href: "/users?status=suspended",
      key: "suspended",
    },
  ];

  // No fabricated time-series: empty until Core/Data provide them.
  const growth: OverviewBreakdowns["growth"] = [];
  const engagement: OverviewBreakdowns["engagement"] = [];
  const revenueSeries: OverviewBreakdowns["revenueSeries"] = [];

  const audit = db.select().from(t.auditLogs).orderBy(desc(t.auditLogs.at)).limit(12).all();
  const activity: ActivityItem[] = audit.map((a) => ({
    id: a.id,
    type: a.action,
    description: a.reason || a.action,
    userName: a.adminName,
    userAvatar: "",
    at: a.at,
    status: a.result,
  }));

  return {
    metrics,
    breakdowns: {
      gender,
      verification: verificationCounts,
      revenue,
      pendingActions,
      growth,
      engagement,
      revenueSeries,
      activity,
    },
  };
}

// silence unused if drizzle sql helper unused
void sql;
