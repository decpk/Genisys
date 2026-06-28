import type { ApiAnalyticsPoint } from '../../../APIClient.types'
import type { AnalyticsSummary } from '../RequestAnalyticsModal.types'
import { percentile } from './percentile'

function isSuccess(point: ApiAnalyticsPoint): boolean {
  return point.statusCode >= 200 && point.statusCode < 400 && point.status !== 'error'
}

export function computeSummaryStats(points: ApiAnalyticsPoint[]): AnalyticsSummary {
  const totalCalls = points.length

  if (totalCalls === 0) {
    return {
      totalCalls: 0,
      successRate: 0,
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      avgSizeBytes: 0,
      errorCount: 0,
    }
  }

  const successCount = points.reduce((acc, point) => acc + (isSuccess(point) ? 1 : 0), 0)
  const errorCount = totalCalls - successCount
  const successRate = successCount / totalCalls

  const durations = points.map((point) => point.durationMs)
  const totalDuration = durations.reduce((acc, value) => acc + value, 0)
  const totalSize = points.reduce((acc, point) => acc + point.sizeBytes, 0)

  return {
    totalCalls,
    successRate,
    avgLatencyMs: Math.round(totalDuration / totalCalls),
    p50LatencyMs: Math.round(percentile(durations, 50)),
    p95LatencyMs: Math.round(percentile(durations, 95)),
    p99LatencyMs: Math.round(percentile(durations, 99)),
    avgSizeBytes: Math.round(totalSize / totalCalls),
    errorCount,
  }
}
