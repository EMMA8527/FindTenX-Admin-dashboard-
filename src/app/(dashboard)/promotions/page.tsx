"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
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
import { promotions } from "@/lib/data/seed";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PromotionsPage() {
  const [items] = useState(promotions);
  const revenue = items.reduce((sum, p) => sum + p.revenue, 0);
  const conversions = items.reduce((sum, p) => sum + p.conversions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Marketing"
        description="Manage campaigns, promo codes, referrals, and conversion analytics."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active campaigns" value={items.filter((p) => p.status === "active").length} icon={Megaphone} />
        <KpiCard label="Total conversions" value={conversions} icon={Megaphone} />
        <KpiCard label="Campaign revenue" value={revenue} prefix="$" icon={Megaphone} />
        <KpiCard label="Promo redemptions" value={items.reduce((s, p) => s + p.usedCount, 0)} icon={Megaphone} />
      </div>
      <div className="glass-card p-4 md:p-5">
        {items.length === 0 ? (
          <EmptyState title="No promotional campaigns configured." />
        ) : (
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
        )}
      </div>
    </div>
  );
}
