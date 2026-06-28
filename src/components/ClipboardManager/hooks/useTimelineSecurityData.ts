import { useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { TimelineItemAnalysis } from '../utils/timeline-insights/analysis'
import type { SecurityAlert } from '../utils/timeline-insights/security-pulse'
import { detectSecurityAlerts } from '../utils/timeline-insights/security-pulse'

export function useTimelineSecurityData(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>
): SecurityAlert[] {
  const alerts = useMemo(
    () => detectSecurityAlerts(items, analysisMap),
    [items, analysisMap]
  )

  return alerts
}
