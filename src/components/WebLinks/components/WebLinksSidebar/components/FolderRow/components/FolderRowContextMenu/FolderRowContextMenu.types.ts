import type { FolderRowActions } from '../../FolderRow.types'

/** Props for the folder row right-click context menu wrapper. */
export interface FolderRowContextMenuProps {
  /** Folder-level action handlers + data, owned by the parent row's hook. */
  actions: FolderRowActions
  /** The folder row element that acts as the context-menu trigger. */
  children: React.ReactNode
}
