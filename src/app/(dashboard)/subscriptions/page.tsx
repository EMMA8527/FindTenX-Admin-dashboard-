"use client";

import { useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { overviewMetrics, plans, subscriptions } from "@/lib/data/seed";
import { formatCurrency, formatDate } from "@/lib/format";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      subscriptions.filter((s) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          s.userName.toLowerCase().includes(q) ||
          s.userId.includes(q) ||
          s.planName.toLowerCase().includes(q);
        return match && (filter === "all" || s.status === filter);
      }),
    [search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Manage free and premium plans, active subscriptions, and renewals."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Premium subscribers" value={overviewMetrics.premiumSubscribers} icon={Crown} change={16.9} />
        <KpiCard label="Free users" value={overviewMetrics.totalUsers - overviewMetrics.premiumSubscribers} icon={Crown} />
        <KpiCard label="Active subscriptions" value={subscriptions.filter((s) => s.status === "active").length} icon={Crown} />
        <KpiCard label="MRR (sample)" value={94820} prefix="$" icon={Crown} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <StatusBadge value={plan.available ? "active" : "inactive"} />
            </div>
            <p className="mt-4 text-3xl font-semibold">
              {formatCurrency(plan.price)}
              <span className="text-sm font-normal text-muted-foreground"> / {plan.interval}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              {plan.subscribers.toLocaleString()} subscribers · {plan.trialDays}-day trial
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All subscriptions", value: "all" },
            { label: "Active", value: "active" },
            { label: "Cancelled", value: "cancelled" },
            { label: "Expired", value: "expired" },
            { label: "Past due", value: "past_due" },
          ]}
        />
        {filtered.length === 0 ? (
          <EmptyState title="No subscriptions found for this filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscriber</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.userName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.userId}</p>
                  </TableCell>
                  <TableCell>{s.planName}</TableCell>
                  <TableCell>{s.provider}</TableCell>
                  <TableCell>{formatDate(s.startedAt)}</TableCell>
                  <TableCell>{s.renewsAt ? formatDate(s.renewsAt) : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
