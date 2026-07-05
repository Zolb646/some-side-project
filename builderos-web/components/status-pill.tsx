"use client";

import { useI18n } from "@/lib/i18n";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<TaskStatus, string> = {
  TODO: "border-stone-300 bg-stone-100 text-stone-700",
  IN_PROGRESS: "border-amber-300 bg-amber-50 text-amber-800",
  DONE: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const { statusLabel } = useI18n();

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium",
        statusClasses[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
