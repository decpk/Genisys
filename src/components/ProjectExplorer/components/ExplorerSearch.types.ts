import type { RepoItem } from '../ProjectExplorer.types'

export type ItemTypeFilter = 'All' | 'Files only' | 'Folders only'
export type GitObjectTypeFilter = 'All' | 'blob' | 'tree'

export interface ExplorerSearchProps {
  items: RepoItem[]
  onFilteredItemsChange: (filtered: RepoItem[]) => void
  isGitRepo?: boolean
  gitPanelOpen?: boolean
  onToggleGitPanel?: () => void
  onClearFiltersReady?: (clearFilters: () => void) => void
}

export interface ExplorerSearchFiltersProps {
  itemType: ItemTypeFilter
  gitObjectType: GitObjectTypeFilter
  extensions: string
  onItemTypeChange: (value: ItemTypeFilter) => void
  onGitObjectTypeChange: (value: GitObjectTypeFilter) => void
  onExtensionsChange: (value: string) => void
}
