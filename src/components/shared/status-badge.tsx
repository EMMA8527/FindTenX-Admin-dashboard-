import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

const toneMap: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  verified: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  successful: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  resolved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  sent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  premium: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  urgent: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/15 text-red-500 border-red-500/20",
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  new: "bg-sky-500/15 text-sky-500 border-sky-500/20",
  open: "bg-sky-500/15 text-sky-500 border-sky-500/20",
  under_review: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  in_progress: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  escalated: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20",
  action_required: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  suspended: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  banned: "bg-red-500/15 text-red-500 border-red-500/20",
  rejected: "bg-red-500/15 text-red-500 border-red-500/20",
  failed: "bg-red-500/15 text-red-500 border-red-500/20",
  failure: "bg-red-500/15 text-red-500 border-red-500/20",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  free: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  draft: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  expired: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  cancelled: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  closed: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  ended: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  resubmission: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  unverified: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  waiting_for_user: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  scheduled: "bg-sky-500/15 text-sky-500 border-sky-500/20",
  success: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  denied: "bg-red-500/15 text-red-500 border-red-500/20",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const key = value.toLowerCase().replaceAll(" ", "_");
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 font-medium capitalize",
        toneMap[key] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {titleCase(value)}
    </Badge>
  );
}
