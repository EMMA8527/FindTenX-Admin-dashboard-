import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center animate-fade-in">
      <div className="flex size-12 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-pink-500/20">
        <Inbox className="size-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="brand-gradient border-0 text-white">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
