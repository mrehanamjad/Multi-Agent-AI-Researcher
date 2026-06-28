import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/format";
import type { ResearchStatus } from "@/types";

export function StatusBadge({
  status,
  className,
}: {
  status: ResearchStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta && meta.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta && meta.dot)} />
      {meta && meta.label}
    </span>
  );
}
