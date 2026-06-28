import type { ComponentType } from 'react'

import type { ChapterHighlight } from '../chapter-highlights'

export interface ChapterTocPanelData {
  highlights: ChapterHighlight[]
  activeHighlightId: string | null
}

export interface ChapterTocPanelActions {
  scrollToHighlight: (id: string) => void
}

export interface LangIconEntry {
  icon: ComponentType<{ size?: number; className?: string }>
  color: string
}

export interface TocHighlightIconProps {
  highlight: ChapterHighlight
  isActive: boolean
  size?: number
}

export interface TocItemProps {
  highlight: ChapterHighlight
  isActive: boolean
  showSeparator: boolean
  activeItemRef: ((node: HTMLButtonElement | null) => void) | undefined
  onNavigate: (id: string) => void
}

export interface TocItemClassification {
  isSection: boolean
  isTopSection: boolean
  isSubSection: boolean
  isContentItem: boolean
}
