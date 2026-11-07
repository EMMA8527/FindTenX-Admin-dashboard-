"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

type IntegrationStatus = {
  checkedAt: string;
  platformDataMode: string;
  access: {
    ok: boolean;
    authority: string;
    production?: boolean;
    message: string;
    code?: string;
  };
  core: {
    configured: boolean;
    reachable: boolean;
    authenticated: boolean | null;
    baseUrl: string | null;
    message: string;
    checkedPaths: Array<{ path: string; status: number; ok: boolean; latencyMs: number; error?: string }>;
  };
  data: {
    configured: boolean;
    reachable: boolean;
    baseUrl: string | null;
    message: string;
  };
  repositories: Record<string, { listed: boolean; clone: string }>;
  providers: Record<string, { enabled: boolean; reason: string }>;
};

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/integrations");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load integration status");
      setStatus(json);
    } catch (e) {
      setError((e as Error).message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & Integrations"
        description="Live connectivity status for FindTenX Core, FindTenX Data, Mobile, and external providers."
        actions={
          <Button onClick={() => void load()} disabled={loading}>
            Re-probe
          </Button>
        }
      />

      {loading ? <div className="glass-card p-6 text-sm text-muted-foreground">Probing backends…</div> : null}
      {error ? <EmptyState title="Unable to probe" description={error} /> : null}

      {status ? (
        <div className="space-y-4">
          <div className="glass-card space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">Platform data authority</h2>
              <StatusBadge value={status.access.ok ? status.access.authority : status.access.code || "unavailable"} />
            </div>
            <p className="text-sm text-muted-foreground">{status.access.message}</p>
            <p className="text-xs text-muted-foreground">
              Mode: <span className="text-foreground">{status.platformDataMode}</span> · Checked{" "}
              {new Date(status.checkedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} (Africa/Lagos)
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card space-y-3 p-5">
              <h3 className="font-semibold">FindTenX Core</h3>
              <p className="text-sm text-muted-foreground">{status.core.message}</p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>Configured</div>
                <div className="text-right">{status.core.configured ? "Yes" : "No"}</div>
                <div>Reachable</div>
                <div className="text-right">{status.core.reachable ? "Yes" : "No"}</div>
                <div>Base URL</div>
                <div className="truncate text-right text-muted-foreground">{status.core.baseUrl || "—"}</div>
              </dl>
              {status.core.checkedPaths.length ? (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {status.core.checkedPaths.map((p) => (
                    <li key={p.path} className="flex justify-between gap-3">
                      <span>{p.path}</span>
                      <span>
                        {p.status || "—"} · {p.latencyMs}ms {p.ok ? "✓" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="glass-card space-y-3 p-5">
              <h3 className="font-semibold">FindTenX Data</h3>
              <p className="text-sm text-muted-foreground">{status.data.message}</p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>Configured</div>
                <div className="text-right">{status.data.configured ? "Yes" : "No"}</div>
                <div>Reachable</div>
                <div className="text-right">{status.data.reachable ? "Yes" : "No"}</div>
                <div>Base URL</div>
                <div className="truncate text-right text-muted-foreground">{status.data.baseUrl || "—"}</div>
              </dl>
            </div>
          </div>

          <div className="glass-card space-y-3 p-5">
            <h3 className="font-semibold">Repository access (this agent)</h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(status.repositories).map(([name, info]) => (
                <li key={name} className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0">
                  <span>{name}</span>
                  <span className="text-muted-foreground">
                    listed={String(info.listed)} · clone={info.clone}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card space-y-3 p-5">
            <h3 className="font-semibold">App Secrets (Admin only)</h3>
            <p className="text-xs text-muted-foreground">
              Enter Cursor Secrets only when the source system is ready. Full guide:{" "}
              <code className="text-foreground">docs/APP_SECRETS_GUIDE.md</code>
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">ADMIN_SESSION_SECRET</span> — Admin JWT signing
                (Admin auth)
              </li>
              <li>
                <span className="font-medium text-foreground">ADMIN_PASSWORD_HASH</span> — bcrypt Admin password
                (Admin auth)
              </li>
              <li>
                <span className="font-medium text-foreground">ADMIN_MFA_SECRET</span> — TOTP MFA (Admin auth)
              </li>
              <li>
                <span className="font-medium text-foreground">FINDTENX_API_URL</span> — Core base URL after{" "}
                <code className="text-foreground">api.findtenx.app</code> is live (FindTenX-Core)
              </li>
              <li>
                <span className="font-medium text-foreground">FINDTENX_ADMIN_API_KEY</span> — same as Core{" "}
                <code className="text-foreground">ADMIN_API_KEY</code> (FindTenX-Core)
              </li>
              <li>
                <span className="font-medium text-foreground">FINDTENX_DATA_API_URL</span> — leave empty until
                Data is deployed (FindTenX-Data)
              </li>
              <li>
                <span className="font-medium text-foreground">FINDTENX_DATA_API_KEY</span> — leave empty until
                Data is deployed (FindTenX-Data)
              </li>
            </ol>
            <p className="text-xs text-amber-100/90">
              Sample / local_dev data is never production. Production login to platform ops waits on a verified
              Core connection.
            </p>
          </div>

          <div className="glass-card space-y-3 p-5">
            <h3 className="font-semibold">External providers</h3>
            <p className="text-xs text-muted-foreground">
              Live payment, email, SMS, push, and identity verification stay disabled until credentials are supplied and tested.
            </p>
            <ul className="space-y-2 text-sm">
              {Object.entries(status.providers).map(([name, info]) => (
                <li key={name} className="flex flex-col gap-1 border-b border-border/60 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="capitalize">{name}</span>
                  <span className="text-muted-foreground">
                    {info.enabled ? "Enabled" : "Disabled"} — {info.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
