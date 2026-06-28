import type { ClipboardItem } from '@/store/clipboard-store'
import type { TimelineItemAnalysis } from './analysis.types'
import { analyzeTimelineItem } from './analyzeTimelineItem'

export function buildAnalysisMap(
  items: ClipboardItem[],
  existingMap?: Map<string, TimelineItemAnalysis>
): Map<string, TimelineItemAnalysis> {
  const map = new Map<string, TimelineItemAnalysis>(existingMap)

  for (const item of items) {
    if (map.has(item.id)) continue
    map.set(item.id, analyzeTimelineItem(item))
  }

  return map
}
