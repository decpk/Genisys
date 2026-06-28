import type { ClipboardItem } from '@/store/clipboard-store'
import type { SmartCollectionKey } from '../../smart-collections'
import type { TimelineItemAnalysis } from '../analysis'
import type { CategoryBreakdown } from './categoryBreakdown.types'

export function computeCategoryBreakdown(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>
): CategoryBreakdown {
  const categoryCounts = new Map<SmartCollectionKey, number>()
  let imageCount = 0

  for (const item of items) {
    if (item.contentType === 'image') {
      imageCount++
      continue
    }

    const analysis = analysisMap.get(item.id)
    if (!analysis) continue

    for (const cat of analysis.categories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }
  }

  const categories = [...categoryCounts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)

  return {
    categories,
    imageCount,
    total: items.length,
  }
}
