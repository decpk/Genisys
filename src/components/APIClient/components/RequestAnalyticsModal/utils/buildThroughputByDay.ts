import type { ApiAnalyticsPoint } from '../../../APIClient.types'
import type { ThroughputBucket } from '../RequestAnalyticsModal.types'

function isSuccess(point: ApiAnalyticsPoint): boolean {
  return point.statusCode >= 200 && point.statusCode < 400 && point.status !== 'error'
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildThroughputByDay(points: ApiAnalyticsPoint[], days: number): ThroughputBucket[] {
  const bucketCount = Math.max(0, Math.floor(days))
  const buckets: ThroughputBucket[] = []
  const indexByDate = new Map<string, number>()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = bucketCount - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000)
    const key = toDateKey(date)
    indexByDate.set(key, buckets.length)
    buckets.push({
      date: key,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total: 0,
      success: 0,
      error: 0,
    })
  }

  for (const point of points) {
    const executed = new Date(point.executedAt)
    if (Number.isNaN(executed.getTime())) continue

    const key = toDateKey(executed)
    const index = indexByDate.get(key)
    if (index === undefined) continue

    const bucket = buckets[index]
    bucket.total += 1
    if (isSuccess(point)) bucket.success += 1
    else bucket.error += 1
  }

  return buckets
}
