import type { LucideIcon } from 'lucide-react'

import type { RepoItem } from '../../ProjectExplorer.types'

export type ViewMode = 'list' | 'grid' | 'detailed' | 'compact' | 'thumbnail'

export type SortField = 'name' | 'extension' | 'type' | 'path' | 'size' | 'modified'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface ViewModeComponentProps {
  items: RepoItem[]
  currentPath: string
  sort: SortConfig
  source?: 'local'
  rootPath?: string
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
  onFileHistory?: (path: string) => void
  onChanged?: () => void
  onSortChange?: (sort: SortConfig) => void
  /** Currently keyboard-active item path, or null. Drives the active-row highlight. */
  activePath?: string | null
  /** Setter for activePath, lifted into ExplorerPane. */
  onActivePathChange?: (path: string | null) => void
  /** Optional Backspace handler — navigate one folder up. */
  onGoUp?: () => void
}

export interface ViewModeConfig {
  mode: ViewMode
  label: string
  icon: LucideIcon
  description: string
}
