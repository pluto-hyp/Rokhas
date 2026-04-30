import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const iconMask = {
  WebkitMask: "url('/rokhas.svg') center / contain no-repeat",
  mask: "url('/rokhas.svg') center / contain no-repeat",
} satisfies CSSProperties;

export function AppIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-5 shrink-0 bg-current", className)}
      style={iconMask}
    />
  );
}
