"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleToolbar } from "@/components/shared/module-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, maskPhone } from "@/lib/format";
import type { PlatformUser } from "@/lib/types";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authority, setAuthority] = useState("unavailable");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (filter === "active" || filter === "inactive" || filter === "suspended" || filter === "banned" || filter === "pending_deletion") {
          params.set("status", filter);
        }
        if (filter === "verified") params.set("verification", "verified");
        if (filter === "unverified") params.set("verification", "unverified");
        if (filter === "premium" || filter === "free") params.set("membership", filter);
        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthority(data.authority || "unavailable");
          setNotice(data.error || "");
          throw new Error(data.error || "Failed to load users");
        }
        setUsers(data.users);
        setTotal(data.total);
        setAuthority(data.authority || "unknown");
        setNotice(data.notice || "");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search, filter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        description={`Search and manage registered FindTenX accounts (${total} loaded).`}
      />
      <IntegrationBanner authority={authority} message={notice || error || "User directory authority"} />
      <div className="glass-card p-4 md:p-5">
        <ModuleToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by ID, name, email, phone, country, city..."
          filter={filter}
          onFilterChange={setFilter}
          filterOptions={[
            { label: "All users", value: "all" },
            { label: "Active users", value: "active" },
            { label: "Inactive users", value: "inactive" },
            { label: "Verified users", value: "verified" },
            { label: "Unverified users", value: "unverified" },
            { label: "Premium users", value: "premium" },
            { label: "Free users", value: "free" },
            { label: "Suspended users", value: "suspended" },
            { label: "Banned users", value: "banned" },
            { label: "Pending deletion", value: "pending_deletion" },
          ]}
        />

        {error ? (
          <EmptyState title="Unable to load users" description={error} />
        ) : loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading users from database…</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users found matching your search." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">Age {user.age}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell>
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{maskPhone(user.phone)}</p>
                    </TableCell>
                    <TableCell>
                      {user.city}, {user.country}
                    </TableCell>
                    <TableCell>{formatDate(user.registeredAt)}</TableCell>
                    <TableCell>
                      <StatusBadge value={user.verificationStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={user.membership} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={user.accountStatus} />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" render={<Link href={`/users/${user.id}`} />}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
