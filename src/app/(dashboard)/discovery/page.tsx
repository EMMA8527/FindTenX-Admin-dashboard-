"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { discoveryConfig } from "@/lib/data/seed";

export default function DiscoveryPage() {
  const [config, setConfig] = useState(discoveryConfig);
  const [excludeSuspended, setExcludeSuspended] = useState(true);
  const [excludeBlocked, setExcludeBlocked] = useState(true);

  function save() {
    toast.success("Discovery configuration saved", {
      description: "Matching parameter changes were written to the audit log.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discovery Management"
        description="Configure discovery eligibility, distance, age rules, and matching weights."
        actions={
          <Button className="brand-gradient border-0 text-white" onClick={save}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="glass-card space-y-4 p-5">
          <h2 className="text-base font-semibold">Discovery rules</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum age">
              <Input
                type="number"
                value={config.minAge}
                onChange={(e) => setConfig({ ...config, minAge: Number(e.target.value) })}
              />
            </Field>
            <Field label="Maximum discovery age">
              <Input
                type="number"
                value={config.maxAge}
                onChange={(e) => setConfig({ ...config, maxAge: Number(e.target.value) })}
              />
            </Field>
            <Field label="Maximum distance (km)">
              <Input
                type="number"
                value={config.maxDistanceKm}
                onChange={(e) =>
                  setConfig({ ...config, maxDistanceKm: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <div className="space-y-3">
            <Toggle
              label="Exclude suspended accounts"
              checked={excludeSuspended}
              onCheckedChange={setExcludeSuspended}
            />
            <Toggle
              label="Exclude blocked accounts"
              checked={excludeBlocked}
              onCheckedChange={setExcludeBlocked}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Supported interests</p>
            <div className="flex flex-wrap gap-2">
              {config.interests.map((item) => (
                <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Relationship intentions</p>
            <div className="flex flex-wrap gap-2">
              {config.relationshipIntentions.map((item) => (
                <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card space-y-4 p-5">
          <h2 className="text-base font-semibold">Matching configuration</h2>
          <p className="text-sm text-muted-foreground">
            Private user preferences are never exposed here — only platform weighting.
          </p>
          {Object.entries(config.matchingWeights).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-muted-foreground">{value}%</span>
              </div>
              <Input
                type="range"
                min={0}
                max={40}
                value={value}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    matchingWeights: {
                      ...config.matchingWeights,
                      [key]: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
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

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
