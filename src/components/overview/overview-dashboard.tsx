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
import type { OverviewBreakdowns } from "@/lib/db/analytics";

const genderColors = ["#ff1493", "#ff8c00", "#c71585"];

const pendingIcons = {
  verification: BadgeCheck,
  reports: ShieldAlert,
  support: Ticket,
  suspended: Activity,
} as const;

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function OverviewDashboard({
  metrics,
  growth,
  engagement,
  revenue,
  activity,
  breakdowns,
}: {
  metrics: OverviewMetrics;
  growth: { label: string; users: number; registrations: number }[];
  engagement: { label: string; likes: number; matches: number }[];
  revenue: { label: string; subscriptions: number; boosts: number; other: number }[];
  activity: ActivityItem[];
  breakdowns: OverviewBreakdowns;
}) {
  const genderData = breakdowns.gender;
  const verificationRows = breakdowns.verification;
  const revenueTotals = breakdowns.revenue;
  const pendingActions = breakdowns.pendingActions;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <KpiCard label="Total Users" value={metrics.totalUsers} change={metrics.changes.totalUsers} icon={Users} delay={0} href="/users" />
        <KpiCard label="Active Users" value={metrics.activeUsers} change={metrics.changes.activeUsers} icon={Activity} delay={40} href="/users" />
        <KpiCard label="New Registrations" value={metrics.newRegistrations} change={metrics.changes.newRegistrations} icon={UserPlus} delay={80} href="/users" />
        <KpiCard label="Verified Users" value={metrics.verifiedUsers} change={metrics.changes.verifiedUsers} icon={BadgeCheck} delay={120} href="/verification" />
        <KpiCard label="Total Likes" value={metrics.totalLikes} change={metrics.changes.totalLikes} icon={Heart} delay={160} href="/likes-matches" />
        <KpiCard label="Total Matches" value={metrics.totalMatches} change={metrics.changes.totalMatches} icon={Handshake} delay={200} href="/likes-matches" />
        <KpiCard label="Premium Subscribers" value={metrics.premiumSubscribers} change={metrics.changes.premiumSubscribers} icon={Crown} delay={240} href="/subscriptions" />
        <KpiCard label="Total Revenue" value={metrics.totalRevenue} change={metrics.changes.totalRevenue} icon={DollarSign} prefix="$" delay={280} href="/payments" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card overflow-hidden p-4 sm:p-5 xl:col-span-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="mb-4">
            <h2 className="text-base font-semibold">User Growth</h2>
            <p className="text-sm text-muted-foreground">New registrations over the selected period</p>
          </div>
          <div className="h-52 w-full min-w-0 sm:h-72">
            {growth.length === 0 ? (
              <ChartEmpty label="Time-series growth data requires FindTenX Core / Data. No fabricated chart is shown." />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={growth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff1493" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#ff8c00" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis width={36} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#ff1493" strokeWidth={3} fill="url(#growthFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-base font-semibold">User Distribution</h2>
          <p className="mb-2 text-sm text-muted-foreground">Aggregate demographics from current directory</p>
          {genderData.every((g) => g.count === 0) ? (
            <ChartEmpty label="No user demographic rows available yet." />
          ) : (
            <>
              <div className="relative h-52 w-full min-w-0 sm:h-56">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={3}>
                      {genderData.map((entry, index) => (
                        <Cell key={entry.name} fill={genderColors[index % genderColors.length]} />
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
                      <span className="size-2.5 rounded-full" style={{ background: genderColors[i % genderColors.length] }} />
                      {item.name}
                    </div>
                    <span className="text-muted-foreground">
                      {item.value}% · {formatNumber(item.count)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-4 sm:p-5 animate-fade-up">
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
                      width: `${row.value === 0 ? 0 : Math.max(row.pct, 2)}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden p-4 sm:p-5 animate-fade-up">
          <h2 className="mb-1 text-base font-semibold">Matches & Engagement</h2>
          <p className="mb-4 text-sm text-muted-foreground">Likes vs matches by month</p>
          <div className="h-48 w-full min-w-0 sm:h-56">
            {engagement.length === 0 ? (
              <ChartEmpty label="Engagement time-series requires FindTenX Core / Data." />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={engagement} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis width={36} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="likes" fill="#ff8c00" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="matches" fill="#ff1493" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden p-4 sm:p-5 animate-fade-up">
          <h2 className="mb-1 text-base font-semibold">Revenue Overview</h2>
          <p className="mb-4 text-sm text-muted-foreground">Successful transaction totals from connected ledger</p>
          <div className="h-36 w-full min-w-0 sm:h-40">
            {revenue.length === 0 ? (
              <ChartEmpty label="Revenue trend series requires FindTenX Core / Data." />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff8c00" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ffd700" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="subscriptions"
                    stroke="#ff8c00"
                    strokeWidth={2.5}
                    fill="url(#revFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
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
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest audited admin events</p>
            </div>
            <Button variant="outline" size="sm" className="min-h-10" render={<Link href="/security" />}>
              View All
            </Button>
          </div>
          {activity.length === 0 ? (
            <div className="p-6">
              <ChartEmpty label="No audit activity recorded yet." />
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {activity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-secondary/30 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{item.type}</p>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={item.userAvatar} alt={item.userName} />
                          <AvatarFallback>{item.userName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm">{item.userName}</span>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(item.at)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actor</TableHead>
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
                        <TableCell className="text-muted-foreground">{formatDateTime(item.at)}</TableCell>
                        <TableCell>
                          <StatusBadge value={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5 animate-fade-up">
          <h2 className="mb-4 text-base font-semibold">Pending Actions</h2>
          <div className="space-y-3">
            {pendingActions.map((item) => {
              const Icon = pendingIcons[item.key as keyof typeof pendingIcons] ?? Activity;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 py-3 transition hover:border-brand-pink/40 hover:bg-secondary"
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
