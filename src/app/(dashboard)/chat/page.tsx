"use client";

import { useMemo, useState } from "react";
import { MessageSquare, AlertTriangle, Wifi } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { ModuleStatus } from "@/components/shared/module-status";
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
import { useCatalog } from "@/hooks/use-catalog";
import { formatDateTime } from "@/lib/format";
import type { ConversationRecord } from "@/lib/types";

export default function ChatPage() {
  const { data, loading, error, authority, notice } = useCatalog<{ items: ConversationRecord[] }>(
    "conversations",
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [investigateId, setInvestigateId] = useState<string | null>(null);

  const conversations = data?.items ?? [];
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
          c.status === filter;
        return match && f;
      }),
    [conversations, search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Management"
        description="Inspect conversation health, delivery errors, and reported threads. No message content is shown beyond operational metadata."
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Chat ops authority"} />
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Conversations" value={conversations.length} icon={MessageSquare} />
          <KpiCard
            label="Reported"
            value={conversations.filter((c) => c.reported).length}
            icon={AlertTriangle}
          />
          <KpiCard
            label="Delivery errors"
            value={conversations.reduce((sum, c) => sum + c.deliveryErrors, 0)}
            icon={Wifi}
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
              { label: "Reported", value: "reported" },
              { label: "Delivery errors", value: "errors" },
              { label: "Active", value: "active" },
              { label: "Restricted", value: "restricted" },
            ]}
          />
          {filtered.length === 0 ? (
            <EmptyState title="No conversations for this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thread</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>{c.participantNames.join(", ")}</TableCell>
                    <TableCell>{c.messageCount}</TableCell>
                    <TableCell>{formatDateTime(c.lastMessageAt)}</TableCell>
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
          title="Open investigation"
          description="Investigations against production chat require FindTenX Core. This records an admin-local intent only."
          onConfirm={async () => {
            toast.success(`Investigation flagged for ${investigateId}`);
          }}
        />
      </ModuleStatus>
    </div>
  );
}
