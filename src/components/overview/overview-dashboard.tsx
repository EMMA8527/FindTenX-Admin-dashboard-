"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  Crown,
  Heart,
  Handshake,
  ShieldAlert,
  Ticket,
  UserPlus,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import type { ActivityItem, OverviewMetrics } from "@/lib/types";

const genderColors = ["#ff4d7a", "#3b82f6", "#a855f7"];

export function OverviewDashboard({
  metrics,
  growth,
  engagement,
  revenue,
  activity,
}: {
  metrics: OverviewMetrics;
  growth: { label: string; users: number; registrations: number }[];
  engagement: { label: string; likes: number; matches: number }[];
  revenue: { label: string; subscriptions: number; boosts: number; other: number }[];
  activity: ActivityItem[];
}) {
  const genderData = [
    { name: "Female", value: 52.3, count: Math.round(metrics.totalUsers * 0.523) },
    { name: "Male", value: 46.5, count: Math.round(metrics.totalUsers * 0.465) },
    { name: "Other", value: 1.2, count: Math.round(metrics.totalUsers * 0.012) },
  ];

  const verificationRows = [
    { label: "Verified", value: metrics.verifiedUsers, pct: 66.0, color: "#22c55e" },
    { label: "Pending", value: metrics.pendingVerifications, pct: 0.03, color: "#ffc84a" },
    { label: "Rejected", value: 14762, pct: 3.1, color: "#ef4444" },
    { label: "Resubmission", value: 11887, pct: 2.5, color: "#ff4d7a" },
  ];

  const revenueTotals = {
    subscriptions: 1136400,
    boosts: 78920,
    other: 33000,
  };

  const pendingActions = [
    { label: "Verification Requests", count: 128, href: "/verification", icon: BadgeCheck },
    { label: "Reported Users", count: 36, href: "/reports", icon: ShieldAlert },
    { label: "Support Tickets", count: 18, href: "/support", icon: Ticket },
    { label: "Suspicious Accounts", count: 7, href: "/security", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Users" value={metrics.totalUsers} change={metrics.changes.totalUsers} icon={Users} delay={0} />
        <KpiCard label="Active Users" value={metrics.activeUsers} change={metrics.changes.activeUsers} icon={Activity} delay={40} />
        <KpiCard label="New Registrations" value={metrics.newRegistrations} change={metrics.changes.newRegistrations} icon={UserPlus} delay={80} />
        <KpiCard label="Verified Users" value={metrics.verifiedUsers} change={metrics.changes.verifiedUsers} icon={BadgeCheck} delay={120} />
        <KpiCard label="Total Likes" value={metrics.totalLikes} change={metrics.changes.totalLikes} icon={Heart} delay={160} />
        <KpiCard label="Total Matches" value={metrics.totalMatches} change={metrics.changes.totalMatches} icon={Handshake} delay={200} />
        <KpiCard label="Premium Subscribers" value={metrics.premiumSubscribers} change={metrics.changes.premiumSubscribers} icon={Crown} delay={240} />
        <KpiCard label="Total Revenue" value={metrics.totalRevenue} change={metrics.changes.totalRevenue} icon={DollarSign} prefix="$" delay={280} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-5 xl:col-span-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">User Growth</h2>
              <p className="text-sm text-muted-foreground">New registrations over the selected period</p>
            </div>
          </div>
          <div className="h-72 w-full min-h-[18rem]">
            <ResponsiveContainer width="100%" height={288} minWidth={0}>
              <AreaChart data={growth}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d7a" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#ff4d7a" strokeWidth={3} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-base font-semibold">User Distribution</h2>
          <p className="mb-2 text-sm text-muted-foreground">Aggregate demographics</p>
          <div className="relative h-56 w-full">
            <ResponsiveContainer width="100%" height={224} minWidth={0}>
              <PieChart>
                <Pie data={genderData} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={3}>
                  {genderData.map((entry, index) => (
                    <Cell key={entry.name} fill={genderColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{formatNumber(metrics.totalUsers)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {genderData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: genderColors[i] }} />
                  {item.name}
                </div>
                <span className="text-muted-foreground">
                  {item.value}% · {formatNumber(item.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-5 animate-fade-up">
          <h2 className="mb-4 text-base font-semibold">Verification Status</h2>
          <div className="space-y-4">
            {verificationRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(row.value)} · {row.pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(row.pct, row.pct < 1 ? 2 : row.pct)}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 animate-fade-up">
          <h2 className="mb-1 text-base font-semibold">Matches & Engagement</h2>
          <p className="mb-4 text-sm text-muted-foreground">Likes vs matches by month</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height={224} minWidth={0}>
              <BarChart data={engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="likes" fill="#a855f7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="matches" fill="#ff4d7a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 animate-fade-up">
          <h2 className="mb-1 text-base font-semibold">Revenue Overview</h2>
          <p className="mb-4 text-sm text-muted-foreground">Subscription and platform revenue</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height={160} minWidth={0}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff8a3d" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#ff8a3d"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscriptions</span>
              <span className="font-medium">{formatCurrency(revenueTotals.subscriptions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boosts & Promotions</span>
              <span className="font-medium">{formatCurrency(revenueTotals.boosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other Revenue</span>
              <span className="font-medium">{formatCurrency(revenueTotals.other)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card overflow-hidden xl:col-span-2 animate-fade-up">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest platform events</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/analytics" />}>
              View All
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={item.userAvatar} alt={item.userName} />
                        <AvatarFallback>{item.userName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {item.userName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(item.at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="glass-card p-5 animate-fade-up">
          <h2 className="mb-4 text-base font-semibold">Pending Actions</h2>
          <div className="space-y-3">
            {pendingActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 py-3 transition hover:border-brand-pink/40 hover:bg-secondary"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-card text-brand-pink">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </div>
                  <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
