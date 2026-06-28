import type { ApiAnalyticsPoint } from '../../../APIClient.types'
import type { ResponseTimePoint } from '../RequestAnalyticsModal.types'

export function buildResponseTimeSeries(points: ApiAnalyticsPoint[]): ResponseTimePoint[] {
  return [...points]
    .sort((a, b) => Date.parse(a.executedAt) - Date.parse(b.executedAt))
    .map((point) => ({
      t: Date.parse(point.executedAt),
      label: new Date(point.executedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationMs: point.durationMs,
      statusCode: point.statusCode,
    }))
}
