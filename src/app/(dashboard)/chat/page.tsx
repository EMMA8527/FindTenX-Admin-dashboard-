"use client";

import { useMemo, useState } from "react";
import { MessageSquare, AlertTriangle, Wifi } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
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
import { conversations, overviewMetrics } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";

export default function ChatPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [investigateId, setInvestigateId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      conversations.filter((c) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          c.id.includes(q) ||
          c.participants.some((p) => p.includes(q)) ||
          c.participantNames.some((n) => n.toLowerCase().includes(q));
        const f =
          filter === "all" ||
          (filter === "reported" && c.reported) ||
          (filter === "errors" && c.deliveryErrors > 0) ||
          (filter === "restricted" && c.status === "restricted");
        return match && f;
      }),
    [search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Management"
        description="Operational messaging health, delivery errors, and restricted safety investigations."
      />
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Private conversations remain private. Message content access is limited to designated safety
        personnel for valid reports, legal obligations, or security investigations — and every access
        is audited. FindTenX does not support voice, video, audio calls, Stories, or Status updates.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total conversations" value={overviewMetrics.totalConversations} icon={MessageSquare} />
        <KpiCard label="Messages today" value={184420} icon={MessageSquare} />
        <KpiCard label="Reported conversations" value={conversations.filter((c) => c.reported).length} icon={AlertTriangle} />
        <KpiCard label="Presence health" value={99} prefix="" icon={Wifi} />
      </div>
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by conversation ID or user ID..."
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All conversations", value: "all" },
            { label: "Reported", value: "reported" },
            { label: "Delivery errors", value: "errors" },
            { label: "Restricted", value: "restricted" },
          ]}
        />
        {filtered.length === 0 ? (
          <EmptyState title="No conversations match this operational filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conversation ID</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead>Delivery errors</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>{c.participantNames.join(" · ")}</TableCell>
                  <TableCell>{c.messageCount}</TableCell>
                  <TableCell>{formatDateTime(c.lastMessageAt)}</TableCell>
                  <TableCell>{c.deliveryErrors}</TableCell>
                  <TableCell>{c.reported ? <StatusBadge value="escalated" /> : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={c.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setInvestigateId(c.id)}>
                      Investigate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <ConfirmActionDialog
        open={Boolean(investigateId)}
        onOpenChange={(o) => !o && setInvestigateId(null)}
        title="Request message evidence access"
        description="Explain the safety, legal, or security reason for accessing private message content. This creates an audit record."
        confirmLabel="Log access request"
        onConfirm={async (reason) => {
          toast.success("Access request logged", {
            description: `${investigateId}: ${reason}`,
          });
        }}
      />
    </div>
  );
}
