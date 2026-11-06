"use client";

import { useMemo, useState } from "react";
import { Activity, ShieldAlert } from "lucide-react";
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
import { auditLogs } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";
import { formatRole } from "@/lib/roles";

export default function SecurityPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      auditLogs.filter((log) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          log.adminName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.target.toLowerCase().includes(q) ||
          log.ip.includes(q);
        return match && (filter === "all" || log.result === filter);
      }),
    [search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Audit Logs"
        description="Immutable record of administrator activity, authentication events, and sensitive access."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Audit events" value={auditLogs.length} icon={Activity} />
        <KpiCard
          label="Failed auth"
          value={auditLogs.filter((l) => l.result === "failure").length}
          icon={ShieldAlert}
        />
        <KpiCard
          label="Successful actions"
          value={auditLogs.filter((l) => l.result === "success").length}
          icon={Activity}
        />
        <KpiCard label="Security alerts" value={7} icon={ShieldAlert} />
      </div>
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search admin, action, target, IP..."
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All events", value: "all" },
            { label: "Success", value: "success" },
            { label: "Failure", value: "failure" },
            { label: "Denied", value: "denied" },
          ]}
        />
        {filtered.length === 0 ? (
          <EmptyState title="No audit events match your filters." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <p className="font-medium">{log.adminName}</p>
                    <p className="text-xs text-muted-foreground">{formatRole(log.adminRole)}</p>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="font-mono text-xs">{log.target}</TableCell>
                  <TableCell>
                    <StatusBadge value={log.result} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {log.reason}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>{formatDateTime(log.at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Audit records are append-only in this portal and cannot be deleted by administrators.
        </p>
      </div>
    </div>
  );
}
