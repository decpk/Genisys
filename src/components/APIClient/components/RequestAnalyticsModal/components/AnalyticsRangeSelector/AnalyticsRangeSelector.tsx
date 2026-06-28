import { cn } from "@/lib/utils";

import { ANALYTICS_RANGES } from "../../RequestAnalyticsModal.constants";
import type { AnalyticsRangeSelectorProps } from "./AnalyticsRangeSelector.types";

export function AnalyticsRangeSelector(
  props: AnalyticsRangeSelectorProps,
): React.JSX.Element {
  const { value, onChange } = props;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-1">
      {ANALYTICS_RANGES.map((range) => {
        const active = range.key === value;
        const buttonClass = cn(
          "rounded-md px-3 py-1 text-xs font-semibold transition-all",
          active
            ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
            : "text-muted-foreground hover:text-foreground",
        );
        return (
          <button
            key={range.key}
            type="button"
            className={buttonClass}
            onClick={() => onChange(range.key)}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
