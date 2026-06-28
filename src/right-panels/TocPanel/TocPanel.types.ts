import type { ComponentType } from 'react'

export interface TocItem {
  id: string
  label: string
  level: 'primary' | 'secondary' | 'tertiary'
  icon?: ComponentType<{ size?: number; className?: string }>
  iconColor?: string
  badge?: string
  /** When true, the item is rendered with a small bookmark indicator. */
  isBookmarked?: boolean
}

export interface TocPanelData {
  items: TocItem[]
  activeItemId: string | null
}

export interface TocPanelActions {
  onNavigate: (id: string) => void
}

export interface TocItemClassification {
  isPrimary: boolean
  isSecondary: boolean
  isTertiary: boolean
}
