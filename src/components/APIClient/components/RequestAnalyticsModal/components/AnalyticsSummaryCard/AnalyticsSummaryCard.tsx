import { cn } from "@/lib/utils";

import type { AnalyticsSummaryCardProps } from "./AnalyticsSummaryCard.types";

export function AnalyticsSummaryCard(
  props: AnalyticsSummaryCardProps,
): React.JSX.Element {
  const { label, value, hint, icon: Icon, accentClass, tintClass, iconBadgeClass } = props;
  const iconClass = cn("size-4", accentClass ?? "text-muted-foreground");
  const hintNode = hint ? (
    <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
  ) : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/70 to-card/20 p-3.5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/20",
        tintClass,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg bg-muted/40 ring-1 ring-inset ring-border/40",
            iconBadgeClass,
          )}
        >
          <Icon className={iconClass} />
        </span>
      </div>
      <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {hintNode}
    </div>
  );
}
