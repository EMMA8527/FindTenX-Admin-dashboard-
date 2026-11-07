import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { PlatformUser } from "@/lib/types";

export function MobileUserCard({ user }: { user: PlatformUser }) {
  const handle = `@${user.fullName.toLowerCase().replace(/\s+/g, "_").slice(0, 18)}`;

  return (
    <article className="glass-card space-y-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={user.avatar} alt={user.fullName} />
          <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{handle}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-xl"
              render={<Link href={`/users/${user.id}`} />}
              aria-label={`Open ${user.fullName}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge value={user.verificationStatus} />
            <StatusBadge value={user.membership === "premium" ? "premium" : "free"} />
            <StatusBadge value={user.accountStatus} />
          </div>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <p className="truncate text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">Joined {formatDate(user.registeredAt)}</p>
      </div>
      <Button className="h-11 w-full rounded-xl" variant="outline" render={<Link href={`/users/${user.id}`} />}>
        View profile
      </Button>
    </article>
  );
}
