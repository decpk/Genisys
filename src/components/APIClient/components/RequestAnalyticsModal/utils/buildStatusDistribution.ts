import type { ApiAnalyticsPoint } from '../../../APIClient.types'
import type { StatusDistributionSlice } from '../RequestAnalyticsModal.types'

type StatusGroup = '2xx' | '3xx' | '4xx' | '5xx' | 'Failed'

const GROUP_ORDER: StatusGroup[] = ['2xx', '3xx', '4xx', '5xx', 'Failed']

const GROUP_COLORS: Record<StatusGroup, string> = {
  '2xx': '#34d399',
  '3xx': '#60a5fa',
  '4xx': '#fbbf24',
  '5xx': '#f87171',
  Failed: '#9ca3af',
}

function classify(point: ApiAnalyticsPoint): StatusGroup {
  if (point.statusCode === 0 || point.status === 'error') return 'Failed'
  if (point.statusCode >= 200 && point.statusCode < 300) return '2xx'
  if (point.statusCode >= 300 && point.statusCode < 400) return '3xx'
  if (point.statusCode >= 400 && point.statusCode < 500) return '4xx'
  if (point.statusCode >= 500 && point.statusCode < 600) return '5xx'
  return 'Failed'
}

export function buildStatusDistribution(points: ApiAnalyticsPoint[]): StatusDistributionSlice[] {
  const counts: Record<StatusGroup, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
    Failed: 0,
  }

  for (const point of points) {
    counts[classify(point)] += 1
  }

  return GROUP_ORDER.filter((group) => counts[group] > 0).map((group) => ({
    codeGroup: group,
    count: counts[group],
    colorVar: GROUP_COLORS[group],
  }))
}
