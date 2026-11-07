"use client";

import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
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
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export default function PaymentsPage() {
  const { data, loading, error, authority, notice } = useCatalog<{ items: Transaction[] }>(
    "transactions",
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const transactions = data?.items ?? [];

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.userId.includes(q) ||
          t.provider.toLowerCase().includes(q);
        return match && (filter === "all" || t.status === filter);
      }),
    [transactions, search, filter],
  );

  const successful = transactions.filter((t) => t.status === "successful");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Revenue"
        description="Transaction ledger and revenue ops. Live payment providers remain disabled until credentials are supplied and tested."
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Payments authority"} />
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Transactions" value={transactions.length} icon={CreditCard} />
          <KpiCard
            label="Successful volume"
            value={successful.reduce((sum, t) => sum + t.amount, 0)}
            prefix="$"
            icon={CreditCard}
          />
          <KpiCard
            label="Failed / disputed"
            value={transactions.filter((t) => t.status === "failed" || t.status === "disputed").length}
            icon={CreditCard}
          />
        </div>
        <div className="glass-card p-4 md:p-5">
          <ModuleToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={[
              { label: "All", value: "all" },
              { label: "Successful", value: "successful" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
              { label: "Refunded", value: "refunded" },
              { label: "Disputed", value: "disputed" },
            ]}
          />
          {filtered.length === 0 ? (
            <EmptyState title="No transactions for this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.customerName}</TableCell>
                    <TableCell>{t.provider}</TableCell>
                    <TableCell>{formatCurrency(t.amount, t.currency)}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>{formatDateTime(t.date)}</TableCell>
                    <TableCell>
                      <StatusBadge value={t.status} />
                    </TableCell>
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
