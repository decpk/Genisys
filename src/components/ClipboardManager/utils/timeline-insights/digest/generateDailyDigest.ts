import type { ClipboardItem } from '@/store/clipboard-store'
import type { SmartCollectionKey, SmartCollectionCount } from '../../smart-collections'
import { SMART_COLLECTION_ORDER } from '../../smart-collections'
import type { TimelineItemAnalysis } from '../analysis'
import type { WorkSession } from '../sessions'
import type { DailyDigest, DailyDigestLabel } from './digest.types'

export function generateDailyDigest(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>,
  sessions: WorkSession[]
): DailyDigest {
  if (items.length === 0) {
    return {
      totalItems: 0,
      textCount: 0,
      imageCount: 0,
      sessionCount: 0,
      peakHour: 0,
      peakHourCount: 0,
      categories: [],
      sensitiveCount: 0,
      totalBytes: 0,
      topLabels: [],
      pinnedCount: 0,
    }
  }

  let textCount = 0
  let imageCount = 0
  let sensitiveCount = 0
  let totalBytes = 0
  let pinnedCount = 0

  const categoryCounts = new Map<SmartCollectionKey, number>()
  const hourCounts = new Map<number, number>()
  const labelCounts = new Map<string, { name: string; color: string; count: number }>()

  for (const item of items) {
    if (item.contentType === 'text') textCount++
    else imageCount++

    totalBytes += item.byteSize
    if (item.isPinned) pinnedCount++

    const hour = new Date(item.createdAt).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)

    for (const label of item.labels) {
      const existing = labelCounts.get(label.id)
      if (existing) {
        existing.count++
      } else {
        labelCounts.set(label.id, { name: label.name, color: label.color, count: 1 })
      }
    }

    const analysis = analysisMap.get(item.id)
    if (analysis) {
      for (const cat of analysis.categories) {
        categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
      }
      if (analysis.sensitivity.level !== 'none') {
        sensitiveCount++
      }
    }
  }

  let peakHour = 0
  let peakHourCount = 0
  for (const [hour, count] of hourCounts) {
    if (count > peakHourCount) {
      peakHour = hour
      peakHourCount = count
    }
  }

  const categories: SmartCollectionCount[] = SMART_COLLECTION_ORDER
    .filter((key) => (categoryCounts.get(key) ?? 0) > 0)
    .map((key) => ({ key, count: categoryCounts.get(key)! }))

  const topLabels: DailyDigestLabel[] = [...labelCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalItems: items.length,
    textCount,
    imageCount,
    sessionCount: sessions.length,
    peakHour,
    peakHourCount,
    categories,
    sensitiveCount,
    totalBytes,
    topLabels,
    pinnedCount,
  }
}
