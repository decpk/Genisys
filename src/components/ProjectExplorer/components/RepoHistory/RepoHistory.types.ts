import type { ExplorerPaneConfig, RepoInfo } from '../../ProjectExplorer.types'

export interface RepoHistoryProps {
  onSelect: (repo: RepoInfo) => void
  activePanes: ExplorerPaneConfig[]
}
