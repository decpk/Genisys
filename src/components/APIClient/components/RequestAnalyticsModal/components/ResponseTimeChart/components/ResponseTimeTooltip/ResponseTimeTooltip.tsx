import { formatTime } from "../../../../../../utils/format-response";
import type { ResponseTimePoint } from "../../../../RequestAnalyticsModal.types";
import type { ResponseTimeTooltipProps } from "./ResponseTimeTooltip.types";

export function ResponseTimeTooltip(
  props: ResponseTimeTooltipProps,
): React.JSX.Element | null {
  const { active, payload } = props;

  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload as ResponseTimePoint;

  return (
    <div className="rounded-md border border-border/40 bg-popover px-2.5 py-1.5 text-popover-foreground shadow-md">
      <div className="text-[11px] text-muted-foreground">{point.label}</div>
      <div className="text-xs font-semibold">
        {formatTime(point.durationMs)}
      </div>
      <div className="text-[11px] text-muted-foreground">
        Status {point.statusCode}
      </div>
    </div>
  );
}
