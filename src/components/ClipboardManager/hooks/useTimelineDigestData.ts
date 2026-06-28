import { useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { TimelineItemAnalysis } from '../utils/timeline-insights/analysis'
import type { WorkSession } from '../utils/timeline-insights/sessions'
import type { DailyDigest } from '../utils/timeline-insights/digest'
import { generateDailyDigest, formatDigestSummary } from '../utils/timeline-insights/digest'

interface TimelineDigestResult {
  digest: DailyDigest
  summary: string
}

export function useTimelineDigestData(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>,
  sessions: WorkSession[]
): TimelineDigestResult {
  const result = useMemo(() => {
    const digest = generateDailyDigest(items, analysisMap, sessions)
    const summary = formatDigestSummary(digest)
    return { digest, summary }
  }, [items, analysisMap, sessions])

  return result
}
