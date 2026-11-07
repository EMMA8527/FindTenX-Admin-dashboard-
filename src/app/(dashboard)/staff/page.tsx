"use client";

import { IntegrationBanner } from "@/components/shared/integration-banner";
import { ModuleStatus } from "@/components/shared/module-status";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCatalog } from "@/hooks/use-catalog";
import { formatRole } from "@/lib/roles";
import { formatDateTime } from "@/lib/format";
import type { AdminUser } from "@/lib/types";
import { toast } from "sonner";

export default function StaffPage() {
  const { data, loading, error, authority, notice } = useCatalog<{ items: AdminUser[] }>("admins");
  const admins = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Staff & Permissions"
        description="Role-based administrator directory. Production IAM remains FindTenX Core once connected."
        actions={
          <Button
            className="brand-gradient border-0 text-white"
            onClick={() => toast.message("Staff invites require Core IAM once credentials are available.")}
          >
            Invite admin
          </Button>
        }
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Staff directory authority"} />
        <div className="glass-card overflow-x-auto p-4 md:p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={admin.avatar} />
                        <AvatarFallback>{admin.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatRole(admin.role)}</TableCell>
                  <TableCell>{admin.mfaEnabled ? "Enabled" : "Disabled"}</TableCell>
                  <TableCell>
                    <StatusBadge value={admin.status} />
                  </TableCell>
                  <TableCell>{admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModuleStatus>
    </div>
  );
}
