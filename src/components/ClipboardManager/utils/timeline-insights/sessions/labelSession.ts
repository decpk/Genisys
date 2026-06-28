import type { SmartCollectionKey } from '../../smart-collections'
import type { TimelineItemAnalysis } from '../analysis'
import type { WorkSession } from './sessions.types'

const CATEGORY_LABELS: Record<SmartCollectionKey, string> = {
  url: 'Research',
  code: 'Coding',
  color: 'Design',
  email: 'Communication',
  json: 'Configuration',
  shell: 'Terminal Work',
  filepath: 'File Management',
  phone: 'Contacts',
}

const FALLBACK_LABEL = 'General Activity'

export function labelSession(
  session: WorkSession,
  analysisMap: Map<string, TimelineItemAnalysis>
): string {
  const categoryCounts = new Map<SmartCollectionKey, number>()

  for (const item of session.items) {
    const analysis = analysisMap.get(item.id)
    if (!analysis) continue

    for (const cat of analysis.categories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
    }
  }

  if (categoryCounts.size === 0) {
    const hasImages = session.items.some((i) => i.contentType === 'image')
    if (hasImages) return 'Media & Screenshots'
    return FALLBACK_LABEL
  }

  let dominantKey: SmartCollectionKey | null = null
  let maxCount = 0

  for (const [key, count] of categoryCounts) {
    if (count > maxCount) {
      maxCount = count
      dominantKey = key
    }
  }

  if (!dominantKey) return FALLBACK_LABEL

  return CATEGORY_LABELS[dominantKey]
}
