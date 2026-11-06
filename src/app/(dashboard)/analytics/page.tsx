"use client";

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
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import {
  engagementSeries,
  overviewMetrics,
  revenueSeries,
  userGrowth,
} from "@/lib/data/seed";
import {
  Activity,
  DollarSign,
  Heart,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Business intelligence across growth, dating engagement, revenue, and safety."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast.success("CSV export queued")}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("PDF report queued")}
            >
              Export PDF
            </Button>
          </>
        }
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          User analytics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total registrations" value={overviewMetrics.totalUsers} icon={Users} change={12.6} />
          <KpiCard label="DAU" value={overviewMetrics.activeUsers} icon={Activity} change={18.4} />
          <KpiCard label="New registrations" value={overviewMetrics.newRegistrations} icon={Users} change={14.2} />
          <KpiCard label="Retention (30d)" value={42} icon={Activity} />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 font-semibold">Registration growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d7a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff4d7a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="registrations" stroke="#ff4d7a" fill="url(#aFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-4 font-semibold">Dating engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="likes" fill="#a855f7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="matches" fill="#ff4d7a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Revenue & safety
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total revenue" value={overviewMetrics.totalRevenue} prefix="$" icon={DollarSign} change={24.3} />
          <KpiCard label="Match conversion" value={17} icon={Heart} />
          <KpiCard label="Pending reports" value={overviewMetrics.pendingReports} icon={Shield} change={-11.2} />
          <KpiCard label="Suspended accounts" value={overviewMetrics.suspendedAccounts} icon={Shield} />
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-4 font-semibold">Revenue trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="subscriptions" stroke="#ff8a3d" fill="#ff8a3d33" />
                <Area type="monotone" dataKey="boosts" stroke="#ff4d7a" fill="#ff4d7a22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
