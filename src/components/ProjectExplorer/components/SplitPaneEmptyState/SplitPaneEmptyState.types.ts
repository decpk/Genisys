import type { ExplorerPaneConfig, RepoInfo } from '../../ProjectExplorer.types'

export interface SplitPaneEmptyStateProps {
  onSelect: (repo: RepoInfo) => void
  activePanes: ExplorerPaneConfig[]
}
