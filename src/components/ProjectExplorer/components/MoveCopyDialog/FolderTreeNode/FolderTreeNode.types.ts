import type { RepoItem } from '../../../../ProjectExplorer.types'

export interface FolderTreeNodeProps {
  item: RepoItem
  rootPath: string
  selectedPath: string | null
  disabledPath: string | null
  depth: number
  onSelect: (path: string) => void
}
