"use client";

import { useMemo, useState } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { overviewMetrics, transactions } from "@/lib/data/seed";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          t.id.includes(q) ||
          t.userId.includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.provider.toLowerCase().includes(q);
        return match && (filter === "all" || t.status === filter);
      }),
    [search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Revenue"
        description="Reconcile provider transactions, refunds, and revenue performance."
        actions={
          <Button
            variant="outline"
            onClick={() => toast.success("Financial export queued for background processing")}
          >
            Export CSV
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total revenue" value={overviewMetrics.totalRevenue} prefix="$" icon={DollarSign} change={24.3} />
        <KpiCard label="Successful txns" value={transactions.filter((t) => t.status === "successful").length} icon={CreditCard} />
        <KpiCard label="Failed payments" value={transactions.filter((t) => t.status === "failed").length} icon={CreditCard} />
        <KpiCard label="Refunds" value={transactions.filter((t) => t.status === "refunded").length} icon={CreditCard} />
      </div>
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search transaction ID, user, provider..."
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All transactions", value: "all" },
            { label: "Successful", value: "successful" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
            { label: "Disputed", value: "disputed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
        />
        {filtered.length === 0 ? (
          <EmptyState title="No transactions found for the selected period." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
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
                  <TableCell>
                    <p className="font-medium">{t.customerName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{t.userId}</p>
                  </TableCell>
                  <TableCell>{t.provider}</TableCell>
                  <TableCell>{formatCurrency(t.amount, t.currency)}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>{formatDateTime(t.date)}</TableCell>
                  <TableCell>
                    <StatusBadge value={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Raw card numbers and CVV are never stored. Transactions reconcile against provider
          references only.
        </p>
      </div>
    </div>
  );
}
