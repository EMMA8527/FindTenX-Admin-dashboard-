"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ModuleStatus } from "@/components/shared/module-status";
import { useCatalog } from "@/hooks/use-catalog";

export default function FraudPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    items: unknown[];
    reason?: string;
  }>("fraud");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud & Security Ops"
        description="Suspicious account signals, device anomalies, and escalation queues."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
        empty={!loading && !error}
        emptyTitle="Fraud pipeline not connected"
        emptyDescription={
          data?.reason ||
          "Fraud monitoring requires FindTenX Core event streams and FindTenX Data analytics. No fabricated alerts are shown."
        }
      >
        <div />
      </ModuleStatus>
    </div>
  );
}
