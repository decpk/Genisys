import type { AnalyticsRange, HttpMethod } from "../../../../APIClient.types";

export interface AnalyticsModalHeaderProps {
  name: string;
  method: HttpMethod;
  url: string;
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}
