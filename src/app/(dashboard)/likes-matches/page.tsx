"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, Handshake } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { KpiCard } from "@/components/shared/kpi-card";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { ModuleStatus } from "@/components/shared/module-status";
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
import { useCatalog } from "@/hooks/use-catalog";
import { formatDateTime } from "@/lib/format";
import type { LikeRecord, MatchRecord } from "@/lib/types";

export default function LikesMatchesPage() {
  const matchesCatalog = useCatalog<{ items: MatchRecord[] }>("matches");
  const likesCatalog = useCatalog<{ items: LikeRecord[] }>("likes");
  const [search, setSearch] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const loadedMatches = matchesCatalog.data?.items ?? matches;
  const likes = likesCatalog.data?.items ?? [];

  useEffect(() => {
    if (matchesCatalog.data?.items) setMatches(matchesCatalog.data.items);
  }, [matchesCatalog.data]);

  const filteredMatches = useMemo(
    () =>
      loadedMatches.filter((m) => {
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
    [loadedMatches, search],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Likes & Matches" description="Monitor engagement events and moderate match graph integrity." />
      <ModuleStatus
        loading={matchesCatalog.loading || likesCatalog.loading}
        error={matchesCatalog.error || likesCatalog.error}
        authority={matchesCatalog.authority}
        notice={matchesCatalog.notice}
      >
        <IntegrationBanner
          authority={matchesCatalog.authority}
          message={matchesCatalog.notice || "Engagement data authority"}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard label="Total likes" value={likes.length} icon={Heart} />
          <KpiCard label="Total matches" value={loadedMatches.length} icon={Handshake} />
        </div>
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>
          <TabsContent value="matches" className="glass-card p-4 md:p-5">
            <ModuleToolbar search={search} onSearchChange={setSearch} />
            {filteredMatches.length === 0 ? (
              <EmptyState title="No matches found." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>User A</TableHead>
                    <TableHead>User B</TableHead>
                    <TableHead>Matched</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={m.userAAvatar} />
                            <AvatarFallback>{m.userAName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {m.userAName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={m.userBAvatar} />
                            <AvatarFallback>{m.userBName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {m.userBName}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(m.matchedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge value={m.status} />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setRemoveId(m.id)}>
                          Unmatch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="likes" className="glass-card p-4 md:p-5">
            {likes.length === 0 ? (
              <EmptyState title="No likes found." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {likes.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.fromUserName}</TableCell>
                      <TableCell>{l.toUserName}</TableCell>
                      <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge value={l.membership} />
                      </TableCell>
                      <TableCell>{l.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
        <ConfirmActionDialog
          open={Boolean(removeId)}
          onOpenChange={(o) => !o && setRemoveId(null)}
          title="Remove match"
          description="Match removals against Core require Core write APIs. Local-dev updates are non-production."
          onConfirm={async () => {
            setMatches((prev) => prev.filter((m) => m.id !== removeId));
            toast.success("Match removed (local-dev view)");
          }}
        />
      </ModuleStatus>
    </div>
  );
}
