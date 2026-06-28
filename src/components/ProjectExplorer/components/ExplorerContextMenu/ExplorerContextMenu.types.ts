import type { RepoItem } from '../../ProjectExplorer.types'
import type { NewItemVariant } from '../NewItemDialog'
import type { MoveCopyMode } from '../MoveCopyDialog'

export type ActiveDialog =
  | { type: 'delete' }
  | { type: 'rename' }
  | { type: 'newItem'; variant: NewItemVariant }
  | { type: 'moveCopy'; mode: MoveCopyMode }
  | { type: 'vscodeCli' }
  | { type: 'properties' }
  | null

export interface ExplorerContextMenuProps {
  item: RepoItem
  isLocal: boolean
  rootPath?: string
  onFileHistory?: (path: string) => void
  onChanged?: () => void
  children: React.ReactNode
}
