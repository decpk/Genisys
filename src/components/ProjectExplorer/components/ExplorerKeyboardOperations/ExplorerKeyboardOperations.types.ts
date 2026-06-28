import type { RefObject } from 'react'

import type { RepoItem } from '../../ProjectExplorer.types'

export type ExplorerShortcutAction =
  | 'rename'
  | 'softDelete'
  | 'deletePermanent'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'duplicate'
  | 'newFile'
  | 'newFolder'
  | 'properties'
  | 'copyPath'

export interface ExplorerKeyboardOperationsProps {
  containerRef: RefObject<HTMLElement | null>
  item: RepoItem
  rootPath?: string
  source?: 'local'
  onChanged?: () => void
  onFileHistory?: (path: string) => void
}
