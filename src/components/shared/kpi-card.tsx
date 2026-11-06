import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  prefix = "",
  delay = 0,
}: {
  label: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  prefix?: string;
  delay?: number;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div
      className="glass-card group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-px brand-gradient opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">
            {prefix}
            {formatNumber(value)}
          </p>
          {typeof change === "number" ? (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {formatPercent(change)} vs previous period
            </div>
          ) : null}
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-brand-pink transition group-hover:scale-105">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
