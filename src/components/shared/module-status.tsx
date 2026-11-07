import { IntegrationBanner } from "@/components/shared/integration-banner";
import { EmptyState } from "@/components/shared/empty-state";

export function ModuleStatus({
  loading,
  error,
  authority,
  notice,
  empty,
  emptyTitle,
  emptyDescription,
  children,
}: {
  loading: boolean;
  error?: string;
  authority: string;
  notice?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {notice || authority !== "findtenx-core" ? (
        <IntegrationBanner authority={authority} message={notice || error || "Checking data authority…"} />
      ) : null}
      {loading ? (
        <div className="glass-card animate-pulse p-8 text-sm text-muted-foreground">Loading module…</div>
      ) : error ? (
        <EmptyState
          title="Module unavailable"
          description={error}
        />
      ) : empty ? (
        <EmptyState
          title={emptyTitle || "No records"}
          description={emptyDescription || "No data is available for this module yet."}
        />
      ) : (
        children
      )}
    </div>
  );
}
