"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users } from "@/lib/data/seed";
import { toast } from "sonner";

export default function ProfilesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const match = !q || u.fullName.toLowerCase().includes(q) || u.id.includes(q) || u.bio.toLowerCase().includes(q);
    const f = filter === "all" || (filter === "hidden" && u.profileHidden) || (filter === "flagged" && u.reportsReceived > 0) || (filter === "incomplete" && u.completeness < 70);
    return match && f;
  }), [search, filter]);

  return (
    <div>
      <PageHeader title="Profile Management" description="Review public dating profiles, photos, biographies and completeness." />
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search profiles..." filter={filter} onFilterChange={setFilter} filterOptions={[
          { label: "All profiles", value: "all" },
          { label: "Hidden from discovery", value: "hidden" },
          { label: "Flagged content", value: "flagged" },
          { label: "Incomplete profiles", value: "incomplete" },
        ]} />
        {filtered.length === 0 ? <EmptyState title="No profiles found matching your search." /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead>Completeness</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={u.avatar} /><AvatarFallback>{u.fullName.slice(0,2)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.relationshipIntent}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-muted-foreground">{u.bio}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{u.interests.join(", ")}</TableCell>
                  <TableCell>{u.completeness}%</TableCell>
                  <TableCell><StatusBadge value={u.profileHidden ? "suspended" : "active"} /></TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.message("Profile correction requested", { description: u.fullName })}>Request correction</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(u.profileHidden ? "Visibility restored" : "Hidden from discovery")}>{u.profileHidden ? "Restore" : "Hide"}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
