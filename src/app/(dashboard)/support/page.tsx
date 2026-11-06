"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tickets as seedTickets } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";
import type { SupportTicket } from "@/lib/types";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(seedTickets);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const [selectedId, setSelectedId] = useState<string | null>(seedTickets[0]?.id ?? null);
  const [reply, setReply] = useState("");

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          t.id.includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
        const open = ["open", "in_progress", "waiting_for_user", "escalated"];
        const f =
          filter === "all" ||
          (filter === "open" && open.includes(t.status)) ||
          t.status === filter;
        return match && f;
      }),
    [tickets, search, filter],
  );

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  function sendReply() {
    if (!selected || !reply.trim()) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              status: "waiting_for_user",
              assignedAgent: t.assignedAgent ?? "Sofia Adeyemi",
              messages: [
                ...t.messages,
                {
                  id: `msg_${Date.now()}`,
                  author: "Sofia Adeyemi",
                  body: reply.trim(),
                  at: new Date().toISOString(),
                  internal: false,
                },
              ],
            }
          : t,
      ),
    );
    setReply("");
    toast.success("Reply sent to user");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Support"
        description="Manage support tickets submitted from the FindTenX mobile application."
      />
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="glass-card p-4 md:p-5 xl:col-span-3">
          <ModuleToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={[
              { label: "Open tickets", value: "open" },
              { label: "All tickets", value: "all" },
              { label: "In progress", value: "in_progress" },
              { label: "Escalated", value: "escalated" },
              { label: "Resolved", value: "resolved" },
              { label: "Closed", value: "closed" },
            ]}
          />
          {filtered.length === 0 ? (
            <EmptyState title="No open support tickets." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(t.id)}
                    data-state={selectedId === t.id ? "selected" : undefined}
                  >
                    <TableCell>
                      <p className="font-medium">{t.subject}</p>
                      <p className="font-mono text-xs text-muted-foreground">{t.id}</p>
                    </TableCell>
                    <TableCell>{t.userName}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <StatusBadge value={t.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={t.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="glass-card flex flex-col p-5 xl:col-span-2">
          {selected ? (
            <>
              <div className="mb-4">
                <h2 className="text-base font-semibold">{selected.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.userName} · {selected.id} · created {formatDateTime(selected.createdAt)}
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      m.internal ? "bg-amber-500/10" : "bg-secondary/70"
                    }`}
                  >
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{m.author}</span>
                      <span>{formatDateTime(m.at)}</span>
                    </div>
                    {m.body}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply to the user..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button className="brand-gradient border-0 text-white" onClick={sendReply}>
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTickets((prev) =>
                        prev.map((t) =>
                          t.id === selected.id ? { ...t, status: "resolved" } : t,
                        ),
                      );
                      toast.success("Ticket resolved");
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Select a ticket to view the conversation." />
          )}
        </div>
      </div>
    </div>
  );
}
