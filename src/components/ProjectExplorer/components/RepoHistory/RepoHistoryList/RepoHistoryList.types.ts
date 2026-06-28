import type { ExplorerRepoEntry } from '../../../../../../../preload/index.d'
import type { RepoInfo } from '../../../ProjectExplorer.types'

export interface RepoHistoryListProps {
  isLoaded: boolean
  filtered: ExplorerRepoEntry[]
  totalCount: number
  activeRepoMap: Map<string, number[]>
  hasMultiplePanes: boolean
  onSelect: (repo: RepoInfo) => void
  onRemove: (repo: ExplorerRepoEntry) => void
}
