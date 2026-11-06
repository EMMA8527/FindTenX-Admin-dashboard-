"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, Handshake } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { likes, matches as seedMatches, overviewMetrics } from "@/lib/data/seed";
import { formatDateTime, formatNumber } from "@/lib/format";

export default function LikesMatchesPage() {
  const [matches, setMatches] = useState(seedMatches);
  const [search, setSearch] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const filteredMatches = useMemo(
    () =>
      matches.filter((m) => {
        const q = search.toLowerCase();
        return (
          !q ||
          m.id.includes(q) ||
          m.userAId.includes(q) ||
          m.userBId.includes(q) ||
          m.userAName.toLowerCase().includes(q) ||
          m.userBName.toLowerCase().includes(q)
        );
      }),
    [matches, search],
  );

  const filteredLikes = useMemo(
    () =>
      likes.filter((l) => {
        const q = search.toLowerCase();
        return (
          !q ||
          l.fromUserName.toLowerCase().includes(q) ||
          l.toUserName.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q)
        );
      }),
    [search],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Likes & Matches"
        description="Monitor likes, mutual matches, conversion, and investigate abusive matching."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total likes" value={overviewMetrics.totalLikes} icon={Heart} change={22.7} />
        <KpiCard label="Total matches" value={overviewMetrics.totalMatches} icon={Handshake} change={19.5} />
        <KpiCard label="New matches today" value={1842} icon={Handshake} />
        <KpiCard label="Match conversion" value={17} prefix="" icon={Heart} />
      </div>

      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by match ID, user ID, or name..."
        />
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Match records</TabsTrigger>
            <TabsTrigger value="likes">Likes overview</TabsTrigger>
          </TabsList>
          <TabsContent value="matches" className="mt-4">
            {filteredMatches.length === 0 ? (
              <EmptyState title="No match records found." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match ID</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Matched at</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <UserChip name={m.userAName} avatar={m.userAAvatar} />
                          <span className="text-muted-foreground">×</span>
                          <UserChip name={m.userBName} avatar={m.userBAvatar} />
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(m.matchedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge value={m.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={m.status === "removed"}
                          onClick={() => setRemoveId(m.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="likes" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLikes.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.fromUserName}</TableCell>
                    <TableCell>{l.toUserName}</TableCell>
                    <TableCell>{l.country}</TableCell>
                    <TableCell>
                      <StatusBadge value={l.membership} />
                    </TableCell>
                    <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {formatNumber(filteredLikes.length)} sample like events from the operations
              store.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmActionDialog
        open={Boolean(removeId)}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title="Remove match"
        description="Matches cannot be manipulated without a recorded reason."
        confirmLabel="Remove match"
        onConfirm={async (reason) => {
          setMatches((prev) =>
            prev.map((m) => (m.id === removeId ? { ...m, status: "removed" } : m)),
          );
          toast.success("Match removed", { description: reason });
        }}
      />
    </div>
  );
}

function UserChip({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={avatar} />
        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{name}</span>
    </div>
  );
}
