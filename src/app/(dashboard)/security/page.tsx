"use client";

import { IntegrationBanner } from "@/components/shared/integration-banner";
import { ModuleStatus } from "@/components/shared/module-status";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCatalog } from "@/hooks/use-catalog";
import { formatDateTime } from "@/lib/format";
import { formatRole } from "@/lib/roles";
import type { AuditLog } from "@/lib/types";

export default function SecurityPage() {
  const { data, loading, error, authority, notice } = useCatalog<{ items: AuditLog[] }>("audit");
  const logs = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Audit Logs"
        description="Administrator actions are recorded for accountability. Unauthorized permission attempts are denied and audited."
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice} empty={!loading && !error && logs.length === 0} emptyTitle="No audit events yet">
        <IntegrationBanner authority={authority} message={notice || "Audit log authority"} />
        <div className="glass-card overflow-x-auto p-4 md:p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.at)}</TableCell>
                  <TableCell>{log.adminName}</TableCell>
                  <TableCell>{formatRole(log.adminRole)}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="font-mono text-xs">{log.target}</TableCell>
                  <TableCell>
                    <StatusBadge value={log.result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModuleStatus>
    </div>
  );
}
