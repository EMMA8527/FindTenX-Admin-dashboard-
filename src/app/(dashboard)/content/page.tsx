"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ModuleStatus } from "@/components/shared/module-status";
import { useCatalog } from "@/hooks/use-catalog";

export default function ContentPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    items: unknown[];
    reason?: string;
  }>("content");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Content"
        description="Landing and marketing content managed for FindTenX web surfaces."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
        empty={!loading && !error}
        emptyTitle="CMS not connected"
        emptyDescription={
          data?.reason ||
          "Website content management will bind to Core/CMS APIs once repository access is available."
        }
      >
        <div />
      </ModuleStatus>
    </div>
  );
}
