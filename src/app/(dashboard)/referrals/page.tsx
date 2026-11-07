"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ModuleStatus } from "@/components/shared/module-status";
import { useCatalog } from "@/hooks/use-catalog";

export default function ReferralsPage() {
  const { data, loading, error, authority, notice } = useCatalog<{
    items: unknown[];
    incomplete?: boolean;
    reason?: string;
  }>("referrals");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals & Rewards"
        description="Monitor referral codes, reward balances, and payout eligibility."
      />
      <ModuleStatus
        loading={loading}
        error={error}
        authority={authority}
        notice={notice || data?.reason}
        empty={!loading && !error}
        emptyTitle="Awaiting FindTenX Core referral APIs"
        emptyDescription={
          data?.reason ||
          "Referral and rewards tables are owned by FindTenX Core. This admin module is ready and will bind once Core access is granted."
        }
      >
        <div />
      </ModuleStatus>
    </div>
  );
}
