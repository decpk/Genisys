import type { ClipboardItem } from '@/store/clipboard-store'
import { detectCategories } from '../../smart-collections'
import { analyzeSensitivity } from '../../sensitive-data'
import type { TimelineItemAnalysis } from './analysis.types'

const EMPTY_ANALYSIS: TimelineItemAnalysis = {
  categories: [],
  sensitivity: { level: 'none', matches: [] },
}

export function analyzeTimelineItem(item: ClipboardItem): TimelineItemAnalysis {
  const text = item.textContent
  if (!text || text.trim().length === 0) return EMPTY_ANALYSIS

  const categories = detectCategories(text)
  const sensitivity = analyzeSensitivity(text)

  return { categories, sensitivity }
}
