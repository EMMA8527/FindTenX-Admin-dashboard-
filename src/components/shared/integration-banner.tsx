import Link from "next/link";
import { AlertTriangle, CheckCircle2, Link2Off } from "lucide-react";
import type { DataAuthority } from "@/lib/integrations/platform";
import { cn } from "@/lib/utils";

export function IntegrationBanner({
  authority,
  message,
  className,
}: {
  authority: DataAuthority | string;
  message: string;
  className?: string;
}) {
  const isCore = authority === "findtenx-core";
  const isLocal = authority === "admin_local_dev";
  const Icon = isCore ? CheckCircle2 : isLocal ? AlertTriangle : Link2Off;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        isCore && "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
        isLocal && "border-amber-500/30 bg-amber-500/10 text-amber-50",
        !isCore && !isLocal && "border-destructive/40 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">
            {isCore
              ? "Connected to FindTenX Core"
              : isLocal
                ? "Local development data (not production)"
                : "FindTenX Core required"}
          </p>
          <p className="mt-1 text-xs opacity-90">{message}</p>
        </div>
      </div>
      <Link
        href="/integrations"
        className="shrink-0 text-xs font-semibold underline-offset-4 hover:underline"
      >
        View integration status
      </Link>
    </div>
  );
}
