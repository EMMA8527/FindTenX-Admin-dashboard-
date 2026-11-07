import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { ReportRecord } from "@/lib/types";

export function MobileReportCard({
  report,
  onReview,
}: {
  report: ReportRecord;
  onReview: () => void;
}) {
  return (
    <article className="glass-card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{report.reportedName}</p>
          <p className="text-xs text-muted-foreground">Reported by {report.reporterName}</p>
        </div>
        <StatusBadge value={report.status} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge value={report.priority} />
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">{report.category}</span>
      </div>
      <p className="line-clamp-3 text-sm text-muted-foreground">{report.explanation}</p>
      <p className="text-xs text-muted-foreground">{formatDateTime(report.submittedAt)}</p>
      <Button className="h-11 w-full rounded-xl" variant="outline" onClick={onReview}>
        Review case
      </Button>
    </article>
  );
}
