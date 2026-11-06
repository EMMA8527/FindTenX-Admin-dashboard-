import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  showText = true,
  collapsed = false,
}: {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl brand-gradient shadow-lg shadow-pink-500/20">
        <Image src="/brand/logo.svg" alt="FindTenX" width={28} height={28} priority />
      </div>
      {showText && !collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">
            FindTenX
          </p>
          <p className="truncate text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
      ) : null}
    </div>
  );
}
