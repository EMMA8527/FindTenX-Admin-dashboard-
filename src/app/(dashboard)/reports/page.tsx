"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EmptyState } from "@/components/shared/empty-state";
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
import { reports as seedReports } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";
import type { ReportStatus } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState(seedReports);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState<{ id: string; status: ReportStatus } | null>(null);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          r.id.includes(q) ||
          r.reporterName.toLowerCase().includes(q) ||
          r.reportedName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q);
        const openStatuses = ["new", "under_review", "escalated", "action_required"];
        const f =
          filter === "all" ||
          (filter === "open" && openStatuses.includes(r.status)) ||
          r.status === filter;
        return match && f;
      }),
    [reports, search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Moderation"
        description="Review user-submitted safety reports and take moderated enforcement actions."
      />
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reports, users, or categories..."
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "Outstanding", value: "open" },
            { label: "All reports", value: "all" },
            { label: "New", value: "new" },
            { label: "Under review", value: "under_review" },
            { label: "Escalated", value: "escalated" },
            { label: "Resolved", value: "resolved" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
        {filtered.length === 0 ? (
          <EmptyState title="No outstanding reports. Your moderation queue is clear." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>{r.reporterName}</TableCell>
                  <TableCell>{r.reportedName}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{formatDateTime(r.submittedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge value={r.priority} />
                  </TableCell>
                  <TableCell>{r.assignedModerator ?? "Unassigned"}</TableCell>
                  <TableCell>
                    <StatusBadge value={r.status} />
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected({ id: r.id, status: "resolved" })}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected({ id: r.id, status: "escalated" })}
                    >
                      Escalate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <ConfirmActionDialog
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Confirm moderation action"
        description="Provide an explanation for this enforcement or review decision."
        onConfirm={async (reason) => {
          if (!selected) return;
          setReports((prev) =>
            prev.map((r) =>
              r.id === selected.id
                ? { ...r, status: selected.status, notes: reason, assignedModerator: "Noah Mensah" }
                : r,
            ),
          );
          toast.success(`Report marked ${selected.status}`);
        }}
      />
    </div>
  );
}
