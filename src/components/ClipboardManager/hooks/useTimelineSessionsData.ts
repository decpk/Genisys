import { useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { TimelineItemAnalysis } from '../utils/timeline-insights/analysis'
import type { WorkSession } from '../utils/timeline-insights/sessions'
import { detectSessions, labelSession, getSessionIcon } from '../utils/timeline-insights/sessions'

export function useTimelineSessionsData(
  items: ClipboardItem[],
  analysisMap: Map<string, TimelineItemAnalysis>
): WorkSession[] {
  const sessions = useMemo(() => {
    const raw = detectSessions(items)

    return raw.map((session) => {
      const label = labelSession(session, analysisMap)
      const dominantCategory = getDominantCategory(session, analysisMap)
      const icon = getSessionIcon(dominantCategory)

      return { ...session, label, icon, dominantCategory }
    })
  }, [items, analysisMap])

  return sessions
}

function getDominantCategory(
  session: WorkSession,
  analysisMap: Map<string, TimelineItemAnalysis>
): WorkSession['dominantCategory'] {
  const categoryCounts = new Map<string, number>()

  for (const item of session.items) {
    const analysis = analysisMap.get(item.id)
    if (!analysis) continue
    for (const cat of analysis.categories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }
  }

  let dominant: WorkSession['dominantCategory'] = null
  let maxCount = 0

  for (const [key, count] of categoryCounts) {
    if (count > maxCount) {
      maxCount = count
      dominant = key as WorkSession['dominantCategory']
    }
  }

  return dominant
}
