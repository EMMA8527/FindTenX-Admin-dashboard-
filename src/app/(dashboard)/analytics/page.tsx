"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Activity,
  DollarSign,
  Heart,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { OverviewMetrics } from "@/lib/types";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authority, setAuthority] = useState("unavailable");
  const [notice, setNotice] = useState("");
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [growth, setGrowth] = useState<Array<{ label: string; users: number; registrations: number }>>([]);
  const [engagement, setEngagement] = useState<Array<{ label: string; likes: number; matches: number }>>([]);
  const [revenue, setRevenue] = useState<Array<{ label: string; subscriptions: number; boosts: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/overview");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setAuthority(data.authority || "unavailable");
          setNotice(data.error || "");
          throw new Error(data.error || "Failed to load analytics");
        }
        setMetrics(data.metrics);
        setGrowth(data.growth || []);
        setEngagement(data.engagement || []);
        setRevenue(data.revenue || []);
        setAuthority(data.authority || "unknown");
        setNotice(data.notice || "");
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setMetrics(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Business intelligence across growth, dating engagement, revenue, and safety."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.message("Exports require FindTenX Core / Data reporting endpoints.")
              }
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.message("PDF reporting requires FindTenX Data once credentials are configured.")
              }
            >
              Export PDF
            </Button>
          </>
        }
      />
      <IntegrationBanner authority={authority} message={notice || error || "Analytics authority"} />

      {loading ? (
        <div className="glass-card p-8 text-sm text-muted-foreground">Loading analytics…</div>
      ) : error || !metrics ? (
        <EmptyState title="Analytics unavailable" description={error || "No metrics returned."} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total registrations" value={metrics.totalUsers} icon={Users} change={metrics.changes.totalUsers} />
            <KpiCard label="Active users" value={metrics.activeUsers} icon={Activity} change={metrics.changes.activeUsers} />
            <KpiCard label="New registrations" value={metrics.newRegistrations} icon={Users} change={metrics.changes.newRegistrations} />
            <KpiCard label="Total likes" value={metrics.totalLikes} icon={Heart} change={metrics.changes.totalLikes} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="glass-card p-5">
              <h3 className="mb-4 font-semibold">Registration growth</h3>
              <div className="h-64">
                {growth.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No growth series from Core/Data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growth}>
                      <defs>
                        <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff1493" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#ff8c00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="registrations" stroke="#ff1493" fill="url(#aFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="mb-4 font-semibold">Dating engagement</h3>
              <div className="h-64">
                {engagement.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No engagement series from Core/Data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="likes" fill="#ff8c00" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="matches" fill="#ff1493" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Revenue & safety
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Total revenue" value={metrics.totalRevenue} prefix="$" icon={DollarSign} change={metrics.changes.totalRevenue} />
              <KpiCard label="Premium subscribers" value={metrics.premiumSubscribers} icon={Heart} />
              <KpiCard label="Pending reports" value={metrics.pendingReports} icon={Shield} />
              <KpiCard label="Suspended accounts" value={metrics.suspendedAccounts} icon={Shield} />
            </div>
            <div className="glass-card p-5">
              <h3 className="mb-4 font-semibold">Revenue trend</h3>
              <div className="h-64">
                {revenue.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No revenue series from Core/Data yet. Ledger totals above use connected transaction counts only when available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="subscriptions" stroke="#ff8c00" fill="#ff8c0033" />
                      <Area type="monotone" dataKey="boosts" stroke="#ff1493" fill="#ff149322" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
