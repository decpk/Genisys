import { useRef, useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { TimelineItemAnalysis } from '../utils/timeline-insights/analysis'
import { buildAnalysisMap } from '../utils/timeline-insights/analysis'

export function useTimelineAnalysisMap(items: ClipboardItem[]): Map<string, TimelineItemAnalysis> {
  const cacheRef = useRef(new Map<string, TimelineItemAnalysis>())

  const analysisMap = useMemo(() => {
    const updated = buildAnalysisMap(items, cacheRef.current)
    cacheRef.current = updated
    return updated
  }, [items])

  return analysisMap
}
