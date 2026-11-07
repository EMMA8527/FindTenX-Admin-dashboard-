"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { ReportRecord } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authority, setAuthority] = useState("unavailable");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<{ id: string; status: ReportRecord["status"] } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/reports", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) {
          setAuthority(data.authority || "unavailable");
          setNotice(data.error || "");
          throw new Error(data.error || "Failed to load reports");
        }
        setReports(data.reports || []);
        setAuthority(data.authority || "unknown");
        setNotice(data.notice || "");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
          setReports([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reports.filter((r) => {
      const match =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.reportedName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return match && (filter === "all" || r.status === filter);
    });
  }, [reports, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Moderation"
        description="Review user reports, escalate cases, and apply account actions with an audit trail."
      />
      <IntegrationBanner authority={authority} message={notice || error || "Moderation queue authority"} />
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All", value: "all" },
            { label: "New", value: "new" },
            { label: "Under review", value: "under_review" },
            { label: "Escalated", value: "escalated" },
            { label: "Action required", value: "action_required" },
            { label: "Resolved", value: "resolved" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading reports…</p>
        ) : error ? (
          <EmptyState title="Unable to load reports" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No reports for this filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
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
                  <TableCell>
                    <StatusBadge value={r.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected({ id: r.id, status: "under_review" })}
                    >
                      Review
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
        title="Update report status"
        description="Moderation actions are audited. Live account enforcement against FindTenX Core is pending Core access."
        onConfirm={async (reason) => {
          if (!selected) return;
          setReports((prev) =>
            prev.map((r) =>
              r.id === selected.id ? { ...r, status: selected.status, notes: reason } : r,
            ),
          );
          toast.success("Report updated");
        }}
      />
    </div>
  );
}
