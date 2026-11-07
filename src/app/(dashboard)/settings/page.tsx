"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IntegrationBanner } from "@/components/shared/integration-banner";
import { ModuleStatus } from "@/components/shared/module-status";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalog } from "@/hooks/use-catalog";
import type { PlatformSettings } from "@/lib/types";

const emptySettings = (): PlatformSettings => ({
  platformName: "FindTenX",
  supportEmail: "",
  supportPhone: "",
  defaultCurrency: "USD",
  defaultLanguage: "en",
  timezone: "UTC",
  minAge: 18,
  supportedCountries: [],
  maxDiscoveryAge: 80,
  maxDiscoveryDistanceKm: 100,
  imageAttachmentLimitMb: 10,
  messageRetentionDays: 365,
});

export default function SettingsPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    settings: PlatformSettings;
  }>("settings");
  const [settings, setSettings] = useState<PlatformSettings>(emptySettings());

  useEffect(() => {
    if (data?.settings) setSettings(data.settings);
  }, [data]);

  function save() {
    if (authority !== "admin_local_dev") {
      toast.message("Platform settings writes require FindTenX Core configuration APIs.");
      return;
    }
    toast.success("Local settings draft updated", {
      description: "Not persisted to FindTenX Core. local_dev only.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Configure general, user, discovery, chat, notification, and payment settings."
        actions={
          <Button className="brand-gradient border-0 text-white" onClick={save}>
            Save settings
          </Button>
        }
      />
      <ModuleStatus loading={loading} error={error} authority={authority} notice={notice}>
        <IntegrationBanner authority={authority} message={notice || "Settings authority"} />
        <div className="glass-card p-5">
          <Tabs defaultValue="general">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="grid gap-4 sm:grid-cols-2">
              <Field label="Platform name">
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
              </Field>
              <Field label="Support email">
                <Input
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </Field>
              <Field label="Support phone">
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </Field>
              <Field label="Default currency">
                <Input
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                />
              </Field>
              <Field label="Default language">
                <Input
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                />
              </Field>
              <Field label="Timezone">
                <Input
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                />
              </Field>
            </TabsContent>

            <TabsContent value="users" className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum permitted age">
                <Input
                  type="number"
                  value={settings.minAge}
                  onChange={(e) => setSettings({ ...settings, minAge: Number(e.target.value) })}
                />
              </Field>
              <Field label="Supported countries">
                <Input value={settings.supportedCountries.join(", ")} readOnly />
              </Field>
            </TabsContent>

            <TabsContent value="discovery" className="grid gap-4 sm:grid-cols-2">
              <Field label="Max discovery age">
                <Input
                  type="number"
                  value={settings.maxDiscoveryAge}
                  onChange={(e) =>
                    setSettings({ ...settings, maxDiscoveryAge: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Default discovery radius (km)">
                <Input
                  type="number"
                  value={settings.maxDiscoveryDistanceKm}
                  onChange={(e) =>
                    setSettings({ ...settings, maxDiscoveryDistanceKm: Number(e.target.value) })
                  }
                />
              </Field>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Messaging permissions, image attachment limits, retention, and abuse prevention are
                configured here. Voice/video calling and Stories/Status settings are intentionally not
                available.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Image attachment limit (MB)">
                  <Input
                    type="number"
                    value={settings.imageAttachmentLimitMb}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        imageAttachmentLimitMb: Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Message retention (days)">
                  <Input
                    type="number"
                    value={settings.messageRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        messageRetentionDays: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-3 text-sm text-muted-foreground">
              <p>
                Payment providers, webhook secrets, and refund policies stay disabled until provider
                credentials and FindTenX Core payment APIs are configured. This screen does not claim
                live provider connections.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Apple", "Google Play", "Stripe"].map((provider) => (
                  <div key={provider} className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="font-medium text-foreground">{provider}</p>
                    <p className="text-xs">Disabled · awaiting credentials</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ModuleStatus>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
