import type { ExplorerRepoEntry } from '../../../../../../../preload/index.d'
import type { RepoInfo } from '../../../ProjectExplorer.types'

export interface RepoHistoryItemProps {
  repo: ExplorerRepoEntry
  isActive: boolean
  paneNumbers?: number[]
  hasMultiplePanes: boolean
  onSelect: (repo: RepoInfo) => void
  onRemove: (repo: ExplorerRepoEntry) => void
}
