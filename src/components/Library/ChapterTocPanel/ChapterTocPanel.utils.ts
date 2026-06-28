import type { ChapterHighlight } from '../chapter-highlights'

import { DEFAULT_LANG_ICON, LANG_ICON_MAP } from './ChapterTocPanel.constants'
import type { LangIconEntry, TocItemClassification } from './ChapterTocPanel.types'

export function getLangIcon(lang?: string): LangIconEntry {
  if (!lang) return DEFAULT_LANG_ICON
  return LANG_ICON_MAP[lang] ?? DEFAULT_LANG_ICON
}

export function classifyHighlight(h: ChapterHighlight): TocItemClassification {
  const isSection = h.type === 'section'
  const isTopSection = isSection && (!h.depth || h.depth === 2)
  const isSubSection = isSection && h.depth !== undefined && h.depth >= 3
  const isContentItem = !isSection

  return { isSection, isTopSection, isSubSection, isContentItem }
}
