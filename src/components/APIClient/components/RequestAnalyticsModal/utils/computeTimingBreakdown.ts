import type { ApiAnalyticsPoint } from '../../../APIClient.types'
import type { TimingBreakdown } from '../RequestAnalyticsModal.types'

function averageField(
  points: ApiAnalyticsPoint[],
  selector: (point: ApiAnalyticsPoint) => number | null,
): number {
  let sum = 0
  let count = 0

  for (const point of points) {
    const value = selector(point)
    if (value === null || value === undefined || Number.isNaN(value)) continue
    sum += value
    count += 1
  }

  if (count === 0) return 0
  return Math.round(sum / count)
}

export function computeTimingBreakdown(points: ApiAnalyticsPoint[]): TimingBreakdown {
  return {
    dnsMs: averageField(points, (point) => point.timingDnsMs),
    connectMs: averageField(points, (point) => point.timingConnectMs),
    tlsMs: averageField(points, (point) => point.timingTlsMs),
    ttfbMs: averageField(points, (point) => point.timingTtfbMs),
    downloadMs: averageField(points, (point) => point.timingDownloadMs),
  }
}
