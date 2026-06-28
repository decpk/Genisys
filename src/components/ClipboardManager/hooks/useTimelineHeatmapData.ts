import { useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { HeatmapCell } from '../utils/timeline-insights/heatmap'
import { buildHeatmapData } from '../utils/timeline-insights/heatmap'

const HEATMAP_DAYS = 7

interface HeatmapResult {
  cells: HeatmapCell[]
  maxCount: number
}

export function useTimelineHeatmapData(items: ClipboardItem[]): HeatmapResult {
  const result = useMemo(() => {
    const cells = buildHeatmapData(items, HEATMAP_DAYS)
    let maxCount = 0
    for (const cell of cells) {
      if (cell.count > maxCount) maxCount = cell.count
    }
    return { cells, maxCount }
  }, [items])

  return result
}
