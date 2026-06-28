import { cn } from "@/lib/utils";

import { METHOD_BG_COLORS } from "../../../../APIClient.constants";
import { AnalyticsRangeSelector } from "../AnalyticsRangeSelector";
import type { AnalyticsModalHeaderProps } from "./AnalyticsModalHeader.types";

export function AnalyticsModalHeader(
  props: AnalyticsModalHeaderProps,
): React.JSX.Element {
  const { name, method, url, range, onRangeChange } = props;
  const methodClass = cn(
    "shrink-0 rounded-md border px-2 py-1 text-[11px] font-bold tracking-wide",
    METHOD_BG_COLORS[method],
  );

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 bg-gradient-to-r from-card/70 via-card/30 to-transparent px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className={methodClass}>{method}</span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {name}
          </span>
          <span className="truncate font-mono text-xs text-muted-foreground/80">
            {url}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 pr-8">
        <AnalyticsRangeSelector value={range} onChange={onRangeChange} />
      </div>
    </div>
  );
}
