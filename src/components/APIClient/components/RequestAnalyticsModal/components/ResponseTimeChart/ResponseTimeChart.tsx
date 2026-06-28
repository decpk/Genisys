import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ResponseTimeTooltip } from "./components/ResponseTimeTooltip";
import { RESPONSE_TIME_CHART as CHART } from "./ResponseTimeChart.constants";
import type { ResponseTimeChartProps } from "./ResponseTimeChart.types";
import {
  ANALYTICS_PANEL_CLASS,
  ANALYTICS_TITLE_CLASS,
} from "../../RequestAnalyticsModal.constants";

export function ResponseTimeChart(
  props: ResponseTimeChartProps,
): React.JSX.Element {
  const { data } = props;

  return (
    <section className={ANALYTICS_PANEL_CLASS}>
      <h3 className={ANALYTICS_TITLE_CLASS}>Response Time</h3>
      <ResponsiveContainer width="100%" height={CHART.height}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="respTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART.lineColor}
                stopOpacity={0.35}
              />
              <stop offset="95%" stopColor={CHART.lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 9, fill: CHART.axisColor }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => `${value}ms`}
          />
          <RechartsTooltip
            cursor={{ stroke: CHART.gridStroke, strokeDasharray: "3 3" }}
            content={<ResponseTimeTooltip />}
          />
          <Area
            type="monotone"
            dataKey="durationMs"
            stroke={CHART.lineColor}
            strokeWidth={2}
            fill="url(#respTimeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
