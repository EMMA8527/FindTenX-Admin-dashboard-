import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  showText = true,
  collapsed = false,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? 56 : size === "sm" ? 32 : 40;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-black shadow-[0_0_24px_rgba(255,77,122,0.28)] ring-1 ring-white/10",
          size === "lg" ? "size-14" : size === "sm" ? "size-8" : "size-10",
        )}
      >
        <Image
          src="/brand/logo.jpg"
          alt="FindTenX"
          width={dim}
          height={dim}
          priority
          className="size-full object-cover"
        />
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
