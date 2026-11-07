"use client";

import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { KpiCard } from "@/components/shared/kpi-card";
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
import { formatCurrency, formatDate } from "@/lib/format";
import type { PromoCampaign } from "@/lib/types";

export default function PromotionsPage() {
  const { data, loading, error, authority, notice, production } = useCatalog<{
    items: PromoCampaign[];
    reason?: string;
    incomplete?: boolean;
    sample?: boolean;
  }>("promotions");
  const items = data?.items ?? [];
  const showKpis = authority === "admin_local_dev" && items.length > 0 && !production;
  const revenue = showKpis ? items.reduce((sum, p) => sum + p.revenue, 0) : 0;
  const conversions = showKpis ? items.reduce((sum, p) => sum + p.conversions, 0) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Marketing"
        description="Manage campaigns, promo codes, referrals, and conversion analytics."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
        empty={!loading && !error && items.length === 0}
        emptyTitle="No promotional campaigns"
        emptyDescription={
          data?.reason ||
          "Campaign and revenue figures stay empty until FindTenX Core marketing APIs are connected."
        }
      >
        <IntegrationBanner authority={authority} message={notice || data?.reason || "Promotions authority"} />
        {showKpis ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Active campaigns (local_dev)"
              value={items.filter((p) => p.status === "active").length}
              icon={Megaphone}
            />
            <KpiCard label="Sample conversions" value={conversions} icon={Megaphone} />
            <KpiCard label="Sample revenue" value={revenue} prefix="$" icon={Megaphone} />
            <KpiCard
              label="Sample redemptions"
              value={items.reduce((s, p) => s + p.usedCount, 0)}
              icon={Megaphone}
            />
          </div>
        ) : null}
        {items.length > 0 ? (
          <div className="glass-card p-4 md:p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell className="font-mono text-xs">{p.promoCode}</TableCell>
                    <TableCell>
                      {formatDate(p.startDate)} – {formatDate(p.endDate)}
                    </TableCell>
                    <TableCell>
                      {p.usedCount}/{p.usageLimit}
                    </TableCell>
                    <TableCell>{p.conversions}</TableCell>
                    <TableCell>{formatCurrency(p.revenue)}</TableCell>
                    <TableCell>
                      <StatusBadge value={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </ModuleStatus>
    </div>
  );
}
