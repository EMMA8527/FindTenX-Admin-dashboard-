"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ModuleStatus } from "@/components/shared/module-status";
import { useCatalog } from "@/hooks/use-catalog";

export default function CommunicationsPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    email: unknown[];
    sms: unknown[];
    push: unknown[];
    reason?: string;
  }>("communications");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email / SMS / Push"
        description="Operational messaging channels for FindTenX. Live providers stay off until credentials are tested."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
        empty={!loading && !error}
        emptyTitle="Providers not activated"
        emptyDescription={
          data?.reason ||
          "Email, SMS, and push adapters are intentionally disabled. Configure provider secrets and Core templates before enabling sends."
        }
      >
        <div />
      </ModuleStatus>
    </div>
  );
}
