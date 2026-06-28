import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ThroughputTooltip } from "./components/ThroughputTooltip";
import { THROUGHPUT_CHART as CHART } from "./ThroughputChart.constants";
import type { ThroughputChartProps } from "./ThroughputChart.types";
import {
  ANALYTICS_PANEL_CLASS,
  ANALYTICS_TITLE_CLASS,
} from "../../RequestAnalyticsModal.constants";

export function ThroughputChart(
  props: ThroughputChartProps,
): React.JSX.Element {
  const { data } = props;

  return (
    <section className={ANALYTICS_PANEL_CLASS}>
      <h3 className={ANALYTICS_TITLE_CLASS}>Calls Per Day</h3>
      <ResponsiveContainer width="100%" height={CHART.height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={CHART.gridStroke}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: CHART.axisColor }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 9, fill: CHART.axisColor }}
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <RechartsTooltip
            cursor={{ fill: CHART.cursorFill }}
            content={<ThroughputTooltip />}
          />
          <Bar dataKey="success" stackId="calls" fill={CHART.successColor} />
          <Bar
            dataKey="error"
            stackId="calls"
            fill={CHART.errorColor}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
