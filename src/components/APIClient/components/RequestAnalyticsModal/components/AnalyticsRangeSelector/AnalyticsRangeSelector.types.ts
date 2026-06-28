import type { AnalyticsRange } from "../../../../APIClient.types";

export interface AnalyticsRangeSelectorProps {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}
