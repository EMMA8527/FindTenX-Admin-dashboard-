"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ModuleStatus } from "@/components/shared/module-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCatalog } from "@/hooks/use-catalog";
import type { PlatformUser } from "@/lib/types";

export default function ProfilesPage() {
  const { data, loading, error, authority, notice } = useCatalog<{ users: PlatformUser[] }>("profiles");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const users = data?.users ?? [];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const match =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      if (filter === "hidden") return match && u.profileHidden;
      if (filter === "incomplete") return match && u.completeness < 70;
      return match;
    });
  }, [users, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Management" description="Inspect profile completeness, media, and visibility controls." />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Profile directory authority"} />
        <div className="glass-card p-4 md:p-5">
          <ModuleToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={[
              { label: "All profiles", value: "all" },
              { label: "Hidden profiles", value: "hidden" },
              { label: "Incomplete profiles", value: "incomplete" },
            ]}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Completeness</TableHead>
                <TableHead>Hidden</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.fullName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.occupation}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.relationshipIntent}</TableCell>
                  <TableCell>{u.completeness}%</TableCell>
                  <TableCell>{u.profileHidden ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <StatusBadge value={u.accountStatus} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" render={<Link href={`/users/${u.id}`} />}>
                      Open
                    </Button>
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
