import { StatusDistributionLegendItem } from "./components/StatusDistributionLegendItem";
import type { StatusDistributionChartProps } from "./StatusDistributionChart.types";
import {
  ANALYTICS_PANEL_CLASS,
  ANALYTICS_TITLE_CLASS,
} from "../../RequestAnalyticsModal.constants";

export function StatusDistributionChart(
  props: StatusDistributionChartProps,
): React.JSX.Element {
  const { data } = props;
  const total = data.reduce((acc, slice) => acc + slice.count, 0);
  const safeTotal = total === 0 ? 1 : total;

  return (
    <section className={ANALYTICS_PANEL_CLASS}>
      <h3 className={ANALYTICS_TITLE_CLASS}>Status Codes</h3>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-inset ring-border/30">
        {data.map((slice) => (
          <div
            key={slice.codeGroup}
            className="h-full"
            style={{
              width: `${(slice.count / safeTotal) * 100}%`,
              backgroundColor: slice.colorVar,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {data.map((slice) => (
          <StatusDistributionLegendItem
            key={slice.codeGroup}
            slice={slice}
            total={safeTotal}
          />
        ))}
      </div>
    </section>
  );
}
