"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { admins } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/format";
import { formatRole } from "@/lib/roles";
import { permissionsFor } from "@/lib/permissions";

export default function StaffPage() {
  const [staff] = useState(admins);
  const [selected, setSelected] = useState(admins[0].id);
  const current = staff.find((s) => s.id === selected)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Staff & Permissions"
        description="Create administrator accounts, assign roles, and review granular permissions."
        actions={
          <Button
            className="brand-gradient border-0 text-white"
            onClick={() =>
              toast.message("Invite flow ready", {
                description: "Super Admins can provision staff without self-elevation.",
              })
            }
          >
            Invite administrator
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="glass-card overflow-hidden xl:col-span-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((admin) => (
                <TableRow
                  key={admin.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(admin.id)}
                >
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
                  <TableCell>{admin.mfaEnabled ? "Enabled" : "Optional"}</TableCell>
                  <TableCell>{formatDateTime(admin.lastLoginAt)}</TableCell>
                  <TableCell>
                    <StatusBadge value={admin.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="glass-card p-5 xl:col-span-2">
          <h2 className="text-base font-semibold">{current.name}</h2>
          <p className="text-sm text-muted-foreground">{formatRole(current.role)}</p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Permissions
          </p>
          <div className="mt-3 flex max-h-80 flex-wrap gap-2 overflow-y-auto">
            {permissionsFor(current.role).map((p) => (
              <span key={p} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Staff cannot grant themselves higher permissions. Role changes are audited.
          </p>
        </div>
      </div>
    </div>
  );
}
