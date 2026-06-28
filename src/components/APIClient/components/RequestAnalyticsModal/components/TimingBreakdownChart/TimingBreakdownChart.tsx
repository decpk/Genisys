import { formatTime } from "../../../../utils/format-response";
import { TimingLegendItem } from "./components/TimingLegendItem";
import { TIMING_PHASES } from "./TimingBreakdownChart.constants";
import type { TimingBreakdownChartProps } from "./TimingBreakdownChart.types";
import {
  ANALYTICS_PANEL_CLASS,
  ANALYTICS_TITLE_CLASS,
} from "../../RequestAnalyticsModal.constants";

export function TimingBreakdownChart(
  props: TimingBreakdownChartProps,
): React.JSX.Element {
  const { timing } = props;
  const total = TIMING_PHASES.reduce(
    (acc, phase) => acc + timing[phase.key],
    0,
  );

  let body: React.ReactNode;
  if (total === 0) {
    body = <p className="text-xs text-muted-foreground">No timing data</p>;
  } else {
    body = (
      <>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-inset ring-border/30">
          {TIMING_PHASES.map((phase) => (
            <div
              key={phase.key}
              className="h-full"
              style={{
                width: `${(timing[phase.key] / total) * 100}%`,
                backgroundColor: phase.color,
              }}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {TIMING_PHASES.map((phase) => (
            <TimingLegendItem
              key={phase.key}
              color={phase.color}
              label={phase.label}
              value={formatTime(timing[phase.key])}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <section className={ANALYTICS_PANEL_CLASS}>
      <h3 className={ANALYTICS_TITLE_CLASS}>Avg Timing Breakdown</h3>
      {body}
    </section>
  );
}
