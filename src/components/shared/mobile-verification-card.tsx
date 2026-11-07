import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { VerificationSubmission } from "@/lib/types";

export function MobileVerificationCard({
  item,
  onApprove,
  onReject,
  onResubmit,
}: {
  item: VerificationSubmission;
  onApprove: () => void;
  onReject: () => void;
  onResubmit: () => void;
}) {
  const handle = `@${item.userName.toLowerCase().replace(/\s+/g, "_").slice(0, 18)}`;

  return (
    <article className="glass-card space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={item.userAvatar} alt={item.userName} />
          <AvatarFallback>{item.userName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{item.userName}</p>
          <p className="truncate text-xs text-muted-foreground">{handle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.submittedAt)}</p>
        </div>
        <StatusBadge value={item.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-pink/15 px-3 py-1 text-xs font-medium text-brand-pink capitalize">
          {item.type.replaceAll("_", " ")}
        </span>
        <StatusBadge value={item.priority} />
      </div>

      {item.providerResult ? (
        <p className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          {item.providerResult}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-brand-pink/40 text-brand-pink"
          onClick={onReject}
        >
          Reject
        </Button>
        <Button className="h-11 rounded-xl brand-gradient border-0 text-white" onClick={onApprove}>
          Approve
        </Button>
      </div>
      <Button variant="ghost" className="h-11 w-full rounded-xl" onClick={onResubmit}>
        Request resubmission
      </Button>
    </article>
  );
}
