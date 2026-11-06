"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { users as seedUsers } from "@/lib/data/seed";
import { formatDate, maskPhone } from "@/lib/format";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return seedUsers.filter((user) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        user.id.toLowerCase().includes(q) ||
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q) ||
        user.country.toLowerCase().includes(q) ||
        user.city.toLowerCase().includes(q);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && user.accountStatus === "active") ||
        (filter === "inactive" && user.accountStatus === "inactive") ||
        (filter === "verified" && user.verificationStatus === "verified") ||
        (filter === "unverified" && user.verificationStatus !== "verified") ||
        (filter === "premium" && user.membership === "premium") ||
        (filter === "free" && user.membership === "free") ||
        (filter === "suspended" && user.accountStatus === "suspended") ||
        (filter === "banned" && user.accountStatus === "banned") ||
        (filter === "pending_deletion" && user.accountStatus === "pending_deletion");

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Search, filter, and manage registered FindTenX accounts."
      />
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

        {filtered.length === 0 ? (
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
                {filtered.map((user) => (
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
