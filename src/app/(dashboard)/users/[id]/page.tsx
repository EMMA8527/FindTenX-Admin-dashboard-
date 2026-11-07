"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, maskPhone } from "@/lib/format";
import type { AccountStatus, PlatformUser } from "@/lib/types";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<AccountStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${params.id}`);
      const data = await res.json();
      if (!cancelled) {
        setUser(res.ok ? data.user : null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function runAction(reason: string) {
    if (!action || !user) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Action failed");
      return;
    }
    setUser(data.user);
    toast.success(`Account updated to ${action}`);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading user from database…</p>;
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="User not found" description="This account does not exist in the database." />
        <Button render={<Link href="/users" />}>Back to users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        description={`User ID ${user.id}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/users" />}>
              Back
            </Button>
            <Button variant="outline" onClick={() => setAction("suspended")}>
              Suspend
            </Button>
            <Button variant="outline" onClick={() => setAction("active")}>
              Reinstate
            </Button>
            <Button variant="destructive" onClick={() => setAction("banned")}>
              Permanently ban
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card space-y-4 p-5 xl:col-span-1">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <StatusBadge value={user.accountStatus} />
                <StatusBadge value={user.verificationStatus} />
                <StatusBadge value={user.membership} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Likes sent" value={user.likesSent} />
            <Stat label="Likes received" value={user.likesReceived} />
            <Stat label="Matches" value={user.matches} />
            <Stat label="Conversations" value={user.conversations} />
          </div>
        </div>

        <div className="glass-card space-y-6 p-5 xl:col-span-2">
          <section>
            <h2 className="mb-3 text-base font-semibold">Personal Information</h2>
            <Grid
              items={[
                ["Full name", user.fullName],
                ["Email", user.email],
                ["Phone", maskPhone(user.phone)],
                ["Country", user.country],
                ["City", user.city],
                ["Registered", formatDate(user.registeredAt)],
                ["Last active", formatDateTime(user.lastActiveAt)],
              ]}
            />
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold">Dating Profile</h2>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
            <Grid
              items={[
                ["Occupation", user.occupation],
                ["Education", user.education],
                ["Relationship intentions", user.relationshipIntent],
                ["Profile completeness", `${user.completeness}%`],
              ]}
            />
          </section>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(action)}
        onOpenChange={(open) => !open && setAction(null)}
        title={`Confirm ${action?.replaceAll("_", " ")}`}
        description="Sensitive administrative actions require a recorded reason and are written to the audit log database."
        confirmLabel="Confirm action"
        onConfirm={runAction}
      />
    </div>
  );
}

function Grid({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium capitalize">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
