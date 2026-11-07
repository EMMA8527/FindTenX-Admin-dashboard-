"use client";

import { useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { ModuleStatus } from "@/components/shared/module-status";
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
import { useCatalog } from "@/hooks/use-catalog";
import { formatDate } from "@/lib/format";
import type { SubscriptionPlan, UserSubscription } from "@/lib/types";

export default function SubscriptionsPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    items: UserSubscription[];
    plans: SubscriptionPlan[];
  }>("subscriptions");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const subscriptions = data?.items ?? [];
  const plans = data?.plans ?? [];

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
    [subscriptions, search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Plans and subscriber lifecycle. Live billing changes require Core + payment provider credentials."
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Subscription authority"} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Active subscriptions" value={subscriptions.filter((s) => s.status === "active").length} icon={Crown} />
          <KpiCard label="Plans" value={plans.length} icon={Crown} />
          <KpiCard
            label="Plan catalog value"
            value={plans.reduce((sum, p) => sum + p.price, 0)}
            prefix="$"
            icon={Crown}
          />
          <KpiCard label="Past due" value={subscriptions.filter((s) => s.status === "past_due").length} icon={Crown} />
        </div>
        <div className="glass-card p-4 md:p-5">
          <ModuleToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
              { label: "Cancelled", value: "cancelled" },
              { label: "Past due", value: "past_due" },
            ]}
          />
          {filtered.length === 0 ? (
            <EmptyState title="No subscriptions for this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Renews</TableHead>
                  <TableHead>Provider</TableHead>
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
                    <TableCell>
                      <StatusBadge value={s.status} />
                    </TableCell>
                    <TableCell>{formatDate(s.startedAt)}</TableCell>
                    <TableCell>{s.renewsAt ? formatDate(s.renewsAt) : "—"}</TableCell>
                    <TableCell>{s.provider}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </ModuleStatus>
    </div>
  );
}
