import type { ThroughputBucket } from "../../../../RequestAnalyticsModal.types";
import type { ThroughputTooltipProps } from "./ThroughputTooltip.types";

export function ThroughputTooltip(
  props: ThroughputTooltipProps,
): React.JSX.Element | null {
  const { active, payload } = props;

  if (!active || !payload || payload.length === 0) return null;

  const bucket = payload[0].payload as ThroughputBucket;

  return (
    <div className="rounded-md border border-border/40 bg-popover px-2.5 py-1.5 text-popover-foreground shadow-md">
      <div className="text-[11px] text-muted-foreground">{bucket.label}</div>
      <div className="text-xs">
        <span className="font-semibold text-emerald-400">{bucket.success}</span>{" "}
        success
      </div>
      <div className="text-xs">
        <span className="font-semibold text-red-400">{bucket.error}</span> error
      </div>
    </div>
  );
}
