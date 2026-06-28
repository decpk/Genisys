import { useMemo } from 'react'
import type { TimelineItemAnalysis } from '../utils/timeline-insights/analysis'
import type { WorkSession } from '../utils/timeline-insights/sessions'
import type { CategoryBreakdown } from '../utils/timeline-insights/category-breakdown'
import { computeCategoryBreakdown } from '../utils/timeline-insights/category-breakdown'

export function useTimelineCategoryData(
  sessions: WorkSession[],
  analysisMap: Map<string, TimelineItemAnalysis>
): Map<string, CategoryBreakdown> {
  const breakdownMap = useMemo(() => {
    const map = new Map<string, CategoryBreakdown>()

    for (const session of sessions) {
      map.set(session.id, computeCategoryBreakdown(session.items, analysisMap))
    }

    return map
  }, [sessions, analysisMap])

  return breakdownMap
}
