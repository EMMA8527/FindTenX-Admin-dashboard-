"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verifications as seed } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";
import { BadgeCheck, Clock3, RotateCcw, XCircle } from "lucide-react";

export default function VerificationPage() {
  const [items, setItems] = useState(seed);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<{ id: string; next: "verified" | "rejected" | "resubmission" } | null>(null);

  const filtered = useMemo(() => items.filter((v) => {
    const q = search.toLowerCase();
    const match = !q || v.userName.toLowerCase().includes(q) || v.userId.includes(q) || v.id.includes(q);
    return match && (filter === "all" || v.status === filter);
  }), [items, search, filter]);

  const counts = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "verified").length,
    rejected: items.filter((i) => i.status === "rejected").length,
    resubmission: items.filter((i) => i.status === "resubmission").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Verification Centre" description="Review identity, selfie, liveness and document verification submissions." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total submissions" value={counts.total} icon={BadgeCheck} />
        <KpiCard label="Pending" value={counts.pending} icon={Clock3} />
        <KpiCard label="Approved" value={counts.approved} icon={BadgeCheck} />
        <KpiCard label="Rejected" value={counts.rejected} icon={XCircle} />
        <KpiCard label="Resubmission" value={counts.resubmission} icon={RotateCcw} />
      </div>
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} filterOptions={[
          { label: "All", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
          { label: "Resubmission", value: "resubmission" },
          { label: "Verified", value: "verified" },
        ]} />
        {filtered.length === 0 ? <EmptyState title="No pending verification submissions." /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={v.userAvatar} /><AvatarFallback>{v.userName.slice(0,2)}</AvatarFallback></Avatar>
                      {v.userName}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{v.userId}</TableCell>
                  <TableCell className="capitalize">{v.type}</TableCell>
                  <TableCell>{formatDateTime(v.submittedAt)}</TableCell>
                  <TableCell><StatusBadge value={v.priority} /></TableCell>
                  <TableCell><StatusBadge value={v.status} /></TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">{v.providerResult}</TableCell>
                  <TableCell className="space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setSelected({ id: v.id, next: "verified" })}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelected({ id: v.id, next: "rejected" })}>Reject</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelected({ id: v.id, next: "resubmission" })}>Resubmit</Button>
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
        title="Confirm verification decision"
        description="Verification decisions are audited. Identity documents are only shown to authorized officers when legally required."
        onConfirm={async (reason) => {
          if (!selected) return;
          setItems((prev) => prev.map((i) => i.id === selected.id ? { ...i, status: selected.next, notes: reason } : i));
          toast.success(`Verification marked as ${selected.next}`);
        }}
      />
    </div>
  );
}
