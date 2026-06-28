import type { AnalyticsRange } from "../../../APIClient.types";
import { ANALYTICS_RANGES } from "../RequestAnalyticsModal.constants";

export function getRangeDays(range: AnalyticsRange): number {
  return ANALYTICS_RANGES.find((option) => option.key === range)?.days ?? 7;
}
