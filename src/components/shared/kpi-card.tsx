import Link from "next/link";
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
  href,
}: {
  label: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  prefix?: string;
  delay?: number;
  href?: string;
}) {
  const positive = (change ?? 0) >= 0;
  const body = (
    <>
      <div className="absolute inset-x-0 top-0 h-px brand-gradient opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {prefix}
            {formatNumber(value)}
          </p>
          {typeof change === "number" ? (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium sm:text-xs",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              <span className="truncate">{formatPercent(change)}</span>
            </div>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-brand-pink transition group-hover:scale-105 sm:size-11">
          <Icon className="size-5" />
        </div>
      </div>
    </>
  );

  const className =
    "glass-card group relative block overflow-hidden p-3.5 transition duration-300 hover:-translate-y-0.5 animate-fade-up sm:p-4";

  if (href) {
    return (
      <Link href={href} className={className} style={{ animationDelay: `${delay}ms` }}>
        {body}
      </Link>
    );
  }

  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {body}
    </div>
  );
}
