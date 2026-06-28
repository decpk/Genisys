import type { ApiAnalyticsPoint, AnalyticsRange } from "../../APIClient.types";

export interface AnalyticsRangeOption {
  key: AnalyticsRange;
  label: string;
  days: number;
}

export interface AnalyticsSummary {
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgSizeBytes: number;
  errorCount: number;
}

export interface ResponseTimePoint {
  t: number;
  label: string;
  durationMs: number;
  statusCode: number;
}

export interface ThroughputBucket {
  date: string;
  label: string;
  total: number;
  success: number;
  error: number;
}

export interface StatusDistributionSlice {
  codeGroup: string;
  count: number;
  colorVar: string;
}

export interface TimingBreakdown {
  dnsMs: number;
  connectMs: number;
  tlsMs: number;
  ttfbMs: number;
  downloadMs: number;
}

export interface RequestAnalyticsData {
  points: ApiAnalyticsPoint[];
  summary: AnalyticsSummary;
  responseSeries: ResponseTimePoint[];
  throughput: ThroughputBucket[];
  statusDistribution: StatusDistributionSlice[];
  timing: TimingBreakdown;
}

export interface RequestAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
}
