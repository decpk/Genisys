import { useMemo } from "react";

import type {
  AnalyticsRange,
  ApiAnalyticsPoint,
} from "../../../APIClient.types";
import type { RequestAnalyticsData } from "../RequestAnalyticsModal.types";
import { buildResponseTimeSeries } from "../utils/buildResponseTimeSeries";
import { buildStatusDistribution } from "../utils/buildStatusDistribution";
import { buildThroughputByDay } from "../utils/buildThroughputByDay";
import { computeSummaryStats } from "../utils/computeSummaryStats";
import { computeTimingBreakdown } from "../utils/computeTimingBreakdown";
import { getRangeDays } from "../utils/getRangeDays";

export function useRequestAnalyticsAggregates(
  points: ApiAnalyticsPoint[],
  range: AnalyticsRange,
): RequestAnalyticsData {
  return useMemo(() => {
    const days = getRangeDays(range);
    return {
      points,
      summary: computeSummaryStats(points),
      responseSeries: buildResponseTimeSeries(points),
      throughput: buildThroughputByDay(points, days),
      statusDistribution: buildStatusDistribution(points),
      timing: computeTimingBreakdown(points),
    };
  }, [points, range]);
}
