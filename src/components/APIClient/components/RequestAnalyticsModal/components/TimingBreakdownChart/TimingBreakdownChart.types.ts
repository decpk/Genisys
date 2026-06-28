import type { TimingBreakdown } from "../../RequestAnalyticsModal.types";

export interface TimingBreakdownChartProps {
  timing: TimingBreakdown;
}

export interface TimingPhase {
  key: keyof TimingBreakdown;
  label: string;
  color: string;
}
