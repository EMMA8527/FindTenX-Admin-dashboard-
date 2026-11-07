"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { ModuleStatus } from "@/components/shared/module-status";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { NotificationCampaign } from "@/lib/types";

export default function NotificationsPage() {
  const { data, loading, error, authority, notice, setData } = useCatalog<{
    items: NotificationCampaign[];
    reason?: string;
    incomplete?: boolean;
  }>("notifications");
  const campaigns = data?.items ?? [];
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General announcements");
  const [audience, setAudience] = useState("All users");
  const [channel, setChannel] = useState<"in_app" | "push" | "email">("in_app");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (authority !== "admin_local_dev") {
      toast.message("Scheduling requires FindTenX Core communications once credentials are available.");
      return;
    }
    const item: NotificationCampaign = {
      id: `ntf_${Date.now()}`,
      title,
      message,
      category,
      audience,
      channel,
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
      sentAt: null,
      sent: 0,
      delivered: 0,
      failed: 0,
      read: 0,
    };
    setData((prev) =>
      prev
        ? { ...prev, items: [item, ...(prev.items || [])] }
        : { items: [item] },
    );
    setTitle("");
    setMessage("");
    toast.success("Notification queued locally (local_dev only)");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Centre"
        description="Compose announcements and monitor delivery across in-app, push, and email."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
      >
        <IntegrationBanner authority={authority} message={notice || data?.reason || "Notifications authority"} />
        <div className="grid gap-4 xl:grid-cols-5">
          <form onSubmit={onSubmit} className="glass-card space-y-4 p-5 xl:col-span-2">
            <h2 className="text-base font-semibold">Notification composer</h2>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(String(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "General announcements",
                    "New feature announcements",
                    "Account notifications",
                    "Verification notifications",
                    "Subscription notifications",
                    "Promotional announcements",
                    "Security notifications",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(String(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "All users",
                    "Premium users",
                    "Free users",
                    "Verified users",
                    "Unverified users",
                    "Newly registered users",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(String(v ?? "in_app") as typeof channel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-app</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full brand-gradient border-0 text-white">
              Schedule for approval
            </Button>
          </form>

          <div className="glass-card p-4 md:p-5 xl:col-span-3">
            <h2 className="mb-4 text-base font-semibold">Campaign history</h2>
            {campaigns.length === 0 ? (
              <EmptyState
                title="No notification campaigns"
                description={
                  data?.reason ||
                  "Campaign delivery metrics will appear once FindTenX Core communications are connected."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.category}</p>
                      </TableCell>
                      <TableCell>{c.audience}</TableCell>
                      <TableCell className="capitalize">{c.channel.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.sent
                          ? `${c.delivered}/${c.sent} delivered · ${c.read} read`
                          : c.scheduledAt
                            ? `Scheduled ${formatDateTime(c.scheduledAt)}`
                            : "Draft"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </ModuleStatus>
    </div>
  );
}
